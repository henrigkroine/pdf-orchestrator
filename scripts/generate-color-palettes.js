#!/usr/bin/env node

/**
 * Color Palette Generator CLI
 *
 * Generate stunning color palettes using:
 * - Color theory (complementary, split-complementary, triadic, etc.)
 * - AI refinement for emotional impact
 * - WCAG accessibility validation
 * - Color blindness testing
 *
 * Usage:
 *   node generate-color-palettes.js [options]
 *
 * Options:
 *   --base <color>        Base color in hex (default: #00393F - TEEI Nordshore)
 *   --theory <name>       Color theory: complementary, splitComplementary, triadic, etc.
 *   --mood <description>  Desired mood (default: "warm, empowering")
 *   --export <format>     Export format: json, css, scss, ase
 *   --test-accessibility  Test color blindness and WCAG compliance
 */

const ColorTheoryEngine = require('./lib/color-theory-engine');
const ColorAccessibility = require('./lib/color-accessibility');
const GradientGenerator = require('./lib/gradient-generator');
const fs = require('fs').promises;
const path = require('path');

class ColorPaletteCLI {
  constructor() {
    this.engine = new ColorTheoryEngine();
    this.accessibility = new ColorAccessibility();
    this.gradients = new GradientGenerator();
  }

  async run(args) {
    const options = this.parseArgs(args);

    console.log('🎨 Color Palette Generator\n');

    if (options.help) {
      this.showHelp();
      return;
    }

    if (options.teei) {
      await this.generateTEEIPalette(options);
    } else if (options.testAccessibility) {
      await this.testAccessibility(options);
    } else if (options.gradients) {
      await this.generateGradients(options);
    } else if (options.compare) {
      await this.compareTheories(options);
    } else {
      await this.generatePalette(options);
    }
  }

  parseArgs(args) {
    const options = {
      base: '#00393F',  // TEEI Nordshore
      theory: 'splitComplementary',
      mood: 'warm, empowering, hopeful',
      export: 'json',
      output: 'config/color-palette.json'
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--base':
          options.base = args[++i];
          break;
        case '--theory':
          options.theory = args[++i];
          break;
        case '--mood':
          options.mood = args[++i];
          break;
        case '--export':
          options.export = args[++i];
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--test-accessibility':
          options.testAccessibility = true;
          break;
        case '--teei':
          options.teei = true;
          break;
        case '--gradients':
          options.gradients = true;
          break;
        case '--compare':
          options.compare = true;
          break;
        case '--help':
        case '-h':
          options.help = true;
          break;
      }
    }

    return options;
  }

  showHelp() {
    console.log(`
Color Palette Generator CLI

USAGE:
  node generate-color-palettes.js [options]

OPTIONS:
  --base <color>           Base color in hex (default: #00393F - TEEI Nordshore)

  --theory <name>          Color theory to use:
                          - complementary (opposite on color wheel)
                          - splitComplementary (base + two adjacent to complement)
                          - triadic (three equally spaced)
                          - tetradic (four colors - two pairs)
                          - analogous (adjacent colors)
                          - monochromatic (variations of one hue)
                          Default: splitComplementary

  --mood <description>     Desired mood (default: "warm, empowering")

  --test-accessibility     Test color blindness and WCAG compliance

  --teei                   Generate TEEI brand palette

  --gradients              Generate gradient variations

  --compare                Compare all color theories side-by-side

  --export <format>        Export format: json, css, scss, ase (default: json)

  --output, -o <file>      Output file path

  --help, -h               Show this help message

EXAMPLES:
  # Generate TEEI brand palette
  node generate-color-palettes.js --teei

  # Generate with custom base color
  node generate-color-palettes.js --base "#FF5733" --theory triadic

  # Test accessibility
  node generate-color-palettes.js --test-accessibility

  # Generate gradients
  node generate-color-palettes.js --gradients

  # Compare all theories
  node generate-color-palettes.js --compare

  # Export as CSS
  node generate-color-palettes.js --export css --output styles/colors.css

COLOR THEORIES:
  complementary      - High contrast, vibrant
  splitComplementary - Harmonious, warm (recommended for TEEI)
  triadic            - Balanced, dynamic
  tetradic           - Rich, complex
  analogous          - Peaceful, harmonious
  monochromatic      - Elegant, sophisticated
    `);
  }

  async generatePalette(options) {
    console.log(`🎨 Generating Palette\n`);
    console.log(`   Base Color: ${options.base}`);
    console.log(`   Theory: ${options.theory}`);
    console.log(`   Mood: ${options.mood}\n`);

    console.log('Applying color theory...');
    console.log('Consulting AI for emotional refinement...\n');

    const palette = await this.engine.generateStunningPalette(
      options.base,
      options.mood,
      options.theory
    );

    this.displayPalette(palette);

    // Export
    await this.exportPalette(palette, options);

    console.log(`\n✅ Palette generated successfully!`);
  }

  async generateTEEIPalette(options) {
    console.log(`🎨 Generating TEEI Brand Palette\n`);

    console.log('Using TEEI brand colors:');
    console.log(`   Nordshore: #00393F (primary)`);
    console.log(`   Sky: #C9E4EC (secondary)`);
    console.log(`   Sand: #FFF1E2 (neutral)`);
    console.log(`   Gold: #BA8F5A (accent)\n`);

    const palette = await this.engine.generateTEEIPalette();

    this.displayPalette(palette);

    // Test accessibility
    console.log('\n📊 Accessibility Testing\n');
    const accessibilityReport = this.accessibility.generateReport(
      [
        palette.primary.base,
        palette.secondary.base,
        palette.accent.base
      ]
    );

    this.displayAccessibility(accessibilityReport);

    // Export
    await this.exportPalette(palette, options);

    console.log(`\n✅ TEEI palette generated and validated!`);
  }

  displayPalette(palette) {
    console.log('Generated Palette:');
    console.log('═'.repeat(80));

    // Display base colors
    ['primary', 'secondary', 'accent'].forEach(name => {
      if (palette[name]) {
        const color = palette[name];
        console.log(`\n${name.toUpperCase()}: ${color.base}`);
        console.log(`  HSL: h${color.hsl.h} s${color.hsl.s} l${color.hsl.l}`);

        if (color.contrast) {
          console.log(`  Contrast on white: ${color.contrast.onWhite.toFixed(2)}:1`);
          console.log(`  Contrast on black: ${color.contrast.onBlack.toFixed(2)}:1`);
          console.log(`  WCAG AA: ${color.contrast.wcagAA ? '✓' : '✗'}`);
          console.log(`  WCAG AAA: ${color.contrast.wcagAAA ? '✓' : '✗'}`);
        }

        // Show tints
        console.log(`  Tints: ${color.tints.slice(0, 3).map(t => t.hex).join('  ')}`);

        // Show shades
        console.log(`  Shades: ${color.shades.slice(0, 3).map(s => s.hex).join('  ')}`);
      }
    });

    console.log('\n');

    // Display usage guide
    if (palette.usage) {
      console.log('Usage Guide:');
      console.log('─'.repeat(80));

      console.log('\nBackgrounds:');
      console.log(`  Light: ${palette.usage.backgrounds.light.color}`);
      console.log(`  Dark: ${palette.usage.backgrounds.dark.color}`);
      console.log(`  Accent: ${palette.usage.backgrounds.accent.color}`);

      console.log('\nText:');
      console.log(`  Primary: ${palette.usage.text.primary.color}`);
      console.log(`  Secondary: ${palette.usage.text.secondary.color}`);
      console.log(`  On Dark: ${palette.usage.text.onDark.color}`);
      console.log(`  Accent: ${palette.usage.text.accent.color}`);

      console.log('\nUI Elements:');
      console.log(`  Primary Button: ${palette.usage.ui.buttons.primary.background}`);
      console.log(`  Links: ${palette.usage.ui.links.default}`);
      console.log(`  Borders: ${palette.usage.ui.borders.default}`);
    }
  }

  displayAccessibility(report) {
    console.log('Accessibility Report:');
    console.log('─'.repeat(80));

    console.log(`WCAG AA: ${report.summary.wcagAA ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`WCAG AAA: ${report.summary.wcagAAA ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Color Blind Safe: ${report.summary.colorBlindSafe ? '✓ PASS' : '✗ FAIL'}`);

    if (report.colorBlindness.issues.length > 0) {
      console.log('\n⚠️  Accessibility Issues:');
      report.colorBlindness.issues.forEach(issue => {
        console.log(`  - ${issue.type}: ${issue.issue}`);
      });
    }

    if (report.suggestions.some(s => s.needed)) {
      console.log('\n💡 Suggested Improvements:');
      report.suggestions.filter(s => s.needed).forEach(sugg => {
        console.log(`  ${sugg.original} → ${sugg.suggested}`);
        console.log(`    Contrast: ${sugg.originalRatio} → ${sugg.newRatio}`);
      });
    }
  }

  async testAccessibility(options) {
    console.log(`🔍 Testing Accessibility\n`);

    // Get base palette
    const palette = await this.engine.generateStunningPalette(
      options.base,
      options.mood,
      options.theory
    );

    const colors = [
      palette.primary.base,
      palette.secondary.base,
      palette.accent.base
    ];

    console.log('Testing colors:');
    colors.forEach(c => console.log(`  ${c}`));
    console.log('');

    // Test accessibility
    const report = this.accessibility.generateReport(colors);

    this.displayAccessibility(report);

    // Test each color blindness type
    console.log('\n🌈 Color Blindness Simulations:\n');

    const types = [
      'protanopia',
      'deuteranopia',
      'tritanopia',
      'protanomaly',
      'deuteranomaly',
      'tritanomaly'
    ];

    types.forEach(type => {
      console.log(`${type}:`);
      colors.forEach((color, i) => {
        const simulated = this.accessibility.simulateColorBlindness(color, type);
        console.log(`  ${color} → ${simulated}`);
      });
      console.log('');
    });

    // Save report
    const outputPath = options.output.replace('.json', '-accessibility.json');
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Accessibility report saved: ${outputPath}`);
  }

  async generateGradients(options) {
    console.log(`🌈 Generating Gradients\n`);

    // Get base palette
    const palette = await this.engine.generateStunningPalette(
      options.base,
      options.mood,
      options.theory
    );

    console.log('Gradient Variations:');
    console.log('═'.repeat(80));

    // Linear gradient
    const linear = this.gradients.createFromPalette(palette, 'linear');
    console.log('\n1. Linear Gradient (135°)');
    console.log(`   CSS: ${linear.css}`);

    // Radial gradient
    const radial = this.gradients.createFromPalette(palette, 'radial');
    console.log('\n2. Radial Gradient');
    console.log(`   CSS: ${radial.css}`);

    // Get presets
    const presets = this.gradients.getPresets();
    console.log('\n3. TEEI Brand Gradient');
    console.log(`   CSS: ${presets.teei.css}`);

    // Export gradients
    const gradientData = {
      linear: linear,
      radial: radial,
      presets: presets
    };

    const outputPath = options.output.replace('.json', '-gradients.json');
    await fs.writeFile(outputPath, JSON.stringify(gradientData, null, 2));
    console.log(`\n✅ Gradients saved: ${outputPath}`);
  }

  async compareTheories(options) {
    console.log(`🎨 Comparing Color Theories\n`);
    console.log(`Base Color: ${options.base}\n`);

    const theories = [
      'complementary',
      'splitComplementary',
      'triadic',
      'tetradic',
      'analogous',
      'monochromatic'
    ];

    const palettes = {};

    for (const theory of theories) {
      console.log(`Generating ${theory}...`);
      palettes[theory] = await this.engine.generateStunningPalette(
        options.base,
        options.mood,
        theory
      );
    }

    console.log('\nComparison:');
    console.log('═'.repeat(80));

    theories.forEach(theory => {
      const p = palettes[theory];
      console.log(`\n${theory}:`);
      console.log(`  Primary: ${p.primary.base}`);
      console.log(`  Secondary: ${p.secondary.base}`);
      if (p.accent) console.log(`  Accent: ${p.accent.base}`);
      console.log(`  WCAG AA: ${p.accessibility.wcagAA ? '✓' : '✗'}`);
    });

    // Save comparison
    const outputPath = options.output.replace('.json', '-comparison.json');
    await fs.writeFile(outputPath, JSON.stringify(palettes, null, 2));
    console.log(`\n✅ Comparison saved: ${outputPath}`);
  }

  async exportPalette(palette, options) {
    const outputDir = path.dirname(options.output);
    await fs.mkdir(outputDir, { recursive: true });

    // Export JSON
    await fs.writeFile(options.output, JSON.stringify(palette, null, 2));
    console.log(`✅ JSON: ${options.output}`);

    // Export CSS
    if (options.export === 'css' || options.export === 'all') {
      const cssPath = options.output.replace('.json', '.css');
      const css = this.engine.exportCSS(palette);
      await fs.writeFile(cssPath, css);
      console.log(`✅ CSS: ${cssPath}`);
    }

    // Export SCSS
    if (options.export === 'scss' || options.export === 'all') {
      const scssPath = options.output.replace('.json', '.scss');
      const scss = this.engine.exportSCSS(palette);
      await fs.writeFile(scssPath, scss);
      console.log(`✅ SCSS: ${scssPath}`);
    }

    // Export ASE metadata
    if (options.export === 'ase' || options.export === 'all') {
      const asePath = options.output.replace('.json', '-ase.json');
      const ase = this.engine.exportASE(palette);
      await fs.writeFile(asePath, JSON.stringify(ase, null, 2));
      console.log(`✅ ASE Metadata: ${asePath}`);
      console.log(`   (Use Adobe Color CC to import into Creative Suite)`);
    }

    // Export README
    const readmePath = path.join(outputDir, 'COLORS-README.md');
    await fs.writeFile(readmePath, this.generateReadme(palette));
    console.log(`✅ Documentation: ${readmePath}`);
  }

  generateReadme(palette) {
    return `# Color Palette

Generated: ${new Date().toISOString()}
Theory: ${palette.theory}
Mood: ${palette.mood}

## Base Colors

${['primary', 'secondary', 'accent'].map(name => {
  if (!palette[name]) return '';
  const color = palette[name];
  return `### ${name.toUpperCase()}
- Hex: ${color.base}
- HSL: h${color.hsl.h} s${color.hsl.s}% l${color.hsl.l}%
- WCAG AA: ${color.contrast?.wcagAA ? 'Yes' : 'No'}
- Contrast on white: ${color.contrast?.onWhite.toFixed(2)}:1

**Tints:**
${color.tints.map(t => `- ${t.hex}`).join('\n')}

**Shades:**
${color.shades.map(s => `- ${s.hex}`).join('\n')}
`;
}).join('\n')}

## Usage Guide

### Backgrounds
- Light: \`${palette.usage.backgrounds.light.color}\`
- Dark: \`${palette.usage.backgrounds.dark.color}\`
- Accent: \`${palette.usage.backgrounds.accent.color}\`

### Text
- Primary: \`${palette.usage.text.primary.color}\`
- Secondary: \`${palette.usage.text.secondary.color}\`
- On Dark: \`${palette.usage.text.onDark.color}\`
- Links: \`${palette.usage.ui.links.default}\`

### UI Elements
- Primary Button: \`${palette.usage.ui.buttons.primary.background}\`
- Secondary Button: \`${palette.usage.ui.buttons.secondary.background}\`
- Borders: \`${palette.usage.ui.borders.default}\`

## Accessibility

WCAG AA: ${palette.accessibility.wcagAA ? 'PASS ✓' : 'FAIL ✗'}
WCAG AAA: ${palette.accessibility.wcagAAA ? 'PASS ✓' : 'FAIL ✗'}

${palette.accessibility.issues.length > 0 ? `
### Issues
${palette.accessibility.issues.map(i => `- ${i.color}: ${i.issue}`).join('\n')}
` : ''}

## CSS Usage

\`\`\`css
/* Import variables */
@import 'color-palette.css';

/* Use in components */
.button {
  background: var(--color-accent);
  color: var(--color-white);
}

.heading {
  color: var(--color-primary);
}
\`\`\`
`;
  }
}

// Run CLI
if (require.main === module) {
  const cli = new ColorPaletteCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = ColorPaletteCLI;
