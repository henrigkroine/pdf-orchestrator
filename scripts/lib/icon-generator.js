/**
 * ICON GENERATOR
 * AI-powered custom icon generation using DALL-E 3
 *
 * Features:
 * - Generate custom icons from concepts
 * - TEEI brand-compliant styling
 * - Multiple style options (flat, minimal, line art)
 * - Batch generation
 * - Icon library management
 */

const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const axios = require('axios');

class IconGenerator {
  constructor(config = {}) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || config.openaiKey
    });

    // TEEI brand colors
    this.brandColors = {
      nordshore: '#00393F',
      sky: '#C9E4EC',
      sand: '#FFF1E2',
      beige: '#EFE1DC',
      moss: '#65873B',
      gold: '#BA8F5A',
      clay: '#913B2F'
    };

    // Icon styles
    this.styles = {
      flat: 'Flat design, simple geometric shapes, solid colors, no gradients',
      minimal: 'Minimal line art, clean strokes, monochromatic, no fill',
      modern: 'Modern flat design with subtle shadows, rounded corners',
      outlined: 'Outlined style, thin lines, no fill, icon font style',
      isometric: 'Isometric 3D style, flat colors, technical illustration'
    };

    // Icon sizes
    this.sizes = {
      small: 128,
      medium: 256,
      large: 512,
      xlarge: 1024
    };
  }

  /**
   * Generate custom icons for concepts
   */
  async generateCustomIcons(concepts, options = {}) {
    const {
      style = 'flat',
      colorScheme = 'warm',
      size = 'large',
      quantity = 1,
      background = 'transparent'
    } = options;

    console.log(`🎨 Generating ${concepts.length} custom icons...`);
    const icons = [];

    for (const concept of concepts) {
      console.log(`  📐 Generating icon for: ${concept}`);

      try {
        const iconData = await this.generateIcon(concept, {
          style,
          colorScheme,
          size,
          quantity,
          background
        });

        icons.push({
          concept,
          ...iconData,
          usage: this.generateIconUsage(concept),
          metadata: {
            generated: new Date().toISOString(),
            style,
            colorScheme,
            size
          }
        });

        console.log(`  ✅ Generated: ${concept}`);

      } catch (error) {
        console.error(`  ❌ Failed to generate icon for ${concept}:`, error.message);
        icons.push({
          concept,
          error: error.message,
          fallback: await this.getFallbackIcon(concept)
        });
      }
    }

    console.log(`✅ Icon generation complete: ${icons.length} icons`);
    return icons;
  }

  /**
   * Generate single icon with DALL-E 3
   */
  async generateIcon(concept, options) {
    const {
      style = 'flat',
      colorScheme = 'warm',
      background = 'transparent'
    } = options;

    // Build detailed prompt for DALL-E 3
    const prompt = this.buildIconPrompt(concept, style, colorScheme, background);

    // Generate with DALL-E 3
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'hd',
      n: 1,
      style: 'natural' // More realistic/professional than 'vivid'
    });

    const imageUrl = response.data[0].url;

    // Download and process icon
    const processedIcon = await this.downloadAndProcessIcon(imageUrl, options);

    return {
      url: imageUrl,
      processed: processedIcon,
      prompt: prompt,
      revisedPrompt: response.data[0].revised_prompt
    };
  }

  /**
   * Build DALL-E prompt for icon generation
   */
  buildIconPrompt(concept, style, colorScheme, background) {
    const styleDescription = this.styles[style] || this.styles.flat;

    // Color palette based on scheme
    const colorPalettes = {
      warm: `warm color palette using ${this.brandColors.nordshore}, ${this.brandColors.gold}, ${this.brandColors.sand}`,
      cool: `cool color palette using ${this.brandColors.nordshore}, ${this.brandColors.sky}, ${this.brandColors.beige}`,
      natural: `natural color palette using ${this.brandColors.moss}, ${this.brandColors.beige}, ${this.brandColors.gold}`,
      monochrome: `monochrome using ${this.brandColors.nordshore}`
    };

    const colorDescription = colorPalettes[colorScheme] || colorPalettes.warm;

    return `Professional icon for "${concept}":

STYLE: ${styleDescription}
COLORS: ${colorDescription}
BACKGROUND: ${background} background
SIZE: Perfectly centered in 1024x1024 square
QUALITY: Publication-ready, vector-style clarity

REQUIREMENTS:
- Simple and recognizable
- Works at small sizes
- No text or labels
- Clean geometric shapes
- Suitable for business/education documents
- Professional and modern
- ${background === 'transparent' ? 'No background elements' : 'Subtle background'}

BRAND ALIGNMENT:
- Empowering and hopeful
- Clean and trustworthy
- Educational context
- International/inclusive`;
  }

  /**
   * Download and process generated icon
   */
  async downloadAndProcessIcon(url, options) {
    const { size = 'large', background = 'transparent' } = options;

    // Download image
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Process with Sharp
    let pipeline = sharp(buffer);

    // Resize if needed
    const targetSize = this.sizes[size] || this.sizes.large;
    pipeline = pipeline.resize(targetSize, targetSize, {
      fit: 'contain',
      background: background === 'transparent' ?
        { r: 0, g: 0, b: 0, alpha: 0 } :
        { r: 255, g: 255, b: 255, alpha: 1 }
    });

    // Convert to PNG with transparency
    pipeline = pipeline.png({
      quality: 100,
      compressionLevel: 9
    });

    const processedBuffer = await pipeline.toBuffer();

    return {
      buffer: processedBuffer,
      size: targetSize,
      format: 'png'
    };
  }

  /**
   * Generate icon usage suggestions
   */
  generateIconUsage(concept) {
    return {
      suggested_contexts: [
        'Section headers',
        'Data visualization callouts',
        'Feature highlights',
        'Process diagrams',
        'Infographic elements'
      ],
      size_guidelines: {
        document: '32-48px',
        presentation: '64-128px',
        web: '24-32px',
        print: '300 DPI at desired physical size'
      },
      color_variations: [
        'Use in brand colors',
        'Monochrome for backgrounds',
        'White for dark backgrounds',
        'Colored for emphasis'
      ]
    };
  }

  /**
   * Get fallback icon (simple SVG)
   */
  async getFallbackIcon(concept) {
    // Generate simple SVG icon as fallback
    const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="${this.brandColors.sand}"/>
  <circle cx="256" cy="256" r="150" fill="${this.brandColors.nordshore}" opacity="0.1"/>
  <text x="256" y="280" font-size="48" text-anchor="middle" fill="${this.brandColors.nordshore}" font-family="Roboto Flex, sans-serif" font-weight="600">
    ${concept.slice(0, 20)}
  </text>
</svg>`;

    return {
      type: 'svg',
      content: svg,
      note: 'Fallback icon - consider manual design'
    };
  }

  /**
   * Batch generate icon set
   */
  async generateIconSet(iconSet, options = {}) {
    console.log(`🎨 Generating icon set: ${iconSet.name}`);
    console.log(`   Concepts: ${iconSet.concepts.join(', ')}`);

    const icons = await this.generateCustomIcons(iconSet.concepts, options);

    // Save icon set
    const outputDir = path.join(process.cwd(), 'assets', 'generated-icons', iconSet.name);
    await fs.mkdir(outputDir, { recursive: true });

    for (const icon of icons) {
      if (icon.processed) {
        const filename = `${this.slugify(icon.concept)}.png`;
        const filepath = path.join(outputDir, filename);

        await fs.writeFile(filepath, icon.processed.buffer);
        icon.filepath = filepath;
      }
    }

    // Save manifest
    const manifest = {
      name: iconSet.name,
      description: iconSet.description,
      generated: new Date().toISOString(),
      icons: icons.map(icon => ({
        concept: icon.concept,
        filename: icon.processed ? `${this.slugify(icon.concept)}.png` : null,
        usage: icon.usage,
        metadata: icon.metadata
      }))
    };

    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`✅ Icon set saved to: ${outputDir}`);
    return { icons, manifest, outputDir };
  }

  /**
   * Create icon library with variations
   */
  async createIconLibrary(concepts, variations = ['flat', 'outlined']) {
    console.log(`📚 Creating icon library with ${variations.length} style variations...`);

    const library = {
      name: 'Custom Icon Library',
      generated: new Date().toISOString(),
      variations: []
    };

    for (const variation of variations) {
      console.log(`\n🎨 Generating ${variation} variation...`);

      const icons = await this.generateCustomIcons(concepts, {
        style: variation,
        colorScheme: 'warm',
        size: 'large'
      });

      library.variations.push({
        style: variation,
        icons
      });
    }

    return library;
  }

  /**
   * Generate icon from SVG template
   */
  generateSVGIcon(concept, options = {}) {
    const {
      color = this.brandColors.nordshore,
      size = 512,
      style = 'flat'
    } = options;

    // Simple geometric icon generation
    const templates = {
      education: this.generateEducationIcon(color, size),
      cloud: this.generateCloudIcon(color, size),
      data: this.generateDataIcon(color, size),
      people: this.generatePeopleIcon(color, size),
      growth: this.generateGrowthIcon(color, size)
    };

    return templates[concept.toLowerCase()] || this.generateGenericIcon(concept, color, size);
  }

  generateEducationIcon(color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M50 20 L10 35 L50 50 L90 35 Z" fill="${color}"/>
  <path d="M10 35 L10 60 L50 75 L90 60 L90 35" stroke="${color}" stroke-width="4" fill="none"/>
  <circle cx="50" cy="50" r="5" fill="${color}"/>
</svg>`;
  }

  generateCloudIcon(color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path d="M30 60 Q20 60 20 50 Q20 40 30 40 Q30 30 40 25 Q50 20 60 25 Q70 30 70 40 Q80 40 80 50 Q80 60 70 60 Z" fill="${color}"/>
</svg>`;
  }

  generateDataIcon(color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="20" y="60" width="15" height="30" fill="${color}"/>
  <rect x="42.5" y="40" width="15" height="50" fill="${color}"/>
  <rect x="65" y="25" width="15" height="65" fill="${color}"/>
</svg>`;
  }

  generatePeopleIcon(color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="35" cy="30" r="10" fill="${color}"/>
  <path d="M35 45 L25 70 L45 70 Z" fill="${color}"/>
  <circle cx="65" cy="30" r="10" fill="${color}"/>
  <path d="M65 45 L55 70 L75 70 Z" fill="${color}"/>
</svg>`;
  }

  generateGrowthIcon(color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <polyline points="20,80 35,60 50,65 65,40 80,20" stroke="${color}" stroke-width="4" fill="none"/>
  <polygon points="65,20 80,20 80,35" fill="${color}"/>
</svg>`;
  }

  generateGenericIcon(concept, color, size) {
    return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="30" fill="${color}" opacity="0.2"/>
  <text x="50" y="60" font-size="14" text-anchor="middle" fill="${color}" font-family="sans-serif">
    ${concept.slice(0, 8)}
  </text>
</svg>`;
  }

  /**
   * Utility: slugify concept name
   */
  slugify(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Save icon to file
   */
  async saveIcon(iconData, filename, format = 'png') {
    const outputDir = path.join(process.cwd(), 'assets', 'generated-icons');
    await fs.mkdir(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, `${filename}.${format}`);

    if (format === 'png' && iconData.processed) {
      await fs.writeFile(outputPath, iconData.processed.buffer);
    } else if (format === 'svg' && iconData.svg) {
      await fs.writeFile(outputPath, iconData.svg);
    }

    console.log(`✅ Icon saved: ${outputPath}`);
    return outputPath;
  }

  /**
   * Generate icon set for common TEEI concepts
   */
  async generateTEEIIconSet() {
    const teeiConcepts = {
      name: 'TEEI-Education-Icons',
      description: 'Custom icons for TEEI educational materials',
      concepts: [
        'online learning',
        'cloud education',
        'student success',
        'teacher training',
        'digital classroom',
        'collaboration',
        'certification',
        'global reach',
        'data analytics',
        'innovation',
        'accessibility',
        'community'
      ]
    };

    return await this.generateIconSet(teeiConcepts, {
      style: 'flat',
      colorScheme: 'warm',
      size: 'large'
    });
  }
}

module.exports = IconGenerator;
