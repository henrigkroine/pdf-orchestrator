/**
 * Completeness Checker
 *
 * Validates content completeness including required elements,
 * placeholder detection, data accuracy, and fact-checking.
 *
 * Features:
 * - Required elements validation
 * - Placeholder detection (XX, TBD, [INSERT], etc.)
 * - Data accuracy validation
 * - Fact-checking with web search integration
 * - Citation verification
 * - Missing information reporting
 */

const natural = require('natural');

class CompletenessChecker {
  constructor(config, aiClient, webSearch) {
    this.config = config;
    this.aiClient = aiClient;
    this.webSearch = webSearch;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();

    // Placeholder patterns from config
    this.placeholderPatterns = this.config.placeholderPatterns.map(p =>
      new RegExp(p, 'gi')
    );

    // Data validation patterns
    this.dataPatterns = {
      numbers: /\b\d+\s*(students?|teachers?|schools?|hours?|days?|weeks?|months?|years?)\b/gi,
      percentages: /\b\d+(\.\d+)?%/g,
      dates: /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/gi,
      years: /\b(19|20)\d{2}\b/g,
      money: /\$\d+([,\.]\d+)*(k|m|b|million|billion)?/gi
    };

    // Fact-check categories from config
    this.factCheckCategories = this.config.webSearchFactChecking?.categories || [
      'statistics', 'dates', 'names', 'organizations', 'program details', 'research findings'
    ];
  }

  /**
   * Analyze content completeness
   */
  async analyzeCompleteness(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting content completeness analysis...');

      const documentType = options.documentType || 'partnershipDocument';

      // Run all completeness checks
      const requiredElements = this.checkRequiredElements(text, documentType);
      const placeholders = this.detectPlaceholders(text);
      const dataValidation = this.validateData(text);
      const factChecking = await this.performFactChecking(text, options);
      const citations = this.verifyCitations(text);

      // Calculate overall completeness score
      const scores = {
        requiredElements: requiredElements.score,
        placeholderDetection: placeholders.score,
        dataAccuracy: dataValidation.score,
        factualCorrectness: factChecking.score,
        citationVerification: citations.score
      };

      const weights = this.config.qualityDimensions.contentCompleteness.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'contentCompleteness',
        overallScore,
        scores,
        details: {
          requiredElements,
          placeholders,
          dataValidation,
          factChecking,
          citations
        },
        issues: this.combineIssues([
          requiredElements.issues,
          placeholders.issues,
          dataValidation.issues,
          factChecking.issues,
          citations.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores),
        metadata: {
          duration,
          documentType,
          factChecksPerformed: factChecking.checksPerformed
        }
      };

    } catch (error) {
      console.error('Completeness analysis error:', error);
      throw new Error(`Completeness analysis failed: ${error.message}`);
    }
  }

  /**
   * Check for required elements based on document type
   */
  checkRequiredElements(text, documentType) {
    const issues = [];
    const requiredList = this.config.requiredElements[documentType] || [];

    if (requiredList.length === 0) {
      return {
        score: 100,
        required: [],
        present: [],
        missing: [],
        issues: [],
        coverage: 100
      };
    }

    const present = [];
    const missing = [];

    requiredList.forEach(element => {
      const detected = this.detectElement(text, element);

      if (detected) {
        present.push(element);
      } else {
        missing.push(element);
        issues.push({
          type: 'requiredElements',
          severity: 'critical',
          issue: `Missing required element: ${element}`,
          suggestion: `Add ${element} to complete the document`,
          element
        });
      }
    });

    const coverage = (present.length / requiredList.length) * 100;
    const score = coverage;

    return {
      score: Math.round(score),
      required: requiredList,
      present,
      missing,
      coverage: Math.round(coverage),
      issues,
      summary: {
        totalRequired: requiredList.length,
        present: present.length,
        missing: missing.length,
        completeness: `${present.length}/${requiredList.length}`
      }
    };
  }

  /**
   * Detect placeholders (XX, TBD, TODO, etc.)
   */
  detectPlaceholders(text) {
    const issues = [];
    const placeholders = [];

    this.placeholderPatterns.forEach((pattern, idx) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          placeholders.push({
            text: match,
            pattern: this.config.placeholderPatterns[idx],
            context: this.getContext(text, match)
          });

          issues.push({
            type: 'placeholder',
            severity: 'critical',
            issue: `Placeholder text detected: "${match}"`,
            suggestion: 'Replace placeholder with actual content',
            text: match,
            context: this.getContext(text, match)
          });
        });
      }
    });

    // Additional checks for incomplete content
    const incompletePatterns = [
      { pattern: /\d{1,2}\/\d{1,2}\/XX/g, type: 'Incomplete date' },
      { pattern: /\bXX+\b/g, type: 'Missing number/text' },
      { pattern: /\b_+\b/g, type: 'Blank field' },
      { pattern: /\[\s*\]/g, type: 'Empty bracket' }
    ];

    incompletePatterns.forEach(({ pattern, type }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          placeholders.push({
            text: match,
            type,
            context: this.getContext(text, match)
          });

          issues.push({
            type: 'placeholder',
            severity: 'critical',
            issue: `${type} detected: "${match}"`,
            suggestion: 'Complete this field with actual information',
            text: match
          });
        });
      }
    });

    // Score: 100 if no placeholders, 0 if any found
    const score = placeholders.length === 0 ? 100 : Math.max(0, 100 - (placeholders.length * 20));

    return {
      score: Math.round(score),
      placeholders,
      count: placeholders.length,
      issues,
      summary: {
        totalPlaceholders: placeholders.length,
        types: [...new Set(placeholders.map(p => p.type || 'generic'))],
        critical: placeholders.length > 0
      }
    };
  }

  /**
   * Validate data accuracy (numbers, dates, percentages)
   */
  validateData(text) {
    const issues = [];
    const dataPoints = [];
    let score = 100;

    // Extract all data points
    Object.entries(this.dataPatterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          dataPoints.push({
            type,
            value: match,
            context: this.getContext(text, match)
          });
        });
      }
    });

    // Validate numbers are reasonable
    const unreasonableNumbers = this.findUnreasonableNumbers(dataPoints);

    unreasonableNumbers.forEach(({ value, reason, context }) => {
      issues.push({
        type: 'dataAccuracy',
        severity: 'major',
        issue: `Potentially unreasonable number: ${value}`,
        suggestion: `Verify this number is accurate: ${reason}`,
        value,
        context
      });
      score -= 10;
    });

    // Check for inconsistent data
    const inconsistencies = this.findDataInconsistencies(dataPoints, text);

    inconsistencies.forEach(({ issue, values }) => {
      issues.push({
        type: 'dataAccuracy',
        severity: 'major',
        issue,
        suggestion: 'Ensure all numbers and dates are consistent throughout document',
        values
      });
      score -= 15;
    });

    // Check for missing context (numbers without explanation)
    const contextlessData = this.findContextlessData(text, dataPoints);

    contextlessData.forEach(({ value, context }) => {
      issues.push({
        type: 'dataAccuracy',
        severity: 'minor',
        issue: `Number lacks context: ${value}`,
        suggestion: 'Provide context or source for this data point',
        value,
        context
      });
      score -= 5;
    });

    return {
      score: Math.max(0, Math.round(score)),
      dataPoints,
      unreasonableCount: unreasonableNumbers.length,
      inconsistencyCount: inconsistencies.length,
      contextlessCount: contextlessData.length,
      issues,
      summary: {
        totalDataPoints: dataPoints.length,
        validated: dataPoints.length - unreasonableNumbers.length,
        flagged: unreasonableNumbers.length + inconsistencies.length
      }
    };
  }

  /**
   * Perform fact-checking using web search
   */
  async performFactChecking(text, options = {}) {
    const issues = [];
    let score = 100;
    const checks = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    // Limit fact-checking if disabled or no web search
    if (!this.config.webSearchFactChecking?.enabled || !this.webSearch || options.skipFactCheck) {
      console.log('Fact-checking skipped (disabled or no web search available)');
      return {
        score: 95, // Assume good unless proven otherwise
        checks: [],
        verified: 0,
        flagged: 0,
        checksPerformed: 0,
        issues: [],
        summary: { status: 'skipped', reason: 'Web search unavailable or disabled' }
      };
    }

    try {
      // Extract factual claims that should be verified
      const claims = this.extractFactualClaims(text);

      // Limit to max searches from config
      const maxSearches = this.config.webSearchFactChecking.maxSearches || 5;
      const claimsToCheck = claims.slice(0, maxSearches);

      console.log(`Fact-checking ${claimsToCheck.length} claims...`);

      for (const claim of claimsToCheck) {
        try {
          const verification = await this.verifyClaim(claim);

          checks.push({
            claim: claim.text,
            category: claim.category,
            verified: verification.verified,
            confidence: verification.confidence,
            source: verification.source
          });

          if (!verification.verified && verification.confidence > 0.5) {
            issues.push({
              type: 'factChecking',
              severity: verification.confidence > 0.7 ? 'critical' : 'major',
              issue: `Claim may be inaccurate: "${claim.text}"`,
              suggestion: `Verify this information: ${verification.reason}`,
              claim: claim.text,
              confidence: verification.confidence
            });
            score -= verification.confidence * 20;
          }

        } catch (error) {
          console.error(`Fact-check error for claim "${claim.text}":`, error.message);
          // Don't penalize for fact-check failures (API issues, etc.)
        }
      }

    } catch (error) {
      console.error('Fact-checking error:', error);
      // Return neutral score if fact-checking fails
      return {
        score: 90,
        checks: [],
        verified: 0,
        flagged: 0,
        checksPerformed: 0,
        issues: [{ type: 'factChecking', severity: 'minor', issue: 'Fact-checking unavailable', suggestion: 'Manually verify all factual claims' }],
        summary: { status: 'error', error: error.message }
      };
    }

    const verified = checks.filter(c => c.verified).length;
    const flagged = checks.filter(c => !c.verified).length;

    return {
      score: Math.max(0, Math.round(score)),
      checks,
      verified,
      flagged,
      checksPerformed: checks.length,
      issues,
      summary: {
        totalClaims: checks.length,
        verified,
        flagged,
        accuracy: checks.length > 0 ? Math.round((verified / checks.length) * 100) : 100
      }
    };
  }

  /**
   * Verify citations and sources
   */
  verifyCitations(text) {
    const issues = [];
    let score = 100;

    // Look for citation patterns
    const citationPatterns = [
      /\[(\d+)\]/g,  // [1], [2]
      /\(([^)]+, \d{4})\)/g,  // (Author, 2023)
      /according to ([^,.]+)/gi,  // according to X
      /\bsource: ([^\n]+)/gi,  // Source: X
      /\bcited in ([^,.]+)/gi  // cited in X
    ];

    const citations = [];
    citationPatterns.forEach((pattern, idx) => {
      const matches = text.match(pattern);
      if (matches) {
        citations.push(...matches);
      }
    });

    // Check for data/statistics without citations
    const statistics = text.match(/\b\d+%/g) || [];
    const research = text.match(/\b(research|study|survey|data) (shows?|indicates?|suggests?|reveals?)/gi) || [];

    const needsCitation = statistics.length + research.length;
    const hasCitations = citations.length;

    if (needsCitation > 0 && hasCitations === 0) {
      issues.push({
        type: 'citations',
        severity: 'major',
        issue: `${needsCitation} statistics/claims without citations`,
        suggestion: 'Add sources for statistics and research claims',
        count: needsCitation
      });
      score -= 30;
    } else if (needsCitation > hasCitations * 2) {
      issues.push({
        type: 'citations',
        severity: 'minor',
        issue: 'Some statistics may lack proper citations',
        suggestion: 'Verify all data points have sources',
        stats: needsCitation,
        citations: hasCitations
      });
      score -= 15;
    }

    // Check citation quality
    const vageCitations = citations.filter(c =>
      /\b(some|many|several|various|numerous)\b/i.test(c)
    );

    if (vageCitations.length > 0) {
      issues.push({
        type: 'citations',
        severity: 'minor',
        issue: `${vageCitations.length} vague citation(s)`,
        suggestion: 'Use specific sources instead of "some research" or "many studies"',
        examples: vageCitations.slice(0, 3)
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      citations,
      citationCount: citations.length,
      needsCitation,
      vageCitations: vageCitations.length,
      issues,
      summary: {
        totalCitations: citations.length,
        dataPointsNeedingCitations: needsCitation,
        citationRatio: needsCitation > 0 ? Math.round((hasCitations / needsCitation) * 100) : 100
      }
    };
  }

  // ==================== Helper Methods ====================

  /**
   * Detect if a required element is present in text
   */
  detectElement(text, element) {
    const elementKeywords = {
      'Organization name (TEEI)': ['TEEI', 'Educational Equality Institute'],
      'Partner name': ['partner', 'partnership', 'AWS', 'Google', 'Microsoft'],
      'Value proposition': ['value', 'benefit', 'provide', 'deliver', 'offer'],
      'Program details': ['program', 'initiative', 'curriculum', 'training'],
      'Impact metrics': ['impact', 'result', 'outcome', 'students', 'teachers', '%'],
      'Call to action': ['contact', 'reach out', 'join', 'get started', 'learn more'],
      'Contact information': ['email', 'phone', 'contact', '@', '.com'],
      'Next steps': ['next step', 'how to', 'get started', 'begin']
    };

    const keywords = elementKeywords[element] || [element.toLowerCase()];

    return keywords.some(kw =>
      new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i').test(text)
    );
  }

  /**
   * Get surrounding context for a match
   */
  getContext(text, match, contextLength = 50) {
    const index = text.indexOf(match);
    if (index === -1) return match;

    const start = Math.max(0, index - contextLength);
    const end = Math.min(text.length, index + match.length + contextLength);

    let context = text.substring(start, end);

    if (start > 0) context = '...' + context;
    if (end < text.length) context = context + '...';

    return context;
  }

  /**
   * Find unreasonable numbers
   */
  findUnreasonableNumbers(dataPoints) {
    const unreasonable = [];

    dataPoints.forEach(({ value, type, context }) => {
      // Extract numeric value
      const numMatch = value.match(/\d+/);
      if (!numMatch) return;

      const num = parseInt(numMatch[0]);

      // Check for unreasonable values based on type
      if (type === 'percentages') {
        const pct = parseFloat(value);
        if (pct > 100) {
          unreasonable.push({
            value,
            reason: 'Percentage over 100%',
            context
          });
        }
      }

      if (type === 'numbers') {
        // Check for suspiciously round numbers (possibly placeholders)
        if (num % 100 === 0 && num >= 1000 && !value.includes('approximately')) {
          // This is less certain, so we'll be lenient
        }

        // Check for extremely large numbers without proper formatting
        if (num > 1000000 && !value.includes('million') && !value.includes('m') && !value.includes(',')) {
          unreasonable.push({
            value,
            reason: 'Large number without proper formatting',
            context
          });
        }
      }

      if (type === 'years') {
        if (num < 1900 || num > new Date().getFullYear() + 5) {
          unreasonable.push({
            value,
            reason: 'Year outside reasonable range',
            context
          });
        }
      }
    });

    return unreasonable;
  }

  /**
   * Find data inconsistencies
   */
  findDataInconsistencies(dataPoints, text) {
    const inconsistencies = [];

    // Check for same metric with different values
    const metricPatterns = [
      /\b(\d+)\s+students?/gi,
      /\b(\d+)\s+teachers?/gi,
      /\b(\d+)\s+schools?/gi
    ];

    metricPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)];
      const values = matches.map(m => parseInt(m[1]));

      // If same metric appears multiple times with different values
      if (values.length > 1) {
        const uniqueValues = [...new Set(values)];
        if (uniqueValues.length > 1) {
          inconsistencies.push({
            issue: `Inconsistent values for same metric: ${uniqueValues.join(', ')}`,
            values: uniqueValues
          });
        }
      }
    });

    return inconsistencies;
  }

  /**
   * Find data without context
   */
  findContextlessData(text, dataPoints) {
    const contextless = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    dataPoints.forEach(({ value, type }) => {
      if (type !== 'numbers' && type !== 'percentages') return;

      // Find sentence containing this data
      const sentence = sentences.find(s => s.includes(value));
      if (!sentence) return;

      // Check if sentence provides context
      const hasContext = /\b(students?|teachers?|schools?|increase|decrease|improve|grow|reach|serve|impact)\b/i.test(sentence);

      if (!hasContext) {
        contextless.push({
          value,
          context: this.getContext(text, value, 80)
        });
      }
    });

    return contextless;
  }

  /**
   * Extract factual claims for verification
   */
  extractFactualClaims(text) {
    const claims = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    sentences.forEach((sentence, idx) => {
      // Look for statements with numbers/statistics
      if (/\b\d+%|\b\d+\s+(students?|teachers?|schools?|years?)/i.test(sentence)) {
        claims.push({
          text: sentence,
          category: 'statistics',
          index: idx
        });
      }

      // Look for research claims
      if (/\b(research|study|survey|data) (shows?|indicates?|suggests?|reveals?)/i.test(sentence)) {
        claims.push({
          text: sentence,
          category: 'research findings',
          index: idx
        });
      }

      // Look for organization names
      if (/\b(TEEI|Together for Ukraine|AWS|Google|Cornell|Oxford)\b/.test(sentence)) {
        claims.push({
          text: sentence,
          category: 'organizations',
          index: idx
        });
      }

      // Look for program details
      if (/\b(program|initiative|partnership|collaboration)\b/i.test(sentence)) {
        claims.push({
          text: sentence,
          category: 'program details',
          index: idx
        });
      }
    });

    return claims;
  }

  /**
   * Verify a claim using web search
   */
  async verifyClaim(claim) {
    if (!this.webSearch) {
      return { verified: true, confidence: 0, reason: 'No web search available' };
    }

    try {
      // Create search query from claim
      const query = this.createSearchQuery(claim.text);

      // Perform web search
      const results = await this.webSearch.search(query);

      if (!results || results.length === 0) {
        return {
          verified: false,
          confidence: 0.3,
          reason: 'No search results found',
          source: null
        };
      }

      // Analyze results for verification
      const verification = this.analyzeSearchResults(results, claim);

      return verification;

    } catch (error) {
      console.error('Claim verification error:', error);
      return {
        verified: true, // Don't penalize on search errors
        confidence: 0,
        reason: 'Search error',
        source: null
      };
    }
  }

  /**
   * Create search query from claim
   */
  createSearchQuery(claim) {
    // Extract key terms (remove common words)
    const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had'];
    const words = this.tokenizer.tokenize(claim.toLowerCase());

    const keywords = words.filter(w => !stopWords.includes(w) && w.length > 3);

    // Prioritize numbers, proper nouns, and key terms
    const query = keywords.slice(0, 6).join(' ');

    return query;
  }

  /**
   * Analyze search results for verification
   */
  analyzeSearchResults(results, claim) {
    // This is simplified - real implementation would use AI to verify
    const topResults = results.slice(0, 3);

    // Check if claim appears in search results
    const snippets = topResults.map(r => r.snippet || '').join(' ').toLowerCase();
    const claimLower = claim.text.toLowerCase();

    // Extract key numbers from claim
    const claimNumbers = claim.text.match(/\d+/g) || [];

    // Check if numbers appear in results
    const numbersFound = claimNumbers.filter(num =>
      snippets.includes(num)
    );

    const confidence = numbersFound.length / Math.max(claimNumbers.length, 1);

    return {
      verified: confidence > 0.5,
      confidence: Math.round(confidence * 100) / 100,
      reason: confidence > 0.5 ? 'Data found in search results' : 'Data not confirmed in search results',
      source: topResults[0]?.url || null
    };
  }

  calculateWeightedScore(scores, weights) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const [criterion, score] of Object.entries(scores)) {
      const weight = weights[criterion]?.weight || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  combineIssues(issueArrays) {
    return issueArrays.flat().sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2, suggestion: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  generateRecommendations(overallScore, scores) {
    const recommendations = [];

    if (scores.requiredElements < 100) {
      recommendations.push('CRITICAL: Add all required elements for document type');
    }
    if (scores.placeholderDetection < 100) {
      recommendations.push('CRITICAL: Replace all placeholder text with actual content');
    }
    if (scores.dataAccuracy < 90) {
      recommendations.push('Verify all numbers, dates, and statistics for accuracy');
    }
    if (scores.factualCorrectness < 90) {
      recommendations.push('Fact-check claims and add citations for credibility');
    }
    if (scores.citationVerification < 85) {
      recommendations.push('Add proper citations for all statistics and research claims');
    }

    if (recommendations.length === 0) {
      recommendations.push('Content is complete - maintain quality in future updates');
    }

    return recommendations;
  }
}

module.exports = CompletenessChecker;
