#!/usr/bin/env node
/**
 * Full Integration Test for AI System
 * Tests Tier 1, Tier 1.5, and Tier 2 modes
 *
 * Usage:
 *   node ai/tests/full-integration-test.js --job-config <path>
 */

const fs = require('fs');
const path = require('path');
const { runAIAnalysis } = require('../core/aiRunner');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bright + colors.blue);
  console.log('='.repeat(60) + '\n');
}

/**
 * Create a temporary job config with specific AI settings
 */
function createTestConfig(baseConfigPath, overrides) {
  const baseConfig = JSON.parse(fs.readFileSync(baseConfigPath, 'utf-8'));

  const testConfig = {
    ...baseConfig,
    ai: {
      ...baseConfig.ai,
      ...overrides
    }
  };

  const testPath = baseConfigPath.replace('.json', `-test-${Date.now()}.json`);
  fs.writeFileSync(testPath, JSON.stringify(testConfig, null, 2), 'utf-8');

  return testPath;
}

/**
 * Run a single test mode
 */
async function runTest(name, description, configPath, configOverrides) {
  section(`Test: ${name}`);
  log(description, colors.yellow);
  console.log();

  const testConfigPath = createTestConfig(configPath, configOverrides);
  const startTime = Date.now();

  try {
    const result = await runAIAnalysis({
      jobConfigPath: testConfigPath,
      outputPath: null
    });

    const duration = Date.now() - startTime;

    log(`✓ Test passed in ${duration}ms`, colors.green);
    console.log();
    console.log('Results:');
    console.log(`  Tier: ${result.metadata.tier}`);
    console.log(`  Advanced Mode: ${result.metadata.advancedMode}`);
    console.log(`  Layout Enabled: ${result.metadata.layoutEnabled}`);
    console.log(`  Overall Score: ${result.overall.normalizedScore.toFixed(3)}`);
    console.log(`  Grade: ${result.overall.grade}`);
    console.log(`  Status: ${result.overall.passed ? '✓ PASS' : '✗ FAIL'}`);
    console.log();
    console.log('Features:');
    for (const [name, data] of Object.entries(result.features)) {
      if (data.enabled) {
        const mode = data.details?.mode || 'standard';
        console.log(`  ${name}: ${data.score.toFixed(2)} (${mode})`);
      }
    }

    // Clean up test config
    fs.unlinkSync(testConfigPath);

    return {
      name,
      success: true,
      duration,
      score: result.overall.normalizedScore,
      grade: result.overall.grade,
      tier: result.metadata.tier,
      issueCount: Object.values(result.features)
        .filter(f => f.enabled)
        .reduce((sum, f) => sum + f.issues.length, 0)
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    log(`✗ Test failed: ${error.message}`, colors.red);

    // Clean up test config
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }

    return {
      name,
      success: false,
      duration,
      error: error.message
    };
  }
}

/**
 * Main test runner
 */
async function runFullIntegrationTest(jobConfigPath) {
  section('AI System Full Integration Test');
  log(`Testing job config: ${jobConfigPath}`, colors.yellow);
  console.log();

  // Verify job config exists
  if (!fs.existsSync(jobConfigPath)) {
    log(`✗ Job config not found: ${jobConfigPath}`, colors.red);
    process.exit(1);
  }

  const results = [];

  // ============================================================
  // TEST 1: TIER 1 (Heuristic Mode)
  // ============================================================
  const test1 = await runTest(
    'Tier 1 - Heuristic Mode',
    'Standard analysis using heuristic-based estimates',
    jobConfigPath,
    {
      enabled: true,
      advancedMode: false,
      features: {
        typography: { enabled: true, weight: 0.4 },
        whitespace: { enabled: true, weight: 0.3 },
        color: { enabled: true, weight: 0.3 },
        layout: { enabled: false }
      }
    }
  );
  results.push(test1);

  // ============================================================
  // TEST 2: TIER 1.5 (Advanced Extraction)
  // ============================================================
  const test2 = await runTest(
    'Tier 1.5 - Advanced Extraction',
    'Enhanced analysis using real PDF data extraction',
    jobConfigPath,
    {
      enabled: true,
      advancedMode: true,
      features: {
        typography: { enabled: true, weight: 0.4 },
        whitespace: { enabled: true, weight: 0.3 },
        color: { enabled: true, weight: 0.3 },
        layout: { enabled: false }
      }
    }
  );
  results.push(test2);

  // ============================================================
  // TEST 3: TIER 2 (With Layout AI)
  // ============================================================
  const test3 = await runTest(
    'Tier 2 - With Layout AI',
    'Full AI analysis including SmolDocling layout analysis',
    jobConfigPath,
    {
      enabled: true,
      advancedMode: true,
      features: {
        typography: { enabled: true, weight: 0.3 },
        whitespace: { enabled: true, weight: 0.25 },
        color: { enabled: true, weight: 0.25 },
        layout: { enabled: true, weight: 0.2 }
      }
    }
  );
  results.push(test3);

  // ============================================================
  // SUMMARY
  // ============================================================
  section('Test Summary');

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`Tests passed: ${successCount}/${totalCount}\n`);

  // Print comparison table
  console.log('Tier Comparison:');
  console.log('─'.repeat(80));
  console.log('Tier'.padEnd(20) + 'Time'.padEnd(12) + 'Score'.padEnd(12) + 'Grade'.padEnd(10) + 'Issues');
  console.log('─'.repeat(80));

  for (const result of results) {
    if (result.success) {
      const tierName = result.name.padEnd(20);
      const time = `${result.duration}ms`.padEnd(12);
      const score = result.score.toFixed(3).padEnd(12);
      const grade = result.grade.padEnd(10);
      const issues = result.issueCount.toString();

      console.log(`${tierName}${time}${score}${grade}${issues}`);
    } else {
      console.log(`${result.name.padEnd(20)}ERROR: ${result.error}`);
    }
  }
  console.log('─'.repeat(80));

  // Analysis
  console.log('\nAnalysis:');

  const tier1 = results[0];
  const tier15 = results[1];
  const tier2 = results[2];

  if (tier1.success && tier15.success) {
    const scoreDiff = ((tier15.score - tier1.score) * 100).toFixed(1);
    const timeDiff = tier15.duration - tier1.duration;
    console.log(`\n1. Tier 1.5 vs Tier 1:`);
    console.log(`   Score change: ${scoreDiff > 0 ? '+' : ''}${scoreDiff}%`);
    console.log(`   Time overhead: +${timeDiff}ms`);
    console.log(`   Issue detection: ${tier15.issueCount} vs ${tier1.issueCount} issues`);
  }

  if (tier2.success && tier15.success) {
    const scoreDiff = ((tier2.score - tier15.score) * 100).toFixed(1);
    const timeDiff = tier2.duration - tier15.duration;
    console.log(`\n2. Tier 2 vs Tier 1.5:`);
    console.log(`   Score change: ${scoreDiff > 0 ? '+' : ''}${scoreDiff}%`);
    console.log(`   Time overhead: +${timeDiff}ms`);
    console.log(`   Layout analysis: ${tier2.layoutEnabled ? 'Enabled' : 'Disabled'}`);
  }

  // Recommendations
  console.log('\nRecommendations:');
  if (tier1.success && tier15.success && tier2.success) {
    if (tier15.duration < 5000) {
      log('✓ Use Tier 1.5 (advancedMode: true) for best accuracy with acceptable speed', colors.green);
    } else {
      log('⚠ Tier 1.5 has high overhead - use Tier 1 for faster iteration', colors.yellow);
    }

    if (tier2.duration > 15000) {
      log('⚠ Tier 2 is slow - only enable for final QA passes', colors.yellow);
    } else {
      log('✓ Tier 2 performance is acceptable for regular use', colors.green);
    }
  }

  console.log();

  // Exit code
  process.exit(successCount === totalCount ? 0 : 1);
}

// ============================================================
// CLI
// ============================================================
if (require.main === module) {
  const args = process.argv.slice(2);
  let jobConfigPath = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--job-config' && args[i + 1]) {
      jobConfigPath = args[i + 1];
      i++;
    }
  }

  if (!jobConfigPath) {
    console.error('Usage: node full-integration-test.js --job-config <path>');
    console.error('\nExample:');
    console.error('  node ai/tests/full-integration-test.js --job-config example-jobs/tfu-aws-partnership-v2.json');
    process.exit(1);
  }

  runFullIntegrationTest(jobConfigPath)
    .catch(error => {
      log(`✗ Test runner failed: ${error.message}`, colors.red);
      console.error(error.stack);
      process.exit(1);
    });
}

module.exports = { runFullIntegrationTest };
