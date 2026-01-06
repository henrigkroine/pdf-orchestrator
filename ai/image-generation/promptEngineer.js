/**
 * TEEI Brand-Compliant Prompt Engineer
 *
 * Generates optimized prompts for AI image generation that align with
 * TEEI brand guidelines:
 * - Warm natural lighting (not harsh studio lighting)
 * - Authentic documentary photography (not staged corporate stock)
 * - Diverse representation (Ukrainian students, various ages/backgrounds)
 * - Hopeful atmosphere (connection, empowerment, education)
 * - Educational technology visible (laptops, tablets, collaborative work)
 * - TEEI color grading: Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
 */

import logger from '../utils/logger.js';

class PromptEngineer {
  constructor(config = {}) {
    this.brandProfile = config.brandProfile || 'teei';
    this.verbose = config.verbose || false;

    // TEEI Brand Style Keywords
    this.brandStyle = {
      lighting: [
        'warm natural lighting',
        'soft golden hour light',
        'window light',
        'diffused daylight',
        'gentle morning light'
      ],
      atmosphere: [
        'hopeful atmosphere',
        'authentic moment',
        'genuine connection',
        'empowering scene',
        'inspiring environment'
      ],
      avoidTerms: [
        'NOT staged',
        'NOT corporate stock photography',
        'NOT harsh lighting',
        'NOT studio lighting',
        'NOT posed',
        'NOT artificial'
      ],
      technicalStyle: [
        'photorealistic',
        'documentary photography style',
        'candid shot',
        'natural composition',
        '35mm photography'
      ],
      colorGrading: [
        'warm color tones',
        'teal and gold color palette',
        'soft beige and sky blue accents',
        'natural earth tones'
      ]
    };

    // Content Templates by Category
    this.templates = {
      hero: {
        subjects: [
          'diverse Ukrainian students',
          'group of young learners from Ukraine',
          'Ukrainian youth collaborative team',
          'diverse group of displaced students'
        ],
        activities: [
          'collaborating on laptops',
          'engaged in cloud computing training',
          'working together on technology projects',
          'learning with educational technology',
          'participating in online education program'
        ],
        settings: [
          'modern learning space',
          'bright classroom environment',
          'collaborative workspace',
          'educational center',
          'community technology hub'
        ]
      },
      program: {
        subjects: [
          'Ukrainian students',
          'diverse learners',
          'young professionals in training',
          'engaged participants'
        ],
        activities: [
          'hands-on technology training',
          'collaborative problem solving',
          'working on digital projects',
          'practicing technical skills',
          'participating in virtual classroom'
        ],
        settings: [
          'modern computer lab',
          'technology training facility',
          'educational workspace',
          'bright learning environment'
        ]
      },
      cover: {
        subjects: [
          'hopeful Ukrainian student',
          'diverse group of learners',
          'young person using technology'
        ],
        activities: [
          'engaged with laptop',
          'using cloud technology',
          'participating in online learning',
          'exploring educational platform'
        ],
        settings: [
          'warm educational setting',
          'inspiring learning space',
          'modern technology environment',
          'bright hopeful backdrop'
        ]
      },
      partnership: {
        subjects: [
          'diverse students',
          'collaborative learning group',
          'technology learners'
        ],
        activities: [
          'working with partner technology',
          'engaged in professional training',
          'building technical skills',
          'learning industry-standard tools'
        ],
        settings: [
          'professional learning environment',
          'modern training facility',
          'tech-forward educational space'
        ]
      }
    };
  }

  /**
   * Generate brand-compliant prompt
   * @param {Object} params
   * @param {string} params.category - Image category (hero, program, cover, partnership)
   * @param {string} params.userPrompt - Optional user-provided prompt
   * @param {Object} params.context - Additional context (partner name, program details)
   * @returns {string} Optimized prompt
   */
  generatePrompt(params) {
    const { category = 'hero', userPrompt, context = {} } = params;

    logger.debug(`Generating prompt for category: ${category}`);

    // If user provided detailed prompt, enhance it with brand style
    if (userPrompt && userPrompt.length > 50) {
      return this._enhanceUserPrompt(userPrompt, category);
    }

    // Otherwise, generate from template
    return this._generateFromTemplate(category, context);
  }

  /**
   * Enhance user-provided prompt with TEEI brand style
   * @private
   */
  _enhanceUserPrompt(userPrompt, category) {
    // If userPrompt is too short, generate from template instead
    if (!userPrompt || userPrompt.length < 20) {
      return this._generateFromTemplate(category);
    }

    // Extract components
    const lighting = this._randomChoice(this.brandStyle.lighting);
    const atmosphere = this._randomChoice(this.brandStyle.atmosphere);
    const technicalStyle = this._randomChoice(this.brandStyle.technicalStyle);
    const colorGrading = this._randomChoice(this.brandStyle.colorGrading);
    const avoidTerms = this.brandStyle.avoidTerms.join(', ');

    // Build enhanced prompt
    const enhancedPrompt = `${userPrompt}, ${lighting}, ${atmosphere}, ${technicalStyle}, ${colorGrading}, ${avoidTerms}`;

    if (this.verbose) {
      logger.debug(`Enhanced user prompt: ${enhancedPrompt}`);
    }

    return enhancedPrompt;
  }

  /**
   * Generate prompt from template
   * @private
   */
  _generateFromTemplate(category, context = {}) {
    const template = this.templates[category] || this.templates.hero;

    // Select components
    const subject = this._randomChoice(template.subjects);
    const activity = this._randomChoice(template.activities);
    const setting = this._randomChoice(template.settings);
    const lighting = this._randomChoice(this.brandStyle.lighting);
    const atmosphere = this._randomChoice(this.brandStyle.atmosphere);
    const technicalStyle = this._randomChoice(this.brandStyle.technicalStyle);
    const colorGrading = this._randomChoice(this.brandStyle.colorGrading);
    const avoidTerms = this.brandStyle.avoidTerms.join(', ');

    // Add partner-specific context if provided
    let partnerContext = '';
    if (context.partnerName) {
      partnerContext = `, featuring ${context.partnerName} technology`;
    }

    // Construct prompt
    const prompt = [
      `${subject} ${activity} in ${setting}${partnerContext}`,
      lighting,
      atmosphere,
      technicalStyle,
      colorGrading,
      avoidTerms
    ].join(', ');

    if (this.verbose) {
      logger.debug(`Generated prompt: ${prompt}`);
    }

    return prompt;
  }

  /**
   * Generate multiple prompt variations
   * @param {Object} params - Same as generatePrompt
   * @param {number} count - Number of variations
   * @returns {string[]} Array of prompt variations
   */
  generateVariations(params, count = 3) {
    const variations = [];

    for (let i = 0; i < count; i++) {
      const prompt = this.generatePrompt(params);
      variations.push(prompt);
    }

    return variations;
  }

  /**
   * Optimize prompt for specific AI provider
   * @param {string} prompt - Base prompt
   * @param {string} provider - 'dalle3' or 'stable-diffusion'
   * @returns {string} Provider-optimized prompt
   */
  optimizeForProvider(prompt, provider) {
    if (provider === 'dalle3') {
      // DALL-E 3 handles natural language well, no special optimization needed
      return prompt;
    } else if (provider === 'stable-diffusion') {
      // Stable Diffusion benefits from more structured prompts
      // Convert to comma-separated keyword format
      return prompt
        .replace(/\s+in\s+/gi, ', ')
        .replace(/\s+with\s+/gi, ', ')
        .replace(/\s+and\s+/gi, ', ');
    }

    return prompt;
  }

  /**
   * Validate prompt against TEEI brand guidelines
   * @param {string} prompt - Prompt to validate
   * @returns {Object} { valid: boolean, warnings: string[], suggestions: string[] }
   */
  validatePrompt(prompt) {
    const warnings = [];
    const suggestions = [];
    const promptLower = prompt.toLowerCase();

    // Check for forbidden terms (but allow "NOT staged" which is our negative prompt)
    const forbiddenTerms = [
      'studio lighting',
      'harsh light',
      'corporate stock',
      'professional headshot'
    ];

    forbiddenTerms.forEach(term => {
      if (promptLower.includes(term)) {
        warnings.push(`Prompt contains forbidden term: "${term}"`);
        suggestions.push(`Replace "${term}" with TEEI brand-aligned alternatives`);
      }
    });

    // Check for "staged" or "posed" without "NOT" prefix
    if (promptLower.includes('staged') && !promptLower.includes('not staged')) {
      warnings.push(`Prompt contains forbidden term: "staged"`);
      suggestions.push(`Use "NOT staged" to avoid staged photography`);
    }
    if (promptLower.includes('posed') && !promptLower.includes('not posed')) {
      warnings.push(`Prompt contains forbidden term: "posed"`);
      suggestions.push(`Use "NOT posed" to avoid posed photography`);
    }

    // Check for required elements
    const hasLighting = this.brandStyle.lighting.some(term =>
      promptLower.includes(term.toLowerCase())
    );
    if (!hasLighting) {
      suggestions.push('Consider adding lighting description (warm natural lighting, soft golden hour, etc.)');
    }

    const hasAtmosphere = this.brandStyle.atmosphere.some(term =>
      promptLower.includes(term.toLowerCase())
    );
    if (!hasAtmosphere) {
      suggestions.push('Consider adding atmosphere description (hopeful, authentic, genuine, etc.)');
    }

    // Check prompt length
    if (prompt.length < 50) {
      suggestions.push('Prompt is short. Consider adding more detail for better results.');
    }

    return {
      valid: warnings.length === 0,
      warnings,
      suggestions
    };
  }

  /**
   * Get prompt recommendations for category
   * @param {string} category - Image category
   * @returns {Object} Recommendations
   */
  getRecommendations(category) {
    const template = this.templates[category] || this.templates.hero;

    return {
      category,
      subjectOptions: template.subjects,
      activityOptions: template.activities,
      settingOptions: template.settings,
      styleGuidelines: {
        lighting: this.brandStyle.lighting,
        atmosphere: this.brandStyle.atmosphere,
        avoid: this.brandStyle.avoidTerms,
        colorGrading: this.brandStyle.colorGrading
      },
      examplePrompt: this.generatePrompt({ category })
    };
  }

  /**
   * Utility: Random choice from array
   * @private
   */
  _randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get supported categories
   * @returns {string[]}
   */
  getSupportedCategories() {
    return Object.keys(this.templates);
  }

  /**
   * Export brand style guide as JSON
   * @returns {Object}
   */
  exportBrandStyleGuide() {
    return {
      brandProfile: this.brandProfile,
      style: this.brandStyle,
      templates: this.templates,
      guidelines: {
        lighting: 'Use warm, natural lighting. Avoid harsh studio lighting.',
        atmosphere: 'Create hopeful, authentic atmosphere. Avoid staged corporate feel.',
        subjects: 'Feature diverse Ukrainian students. Show genuine connection.',
        settings: 'Modern educational spaces with visible technology.',
        colors: 'Warm tones with teal and gold accents (TEEI palette).',
        photography: 'Documentary style, candid shots, natural composition.'
      }
    };
  }
}

export default PromptEngineer;
