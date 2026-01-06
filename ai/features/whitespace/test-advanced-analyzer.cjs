/* eslint-disable */
/**
 * Test script for Advanced Whitespace Analyzer (Agent 3)
 *
 * Tests:
 * 1. Text extraction with bounding boxes
 * 2. Coverage calculation (real vs heuristic)
 * 3. Gestalt principles analysis
 * 4. Visual balance evaluation
 * 5. Reading comfort metrics
 * 6. Full integration test
 */

const {
  analyzeWhitespaceAdvanced,
  extractTextBlocksWithBounds,
  calculateRealCoverage,
  analyzeQuadrantDensity,
  analyzeGestaltPrinciples,
  analyzeVisualBalance,
  analyzeReadingComfort
} = require('./advancedWhitespaceAnalyzer.js');

const path = require('path');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  log(`TEST: ${name}`, colors.cyan);
  console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
}

function logPass(message) {
  log(`✓ ${message}`, colors.green);
}

function logFail(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`  ${message}`, colors.yellow);
}

// Test 1: Coverage calculation
function testCoverageCalculation() {
  logTest("Coverage Calculation (Real vs Heuristic)");

  const blocks = [
    { x: 40, y: 60, width: 480, height: 96 },   // ~46,080 sq pt
    { x: 40, y: 180, width: 480, height: 64 }   // ~30,720 sq pt
  ];

  const dimensions = { width: 612, height: 792 }; // Letter size
  const totalArea = 612 * 792; // 484,704 sq pt

  const coverage = calculateRealCoverage(blocks, dimensions);
  const expectedCoverage = (46080 + 30720) / 484704; // ~0.158

  if (Math.abs(coverage - expectedCoverage) < 0.001) {
    logPass(`Coverage calculation accurate: ${(coverage * 100).toFixed(2)}%`);
    logInfo(`Expected: ${(expectedCoverage * 100).toFixed(2)}%`);
    logInfo(`Actual: ${(coverage * 100).toFixed(2)}%`);
    return true;
  } else {
    logFail(`Coverage mismatch: expected ${expectedCoverage.toFixed(3)}, got ${coverage.toFixed(3)}`);
    return false;
  }
}

// Test 2: Gestalt proximity detection
function testGestaltProximity() {
  logTest("Gestalt Principles - Proximity Detection");

  // Cramped spacing scenario
  const cramped = [
    { x: 40, y: 100, width: 480, height: 50, lines: 3, characters: 150 },
    { x: 40, y: 155, width: 480, height: 50, lines: 3, characters: 150 } // Only 5pt spacing!
  ];

  const result = analyzeGestaltPrinciples(cramped);

  if (result.score < 0.95 && result.issues.some(i => i.type === 'proximity')) {
    logPass("Cramped spacing detected correctly");
    logInfo(`Score: ${result.score.toFixed(3)} (should be < 0.95)`);
    logInfo(`Issues found: ${result.issues.filter(i => i.type === 'proximity').length}`);
    logInfo(`Message: "${result.issues[0].message}"`);
    return true;
  } else {
    logFail("Failed to detect cramped spacing");
    logInfo(`Score: ${result.score.toFixed(3)}`);
    logInfo(`Issues: ${result.issues.length}`);
    return false;
  }
}

// Test 3: Golden ratio validation
function testGoldenRatio() {
  logTest("Visual Balance - Golden Ratio");

  const dimensions = { width: 612, height: 792 };
  const goldenRatio = 0.382; // 1 / 1.618
  const optimalTopMargin = dimensions.height * goldenRatio; // ~302pt

  // Blocks with good golden ratio
  const goodBlocks = [
    { x: 40, y: 302, width: 480, height: 200, lines: 12, characters: 600 }
  ];

  // Blocks with poor golden ratio
  const poorBlocks = [
    { x: 40, y: 100, width: 480, height: 200, lines: 12, characters: 600 } // Too high (100pt vs 302pt)
  ];

  const goodResult = analyzeVisualBalance(goodBlocks, dimensions);
  const poorResult = analyzeVisualBalance(poorBlocks, dimensions);

  const goodPassed = !goodResult.issues.some(i => i.type === 'balance' && i.message.includes('golden ratio'));
  const poorPassed = poorResult.issues.some(i => i.type === 'balance' && i.message.includes('golden ratio'));

  if (goodPassed && poorPassed) {
    logPass("Golden ratio validation working");
    logInfo(`Good layout: ${goodResult.issues.filter(i => i.message.includes('golden')).length} issues`);
    logInfo(`Poor layout: ${poorResult.issues.filter(i => i.message.includes('golden')).length} issues`);
    logInfo(`Optimal top margin: ${optimalTopMargin.toFixed(0)}pt`);
    return true;
  } else {
    logFail("Golden ratio validation failed");
    logInfo(`Good layout passed: ${goodPassed}`);
    logInfo(`Poor layout detected: ${poorPassed}`);
    return false;
  }
}

// Test 4: Line length validation
function testLineLengthValidation() {
  logTest("Reading Comfort - Line Length");

  const dimensions = { width: 612, height: 792 };

  // Too short (30 chars per line)
  const shortBlocks = [
    { x: 40, y: 100, width: 180, height: 50, lines: 3, characters: 90 }
  ];

  // Optimal (60 chars per line)
  const optimalBlocks = [
    { x: 40, y: 100, width: 360, height: 50, lines: 3, characters: 180 }
  ];

  // Too long (100 chars per line)
  const longBlocks = [
    { x: 40, y: 100, width: 600, height: 50, lines: 3, characters: 300 }
  ];

  const shortResult = analyzeReadingComfort(shortBlocks, dimensions);
  const optimalResult = analyzeReadingComfort(optimalBlocks, dimensions);
  const longResult = analyzeReadingComfort(longBlocks, dimensions);

  const shortDetected = shortResult.issues.some(i => i.message.includes('too short'));
  const optimalClean = !optimalResult.issues.some(i => i.message.includes('Line length'));
  const longDetected = longResult.issues.some(i => i.message.includes('too long'));

  if (shortDetected && optimalClean && longDetected) {
    logPass("Line length validation working");
    logInfo(`Short (30 chars): Detected issue ✓`);
    logInfo(`Optimal (60 chars): No issue ✓`);
    logInfo(`Long (100 chars): Detected issue ✓`);
    return true;
  } else {
    logFail("Line length validation failed");
    logInfo(`Short detected: ${shortDetected}`);
    logInfo(`Optimal clean: ${optimalClean}`);
    logInfo(`Long detected: ${longDetected}`);
    return false;
  }
}

// Test 5: Quadrant density analysis
function testQuadrantDensity() {
  logTest("Quadrant Density Analysis");

  const dimensions = { width: 612, height: 792 };

  // Unbalanced: all text in top-left
  const unbalanced = [
    { x: 100, y: 100, width: 200, height: 200 } // Top-left quadrant
  ];

  // Balanced: text spread across all quadrants
  const balanced = [
    { x: 100, y: 100, width: 100, height: 100 }, // Top-left
    { x: 400, y: 100, width: 100, height: 100 }, // Top-right
    { x: 100, y: 500, width: 100, height: 100 }, // Bottom-left
    { x: 400, y: 500, width: 100, height: 100 }  // Bottom-right
  ];

  const unbalancedResult = analyzeQuadrantDensity(unbalanced, dimensions);
  const balancedResult = analyzeQuadrantDensity(balanced, dimensions);

  // Unbalanced should have high top-left, low others
  const unbalancedCorrect = unbalancedResult.topLeft > 0.05 &&
                           unbalancedResult.topRight < 0.01 &&
                           unbalancedResult.bottomLeft < 0.01 &&
                           unbalancedResult.bottomRight < 0.01;

  // Balanced should have similar values across quadrants
  const avgDensity = (balancedResult.topLeft + balancedResult.topRight +
                     balancedResult.bottomLeft + balancedResult.bottomRight) / 4;
  const maxDeviation = Math.max(
    Math.abs(balancedResult.topLeft - avgDensity),
    Math.abs(balancedResult.topRight - avgDensity),
    Math.abs(balancedResult.bottomLeft - avgDensity),
    Math.abs(balancedResult.bottomRight - avgDensity)
  );
  const balancedCorrect = maxDeviation < avgDensity * 0.2; // Within 20% of average

  if (unbalancedCorrect && balancedCorrect) {
    logPass("Quadrant density analysis working");
    logInfo(`Unbalanced layout: TL=${(unbalancedResult.topLeft * 100).toFixed(1)}%, TR=${(unbalancedResult.topRight * 100).toFixed(1)}%`);
    logInfo(`Balanced layout: Avg=${(avgDensity * 100).toFixed(1)}%, MaxDev=${(maxDeviation * 100).toFixed(1)}%`);
    return true;
  } else {
    logFail("Quadrant density analysis failed");
    logInfo(`Unbalanced detection: ${unbalancedCorrect}`);
    logInfo(`Balanced detection: ${balancedCorrect}`);
    return false;
  }
}

// Test 6: Full integration test (if PDF exists)
async function testFullIntegration() {
  logTest("Full Integration Test");

  // Look for a test PDF in common locations
  const testPaths = [
    path.join(process.cwd(), 'exports', 'TEEI_AWS_Partnership.pdf'),
    path.join(process.cwd(), 'exports', 'TEEI-AWS-Partnership.pdf'),
    path.join(process.cwd(), 'test-jobs', 'sample.pdf'),
    path.join(process.cwd(), 'reference-pdfs', 'sample.pdf')
  ];

  let testPdf = null;
  for (const pdfPath of testPaths) {
    if (require('fs').existsSync(pdfPath)) {
      testPdf = pdfPath;
      break;
    }
  }

  if (!testPdf) {
    logInfo("No test PDF found in:");
    testPaths.forEach(p => logInfo(`  - ${p}`));
    logInfo("Skipping integration test (unit tests still valid)");
    return null; // Not a failure, just skipped
  }

  try {
    const config = { enabled: true, weight: 0.15 };
    const jobConfig = {};

    logInfo(`Analyzing: ${path.basename(testPdf)}`);
    const result = await analyzeWhitespaceAdvanced(testPdf, config, jobConfig);

    if (result.score !== undefined && result.issues !== undefined) {
      logPass("Full analysis completed successfully");
      logInfo(`Overall Score: ${result.score.toFixed(3)}`);
      logInfo(`  - Gestalt: ${result.details.componentScores.gestalt.toFixed(3)}`);
      logInfo(`  - Balance: ${result.details.componentScores.balance.toFixed(3)}`);
      logInfo(`  - Readability: ${result.details.componentScores.readability.toFixed(3)}`);
      logInfo(`Average Coverage: ${(result.details.coverage.average * 100).toFixed(1)}%`);
      logInfo(`Issues Found: ${result.issues.length}`);
      logInfo(`Pages Analyzed: ${result.details.pageAnalysis.length}`);
      return true;
    } else {
      logFail("Analysis returned incomplete result");
      return false;
    }
  } catch (error) {
    logFail(`Analysis error: ${error.message}`);
    logInfo(error.stack);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log('  ADVANCED WHITESPACE ANALYZER - TEST SUITE (Agent 3)', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.blue);

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0
  };

  // Unit tests
  const tests = [
    { name: 'Coverage Calculation', fn: testCoverageCalculation },
    { name: 'Gestalt Proximity', fn: testGestaltProximity },
    { name: 'Golden Ratio', fn: testGoldenRatio },
    { name: 'Line Length', fn: testLineLengthValidation },
    { name: 'Quadrant Density', fn: testQuadrantDensity }
  ];

  for (const test of tests) {
    try {
      const passed = test.fn();
      if (passed) results.passed++;
      else results.failed++;
    } catch (error) {
      logFail(`Exception in ${test.name}: ${error.message}`);
      results.failed++;
    }
  }

  // Integration test
  try {
    const integrationResult = await testFullIntegration();
    if (integrationResult === true) results.passed++;
    else if (integrationResult === false) results.failed++;
    else results.skipped++;
  } catch (error) {
    logFail(`Exception in integration test: ${error.message}`);
    results.failed++;
  }

  // Summary
  console.log('\n');
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log('  TEST SUMMARY', colors.cyan);
  log('═══════════════════════════════════════════════════════════', colors.blue);
  log(`  Total Tests: ${results.passed + results.failed + results.skipped}`, colors.yellow);
  log(`  Passed: ${results.passed}`, colors.green);
  if (results.failed > 0) {
    log(`  Failed: ${results.failed}`, colors.red);
  }
  if (results.skipped > 0) {
    log(`  Skipped: ${results.skipped}`, colors.yellow);
  }

  const allPassed = results.failed === 0;
  if (allPassed) {
    console.log('\n');
    log('✓ ALL TESTS PASSED - Agent 3 implementation verified!', colors.green);
    console.log('\n');
  } else {
    console.log('\n');
    log(`✗ ${results.failed} TEST(S) FAILED - Review implementation`, colors.red);
    console.log('\n');
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Test suite error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests };
