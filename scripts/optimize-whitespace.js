#!/usr/bin/env node

/**
 * Optimize Whitespace CLI
 *
 * Command-line tool for optimizing whitespace in layouts
 *
 * Usage:
 *   npm run optimize:whitespace -- --input layout.json
 *   npm run analyze:density -- --input layout.json
 *   node scripts/optimize-whitespace.js analyze --input layout.json
 *
 * @module optimize-whitespace
 */

const { Command } = require('commander');
const WhitespaceMaster = require('./lib/whitespace-master');
const DensityAnalyzer = require('./lib/density-analyzer');
const BreathingCalculator = require('./lib/breathing-calculator');
const SpacingScale = require('./lib/spacing-scale');
const fs = require('fs').promises;
const path = require('path');

require('dotenv').config();

const program = new Command();

program
  .name('optimize-whitespace')
  .description('Optimize whitespace and spacing in layouts')
  .version('1.0.0');

/**
 * Optimize layout whitespace
 */
program
  .command('optimize')
  .description('Optimize whitespace in a layout')
  .requiredOption('-i, --input <file>', 'Input layout JSON file')
  .option('-o, --output <file>', 'Output optimized layout JSON')
  .option('--base-unit <unit>', 'Base spacing unit', '8')
  .option('--model <model>', 'AI model for validation', 'claude-opus-4-20250514')
  .option('--skip-ai', 'Skip AI validation')
  .action(async (options) => {
    console.log('\n🎨 Whitespace Optimizer\n');

    try {
      // Load layout
      const layoutData = await fs.readFile(options.input, 'utf8');
      const layout = JSON.parse(layoutData);

      console.log(`📄 Loaded: ${options.input}`);
      console.log(`   Dimensions: ${layout.width}×${layout.height}`);
      console.log(`   Elements: ${layout.elements?.length || 0}`);

      // Optimize
      const master = new WhitespaceMaster({
        model: options.model
      });

      const result = await master.optimizeWhitespace(layout, {
        baseUnit: parseInt(options.baseUnit),
        skipAI: options.skipAi
      });

      // Display results
      console.log('\n📊 Optimization Results:\n');
      console.log(`   Original Whitespace: ${result.current.percentage}`);
      console.log(`   Optimized Whitespace: ${result.new.percentage}`);
      console.log(`   Improvement: ${result.critique.score}/10 (${result.critique.summary})`);

      if (result.issues.length > 0) {
        console.log('\n⚠️  Issues Found:');
        result.issues.forEach(issue => {
          console.log(`   ${issue.severity === 'high' ? '🔴' : '🟡'} ${issue.message}`);
        });
      }

      // Save optimized layout
      const outputPath = options.output || options.input.replace('.json', '-optimized.json');
      await fs.writeFile(outputPath, JSON.stringify(result.optimized, null, 2));
      console.log(`\n💾 Saved optimized layout: ${outputPath}`);

      // Save report
      const reportPath = outputPath.replace('.json', '-report.json');
      const report = master.generateReport(result);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`📊 Saved report: ${reportPath}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Analyze density
 */
program
  .command('analyze')
  .description('Analyze content density')
  .requiredOption('-i, --input <file>', 'Input layout JSON file')
  .option('-o, --output <file>', 'Output analysis JSON')
  .option('--grid-size <size>', 'Heatmap grid size', '50')
  .action(async (options) => {
    console.log('\n📊 Density Analyzer\n');

    try {
      // Load layout
      const layoutData = await fs.readFile(options.input, 'utf8');
      const layout = JSON.parse(layoutData);

      console.log(`📄 Loaded: ${options.input}`);

      // Analyze
      const analyzer = new DensityAnalyzer({
        gridSize: parseInt(options.gridSize)
      });

      const result = analyzer.analyzeDensity(layout);

      // Display results
      console.log('\n📊 Density Analysis:\n');
      console.log(`   Overall Density: ${result.overallDensity.percentage}`);
      console.log(`   Classification: ${result.overallDensity.classification}`);
      console.log(`   Readability Score: ${result.readability.score}/10`);

      if (result.crowdedAreas.length > 0) {
        console.log(`\n⚠️  ${result.crowdedAreas.length} Crowded Areas:`);
        result.crowdedAreas.forEach((area, i) => {
          console.log(`   ${i + 1}. Severity: ${area.severity}, Avg Density: ${(area.averageDensity * 100).toFixed(1)}%`);
        });
      }

      if (result.recommendations.length > 0) {
        console.log('\n📋 Recommendations:');
        result.recommendations.forEach(rec => {
          console.log(`   ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🔵'} ${rec.action}`);
        });
      }

      // Save analysis
      const outputPath = options.output || options.input.replace('.json', '-density.json');
      await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
      console.log(`\n💾 Saved analysis: ${outputPath}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Calculate spacing
 */
program
  .command('spacing')
  .description('Calculate optimal spacing')
  .option('--base <unit>', 'Base spacing unit', '8')
  .option('--ratio <ratio>', 'Scale ratio name or number', 'goldenRatio')
  .option('--type <type>', 'Spacing type (grid, golden, fibonacci, type)', 'grid')
  .action(async (options) => {
    console.log('\n📐 Spacing Calculator\n');

    try {
      const calculator = new BreathingCalculator({
        baseUnit: parseInt(options.base)
      });

      const scale = new SpacingScale({
        baseUnit: parseInt(options.base)
      });

      let result;

      switch (options.type) {
        case 'grid':
          result = calculator.calculateGridSpacing(parseInt(options.base));
          console.log('Grid Spacing Scale:');
          break;

        case 'golden':
          result = calculator.calculateGoldenRatio(parseInt(options.base));
          console.log('Golden Ratio Spacing:');
          break;

        case 'fibonacci':
          result = calculator.calculateFibonacciScale(parseInt(options.base));
          console.log('Fibonacci Spacing:');
          break;

        case 'type':
          result = scale.getTypeScale(parseInt(options.base));
          console.log('Typography Scale:');
          break;

        default:
          result = calculator.calculateGridSpacing(parseInt(options.base));
          console.log('Grid Spacing Scale:');
      }

      console.log('');
      for (const [name, value] of Object.entries(result)) {
        console.log(`   ${name}: ${value}pt`);
      }

      console.log('\n📋 TEEI Spacing Guide:');
      const teeiScale = scale.getTeeiScale();

      console.log('\n   Document Structure:');
      for (const [name, value] of Object.entries(teeiScale.document)) {
        console.log(`   ${name}: ${value}pt`);
      }

      console.log('\n   Grid System:');
      console.log(`   Columns: ${teeiScale.grid.columns}`);
      console.log(`   Gutter: ${teeiScale.grid.gutter}pt`);
      console.log(`   Margin: ${teeiScale.grid.margin}pt`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Generate spacing tokens
 */
program
  .command('tokens')
  .description('Generate spacing design tokens')
  .option('--format <format>', 'Output format (css, scss, json)', 'css')
  .option('--base <unit>', 'Base spacing unit', '8')
  .option('-o, --output <file>', 'Output file')
  .action(async (options) => {
    console.log('\n🎨 Spacing Token Generator\n');

    try {
      const scale = new SpacingScale({
        baseUnit: parseInt(options.base)
      });

      const tokens = scale.generateTokens(options.format);

      console.log('Generated Tokens:\n');
      console.log(tokens);

      if (options.output) {
        await fs.writeFile(options.output, tokens);
        console.log(`\n💾 Saved to: ${options.output}`);
      }

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Compare scales
 */
program
  .command('compare')
  .description('Compare different spacing scales')
  .option('--ratio1 <ratio>', 'First ratio', 'goldenRatio')
  .option('--ratio2 <ratio>', 'Second ratio', 'perfectFourth')
  .option('--base <unit>', 'Base unit', '8')
  .action(async (options) => {
    console.log('\n📊 Spacing Scale Comparison\n');

    try {
      const scale = new SpacingScale({
        baseUnit: parseInt(options.base)
      });

      const comparison = scale.compareScales(
        options.ratio1,
        options.ratio2,
        parseInt(options.base)
      );

      console.log(`Comparing: ${options.ratio1} vs ${options.ratio2}\n`);

      console.log(`${comparison.ratio1.name} (${comparison.ratio1.value}):`);
      comparison.ratio1.scale.slice(0, 6).forEach(step => {
        console.log(`   Step ${step.step}: ${step.value}pt`);
      });

      console.log(`\n${comparison.ratio2.name} (${comparison.ratio2.value}):`);
      comparison.ratio2.scale.slice(0, 6).forEach(step => {
        console.log(`   Step ${step.step}: ${step.value}pt`);
      });

      console.log(`\n💡 ${comparison.recommendation}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * List available ratios
 */
program
  .command('list-ratios')
  .description('List all available spacing ratios')
  .action(async () => {
    console.log('\n📐 Available Spacing Ratios\n');

    const scale = new SpacingScale();
    const ratios = scale.getAllRatios();

    for (const [name, value] of Object.entries(ratios)) {
      console.log(`   ${name}: ${value.toFixed(3)}`);
    }

    console.log('\nUse these ratio names with --ratio option');
  });

/**
 * Validate spacing
 */
program
  .command('validate')
  .description('Validate spacing against baseline grid')
  .requiredOption('-v, --value <value>', 'Spacing value to validate')
  .option('--base <unit>', 'Base grid unit', '8')
  .action(async (options) => {
    console.log('\n✅ Spacing Validation\n');

    try {
      const scale = new SpacingScale({
        baseUnit: parseInt(options.base)
      });

      const validation = scale.validateSpacing(parseFloat(options.value));

      console.log(`   Value: ${validation.value}pt`);
      console.log(`   On Grid: ${validation.isOnGrid ? '✅ Yes' : '❌ No'}`);

      if (!validation.isOnGrid) {
        console.log(`   Nearest Grid: ${validation.nearestGrid}pt`);
        console.log(`   Difference: ${validation.difference}pt`);
      }

      console.log(`\n💡 ${validation.recommendation}`);

    } catch (error) {
      console.error(`\n❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

/**
 * Create example layout
 */
program
  .command('example')
  .description('Create example layout for testing')
  .option('-o, --output <file>', 'Output file', 'layout-example.json')
  .action(async (options) => {
    console.log('\n📄 Creating Example Layout\n');

    const exampleLayout = {
      width: 612,  // 8.5 inches at 72 DPI
      height: 792, // 11 inches at 72 DPI
      margins: {
        top: 40,
        right: 40,
        bottom: 40,
        left: 40
      },
      sections: [
        {
          id: 'header',
          y: 40,
          height: 100
        },
        {
          id: 'content',
          y: 200,
          height: 500
        },
        {
          id: 'footer',
          y: 750,
          height: 42
        }
      ],
      elements: [
        {
          id: 'title',
          type: 'heading',
          x: 40,
          y: 40,
          width: 532,
          height: 60,
          fontSize: 42,
          lineHeight: 1.2
        },
        {
          id: 'subtitle',
          type: 'text',
          x: 40,
          y: 115,
          width: 532,
          height: 30,
          fontSize: 18,
          lineHeight: 1.3
        },
        {
          id: 'body1',
          type: 'text',
          x: 40,
          y: 200,
          width: 532,
          height: 120,
          fontSize: 12,
          lineHeight: 1.5
        },
        {
          id: 'image1',
          type: 'image',
          x: 40,
          y: 340,
          width: 260,
          height: 200
        },
        {
          id: 'body2',
          type: 'text',
          x: 320,
          y: 340,
          width: 252,
          height: 200,
          fontSize: 12,
          lineHeight: 1.5
        }
      ]
    };

    await fs.writeFile(options.output, JSON.stringify(exampleLayout, null, 2));

    console.log(`   Created: ${options.output}`);
    console.log(`   Dimensions: ${exampleLayout.width}×${exampleLayout.height}pt`);
    console.log(`   Elements: ${exampleLayout.elements.length}`);
    console.log('\nTry: npm run optimize:whitespace -- --input ' + options.output);
  });

program.parse();
