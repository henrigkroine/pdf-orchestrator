/**
 * Alert Dispatcher
 *
 * Sends alerts via Slack, Email, and PagerDuty
 * Based on alert rules and escalation policies
 */

const https = require('https');
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Load alert rules
let alertRules = null;
let notificationChannels = null;

async function loadAlertConfig() {
  if (!alertRules) {
    const configPath = path.join(__dirname, '../config/alerting/alert-rules.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    alertRules = config.alertRules;
    notificationChannels = config.notificationChannels;
  }
  return { alertRules, notificationChannels };
}

/**
 * Send Slack notification
 */
async function sendSlackAlert(alert) {
  const config = notificationChannels.slack;
  const webhookUrl = process.env.SLACK_WEBHOOK_URL || config.webhook_url;

  if (!webhookUrl || webhookUrl.includes('${')) {
    console.warn('[ALERT] Slack webhook URL not configured');
    return { success: false, error: 'Webhook URL not configured' };
  }

  const color = {
    critical: '#FF0000',
    high: '#FFA500',
    medium: '#FFFF00',
    low: '#00FF00'
  }[alert.severity] || '#808080';

  const payload = {
    channel: config.channel,
    username: config.username,
    icon_emoji: config.icon_emoji,
    attachments: [
      {
        color,
        title: `[${alert.priority}] ${alert.name}`,
        text: alert.description,
        fields: [
          {
            title: 'Severity',
            value: alert.severity.toUpperCase(),
            short: true
          },
          {
            title: 'Condition',
            value: `${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}`,
            short: true
          },
          {
            title: 'Current Value',
            value: alert.currentValue?.toString() || 'N/A',
            short: true
          },
          {
            title: 'Duration',
            value: alert.condition.duration,
            short: true
          },
          {
            title: 'Action Required',
            value: alert.action,
            short: false
          },
          {
            title: 'Runbook',
            value: alert.runbook,
            short: false
          }
        ],
        footer: 'PDF Orchestrator Alerting',
        ts: Math.floor(Date.now() / 1000)
      }
    ]
  };

  return new Promise((resolve) => {
    const url = new URL(webhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('[ALERT] Slack notification sent successfully');
          resolve({ success: true });
        } else {
          console.error('[ALERT] Slack notification failed:', res.statusCode, data);
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[ALERT] Slack request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Send Email notification
 */
async function sendEmailAlert(alert) {
  const config = notificationChannels.email;

  // Check if using Resend API (preferred for TEEI)
  if (process.env.RESEND_API_KEY) {
    return await sendEmailViaResend(alert, config);
  }

  console.warn('[ALERT] Email notifications require RESEND_API_KEY environment variable');
  return { success: false, error: 'Email not configured' };
}

/**
 * Send email via Resend API
 */
async function sendEmailViaResend(alert, config) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = config.from || 'alerts@teei.org';
  const to = config.to || ['tech-lead@teei.org'];

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .alert-box {
      background: ${alert.severity === 'critical' ? '#ffebee' : alert.severity === 'high' ? '#fff3e0' : '#fffde7'};
      border-left: 4px solid ${alert.severity === 'critical' ? '#f44336' : alert.severity === 'high' ? '#ff9800' : '#ffc107'};
      padding: 20px;
      margin: 20px 0;
    }
    .alert-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .alert-priority {
      display: inline-block;
      background: ${alert.severity === 'critical' ? '#f44336' : alert.severity === 'high' ? '#ff9800' : '#ffc107'};
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-weight: bold;
    }
    .alert-field { margin: 10px 0; }
    .alert-field strong { display: inline-block; width: 150px; }
    .action-box {
      background: #e3f2fd;
      border-left: 4px solid #2196f3;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="alert-box">
    <div class="alert-title">
      <span class="alert-priority">${alert.priority}</span>
      ${alert.name}
    </div>
    <p><strong>Description:</strong> ${alert.description}</p>

    <div class="alert-field">
      <strong>Severity:</strong> ${alert.severity.toUpperCase()}
    </div>

    <div class="alert-field">
      <strong>Condition:</strong> ${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}
    </div>

    <div class="alert-field">
      <strong>Current Value:</strong> ${alert.currentValue?.toString() || 'N/A'}
    </div>

    <div class="alert-field">
      <strong>Duration:</strong> ${alert.condition.duration}
    </div>
  </div>

  <div class="action-box">
    <strong>Action Required:</strong>
    <p>${alert.action}</p>
    <p><a href="${alert.runbook}">View Runbook</a></p>
  </div>

  <p style="color: #666; font-size: 12px;">
    Alert triggered at ${new Date().toISOString()}<br>
    PDF Orchestrator Monitoring System
  </p>
</body>
</html>
  `;

  const payload = {
    from,
    to,
    subject: `[${alert.priority}] ${alert.name}`,
    html: htmlBody
  };

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.resend.com',
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('[ALERT] Email sent successfully via Resend');
          resolve({ success: true });
        } else {
          console.error('[ALERT] Email failed:', res.statusCode, data);
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[ALERT] Email request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Send PagerDuty alert
 */
async function sendPagerDutyAlert(alert) {
  const config = notificationChannels.pagerduty;
  const integrationKey = process.env.PAGERDUTY_INTEGRATION_KEY || config.integration_key;

  if (!integrationKey || integrationKey.includes('${')) {
    console.warn('[ALERT] PagerDuty integration key not configured');
    return { success: false, error: 'Integration key not configured' };
  }

  const payload = {
    routing_key: integrationKey,
    event_action: 'trigger',
    dedup_key: `pdf-orchestrator-${alert.name.toLowerCase().replace(/\s+/g, '-')}`,
    payload: {
      summary: `[${alert.priority}] ${alert.name}`,
      severity: config.severity || 'critical',
      source: 'pdf-orchestrator',
      custom_details: {
        description: alert.description,
        condition: `${alert.condition.metric} ${alert.condition.operator} ${alert.condition.threshold}`,
        current_value: alert.currentValue?.toString() || 'N/A',
        duration: alert.condition.duration,
        action: alert.action,
        runbook: alert.runbook
      }
    }
  };

  return new Promise((resolve) => {
    const options = {
      hostname: 'events.pagerduty.com',
      path: '/v2/enqueue',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 202) {
          console.log('[ALERT] PagerDuty alert sent successfully');
          resolve({ success: true });
        } else {
          console.error('[ALERT] PagerDuty alert failed:', res.statusCode, data);
          resolve({ success: false, error: data });
        }
      });
    });

    req.on('error', (error) => {
      console.error('[ALERT] PagerDuty request error:', error.message);
      resolve({ success: false, error: error.message });
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

/**
 * Dispatch alert to configured channels
 */
async function dispatchAlert(alert) {
  await loadAlertConfig();

  const results = {
    timestamp: new Date().toISOString(),
    alert: alert.name,
    priority: alert.priority,
    dispatched: []
  };

  console.log(`[ALERT] Dispatching ${alert.priority} alert: ${alert.name}`);

  for (const route of alert.routes) {
    let result;

    switch (route) {
      case 'slack':
        result = await sendSlackAlert(alert);
        break;
      case 'email':
      case 'email_digest':
        result = await sendEmailAlert(alert);
        break;
      case 'pagerduty':
        result = await sendPagerDutyAlert(alert);
        break;
      default:
        console.warn(`[ALERT] Unknown route: ${route}`);
        result = { success: false, error: 'Unknown route' };
    }

    results.dispatched.push({
      channel: route,
      success: result.success,
      error: result.error || null
    });
  }

  return results;
}

/**
 * Check if alert condition is met
 */
function checkAlertCondition(alertRule, currentValue) {
  const { operator, threshold } = alertRule.condition;

  switch (operator) {
    case '<':
      return currentValue < threshold;
    case '<=':
      return currentValue <= threshold;
    case '>':
      return currentValue > threshold;
    case '>=':
      return currentValue >= threshold;
    case '==':
      return currentValue === threshold;
    case '!=':
      return currentValue !== threshold;
    default:
      console.warn(`[ALERT] Unknown operator: ${operator}`);
      return false;
  }
}

/**
 * Test alert dispatcher
 */
async function testAlertDispatcher() {
  const testAlert = {
    priority: 'P2',
    name: 'Test Alert',
    description: 'This is a test alert from PDF Orchestrator',
    severity: 'high',
    condition: {
      metric: 'test.metric',
      operator: '>',
      threshold: 100,
      duration: '5m'
    },
    currentValue: 150,
    action: 'This is a test. No action required.',
    runbook: 'https://docs.internal/runbooks/test',
    routes: ['slack', 'email']
  };

  console.log('[ALERT] Testing alert dispatcher...');
  const result = await dispatchAlert(testAlert);
  console.log('[ALERT] Test result:', JSON.stringify(result, null, 2));
}

// If run directly, execute test
if (require.main === module) {
  testAlertDispatcher().catch(console.error);
}

module.exports = {
  dispatchAlert,
  checkAlertCondition,
  sendSlackAlert,
  sendEmailAlert,
  sendPagerDutyAlert
};
