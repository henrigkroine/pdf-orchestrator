#!/usr/bin/env node
/**
 * Approval Manager
 * Coordinates different approval modes: none, auto, slack, manual
 */

const fs = require('fs');
const path = require('path');
const { requestApprovalViaSlack } = require('./slack-approval.js');

/**
 * Main approval workflow
 * @param {Object} options - Approval options
 *   - mode: "none" | "auto" | "slack" | "manual"
 *   - scorecardPath: Path to scorecard JSON
 *   - jobConfigPath: Path to job config JSON
 *   - timeout: Timeout in seconds
 * @returns {Promise<Object>} - Approval result
 */
async function runApprovalWorkflow(options) {
  const mode = options.mode || 'none';
  const startTime = Date.now();

  console.log(`[Approval Manager] Mode: ${mode}`);

  // Load scorecard
  const scorecard = loadScorecard(options.scorecardPath);
  if (!scorecard) {
    console.error('[Approval Manager] ERROR: Could not load scorecard');
    return {
      approved: false,
      error: 'scorecard_not_found',
      timestamp: new Date().toISOString()
    };
  }

  // Load job config
  const jobContext = loadJobContext(options.jobConfigPath);

  // Execute approval based on mode
  let result;

  switch (mode) {
    case 'none':
      result = await approveNone(scorecard, jobContext);
      break;

    case 'auto':
      result = await approveAuto(scorecard, jobContext);
      break;

    case 'slack':
      result = await approveSlack(scorecard, jobContext, options);
      break;

    case 'manual':
      result = await approveManual(scorecard, jobContext, options);
      break;

    default:
      console.error(`[Approval Manager] Unknown mode: ${mode}`);
      result = {
        approved: false,
        error: 'unknown_mode',
        mode: mode
      };
  }

  // Add metadata
  const duration = (Date.now() - startTime) / 1000;
  result.mode = mode;
  result.duration_seconds = duration;
  result.scorecard = {
    jobId: scorecard.jobId,
    score: scorecard.totalScore,
    passed: scorecard.passed
  };

  // Log result
  logApprovalDecision(result, options);

  console.log(`[Approval Manager] Decision: ${result.approved ? 'APPROVED' : 'REJECTED'} (${duration.toFixed(1)}s)`);
  if (result.note) {
    console.log(`[Approval Manager] Note: ${result.note}`);
  }

  return result;
}

/**
 * Mode: none - Skip approval entirely
 */
async function approveNone(scorecard, jobContext) {
  console.log('[Approval Manager] Approval not required, skipping');
  return {
    approved: true,
    note: 'approval_not_required',
    timestamp: new Date().toISOString()
  };
}

/**
 * Mode: auto - Approve if validation passed
 */
async function approveAuto(scorecard, jobContext) {
  const passed = scorecard.passed || false;
  const score = scorecard.totalScore || 0;
  const threshold = scorecard.threshold || 80;

  console.log(`[Approval Manager] Auto-approval: score=${score}, threshold=${threshold}`);

  if (passed) {
    console.log('[Approval Manager] ✅ Auto-approved (validation passed)');
    return {
      approved: true,
      note: 'auto_approved_validation_passed',
      score: score,
      threshold: threshold,
      timestamp: new Date().toISOString()
    };
  } else {
    console.log('[Approval Manager] ❌ Auto-rejected (validation failed)');
    return {
      approved: false,
      note: 'auto_rejected_validation_failed',
      score: score,
      threshold: threshold,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Mode: slack - Request approval via Slack
 */
async function approveSlack(scorecard, jobContext, options) {
  const slackConfig = {
    webhookUrl: options.webhookUrl || process.env.SLACK_WEBHOOK_URL,
    channel: options.channel || '#design-approvals',
    timeout: options.timeout || 3600
  };

  console.log(`[Approval Manager] Requesting approval via Slack (channel: ${slackConfig.channel})`);

  try {
    const result = await requestApprovalViaSlack(jobContext, scorecard, slackConfig);
    return result;
  } catch (error) {
    console.error(`[Approval Manager] Slack approval error: ${error.message}`);
    console.log('[Approval Manager] Auto-approving due to error');
    return {
      approved: true,
      note: 'auto_approved_on_slack_error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Mode: manual - Prompt for manual approval
 */
async function approveManual(scorecard, jobContext, options) {
  console.log('[Approval Manager] Manual approval required');
  console.log('='.repeat(60));
  console.log(`Job ID: ${scorecard.jobId}`);
  console.log(`Score: ${scorecard.totalScore}/${scorecard.maxScore}`);
  console.log(`Status: ${scorecard.passed ? 'PASSED ✅' : 'FAILED ❌'}`);
  console.log(`PDF: ${scorecard.pdfPath || 'N/A'}`);
  console.log('='.repeat(60));
  console.log('Approve this PDF? (y/n)');

  // In non-interactive environments, auto-approve
  if (!process.stdin.isTTY) {
    console.log('[Approval Manager] Non-interactive environment, auto-approving');
    return {
      approved: true,
      note: 'auto_approved_non_interactive',
      timestamp: new Date().toISOString()
    };
  }

  // Wait for user input
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Approve? (y/n): ', (answer) => {
      rl.close();

      const approved = answer.toLowerCase().startsWith('y');
      console.log(`[Approval Manager] ${approved ? 'APPROVED' : 'REJECTED'} by user`);

      resolve({
        approved: approved,
        note: approved ? 'approved_by_user' : 'rejected_by_user',
        timestamp: new Date().toISOString()
      });
    });

    // Timeout after configured duration
    const timeout = options.timeout || 3600;
    setTimeout(() => {
      rl.close();
      console.log('[Approval Manager] Timeout reached, auto-approving');
      resolve({
        approved: true,
        note: 'auto_approved_on_timeout',
        timedOut: true,
        timestamp: new Date().toISOString()
      });
    }, timeout * 1000);
  });
}

/**
 * Load scorecard JSON
 */
function loadScorecard(scorecardPath) {
  if (!scorecardPath || !fs.existsSync(scorecardPath)) {
    console.error(`[Approval Manager] Scorecard not found: ${scorecardPath}`);
    return null;
  }

  try {
    const data = fs.readFileSync(scorecardPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`[Approval Manager] Error loading scorecard: ${error.message}`);
    return null;
  }
}

/**
 * Load job context from config
 */
function loadJobContext(jobConfigPath) {
  if (!jobConfigPath || !fs.existsSync(jobConfigPath)) {
    console.log('[Approval Manager] No job config provided, using defaults');
    return {
      jobId: 'unknown',
      client: 'Client',
      jobType: 'unknown'
    };
  }

  try {
    const data = fs.readFileSync(jobConfigPath, 'utf8');
    const job = JSON.parse(data);
    return {
      jobId: job.jobId || job.name || 'unknown',
      client: job.client || 'Client',
      jobType: job.jobType || 'unknown',
      style: job.style || 'default'
    };
  } catch (error) {
    console.error(`[Approval Manager] Error loading job config: ${error.message}`);
    return {
      jobId: 'unknown',
      client: 'Client',
      jobType: 'unknown'
    };
  }
}

/**
 * Log approval decision to file
 */
function logApprovalDecision(result, options) {
  const logsDir = path.join(process.cwd(), 'reports', 'approvals');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jobId = result.scorecard?.jobId || 'unknown';
  const logPath = path.join(logsDir, `approval-${jobId}-${timestamp}.json`);

  try {
    fs.writeFileSync(logPath, JSON.stringify(result, null, 2));
    console.log(`[Approval Manager] Decision logged: ${logPath}`);
  } catch (error) {
    console.error(`[Approval Manager] Failed to log decision: ${error.message}`);
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  // Parse arguments
  const options = {
    mode: 'auto',
    scorecardPath: null,
    jobConfigPath: null,
    timeout: 3600,
    channel: '#design-approvals'
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--mode' && i + 1 < args.length) {
      options.mode = args[++i];
    } else if (arg === '--scorecard' && i + 1 < args.length) {
      options.scorecardPath = args[++i];
    } else if (arg === '--job-config' && i + 1 < args.length) {
      options.jobConfigPath = args[++i];
    } else if (arg === '--timeout' && i + 1 < args.length) {
      options.timeout = parseInt(args[++i]);
    } else if (arg === '--channel' && i + 1 < args.length) {
      options.channel = args[++i];
    } else if (arg === '--webhook-url' && i + 1 < args.length) {
      options.webhookUrl = args[++i];
    } else if (arg === '--help') {
      console.log(`
Approval Manager - Human-in-the-loop PDF validation

Usage:
  node approval-manager.js --scorecard <path> [options]

Options:
  --mode <mode>           Approval mode: none, auto, slack, manual (default: auto)
  --scorecard <path>      Path to scorecard JSON (required)
  --job-config <path>     Path to job config JSON (optional)
  --timeout <seconds>     Timeout in seconds (default: 3600)
  --channel <channel>     Slack channel for approval (default: #design-approvals)
  --webhook-url <url>     Slack webhook URL (or use SLACK_WEBHOOK_URL env var)
  --help                  Show this help

Modes:
  none    - Skip approval (always approve)
  auto    - Approve if validation passed
  slack   - Request approval via Slack
  manual  - Prompt for manual approval

Examples:
  # Auto-approve if validation passed
  node approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode auto

  # Request approval via Slack
  node approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode slack --channel #design-approvals

  # Manual approval with prompt
  node approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode manual
      `);
      process.exit(0);
    } else {
      // First positional argument is scorecard path
      if (!options.scorecardPath) {
        options.scorecardPath = arg;
      }
    }
  }

  // Validate required arguments
  if (!options.scorecardPath) {
    console.error('ERROR: --scorecard <path> is required');
    console.log('Run with --help for usage');
    process.exit(1);
  }

  // Run approval workflow
  runApprovalWorkflow(options)
    .then(result => {
      // Exit with 0 if approved, 1 if rejected
      process.exit(result.approved ? 0 : 1);
    })
    .catch(error => {
      console.error(`ERROR: ${error.message}`);
      process.exit(1);
    });
}

module.exports = {
  runApprovalWorkflow,
  approveNone,
  approveAuto,
  approveSlack,
  approveManual
};
