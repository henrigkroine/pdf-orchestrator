/**
 * Cost Tracker - Budget Control and Cost Monitoring
 *
 * Implements:
 * - Pre-flight budget checks
 * - Post-operation cost logging
 * - Daily/monthly spend tracking
 * - Alert system for threshold violations
 * - Hard stop enforcement
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { CostExceededError } = require('./errors');

// Load configuration
const costConfig = require('../config/cost-limits.json');

class CostTracker {
  constructor(dbPath = null) {
    this.dbPath = dbPath || path.join(__dirname, '..', 'database', 'orchestrator.db');
    this.config = costConfig;
    this.db = null;

    // Initialize database
    this.initDatabase();
  }

  /**
   * Initialize SQLite database
   */
  initDatabase() {
    const dbDir = path.dirname(this.dbPath);

    // Create database directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Open database connection
    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('[CostTracker] Failed to open database:', err.message);
        throw err;
      }
      console.log(`[CostTracker] Connected to database: ${this.dbPath}`);
    });

    // Load schema if tables don't exist
    this.loadSchema();
  }

  /**
   * Load database schema
   */
  loadSchema() {
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');

    if (!fs.existsSync(schemaPath)) {
      console.warn('[CostTracker] Schema file not found:', schemaPath);
      return;
    }

    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute schema (split by semicolon for multiple statements)
    this.db.exec(schema, (err) => {
      if (err) {
        console.error('[CostTracker] Failed to load schema:', err.message);
        throw err;
      }
      console.log('[CostTracker] Database schema loaded successfully');
    });
  }

  /**
   * Pre-flight budget check
   * @param {string} service - Service name (e.g., 'openai_images', 'adobe_pdf_services')
   * @param {string} operation - Operation name (e.g., 'dall-e-3-hd', 'document_generation')
   * @param {number} estimatedCost - Estimated cost in USD
   * @returns {Promise<object>} - { approved: boolean, remaining: { daily, monthly } }
   */
  async checkBudget(service, operation, estimatedCost) {
    console.log(`[CostTracker] Checking budget for ${service}.${operation}: $${estimatedCost.toFixed(2)}`);

    const daily = await this.getDailySpend();
    const monthly = await this.getMonthlySpend();

    const { dailyCap, monthlyCap } = this.config.budget;
    const { dailyAlertThreshold, monthlyAlertThreshold } = this.config.alerts;

    // Hard stop if daily cap exceeded
    if (daily + estimatedCost > dailyCap) {
      const error = new CostExceededError('Daily budget cap exceeded', {
        current: daily,
        limit: dailyCap,
        attempted: estimatedCost,
        type: 'daily'
      });

      await this.sendAlert('daily_cap_exceeded', {
        current: daily,
        limit: dailyCap,
        attempted: estimatedCost,
        service,
        operation
      });

      throw error;
    }

    // Hard stop if monthly cap exceeded
    if (monthly + estimatedCost > monthlyCap) {
      const error = new CostExceededError('Monthly budget cap exceeded', {
        current: monthly,
        limit: monthlyCap,
        attempted: estimatedCost,
        type: 'monthly'
      });

      await this.sendAlert('monthly_cap_exceeded', {
        current: monthly,
        limit: monthlyCap,
        attempted: estimatedCost,
        service,
        operation
      });

      throw error;
    }

    // Alert if approaching daily threshold (75%)
    if (daily + estimatedCost > dailyAlertThreshold) {
      await this.sendAlert('daily_threshold', {
        current: daily,
        threshold: dailyAlertThreshold,
        attempted: estimatedCost,
        service,
        operation
      });
    }

    // Alert if approaching monthly threshold (75%)
    if (monthly + estimatedCost > monthlyAlertThreshold) {
      await this.sendAlert('monthly_threshold', {
        current: monthly,
        threshold: monthlyAlertThreshold,
        attempted: estimatedCost,
        service,
        operation
      });
    }

    console.log(`[CostTracker] Budget check passed. Daily: $${daily.toFixed(2)}/$${dailyCap}, Monthly: $${monthly.toFixed(2)}/$${monthlyCap}`);

    return {
      approved: true,
      remaining: {
        daily: dailyCap - daily,
        monthly: monthlyCap - monthly
      }
    };
  }

  /**
   * Record actual cost after operation
   * @param {string} service - Service name
   * @param {string} operation - Operation name
   * @param {number} actualCost - Actual cost in USD
   * @param {object} metadata - Additional metadata (docSlug, runId, user)
   * @returns {Promise<void>}
   */
  async recordCost(service, operation, actualCost, metadata = {}) {
    const timestamp = new Date().toISOString();
    const { docSlug, runId, user } = metadata;

    console.log(`[CostTracker] Recording cost: ${service}.${operation} = $${actualCost.toFixed(2)}`);

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO cost_log (timestamp, service, operation, cost_usd, doc_slug, run_id, user, metadata)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [timestamp, service, operation, actualCost, docSlug, runId, user, JSON.stringify(metadata)],
        (err) => {
          if (err) {
            console.error('[CostTracker] Failed to record cost:', err.message);
            reject(err);
          } else {
            // Update aggregated totals
            this.updateDailyTotal(actualCost).catch(console.error);
            this.updateMonthlyTotal(actualCost).catch(console.error);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Get daily spend
   * @returns {Promise<number>} - Total spend today in USD
   */
  async getDailySpend() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT SUM(cost_usd) as total FROM cost_log WHERE date(timestamp) = date('now')`,
        (err, row) => {
          if (err) {
            console.error('[CostTracker] Failed to get daily spend:', err.message);
            reject(err);
          } else {
            resolve(row?.total || 0);
          }
        }
      );
    });
  }

  /**
   * Get monthly spend
   * @returns {Promise<number>} - Total spend this month in USD
   */
  async getMonthlySpend() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT SUM(cost_usd) as total FROM cost_log WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', 'now')`,
        (err, row) => {
          if (err) {
            console.error('[CostTracker] Failed to get monthly spend:', err.message);
            reject(err);
          } else {
            resolve(row?.total || 0);
          }
        }
      );
    });
  }

  /**
   * Update daily total in aggregation table
   * @param {number} cost - Cost to add
   * @returns {Promise<void>}
   */
  async updateDailyTotal(cost) {
    const date = new Date().toISOString().split('T')[0];

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO daily_spend (date, total_cost_usd, document_count, api_call_count)
         VALUES (?, ?, 0, 1)
         ON CONFLICT(date) DO UPDATE SET
           total_cost_usd = total_cost_usd + ?,
           api_call_count = api_call_count + 1,
           last_updated = datetime('now')`,
        [date, cost, cost],
        (err) => {
          if (err) {
            console.error('[CostTracker] Failed to update daily total:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Update monthly total in aggregation table
   * @param {number} cost - Cost to add
   * @returns {Promise<void>}
   */
  async updateMonthlyTotal(cost) {
    const yearMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO monthly_spend (year_month, total_cost_usd, document_count, api_call_count)
         VALUES (?, ?, 0, 1)
         ON CONFLICT(year_month) DO UPDATE SET
           total_cost_usd = total_cost_usd + ?,
           api_call_count = api_call_count + 1,
           last_updated = datetime('now')`,
        [yearMonth, cost, cost],
        (err) => {
          if (err) {
            console.error('[CostTracker] Failed to update monthly total:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Send alert to configured destinations
   * @param {string} type - Alert type (daily_cap_exceeded, monthly_cap_exceeded, daily_threshold, monthly_threshold)
   * @param {object} data - Alert data
   * @returns {Promise<void>}
   */
  async sendAlert(type, data) {
    const message = this.formatAlertMessage(type, data);

    console.warn(`[CostTracker] ALERT [${type}]:`, message);

    // Log alert to database
    await this.logAlert(type, message, data);

    // Send to configured destinations
    const { alertDestinations } = this.config;

    // Console (always enabled)
    if (alertDestinations.console?.enabled !== false) {
      console.warn(`\n${'='.repeat(80)}\n[COST ALERT] ${message}\n${'='.repeat(80)}\n`);
    }

    // Slack (if configured)
    if (alertDestinations.slack?.enabled && alertDestinations.slack?.webhookUrl) {
      await this.sendSlackAlert(message, data).catch(err =>
        console.error('[CostTracker] Failed to send Slack alert:', err.message)
      );
    }

    // Email (if configured)
    if (alertDestinations.email?.enabled && alertDestinations.email?.recipients?.length > 0) {
      await this.sendEmailAlert(message, data).catch(err =>
        console.error('[CostTracker] Failed to send email alert:', err.message)
      );
    }
  }

  /**
   * Format alert message
   * @param {string} type - Alert type
   * @param {object} data - Alert data
   * @returns {string} - Formatted message
   */
  formatAlertMessage(type, data) {
    switch (type) {
      case 'daily_cap_exceeded':
        return `Daily budget cap EXCEEDED! Current: $${data.current.toFixed(2)}, Limit: $${data.limit.toFixed(2)}, Attempted: $${data.attempted.toFixed(2)} (${data.service}.${data.operation})`;

      case 'monthly_cap_exceeded':
        return `Monthly budget cap EXCEEDED! Current: $${data.current.toFixed(2)}, Limit: $${data.limit.toFixed(2)}, Attempted: $${data.attempted.toFixed(2)} (${data.service}.${data.operation})`;

      case 'daily_threshold':
        return `Daily budget threshold WARNING! Current: $${data.current.toFixed(2)}, Threshold: $${data.threshold.toFixed(2)} (${((data.current / this.config.budget.dailyCap) * 100).toFixed(0)}% of cap)`;

      case 'monthly_threshold':
        return `Monthly budget threshold WARNING! Current: $${data.current.toFixed(2)}, Threshold: $${data.threshold.toFixed(2)} (${((data.current / this.config.budget.monthlyCap) * 100).toFixed(0)}% of cap)`;

      default:
        return `Unknown alert type: ${type}`;
    }
  }

  /**
   * Log alert to database
   * @param {string} type - Alert type
   * @param {string} message - Alert message
   * @param {object} metadata - Additional data
   * @returns {Promise<void>}
   */
  async logAlert(type, message, metadata) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO alert_history (alert_type, message, metadata) VALUES (?, ?, ?)`,
        [type, message, JSON.stringify(metadata)],
        (err) => {
          if (err) {
            console.error('[CostTracker] Failed to log alert:', err.message);
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  /**
   * Send Slack alert (stub - implement with actual webhook)
   * @param {string} message - Alert message
   * @param {object} data - Alert data
   * @returns {Promise<void>}
   */
  async sendSlackAlert(message, data) {
    // TODO: Implement actual Slack webhook integration
    console.log('[CostTracker] Slack alert (stub):', message);
  }

  /**
   * Send email alert (stub - implement with actual SMTP)
   * @param {string} message - Alert message
   * @param {object} data - Alert data
   * @returns {Promise<void>}
   */
  async sendEmailAlert(message, data) {
    // TODO: Implement actual email sending via SMTP or service
    console.log('[CostTracker] Email alert (stub):', message);
  }

  /**
   * Get estimated cost for service operation
   * @param {string} service - Service name
   * @param {string} operation - Operation name
   * @returns {number} - Estimated cost in USD
   */
  getEstimatedCost(service, operation) {
    const serviceConfig = this.config.services[service];

    if (!serviceConfig) {
      console.warn(`[CostTracker] Unknown service: ${service}, assuming $0.10`);
      return 0.10;
    }

    const cost = serviceConfig[operation];

    if (cost === undefined) {
      console.warn(`[CostTracker] Unknown operation: ${service}.${operation}, assuming $0.10`);
      return 0.10;
    }

    return cost;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('[CostTracker] Error closing database:', err.message);
        } else {
          console.log('[CostTracker] Database connection closed');
        }
      });
    }
  }
}

module.exports = CostTracker;
