#!/usr/bin/env node

/**
 * Layout Optimization CLI
 *
 * Optimizes PDF layouts using AI-powered layout analysis,
 * golden ratio, grid systems, and alignment engines.
 *
 * Usage:
 *   node scripts/optimize-layout.js <input-file> [options]
 *
 * @module optimize-layout
 */

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
const LayoutArchitect = require('./lib/layout-architect');
const GoldenRatio = require('./lib/golden-ratio');
const GridSystem = require('./lib/grid-system');
const AlignmentEngine = require('./lib/alignment-engine');
const EyeFlowOptimizer = require('./lib/eye-flow-optimizer');

// CLI setup
const program = new Command();

program
  .name('optimize-layout')
  .description('Optimize PDF layouts with AI-powered analysis')
  .version('1.0.0')
  .argument('<input>', 'Input document JSON file')
  .option('-o, --output <file>', 'Output file path', null)
  .option('-g, --grid <type>', 'Grid system (swiss12, golden, modular, manuscript)', 'swiss12')
  .option('-p, --pattern <type>', 'Eye flow pattern (z, f, gutenberg, auto)', 'auto')
  .option('--no-ai', 'Disable AI refinement')
  .option('--model <name>', 'AI model to use', 'claude-opus-4-20250514')
  .option('-d, --debug', 'Enable debug output')
  .option('-r, --report', 'Generate detailed report')
  .option('--export-indesign', 'Export InDesign-compatible layout')
  .parse(process.argv);

const options = program.opts();
const inputFile = program.args[0];

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎨 Layout Optimization System\n');

    // Validate input
    if (!inputFile) {
      console.error('❌ Error: Input file required');
      program.help();
      process.exit(1);
    }

    // Read input document
    console.log(`📄 Loading document: ${inputFile}`);
    const documentContent = await loadDocument(inputFile);

    // Initialize systems
    console.log('🔧 Initializing layout systems...');
    const architect = new LayoutArchitect({
      enableAI: options.ai,
      model: options.model,
      debug: options.debug
    });

    const goldenRatio = new GoldenRatio();
    const gridSystem = new GridSystem();
    const alignmentEngine = new AlignmentEngine({ debug: options.debug });
    const eyeFlowOptimizer = new EyeFlowOptimizer({ pattern: options.pattern, debug: options.debug });

    // Step 1: Optimize layout
    console.log('\n📐 Optimizing layout...');
    const optimizedLayout = await architect.optimizeLayout(documentContent, {
      grid: options.grid
    });

    console.log(`✅ Layout optimized using ${optimizedLayout.grid.name}`);
    console.log(`   Balance: ${optimizedLayout.metrics.balance.toFixed(1)}/10`);
    console.log(`   Harmony: ${optimizedLayout.metrics.harmony.toFixed(1)}/10`);
    console.log(`   Hierarchy: ${optimizedLayout.metrics.hierarchy.toFixed(1)}/10`);

    // Step 2: Optimize eye flow
    console.log('\n👁️  Optimizing eye flow...');
    const withEyeFlow = eyeFlowOptimizer.optimizeLayout(optimizedLayout, options.pattern);

    console.log(`✅ Eye flow optimized using ${withEyeFlow.eyeFlow.pattern}`);
    console.log(`   Average score: ${(withEyeFlow.eyeFlow.averageScore * 100).toFixed(1)}%`);
    console.log(`   Hot zones: ${withEyeFlow.elements.filter(el => el.attentionZone === 'hot').length} elements`);

    // Step 3: Generate reports
    if (options.report) {
      console.log('\n📊 Generating reports...');

      const layoutReport = architect.generateReport(withEyeFlow);
      const eyeFlowReport = eyeFlowOptimizer.generateReport(withEyeFlow);

      await saveReport({
        layout: layoutReport,
        eyeFlow: eyeFlowReport,
        timestamp: new Date().toISOString(),
        input: inputFile,
        options
      });

      console.log('✅ Reports generated');
    }

    // Step 4: Export layout
    const outputFile = options.output || generateOutputPath(inputFile);
    console.log(`\n💾 Saving optimized layout: ${outputFile}`);

    await saveLayout(withEyeFlow, outputFile);

    // Export InDesign format
    if (options.exportIndesign) {
      const indesignFile = outputFile.replace('.json', '-indesign.json');
      console.log(`📦 Exporting InDesign format: ${indesignFile}`);

      const indesignLayout = architect.exportToInDesign(withEyeFlow);
      await fs.writeFile(indesignFile, JSON.stringify(indesignLayout, null, 2));

      console.log('✅ InDesign export complete');
    }

    // Print summary
    console.log('\n✨ Layout Optimization Complete!\n');
    printSummary(withEyeFlow);

    // Print recommendations
    if (withEyeFlow.eyeFlow.recommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      withEyeFlow.eyeFlow.recommendations.forEach((rec, idx) => {
        console.log(`   ${idx + 1}. ${rec.message}`);
        if (rec.suggestion) {
          console.log(`      → ${rec.suggestion}`);
        }
      });
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (options.debug) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Load document from file
 */
async function loadDocument(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Failed to load document: ${error.message}`);
  }
}

/**
 * Save optimized layout
 */
async function saveLayout(layout, outputFile) {
  try {
    const outputDir = path.dirname(outputFile);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(outputFile, JSON.stringify(layout, null, 2));

    console.log('✅ Layout saved successfully');
  } catch (error) {
    throw new Error(`Failed to save layout: ${error.message}`);
  }
}

/**
 * Save report
 */
async function saveReport(report) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(
      __dirname,
      '..',
      'exports',
      'layouts',
      `layout-report-${timestamp}.json`
    );

    await fs.mkdir(path.dirname(reportFile), { recursive: true });
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    // Also save text version
    const textReport = generateTextReport(report);
    const textFile = reportFile.replace('.json', '.txt');
    await fs.writeFile(textFile, textReport);

    console.log(`   Report: ${reportFile}`);
    console.log(`   Text: ${textFile}`);

  } catch (error) {
    console.error('⚠️  Warning: Failed to save report:', error.message);
  }
}

/**
 * Generate text report
 */
function generateTextReport(report) {
  return `
LAYOUT OPTIMIZATION REPORT
Generated: ${report.timestamp}
Input: ${report.input}

═══════════════════════════════════════════════════════════════

LAYOUT METRICS
─────────────────────────────────────────────────────────────

Grid System: ${report.layout.summary.grid}
Elements: ${report.layout.summary.elements}

Balance:    ${report.layout.metrics.balance}
Harmony:    ${report.layout.metrics.harmony}
Hierarchy:  ${report.layout.metrics.hierarchy}
Whitespace: ${report.layout.metrics.whitespace}
Alignment:  ${report.layout.metrics.alignment}

Eye Flow:   ${report.layout.eyeFlow}

═══════════════════════════════════════════════════════════════

EYE FLOW ANALYSIS
─────────────────────────────────────────────────────────────

Pattern: ${report.eyeFlow.pattern}
Average Score: ${report.eyeFlow.averageScore}

Element Distribution:
  Hot zones:  ${report.eyeFlow.elementDistribution.hot} elements
  Warm zones: ${report.eyeFlow.elementDistribution.warm} elements
  Cool zones: ${report.eyeFlow.elementDistribution.cool} elements
  Cold zones: ${report.eyeFlow.elementDistribution.cold} elements

${report.eyeFlow.summary}

═══════════════════════════════════════════════════════════════

RECOMMENDATIONS
─────────────────────────────────────────────────────────────

${report.layout.recommendations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n')}

${report.eyeFlow.recommendations.length > 0 ? `
Eye Flow Improvements:
${report.eyeFlow.recommendations.map((rec, idx) => `${idx + 1}. ${rec.message}\n   → ${rec.suggestion || 'No action needed'}`).join('\n')}
` : ''}

═══════════════════════════════════════════════════════════════
`;
}

/**
 * Generate output path
 */
function generateOutputPath(inputFile) {
  const basename = path.basename(inputFile, path.extname(inputFile));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const outputDir = path.join(__dirname, '..', 'exports', 'layouts');

  return path.join(outputDir, `${basename}-optimized-${timestamp}.json`);
}

/**
 * Print summary
 */
function printSummary(layout) {
  console.log('┌────────────────────────────────────┐');
  console.log('│       LAYOUT OPTIMIZATION          │');
  console.log('├────────────────────────────────────┤');
  console.log(`│ Grid:       ${layout.grid.name.padEnd(23)}│`);
  console.log(`│ Elements:   ${String(layout.elements.length).padEnd(23)}│`);
  console.log(`│ Balance:    ${(layout.metrics.balance.toFixed(1) + '/10').padEnd(23)}│`);
  console.log(`│ Harmony:    ${(layout.metrics.harmony.toFixed(1) + '/10').padEnd(23)}│`);
  console.log(`│ Eye Flow:   ${(layout.eyeFlow.pattern).padEnd(23)}│`);
  console.log(`│ Score:      ${((layout.eyeFlow.averageScore * 100).toFixed(1) + '%').padEnd(23)}│`);
  console.log('└────────────────────────────────────┘');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
