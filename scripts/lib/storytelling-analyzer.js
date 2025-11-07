/**
 * Storytelling Analyzer
 *
 * Analyzes storytelling quality including narrative arc, story structure,
 * character clarity, conflict/resolution, and emotional journey.
 *
 * Features:
 * - Narrative arc identification
 * - Story structure validation (beginning, middle, end)
 * - Character/subject clarity assessment
 * - Conflict and resolution detection
 * - Emotional journey mapping
 * - AI storytelling analysis with Gemini 2.5 Pro
 */

const natural = require('natural');

class StorytellingAnalyzer {
  constructor(config, aiClient) {
    this.config = config;
    this.aiClient = aiClient;
    this.tokenizer = new natural.WordTokenizer();
    this.sentenceTokenizer = new natural.SentenceTokenizer();
    this.sentimentAnalyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

    // Story structure markers
    this.storyMarkers = {
      beginning: {
        keywords: ['introduction', 'background', 'context', 'began', 'started', 'initially', 'first'],
        patterns: [/^(in|at|when|once|before)/i, /\byears? ago\b/i]
      },
      middle: {
        keywords: ['challenge', 'problem', 'difficulty', 'obstacle', 'struggle', 'however', 'but', 'faced'],
        patterns: [/\bchallenge was\b/i, /\bproblem\b/i, /\bdifficulty\b/i]
      },
      end: {
        keywords: ['result', 'outcome', 'success', 'achievement', 'now', 'today', 'finally', 'ultimately'],
        patterns: [/\bas a result\b/i, /\bin the end\b/i, /\btoday\b/i]
      }
    };

    // Narrative arc elements
    this.narrativeElements = {
      exposition: ['background', 'context', 'setting', 'situation', 'who', 'what', 'where', 'when'],
      risingAction: ['challenge', 'difficulty', 'problem', 'obstacle', 'barrier', 'gap'],
      climax: ['critical', 'crucial', 'turning point', 'breakthrough', 'realized', 'decided'],
      fallingAction: ['solution', 'approach', 'implemented', 'addressed', 'tackled'],
      resolution: ['result', 'outcome', 'impact', 'success', 'achieved', 'transformed']
    };

    // Character/subject indicators
    this.characterIndicators = [
      /\b(students?|teachers?|educators?|families|communities?|children|learners?)\b/gi,
      /\b(our|we|us|team)\b/gi,
      /\b(partners?|organizations?|companies?)\b/gi,
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g // Names
    ];

    // Conflict indicators
    this.conflictIndicators = {
      problem: ['problem', 'challenge', 'difficulty', 'obstacle', 'barrier', 'issue', 'gap', 'lack'],
      tension: ['struggle', 'conflict', 'tension', 'pressure', 'strain', 'stress'],
      stakes: ['critical', 'essential', 'vital', 'urgent', 'important', 'necessary']
    };

    // Resolution indicators
    this.resolutionIndicators = {
      solution: ['solution', 'answer', 'approach', 'method', 'way', 'strategy'],
      action: ['implemented', 'launched', 'created', 'developed', 'built', 'established'],
      outcome: ['result', 'outcome', 'impact', 'effect', 'change', 'transformation']
    };

    // Emotional journey markers
    this.emotionalMarkers = {
      negative: ['struggle', 'difficulty', 'challenge', 'problem', 'barrier', 'lack', 'limited'],
      hopeful: ['opportunity', 'potential', 'possibility', 'hope', 'vision', 'dream'],
      positive: ['success', 'achievement', 'transformation', 'growth', 'improvement', 'breakthrough'],
      inspiring: ['inspire', 'empower', 'enable', 'uplift', 'motivate', 'encourage']
    };
  }

  /**
   * Analyze storytelling quality
   */
  async analyzeStorytelling(text, options = {}) {
    const startTime = Date.now();

    try {
      console.log('Starting storytelling quality analysis...');

      const sentences = this.sentenceTokenizer.tokenize(text);
      const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

      // Run all storytelling analyses
      const narrativeArc = this.analyzeNarrativeArc(text, sentences, paragraphs);
      const storyStructure = this.analyzeStoryStructure(text, paragraphs);
      const characterClarity = this.analyzeCharacterClarity(text, sentences);
      const conflictResolution = this.analyzeConflictResolution(text, sentences);
      const emotionalJourney = this.analyzeEmotionalJourney(text, sentences);

      // Get AI storytelling critique with Gemini 2.5 Pro
      const aiCritique = await this.getAIStorytellingCritique(text, {
        narrativeArc: narrativeArc.score,
        hasConflict: conflictResolution.hasConflict,
        hasResolution: conflictResolution.hasResolution,
        emotionalRange: emotionalJourney.range
      });

      // Calculate overall storytelling score
      const scores = {
        narrativeArc: narrativeArc.score,
        storyStructure: storyStructure.score,
        characterClarity: characterClarity.score,
        conflictResolution: conflictResolution.score,
        emotionalJourney: emotionalJourney.score
      };

      const weights = this.config.qualityDimensions.storytellingQuality.criteria;
      const overallScore = this.calculateWeightedScore(scores, weights);

      const duration = Date.now() - startTime;

      return {
        dimension: 'storytellingQuality',
        overallScore,
        scores,
        details: {
          narrativeArc,
          storyStructure,
          characterClarity,
          conflictResolution,
          emotionalJourney
        },
        aiCritique,
        issues: this.combineIssues([
          narrativeArc.issues,
          storyStructure.issues,
          characterClarity.issues,
          conflictResolution.issues,
          emotionalJourney.issues
        ]),
        recommendations: this.generateRecommendations(overallScore, scores),
        metadata: {
          duration,
          sentenceCount: sentences.length,
          paragraphCount: paragraphs.length
        }
      };

    } catch (error) {
      console.error('Storytelling analysis error:', error);
      throw new Error(`Storytelling analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze narrative arc (exposition → rising action → climax → falling action → resolution)
   */
  analyzeNarrativeArc(text, sentences, paragraphs) {
    const issues = [];
    let score = 100;

    // Detect presence of each narrative element
    const elements = {};
    const elementLocations = {};

    Object.entries(this.narrativeElements).forEach(([element, keywords]) => {
      const matches = this.findElementMatches(text, keywords);
      elements[element] = matches.count > 0;
      elementLocations[element] = matches.locations;
    });

    // Check for complete narrative arc
    const missingElements = Object.entries(elements)
      .filter(([elem, present]) => !present)
      .map(([elem]) => elem);

    if (missingElements.length > 2) {
      issues.push({
        type: 'narrativeArc',
        severity: 'critical',
        issue: `Missing narrative elements: ${missingElements.join(', ')}`,
        suggestion: 'Develop a complete story arc with clear beginning, middle, and end',
        missing: missingElements
      });
      score -= 40;
    } else if (missingElements.length > 0) {
      issues.push({
        type: 'narrativeArc',
        severity: 'major',
        issue: `Weak narrative elements: ${missingElements.join(', ')}`,
        suggestion: `Strengthen ${missingElements.join(' and ')} in the narrative`,
        missing: missingElements
      });
      score -= 20;
    }

    // Check for proper sequencing
    const sequence = this.checkNarrativeSequence(elementLocations);

    if (!sequence.isLogical) {
      issues.push({
        type: 'narrativeArc',
        severity: 'major',
        issue: 'Narrative elements out of order',
        suggestion: 'Reorganize content to follow logical story progression',
        details: sequence.issues
      });
      score -= 15;
    }

    // Check for clear beginning
    const hasStrongOpening = this.checkStrongOpening(paragraphs[0]);

    if (!hasStrongOpening) {
      issues.push({
        type: 'narrativeArc',
        severity: 'minor',
        issue: 'Opening doesn\'t establish clear narrative context',
        suggestion: 'Begin with clear setting, characters, or situation',
        location: 'Opening paragraph'
      });
      score -= 10;
    }

    // Check for satisfying resolution
    const lastParagraph = paragraphs[paragraphs.length - 1] || '';
    const hasResolution = this.narrativeElements.resolution.some(kw =>
      new RegExp(`\\b${kw}\\b`, 'i').test(lastParagraph)
    );

    if (!hasResolution) {
      issues.push({
        type: 'narrativeArc',
        severity: 'major',
        issue: 'No clear resolution in conclusion',
        suggestion: 'End with clear outcome, impact, or transformation',
        location: 'Closing paragraph'
      });
      score -= 15;
    }

    return {
      score: Math.max(0, Math.round(score)),
      elements,
      elementLocations,
      sequence: sequence.isLogical,
      hasStrongOpening,
      hasResolution,
      issues,
      summary: {
        completeArc: missingElements.length === 0,
        elementsPresent: Object.values(elements).filter(Boolean).length,
        totalElements: Object.keys(elements).length,
        logicalSequence: sequence.isLogical
      }
    };
  }

  /**
   * Analyze story structure (beginning, middle, end)
   */
  analyzeStoryStructure(text, paragraphs) {
    const issues = [];
    let score = 100;

    // Divide text into thirds
    const thirdLength = Math.floor(paragraphs.length / 3);
    const beginning = paragraphs.slice(0, thirdLength).join(' ');
    const middle = paragraphs.slice(thirdLength, thirdLength * 2).join(' ');
    const end = paragraphs.slice(thirdLength * 2).join(' ');

    // Check beginning markers
    const beginningMarkers = this.findMarkers(beginning, this.storyMarkers.beginning);
    const hasBeginning = beginningMarkers.count > 0;

    if (!hasBeginning) {
      issues.push({
        type: 'storyStructure',
        severity: 'major',
        issue: 'Weak beginning/setup',
        suggestion: 'Establish clear context, background, or setting in opening',
        location: 'First third'
      });
      score -= 20;
    }

    // Check middle (conflict/challenge)
    const middleMarkers = this.findMarkers(middle, this.storyMarkers.middle);
    const hasMiddle = middleMarkers.count > 0;

    if (!hasMiddle) {
      issues.push({
        type: 'storyStructure',
        severity: 'critical',
        issue: 'No clear challenge or conflict in middle section',
        suggestion: 'Present problem, challenge, or tension in middle section',
        location: 'Middle third'
      });
      score -= 30;
    }

    // Check end (resolution/outcome)
    const endMarkers = this.findMarkers(end, this.storyMarkers.end);
    const hasEnd = endMarkers.count > 0;

    if (!hasEnd) {
      issues.push({
        type: 'storyStructure',
        severity: 'major',
        issue: 'Weak conclusion or no clear resolution',
        suggestion: 'End with clear outcome, result, or current state',
        location: 'Final third'
      });
      score -= 20;
    }

    // Check for balance (paragraphs should be somewhat evenly distributed)
    const distribution = [
      paragraphs.slice(0, thirdLength).length,
      paragraphs.slice(thirdLength, thirdLength * 2).length,
      paragraphs.slice(thirdLength * 2).length
    ];

    const maxDiff = Math.max(...distribution) - Math.min(...distribution);

    if (maxDiff > paragraphs.length * 0.3) {
      issues.push({
        type: 'storyStructure',
        severity: 'minor',
        issue: 'Unbalanced structure (one section much longer than others)',
        suggestion: 'Balance content across beginning, middle, and end',
        distribution
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      hasBeginning,
      hasMiddle,
      hasEnd,
      distribution,
      markers: {
        beginning: beginningMarkers.count,
        middle: middleMarkers.count,
        end: endMarkers.count
      },
      issues,
      summary: {
        completeStructure: hasBeginning && hasMiddle && hasEnd,
        missingParts: [
          !hasBeginning && 'beginning',
          !hasMiddle && 'middle',
          !hasEnd && 'end'
        ].filter(Boolean)
      }
    };
  }

  /**
   * Analyze character/subject clarity
   */
  analyzeCharacterClarity(text, sentences) {
    const issues = [];
    let score = 100;

    // Extract characters/subjects
    const characters = this.extractCharacters(text);

    if (characters.length === 0) {
      issues.push({
        type: 'characterClarity',
        severity: 'critical',
        issue: 'No clear characters or subjects identified',
        suggestion: 'Introduce specific people, students, or organizations',
        location: 'Throughout document'
      });
      return {
        score: 0,
        characters: [],
        mainCharacter: null,
        issues,
        summary: { characterCount: 0, hasMainCharacter: false }
      };
    }

    // Identify main character (most frequently mentioned)
    const characterCounts = {};
    characters.forEach(char => {
      characterCounts[char] = (characterCounts[char] || 0) + 1;
    });

    const sortedChars = Object.entries(characterCounts).sort((a, b) => b[1] - a[1]);
    const mainCharacter = sortedChars[0][0];
    const mainCharCount = sortedChars[0][1];

    // Check if main character is introduced early
    const firstThird = sentences.slice(0, Math.floor(sentences.length / 3)).join(' ');
    const mainCharIntroducedEarly = new RegExp(mainCharacter, 'i').test(firstThird);

    if (!mainCharIntroducedEarly) {
      issues.push({
        type: 'characterClarity',
        severity: 'minor',
        issue: 'Main subject not introduced in opening',
        suggestion: 'Introduce key characters/subjects early in the narrative',
        mainCharacter
      });
      score -= 10;
    }

    // Check for character development (is character described/detailed?)
    const characterDevelopment = this.assessCharacterDevelopment(text, mainCharacter);

    if (characterDevelopment < 0.5) {
      issues.push({
        type: 'characterClarity',
        severity: 'major',
        issue: 'Insufficient character/subject development',
        suggestion: 'Provide more details about who they are and their journey',
        mainCharacter
      });
      score -= 20;
    }

    // Check for character consistency (mentioned throughout, not just beginning)
    const distribution = this.checkCharacterDistribution(text, mainCharacter);

    if (!distribution.consistent) {
      issues.push({
        type: 'characterClarity',
        severity: 'minor',
        issue: 'Character/subject not maintained throughout narrative',
        suggestion: 'Keep main subject visible throughout the story',
        mainCharacter
      });
      score -= 15;
    }

    return {
      score: Math.max(0, Math.round(score)),
      characters: sortedChars.map(([char, count]) => ({ name: char, mentions: count })),
      mainCharacter: { name: mainCharacter, mentions: mainCharCount },
      introducedEarly: mainCharIntroducedEarly,
      development: Math.round(characterDevelopment * 100),
      consistent: distribution.consistent,
      issues,
      summary: {
        characterCount: Object.keys(characterCounts).length,
        hasMainCharacter: true,
        development: Math.round(characterDevelopment * 100)
      }
    };
  }

  /**
   * Analyze conflict and resolution
   */
  analyzeConflictResolution(text, sentences) {
    const issues = [];
    let score = 100;

    // Detect conflict
    const conflict = this.detectConflict(text);

    if (!conflict.detected) {
      issues.push({
        type: 'conflictResolution',
        severity: 'critical',
        issue: 'No clear conflict, challenge, or problem identified',
        suggestion: 'Present the challenge or need that drives the narrative',
        location: 'Missing'
      });
      score -= 40;
    }

    // Detect resolution
    const resolution = this.detectResolution(text);

    if (!resolution.detected) {
      issues.push({
        type: 'conflictResolution',
        severity: 'critical',
        issue: 'No clear resolution or solution presented',
        suggestion: 'Show how the challenge was addressed and the outcome',
        location: 'Missing'
      });
      score -= 40;
    }

    // Check if conflict comes before resolution (proper narrative order)
    if (conflict.detected && resolution.detected) {
      const conflictLocation = conflict.location || 0;
      const resolutionLocation = resolution.location || 1;

      if (conflictLocation >= resolutionLocation) {
        issues.push({
          type: 'conflictResolution',
          severity: 'major',
          issue: 'Resolution appears before conflict is established',
          suggestion: 'Present problem before solution for logical flow',
          locations: { conflict: conflictLocation, resolution: resolutionLocation }
        });
        score -= 20;
      }
    }

    // Check for stakes (why does this matter?)
    const stakes = this.detectStakes(text);

    if (!stakes.detected) {
      issues.push({
        type: 'conflictResolution',
        severity: 'minor',
        issue: 'Stakes or importance not clearly established',
        suggestion: 'Explain why resolving this challenge matters',
        location: 'Throughout'
      });
      score -= 10;
    }

    // Check for transformation (before/after comparison)
    const transformation = this.detectTransformation(text);

    if (!transformation.detected) {
      issues.push({
        type: 'conflictResolution',
        severity: 'minor',
        issue: 'No clear transformation or change shown',
        suggestion: 'Show the before and after state to highlight impact',
        location: 'Missing'
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      hasConflict: conflict.detected,
      conflict: conflict.examples,
      hasResolution: resolution.detected,
      resolution: resolution.examples,
      hasStakes: stakes.detected,
      hasTransformation: transformation.detected,
      properOrder: conflict.detected && resolution.detected && conflict.location < resolution.location,
      issues,
      summary: {
        completeArc: conflict.detected && resolution.detected,
        properSequence: conflict.location < resolution.location,
        stakesEstablished: stakes.detected
      }
    };
  }

  /**
   * Analyze emotional journey
   */
  analyzeEmotionalJourney(text, sentences) {
    const issues = [];
    let score = 100;

    // Map emotional sentiment across narrative
    const emotionalMap = this.mapEmotionalJourney(sentences);

    // Check for emotional variety
    const range = emotionalMap.max - emotionalMap.min;

    if (range < 1.0) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'major',
        issue: 'Flat emotional arc (little variation)',
        suggestion: 'Create emotional contrast: challenge → hope → success',
        range: Math.round(range * 100) / 100
      });
      score -= 25;
    }

    // Check for journey pattern (should have ups and downs, ending positive)
    const journey = this.analyzeJourneyPattern(emotionalMap.sentiments);

    if (!journey.hasLowPoint) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'minor',
        issue: 'No emotional low point or challenge',
        suggestion: 'Show struggle or difficulty to make success more meaningful',
        location: 'Middle section'
      });
      score -= 15;
    }

    if (!journey.endsPositive) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'major',
        issue: 'Narrative doesn\'t end on positive note',
        suggestion: 'Conclude with hope, success, or forward momentum',
        location: 'Ending'
      });
      score -= 20;
    }

    if (!journey.hasArc) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'minor',
        issue: 'No clear emotional arc or progression',
        suggestion: 'Build emotional journey from challenge through resolution',
        location: 'Throughout'
      });
      score -= 10;
    }

    // Check for emotional markers
    const markers = this.findEmotionalMarkers(text);

    if (!markers.hasNegative || !markers.hasPositive) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'minor',
        issue: 'Missing emotional contrast',
        suggestion: 'Include both challenges and successes for emotional depth',
        missing: !markers.hasNegative ? 'challenge' : 'success'
      });
      score -= 10;
    }

    if (!markers.hasHopeful && !markers.hasInspiring) {
      issues.push({
        type: 'emotionalJourney',
        severity: 'minor',
        issue: 'Lacks inspirational or hopeful elements',
        suggestion: 'Add forward-looking, inspiring language',
        location: 'Throughout, especially ending'
      });
      score -= 10;
    }

    return {
      score: Math.max(0, Math.round(score)),
      range: Math.round(range * 100) / 100,
      emotionalMap: emotionalMap.sentiments.map(s => Math.round(s * 100) / 100),
      journey,
      markers,
      issues,
      summary: {
        emotionalRange: range >= 1.5 ? 'strong' : range >= 1.0 ? 'moderate' : 'weak',
        hasArc: journey.hasArc,
        endsPositive: journey.endsPositive
      }
    };
  }

  /**
   * Get AI storytelling critique using Gemini 2.5 Pro
   */
  async getAIStorytellingCritique(text, context) {
    try {
      const words = this.tokenizer.tokenize(text);
      const truncatedText = words.length > 2500
        ? words.slice(0, 2500).join(' ') + '...'
        : text;

      const prompt = `Analyze this content as a story. Evaluate narrative quality and storytelling effectiveness.

Context:
- Narrative Arc Score: ${context.narrativeArc}/100
- Has Conflict: ${context.hasConflict}
- Has Resolution: ${context.hasResolution}
- Emotional Range: ${context.emotionalRange}

Content:
"""
${truncatedText}
"""

Provide expert storytelling analysis:

1. Narrative Structure Assessment
   - Is there a clear beginning, middle, and end?
   - Does the narrative flow logically?
   - What's the core story being told?

2. Character/Subject Analysis
   - Who are the main characters/subjects?
   - Are they introduced and developed clearly?
   - Do we care about them?

3. Conflict and Resolution
   - What is the central challenge or conflict?
   - Is it compelling and relatable?
   - How is it resolved?
   - Is the resolution satisfying?

4. Emotional Journey
   - What emotional arc does the reader experience?
   - Are there moments of tension and release?
   - Does it inspire or move the reader?

5. Storytelling Effectiveness
   - Does this read like a story or just facts?
   - What makes it engaging (or not)?
   - How could storytelling be strengthened?

Format as JSON:
{
  "narrativeAssessment": "...",
  "coreStory": "...",
  "strengths": ["...", "...", "..."],
  "weaknesses": ["...", "...", "..."],
  "emotionalImpact": "...",
  "mostCompellingMoment": "...",
  "improvements": [
    {"aspect": "...", "current": "...", "suggestion": "...", "why": "..."}
  ],
  "rewriteExample": {
    "section": "...",
    "original": "...",
    "improved": "...",
    "storytellingTechniques": "..."
  }
}`;

      const response = await this.aiClient.generateText({
        model: this.config.aiModels.storytelling.primary,
        prompt,
        temperature: this.config.aiModels.storytelling.temperature,
        maxTokens: this.config.aiModels.storytelling.maxTokens,
        systemPrompt: this.config.aiModels.storytelling.systemPrompt
      });

      return JSON.parse(response);

    } catch (error) {
      console.error('AI storytelling critique error:', error);
      return {
        narrativeAssessment: 'AI analysis unavailable',
        coreStory: '',
        strengths: [],
        weaknesses: [],
        emotionalImpact: '',
        mostCompellingMoment: '',
        improvements: [],
        rewriteExample: {},
        error: error.message
      };
    }
  }

  // ==================== Helper Methods ====================

  findElementMatches(text, keywords) {
    const matches = [];
    let count = 0;

    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const found = text.match(regex);
      if (found) {
        count += found.length;
        // Find approximate location (percentage through text)
        const index = text.toLowerCase().indexOf(kw.toLowerCase());
        if (index !== -1) {
          matches.push(index / text.length);
        }
      }
    });

    return { count, locations: matches };
  }

  checkNarrativeSequence(elementLocations) {
    const expectedOrder = ['exposition', 'risingAction', 'climax', 'fallingAction', 'resolution'];
    const avgLocations = {};

    // Calculate average location for each element
    Object.entries(elementLocations).forEach(([element, locations]) => {
      if (locations.length > 0) {
        avgLocations[element] = locations.reduce((a, b) => a + b, 0) / locations.length;
      }
    });

    const issues = [];
    let isLogical = true;

    // Check if elements appear in expected order
    for (let i = 0; i < expectedOrder.length - 1; i++) {
      const current = expectedOrder[i];
      const next = expectedOrder[i + 1];

      if (avgLocations[current] && avgLocations[next]) {
        if (avgLocations[current] >= avgLocations[next]) {
          issues.push(`${current} appears after ${next}`);
          isLogical = false;
        }
      }
    }

    return { isLogical, issues };
  }

  checkStrongOpening(firstParagraph) {
    if (!firstParagraph) return false;

    const beginningKeywords = this.storyMarkers.beginning.keywords;
    const hasBeginningMarker = beginningKeywords.some(kw =>
      new RegExp(`\\b${kw}\\b`, 'i').test(firstParagraph)
    );

    // Also check for engaging elements
    const hasQuestion = firstParagraph.includes('?');
    const hasCharacter = this.characterIndicators.some(pattern => pattern.test(firstParagraph));
    const hasContext = /\b(in|at|when|before|context|background)\b/i.test(firstParagraph);

    return hasBeginningMarker || hasQuestion || (hasCharacter && hasContext);
  }

  findMarkers(text, markerSet) {
    let count = 0;
    const found = [];

    markerSet.keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        count += matches.length;
        found.push(...matches);
      }
    });

    markerSet.patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        count += matches.length;
        found.push(...matches);
      }
    });

    return { count, found };
  }

  extractCharacters(text) {
    const characters = [];

    this.characterIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        characters.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(characters)];
  }

  assessCharacterDevelopment(text, character) {
    const sentences = this.sentenceTokenizer.tokenize(text);
    const charSentences = sentences.filter(s =>
      new RegExp(character, 'i').test(s)
    );

    if (charSentences.length === 0) return 0;

    // Check for descriptive/developmental content
    const developmentIndicators = [
      /\b(who|what|why|how)\b/i,
      /\b(is|are|was|were)\s+\w+/i,
      /\b(background|experience|story|journey)\b/i
    ];

    const developedSentences = charSentences.filter(s =>
      developmentIndicators.some(pattern => pattern.test(s))
    );

    return developedSentences.length / charSentences.length;
  }

  checkCharacterDistribution(text, character) {
    const paragraphs = text.split(/\n\n+/);
    const thirds = Math.floor(paragraphs.length / 3);

    const beginning = paragraphs.slice(0, thirds).join(' ');
    const middle = paragraphs.slice(thirds, thirds * 2).join(' ');
    const end = paragraphs.slice(thirds * 2).join(' ');

    const inBeginning = new RegExp(character, 'i').test(beginning);
    const inMiddle = new RegExp(character, 'i').test(middle);
    const inEnd = new RegExp(character, 'i').test(end);

    const consistent = [inBeginning, inMiddle, inEnd].filter(Boolean).length >= 2;

    return { consistent, distribution: { beginning: inBeginning, middle: inMiddle, end: inEnd } };
  }

  detectConflict(text) {
    let detected = false;
    const examples = [];
    const sentences = this.sentenceTokenizer.tokenize(text);
    let location = -1;

    Object.values(this.conflictIndicators).flat().forEach(indicator => {
      sentences.forEach((sentence, idx) => {
        if (new RegExp(`\\b${indicator}\\b`, 'i').test(sentence)) {
          detected = true;
          if (examples.length < 3) {
            examples.push(sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''));
          }
          if (location === -1) {
            location = idx / sentences.length; // Percentage through text
          }
        }
      });
    });

    return { detected, examples, location };
  }

  detectResolution(text) {
    let detected = false;
    const examples = [];
    const sentences = this.sentenceTokenizer.tokenize(text);
    let location = -1;

    Object.values(this.resolutionIndicators).flat().forEach(indicator => {
      sentences.forEach((sentence, idx) => {
        if (new RegExp(`\\b${indicator}\\b`, 'i').test(sentence)) {
          detected = true;
          if (examples.length < 3) {
            examples.push(sentence.substring(0, 100) + (sentence.length > 100 ? '...' : ''));
          }
          if (location === -1) {
            location = idx / sentences.length;
          }
        }
      });
    });

    return { detected, examples, location };
  }

  detectStakes(text) {
    const stakeIndicators = this.conflictIndicators.stakes;
    let detected = false;

    const sentences = this.sentenceTokenizer.tokenize(text);
    sentences.forEach(sentence => {
      if (stakeIndicators.some(indicator => new RegExp(`\\b${indicator}\\b`, 'i').test(sentence))) {
        detected = true;
      }
    });

    return { detected };
  }

  detectTransformation(text) {
    const transformationPatterns = [
      /\b(before|after|now|then|was|is|became|transformed)\b/gi,
      /\bfrom\s+\w+\s+to\s+\w+/gi,
      /\bused to\s+\w+.*\s+now\s+\w+/gi
    ];

    let detected = false;

    transformationPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        detected = true;
      }
    });

    return { detected };
  }

  mapEmotionalJourney(sentences) {
    const sentiments = sentences.map(sentence => {
      const words = this.tokenizer.tokenize(sentence.toLowerCase());
      return this.sentimentAnalyzer.getSentiment(words);
    });

    return {
      sentiments,
      min: Math.min(...sentiments),
      max: Math.max(...sentiments),
      average: sentiments.reduce((a, b) => a + b, 0) / sentiments.length
    };
  }

  analyzeJourneyPattern(sentiments) {
    if (sentiments.length < 3) {
      return { hasLowPoint: false, endsPositive: false, hasArc: false };
    }

    const firstThird = sentiments.slice(0, Math.floor(sentiments.length / 3));
    const middleThird = sentiments.slice(Math.floor(sentiments.length / 3), Math.floor(sentiments.length * 2 / 3));
    const lastThird = sentiments.slice(Math.floor(sentiments.length * 2 / 3));

    const avgFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const avgMiddle = middleThird.reduce((a, b) => a + b, 0) / middleThird.length;
    const avgLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

    const hasLowPoint = avgMiddle < avgFirst && avgMiddle < avgLast;
    const endsPositive = avgLast > 0;
    const hasArc = avgLast > avgFirst || (avgMiddle < avgFirst && avgLast > avgMiddle);

    return { hasLowPoint, endsPositive, hasArc, pattern: { first: avgFirst, middle: avgMiddle, last: avgLast } };
  }

  findEmotionalMarkers(text) {
    const markers = {};

    Object.entries(this.emotionalMarkers).forEach(([emotion, keywords]) => {
      const hasMarker = keywords.some(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text));
      markers[`has${emotion.charAt(0).toUpperCase() + emotion.slice(1)}`] = hasMarker;
    });

    return markers;
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
    const config = this.config.improvementRecommendations.storytelling;

    let tier = 'highScore';
    if (overallScore < 70) tier = 'lowScore';
    else if (overallScore < 85) tier = 'mediumScore';

    recommendations.push(...config[tier]);

    if (scores.narrativeArc < 75) {
      recommendations.push('Priority: Develop complete narrative arc (exposition → climax → resolution)');
    }
    if (scores.conflictResolution < 70) {
      recommendations.push('Priority: Clearly present challenge and its resolution');
    }
    if (scores.emotionalJourney < 75) {
      recommendations.push('Priority: Create emotional journey from struggle to success');
    }

    return [...new Set(recommendations)];
  }
}

module.exports = StorytellingAnalyzer;
