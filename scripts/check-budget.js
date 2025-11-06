#!/usr/bin/env node

/**
 * Check Budget - CLI Tool
 *
 * Display current budget status:
 * - Daily/monthly totals
 * - Remaining budget
 * - Recent high-cost operations
 */

const CostTracker = require('../workers/cost-tracker');
const path = require('path');

async function main() {
  console.log('PDF Orchestrator - Budget Status\n');
  console.log('='.repeat(80));

  const tracker = new CostTracker();

  try {
    // Get current spend
    const dailySpend = await tracker.getDailySpend();
    const monthlySpend = await tracker.getMonthlySpend();

    // Get limits from config
    const { dailyCap, monthlyCap } = tracker.config.budget;
    const { dailyAlertThreshold, monthlyAlertThreshold } = tracker.config.alerts;

    // Calculate remaining
    const dailyRemaining = dailyCap - dailySpend;
    const monthlyRemaining = monthlyCap - monthlySpend;

    // Calculate percentages
    const dailyPercent = (dailySpend / dailyCap) * 100;
    const monthlyPercent = (monthlySpend / monthlyCap) * 100;

    // Display daily budget
    console.log('\nDAILY BUDGET');
    console.log('-'.repeat(80));
    console.log(`Current Spend:  $${dailySpend.toFixed(2)}`);
    console.log(`Daily Cap:      $${dailyCap.toFixed(2)}`);
    console.log(`Remaining:      $${dailyRemaining.toFixed(2)} (${(100 - dailyPercent).toFixed(1)}% remaining)`);
    console.log(`Alert Threshold: $${dailyAlertThreshold.toFixed(2)}`);

    if (dailySpend >= dailyCap) {
      console.log(`Status:         🔴 EXCEEDED (${dailyPercent.toFixed(1)}%)`);
    } else if (dailySpend >= dailyAlertThreshold) {
      console.log(`Status:         🟡 WARNING (${dailyPercent.toFixed(1)}%)`);
    } else {
      console.log(`Status:         🟢 OK (${dailyPercent.toFixed(1)}%)`);
    }

    // Progress bar
    console.log(`\nProgress:       ${createProgressBar(dailyPercent, 50)}`);

    // Display monthly budget
    console.log('\n\nMONTHLY BUDGET');
    console.log('-'.repeat(80));
    console.log(`Current Spend:  $${monthlySpend.toFixed(2)}`);
    console.log(`Monthly Cap:    $${monthlyCap.toFixed(2)}`);
    console.log(`Remaining:      $${monthlyRemaining.toFixed(2)} (${(100 - monthlyPercent).toFixed(1)}% remaining)`);
    console.log(`Alert Threshold: $${monthlyAlertThreshold.toFixed(2)}`);

    if (monthlySpend >= monthlyCap) {
      console.log(`Status:         🔴 EXCEEDED (${monthlyPercent.toFixed(1)}%)`);
    } else if (monthlySpend >= monthlyAlertThreshold) {
      console.log(`Status:         🟡 WARNING (${monthlyPercent.toFixed(1)}%)`);
    } else {
      console.log(`Status:         🟢 OK (${monthlyPercent.toFixed(1)}%)`);
    }

    // Progress bar
    console.log(`\nProgress:       ${createProgressBar(monthlyPercent, 50)}`);

    // Get recent high-cost operations
    const recentHighCost = await getRecentHighCost(tracker);

    if (recentHighCost.length > 0) {
      console.log('\n\nRECENT HIGH-COST OPERATIONS (>$0.25)');
      console.log('-'.repeat(80));
      console.log('Timestamp            | Service              | Operation          | Cost    | Document');
      console.log('-'.repeat(80));

      for (const op of recentHighCost) {
        const timestamp = new Date(op.timestamp).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        const service = (op.service || '').padEnd(20, ' ').substring(0, 20);
        const operation = (op.operation || '').padEnd(18, ' ').substring(0, 18);
        const cost = `$${op.cost_usd.toFixed(2)}`.padStart(7, ' ');
        const docSlug = (op.doc_slug || 'N/A').substring(0, 30);

        console.log(`${timestamp} | ${service} | ${operation} | ${cost} | ${docSlug}`);
      }
    }

    // Get today's operation count
    const todayOps = await getTodayOperationCount(tracker);
    const todayDocs = await getTodayDocumentCount(tracker);

    console.log('\n\nTODAY\'S ACTIVITY');
    console.log('-'.repeat(80));
    console.log(`API Calls:      ${todayOps}`);
    console.log(`Documents:      ${todayDocs}`);
    if (todayDocs > 0) {
      console.log(`Avg Cost/Doc:   $${(dailySpend / todayDocs).toFixed(2)}`);
    }

    // Cost projections
    console.log('\n\nPROJECTIONS');
    console.log('-'.repeat(80));

    const avgCostPerDoc = tracker.config.estimatedCosts.typical_document.total;
    const docsUntilDailyCap = Math.floor(dailyRemaining / avgCostPerDoc);
    const docsUntilMonthlyCap = Math.floor(monthlyRemaining / avgCostPerDoc);

    console.log(`Typical Document Cost: $${avgCostPerDoc.toFixed(2)}`);
    console.log(`Documents until daily cap:   ${docsUntilDailyCap}`);
    console.log(`Documents until monthly cap: ${docsUntilMonthlyCap}`);

    console.log('\n' + '='.repeat(80));
    console.log('');

  } catch (error) {
    console.error('\nERROR:', error.message);
    process.exit(1);
  } finally {
    tracker.close();
  }
}

/**
 * Create a progress bar
 * @param {number} percent - Percentage (0-100)
 * @param {number} width - Bar width in characters
 * @returns {string} - Progress bar string
 */
function createProgressBar(percent, width) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;

  let bar = '[';

  // Color based on percentage
  if (percent >= 100) {
    bar += '🔴'.repeat(filled);
  } else if (percent >= 75) {
    bar += '🟡'.repeat(filled);
  } else {
    bar += '🟢'.repeat(filled);
  }

  bar += '⚪'.repeat(empty);
  bar += `] ${percent.toFixed(1)}%`;

  return bar;
}

/**
 * Get recent high-cost operations
 * @param {CostTracker} tracker - Cost tracker instance
 * @returns {Promise<Array>} - Recent operations
 */
function getRecentHighCost(tracker) {
  return new Promise((resolve, reject) => {
    tracker.db.all(
      `SELECT timestamp, service, operation, cost_usd, doc_slug
       FROM cost_log
       WHERE cost_usd > 0.25
       ORDER BY timestamp DESC
       LIMIT 10`,
      (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      }
    );
  });
}

/**
 * Get today's operation count
 * @param {CostTracker} tracker - Cost tracker instance
 * @returns {Promise<number>} - Operation count
 */
function getTodayOperationCount(tracker) {
  return new Promise((resolve, reject) => {
    tracker.db.get(
      `SELECT COUNT(*) as count FROM cost_log WHERE date(timestamp) = date('now')`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

/**
 * Get today's document count
 * @param {CostTracker} tracker - Cost tracker instance
 * @returns {Promise<number>} - Document count
 */
function getTodayDocumentCount(tracker) {
  return new Promise((resolve, reject) => {
    tracker.db.get(
      `SELECT COUNT(DISTINCT doc_slug) as count FROM cost_log WHERE date(timestamp) = date('now') AND doc_slug IS NOT NULL`,
      (err, row) => {
        if (err) reject(err);
        else resolve(row?.count || 0);
      }
    );
  });
}

// Run main function
if (require.main === module) {
  main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { main };
