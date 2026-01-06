/**
 * AI Analysis JSON Schema Definitions
 * Version 1.1 (added Tier 1.5 and Tier 2 support)
 *
 * Changelog:
 * - 1.1: Added metadata.tier, metadata.advancedMode, metadata.layoutEnabled
 * - 1.1: Added support for layout feature (Tier 2)
 * - 1.1: Added details.mode field for tracking analyzer version
 * - 1.0: Initial schema
 */

const AI_REPORT_SCHEMA_VERSION = "1.1";

/**
 * Validates that an AI report matches the expected schema
 * @param {Object} report - The AI report to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateAIReport(report) {
  const errors = [];

  // Required top-level fields
  if (!report.version) errors.push("Missing 'version' field");
  if (!report.timestamp) errors.push("Missing 'timestamp' field");
  if (!report.jobId) errors.push("Missing 'jobId' field");
  if (!report.pdfPath) errors.push("Missing 'pdfPath' field");
  if (!report.features) errors.push("Missing 'features' object");
  if (!report.overall) errors.push("Missing 'overall' object");
  if (!report.metadata) errors.push("Missing 'metadata' object");

  // Validate features structure
  if (report.features) {
    for (const [featureName, featureData] of Object.entries(report.features)) {
      if (typeof featureData.enabled !== 'boolean') {
        errors.push(`Feature '${featureName}': missing or invalid 'enabled' field`);
      }
      if (typeof featureData.score !== 'number') {
        errors.push(`Feature '${featureName}': missing or invalid 'score' field`);
      }
      if (!Array.isArray(featureData.issues)) {
        errors.push(`Feature '${featureName}': 'issues' must be an array`);
      }
      if (typeof featureData.summary !== 'string') {
        errors.push(`Feature '${featureName}': missing or invalid 'summary' field`);
      }
    }
  }

  // Validate overall structure
  if (report.overall) {
    if (typeof report.overall.score !== 'number') {
      errors.push("Overall: missing or invalid 'score' field");
    }
    if (typeof report.overall.normalizedScore !== 'number') {
      errors.push("Overall: missing or invalid 'normalizedScore' field");
    }
    if (typeof report.overall.passed !== 'boolean') {
      errors.push("Overall: missing or invalid 'passed' field");
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Creates an empty AI report structure
 * @param {Object} params - jobId, pdfPath, jobConfigPath
 * @returns {Object} Empty AI report ready to be populated
 */
function createEmptyReport({ jobId, pdfPath, jobConfigPath }) {
  return {
    version: AI_REPORT_SCHEMA_VERSION,
    timestamp: new Date().toISOString(),
    jobId,
    jobConfigPath,
    pdfPath,
    features: {},
    overall: {
      score: 0,
      maxScore: 0,
      normalizedScore: 0,
      passed: false,
      threshold: 0.85,
      calculation: "",
      grade: "F",
      message: ""
    },
    metadata: {
      duration_ms: 0,
      features_executed: [],
      features_skipped: [],
      errors: [],
      tier: null,  // Will be set by aiRunner (TIER 1, TIER 1.5, or TIER 2)
      advancedMode: false,  // Whether advanced PDF extraction was used
      layoutEnabled: false,  // Whether layout analysis was enabled
      environment: {
        node_version: process.version,
        platform: process.platform,
        aiRunnerVersion: "1.1.0"
      }
    }
  };
}

/**
 * Creates a feature result structure
 * @param {Object} params - enabled, weight, score, issues, summary, details
 * @returns {Object} Feature result matching schema
 */
function createFeatureResult({ enabled, weight, score, issues = [], summary, details = {} }) {
  return {
    enabled,
    weight,
    score,
    maxScore: 1.0,
    issues,
    summary,
    details
  };
}

/**
 * Creates an issue object
 * @param {Object} params - id, severity, page, location, message, recommendation
 * @returns {Object} Issue object matching schema
 */
function createIssue({ id, severity, page = null, location, message, recommendation = null }) {
  return {
    id,
    severity, // "critical", "major", "medium", "minor", "low"
    page,
    location,
    message,
    recommendation
  };
}

/**
 * Calculates overall AI score from feature results
 * @param {Object} features - Features object with typography, whitespace, color
 * @param {number} threshold - Minimum normalized score to pass (default: 0.85)
 * @returns {Object} Overall score object
 */
function calculateOverallScore(features, threshold = 0.85) {
  let totalScore = 0;
  let totalWeight = 0;
  let calculation = [];

  const enabledFeatures = Object.entries(features).filter(([_, data]) => data.enabled);

  for (const [name, data] of enabledFeatures) {
    const { score, weight } = data;
    totalScore += score * weight;
    totalWeight += weight;
    calculation.push(`${name}(${score.toFixed(2)})*${weight}`);
  }

  const normalizedScore = totalWeight > 0 ? totalScore / totalWeight : 0;
  const passed = normalizedScore >= threshold;

  // Assign grade
  let grade;
  if (normalizedScore >= 0.95) grade = "A+";
  else if (normalizedScore >= 0.90) grade = "A";
  else if (normalizedScore >= 0.85) grade = "B+";
  else if (normalizedScore >= 0.80) grade = "B";
  else if (normalizedScore >= 0.75) grade = "C";
  else grade = "F";

  // Assign message
  let message;
  if (grade.startsWith("A")) message = "Excellent AI design quality. " + (normalizedScore < 1.0 ? "Minor improvements possible." : "Perfect score!");
  else if (grade.startsWith("B")) message = "Good AI design quality. Some improvements recommended.";
  else if (grade === "C") message = "Acceptable AI design quality. Several improvements needed.";
  else message = "AI design quality below threshold. Significant improvements required.";

  return {
    score: totalScore,
    maxScore: totalWeight,
    normalizedScore: parseFloat(normalizedScore.toFixed(3)),
    passed,
    threshold,
    calculation: calculation.join(" + ") + ` = ${normalizedScore.toFixed(3)}`,
    grade,
    message
  };
}

module.exports = {
  AI_REPORT_SCHEMA_VERSION,
  validateAIReport,
  createEmptyReport,
  createFeatureResult,
  createIssue,
  calculateOverallScore
};
