/**
 * TEEI Color Intelligence System - Practical Examples
 *
 * Demonstrates real-world usage of the color intelligence system
 * for various TEEI document automation scenarios.
 */

const colorIntelligence = require('../color-intelligence.js');

console.log('\n' + '='.repeat(80));
console.log('TEEI COLOR INTELLIGENCE SYSTEM - PRACTICAL EXAMPLES');
console.log('='.repeat(80) + '\n');

// ============================================================================
// EXAMPLE 1: Creating a Partnership Document
// ============================================================================

console.log('EXAMPLE 1: Creating AWS Partnership Document');
console.log('-'.repeat(80));

// Get the complete color scheme for partnership documents
const partnershipScheme = colorIntelligence.getDocumentScheme('partnership_document');
console.log(`\nDocument Type: ${partnershipScheme.name}`);
console.log(`Description: ${partnershipScheme.description}`);
console.log(`Primary Color: ${partnershipScheme.primary_color.toUpperCase()}`);

// Apply color scheme to document elements
const partnershipElements = colorIntelligence.applyColorScheme('partnership_document', {
  header: { title: 'TEEI × AWS Partnership' },
  hero: { heading: 'Empowering Ukrainian Students' },
  metrics: { items: ['50,000+ Students', '12 Programs', '95% Success Rate'] },
  cta: { text: 'Partner With TEEI', link: '/contact' },
  footer: { copyright: '© 2025 TEEI' }
});

console.log('\n📋 Applied Color Scheme:');
console.log('Header:');
console.log(`  Background: ${partnershipElements.header.backgroundColor} (Nordshore)`);
console.log(`  Text: ${partnershipElements.header.textColor} (White)`);
console.log(`  Accent: ${partnershipElements.header.accentColor} (Gold)`);

console.log('\nMetrics Cards:');
partnershipElements.metrics.cardBackgrounds.forEach((color, i) => {
  console.log(`  Card ${i + 1}: ${color}`);
});

console.log('\nCall-to-Action:');
console.log(`  Background: ${partnershipElements.cta.backgroundColor} (Gold)`);
console.log(`  Button BG: ${partnershipElements.cta.button.backgroundColor} (Nordshore)`);
console.log(`  Button Text: ${partnershipElements.cta.button.textColor} (White)`);

// ============================================================================
// EXAMPLE 2: Validating Colors from External Source
// ============================================================================

console.log('\n\nEXAMPLE 2: Validating Colors from External Design');
console.log('-'.repeat(80));

// Simulate colors from an external design file
const externalColors = [
  '#00393F', // Nordshore - VALID
  '#C9E4EC', // Sky - VALID
  '#BA8F5A', // Gold - VALID
  '#C87137', // Copper/Orange - FORBIDDEN!
  '#FF6B35', // Another orange - FORBIDDEN!
  '#FFFFFF', // White - VALID
  '#A1B2C3'  // Unknown color
];

console.log('\nValidating colors from external design...\n');

const validationReport = {
  valid: [],
  forbidden: [],
  unknown: []
};

externalColors.forEach(color => {
  const validation = colorIntelligence.validateColor(color);

  console.log(`${color} → ${validation.message}`);

  if (validation.valid) {
    validationReport.valid.push(color);
  } else if (validation.type === 'forbidden') {
    validationReport.forbidden.push(color);
    console.log(`   ⚠️  Exception: ${validation.exception}`);
  } else if (validation.type === 'unknown') {
    validationReport.unknown.push(color);
    console.log(`   💡 Suggestion: ${validation.suggestion.message}`);
  }
});

console.log(`\n📊 Validation Summary:`);
console.log(`   ✅ Valid: ${validationReport.valid.length}`);
console.log(`   ❌ Forbidden: ${validationReport.forbidden.length}`);
console.log(`   ⚠️  Unknown: ${validationReport.unknown.length}`);

// ============================================================================
// EXAMPLE 3: Accessibility Checking
// ============================================================================

console.log('\n\nEXAMPLE 3: Accessibility Validation (WCAG AA/AAA)');
console.log('-'.repeat(80));

// Test various text/background combinations
const combinations = [
  { text: 'nordshore', bg: 'white', size: 'normal' },
  { text: 'white', bg: 'nordshore', size: 'normal' },
  { text: 'gold', bg: 'white', size: 'normal' },
  { text: 'gold', bg: 'white', size: 'large' },
  { text: 'moss', bg: 'sand', size: 'normal' },
  { text: 'black', bg: 'sky', size: 'normal' }
];

console.log('\nTesting contrast ratios:\n');

combinations.forEach(combo => {
  const check = colorIntelligence.validateAccessibility(
    combo.text,
    combo.bg,
    combo.size
  );

  const status = check.passes ? '✅ PASS' : '❌ FAIL';
  const wcagBadge = check.wcag_level === 'AAA' ? '🏆 AAA' :
                    check.wcag_level === 'AA' ? '✓ AA' : '✗ Fail';

  console.log(`${status} ${wcagBadge} | ${combo.text.toUpperCase()} on ${combo.bg.toUpperCase()} (${combo.size})`);
  console.log(`   Contrast: ${check.contrast}:1 (required: ${check.required}:1)`);
  console.log(`   ${check.recommendation}\n`);
});

// ============================================================================
// EXAMPLE 4: Generating Color Palettes
// ============================================================================

console.log('\nEXAMPLE 4: Generating Complete Color Palette');
console.log('-'.repeat(80));

// Generate palette for impact report
const impactPalette = colorIntelligence.generatePalette('impact_report');

console.log(`\nPalette: ${impactPalette.name}`);
console.log(`Description: ${impactPalette.description}\n`);

console.log('Primary Color:');
console.log(`  ${impactPalette.primary.name}: ${impactPalette.primary.hex}`);
console.log(`  RGB: (${impactPalette.primary.rgb.r}, ${impactPalette.primary.rgb.g}, ${impactPalette.primary.rgb.b})`);
console.log(`  CMYK: (${impactPalette.primary.cmyk.c}%, ${impactPalette.primary.cmyk.m}%, ${impactPalette.primary.cmyk.y}%, ${impactPalette.primary.cmyk.k}%)`);

console.log('\nSecondary Colors:');
impactPalette.secondary.forEach(color => {
  console.log(`  ${color.name}: ${color.hex} (${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`);
});

console.log('\nRecommended Usage Distribution:');
Object.entries(impactPalette.usageDistribution).forEach(([color, pct]) => {
  const bar = '█'.repeat(Math.round(pct * 50));
  console.log(`  ${color.padEnd(12)} ${(pct * 100).toFixed(0).padStart(3)}% ${bar}`);
});

// ============================================================================
// EXAMPLE 5: Image Overlays
// ============================================================================

console.log('\n\nEXAMPLE 5: Generating Image Overlays');
console.log('-'.repeat(80));

const darkOverlay = colorIntelligence.generateOverlay('dark_overlay');
console.log('\n🌑 Dark Overlay (for white text on photos):');
console.log(`  Color: ${darkOverlay.color} (${darkOverlay.hexColor})`);
console.log(`  Opacity: ${darkOverlay.opacity_range[0]} - ${darkOverlay.opacity_range[1]}`);
console.log(`  Blend Mode: ${darkOverlay.blend_mode}`);
console.log(`  CSS: background: ${darkOverlay.rgbaColor};`);
console.log(`  Use Case: ${darkOverlay.use_case}`);

const lightOverlay = colorIntelligence.generateOverlay('light_overlay');
console.log('\n☀️  Light Overlay (for dark text on bright photos):');
console.log(`  Color: ${lightOverlay.color} (${lightOverlay.hexColor})`);
console.log(`  Opacity: ${lightOverlay.opacity_range[0]} - ${lightOverlay.opacity_range[1]}`);
console.log(`  Use Case: ${lightOverlay.use_case}`);

const gradientOverlay = colorIntelligence.generateOverlay('gradient_overlay');
console.log('\n🎨 Gradient Overlay (for hero images):');
console.log(`  Colors: ${gradientOverlay.hexColors.join(' → ')}`);
console.log(`  Direction: ${gradientOverlay.direction}`);
console.log(`  Opacity: ${gradientOverlay.opacity}`);

// ============================================================================
// EXAMPLE 6: Color Harmonies
// ============================================================================

console.log('\n\nEXAMPLE 6: Color Harmony Relationships');
console.log('-'.repeat(80));

const baseColor = 'nordshore';
console.log(`\nBase Color: ${baseColor.toUpperCase()} (${colorIntelligence.getHex(baseColor)})\n`);

const complementary = colorIntelligence.getComplementaryColors(baseColor);
console.log(`🎯 Complementary Colors (opposite on color wheel):`);
complementary.forEach(color => {
  console.log(`   ${color}: ${colorIntelligence.getHex(color)} - High contrast, vibrant`);
});

const analogous = colorIntelligence.getAnalogousColors(baseColor);
console.log(`\n🌈 Analogous Colors (adjacent on color wheel):`);
analogous.forEach(color => {
  console.log(`   ${color}: ${colorIntelligence.getHex(color)} - Harmonious, serene`);
});

const triadic = colorIntelligence.getTriadicColors(baseColor);
console.log(`\n△ Triadic Colors (evenly spaced on color wheel):`);
triadic.forEach(color => {
  console.log(`   ${color}: ${colorIntelligence.getHex(color)} - Balanced, vibrant`);
});

// ============================================================================
// EXAMPLE 7: Export Formats
// ============================================================================

console.log('\n\nEXAMPLE 7: Exporting Color Schemes');
console.log('-'.repeat(80));

// Export CSS Variables
console.log('\n📄 CSS Variables (first 10 lines):');
const css = colorIntelligence.exportCSSVariables('partnership_document');
const cssLines = css.split('\n').slice(0, 10);
cssLines.forEach(line => console.log(`   ${line}`));
console.log('   ...');

// Export InDesign Swatches
console.log('\n📐 InDesign Swatches (first 8 lines):');
const swatches = colorIntelligence.exportInDesignSwatches('partnership_document');
const swatchLines = swatches.split('\n').slice(0, 8);
swatchLines.forEach(line => console.log(`   ${line}`));
console.log('   ...');

// ============================================================================
// EXAMPLE 8: Color Psychology & Recommendations
// ============================================================================

console.log('\n\nEXAMPLE 8: Color Psychology & Usage Recommendations');
console.log('-'.repeat(80));

const colors = ['nordshore', 'moss', 'gold', 'clay'];

colors.forEach(colorName => {
  const rec = colorIntelligence.getColorUsageRecommendations(colorName);

  console.log(`\n🎨 ${rec.name.toUpperCase()} (${rec.hex})`);

  if (rec.psychology) {
    console.log(`   Emotions: ${rec.psychology.emotions.join(', ')}`);
    console.log(`   Associations: ${rec.psychology.associations.join(', ')}`);
    console.log(`   Best For: ${rec.psychology.best_for.join(', ')}`);
  }

  console.log(`   Recommended Usage: ${rec.recommendedPercentage}% of document`);
  console.log(`   Pairs Well With: ${rec.pairsWith.join(', ')}`);
  console.log(`   Use Cases: ${rec.usage.join(', ')}`);
});

// ============================================================================
// EXAMPLE 9: Safe Text Color Selection
// ============================================================================

console.log('\n\nEXAMPLE 9: Automatic Safe Text Color Selection');
console.log('-'.repeat(80));

const backgrounds = ['nordshore', 'sky', 'sand', 'white', 'moss', 'gold'];

console.log('\nAuto-selecting highest contrast text colors:\n');

backgrounds.forEach(bg => {
  const safeText = colorIntelligence.getSafeTextColor(bg);
  const contrast = colorIntelligence.getContrastRatio(safeText, bg);

  console.log(`Background: ${bg.padEnd(10)} → Safe Text: ${safeText.padEnd(10)} (${contrast.ratio}:1 contrast)`);
});

// ============================================================================
// EXAMPLE 10: Complete Document Color Audit
// ============================================================================

console.log('\n\nEXAMPLE 10: Complete Document Color Audit');
console.log('-'.repeat(80));

// Simulate colors found in a document
const documentColors = [
  '#00393F', // Nordshore - Good!
  '#00393F', // Nordshore again
  '#00393F', // Nordshore (40% usage)
  '#C9E4EC', // Sky - Good!
  '#BA8F5A', // Gold - Good!
  '#FFFFFF', // White - Good!
  '#FFF1E2', // Sand - Good!
  '#C87137', // Copper - FORBIDDEN!
  '#65873B', // Moss - Good!
  '#000000'  // Black - Good!
];

console.log(`\nAuditing ${documentColors.length} colors found in document...\n`);

const audit = colorIntelligence.validateDocumentColors(documentColors);

console.log(`📊 Audit Results:`);
console.log(`   Total Colors: ${audit.totalColors}`);
console.log(`   ✅ Valid: ${audit.validColors.length}`);
console.log(`   ❌ Invalid: ${audit.invalidColors.length}`);
console.log(`   🚫 Forbidden: ${audit.forbiddenColors.length}`);
console.log(`   Overall: ${audit.passes ? '✅ PASS' : '❌ FAIL'}\n`);

if (audit.forbiddenColors.length > 0) {
  console.log('🚫 Forbidden Colors Detected:');
  audit.forbiddenColors.forEach(item => {
    console.log(`   ${item.hex} - ${item.message}`);
  });
}

if (audit.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  audit.warnings.forEach(warning => {
    console.log(`   ${warning}`);
  });
}

// ============================================================================
// EXAMPLE 11: Practical InDesign Integration
// ============================================================================

console.log('\n\nEXAMPLE 11: InDesign Integration Example');
console.log('-'.repeat(80));

// Generate color scheme for InDesign automation
const indesignScheme = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  hero: {},
  metrics: {},
  cta: {}
});

console.log('\n📐 InDesign Automation Color Commands:');
console.log('\n// Header Section');
console.log(`setBackgroundColor("header", rgb(${colorIntelligence.getRGB('nordshore').r}, ${colorIntelligence.getRGB('nordshore').g}, ${colorIntelligence.getRGB('nordshore').b}));`);
console.log(`setTextColor("header-title", rgb(${colorIntelligence.getRGB('white').r}, ${colorIntelligence.getRGB('white').g}, ${colorIntelligence.getRGB('white').b}));`);

console.log('\n// Metrics Cards (with different colored backgrounds)');
indesignScheme.metrics.cardBackgrounds.forEach((hex, i) => {
  // Convert hex to RGB for InDesign
  const rgb = colorIntelligence.hexToRGB(hex);
  console.log(`setCardColor("metric-${i + 1}", rgb(${rgb.r}, ${rgb.g}, ${rgb.b}));`);
});

console.log('\n// Image Overlay');
const overlay = colorIntelligence.generateOverlay('dark_overlay');
const overlayRGB = colorIntelligence.getRGB(overlay.color);
console.log(`applyImageOverlay("hero-image", rgba(${overlayRGB.r}, ${overlayRGB.g}, ${overlayRGB.b}, ${overlay.opacity_range[0]}));`);

// ============================================================================
// Summary
// ============================================================================

console.log('\n\n' + '='.repeat(80));
console.log('🎉 EXAMPLES COMPLETE');
console.log('='.repeat(80));

console.log('\nKey Takeaways:');
console.log('  ✅ Use document schemes for automatic color selection');
console.log('  ✅ Always validate colors before applying');
console.log('  ✅ Check accessibility (WCAG AA/AAA)');
console.log('  ✅ Follow recommended usage distributions');
console.log('  ✅ Use color harmonies for visual interest');
console.log('  ✅ Apply overlays at 40-60% opacity for images');
console.log('  ✅ Export to CSS/InDesign for automation');

console.log('\n💡 Next Steps:');
console.log('  1. Choose document type: partnership_document, program_overview, impact_report, executive_summary');
console.log('  2. Generate palette: colorIntelligence.generatePalette(documentType)');
console.log('  3. Apply scheme: colorIntelligence.applyColorScheme(documentType, elements)');
console.log('  4. Validate result: colorIntelligence.validateDocumentColors(usedColors)');
console.log('  5. Export: colorIntelligence.exportCSSVariables() or exportInDesignSwatches()');

console.log('\n📚 Documentation: See COLOR-INTELLIGENCE-README.md');
console.log('');
