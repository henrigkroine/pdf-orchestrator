#!/usr/bin/env node

/**
 * Narrative Flow Creator CLI
 *
 * Creates story-driven layouts with emotional journey mapping,
 * pacing optimization, and visual storytelling.
 *
 * Usage:
 *   node scripts/create-narrative-flow.js <input-file> [options]
 *
 * @module create-narrative-flow
 */

const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
const VisualNarrative = require('./lib/visual-narrative');
const EmotionalMapping = require('./lib/emotional-mapping');
const PacingEngine = require('./lib/pacing-engine');

// CLI setup
const program = new Command();

program
  .name('create-narrative-flow')
  .description('Create story-driven layouts with emotional journey mapping')
  .version('1.0.0')
  .argument('<input>', 'Input document JSON file')
  .option('-o, --output <file>', 'Output file path', null)
  .option('-j, --journey <type>', 'Emotional journey (persuasion, transformation, educational)', null)
  .option('-p, --pacing <strategy>', 'Pacing strategy (fast, moderate, slow, varied)', null)
  .option('--no-ai', 'Disable AI refinement')
  .option('--model <name>', 'AI model to use', 'claude-opus-4-20250514')
  .option('-d, --debug', 'Enable debug output')
  .option('-r, --report', 'Generate detailed report')
  .option('--storyboard', 'Generate visual storyboard')
  .parse(process.argv);

const options = program.opts();
const inputFile = program.args[0];

/**
 * Main execution
 */
async function main() {
  try {
    console.log('📖 Visual Narrative System\n');

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
    console.log('🔧 Initializing storytelling systems...');
    const narrative = new VisualNarrative({
      enableAI: options.ai,
      model: options.model,
      debug: options.debug
    });

    const emotional = new EmotionalMapping({ debug: options.debug });
    const pacing = new PacingEngine({ debug: options.debug });

    // Step 1: Create narrative flow
    console.log('\n📖 Creating narrative flow...');
    const narrativeFlow = await narrative.createNarrativeFlow(documentContent, {
      preferredArc: options.journey,
      refineWithAI: options.ai
    });

    console.log(`✅ Narrative flow created: ${narrativeFlow.arc}`);
    console.log(`   Stages: ${narrativeFlow.stages}`);
    console.log(`   Pages: ${narrativeFlow.pages.length}`);

    // Step 2: Map emotional journey
    console.log('\n😊 Mapping emotional journey...');
    const emotionalJourney = emotional.mapEmotionalJourney(
      documentContent,
      options.journey
    );

    console.log(`✅ Emotional journey mapped: ${emotionalJourney.journey}`);
    console.log(`   Resonance: ${emotionalJourney.metrics.resonanceScore.toFixed(1)}/10`);
    console.log(`   Range: ${emotionalJourney.metrics.emotionalRange} emotions`);

    // Step 3: Optimize pacing
    console.log('\n⏱️  Optimizing pacing...');

    // Create layout structure for pacing
    const layoutForPacing = {
      page: { width: 612, height: 792 },
      elements: narrativeFlow.pages.flatMap(page => page.blocks || [])
    };

    const withPacing = pacing.optimizePacing(layoutForPacing, {
      strategy: options.pacing
    });

    console.log(`✅ Pacing optimized: ${withPacing.pacing.strategy}`);
    console.log(`   Reading time: ${withPacing.pacing.metrics.totalReadingTime}`);
    console.log(`   Engagement: ${withPacing.pacing.metrics.engagementScore.toFixed(1)}/10`);

    // Combine all systems
    const completeFlow = {
      narrative: narrativeFlow,
      emotional: emotionalJourney,
      pacing: withPacing.pacing,
      metadata: {
        input: inputFile,
        timestamp: new Date().toISOString(),
        options
      }
    };

    // Step 4: Generate reports
    if (options.report) {
      console.log('\n📊 Generating reports...');

      const narrativeReport = {
        arc: narrativeFlow.arc,
        pages: narrativeFlow.pages.map((page, idx) => ({
          page: idx + 1,
          stage: page.stageName,
          emotion: page.emotionalTone,
          pacing: page.pacing?.description,
          transition: page.transition?.type
        }))
      };

      const emotionalReport = emotional.generateReport(emotionalJourney);
      const pacingReport = pacing.generateReport(withPacing);

      await saveReport({
        narrative: narrativeReport,
        emotional: emotionalReport,
        pacing: pacingReport,
        combined: completeFlow
      });

      console.log('✅ Reports generated');
    }

    // Step 5: Generate storyboard
    if (options.storyboard) {
      console.log('\n🎬 Generating storyboard...');
      await generateStoryboard(completeFlow);
      console.log('✅ Storyboard generated');
    }

    // Step 6: Save output
    const outputFile = options.output || generateOutputPath(inputFile);
    console.log(`\n💾 Saving narrative flow: ${outputFile}`);

    await saveFlow(completeFlow, outputFile);

    // Print summary
    console.log('\n✨ Narrative Flow Creation Complete!\n');
    printSummary(completeFlow);

    // Print emotional journey
    console.log('\n🎭 Emotional Journey:');
    emotionalJourney.stages.forEach((stage, idx) => {
      const bar = '█'.repeat(Math.round(stage.intensity * 20));
      console.log(`   ${idx + 1}. ${stage.emotionName.padEnd(15)} ${bar} (${(stage.intensity * 100).toFixed(0)}%)`);
    });

    // Print recommendations
    const allRecommendations = [
      ...withPacing.pacing.recommendations.map(r => ({ source: 'Pacing', ...r }))
    ];

    if (allRecommendations.length > 0) {
      console.log('\n📋 Recommendations:');
      allRecommendations.forEach((rec, idx) => {
        const icon = rec.severity === 'high' ? '🔴' :
                     rec.severity === 'medium' ? '🟡' : '🟢';
        console.log(`   ${icon} [${rec.source}] ${rec.message}`);
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
 * Save narrative flow
 */
async function saveFlow(flow, outputFile) {
  try {
    const outputDir = path.dirname(outputFile);
    await fs.mkdir(outputDir, { recursive: true });

    await fs.writeFile(outputFile, JSON.stringify(flow, null, 2));

    console.log('✅ Flow saved successfully');
  } catch (error) {
    throw new Error(`Failed to save flow: ${error.message}`);
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
      'narratives',
      `narrative-report-${timestamp}.json`
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
VISUAL NARRATIVE REPORT
Generated: ${new Date().toISOString()}

═══════════════════════════════════════════════════════════════

STORY ARC: ${report.narrative.arc}
─────────────────────────────────────────────────────────────

${report.narrative.pages.map((page, idx) => `
Page ${page.page}: ${page.stage}
  Emotion:    ${page.emotion}
  Pacing:     ${page.pacing || 'N/A'}
  Transition: ${page.transition || 'None'}
`).join('')}

═══════════════════════════════════════════════════════════════

EMOTIONAL JOURNEY: ${report.emotional.journey}
─────────────────────────────────────────────────────────────

${report.emotional.stages.map((stage, idx) => {
  const bar = '█'.repeat(Math.round(stage.intensity * 20));
  return `${idx + 1}. ${stage.emotion.padEnd(15)} ${bar} (${(stage.intensity * 100).toFixed(0)}%)
   Colors: ${stage.colors.join(', ')}
   Transition: ${stage.transition}
`;
}).join('\n')}

Metrics:
  Emotional Range:  ${report.emotional.metrics.emotionalRange}
  Avg Intensity:    ${report.emotional.metrics.averageIntensity}
  Resonance Score:  ${report.emotional.metrics.resonanceScore}
  Variety:          ${report.emotional.metrics.variety}

Curve:
  Smoothness: ${report.emotional.curve.smoothness}
  Range:      ${report.emotional.curve.range}
  Peak:       ${report.emotional.curve.peak}

${report.emotional.summary}

═══════════════════════════════════════════════════════════════

PACING ANALYSIS
─────────────────────────────────────────────────────────────

Strategy:     ${report.pacing.strategy}
Reading Time: ${report.pacing.readingTime}
Word Count:   ${report.pacing.wordCount}
Rhythm:       ${report.pacing.rhythm}

Metrics:
  Content Density: ${report.pacing.metrics.contentDensity}
  Whitespace:      ${report.pacing.metrics.whitespace}
  Engagement:      ${report.pacing.metrics.engagement}

Breathing Points:
  Total:   ${report.pacing.breathingPoints.total}
  Natural: ${report.pacing.breathingPoints.natural}
  Needed:  ${report.pacing.breathingPoints.needed}

Recommendations:
${report.pacing.recommendations.map((rec, idx) => `  ${idx + 1}. ${rec.message}
     ${rec.suggestion ? '→ ' + rec.suggestion : ''}`).join('\n')}

═══════════════════════════════════════════════════════════════
`;
}

/**
 * Generate storyboard
 */
async function generateStoryboard(flow) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const storyboardFile = path.join(
    __dirname,
    '..',
    'exports',
    'narratives',
    `storyboard-${timestamp}.html`
  );

  const html = generateStoryboardHTML(flow);

  await fs.mkdir(path.dirname(storyboardFile), { recursive: true });
  await fs.writeFile(storyboardFile, html);

  console.log(`   Storyboard: ${storyboardFile}`);
}

/**
 * Generate storyboard HTML
 */
function generateStoryboardHTML(flow) {
  const pages = flow.narrative.pages.map((page, idx) => {
    const emotion = flow.emotional.stages[idx];
    const colors = emotion?.visualTreatment?.colors || ['#CCCCCC'];

    return `
    <div class="page" style="border-left: 8px solid ${colors[0]}">
      <div class="page-header">
        <h3>Page ${idx + 1}: ${page.stageName}</h3>
        <span class="emotion">${page.emotionalTone}</span>
      </div>
      <div class="page-body">
        <div class="visual-treatment">
          <div class="colors">
            ${colors.map(c => `<div class="color" style="background: ${c}" title="${c}"></div>`).join('')}
          </div>
          <div class="intensity-bar">
            <div class="bar" style="width: ${(emotion?.intensity || 0) * 100}%; background: ${colors[0]}"></div>
          </div>
        </div>
        <div class="pacing">
          <strong>Pacing:</strong> ${page.pacing?.description || 'N/A'}
        </div>
        ${page.transition ? `
        <div class="transition">
          <strong>→</strong> ${page.transition.type}
        </div>
        ` : ''}
      </div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Visual Narrative Storyboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      padding: 40px;
      background: #f5f5f5;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { margin-bottom: 10px; color: #00393F; }
    .subtitle { color: #666; margin-bottom: 40px; }
    .page {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .emotion {
      background: #C9E4EC;
      color: #00393F;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
    }
    .visual-treatment {
      margin-bottom: 15px;
    }
    .colors {
      display: flex;
      gap: 8px;
      margin-bottom: 10px;
    }
    .color {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }
    .intensity-bar {
      height: 8px;
      background: #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    .bar {
      height: 100%;
      transition: width 0.3s;
    }
    .pacing, .transition {
      margin-top: 10px;
      color: #666;
      font-size: 14px;
    }
    .metrics {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metrics h2 { margin-bottom: 15px; color: #00393F; }
    .metric { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .metric:last-child { border-bottom: none; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📖 Visual Narrative Storyboard</h1>
    <p class="subtitle">${flow.narrative.arc} • ${flow.emotional.journey}</p>

    <div class="metrics">
      <h2>Metrics</h2>
      <div class="metric">
        <span>Reading Time</span>
        <strong>${flow.pacing.metrics.totalReadingTime}</strong>
      </div>
      <div class="metric">
        <span>Emotional Resonance</span>
        <strong>${flow.emotional.metrics.resonanceScore.toFixed(1)}/10</strong>
      </div>
      <div class="metric">
        <span>Engagement Score</span>
        <strong>${flow.pacing.metrics.engagementScore.toFixed(1)}/10</strong>
      </div>
      <div class="metric">
        <span>Emotional Range</span>
        <strong>${flow.emotional.metrics.emotionalRange} emotions</strong>
      </div>
    </div>

    ${pages}
  </div>
</body>
</html>`;
}

/**
 * Generate output path
 */
function generateOutputPath(inputFile) {
  const basename = path.basename(inputFile, path.extname(inputFile));
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const outputDir = path.join(__dirname, '..', 'exports', 'narratives');

  return path.join(outputDir, `${basename}-narrative-${timestamp}.json`);
}

/**
 * Print summary
 */
function printSummary(flow) {
  console.log('┌────────────────────────────────────┐');
  console.log('│      NARRATIVE FLOW SUMMARY        │');
  console.log('├────────────────────────────────────┤');
  console.log(`│ Story Arc:  ${flow.narrative.arc.padEnd(23)}│`);
  console.log(`│ Journey:    ${flow.emotional.journey.padEnd(23)}│`);
  console.log(`│ Stages:     ${String(flow.narrative.stages).padEnd(23)}│`);
  console.log(`│ Reading:    ${flow.pacing.metrics.totalReadingTime.padEnd(23)}│`);
  console.log(`│ Resonance:  ${(flow.emotional.metrics.resonanceScore.toFixed(1) + '/10').padEnd(23)}│`);
  console.log(`│ Engagement: ${(flow.pacing.metrics.engagementScore.toFixed(1) + '/10').padEnd(23)}│`);
  console.log('└────────────────────────────────────┘');
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
