/**
 * RAG Orchestrator - Main RAG Workflow Controller
 *
 * Coordinates the entire RAG workflow: indexing past documents,
 * retrieving relevant patterns, and generating content suggestions.
 *
 * @module ragOrchestrator
 */

import fs from 'fs';
import path from 'path';
import logger from '../utils/logger.js';
import DocumentIndexer from './documentIndexer.js';
import ContentRetriever from './contentRetriever.js';

/**
 * RAG Orchestrator class
 */
class RAGOrchestrator {
  constructor(config = {}) {
    this.config = {
      qdrant: {
        host: config.qdrantHost || process.env.QDRANT_HOST || 'localhost',
        port: config.qdrantPort || process.env.QDRANT_PORT || 6333,
        apiKey: config.qdrantApiKey || process.env.QDRANT_API_KEY || null
      },
      openai: {
        apiKey: config.openaiApiKey || process.env.OPENAI_API_KEY
      }
    };

    this.indexer = new DocumentIndexer(this.config);
    this.retriever = new ContentRetriever(this.config);
    this.initialized = false;
  }

  /**
   * Initialize RAG system
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      logger.section('RAG Orchestrator Initialization');

      // Check if OpenAI API key is configured
      if (!this.config.openai.apiKey) {
        logger.error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.');
        return false;
      }

      // Initialize indexer
      logger.info('Initializing indexer...');
      const indexerReady = await this.indexer.initialize();
      if (!indexerReady) {
        logger.error('Failed to initialize indexer');
        return false;
      }

      // Initialize retriever
      logger.info('Initializing retriever...');
      const retrieverReady = await this.retriever.initialize();
      if (!retrieverReady) {
        logger.error('Failed to initialize retriever');
        return false;
      }

      this.initialized = true;
      logger.success('RAG Orchestrator initialized successfully');

      // Log connection info
      logger.info(`Qdrant: ${this.config.qdrant.host}:${this.config.qdrant.port}`);
      logger.info(`OpenAI: ${this.config.openai.apiKey ? 'Configured' : 'Not configured'}`);

      return true;

    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Index a directory of past partnership PDFs
   * @param {string} pdfDirectory - Path to directory containing PDFs
   * @param {Object} metadata - Default metadata for documents
   * @returns {Promise<Object>} Indexing results
   */
  async indexPastDocuments(pdfDirectory, metadata = {}) {
    try {
      if (!this.initialized) {
        throw new Error('RAG system not initialized');
      }

      logger.section('Indexing Past Partnership Documents');
      logger.info(`Directory: ${pdfDirectory}`);

      // Validate directory
      if (!fs.existsSync(pdfDirectory)) {
        throw new Error(`Directory not found: ${pdfDirectory}`);
      }

      // Index all PDFs in directory
      const result = await this.indexer.indexDirectory(pdfDirectory, metadata);

      return result;

    } catch (error) {
      logger.error(`Indexing failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get content suggestions for a new partnership document
   * @param {Object} partnerInfo - Partner information
   * @returns {Promise<Object>} Content suggestions
   */
  async getSuggestionsForPartner(partnerInfo) {
    try {
      if (!this.initialized) {
        throw new Error('RAG system not initialized');
      }

      logger.section('Generating Content Suggestions');
      logger.info(`Partner: ${partnerInfo.partner_name || 'Unknown'}`);
      logger.info(`Industry: ${partnerInfo.industry || 'Unknown'}`);

      // Retrieve relevant content
      const suggestions = await this.retriever.retrieveRelevantContent(partnerInfo);

      return suggestions;

    } catch (error) {
      logger.error(`Suggestion generation failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enrich job config with RAG suggestions
   * @param {Object} jobConfig - Original job config
   * @returns {Promise<Object>} Enriched job config
   */
  async enrichJobConfig(jobConfig) {
    try {
      if (!this.initialized) {
        throw new Error('RAG system not initialized');
      }

      // Check if RAG is enabled
      if (!jobConfig.planning?.rag_enabled) {
        logger.info('RAG not enabled in job config');
        return jobConfig;
      }

      logger.section('Enriching Job Config with RAG Suggestions');

      // Extract partner info from job config
      const partnerInfo = {
        partner_name: jobConfig.content?.partner_name || jobConfig.name || 'Unknown',
        industry: jobConfig.content?.industry || jobConfig.metadata?.industry || 'General',
        partnership_type: jobConfig.content?.partnership_type || 'standard'
      };

      // Get suggestions
      const suggestions = await this.getSuggestionsForPartner(partnerInfo);

      // Add suggestions to job config
      const enrichedConfig = {
        ...jobConfig,
        rag_suggestions: suggestions
      };

      logger.success('Job config enriched with RAG suggestions');
      logger.info(`Confidence: ${(suggestions.summary?.avgConfidence * 100).toFixed(1)}%`);
      logger.info(`Examples found: ${suggestions.summary?.totalExamplesFound || 0}`);

      return enrichedConfig;

    } catch (error) {
      logger.error(`Job config enrichment failed: ${error.message}`);
      // Return original config on error (graceful fallback)
      return jobConfig;
    }
  }

  /**
   * Build knowledge base from example PDFs
   * Utility function for initial setup
   * @param {string} examplesDirectory - Path to example PDFs
   * @returns {Promise<Object>} Build results
   */
  async buildKnowledgeBase(examplesDirectory) {
    try {
      logger.section('Building RAG Knowledge Base');

      if (!this.initialized) {
        const initSuccess = await this.initialize();
        if (!initSuccess) {
          throw new Error('Failed to initialize RAG system');
        }
      }

      // Look for common example directories if not specified
      if (!examplesDirectory) {
        const possibleDirs = [
          'reference-pdfs',
          'exports',
          'deliverables',
          'example-jobs'
        ];

        for (const dir of possibleDirs) {
          if (fs.existsSync(dir)) {
            const files = fs.readdirSync(dir);
            if (files.some(f => f.toLowerCase().endsWith('.pdf'))) {
              examplesDirectory = dir;
              logger.info(`Found PDFs in: ${dir}`);
              break;
            }
          }
        }

        if (!examplesDirectory) {
          throw new Error('No PDF directory found. Specify examplesDirectory parameter.');
        }
      }

      // Index all examples
      const result = await this.indexPastDocuments(examplesDirectory, {
        indexed_at: Date.now(),
        source: 'initial_build'
      });

      if (result.success) {
        logger.section('Knowledge Base Build Complete');
        logger.success(`Indexed ${result.indexed} documents`);
        logger.info(`Total sections: ${result.totalSections}`);
        logger.info(`Total cost: $${result.usageStats.totalCostUSD.toFixed(4)}`);
      }

      return result;

    } catch (error) {
      logger.error(`Knowledge base build failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test RAG system with a sample query
   * @param {string} queryText - Test query
   * @returns {Promise<Array<Object>>} Test results
   */
  async testQuery(queryText) {
    try {
      if (!this.initialized) {
        throw new Error('RAG system not initialized');
      }

      logger.section('Testing RAG Query');
      logger.info(`Query: "${queryText}"`);

      const results = await this.retriever.search(queryText, {
        limit: 5
      });

      logger.success(`Found ${results.length} results`);

      if (results.length > 0) {
        logger.info('\nTop 3 results:');
        results.slice(0, 3).forEach((result, idx) => {
          logger.info(`\n${idx + 1}. ${result.partner_name} - ${result.section_type}`);
          logger.info(`   Score: ${result.finalScore.toFixed(3)}`);
          logger.info(`   Snippet: ${result.content.substring(0, 150)}...`);
        });
      }

      return results;

    } catch (error) {
      logger.error(`Test query failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get system statistics
   * @returns {Promise<Object>} System stats
   */
  async getStats() {
    try {
      const indexerStats = await this.indexer.getStats();
      const retrieverStats = this.retriever.getUsageStats();

      return {
        initialized: this.initialized,
        indexer: indexerStats,
        retriever: retrieverStats,
        config: {
          qdrantHost: this.config.qdrant.host,
          qdrantPort: this.config.qdrant.port,
          openaiConfigured: !!this.config.openai.apiKey
        }
      };

    } catch (error) {
      logger.error(`Failed to get stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if RAG system is ready
   * @returns {boolean} Ready status
   */
  isReady() {
    return this.initialized;
  }

  /**
   * Close all connections
   */
  async close() {
    await this.indexer.close();
    await this.retriever.close();
    this.initialized = false;
    logger.info('RAG Orchestrator closed');
  }
}

export default RAGOrchestrator;
