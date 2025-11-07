/**
 * Typography Optimizer - AI-Powered Typography System
 *
 * Creates award-winning typography with:
 * - Perfect type scales (golden ratio, musical intervals)
 * - Optimal readability (45-75 characters per line)
 * - Stunning font pairings (AI-generated)
 * - Professional hierarchy
 * - Micro-typography perfection
 *
 * @module typography-optimizer
 */

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

class TypographyOptimizer {
  constructor(config = {}) {
    this.config = {
      // Perfect type scale ratios
      scales: {
        minorSecond: 1.067,    // 15:16
        majorSecond: 1.125,    // 8:9
        minorThird: 1.200,     // 5:6
        majorThird: 1.250,     // 4:5 (recommended)
        perfectFourth: 1.333,  // 3:4
        augmentedFourth: 1.414, // 1:√2
        perfectFifth: 1.500,   // 2:3
        goldenRatio: 1.618     // φ (phi)
      },

      // Base font size
      baseSize: config.baseSize || 16,

      // Selected scale
      scale: config.scale || 1.250, // Major Third (default)

      // Golden ratio line heights
      lineHeight: {
        display: 1.0,      // Tight for large display text
        heading: 1.2,      // Compact for headlines
        body: 1.618,       // Golden ratio for body
        caption: 1.4,      // Tighter for small text
        code: 1.5          // Monospace needs more space
      },

      // Optimal characters per line (CPL)
      cpl: {
        min: 45,           // Minimum for readability
        ideal: 66,         // Perfect sweet spot
        max: 75            // Maximum before fatigue
      },

      // Letter spacing (tracking) adjustments
      tracking: {
        display: -0.02,    // Tighten large text
        heading: -0.01,    // Slightly tight
        body: 0,           // Normal
        small: 0.01,       // Open up small text
        allCaps: 0.05      // Much more space for caps
      },

      // Font weight scale
      weights: {
        thin: 100,
        extraLight: 200,
        light: 300,
        regular: 400,
        medium: 500,
        semiBold: 600,
        bold: 700,
        extraBold: 800,
        black: 900
      },

      // Paragraph spacing
      paragraphSpacing: {
        tight: 0.5,        // 0.5em between paragraphs
        normal: 1.0,       // 1em (most common)
        loose: 1.5         // 1.5em for emphasis
      },

      // Measure (line width) calculations
      measure: {
        minEm: 20,         // 20em minimum width
        idealEm: 30,       // 30em ideal width
        maxEm: 35          // 35em maximum width
      },

      ...config
    };

    // OpenAI client for AI-powered features (initialize lazily)
    this.openai = null;

    // Cache for AI responses
    this.cache = new Map();
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
   * Generate perfect type scale based on musical intervals
   * @param {number} baseSize - Base font size in pixels
   * @param {number} scale - Scale ratio (e.g., 1.250 for Major Third)
   * @param {number} steps - Number of steps up and down
   * @returns {Object} Complete type scale
   */
  generateTypeScale(baseSize = this.config.baseSize, scale = this.config.scale, steps = 5) {
    const typeScale = {
      scale: scale,
      base: baseSize,
      sizes: {},
      metadata: {
        ratio: scale,
        intervalName: this.getScaleName(scale),
        generatedAt: new Date().toISOString()
      }
    };

    // Generate sizes above base
    for (let i = steps; i >= 0; i--) {
      const size = Math.round(baseSize * Math.pow(scale, i) * 100) / 100;
      const name = this.getSizeName(i);

      typeScale.sizes[name] = {
        px: size,
        em: Math.round((size / baseSize) * 100) / 100,
        rem: Math.round((size / baseSize) * 100) / 100,
        pt: Math.round(size * 0.75 * 100) / 100, // px to pt conversion
        lineHeight: this.calculateOptimalLineHeight(size, name),
        letterSpacing: this.calculateLetterSpacing(size, name),
        usage: this.getSizeUsage(name)
      };
    }

    // Generate sizes below base (for small text)
    for (let i = 1; i <= 2; i++) {
      const size = Math.round(baseSize / Math.pow(scale, i) * 100) / 100;
      const name = i === 1 ? 'small' : 'tiny';

      typeScale.sizes[name] = {
        px: size,
        em: Math.round((size / baseSize) * 100) / 100,
        rem: Math.round((size / baseSize) * 100) / 100,
        pt: Math.round(size * 0.75 * 100) / 100,
        lineHeight: this.config.lineHeight.caption,
        letterSpacing: this.config.tracking.small,
        usage: name === 'small' ? 'Captions, footnotes' : 'Fine print, legal'
      };
    }

    return typeScale;
  }

  /**
   * Get human-readable name for scale ratio
   */
  getScaleName(ratio) {
    const scales = {
      1.067: 'Minor Second',
      1.125: 'Major Second',
      1.200: 'Minor Third',
      1.250: 'Major Third',
      1.333: 'Perfect Fourth',
      1.414: 'Augmented Fourth',
      1.500: 'Perfect Fifth',
      1.618: 'Golden Ratio'
    };

    // Find closest match
    let closest = Object.keys(scales)[0];
    let minDiff = Math.abs(ratio - parseFloat(closest));

    for (const [key, name] of Object.entries(scales)) {
      const diff = Math.abs(ratio - parseFloat(key));
      if (diff < minDiff) {
        minDiff = diff;
        closest = key;
      }
    }

    return scales[closest];
  }

  /**
   * Get size name based on step
   */
  getSizeName(step) {
    const names = {
      5: 'display',
      4: 'h1',
      3: 'h2',
      2: 'h3',
      1: 'h4',
      0: 'body'
    };
    return names[step] || 'body';
  }

  /**
   * Get usage recommendation for size
   */
  getSizeUsage(name) {
    const usage = {
      display: 'Hero sections, landing pages',
      h1: 'Page titles, main headlines',
      h2: 'Section headings, major divisions',
      h3: 'Sub-sections, article titles',
      h4: 'Card titles, minor headings',
      body: 'Body text, paragraphs',
      small: 'Captions, footnotes',
      tiny: 'Fine print, legal text'
    };
    return usage[name] || 'General text';
  }

  /**
   * Calculate optimal line height for size
   */
  calculateOptimalLineHeight(size, type) {
    // Larger text needs tighter line height
    // Smaller text needs more space

    if (type === 'display' || size >= 48) {
      return this.config.lineHeight.display;
    } else if (type.startsWith('h') || size >= 24) {
      return this.config.lineHeight.heading;
    } else if (size <= 12) {
      return this.config.lineHeight.caption;
    } else {
      return this.config.lineHeight.body;
    }
  }

  /**
   * Calculate letter spacing (tracking) for size
   */
  calculateLetterSpacing(size, type) {
    if (type === 'display' || size >= 48) {
      return this.config.tracking.display;
    } else if (type.startsWith('h') || size >= 24) {
      return this.config.tracking.heading;
    } else if (size <= 12) {
      return this.config.tracking.small;
    } else {
      return this.config.tracking.body;
    }
  }

  /**
   * Find perfect font pairings using AI
   */
  async findPerfectPairings(brandContext = {}) {
    const cacheKey = `pairings-${JSON.stringify(brandContext)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Initialize OpenAI if needed
    this.initializeOpenAI();

    if (!this.openai) {
      console.warn('OpenAI API key not found, using expert-curated pairings');
      return this.getExpertPairings(brandContext);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{
          role: 'system',
          content: `You are a world-class typography expert specializing in font pairings.
You understand:
- Typographic contrast (serif/sans, humanist/geometric)
- Historical context and cultural associations
- Technical considerations (x-height, character width, kerning)
- Emotional impact and brand personality
- Readability in different contexts (print, screen, small sizes)

Provide font pairing recommendations that are:
- Professionally recognized and available
- Tested for readability
- Appropriate for the brand context
- Visually harmonious with strong contrast`
        }, {
          role: 'user',
          content: `Find 5 stunning font pairings for this brand:

Brand: ${brandContext.name || 'TEEI'}
Personality: ${brandContext.personality || 'warm, empowering, professional, hopeful'}
Industry: ${brandContext.industry || 'education, nonprofit'}
Content Type: ${brandContext.contentType || 'partnership documents, reports, presentations'}
Audience: ${brandContext.audience || 'corporate partners, education leaders'}

Current Fonts:
- Headlines: ${brandContext.currentHeadline || 'Lora (serif)'}
- Body: ${brandContext.currentBody || 'Roboto Flex (sans-serif)'}

Requirements:
- Excellent readability for education content
- Professional appearance for corporate partnerships
- Works well in both print (300dpi) and digital (screen)
- Strong typographic contrast for clear hierarchy
- Accessible (good x-height, open letterforms)

For each pairing, provide:
1. Headline font (name, foundry, classification)
2. Body font (name, foundry, classification)
3. Contrast level (high/medium/low)
4. Mood/personality
5. Why it works (technical and emotional reasons)
6. Best use cases
7. Pairing score (1-10)

Return as JSON array of font pairings.`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content);
      this.cache.set(cacheKey, result);

      return result;

    } catch (error) {
      console.error('Error generating font pairings:', error);

      // Fallback to expert-curated pairings
      return this.getExpertPairings(brandContext);
    }
  }

  /**
   * Expert-curated font pairings (fallback)
   */
  getExpertPairings(brandContext) {
    return {
      pairings: [
        {
          name: 'Classic Elegance',
          headline: {
            font: 'Lora',
            foundry: 'Google Fonts',
            classification: 'Serif, Transitional',
            weight: 'Bold, SemiBold'
          },
          body: {
            font: 'Roboto Flex',
            foundry: 'Google Fonts',
            classification: 'Sans-serif, Neo-grotesque',
            weight: 'Regular'
          },
          contrast: 'high',
          mood: 'Professional, warm, trustworthy',
          reasoning: 'Classic serif/sans pairing with excellent readability. Lora adds warmth and sophistication, while Roboto provides clarity and modernity.',
          useCases: ['Partnership documents', 'Annual reports', 'Presentations'],
          score: 9
        },
        {
          name: 'Modern Humanist',
          headline: {
            font: 'Merriweather',
            foundry: 'Google Fonts',
            classification: 'Serif, Transitional',
            weight: 'Bold'
          },
          body: {
            font: 'Open Sans',
            foundry: 'Google Fonts',
            classification: 'Sans-serif, Humanist',
            weight: 'Regular'
          },
          contrast: 'medium',
          mood: 'Friendly, approachable, professional',
          reasoning: 'Both fonts have humanist qualities creating harmony. Excellent for screen reading with strong character differentiation.',
          useCases: ['Web content', 'Digital reports', 'Email campaigns'],
          score: 8
        },
        {
          name: 'Editorial Excellence',
          headline: {
            font: 'Playfair Display',
            foundry: 'Google Fonts',
            classification: 'Serif, Didone',
            weight: 'Bold'
          },
          body: {
            font: 'Source Sans Pro',
            foundry: 'Adobe Fonts',
            classification: 'Sans-serif, Humanist',
            weight: 'Regular'
          },
          contrast: 'high',
          mood: 'Elegant, authoritative, refined',
          reasoning: 'High-contrast pairing perfect for formal documents. Playfair adds drama and prestige, Source Sans ensures readability.',
          useCases: ['Annual reports', 'Impact reports', 'Formal presentations'],
          score: 9
        },
        {
          name: 'Clean Contemporary',
          headline: {
            font: 'Montserrat',
            foundry: 'Google Fonts',
            classification: 'Sans-serif, Geometric',
            weight: 'Bold, ExtraBold'
          },
          body: {
            font: 'Lato',
            foundry: 'Google Fonts',
            classification: 'Sans-serif, Humanist',
            weight: 'Regular'
          },
          contrast: 'low',
          mood: 'Modern, clean, approachable',
          reasoning: 'Two sans-serifs with different personalities. Geometric headline creates impact, humanist body maintains warmth.',
          useCases: ['Modern brand materials', 'Tech partnerships', 'Startup collaborations'],
          score: 7
        },
        {
          name: 'Scholarly Authority',
          headline: {
            font: 'Crimson Text',
            foundry: 'Google Fonts',
            classification: 'Serif, Garald',
            weight: 'Bold, SemiBold'
          },
          body: {
            font: 'Nunito Sans',
            foundry: 'Google Fonts',
            classification: 'Sans-serif, Humanist',
            weight: 'Regular'
          },
          contrast: 'high',
          mood: 'Academic, trustworthy, warm',
          reasoning: 'Perfect for educational content. Crimson evokes academic tradition, Nunito adds contemporary friendliness.',
          useCases: ['Educational materials', 'Research reports', 'Academic partnerships'],
          score: 8
        }
      ],
      metadata: {
        generatedAt: new Date().toISOString(),
        source: 'expert-curated',
        brandContext: brandContext
      }
    };
  }

  /**
   * Optimize typography hierarchy for a document
   */
  async optimizeHierarchy(documentAnalysis) {
    const elements = documentAnalysis.textElements || [];
    const typeScale = this.generateTypeScale();

    // Sort elements by importance
    const sorted = elements.sort((a, b) => (b.importance || 0) - (a.importance || 0));

    // Map elements to type scale
    const optimized = sorted.map((el, idx) => {
      const level = this.determineHierarchyLevel(el, idx, sorted.length);
      const typeInfo = typeScale.sizes[level];

      return {
        element: el.type || el.tag || 'text',
        currentSize: el.fontSize || el.size || 16,
        optimizedSize: typeInfo.px,
        currentWeight: el.fontWeight || 400,
        optimizedWeight: this.calculateOptimalWeight(el, level),
        currentLineHeight: el.lineHeight || 1.5,
        optimizedLineHeight: typeInfo.lineHeight,
        currentLetterSpacing: el.letterSpacing || 0,
        optimizedLetterSpacing: typeInfo.letterSpacing,
        color: this.calculateOptimalColor(el, level),
        spacing: this.calculateOptimalSpacing(el, level),
        level: level,
        improvements: this.calculateImprovements(el, typeInfo)
      };
    });

    return {
      elements: optimized,
      typeScale: typeScale,
      summary: this.generateHierarchySummary(optimized),
      recommendations: await this.generateAIRecommendations(optimized, documentAnalysis)
    };
  }

  /**
   * Determine hierarchy level for element
   */
  determineHierarchyLevel(element, index, total) {
    const type = (element.type || element.tag || '').toLowerCase();

    // Map HTML tags to levels
    if (type === 'h1' || type === 'title') return 'h1';
    if (type === 'h2') return 'h2';
    if (type === 'h3') return 'h3';
    if (type === 'h4') return 'h4';
    if (type === 'small' || type === 'caption') return 'small';

    // Map by importance score
    const importance = element.importance || 0;
    if (importance >= 90) return 'display';
    if (importance >= 80) return 'h1';
    if (importance >= 70) return 'h2';
    if (importance >= 60) return 'h3';
    if (importance >= 50) return 'h4';
    if (importance <= 30) return 'small';

    return 'body';
  }

  /**
   * Calculate optimal font weight
   */
  calculateOptimalWeight(element, level) {
    const weights = {
      display: this.config.weights.bold,
      h1: this.config.weights.bold,
      h2: this.config.weights.semiBold,
      h3: this.config.weights.semiBold,
      h4: this.config.weights.medium,
      body: this.config.weights.regular,
      small: this.config.weights.regular
    };

    return weights[level] || this.config.weights.regular;
  }

  /**
   * Calculate optimal text color
   */
  calculateOptimalColor(element, level) {
    // Use TEEI brand colors
    const colors = {
      display: '#00393F',  // Nordshore (primary)
      h1: '#00393F',       // Nordshore
      h2: '#00393F',       // Nordshore
      h3: '#65873B',       // Moss (accent for variety)
      h4: '#00393F',       // Nordshore
      body: '#333333',     // Near black for readability
      small: '#666666'     // Gray for de-emphasis
    };

    return colors[level] || colors.body;
  }

  /**
   * Calculate optimal spacing
   */
  calculateOptimalSpacing(element, level) {
    // Spacing in pixels
    const spacing = {
      display: {
        marginTop: 0,
        marginBottom: 32
      },
      h1: {
        marginTop: 48,
        marginBottom: 24
      },
      h2: {
        marginTop: 32,
        marginBottom: 16
      },
      h3: {
        marginTop: 24,
        marginBottom: 12
      },
      h4: {
        marginTop: 20,
        marginBottom: 8
      },
      body: {
        marginTop: 0,
        marginBottom: 16
      },
      small: {
        marginTop: 0,
        marginBottom: 8
      }
    };

    return spacing[level] || spacing.body;
  }

  /**
   * Calculate improvements from current to optimized
   */
  calculateImprovements(current, optimized) {
    const improvements = [];

    const currentSize = current.fontSize || current.size || 16;
    const sizeDiff = Math.abs(optimized.px - currentSize);

    if (sizeDiff > 2) {
      improvements.push({
        type: 'fontSize',
        current: currentSize,
        optimized: optimized.px,
        impact: 'high',
        reason: 'Better hierarchy and readability'
      });
    }

    const currentLH = current.lineHeight || 1.5;
    const lhDiff = Math.abs(optimized.lineHeight - currentLH);

    if (lhDiff > 0.1) {
      improvements.push({
        type: 'lineHeight',
        current: currentLH,
        optimized: optimized.lineHeight,
        impact: 'medium',
        reason: 'Improved readability and rhythm'
      });
    }

    return improvements;
  }

  /**
   * Generate hierarchy summary
   */
  generateHierarchySummary(optimized) {
    const levels = {};

    optimized.forEach(el => {
      if (!levels[el.level]) {
        levels[el.level] = {
          count: 0,
          avgCurrentSize: 0,
          avgOptimizedSize: 0
        };
      }

      levels[el.level].count++;
      levels[el.level].avgCurrentSize += el.currentSize;
      levels[el.level].avgOptimizedSize += el.optimizedSize;
    });

    // Calculate averages
    Object.keys(levels).forEach(level => {
      const l = levels[level];
      l.avgCurrentSize = Math.round(l.avgCurrentSize / l.count);
      l.avgOptimizedSize = Math.round(l.avgOptimizedSize / l.count);
    });

    return {
      totalElements: optimized.length,
      levels: levels,
      avgImprovement: this.calculateAvgImprovement(optimized)
    };
  }

  /**
   * Calculate average improvement
   */
  calculateAvgImprovement(optimized) {
    let totalImprovements = 0;

    optimized.forEach(el => {
      totalImprovements += el.improvements.length;
    });

    return Math.round((totalImprovements / optimized.length) * 100) / 100;
  }

  /**
   * Generate AI recommendations
   */
  async generateAIRecommendations(optimized, documentAnalysis) {
    // Initialize OpenAI if needed
    this.initializeOpenAI();

    if (!this.openai) {
      return {
        recommendations: [
          {
            title: 'Establish clear hierarchy',
            description: 'Use consistent type scale with 3-4 distinct levels',
            impact: 'high',
            priority: 1
          },
          {
            title: 'Optimize line height',
            description: 'Use 1.618 (golden ratio) for body text, 1.2 for headings',
            impact: 'medium',
            priority: 2
          },
          {
            title: 'Adjust letter spacing',
            description: 'Tighten large text, open up small text',
            impact: 'medium',
            priority: 3
          }
        ]
      };
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'system',
          content: 'You are a typography expert. Provide concise recommendations.'
        }, {
          role: 'user',
          content: `Analyze this typography hierarchy and suggest 3 key improvements:

Document: ${documentAnalysis.title || 'Untitled'}
Elements: ${optimized.length}
Levels: ${Object.keys(this.generateHierarchySummary(optimized).levels).join(', ')}

Current issues:
${optimized.filter(el => el.improvements.length > 0).slice(0, 5).map(el =>
  `- ${el.element}: ${el.improvements.map(i => i.reason).join(', ')}`
).join('\n')}

Provide 3 actionable recommendations as JSON array with: {title, description, impact, priority}`
        }],
        response_format: { type: 'json_object' },
        temperature: 0.7
      });

      return JSON.parse(response.choices[0].message.content);

    } catch (error) {
      console.error('Error generating AI recommendations:', error);

      return {
        recommendations: [
          {
            title: 'Establish clear hierarchy',
            description: 'Use consistent type scale with 3-4 distinct levels',
            impact: 'high',
            priority: 1
          },
          {
            title: 'Optimize line height',
            description: 'Use 1.618 (golden ratio) for body text, 1.2 for headings',
            impact: 'medium',
            priority: 2
          },
          {
            title: 'Adjust letter spacing',
            description: 'Tighten large text, open up small text',
            impact: 'medium',
            priority: 3
          }
        ]
      };
    }
  }

  /**
   * Calculate optimal measure (line width) for text
   */
  calculateOptimalMeasure(fontSize, fontFamily = 'sans-serif') {
    const avgCharWidth = this.getAvgCharWidth(fontFamily, fontSize);

    return {
      minWidth: Math.round(this.config.cpl.min * avgCharWidth),
      idealWidth: Math.round(this.config.cpl.ideal * avgCharWidth),
      maxWidth: Math.round(this.config.cpl.max * avgCharWidth),
      minEm: this.config.measure.minEm,
      idealEm: this.config.measure.idealEm,
      maxEm: this.config.measure.maxEm,
      unit: 'px'
    };
  }

  /**
   * Get average character width for font
   */
  getAvgCharWidth(fontFamily, fontSize) {
    // Approximate character widths (in em units)
    const widths = {
      'serif': 0.55,
      'sans-serif': 0.52,
      'monospace': 0.6
    };

    const family = fontFamily.toLowerCase();
    let width = widths['sans-serif']; // Default

    if (family.includes('serif') && !family.includes('sans')) {
      width = widths['serif'];
    } else if (family.includes('mono')) {
      width = widths['monospace'];
    }

    return fontSize * width;
  }

  /**
   * Generate complete typography system
   */
  async generateSystem(brandContext = {}) {
    const typeScale = this.generateTypeScale();
    const fontPairings = await this.findPerfectPairings(brandContext);

    return {
      typeScale: typeScale,
      fontPairings: fontPairings,
      guidelines: {
        lineHeight: this.config.lineHeight,
        tracking: this.config.tracking,
        measure: this.config.measure,
        cpl: this.config.cpl
      },
      cssVariables: this.generateCSSVariables(typeScale),
      indesignSpecs: this.generateInDesignSpecs(typeScale),
      metadata: {
        generatedAt: new Date().toISOString(),
        brand: brandContext.name || 'TEEI',
        scale: typeScale.metadata.intervalName
      }
    };
  }

  /**
   * Generate CSS variables for web
   */
  generateCSSVariables(typeScale) {
    const vars = [':root {'];

    Object.entries(typeScale.sizes).forEach(([name, size]) => {
      vars.push(`  --font-size-${name}: ${size.rem}rem;`);
      vars.push(`  --line-height-${name}: ${size.lineHeight};`);
      vars.push(`  --letter-spacing-${name}: ${size.letterSpacing}em;`);
    });

    vars.push('}');

    return vars.join('\n');
  }

  /**
   * Generate InDesign specifications
   */
  generateInDesignSpecs(typeScale) {
    const specs = [];

    Object.entries(typeScale.sizes).forEach(([name, size]) => {
      specs.push({
        styleName: name.toUpperCase(),
        fontSize: `${size.pt}pt`,
        leading: `${Math.round(size.pt * size.lineHeight)}pt`,
        tracking: Math.round(size.letterSpacing * 1000), // InDesign uses 1/1000 em
        usage: size.usage
      });
    });

    return specs;
  }

  /**
   * Export system to file
   */
  async exportSystem(system, outputPath) {
    await fs.writeFile(
      outputPath,
      JSON.stringify(system, null, 2),
      'utf8'
    );

    console.log(`✅ Typography system exported to: ${outputPath}`);
  }
}

module.exports = TypographyOptimizer;
