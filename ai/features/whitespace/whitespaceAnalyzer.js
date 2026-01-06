/**
 * Whitespace Analyzer (Tier 1 Feature 2)
 * Analyzes spacing distribution using cognitive psychology principles
 *
 * Enhanced by Agent 3 to use advanced cognitive psychology-based analysis
 * when available, with fallback to heuristic-based analysis.
 */

const logger = require('../../utils/logger');
const { createFeatureResult, createIssue } = require('../../core/schemas');
const { estimateTextCoverage, getPageRoles, applyRoleHeuristics } = require('../../utils/pdfParser');

/**
 * Analyze whitespace distribution in PDF
 * @param {string} pdfPath - Path to PDF file
 * @param {Object} config - Feature configuration
 * @param {Object} jobConfig - Full job configuration
 * @returns {Promise<Object>} Whitespace analysis result
 */
async function analyzeWhitespace(pdfPath, config, jobConfig) {
  logger.subsection("Whitespace Analysis");

  // Try advanced cognitive psychology analysis first (Agent 3)
  try {
    const { analyzeWhitespaceAdvanced } = require('./advancedWhitespaceAnalyzer');
    logger.debug("Attempting advanced cognitive psychology analysis...");
    return await analyzeWhitespaceAdvanced(pdfPath, config, jobConfig);
  } catch (error) {
    logger.warn(`Advanced analysis unavailable: ${error.message}`);
    logger.info("Falling back to heuristic-based analysis");
  }

  // Fallback: Standard heuristic-based analysis

  const issues = [];
  let score = 1.0; // Start with perfect score, deduct for problems

  try {
    // Get text coverage estimates
    const pages = await estimateTextCoverage(pdfPath);

    // Get page roles from job config
    const roles = getPageRoles(jobConfig);

    // Apply role-based heuristics
    const enhancedPages = applyRoleHeuristics(pages, roles);

    logger.info(`Analyzing whitespace for ${enhancedPages.length} pages`);

    const pageAnalysis = [];
    let totalDensity = 0;

    // Analyze each page
    for (const page of enhancedPages) {
      const { page: pageNum, role, textCoverage, textBlocks, optimalRange } = page;

      totalDensity += textCoverage;

      // Determine rating
      let rating;
      let severityIfBad;
      let notes;

      if (textCoverage < optimalRange.min) {
        rating = "too_sparse";
        severityIfBad = "low";
        notes = `Text coverage ${(textCoverage * 100).toFixed(0)}% is lower than optimal (${(optimalRange.min * 100).toFixed(0)}-${(optimalRange.max * 100).toFixed(0)}%)`;

        // Only penalize significantly sparse pages (not covers, which should be sparse)
        if (role !== "cover" && role !== "cta" && textCoverage < optimalRange.min * 0.7) {
          const penalty = 0.05;
          score -= penalty;
          issues.push(createIssue({
            id: `ws_sparse_${pageNum}`,
            severity: severityIfBad,
            page: pageNum,
            location: `page ${pageNum} (${role})`,
            message: notes,
            recommendation: `Add more content or reduce page size to achieve ${(optimalRange.min * 100).toFixed(0)}-${(optimalRange.max * 100).toFixed(0)}% coverage`
          }));
        }

      } else if (textCoverage > optimalRange.max) {
        rating = "slightly_dense";
        severityIfBad = "medium";
        notes = `Text coverage ${(textCoverage * 100).toFixed(0)}% exceeds optimal (${(optimalRange.min * 100).toFixed(0)}-${(optimalRange.max * 100).toFixed(0)}%)`;

        // Penalize overly dense pages
        if (textCoverage > optimalRange.max * 1.15) {
          const penalty = 0.10;
          score -= penalty;
          rating = "too_dense";
          severityIfBad = "major";

          issues.push(createIssue({
            id: `ws_dense_${pageNum}`,
            severity: severityIfBad,
            page: pageNum,
            location: `page ${pageNum} (${role})`,
            message: notes,
            recommendation: `Reduce content density or increase margins to achieve ${(optimalRange.min * 100).toFixed(0)}-${(optimalRange.max * 100).toFixed(0)}% coverage`
          }));
        } else {
          // Minor penalty for slightly dense
          const penalty = 0.05;
          score -= penalty;

          issues.push(createIssue({
            id: `ws_dense_${pageNum}`,
            severity: severityIfBad,
            page: pageNum,
            location: `page ${pageNum} (${role})`,
            message: notes,
            recommendation: "Consider increasing whitespace slightly for better readability"
          }));
        }

      } else {
        rating = "optimal";
        notes = `Well-balanced text coverage ${(textCoverage * 100).toFixed(0)}%`;
      }

      pageAnalysis.push({
        page: pageNum,
        role,
        textCoverage: parseFloat(textCoverage.toFixed(3)),
        textBlocks,
        rating,
        notes
      });

      logger.debug(`Page ${pageNum} (${role}): ${(textCoverage * 100).toFixed(0)}% coverage - ${rating}`);
    }

    // Calculate average density
    const avgDensity = totalDensity / enhancedPages.length;
    const overallOptimalRange = [0.25, 0.40];

    // Check overall density
    if (avgDensity > overallOptimalRange[1] * 1.2) {
      const penalty = 0.10;
      score -= penalty;
      issues.push(createIssue({
        id: "ws_overall_dense",
        severity: "major",
        location: "document-wide",
        message: `Average text coverage ${(avgDensity * 100).toFixed(0)}% is too high (optimal: 25-40%)`,
        recommendation: "Reduce overall content density or add more whitespace throughout"
      }));
      logger.warn(`Whitespace: overall density too high (${(avgDensity * 100).toFixed(0)}%)`);
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Build details object
    const details = {
      pageAnalysis,
      overallDensity: parseFloat(avgDensity.toFixed(3)),
      optimalRange: overallOptimalRange,
      note: "Text coverage estimates are heuristic-based. Actual coverage may vary."
    };

    // Generate summary
    const optimalPages = pageAnalysis.filter(p => p.rating === "optimal").length;
    let summary = `${optimalPages}/${enhancedPages.length} pages with optimal whitespace. `;

    if (score >= 0.90) {
      summary += "Excellent whitespace balance throughout.";
    } else if (score >= 0.80) {
      summary += "Good whitespace balance with minor density issues.";
    } else if (score >= 0.70) {
      summary += "Acceptable whitespace, some pages too dense.";
    } else {
      summary += "Poor whitespace balance, significant improvements needed.";
    }

    logger.info(`Whitespace score: ${score.toFixed(2)}`);
    logger.info(`Issues found: ${issues.length}`);

    return createFeatureResult({
      enabled: config.enabled,
      weight: config.weight,
      score: parseFloat(score.toFixed(3)),
      issues,
      summary,
      details
    });

  } catch (error) {
    logger.error(`Whitespace analysis failed: ${error.message}`);
    return createFeatureResult({
      enabled: config.enabled,
      weight: config.weight,
      score: 0,
      issues: [createIssue({
        id: "ws_error",
        severity: "critical",
        location: "system",
        message: `Whitespace analysis error: ${error.message}`,
        recommendation: "Check PDF file access and format"
      })],
      summary: "Whitespace analysis failed due to error",
      details: { error: error.message }
    });
  }
}

module.exports = { analyzeWhitespace };
