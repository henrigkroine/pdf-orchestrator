/**
 * Embedding Generator - OpenAI Text Embeddings
 *
 * Generates vector embeddings for text content using OpenAI's
 * text-embedding-3-large model (3072 dimensions, $0.00013 per 1K tokens).
 *
 * @module embeddingGenerator
 */

import OpenAI from 'openai';
import logger from '../utils/logger.js';

const MODEL = 'text-embedding-3-large';
const VECTOR_SIZE = 3072;
const MAX_TOKENS_PER_BATCH = 8000; // Stay under OpenAI limits

/**
 * Embedding Generator class
 */
class EmbeddingGenerator {
  constructor(config = {}) {
    this.apiKey = config.apiKey || process.env.OPENAI_API_KEY;

    if (!this.apiKey) {
      logger.warn('OpenAI API key not provided. Embeddings will fail.');
    }

    // Initialize OpenAI client
    this.client = new OpenAI({
      apiKey: this.apiKey
    });

    this.model = MODEL;
    this.vectorSize = VECTOR_SIZE;
    this.totalTokensUsed = 0;
    this.totalCostUSD = 0;
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @returns {Promise<Array<number>>} Embedding vector (3072 dimensions)
   */
  async generateEmbedding(text) {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error('Empty text provided');
      }

      // Truncate if too long (8191 tokens max, ~30k chars)
      const maxChars = 30000;
      const truncatedText = text.length > maxChars
        ? text.substring(0, maxChars)
        : text;

      if (text.length > maxChars) {
        logger.warn(`Text truncated from ${text.length} to ${maxChars} chars`);
      }

      // Generate embedding
      const response = await this.client.embeddings.create({
        model: this.model,
        input: truncatedText,
        encoding_format: 'float'
      });

      const embedding = response.data[0].embedding;
      const tokensUsed = response.usage.total_tokens;

      // Track usage
      this.totalTokensUsed += tokensUsed;
      this.totalCostUSD += (tokensUsed / 1000) * 0.00013; // $0.00013 per 1K tokens

      logger.debug(`Generated embedding: ${tokensUsed} tokens, ${embedding.length} dimensions`);

      // Validate embedding size
      if (embedding.length !== this.vectorSize) {
        throw new Error(`Unexpected embedding size: ${embedding.length} (expected ${this.vectorSize})`);
      }

      return embedding;

    } catch (error) {
      if (error.response?.status === 401) {
        logger.error('OpenAI API authentication failed. Check API key.');
      } else if (error.response?.status === 429) {
        logger.error('OpenAI rate limit exceeded. Wait and retry.');
      } else {
        logger.error(`Failed to generate embedding: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   * @param {Array<string>} texts - Array of texts to embed
   * @returns {Promise<Array<Array<number>>>} Array of embedding vectors
   */
  async generateBatchEmbeddings(texts) {
    try {
      if (!texts || texts.length === 0) {
        return [];
      }

      logger.info(`Generating embeddings for ${texts.length} texts...`);

      // Process in batches to avoid rate limits
      const batchSize = 100; // OpenAI supports up to 2048 inputs
      const embeddings = [];

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(texts.length / batchSize);

        logger.debug(`Processing batch ${batchNum}/${totalBatches} (${batch.length} texts)`);

        // Truncate texts if needed
        const truncatedBatch = batch.map(text => {
          const maxChars = 30000;
          return text.length > maxChars ? text.substring(0, maxChars) : text;
        });

        // Generate embeddings for batch
        const response = await this.client.embeddings.create({
          model: this.model,
          input: truncatedBatch,
          encoding_format: 'float'
        });

        // Extract embeddings
        const batchEmbeddings = response.data.map(item => item.embedding);
        embeddings.push(...batchEmbeddings);

        // Track usage
        const tokensUsed = response.usage.total_tokens;
        this.totalTokensUsed += tokensUsed;
        this.totalCostUSD += (tokensUsed / 1000) * 0.00013;

        logger.debug(`Batch ${batchNum} completed: ${tokensUsed} tokens`);

        // Rate limit: wait 100ms between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logger.success(`Generated ${embeddings.length} embeddings (${this.totalTokensUsed} tokens, $${this.totalCostUSD.toFixed(4)})`);

      return embeddings;

    } catch (error) {
      logger.error(`Batch embedding generation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate embedding for a document section
   * Enriches text with metadata for better semantic search
   * @param {Object} section - Document section with metadata
   * @returns {Promise<Array<number>>} Embedding vector
   */
  async generateSectionEmbedding(section) {
    try {
      // Enrich content with metadata for better semantic understanding
      const enrichedText = this.enrichSectionText(section);

      // Generate embedding
      const embedding = await this.generateEmbedding(enrichedText);

      return embedding;

    } catch (error) {
      logger.error(`Failed to generate section embedding: ${error.message}`);
      throw error;
    }
  }

  /**
   * Enrich section text with metadata for better embeddings
   * @param {Object} section - Section with type, content, partner, etc.
   * @returns {string} Enriched text
   */
  enrichSectionText(section) {
    const parts = [];

    // Add section type context
    if (section.section_type) {
      parts.push(`Section type: ${section.section_type}`);
    }

    // Add partner context
    if (section.partner_name) {
      parts.push(`Partner: ${section.partner_name}`);
    }

    // Add industry context
    if (section.metadata?.industry) {
      parts.push(`Industry: ${section.metadata.industry}`);
    }

    // Add main content
    parts.push(section.content);

    // Add performance context if available
    if (section.performance_score && section.performance_score > 0.8) {
      parts.push('This is a high-performing section that achieved excellent results.');
    }

    return parts.join('\n\n');
  }

  /**
   * Compute cosine similarity between two embeddings
   * @param {Array<number>} embedding1 - First embedding
   * @param {Array<number>} embedding2 - Second embedding
   * @returns {number} Similarity score (0-1)
   */
  cosineSimilarity(embedding1, embedding2) {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have same length');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) return 0;

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Get usage statistics
   * @returns {Object} Usage stats
   */
  getUsageStats() {
    return {
      totalTokensUsed: this.totalTokensUsed,
      totalCostUSD: this.totalCostUSD,
      costPerEmbedding: this.totalTokensUsed > 0
        ? this.totalCostUSD / (this.totalTokensUsed / 1000)
        : 0,
      model: this.model,
      vectorSize: this.vectorSize
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats() {
    this.totalTokensUsed = 0;
    this.totalCostUSD = 0;
    logger.debug('Usage statistics reset');
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      logger.info('Testing OpenAI API connection...');

      const embedding = await this.generateEmbedding('test connection');

      if (embedding && embedding.length === this.vectorSize) {
        logger.success('OpenAI API connection successful');
        return true;
      }

      return false;

    } catch (error) {
      logger.error(`OpenAI API connection test failed: ${error.message}`);
      return false;
    }
  }
}

export default EmbeddingGenerator;
