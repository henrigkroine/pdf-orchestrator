/**
 * Emotional Intelligence Analyzer
 *
 * Analyzes emotional aspects of content including sentiment, emotional appeal,
 * empathy, trust-building, and urgency balance.
 *
 * Features:
 * - Sentiment analysis (positive/neutral/negative ratios)
 * - Emotional appeal strength measurement
 * - Empathy indicators detection
 * - Trust-building element identification
 * - Urgency balance assessment (urgent without panic)
 * - AI emotional intelligence with Gemini 2.5 Pro
 */

const natural = require('natural');

class EmotionalIntelligenceAnalyzer {
  constructor(config, aiClient) {
    this.config = config;
    this.aiClient = aiClient;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

    // Emotional lexicons
    this.emotionalLexicon = {
      positive: {
        strong: ['joy', 'love', 'hope', 'inspire', 'empower', 'transform', 'breakthrough', 'triumph'],
        moderate: ['good', 'better', 'improve', 'success', 'achieve', 'grow', 'benefit', 'positive'],
        mild: ['nice', 'pleasant', 'helpful', 'useful', 'glad', 'appreciate']
      },
      negative: {
        strong: ['devastate', 'crisis', 'disaster', 'catastrophe', 'terrible', 'horrible'],
        moderate: ['problem', 'challenge', 'difficulty', 'concern', 'issue', 'struggle'],
        mild: ['minor', 'small', 'slight', 'bit', 'somewhat']
      },
      neutral: ['is', 'are', 'was', 'were', 'have', 'has', 'do', 'does', 'can', 'will']
    };

    // Empathy indicators
    this.empathyIndicators = {
      understanding: ['understand', 'recognize', 'acknowledge', 'appreciate', 'realize'],
      perspective: ['imagine', 'consider', 'think about', 'from your perspective', 'in your shoes'],
      validation: ['valid', 'legitimate', 'understandable', 'reasonable', 'make sense'],
      support: ['support', 'here for', 'with you', 'alongside', 'together']
    };

    // Trust-building elements
    this.trustElements = {
      credibility: ['proven', 'trusted', 'reliable', 'established', 'track record', 'experience'],
      transparency: ['honest', 'transparent', 'open', 'clear', 'upfront', 'candid'],
      evidence: ['data', 'research', 'results', 'evidence', 'proof', 'demonstrated'],
      social_proof: ['partners', 'testimonial', 'clients', 'organizations', 'joined']
    };

    // Urgency markers (positive vs panic)
    this.urgencyMarkers = {
      balanced: ['now', 'today', 'important', 'priority', 'timely', 'current', 'pressing'],
      panic: ['emergency', 'crisis', 'urgent', 'immediate', 'desperate', 'critical danger']
    };

    // TEEI voice attributes from config
    this.teeiVoice = this.config.teeiVoiceAttributes || {};
  }

  /**
   * Analyze emotional intelligence
   */
  async analyzeEmotionalIntelligence(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting emotional intelligence analysis...');

      const sentences = this.sentenceTokenizer.tokenize(text);
      const words = this.tokenizer.tokenize(text.toLowerCase());

      // Run all emotional analyses
      const sentiment = this.analyzeSentiment(text, sentences);
      const emotionalAppeal = this.analyzeEmotionalAppeal(text, words);
      const empathy = this.analyzeEmpathy(text, sentences);
      const trust = this.analyzeTrustBuilding(text, sentences);
      const urgency = this.analyzeUrgencyBalance(text, sentences);

      // Get AI emotional intelligence assessment with Gemini 2.5 Pro
      const aiAssessment = await this.getAIEmotionalAssessment(text, {
        sentiment: sentiment.balance,
        empathy: empathy.score,
        trust: trust.score,
        urgency: urgency.score
      });

      // Calculate overall emotional intelligence score
      const scores = {
        sentimentBalance: sentiment.score,
        emotionalAppeal: emotionalAppeal.score,
        empathyIndicators: empathy.score,
        trustBuilding: trust.score,
        urgencyBalance: urgency.score
      };

      const weights = this.config.qualityDimensions.emotionalIntelligence.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'emotionalIntelligence',
        overallScore,
        scores,
        details: {
          sentiment,
          emotionalAppeal,
          empathy,
          trust,
          urgency
        },
        aiAssessment,
        issues: this.combineIssues([
          sentiment.issues,
          emotionalAppeal.issues,
          empathy.issues,
          trust.issues,
          urgency.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores),
        metadata: {
          duration,
          sentenceCount: sentences.length,
          wordCount: words.length
        }
      };

    } catch (error) {
      console.error('Emotional intelligence analysis error:', error);
      throw new Error(`Emotional intelligence analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze sentiment balance
   */
  analyzeSentiment(text, sentences) {
    const issues = [];
    const words = this.tokenizer.tokenize(text.toLowerCase());

    // Calculate sentiment using AFINN
    const overallSentiment = this.sentimentAnalyzer.getSentiment(words);

    // Calculate sentiment for each sentence
    const sentenceSentiments = sentences.map(sentence => {
      const sentWords = this.tokenizer.tokenize(sentence.toLowerCase());
      return this.sentimentAnalyzer.getSentiment(sentWords);
    });

    // Categorize sentences
    const positive = sentenceSentiments.filter(s => s > 0).length;
    const neutral = sentenceSentiments.filter(s => s === 0).length;
    const negative = sentenceSentiments.filter(s => s < 0).length;

    const total = sentences.length;
    const positivePercent = (positive / total) * 100;
    const neutralPercent = (neutral / total) * 100;
    const negativePercent = (negative / total) * 100;

    // Ideal: 50-70% positive, 20-40% neutral, 10-30% negative
    let score = 100;

    if (positivePercent < 40) {
      issues.push({
        type: 'sentiment',
        severity: 'major',
        issue: `Low positive sentiment (${positivePercent.toFixed(0)}%)`,
        suggestion: 'Increase hopeful, empowering language',
        positivePercent: Math.round(positivePercent)
      });
      score -= 25;

    } else if (positivePercent > 85) {
      issues.push({
        type: 'sentiment',
        severity: 'minor',
        issue: `Very high positive sentiment (${positivePercent.toFixed(0)}%)`,
        suggestion: 'Balance with realistic acknowledgment of challenges',
        positivePercent: Math.round(positivePercent)
      });
      score -= 10;
    }

    if (negativePercent > 40) {
      issues.push({
        type: 'sentiment',
        severity: 'major',
        issue: `High negative sentiment (${negativePercent.toFixed(0)}%)`,
        suggestion: 'Balance problems with solutions and hope',
        negativePercent: Math.round(negativePercent)
      });
      score -= 20;
    }

    if (neutralPercent > 60) {
      issues.push({
        type: 'sentiment',
        severity: 'minor',
        issue: `Very neutral tone (${neutralPercent.toFixed(0)}%)`,
        suggestion: 'Add more emotional resonance',
        neutralPercent: Math.round(neutralPercent)
      });
      score -= 15;
    }

    // Determine balance quality
    const balance = this.determineSentimentBalance(positivePercent, neutralPercent, negativePercent);

    return {
      score: Math.max(0, Math.round(score)),
      overallSentiment: Math.round(overallSentiment * 100) / 100,
      positivePercent: Math.round(positivePercent * 10) / 10,
      neutralPercent: Math.round(neutralPercent * 10) / 10,
      negativePercent: Math.round(negativePercent * 10) / 10,
      balance,
      distribution: {
        positive,
        neutral,
        negative,
        total
      },
      issues,
      summary: {
        dominant: positivePercent > 50 ? 'positive' : negativePercent > 40 ? 'negative' : 'neutral',
        balanced: balance === 'balanced'
      }
    };
  }

  /**
   * Analyze emotional appeal strength
   */
  analyzeEmotionalAppeal(text, words) {
    const issues = [];
    let score = 100;

    // Count emotional words by category
    const emotionalCounts = {
      strongPositive: 0,
      moderatePositive: 0,
      mildPositive: 0,
      strongNegative: 0,
      moderateNegative: 0,
      mildNegative: 0
    };

    Object.entries(this.emotionalLexicon.positive).forEach(([intensity, wordList]) => {
      const count = words.filter(w => wordList.includes(w)).length;
      emotionalCounts[`${intensity}Positive`] = count;
    });

    Object.entries(this.emotionalLexicon.negative).forEach(([intensity, wordList]) => {
      const count = words.filter(w => wordList.includes(w)).length;
      emotionalCounts[`${intensity}Negative`] = count;
    });

    const totalEmotional = Object.values(emotionalCounts).reduce((a, b) => a + b, 0);
    const emotionalDensity = (totalEmotional / words.length) * 100;

    // Check for emotional appeal strength
    if (emotionalDensity < 1) {
      issues.push({
        type: 'emotionalAppeal',
        severity: 'major',
        issue: 'Low emotional appeal',
        suggestion: 'Add emotionally resonant language to connect with readers',
        density: Math.round(emotionalDensity * 10) / 10
      });
      score -= 30;

    } else if (emotionalDensity > 8) {
      issues.push({
        type: 'emotionalAppeal',
        severity: 'minor',
        issue: 'Very high emotional language density',
        suggestion: 'Balance emotion with facts and logic',
        density: Math.round(emotionalDensity * 10) / 10
      });
      score -= 15;
    }

    // Check for strong negative emotions (panic/fear)
    if (emotionalCounts.strongNegative > 5) {
      issues.push({
        type: 'emotionalAppeal',
        severity: 'major',
        issue: 'Too many strong negative emotion words',
        suggestion: 'Reduce fear-based language, focus on solutions',
        count: emotionalCounts.strongNegative
      });
      score -= 20;
    }

    // Check for emotional variety
    const emotionalCategories = Object.entries(emotionalCounts).filter(([k, v]) => v > 0).length;

    if (emotionalCategories < 3) {
      issues.push({
        type: 'emotionalAppeal',
        severity: 'minor',
        issue: 'Limited emotional range',
        suggestion: 'Use varied emotional tones for depth',
        variety: emotionalCategories
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      emotionalDensity: Math.round(emotionalDensity * 10) / 10,
      emotionalCounts,
      totalEmotional,
      emotionalVariety: emotionalCategories,
      issues,
      summary: {
        strength: emotionalDensity > 4 ? 'strong' : emotionalDensity > 2 ? 'moderate' : 'weak',
        variety: emotionalCategories
      }
    };
  }

  /**
   * Analyze empathy indicators
   */
  analyzeEmpathy(text, sentences) {
    const issues = [];
    let score = 100;

    // Count empathy indicators
    const empathyCounts = {};
    let totalEmpathy = 0;

    Object.entries(this.empathyIndicators).forEach(([category, indicators]) => {
      const count = indicators.filter(indicator =>
        new RegExp(`\\b${indicator}\\b`, 'i').test(text)
      ).length;
      empathyCounts[category] = count;
      totalEmpathy += count;
    });

    if (totalEmpathy === 0) {
      issues.push({
        type: 'empathy',
        severity: 'major',
        issue: 'No empathy indicators detected',
        suggestion: 'Show understanding and acknowledgment of audience perspective',
        location: 'Throughout'
      });
      score -= 40;

    } else if (totalEmpathy < 3) {
      issues.push({
        type: 'empathy',
        severity: 'minor',
        issue: 'Limited empathy indicators',
        suggestion: 'Increase empathetic language to build connection',
        count: totalEmpathy
      });
      score -= 20;
    }

    // Check for perspective-taking
    const hasPerspectiveTaking = empathyCounts.perspective > 0;

    if (!hasPerspectiveTaking) {
      issues.push({
        type: 'empathy',
        severity: 'minor',
        issue: 'No perspective-taking language',
        suggestion: 'Use phrases like "imagine" or "consider" to invite perspective',
        location: 'Missing'
      });
      score -= 15;
    }

    // Check for you/your language (audience-focused)
    const youCount = (text.match(/\b(you|your)\b/gi) || []).length;
    const weCount = (text.match(/\b(we|our|us)\b/gi) || []).length;
    const youFocus = youCount > weCount * 0.5;

    if (!youFocus) {
      issues.push({
        type: 'empathy',
        severity: 'minor',
        issue: 'Too self-focused (more "we" than "you")',
        suggestion: 'Increase audience-focused language',
        ratio: `${weCount} we vs ${youCount} you`
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      empathyCounts,
      totalEmpathyIndicators: totalEmpathy,
      hasPerspectiveTaking,
      youFocus,
      languageRatio: { you: youCount, we: weCount },
      issues,
      summary: {
        empathyLevel: totalEmpathy > 5 ? 'high' : totalEmpathy > 2 ? 'moderate' : 'low',
        audienceFocused: youFocus
      }
    };
  }

  /**
   * Analyze trust-building elements
   */
  analyzeTrustBuilding(text, sentences) {
    const issues = [];
    let score = 100;

    // Count trust-building elements
    const trustCounts = {};
    let totalTrust = 0;

    Object.entries(this.trustElements).forEach(([category, elements]) => {
      const count = elements.filter(element =>
        new RegExp(`\\b${element}\\b`, 'i').test(text)
      ).length;
      trustCounts[category] = count;
      totalTrust += count;
    });

    if (totalTrust === 0) {
      issues.push({
        type: 'trust',
        severity: 'critical',
        issue: 'No trust-building elements detected',
        suggestion: 'Add credibility indicators, evidence, or social proof',
        location: 'Throughout'
      });
      score -= 50;

    } else if (totalTrust < 3) {
      issues.push({
        type: 'trust',
        severity: 'major',
        issue: 'Limited trust-building elements',
        suggestion: 'Strengthen credibility with evidence, testimonials, or track record',
        count: totalTrust
      });
      score -= 25;
    }

    // Check for balanced trust-building (not all from one category)
    const categoriesUsed = Object.values(trustCounts).filter(c => c > 0).length;

    if (categoriesUsed < 2) {
      issues.push({
        type: 'trust',
        severity: 'minor',
        issue: 'Limited trust-building variety',
        suggestion: 'Use multiple trust elements: credibility, transparency, evidence, social proof',
        variety: categoriesUsed
      });
      score -= 15;
    }

    // Check for evidence/data
    const hasEvidence = trustCounts.evidence > 0;

    if (!hasEvidence) {
      issues.push({
        type: 'trust',
        severity: 'major',
        issue: 'No evidence or data provided',
        suggestion: 'Add statistics, research, or concrete results to build credibility',
        location: 'Missing'
      });
      score -= 20;
    }

    return {
      score: Math.max(0, Math.round(score)),
      trustCounts,
      totalTrustElements: totalTrust,
      categoriesUsed,
      hasEvidence,
      issues,
      summary: {
        trustLevel: totalTrust > 8 ? 'high' : totalTrust > 4 ? 'moderate' : 'low',
        variety: categoriesUsed
      }
    };
  }

  /**
   * Analyze urgency balance (urgent without panic)
   */
  analyzeUrgencyBalance(text, sentences) {
    const issues = [];
    let score = 100;

    // Count urgency markers
    const balancedUrgency = this.urgencyMarkers.balanced.filter(marker =>
      new RegExp(`\\b${marker}\\b`, 'i').test(text)
    ).length;

    const panicUrgency = this.urgencyMarkers.panic.filter(marker =>
      new RegExp(`\\b${marker}\\b`, 'i').test(text)
    ).length;

    if (panicUrgency > 0) {
      issues.push({
        type: 'urgency',
        severity: 'major',
        issue: `${panicUrgency} panic-inducing urgency word(s)`,
        suggestion: 'Replace panic language with balanced urgency',
        examples: this.urgencyMarkers.panic.filter(marker =>
          new RegExp(`\\b${marker}\\b`, 'i').test(text)
        ).slice(0, 3)
      });
      score -= panicUrgency * 15;
    }

    if (balancedUrgency === 0 && panicUrgency === 0) {
      issues.push({
        type: 'urgency',
        severity: 'minor',
        issue: 'No urgency conveyed',
        suggestion: 'Add appropriate urgency to motivate action',
        location: 'Missing'
      });
      score -= 20;

    } else if (balancedUrgency < 2) {
      issues.push({
        type: 'urgency',
        severity: 'minor',
        issue: 'Limited urgency language',
        suggestion: 'Strengthen urgency while avoiding panic',
        count: balancedUrgency
      });
      score -= 10;
    }

    // Check if urgency is paired with hope/solution
    const hasHope = /\b(opportunity|potential|solution|transform|empower|enable)\b/i.test(text);

    if (balancedUrgency > 0 && !hasHope) {
      issues.push({
        type: 'urgency',
        severity: 'minor',
        issue: 'Urgency without hope or solutions',
        suggestion: 'Pair urgent language with hopeful outcomes',
        location: 'Throughout'
      });
      score -= 15;
    }

    return {
      score: Math.max(0, Math.round(score)),
      balancedUrgency,
      panicUrgency,
      hasHope,
      ratio: panicUrgency > 0 ? balancedUrgency / panicUrgency : balancedUrgency,
      issues,
      summary: {
        urgencyLevel: balancedUrgency > 5 ? 'high' : balancedUrgency > 2 ? 'moderate' : 'low',
        balanced: panicUrgency === 0 && balancedUrgency > 0
      }
    };
  }

  /**
   * Get AI emotional intelligence assessment using Gemini 2.5 Pro
   */
  async getAIEmotionalAssessment(text, context) {
    try {
      const words = this.tokenizer.tokenize(text);
      const truncatedText = words.length > 2000
        ? words.slice(0, 2000).join(' ') + '...'
        : text;

      const prompt = `Analyze this content for emotional intelligence and resonance.

Context:
- Sentiment Balance: ${context.sentiment}
- Empathy Score: ${context.empathy}/100
- Trust Score: ${context.trust}/100
- Urgency Score: ${context.urgency}/100

Content:
"""
${truncatedText}
"""

Provide expert emotional intelligence analysis:

1. Emotional Resonance
   - What emotions does this evoke?
   - Does it connect emotionally with readers?
   - Is the emotional tone appropriate?

2. Empathy Assessment
   - Does it show understanding of audience needs/concerns?
   - Is the language audience-focused or self-focused?
   - Does it validate and support the reader?

3. Trust and Credibility
   - Does it build trust and confidence?
   - Are claims backed by evidence?
   - Does it demonstrate authenticity?

4. Urgency Balance
   - Does it convey appropriate urgency?
   - Is it motivating without being panic-inducing?
   - Does urgency pair with hope and solutions?

5. Overall Emotional Intelligence
   - How emotionally intelligent is this content?
   - What's the emotional journey for the reader?
   - How could emotional impact be strengthened?

Format as JSON:
{
  "emotionalResonance": "...",
  "primaryEmotions": ["...", "...", "..."],
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "empathyAssessment": "...",
  "trustAssessment": "...",
  "urgencyAssessment": "...",
  "emotionalJourney": "...",
  "recommendations": [
    {"aspect": "...", "current": "...", "improved": "...", "why": "..."}
  ]
}`;

      const response = await this.aiClient.generateText({
        model: this.config.aiModels.emotional.primary,
        prompt,
        temperature: this.config.aiModels.emotional.temperature,
        maxTokens: this.config.aiModels.emotional.maxTokens,
        systemPrompt: this.config.aiModels.emotional.systemPrompt
      });

      return JSON.parse(response);

    } catch (error) {
      console.error('AI emotional assessment error:', error);
      return {
        emotionalResonance: 'AI analysis unavailable',
        primaryEmotions: [],
        strengths: [],
        weaknesses: [],
        empathyAssessment: '',
        trustAssessment: '',
        urgencyAssessment: '',
        emotionalJourney: '',
        recommendations: [],
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  determineSentimentBalance(positive, neutral, negative) {
    // Ideal: 50-70% positive, 20-40% neutral, 10-30% negative
    const ideal = positive >= 50 && positive <= 70 &&
                  neutral >= 20 && neutral <= 40 &&
                  negative >= 10 && negative <= 30;

    if (ideal) return 'balanced';
    if (positive > 80) return 'overly positive';
    if (negative > 40) return 'too negative';
    if (neutral > 60) return 'too neutral';
    return 'unbalanced';
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

    if (scores.sentimentBalance < 80) {
      recommendations.push('Balance sentiment: acknowledge challenges while maintaining hope');
    }
    if (scores.emotionalAppeal < 75) {
      recommendations.push('Increase emotional resonance with power words and stories');
    }
    if (scores.empathyIndicators < 75) {
      recommendations.push('Show more empathy and understanding of audience perspective');
    }
    if (scores.trustBuilding < 85) {
      recommendations.push('PRIORITY: Add trust-building elements (evidence, credibility, transparency)');
    }
    if (scores.urgencyBalance < 75) {
      recommendations.push('Create appropriate urgency paired with hope and solutions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Emotionally intelligent content - maintains excellence');
    }

    return recommendations;
  }
}

module.exports = EmotionalIntelligenceAnalyzer;
