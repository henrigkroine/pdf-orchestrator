#!/usr/bin/env node

/**
 * Apply Typography CLI
 *
 * Apply optimized typography to documents:
 * - Generate perfect type scales
 * - Optimize text hierarchy
 * - Apply kerning adjustments
 * - Export InDesign scripts
 *
 * Usage:
 *   node apply-typography.js [options]
 *
 * Options:
 *   --scale <ratio>       Type scale ratio (default: 1.250)
 *   --base <size>         Base font size (default: 16)
 *   --analyze <file>      Analyze document typography
 *   --export <format>     Export format (css, scss, indesign)
 *   --brand <name>        Brand context (default: TEEI)
 */

const TypographyOptimizer = require('./lib/typography-optimizer');
const AdvancedKerning = require('./lib/advanced-kerning');
const fs = require('fs').promises;
const path = require('path');

class TypographyCLI {
  constructor() {
    this.optimizer = null;
    this.kerning = new AdvancedKerning();
  }

  async run(args) {
    const options = this.parseArgs(args);

    console.log('🎨 Typography Optimizer\n');

    if (options.help) {
      this.showHelp();
      return;
    }

    // Initialize optimizer with options
    this.optimizer = new TypographyOptimizer({
      scale: options.scale,
      baseSize: options.base
    });

    if (options.analyze) {
      await this.analyzeDocument(options.analyze);
    } else if (options.generateScale) {
      await this.generateTypeScale(options);
    } else if (options.fontPairings) {
      await this.generateFontPairings(options);
    } else if (options.analyzeText) {
      await this.analyzeText(options.analyzeText, options);
    } else {
      // Default: generate complete typography system
      await this.generateSystem(options);
    }
  }

  parseArgs(args) {
    const options = {
      scale: 1.250,
      base: 16,
      brand: 'TEEI',
      export: 'json',
      output: 'config/typography-system.json'
    };

    for (let i = 0; i < args.length; i++) {
      switch (args[i]) {
        case '--scale':
          options.scale = parseFloat(args[++i]);
          break;
        case '--base':
          options.base = parseInt(args[++i]);
          break;
        case '--analyze':
          options.analyze = args[++i];
          break;
        case '--export':
          options.export = args[++i];
          break;
        case '--output':
        case '-o':
          options.output = args[++i];
          break;
        case '--brand':
          options.brand = args[++i];
          break;
        case '--generate-scale':
          options.generateScale = true;
          break;
        case '--font-pairings':
          options.fontPairings = true;
          break;
        case '--analyze-text':
          options.analyzeText = args[++i];
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
Typography Optimizer CLI

USAGE:
  node apply-typography.js [options]

OPTIONS:
  --scale <ratio>          Type scale ratio (default: 1.250 - Major Third)
                          Options: 1.067 (Minor Second), 1.125 (Major Second),
                                   1.200 (Minor Third), 1.250 (Major Third),
                                   1.333 (Perfect Fourth), 1.500 (Perfect Fifth),
                                   1.618 (Golden Ratio)

  --base <size>            Base font size in pixels (default: 16)

  --analyze <file>         Analyze document typography from JSON file

  --generate-scale         Generate type scale only

  --font-pairings          Generate AI-powered font pairings

  --analyze-text <text>    Analyze text for kerning opportunities

  --export <format>        Export format: json, css, scss, indesign (default: json)

  --output, -o <file>      Output file path

  --brand <name>           Brand context (default: TEEI)

  --help, -h               Show this help message

EXAMPLES:
  # Generate complete typography system
  node apply-typography.js

  # Generate with golden ratio scale
  node apply-typography.js --scale 1.618 --base 16

  # Generate font pairings for brand
  node apply-typography.js --font-pairings --brand "TEEI"

  # Analyze text for kerning
  node apply-typography.js --analyze-text "The Educational Equality Institute"

  # Export as CSS
  node apply-typography.js --export css --output styles/typography.css

  # Analyze document
  node apply-typography.js --analyze document-analysis.json

BRAND SCALES:
  TEEI (recommended): --scale 1.250 --base 16
  Modern/Tech:        --scale 1.333 --base 16
  Editorial/Classic:  --scale 1.618 --base 18
    `);
  }

  async generateTypeScale(options) {
    console.log(`📏 Generating Type Scale\n`);
    console.log(`   Scale: ${options.scale} (${this.optimizer.getScaleName(options.scale)})`);
    console.log(`   Base: ${options.base}px\n`);

    const typeScale = this.optimizer.generateTypeScale(options.base, options.scale);

    // Display scale
    console.log('Type Scale:');
    console.log('─'.repeat(80));

    Object.entries(typeScale.sizes).forEach(([name, size]) => {
      const bar = '█'.repeat(Math.round(size.px / 2));
      console.log(`${name.padEnd(10)} ${size.px}px  ${size.pt}pt  (${size.em}em)  ${bar}`);
      console.log(`           LH: ${size.lineHeight}  LS: ${size.letterSpacing}em`);
      console.log(`           ${size.usage}`);
      console.log('');
    });

    // Export
    await this.exportTypeScale(typeScale, options);
  }

  async generateFontPairings(options) {
    console.log(`🎭 Generating Font Pairings for ${options.brand}\n`);

    const brandContext = {
      name: options.brand,
      personality: 'warm, empowering, professional, hopeful',
      industry: 'education, nonprofit',
      contentType: 'partnership documents, reports'
    };

    console.log('Consulting AI typography expert...\n');

    const pairings = await this.optimizer.findPerfectPairings(brandContext);

    // Display pairings
    console.log('Recommended Font Pairings:');
    console.log('═'.repeat(80));

    (pairings.pairings || []).forEach((pairing, i) => {
      console.log(`\n${i + 1}. ${pairing.name} (Score: ${pairing.score}/10)`);
      console.log('─'.repeat(80));
      console.log(`   Headline: ${pairing.headline.font} (${pairing.headline.classification})`);
      console.log(`   Body:     ${pairing.body.font} (${pairing.body.classification})`);
      console.log(`   Contrast: ${pairing.contrast.toUpperCase()}`);
      console.log(`   Mood:     ${pairing.mood}`);
      console.log(`   Why:      ${pairing.reasoning}`);
      console.log(`   Best for: ${pairing.useCases.join(', ')}`);
    });

    // Save to file
    const outputPath = options.output.replace('.json', '-pairings.json');
    await fs.writeFile(outputPath, JSON.stringify(pairings, null, 2));
    console.log(`\n✅ Saved to: ${outputPath}`);
  }

  async analyzeText(text, options) {
    console.log(`🔍 Analyzing Text for Kerning\n`);
    console.log(`Text: "${text}"`);
    console.log(`Size: ${options.base}px\n`);

    const analysis = this.kerning.analyzeText(text, options.base);

    console.log('Kerning Analysis:');
    console.log('─'.repeat(80));
    console.log(`Kerning Pairs: ${analysis.totalPairs}`);
    console.log(`Ligatures: ${analysis.ligatures.length}`);
    console.log(`Optical Size: ${analysis.opticalSize}`);
    console.log('');

    if (analysis.recommendations.length > 0) {
      console.log('High Priority Adjustments:');
      analysis.recommendations.forEach(rec => {
        console.log(`  ${rec.pair.padEnd(4)} Position ${rec.position}: ${rec.kerning} (${rec.reason})`);
      });
      console.log('');
    }

    if (analysis.ligatures.length > 0) {
      console.log('Ligatures Found:');
      analysis.ligatures.forEach(lig => {
        console.log(`  ${lig.ligature} at position ${lig.position} (${lig.type})`);
      });
      console.log('');
    }

    // Generate report
    const report = this.kerning.generateReport(text, options.base);

    console.log('CSS Code:');
    console.log(report.cssCode);
    console.log('');

    // Save report
    const outputPath = options.output.replace('.json', '-kerning.json');
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved to: ${outputPath}`);
  }

  async analyzeDocument(filePath) {
    console.log(`📄 Analyzing Document: ${filePath}\n`);

    const content = await fs.readFile(filePath, 'utf8');
    const documentAnalysis = JSON.parse(content);

    const hierarchy = await this.optimizer.optimizeHierarchy(documentAnalysis);

    console.log('Typography Hierarchy Analysis:');
    console.log('═'.repeat(80));
    console.log(`Total Elements: ${hierarchy.summary.totalElements}`);
    console.log(`Levels: ${Object.keys(hierarchy.summary.levels).join(', ')}`);
    console.log(`Avg Improvements per Element: ${hierarchy.summary.avgImprovement}`);
    console.log('');

    console.log('Level Distribution:');
    Object.entries(hierarchy.summary.levels).forEach(([level, stats]) => {
      console.log(`  ${level.padEnd(10)} ${stats.count} elements`);
      console.log(`             Current: ${stats.avgCurrentSize}px → Optimized: ${stats.avgOptimizedSize}px`);
    });
    console.log('');

    if (hierarchy.recommendations && hierarchy.recommendations.recommendations) {
      console.log('AI Recommendations:');
      hierarchy.recommendations.recommendations.forEach((rec, i) => {
        console.log(`\n${i + 1}. ${rec.title} (${rec.impact.toUpperCase()} impact)`);
        console.log(`   ${rec.description}`);
      });
    }

    // Save hierarchy
    const outputPath = filePath.replace('.json', '-hierarchy.json');
    await fs.writeFile(outputPath, JSON.stringify(hierarchy, null, 2));
    console.log(`\n✅ Hierarchy saved to: ${outputPath}`);
  }

  async generateSystem(options) {
    console.log(`🎨 Generating Complete Typography System\n`);
    console.log(`   Brand: ${options.brand}`);
    console.log(`   Scale: ${options.scale} (${this.optimizer.getScaleName(options.scale)})`);
    console.log(`   Base: ${options.base}px\n`);

    const brandContext = {
      name: options.brand,
      personality: 'warm, empowering, professional, hopeful',
      industry: 'education, nonprofit'
    };

    console.log('Generating typography system...\n');

    const system = await this.optimizer.generateSystem(brandContext);

    // Display summary
    console.log('Typography System Generated:');
    console.log('═'.repeat(80));
    console.log(`✓ Type Scale: ${Object.keys(system.typeScale.sizes).length} sizes`);
    console.log(`✓ Font Pairings: ${(system.fontPairings.pairings || []).length} options`);
    console.log(`✓ Guidelines: Line height, tracking, measure`);
    console.log(`✓ CSS Variables: Ready for web`);
    console.log(`✓ InDesign Specs: Ready for print`);
    console.log('');

    // Export system
    await this.exportSystem(system, options);

    console.log(`\n✅ Complete typography system saved!`);
    console.log(`\nNext steps:`);
    console.log(`  1. Review font pairings and select one`);
    console.log(`  2. Import CSS variables into your project`);
    console.log(`  3. Apply InDesign specs to templates`);
    console.log(`  4. Test at multiple sizes and zoom levels`);
  }

  async exportTypeScale(typeScale, options) {
    const outputDir = path.dirname(options.output);
    await fs.mkdir(outputDir, { recursive: true });

    if (options.export === 'json') {
      await fs.writeFile(options.output, JSON.stringify(typeScale, null, 2));
      console.log(`✅ Exported JSON: ${options.output}`);
    }

    if (options.export === 'css' || options.export === 'all') {
      const cssPath = options.output.replace('.json', '.css');
      const css = this.optimizer.generateCSSVariables(typeScale);
      await fs.writeFile(cssPath, css);
      console.log(`✅ Exported CSS: ${cssPath}`);
    }

    if (options.export === 'indesign' || options.export === 'all') {
      const indesignPath = options.output.replace('.json', '-indesign.json');
      const specs = this.optimizer.generateInDesignSpecs(typeScale);
      await fs.writeFile(indesignPath, JSON.stringify(specs, null, 2));
      console.log(`✅ Exported InDesign: ${indesignPath}`);
    }
  }

  async exportSystem(system, options) {
    const outputDir = path.dirname(options.output);
    await fs.mkdir(outputDir, { recursive: true });

    // Export complete system as JSON
    await fs.writeFile(options.output, JSON.stringify(system, null, 2));
    console.log(`✅ System JSON: ${options.output}`);

    // Export CSS
    const cssPath = options.output.replace('.json', '.css');
    await fs.writeFile(cssPath, system.cssVariables);
    console.log(`✅ CSS Variables: ${cssPath}`);

    // Export InDesign specs
    const indesignPath = options.output.replace('.json', '-indesign.json');
    await fs.writeFile(indesignPath, JSON.stringify(system.indesignSpecs, null, 2));
    console.log(`✅ InDesign Specs: ${indesignPath}`);

    // Export font pairings
    const pairingsPath = options.output.replace('.json', '-pairings.json');
    await fs.writeFile(pairingsPath, JSON.stringify(system.fontPairings, null, 2));
    console.log(`✅ Font Pairings: ${pairingsPath}`);

    // Export README
    const readmePath = path.join(outputDir, 'TYPOGRAPHY-README.md');
    await fs.writeFile(readmePath, this.generateReadme(system, options));
    console.log(`✅ Documentation: ${readmePath}`);
  }

  generateReadme(system, options) {
    return `# Typography System - ${options.brand}

Generated: ${new Date().toISOString()}

## Type Scale

Base Size: ${options.base}px
Scale Ratio: ${options.scale} (${this.optimizer.getScaleName(options.scale)})

${Object.entries(system.typeScale.sizes).map(([name, size]) => `
### ${name.toUpperCase()}
- Size: ${size.px}px / ${size.pt}pt
- Line Height: ${size.lineHeight}
- Letter Spacing: ${size.letterSpacing}em
- Usage: ${size.usage}
`).join('\n')}

## Font Pairings

${(system.fontPairings.pairings || []).map((p, i) => `
### ${i + 1}. ${p.name} (${p.score}/10)
- **Headline**: ${p.headline.font}
- **Body**: ${p.body.font}
- **Mood**: ${p.mood}
- **Best for**: ${p.useCases.join(', ')}
`).join('\n')}

## Usage

### Web (CSS)
Import the CSS file and use variables:
\`\`\`css
.heading-1 {
  font-size: var(--font-size-h1);
  line-height: var(--line-height-h1);
  letter-spacing: var(--letter-spacing-h1);
}
\`\`\`

### InDesign
Import the InDesign specs JSON and apply paragraph styles.

### Guidelines
- **Optimal CPL**: 45-75 characters per line
- **Line Height**: ${system.guidelines.lineHeight.body} for body text
- **Tracking**: Adjust based on size (see specs)
`;
  }
}

// Run CLI
if (require.main === module) {
  const cli = new TypographyCLI();
  cli.run(process.argv.slice(2)).catch(error => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
}

module.exports = TypographyCLI;
