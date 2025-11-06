/**
 * Writing Quality Checker
 *
 * Analyzes writing quality including grammar, sentence structure,
 * clarity, active voice, and coherence using AI and NLP.
 *
 * Features:
 * - Grammar and spelling detection
 * - Sentence structure analysis
 * - Passive voice detection
 * - Clarity and conciseness scoring
 * - AI-powered writing critique with GPT-5
 * - Rewrite suggestions
 */

const natural = require('natural');
const { encode } = require('gpt-3-encoder');

class WritingQualityChecker {
  constructor(config, aiClient) {
    this.config = config;
    this.aiClient = aiClient;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();

    // Initialize NLP tools
    this.TfIdf = natural.TfIdf;
    this.tfidf = new this.TfIdf();

    // Passive voice indicators
    this.passiveIndicators = [
      /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi,
      /\b(is|are|was|were|be|been|being)\s+\w+en\b/gi,
      /\b(get|gets|got|gotten)\s+\w+ed\b/gi
    ];

    // Weak words that reduce clarity
    this.weakWords = [
      'very', 'really', 'quite', 'rather', 'somewhat', 'fairly',
      'pretty', 'actually', 'basically', 'literally', 'just',
      'sort of', 'kind of', 'a bit', 'a little', 'maybe', 'perhaps'
    ];

    // Jargon and complex words to avoid
    this.jargonWords = [
      'synergy', 'leverage', 'optimize', 'paradigm', 'ecosystem',
      'utilize', 'operationalize', 'strategize', 'incentivize',
      'monetize', 'prioritize', 'actualize', 'facilitate'
    ];

    // Common grammar issues patterns
    this.grammarPatterns = [
      { pattern: /\bthere\s+is\s+\w+\s+that\b/gi, issue: 'Wordy construction', suggestion: 'Consider restructuring' },
      { pattern: /\bit\s+is\s+\w+\s+that\b/gi, issue: 'Wordy construction', suggestion: 'Consider restructuring' },
      { pattern: /\bdue\s+to\s+the\s+fact\s+that\b/gi, issue: 'Wordy phrase', suggestion: 'Use "because"' },
      { pattern: /\bin\s+order\s+to\b/gi, issue: 'Wordy phrase', suggestion: 'Use "to"' },
      { pattern: /\bat\s+this\s+point\s+in\s+time\b/gi, issue: 'Wordy phrase', suggestion: 'Use "now"' },
      { pattern: /\bin\s+the\s+event\s+that\b/gi, issue: 'Wordy phrase', suggestion: 'Use "if"' }
    ];
  }

  /**
   * Analyze writing quality of text
   */
  async analyzeWritingQuality(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting writing quality analysis...');

      // Split into sentences and paragraphs
      const sentences = this.sentenceTokenizer.tokenize(text);
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

      // Run all analysis components
      const grammarAnalysis = await this.analyzeGrammar(text, sentences);
      const sentenceAnalysis = this.analyzeSentenceStructure(sentences);
      const clarityAnalysis = this.analyzeClarity(text, sentences);
      const voiceAnalysis = this.analyzeVoice(sentences);
      const coherenceAnalysis = this.analyzeCoherence(paragraphs, sentences);

      // Get AI critique
      const aiCritique = await this.getAICritique(text, {
        grammarIssues: grammarAnalysis.issues.length,
        avgSentenceLength: sentenceAnalysis.avgLength,
        passiveVoicePercent: voiceAnalysis.passivePercent,
        clarityScore: clarityAnalysis.score
      });

      // Calculate overall score
      const scores = {
        grammarAccuracy: grammarAnalysis.score,
        sentenceStructure: sentenceAnalysis.score,
        clarity: clarityAnalysis.score,
        activeVoice: voiceAnalysis.score,
        coherence: coherenceAnalysis.score
      };

      const weights = this.config.qualityDimensions.writingQuality.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'writingQuality',
        overallScore,
        scores,
        details: {
          grammar: grammarAnalysis,
          sentence: sentenceAnalysis,
          clarity: clarityAnalysis,
          voice: voiceAnalysis,
          coherence: coherenceAnalysis
        },
        aiCritique,
        issues: this.combineIssues([
          grammarAnalysis.issues,
          sentenceAnalysis.issues,
          clarityAnalysis.issues,
          voiceAnalysis.issues,
          coherenceAnalysis.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores),
        metadata: {
          duration,
          sentenceCount: sentences.length,
          paragraphCount: paragraphs.length,
          wordCount: this.tokenizer.tokenize(text).length
        }
      };

    } catch (error) {
      console.error('Writing quality analysis error:', error);
      throw new Error(`Writing quality analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze grammar and spelling
   */
  async analyzeGrammar(text, sentences) {
    const issues = [];
    let errorCount = 0;

    // Check for common grammar patterns
    for (const { pattern, issue, suggestion } of this.grammarPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          issues.push({
            type: 'grammar',
            severity: 'minor',
            text: match,
            issue,
            suggestion,
            location: text.indexOf(match)
          });
        });
        errorCount += matches.length;
      }
    }

    // Check for repeated words
    const repeatedWords = this.findRepeatedWords(text);
    repeatedWords.forEach(({ word, count, locations }) => {
      if (count > 3) {
        issues.push({
          type: 'grammar',
          severity: 'minor',
          text: word,
          issue: `Word "${word}" repeated ${count} times`,
          suggestion: 'Consider using synonyms for variety',
          locations
        });
      }
    });

    // Check for sentence fragments (very short sentences)
    sentences.forEach((sentence, idx) => {
      const words = this.tokenizer.tokenize(sentence);
      if (words.length < 3 && !sentence.match(/^(Yes|No|Okay|OK|Sure)[\.\!\?]$/i)) {
        issues.push({
          type: 'grammar',
          severity: 'minor',
          text: sentence,
          issue: 'Possible sentence fragment',
          suggestion: 'Verify this is a complete sentence',
          sentenceIndex: idx
        });
        errorCount++;
      }
    });

    // Check for run-on sentences (extremely long)
    sentences.forEach((sentence, idx) => {
      const words = this.tokenizer.tokenize(sentence);
      if (words.length > 40) {
        issues.push({
          type: 'grammar',
          severity: 'major',
          text: sentence.substring(0, 100) + '...',
          issue: `Very long sentence (${words.length} words)`,
          suggestion: 'Consider breaking into multiple sentences',
          sentenceIndex: idx
        });
        errorCount++;
      }
    });

    // Check for double spaces
    const doubleSpaces = text.match(/  +/g);
    if (doubleSpaces) {
      issues.push({
        type: 'grammar',
        severity: 'minor',
        text: 'Multiple spaces detected',
        issue: 'Extra spaces found',
        suggestion: 'Remove double spaces',
        count: doubleSpaces.length
      });
    }

    // Calculate score (100 - error rate)
    const totalSentences = sentences.length;
    const errorRate = totalSentences > 0 ? (errorCount / totalSentences) * 100 : 0;
    const score = Math.max(0, 100 - errorRate);

    return {
      score: Math.round(score),
      errorCount,
      errorRate: Math.round(errorRate * 10) / 10,
      issues,
      summary: {
        totalErrors: errorCount,
        criticalErrors: issues.filter(i => i.severity === 'critical').length,
        majorErrors: issues.filter(i => i.severity === 'major').length,
        minorErrors: issues.filter(i => i.severity === 'minor').length
      }
    };
  }

  /**
   * Analyze sentence structure and variety
   */
  analyzeSentenceStructure(sentences) {
    const issues = [];
    const lengths = sentences.map(s => this.tokenizer.tokenize(s).length);
    const structures = [];

    // Calculate statistics
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const minLength = Math.min(...lengths);
    const maxLength = Math.max(...lengths);
    const variance = this.calculateVariance(lengths);
    const stdDev = Math.sqrt(variance);

    // Analyze sentence beginnings for variety
    const beginnings = sentences.map(s => {
      const words = s.trim().split(/\s+/);
      return words[0].toLowerCase();
    });

    const beginningVariety = new Set(beginnings).size / beginnings.length;

    // Check for monotonous structure (all sentences similar length)
    if (stdDev < 3) {
      issues.push({
        type: 'sentence',
        severity: 'minor',
        issue: 'Low sentence length variety',
        suggestion: 'Vary sentence lengths for better rhythm',
        details: `Standard deviation: ${stdDev.toFixed(1)} words`
      });
    }

    // Check for too many short sentences
    const shortSentences = lengths.filter(l => l < 8).length;
    const shortPercent = (shortSentences / lengths.length) * 100;
    if (shortPercent > 30) {
      issues.push({
        type: 'sentence',
        severity: 'minor',
        issue: `${shortPercent.toFixed(0)}% of sentences are very short`,
        suggestion: 'Consider combining some short sentences',
        count: shortSentences
      });
    }

    // Check for too many long sentences
    const longSentences = lengths.filter(l => l > 25).length;
    const longPercent = (longSentences / lengths.length) * 100;
    if (longPercent > 20) {
      issues.push({
        type: 'sentence',
        severity: 'major',
        issue: `${longPercent.toFixed(0)}% of sentences are very long`,
        suggestion: 'Break long sentences into shorter ones',
        count: longSentences
      });
    }

    // Check beginning variety
    if (beginningVariety < 0.5) {
      issues.push({
        type: 'sentence',
        severity: 'minor',
        issue: 'Low variety in sentence beginnings',
        suggestion: 'Start sentences with different words/structures',
        variety: Math.round(beginningVariety * 100)
      });
    }

    // Ideal sentence length: 15-20 words, variety important
    let score = 100;

    // Penalize if average too short or too long
    if (avgLength < 10) score -= 10;
    if (avgLength < 8) score -= 10;
    if (avgLength > 25) score -= 10;
    if (avgLength > 30) score -= 10;

    // Penalize low variety
    if (stdDev < 3) score -= 15;
    if (stdDev < 5) score -= 10;

    // Penalize monotonous beginnings
    if (beginningVariety < 0.5) score -= 10;
    if (beginningVariety < 0.4) score -= 10;

    return {
      score: Math.max(0, Math.round(score)),
      avgLength: Math.round(avgLength * 10) / 10,
      minLength,
      maxLength,
      standardDeviation: Math.round(stdDev * 10) / 10,
      beginningVariety: Math.round(beginningVariety * 100),
      issues,
      statistics: {
        totalSentences: sentences.length,
        shortSentences,
        mediumSentences: lengths.filter(l => l >= 8 && l <= 25).length,
        longSentences,
        avgLength: Math.round(avgLength * 10) / 10
      }
    };
  }

  /**
   * Analyze clarity and conciseness
   */
  analyzeClarity(text, sentences) {
    const issues = [];
    let clarityScore = 100;

    // Tokenize
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const totalWords = words.length;

    // Check for weak words
    const weakWordCount = words.filter(w => this.weakWords.includes(w)).length;
    const weakWordPercent = (weakWordCount / totalWords) * 100;

    if (weakWordPercent > 2) {
      issues.push({
        type: 'clarity',
        severity: 'minor',
        issue: `${weakWordPercent.toFixed(1)}% weak/filler words`,
        suggestion: 'Remove or replace weak words like "very", "really", "just"',
        examples: this.weakWords.filter(w => words.includes(w)).slice(0, 5)
      });
      clarityScore -= Math.min(15, weakWordPercent * 2);
    }

    // Check for jargon
    const jargonCount = words.filter(w => this.jargonWords.includes(w)).length;
    if (jargonCount > 0) {
      issues.push({
        type: 'clarity',
        severity: 'major',
        issue: `${jargonCount} jargon words detected`,
        suggestion: 'Replace jargon with clear, plain language',
        examples: this.jargonWords.filter(w => words.includes(w))
      });
      clarityScore -= jargonCount * 5;
    }

    // Calculate Flesch Reading Ease
    const fleschScore = this.calculateFleschReadingEase(text, sentences);

    // Flesch score: 60-70 is ideal for general audience
    // 70-80 is fairly easy, 60-70 is plain English
    if (fleschScore < 50) {
      issues.push({
        type: 'clarity',
        severity: 'major',
        issue: 'Text is difficult to read',
        suggestion: 'Simplify language and shorten sentences',
        fleschScore: Math.round(fleschScore)
      });
      clarityScore -= 20;
    } else if (fleschScore < 60) {
      issues.push({
        type: 'clarity',
        severity: 'minor',
        issue: 'Text could be more accessible',
        suggestion: 'Consider simplifying some complex sentences',
        fleschScore: Math.round(fleschScore)
      });
      clarityScore -= 10;
    }

    // Check for overly complex words (3+ syllables)
    const complexWords = this.countComplexWords(text);
    const complexWordPercent = (complexWords / totalWords) * 100;

    if (complexWordPercent > 15) {
      issues.push({
        type: 'clarity',
        severity: 'minor',
        issue: `${complexWordPercent.toFixed(1)}% complex words`,
        suggestion: 'Use simpler alternatives where possible',
        count: complexWords
      });
      clarityScore -= 10;
    }

    // Check for redundant phrases
    const redundancies = this.findRedundancies(text);
    if (redundancies.length > 0) {
      issues.push({
        type: 'clarity',
        severity: 'minor',
        issue: 'Redundant phrases detected',
        suggestion: 'Remove redundant words for conciseness',
        examples: redundancies.slice(0, 5)
      });
      clarityScore -= redundancies.length * 2;
    }

    return {
      score: Math.max(0, Math.round(clarityScore)),
      fleschReadingEase: Math.round(fleschScore),
      readingLevel: this.getReadingLevel(fleschScore),
      weakWordPercent: Math.round(weakWordPercent * 10) / 10,
      complexWordPercent: Math.round(complexWordPercent * 10) / 10,
      jargonCount,
      issues,
      metrics: {
        weakWords: weakWordCount,
        jargonWords: jargonCount,
        complexWords,
        redundancies: redundancies.length
      }
    };
  }

  /**
   * Analyze active vs passive voice
   */
  analyzeVoice(sentences) {
    const issues = [];
    let passiveCount = 0;
    const passiveSentences = [];

    sentences.forEach((sentence, idx) => {
      const isPassive = this.passiveIndicators.some(pattern => pattern.test(sentence));
      if (isPassive) {
        passiveCount++;
        passiveSentences.push({
          index: idx,
          text: sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''),
          suggestion: this.suggestActiveVoice(sentence)
        });
      }
    });

    const passivePercent = (passiveCount / sentences.length) * 100;
    const activePercent = 100 - passivePercent;

    // Generate issues based on passive voice usage
    if (passivePercent > 30) {
      issues.push({
        type: 'voice',
        severity: 'critical',
        issue: `${passivePercent.toFixed(0)}% passive voice (very high)`,
        suggestion: 'Rewrite most passive sentences to active voice',
        examples: passiveSentences.slice(0, 3)
      });
    } else if (passivePercent > 20) {
      issues.push({
        type: 'voice',
        severity: 'major',
        issue: `${passivePercent.toFixed(0)}% passive voice (high)`,
        suggestion: 'Convert some passive sentences to active voice',
        examples: passiveSentences.slice(0, 2)
      });
    } else if (passivePercent > 10) {
      issues.push({
        type: 'voice',
        severity: 'minor',
        issue: `${passivePercent.toFixed(0)}% passive voice`,
        suggestion: 'Consider active voice for stronger writing',
        examples: passiveSentences.slice(0, 1)
      });
    }

    // Score: 100% active = 100, linear decrease
    // Target: >70% active voice
    const score = Math.max(0, Math.min(100, activePercent * 1.2));

    return {
      score: Math.round(score),
      activePercent: Math.round(activePercent * 10) / 10,
      passivePercent: Math.round(passivePercent * 10) / 10,
      passiveCount,
      activeCount: sentences.length - passiveCount,
      passiveSentences,
      issues
    };
  }

  /**
   * Analyze paragraph coherence and flow
   */
  analyzeCoherence(paragraphs, sentences) {
    const issues = [];
    let coherenceScore = 100;

    // Check paragraph lengths
    const paragraphSentenceCounts = paragraphs.map(p => {
      return this.sentenceTokenizer.tokenize(p).length;
    });

    // Check for very short paragraphs (1 sentence)
    const shortParagraphs = paragraphSentenceCounts.filter(c => c === 1).length;
    const shortPercent = (shortParagraphs / paragraphs.length) * 100;

    if (shortPercent > 40) {
      issues.push({
        type: 'coherence',
        severity: 'minor',
        issue: `${shortPercent.toFixed(0)}% single-sentence paragraphs`,
        suggestion: 'Develop ideas more fully or combine related paragraphs',
        count: shortParagraphs
      });
      coherenceScore -= 10;
    }

    // Check for very long paragraphs (>8 sentences)
    const longParagraphs = paragraphSentenceCounts.filter(c => c > 8).length;
    if (longParagraphs > 0) {
      issues.push({
        type: 'coherence',
        severity: 'minor',
        issue: `${longParagraphs} very long paragraph(s)`,
        suggestion: 'Break long paragraphs for better readability',
        count: longParagraphs
      });
      coherenceScore -= longParagraphs * 5;
    }

    // Check for transition words
    const transitionWords = [
      'however', 'therefore', 'moreover', 'furthermore', 'additionally',
      'consequently', 'meanwhile', 'similarly', 'conversely', 'nevertheless',
      'thus', 'hence', 'accordingly', 'likewise', 'otherwise'
    ];

    const transitionCount = sentences.filter(s => {
      const firstWords = s.toLowerCase().split(/\s+/).slice(0, 2);
      return transitionWords.some(tw => firstWords.includes(tw));
    }).length;

    const transitionPercent = (transitionCount / sentences.length) * 100;

    if (transitionPercent < 5) {
      issues.push({
        type: 'coherence',
        severity: 'minor',
        issue: 'Few transition words detected',
        suggestion: 'Add transitions to improve flow between ideas',
        transitionPercent: Math.round(transitionPercent)
      });
      coherenceScore -= 10;
    }

    // Analyze topic consistency using TF-IDF
    paragraphs.forEach(p => this.tfidf.addDocument(p));

    const topicConsistency = this.calculateTopicConsistency();

    if (topicConsistency < 0.3) {
      issues.push({
        type: 'coherence',
        severity: 'major',
        issue: 'Low topic consistency across paragraphs',
        suggestion: 'Ensure paragraphs connect to central theme',
        consistency: Math.round(topicConsistency * 100)
      });
      coherenceScore -= 15;
    }

    return {
      score: Math.max(0, Math.round(coherenceScore)),
      paragraphCount: paragraphs.length,
      avgSentencesPerParagraph: Math.round((paragraphSentenceCounts.reduce((a, b) => a + b, 0) / paragraphs.length) * 10) / 10,
      shortParagraphs,
      longParagraphs,
      transitionPercent: Math.round(transitionPercent * 10) / 10,
      topicConsistency: Math.round(topicConsistency * 100),
      issues
    };
  }

  /**
   * Get AI-powered writing critique
   */
  async getAICritique(text, context) {
    try {
      // Truncate text if too long (max 3000 words for AI analysis)
      const words = this.tokenizer.tokenize(text);
      const truncatedText = words.length > 3000
        ? words.slice(0, 3000).join(' ') + '...'
        : text;

      const prompt = `Analyze this text for writing quality. Provide specific, actionable feedback.

Context:
- Grammar issues found: ${context.grammarIssues}
- Average sentence length: ${context.avgSentenceLength} words
- Passive voice: ${context.passiveVoicePercent}%
- Clarity score: ${context.clarityScore}/100

Text to analyze:
"""
${truncatedText}
"""

Please provide:
1. Overall assessment (2-3 sentences)
2. Top 3 strengths
3. Top 3 areas for improvement
4. Specific rewrite suggestions for weakest sentences (if any)

Format as JSON:
{
  "assessment": "...",
  "strengths": ["...", "...", "..."],
  "improvements": ["...", "...", "..."],
  "rewrites": [
    {"original": "...", "improved": "...", "reason": "..."}
  ]
}`;

      const response = await this.aiClient.generateText({
        model: this.config.aiModels.writingQuality.primary,
        prompt,
        temperature: this.config.aiModels.writingQuality.temperature,
        maxTokens: this.config.aiModels.writingQuality.maxTokens,
        systemPrompt: this.config.aiModels.writingQuality.systemPrompt
      });

      // Parse JSON response
      const critique = JSON.parse(response);

      return critique;

    } catch (error) {
      console.error('AI critique error:', error);
      return {
        assessment: 'AI analysis unavailable',
        strengths: [],
        improvements: [],
        rewrites: [],
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Find repeated words in text
   */
  findRepeatedWords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const wordCounts = {};
    const wordLocations = {};

    words.forEach((word, idx) => {
      if (word.length > 4) { // Only track substantial words
        wordCounts[word] = (wordCounts[word] || 0) + 1;
        if (!wordLocations[word]) wordLocations[word] = [];
        wordLocations[word].push(idx);
      }
    });

    return Object.entries(wordCounts)
      .filter(([word, count]) => count > 1)
      .map(([word, count]) => ({
        word,
        count,
        locations: wordLocations[word]
      }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Calculate Flesch Reading Ease score
   */
  calculateFleschReadingEase(text, sentences) {
    const words = this.tokenizer.tokenize(text);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    const totalSentences = sentences.length;
    const totalWords = words.length;
    const totalSyllables = syllables;

    if (totalSentences === 0 || totalWords === 0) return 0;

    const avgSentenceLength = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;

    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in a word
   */
  countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g);
    let syllables = vowelGroups ? vowelGroups.length : 1;

    // Adjust for silent 'e'
    if (word.endsWith('e')) syllables--;

    // Adjust for 'le' ending
    if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
      syllables++;
    }

    return Math.max(1, syllables);
  }

  /**
   * Get reading level from Flesch score
   */
  getReadingLevel(fleschScore) {
    if (fleschScore >= 90) return '5th grade';
    if (fleschScore >= 80) return '6th grade';
    if (fleschScore >= 70) return '7th grade';
    if (fleschScore >= 60) return '8th-9th grade';
    if (fleschScore >= 50) return '10th-12th grade';
    if (fleschScore >= 30) return 'College';
    return 'College graduate';
  }

  /**
   * Count complex words (3+ syllables)
   */
  countComplexWords(text) {
    const words = this.tokenizer.tokenize(text);
    return words.filter(word => this.countSyllables(word) >= 3).length;
  }

  /**
   * Find redundant phrases
   */
  findRedundancies(text) {
    const redundantPhrases = [
      'absolutely essential', 'advance planning', 'basic fundamentals',
      'close proximity', 'completely eliminate', 'end result',
      'final outcome', 'free gift', 'future plans', 'past history',
      'personal opinion', 'true facts', 'unexpected surprise'
    ];

    const found = [];
    redundantPhrases.forEach(phrase => {
      const regex = new RegExp(phrase, 'gi');
      if (regex.test(text)) {
        found.push(phrase);
      }
    });

    return found;
  }

  /**
   * Suggest active voice alternative
   */
  suggestActiveVoice(sentence) {
    // This is simplified - real implementation would use more sophisticated NLP
    const match = sentence.match(/(.+?)\s+(is|are|was|were|be|been|being)\s+(\w+ed|\\w+en)\s+by\s+(.+)/i);

    if (match) {
      const [, subject, verb, pastParticiple, actor] = match;
      return `Try: "${actor.trim()} ${pastParticiple} ${subject.trim()}"`;
    }

    return 'Rewrite in active voice';
  }

  /**
   * Calculate variance
   */
  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
  }

  /**
   * Calculate topic consistency using TF-IDF
   */
  calculateTopicConsistency() {
    if (this.tfidf.documents.length < 2) return 1;

    // Get top terms from first document
    const topTerms = [];
    this.tfidf.listTerms(0).slice(0, 10).forEach(item => {
      topTerms.push(item.term);
    });

    // Check how many of these terms appear in other documents
    let consistencySum = 0;
    for (let i = 1; i < this.tfidf.documents.length; i++) {
      const docTerms = this.tfidf.listTerms(i).slice(0, 10).map(item => item.term);
      const overlap = topTerms.filter(term => docTerms.includes(term)).length;
      consistencySum += overlap / topTerms.length;
    }

    return consistencySum / (this.tfidf.documents.length - 1);
  }

  /**
   * Calculate weighted score
   */
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

  /**
   * Combine issues from multiple analyses
   */
  combineIssues(issueArrays) {
    return issueArrays.flat().sort((a, b) => {
      const severityOrder = { critical: 0, major: 1, minor: 2, suggestion: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }

  /**
   * Generate recommendations based on scores
   */
  generateRecommendations(overallScore, scores) {
    const recommendations = [];
    const config = this.config.improvementRecommendations.writingQuality;

    // Determine score tier
    let tier = 'highScore';
    if (overallScore < 70) tier = 'lowScore';
    else if (overallScore < 85) tier = 'mediumScore';

    // Add general recommendations
    recommendations.push(...config[tier]);

    // Add specific recommendations based on weak areas
    if (scores.grammarAccuracy < 90) {
      recommendations.push('Priority: Fix grammar and spelling errors');
    }
    if (scores.clarity < 80) {
      recommendations.push('Priority: Improve clarity by simplifying language');
    }
    if (scores.activeVoice < 70) {
      recommendations.push('Priority: Convert passive voice to active voice');
    }

    return [...new Set(recommendations)]; // Remove duplicates
  }
}

module.exports = WritingQualityChecker;
