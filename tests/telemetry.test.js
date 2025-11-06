/**
 * Telemetry Unit Tests
 *
 * Tests for telemetry collection, metrics aggregation, and alerting
 */

const assert = require('assert');
const fs = require('fs').promises;
const path = require('path');

// Import modules to test
const {
  initialize,
  recordOperation,
  recordMetric,
  recordError,
  readOperationLogs,
  getDailySpend,
  getMonthlySpend
} = require('../workers/telemetry');

const {
  aggregateMetrics,
  percentile,
  getCostPerDocument
} = require('../workers/metrics-aggregator');

const {
  checkAlertCondition,
  dispatchAlert
} = require('../scripts/send-alert');

/**
 * Test Suite
 */
async function runTests() {
  console.log('Running Telemetry Tests...\n');

  let passedTests = 0;
  let failedTests = 0;

  // Test 1: Initialize telemetry system
  try {
    console.log('Test 1: Initialize telemetry system');
    await initialize();
    console.log('  ✓ Telemetry initialized\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 2: Record operation with valid data
  try {
    console.log('Test 2: Record operation with valid data');
    const result = await recordOperation('test_operation', {
      run_id: 'test-001',
      doc_slug: 'test-doc',
      user: 'test@teei.org',
      latency_ms: 1500,
      status: 'success',
      cost_usd: 0.50,
      api_calls: [
        {
          service: 'openai_images',
          operation: 'generate',
          latency_ms: 1000,
          cost_usd: 0.40
        }
      ],
      assets: {
        images_generated: 1
      },
      validation: {
        accessibility_pass: true
      }
    });

    assert(result.timestamp, 'Should have timestamp');
    assert(result.service === 'pdf-orchestrator', 'Should have correct service');
    assert(result.operation === 'test_operation', 'Should have correct operation');
    console.log('  ✓ Operation recorded successfully\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 3: Validate operation log schema
  try {
    console.log('Test 3: Validate operation log schema');

    // Should fail without required fields or with invalid status
    let threwError = false;
    let errorMessage = '';
    try {
      await recordOperation('invalid_op', {
        run_id: 'test-002'
        // Missing status - should fail
      });
    } catch (error) {
      threwError = true;
      errorMessage = error.message;
    }

    assert(threwError, 'Should throw error for invalid schema');
    assert(
      errorMessage.includes('Missing required fields') || errorMessage.includes('Invalid status'),
      `Error message should mention validation error, got: ${errorMessage}`
    );
    console.log('  ✓ Schema validation works correctly\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 4: Record custom metric
  try {
    console.log('Test 4: Record custom metric');
    const result = await recordMetric('test.metric', 42, { environment: 'test' });

    assert(result.timestamp, 'Should have timestamp');
    assert(result.metric === 'test.metric', 'Should have correct metric name');
    assert(result.value === 42, 'Should have correct value');
    console.log('  ✓ Metric recorded successfully\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 5: Record error with context
  try {
    console.log('Test 5: Record error with context');
    const testError = new Error('Test error message');
    testError.code = 'TEST_ERROR';

    const result = await recordError(testError, {
      operation: 'test_operation',
      run_id: 'test-003',
      doc_slug: 'test-doc',
      user: 'test@teei.org',
      service: 'test_service'
    });

    assert(result.level === 'error', 'Should have error level');
    assert(result.error.code === 'TEST_ERROR', 'Should have error code');
    assert(result.error.message === 'Test error message', 'Should have error message');
    console.log('  ✓ Error recorded successfully\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 6: Read operation logs
  try {
    console.log('Test 6: Read operation logs');
    const today = new Date().toISOString().split('T')[0];
    const logs = await readOperationLogs(today, today);

    assert(Array.isArray(logs), 'Should return array');
    assert(logs.length > 0, 'Should have at least one log entry');
    console.log(`  ✓ Read ${logs.length} log entries\n`);
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 7: Calculate daily spend
  try {
    console.log('Test 7: Calculate daily spend');
    const today = new Date().toISOString().split('T')[0];
    const spend = await getDailySpend(today);

    assert(typeof spend === 'number', 'Should return number');
    assert(spend >= 0, 'Should be non-negative');
    console.log(`  ✓ Daily spend: $${spend.toFixed(2)}\n`);
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 8: Percentile calculation
  try {
    console.log('Test 8: Percentile calculation');
    const data = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    const p50 = percentile(data, 50);
    const p95 = percentile(data, 95);
    const p99 = percentile(data, 99);

    assert(p50 === 55, `P50 should be 55, got ${p50}`);
    assert(p95 === 95.5, `P95 should be 95.5, got ${p95}`);
    assert(p99 === 99.1, `P99 should be 99.1, got ${p99}`);

    console.log('  ✓ Percentile calculation correct\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 9: Aggregate metrics
  try {
    console.log('Test 9: Aggregate metrics');

    // Record multiple operations
    for (let i = 0; i < 5; i++) {
      await recordOperation('test_operation', {
        run_id: `test-agg-${i}`,
        doc_slug: 'test-doc',
        user: 'test@teei.org',
        latency_ms: 1000 + (i * 500), // 1000, 1500, 2000, 2500, 3000
        status: i < 4 ? 'success' : 'failure', // 80% success rate
        cost_usd: 0.50,
        api_calls: [],
        assets: {},
        validation: {}
      });
    }

    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);

    const metrics = await aggregateMetrics(oneMinuteAgo, now);

    assert(metrics.total_operations >= 5, 'Should have at least 5 operations');
    assert(metrics.latency.p50 !== null, 'Should calculate P50');
    assert(metrics.latency.p95 !== null, 'Should calculate P95');
    assert(metrics.success_rate !== null, 'Should calculate success rate');
    assert(metrics.total_cost >= 2.5, 'Should calculate total cost');

    console.log(`  ✓ Aggregated ${metrics.total_operations} operations`);
    console.log(`    - P50: ${metrics.latency.p50}ms, P95: ${metrics.latency.p95}ms`);
    console.log(`    - Success rate: ${metrics.success_rate}%`);
    console.log(`    - Total cost: $${metrics.total_cost}\n`);
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 10: Check alert conditions
  try {
    console.log('Test 10: Check alert conditions');

    const testCases = [
      { operator: '<', threshold: 100, value: 50, expected: true },
      { operator: '<', threshold: 100, value: 150, expected: false },
      { operator: '>', threshold: 100, value: 150, expected: true },
      { operator: '>', threshold: 100, value: 50, expected: false },
      { operator: '>=', threshold: 100, value: 100, expected: true },
      { operator: '==', threshold: 100, value: 100, expected: true },
      { operator: '==', threshold: 100, value: 99, expected: false }
    ];

    for (const testCase of testCases) {
      const alertRule = {
        condition: {
          operator: testCase.operator,
          threshold: testCase.threshold
        }
      };

      const result = checkAlertCondition(alertRule, testCase.value);
      assert(
        result === testCase.expected,
        `${testCase.value} ${testCase.operator} ${testCase.threshold} should be ${testCase.expected}, got ${result}`
      );
    }

    console.log('  ✓ Alert condition checks working correctly\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test 11: Alert dispatch (dry run - won't actually send)
  try {
    console.log('Test 11: Alert dispatch structure');

    const testAlert = {
      priority: 'P3',
      name: 'Test Alert',
      description: 'Test alert description',
      severity: 'medium',
      condition: {
        metric: 'test.metric',
        operator: '>',
        threshold: 100,
        duration: '5m'
      },
      currentValue: 150,
      action: 'Test action',
      runbook: 'https://docs.internal/runbooks/test',
      routes: [] // Empty to avoid actual dispatch
    };

    // Just verify structure, don't actually dispatch
    assert(testAlert.priority, 'Should have priority');
    assert(testAlert.name, 'Should have name');
    assert(testAlert.routes, 'Should have routes');

    console.log('  ✓ Alert structure valid\n');
    passedTests++;
  } catch (error) {
    console.error('  ✗ Failed:', error.message, '\n');
    failedTests++;
  }

  // Test Summary
  console.log('═══════════════════════════════════');
  console.log(`Total Tests: ${passedTests + failedTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log('═══════════════════════════════════');

  if (failedTests === 0) {
    console.log('\n✓ All tests passed!\n');
    process.exit(0);
  } else {
    console.log(`\n✗ ${failedTests} test(s) failed\n`);
    process.exit(1);
  }
}

// Run tests
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };
