/**
 * RAG System Test Suite
 *
 * Tests for Document Indexing, Content Retrieval, and RAG Orchestration
 *
 * Usage:
 *   node ai/tests/rag-test.js
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: './config/.env' });

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import RAGOrchestrator from '../rag/ragOrchestrator.js';
import DocumentIndexer from '../rag/documentIndexer.js';
import ContentRetriever from '../rag/contentRetriever.js';
import EmbeddingGenerator from '../rag/embeddingGenerator.js';
import RAGClient from '../rag/ragClient.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  qdrant: {
    host: process.env.QDRANT_HOST || 'localhost',
    port: process.env.QDRANT_PORT || 6333
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  }
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Test runner utilities
 */
function test(name, fn) {
  return {
    name,
    fn,
    category: 'general'
  };
}

function category(name) {
  return {
    category: name
  };
}

async function runTest(testObj) {
  const startTime = Date.now();

  try {
    await testObj.fn();
    const duration = Date.now() - startTime;

    console.log(`  ✓ ${testObj.name} (${duration}ms)`);
    results.passed++;
    results.tests.push({
      name: testObj.name,
      status: 'PASS',
      duration
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    console.log(`  ✗ ${testObj.name}`);
    console.log(`    Error: ${error.message}`);
    results.failed++;
    results.tests.push({
      name: testObj.name,
      status: 'FAIL',
      duration,
      error: error.message
    });
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertGreaterThan(actual, threshold, message) {
  if (actual <= threshold) {
    throw new Error(message || `Expected > ${threshold}, got ${actual}`);
  }
}

/**
 * Test Suite
 */
const tests = [
  // ===== Category: Environment Setup =====
  category('Environment Setup'),

  test('Environment variables are configured', async () => {
    assert(process.env.OPENAI_API_KEY, 'OPENAI_API_KEY not set');
    console.log('    OpenAI API key: Configured');
    console.log(`    Qdrant host: ${TEST_CONFIG.qdrant.host}:${TEST_CONFIG.qdrant.port}`);
  }),

  // ===== Category: RAG Client =====
  category('RAG Client (Vector Database)'),

  test('RAG Client initializes connection', async () => {
    const client = new RAGClient(TEST_CONFIG.qdrant);
    const success = await client.initialize();
    assert(success, 'Failed to initialize RAG client');
    assert(client.isReady(), 'Client not ready');
    await client.close();
  }),

  test('RAG Client retrieves collection stats', async () => {
    const client = new RAGClient(TEST_CONFIG.qdrant);
    await client.initialize();
    const stats = await client.getStats();
    assert(stats !== null, 'Failed to get stats');
    console.log(`    Documents in collection: ${stats.totalDocuments}`);
    await client.close();
  }),

  // ===== Category: Embedding Generator =====
  category('Embedding Generator'),

  test('Embedding Generator generates single embedding', async () => {
    const generator = new EmbeddingGenerator(TEST_CONFIG.openai);
    const embedding = await generator.generateEmbedding('Test text for embedding');

    assert(Array.isArray(embedding), 'Embedding is not an array');
    assertEqual(embedding.length, 3072, 'Invalid embedding dimensions');
    console.log(`    Embedding size: ${embedding.length} dimensions`);
  }),

  test('Embedding Generator generates batch embeddings', async () => {
    const generator = new EmbeddingGenerator(TEST_CONFIG.openai);
    const texts = [
      'Partnership with technology company',
      'Education program for students',
      'Training and support services'
    ];

    const embeddings = await generator.generateBatchEmbeddings(texts);

    assertEqual(embeddings.length, texts.length, 'Incorrect number of embeddings');
    embeddings.forEach(emb => {
      assertEqual(emb.length, 3072, 'Invalid embedding dimension in batch');
    });

    const stats = generator.getUsageStats();
    console.log(`    Batch embeddings: ${embeddings.length}`);
    console.log(`    Tokens used: ${stats.totalTokensUsed}`);
    console.log(`    Cost: $${stats.totalCostUSD.toFixed(6)}`);
  }),

  test('Embedding Generator computes cosine similarity', async () => {
    const generator = new EmbeddingGenerator(TEST_CONFIG.openai);
    const emb1 = await generator.generateEmbedding('AWS cloud computing partnership');
    const emb2 = await generator.generateEmbedding('Amazon Web Services cloud technology');
    const emb3 = await generator.generateEmbedding('Education program for children');

    const similarity12 = generator.cosineSimilarity(emb1, emb2);
    const similarity13 = generator.cosineSimilarity(emb1, emb3);

    console.log(`    Similar texts similarity: ${similarity12.toFixed(3)}`);
    console.log(`    Different texts similarity: ${similarity13.toFixed(3)}`);

    assertGreaterThan(similarity12, similarity13, 'Similar texts should have higher similarity');
  }),

  // ===== Category: Document Indexer =====
  category('Document Indexer'),

  test('Document Indexer initializes', async () => {
    const indexer = new DocumentIndexer(TEST_CONFIG);
    const success = await indexer.initialize();
    assert(success, 'Failed to initialize indexer');
    await indexer.close();
  }),

  test('Document Indexer extracts partner name from filename', async () => {
    const indexer = new DocumentIndexer(TEST_CONFIG);
    const name1 = indexer.extractPartnerName('TEEI-AWS-Partnership-Final');
    const name2 = indexer.extractPartnerName('teei_google_document_v2');
    const name3 = indexer.extractPartnerName('Cornell-University-PDF');

    assertEqual(name1, 'Aws Partnership Final');
    assertEqual(name2, 'Google Document V2');
    assertEqual(name3, 'Cornell University Pdf');

    console.log(`    Extracted names: ${name1}, ${name2}, ${name3}`);
  }),

  // ===== Category: Content Retriever =====
  category('Content Retriever'),

  test('Content Retriever initializes', async () => {
    const retriever = new ContentRetriever(TEST_CONFIG);
    const success = await retriever.initialize();
    assert(success, 'Failed to initialize retriever');
    await retriever.close();
  }),

  test('Content Retriever extracts snippets', async () => {
    const retriever = new ContentRetriever(TEST_CONFIG);
    const longText = 'Lorem ipsum dolor sit amet. '.repeat(50);
    const snippet = retriever.extractSnippet(longText, 100);

    assert(snippet.length <= 110, 'Snippet too long'); // Allow some tolerance
    console.log(`    Snippet length: ${snippet.length} chars`);
  }),

  // ===== Category: RAG Orchestrator =====
  category('RAG Orchestrator'),

  test('RAG Orchestrator initializes', async () => {
    const rag = new RAGOrchestrator(TEST_CONFIG);
    const success = await rag.initialize();
    assert(success, 'Failed to initialize RAG orchestrator');
    assert(rag.isReady(), 'RAG not ready');
    await rag.close();
  }),

  test('RAG Orchestrator gets system stats', async () => {
    const rag = new RAGOrchestrator(TEST_CONFIG);
    await rag.initialize();
    const stats = await rag.getStats();

    assert(stats !== null, 'Failed to get stats');
    assert(stats.initialized === true, 'System not initialized');
    console.log(`    Documents in knowledge base: ${stats.indexer?.collection?.totalDocuments || 0}`);

    await rag.close();
  }),

  // ===== Category: End-to-End Workflow =====
  category('End-to-End Workflow'),

  test('E2E: Index sample PDF (if available)', async () => {
    // Look for sample PDFs
    const sampleDirs = ['exports', 'deliverables', 'reference-pdfs'];
    let samplePdf = null;

    for (const dir of sampleDirs) {
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        const pdfFile = files.find(f => f.toLowerCase().endsWith('.pdf'));
        if (pdfFile) {
          samplePdf = path.join(dir, pdfFile);
          break;
        }
      }
    }

    if (!samplePdf) {
      console.log('    ⚠ No sample PDFs found - skipping');
      results.skipped++;
      return;
    }

    console.log(`    Using sample: ${path.basename(samplePdf)}`);

    const rag = new RAGOrchestrator(TEST_CONFIG);
    await rag.initialize();

    const indexer = new DocumentIndexer(TEST_CONFIG);
    await indexer.initialize();

    const result = await indexer.indexDocument(samplePdf, {
      partner_name: 'Test Partner',
      industry: 'Technology',
      performance_score: 0.85,
      document_date: Date.now()
    });

    assert(result.success, 'Indexing failed');
    assertGreaterThan(result.sectionsIndexed, 0, 'No sections indexed');

    console.log(`    Sections indexed: ${result.sectionsIndexed}`);
    console.log(`    Cost: $${result.usageStats.totalCostUSD.toFixed(6)}`);

    await indexer.close();
    await rag.close();
  }),

  test('E2E: Retrieve content for partner query', async () => {
    const rag = new RAGOrchestrator(TEST_CONFIG);
    await rag.initialize();

    const partnerInfo = {
      partner_name: 'Tech Company',
      industry: 'Technology',
      partnership_type: 'corporate'
    };

    const suggestions = await rag.getSuggestionsForPartner(partnerInfo);

    assert(suggestions !== null, 'Failed to get suggestions');
    assert(suggestions.success !== false, `Suggestion error: ${suggestions.error}`);

    const sectionsCount = Object.keys(suggestions.sections || {}).length;
    console.log(`    Sections with suggestions: ${sectionsCount}`);
    console.log(`    Average confidence: ${(suggestions.summary?.avgConfidence * 100 || 0).toFixed(1)}%`);

    await rag.close();
  }),

  // ===== Category: Performance =====
  category('Performance Benchmarks'),

  test('Performance: Embedding generation speed', async () => {
    const generator = new EmbeddingGenerator(TEST_CONFIG.openai);
    const text = 'Test partnership document for performance measurement';

    const startTime = Date.now();
    await generator.generateEmbedding(text);
    const duration = Date.now() - startTime;

    console.log(`    Embedding generation: ${duration}ms`);
    assert(duration < 5000, 'Embedding generation too slow (> 5s)');
  }),

  test('Performance: Semantic search speed', async () => {
    const retriever = new ContentRetriever(TEST_CONFIG);
    await retriever.initialize();

    const startTime = Date.now();
    const results = await retriever.search('technology partnership', { limit: 5 });
    const duration = Date.now() - startTime;

    console.log(`    Search duration: ${duration}ms`);
    console.log(`    Results found: ${results.length}`);
    assert(duration < 2000, 'Search too slow (> 2s)');

    await retriever.close();
  })
];

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n' + '='.repeat(70));
  console.log('RAG SYSTEM TEST SUITE');
  console.log('='.repeat(70) + '\n');

  let currentCategory = '';

  for (const testObj of tests) {
    // Handle category headers
    if (testObj.category && !testObj.fn) {
      currentCategory = testObj.category;
      console.log(`\n${currentCategory}`);
      console.log('-'.repeat(currentCategory.length));
      continue;
    }

    await runTest(testObj);
  }

  // Print summary
  console.log('\n' + '='.repeat(70));
  console.log('TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total tests: ${results.passed + results.failed + results.skipped}`);
  console.log(`Passed: ${results.passed} ✓`);
  console.log(`Failed: ${results.failed} ✗`);
  console.log(`Skipped: ${results.skipped} ⚠`);

  const totalTime = results.tests.reduce((sum, t) => sum + t.duration, 0);
  console.log(`Total time: ${totalTime}ms`);

  // Print failures
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.tests.filter(t => t.status === 'FAIL').forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  console.log('='.repeat(70) + '\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n✗ Test suite failed:', error.message);
  process.exit(3);
});
