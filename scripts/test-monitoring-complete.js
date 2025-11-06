/**
 * Complete Monitoring System Test
 *
 * Demonstrates full telemetry, metrics, and alerting workflow
 */

const { initialize, recordOperation, recordError, getDailySpend } = require('../workers/telemetry');
const { aggregateMetrics, getLatestMetrics } = require('../workers/metrics-aggregator');
const { checkAlertCondition } = require('./send-alert');

async function runCompleteTest() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('PDF Orchestrator - Complete Monitoring System Test');
  console.log('═══════════════════════════════════════════════════════\n');

  // Step 1: Initialize
  console.log('Step 1: Initialize Telemetry');
  console.log('────────────────────────────────');
  await initialize();
  console.log('✓ Telemetry initialized\n');

  // Step 2: Simulate operations
  console.log('Step 2: Simulate Document Generation Operations');
  console.log('────────────────────────────────────────────────');

  const operations = [
    { latency: 8500, status: 'success', cost: 0.61 },
    { latency: 12000, status: 'success', cost: 0.58 },
    { latency: 9200, status: 'success', cost: 0.63 },
    { latency: 15000, status: 'timeout', cost: 0.00 },
    { latency: 7800, status: 'success', cost: 0.60 }
  ];

  for (let i = 0; i < operations.length; i++) {
    const op = operations[i];
    const runId = `demo-run-${Date.now()}-${i}`;

    try {
      await recordOperation('generate_document', {
        run_id: runId,
        doc_slug: 'teei-aws-partnership-demo',
        user: 'henrik@teei.org',
        latency_ms: op.latency,
        status: op.status,
        cost_usd: op.cost,
        api_calls: [
          {
            service: 'openai_images',
            operation: 'generate',
            latency_ms: Math.floor(op.latency * 0.6),
            cost_usd: 0.12,
            model: 'dall-e-3'
          },
          {
            service: 'adobe_pdf_services',
            operation: 'document_generation',
            latency_ms: Math.floor(op.latency * 0.3),
            cost_usd: 0.25
          }
        ],
        assets: {
          images_generated: 4,
          pages: 12,
          file_size_bytes: 2450000
        },
        validation: {
          accessibility_pass: op.status === 'success',
          visual_ssim: op.status === 'success' ? 0.97 : null,
          brand_compliance: op.status === 'success'
        }
      });

      console.log(`  Operation ${i + 1}: ${op.status} - ${op.latency}ms - $${op.cost}`);
    } catch (error) {
      console.error(`  Operation ${i + 1}: Failed -`, error.message);
    }
  }
  console.log('\n');

  // Step 3: Simulate an error
  console.log('Step 3: Simulate Error Condition');
  console.log('─────────────────────────────────');

  const testError = new Error('OpenAI API rate limit exceeded');
  testError.code = 'OPENAI_RATE_LIMIT';
  testError.statusCode = 429;

  await recordError(testError, {
    operation: 'generate_image',
    run_id: 'demo-run-error',
    doc_slug: 'teei-program-overview',
    user: 'henrik@teei.org',
    service: 'openai_images',
    fallback_used: 'unsplash'
  });

  console.log('  ✓ Error recorded with fallback information\n');

  // Step 4: Calculate daily spend
  console.log('Step 4: Calculate Daily Spend');
  console.log('──────────────────────────────');

  const today = new Date().toISOString().split('T')[0];
  const dailySpend = await getDailySpend(today);

  console.log(`  Date: ${today}`);
  console.log(`  Total Spend: $${dailySpend.toFixed(2)}`);
  console.log(`  Daily Budget: $25.00`);
  console.log(`  Usage: ${((dailySpend / 25) * 100).toFixed(1)}%`);

  if (dailySpend > 20) {
    console.log('  ⚠️  WARNING: Approaching daily budget limit!');
  } else {
    console.log('  ✓ Within budget');
  }
  console.log('\n');

  // Step 5: Aggregate metrics
  console.log('Step 5: Aggregate Recent Metrics');
  console.log('─────────────────────────────────');

  const now = new Date();
  const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

  const metrics = await aggregateMetrics(fifteenMinutesAgo, now);

  console.log(`  Time Range: ${fifteenMinutesAgo.toISOString()} to ${now.toISOString()}`);
  console.log(`  Total Operations: ${metrics.total_operations}`);
  console.log(`  Latency:`);
  console.log(`    - P50 (Median): ${metrics.latency.p50}ms`);
  console.log(`    - P95: ${metrics.latency.p95}ms`);
  console.log(`    - P99: ${metrics.latency.p99}ms`);
  console.log(`  Success Rate: ${metrics.success_rate}%`);
  console.log(`  Error Rate: ${metrics.error_rate}%`);
  console.log(`  Total Cost: $${metrics.total_cost}`);
  console.log('\n');

  // Step 6: Check alert conditions
  console.log('Step 6: Check Alert Conditions');
  console.log('───────────────────────────────');

  const alertChecks = [
    {
      name: 'Daily Budget Exceeded',
      rule: { condition: { operator: '>=', threshold: 25.0 } },
      value: dailySpend,
      priority: 'P1'
    },
    {
      name: 'Daily Budget Warning',
      rule: { condition: { operator: '>=', threshold: 20.0 } },
      value: dailySpend,
      priority: 'P2'
    },
    {
      name: 'Success Rate Below Target',
      rule: { condition: { operator: '<', threshold: 98 } },
      value: metrics.success_rate || 100,
      priority: 'P2'
    },
    {
      name: 'P95 Latency Elevated',
      rule: { condition: { operator: '>', threshold: 45000 } },
      value: metrics.latency.p95 || 0,
      priority: 'P2'
    }
  ];

  let alertsTriggered = 0;

  for (const check of alertChecks) {
    const triggered = checkAlertCondition(check.rule, check.value);

    if (triggered) {
      console.log(`  🚨 [${check.priority}] ${check.name}: TRIGGERED`);
      console.log(`     Current: ${check.value}, Threshold: ${check.rule.condition.threshold}`);
      alertsTriggered++;
    } else {
      console.log(`  ✓ ${check.name}: OK`);
    }
  }

  if (alertsTriggered > 0) {
    console.log(`\n  ⚠️  ${alertsTriggered} alert(s) would be sent to configured channels`);
  } else {
    console.log('\n  ✓ All checks passed - no alerts triggered');
  }
  console.log('\n');

  // Step 7: Show log locations
  console.log('Step 7: Log File Locations');
  console.log('──────────────────────────');
  console.log('  Operations: logs/operations/2025-11-05.jsonl');
  console.log('  Errors: logs/errors/2025-11-05.jsonl');
  console.log('  Metrics: logs/metrics/aggregated.jsonl');
  console.log('\n');

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log('Test Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('\nNext Steps:');
  console.log('  1. View logs: cat logs/operations/2025-11-05.jsonl');
  console.log('  2. Start metrics aggregator: npm run start-metrics');
  console.log('  3. Configure alerts: edit config/alerting/alert-rules.json');
  console.log('  4. Import Grafana dashboards: config/grafana/dashboards/');
  console.log('  5. Set up environment variables for Slack/Email alerts');
  console.log('\nDocumentation: docs/MONITORING_SETUP.md');
  console.log('\n');
}

// Run test
if (require.main === module) {
  runCompleteTest().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = { runCompleteTest };
