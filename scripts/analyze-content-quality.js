#!/usr/bin/env node

/**
 * Content Quality Analysis CLI Tool
 *
 * Usage: node scripts/analyze-content-quality.js <pdf-path> [options]
 *
 * Options:
 *   --target <audience>     Target audience (corporatePartners, foundations, educators, generalPublic)
 *   --document-type <type>  Document type (partnershipDocument, programOverview, impactReport)
 *   --format <format>       Output format (json, html, csv, markdown) - default: json
 *   --output <path>         Output file path
 *   --skip-fact-check       Skip web-based fact checking
 *   --verbose               Show detailed progress
 */

const fs = require('fs').promises;
const path = require('path');

// Import content quality analyzer and dependencies
const ContentQualityAnalyzer = require('./lib/content-quality-analyzer');

// Mock AI client for demonstration (replace with real implementation)
class MockAIClient {
  async generateText(params) {
    console.log(`   [AI] Calling ${params.model}...`);

    // Return mock JSON responses
    return JSON.stringify({
      assessment: "Content demonstrates professional quality with clear messaging",
      strengths: ["Clear value proposition", "Professional tone", "Good structure"],
      weaknesses: ["Could strengthen emotional appeal", "Add more specific examples"],
      improvements: ["Enhance storytelling elements", "Increase audience focus"],
      recommendations: []
    });
  }
}

// Mock web search for demonstration
class MockWebSearch {
  async search(query) {
    console.log(`   [Search] Searching for: ${query}`);
    return [
      { url: 'https://example.com', snippet: 'Example search result' }
    ];
  }
}

/**
 * Main CLI function
 */
async function main() {
  try {
    // Parse arguments
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
      printUsage();
      process.exit(0);
    }

    const pdfPath = args[0];
    const options = parseOptions(args.slice(1));

    // Validate PDF path
    try {
      await fs.access(pdfPath);
    } catch (error) {
      console.error(`Error: PDF file not found: ${pdfPath}`);
      process.exit(1);
    }

    console.log('\n╔═══════════════════════════════════════════════════════╗');
    console.log('║   PDF Content Quality Analyzer                        ║');
    console.log('║   AI-Powered Multi-Dimensional Analysis               ║');
    console.log('╚═══════════════════════════════════════════════════════╝\n');

    console.log(`📄 Input: ${pdfPath}`);
    console.log(`🎯 Target Audience: ${options.targetAudience}`);
    console.log(`📋 Document Type: ${options.documentType}`);
    console.log(`📊 Output Format: ${options.format}\n`);

    // Load configuration
    const config = await loadConfig();

    // Initialize AI client and web search
    const aiClient = new MockAIClient();
    const webSearch = options.skipFactCheck ? null : new MockWebSearch();

    // Create analyzer
    const analyzer = new ContentQualityAnalyzer(config, aiClient, webSearch);

    // Analyze PDF
    console.log('Starting analysis...\n');

    const startTime = Date.now();
    const analysis = await analyzer.analyzePDF(pdfPath, {
      targetAudience: options.targetAudience,
      documentType: options.documentType,
      skipFactCheck: options.skipFactCheck
    });
    const duration = Date.now() - startTime;

    // Display results
    displayResults(analysis, options.verbose);

    // Export results
    if (options.output) {
      await analyzer.exportResults(analysis, options.output, options.format);
    } else {
      // Auto-generate output path
      const baseName = path.basename(pdfPath, path.extname(pdfPath));
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const outputPath = path.join(
        'exports',
        'content-quality',
        `${baseName}_quality_${timestamp}.${options.format}`
      );

      // Ensure directory exists
      await fs.mkdir(path.dirname(outputPath), { recursive: true });

      await analyzer.exportResults(analysis, outputPath, options.format);
    }

    console.log('\n✓ Analysis complete!\n');

    // Exit with status code based on quality
    const exitCode = analysis.overallScore >= 70 ? 0 : 1;
    process.exit(exitCode);

  } catch (error) {
    console.error('\n❌ Analysis failed:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Parse command line options
 */
function parseOptions(args) {
  const options = {
    targetAudience: 'corporatePartners',
    documentType: 'partnershipDocument',
    format: 'json',
    output: null,
    skipFactCheck: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--target':
        options.targetAudience = args[++i];
        break;
      case '--document-type':
        options.documentType = args[++i];
        break;
      case '--format':
        options.format = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--skip-fact-check':
        options.skipFactCheck = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
    }
  }

  return options;
}

/**
 * Load configuration
 */
async function loadConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'content-quality-config.json');

  try {
    const configData = await fs.readFile(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error loading configuration:', error.message);
    console.error('Using default configuration...');

    // Return minimal default config
    return {
      qualityDimensions: {
        writingQuality: { weight: 0.15, criteria: {} },
        messagingEffectiveness: { weight: 0.20, criteria: {} },
        storytellingQuality: { weight: 0.15, criteria: {} },
        contentCompleteness: { weight: 0.15, criteria: {} },
        audienceAppropriateness: { weight: 0.10, criteria: {} },
        emotionalIntelligence: { weight: 0.05, criteria: {} }
      },
      scoringRanges: {
        exceptional: { min: 90, max: 100, label: 'Exceptional' },
        veryGood: { min: 80, max: 89, label: 'Very Good' },
        good: { min: 70, max: 79, label: 'Good' },
        fair: { min: 60, max: 69, label: 'Fair' },
        belowStandard: { min: 50, max: 59, label: 'Below Standard' },
        poor: { min: 0, max: 49, label: 'Poor' }
      },
      placeholderPatterns: ['XX', 'TBD', 'TODO'],
      requiredElements: {},
      teeiVoiceAttributes: {},
      targetAudiences: {},
      aiModels: {
        writingQuality: { primary: 'gpt-5', temperature: 0.3, maxTokens: 2000 },
        messaging: { primary: 'claude-opus-4.1', temperature: 0.4, maxTokens: 3000 },
        storytelling: { primary: 'gemini-2.5-pro', temperature: 0.5, maxTokens: 3000 },
        audience: { primary: 'claude-sonnet-4.5', temperature: 0.3, maxTokens: 2000 },
        emotional: { primary: 'gemini-2.5-pro', temperature: 0.4, maxTokens: 2000 }
      },
      improvementRecommendations: {
        writingQuality: { lowScore: [], mediumScore: [], highScore: [] },
        messaging: { lowScore: [], mediumScore: [], highScore: [] },
        storytelling: { lowScore: [], mediumScore: [], highScore: [] }
      },
      webSearchFactChecking: { enabled: true, maxSearches: 5 }
    };
  }
}

/**
 * Display analysis results
 */
function displayResults(analysis, verbose) {
  const { overallScore, grade, dimensions, allIssues, recommendations, summary } = analysis;

  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║              ANALYSIS RESULTS                         ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');

  // Overall score
  const scoreColor = overallScore >= 85 ? '🟢' : overallScore >= 70 ? '🟡' : '🔴';
  console.log(`${scoreColor} Overall Quality Score: ${overallScore}/100`);
  console.log(`   Grade: ${grade.letter} (${grade.label})`);
  console.log(`   ${grade.description}\n`);

  // Dimension scores
  console.log('📊 Quality Dimensions:\n');

  Object.entries(dimensions).forEach(([name, result]) => {
    const score = Math.round(result.overallScore);
    const icon = score >= 85 ? '✓' : score >= 70 ? '~' : '✗';
    const formattedName = name.replace(/([A-Z])/g, ' $1').trim();

    console.log(`   ${icon} ${formattedName.padEnd(30)} ${score.toString().padStart(3)}/100`);
  });

  // Issues summary
  console.log(`\n🔍 Issues Found: ${allIssues.length}\n`);

  const critical = allIssues.filter(i => i.severity === 'critical');
  const major = allIssues.filter(i => i.severity === 'major');
  const minor = allIssues.filter(i => i.severity === 'minor');

  console.log(`   🔴 Critical: ${critical.length}`);
  console.log(`   🟡 Major:    ${major.length}`);
  console.log(`   🟢 Minor:    ${minor.length}`);

  // Show top issues if verbose
  if (verbose && allIssues.length > 0) {
    console.log('\n   Top Issues:');
    allIssues.slice(0, 5).forEach((issue, idx) => {
      console.log(`   ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.issue}`);
      if (issue.suggestion) {
        console.log(`      💡 ${issue.suggestion}`);
      }
    });
  }

  // Recommendations
  if (recommendations.immediate.length > 0) {
    console.log('\n🔴 Immediate Actions Required:\n');
    recommendations.immediate.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
  }

  if (verbose && recommendations.important.length > 0) {
    console.log('\n🟡 Important Improvements:\n');
    recommendations.important.slice(0, 5).forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec}`);
    });
  }

  // Strengths
  if (summary.strengths && summary.strengths.length > 0) {
    console.log('\n✨ Strengths:\n');
    summary.strengths.forEach(strength => {
      console.log(`   ✓ ${strength.replace(/([A-Z])/g, ' $1').trim()}`);
    });
  }

  // Weaknesses
  if (summary.weaknesses && summary.weaknesses.length > 0) {
    console.log('\n⚠️  Areas for Improvement:\n');
    summary.weaknesses.forEach(weakness => {
      console.log(`   • ${weakness.replace(/([A-Z])/g, ' $1').trim()}`);
    });
  }
}

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Content Quality Analysis Tool

USAGE:
  node scripts/analyze-content-quality.js <pdf-path> [options]

OPTIONS:
  --target <audience>        Target audience (default: corporatePartners)
                             Options: corporatePartners, foundations, educators, generalPublic

  --document-type <type>     Document type (default: partnershipDocument)
                             Options: partnershipDocument, programOverview, impactReport

  --format <format>          Output format (default: json)
                             Options: json, html, csv, markdown

  --output <path>            Output file path (auto-generated if not specified)

  --skip-fact-check          Skip web-based fact checking (faster analysis)

  --verbose, -v              Show detailed progress and issues

  --help, -h                 Show this help message

EXAMPLES:
  # Basic analysis
  node scripts/analyze-content-quality.js exports/TEEI_AWS_Partnership.pdf

  # Analysis with specific audience and HTML output
  node scripts/analyze-content-quality.js document.pdf --target foundations --format html

  # Verbose analysis with custom output path
  node scripts/analyze-content-quality.js document.pdf --verbose --output reports/analysis.json

EXIT CODES:
  0    Content quality score >= 70 (acceptable)
  1    Content quality score < 70 (needs improvement) or analysis error
`);
}

// Run CLI
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
