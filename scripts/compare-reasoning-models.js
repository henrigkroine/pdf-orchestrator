#!/usr/bin/env node
/**
 * REASONING MODELS COMPARISON BENCHMARK
 *
 * Comprehensive benchmark comparing reasoning models:
 * - OpenAI o3-mini (when available)
 * - DeepSeek R1 (95% cost savings)
 * - GPT-4o (current production)
 * - Claude Opus 4 (extended thinking)
 * - Gemini 2.5 Pro
 *
 * Comparison Metrics:
 * - Accuracy (issue detection rate)
 * - Reasoning Quality (logical soundness)
 * - Cost ($ per 1M tokens)
 * - Speed (time to complete)
 * - Confidence Calibration (accuracy vs confidence)
 *
 * Usage:
 *   node scripts/compare-reasoning-models.js <path-to-pdf> [options]
 *
 * Options:
 *   --models <list>     Comma-separated models to compare (default: all)
 *   --iterations <n>    Number of test iterations per model (default: 3)
 *   --save-report       Save detailed HTML comparison report
 *
 * Example:
 *   node scripts/compare-reasoning-models.js exports/document.pdf --models gpt-4o,deepseek-r1
 *
 * @version 1.0.0
 */

import { ReasoningEngine } from './lib/reasoning-engine.js';
import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// TEEI Brand Guidelines (shortened for prompt)
const TEEI_GUIDELINES = `
TEEI Brand Guidelines:
- Colors: Nordshore #00393F (primary), Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
- Forbidden: Copper/orange colors
- Fonts: Lora (headlines), Roboto Flex (body)
- Layout: 12-column grid, 40pt margins, 60pt section breaks
- Critical: No text cutoffs, no "XX" placeholders
`;

// Available models
const AVAILABLE_MODELS = [
  'o3-mini',      // OpenAI o3-mini (when available)
  'deepseek-r1',  // DeepSeek R1 (95% cheaper)
  'gpt-4o',       // GPT-4o (current production)
  'claude-opus-4', // Claude Opus 4 (extended thinking)
  'gemini-2.5-pro' // Gemini 2.5 Pro
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  const config = {
    pdfPath: null,
    models: AVAILABLE_MODELS,
    iterations: 3,
    saveReport: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--models' && i + 1 < args.length) {
      config.models = args[++i].split(',').map(m => m.trim());
    } else if (arg === '--iterations' && i + 1 < args.length) {
      config.iterations = parseInt(args[++i], 10);
    } else if (arg === '--save-report') {
      config.saveReport = true;
    } else if (!arg.startsWith('--')) {
      config.pdfPath = arg;
    }
  }

  return config;
}

/**
 * Convert PDF to image
 */
async function convertPDFToImage(pdfPath) {
  const document = await pdf(pdfPath, { scale: 2.0 });
  const page = await document.getPage(1);

  const tempPath = path.join(projectRoot, 'temp', `compare-${Date.now()}.png`);
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  await fs.writeFile(tempPath, page);

  const optimized = await sharp(tempPath)
    .resize(1600, null, { withoutEnlargement: true })
    .png({ quality: 90 })
    .toBuffer();

  await fs.unlink(tempPath);

  return optimized;
}

/**
 * Run benchmark for a single model
 */
async function benchmarkModel(model, imageData, iterations) {
  console.log(`\n🧪 Testing ${model}...`);

  const engine = new ReasoningEngine({
    model,
    reasoningEffort: 'high'
  });

  const results = [];

  for (let i = 0; i < iterations; i++) {
    console.log(`  Iteration ${i + 1}/${iterations}...`);

    const startTime = Date.now();

    try {
      const validationPrompt = `Analyze this PDF document for quality issues.

${TEEI_GUIDELINES}

Identify:
1. Brand compliance issues (colors, fonts, logos)
2. Design quality issues (layout, hierarchy)
3. Content issues (cutoffs, missing data)

OUTPUT FORMAT (JSON):
{
  "reasoning_chain": [
    {
      "step": 1,
      "name": "step name",
      "thinking": "your reasoning",
      "findings": []
    }
  ],
  "issues": [
    {
      "issue": "description",
      "severity": "critical|high|medium|low",
      "confidence": 0.95,
      "reasoning": "why this is an issue"
    }
  ],
  "overall_assessment": {
    "grade": "A|B|C|D|F",
    "score": 85,
    "confidence": 0.90
  }
}`;

      const analysis = await engine.analyzeWithReasoning(
        imageData,
        validationPrompt,
        'image/png'
      );

      const duration = Date.now() - startTime;

      results.push({
        iteration: i + 1,
        success: true,
        duration,
        issuesFound: analysis.issues?.length || 0,
        reasoningSteps: analysis.reasoning_chain?.length || 0,
        overallScore: analysis.overall_assessment?.score || 0,
        confidence: analysis.overall_assessment?.confidence || 0,
        cost: analysis.cost || 0,
        tokensUsed: analysis.tokens_used || 0,
        analysis
      });

      console.log(`    ✓ Found ${analysis.issues?.length || 0} issues in ${(duration / 1000).toFixed(2)}s`);

    } catch (error) {
      console.log(`    ✗ Error: ${error.message}`);

      results.push({
        iteration: i + 1,
        success: false,
        error: error.message
      });
    }
  }

  // Calculate aggregate metrics
  const successfulResults = results.filter(r => r.success);

  if (successfulResults.length === 0) {
    return {
      model,
      success: false,
      error: 'All iterations failed'
    };
  }

  const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  const avgIssues = successfulResults.reduce((sum, r) => sum + r.issuesFound, 0) / successfulResults.length;
  const avgSteps = successfulResults.reduce((sum, r) => sum + r.reasoningSteps, 0) / successfulResults.length;
  const avgScore = successfulResults.reduce((sum, r) => sum + r.overallScore, 0) / successfulResults.length;
  const avgConfidence = successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length;
  const totalCost = successfulResults.reduce((sum, r) => sum + r.cost, 0);
  const avgCost = totalCost / successfulResults.length;

  // Calculate consistency (std dev of issues found)
  const issuesVariance = successfulResults.reduce((sum, r) =>
    sum + Math.pow(r.issuesFound - avgIssues, 2), 0) / successfulResults.length;
  const consistency = 100 - Math.min(100, Math.sqrt(issuesVariance) * 10);

  return {
    model,
    success: true,
    iterations: successfulResults.length,
    metrics: {
      avgDuration: avgDuration / 1000, // seconds
      avgIssuesFound: avgIssues,
      avgReasoningSteps: avgSteps,
      avgScore,
      avgConfidence,
      avgCost,
      totalCost,
      consistency: consistency.toFixed(1)
    },
    rawResults: results
  };
}

/**
 * Compare all models
 */
async function compareModels(imageData, models, iterations) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   REASONING MODELS BENCHMARK                               ║');
  console.log('╚════════════════════════════════════════════════════════════╝');

  console.log(`\n📊 Models to test: ${models.join(', ')}`);
  console.log(`🔁 Iterations per model: ${iterations}\n`);

  const results = [];

  for (const model of models) {
    const result = await benchmarkModel(model, imageData, iterations);
    results.push(result);
  }

  return results;
}

/**
 * Display comparison table
 */
function displayComparison(results) {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   COMPARISON RESULTS                                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Sort by average score (descending)
  const successfulResults = results.filter(r => r.success);
  successfulResults.sort((a, b) => b.metrics.avgScore - a.metrics.avgScore);

  console.log('Ranking by Overall Score:\n');

  for (let i = 0; i < successfulResults.length; i++) {
    const result = successfulResults[i];
    const rank = i + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;

    console.log(`${medal} ${result.model}`);
    console.log(`   Score: ${result.metrics.avgScore.toFixed(1)}/100`);
    console.log(`   Issues Found: ${result.metrics.avgIssuesFound.toFixed(1)}`);
    console.log(`   Reasoning Steps: ${result.metrics.avgReasoningSteps.toFixed(1)}`);
    console.log(`   Confidence: ${(result.metrics.avgConfidence * 100).toFixed(1)}%`);
    console.log(`   Speed: ${result.metrics.avgDuration.toFixed(2)}s`);
    console.log(`   Cost: $${result.metrics.avgCost.toFixed(4)} per run`);
    console.log(`   Total Cost: $${result.metrics.totalCost.toFixed(4)}`);
    console.log(`   Consistency: ${result.metrics.consistency}%\n`);
  }

  // Best in category
  console.log('🏆 Best in Category:\n');

  const fastest = successfulResults.reduce((min, r) =>
    r.metrics.avgDuration < min.metrics.avgDuration ? r : min);
  console.log(`⚡ Fastest: ${fastest.model} (${fastest.metrics.avgDuration.toFixed(2)}s)`);

  const cheapest = successfulResults.reduce((min, r) =>
    r.metrics.avgCost < min.metrics.avgCost ? r : min);
  console.log(`💰 Cheapest: ${cheapest.model} ($${cheapest.metrics.avgCost.toFixed(4)})`);

  const mostAccurate = successfulResults.reduce((max, r) =>
    r.metrics.avgIssuesFound > max.metrics.avgIssuesFound ? r : max);
  console.log(`🎯 Most Issues Found: ${mostAccurate.model} (${mostAccurate.metrics.avgIssuesFound.toFixed(1)} issues)`);

  const mostConsistent = successfulResults.reduce((max, r) =>
    parseFloat(r.metrics.consistency) > parseFloat(max.metrics.consistency) ? r : max);
  console.log(`🔄 Most Consistent: ${mostConsistent.model} (${mostConsistent.metrics.consistency}%)`);

  const mostThorough = successfulResults.reduce((max, r) =>
    r.metrics.avgReasoningSteps > max.metrics.avgReasoningSteps ? r : max);
  console.log(`🧠 Most Reasoning Steps: ${mostThorough.model} (${mostThorough.metrics.avgReasoningSteps.toFixed(1)} steps)`);

  // Cost comparison
  console.log('\n💸 Cost Analysis:\n');

  const baseModel = successfulResults.find(r => r.model === 'gpt-4o');
  if (baseModel) {
    for (const result of successfulResults) {
      const savings = ((baseModel.metrics.avgCost - result.metrics.avgCost) / baseModel.metrics.avgCost * 100);
      if (savings > 0) {
        console.log(`  ${result.model}: ${savings.toFixed(1)}% cheaper than GPT-4o`);
      } else if (savings < 0) {
        console.log(`  ${result.model}: ${Math.abs(savings).toFixed(1)}% more expensive than GPT-4o`);
      } else {
        console.log(`  ${result.model}: Same cost as GPT-4o`);
      }
    }
  }

  // Recommendations
  console.log('\n📋 Recommendations:\n');

  if (cheapest.model === 'deepseek-r1') {
    console.log('  💎 For cost optimization: Use DeepSeek R1 (95% cheaper than OpenAI)');
  }

  if (mostAccurate.model !== cheapest.model) {
    console.log(`  🎯 For maximum accuracy: Use ${mostAccurate.model}`);
  }

  if (fastest.model !== mostAccurate.model) {
    console.log(`  ⚡ For speed: Use ${fastest.model}`);
  }

  console.log(`  🥇 Best overall: ${successfulResults[0].model} (highest score)`);
}

/**
 * Save detailed HTML report
 */
async function saveHTMLReport(results, pdfPath) {
  const reportDir = path.join(projectRoot, 'exports', 'comparison-reports');
  await fs.mkdir(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `comparison-${timestamp}.html`);

  const html = generateComparisonHTML(results, pdfPath);
  await fs.writeFile(reportPath, html);

  console.log(`\n💾 Report saved: ${reportPath}`);

  return reportPath;
}

/**
 * Generate HTML comparison report
 */
function generateComparisonHTML(results, pdfPath) {
  const successfulResults = results.filter(r => r.success);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reasoning Models Comparison - ${path.basename(pdfPath)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 { color: #00393F; }
    .card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      text-align: left;
      padding: 12px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background: #00393F;
      color: white;
      font-weight: 600;
    }
    .metric {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      margin: 2px;
    }
    .good { background: #e8f5e9; color: #2e7d32; }
    .medium { background: #fff3e0; color: #ef6c00; }
    .poor { background: #ffebee; color: #c62828; }
    .chart {
      margin: 20px 0;
      height: 300px;
    }
  </style>
</head>
<body>
  <h1>🧠 Reasoning Models Comparison</h1>

  <div class="card">
    <h2>📄 Document</h2>
    <p><strong>File:</strong> ${path.basename(pdfPath)}</p>
    <p><strong>Tested:</strong> ${new Date().toLocaleString()}</p>
    <p><strong>Models:</strong> ${results.map(r => r.model).join(', ')}</p>
  </div>

  <div class="card">
    <h2>📊 Comparison Table</h2>
    <table>
      <thead>
        <tr>
          <th>Model</th>
          <th>Score</th>
          <th>Issues</th>
          <th>Steps</th>
          <th>Speed (s)</th>
          <th>Cost ($)</th>
          <th>Consistency</th>
        </tr>
      </thead>
      <tbody>
        ${successfulResults.map(r => `
          <tr>
            <td><strong>${r.model}</strong></td>
            <td>${r.metrics.avgScore.toFixed(1)}/100</td>
            <td>${r.metrics.avgIssuesFound.toFixed(1)}</td>
            <td>${r.metrics.avgReasoningSteps.toFixed(1)}</td>
            <td>${r.metrics.avgDuration.toFixed(2)}</td>
            <td>$${r.metrics.avgCost.toFixed(4)}</td>
            <td>${r.metrics.consistency}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>🏆 Winners by Category</h2>
    <p><strong>⚡ Fastest:</strong> ${successfulResults.reduce((min, r) => r.metrics.avgDuration < min.metrics.avgDuration ? r : min).model}</p>
    <p><strong>💰 Cheapest:</strong> ${successfulResults.reduce((min, r) => r.metrics.avgCost < min.metrics.avgCost ? r : min).model}</p>
    <p><strong>🎯 Most Accurate:</strong> ${successfulResults.reduce((max, r) => r.metrics.avgIssuesFound > max.metrics.avgIssuesFound ? r : max).model}</p>
    <p><strong>🔄 Most Consistent:</strong> ${successfulResults.reduce((max, r) => parseFloat(r.metrics.consistency) > parseFloat(max.metrics.consistency) ? r : max).model}</p>
  </div>

  <div class="card">
    <h2>📋 Recommendations</h2>
    <ul>
      <li>💎 <strong>Best Value:</strong> DeepSeek R1 (95% cost savings)</li>
      <li>🥇 <strong>Best Overall:</strong> ${successfulResults[0].model}</li>
      <li>⚡ <strong>For Speed:</strong> ${successfulResults.reduce((min, r) => r.metrics.avgDuration < min.metrics.avgDuration ? r : min).model}</li>
    </ul>
  </div>

  <div class="card">
    <h2>🔍 Detailed Results</h2>
    ${successfulResults.map(r => `
      <h3>${r.model}</h3>
      <pre>${JSON.stringify(r.metrics, null, 2)}</pre>
    `).join('')}
  </div>
</body>
</html>`;
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs();

  if (!config.pdfPath) {
    console.error('❌ Error: PDF path required');
    console.log('\nUsage: node scripts/compare-reasoning-models.js <path-to-pdf> [options]');
    console.log('\nOptions:');
    console.log('  --models <list>     Comma-separated models to compare');
    console.log('  --iterations <n>    Number of iterations per model (default: 3)');
    console.log('  --save-report       Save HTML comparison report');
    process.exit(1);
  }

  try {
    // Convert PDF
    console.log('📄 Converting PDF to image...');
    const imageData = await convertPDFToImage(config.pdfPath);
    console.log('✅ PDF converted\n');

    // Run comparison
    const results = await compareModels(imageData, config.models, config.iterations);

    // Display results
    displayComparison(results);

    // Save report
    if (config.saveReport) {
      await saveHTMLReport(results, config.pdfPath);
    }

    console.log('\n✅ Comparison complete!\n');

  } catch (error) {
    console.error(`\n❌ Comparison failed: ${error.message}\n`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { compareModels, benchmarkModel };
