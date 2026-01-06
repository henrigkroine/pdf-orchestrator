/**
 * PDF Parsing Utilities
 * Simplified PDF analysis for whitespace and color extraction
 * NOTE: Enhanced version available in advancedPdfParser.js for Tier 1.5
 */

const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const logger = require('./logger');

/**
 * Get basic PDF information
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Object>} { pageCount, pageSize }
 */
async function getPDFInfo(pdfPath) {
  try {
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const pageCount = pdfDoc.getPageCount();
    const firstPage = pdfDoc.getPage(0);
    const { width, height } = firstPage.getSize();

    return {
      pageCount,
      pageSize: { width, height }
    };
  } catch (error) {
    logger.error(`Failed to get PDF info: ${error.message}`);
    throw error;
  }
}

/**
 * Estimate text coverage for each page
 * This is a simplified heuristic - more advanced would use pdf.js or pdfplumber
 * @param {string} pdfPath - Path to PDF file
 * @returns {Promise<Array>} Array of { page, textCoverage, textBlocks }
 */
async function estimateTextCoverage(pdfPath) {
  try {
    const info = await getPDFInfo(pdfPath);
    const { pageCount } = info;

    // Simplified heuristic: Return estimated coverage
    // In production, would use pdf.js or pdfplumber to extract actual text blocks
    //
    // For now, we'll return placeholder values that will be refined
    // based on page roles if available in job config
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
      pages.push({
        page: i + 1,
        textCoverage: 0.30, // Placeholder: assume 30% coverage
        textBlocks: 10,      // Placeholder: assume 10 text blocks
        estimatedOnly: true  // Flag to indicate this is a placeholder
      });
    }

    logger.debug(`Estimated text coverage for ${pageCount} pages (placeholder values)`);
    return pages;

  } catch (error) {
    logger.error(`Failed to estimate text coverage: ${error.message}`);
    throw error;
  }
}

/**
 * Get page roles from job config
 * @param {Object} jobConfig - Full job configuration
 * @returns {Array} Array of page roles (e.g., ["cover", "about", "programs", "cta"])
 */
function getPageRoles(jobConfig) {
  // Check if page roles are defined in job config
  const tfuReqs = jobConfig.tfu_requirements || {};
  const pageCount = tfuReqs.page_count || 4;

  // Default roles for TFU 4-page documents
  if (pageCount === 4) {
    return ["cover", "about", "programs", "cta"];
  }

  // Generic roles for other page counts
  const roles = ["cover"];
  for (let i = 1; i < pageCount - 1; i++) {
    roles.push(`content_${i}`);
  }
  roles.push("closing");

  return roles;
}

/**
 * Apply role-based heuristics to text coverage estimates
 * @param {Array} pages - Pages from estimateTextCoverage()
 * @param {Array} roles - Page roles
 * @returns {Array} Enhanced pages with role-based adjustments
 */
function applyRoleHeuristics(pages, roles) {
  const optimalCoverage = {
    cover: { min: 0.10, max: 0.20, blocks: [2, 5] },
    about: { min: 0.30, max: 0.45, blocks: [8, 15] },
    programs: { min: 0.30, max: 0.45, blocks: [15, 25] },
    cta: { min: 0.20, max: 0.35, blocks: [4, 8] },
    content: { min: 0.30, max: 0.40, blocks: [10, 20] },
    closing: { min: 0.15, max: 0.30, blocks: [3, 7] }
  };

  return pages.map((page, index) => {
    const role = roles[index] || "content";
    const baseRole = role.startsWith("content_") ? "content" : role;
    const optimal = optimalCoverage[baseRole] || optimalCoverage.content;

    return {
      ...page,
      role,
      optimalRange: { min: optimal.min, max: optimal.max },
      optimalBlocks: optimal.blocks
    };
  });
}

module.exports = {
  getPDFInfo,
  estimateTextCoverage,
  getPageRoles,
  applyRoleHeuristics
};
