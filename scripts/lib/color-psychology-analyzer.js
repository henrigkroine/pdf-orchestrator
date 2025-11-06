/**
 * Color Psychology Analyzer - Emotional Impact Assessment
 *
 * Analyzes psychological effects of color choices:
 * - Emotional impact per color
 * - Cultural color associations
 * - Industry-appropriate color validation
 * - Color meaning alignment with content
 * - Psychological effect prediction
 * - AI psychology analysis with GPT-5
 *
 * @module color-psychology-analyzer
 */

const OpenAI = require('openai');

class ColorPsychologyAnalyzer {
  constructor() {
    // OpenAI client (lazy loading)
    this.openai = null;

    // Color psychology database
    this.colorMeanings = {
      red: {
        positive: ['passion', 'energy', 'excitement', 'strength', 'power'],
        negative: ['danger', 'aggression', 'warning', 'urgency'],
        industries: ['food', 'sports', 'entertainment', 'emergency'],
        culturalVariations: {
          western: 'Love, passion, danger',
          eastern: 'Luck, prosperity, celebration',
          african: 'Death, mourning (some cultures)'
        }
      },
      orange: {
        positive: ['enthusiasm', 'creativity', 'adventure', 'warmth', 'success'],
        negative: ['superficiality', 'frivolity'],
        industries: ['technology', 'childcare', 'wellness'],
        culturalVariations: {
          western: 'Energy, enthusiasm',
          eastern: 'Happiness, prosperity',
          dutch: 'National color, royalty'
        }
      },
      yellow: {
        positive: ['optimism', 'happiness', 'clarity', 'warmth', 'creativity'],
        negative: ['caution', 'anxiety', 'cowardice'],
        industries: ['food', 'childcare', 'education'],
        culturalVariations: {
          western: 'Happiness, caution',
          eastern: 'Royalty, sacredness',
          latin: 'Death, mourning (some cultures)'
        }
      },
      green: {
        positive: ['growth', 'harmony', 'freshness', 'safety', 'peace'],
        negative: ['envy', 'inexperience'],
        industries: ['environment', 'health', 'finance', 'sustainability'],
        culturalVariations: {
          western: 'Nature, growth, money',
          islamic: 'Paradise, life, prosperity',
          asian: 'Youth, fertility, newness'
        }
      },
      blue: {
        positive: ['trust', 'stability', 'calm', 'intelligence', 'professionalism'],
        negative: ['coldness', 'aloofness', 'depression'],
        industries: ['finance', 'healthcare', 'technology', 'corporate'],
        culturalVariations: {
          western: 'Trust, professionalism',
          eastern: 'Immortality, spirituality',
          global: 'Most universally liked color'
        }
      },
      purple: {
        positive: ['royalty', 'luxury', 'wisdom', 'spirituality', 'creativity'],
        negative: ['excess', 'arrogance'],
        industries: ['beauty', 'luxury', 'creative', 'spiritual'],
        culturalVariations: {
          western: 'Royalty, luxury, mystery',
          thai: 'Mourning (for widows)',
          brazilian: 'Death, mourning'
        }
      },
      teal: {
        positive: ['sophistication', 'clarity', 'communication', 'healing', 'innovation'],
        negative: ['emotional distance'],
        industries: ['technology', 'healthcare', 'communication', 'nonprofits'],
        culturalVariations: {
          global: 'Generally positive, modern, professional'
        }
      },
      gold: {
        positive: ['luxury', 'quality', 'success', 'achievement', 'wisdom'],
        negative: ['excess', 'materialism'],
        industries: ['luxury', 'finance', 'awards', 'premium'],
        culturalVariations: {
          global: 'Universally associated with wealth and prestige'
        }
      }
    };

    // Industry color preferences
    this.industryPreferences = {
      education: ['blue', 'green', 'purple', 'teal'],
      nonprofit: ['blue', 'green', 'purple', 'teal'],
      healthcare: ['blue', 'green', 'teal'],
      finance: ['blue', 'green', 'gold'],
      technology: ['blue', 'purple', 'teal', 'orange'],
      food: ['red', 'yellow', 'orange', 'green'],
      luxury: ['purple', 'gold', 'black'],
      sustainability: ['green', 'blue', 'earth tones']
    };
  }

  /**
   * Initialize OpenAI client (lazy loading)
   */
  initializeOpenAI() {
    if (!this.openai && process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
    }
  }

  /**
   * Analyze psychological impact of color palette
   * @param {Array<string>} colors - Array of hex colors
   * @param {Object} context - { industry, targetAudience, desiredEmotion, culturalContext }
   * @returns {Object} Comprehensive psychology analysis
   */
  async analyzePsychology(colors, context = {}) {
    if (!colors || colors.length === 0) {
      throw new Error('No colors provided for psychological analysis');
    }

    // Convert colors to named colors
    const namedColors = colors.map(hex => ({
      hex,
      name: this.getColorName(hex),
      hsl: this.hexToHSL(hex)
    }));

    // Analyze emotional impact
    const emotionalImpact = this.analyzeEmotionalImpact(namedColors);

    // Analyze cultural appropriateness
    const culturalAnalysis = this.analyzeCulturalAppropriate(namedColors, context.culturalContext);

    // Validate industry appropriateness
    const industryFit = this.validateIndustryFit(namedColors, context.industry);

    // Analyze meaning alignment
    const meaningAlignment = this.analyzeMeaningAlignment(namedColors, context.desiredEmotion);

    // Predict psychological effects
    const psychologicalEffects = this.predictPsychologicalEffects(namedColors, context.targetAudience);

    // Get AI psychology analysis (GPT-5 when available, GPT-4o for now)
    const aiAnalysis = await this.getAIPsychologyAnalysis(colors, context, {
      emotionalImpact,
      culturalAnalysis,
      industryFit
    });

    // Calculate psychology score
    const psychologyScore = this.calculatePsychologyScore({
      industryFit,
      meaningAlignment,
      culturalAnalysis
    });

    return {
      psychologyScore,
      namedColors,
      emotionalImpact,
      culturalAnalysis,
      industryFit,
      meaningAlignment,
      psychologicalEffects,
      aiAnalysis,
      recommendations: this.generatePsychologyRecommendations({
        industryFit,
        meaningAlignment,
        culturalAnalysis,
        psychologyScore
      })
    };
  }

  /**
   * Analyze emotional impact of colors
   */
  analyzeEmotionalImpact(namedColors) {
    const emotions = {
      positive: [],
      negative: [],
      overall: {}
    };

    namedColors.forEach(color => {
      const meanings = this.colorMeanings[color.name];
      if (meanings) {
        emotions.positive.push(...meanings.positive);
        emotions.negative.push(...meanings.negative);
      }
    });

    // Count emotion frequencies
    const positiveFreq = this.countFrequencies(emotions.positive);
    const negativeFreq = this.countFrequencies(emotions.negative);

    return {
      dominant: Object.keys(positiveFreq)[0] || 'neutral',
      positive: positiveFreq,
      negative: negativeFreq,
      sentiment: Object.keys(positiveFreq).length > Object.keys(negativeFreq).length ? 'positive' : 'mixed',
      emotionalRange: [...new Set([...emotions.positive, ...emotions.negative])]
    };
  }

  /**
   * Analyze cultural appropriateness
   */
  analyzeCulturalAppropriate(namedColors, culturalContext = 'western') {
    const analysis = {
      appropriate: true,
      warnings: [],
      considerations: []
    };

    namedColors.forEach(color => {
      const meanings = this.colorMeanings[color.name];
      if (meanings && meanings.culturalVariations) {
        const culturalMeaning = meanings.culturalVariations[culturalContext] ||
                               meanings.culturalVariations.global ||
                               'No specific cultural meaning';

        analysis.considerations.push({
          color: color.name,
          hex: color.hex,
          culturalMeaning,
          context: culturalContext
        });

        // Check for negative associations
        if (culturalMeaning.toLowerCase().includes('death') ||
            culturalMeaning.toLowerCase().includes('mourning')) {
          analysis.appropriate = false;
          analysis.warnings.push({
            color: color.name,
            warning: `${color.name} associated with ${culturalMeaning} in ${culturalContext} culture`,
            severity: 'high'
          });
        }
      }
    });

    return analysis;
  }

  /**
   * Validate industry appropriateness
   */
  validateIndustryFit(namedColors, industry) {
    if (!industry) {
      return { validated: false, reason: 'No industry specified' };
    }

    const preferredColors = this.industryPreferences[industry.toLowerCase()] || [];

    const matchingColors = namedColors.filter(color =>
      preferredColors.includes(color.name)
    );

    const fitScore = preferredColors.length > 0
      ? (matchingColors.length / namedColors.length) * 100
      : 50; // Neutral if no industry preferences defined

    return {
      industry,
      preferredColors,
      matchingColors: matchingColors.map(c => c.name),
      fitScore: Math.round(fitScore),
      appropriate: fitScore >= 50,
      analysis: this.getIndustryAnalysis(industry, matchingColors, namedColors)
    };
  }

  /**
   * Get industry-specific analysis
   */
  getIndustryAnalysis(industry, matchingColors, allColors) {
    const analysis = {
      strengths: [],
      concerns: []
    };

    if (industry === 'education' || industry === 'nonprofit') {
      // Look for trust, professionalism, warmth
      const hasBlue = matchingColors.some(c => c.name === 'blue');
      const hasTeal = matchingColors.some(c => c.name === 'teal');
      const hasGreen = matchingColors.some(c => c.name === 'green');

      if (hasBlue || hasTeal) {
        analysis.strengths.push('Trust and professionalism colors present');
      }
      if (hasGreen) {
        analysis.strengths.push('Growth and hope symbolism appropriate');
      }

      // Check for inappropriate colors
      const hasRed = allColors.some(c => c.name === 'red');
      if (hasRed) {
        analysis.concerns.push('Red may feel too aggressive for education/nonprofit');
      }
    }

    return analysis;
  }

  /**
   * Analyze meaning alignment with desired emotion
   */
  analyzeMeaningAlignment(namedColors, desiredEmotion) {
    if (!desiredEmotion) {
      return { validated: false, reason: 'No desired emotion specified' };
    }

    const emotionWords = desiredEmotion.toLowerCase().split(/[,\s]+/);

    const alignedColors = namedColors.filter(color => {
      const meanings = this.colorMeanings[color.name];
      if (!meanings) return false;

      const allMeanings = [...meanings.positive, ...meanings.negative];
      return emotionWords.some(emotion =>
        allMeanings.some(meaning => meaning.toLowerCase().includes(emotion))
      );
    });

    const alignmentScore = (alignedColors.length / namedColors.length) * 100;

    return {
      desiredEmotion,
      alignedColors: alignedColors.map(c => ({ name: c.name, hex: c.hex })),
      alignmentScore: Math.round(alignmentScore),
      wellAligned: alignmentScore >= 70
    };
  }

  /**
   * Predict psychological effects on target audience
   */
  predictPsychologicalEffects(namedColors, targetAudience) {
    const effects = {
      attention: this.predictAttention(namedColors),
      trust: this.predictTrust(namedColors),
      energy: this.predictEnergy(namedColors),
      sophistication: this.predictSophistication(namedColors),
      approachability: this.predictApproachability(namedColors)
    };

    return {
      effects,
      targetAudience: targetAudience || 'general',
      overallImpact: this.calculateOverallImpact(effects)
    };
  }

  /**
   * Predict attention-grabbing level
   */
  predictAttention(colors) {
    const highAttention = ['red', 'orange', 'yellow'];
    const score = colors.filter(c => highAttention.includes(c.name)).length / colors.length;
    return { score: Math.round(score * 100), level: score > 0.5 ? 'high' : score > 0.2 ? 'medium' : 'low' };
  }

  /**
   * Predict trust level
   */
  predictTrust(colors) {
    const trustColors = ['blue', 'teal', 'green'];
    const score = colors.filter(c => trustColors.includes(c.name)).length / colors.length;
    return { score: Math.round(score * 100), level: score > 0.5 ? 'high' : score > 0.2 ? 'medium' : 'low' };
  }

  /**
   * Predict energy level
   */
  predictEnergy(colors) {
    const energyColors = ['red', 'orange', 'yellow'];
    const avgSaturation = colors.reduce((sum, c) => sum + c.hsl.s, 0) / colors.length;
    const score = (colors.filter(c => energyColors.includes(c.name)).length / colors.length + avgSaturation / 200);
    return { score: Math.round(score * 100), level: score > 0.6 ? 'high' : score > 0.3 ? 'medium' : 'low' };
  }

  /**
   * Predict sophistication level
   */
  predictSophistication(colors) {
    const sophisticatedColors = ['purple', 'teal', 'gold'];
    const avgLightness = colors.reduce((sum, c) => sum + c.hsl.l, 0) / colors.length;
    const score = (colors.filter(c => sophisticatedColors.includes(c.name)).length / colors.length) * (1 - Math.abs(50 - avgLightness) / 100);
    return { score: Math.round(score * 100), level: score > 0.5 ? 'high' : score > 0.25 ? 'medium' : 'low' };
  }

  /**
   * Predict approachability
   */
  predictApproachability(colors) {
    const approachableColors = ['blue', 'green', 'orange', 'yellow'];
    const avgSaturation = colors.reduce((sum, c) => sum + c.hsl.s, 0) / colors.length;
    const score = (colors.filter(c => approachableColors.includes(c.name)).length / colors.length) * (avgSaturation / 100);
    return { score: Math.round(score * 100), level: score > 0.5 ? 'high' : score > 0.25 ? 'medium' : 'low' };
  }

  /**
   * Calculate overall psychological impact
   */
  calculateOverallImpact(effects) {
    const scores = Object.values(effects).map(e => e.score);
    const avg = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    return {
      score: Math.round(avg),
      rating: avg > 75 ? 'strong' : avg > 50 ? 'moderate' : avg > 25 ? 'weak' : 'minimal'
    };
  }

  /**
   * Get AI psychology analysis (GPT-5 / GPT-4o)
   */
  async getAIPsychologyAnalysis(colors, context, preliminaryAnalysis) {
    this.initializeOpenAI();

    if (!this.openai) {
      return null;
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o', // Will use GPT-5 when available
        messages: [{
          role: 'system',
          content: `You are a color psychology expert specializing in:
- Emotional impact of colors
- Cultural color symbolism
- Consumer psychology and perception
- Brand psychology and identity
- Behavioral influence through color

Analyze color palettes for psychological effectiveness.`
        }, {
          role: 'user',
          content: `Analyze the psychological impact of this color palette:

Colors: ${colors.join(', ')}

Context:
- Industry: ${context.industry || 'Not specified'}
- Target Audience: ${context.targetAudience || 'General'}
- Desired Emotion: ${context.desiredEmotion || 'Not specified'}
- Cultural Context: ${context.culturalContext || 'Western'}

Preliminary Analysis:
- Emotional Impact: ${preliminaryAnalysis.emotionalImpact.dominant}
- Industry Fit: ${preliminaryAnalysis.industryFit.fitScore}%
- Cultural Appropriateness: ${preliminaryAnalysis.culturalAnalysis.appropriate ? 'Appropriate' : 'Has concerns'}

Provide:
1. Psychology score (0-100)
2. Emotional effectiveness
3. Cultural sensitivity assessment
4. Target audience resonance
5. Psychological improvements needed
6. Overall psychology rating (Poor/Fair/Good/Excellent/Perfect)

Return as JSON with structure: { score, effectiveness, culturalSensitivity, audienceResonance, improvements, rating, analysis }`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 1500
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Error getting AI psychology analysis:', error.message);
      return null;
    }
  }

  /**
   * Calculate overall psychology score
   */
  calculatePsychologyScore(analysis) {
    let score = 0;
    const weights = { industry: 40, meaning: 30, cultural: 30 };

    // Industry fit score
    if (analysis.industryFit.validated) {
      score += weights.industry * (analysis.industryFit.fitScore / 100);
    }

    // Meaning alignment score
    if (analysis.meaningAlignment.validated) {
      score += weights.meaning * (analysis.meaningAlignment.alignmentScore / 100);
    }

    // Cultural appropriateness score
    score += weights.cultural * (analysis.culturalAnalysis.appropriate ? 1 : 0.5);

    return Math.round(score);
  }

  /**
   * Generate psychology recommendations
   */
  generatePsychologyRecommendations(analysis) {
    const recommendations = [];

    if (!analysis.industryFit.appropriate) {
      recommendations.push({
        category: 'Industry Fit',
        severity: 'high',
        issue: 'Colors not well-suited for industry',
        suggestion: `Consider using ${analysis.industryFit.industry} industry-standard colors`,
        preferredColors: analysis.industryFit.preferredColors
      });
    }

    if (!analysis.meaningAlignment.wellAligned) {
      recommendations.push({
        category: 'Emotional Alignment',
        severity: 'medium',
        issue: 'Colors don\'t strongly convey desired emotion',
        suggestion: 'Choose colors with stronger emotional associations',
        desiredEmotion: analysis.meaningAlignment.desiredEmotion
      });
    }

    if (!analysis.culturalAnalysis.appropriate) {
      recommendations.push({
        category: 'Cultural Sensitivity',
        severity: 'critical',
        issue: 'Colors have negative cultural associations',
        suggestion: 'Replace culturally problematic colors',
        warnings: analysis.culturalAnalysis.warnings
      });
    }

    return recommendations;
  }

  /**
   * Get color name from hex
   */
  getColorName(hex) {
    const hsl = this.hexToHSL(hex);
    const h = hsl.h;
    const s = hsl.s;
    const l = hsl.l;

    // Achromatic
    if (s < 10) {
      if (l > 90) return 'white';
      if (l < 10) return 'black';
      return 'gray';
    }

    // Chromatic colors by hue
    if (h >= 0 && h < 15) return 'red';
    if (h >= 15 && h < 45) return 'orange';
    if (h >= 45 && h < 75) return 'yellow';
    if (h >= 75 && h < 150) return 'green';
    if (h >= 150 && h < 200) return 'teal';
    if (h >= 200 && h < 260) return 'blue';
    if (h >= 260 && h < 330) return 'purple';
    if (h >= 330) return 'red';

    return 'unknown';
  }

  /**
   * Count frequencies in array
   */
  countFrequencies(arr) {
    return arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  /**
   * Convert hex to HSL
   */
  hexToHSL(hex) {
    const rgb = this.hexToRgb(hex);
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  }

  /**
   * Convert hex to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }
}

module.exports = ColorPsychologyAnalyzer;
