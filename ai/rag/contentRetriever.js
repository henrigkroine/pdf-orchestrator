/**
 * Content Retriever - Semantic Search for Past Patterns
 *
 * Retrieves relevant content patterns from past partnership documents
 * using semantic search, keyword matching, and performance-based ranking.
 *
 * @module contentRetriever
 */

import logger from '../utils/logger.js';
import RAGClient from './ragClient.js';
import EmbeddingGenerator from './embeddingGenerator.js';
import { SECTION_TYPES } from './documentIndexer.js';

/**
 * Content Retriever class
 */
class ContentRetriever {
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
      logger.info('Initializing Content Retriever...');

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
      logger.success('Content Retriever initialized successfully');
      return true;

    } catch (error) {
      logger.error(`Initialization failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Retrieve relevant content for a new partnership document
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Retrieved content suggestions
   */
  async retrieveRelevantContent(query) {
    try {
      if (!this.initialized) {
        throw new Error('Retriever not initialized. Call initialize() first.');
      }

      logger.subsection('Retrieving Relevant Content');
      logger.info(`Partner: ${query.partner_name || 'N/A'}`);
      logger.info(`Industry: ${query.industry || 'N/A'}`);

      const results = {};

      // Retrieve content for each section type
      for (const sectionType of Object.values(SECTION_TYPES)) {
        // Skip cover page (not useful for suggestions)
        if (sectionType === SECTION_TYPES.COVER) continue;

        logger.debug(`Searching for ${sectionType} examples...`);

        const sectionQuery = this.buildSectionQuery(sectionType, query);
        const embedding = await this.embeddingGenerator.generateEmbedding(sectionQuery);

        // Hybrid search with performance ranking
        const searchResults = await this.ragClient.hybridSearch(embedding, {
          limit: 5,
          keywords: this.getSectionKeywords(sectionType, query),
          sectionType: sectionType,
          minPerformanceScore: 0.6, // Only get good examples
          boostRecent: true
        });

        // Process results
        if (searchResults.length > 0) {
          results[sectionType] = this.processSearchResults(searchResults, sectionType);
        }
      }

      // Generate suggestions summary
      const suggestions = this.generateSuggestions(results, query);

      logger.success(`Retrieved content for ${Object.keys(results).length} section types`);

      return suggestions;

    } catch (error) {
      logger.error(`Content retrieval failed: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Build query text for specific section type
   * @param {string} sectionType - Type of section
   * @param {Object} query - Query parameters
   * @returns {string} Query text
   */
  buildSectionQuery(sectionType, query) {
    const parts = [];

    // Add section type
    parts.push(`Section type: ${sectionType}`);

    // Add partner context
    if (query.partner_name) {
      parts.push(`Partner: ${query.partner_name}`);
    }

    // Add industry context
    if (query.industry) {
      parts.push(`Industry: ${query.industry}`);
    }

    // Add section-specific context
    switch (sectionType) {
      case SECTION_TYPES.VALUE_PROPOSITION:
        parts.push('Why should organizations partner with TEEI? What is the value proposition?');
        break;
      case SECTION_TYPES.PROGRAM_DETAILS:
        parts.push('What programs and initiatives does TEEI offer? What support is provided?');
        break;
      case SECTION_TYPES.METRICS:
        parts.push('What impact has TEEI achieved? What are the key metrics and results?');
        break;
      case SECTION_TYPES.TESTIMONIALS:
        parts.push('What do partners and beneficiaries say about TEEI?');
        break;
      case SECTION_TYPES.CTA:
        parts.push('How can partners get started? What are the next steps?');
        break;
      case SECTION_TYPES.ABOUT:
        parts.push('What is TEEI? What is its mission and background?');
        break;
    }

    return parts.join('\n\n');
  }

  /**
   * Get keywords for section type
   * @param {string} sectionType - Section type
   * @param {Object} query - Query parameters
   * @returns {Array<string>} Keywords
   */
  getSectionKeywords(sectionType, query) {
    const keywords = [];

    // Add partner-specific keywords
    if (query.partner_name) {
      keywords.push(query.partner_name);
    }

    if (query.industry) {
      keywords.push(query.industry);
    }

    // Add section-specific keywords
    switch (sectionType) {
      case SECTION_TYPES.VALUE_PROPOSITION:
        keywords.push('partnership', 'impact', 'mission', 'why partner');
        break;
      case SECTION_TYPES.PROGRAM_DETAILS:
        keywords.push('program', 'training', 'support', 'education');
        break;
      case SECTION_TYPES.METRICS:
        keywords.push('students', 'results', 'impact', 'data');
        break;
      case SECTION_TYPES.TESTIMONIALS:
        keywords.push('testimonial', 'quote', 'story');
        break;
      case SECTION_TYPES.CTA:
        keywords.push('contact', 'get started', 'join');
        break;
      case SECTION_TYPES.ABOUT:
        keywords.push('TEEI', 'mission', 'who we are');
        break;
    }

    return keywords;
  }

  /**
   * Process search results for a section
   * @param {Array<Object>} results - Raw search results
   * @param {string} sectionType - Section type
   * @returns {Object} Processed results
   */
  processSearchResults(results, sectionType) {
    // Take top 3 results
    const topResults = results.slice(0, 3);

    // Extract content snippets
    const examples = topResults.map(result => ({
      content: this.extractSnippet(result.content, 300),
      partner: result.partner_name,
      score: result.finalScore,
      performanceScore: result.performance_score,
      source: result.metadata.fileName || 'Unknown'
    }));

    // Calculate confidence based on scores
    const avgScore = examples.reduce((sum, ex) => sum + ex.score, 0) / examples.length;
    const confidence = Math.min(avgScore * 1.2, 1.0); // Scale up confidence slightly

    return {
      sectionType,
      examples,
      confidence,
      totalMatches: results.length
    };
  }

  /**
   * Extract snippet from content
   * @param {string} content - Full content
   * @param {number} maxLength - Max snippet length
   * @returns {string} Snippet
   */
  extractSnippet(content, maxLength = 300) {
    if (content.length <= maxLength) return content;

    // Find a good breaking point (sentence end)
    let snippet = content.substring(0, maxLength);
    const lastPeriod = snippet.lastIndexOf('.');
    const lastQuestion = snippet.lastIndexOf('?');
    const lastExclamation = snippet.lastIndexOf('!');

    const breakPoint = Math.max(lastPeriod, lastQuestion, lastExclamation);

    if (breakPoint > maxLength * 0.7) {
      // Good break point found
      snippet = content.substring(0, breakPoint + 1);
    } else {
      // No good break point, just truncate
      snippet += '...';
    }

    return snippet.trim();
  }

  /**
   * Generate consolidated suggestions from all results
   * @param {Object} results - Results by section type
   * @param {Object} query - Original query
   * @returns {Object} Structured suggestions
   */
  generateSuggestions(results, query) {
    const suggestions = {
      success: true,
      partner_name: query.partner_name || 'New Partner',
      industry: query.industry || 'General',
      timestamp: new Date().toISOString(),
      sections: {},
      summary: {
        totalExamplesFound: 0,
        avgConfidence: 0,
        recommendedApproach: ''
      }
    };

    let totalConfidence = 0;
    let sectionCount = 0;

    // Process each section type
    for (const [sectionType, sectionData] of Object.entries(results)) {
      suggestions.sections[sectionType] = {
        recommended: sectionData.examples[0]?.content || '',
        alternatives: sectionData.examples.slice(1).map(ex => ex.content),
        confidence: sectionData.confidence,
        sourceDocuments: sectionData.examples.map(ex => ({
          partner: ex.partner,
          source: ex.source,
          performanceScore: ex.performanceScore
        }))
      };

      suggestions.summary.totalExamplesFound += sectionData.examples.length;
      totalConfidence += sectionData.confidence;
      sectionCount++;
    }

    // Calculate average confidence
    suggestions.summary.avgConfidence = sectionCount > 0
      ? totalConfidence / sectionCount
      : 0;

    // Recommend approach based on confidence
    if (suggestions.summary.avgConfidence >= 0.85) {
      suggestions.summary.recommendedApproach = 'High confidence - Use suggested patterns with minor customization';
    } else if (suggestions.summary.avgConfidence >= 0.70) {
      suggestions.summary.recommendedApproach = 'Medium confidence - Use as inspiration, adapt significantly';
    } else {
      suggestions.summary.recommendedApproach = 'Low confidence - Create custom content, use only as loose reference';
    }

    return suggestions;
  }

  /**
   * Search for specific content (general query)
   * @param {string} queryText - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Search results
   */
  async search(queryText, options = {}) {
    try {
      if (!this.initialized) {
        throw new Error('Retriever not initialized');
      }

      logger.info(`Searching for: "${queryText}"`);

      // Generate query embedding
      const embedding = await this.embeddingGenerator.generateEmbedding(queryText);

      // Search
      const results = await this.ragClient.hybridSearch(embedding, {
        limit: options.limit || 10,
        keywords: options.keywords || [],
        sectionType: options.sectionType || null,
        minPerformanceScore: options.minPerformanceScore || 0.0,
        boostRecent: options.boostRecent !== false
      });

      logger.success(`Found ${results.length} results`);

      return results;

    } catch (error) {
      logger.error(`Search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Find similar documents to a given text
   * @param {string} text - Reference text
   * @param {Object} options - Options
   * @returns {Promise<Array<Object>>} Similar documents
   */
  async findSimilar(text, options = {}) {
    try {
      logger.info('Finding similar documents...');

      const embedding = await this.embeddingGenerator.generateEmbedding(text);
      const results = await this.ragClient.search(embedding, {
        limit: options.limit || 5,
        scoreThreshold: options.threshold || 0.7
      });

      return results;

    } catch (error) {
      logger.error(`Find similar failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Get usage statistics
   * @returns {Object} Stats
   */
  getUsageStats() {
    return this.embeddingGenerator.getUsageStats();
  }

  /**
   * Close connections
   */
  async close() {
    await this.ragClient.close();
    logger.info('Content Retriever closed');
  }
}

export default ContentRetriever;
