/**
 * Telemetry Collection Module
 *
 * Collects operation logs, metrics, and errors in JSON Lines format
 * per OPS_POLICY.md specification
 */

const fs = require('fs').promises;
const path = require('path');

// Log directories
const LOG_DIRS = {
  operations: path.join(__dirname, '../logs/operations'),
  errors: path.join(__dirname, '../logs/errors'),
  metrics: path.join(__dirname, '../logs/metrics'),
  security: path.join(__dirname, '../logs/security')
};

/**
 * Ensure all log directories exist
 */
async function ensureLogDirectories() {
  for (const dir of Object.values(LOG_DIRS)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Get current date string for log file naming
 */
function getDateString() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Append JSON line to log file
 */
async function appendLog(logType, data) {
  const logFile = path.join(LOG_DIRS[logType], `${getDateString()}.jsonl`);
  const logLine = JSON.stringify(data) + '\n';

  try {
    await fs.appendFile(logFile, logLine, 'utf8');
  } catch (error) {
    console.error(`Failed to write to ${logFile}:`, error.message);
    // Don't throw - we don't want telemetry failures to break operations
  }
}

/**
 * Validate operation log schema
 */
function validateOperationLog(data) {
  const required = ['timestamp', 'service', 'operation', 'run_id', 'status'];
  const missing = required.filter(field => !(field in data));

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  if (!['success', 'failure', 'timeout'].includes(data.status)) {
    throw new Error(`Invalid status: ${data.status}`);
  }

  return true;
}

/**
 * Record an operation with full telemetry
 *
 * @param {string} operation - Operation name (e.g., 'generate_document')
 * @param {object} metadata - Operation metadata
 * @param {string} metadata.run_id - Unique run identifier
 * @param {string} metadata.doc_slug - Document slug
 * @param {string} metadata.user - User email
 * @param {number} metadata.latency_ms - Operation latency in milliseconds
 * @param {string} metadata.status - 'success' | 'failure' | 'timeout'
 * @param {number} metadata.cost_usd - Cost in USD
 * @param {array} metadata.api_calls - Array of API call details
 * @param {object} metadata.assets - Asset generation details
 * @param {object} metadata.validation - Validation results
 */
async function recordOperation(operation, metadata) {
  await ensureLogDirectories();

  const logEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    service: 'pdf-orchestrator',
    operation,
    run_id: metadata.run_id,
    doc_slug: metadata.doc_slug || null,
    user: metadata.user || null,
    latency_ms: metadata.latency_ms || null,
    status: metadata.status,
    cost_usd: metadata.cost_usd || 0,
    api_calls: metadata.api_calls || [],
    assets: metadata.assets || {},
    validation: metadata.validation || {}
  };

  // Validate schema
  validateOperationLog(logEntry);

  // Write to operations log
  await appendLog('operations', logEntry);

  // Also log to console for immediate feedback
  console.log(`[TELEMETRY] ${operation} - ${logEntry.status} - ${logEntry.latency_ms}ms - $${logEntry.cost_usd}`);

  return logEntry;
}

/**
 * Record a custom metric
 *
 * @param {string} name - Metric name (e.g., 'orchestrator.latency.p95')
 * @param {number} value - Metric value
 * @param {object} tags - Optional tags for grouping
 */
async function recordMetric(name, value, tags = {}) {
  await ensureLogDirectories();

  const metricEntry = {
    timestamp: new Date().toISOString(),
    metric: name,
    value,
    tags
  };

  await appendLog('metrics', metricEntry);

  return metricEntry;
}

/**
 * Record an error with full context
 *
 * @param {Error} error - Error object
 * @param {object} context - Error context
 * @param {string} context.operation - Operation that failed
 * @param {string} context.run_id - Run identifier
 * @param {string} context.doc_slug - Document slug
 * @param {string} context.user - User email
 * @param {string} context.service - Service that failed
 * @param {object} context.fallback_used - Fallback info (if applicable)
 */
async function recordError(error, context) {
  await ensureLogDirectories();

  const errorEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    service: 'pdf-orchestrator',
    operation: context.operation || 'unknown',
    run_id: context.run_id || null,
    error: {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message,
      stack: error.stack,
      http_status: error.statusCode || error.status || null
    },
    context: {
      doc_slug: context.doc_slug || null,
      user: context.user || null,
      service: context.service || null,
      fallback_used: context.fallback_used || null
    }
  };

  // Write to errors log
  await appendLog('errors', errorEntry);

  // Also log to console
  console.error(`[ERROR] ${errorEntry.operation}:`, errorEntry.error.message);

  return errorEntry;
}

/**
 * Record a security audit event
 *
 * @param {string} event - Event type (e.g., 'auth_failure', 'quota_exceeded')
 * @param {object} details - Event details
 */
async function recordSecurityEvent(event, details) {
  await ensureLogDirectories();

  const securityEntry = {
    timestamp: new Date().toISOString(),
    level: 'audit',
    service: 'pdf-orchestrator',
    event,
    details,
    user: details.user || null,
    ip: details.ip || null
  };

  await appendLog('security', securityEntry);

  return securityEntry;
}

/**
 * Read operation logs for a given date range
 *
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {array} Array of log entries
 */
async function readOperationLogs(startDate, endDate) {
  const logs = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toISOString().split('T')[0];
    const logFile = path.join(LOG_DIRS.operations, `${dateStr}.jsonl`);

    try {
      const content = await fs.readFile(logFile, 'utf8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (line.trim()) {
          logs.push(JSON.parse(line));
        }
      }
    } catch (error) {
      // File doesn't exist - skip
      if (error.code !== 'ENOENT') {
        console.warn(`Failed to read ${logFile}:`, error.message);
      }
    }
  }

  return logs;
}

/**
 * Calculate daily spend from logs
 *
 * @param {string} date - Date (YYYY-MM-DD)
 * @returns {number} Total spend in USD
 */
async function getDailySpend(date) {
  const logs = await readOperationLogs(date, date);
  return logs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
}

/**
 * Calculate monthly spend from logs
 *
 * @param {string} yearMonth - Year-month (YYYY-MM)
 * @returns {number} Total spend in USD
 */
async function getMonthlySpend(yearMonth) {
  const [year, month] = yearMonth.split('-');
  const startDate = `${year}-${month}-01`;

  // Get last day of month
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

  const logs = await readOperationLogs(startDate, endDate);
  return logs.reduce((sum, log) => sum + (log.cost_usd || 0), 0);
}

/**
 * Initialize telemetry system
 */
async function initialize() {
  await ensureLogDirectories();
  console.log('[TELEMETRY] Telemetry system initialized');
  console.log('[TELEMETRY] Log directories:', LOG_DIRS);
}

module.exports = {
  initialize,
  recordOperation,
  recordMetric,
  recordError,
  recordSecurityEvent,
  readOperationLogs,
  getDailySpend,
  getMonthlySpend,
  LOG_DIRS
};
