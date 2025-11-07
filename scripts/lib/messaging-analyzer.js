/**
 * Messaging Analyzer
 *
 * Analyzes messaging effectiveness including value proposition clarity,
 * call-to-action strength, emotional impact, and persuasion techniques.
 *
 * Features:
 * - Value proposition extraction and assessment
 * - CTA identification and strength scoring
 * - Persuasion technique detection (ethos, pathos, logos)
 * - Emotional impact measurement
 * - Target audience alignment
 * - AI messaging optimization with Claude Opus 4.1
 */

const natural = require('natural');

class MessagingAnalyzer {
  constructor(config, aiClient) {
    this.config = config;
    this.aiClient = aiClient;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

    // CTA keywords and patterns
    this.ctaKeywords = {
      strong: ['now', 'today', 'start', 'join', 'discover', 'get', 'unlock', 'transform'],
      medium: ['learn', 'explore', 'see', 'find', 'contact', 'reach', 'connect'],
      weak: ['click', 'visit', 'read', 'view']
    };

    this.ctaPatterns = [
      /\b(contact us|get started|join us|learn more|schedule|book|register|sign up|download)\b/gi,
      /\b(call|email|visit|reach out|connect with)\s+(us|today|now)\b/gi,
      /\b(ready to|want to|interested in)\b/gi
    ];

    // Value proposition indicators
    this.valueIndicators = {
      benefits: ['benefit', 'advantage', 'value', 'gain', 'improve', 'enhance', 'boost', 'increase'],
      outcomes: ['result', 'outcome', 'impact', 'effect', 'achievement', 'success'],
      solutions: ['solution', 'solve', 'address', 'tackle', 'overcome', 'eliminate'],
      differentiation: ['unique', 'only', 'exclusive', 'innovative', 'revolutionary', 'first', 'leading']
    };

    // Persuasion technique indicators
    this.persuasionIndicators = {
      ethos: {
        keywords: ['expert', 'trusted', 'certified', 'proven', 'established', 'award', 'recognized'],
        patterns: [/\d+\s+years?\s+(of\s+)?experience/gi, /trusted\s+by\s+\d+/gi]
      },
      pathos: {
        keywords: ['imagine', 'feel', 'dream', 'hope', 'fear', 'love', 'inspire', 'passionate'],
        emotions: ['joy', 'excitement', 'pride', 'confidence', 'peace', 'relief']
      },
      logos: {
        keywords: ['data', 'research', 'study', 'statistics', 'evidence', 'proof', 'fact'],
        patterns: [/\d+%/, /\d+\s+(students?|teachers?|schools?)/gi, /according\s+to/gi]
      }
    };

    // Emotional power words
    this.emotionalPowerWords = {
      positive: ['transform', 'empower', 'breakthrough', 'remarkable', 'extraordinary', 'amazing'],
      urgent: ['immediately', 'now', 'urgent', 'critical', 'essential', 'vital'],
      trust: ['guaranteed', 'proven', 'verified', 'certified', 'trusted', 'reliable'],
      aspiration: ['achieve', 'success', 'excel', 'master', 'champion', 'winner']
    };
  }

  /**
   * Analyze messaging effectiveness
   */
  async analyzeMessaging(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting messaging effectiveness analysis...');

      const sentences = this.sentenceTokenizer.tokenize(text);
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

      // Run all messaging analyses
      const valueProposition = await this.analyzeValueProposition(text, paragraphs);
      const callToAction = this.analyzeCallToAction(text, sentences);
      const emotionalImpact = this.analyzeEmotionalImpact(text, sentences);
      const persuasion = this.analyzePersuasionTechniques(text, sentences);
      const targetAlignment = await this.analyzeTargetAlignment(text, options.targetAudience);

      // Get AI messaging critique with Claude Opus 4.1
      const aiCritique = await this.getAIMessagingCritique(text, {
        valueProposition: valueProposition.score,
        ctaStrength: callToAction.score,
        emotionalImpact: emotionalImpact.score,
        targetAudience: options.targetAudience
      });

      // Calculate overall messaging score
      const scores = {
        valueProposition: valueProposition.score,
        callToAction: callToAction.score,
        emotionalImpact: emotionalImpact.score,
        persuasionTechniques: persuasion.score,
        targetAlignment: targetAlignment.score
      };

      const weights = this.config.qualityDimensions.messagingEffectiveness.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'messagingEffectiveness',
        overallScore,
        scores,
        details: {
          valueProposition,
          callToAction,
          emotionalImpact,
          persuasion,
          targetAlignment
        },
        aiCritique,
        issues: this.combineIssues([
          valueProposition.issues,
          callToAction.issues,
          emotionalImpact.issues,
          persuasion.issues,
          targetAlignment.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores),
        metadata: {
          duration,
          sentenceCount: sentences.length,
          paragraphCount: paragraphs.length
        }
      };

    } catch (error) {
      console.error('Messaging analysis error:', error);
      throw new Error(`Messaging analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze value proposition clarity and strength
   */
  async analyzeValueProposition(text, paragraphs) {
    const issues = [];
    let score = 100;

    // Extract opening paragraph (most likely place for value prop)
    const openingParagraph = paragraphs[0] || '';
    const openingSentences = this.sentenceTokenizer.tokenize(openingParagraph);

    // Check for value indicators in opening
    const hasValueInOpening = this.hasValueIndicators(openingParagraph);

    if (!hasValueInOpening) {
      issues.push({
        type: 'valueProposition',
        severity: 'critical',
        issue: 'No clear value proposition in opening paragraph',
        suggestion: 'State the core value/benefit in the first paragraph',
        location: 'Opening paragraph'
      });
      score -= 30;
    }

    // Extract potential value propositions
    const valuePropositions = this.extractValuePropositions(text);

    if (valuePropositions.length === 0) {
      issues.push({
        type: 'valueProposition',
        severity: 'critical',
        issue: 'No value propositions detected',
        suggestion: 'Clearly articulate what value you provide and why it matters',
        location: 'Throughout document'
      });
      score -= 40;
    } else if (valuePropositions.length === 1) {
      issues.push({
        type: 'valueProposition',
        severity: 'minor',
        issue: 'Only one value proposition found',
        suggestion: 'Reinforce value proposition throughout document',
        count: 1
      });
      score -= 10;
    }

    // Check for specific benefits vs generic claims
    const specificBenefits = this.extractSpecificBenefits(text);
    const genericClaims = this.extractGenericClaims(text);

    if (genericClaims.length > specificBenefits.length) {
      issues.push({
        type: 'valueProposition',
        severity: 'major',
        issue: 'More generic claims than specific benefits',
        suggestion: 'Replace generic claims with specific, measurable benefits',
        genericCount: genericClaims.length,
        specificCount: specificBenefits.length
      });
      score -= 20;
    }

    // Check for differentiation
    const hasDifferentiation = this.checkDifferentiation(text);

    if (!hasDifferentiation) {
      issues.push({
        type: 'valueProposition',
        severity: 'major',
        issue: 'No clear differentiation from alternatives',
        suggestion: 'Explain what makes your offering unique or better',
        location: 'Throughout document'
      });
      score -= 15;
    }

    // Assess clarity - is it immediately understandable?
    const clarity = this.assessValuePropositionClarity(valuePropositions);

    if (clarity < 0.6) {
      issues.push({
        type: 'valueProposition',
        severity: 'major',
        issue: 'Value proposition is not immediately clear',
        suggestion: 'Simplify and clarify the core value statement',
        clarityScore: Math.round(clarity * 100)
      });
      score -= 15;
    }

    return {
      score: Math.max(0, Math.round(score)),
      valuePropositions,
      specificBenefits,
      genericClaims,
      hasValueInOpening,
      hasDifferentiation,
      clarity: Math.round(clarity * 100),
      issues,
      summary: {
        valuePropositionsFound: valuePropositions.length,
        specificBenefitsCount: specificBenefits.length,
        genericClaimsCount: genericClaims.length,
        clarityScore: Math.round(clarity * 100)
      }
    };
  }

  /**
   * Analyze call-to-action effectiveness
   */
  analyzeCallToAction(text, sentences) {
    const issues = [];
    let score = 100;

    // Find all CTAs
    const ctas = this.extractCTAs(text);

    if (ctas.length === 0) {
      issues.push({
        type: 'callToAction',
        severity: 'critical',
        issue: 'No call-to-action found',
        suggestion: 'Add clear CTA telling reader what to do next',
        location: 'Missing'
      });
      return {
        score: 0,
        ctas: [],
        strength: 'none',
        issues,
        summary: { totalCTAs: 0, strongCTAs: 0, clearNextSteps: false }
      };
    }

    // Assess CTA strength
    const ctaStrengths = ctas.map(cta => this.assessCTAStrength(cta));
    const avgStrength = ctaStrengths.reduce((a, b) => a + b, 0) / ctaStrengths.length;

    const strongCTAs = ctas.filter((_, idx) => ctaStrengths[idx] >= 0.7).length;
    const weakCTAs = ctas.filter((_, idx) => ctaStrengths[idx] < 0.4).length;

    if (strongCTAs === 0) {
      issues.push({
        type: 'callToAction',
        severity: 'major',
        issue: 'No strong CTAs detected',
        suggestion: 'Use action verbs and create urgency',
        weakCTAs: ctas.length
      });
      score -= 30;
    }

    if (weakCTAs > 0) {
      issues.push({
        type: 'callToAction',
        severity: 'minor',
        issue: `${weakCTAs} weak CTA(s) found`,
        suggestion: 'Strengthen weak CTAs with clear action and value',
        examples: ctas.filter((_, idx) => ctaStrengths[idx] < 0.4).slice(0, 2)
      });
      score -= weakCTAs * 10;
    }

    // Check CTA placement
    const lastParagraph = sentences[sentences.length - 1] || '';
    const hasCTAInEnding = ctas.some(cta => lastParagraph.includes(cta.text));

    if (!hasCTAInEnding) {
      issues.push({
        type: 'callToAction',
        severity: 'major',
        issue: 'No CTA in closing section',
        suggestion: 'Place strong CTA at end of document',
        location: 'Missing in closing'
      });
      score -= 15;
    }

    // Check for specific next steps
    const hasSpecificNextSteps = this.checkSpecificNextSteps(ctas);

    if (!hasSpecificNextSteps) {
      issues.push({
        type: 'callToAction',
        severity: 'major',
        issue: 'CTAs lack specific next steps',
        suggestion: 'Provide concrete actions: email, phone, link, meeting',
        location: 'All CTAs'
      });
      score -= 20;
    }

    // Check for urgency
    const hasUrgency = ctas.some(cta => this.hasUrgency(cta.text));

    if (!hasUrgency) {
      issues.push({
        type: 'callToAction',
        severity: 'minor',
        issue: 'CTAs lack urgency',
        suggestion: 'Add time-sensitive language (e.g., "today", "now")',
        location: 'All CTAs'
      });
      score -= 10;
    }

    const strengthLabel = avgStrength >= 0.7 ? 'strong' : avgStrength >= 0.4 ? 'moderate' : 'weak';

    return {
      score: Math.max(0, Math.round(score)),
      ctas,
      strength: strengthLabel,
      avgStrength: Math.round(avgStrength * 100),
      hasCTAInEnding,
      hasSpecificNextSteps,
      hasUrgency,
      issues,
      summary: {
        totalCTAs: ctas.length,
        strongCTAs,
        weakCTAs,
        clearNextSteps: hasSpecificNextSteps
      }
    };
  }

  /**
   * Analyze emotional impact
   */
  analyzeEmotionalImpact(text, sentences) {
    const issues = [];
    let score = 100;

    // Sentiment analysis
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const sentiment = this.sentimentAnalyzer.getSentiment(words);

    // Normalize sentiment to 0-100 scale
    // AFINN sentiment ranges from -5 to +5 per word, but average is typically -1 to +1
    const normalizedSentiment = Math.max(0, Math.min(100, (sentiment + 1) * 50));

    // Check for emotional power words
    const powerWords = this.countEmotionalPowerWords(text);
    const powerWordDensity = (powerWords.total / words.length) * 100;

    if (powerWordDensity < 1) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'major',
        issue: 'Low emotional power word usage',
        suggestion: 'Add impactful words that resonate emotionally',
        density: Math.round(powerWordDensity * 10) / 10
      });
      score -= 20;
    }

    // Check emotional variety
    const emotionalVariety = this.assessEmotionalVariety(powerWords);

    if (emotionalVariety < 2) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'minor',
        issue: 'Limited emotional variety',
        suggestion: 'Use diverse emotional appeals (inspiration, urgency, trust)',
        variety: emotionalVariety
      });
      score -= 10;
    }

    // Check for storytelling elements
    const hasStory = this.hasStorytellingElements(text);

    if (!hasStory) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'major',
        issue: 'No storytelling or human elements',
        suggestion: 'Add stories, examples, or human impact to create connection',
        location: 'Throughout document'
      });
      score -= 15;
    }

    // Assess emotional arc
    const emotionalArc = this.assessEmotionalArc(sentences);

    if (emotionalArc.variance < 0.1) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'minor',
        issue: 'Flat emotional arc',
        suggestion: 'Create emotional journey from problem to solution',
        variance: Math.round(emotionalArc.variance * 100)
      });
      score -= 10;
    }

    // Check for balance (not too negative or too positive)
    if (normalizedSentiment < 40) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'major',
        issue: 'Overall tone is too negative',
        suggestion: 'Balance challenges with hope and solutions',
        sentiment: Math.round(normalizedSentiment)
      });
      score -= 15;
    } else if (normalizedSentiment > 85) {
      issues.push({
        type: 'emotionalImpact',
        severity: 'minor',
        issue: 'Tone may be overly positive',
        suggestion: 'Acknowledge real challenges for credibility',
        sentiment: Math.round(normalizedSentiment)
      });
      score -= 5;
    }

    return {
      score: Math.max(0, Math.round(score)),
      sentiment: Math.round(normalizedSentiment),
      powerWords,
      powerWordDensity: Math.round(powerWordDensity * 100) / 100,
      emotionalVariety,
      hasStorytellingElements: hasStory,
      emotionalArc,
      issues,
      summary: {
        overallSentiment: normalizedSentiment >= 60 ? 'positive' : normalizedSentiment >= 40 ? 'neutral' : 'negative',
        powerWordCount: powerWords.total,
        emotionalRange: emotionalVariety
      }
    };
  }

  /**
   * Analyze persuasion techniques (ethos, pathos, logos)
   */
  analyzePersuasionTechniques(text, sentences) {
    const issues = [];
    let score = 100;

    // Detect ethos (credibility/authority)
    const ethos = this.detectEthos(text);

    // Detect pathos (emotional appeal)
    const pathos = this.detectPathos(text);

    // Detect logos (logic/evidence)
    const logos = this.detectLogos(text);

    // Check for balanced use of all three
    const techniques = [
      { name: 'ethos', score: ethos.score },
      { name: 'pathos', score: pathos.score },
      { name: 'logos', score: logos.score }
    ];

    const weakTechniques = techniques.filter(t => t.score < 40);

    if (weakTechniques.length > 1) {
      issues.push({
        type: 'persuasion',
        severity: 'major',
        issue: `Weak in ${weakTechniques.map(t => t.name).join(' and ')}`,
        suggestion: 'Use all three persuasion modes: credibility, emotion, and evidence',
        weak: weakTechniques.map(t => t.name)
      });
      score -= 25;
    } else if (weakTechniques.length === 1) {
      issues.push({
        type: 'persuasion',
        severity: 'minor',
        issue: `Could strengthen ${weakTechniques[0].name}`,
        suggestion: this.getSuggestionForTechnique(weakTechniques[0].name),
        weak: weakTechniques[0].name
      });
      score -= 15;
    }

    // Check for over-reliance on one technique
    const maxScore = Math.max(...techniques.map(t => t.score));
    const minScore = Math.min(...techniques.map(t => t.score));
    const imbalance = maxScore - minScore;

    if (imbalance > 50) {
      issues.push({
        type: 'persuasion',
        severity: 'minor',
        issue: 'Imbalanced persuasion approach',
        suggestion: 'Balance credibility, emotion, and evidence more evenly',
        imbalance
      });
      score -= 10;
    }

    // Overall score is average of three techniques
    const avgTechniqueScore = (ethos.score + pathos.score + logos.score) / 3;

    return {
      score: Math.round(avgTechniqueScore),
      ethos,
      pathos,
      logos,
      balance: Math.round((1 - (imbalance / 100)) * 100),
      issues,
      summary: {
        ethosStrength: ethos.score >= 60 ? 'strong' : ethos.score >= 40 ? 'moderate' : 'weak',
        pathosStrength: pathos.score >= 60 ? 'strong' : pathos.score >= 40 ? 'moderate' : 'weak',
        logosStrength: logos.score >= 60 ? 'strong' : logos.score >= 40 ? 'moderate' : 'weak',
        mostUsed: techniques.sort((a, b) => b.score - a.score)[0].name
      }
    };
  }

  /**
   * Analyze target audience alignment
   */
  async analyzeTargetAlignment(text, targetAudience = 'corporatePartners') {
    const issues = [];
    let score = 100;

    const audienceConfig = this.config.targetAudiences[targetAudience] || this.config.targetAudiences.corporatePartners;

    // Check focus areas for this audience
    const focusAreas = audienceConfig.focus || [];
    const focusCoverage = this.checkFocusCoverage(text, focusAreas);

    const missingFocus = focusAreas.filter(area => !focusCoverage[area]);

    if (missingFocus.length > 0) {
      issues.push({
        type: 'targetAlignment',
        severity: 'major',
        issue: `Missing focus on: ${missingFocus.join(', ')}`,
        suggestion: `Address ${missingFocus.join(', ')} for ${targetAudience} audience`,
        missing: missingFocus
      });
      score -= missingFocus.length * 15;
    }

    // Check tone appropriateness
    const expectedTone = audienceConfig.tone || 'professional';
    const actualTone = this.detectTone(text);

    if (actualTone !== expectedTone) {
      issues.push({
        type: 'targetAlignment',
        severity: 'minor',
        issue: `Tone is ${actualTone}, expected ${expectedTone}`,
        suggestion: `Adjust tone to be more ${expectedTone} for ${targetAudience}`,
        expected: expectedTone,
        actual: actualTone
      });
      score -= 10;
    }

    // Check language complexity matches audience
    const fleschScore = this.calculateSimpleFleschScore(text);
    const expectedRange = audienceConfig.readingLevel || { min: 12, max: 16 };

    // Convert Flesch score to grade level (approximate)
    const gradeLevel = this.fleschToGradeLevel(fleschScore);

    if (gradeLevel < expectedRange.min || gradeLevel > expectedRange.max) {
      issues.push({
        type: 'targetAlignment',
        severity: 'minor',
        issue: `Reading level (grade ${gradeLevel}) outside target range (${expectedRange.min}-${expectedRange.max})`,
        suggestion: gradeLevel < expectedRange.min ? 'Increase sophistication' : 'Simplify language',
        actual: gradeLevel,
        expected: `${expectedRange.min}-${expectedRange.max}`
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      targetAudience,
      focusCoverage,
      tone: actualTone,
      expectedTone,
      readingLevel: gradeLevel,
      expectedReadingLevel: `${expectedRange.min}-${expectedRange.max}`,
      issues,
      summary: {
        focusAreasAddressed: focusAreas.length - missingFocus.length,
        totalFocusAreas: focusAreas.length,
        toneMatch: actualTone === expectedTone,
        readingLevelMatch: gradeLevel >= expectedRange.min && gradeLevel <= expectedRange.max
      }
    };
  }

  /**
   * Get AI messaging critique using Claude Opus 4.1
   */
  async getAIMessagingCritique(text, context) {
    try {
      const words = this.tokenizer.tokenize(text);
      const truncatedText = words.length > 2500
        ? words.slice(0, 2500).join(' ') + '...'
        : text;

      const prompt = `Analyze this marketing/partnership content for messaging effectiveness.

Context:
- Target Audience: ${context.targetAudience || 'Corporate partners'}
- Value Proposition Score: ${context.valueProposition}/100
- CTA Strength: ${context.ctaStrength}/100
- Emotional Impact: ${context.emotionalImpact}/100

Content:
"""
${truncatedText}
"""

Provide deep analysis:
1. Value Proposition Assessment
   - Is it clear, compelling, and differentiated?
   - Does it lead with benefits or features?

2. Messaging Strategy Critique
   - Does it address audience pain points?
   - Is the value immediately apparent?
   - Are claims backed by evidence?

3. Call-to-Action Evaluation
   - Is the CTA clear, urgent, and compelling?
   - What specific improvements would strengthen it?

4. Emotional Resonance
   - What emotions does this evoke?
   - Does it build trust and credibility?
   - Is there a human/authentic element?

5. Persuasion Assessment
   - Which persuasion techniques are used?
   - What's missing to make it more compelling?

Format as JSON:
{
  "valuePropositionAssessment": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "ctaRecommendations": "...",
  "emotionalResonance": "...",
  "persuasionGaps": "...",
  "rewriteSuggestions": [
    {"section": "...", "current": "...", "improved": "...", "rationale": "..."}
  ]
}`;

      const response = await this.aiClient.generateText({
        model: this.config.aiModels.messaging.primary,
        prompt,
        temperature: this.config.aiModels.messaging.temperature,
        maxTokens: this.config.aiModels.messaging.maxTokens,
        systemPrompt: this.config.aiModels.messaging.systemPrompt
      });

      return JSON.parse(response);

    } catch (error) {
      console.error('AI messaging critique error:', error);
      return {
        valuePropositionAssessment: 'AI analysis unavailable',
        strengths: [],
        weaknesses: [],
        ctaRecommendations: '',
        emotionalResonance: '',
        persuasionGaps: '',
        rewriteSuggestions: [],
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  hasValueIndicators(text) {
    const indicators = Object.values(this.valueIndicators).flat();
    return indicators.some(indicator => new RegExp(`\\b${indicator}\\b`, 'i').test(text));
  }

  extractValuePropositions(text) {
    const sentences = this.sentenceTokenizer.tokenize(text);
    const valueProps = [];

    sentences.forEach((sentence, idx) => {
      const hasValue = this.hasValueIndicators(sentence);
      const hasBenefit = /\b(help|enable|allow|provide|deliver|offer|give)\b/i.test(sentence);

      if (hasValue || hasBenefit) {
        valueProps.push({
          text: sentence,
          index: idx,
          strength: this.assessValuePropositionStrength(sentence)
        });
      }
    });

    return valueProps;
  }

  extractSpecificBenefits(text) {
    const benefits = [];
    const patterns = [
      /\b\d+%\s+\w+/g, // "50% increase"
      /\b\d+\s+(hours?|days?|weeks?|months?)\b/gi, // "3 days"
      /\bsave\s+\$?\d+/gi, // "save $1000"
      /\bincrease\s+.*\s+by\s+\d+/gi // "increase revenue by 30%"
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) benefits.push(...matches);
    });

    return benefits;
  }

  extractGenericClaims(text) {
    const genericPhrases = [
      'best', 'leading', 'top', 'world-class', 'cutting-edge', 'innovative',
      'great', 'excellent', 'outstanding', 'superior'
    ];

    const claims = [];
    genericPhrases.forEach(phrase => {
      const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) claims.push(...matches);
    });

    return claims;
  }

  checkDifferentiation(text) {
    const diffWords = this.valueIndicators.differentiation;
    return diffWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
  }

  assessValuePropositionClarity(valuePropositions) {
    if (valuePropositions.length === 0) return 0;

    // Average strength of all value propositions
    const avgStrength = valuePropositions.reduce((sum, vp) => sum + vp.strength, 0) / valuePropositions.length;

    return avgStrength;
  }

  assessValuePropositionStrength(sentence) {
    let strength = 0.5;

    // Check for specific metrics
    if (/\d+%|\d+\s+(students?|schools?|hours?)/.test(sentence)) {
      strength += 0.2;
    }

    // Check for action verbs
    if (/\b(transform|enable|empower|achieve|deliver|provide)\b/i.test(sentence)) {
      strength += 0.15;
    }

    // Check for clear benefits
    if (/\b(benefit|advantage|value|outcome|result)\b/i.test(sentence)) {
      strength += 0.15;
    }

    return Math.min(1, strength);
  }

  extractCTAs(text) {
    const ctas = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    sentences.forEach((sentence, idx) => {
      const matches = this.ctaPatterns.some(pattern => pattern.test(sentence));
      const hasActionVerb = /\b(contact|reach|call|email|visit|join|start|get|schedule|book)\b/i.test(sentence);

      if (matches || hasActionVerb) {
        ctas.push({
          text: sentence,
          index: idx,
          location: idx > sentences.length * 0.8 ? 'ending' : idx < sentences.length * 0.2 ? 'opening' : 'middle'
        });
      }
    });

    return ctas;
  }

  assessCTAStrength(cta) {
    let strength = 0;

    // Check for strong action verbs
    const strongVerbs = this.ctaKeywords.strong;
    if (strongVerbs.some(verb => new RegExp(`\\b${verb}\\b`, 'i').test(cta.text))) {
      strength += 0.3;
    }

    // Check for urgency
    if (this.hasUrgency(cta.text)) {
      strength += 0.2;
    }

    // Check for specific action
    if (/\b(email|call|visit|schedule|book|register)\b/i.test(cta.text)) {
      strength += 0.25;
    }

    // Check for value reminder
    if (/\b(benefit|value|opportunity|transform)\b/i.test(cta.text)) {
      strength += 0.15;
    }

    // Check for personal language
    if (/\b(you|your)\b/i.test(cta.text)) {
      strength += 0.1;
    }

    return Math.min(1, strength);
  }

  hasUrgency(text) {
    const urgencyWords = ['now', 'today', 'immediately', 'urgent', 'limited', 'soon'];
    return urgencyWords.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
  }

  checkSpecificNextSteps(ctas) {
    const specificPatterns = [
      /\b(email|call|visit)\s+[\w@\.\-]+/i, // email, phone, url
      /\b(contact|reach)\s+us\s+at\b/i,
      /\b(schedule|book)\s+a\s+(call|meeting)\b/i
    ];

    return ctas.some(cta =>
      specificPatterns.some(pattern => pattern.test(cta.text))
    );
  }

  countEmotionalPowerWords(text) {
    const words = this.tokenizer.tokenize(text.toLowerCase());
    const counts = {
      positive: 0,
      urgent: 0,
      trust: 0,
      aspiration: 0,
      total: 0
    };

    Object.entries(this.emotionalPowerWords).forEach(([category, powerWords]) => {
      const count = words.filter(word => powerWords.includes(word)).length;
      counts[category] = count;
      counts.total += count;
    });

    return counts;
  }

  assessEmotionalVariety(powerWords) {
    const categories = Object.keys(this.emotionalPowerWords);
    return categories.filter(cat => powerWords[cat] > 0).length;
  }

  hasStorytellingElements(text) {
    const storyIndicators = [
      /\b(imagine|story|example|case|student|teacher)\b/i,
      /\bfor instance\b/i,
      /\bfor example\b/i,
      /"\w+"/  // Quotes
    ];

    return storyIndicators.some(pattern => pattern.test(text));
  }

  assessEmotionalArc(sentences) {
    const sentiments = sentences.map(sentence => {
      const words = this.tokenizer.tokenize(sentence.toLowerCase());
      return this.sentimentAnalyzer.getSentiment(words);
    });

    const mean = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const variance = sentiments.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sentiments.length;

    return {
      variance,
      range: Math.max(...sentiments) - Math.min(...sentiments),
      trend: sentiments[sentiments.length - 1] - sentiments[0]
    };
  }

  detectEthos(text) {
    let score = 0;
    const indicators = this.persuasionIndicators.ethos;

    // Check keywords
    const keywordMatches = indicators.keywords.filter(kw =>
      new RegExp(`\\b${kw}\\b`, 'i').test(text)
    ).length;
    score += Math.min(40, keywordMatches * 10);

    // Check patterns
    const patternMatches = indicators.patterns.filter(pattern =>
      pattern.test(text)
    ).length;
    score += Math.min(40, patternMatches * 20);

    // Check for credentials, awards, testimonials
    if (/\b(certified|accredited|approved|endorsed)\b/i.test(text)) score += 20;

    return {
      score: Math.min(100, score),
      indicators: keywordMatches + patternMatches,
      examples: this.extractExamples(text, indicators.keywords, indicators.patterns)
    };
  }

  detectPathos(text) {
    let score = 0;
    const indicators = this.persuasionIndicators.pathos;

    const keywordMatches = indicators.keywords.filter(kw =>
      new RegExp(`\\b${kw}\\b`, 'i').test(text)
    ).length;
    score += Math.min(40, keywordMatches * 8);

    const emotionMatches = indicators.emotions.filter(em =>
      new RegExp(`\\b${em}\\b`, 'i').test(text)
    ).length;
    score += Math.min(40, emotionMatches * 10);

    // Check for stories/examples
    if (this.hasStorytellingElements(text)) score += 20;

    return {
      score: Math.min(100, score),
      indicators: keywordMatches + emotionMatches,
      examples: this.extractExamples(text, indicators.keywords)
    };
  }

  detectLogos(text) {
    let score = 0;
    const indicators = this.persuasionIndicators.logos;

    const keywordMatches = indicators.keywords.filter(kw =>
      new RegExp(`\\b${kw}\\b`, 'i').test(text)
    ).length;
    score += Math.min(40, keywordMatches * 10);

    const patternMatches = indicators.patterns.filter(pattern =>
      pattern.test(text)
    ).length;
    score += Math.min(60, patternMatches * 15);

    return {
      score: Math.min(100, score),
      indicators: keywordMatches + patternMatches,
      examples: this.extractExamples(text, indicators.keywords, indicators.patterns)
    };
  }

  extractExamples(text, keywords, patterns = []) {
    const examples = [];
    const sentences = this.sentenceTokenizer.tokenize(text);

    sentences.forEach(sentence => {
      const matchesKeyword = keywords.some(kw =>
        new RegExp(`\\b${kw}\\b`, 'i').test(sentence)
      );
      const matchesPattern = patterns.some(pattern => pattern.test(sentence));

      if (matchesKeyword || matchesPattern) {
        examples.push(sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''));
      }
    });

    return examples.slice(0, 3);
  }

  getSuggestionForTechnique(technique) {
    const suggestions = {
      ethos: 'Add credibility indicators: years of experience, certifications, partnerships, testimonials',
      pathos: 'Add emotional appeal: stories, examples, human impact, inspiring language',
      logos: 'Add evidence: statistics, research, data, concrete examples, proof points'
    };
    return suggestions[technique] || '';
  }

  checkFocusCoverage(text, focusAreas) {
    const coverage = {};

    focusAreas.forEach(area => {
      const keywords = this.getFocusKeywords(area);
      coverage[area] = keywords.some(kw =>
        new RegExp(`\\b${kw}\\b`, 'i').test(text)
      );
    });

    return coverage;
  }

  getFocusKeywords(focusArea) {
    const keywordMap = {
      'ROI': ['return', 'investment', 'value', 'cost', 'benefit', 'savings'],
      'impact': ['impact', 'outcome', 'result', 'effect', 'change', 'difference'],
      'partnership benefits': ['partnership', 'collaborate', 'together', 'mutual', 'shared'],
      'CSR alignment': ['social responsibility', 'CSR', 'community', 'sustainability', 'mission'],
      'methodology': ['methodology', 'approach', 'method', 'process', 'framework'],
      'outcomes': ['outcome', 'result', 'achievement', 'success', 'impact'],
      'research': ['research', 'study', 'data', 'evidence', 'findings'],
      'sustainability': ['sustainable', 'long-term', 'lasting', 'ongoing'],
      'pedagogy': ['pedagogy', 'teaching', 'learning', 'education', 'instruction'],
      'student outcomes': ['student', 'achievement', 'learning', 'performance', 'growth'],
      'implementation': ['implementation', 'deploy', 'launch', 'execute', 'rollout'],
      'support': ['support', 'training', 'assistance', 'guidance', 'resources']
    };

    return keywordMap[focusArea] || [focusArea.toLowerCase()];
  }

  detectTone(text) {
    const toneIndicators = {
      professional: ['partnership', 'collaboration', 'investment', 'strategic', 'professional'],
      academic: ['research', 'study', 'methodology', 'findings', 'evidence', 'data'],
      collaborative: ['together', 'partnership', 'collaborate', 'shared', 'mutual', 'joint'],
      accessible: ['simple', 'easy', 'clear', 'straightforward', 'help', 'support']
    };

    const scores = {};
    Object.entries(toneIndicators).forEach(([tone, keywords]) => {
      scores[tone] = keywords.filter(kw =>
        new RegExp(`\\b${kw}\\b`, 'i').test(text)
      ).length;
    });

    return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  }

  calculateSimpleFleschScore(text) {
    const sentences = this.sentenceTokenizer.tokenize(text);
    const words = this.tokenizer.tokenize(text);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 50;

    const avgSentenceLength = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    return Math.max(0, Math.min(100, 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord)));
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

  fleschToGradeLevel(fleschScore) {
    if (fleschScore >= 90) return 5;
    if (fleschScore >= 80) return 6;
    if (fleschScore >= 70) return 7;
    if (fleschScore >= 60) return 9;
    if (fleschScore >= 50) return 12;
    if (fleschScore >= 30) return 16;
    return 18;
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
    const config = this.config.improvementRecommendations.messaging;

    let tier = 'highScore';
    if (overallScore < 70) tier = 'lowScore';
    else if (overallScore < 85) tier = 'mediumScore';

    recommendations.push(...config[tier]);

    if (scores.valueProposition < 80) {
      recommendations.push('Priority: Clarify and strengthen value proposition');
    }
    if (scores.callToAction < 70) {
      recommendations.push('Priority: Create stronger, more specific call-to-action');
    }
    if (scores.emotionalImpact < 75) {
      recommendations.push('Priority: Add emotional appeal and storytelling elements');
    }

    return [...new Set(recommendations)];
  }
}

module.exports = MessagingAnalyzer;
