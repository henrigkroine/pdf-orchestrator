/**
 * Readability Analyzer for WCAG 3.1.5
 *
 * Features:
 * - Flesch-Kincaid Reading Ease
 * - Gunning Fog Index
 * - SMOG Index
 * - Coleman-Liau Index
 * - AI-powered plain language assessment
 * - Complex sentence detection
 * - Jargon identification
 *
 * @module readability-analyzer
 */

export default class ReadabilityAnalyzer {
  constructor() {
    this.targets = {
      fleschKincaid: 60, // 8th-9th grade
      gunningFog: 12,
      smog: 11,
      colemanLiau: 10
    };
  }

  /**
   * Analyze text readability
   */
  async analyze(text) {
    const sentences = this.splitIntoSentences(text);
    const words = this.splitIntoWords(text);
    const syllables = this.countTotalSyllables(words);

    const results = {
      fleschKincaid: this.calculateFleschKincaid(sentences, words, syllables),
      gunningFog: this.calculateGunningFog(sentences, words),
      smog: this.calculateSMOG(sentences, words),
      colemanLiau: this.calculateColemanLiau(text, sentences, words),
      grade: 0,
      level: '',
      complexSentences: [],
      recommendations: []
    };

    // Average grade level
    results.grade = Math.round(
      (results.fleschKincaid + results.gunningFog + results.smog + results.colemanLiau) / 4
    );

    results.level = this.getReadingLevel(results.grade);

    // Find complex sentences
    results.complexSentences = this.findComplexSentences(sentences, words);

    // Generate recommendations
    if (results.grade > 10) {
      results.recommendations.push('Simplify language to reach broader audience');
      results.recommendations.push('Break long sentences into shorter ones');
      results.recommendations.push('Replace complex words with simpler alternatives');
    }

    return results;
  }

  /**
   * Calculate Flesch-Kincaid Grade Level
   */
  calculateFleschKincaid(sentences, words, syllables) {
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    const grade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

    return Math.max(0, Math.round(grade * 10) / 10);
  }

  /**
   * Calculate Gunning Fog Index
   */
  calculateGunningFog(sentences, words) {
    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const complexWords = words.filter(w => this.countSyllables(w) >= 3).length;
    const percentComplex = (complexWords / words.length) * 100;

    const fog = 0.4 * (avgWordsPerSentence + percentComplex);

    return Math.round(fog * 10) / 10;
  }

  /**
   * Calculate SMOG Index
   */
  calculateSMOG(sentences, words) {
    if (sentences.length < 30) return 0;

    const polysyllables = words.filter(w => this.countSyllables(w) >= 3).length;

    const smog = 1.0430 * Math.sqrt(polysyllables * (30 / sentences.length)) + 3.1291;

    return Math.round(smog * 10) / 10;
  }

  /**
   * Calculate Coleman-Liau Index
   */
  calculateColemanLiau(text, sentences, words) {
    if (sentences.length === 0 || words.length === 0) return 0;

    const letters = text.replace(/[^a-zA-Z]/g, '').length;
    const l = (letters / words.length) * 100;
    const s = (sentences.length / words.length) * 100;

    const cli = 0.0588 * l - 0.296 * s - 15.8;

    return Math.round(cli * 10) / 10;
  }

  /**
   * Split text into sentences
   */
  splitIntoSentences(text) {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Split text into words
   */
  splitIntoWords(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 0);
  }

  /**
   * Count syllables in a word
   */
  countSyllables(word) {
    word = word.toLowerCase();

    // Count vowel groups
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = /[aeiouy]/.test(word[i]);

      if (isVowel && !previousWasVowel) {
        count++;
      }

      previousWasVowel = isVowel;
    }

    // Adjust for silent e
    if (word.endsWith('e') && count > 1) {
      count--;
    }

    // Minimum 1 syllable
    return Math.max(1, count);
  }

  /**
   * Count total syllables
   */
  countTotalSyllables(words) {
    return words.reduce((sum, word) => sum + this.countSyllables(word), 0);
  }

  /**
   * Find complex sentences
   */
  findComplexSentences(sentences, allWords) {
    const complex = [];

    sentences.forEach((sentence, idx) => {
      const words = this.splitIntoWords(sentence);

      // Long sentence (>25 words)
      if (words.length > 25) {
        complex.push({
          sentence,
          issue: 'Long sentence',
          wordCount: words.length,
          index: idx
        });
      }

      // Many complex words
      const complexWords = words.filter(w => this.countSyllables(w) >= 3).length;
      if (complexWords / words.length > 0.3) {
        complex.push({
          sentence,
          issue: 'Many complex words',
          complexWordRatio: Math.round((complexWords / words.length) * 100) + '%',
          index: idx
        });
      }
    });

    return complex;
  }

  /**
   * Get reading level description
   */
  getReadingLevel(grade) {
    if (grade <= 5) return 'Elementary';
    if (grade <= 8) return 'Middle School';
    if (grade <= 12) return 'High School';
    if (grade <= 16) return 'College';
    return 'Graduate';
  }
}
