#!/usr/bin/env node
/**
 * PDF VALIDATOR WITH REASONING MODELS
 *
 * Advanced PDF validation using reasoning models (o3-mini, DeepSeek R1, GPT-4o)
 * and multi-agent collaboration for superior accuracy and visible reasoning chains.
 *
 * Features:
 * - Chain-of-Thought reasoning for complex validation
 * - Step-by-step thinking process (visible to user)
 * - Self-verification to reduce errors
 * - Multi-agent collaboration (5 specialized agents)
 * - Agent debates for controversial findings
 * - Confidence scoring with reasoning
 * - Cost optimization (DeepSeek R1 = 95% savings)
 *
 * Usage:
 *   node scripts/validate-pdf-reasoning.js <path-to-pdf> [options]
 *
 * Options:
 *   --model <name>          Reasoning model: o3-mini, deepseek-r1, gpt-4o (default)
 *   --multi-agent           Enable multi-agent collaboration
 *   --self-verify           Enable self-verification (runs analysis twice)
 *   --show-reasoning        Show detailed reasoning chains (default: true)
 *   --debate                Enable agent debates for conflicts
 *   --save-report           Save detailed HTML report
 *
 * Examples:
 *   # Basic reasoning validation
 *   node scripts/validate-pdf-reasoning.js exports/document.pdf
 *
 *   # Multi-agent with DeepSeek R1 (95% cheaper!)
 *   node scripts/validate-pdf-reasoning.js exports/document.pdf --model deepseek-r1 --multi-agent
 *
 *   # Full analysis with debates and verification
 *   node scripts/validate-pdf-reasoning.js exports/document.pdf --multi-agent --debate --self-verify
 *
 * @version 1.0.0
 */

import { ReasoningEngine } from './lib/reasoning-engine.js';
import { MultiAgentValidator } from './lib/multi-agent-validator.js';
import { pdf } from 'pdf-to-img';
import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// TEEI Brand Guidelines
const TEEI_BRAND_GUIDELINES = `
# TEEI BRAND GUIDELINES

## Official Color Palette
PRIMARY COLORS:
- Nordshore #00393F (Deep teal) - PRIMARY brand color
- Sky #C9E4EC (Light blue) - Secondary highlights
- Sand #FFF1E2 (Warm neutral) - Background
- Beige #EFE1DC (Soft neutral) - Background

ACCENT COLORS:
- Moss #65873B (Natural green)
- Gold #BA8F5A (Warm metallic)
- Clay #913B2F (Rich terracotta)

FORBIDDEN:
- ❌ Copper/Orange colors (#C87137 or similar)

## Typography
HEADLINES: Lora (serif) - Bold/SemiBold
BODY TEXT: Roboto Flex (sans-serif) - Regular
CAPTIONS: Roboto Flex Regular, 9pt

## Layout Standards
- Grid: 12-column with 20pt gutters
- Margins: 40pt all sides
- Section breaks: 60pt

## Critical Violations
1. Wrong colors (copper/orange instead of Nordshore)
2. Wrong fonts (not Lora/Roboto Flex)
3. Text cutoffs (incomplete sentences)
4. Missing metrics (placeholders like "XX")
5. No photography (when required)
6. Logo clearspace violations
`;

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  const config = {
    pdfPath: null,
    model: 'gpt-4o',
    multiAgent: false,
    selfVerify: false,
    showReasoning: true,
    enableDebate: false,
    saveReport: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--model' && i + 1 < args.length) {
      config.model = args[++i];
    } else if (arg === '--multi-agent') {
      config.multiAgent = true;
    } else if (arg === '--self-verify') {
      config.selfVerify = true;
    } else if (arg === '--show-reasoning') {
      config.showReasoning = true;
    } else if (arg === '--debate') {
      config.enableDebate = true;
    } else if (arg === '--save-report') {
      config.saveReport = true;
    } else if (!arg.startsWith('--')) {
      config.pdfPath = arg;
    }
  }

  return config;
}

/**
 * Convert PDF to image for analysis
 */
async function convertPDFToImage(pdfPath) {
  console.log('📄 Converting PDF to image...');

  const document = await pdf(pdfPath, { scale: 2.0 });
  const page = await document.getPage(1);

  // Save temporarily
  const tempPath = path.join(projectRoot, 'temp', `reasoning-${Date.now()}.png`);
  await fs.mkdir(path.dirname(tempPath), { recursive: true });
  await fs.writeFile(tempPath, page);

  // Optimize with sharp
  const optimized = await sharp(tempPath)
    .resize(1600, null, { withoutEnlargement: true })
    .png({ quality: 90 })
    .toBuffer();

  // Cleanup
  await fs.unlink(tempPath);

  return optimized;
}

/**
 * Single-model reasoning validation
 */
async function validateWithReasoning(imageData, config) {
  console.log(`\n🧠 Reasoning Model: ${config.model}`);
  console.log('━'.repeat(60));

  const engine = new ReasoningEngine({
    model: config.model,
    reasoningEffort: 'high',
    showReasoning: config.showReasoning
  });

  const validationPrompt = `Analyze this PDF document for quality and brand compliance.

${TEEI_BRAND_GUIDELINES}

Perform a comprehensive validation checking:
1. Brand compliance (colors, fonts, logos)
2. Design quality (layout, hierarchy, whitespace)
3. Content completeness (no text cutoffs, all metrics visible)
4. Professional appearance

Use systematic reasoning to identify issues, assess severity, and provide recommendations.`;

  console.log('\n⏳ Analyzing with reasoning model...\n');

  const analysis = await engine.analyzeWithReasoning(
    imageData,
    validationPrompt,
    'image/png'
  );

  // Display reasoning chain
  if (config.showReasoning && analysis.reasoning_chain) {
    console.log('\n🔍 REASONING CHAIN:\n');
    for (const step of analysis.reasoning_chain) {
      console.log(`Step ${step.step}: ${step.name || 'Analysis'}`);
      console.log(`  ${step.thinking}`);
      if (step.findings && step.findings.length > 0) {
        console.log(`  Findings:`);
        for (const finding of step.findings) {
          console.log(`    • ${finding}`);
        }
      }
      console.log('');
    }
  }

  // Display visible reasoning (DeepSeek R1)
  if (analysis.visible_reasoning) {
    console.log('\n💭 VISIBLE REASONING (DeepSeek R1):\n');
    console.log(analysis.visible_reasoning);
    console.log('');
  }

  // Display issues
  if (analysis.issues && analysis.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:\n');
    for (const issue of analysis.issues) {
      console.log(`[${issue.severity.toUpperCase()}] ${issue.issue}`);
      console.log(`  Reasoning: ${issue.reasoning}`);
      console.log(`  Confidence: ${(issue.confidence * 100).toFixed(1)}%`);
      console.log(`  Recommendation: ${issue.recommendation}\n`);
    }
  }

  // Display overall assessment
  if (analysis.overall_assessment) {
    console.log('\n📊 OVERALL ASSESSMENT:\n');
    console.log(`Grade: ${analysis.overall_assessment.grade}`);
    console.log(`Score: ${analysis.overall_assessment.score}/100`);
    console.log(`Confidence: ${(analysis.overall_assessment.confidence * 100).toFixed(1)}%`);
    console.log(`Summary: ${analysis.overall_assessment.summary}`);
  }

  // Display cost
  console.log(`\n💰 Cost: $${analysis.cost.toFixed(4)}`);
  if (analysis.cost_savings) {
    console.log(`💎 Savings: ${analysis.cost_savings}`);
  }

  // Self-verification (if enabled)
  if (config.selfVerify) {
    console.log('\n🔄 Running Self-Verification...');
    const verified = await engine.selfVerify(analysis, imageData, 'image/png');

    console.log(`\nVerification Confidence: ${(verified.final_confidence * 100).toFixed(1)}%`);

    if (verified.verification.issues) {
      console.log('\n✅ Verified Issues:');
      for (const issue of verified.verification.issues) {
        if (issue.verified) {
          console.log(`  ✓ ${issue.original_issue}`);
        } else {
          console.log(`  ✗ ${issue.original_issue} (${issue.correction})`);
        }
      }
    }

    return verified;
  }

  return analysis;
}

/**
 * Multi-agent collaborative validation
 */
async function validateWithMultiAgent(imageData, config) {
  console.log('\n🤖 Multi-Agent Collaborative Validation');
  console.log('━'.repeat(60));

  const validator = new MultiAgentValidator({
    coordinatorModel: config.model,
    enableDebate: config.enableDebate
  });

  const result = await validator.validate({
    imageData,
    mimeType: 'image/png',
    guidelines: TEEI_BRAND_GUIDELINES
  });

  // Display agent summaries
  console.log('\n👥 AGENT FINDINGS:\n');
  for (const [agentName, summary] of Object.entries(result.agents)) {
    console.log(`${agentName}:`);
    console.log(`  Issues: ${summary.issues_found}`);
    console.log(`  Score: ${summary.overall_score}/100`);
    if (summary.key_findings.length > 0) {
      console.log(`  Key Findings:`);
      for (const finding of summary.key_findings) {
        console.log(`    • ${finding}`);
      }
    }
    console.log('');
  }

  // Display collaboration metrics
  console.log('\n🤝 COLLABORATION METRICS:\n');
  console.log(`Conflicts Detected: ${result.collaboration.conflicts_detected}`);
  console.log(`Debates Conducted: ${result.collaboration.debates_conducted}`);
  console.log(`Consensus Reached: ${result.collaboration.consensus_reached ? 'Yes' : 'No'}`);

  // Display final assessment
  if (result.final_assessment && result.final_assessment.overall_assessment) {
    console.log('\n📊 FINAL ASSESSMENT:\n');
    const assessment = result.final_assessment.overall_assessment;
    console.log(`Grade: ${assessment.grade}`);
    console.log(`Score: ${assessment.score}/100`);
    console.log(`Confidence: ${(assessment.confidence * 100).toFixed(1)}%`);
    console.log(`Summary: ${assessment.summary}`);
  }

  // Display prioritized recommendations
  if (result.recommendations && result.recommendations.length > 0) {
    console.log('\n🎯 PRIORITIZED RECOMMENDATIONS:\n');
    for (const rec of result.recommendations) {
      console.log(`${rec.priority}. [${rec.severity.toUpperCase()}] ${rec.issue}`);
      console.log(`   ${rec.recommendation}`);
      console.log(`   Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
      console.log(`   Sources: ${rec.sources.join(', ')}\n`);
    }
  }

  return result;
}

/**
 * Save detailed report
 */
async function saveReport(result, config, pdfPath) {
  const reportDir = path.join(projectRoot, 'exports', 'reasoning-reports');
  await fs.mkdir(reportDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(reportDir, `reasoning-report-${timestamp}.json`);

  const report = {
    pdfPath,
    timestamp: new Date().toISOString(),
    config,
    result
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`\n💾 Report saved: ${reportPath}`);

  return reportPath;
}

/**
 * Main execution
 */
async function main() {
  const config = parseArgs();

  if (!config.pdfPath) {
    console.error('❌ Error: PDF path required');
    console.log('\nUsage: node scripts/validate-pdf-reasoning.js <path-to-pdf> [options]');
    console.log('\nOptions:');
    console.log('  --model <name>      o3-mini, deepseek-r1, gpt-4o (default)');
    console.log('  --multi-agent       Enable multi-agent collaboration');
    console.log('  --self-verify       Enable self-verification');
    console.log('  --debate            Enable agent debates');
    console.log('  --save-report       Save detailed report');
    process.exit(1);
  }

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   PDF VALIDATOR WITH REASONING MODELS                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  console.log(`📁 Document: ${path.basename(config.pdfPath)}`);
  console.log(`🤖 Mode: ${config.multiAgent ? 'Multi-Agent Collaboration' : 'Single Reasoning Model'}`);
  console.log(`🧠 Model: ${config.model}`);

  try {
    // Convert PDF to image
    const imageData = await convertPDFToImage(config.pdfPath);
    console.log('✅ PDF converted to image\n');

    // Run validation
    let result;
    if (config.multiAgent) {
      result = await validateWithMultiAgent(imageData, config);
    } else {
      result = await validateWithReasoning(imageData, config);
    }

    // Save report (if requested)
    if (config.saveReport) {
      await saveReport(result, config, config.pdfPath);
    }

    console.log('\n✅ Validation complete!\n');

    // Exit code based on results
    const hasIssues = config.multiAgent
      ? result.recommendations && result.recommendations.length > 0
      : result.issues && result.issues.length > 0;

    process.exit(hasIssues ? 1 : 0);

  } catch (error) {
    console.error(`\n❌ Validation failed: ${error.message}\n`);
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

export { validateWithReasoning, validateWithMultiAgent };
