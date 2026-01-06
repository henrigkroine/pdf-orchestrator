#!/usr/bin/env node

/**
 * RAG Integration Test Suite
 *
 * Tests the complete RAG workflow:
 * 1. Document indexing
 * 2. Retrieval quality
 * 3. Similarity scoring
 * 4. Cache behavior
 * 5. Pipeline integration
 *
 * Performance Targets:
 * - Indexing: < 5s per document
 * - Retrieval: < 2s
 * - Cache hit rate: > 70%
 */

const fs = require('fs').promises;
const path = require('path');
const { RAGOrchestrator } = require('../rag/ragOrchestrator.js');

class RAGIntegrationTest {
  constructor() {
    this.testResults = [];
    this.startTime = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    console.log('='.repeat(80));
    console.log('RAG INTEGRATION TEST SUITE');
    console.log('='.repeat(80));
    console.log('');

    this.startTime = Date.now();

    await this.test1_DocumentIndexing();
    await this.test2_RetrievalQuality();
    await this.test3_SimilarityScoring();
    await this.test4_CacheBehavior();
    await this.test5_PipelineIntegration();

    this.printSummary();

    // Exit with appropriate code
    const allPassed = this.testResults.every(r => r.passed);
    process.exit(allPassed ? 0 : 1);
  }

  /**
   * Test 1: Document Indexing
   */
  async test1_DocumentIndexing() {
    console.log('[Test 1] Document Indexing');
    console.log('-'.repeat(80));

    const startTime = Date.now();

    try {
      const rag = new RAGOrchestrator();
      await rag.initialize();

      // Index 3 example documents
      const exampleDocs = [
        {
          id: 'aws-partnership-2024',
          partner: 'Amazon Web Services',
          industry: 'technology',
          type: 'partnership',
          content: {
            title: 'Empowering Ukrainian Students Through Cloud Technology',
            overview: 'AWS partnership to provide cloud computing education',
            cta: 'Schedule a Partnership Discussion'
          },
          programs: [
            { name: 'Cloud Computing Curriculum' },
            { name: 'AWS Certification Training' }
          ],
          outcome: 'signed'
        },
        {
          id: 'google-partnership-2024',
          partner: 'Google',
          industry: 'technology',
          type: 'partnership',
          content: {
            title: 'Bridging the Digital Divide for Ukrainian Refugees',
            overview: 'Google partnership for digital literacy programs',
            cta: 'Join Our Mission'
          },
          programs: [
            { name: 'Google Workspace Training' },
            { name: 'Digital Skills Bootcamp' }
          ],
          outcome: 'signed'
        },
        {
          id: 'cornell-partnership-2023',
          partner: 'Cornell University',
          industry: 'education',
          type: 'academic_partnership',
          content: {
            title: 'Academic Excellence for Displaced Students',
            overview: 'Cornell partnership for scholarship and research opportunities',
            cta: 'Explore Partnership Opportunities'
          },
          programs: [
            { name: 'Scholarship Program' },
            { name: 'Research Internships' }
          ],
          outcome: 'signed'
        }
      ];

      for (const doc of exampleDocs) {
        await rag.indexDocument(doc);
      }

      const duration = Date.now() - startTime;
      const avgTime = duration / exampleDocs.length;

      // Check performance: < 5s per document
      const passed = avgTime < 5000;

      console.log(`✓ Indexed ${exampleDocs.length} documents`);
      console.log(`  Average time: ${avgTime.toFixed(0)}ms per document`);
      console.log(`  Target: < 5000ms per document`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Document Indexing',
        passed,
        duration,
        details: { avgTimePerDoc: avgTime, docsIndexed: exampleDocs.length }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Document Indexing',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 2: Retrieval Quality
   */
  async test2_RetrievalQuality() {
    console.log('[Test 2] Retrieval Quality');
    console.log('-'.repeat(80));

    const startTime = Date.now();

    try {
      const rag = new RAGOrchestrator();
      await rag.initialize();

      // Query for AWS partnership
      const query = 'AWS partnership cloud computing technology';
      const results = await rag.retrieve(query, 5);

      const duration = Date.now() - startTime;

      // Check that we got results
      const gotResults = results.length > 0;

      // Check that top result is relevant (should be AWS doc)
      const topResult = results[0];
      const isRelevant = topResult?.document?.id === 'aws-partnership-2024';

      // Check performance: < 2s
      const performanceOk = duration < 2000;

      const passed = gotResults && isRelevant && performanceOk;

      console.log(`  Query: "${query}"`);
      console.log(`  Results found: ${results.length}`);
      if (results.length > 0) {
        console.log(`  Top result: ${topResult.document.id} (similarity: ${topResult.similarity})`);
        console.log(`  Relevance: ${topResult.relevance}`);
      }
      console.log(`  Duration: ${duration}ms`);
      console.log(`  Target: < 2000ms`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Retrieval Quality',
        passed,
        duration,
        details: {
          resultsFound: results.length,
          topResultRelevant: isRelevant,
          queryTime: duration
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Retrieval Quality',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 3: Similarity Scoring
   */
  async test3_SimilarityScoring() {
    console.log('[Test 3] Similarity Scoring');
    console.log('-'.repeat(80));

    try {
      const rag = new RAGOrchestrator();
      await rag.initialize();

      // Query for technology partnerships
      const results = await rag.retrieve('technology partnership', 5);

      if (results.length === 0) {
        throw new Error('No results returned');
      }

      // Check that similarity scores are within expected range (0.75 - 1.0)
      const allScoresValid = results.every(r => {
        const score = parseFloat(r.similarity);
        return score >= 0.75 && score <= 1.0;
      });

      // Check that results are sorted by similarity (descending)
      const isSorted = results.every((r, idx) => {
        if (idx === 0) return true;
        return parseFloat(r.similarity) <= parseFloat(results[idx - 1].similarity);
      });

      const passed = allScoresValid && isSorted;

      console.log(`  Results: ${results.length}`);
      console.log(`  Score range: ${results[results.length - 1].similarity} - ${results[0].similarity}`);
      console.log(`  All scores valid (0.75-1.0): ${allScoresValid ? 'YES' : 'NO'}`);
      console.log(`  Sorted by similarity: ${isSorted ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Similarity Scoring',
        passed,
        details: {
          scoresValid: allScoresValid,
          sorted: isSorted,
          scoreRange: `${results[results.length - 1].similarity} - ${results[0].similarity}`
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Similarity Scoring',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 4: Cache Behavior
   */
  async test4_CacheBehavior() {
    console.log('[Test 4] Cache Behavior');
    console.log('-'.repeat(80));

    try {
      const rag = new RAGOrchestrator();
      await rag.initialize();

      const query = 'AWS partnership';

      // First query (cache miss)
      const start1 = Date.now();
      await rag.retrieve(query);
      const time1 = Date.now() - start1;

      // Second query (should be cached)
      const start2 = Date.now();
      await rag.retrieve(query);
      const time2 = Date.now() - start2;

      // Cache hit should be faster
      const cacheHitFaster = time2 <= time1;

      const passed = cacheHitFaster;

      console.log(`  First query: ${time1}ms (cache miss)`);
      console.log(`  Second query: ${time2}ms (cache hit expected)`);
      console.log(`  Cache hit faster: ${cacheHitFaster ? 'YES' : 'NO'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Cache Behavior',
        passed,
        details: {
          cacheMissTime: time1,
          cacheHitTime: time2,
          speedup: ((time1 - time2) / time1 * 100).toFixed(1) + '%'
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Cache Behavior',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Test 5: Pipeline Integration
   */
  async test5_PipelineIntegration() {
    console.log('[Test 5] Pipeline Integration');
    console.log('-'.repeat(80));

    try {
      const rag = new RAGOrchestrator();
      await rag.initialize();

      // Simulate job config
      const jobContext = {
        partner: 'Amazon Web Services',
        industry: 'technology',
        type: 'partnership'
      };

      // Get content suggestions
      const suggestions = await rag.suggestContent(jobContext);

      // Check that suggestions were generated
      const hasSuggestions = suggestions.suggestions && suggestions.suggestions.length > 0;

      // Check that top documents are included
      const hasTopDocs = suggestions.topDocuments && suggestions.topDocuments.length > 0;

      // Check confidence score
      const hasConfidence = suggestions.confidence && parseFloat(suggestions.confidence) > 0;

      const passed = hasSuggestions || hasTopDocs; // Either is acceptable

      console.log(`  Context: ${jobContext.industry} ${jobContext.type}`);
      console.log(`  Suggestions: ${suggestions.suggestions?.length || 0}`);
      console.log(`  Top documents: ${suggestions.topDocuments?.length || 0}`);
      console.log(`  Confidence: ${suggestions.confidence || 'N/A'}`);
      console.log(`  Status: ${passed ? 'PASS' : 'FAIL'}\n`);

      this.testResults.push({
        name: 'Pipeline Integration',
        passed,
        details: {
          suggestionsCount: suggestions.suggestions?.length || 0,
          topDocsCount: suggestions.topDocuments?.length || 0,
          confidence: suggestions.confidence
        }
      });

    } catch (error) {
      console.log(`✗ Test failed: ${error.message}\n`);
      this.testResults.push({
        name: 'Pipeline Integration',
        passed: false,
        error: error.message
      });
    }
  }

  /**
   * Print test summary
   */
  printSummary() {
    const totalDuration = Date.now() - this.startTime;
    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.length - passed;

    console.log('='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('');
    console.log(`Total Tests: ${this.testResults.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Duration: ${(totalDuration / 1000).toFixed(2)}s`);
    console.log('');

    if (failed > 0) {
      console.log('FAILED TESTS:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  ✗ ${r.name}: ${r.error || 'Test failed'}`);
        });
      console.log('');
    }

    const allPassed = failed === 0;
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    console.log('='.repeat(80));
  }
}

// Run tests
const tester = new RAGIntegrationTest();
tester.runAll().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
