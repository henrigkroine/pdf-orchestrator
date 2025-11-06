/**
 * Alert Dispatcher for PDF Orchestrator
 *
 * Sends alerts via Resend Email only (no Slack/PagerDuty)
 * Uses credentials from T:\Secrets\teei\resend.env
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../config/.env') });

/**
 * Send email alert via Resend API
 */
async function sendEmailAlert(alert) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ALERT_FROM || 'alerts@yourpersonalai.net';
  const to = process.env.ALERT_TO || 'henrik@yourpersonalai.net';
  const env = process.env.ALERT_ENV || 'Production';

  if (!apiKey) {
    console.error('[ALERT] RESEND_API_KEY not configured in .env');
    return { success: false, error: 'API key not configured' };
  }

  // Build email subject
  const subject = `[${alert.priority}] [${env}] ${alert.name}`;

  // Build email HTML body
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .alert-box {
      border-left: 4px solid ${getSeverityColor(alert.severity)};
      padding: 20px;
      margin: 20px 0;
      background: #f9f9f9;
    }
    .alert-header { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .alert-meta { color: #666; font-size: 14px; margin-bottom: 20px; }
    .alert-field { margin: 10px 0; }
    .alert-field strong { color: #00393F; }
    .alert-action {
      background: #FFF1E2;
      border: 1px solid #BA8F5A;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="alert-box">
    <div class="alert-header">[${alert.priority}] ${alert.name}</div>
    <div class="alert-meta">${alert.description}</div>

    <div class="alert-field">
      <strong>Severity:</strong> ${alert.severity.toUpperCase()}
    </div>

    <div class="alert-field">
      <strong>Condition:</strong> ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}
    </div>

    ${alert.currentValue ? `
    <div class="alert-field">
      <strong>Current Value:</strong> ${alert.currentValue}
    </div>
    ` : ''}

    <div class="alert-field">
      <strong>Duration:</strong> ${alert.condition.duration}
    </div>

    ${alert.context ? `
    <div class="alert-field">
      <strong>Context:</strong>
      <pre>${JSON.stringify(alert.context, null, 2)}</pre>
    </div>
    ` : ''}

    <div class="alert-action">
      <strong>Action Required:</strong><br>
      ${alert.action}
    </div>

    ${alert.runbook ? `
    <div class="alert-field">
      <strong>Runbook:</strong> <a href="${alert.runbook}">${alert.runbook}</a>
    </div>
    ` : ''}
  </div>

  <div class="footer">
    <p>PDF Orchestrator Alert System</p>
    <p>Timestamp: ${alert.timestamp || new Date().toISOString()}</p>
    <p>Environment: ${env}</p>
  </div>
</body>
</html>
  `;

  // Build plain text version
  const text = `
[${alert.priority}] ${alert.name}

${alert.description}

Severity: ${alert.severity.toUpperCase()}
Condition: ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}
${alert.currentValue ? `Current Value: ${alert.currentValue}\n` : ''}Duration: ${alert.condition.duration}

Action Required:
${alert.action}

${alert.runbook ? `Runbook: ${alert.runbook}\n` : ''}
${alert.context ? `\nContext:\n${JSON.stringify(alert.context, null, 2)}\n` : ''}
---
PDF Orchestrator Alert System
Timestamp: ${alert.timestamp || new Date().toISOString()}
Environment: ${env}
  `.trim();

  // Send via Resend API
  const payload = JSON.stringify({
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log(`[ALERT] Email sent successfully to ${to}`);
          resolve({ success: true, response: JSON.parse(data) });
        } else {
          console.error(`[ALERT] Email failed with status ${res.statusCode}: ${data}`);
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error(`[ALERT] Email request error:`, error);
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}

/**
 * Get color for severity level
 */
function getSeverityColor(severity) {
  const colors = {
    critical: '#FF0000',
    high: '#FFA500',
    medium: '#FFFF00',
    low: '#00FF00'
  };
  return colors[severity] || '#808080';
}

/**
 * Send alert to all configured routes
 */
async function sendAlert(alert) {
  console.log(`[ALERT] Sending ${alert.priority} alert: ${alert.name}`);

  const results = {
    email: null
  };

  // Send email (always enabled)
  if (process.env.ENABLE_RESEND_ALERTS !== 'false') {
    try {
      results.email = await sendEmailAlert(alert);
    } catch (error) {
      console.error('[ALERT] Email failed:', error);
      results.email = { success: false, error: error.message };
    }
  }

  // Log results
  const successCount = Object.values(results).filter(r => r?.success).length;
  const totalCount = Object.values(results).filter(r => r !== null).length;

  console.log(`[ALERT] Sent to ${successCount}/${totalCount} channels`);

  return {
    success: successCount > 0,
    results,
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
 * Check if an alert should be triggered
 */
async function checkAlertConditions(metrics) {
  const rules = await loadAlertRules();
  const triggeredAlerts = [];

  for (const rule of rules) {
    const metricValue = getMetricValue(metrics, rule.condition.metric);

    if (metricValue === null || metricValue === undefined) {
      continue; // Metric not available
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
 * Get metric value from metrics object
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
    console.log('Usage: node send-alert-resend.js [test|check]');
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
      name: 'Test Alert',
      description: 'This is a test alert from the PDF Orchestrator monitoring system',
      condition: {
        metric: 'test.metric',
        operator: '>',
        threshold: 100,
        duration: '1m'
      },
      severity: 'medium',
      action: 'This is a test alert. No action required. If you receive this, the alert system is working correctly.',
      runbook: 'https://docs.internal/runbooks/test-alert',
      currentValue: 150,
      context: {
        test: true,
        environment: process.env.ALERT_ENV || 'Production',
        timestamp: new Date().toISOString()
      }
    };

    sendAlert(testAlert)
      .then(result => {
        console.log('\n[ALERT] Test complete:', result.success ? 'SUCCESS' : 'FAILED');
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        console.error('[ALERT] Test failed:', error);
        process.exit(1);
      });

  } else if (command === 'check') {
    // Check metrics and send alerts if needed
    console.log('[ALERT] Checking alert conditions...');

    // Load current metrics (you would implement this based on your metrics storage)
    const currentMetrics = {
      orchestrator: {
        success_rate: 85,  // Below 98% threshold (P2 alert)
        cost: {
          daily: 18.5,
          monthly: 245
        },
        latency: {
          p95: 52000  // Above 45s threshold (P2 alert)
        }
      }
    };

    checkAlertConditions(currentMetrics)
      .then(async alerts => {
        console.log(`[ALERT] Found ${alerts.length} triggered alerts`);

        for (const alert of alerts) {
          await sendAlert(alert);
        }

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
  sendEmailAlert,
  checkAlertConditions,
  loadAlertRules
};
