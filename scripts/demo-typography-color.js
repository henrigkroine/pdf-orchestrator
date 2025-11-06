#!/usr/bin/env node

/**
 * Typography & Color System Demo
 *
 * Demonstrates all capabilities without requiring API keys
 */

const TypographyOptimizer = require('./lib/typography-optimizer');
const AdvancedKerning = require('./lib/advanced-kerning');
const ColorTheoryEngine = require('./lib/color-theory-engine');
const ColorAccessibility = require('./lib/color-accessibility');
const GradientGenerator = require('./lib/gradient-generator');
const fs = require('fs').promises;

async function demo() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║  Typography & Color Harmony System - Demonstration            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // 1. Typography Demo
  console.log('1️⃣  TYPOGRAPHY SYSTEM\n');
  console.log('═'.repeat(70));

  const typography = new TypographyOptimizer({ scale: 1.250, baseSize: 16 });

  console.log('\n📏 Type Scale (Major Third: 1.250)\n');
  const typeScale = typography.generateTypeScale();

  Object.entries(typeScale.sizes).forEach(([name, size]) => {
    const bar = '█'.repeat(Math.round(size.px / 3));
    console.log(`${name.padEnd(10)} ${size.px}px  ${size.pt}pt  (${size.em}rem)  ${bar}`);
    console.log(`           LH: ${size.lineHeight}  LS: ${size.letterSpacing}em`);
    console.log(`           ${size.usage}`);
    console.log('');
  });

  // 2. Kerning Demo
  console.log('\n═'.repeat(70));
  console.log('\n🔤 Advanced Kerning Analysis\n');

  const kerning = new AdvancedKerning();
  const text = 'The Educational Equality Institute';
  const analysis = kerning.analyzeText(text, 16);

  console.log(`Text: "${text}"`);
  console.log(`\nKerning Pairs Found: ${analysis.totalPairs}`);
  console.log(`Ligatures Found: ${analysis.ligatures.length}`);
  console.log(`Optical Size: ${analysis.opticalSize}`);

  if (analysis.recommendations.length > 0) {
    console.log('\nHigh Priority Adjustments:');
    analysis.recommendations.slice(0, 3).forEach(rec => {
      console.log(`  ${rec.pair.padEnd(4)} Position ${rec.position}: ${rec.kerning} (${rec.priority})`);
    });
  }

  if (analysis.ligatures.length > 0) {
    console.log('\nLigatures:');
    analysis.ligatures.forEach(lig => {
      console.log(`  "${lig.ligature}" at position ${lig.position} (${lig.type})`);
    });
  }

  // 3. Color Theory Demo
  console.log('\n═'.repeat(70));
  console.log('\n🎨 COLOR HARMONY SYSTEM\n');
  console.log('═'.repeat(70));

  const colorEngine = new ColorTheoryEngine();

  console.log('\n🌈 TEEI Brand Colors\n');

  const nordshore = '#00393F';
  const hsl = colorEngine.hexToHSL(nordshore);

  console.log('PRIMARY: Nordshore');
  console.log(`  Hex: ${nordshore}`);
  console.log(`  HSL: h${hsl.h}° s${hsl.s}% l${hsl.l}%`);

  // Generate split-complementary palette
  const theory = colorEngine.generateSplitComplementary(hsl);

  console.log('\nSplit-Complementary Palette:');
  console.log(`  Primary:   ${colorEngine.hslToHex(theory.primary)}`);
  console.log(`  Secondary: ${colorEngine.hslToHex(theory.secondary)}`);
  console.log(`  Accent:    ${colorEngine.hslToHex(theory.accent)}`);

  // 4. Accessibility Demo
  console.log('\n═'.repeat(70));
  console.log('\n♿ ACCESSIBILITY TESTING\n');

  const accessibility = new ColorAccessibility();

  const teeiColors = [nordshore, '#C9E4EC', '#BA8F5A'];

  console.log('Testing TEEI Brand Colors:\n');

  teeiColors.forEach(color => {
    const contrast = accessibility.checkContrast(color, '#FFFFFF');
    console.log(`${color}:`);
    console.log(`  Contrast on white: ${contrast.ratio.toFixed(2)}:1`);
    console.log(`  WCAG AA: ${contrast.aa.normalText ? '✓' : '✗'}`);
    console.log(`  Grade: ${contrast.grade}`);
    console.log('');
  });

  // Test color blindness
  console.log('Color Blindness Simulation:\n');

  const types = ['protanopia', 'deuteranopia', 'tritanopia'];

  types.forEach(type => {
    console.log(`${type}:`);
    const simulated = accessibility.simulateColorBlindness(nordshore, type);
    console.log(`  ${nordshore} → ${simulated}`);
    console.log('');
  });

  // 5. Gradient Demo
  console.log('═'.repeat(70));
  console.log('\n🌈 GRADIENT GENERATION\n');

  const gradients = new GradientGenerator();

  const teeiGradient = gradients.generateLinear(
    ['#00393F', '#65873B', '#BA8F5A'],
    135,
    'easeInOutQuad'
  );

  console.log('TEEI Brand Gradient:');
  console.log(`  Type: ${teeiGradient.type}`);
  console.log(`  Angle: ${teeiGradient.angle}°`);
  console.log(`  CSS: ${teeiGradient.css}`);
  console.log('');

  console.log('Stops:');
  teeiGradient.stops.forEach(stop => {
    console.log(`  ${stop.position}%: ${stop.color}`);
  });

  // 6. Extended Palette Demo
  console.log('\n═'.repeat(70));
  console.log('\n🎨 EXTENDED PALETTE (Tints & Shades)\n');

  const extended = colorEngine.generateExtendedPalette({
    primary: hsl
  });

  console.log('Nordshore Variations:\n');

  console.log('Tints (Lighter):');
  extended.primary.tints.slice(0, 3).forEach(tint => {
    console.log(`  ${tint.hex} (Level ${tint.level})`);
  });

  console.log('\nShades (Darker):');
  extended.primary.shades.slice(0, 3).forEach(shade => {
    console.log(`  ${shade.hex} (Level ${shade.level})`);
  });

  console.log('\nTones (Grayed):');
  extended.primary.tones.slice(0, 3).forEach(tone => {
    console.log(`  ${tone.hex} (Level ${tone.level})`);
  });

  // 7. Save Examples
  console.log('\n═'.repeat(70));
  console.log('\n💾 SAVING EXAMPLES\n');

  const examples = {
    typography: {
      typeScale: typeScale,
      kerningAnalysis: analysis,
      metadata: {
        scale: 1.250,
        scaleName: 'Major Third',
        baseSize: 16,
        generatedAt: new Date().toISOString()
      }
    },
    colors: {
      teei: {
        nordshore: nordshore,
        hsl: hsl,
        theory: 'Split-Complementary',
        palette: {
          primary: colorEngine.hslToHex(theory.primary),
          secondary: colorEngine.hslToHex(theory.secondary),
          accent: colorEngine.hslToHex(theory.accent)
        }
      },
      extended: extended.primary,
      accessibility: teeiColors.map(color => ({
        color: color,
        contrast: accessibility.checkContrast(color, '#FFFFFF')
      }))
    },
    gradients: {
      teei: teeiGradient,
      presets: gradients.getPresets()
    }
  };

  try {
    await fs.mkdir('config', { recursive: true });
    await fs.writeFile(
      'config/typography-color-examples.json',
      JSON.stringify(examples, null, 2)
    );
    console.log('✅ Examples saved to: config/typography-color-examples.json');
  } catch (error) {
    console.log(`⚠️  Could not save examples: ${error.message}`);
  }

  // 8. Summary
  console.log('\n═'.repeat(70));
  console.log('\n📊 SYSTEM SUMMARY\n');

  console.log('Typography System:');
  console.log(`  ✓ Type scales: 8 ratios available`);
  console.log(`  ✓ Kerning pairs: 100+ character combinations`);
  console.log(`  ✓ Line height optimization: Golden ratio (1.618)`);
  console.log(`  ✓ Font pairing: AI-powered recommendations`);
  console.log('');

  console.log('Color System:');
  console.log(`  ✓ Color theories: 6 algorithms`);
  console.log(`  ✓ Extended palettes: Tints, shades, tones`);
  console.log(`  ✓ Accessibility: WCAG AA/AAA validation`);
  console.log(`  ✓ Color blindness: 8 types tested`);
  console.log(`  ✓ Gradients: Linear, radial, conic`);
  console.log('');

  console.log('Export Formats:');
  console.log(`  ✓ CSS custom properties`);
  console.log(`  ✓ SCSS variables`);
  console.log(`  ✓ JSON configuration`);
  console.log(`  ✓ InDesign paragraph styles`);
  console.log(`  ✓ Adobe Swatch Exchange (ASE)`);
  console.log('');

  console.log('═'.repeat(70));
  console.log('\n🎉 DEMONSTRATION COMPLETE!\n');
  console.log('Next Steps:');
  console.log('  1. Review examples in: config/typography-color-examples.json');
  console.log('  2. Generate your own: node scripts/apply-typography.js');
  console.log('  3. Create palettes: node scripts/generate-color-palettes.js');
  console.log('  4. Read docs: docs/TYPOGRAPHY-COLOR-GUIDE.md');
  console.log('');
}

// Run demo
if (require.main === module) {
  demo().catch(error => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

module.exports = demo;
