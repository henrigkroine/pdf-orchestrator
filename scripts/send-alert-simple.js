/**
 * Simple Alert System for PDF Orchestrator
 *
 * Logs alerts to console and file (no email needed for development)
 * Production can enable Resend email once domain is verified
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

/**
 * Log alert to console
 */
function logAlertToConsole(alert) {
  const color = {
    critical: '\x1b[41m\x1b[37m', // Red background, white text
    high: '\x1b[43m\x1b[30m',     // Yellow background, black text
    medium: '\x1b[44m\x1b[37m',   // Blue background, white text
    low: '\x1b[42m\x1b[30m'       // Green background, black text
  }[alert.severity] || '\x1b[40m\x1b[37m'; // Default: black background, white text

  const reset = '\x1b[0m';

  console.log('');
  console.log('═'.repeat(80));
  console.log(`${color} [${alert.priority}] ${alert.name} ${reset}`);
  console.log('═'.repeat(80));
  console.log(`Severity: ${alert.severity.toUpperCase()}`);
  console.log(`Description: ${alert.description}`);
  console.log(`Condition: ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}`);
  if (alert.currentValue !== undefined) {
    console.log(`Current Value: ${alert.currentValue}`);
  }
  console.log(`Duration: ${alert.condition.duration}`);
  console.log('');
  console.log(`Action Required:`);
  console.log(`  ${alert.action}`);
  console.log('');
  if (alert.runbook) {
    console.log(`Runbook: ${alert.runbook}`);
  }
  if (alert.context) {
    console.log('Context:', JSON.stringify(alert.context, null, 2));
  }
  console.log(`Timestamp: ${alert.timestamp || new Date().toISOString()}`);
  console.log('═'.repeat(80));
  console.log('');
}

/**
 * Log alert to file
 */
async function logAlertToFile(alert) {
  const logsDir = path.join(__dirname, '../logs/alerts');

  // Ensure directory exists
  try {
    await fs.mkdir(logsDir, { recursive: true });
  } catch (error) {
    // Directory already exists
  }

  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${today}.jsonl`);

  const logEntry = JSON.stringify({
    ...alert,
    timestamp: alert.timestamp || new Date().toISOString()
  }) + '\n';

  await fs.appendFile(logFile, logEntry);
  console.log(`[ALERT] Logged to file: ${logFile}`);
}

/**
 * Send alert (console + file, no email for now)
 */
async function sendAlert(alert) {
  const enableConsole = process.env.ENABLE_CONSOLE_ALERTS !== 'false';
  const enableFile = process.env.ENABLE_FILE_ALERTS !== 'false';

  if (enableConsole) {
    logAlertToConsole(alert);
  }

  if (enableFile) {
    try {
      await logAlertToFile(alert);
    } catch (error) {
      console.error('[ALERT] Failed to write to log file:', error);
    }
  }

  return {
    success: true,
    methods: {
      console: enableConsole,
      file: enableFile
    },
    alert
  };
}

/**
 * Load alert rules from config
 */
async function loadAlertRules() {
  const configPath = path.join(__dirname, '../config/alerting/alert-rules.json');
  const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
  return config.alertRules;
}

/**
 * Check if alerts should be triggered based on metrics
 */
async function checkAlertConditions(metrics) {
  const rules = await loadAlertRules();
  const triggeredAlerts = [];

  for (const rule of rules) {
    const metricValue = getMetricValue(metrics, rule.condition.metric);

    if (metricValue === null || metricValue === undefined) {
      continue;
    }

    let conditionMet = false;

    switch (rule.condition.operator) {
      case '<':
        conditionMet = metricValue < rule.condition.threshold;
        break;
      case '<=':
        conditionMet = metricValue <= rule.condition.threshold;
        break;
      case '>':
        conditionMet = metricValue > rule.condition.threshold;
        break;
      case '>=':
        conditionMet = metricValue >= rule.condition.threshold;
        break;
      case '==':
        conditionMet = metricValue == rule.condition.threshold;
        break;
      case '!=':
        conditionMet = metricValue != rule.condition.threshold;
        break;
    }

    if (conditionMet) {
      triggeredAlerts.push({
        ...rule,
        currentValue: metricValue,
        timestamp: new Date().toISOString()
      });
    }
  }

  return triggeredAlerts;
}

/**
 * Get metric value from nested object
 */
function getMetricValue(metrics, metricPath) {
  const parts = metricPath.split('.');
  let value = metrics;

  for (const part of parts) {
    if (value === null || value === undefined) return null;
    value = value[part];
  }

  return value;
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: node send-alert-simple.js [test|check]');
    console.log('');
    console.log('Commands:');
    console.log('  test   - Send a test alert');
    console.log('  check  - Check current metrics and send alerts if needed');
    process.exit(0);
  }

  const command = args[0];

  if (command === 'test') {
    // Send test alert
    const testAlert = {
      priority: 'P3',
      name: 'Test Alert - System Operational',
      description: 'This is a test alert from the PDF Orchestrator monitoring system',
      condition: {
        metric: 'test.metric',
        operator: '>',
        threshold: 100,
        duration: '1m'
      },
      severity: 'medium',
      action: 'This is a test alert. No action required. Alert system is working correctly.',
      runbook: 'https://docs.internal/runbooks/test-alert',
      currentValue: 150,
      context: {
        test: true,
        environment: process.env.ALERT_ENV || 'Development',
        alertMethods: {
          console: process.env.ENABLE_CONSOLE_ALERTS !== 'false',
          file: process.env.ENABLE_FILE_ALERTS !== 'false',
          email: process.env.ENABLE_RESEND_ALERTS === 'true'
        }
      }
    };

    sendAlert(testAlert)
      .then(result => {
        console.log('[ALERT] Test complete: SUCCESS');
        console.log('Alert methods enabled:', result.methods);
        process.exit(0);
      })
      .catch(error => {
        console.error('[ALERT] Test failed:', error);
        process.exit(1);
      });

  } else if (command === 'check') {
    // Check metrics and send alerts
    console.log('[ALERT] Checking alert conditions...');

    // Example metrics (replace with actual metrics from telemetry)
    const currentMetrics = {
      orchestrator: {
        success_rate: 85,  // Below 98% (triggers P2)
        cost: {
          daily: 22.5,     // Approaching $25 cap
          monthly: 245
        },
        latency: {
          p95: 52000       // Above 45s threshold (triggers P2)
        }
      }
    };

    checkAlertConditions(currentMetrics)
      .then(async alerts => {
        console.log(`[ALERT] Found ${alerts.length} triggered alert(s)`);

        if (alerts.length === 0) {
          console.log('[ALERT] All systems nominal ✓');
          process.exit(0);
        }

        for (const alert of alerts) {
          await sendAlert(alert);
        }

        console.log(`[ALERT] Sent ${alerts.length} alert(s)`);
        process.exit(0);
      })
      .catch(error => {
        console.error('[ALERT] Check failed:', error);
        process.exit(1);
      });

  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
  }
}

module.exports = {
  sendAlert,
  checkAlertConditions,
  loadAlertRules
};
