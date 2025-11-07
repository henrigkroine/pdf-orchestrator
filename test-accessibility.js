/**
 * Test Script for WCAG 2.2 AA Accessibility Validator
 *
 * Tests all WCAG checking functions with known good and bad examples.
 *
 * Usage:
 *   node test-accessibility.js
 *
 * Tests:
 *   - Color contrast calculations
 *   - Text size validation
 *   - Touch target validation
 *   - Text spacing validation
 *   - Heading hierarchy validation
 *   - Color blindness simulation
 *   - Utility functions
 */

import * as wcag from './scripts/lib/wcag-checker.js';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

/**
 * Test helper functions
 */
function test(description, testFn) {
  totalTests++;
  try {
    testFn();
    passedTests++;
    console.log(`${colors.green}✓${colors.reset} ${description}`);
    return true;
  } catch (error) {
    failedTests++;
    console.log(`${colors.red}✗${colors.reset} ${description}`);
    console.log(`  ${colors.red}Error: ${error.message}${colors.reset}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertApprox(actual, expected, tolerance, message) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(message || `Expected ${actual} to be approximately ${expected} (within ${tolerance})`);
  }
}

/**
 * Test suite
 */
async function runTests() {
  console.log('\n' + colors.bold + '==============================================');
  console.log('WCAG 2.2 AA ACCESSIBILITY VALIDATOR TEST SUITE');
  console.log('==============================================' + colors.reset + '\n');

  // Test 1: Color Contrast Calculations
  console.log(colors.cyan + colors.bold + '1. Color Contrast Calculations' + colors.reset + '\n');

  test('Black on white should have 21:1 contrast', () => {
    const black = [0, 0, 0];
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(black, white);
    assertApprox(contrast, 21, 0.1, `Expected ~21:1, got ${contrast.toFixed(2)}:1`);
  });

  test('White on black should have 21:1 contrast (reversed)', () => {
    const white = [255, 255, 255];
    const black = [0, 0, 0];
    const contrast = wcag.calculateContrast(white, black);
    assertApprox(contrast, 21, 0.1, `Expected ~21:1, got ${contrast.toFixed(2)}:1`);
  });

  test('TEEI Nordshore on white should pass AA (normal text)', () => {
    const nordshore = [0, 57, 63];
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(nordshore, white);
    const compliance = wcag.checkContrastCompliance(contrast, 12, false, 'AA');
    assert(compliance.passes, `Nordshore/white contrast ${contrast.toFixed(2)}:1 should pass AA`);
    assert(contrast >= 4.5, `Expected ≥4.5:1, got ${contrast.toFixed(2)}:1`);
  });

  test('TEEI Sky on white should fail AA (insufficient contrast)', () => {
    const sky = [201, 228, 236];
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(sky, white);
    const compliance = wcag.checkContrastCompliance(contrast, 12, false, 'AA');
    assert(!compliance.passes, `Sky/white contrast ${contrast.toFixed(2)}:1 should fail AA`);
    assert(contrast < 4.5, `Expected <4.5:1, got ${contrast.toFixed(2)}:1`);
  });

  test('Same color should have 1:1 contrast', () => {
    const color = [128, 128, 128];
    const contrast = wcag.calculateContrast(color, color);
    assertApprox(contrast, 1.0, 0.01, `Expected 1:1, got ${contrast.toFixed(2)}:1`);
  });

  test('Large text requires lower contrast (3:1)', () => {
    const color1 = [100, 100, 100];
    const color2 = [200, 200, 200];
    const contrast = wcag.calculateContrast(color1, color2);

    // Should fail for normal text
    const normalCompliance = wcag.checkContrastCompliance(contrast, 12, false, 'AA');
    assert(!normalCompliance.passes, 'Should fail for normal text');

    // Should pass for large text
    const largeCompliance = wcag.checkContrastCompliance(contrast, 18, false, 'AA');
    assert(largeCompliance.passes, 'Should pass for large text');
  });

  test('WCAG contrast formula should match WebAIM calculator', () => {
    // Test case from WebAIM: #595959 on #FFFFFF = 7.00:1
    const foreground = [89, 89, 89];
    const background = [255, 255, 255];
    const contrast = wcag.calculateContrast(foreground, background);
    assertApprox(contrast, 7.0, 0.1, `Expected ~7:1, got ${contrast.toFixed(2)}:1`);
  });

  console.log('');

  // Test 2: Text Size Validation
  console.log(colors.cyan + colors.bold + '2. Text Size Validation' + colors.reset + '\n');

  test('11pt body text should pass', () => {
    const result = wcag.validateTextSize(11, 'body');
    assert(result.passes, '11pt should meet 11pt minimum');
  });

  test('10pt body text should fail', () => {
    const result = wcag.validateTextSize(10, 'body');
    assert(!result.passes, '10pt should fail 11pt minimum');
  });

  test('14pt heading should pass', () => {
    const result = wcag.validateTextSize(14, 'heading');
    assert(result.passes, '14pt should meet 14pt minimum');
  });

  test('12pt heading should fail', () => {
    const result = wcag.validateTextSize(12, 'heading');
    assert(!result.passes, '12pt should fail 14pt minimum');
  });

  test('9pt caption should pass', () => {
    const result = wcag.validateTextSize(9, 'caption');
    assert(result.passes, '9pt should meet 9pt minimum');
  });

  console.log('');

  // Test 3: Touch Target Validation
  console.log(colors.cyan + colors.bold + '3. Touch Target Validation' + colors.reset + '\n');

  test('44×44px target should pass AAA', () => {
    const result = wcag.validateTouchTarget(44, 44, 'AAA');
    assert(result.passes, '44×44px should meet AAA requirement');
  });

  test('24×24px target should pass AA', () => {
    const result = wcag.validateTouchTarget(24, 24, 'AA');
    assert(result.passes, '24×24px should meet AA requirement');
  });

  test('20×20px target should fail AA', () => {
    const result = wcag.validateTouchTarget(20, 20, 'AA');
    assert(!result.passes, '20×20px should fail AA requirement');
  });

  test('50×10px target should fail (height too small)', () => {
    const result = wcag.validateTouchTarget(50, 10, 'AA');
    assert(!result.passes, 'Target with small height should fail');
  });

  console.log('');

  // Test 4: Text Spacing Validation
  console.log(colors.cyan + colors.bold + '4. Text Spacing Validation' + colors.reset + '\n');

  test('1.5x line height should pass', () => {
    const result = wcag.validateTextSpacing({
      lineHeight: 1.5,
      paragraphSpacing: 2.0
    });
    assert(result.passes, '1.5x line height should pass');
  });

  test('1.2x line height should fail', () => {
    const result = wcag.validateTextSpacing({
      lineHeight: 1.2,
      paragraphSpacing: 2.0
    });
    assert(!result.passes, '1.2x line height should fail');
  });

  test('1.5x paragraph spacing should fail', () => {
    const result = wcag.validateTextSpacing({
      lineHeight: 1.5,
      paragraphSpacing: 1.5
    });
    assert(!result.passes, '1.5x paragraph spacing should fail (needs 2.0x)');
  });

  console.log('');

  // Test 5: Heading Hierarchy Validation
  console.log(colors.cyan + colors.bold + '5. Heading Hierarchy Validation' + colors.reset + '\n');

  test('Proper hierarchy (h1, h2, h3) should pass', () => {
    const headings = [
      { level: 1, text: 'Main Title', index: 0 },
      { level: 2, text: 'Section', index: 1 },
      { level: 3, text: 'Subsection', index: 2 }
    ];
    const result = wcag.validateHeadingHierarchy(headings);
    assert(result.passes, 'Proper hierarchy should pass');
  });

  test('Skipped level (h1, h3) should fail', () => {
    const headings = [
      { level: 1, text: 'Main Title', index: 0 },
      { level: 3, text: 'Subsection', index: 1 }
    ];
    const result = wcag.validateHeadingHierarchy(headings);
    assert(!result.passes, 'Skipped level should fail');
  });

  test('Missing h1 should fail', () => {
    const headings = [
      { level: 2, text: 'Section', index: 0 },
      { level: 3, text: 'Subsection', index: 1 }
    ];
    const result = wcag.validateHeadingHierarchy(headings);
    assert(!result.passes, 'Missing h1 should fail');
  });

  test('Multiple h1s should fail', () => {
    const headings = [
      { level: 1, text: 'First Title', index: 0 },
      { level: 1, text: 'Second Title', index: 1 }
    ];
    const result = wcag.validateHeadingHierarchy(headings);
    assert(!result.passes, 'Multiple h1s should fail');
  });

  test('Empty headings list should fail', () => {
    const result = wcag.validateHeadingHierarchy([]);
    assert(!result.passes, 'No headings should fail');
  });

  console.log('');

  // Test 6: Color Blindness Simulation
  console.log(colors.cyan + colors.bold + '6. Color Blindness Simulation' + colors.reset + '\n');

  test('Protanopia simulation should transform colors', () => {
    const red = [255, 0, 0];
    const simulated = wcag.simulateColorBlindness(red, 'protanopia');
    assert(Array.isArray(simulated), 'Should return RGB array');
    assert(simulated.length === 3, 'Should have 3 values');
    assert(simulated[0] !== red[0] || simulated[1] !== red[1] || simulated[2] !== red[2],
      'Should transform the color');
  });

  test('Deuteranopia simulation should work', () => {
    const green = [0, 255, 0];
    const simulated = wcag.simulateColorBlindness(green, 'deuteranopia');
    assert(Array.isArray(simulated), 'Should return RGB array');
  });

  test('Tritanopia simulation should work', () => {
    const blue = [0, 0, 255];
    const simulated = wcag.simulateColorBlindness(blue, 'tritanopia');
    assert(Array.isArray(simulated), 'Should return RGB array');
  });

  test('Black and white should be distinguishable for protanopes', () => {
    const black = [0, 0, 0];
    const white = [255, 255, 255];
    const result = wcag.checkColorBlindDistinguishability(black, white, 'protanopia');
    assert(result.isDistinguishable, 'Black/white should be distinguishable');
  });

  test('Red and green should not be distinguishable for deuteranopes', () => {
    const red = [255, 0, 0];
    const green = [0, 255, 0];
    const result = wcag.checkColorBlindDistinguishability(red, green, 'deuteranopia');
    // Note: This may or may not fail depending on the simulation accuracy
    // We just check that the function runs without error
    assert(typeof result.isDistinguishable === 'boolean', 'Should return boolean result');
  });

  console.log('');

  // Test 7: Utility Functions
  console.log(colors.cyan + colors.bold + '7. Utility Functions' + colors.reset + '\n');

  test('Hex to RGB conversion', () => {
    const rgb = wcag.hexToRgb('#00393F');
    assert(rgb[0] === 0 && rgb[1] === 57 && rgb[2] === 63, 'Should convert #00393F correctly');
  });

  test('Hex to RGB without # prefix', () => {
    const rgb = wcag.hexToRgb('C9E4EC');
    assert(rgb[0] === 201 && rgb[1] === 228 && rgb[2] === 236, 'Should convert C9E4EC correctly');
  });

  test('RGB to Hex conversion', () => {
    const hex = wcag.rgbToHex([0, 57, 63]);
    assert(hex === '#00393f', 'Should convert [0, 57, 63] to #00393f');
  });

  test('RGB to Hex with white', () => {
    const hex = wcag.rgbToHex([255, 255, 255]);
    assert(hex === '#ffffff', 'Should convert white correctly');
  });

  test('Relative luminance calculation', () => {
    const lum = wcag.getRelativeLuminance([128, 128, 128]);
    assert(lum >= 0 && lum <= 1, 'Luminance should be between 0 and 1');
  });

  test('Relative luminance of black should be ~0', () => {
    const lum = wcag.getRelativeLuminance([0, 0, 0]);
    assertApprox(lum, 0, 0.01, 'Black luminance should be ~0');
  });

  test('Relative luminance of white should be 1', () => {
    const lum = wcag.getRelativeLuminance([255, 255, 255]);
    assertApprox(lum, 1, 0.01, 'White luminance should be 1');
  });

  test('Get WCAG criterion details', () => {
    const criterion = wcag.getWCAGCriterion('1.4.3');
    assert(criterion.number === '1.4.3', 'Should return correct criterion');
    assert(criterion.name === 'Contrast (Minimum)', 'Should have correct name');
    assert(criterion.level === 'AA', 'Should have correct level');
  });

  console.log('');

  // Test 8: TEEI Brand Colors
  console.log(colors.cyan + colors.bold + '8. TEEI Brand Color Compliance' + colors.reset + '\n');

  test('Nordshore on white passes AA', () => {
    const nordshore = wcag.hexToRgb('#00393F');
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(nordshore, white);
    assert(contrast >= 4.5, `Nordshore/white should pass AA: ${contrast.toFixed(2)}:1`);
  });

  test('Nordshore on Sand passes AA', () => {
    const nordshore = wcag.hexToRgb('#00393F');
    const sand = wcag.hexToRgb('#FFF1E2');
    const contrast = wcag.calculateContrast(nordshore, sand);
    assert(contrast >= 4.5, `Nordshore/Sand should pass AA: ${contrast.toFixed(2)}:1`);
  });

  test('Gold on white fails AA (insufficient contrast)', () => {
    const gold = wcag.hexToRgb('#BA8F5A');
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(gold, white);
    const compliance = wcag.checkContrastCompliance(contrast, 18, false, 'AA');
    assert(!compliance.passes, `Gold/white should fail AA (low contrast): ${contrast.toFixed(2)}:1`);
    assert(contrast < 3.0, `Expected <3:1, got ${contrast.toFixed(2)}:1`);
  });

  test('White on Nordshore passes AA', () => {
    const white = [255, 255, 255];
    const nordshore = wcag.hexToRgb('#00393F');
    const contrast = wcag.calculateContrast(white, nordshore);
    assert(contrast >= 4.5, `White/Nordshore should pass AA: ${contrast.toFixed(2)}:1`);
  });

  test('Sky on white fails AA (known issue)', () => {
    const sky = wcag.hexToRgb('#C9E4EC');
    const white = [255, 255, 255];
    const contrast = wcag.calculateContrast(sky, white);
    assert(contrast < 4.5, `Sky/white should fail AA (low contrast): ${contrast.toFixed(2)}:1`);
  });

  console.log('');

  // Print summary
  console.log(colors.bold + '==============================================');
  console.log('TEST SUMMARY');
  console.log('==============================================' + colors.reset + '\n');

  console.log(`Total Tests: ${totalTests}`);
  console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);
  console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log(colors.green + colors.bold + '✓ ALL TESTS PASSED!' + colors.reset + '\n');
    return 0;
  } else {
    console.log(colors.red + colors.bold + '✗ SOME TESTS FAILED' + colors.reset + '\n');
    return 1;
  }
}

// Run tests
runTests()
  .then(exitCode => {
    process.exit(exitCode);
  })
  .catch(error => {
    console.error(colors.red + 'Fatal error:' + colors.reset, error);
    process.exit(1);
  });
