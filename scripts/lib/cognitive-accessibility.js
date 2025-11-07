/**
 * Cognitive Accessibility Analyzer
 *
 * Analyzes content for cognitive accessibility:
 * - Cognitive load estimation
 * - Memory load analysis
 * - Attention span considerations
 * - Clear structure validation
 * - Consistent pattern checking
 * - AI-powered cognitive assessment
 *
 * @module cognitive-accessibility
 */

export default class CognitiveAccessibility {
  constructor() {
    this.thresholds = {
      maxCognitiveLoad: 7, // Miller's Law: 7±2 items
      maxMemoryItems: 5,
      maxAttentionSpan: 20, // seconds
      maxParagraphLength: 200, // words
      maxSentenceLength: 25 // words
    };
  }

  /**
   * Analyze cognitive accessibility
   */
  async analyze(pdfData) {
    const text = pdfData.text;

    const results = {
      cognitiveLoad: this.calculateCognitiveLoad(text),
      memoryLoad: this.calculateMemoryLoad(text),
      attentionDemands: this.analyzeAttentionDemands(text),
      structure: this.analyzeStructure(text),
      consistency: this.analyzeConsistency(text),
      score: 0,
      issues: [],
      recommendations: []
    };

    // Calculate overall cognitive accessibility score
    results.score = this.calculateCognitiveScore(results);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    return results;
  }

  /**
   * Calculate cognitive load (working memory demands)
   */
  calculateCognitiveLoad(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Count information chunks
    let informationChunks = 0;

    sentences.forEach(sentence => {
      const words = sentence.trim().split(/\s+/);

      // Each clause = 1 chunk
      const clauses = sentence.split(/[,;:]/).length;
      informationChunks += clauses;

      // Complex concepts (capitalized terms)
      const complexTerms = words.filter(w =>
        /^[A-Z][a-z]/.test(w) && w.length > 3
      ).length;
      informationChunks += complexTerms * 0.5;
    });

    const avgChunksPerParagraph = paragraphs.length > 0 ?
      informationChunks / paragraphs.length : 0;

    return {
      totalChunks: Math.round(informationChunks),
      avgChunksPerParagraph: Math.round(avgChunksPerParagraph * 10) / 10,
      exceedsCapacity: avgChunksPerParagraph > this.thresholds.maxCognitiveLoad,
      level: this.getCognitiveLoadLevel(avgChunksPerParagraph)
    };
  }

  /**
   * Calculate memory load
   */
  calculateMemoryLoad(text) {
    // Count items that need to be remembered
    const lists = text.match(/(\d+\.|[•\-*])\s+/g) || [];
    const references = text.match(/(see|refer to|as mentioned|above|below|previously)/gi) || [];
    const acronyms = text.match(/\b[A-Z]{2,}\b/g) || [];

    const memoryItems = lists.length + references.length + acronyms.length;

    return {
      items: memoryItems,
      exceedsCapacity: memoryItems > this.thresholds.maxMemoryItems,
      lists: lists.length,
      references: references.length,
      acronyms: acronyms.length,
      level: memoryItems <= 5 ? 'low' : memoryItems <= 10 ? 'moderate' : 'high'
    };
  }

  /**
   * Analyze attention demands
   */
  analyzeAttentionDemands(text) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    const longParagraphs = paragraphs.filter(p => {
      const words = p.trim().split(/\s+/);
      return words.length > this.thresholds.maxParagraphLength;
    });

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    const longSentences = sentences.filter(s => {
      const words = s.trim().split(/\s+/);
      return words.length > this.thresholds.maxSentenceLength;
    });

    return {
      longParagraphs: longParagraphs.length,
      longSentences: longSentences.length,
      requiresSustainedAttention: longParagraphs.length > 0 || longSentences.length > 0,
      level: longParagraphs.length + longSentences.length <= 5 ? 'low' :
             longParagraphs.length + longSentences.length <= 15 ? 'moderate' : 'high'
    };
  }

  /**
   * Analyze document structure for cognitive clarity
   */
  analyzeStructure(text) {
    const lines = text.split('\n');

    // Count headings (heuristic: short lines, possibly capitalized)
    const headings = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 &&
             trimmed.length < 100 &&
             (trimmed === trimmed.toUpperCase() || trimmed.endsWith(':'));
    });

    // Count lists
    const listItems = lines.filter(line =>
      /^\s*(\d+\.|[•\-*])\s+/.test(line)
    );

    // Count paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

    return {
      hasHeadings: headings.length > 0,
      headingCount: headings.length,
      hasLists: listItems.length > 0,
      listItemCount: listItems.length,
      paragraphCount: paragraphs.length,
      wellOrganized: headings.length >= Math.max(3, paragraphs.length / 5),
      clarity: headings.length > 0 && listItems.length > 0 ? 'good' : 'needs improvement'
    };
  }

  /**
   * Analyze consistency
   */
  analyzeConsistency(text) {
    // Check for consistent terminology
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};

    words.forEach(word => {
      if (word.length > 5) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });

    // Find words with similar meanings (simplified)
    const synonymGroups = this.findSynonymGroups(Object.keys(wordFreq));

    return {
      hasInconsistentTerminology: synonymGroups.length > 0,
      synonymGroups,
      consistency: synonymGroups.length === 0 ? 'good' : 'needs improvement'
    };
  }

  /**
   * Find synonym groups (simplified)
   */
  findSynonymGroups(words) {
    const groups = [];

    // Simple example: look for word stems
    const commonStems = ['access', 'use', 'help', 'support'];

    commonStems.forEach(stem => {
      const related = words.filter(w => w.includes(stem));
      if (related.length > 2) {
        groups.push({
          stem,
          words: related,
          suggestion: `Use consistent term (e.g., always use "${stem}")`
        });
      }
    });

    return groups;
  }

  /**
   * Calculate cognitive accessibility score
   */
  calculateCognitiveScore(results) {
    let score = 100;

    // Deduct for cognitive load
    if (results.cognitiveLoad.exceedsCapacity) {
      score -= 20;
    } else if (results.cognitiveLoad.level === 'moderate') {
      score -= 10;
    }

    // Deduct for memory load
    if (results.memoryLoad.exceedsCapacity) {
      score -= 15;
    }

    // Deduct for attention demands
    if (results.attentionDemands.requiresSustainedAttention) {
      score -= 10;
    }

    // Deduct for poor structure
    if (!results.structure.wellOrganized) {
      score -= 15;
    }

    // Deduct for inconsistency
    if (results.consistency.hasInconsistentTerminology) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.cognitiveLoad.exceedsCapacity) {
      recommendations.push({
        priority: 'high',
        message: 'Reduce cognitive load by breaking complex information into smaller chunks',
        wcag: 'Best Practice'
      });
    }

    if (results.memoryLoad.exceedsCapacity) {
      recommendations.push({
        priority: 'high',
        message: 'Reduce memory demands by minimizing cross-references and providing summaries',
        wcag: 'Best Practice'
      });
    }

    if (results.attentionDemands.requiresSustainedAttention) {
      recommendations.push({
        priority: 'medium',
        message: 'Break long paragraphs and sentences for easier reading',
        wcag: '3.1.5'
      });
    }

    if (!results.structure.wellOrganized) {
      recommendations.push({
        priority: 'high',
        message: 'Add more headings to organize content clearly',
        wcag: '2.4.6, 2.4.10'
      });
    }

    if (results.consistency.hasInconsistentTerminology) {
      recommendations.push({
        priority: 'medium',
        message: 'Use consistent terminology throughout the document',
        wcag: '3.2.4'
      });
    }

    return recommendations;
  }

  /**
   * Get cognitive load level
   */
  getCognitiveLoadLevel(chunks) {
    if (chunks <= 5) return 'low';
    if (chunks <= 7) return 'moderate';
    return 'high';
  }
}
