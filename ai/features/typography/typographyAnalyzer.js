/**
 * Typography Analyzer (Tier 1 Feature 1)
 * Analyzes typography hierarchy, readability, and font pairing quality
 *
 * Upgraded: Now supports advanced AI-powered analysis (Agent 2 enhancement)
 */

const fs = require('fs');
const logger = require('../../utils/logger');
const { createFeatureResult, createIssue } = require('../../core/schemas');

/**
 * Analyze typography from sidecar JSON
 * @param {string} typographySidecarPath - Path to typography JSON
 * @param {Object} config - Feature configuration
 * @param {Object} jobConfig - Full job configuration
 * @returns {Promise<Object>} Typography analysis result
 */
async function analyzeTypography(typographySidecarPath, config, jobConfig) {
  // ========================================
  // ENHANCED: Try advanced analysis first
  // ========================================
  const useAdvanced = config.useAdvancedAnalysis !== false; // Default: true

  if (useAdvanced) {
    try {
      const { analyzeTypographyAdvanced } = require('./advancedTypographyAnalyzer');
      logger.info("Using advanced AI-powered typography analysis");
      return await analyzeTypographyAdvanced(typographySidecarPath, config, jobConfig);
    } catch (error) {
      logger.warn(`Advanced analysis failed (${error.message}), falling back to standard analysis`);
      // Continue to standard analysis below
    }
  }

  // ========================================
  // STANDARD ANALYSIS (Fallback)
  // ========================================

  logger.subsection("Typography Analysis (Standard)");

  const issues = [];
  let score = 1.0; // Start with perfect score, deduct for problems

  try {
    // Load typography sidecar
    if (!fs.existsSync(typographySidecarPath)) {
      logger.warn(`Typography sidecar not found: ${typographySidecarPath}`);
      return createFeatureResult({
        enabled: config.enabled,
        weight: config.weight,
        score: 0,
        issues: [createIssue({
          id: "typo_000",
          severity: "critical",
          location: "system",
          message: `Typography sidecar not found: ${typographySidecarPath}`,
          recommendation: "Ensure JSX script exports typography JSON"
        })],
        summary: "Typography sidecar missing - cannot analyze",
        details: {}
      });
    }

    const sidecarContent = fs.readFileSync(typographySidecarPath, 'utf-8');
    const sidecar = JSON.parse(sidecarContent);

    logger.debug(`Loaded typography sidecar with ${sidecar.styles?.length || 0} styles`);

    // Extract style information
    const styles = sidecar.styles || [];
    const distinctStyles = styles.length;
    const distinctSizes = new Set(styles.map(s => s.fontSize)).size;
    const sizeValues = styles.map(s => s.fontSize).filter(s => s);
    const minSize = Math.min(...sizeValues);
    const maxSize = Math.max(...sizeValues);

    // Get TFU requirements if available
    const tfuTypography = jobConfig.tfu_requirements?.typography_requirements || {};
    const minTypeSizes = tfuTypography.min_type_sizes || 8;
    const expectedHierarchy = tfuTypography.hierarchy_levels || [];

    logger.info(`Distinct styles: ${distinctStyles}, Distinct sizes: ${distinctSizes}`);
    logger.info(`Size range: ${minSize}pt - ${maxSize}pt`);

    // ========================================
    // CHECK 1: Sufficient distinct type sizes
    // ========================================
    if (distinctSizes < minTypeSizes) {
      const penalty = 0.15;
      score -= penalty;
      issues.push(createIssue({
        id: "typo_001",
        severity: "major",
        location: "document-wide",
        message: `Only ${distinctSizes} distinct type sizes (requires ${minTypeSizes}+)`,
        recommendation: `Add more type sizes to establish clear hierarchy (aim for ${minTypeSizes}+)`
      }));
      logger.warn(`Typography: insufficient distinct sizes (${distinctSizes} < ${minTypeSizes})`);
    } else {
      logger.success(`Typography: good size variety (${distinctSizes} sizes)`);
    }

    // ========================================
    // CHECK 2: Too many micro-variations
    // ========================================
    if (distinctSizes > 14) {
      const penalty = 0.10;
      score -= penalty;
      issues.push(createIssue({
        id: "typo_002",
        severity: "medium",
        location: "document-wide",
        message: `Too many distinct type sizes (${distinctSizes}) suggests noise`,
        recommendation: "Consolidate similar sizes into standard hierarchy levels"
      }));
      logger.warn(`Typography: excessive size variations (${distinctSizes} > 14)`);
    }

    // ========================================
    // CHECK 3: Outlier sizes (too small)
    // ========================================
    const tooSmallThreshold = 8; // Less than 8pt is hard to read
    const tooSmallStyles = styles.filter(s => s.fontSize && s.fontSize < tooSmallThreshold);
    if (tooSmallStyles.length > 0) {
      const penalty = 0.05 * Math.min(tooSmallStyles.length, 3); // Max 0.15 penalty
      score -= penalty;

      for (const style of tooSmallStyles.slice(0, 3)) { // Report first 3
        issues.push(createIssue({
          id: `typo_003_${style.name}`,
          severity: "medium",
          location: style.name,
          message: `Type size ${style.fontSize}pt is too small (minimum: ${tooSmallThreshold}pt)`,
          recommendation: `Increase ${style.name} from ${style.fontSize}pt to at least ${tooSmallThreshold}pt`
        }));
      }
      logger.warn(`Typography: ${tooSmallStyles.length} styles with overly small sizes`);
    }

    // ========================================
    // CHECK 4: Hierarchy levels present
    // ========================================
    if (expectedHierarchy.length > 0) {
      // Check if style names suggest expected hierarchy levels
      const styleNames = styles.map(s => s.name.toLowerCase());
      const missingLevels = [];

      for (const level of expectedHierarchy) {
        const found = styleNames.some(name => name.includes(level.replace(/_/g, '').toLowerCase()));
        if (!found) {
          missingLevels.push(level);
        }
      }

      if (missingLevels.length > 0 && missingLevels.length <= 3) {
        const penalty = 0.05 * missingLevels.length;
        score -= penalty;
        issues.push(createIssue({
          id: "typo_004",
          severity: "low",
          location: "document-wide",
          message: `Missing expected hierarchy levels: ${missingLevels.join(', ')}`,
          recommendation: "Consider adding styles for these hierarchy levels"
        }));
        logger.warn(`Typography: missing hierarchy levels: ${missingLevels.join(', ')}`);
      }
    }

    // ========================================
    // CHECK 5: Leading (line height) analysis
    // ========================================
    // Check for body text styles with tight leading
    const bodyStyles = styles.filter(s =>
      s.name.toLowerCase().includes('body') ||
      s.name.toLowerCase().includes('paragraph')
    );

    for (const style of bodyStyles) {
      if (style.fontSize && style.leading) {
        const leadingRatio = style.leading / style.fontSize;

        // Optimal leading is 1.4-1.6x font size for body text
        if (leadingRatio < 1.3) {
          const penalty = 0.05;
          score -= penalty;
          issues.push(createIssue({
            id: `typo_005_${style.name}`,
            severity: "medium",
            location: style.name,
            message: `Leading ratio ${leadingRatio.toFixed(2)} is too tight (optimal: 1.4-1.6)`,
            recommendation: `Increase ${style.name} leading from ${style.leading}pt to ${Math.round(style.fontSize * 1.5)}pt`
          }));
          logger.warn(`Typography: tight leading in ${style.name}`);
        }
      }
    }

    // ========================================
    // CHECK 6: Font pairing consistency
    // ========================================
    const fonts = new Set(styles.map(s => s.fontFamily).filter(f => f));
    const fontCount = fonts.size;

    if (fontCount > 3) {
      const penalty = 0.10;
      score -= penalty;
      issues.push(createIssue({
        id: "typo_006",
        severity: "medium",
        location: "document-wide",
        message: `Too many distinct fonts (${fontCount}) may reduce cohesion`,
        recommendation: "Limit to 2-3 fonts: one for headlines, one for body, optional accent"
      }));
      logger.warn(`Typography: too many fonts (${fontCount} > 3)`);
    } else {
      logger.success(`Typography: good font pairing (${fontCount} fonts)`);
    }

    // Ensure score doesn't go below 0
    score = Math.max(0, score);

    // Build details object
    const details = {
      distinctStyles,
      distinctSizes,
      sizeRange: { min: minSize, max: maxSize },
      fonts: Array.from(fonts),
      styleBreakdown: styles.map(s => ({
        name: s.name,
        fontFamily: s.fontFamily,
        fontSize: s.fontSize,
        leading: s.leading,
        usage: s.usageCount || 0
      }))
    };

    // Generate summary
    let summary = `${distinctSizes} distinct type sizes, ${fontCount} fonts. `;
    if (score >= 0.90) {
      summary += "Strong typography hierarchy.";
    } else if (score >= 0.80) {
      summary += "Good hierarchy with minor issues.";
    } else if (score >= 0.70) {
      summary += "Acceptable hierarchy, improvements recommended.";
    } else {
      summary += "Weak hierarchy, significant improvements needed.";
    }

    logger.info(`Typography score: ${score.toFixed(2)}`);
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
    logger.error(`Typography analysis failed: ${error.message}`);
    return createFeatureResult({
      enabled: config.enabled,
      weight: config.weight,
      score: 0,
      issues: [createIssue({
        id: "typo_error",
        severity: "critical",
        location: "system",
        message: `Typography analysis error: ${error.message}`,
        recommendation: "Check typography sidecar format and file access"
      })],
      summary: "Typography analysis failed due to error",
      details: { error: error.message }
    });
  }
}

module.exports = { analyzeTypography };
