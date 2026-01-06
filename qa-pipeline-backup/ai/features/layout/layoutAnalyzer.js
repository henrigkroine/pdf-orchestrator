/**
 * Layout Analyzer (Agent 4 - Tier 2 Feature)
 * Uses SmolDocling VLM for semantic structure analysis
 * Optional Layer 0 analysis
 */

const logger = require('../../utils/logger');
const { createFeatureResult, createIssue } = require('../../core/schemas');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Analyze document layout using SmolDocling (if available)
 * @param {string} pdfPath - Path to PDF file
 * @param {Object} featureConfig - Configuration for layout feature
 * @param {Object} jobConfig - Full job configuration
 * @returns {Promise<Object>} Layout analysis result
 */
async function analyzeLayout(pdfPath, featureConfig, jobConfig) {
  logger.info("Running layout analysis (Tier 2 - SmolDocling)");

  const issues = [];
  let score = 1.0;

  try {
    // Check if SmolDocling is available
    const smoldoclingAvailable = await checkSmolDoclingAvailability();

    if (!smoldoclingAvailable) {
      logger.warn('SmolDocling not available - layout analysis skipped');
      return createFeatureResult({
        enabled: false,
        weight: featureConfig.weight,
        score: 1.0,
        issues: [],
        summary: 'Layout analysis skipped (SmolDocling not available)',
        details: {
          mode: 'tier2',
          smoldoclingAvailable: false,
          reason: 'VLM model not installed or accessible'
        }
      });
    }

    // Run SmolDocling analysis
    const layoutData = await runSmolDoclingAnalysis(pdfPath);

    // Check 1: Structural hierarchy
    if (!layoutData.hasHierarchy) {
      issues.push(createIssue({
        id: 'LAYOUT_001',
        severity: 'major',
        location: 'document-wide',
        message: 'No clear structural hierarchy detected',
        recommendation: 'Establish visual hierarchy with distinct header levels'
      }));
      score -= 0.15;
    }

    // Check 2: Grid alignment
    if (layoutData.gridAlignment < 0.8) {
      issues.push(createIssue({
        id: 'LAYOUT_002',
        severity: 'medium',
        location: 'document-wide',
        message: `Poor grid alignment (score: ${layoutData.gridAlignment.toFixed(2)})`,
        recommendation: 'Align content to a consistent grid system'
      }));
      score -= 0.10;
    }

    // Check 3: Visual balance
    if (layoutData.visualBalance < 0.7) {
      issues.push(createIssue({
        id: 'LAYOUT_003',
        severity: 'minor',
        location: 'document-wide',
        message: `Unbalanced layout (score: ${layoutData.visualBalance.toFixed(2)})`,
        recommendation: 'Redistribute content for better visual balance'
      }));
      score -= 0.05;
    }

    // Check 4: Content flow
    if (layoutData.readingOrder && layoutData.readingOrder.broken) {
      issues.push(createIssue({
        id: 'LAYOUT_004',
        severity: 'major',
        location: layoutData.readingOrder.location,
        message: 'Reading order is not logical or broken',
        recommendation: 'Reorganize content to follow natural reading flow'
      }));
      score -= 0.12;
    }

    score = Math.max(0, score);

    const summary = issues.length === 0
      ? 'Layout analysis passed - structure is well-organized'
      : `Found ${issues.length} layout issues`;

    return createFeatureResult({
      enabled: featureConfig.enabled,
      weight: featureConfig.weight,
      score,
      issues,
      summary,
      details: {
        mode: 'tier2',
        smoldoclingAvailable: true,
        extractedData: layoutData,
        checksPerformed: [
          'structural_hierarchy',
          'grid_alignment',
          'visual_balance',
          'content_flow'
        ]
      }
    });

  } catch (error) {
    logger.error(`Layout analysis failed: ${error.message}`);

    return createFeatureResult({
      enabled: false,
      weight: featureConfig.weight,
      score: 1.0,
      issues: [{
        id: 'LAYOUT_ERROR',
        severity: 'low',
        location: 'system',
        message: `Layout analysis failed: ${error.message}`,
        recommendation: 'Check SmolDocling installation'
      }],
      summary: 'Layout analysis failed',
      details: {
        mode: 'tier2',
        error: error.message
      }
    });
  }
}

/**
 * Check if SmolDocling VLM is available
 * @returns {Promise<boolean>} True if SmolDocling is available
 */
async function checkSmolDoclingAvailability() {
  try {
    // Check if Python analyzer exists
    const analyzerPath = path.join(__dirname, '../../future/layout/layoutAnalyzer.py');
    const clientPath = path.join(__dirname, '../../future/layout/smolDoclingClient.py');

    if (!fs.existsSync(analyzerPath) || !fs.existsSync(clientPath)) {
      logger.debug('SmolDocling Python modules not found');
      return false;
    }

    // Check if Python has required dependencies
    const result = execSync('python -c "import torch; import transformers; import pdf2image; print(\'ok\')"', {
      encoding: 'utf-8',
      timeout: 5000
    }).trim();

    return result === 'ok';
  } catch (error) {
    logger.debug(`SmolDocling check failed: ${error.message}`);
    return false;
  }
}

/**
 * Run SmolDocling analysis on PDF
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} Layout analysis data
 */
async function runSmolDoclingAnalysis(pdfPath) {
  try {
    const analyzerPath = path.join(__dirname, '../../future/layout/layoutAnalyzer.py');

    logger.info('Executing SmolDocling VLM analysis...');
    logger.info('  This may take 30-60 seconds for multi-page documents');

    // Execute Python layout analyzer
    const result = execSync(
      `python "${analyzerPath}" "${pdfPath}"`,
      {
        encoding: 'utf-8',
        timeout: 120000,  // 2 minutes max
        maxBuffer: 10 * 1024 * 1024  // 10MB buffer
      }
    );

    // Parse JSON result (last line of output)
    const lines = result.trim().split('\n');
    let jsonData = null;

    // Find JSON result (look for line starting with '{')
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].trim().startsWith('{')) {
        jsonData = JSON.parse(lines[i]);
        break;
      }
    }

    if (!jsonData) {
      throw new Error('No JSON result from layout analyzer');
    }

    // Transform Python result to expected format
    return {
      hasHierarchy: jsonData.scores.structure.score >= 0.7,
      gridAlignment: jsonData.scores.spatial.score,
      visualBalance: jsonData.scores.semantic.score,
      readingOrder: {
        broken: jsonData.scores.structure.score < 0.5,
        location: jsonData.scores.structure.score < 0.5 ? 'document-wide' : null
      },
      structuralElements: jsonData.elements.slice(0, 10).map(e => ({
        type: e.type,
        page: e.page,
        content: e.content
      })),
      rawData: jsonData  // Include full analysis
    };

  } catch (error) {
    logger.error(`SmolDocling analysis failed: ${error.message}`);
    throw error;
  }
}

module.exports = { analyzeLayout };
