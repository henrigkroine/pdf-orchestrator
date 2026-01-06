/**
 * RAG Client - Vector Database Integration
 *
 * Manages connections to Qdrant vector database for storing and retrieving
 * document embeddings and content patterns from past partnership documents.
 *
 * @module ragClient
 */

import { QdrantClient } from '@qdrant/js-client-rest';
import logger from '../utils/logger.js';

const COLLECTION_NAME = 'teei_partnership_documents';
const VECTOR_SIZE = 3072; // OpenAI text-embedding-3-large dimension

/**
 * RAG Client class for vector database operations
 */
class RAGClient {
  constructor(config = {}) {
    this.host = config.host || process.env.QDRANT_HOST || 'localhost';
    this.port = config.port || process.env.QDRANT_PORT || 6333;
    this.apiKey = config.apiKey || process.env.QDRANT_API_KEY || null;

    // Initialize client
    this.client = new QdrantClient({
      url: `http://${this.host}:${this.port}`,
      apiKey: this.apiKey
    });

    this.isConnected = false;
    this.collectionExists = false;
  }

  /**
   * Initialize connection and ensure collection exists
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      logger.info('Initializing RAG client...');

      // Test connection
      const health = await this.client.api('cluster').get();
      this.isConnected = true;
      logger.success(`Connected to Qdrant at ${this.host}:${this.port}`);

      // Check if collection exists
      const collections = await this.client.getCollections();
      this.collectionExists = collections.collections.some(
        c => c.name === COLLECTION_NAME
      );

      if (!this.collectionExists) {
        logger.warn(`Collection "${COLLECTION_NAME}" does not exist. Creating...`);
        await this.createCollection();
      } else {
        logger.info(`Collection "${COLLECTION_NAME}" exists`);
      }

      return true;

    } catch (error) {
      logger.error(`Failed to initialize RAG client: ${error.message}`);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Create the partnership documents collection
   * @returns {Promise<boolean>} Success status
   */
  async createCollection() {
    try {
      await this.client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine' // Use cosine similarity for semantic search
        },
        optimizers_config: {
          default_segment_number: 2
        }
      });

      // Create payload indexes for faster filtering
      await this.client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'partner_name',
        field_schema: 'keyword'
      });

      await this.client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'section_type',
        field_schema: 'keyword'
      });

      await this.client.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'document_date',
        field_schema: 'integer'
      });

      this.collectionExists = true;
      logger.success(`Created collection "${COLLECTION_NAME}"`);
      return true;

    } catch (error) {
      logger.error(`Failed to create collection: ${error.message}`);
      return false;
    }
  }

  /**
   * Insert document section with embedding
   * @param {Object} document - Document metadata and content
   * @param {Array<number>} embedding - Vector embedding (3072 dimensions)
   * @returns {Promise<string>} Document ID
   */
  async insertDocument(document, embedding) {
    try {
      // Validate embedding
      if (!embedding || embedding.length !== VECTOR_SIZE) {
        throw new Error(`Invalid embedding size. Expected ${VECTOR_SIZE}, got ${embedding?.length}`);
      }

      // Generate unique ID
      const id = `${document.partner_name}_${document.section_type}_${Date.now()}`;

      // Insert point
      await this.client.upsert(COLLECTION_NAME, {
        points: [
          {
            id: id,
            vector: embedding,
            payload: {
              partner_name: document.partner_name,
              section_type: document.section_type,
              content: document.content,
              document_date: document.document_date,
              performance_score: document.performance_score || 0.5,
              metadata: document.metadata || {}
            }
          }
        ]
      });

      logger.debug(`Inserted document: ${id}`);
      return id;

    } catch (error) {
      logger.error(`Failed to insert document: ${error.message}`);
      throw error;
    }
  }

  /**
   * Batch insert multiple documents
   * @param {Array<Object>} documents - Array of {document, embedding} pairs
   * @returns {Promise<Array<string>>} Array of document IDs
   */
  async batchInsert(documents) {
    try {
      const points = documents.map((doc, idx) => ({
        id: `${doc.document.partner_name}_${doc.document.section_type}_${Date.now()}_${idx}`,
        vector: doc.embedding,
        payload: {
          partner_name: doc.document.partner_name,
          section_type: doc.document.section_type,
          content: doc.document.content,
          document_date: doc.document.document_date,
          performance_score: doc.document.performance_score || 0.5,
          metadata: doc.document.metadata || {}
        }
      }));

      await this.client.upsert(COLLECTION_NAME, { points });

      const ids = points.map(p => p.id);
      logger.success(`Batch inserted ${ids.length} documents`);
      return ids;

    } catch (error) {
      logger.error(`Failed to batch insert: ${error.message}`);
      throw error;
    }
  }

  /**
   * Search for similar documents using semantic search
   * @param {Array<number>} queryEmbedding - Query vector (3072 dimensions)
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Matching documents with scores
   */
  async search(queryEmbedding, options = {}) {
    try {
      const {
        limit = 5,
        filter = null,
        scoreThreshold = 0.7
      } = options;

      // Validate embedding
      if (!queryEmbedding || queryEmbedding.length !== VECTOR_SIZE) {
        throw new Error(`Invalid query embedding size. Expected ${VECTOR_SIZE}, got ${queryEmbedding?.length}`);
      }

      // Perform search
      const searchResult = await this.client.search(COLLECTION_NAME, {
        vector: queryEmbedding,
        limit: limit,
        filter: filter,
        score_threshold: scoreThreshold,
        with_payload: true
      });

      // Format results
      const results = searchResult.map(result => ({
        id: result.id,
        score: result.score,
        partner_name: result.payload.partner_name,
        section_type: result.payload.section_type,
        content: result.payload.content,
        document_date: result.payload.document_date,
        performance_score: result.payload.performance_score,
        metadata: result.payload.metadata
      }));

      logger.debug(`Search returned ${results.length} results (threshold: ${scoreThreshold})`);
      return results;

    } catch (error) {
      logger.error(`Search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Hybrid search: semantic + keyword + performance score
   * @param {Array<number>} queryEmbedding - Query vector
   * @param {Object} options - Search options
   * @returns {Promise<Array<Object>>} Ranked results
   */
  async hybridSearch(queryEmbedding, options = {}) {
    try {
      const {
        limit = 5,
        keywords = [],
        sectionType = null,
        minPerformanceScore = 0.0,
        boostRecent = true
      } = options;

      // Build filter
      let filter = {
        must: []
      };

      // Filter by section type
      if (sectionType) {
        filter.must.push({
          key: 'section_type',
          match: { value: sectionType }
        });
      }

      // Filter by minimum performance score
      if (minPerformanceScore > 0) {
        filter.must.push({
          key: 'performance_score',
          range: { gte: minPerformanceScore }
        });
      }

      // Perform semantic search
      const semanticResults = await this.search(queryEmbedding, {
        limit: limit * 2, // Get more results for re-ranking
        filter: filter.must.length > 0 ? filter : null,
        scoreThreshold: 0.6
      });

      // Re-rank results using hybrid scoring
      const rerankedResults = semanticResults.map(result => {
        let finalScore = result.score; // Start with semantic similarity (0-1)

        // Keyword boost (check if keywords appear in content)
        if (keywords.length > 0) {
          const contentLower = result.content.toLowerCase();
          const keywordMatches = keywords.filter(kw =>
            contentLower.includes(kw.toLowerCase())
          ).length;
          const keywordBoost = (keywordMatches / keywords.length) * 0.2; // Up to +0.2
          finalScore += keywordBoost;
        }

        // Performance score boost (higher quality documents)
        const performanceBoost = result.performance_score * 0.15; // Up to +0.15
        finalScore += performanceBoost;

        // Recency boost (more recent documents preferred)
        if (boostRecent && result.document_date) {
          const now = Date.now();
          const docAge = now - result.document_date;
          const oneYear = 365 * 24 * 60 * 60 * 1000;
          const recencyBoost = Math.max(0, (1 - docAge / oneYear) * 0.1); // Up to +0.1
          finalScore += recencyBoost;
        }

        return { ...result, finalScore };
      });

      // Sort by final score and take top N
      rerankedResults.sort((a, b) => b.finalScore - a.finalScore);
      const topResults = rerankedResults.slice(0, limit);

      logger.debug(`Hybrid search returned ${topResults.length} results`);
      return topResults;

    } catch (error) {
      logger.error(`Hybrid search failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Object|null>} Document or null if not found
   */
  async getById(id) {
    try {
      const result = await this.client.retrieve(COLLECTION_NAME, {
        ids: [id],
        with_payload: true,
        with_vector: false
      });

      if (result.length === 0) return null;

      const doc = result[0];
      return {
        id: doc.id,
        partner_name: doc.payload.partner_name,
        section_type: doc.payload.section_type,
        content: doc.payload.content,
        document_date: doc.payload.document_date,
        performance_score: doc.payload.performance_score,
        metadata: doc.payload.metadata
      };

    } catch (error) {
      logger.error(`Failed to get document by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete documents by filter
   * @param {Object} filter - Qdrant filter object
   * @returns {Promise<number>} Number of deleted documents
   */
  async deleteByFilter(filter) {
    try {
      const result = await this.client.delete(COLLECTION_NAME, {
        filter: filter
      });

      logger.info(`Deleted documents matching filter`);
      return result.status === 'acknowledged' ? 1 : 0;

    } catch (error) {
      logger.error(`Failed to delete documents: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get collection statistics
   * @returns {Promise<Object>} Collection stats
   */
  async getStats() {
    try {
      const info = await this.client.getCollection(COLLECTION_NAME);

      return {
        totalDocuments: info.points_count,
        vectorSize: info.config.params.vectors.size,
        distance: info.config.params.vectors.distance,
        status: info.status
      };

    } catch (error) {
      logger.error(`Failed to get stats: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if client is ready
   * @returns {boolean}
   */
  isReady() {
    return this.isConnected && this.collectionExists;
  }

  /**
   * Close connection gracefully
   */
  async close() {
    // Qdrant REST client doesn't require explicit closing
    this.isConnected = false;
    logger.info('RAG client closed');
  }
}

export default RAGClient;
