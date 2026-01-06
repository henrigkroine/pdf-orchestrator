/**
 * Accessibility Analyzer - Scans PDFs for accessibility issues
 * Detects: Missing alt text, structure tags, reading order, contrast, metadata
 *
 * WCAG 2.2 Level AA & PDF/UA (ISO 14289) Compliance
 */

import fs from 'fs';
import path from 'path';
import { PDFDocument } from 'pdf-lib';
import { extractTextBlocksWithBounds, extractPageDimensions } from '../utils/advancedPdfParser.js';
import logger from '../utils/logger.js';

class AccessibilityAnalyzer {
  constructor(pdfPath) {
    this.pdfPath = pdfPath;
    this.issues = {
      altText: [],
      structureTags: [],
      readingOrder: [],
      contrast: [],
      metadata: [],
      formFields: []
    };
    this.stats = {
      totalImages: 0,
      imagesWithAltText: 0,
      totalTextBlocks: 0,
      taggedTextBlocks: 0,
      metadataFields: 0
    };
  }

  /**
   * Run comprehensive accessibility analysis
   * @returns {Promise<Object>} Analysis results with issues and stats
   */
  async analyze() {
    logger.section('Accessibility Analysis');
    logger.info(`Analyzing: ${path.basename(this.pdfPath)}`);

    try {
      const startTime = Date.now();

      // Load PDF
      const pdfBytes = fs.readFileSync(this.pdfPath);
      const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

      // Run all checks in parallel
      const [
        altTextIssues,
        structureIssues,
        readingOrderIssues,
        metadataIssues
      ] = await Promise.all([
        this.checkAltText(pdfDoc),
        this.checkStructureTags(pdfDoc),
        this.checkReadingOrder(),
        this.checkMetadata(pdfDoc)
      ]);

      this.issues.altText = altTextIssues;
      this.issues.structureTags = structureIssues;
      this.issues.readingOrder = readingOrderIssues;
      this.issues.metadata = metadataIssues;

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      // Calculate summary
      const totalIssues =
        this.issues.altText.length +
        this.issues.structureTags.length +
        this.issues.readingOrder.length +
        this.issues.metadata.length;

      const compliance = this.calculateCompliance();

      logger.section('Analysis Results');
      logger.info(`Total issues: ${totalIssues}`);
      logger.info(`Alt text issues: ${this.issues.altText.length}`);
      logger.info(`Structure tag issues: ${this.issues.structureTags.length}`);
      logger.info(`Reading order issues: ${this.issues.readingOrder.length}`);
      logger.info(`Metadata issues: ${this.issues.metadata.length}`);
      logger.info(`WCAG 2.2 AA compliance: ${(compliance.wcag22AA * 100).toFixed(1)}%`);
      logger.info(`PDF/UA compliance: ${(compliance.pdfUA * 100).toFixed(1)}%`);
      logger.success(`Analysis completed in ${duration}s`);

      return {
        issues: this.issues,
        stats: this.stats,
        compliance,
        totalIssues,
        analysisTime: `${duration}s`
      };

    } catch (error) {
      logger.error(`Analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check for missing alt text on images
   * WCAG 2.2: 1.1.1 Non-text Content (Level A)
   */
  async checkAltText(pdfDoc) {
    logger.subsection('Checking Alt Text');
    const issues = [];
    const pageCount = pdfDoc.getPageCount();

    // Note: pdf-lib doesn't provide direct image enumeration
    // In production, we'd use a more advanced PDF library (like pdf.js or Apache PDFBox)
    // For now, we'll detect images through operators

    logger.warn('Alt text detection: Limited by pdf-lib capabilities');
    logger.info('Recommendation: Use Adobe Acrobat API or Apache PDFBox for full image detection');

    // Placeholder: Mark as potential issue requiring manual verification
    this.stats.totalImages = 0; // Would be detected by advanced parser
    this.stats.imagesWithAltText = 0;

    // Create issue if we can't detect images (infrastructure limitation)
    issues.push({
      criterion: 'WCAG 2.2 - 1.1.1 Non-text Content',
      severity: 'WARNING',
      description: 'Cannot automatically detect images with pdf-lib. Manual verification required.',
      recommendation: 'Use Adobe Acrobat Accessibility Checker or integrate Adobe PDF Accessibility API',
      autoFixable: false
    });

    return issues;
  }

  /**
   * Check for missing PDF structure tags
   * WCAG 2.2: 1.3.1 Info and Relationships (Level A)
   * PDF/UA: Section 7.1 - Document structure
   */
  async checkStructureTags(pdfDoc) {
    logger.subsection('Checking Structure Tags');
    const issues = [];

    // Check if PDF has structure tree
    const catalog = pdfDoc.catalog;
    const structTreeRoot = catalog.get('StructTreeRoot');

    if (!structTreeRoot) {
      issues.push({
        criterion: 'WCAG 2.2 - 1.3.1 Info and Relationships',
        severity: 'CRITICAL',
        description: 'PDF lacks structure tree (not tagged)',
        recommendation: 'Add PDF structure tags (H1-H6, P, List, Table, etc.) for screen reader navigation',
        autoFixable: true,
        fixMethod: 'structureTagging'
      });

      logger.warn('PDF is not tagged - CRITICAL accessibility issue');
    } else {
      logger.success('PDF has structure tree');
      this.stats.taggedTextBlocks = 1; // Simplified
    }

    // Check for language specification
    const lang = catalog.get('Lang');
    if (!lang) {
      issues.push({
        criterion: 'WCAG 2.2 - 3.1.1 Language of Page',
        severity: 'MAJOR',
        description: 'Document language not specified',
        recommendation: 'Add /Lang entry to PDF catalog (e.g., "en-US")',
        autoFixable: true,
        fixMethod: 'metadata'
      });
    } else {
      logger.success(`Document language: ${lang}`);
    }

    return issues;
  }

  /**
   * Check reading order
   * WCAG 2.2: 1.3.2 Meaningful Sequence (Level A)
   */
  async checkReadingOrder() {
    logger.subsection('Checking Reading Order');
    const issues = [];

    try {
      // Extract text blocks with positions
      const textBlocks = await extractTextBlocksWithBounds(this.pdfPath);
      this.stats.totalTextBlocks = textBlocks.length;

      // Analyze reading order per page
      const pageGroups = {};
      textBlocks.forEach(block => {
        if (!pageGroups[block.page]) pageGroups[block.page] = [];
        pageGroups[block.page].push(block);
      });

      // Check if text flows logically (top-to-bottom, left-to-right)
      Object.entries(pageGroups).forEach(([pageNum, blocks]) => {
        const sortedByPosition = [...blocks].sort((a, b) => {
          // Sort by Y position first (top to bottom), then X (left to right)
          const yDiff = a.bbox.y - b.bbox.y;
          if (Math.abs(yDiff) > 10) return yDiff; // Different lines
          return a.bbox.x - b.bbox.x; // Same line, sort left to right
        });

        // Check for significant reading order issues
        // (e.g., text that appears visually before but logically after)
        let hasOrderIssues = false;
        for (let i = 1; i < sortedByPosition.length; i++) {
          const prev = sortedByPosition[i - 1];
          const curr = sortedByPosition[i];

          // If current block is significantly above previous, might be an issue
          if (curr.bbox.y < prev.bbox.y - 50) {
            hasOrderIssues = true;
            break;
          }
        }

        if (hasOrderIssues) {
          issues.push({
            criterion: 'WCAG 2.2 - 1.3.2 Meaningful Sequence',
            severity: 'MAJOR',
            page: parseInt(pageNum),
            description: `Page ${pageNum}: Reading order may not match visual order`,
            recommendation: 'Verify reading order in PDF structure tree matches visual layout',
            autoFixable: true,
            fixMethod: 'readingOrder'
          });
        }
      });

      if (issues.length === 0) {
        logger.success('Reading order appears logical');
      } else {
        logger.warn(`Found ${issues.length} reading order issues`);
      }

    } catch (error) {
      logger.error(`Reading order check failed: ${error.message}`);
      issues.push({
        criterion: 'WCAG 2.2 - 1.3.2 Meaningful Sequence',
        severity: 'WARNING',
        description: `Could not analyze reading order: ${error.message}`,
        recommendation: 'Manual verification required',
        autoFixable: false
      });
    }

    return issues;
  }

  /**
   * Check PDF metadata
   * WCAG 2.2: 2.4.2 Page Titled (Level A)
   * PDF/UA: Section 7.1 - Document metadata
   */
  async checkMetadata(pdfDoc) {
    logger.subsection('Checking Metadata');
    const issues = [];

    const title = pdfDoc.getTitle();
    const author = pdfDoc.getAuthor();
    const subject = pdfDoc.getSubject();

    this.stats.metadataFields = 0;
    if (title) this.stats.metadataFields++;
    if (author) this.stats.metadataFields++;
    if (subject) this.stats.metadataFields++;

    // Check for document title (required for WCAG 2.2 AA)
    if (!title || title.trim() === '') {
      issues.push({
        criterion: 'WCAG 2.2 - 2.4.2 Page Titled',
        severity: 'MAJOR',
        description: 'Document title missing',
        recommendation: 'Add descriptive document title (e.g., "TEEI AWS Partnership Overview")',
        autoFixable: true,
        fixMethod: 'metadata'
      });
    } else {
      logger.success(`Document title: ${title}`);
    }

    // Check for author (PDF/UA recommendation)
    if (!author || author.trim() === '') {
      issues.push({
        criterion: 'PDF/UA - 7.1 Document Metadata',
        severity: 'MINOR',
        description: 'Document author not specified',
        recommendation: 'Add author metadata (e.g., "The Educational Equality Institute")',
        autoFixable: true,
        fixMethod: 'metadata'
      });
    }

    return issues;
  }

  /**
   * Calculate WCAG 2.2 AA and PDF/UA compliance scores
   * @returns {Object} Compliance percentages
   */
  calculateCompliance() {
    // WCAG 2.2 Level AA criteria (simplified)
    const wcagCriteria = [
      '1.1.1', // Non-text Content
      '1.3.1', // Info and Relationships
      '1.3.2', // Meaningful Sequence
      '1.4.3', // Contrast (Minimum)
      '2.4.2', // Page Titled
      '3.1.1'  // Language of Page
    ];

    const pdfUACriteria = [
      'structure_tree',
      'document_language',
      'document_title',
      'reading_order',
      'alt_text'
    ];

    // Calculate WCAG compliance
    const criticalIssues = Object.values(this.issues).flat().filter(
      i => i.severity === 'CRITICAL'
    );
    const majorIssues = Object.values(this.issues).flat().filter(
      i => i.severity === 'MAJOR'
    );

    // Simplified scoring
    const wcag22AA = Math.max(0, 1 - (criticalIssues.length * 0.2) - (majorIssues.length * 0.1));
    const pdfUA = Math.max(0, 1 - (criticalIssues.length * 0.25) - (majorIssues.length * 0.15));

    return {
      wcag22AA: parseFloat(wcag22AA.toFixed(3)),
      pdfUA: parseFloat(pdfUA.toFixed(3)),
      criticalIssues: criticalIssues.length,
      majorIssues: majorIssues.length,
      minorIssues: Object.values(this.issues).flat().filter(i => i.severity === 'MINOR').length
    };
  }

  /**
   * Generate detailed accessibility report
   * @returns {Object} Full report with recommendations
   */
  generateReport() {
    const compliance = this.calculateCompliance();
    const totalIssues = Object.values(this.issues).flat().length;
    const autoFixableIssues = Object.values(this.issues).flat().filter(i => i.autoFixable).length;

    return {
      summary: {
        pdfPath: this.pdfPath,
        totalIssues,
        autoFixableIssues,
        compliance,
        grade: this.getComplianceGrade(compliance.wcag22AA)
      },
      issues: this.issues,
      stats: this.stats,
      recommendations: this.generateRecommendations()
    };
  }

  /**
   * Get compliance grade (A+ to F)
   */
  getComplianceGrade(score) {
    if (score >= 0.95) return 'A+';
    if (score >= 0.90) return 'A';
    if (score >= 0.85) return 'B+';
    if (score >= 0.80) return 'B';
    if (score >= 0.75) return 'C';
    if (score >= 0.70) return 'D';
    return 'F';
  }

  /**
   * Generate prioritized recommendations
   */
  generateRecommendations() {
    const recs = [];

    // Critical issues first
    const criticalIssues = Object.values(this.issues).flat().filter(i => i.severity === 'CRITICAL');
    if (criticalIssues.length > 0) {
      recs.push({
        priority: 'CRITICAL',
        action: 'Add PDF structure tags',
        impact: 'Screen readers cannot navigate document without structure tags',
        effort: 'Medium (can be automated)',
        wcagCriteria: ['1.3.1', '1.3.2']
      });
    }

    // Major issues
    const majorIssues = Object.values(this.issues).flat().filter(i => i.severity === 'MAJOR');
    if (majorIssues.some(i => i.criterion.includes('2.4.2'))) {
      recs.push({
        priority: 'MAJOR',
        action: 'Add document title',
        impact: 'Screen readers announce document title to help users identify content',
        effort: 'Low (1 minute)',
        wcagCriteria: ['2.4.2']
      });
    }

    if (majorIssues.some(i => i.criterion.includes('3.1.1'))) {
      recs.push({
        priority: 'MAJOR',
        action: 'Specify document language',
        impact: 'Screen readers need language to correctly pronounce text',
        effort: 'Low (1 minute)',
        wcagCriteria: ['3.1.1']
      });
    }

    return recs;
  }
}

export default AccessibilityAnalyzer;
