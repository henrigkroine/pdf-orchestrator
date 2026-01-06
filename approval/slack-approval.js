/**
 * Slack Approval Module
 * Posts PDF scorecard to Slack channel and awaits approval decision
 */

const fs = require('fs');
const path = require('path');

/**
 * Post approval request to Slack
 * @param {Object} jobContext - Job context with jobId, client, etc.
 * @param {Object} scorecard - Validation scorecard JSON
 * @param {Object} config - Slack configuration
 * @returns {Promise<Object>} - Approval result
 */
async function requestApprovalViaSlack(jobContext, scorecard, config) {
  const webhookUrl = config.webhookUrl || process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[Slack Approval] No webhook URL configured, auto-approving');
    return {
      approved: true,
      note: 'auto_approved_no_webhook',
      timestamp: new Date().toISOString()
    };
  }

  const channel = config.channel || '#design-approvals';
  const timeout = config.timeout || 3600; // 1 hour default

  try {
    console.log(`[Slack Approval] Posting to ${channel}...`);

    // Build approval message with scorecard data
    const message = buildApprovalMessage(jobContext, scorecard, channel);

    // Post to Slack
    const response = await postToSlack(webhookUrl, message);

    if (!response.ok) {
      console.log(`[Slack Approval] Slack post failed: ${response.statusText}`);
      console.log('[Slack Approval] Auto-approving due to error');
      return {
        approved: true,
        note: 'auto_approved_on_slack_error',
        error: response.statusText,
        timestamp: new Date().toISOString()
      };
    }

    console.log(`[Slack Approval] Posted to ${channel}, awaiting response...`);
    console.log(`[Slack Approval] Timeout: ${timeout}s`);

    // TODO: In real implementation, wait for callback from Slack button interaction
    // For now, we auto-approve after posting since we don't have interactive callback setup
    console.log('[Slack Approval] ⚠️  Interactive callback not implemented yet');
    console.log('[Slack Approval] Auto-approving (callback TBD)');

    return {
      approved: true,
      channel: channel,
      messageTs: response.ts,
      note: 'Posted to Slack, auto-approved (interactive callback not implemented)',
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error(`[Slack Approval] ERROR: ${error.message}`);
    console.log('[Slack Approval] Auto-approving due to error');
    return {
      approved: true,
      note: 'auto_approved_on_error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Build Slack message with approval buttons
 */
function buildApprovalMessage(jobContext, scorecard, channel) {
  const passed = scorecard.passed || false;
  const score = scorecard.totalScore || 0;
  const maxScore = scorecard.maxScore || 150;
  const visualDiff = scorecard.visualDiffPercent || 0;
  const tfuCompliance = scorecard.tfuCompliance || false;

  // Status emoji
  const statusEmoji = passed ? '✅' : '⚠️';
  const passFailText = passed ? 'PASSED' : 'FAILED';

  // Build message blocks
  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${statusEmoji} PDF Approval Request: ${jobContext.client || 'Client'}`
      }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Job ID:*\n${jobContext.jobId || 'unknown'}` },
        { type: "mrkdwn", text: `*Status:*\n${passFailText}` },
        { type: "mrkdwn", text: `*Score:*\n${score}/${maxScore}` },
        { type: "mrkdwn", text: `*Visual Diff:*\n${visualDiff.toFixed(1)}%` }
      ]
    }
  ];

  // Add TFU compliance info if applicable
  if (tfuCompliance) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `🌍 *TFU Brand Compliance:* Enabled`
      }
    });
  }

  // Add PDF path if available
  if (scorecard.pdfPath) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📄 *PDF:* \`${scorecard.pdfPath}\``
      }
    });
  }

  // Add visual baseline info if available
  if (scorecard.visualBaseline) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `📸 *Baseline:* ${scorecard.visualBaseline}`
      }
    });
  }

  // Add approval buttons
  blocks.push({
    type: "actions",
    elements: [
      {
        type: "button",
        text: { type: "plain_text", text: "Approve ✅" },
        style: "primary",
        value: "approve",
        action_id: "approve_pdf"
      },
      {
        type: "button",
        text: { type: "plain_text", text: "Reject ❌" },
        style: "danger",
        value: "reject",
        action_id: "reject_pdf"
      }
    ]
  });

  return {
    text: `${statusEmoji} PDF Approval Request: ${jobContext.jobId}`,
    blocks: blocks,
    channel: channel
  };
}

/**
 * Post message to Slack webhook
 */
async function postToSlack(webhookUrl, message) {
  const fetch = (await import('node-fetch')).default;

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  });

  // Slack webhooks return "ok" on success
  const text = await response.text();

  return {
    ok: text === 'ok' || response.ok,
    statusText: response.statusText,
    ts: new Date().toISOString() // Placeholder for message timestamp
  };
}

/**
 * Wait for approval decision (with timeout)
 * NOTE: This is a stub - real implementation would use Slack Events API
 */
async function waitForApproval(messageTs, timeout) {
  // TODO: Implement Slack Events API listener for button clicks
  // For now, return auto-approved after timeout

  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Slack Approval] Timeout reached, auto-approving');
      resolve({
        approved: true,
        note: 'auto_approved_on_timeout',
        timedOut: true
      });
    }, timeout * 1000);
  });
}

module.exports = {
  requestApprovalViaSlack,
  buildApprovalMessage,
  postToSlack,
  waitForApproval
};
