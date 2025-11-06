#!/usr/bin/env node

/**
 * Hybrid Search System for TEEI Brand Examples
 *
 * Combines semantic vector search with keyword/metadata filtering
 * for best-of-both-worlds retrieval.
 *
 * Features:
 * - Vector similarity search (semantic understanding)
 * - Keyword search (exact matching)
 * - Metadata filtering (grade, type, colors, fonts)
 * - Reranking for optimal results
 * - Query expansion and synonyms
 *
 * Usage:
 *   import { HybridSearch } from './scripts/lib/hybrid-search.js';
 *
 *   const search = new HybridSearch();
 *   const results = await search.search('Nordshore color', { grade: 'A+' });
 */

import { TEEIBrandVectorStore } from './vector-store.js';

/**
 * Hybrid Search Engine
 */
export class HybridSearch {
  constructor(options = {}) {
    this.vectorStore = new TEEIBrandVectorStore(options.vectorStore || {});
    this.weightVector = options.weightVector || 0.7;  // 70% vector, 30% keyword
    this.weightKeyword = options.weightKeyword || 0.3;
    this.synonyms = this.buildSynonymMap();
  }

  /**
   * Initialize search engine
   */
  async initialize() {
    await this.vectorStore.initialize();
  }

  /**
   * Hybrid search
   */
  async search(query, options = {}) {
    const {
      limit = 10,
      filters = {},
      boosts = {},
      rerank = true
    } = options;

    // Expand query with synonyms
    const expandedQuery = this.expandQuery(query);

    // 1. Vector search (semantic)
    const vectorResults = await this.vectorSearch(expandedQuery, limit * 2, filters);

    // 2. Keyword search (exact matching)
    const keywordResults = await this.keywordSearch(expandedQuery, limit * 2, filters);

    // 3. Combine results
    const combinedResults = this.combineResults(vectorResults, keywordResults);

    // 4. Apply metadata boosts
    const boostedResults = this.applyBoosts(combinedResults, boosts);

    // 5. Rerank if enabled
    const finalResults = rerank
      ? this.rerank(boostedResults, query)
      : boostedResults;

    // 6. Return top N
    return finalResults.slice(0, limit);
  }

  /**
   * Vector search (semantic)
   */
  async vectorSearch(query, limit, filters) {
    const results = await this.vectorStore.hybridSearch(query, filters, limit);

    return results.examples.map(ex => ({
      ...ex,
      source: 'vector',
      vector_score: ex.score
    }));
  }

  /**
   * Keyword search (exact matching)
   */
  async keywordSearch(query, limit, filters) {
    // Get all examples
    const allExamples = this.vectorStore.getBrandExamples();

    // Filter by metadata
    let filtered = allExamples;

    if (filters.type) {
      filtered = filtered.filter(ex => ex.type === filters.type);
    }
    if (filters.grade) {
      filtered = filtered.filter(ex => ex.grade === filters.grade);
    }
    if (filters.tags) {
      filtered = filtered.filter(ex =>
        filters.tags.some(tag => ex.tags && ex.tags.includes(tag))
      );
    }

    // Score by keyword matching
    const queryTerms = query.toLowerCase().split(/\s+/);

    const scored = filtered.map(ex => {
      const text = `${ex.description} ${ex.type} ${ex.tags?.join(' ') || ''}`.toLowerCase();

      // Count matching terms
      let matchCount = 0;
      for (const term of queryTerms) {
        if (text.includes(term)) {
          matchCount++;
        }
      }

      const score = matchCount / queryTerms.length;

      return {
        ...ex,
        source: 'keyword',
        keyword_score: score
      };
    });

    // Filter out zero scores and sort
    const results = scored
      .filter(ex => ex.keyword_score > 0)
      .sort((a, b) => b.keyword_score - a.keyword_score)
      .slice(0, limit);

    return results;
  }

  /**
   * Combine vector and keyword results
   */
  combineResults(vectorResults, keywordResults) {
    const combined = new Map();

    // Add vector results
    for (const result of vectorResults) {
      const key = result.description;
      combined.set(key, {
        ...result,
        vector_score: result.vector_score || 0,
        keyword_score: 0,
        hybrid_score: (result.vector_score || 0) * this.weightVector
      });
    }

    // Merge keyword results
    for (const result of keywordResults) {
      const key = result.description;

      if (combined.has(key)) {
        // Update existing entry
        const existing = combined.get(key);
        existing.keyword_score = result.keyword_score;
        existing.hybrid_score =
          existing.vector_score * this.weightVector +
          result.keyword_score * this.weightKeyword;
        existing.source = 'hybrid';
      } else {
        // Add new entry (keyword only)
        combined.set(key, {
          ...result,
          vector_score: 0,
          keyword_score: result.keyword_score,
          hybrid_score: result.keyword_score * this.weightKeyword
        });
      }
    }

    // Convert to array and sort by hybrid score
    return Array.from(combined.values())
      .sort((a, b) => b.hybrid_score - a.hybrid_score);
  }

  /**
   * Apply metadata boosts
   */
  applyBoosts(results, boosts) {
    if (Object.keys(boosts).length === 0) {
      return results;
    }

    return results.map(result => {
      let boostMultiplier = 1.0;

      // Grade boost
      if (boosts.grade && result.grade === boosts.grade) {
        boostMultiplier *= boosts.gradeBoost || 1.5;
      }

      // Type boost
      if (boosts.type && result.type === boosts.type) {
        boostMultiplier *= boosts.typeBoost || 1.3;
      }

      // Tag boost
      if (boosts.tags && result.tags) {
        const matchingTags = boosts.tags.filter(tag => result.tags.includes(tag));
        if (matchingTags.length > 0) {
          boostMultiplier *= 1 + (matchingTags.length * 0.2);
        }
      }

      return {
        ...result,
        hybrid_score: result.hybrid_score * boostMultiplier,
        boost_applied: boostMultiplier > 1.0,
        boost_multiplier: boostMultiplier
      };
    }).sort((a, b) => b.hybrid_score - a.hybrid_score);
  }

  /**
   * Rerank results using more sophisticated scoring
   */
  rerank(results, query) {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return results.map(result => {
      let rerankScore = result.hybrid_score;

      // Exact phrase match bonus
      if (result.description.toLowerCase().includes(query.toLowerCase())) {
        rerankScore *= 1.3;
      }

      // Term proximity bonus (how close query terms are in description)
      const proximity = this.calculateProximity(result.description, queryTerms);
      rerankScore *= (1 + proximity * 0.2);

      // Grade quality bonus
      const gradeBonus = {
        'A+': 1.2,
        'A': 1.1,
        'B': 1.0,
        'C': 0.9,
        'D': 0.8,
        'F': 0.7
      };
      rerankScore *= gradeBonus[result.grade] || 1.0;

      return {
        ...result,
        rerank_score: rerankScore
      };
    }).sort((a, b) => b.rerank_score - a.rerank_score);
  }

  /**
   * Calculate term proximity
   */
  calculateProximity(text, terms) {
    const lowerText = text.toLowerCase();
    const positions = [];

    for (const term of terms) {
      const pos = lowerText.indexOf(term);
      if (pos !== -1) {
        positions.push(pos);
      }
    }

    if (positions.length < 2) {
      return 0;
    }

    // Calculate average distance between terms
    positions.sort((a, b) => a - b);
    let totalDistance = 0;

    for (let i = 1; i < positions.length; i++) {
      totalDistance += positions[i] - positions[i - 1];
    }

    const avgDistance = totalDistance / (positions.length - 1);

    // Normalize (closer = higher score)
    return Math.max(0, 1 - (avgDistance / 100));
  }

  /**
   * Expand query with synonyms
   */
  expandQuery(query) {
    const terms = query.toLowerCase().split(/\s+/);
    const expanded = new Set(terms);

    for (const term of terms) {
      if (this.synonyms.has(term)) {
        const syns = this.synonyms.get(term);
        syns.forEach(syn => expanded.add(syn));
      }
    }

    return Array.from(expanded).join(' ');
  }

  /**
   * Build synonym map for TEEI brand terms
   */
  buildSynonymMap() {
    return new Map([
      ['nordshore', ['primary', 'teal', 'dark-teal', 'main-color']],
      ['sky', ['light-blue', 'accent', 'secondary', 'blue']],
      ['sand', ['beige', 'background', 'warm', 'neutral']],
      ['gold', ['metallic', 'accent', 'premium', 'yellow']],
      ['lora', ['headline', 'title', 'serif']],
      ['roboto', ['body', 'text', 'sans-serif']],
      ['typography', ['font', 'text', 'typeface']],
      ['layout', ['grid', 'structure', 'design', 'spacing']],
      ['photography', ['image', 'photo', 'picture', 'visual']],
      ['authentic', ['real', 'genuine', 'natural', 'program']],
      ['violation', ['error', 'issue', 'problem', 'wrong']],
      ['compliance', ['adherence', 'conformity', 'following', 'correct']]
    ]);
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query, limit = 5) {
    // Find similar queries from indexed examples
    const results = await this.search(query, { limit, rerank: false });

    // Extract unique types and tags
    const suggestions = new Set();

    results.forEach(result => {
      suggestions.add(result.type);
      if (result.tags) {
        result.tags.forEach(tag => suggestions.add(tag));
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get facets for filtering
   */
  async getFacets() {
    const examples = this.vectorStore.getBrandExamples();

    const facets = {
      types: {},
      grades: {},
      tags: {}
    };

    examples.forEach(ex => {
      // Count types
      facets.types[ex.type] = (facets.types[ex.type] || 0) + 1;

      // Count grades
      facets.grades[ex.grade] = (facets.grades[ex.grade] || 0) + 1;

      // Count tags
      if (ex.tags) {
        ex.tags.forEach(tag => {
          facets.tags[tag] = (facets.tags[tag] || 0) + 1;
        });
      }
    });

    return facets;
  }
}

/**
 * Example usage
 */
async function example() {
  console.log('🔍 TEEI Hybrid Search - Example Usage\n');

  const search = new HybridSearch();
  await search.initialize();

  // Example 1: Basic search
  console.log('Example 1: Basic search for "Nordshore color"\n');
  const results1 = await search.search('Nordshore color', { limit: 3 });

  results1.forEach((r, i) => {
    console.log(`${i + 1}. ${r.description}`);
    console.log(`   Source: ${r.source}, Score: ${r.hybrid_score.toFixed(3)}`);
    console.log(`   Vector: ${r.vector_score.toFixed(3)}, Keyword: ${r.keyword_score.toFixed(3)}\n`);
  });

  // Example 2: Search with filters
  console.log('Example 2: Search for "typography" with A+ grade filter\n');
  const results2 = await search.search('typography', {
    limit: 3,
    filters: { grade: 'A+' }
  });

  results2.forEach((r, i) => {
    console.log(`${i + 1}. [${r.grade}] ${r.description}`);
    console.log(`   Score: ${r.hybrid_score.toFixed(3)}\n`);
  });

  // Example 3: Search with boosts
  console.log('Example 3: Search for "layout" with grade boost\n');
  const results3 = await search.search('layout', {
    limit: 3,
    boosts: {
      grade: 'A+',
      gradeBoost: 2.0
    }
  });

  results3.forEach((r, i) => {
    console.log(`${i + 1}. [${r.grade}] ${r.description}`);
    console.log(`   Score: ${r.hybrid_score.toFixed(3)}, Boost: ${r.boost_multiplier?.toFixed(2) || 'none'}\n`);
  });

  // Example 4: Get facets
  console.log('Example 4: Available facets\n');
  const facets = await search.getFacets();

  console.log('Types:');
  Object.entries(facets.types).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log('\nGrades:');
  Object.entries(facets.grades).forEach(([grade, count]) => {
    console.log(`   ${grade}: ${count}`);
  });

  console.log('\nTop Tags:');
  Object.entries(facets.tags)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .forEach(([tag, count]) => {
      console.log(`   ${tag}: ${count}`);
    });

  console.log('\n✅ Example complete');
}

// Run example if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}

export default HybridSearch;
