/**
 * Document Indexer - PDF to Vector Database
 *
 * Parses past partnership PDFs, extracts sections, generates embeddings,
 * and stores them in the vector database for semantic retrieval.
 *
 * @module documentIndexer
 */

import fs from 'fs';
import path from 'path';
import { analyzePDF } from '../utils/advancedPdfParser.js';
import logger from '../utils/logger.js';
import RAGClient from './ragClient.js';
import EmbeddingGenerator from './embeddingGenerator.js';

/**
 * Document section types we care about
 */
const SECTION_TYPES = {
  VALUE_PROPOSITION: 'value_proposition',
  PROGRAM_DETAILS: 'program_details',
  METRICS: 'metrics',
  TESTIMONIALS: 'testimonials',
  CTA: 'cta',
  ABOUT: 'about',
  COVER: 'cover'
};

/**
 * Document Indexer class
 */
class DocumentIndexer {
  constructor(config = {}) {
    this.ragClient = new RAGClient(config.qdrant || {});
    this.embeddingGenerator = new EmbeddingGenerator(config.openai || {});
    this.initialized = false;
  }

  /**
   * Initialize connections
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      logger.section('Initializing Document Indexer');

      // Initialize RAG client
      const ragReady = await this.ragClient.initialize();
      if (!ragReady) {
        throw new Error('Failed to initialize RAG client');
      }

      // Test embedding generator
      const embeddingReady = await this.embeddingGenerator.testConnection();
      if (!embeddingReady) {
        throw new Error('Failed to connect to OpenAI API');
      }

      this.initialized = true;
      logger.success('Document Indexer initialized successfully');
      return true;

    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Index a single PDF document
   * @param {string} pdfPath - Path to PDF file
   * @param {Object} metadata - Document metadata
   * @returns {Promise<Object>} Indexing result
   */
  async indexDocument(pdfPath, metadata = {}) {
    try {
      logger.subsection(`Indexing: ${path.basename(pdfPath)}`);

      if (!this.initialized) {
        throw new Error('Indexer not initialized. Call initialize() first.');
      }

      // Validate PDF exists
      if (!fs.existsSync(pdfPath)) {
        throw new Error(`PDF not found: ${pdfPath}`);
      }

      // Parse PDF
      logger.info('Parsing PDF...');
      const pdfAnalysis = await analyzePDF(pdfPath);

      // Extract sections from text blocks
      logger.info('Extracting sections...');
      const sections = this.extractSections(pdfAnalysis.textBlocks, metadata);

      logger.info(`Extracted ${sections.length} sections`);

      // Generate embeddings for all sections
      logger.info('Generating embeddings...');
      const sectionTexts = sections.map(s => this.embeddingGenerator.enrichSectionText(s));
      const embeddings = await this.embeddingGenerator.generateBatchEmbeddings(sectionTexts);

      // Insert into vector database
      logger.info('Storing in vector database...');
      const documentsToInsert = sections.map((section, idx) => ({
        document: section,
        embedding: embeddings[idx]
      }));

      const documentIds = await this.ragClient.batchInsert(documentsToInsert);

      logger.success(`Indexed ${documentIds.length} sections from ${path.basename(pdfPath)}`);

      return {
        success: true,
        pdfPath,
        sectionsIndexed: documentIds.length,
        documentIds,
        usageStats: this.embeddingGenerator.getUsageStats()
      };

    } catch (error) {
      logger.error(`Failed to index document: ${error.message}`);
      return {
        success: false,
        pdfPath,
        error: error.message
      };
    }
  }

  /**
   * Extract structured sections from text blocks
   * Uses heuristics to identify section types based on content
   * @param {Array<Object>} textBlocks - Text blocks from PDF
   * @param {Object} metadata - Document metadata
   * @returns {Array<Object>} Extracted sections
   */
  extractSections(textBlocks, metadata) {
    const sections = [];

    // Group text blocks by page
    const pageGroups = {};
    for (const block of textBlocks) {
      if (!pageGroups[block.page]) {
        pageGroups[block.page] = [];
      }
      pageGroups[block.page].push(block);
    }

    // Process each page
    for (const [pageNum, blocks] of Object.entries(pageGroups)) {
      // Sort blocks by vertical position (top to bottom)
      blocks.sort((a, b) => a.bbox.y - b.bbox.y);

      // Concatenate text for the page
      const pageText = blocks.map(b => b.text).join(' ');

      // Skip if page is mostly empty
      if (pageText.trim().length < 50) continue;

      // Detect section type
      const sectionType = this.detectSectionType(pageText, parseInt(pageNum), blocks);

      // Create section entry
      sections.push({
        partner_name: metadata.partner_name || 'Unknown',
        section_type: sectionType,
        content: pageText,
        document_date: metadata.document_date || Date.now(),
        performance_score: metadata.performance_score || 0.5,
        metadata: {
          page: parseInt(pageNum),
          fileName: metadata.fileName || '',
          industry: metadata.industry || '',
          partnership_type: metadata.partnership_type || '',
          ...metadata
        }
      });
    }

    return sections;
  }

  /**
   * Detect section type based on content and position
   * @param {string} text - Page text
   * @param {number} pageNum - Page number
   * @param {Array<Object>} blocks - Text blocks
   * @returns {string} Section type
   */
  detectSectionType(text, pageNum, blocks) {
    const textLower = text.toLowerCase();

    // Cover page (page 1, large title text)
    if (pageNum === 1) {
      const hasLargeTitle = blocks.some(b => b.fontSize > 30);
      if (hasLargeTitle) {
        return SECTION_TYPES.COVER;
      }
    }

    // Value proposition keywords
    const valueKeywords = ['partnership', 'together', 'impact', 'mission', 'vision', 'why partner'];
    if (valueKeywords.some(kw => textLower.includes(kw))) {
      return SECTION_TYPES.VALUE_PROPOSITION;
    }

    // Program details keywords
    const programKeywords = ['program', 'initiative', 'support', 'training', 'education', 'curriculum'];
    if (programKeywords.some(kw => textLower.includes(kw))) {
      return SECTION_TYPES.PROGRAM_DETAILS;
    }

    // Metrics keywords
    const metricKeywords = ['students reached', 'impact', 'results', 'success', 'data', 'statistics'];
    const hasNumbers = /\d+[,\d]*\s*(students|teachers|schools|hours)/i.test(text);
    if (metricKeywords.some(kw => textLower.includes(kw)) && hasNumbers) {
      return SECTION_TYPES.METRICS;
    }

    // Testimonials keywords
    const testimonialKeywords = ['testimonial', 'quote', 'says', 'shared', 'story'];
    const hasQuotes = text.includes('"') || text.includes('"');
    if (testimonialKeywords.some(kw => textLower.includes(kw)) || hasQuotes) {
      return SECTION_TYPES.TESTIMONIALS;
    }

    // CTA keywords
    const ctaKeywords = ['get started', 'contact', 'join us', 'partner with', 'ready to', 'call to action'];
    if (ctaKeywords.some(kw => textLower.includes(kw))) {
      return SECTION_TYPES.CTA;
    }

    // About section keywords
    const aboutKeywords = ['about teei', 'who we are', 'our mission', 'background'];
    if (aboutKeywords.some(kw => textLower.includes(kw))) {
      return SECTION_TYPES.ABOUT;
    }

    // Default: program details
    return SECTION_TYPES.PROGRAM_DETAILS;
  }

  /**
   * Index multiple documents from a directory
   * @param {string} directoryPath - Path to directory containing PDFs
   * @param {Object} defaultMetadata - Default metadata for all documents
   * @returns {Promise<Object>} Batch indexing results
   */
  async indexDirectory(directoryPath, defaultMetadata = {}) {
    try {
      logger.section(`Indexing Directory: ${directoryPath}`);

      // Find all PDFs
      const files = fs.readdirSync(directoryPath);
      const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

      if (pdfFiles.length === 0) {
        logger.warn('No PDF files found in directory');
        return { success: true, indexed: 0, failed: 0 };
      }

      logger.info(`Found ${pdfFiles.length} PDF files`);

      // Index each PDF
      const results = [];
      for (let i = 0; i < pdfFiles.length; i++) {
        const pdfPath = path.join(directoryPath, pdfFiles[i]);

        // Extract partner name from filename
        const fileName = path.basename(pdfFiles[i], '.pdf');
        const partnerName = this.extractPartnerName(fileName);

        const metadata = {
          ...defaultMetadata,
          fileName,
          partner_name: partnerName
        };

        logger.info(`[${i + 1}/${pdfFiles.length}] Processing ${fileName}...`);

        const result = await this.indexDocument(pdfPath, metadata);
        results.push(result);

        // Small delay between documents to avoid rate limits
        if (i < pdfFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      // Summarize results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;
      const totalSections = results.reduce((sum, r) => sum + (r.sectionsIndexed || 0), 0);

      const finalStats = this.embeddingGenerator.getUsageStats();

      logger.section('Batch Indexing Complete');
      logger.success(`Indexed: ${successful}/${pdfFiles.length} documents`);
      logger.info(`Total sections: ${totalSections}`);
      logger.info(`Failed: ${failed}`);
      logger.info(`Total tokens: ${finalStats.totalTokensUsed}`);
      logger.info(`Total cost: $${finalStats.totalCostUSD.toFixed(4)}`);

      return {
        success: true,
        totalDocuments: pdfFiles.length,
        indexed: successful,
        failed,
        totalSections,
        results,
        usageStats: finalStats
      };

    } catch (error) {
      logger.error(`Directory indexing failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Extract partner name from filename
   * @param {string} fileName - Filename without extension
   * @returns {string} Partner name
   */
  extractPartnerName(fileName) {
    // Remove common prefixes/suffixes
    let name = fileName
      .replace(/^TEEI[-_]/i, '')
      .replace(/[-_](Partnership|Document|PDF|Final|V\d+)$/i, '')
      .replace(/[-_]/g, ' ')
      .trim();

    // Capitalize words
    name = name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return name || 'Unknown';
  }

  /**
   * Re-index all documents (useful after schema changes)
   * @param {string} directoryPath - Path to PDFs
   * @param {Object} options - Reindexing options
   * @returns {Promise<Object>} Results
   */
  async reindexAll(directoryPath, options = {}) {
    try {
      logger.section('Re-indexing All Documents');

      // Delete existing documents if requested
      if (options.clearExisting) {
        logger.warn('Clearing existing documents...');
        // Note: Qdrant doesn't have a simple "delete all" API
        // You'd need to recreate the collection
        logger.info('Manual collection deletion required via Qdrant UI or API');
      }

      // Run directory indexing
      return await this.indexDirectory(directoryPath, options.metadata || {});

    } catch (error) {
      logger.error(`Re-indexing failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get indexer statistics
   * @returns {Promise<Object>} Stats
   */
  async getStats() {
    try {
      const collectionStats = await this.ragClient.getStats();
      const usageStats = this.embeddingGenerator.getUsageStats();

      return {
        collection: collectionStats,
        usage: usageStats,
        initialized: this.initialized
      };

    } catch (error) {
      logger.error(`Failed to get stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Close connections
   */
  async close() {
    await this.ragClient.close();
    logger.info('Document Indexer closed');
  }
}

export default DocumentIndexer;
export { SECTION_TYPES };
