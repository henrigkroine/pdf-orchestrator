/**
 * Audience Analyzer
 *
 * Analyzes content appropriateness for target audience including
 * reading level, technical depth, cultural sensitivity, and inclusive language.
 *
 * Features:
 * - Reading level calculation (Flesch-Kincaid, SMOG, etc.)
 * - Technical depth assessment
 * - Cultural sensitivity checking
 * - Inclusive language validation
 * - Professional tone maintenance
 * - AI audience appropriateness with Claude Sonnet 4.5
 */

const natural = require('natural');

class AudienceAnalyzer {
  constructor(config, aiClient) {
    this.config = config;
    this.aiClient = aiClient;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();

    // Technical jargon by field
    this.technicalTerms = {
      education: ['pedagogy', 'curriculum', 'andragogy', 'scaffolding', 'differentiation', 'assessment'],
      technology: ['API', 'cloud', 'infrastructure', 'deployment', 'scalable', 'integration'],
      business: ['ROI', 'synergy', 'leverage', 'stakeholder', 'KPI', 'metrics', 'value proposition'],
      academic: ['methodology', 'empirical', 'quantitative', 'qualitative', 'hypothesis', 'correlation']
    };

    // Non-inclusive language patterns
    this.nonInclusiveLanguage = [
      { pattern: /\b(he|his|him)\b(?!\s+(or|\/)\s+(she|her))/gi, issue: 'Gender-exclusive pronoun', suggestion: 'Use "they/their" or "he or she"' },
      { pattern: /\bmankind\b/gi, issue: 'Gender-exclusive term', suggestion: 'Use "humanity" or "people"' },
      { pattern: /\bmanpower\b/gi, issue: 'Gender-exclusive term', suggestion: 'Use "workforce" or "staff"' },
      { pattern: /\bchairman\b/gi, issue: 'Gender-exclusive title', suggestion: 'Use "chair" or "chairperson"' },
      { pattern: /\bsalesman\b/gi, issue: 'Gender-exclusive role', suggestion: 'Use "salesperson"' }
    ];

    // Potentially insensitive language
    this.sensitiveLanguage = [
      { pattern: /\b(victim|suffer|afflicted|disadvantaged|underprivileged)\b/gi, issue: 'Potentially disempowering language', suggestion: 'Use empowering alternatives' },
      { pattern: /\b(poor|needy|unfortunate|less fortunate)\b/gi, issue: 'Potentially condescending', suggestion: 'Use specific, respectful terms' },
      { pattern: /\b(third world|developing country)\b/gi, issue: 'Potentially outdated term', suggestion: 'Use "emerging economy" or specific country name' },
      { pattern: /\b(normal|abnormal)\b(?=\s+(person|people|child))/gi, issue: 'Ableist language', suggestion: 'Describe specific characteristics' }
    ];

    // Unprofessional language
    this.unprofessionalLanguage = [
      /\b(awesome|cool|amazing|incredible|super|mega)\b/gi,
      /\b(gonna|wanna|gotta|kinda|sorta)\b/gi,
      /\b(stuff|things|basically|actually|literally)\b/gi,
      /\b(LOL|OMG|WTF|BTW)\b/g
    ];

    // Age-appropriate language markers
    this.ageAppropriate = {
      young: ['fun', 'exciting', 'discover', 'explore', 'adventure'],
      adult: ['professional', 'strategic', 'investment', 'partnership', 'collaboration'],
      senior: ['experienced', 'proven', 'established', 'comprehensive', 'thorough']
    };
  }

  /**
   * Analyze audience appropriateness
   */
  async analyzeAudience(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting audience appropriateness analysis...');

      const targetAudience = options.targetAudience || 'corporatePartners';
      const sentences = this.sentenceTokenizer.tokenize(text);

      // Run all audience analyses
      const readingLevel = this.analyzeReadingLevel(text, sentences);
      const technicalDepth = this.analyzeTechnicalDepth(text);
      const culturalSensitivity = this.analyzeCulturalSensitivity(text);
      const inclusiveLanguage = this.analyzeInclusiveLanguage(text);
      const professionalTone = this.analyzeProfessionalTone(text);

      // Get AI audience assessment with Claude Sonnet 4.5
      const aiAssessment = await this.getAIAudienceAssessment(text, {
        targetAudience,
        readingLevel: readingLevel.gradeLevel,
        technicalDepth: technicalDepth.level,
        issues: [
          ...culturalSensitivity.issues,
          ...inclusiveLanguage.issues,
          ...professionalTone.issues
        ]
      });

      // Calculate overall audience appropriateness score
      const scores = {
        readingLevel: readingLevel.score,
        technicalDepth: technicalDepth.score,
        culturalSensitivity: culturalSensitivity.score,
        inclusiveLanguage: inclusiveLanguage.score,
        professionalTone: professionalTone.score
      };

      const weights = this.config.qualityDimensions.audienceAppropriateness.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'audienceAppropriateness',
        overallScore,
        scores,
        details: {
          readingLevel,
          technicalDepth,
          culturalSensitivity,
          inclusiveLanguage,
          professionalTone
        },
        aiAssessment,
        issues: this.combineIssues([
          readingLevel.issues,
          technicalDepth.issues,
          culturalSensitivity.issues,
          inclusiveLanguage.issues,
          professionalTone.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores, targetAudience),
        metadata: {
          duration,
          targetAudience,
          sentenceCount: sentences.length
        }
      };

    } catch (error) {
      console.error('Audience analysis error:', error);
      throw new Error(`Audience analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze reading level using multiple metrics
   */
  analyzeReadingLevel(text, sentences) {
    const issues = [];
    const words = this.tokenizer.tokenize(text);

    // Calculate multiple readability scores
    const flesch = this.calculateFleschReadingEase(text, sentences, words);
    const fleschKincaid = this.calculateFleschKincaidGrade(text, sentences, words);
    const smog = this.calculateSMOGIndex(text, sentences);
    const gunningFog = this.calculateGunningFog(text, sentences, words);

    // Average grade level
    const gradeLevel = Math.round((fleschKincaid + smog + gunningFog) / 3);

    // Get expected range for target audience
    const targetAudience = this.config.targetAudiences.corporatePartners;
    const expectedRange = targetAudience.readingLevel;

    // Score based on how well it matches expected range
    let score = 100;

    if (gradeLevel < expectedRange.min) {
      issues.push({
        type: 'readingLevel',
        severity: 'minor',
        issue: `Reading level (grade ${gradeLevel}) below target range (${expectedRange.min}-${expectedRange.max})`,
        suggestion: 'Increase sophistication and complexity for target audience',
        actual: gradeLevel,
        expected: `${expectedRange.min}-${expectedRange.max}`
      });
      score -= (expectedRange.min - gradeLevel) * 5;

    } else if (gradeLevel > expectedRange.max) {
      issues.push({
        type: 'readingLevel',
        severity: 'major',
        issue: `Reading level (grade ${gradeLevel}) above target range (${expectedRange.min}-${expectedRange.max})`,
        suggestion: 'Simplify language and sentence structure',
        actual: gradeLevel,
        expected: `${expectedRange.min}-${expectedRange.max}`
      });
      score -= (gradeLevel - expectedRange.max) * 8;
    }

    // Check for extreme sentence lengths
    const sentenceLengths = sentences.map(s => this.tokenizer.tokenize(s).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;

    if (avgLength > 30) {
      issues.push({
        type: 'readingLevel',
        severity: 'minor',
        issue: `Very long average sentence length (${Math.round(avgLength)} words)`,
        suggestion: 'Break some sentences into shorter ones',
        avgLength: Math.round(avgLength)
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      gradeLevel,
      fleschReadingEase: Math.round(flesch),
      fleschKincaidGrade: Math.round(fleschKincaid * 10) / 10,
      smogIndex: Math.round(smog * 10) / 10,
      gunningFog: Math.round(gunningFog * 10) / 10,
      avgSentenceLength: Math.round(avgLength * 10) / 10,
      readingLevelDescription: this.getReadingLevelDescription(gradeLevel),
      issues,
      summary: {
        gradeLevel,
        targetRange: `${expectedRange.min}-${expectedRange.max}`,
        withinRange: gradeLevel >= expectedRange.min && gradeLevel <= expectedRange.max
      }
    };
  }

  /**
   * Analyze technical depth
   */
  analyzeTechnicalDepth(text) {
    const issues = [];
    const words = this.tokenizer.tokenize(text.toLowerCase());
    let score = 100;

    // Count technical terms
    const technicalCounts = {};
    let totalTechnical = 0;

    Object.entries(this.technicalTerms).forEach(([field, terms]) => {
      const count = words.filter(w => terms.includes(w)).length;
      technicalCounts[field] = count;
      totalTechnical += count;
    });

    const technicalDensity = (totalTechnical / words.length) * 100;

    // Determine technical level
    let level = 'moderate';
    if (technicalDensity < 1) level = 'low';
    else if (technicalDensity > 5) level = 'high';

    // Check against expected for audience
    const expectedDepth = 'moderate'; // From config

    if (level === 'high' && expectedDepth !== 'high') {
      issues.push({
        type: 'technicalDepth',
        severity: 'major',
        issue: 'Too much technical jargon for target audience',
        suggestion: 'Simplify technical language or add explanations',
        density: Math.round(technicalDensity * 10) / 10
      });
      score -= 25;

    } else if (level === 'low' && expectedDepth === 'high') {
      issues.push({
        type: 'technicalDepth',
        severity: 'minor',
        issue: 'May be too simplistic for technical audience',
        suggestion: 'Increase technical depth and precision',
        density: Math.round(technicalDensity * 10) / 10
      });
      score -= 15;
    }

    // Check for unexplained acronyms
    const acronyms = this.findUnexplainedAcronyms(text);

    if (acronyms.length > 0) {
      issues.push({
        type: 'technicalDepth',
        severity: 'minor',
        issue: `${acronyms.length} potentially unexplained acronym(s)`,
        suggestion: 'Define acronyms on first use',
        examples: acronyms.slice(0, 3)
      });
      score -= acronyms.length * 5;
    }

    return {
      score: Math.max(0, Math.round(score)),
      level,
      technicalDensity: Math.round(technicalDensity * 10) / 10,
      technicalCounts,
      totalTechnicalTerms: totalTechnical,
      unexplainedAcronyms: acronyms,
      issues,
      summary: {
        level,
        appropriate: level === expectedDepth,
        technicalTerms: totalTechnical
      }
    };
  }

  /**
   * Analyze cultural sensitivity
   */
  analyzeCulturalSensitivity(text) {
    const issues = [];
    let score = 100;
    const flaggedPhrases = [];

    // Check for potentially insensitive language
    this.sensitiveLanguage.forEach(({ pattern, issue, suggestion }) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];

        uniqueMatches.forEach(match => {
          flaggedPhrases.push({
            text: match,
            issue,
            suggestion,
            context: this.getContext(text, match)
          });

          issues.push({
            type: 'culturalSensitivity',
            severity: 'major',
            issue: `Potentially insensitive language: "${match}"`,
            suggestion,
            text: match
          });

          score -= 15;
        });
      }
    });

    // Check for cultural assumptions
    const culturalAssumptions = this.findCulturalAssumptions(text);

    culturalAssumptions.forEach(({ text, assumption }) => {
      issues.push({
        type: 'culturalSensitivity',
        severity: 'minor',
        issue: `Possible cultural assumption: ${assumption}`,
        suggestion: 'Use inclusive language that doesn\'t assume specific cultural context',
        text
      });
      score -= 10;
    });

    return {
      score: Math.max(0, Math.round(score)),
      flaggedPhrases,
      culturalAssumptions,
      issues,
      summary: {
        flaggedCount: flaggedPhrases.length,
        assumptionsFound: culturalAssumptions.length,
        culturallySensitive: flaggedPhrases.length === 0 && culturalAssumptions.length === 0
      }
    };
  }

  /**
   * Analyze inclusive language
   */
  analyzeInclusiveLanguage(text) {
    const issues = [];
    let score = 100;
    const nonInclusiveInstances = [];

    // Check for non-inclusive language patterns
    this.nonInclusiveLanguage.forEach(({ pattern, issue, suggestion }) => {
      const matches = text.match(pattern);
      if (matches) {
        const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];

        uniqueMatches.forEach(match => {
          nonInclusiveInstances.push({
            text: match,
            issue,
            suggestion,
            context: this.getContext(text, match)
          });

          issues.push({
            type: 'inclusiveLanguage',
            severity: 'major',
            issue: `Non-inclusive language: "${match}" (${issue})`,
            suggestion,
            text: match
          });

          score -= 12;
        });
      }
    });

    // Check for diversity and representation
    const representation = this.checkRepresentation(text);

    if (!representation.diverse) {
      issues.push({
        type: 'inclusiveLanguage',
        severity: 'minor',
        issue: 'Limited diversity in examples/language',
        suggestion: 'Include diverse perspectives and examples',
        details: representation.details
      });
      score -= 10;
    }

    // Check for accessibility language
    const accessibility = this.checkAccessibilityLanguage(text);

    if (!accessibility.inclusive) {
      issues.push({
        type: 'inclusiveLanguage',
        severity: 'minor',
        issue: 'Could improve accessibility language',
        suggestion: 'Use person-first language and avoid ableist terms',
        examples: accessibility.issues
      });
      score -= 8;
    }

    return {
      score: Math.max(0, Math.round(score)),
      nonInclusiveInstances,
      representation,
      accessibility,
      issues,
      summary: {
        nonInclusiveCount: nonInclusiveInstances.length,
        diverse: representation.diverse,
        accessible: accessibility.inclusive
      }
    };
  }

  /**
   * Analyze professional tone
   */
  analyzeProfessionalTone(text) {
    const issues = [];
    let score = 100;
    const unprofessionalInstances = [];

    // Check for unprofessional language
    this.unprofessionalLanguage.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          unprofessionalInstances.push({
            text: match,
            context: this.getContext(text, match)
          });

          issues.push({
            type: 'professionalTone',
            severity: 'minor',
            issue: `Unprofessional language: "${match}"`,
            suggestion: 'Use more formal, professional alternatives',
            text: match
          });

          score -= 8;
        });
      }
    });

    // Check for appropriate formality
    const formality = this.assessFormality(text);

    if (formality.level === 'too casual') {
      issues.push({
        type: 'professionalTone',
        severity: 'major',
        issue: 'Overall tone is too casual',
        suggestion: 'Increase formality for professional audience',
        formalityScore: formality.score
      });
      score -= 20;

    } else if (formality.level === 'too formal') {
      issues.push({
        type: 'professionalTone',
        severity: 'minor',
        issue: 'Tone may be overly formal',
        suggestion: 'Consider more approachable, conversational tone',
        formalityScore: formality.score
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      unprofessionalInstances,
      formality,
      issues,
      summary: {
        unprofessionalCount: unprofessionalInstances.length,
        formalityLevel: formality.level,
        professional: unprofessionalInstances.length === 0 && formality.level === 'appropriate'
      }
    };
  }

  /**
   * Get AI audience assessment using Claude Sonnet 4.5
   */
  async getAIAudienceAssessment(text, context) {
    try {
      const words = this.tokenizer.tokenize(text);
      const truncatedText = words.length > 2000
        ? words.slice(0, 2000).join(' ') + '...'
        : text;

      const prompt = `Analyze this content for audience appropriateness.

Context:
- Target Audience: ${context.targetAudience}
- Reading Level: Grade ${context.readingLevel}
- Technical Depth: ${context.technicalDepth}
- Issues Found: ${context.issues.length}

Content:
"""
${truncatedText}
"""

Provide expert audience analysis:

1. Audience Alignment
   - Is this appropriate for ${context.targetAudience}?
   - Does the tone, complexity, and content match their needs?

2. Reading Level Assessment
   - Is the complexity appropriate?
   - Are sentences and vocabulary accessible?

3. Cultural Sensitivity & Inclusivity
   - Is the language respectful and inclusive?
   - Are there any problematic assumptions or biases?

4. Professional Appropriateness
   - Is the tone professional yet engaging?
   - Does it build credibility with this audience?

5. Recommendations
   - How could this better serve the target audience?
   - What changes would improve accessibility?

Format as JSON:
{
  "audienceAlignment": "...",
  "strengths": ["...", "...", "..."],
  "concerns": ["...", "...", "..."],
  "readingLevelAssessment": "...",
  "inclusivityAssessment": "...",
  "toneAssessment": "...",
  "recommendations": [
    {"aspect": "...", "current": "...", "improved": "...", "why": "..."}
  ]
}`;

      const response = await this.aiClient.generateText({
        model: this.config.aiModels.audience.primary,
        prompt,
        temperature: this.config.aiModels.audience.temperature,
        maxTokens: this.config.aiModels.audience.maxTokens,
        systemPrompt: this.config.aiModels.audience.systemPrompt
      });

      return JSON.parse(response);

    } catch (error) {
      console.error('AI audience assessment error:', error);
      return {
        audienceAlignment: 'AI analysis unavailable',
        strengths: [],
        concerns: [],
        readingLevelAssessment: '',
        inclusivityAssessment: '',
        toneAssessment: '',
        recommendations: [],
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  calculateFleschReadingEase(text, sentences, words) {
    const syllables = this.countTotalSyllables(words);
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    return 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  }

  calculateFleschKincaidGrade(text, sentences, words) {
    const syllables = this.countTotalSyllables(words);
    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    return (0.39 * avgSentenceLength) + (11.8 * avgSyllablesPerWord) - 15.59;
  }

  calculateSMOGIndex(text, sentences) {
    if (sentences.length < 30) {
      // SMOG requires 30 sentences, use approximation
      return this.calculateFleschKincaidGrade(text, sentences, this.tokenizer.tokenize(text));
    }

    const polysyllables = this.countPolysyllables(text);
    return 1.0430 * Math.sqrt(polysyllables * (30 / sentences.length)) + 3.1291;
  }

  calculateGunningFog(text, sentences, words) {
    const complexWords = words.filter(w => this.countSyllables(w) >= 3).length;
    const avgSentenceLength = words.length / sentences.length;
    const percentComplex = (complexWords / words.length) * 100;

    return 0.4 * (avgSentenceLength + percentComplex);
  }

  countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length <= 3) return 1;

    const vowelGroups = word.match(/[aeiouy]+/g);
    let syllables = vowelGroups ? vowelGroups.length : 1;

    if (word.endsWith('e')) syllables--;
    if (word.endsWith('le') && word.length > 2 && !/[aeiouy]/.test(word[word.length - 3])) {
      syllables++;
    }

    return Math.max(1, syllables);
  }

  countTotalSyllables(words) {
    return words.reduce((total, word) => total + this.countSyllables(word), 0);
  }

  countPolysyllables(text) {
    const words = this.tokenizer.tokenize(text);
    return words.filter(w => this.countSyllables(w) >= 3).length;
  }

  getReadingLevelDescription(grade) {
    if (grade <= 6) return 'Elementary school';
    if (grade <= 8) return 'Middle school';
    if (grade <= 12) return 'High school';
    if (grade <= 16) return 'College';
    return 'Graduate level';
  }

  findUnexplainedAcronyms(text) {
    const acronymPattern = /\b[A-Z]{2,}\b/g;
    const acronyms = text.match(acronymPattern) || [];
    const uniqueAcronyms = [...new Set(acronyms)];

    // Filter out common/explained acronyms
    const unexplained = uniqueAcronyms.filter(acronym => {
      // Check if explained (appears with full form nearby)
      const fullFormPattern = new RegExp(`([A-Z][a-z]+\\s+){${acronym.length - 1}}[A-Z][a-z]+\\s*\\(${acronym}\\)`, 'g');
      return !fullFormPattern.test(text);
    });

    return unexplained;
  }

  findCulturalAssumptions(text) {
    const assumptions = [];

    // Holiday-specific language
    if (/\b(Christmas|Easter|Thanksgiving)\b/i.test(text)) {
      assumptions.push({
        text: 'Religious/cultural holiday mentioned',
        assumption: 'Assumes familiarity with specific holidays'
      });
    }

    // US-centric language
    if (/\b(fourth of july|independence day|presidents day)\b/i.test(text)) {
      assumptions.push({
        text: 'US-specific holiday',
        assumption: 'Assumes US cultural context'
      });
    }

    return assumptions;
  }

  checkRepresentation(text) {
    const diversityMarkers = [
      /\b(diverse|diversity|inclusion|inclusive|multicultural|global)\b/gi,
      /\b(international|worldwide|universal|cross-cultural)\b/gi
    ];

    const hasDiversityLanguage = diversityMarkers.some(pattern => pattern.test(text));

    return {
      diverse: hasDiversityLanguage,
      details: hasDiversityLanguage ? 'Includes diversity language' : 'Limited diversity markers'
    };
  }

  checkAccessibilityLanguage(text) {
    const issues = [];

    // Check for person-first language
    const personFirst = /\b(person with|people with|individual with)\b/i.test(text);
    const identityFirst = /\b(disabled person|autistic person|handicapped)\b/i.test(text);

    if (identityFirst && !personFirst) {
      issues.push('Consider person-first language');
    }

    // Check for ableist terms
    const ableistTerms = ['crazy', 'insane', 'lame', 'crippled', 'dumb', 'blind to', 'deaf to'];
    ableistTerms.forEach(term => {
      if (new RegExp(`\\b${term}\\b`, 'i').test(text)) {
        issues.push(`Potentially ableist: "${term}"`);
      }
    });

    return {
      inclusive: issues.length === 0,
      issues
    };
  }

  assessFormality(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());

    // Informal markers
    const informalMarkers = ['gonna', 'wanna', 'kinda', 'yeah', 'yep', 'nope', 'ok', 'okay'];
    const informalCount = words.filter(w => informalMarkers.includes(w)).length;

    // Formal markers
    const formalMarkers = ['therefore', 'furthermore', 'consequently', 'moreover', 'nevertheless'];
    const formalCount = words.filter(w => formalMarkers.includes(w)).length;

    // Contractions (informal)
    const contractionCount = (text.match(/\w+'\w+/g) || []).length;

    // Calculate formality score (higher = more formal)
    const formalityScore = (formalCount * 2 - informalCount - contractionCount) / words.length * 100;

    let level = 'appropriate';
    if (formalityScore < -0.5) level = 'too casual';
    else if (formalityScore > 1.5) level = 'too formal';

    return {
      score: Math.round(formalityScore * 100) / 100,
      level,
      informalMarkers: informalCount,
      formalMarkers: formalCount,
      contractions: contractionCount
    };
  }

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

  generateRecommendations(overallScore, scores, targetAudience) {
    const recommendations = [];

    if (scores.readingLevel < 80) {
      recommendations.push('Adjust reading level to match target audience expectations');
    }
    if (scores.technicalDepth < 75) {
      recommendations.push('Balance technical terminology for audience expertise');
    }
    if (scores.culturalSensitivity < 95) {
      recommendations.push('PRIORITY: Review and revise culturally insensitive language');
    }
    if (scores.inclusiveLanguage < 95) {
      recommendations.push('PRIORITY: Replace non-inclusive language with inclusive alternatives');
    }
    if (scores.professionalTone < 85) {
      recommendations.push('Maintain professional tone appropriate for business audience');
    }

    if (recommendations.length === 0) {
      recommendations.push(`Content is well-suited for ${targetAudience} audience`);
    }

    return recommendations;
  }
}

module.exports = AudienceAnalyzer;
