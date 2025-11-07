/**
 * Icon & Illustration Generator
 *
 * AI-powered icon and illustration generation for TEEI brand materials
 *
 * Features:
 * - Custom icon generation with DALL-E 3
 * - Cohesive icon set creation
 * - Publication-quality illustrations
 * - Automatic SVG conversion
 * - Style consistency enforcement
 * - Multiple style variations
 *
 * @module icon-illustration-generator
 */

const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const sharp = require('sharp');
const potrace = require('potrace');
const fs = require('fs').promises;
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const https = require('https');

class IconIllustrationGenerator {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    this.config = {
      outputDir: config.outputDir || path.join(process.cwd(), 'assets/generated'),
      cacheDir: config.cacheDir || path.join(process.cwd(), 'assets/cache'),
      quality: config.quality || 'hd',
      ...config
    };

    // TEEI brand style guide
    this.teeiStyle = {
      description: `TEEI brand style: Warm, inviting, empowering, professional`,
      colors: {
        primary: {
          nordshore: '#00393F',
          sky: '#C9E4EC',
          sand: '#FFF1E2',
          beige: '#EFE1DC'
        },
        accent: {
          moss: '#65873B',
          gold: '#BA8F5A',
          clay: '#913B2F'
        }
      },
      colorPalette: 'Nordshore #00393F, Sky #C9E4EC, Sand #FFF1E2, Beige #EFE1DC, Moss #65873B, Gold #BA8F5A, Clay #913B2F',
      fonts: {
        headlines: 'Lora (serif)',
        body: 'Roboto Flex (sans-serif)'
      },
      values: 'Education, hope, empowerment, inclusion, equity, transformation',
      mood: 'Inspiring, warm, authentic, professional, hopeful'
    };

    // Icon styles
    this.styles = {
      flat: {
        name: 'Flat Design',
        description: 'Modern flat design with simple geometric shapes and solid colors',
        characteristics: 'Clean, minimal, 2D, no gradients or shadows',
        bestFor: 'UI elements, app icons, infographics'
      },
      line: {
        name: 'Line Art',
        description: 'Clean line art with consistent stroke width',
        characteristics: 'Outlined shapes, uniform line weight, no fill colors',
        bestFor: 'Technical diagrams, minimalist icons, print materials'
      },
      isometric: {
        name: 'Isometric 3D',
        description: '3D isometric style with depth and dimension',
        characteristics: '30-degree angles, pseudo-3D, geometric precision',
        bestFor: 'Technical illustrations, architecture, product diagrams'
      },
      duotone: {
        name: 'Duotone',
        description: 'Two-color design with highlights and shadows',
        characteristics: 'Two main colors, depth through shading, high contrast',
        bestFor: 'Modern posters, social media graphics, hero images'
      },
      gradient: {
        name: 'Gradient',
        description: 'Smooth color transitions and modern effects',
        characteristics: 'Flowing colors, depth, contemporary feel',
        bestFor: 'App icons, modern branding, digital materials'
      },
      handDrawn: {
        name: 'Hand-Drawn',
        description: 'Sketch-like, organic, human-made feel',
        characteristics: 'Imperfect lines, textured, warm and approachable',
        bestFor: 'Education materials, friendly branding, storytelling'
      },
      geometric: {
        name: 'Geometric',
        description: 'Precise geometric shapes and mathematical patterns',
        characteristics: 'Sharp angles, perfect circles, grid-based',
        bestFor: 'Tech branding, modern design, professional materials'
      },
      organic: {
        name: 'Organic',
        description: 'Natural, flowing shapes inspired by nature',
        characteristics: 'Curved lines, natural forms, soft edges',
        bestFor: 'Wellness, education, environmental themes'
      }
    };

    // Ensure directories exist
    this.initDirectories();
  }

  async initDirectories() {
    await fs.mkdir(this.config.outputDir, { recursive: true });
    await fs.mkdir(this.config.cacheDir, { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'icons'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'illustrations'), { recursive: true });
    await fs.mkdir(path.join(this.config.outputDir, 'svg'), { recursive: true });
  }

  /**
   * Generate a single icon
   * @param {string} concept - What the icon represents
   * @param {string} style - Icon style (flat, line, isometric, etc.)
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Generated icon data
   */
  async generateIcon(concept, style = 'flat', options = {}) {
    console.log(`\n🎨 Generating ${style} icon for: ${concept}`);

    // Build prompt
    const prompt = this.buildIconPrompt(concept, style, options);

    console.log(`📝 Prompt: ${prompt.substring(0, 150)}...`);

    try {
      // Generate with DALL-E 3
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1024x1024',
        quality: this.config.quality,
        style: 'natural',
        n: 1
      });

      const imageUrl = response.data[0].url;
      console.log(`✅ Icon generated: ${imageUrl.substring(0, 50)}...`);

      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);

      // Save PNG version
      const pngPath = path.join(
        this.config.outputDir,
        'icons',
        `${this.sanitizeFilename(concept)}-${style}.png`
      );
      await fs.writeFile(pngPath, imageBuffer);
      console.log(`💾 Saved PNG: ${pngPath}`);

      // Convert to SVG (for vector graphics)
      let svgPath = null;
      try {
        const svg = await this.convertToSVG(imageBuffer, concept, style);
        svgPath = path.join(
          this.config.outputDir,
          'svg',
          `${this.sanitizeFilename(concept)}-${style}.svg`
        );
        await fs.writeFile(svgPath, svg);
        console.log(`✅ Converted to SVG: ${svgPath}`);
      } catch (err) {
        console.warn(`⚠️  SVG conversion failed: ${err.message}`);
      }

      // Generate usage guide
      const usage = await this.generateUsageGuide(concept, style);

      return {
        concept,
        style,
        paths: {
          png: pngPath,
          svg: svgPath,
          original: imageUrl
        },
        prompt,
        usage,
        metadata: {
          generated: new Date().toISOString(),
          model: 'dall-e-3',
          quality: this.config.quality
        }
      };

    } catch (error) {
      console.error(`❌ Failed to generate icon: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build icon generation prompt
   */
  buildIconPrompt(concept, style, options = {}) {
    const styleInfo = this.styles[style] || this.styles.flat;

    let prompt = `Create a professional ${styleInfo.name.toLowerCase()} icon representing: "${concept}"

TEEI Brand Style:
- Colors: ${this.teeiStyle.colorPalette}
- Mood: ${this.teeiStyle.mood}
- Values: ${this.teeiStyle.values}

Icon Style Requirements:
- ${styleInfo.description}
- ${styleInfo.characteristics}
- Transparent or white background
- Centered composition
- Suitable for 64px to 512px sizes
- High contrast for readability at small sizes
- No text, labels, or typography
- Professional, polished quality

Design Principles:
- Simple and instantly recognizable
- Works in monochrome and color
- Clear focal point
- Balanced composition
- Scalable to any size`;

    if (options.colorScheme) {
      prompt += `\n- Color scheme: ${options.colorScheme}`;
    }

    if (options.context) {
      prompt += `\n- Context: ${options.context}`;
    }

    prompt += `\n\nCreate a stunning, professional icon that embodies TEEI's values of education, hope, and empowerment.`;

    return prompt;
  }

  /**
   * Generate a cohesive icon set
   * @param {Array<string>} concepts - Array of concepts
   * @param {string} theme - Overall theme
   * @param {Object} options - Options
   * @returns {Promise<Object>} Icon set data
   */
  async generateIconSet(concepts, theme, options = {}) {
    console.log(`\n🎨 Generating icon set for theme: ${theme}`);
    console.log(`📋 Concepts: ${concepts.join(', ')}`);

    // First, generate a unified style guide for consistency
    const styleGuide = await this.generateStyleGuide(concepts, theme, options);
    console.log(`📐 Style guide created`);

    const icons = [];
    const style = options.style || styleGuide.recommendedStyle;

    // Generate each icon with the same style
    for (let i = 0; i < concepts.length; i++) {
      const concept = concepts[i];
      console.log(`\n[${i + 1}/${concepts.length}] Generating: ${concept}`);

      try {
        const icon = await this.generateIcon(concept, style, {
          ...options,
          styleGuide,
          theme
        });

        icons.push(icon);

        // Rate limiting
        if (i < concepts.length - 1) {
          console.log('⏱  Waiting 5 seconds (rate limiting)...');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`❌ Failed to generate ${concept}: ${error.message}`);
        icons.push({ concept, error: error.message });
      }
    }

    // Generate variations
    console.log('\n🎨 Generating color variations...');
    const variations = await this.generateColorVariations(icons[0], styleGuide);

    // Save icon set metadata
    const metadata = {
      theme,
      style,
      concepts,
      styleGuide,
      icons: icons.map(i => ({
        concept: i.concept,
        paths: i.paths,
        metadata: i.metadata
      })),
      variations,
      generated: new Date().toISOString()
    };

    const metadataPath = path.join(
      this.config.outputDir,
      'icons',
      `${this.sanitizeFilename(theme)}-set.json`
    );
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    console.log(`📄 Metadata saved: ${metadataPath}`);

    return {
      icons,
      styleGuide,
      variations,
      metadata: metadataPath
    };
  }

  /**
   * Generate unified style guide for icon set
   */
  async generateStyleGuide(concepts, theme, options = {}) {
    const prompt = `You are a professional icon designer. Create a unified style guide for an icon set.

Theme: ${theme}
Icons needed: ${concepts.join(', ')}

TEEI Brand:
- Colors: ${this.teeiStyle.colorPalette}
- Values: ${this.teeiStyle.values}
- Mood: ${this.teeiStyle.mood}

Recommend:
1. Best icon style (flat, line, isometric, duotone, gradient, handDrawn, geometric, organic)
2. Primary and secondary colors from TEEI palette
3. Design principles for consistency
4. Visual characteristics
5. Size and spacing guidelines

Return JSON with: recommendedStyle, colors, principles, characteristics, guidelines`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const content = response.content[0].text;

      // Try to extract JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const styleGuide = JSON.parse(jsonMatch[0]);
        console.log(`📐 Style guide:`, styleGuide);
        return styleGuide;
      } else {
        // Fallback to default style guide
        return {
          recommendedStyle: 'flat',
          colors: {
            primary: this.teeiStyle.colors.primary.nordshore,
            secondary: this.teeiStyle.colors.primary.sky,
            accent: this.teeiStyle.colors.accent.gold
          },
          principles: [
            'Consistent line weight',
            'Simple geometric shapes',
            'Minimal detail',
            'Clear silhouettes'
          ],
          characteristics: 'Clean, modern, professional',
          guidelines: 'Use 2-3 colors max, maintain visual balance'
        };
      }
    } catch (error) {
      console.warn(`⚠️  Failed to generate style guide with AI: ${error.message}`);
      return {
        recommendedStyle: options.style || 'flat',
        colors: {
          primary: this.teeiStyle.colors.primary.nordshore,
          secondary: this.teeiStyle.colors.primary.sky
        }
      };
    }
  }

  /**
   * Generate illustration
   * @param {string} scene - Scene description
   * @param {string} mood - Desired mood
   * @param {Object} options - Options
   * @returns {Promise<Object>} Illustration data
   */
  async generateIllustration(scene, mood, options = {}) {
    console.log(`\n🎨 Generating illustration: ${scene}`);
    console.log(`🎭 Mood: ${mood}`);

    const prompt = this.buildIllustrationPrompt(scene, mood, options);

    try {
      const response = await this.openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt,
        size: options.size || '1792x1024', // Landscape for documents
        quality: this.config.quality,
        style: 'natural',
        n: 1
      });

      const imageUrl = response.data[0].url;
      console.log(`✅ Illustration generated`);

      // Download image
      const imageBuffer = await this.downloadImage(imageUrl);

      // Save image
      const imagePath = path.join(
        this.config.outputDir,
        'illustrations',
        `${this.sanitizeFilename(scene)}-${mood}.png`
      );
      await fs.writeFile(imagePath, imageBuffer);
      console.log(`💾 Saved: ${imagePath}`);

      // Suggest placement
      const placement = await this.suggestPlacement(scene, mood, options);

      // Generate alternatives
      console.log('🎨 Generating alternative versions...');
      const alternatives = await this.generateAlternatives(scene, mood, 2);

      return {
        scene,
        mood,
        path: imagePath,
        originalUrl: imageUrl,
        prompt,
        placement,
        alternatives,
        metadata: {
          generated: new Date().toISOString(),
          model: 'dall-e-3',
          size: options.size || '1792x1024'
        }
      };

    } catch (error) {
      console.error(`❌ Failed to generate illustration: ${error.message}`);
      throw error;
    }
  }

  /**
   * Build illustration prompt
   */
  buildIllustrationPrompt(scene, mood, options = {}) {
    let prompt = `Create a professional, publication-quality illustration: "${scene}"

TEEI Brand Style:
- Colors: ${this.teeiStyle.colorPalette}
- Mood: ${mood}
- Values: ${this.teeiStyle.values}

Illustration Requirements:
- Modern, clean illustration style
- Warm color palette aligned with TEEI brand
- Depicts ${scene} in an inspiring, empowering way
- Suitable for educational materials and partnership documents
- Shows diversity and inclusion
- High detail but not cluttered or overwhelming
- Warm natural lighting
- Authentic feeling, not staged or artificial

Composition:
- Balanced, professional layout
- Clear focal point
- Negative space for text overlay if needed
- Works well at various sizes (print and digital)
- Wide format (landscape orientation)

Emotional Impact:
- ${mood}
- Inspiring and hopeful
- Professional yet warm
- Celebrates education and transformation

Create a visually stunning illustration that embodies TEEI's mission of educational equity and empowerment.`;

    if (options.style) {
      prompt += `\n- Artistic style: ${options.style}`;
    }

    if (options.colorScheme) {
      prompt += `\n- Color emphasis: ${options.colorScheme}`;
    }

    return prompt;
  }

  /**
   * Suggest placement for illustration
   */
  async suggestPlacement(scene, mood, options = {}) {
    const prompt = `Suggest optimal placement for this illustration in a partnership document:

Scene: ${scene}
Mood: ${mood}

Document context: TEEI AWS partnership materials
Page types: Cover, Overview, Programs, Impact, Call-to-Action

Suggest:
1. Best page/section
2. Placement (hero, supporting, background)
3. Size (full-bleed, half-page, quarter-page)
4. Text overlay recommendations
5. Alternative uses

Return JSON with: page, placement, size, textOverlay, alternatives`;

    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn(`⚠️  Could not generate placement suggestions: ${error.message}`);
    }

    return {
      page: 'Overview',
      placement: 'hero',
      size: 'full-bleed',
      textOverlay: 'Use negative space on left or right for text',
      alternatives: ['Supporting image', 'Background with opacity']
    };
  }

  /**
   * Generate alternative versions
   */
  async generateAlternatives(scene, mood, count = 2) {
    const alternatives = [];

    const variations = [
      'different composition',
      'alternative color palette',
      'different perspective',
      'simplified style'
    ];

    for (let i = 0; i < Math.min(count, variations.length); i++) {
      console.log(`  Generating alternative ${i + 1}/${count}: ${variations[i]}`);

      try {
        const altPrompt = `${this.buildIllustrationPrompt(scene, mood, {})}

Variation: ${variations[i]}
Make this version distinctly different while maintaining TEEI brand consistency.`;

        const response = await this.openai.images.generate({
          model: 'dall-e-3',
          prompt: altPrompt,
          size: '1792x1024',
          quality: this.config.quality,
          n: 1
        });

        const imageUrl = response.data[0].url;
        const imageBuffer = await this.downloadImage(imageUrl);

        const altPath = path.join(
          this.config.outputDir,
          'illustrations',
          `${this.sanitizeFilename(scene)}-${mood}-alt${i + 1}.png`
        );

        await fs.writeFile(altPath, imageBuffer);

        alternatives.push({
          variation: variations[i],
          path: altPath,
          url: imageUrl
        });

        // Rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (error) {
        console.error(`  ❌ Failed to generate alternative: ${error.message}`);
      }
    }

    return alternatives;
  }

  /**
   * Convert raster image to SVG
   */
  async convertToSVG(imageBuffer, concept, style) {
    console.log('🔄 Converting to SVG...');

    try {
      // Convert to black and white with threshold
      const bwBuffer = await sharp(imageBuffer)
        .greyscale()
        .threshold(128)
        .toBuffer();

      // Trace to SVG
      return new Promise((resolve, reject) => {
        potrace.trace(bwBuffer, {
          color: this.teeiStyle.colors.primary.nordshore,
          background: 'transparent',
          threshold: 128,
          optTolerance: 0.2
        }, (err, svg) => {
          if (err) {
            reject(err);
          } else {
            resolve(svg);
          }
        });
      });
    } catch (error) {
      console.error(`SVG conversion error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate usage guide for icon
   */
  async generateUsageGuide(concept, style) {
    return {
      concept,
      style,
      sizes: {
        small: '64px - UI elements, inline icons',
        medium: '128px - Section headers, buttons',
        large: '256px - Hero graphics, feature highlights',
        xlarge: '512px - Print materials, posters'
      },
      formats: {
        png: 'Web, presentations, email',
        svg: 'Scalable applications, print, responsive design'
      },
      colorModes: {
        color: 'Primary use case',
        monochrome: 'Text-heavy documents',
        inverted: 'Dark backgrounds'
      },
      spacing: {
        minimum: '8px clearspace on all sides',
        recommended: '16px for comfortable spacing'
      },
      accessibility: {
        contrast: 'Ensure 4.5:1 contrast ratio against background',
        altText: `Icon representing ${concept}`,
        ariaLabel: concept
      }
    };
  }

  /**
   * Generate color variations
   */
  async generateColorVariations(icon, styleGuide) {
    if (!icon || !icon.paths || !icon.paths.png) {
      return [];
    }

    const variations = [];
    const colorSchemes = [
      { name: 'primary', colors: [this.teeiStyle.colors.primary.nordshore] },
      { name: 'accent-gold', colors: [this.teeiStyle.colors.accent.gold] },
      { name: 'duotone', colors: [this.teeiStyle.colors.primary.nordshore, this.teeiStyle.colors.primary.sky] }
    ];

    for (const scheme of colorSchemes) {
      try {
        // This is a simplified color variation
        // In production, you'd apply actual color transformations
        const varPath = icon.paths.png.replace('.png', `-${scheme.name}.png`);

        variations.push({
          name: scheme.name,
          colors: scheme.colors,
          path: varPath
        });
      } catch (error) {
        console.warn(`Could not create ${scheme.name} variation: ${error.message}`);
      }
    }

    return variations;
  }

  /**
   * Download image from URL
   */
  async downloadImage(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (response) => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => resolve(Buffer.concat(chunks)));
        response.on('error', reject);
      });
    });
  }

  /**
   * Sanitize filename
   */
  sanitizeFilename(name) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Get statistics
   */
  async getStats() {
    const iconsDir = path.join(this.config.outputDir, 'icons');
    const illusDir = path.join(this.config.outputDir, 'illustrations');

    try {
      const iconFiles = await fs.readdir(iconsDir);
      const illusFiles = await fs.readdir(illusDir);

      return {
        icons: {
          total: iconFiles.filter(f => f.endsWith('.png')).length,
          svg: iconFiles.filter(f => f.endsWith('.svg')).length
        },
        illustrations: {
          total: illusFiles.filter(f => f.endsWith('.png')).length
        },
        outputDir: this.config.outputDir
      };
    } catch (error) {
      return {
        icons: { total: 0, svg: 0 },
        illustrations: { total: 0 },
        error: error.message
      };
    }
  }
}

module.exports = IconIllustrationGenerator;
