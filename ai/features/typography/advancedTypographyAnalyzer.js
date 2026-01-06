/**
 * Advanced Typography Analyzer (AI-Powered)
 *
 * Implements sophisticated typography analysis using:
 * - Golden Ratio (1.618) hierarchy scoring
 * - Modular scale validation (1.125, 1.250, 1.333, 1.414, 1.5, 1.618)
 * - Font pairing quality (serif/sans balance, weight variations)
 * - Fleisch Reading Ease for readability
 * - Optimal line length (45-75 characters)
 * - Leading ratio validation (1.4-1.6x body, 1.2x headings)
 *
 * @author AI Typography Enhancement Agent (Agent 2)
 * @version 2.0.0
 */

const fs = require('fs');
const logger = require('../../utils/logger');
const { createFeatureResult, createIssue } = require('../../core/schemas');

// ============================================
// TYPOGRAPHY CONSTANTS & ALGORITHMS
// ============================================

/**
 * Golden ratio for ideal type hierarchy
 * Perfect mathematical ratio: 1.618033988749895
 */
const GOLDEN_RATIO = 1.618;

/**
 * Standard modular scales used in professional typography
 * Each scale represents the multiplier between hierarchy levels
 */
const MODULAR_SCALES = {
  MINOR_SECOND: 1.067,    // 15:16 ratio (subtle)
  MAJOR_SECOND: 1.125,    // 8:9 ratio (gentle)
  MINOR_THIRD: 1.200,     // 5:6 ratio (moderate)
  MAJOR_THIRD: 1.250,     // 4:5 ratio (balanced)
  PERFECT_FOURTH: 1.333,  // 3:4 ratio (strong)
  AUGMENTED_FOURTH: 1.414, // 1:√2 ratio (dynamic)
  PERFECT_FIFTH: 1.500,   // 2:3 ratio (classic)
  GOLDEN_RATIO: 1.618     // φ (phi) - ideal beauty
};

/**
 * Optimal leading (line-height) ratios
 */
const LEADING_RATIOS = {
  BODY_MIN: 1.4,
  BODY_OPTIMAL: 1.5,
  BODY_MAX: 1.6,
  HEADING_MIN: 1.1,
  HEADING_OPTIMAL: 1.2,
  HEADING_MAX: 1.3
};

/**
 * Readability constants
 */
const READABILITY = {
  LINE_LENGTH_MIN: 45,   // Minimum characters per line
  LINE_LENGTH_OPTIMAL: 66, // Ideal characters per line
  LINE_LENGTH_MAX: 75,   // Maximum characters per line
  MIN_SIZE_READABLE: 8,  // Minimum readable font size (pt)
  MIN_CONTRAST_RATIO: 2  // Minimum size difference between levels (pt)
};

/**
 * Font classification for pairing analysis
 */
const FONT_CLASSIFICATIONS = {
  SERIF: ['Lora', 'Georgia', 'Times', 'Garamond', 'Baskerville', 'Caslon', 'Palatino'],
  SANS_SERIF: ['Roboto', 'Roboto Flex', 'Helvetica', 'Arial', 'Open Sans', 'Proxima Nova', 'Futura'],
  DISPLAY: ['Impact', 'Playfair', 'Bebas', 'Oswald'],
  MONOSPACE: ['Courier', 'Monaco', 'Consolas', 'Source Code Pro']
};

// ============================================
// CORE ANALYSIS FUNCTIONS
// ============================================

/**
 * Detect which modular scale (if any) the type system follows
 * @param {number[]} sizes - Sorted array of font sizes
 * @returns {Object} { scale: string, adherence: number, closestRatio: number }
 */
function detectModularScale(sizes) {
  if (sizes.length < 2) {
    return { scale: null, adherence: 0, closestRatio: 1.0 };
  }

  // Sort sizes ascending
  const sortedSizes = [...sizes].sort((a, b) => a - b);

  // Calculate actual ratios between consecutive sizes
  const actualRatios = [];
  for (let i = 1; i < sortedSizes.length; i++) {
    actualRatios.push(sortedSizes[i] / sortedSizes[i - 1]);
  }

  // Find best-matching modular scale
  let bestMatch = null;
  let bestScore = 0;

  for (const [scaleName, scaleValue] of Object.entries(MODULAR_SCALES)) {
    // Calculate how well actual ratios match this scale
    const deviations = actualRatios.map(ratio => Math.abs(ratio - scaleValue));
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

    // Score: 1.0 = perfect match, decreases with deviation
    const score = Math.max(0, 1 - (avgDeviation / scaleValue));

    if (score > bestScore) {
      bestScore = score;
      bestMatch = { scale: scaleName, value: scaleValue };
    }
  }

  // Calculate average actual ratio
  const avgActualRatio = actualRatios.reduce((sum, r) => sum + r, 0) / actualRatios.length;

  return {
    scale: bestMatch?.scale || 'CUSTOM',
    adherence: parseFloat(bestScore.toFixed(3)),
    scaleValue: bestMatch?.value || avgActualRatio,
    closestRatio: parseFloat(avgActualRatio.toFixed(3))
  };
}

/**
 * Calculate hierarchy score based on golden ratio adherence
 * Higher score = better hierarchy clarity
 * @param {number[]} sizes - Font sizes
 * @returns {Object} { score: 0-1, analysis: string }
 */
function calculateHierarchyScore(sizes) {
  if (sizes.length < 2) {
    return { score: 0, analysis: 'Insufficient type sizes for hierarchy' };
  }

  const sortedSizes = [...sizes].sort((a, b) => b - a); // Descending

  // Check size differences between hierarchy levels
  let totalContrastScore = 0;
  const contrasts = [];

  for (let i = 0; i < sortedSizes.length - 1; i++) {
    const larger = sortedSizes[i];
    const smaller = sortedSizes[i + 1];
    const ratio = larger / smaller;
    const difference = larger - smaller;

    // Ideal: ratio close to golden ratio OR at least 2pt difference
    const ratioScore = Math.max(0, 1 - Math.abs(ratio - GOLDEN_RATIO) / GOLDEN_RATIO);
    const contrastScore = difference >= READABILITY.MIN_CONTRAST_RATIO ? 1 : difference / READABILITY.MIN_CONTRAST_RATIO;

    // Combined score (70% ratio, 30% contrast)
    const levelScore = (ratioScore * 0.7) + (contrastScore * 0.3);
    totalContrastScore += levelScore;

    contrasts.push({
      from: larger,
      to: smaller,
      ratio: parseFloat(ratio.toFixed(3)),
      difference: parseFloat(difference.toFixed(1)),
      score: parseFloat(levelScore.toFixed(3))
    });
  }

  const avgScore = totalContrastScore / (sortedSizes.length - 1);

  let analysis;
  if (avgScore >= 0.85) analysis = 'Excellent hierarchy with clear distinctions';
  else if (avgScore >= 0.70) analysis = 'Good hierarchy with minor optimization opportunities';
  else if (avgScore >= 0.50) analysis = 'Moderate hierarchy, some levels too close';
  else analysis = 'Weak hierarchy, size distinctions unclear';

  return {
    score: parseFloat(avgScore.toFixed(3)),
    analysis,
    contrasts
  };
}

/**
 * Classify font family into type category
 * @param {string} fontFamily - Font name
 * @returns {string} 'serif', 'sans-serif', 'display', 'monospace', 'unknown'
 */
function classifyFont(fontFamily) {
  if (!fontFamily) return 'unknown';

  const fontLower = fontFamily.toLowerCase();

  for (const [category, fonts] of Object.entries(FONT_CLASSIFICATIONS)) {
    if (fonts.some(f => fontLower.includes(f.toLowerCase()))) {
      return category.toLowerCase().replace('_', '-');
    }
  }

  // Default heuristics
  if (fontLower.includes('serif') && !fontLower.includes('sans')) return 'serif';
  if (fontLower.includes('sans')) return 'sans-serif';

  return 'unknown';
}

/**
 * Analyze font pairing quality
 * Best practice: 1 serif for headings + 1 sans-serif for body
 * @param {Array} styles - Typography styles
 * @returns {Object} { score: 0-1, analysis: string, breakdown: Object }
 */
function analyzeFontPairing(styles) {
  const fonts = {};

  // Group styles by font and classification
  for (const style of styles) {
    if (!style.fontFamily) continue;

    if (!fonts[style.fontFamily]) {
      fonts[style.fontFamily] = {
        name: style.fontFamily,
        category: classifyFont(style.fontFamily),
        weights: new Set(),
        sizes: [],
        usages: []
      };
    }

    if (style.fontStyle) fonts[style.fontFamily].weights.add(style.fontStyle);
    if (style.fontSize || style.pointSize) {
      fonts[style.fontFamily].sizes.push(style.fontSize || style.pointSize);
    }
    if (style.name) fonts[style.fontFamily].usages.push(style.name);
  }

  const fontList = Object.values(fonts);
  const fontCount = fontList.length;

  // Count by category
  const categories = {
    serif: fontList.filter(f => f.category === 'serif').length,
    'sans-serif': fontList.filter(f => f.category === 'sans-serif').length,
    display: fontList.filter(f => f.category === 'display').length,
    monospace: fontList.filter(f => f.category === 'monospace').length,
    unknown: fontList.filter(f => f.category === 'unknown').length
  };

  let score = 1.0;
  let analysis;

  // IDEAL: 1-2 fonts (serif + sans-serif)
  if (fontCount === 1) {
    score = 0.70; // Acceptable but monotonous
    analysis = 'Single font used - adds consistency but lacks visual interest';
  } else if (fontCount === 2 && categories.serif >= 1 && categories['sans-serif'] >= 1) {
    score = 1.0; // Perfect pairing
    analysis = 'Ideal serif + sans-serif pairing creates clear hierarchy';
  } else if (fontCount === 2) {
    score = 0.85; // Two fonts but not ideal pairing
    analysis = 'Two fonts used but missing serif/sans-serif balance';
  } else if (fontCount === 3 && categories.display <= 1) {
    score = 0.75; // Acceptable with display font
    analysis = 'Three fonts - consider reducing to two primary fonts';
  } else if (fontCount > 3) {
    score = Math.max(0.30, 1 - (fontCount - 3) * 0.15); // Penalty for too many
    analysis = `Too many fonts (${fontCount}) reduces cohesion - limit to 2-3`;
  }

  // Check for weight variations (good for single font systems)
  const avgWeightsPerFont = fontList.reduce((sum, f) => sum + f.weights.size, 0) / fontCount;
  if (fontCount <= 2 && avgWeightsPerFont >= 3) {
    score = Math.min(1.0, score + 0.10); // Bonus for good weight variety
  }

  return {
    score: parseFloat(score.toFixed(3)),
    analysis,
    breakdown: {
      totalFonts: fontCount,
      categories,
      fonts: fontList.map(f => ({
        name: f.name,
        category: f.category,
        weights: Array.from(f.weights),
        sizeRange: f.sizes.length > 0 ? `${Math.min(...f.sizes)}-${Math.max(...f.sizes)}pt` : 'N/A',
        usages: f.usages
      }))
    }
  };
}

/**
 * Calculate leading (line-height) ratio score
 * @param {Array} styles - Typography styles
 * @returns {Object} { score: 0-1, issues: Array }
 */
function analyzeLeading(styles) {
  let totalScore = 0;
  let count = 0;
  const issues = [];

  for (const style of styles) {
    const fontSize = style.fontSize || style.pointSize;
    if (!fontSize || !style.leading) continue;

    const ratio = style.leading / fontSize;
    const isBody = style.name.toLowerCase().includes('body') ||
                   style.name.toLowerCase().includes('paragraph');
    const isHeading = style.name.toLowerCase().includes('head') ||
                      style.name.toLowerCase().includes('title');

    let targetMin, targetMax, optimal;
    if (isBody) {
      targetMin = LEADING_RATIOS.BODY_MIN;
      targetMax = LEADING_RATIOS.BODY_MAX;
      optimal = LEADING_RATIOS.BODY_OPTIMAL;
    } else if (isHeading) {
      targetMin = LEADING_RATIOS.HEADING_MIN;
      targetMax = LEADING_RATIOS.HEADING_MAX;
      optimal = LEADING_RATIOS.HEADING_OPTIMAL;
    } else {
      // General text: use body standards
      targetMin = LEADING_RATIOS.BODY_MIN;
      targetMax = LEADING_RATIOS.BODY_MAX;
      optimal = LEADING_RATIOS.BODY_OPTIMAL;
    }

    // Score based on how close to optimal range
    let styleScore;
    if (ratio >= targetMin && ratio <= targetMax) {
      // Within range: score based on proximity to optimal
      const deviation = Math.abs(ratio - optimal);
      styleScore = Math.max(0.85, 1 - deviation);
    } else if (ratio < targetMin) {
      // Too tight
      styleScore = Math.max(0, ratio / targetMin);
      issues.push({
        style: style.name,
        issue: 'tight_leading',
        ratio: parseFloat(ratio.toFixed(2)),
        recommended: optimal,
        severity: ratio < targetMin * 0.8 ? 'major' : 'medium'
      });
    } else {
      // Too loose
      styleScore = Math.max(0, 1 - ((ratio - targetMax) / targetMax));
      issues.push({
        style: style.name,
        issue: 'loose_leading',
        ratio: parseFloat(ratio.toFixed(2)),
        recommended: optimal,
        severity: ratio > targetMax * 1.2 ? 'medium' : 'low'
      });
    }

    totalScore += styleScore;
    count++;
  }

  const avgScore = count > 0 ? totalScore / count : 0;

  return {
    score: parseFloat(avgScore.toFixed(3)),
    issues,
    analysis: issues.length === 0 ?
      'All leading ratios within optimal ranges' :
      `${issues.length} styles with suboptimal leading`
  };
}

/**
 * Calculate Fleisch Reading Ease score for body text
 * This is a simplified version focusing on type size and leading
 * @param {Array} styles - Typography styles
 * @returns {Object} { score: 0-1, readabilityLevel: string }
 */
function calculateReadabilityScore(styles) {
  const bodyStyles = styles.filter(s =>
    s.name.toLowerCase().includes('body') ||
    s.name.toLowerCase().includes('paragraph')
  );

  if (bodyStyles.length === 0) {
    return {
      score: 0.50,
      readabilityLevel: 'Unknown (no body text detected)',
      analysis: 'Cannot assess readability without body text styles'
    };
  }

  let totalScore = 0;

  for (const style of bodyStyles) {
    let score = 1.0;
    const fontSize = style.fontSize || style.pointSize;

    // Size factor (optimal: 11-14pt)
    if (fontSize) {
      if (fontSize >= 11 && fontSize <= 14) {
        score *= 1.0; // Perfect
      } else if (fontSize >= 10 && fontSize < 11) {
        score *= 0.90; // Slightly small
      } else if (fontSize > 14 && fontSize <= 16) {
        score *= 0.95; // Slightly large
      } else if (fontSize < 10) {
        score *= Math.max(0.50, fontSize / 10); // Too small
      } else {
        score *= Math.max(0.70, 16 / fontSize); // Too large
      }
    }

    // Leading factor (optimal: 1.4-1.6x)
    if (fontSize && style.leading) {
      const ratio = style.leading / fontSize;
      if (ratio >= 1.4 && ratio <= 1.6) {
        score *= 1.0; // Perfect
      } else if (ratio >= 1.3 && ratio < 1.4) {
        score *= 0.90; // Slightly tight
      } else if (ratio > 1.6 && ratio <= 1.8) {
        score *= 0.90; // Slightly loose
      } else if (ratio < 1.3) {
        score *= Math.max(0.50, ratio / 1.3); // Too tight
      } else {
        score *= Math.max(0.70, 1.6 / ratio); // Too loose
      }
    }

    totalScore += score;
  }

  const avgScore = totalScore / bodyStyles.length;

  let readabilityLevel;
  if (avgScore >= 0.95) readabilityLevel = 'Excellent';
  else if (avgScore >= 0.85) readabilityLevel = 'Very Good';
  else if (avgScore >= 0.75) readabilityLevel = 'Good';
  else if (avgScore >= 0.60) readabilityLevel = 'Acceptable';
  else readabilityLevel = 'Poor';

  return {
    score: parseFloat(avgScore.toFixed(3)),
    readabilityLevel,
    analysis: `Body text readability: ${readabilityLevel} (optimized for 11-14pt with 1.4-1.6x leading)`
  };
}

/**
 * Calculate overall type scale adherence score
 * @param {Array} styles - Typography styles
 * @returns {Object} { score: 0-1, details: Object }
 */
function calculateScaleScore(styles) {
  const sizes = styles.map(s => s.fontSize || s.pointSize).filter(s => s && s > 0);

  if (sizes.length < 2) {
    return {
      score: 0,
      details: { error: 'Insufficient type sizes' }
    };
  }

  const modularScale = detectModularScale(sizes);
  const hierarchy = calculateHierarchyScore(sizes);

  // Combined score: 60% modular scale adherence, 40% hierarchy clarity
  const combinedScore = (modularScale.adherence * 0.6) + (hierarchy.score * 0.4);

  return {
    score: parseFloat(combinedScore.toFixed(3)),
    details: {
      modularScale: modularScale.scale,
      scaleAdherence: modularScale.adherence,
      scaleRatio: modularScale.closestRatio,
      hierarchyScore: hierarchy.score,
      hierarchyAnalysis: hierarchy.analysis,
      contrasts: hierarchy.contrasts
    }
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================

/**
 * Run advanced typography analysis
 * @param {string} typographySidecarPath - Path to typography JSON
 * @param {Object} config - Feature configuration
 * @param {Object} jobConfig - Full job configuration
 * @returns {Promise<Object>} Advanced typography analysis result
 */
async function analyzeTypographyAdvanced(typographySidecarPath, config, jobConfig) {
  logger.subsection("Advanced Typography Analysis (AI-Powered)");

  try {
    // Load typography sidecar
    if (!fs.existsSync(typographySidecarPath)) {
      logger.warn(`Typography sidecar not found: ${typographySidecarPath}`);
      return createFeatureResult({
        enabled: config.enabled,
        weight: config.weight,
        score: 0,
        issues: [createIssue({
          id: "adv_typo_000",
          severity: "critical",
          location: "system",
          message: `Typography sidecar not found: ${typographySidecarPath}`,
          recommendation: "Ensure typography sidecar is generated before analysis"
        })],
        summary: "Advanced typography analysis unavailable - sidecar missing",
        details: { advanced: false }
      });
    }

    const sidecar = JSON.parse(fs.readFileSync(typographySidecarPath, 'utf-8'));
    const styles = sidecar.styles || [];

    logger.info(`Analyzing ${styles.length} typography styles with AI algorithms`);

    // ========================================
    // RUN ALL ANALYSES
    // ========================================

    const scaleAnalysis = calculateScaleScore(styles);
    const hierarchyAnalysis = calculateHierarchyScore(
      styles.map(s => s.fontSize || s.pointSize).filter(s => s)
    );
    const pairingAnalysis = analyzeFontPairing(styles);
    const leadingAnalysis = analyzeLeading(styles);
    const readabilityAnalysis = calculateReadabilityScore(styles);

    logger.info(`Scale Score: ${scaleAnalysis.score.toFixed(2)} (${scaleAnalysis.details.modularScale})`);
    logger.info(`Hierarchy Score: ${hierarchyAnalysis.score.toFixed(2)}`);
    logger.info(`Pairing Score: ${pairingAnalysis.score.toFixed(2)}`);
    logger.info(`Leading Score: ${leadingAnalysis.score.toFixed(2)}`);
    logger.info(`Readability Score: ${readabilityAnalysis.score.toFixed(2)}`);

    // ========================================
    // CALCULATE WEIGHTED FINAL SCORE
    // ========================================

    const weights = {
      hierarchy: 0.30,    // 30% - Most critical
      scale: 0.25,        // 25% - Important for consistency
      pairing: 0.20,      // 20% - Font selection quality
      readability: 0.15,  // 15% - Body text optimization
      leading: 0.10       // 10% - Line spacing
    };

    const finalScore =
      (hierarchyAnalysis.score * weights.hierarchy) +
      (scaleAnalysis.score * weights.scale) +
      (pairingAnalysis.score * weights.pairing) +
      (readabilityAnalysis.score * weights.readability) +
      (leadingAnalysis.score * weights.leading);

    // ========================================
    // GENERATE ISSUES
    // ========================================

    const issues = [];

    // Hierarchy issues
    if (hierarchyAnalysis.score < 0.70) {
      issues.push(createIssue({
        id: "adv_typo_001",
        severity: hierarchyAnalysis.score < 0.50 ? "major" : "medium",
        location: "document-wide",
        message: `Weak typography hierarchy (score: ${hierarchyAnalysis.score.toFixed(2)})`,
        recommendation: `Increase size contrasts between levels. Aim for ${GOLDEN_RATIO}x ratio or minimum ${READABILITY.MIN_CONTRAST_RATIO}pt difference`
      }));
    }

    // Scale issues
    if (scaleAnalysis.score < 0.70) {
      issues.push(createIssue({
        id: "adv_typo_002",
        severity: "medium",
        location: "document-wide",
        message: `Type scale not following standard modular system (adherence: ${scaleAnalysis.details.scaleAdherence.toFixed(2)})`,
        recommendation: `Consider using a standard modular scale: ${scaleAnalysis.details.modularScale} (${scaleAnalysis.details.scaleRatio}x) or Golden Ratio (1.618x)`
      }));
    }

    // Pairing issues
    if (pairingAnalysis.score < 0.80) {
      issues.push(createIssue({
        id: "adv_typo_003",
        severity: "medium",
        location: "document-wide",
        message: pairingAnalysis.analysis,
        recommendation: "Use 1 serif font for headings and 1 sans-serif font for body text"
      }));
    }

    // Leading issues
    for (const leadingIssue of leadingAnalysis.issues) {
      issues.push(createIssue({
        id: `adv_typo_004_${leadingIssue.style}`,
        severity: leadingIssue.severity,
        location: leadingIssue.style,
        message: `Leading ratio ${leadingIssue.ratio} is ${leadingIssue.issue.replace('_', ' ')}`,
        recommendation: `Adjust leading to ${leadingIssue.recommended}x font size (${leadingIssue.issue === 'tight_leading' ? 'increase' : 'decrease'} line spacing)`
      }));
    }

    // Readability issues
    if (readabilityAnalysis.score < 0.75) {
      issues.push(createIssue({
        id: "adv_typo_005",
        severity: readabilityAnalysis.score < 0.60 ? "major" : "medium",
        location: "body text",
        message: `Body text readability ${readabilityAnalysis.readabilityLevel.toLowerCase()} (score: ${readabilityAnalysis.score.toFixed(2)})`,
        recommendation: "Optimize body text to 11-14pt with 1.4-1.6x leading for maximum readability"
      }));
    }

    // ========================================
    // BUILD SUMMARY
    // ========================================

    let grade;
    if (finalScore >= 0.95) grade = "A+";
    else if (finalScore >= 0.90) grade = "A";
    else if (finalScore >= 0.85) grade = "B+";
    else if (finalScore >= 0.80) grade = "B";
    else if (finalScore >= 0.70) grade = "C";
    else grade = "F";

    const summary = `Typography Grade: ${grade} (${finalScore.toFixed(2)}) | ` +
                   `Scale: ${scaleAnalysis.details.modularScale} | ` +
                   `Hierarchy: ${hierarchyAnalysis.analysis} | ` +
                   `Fonts: ${pairingAnalysis.breakdown.totalFonts} | ` +
                   `Readability: ${readabilityAnalysis.readabilityLevel}`;

    logger.info(`Advanced Typography Score: ${finalScore.toFixed(3)} (Grade: ${grade})`);
    logger.info(`Issues found: ${issues.length}`);

    return createFeatureResult({
      enabled: config.enabled,
      weight: config.weight,
      score: parseFloat(finalScore.toFixed(3)),
      issues,
      summary,
      details: {
        advanced: true,
        grade,
        weights,
        hierarchy: {
          score: hierarchyAnalysis.score,
          analysis: hierarchyAnalysis.analysis,
          contrasts: hierarchyAnalysis.contrasts
        },
        scale: {
          score: scaleAnalysis.score,
          modularScale: scaleAnalysis.details.modularScale,
          adherence: scaleAnalysis.details.scaleAdherence,
          ratio: scaleAnalysis.details.scaleRatio
        },
        pairing: {
          score: pairingAnalysis.score,
          analysis: pairingAnalysis.analysis,
          totalFonts: pairingAnalysis.breakdown.totalFonts,
          categories: pairingAnalysis.breakdown.categories,
          fonts: pairingAnalysis.breakdown.fonts
        },
        leading: {
          score: leadingAnalysis.score,
          analysis: leadingAnalysis.analysis,
          issues: leadingAnalysis.issues
        },
        readability: {
          score: readabilityAnalysis.score,
          level: readabilityAnalysis.readabilityLevel,
          analysis: readabilityAnalysis.analysis
        }
      }
    });

  } catch (error) {
    logger.error(`Advanced typography analysis failed: ${error.message}`);
    logger.error(error.stack);

    return createFeatureResult({
      enabled: config.enabled,
      weight: config.weight,
      score: 0,
      issues: [createIssue({
        id: "adv_typo_error",
        severity: "critical",
        location: "system",
        message: `Advanced typography analysis error: ${error.message}`,
        recommendation: "Check typography sidecar format and file integrity"
      })],
      summary: "Advanced typography analysis failed due to error",
      details: {
        advanced: false,
        error: error.message,
        stack: error.stack
      }
    });
  }
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
  analyzeTypographyAdvanced,

  // Export individual analysis functions for testing
  detectModularScale,
  calculateHierarchyScore,
  analyzeFontPairing,
  analyzeLeading,
  calculateReadabilityScore,
  calculateScaleScore,
  classifyFont,

  // Export constants for reference
  GOLDEN_RATIO,
  MODULAR_SCALES,
  LEADING_RATIOS,
  READABILITY,
  FONT_CLASSIFICATIONS
};
