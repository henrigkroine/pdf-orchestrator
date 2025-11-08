/**
 * Template Generator - Intelligent InDesign Template Creation System
 *
 * Generates professional InDesign templates programmatically from specifications.
 * Implements TEEI brand guidelines and world-class nonprofit design patterns.
 *
 * Features:
 * - Multiple grid systems (manuscript, column, modular, hierarchical)
 * - TEEI brand compliance (colors, fonts, spacing)
 * - Reusable component system
 * - Master page generation
 * - Multiple document types (partnership, program, report)
 *
 * Usage:
 *   const generator = new TemplateGenerator();
 *   await generator.generateTemplate('partnership-brochure', spec);
 */

const fs = require('fs').promises;
const path = require('path');

// TEEI Brand Guidelines Constants
const TEEI_BRAND = {
  colors: {
    nordshore: { hex: '#00393F', rgb: [0, 57, 63], cmyk: [100, 10, 0, 75] },
    sky: { hex: '#C9E4EC', rgb: [201, 228, 236], cmyk: [15, 3, 0, 7] },
    sand: { hex: '#FFF1E2', rgb: [255, 241, 226], cmyk: [0, 6, 11, 0] },
    beige: { hex: '#EFE1DC', rgb: [239, 225, 220], cmyk: [0, 6, 8, 6] },
    gold: { hex: '#BA8F5A', rgb: [186, 143, 90], cmyk: [0, 23, 52, 27] },
    moss: { hex: '#65873B', rgb: [101, 135, 59], cmyk: [25, 0, 56, 47] },
    clay: { hex: '#913B2F', rgb: [145, 59, 47], cmyk: [0, 59, 68, 43] }
  },
  fonts: {
    headline: { family: 'Lora', weights: ['Regular', 'Medium', 'SemiBold', 'Bold'] },
    body: { family: 'Roboto Flex', weights: ['Regular', 'Medium', 'Bold'] }
  },
  typography: {
    documentTitle: { font: 'Lora', weight: 'Bold', size: 42, color: 'nordshore', leading: 1.1 },
    sectionHeader: { font: 'Lora', weight: 'SemiBold', size: 28, color: 'nordshore', leading: 1.2 },
    subsectionHeader: { font: 'Roboto Flex', weight: 'Medium', size: 18, color: 'nordshore', leading: 1.3 },
    bodyText: { font: 'Roboto Flex', weight: 'Regular', size: 11, color: 'black', leading: 1.5 },
    caption: { font: 'Roboto Flex', weight: 'Regular', size: 9, color: '#666666', leading: 1.4 },
    pullQuote: { font: 'Lora', weight: 'Italic', size: 18, color: 'nordshore', leading: 1.3 },
    statNumber: { font: 'Lora', weight: 'Bold', size: 48, color: 'gold', leading: 1.0 },
    buttonText: { font: 'Roboto Flex', weight: 'Bold', size: 18, color: 'white', leading: 1.0 }
  },
  layout: {
    pageSize: { width: 8.5, height: 11, unit: 'inches' }, // US Letter
    margins: { top: 40, bottom: 40, left: 40, right: 40, unit: 'pt' },
    columns: { count: 12, gutter: 20, unit: 'pt' },
    baseline: { increment: 16.5, unit: 'pt' },
    spacing: {
      sectionBreak: 60,
      elementGap: 20,
      paragraphGap: 12,
      unit: 'pt'
    }
  }
};

// Grid System Definitions
const GRID_SYSTEMS = {
  manuscript: {
    name: 'Manuscript Grid',
    description: 'Single text column, ideal for text-heavy content',
    columns: 1,
    textWidth: '70%',
    bestFor: ['executive letters', 'mission statements', 'detailed descriptions']
  },
  twoColumn: {
    name: 'Two-Column Grid',
    description: 'Standard two-column layout',
    columns: 2,
    variations: ['50/50', '60/40', '70/30'],
    bestFor: ['standard content', 'text + image', 'side-by-side comparisons']
  },
  threeColumn: {
    name: 'Three-Column Grid',
    description: 'Magazine-style layout',
    columns: 3,
    variations: ['equal', 'sidebar'],
    bestFor: ['multi-topic pages', 'flowing text', 'varied content density']
  },
  modular: {
    name: 'Modular Grid',
    description: 'Grid with rows and columns for data visualization',
    structure: '4x6',
    bestFor: ['statistics', 'infographics', 'comparison charts', 'metric displays']
  },
  hierarchical: {
    name: 'Hierarchical Grid',
    description: 'Size-based visual importance',
    bestFor: ['covers', 'hero sections', 'modern layouts', 'attention-grabbing designs']
  }
};

// Layout Pattern Library
const LAYOUT_PATTERNS = {
  coverHero: {
    name: 'Cover Page (Hero Design)',
    structure: {
      heroImage: { position: 'fullBleed', overlay: 0.4 },
      title: { position: 'center', style: 'documentTitle', color: 'white' },
      subtitle: { position: 'belowTitle', style: 'subsectionHeader', color: 'white' },
      logo: { position: 'topLeft', size: 80, clearspace: 40 }
    },
    visualDensity: 'high'
  },
  twoColumnSplit: {
    name: 'Two-Column Split (Text + Image)',
    structure: {
      leftColumn: { width: '60%', type: 'text' },
      rightColumn: { width: '40%', type: 'image' },
      gutter: 20
    },
    visualDensity: 'medium'
  },
  statsModular: {
    name: 'Stats/Metrics Page (Modular Grid)',
    structure: {
      grid: '2x2',
      module: {
        icon: { size: 80, position: 'top' },
        number: { style: 'statNumber', position: 'middle' },
        label: { style: 'bodyText', position: 'bottom' }
      },
      spacing: 60
    },
    visualDensity: 'high'
  },
  ctaPage: {
    name: 'Call-to-Action Page',
    structure: {
      headline: { style: 'sectionHeader', position: 'top' },
      supportingText: { style: 'bodyText', width: '60%', position: 'middle' },
      button: { height: 50, width: 200, style: 'buttonText', position: 'center' },
      whitespace: '70%'
    },
    visualDensity: 'low'
  }
};

// Component Library
const COMPONENTS = {
  pullQuote: {
    name: 'Pull Quote',
    variants: ['floating', 'sidebar', 'fullWidth', 'overlapping'],
    defaultStyle: {
      background: { color: 'sky', opacity: 0.2 },
      padding: 20,
      textStyle: 'pullQuote',
      border: { width: 0, style: 'none' }
    }
  },
  statCard: {
    name: 'Statistic Card',
    structure: {
      icon: { size: 60, color: 'nordshore' },
      number: { style: 'statNumber', color: 'gold' },
      label: { style: 'caption', color: '#666666' },
      background: { color: 'sand', opacity: 1 }
    }
  },
  sectionHeader: {
    name: 'Section Header',
    defaultStyle: {
      textStyle: 'sectionHeader',
      underline: { color: 'sky', width: 5, offset: 10 },
      spaceBefore: 60,
      spaceAfter: 24
    }
  },
  imageFrame: {
    name: 'Image Frame',
    variants: ['rectangular', 'circular', 'diagonal', 'overlapping'],
    defaultStyle: {
      border: { width: 0, color: 'white' },
      padding: 0,
      fitting: 'proportional'
    }
  },
  footer: {
    name: 'Running Footer',
    structure: {
      logo: { size: 40, position: 'left' },
      pageNumber: { style: 'caption', position: 'center' },
      tagline: { style: 'caption', position: 'right' },
      separator: { width: 1, color: 'nordshore' }
    }
  }
};

// Document Type Templates
const DOCUMENT_TYPES = {
  partnershipBrochure: {
    name: 'Partnership Brochure',
    pageCount: 8,
    pages: [
      { pattern: 'coverHero', grid: 'hierarchical' },
      { pattern: 'twoColumnSplit', grid: 'twoColumn' },
      { pattern: 'twoColumnSplit', grid: 'twoColumn' },
      { pattern: 'statsModular', grid: 'modular' },
      { pattern: 'threeColumn', grid: 'threeColumn' },
      { pattern: 'fullWidthPhoto', grid: 'hierarchical' },
      { pattern: 'diagonalSplit', grid: 'twoColumn' },
      { pattern: 'ctaPage', grid: 'manuscript' }
    ],
    components: ['pullQuote', 'statCard', 'sectionHeader', 'footer']
  },
  programOverview: {
    name: 'Program Overview',
    pageCount: 4,
    pages: [
      { pattern: 'coverHero', grid: 'hierarchical' },
      { pattern: 'twoColumnSplit', grid: 'twoColumn' },
      { pattern: 'statsModular', grid: 'modular' },
      { pattern: 'ctaPage', grid: 'manuscript' }
    ],
    components: ['pullQuote', 'statCard', 'footer']
  },
  annualReport: {
    name: 'Annual Report',
    pageCount: 12,
    pages: [
      { pattern: 'coverHero', grid: 'hierarchical' },
      { pattern: 'executiveLetter', grid: 'manuscript' },
      { pattern: 'twoColumnSplit', grid: 'twoColumn' },
      { pattern: 'statsModular', grid: 'modular' },
      { pattern: 'threeColumn', grid: 'threeColumn' },
      { pattern: 'fullWidthPhoto', grid: 'hierarchical' },
      { pattern: 'twoColumnSplit', grid: 'twoColumn' },
      { pattern: 'statsModular', grid: 'modular' },
      { pattern: 'timeline', grid: 'hierarchical' },
      { pattern: 'beforeAfter', grid: 'twoColumn' },
      { pattern: 'infographic', grid: 'modular' },
      { pattern: 'ctaPage', grid: 'manuscript' }
    ],
    components: ['pullQuote', 'statCard', 'sectionHeader', 'footer', 'timeline']
  }
};

class TemplateGenerator {
  constructor(config = {}) {
    this.brand = TEEI_BRAND;
    this.gridSystems = GRID_SYSTEMS;
    this.layoutPatterns = LAYOUT_PATTERNS;
    this.components = COMPONENTS;
    this.documentTypes = DOCUMENT_TYPES;
    this.outputDir = config.outputDir || './templates/generated';
    this.mcpEnabled = config.mcpEnabled !== false;

    console.log('[TemplateGenerator] Initialized with TEEI brand guidelines');
  }

  /**
   * Generate a complete template specification
   * @param {string} documentType - Type of document (e.g., 'partnershipBrochure')
   * @param {object} customization - Custom overrides
   * @returns {object} Complete template specification
   */
  generateTemplateSpec(documentType, customization = {}) {
    const docType = this.documentTypes[documentType];

    if (!docType) {
      throw new Error(`Unknown document type: ${documentType}. Available: ${Object.keys(this.documentTypes).join(', ')}`);
    }

    const spec = {
      metadata: {
        name: docType.name,
        documentType,
        version: '1.0',
        generated: new Date().toISOString(),
        brand: 'TEEI'
      },
      document: {
        size: this.brand.layout.pageSize,
        margins: this.brand.layout.margins,
        columns: this.brand.layout.columns,
        baseline: this.brand.layout.baseline,
        colorMode: customization.colorMode || 'RGB',
        pageCount: docType.pageCount
      },
      masterPages: this.generateMasterPages(docType),
      pages: this.generatePageSpecs(docType),
      styles: this.generateStyles(),
      colors: this.generateColorSwatches(),
      components: this.generateComponentSpecs(docType.components),
      ...customization
    };

    return spec;
  }

  /**
   * Generate master page specifications
   */
  generateMasterPages(docType) {
    return {
      default: {
        name: 'A-Master',
        basedOn: null,
        margins: this.brand.layout.margins,
        columns: this.brand.layout.columns,
        elements: [
          {
            type: 'footer',
            component: 'footer',
            position: { x: 40, y: 720 }, // Bottom of page (11" = 792pt, minus margin)
            locked: true
          }
        ]
      },
      cover: {
        name: 'B-Cover',
        basedOn: null,
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
        columns: { count: 1, gutter: 0 },
        elements: [] // No recurring elements on cover
      }
    };
  }

  /**
   * Generate page-by-page specifications
   */
  generatePageSpecs(docType) {
    return docType.pages.map((pageConfig, index) => {
      const pattern = this.layoutPatterns[pageConfig.pattern];
      const grid = this.gridSystems[pageConfig.grid];

      return {
        pageNumber: index + 1,
        masterPage: index === 0 ? 'cover' : 'default',
        pattern: pageConfig.pattern,
        grid: pageConfig.grid,
        structure: pattern ? pattern.structure : {},
        visualDensity: pattern ? pattern.visualDensity : 'medium',
        background: this.generateBackgroundSpec(index, docType.pageCount),
        layout: this.generatePageLayout(grid, pattern)
      };
    });
  }

  /**
   * Generate background specification with color rhythm
   */
  generateBackgroundSpec(pageIndex, totalPages) {
    // Implement color progression strategy from design analysis
    const rhythmPattern = ['white', 'sky30', 'white', 'sand', 'white', 'nordshore', 'white', 'white'];
    const pattern = rhythmPattern[pageIndex % rhythmPattern.length];

    const backgrounds = {
      white: { color: '#FFFFFF', opacity: 1 },
      sky30: { color: this.brand.colors.sky.hex, opacity: 0.3 },
      sand: { color: this.brand.colors.sand.hex, opacity: 1 },
      nordshore: { color: this.brand.colors.nordshore.hex, opacity: 1 }
    };

    return backgrounds[pattern] || backgrounds.white;
  }

  /**
   * Generate page layout based on grid system
   */
  generatePageLayout(grid, pattern) {
    if (!grid) return {};

    const layout = {
      gridType: grid.name,
      columns: grid.columns || 1,
      gutter: this.brand.layout.columns.gutter
    };

    if (grid.variations) {
      layout.variations = grid.variations;
    }

    if (grid.structure) {
      layout.structure = grid.structure;
    }

    return layout;
  }

  /**
   * Generate paragraph and character styles
   */
  generateStyles() {
    const paragraphStyles = {};
    const characterStyles = {};

    // Generate paragraph styles from typography system
    Object.entries(this.brand.typography).forEach(([key, config]) => {
      const styleName = this.camelToTitleCase(key);

      paragraphStyles[styleName] = {
        name: styleName,
        basedOn: key === 'bodyText' ? 'No Paragraph Style' : 'Basic Paragraph',
        fontFamily: config.font,
        fontStyle: config.weight,
        fontSize: config.size,
        leading: config.size * config.leading,
        color: this.resolveColor(config.color),
        alignment: key.includes('Header') || key.includes('Title') ? 'left' : 'left',
        spaceBefore: key.includes('Header') ? 60 : 0,
        spaceAfter: key.includes('Header') ? 24 : 12,
        hyphenation: key === 'bodyText'
      };
    });

    return { paragraph: paragraphStyles, character: characterStyles };
  }

  /**
   * Generate color swatches for InDesign
   */
  generateColorSwatches() {
    const swatches = [];

    Object.entries(this.brand.colors).forEach(([name, color]) => {
      swatches.push({
        name: this.capitalize(name),
        colorModel: 'RGB',
        colorValue: color.rgb,
        colorSpace: 'sRGB'
      });

      swatches.push({
        name: `${this.capitalize(name)} CMYK`,
        colorModel: 'CMYK',
        colorValue: color.cmyk,
        colorSpace: 'FOGRA39'
      });
    });

    return swatches;
  }

  /**
   * Generate component specifications
   */
  generateComponentSpecs(componentList) {
    const specs = {};

    componentList.forEach(componentName => {
      const component = this.components[componentName];

      if (component) {
        specs[componentName] = {
          ...component,
          id: `component-${componentName}`,
          brand: 'TEEI'
        };
      }
    });

    return specs;
  }

  /**
   * Generate InDesign script (ExtendScript) to create template
   */
  generateInDesignScript(spec) {
    const script = `
// Auto-generated InDesign Template Script
// Template: ${spec.metadata.name}
// Generated: ${spec.metadata.generated}
// Brand: TEEI

#target indesign

function createTemplate() {
  var doc, page, textFrame, rect;

  // Create new document
  var docPreset = app.documentPresets.add();
  docPreset.pageWidth = "${spec.document.size.width}${spec.document.size.unit}";
  docPreset.pageHeight = "${spec.document.size.height}${spec.document.size.unit}";
  docPreset.facingPages = false;
  docPreset.pagesPerDocument = ${spec.document.pageCount};

  doc = app.documents.add(docPreset);

  // Set margins
  doc.marginPreferences.top = "${spec.document.margins.top}${spec.document.margins.unit}";
  doc.marginPreferences.bottom = "${spec.document.margins.bottom}${spec.document.margins.unit}";
  doc.marginPreferences.left = "${spec.document.margins.left}${spec.document.margins.unit}";
  doc.marginPreferences.right = "${spec.document.margins.right}${spec.document.margins.unit}";

  // Set baseline grid
  doc.gridPreferences.baselineStart = "${spec.document.baseline.increment}${spec.document.baseline.unit}";
  doc.gridPreferences.baselineDivision = "${spec.document.baseline.increment}${spec.document.baseline.unit}";

  // Create color swatches
  ${this.generateColorSwatchScript(spec.colors)}

  // Create paragraph styles
  ${this.generateParagraphStyleScript(spec.styles.paragraph)}

  // Create master pages
  ${this.generateMasterPageScript(spec.masterPages)}

  // Apply master pages to document pages
  ${this.generatePageApplicationScript(spec.pages)}

  alert("Template '${spec.metadata.name}' created successfully!");
  return doc;
}

// Execute
createTemplate();
`;

    return script;
  }

  /**
   * Generate color swatch creation script
   */
  generateColorSwatchScript(swatches) {
    return swatches.map(swatch => {
      if (swatch.colorModel === 'RGB') {
        return `
  var color${swatch.name.replace(/\s+/g, '')} = doc.colors.add();
  color${swatch.name.replace(/\s+/g, '')}.name = "${swatch.name}";
  color${swatch.name.replace(/\s+/g, '')}.model = ColorModel.PROCESS;
  color${swatch.name.replace(/\s+/g, '')}.space = ColorSpace.RGB;
  color${swatch.name.replace(/\s+/g, '')}.colorValue = [${swatch.colorValue.join(', ')}];`;
      }
      return '';
    }).join('\n');
  }

  /**
   * Generate paragraph style creation script
   */
  generateParagraphStyleScript(styles) {
    return Object.values(styles).map(style => `
  var style${style.name.replace(/\s+/g, '')} = doc.paragraphStyles.add();
  style${style.name.replace(/\s+/g, '')}.name = "${style.name}";
  style${style.name.replace(/\s+/g, '')}.appliedFont = "${style.fontFamily}";
  style${style.name.replace(/\s+/g, '')}.fontStyle = "${style.fontStyle}";
  style${style.name.replace(/\s+/g, '')}.pointSize = ${style.fontSize};
  style${style.name.replace(/\s+/g, '')}.leading = ${style.leading};
  style${style.name.replace(/\s+/g, '')}.spaceBefore = ${style.spaceBefore};
  style${style.name.replace(/\s+/g, '')}.spaceAfter = ${style.spaceAfter};`).join('\n');
  }

  /**
   * Generate master page creation script
   */
  generateMasterPageScript(masterPages) {
    return Object.entries(masterPages).map(([key, master]) => `
  var master${this.capitalize(key)} = doc.masterSpreads.add();
  master${this.capitalize(key)}.namePrefix = "${master.name}";`).join('\n');
  }

  /**
   * Generate page application script
   */
  generatePageApplicationScript(pages) {
    return pages.map((page, index) => `
  doc.pages[${index}].appliedMaster = doc.masterSpreads.itemByName("${page.masterPage === 'cover' ? 'B-Cover' : 'A-Master'}");`).join('\n');
  }

  /**
   * Generate MCP-compatible template creation payload
   */
  generateMCPPayload(spec) {
    return {
      action: 'create_template',
      template: {
        name: spec.metadata.name,
        documentType: spec.metadata.documentType,
        document: spec.document,
        masterPages: spec.masterPages,
        pages: spec.pages,
        styles: spec.styles,
        colors: spec.colors,
        components: spec.components
      }
    };
  }

  /**
   * Save template specification to JSON
   */
  async saveTemplateSpec(spec, filename) {
    await fs.mkdir(this.outputDir, { recursive: true });
    const filepath = path.join(this.outputDir, `${filename}.json`);
    await fs.writeFile(filepath, JSON.stringify(spec, null, 2));
    console.log(`[TemplateGenerator] Template spec saved: ${filepath}`);
    return filepath;
  }

  /**
   * Save InDesign script to .jsx file
   */
  async saveInDesignScript(spec, filename) {
    const script = this.generateInDesignScript(spec);
    await fs.mkdir(this.outputDir, { recursive: true });
    const filepath = path.join(this.outputDir, `${filename}.jsx`);
    await fs.writeFile(filepath, script);
    console.log(`[TemplateGenerator] InDesign script saved: ${filepath}`);
    return filepath;
  }

  /**
   * Generate complete template package
   */
  async generateTemplate(documentType, options = {}) {
    console.log(`[TemplateGenerator] Generating template: ${documentType}`);

    // Generate specification
    const spec = this.generateTemplateSpec(documentType, options.customization);

    // Save outputs
    const outputs = {
      spec: null,
      script: null,
      mcpPayload: null
    };

    const filename = options.filename || `${documentType}-${Date.now()}`;

    // Save template spec
    outputs.spec = await this.saveTemplateSpec(spec, filename);

    // Save InDesign script
    if (options.generateScript !== false) {
      outputs.script = await this.saveInDesignScript(spec, filename);
    }

    // Generate MCP payload
    if (this.mcpEnabled && options.generateMCP !== false) {
      const mcpPayload = this.generateMCPPayload(spec);
      const mcpPath = path.join(this.outputDir, `${filename}-mcp.json`);
      await fs.writeFile(mcpPath, JSON.stringify(mcpPayload, null, 2));
      outputs.mcpPayload = mcpPath;
      console.log(`[TemplateGenerator] MCP payload saved: ${mcpPath}`);
    }

    console.log(`[TemplateGenerator] Template generation complete`);
    return outputs;
  }

  /**
   * List available document types
   */
  listDocumentTypes() {
    return Object.entries(this.documentTypes).map(([key, value]) => ({
      id: key,
      name: value.name,
      pageCount: value.pageCount,
      components: value.components
    }));
  }

  /**
   * List available layout patterns
   */
  listLayoutPatterns() {
    return Object.entries(this.layoutPatterns).map(([key, value]) => ({
      id: key,
      name: value.name,
      visualDensity: value.visualDensity
    }));
  }

  /**
   * List available components
   */
  listComponents() {
    return Object.entries(this.components).map(([key, value]) => ({
      id: key,
      name: value.name,
      variants: value.variants || []
    }));
  }

  // Utility functions

  camelToTitleCase(str) {
    return str.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  resolveColor(color) {
    if (color.startsWith('#')) return color;
    if (this.brand.colors[color]) return this.brand.colors[color].hex;
    return color;
  }
}

// CLI interface
if (require.main === module) {
  const generator = new TemplateGenerator();

  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'list') {
    console.log('\nAvailable Document Types:');
    generator.listDocumentTypes().forEach(type => {
      console.log(`  ${type.id}: ${type.name} (${type.pageCount} pages)`);
    });

    console.log('\nAvailable Layout Patterns:');
    generator.listLayoutPatterns().forEach(pattern => {
      console.log(`  ${pattern.id}: ${pattern.name} [${pattern.visualDensity}]`);
    });

    console.log('\nAvailable Components:');
    generator.listComponents().forEach(component => {
      console.log(`  ${component.id}: ${component.name}`);
    });

  } else if (command === 'generate') {
    const documentType = args[1];
    const filename = args[2] || documentType;

    if (!documentType) {
      console.error('Usage: node template-generator.js generate <documentType> [filename]');
      console.error('Example: node template-generator.js generate partnershipBrochure my-template');
      process.exit(1);
    }

    generator.generateTemplate(documentType, { filename })
      .then(outputs => {
        console.log('\nGeneration complete:');
        console.log(`  Spec: ${outputs.spec}`);
        console.log(`  Script: ${outputs.script}`);
        console.log(`  MCP: ${outputs.mcpPayload}`);
      })
      .catch(error => {
        console.error('Generation failed:', error.message);
        process.exit(1);
      });

  } else {
    console.log('PDF Orchestrator - Template Generator');
    console.log('');
    console.log('Usage:');
    console.log('  node template-generator.js list                          - List available types');
    console.log('  node template-generator.js generate <type> [filename]    - Generate template');
    console.log('');
    console.log('Examples:');
    console.log('  node template-generator.js list');
    console.log('  node template-generator.js generate partnershipBrochure');
    console.log('  node template-generator.js generate annualReport my-annual-report');
  }
}

module.exports = TemplateGenerator;
