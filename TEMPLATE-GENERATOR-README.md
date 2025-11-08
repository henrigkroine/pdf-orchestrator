# Template Generator - Intelligent InDesign Template Creation

## Overview

The Template Generator is an intelligent system that creates professional InDesign templates programmatically from specifications. It implements TEEI brand guidelines and world-class nonprofit design patterns automatically.

**Purpose**: Enable Claude Code to generate any document type with world-class design without needing pre-built InDesign files.

---

## Features

### 1. Multiple Grid Systems
- **Manuscript Grid**: Single text column for text-heavy content
- **Two-Column Grid**: Standard layouts with 50/50, 60/40, or 70/30 splits
- **Three-Column Grid**: Magazine-style layouts
- **Modular Grid**: Rows and columns for data visualization
- **Hierarchical Grid**: Size-based visual importance

### 2. TEEI Brand Compliance
- **Official Color Palette**: Nordshore, Sky, Sand, Beige, Gold, Moss, Clay
- **Typography System**: Lora (headlines) + Roboto Flex (body)
- **Layout Standards**: 12-column grid, 40pt margins, 16.5pt baseline
- **Spacing Rules**: 60pt sections, 20pt elements, 12pt paragraphs

### 3. Reusable Component System
- Pull Quotes (4 variants)
- Stat Cards
- Section Headers
- Image Frames (4 variants)
- Running Footers

### 4. Layout Pattern Library
- Cover Hero Design
- Two-Column Split (Text + Image)
- Stats/Metrics Page (Modular Grid)
- Call-to-Action Page
- Full-Width Photo + Overlay
- Diagonal Split Layout
- And 9 more professional patterns

### 5. Document Type Templates
- **Partnership Brochure** (8 pages)
- **Program Overview** (4 pages)
- **Annual Report** (12 pages)

---

## Quick Start

### List Available Templates
```bash
node template-generator.js list
```

Output:
```
Available Document Types:
  partnershipBrochure: Partnership Brochure (8 pages)
  programOverview: Program Overview (4 pages)
  annualReport: Annual Report (12 pages)

Available Layout Patterns:
  coverHero: Cover Page (Hero Design) [high]
  twoColumnSplit: Two-Column Split (Text + Image) [medium]
  statsModular: Stats/Metrics Page (Modular Grid) [high]
  ctaPage: Call-to-Action Page [low]

Available Components:
  pullQuote: Pull Quote
  statCard: Statistic Card
  sectionHeader: Section Header
  imageFrame: Image Frame
  footer: Running Footer
```

### Generate a Template
```bash
# Generate partnership brochure template
node template-generator.js generate partnershipBrochure

# Generate with custom filename
node template-generator.js generate annualReport teei-annual-2025
```

Output:
```
[TemplateGenerator] Generating template: partnershipBrochure
[TemplateGenerator] Template spec saved: ./templates/generated/partnershipBrochure-1699564800000.json
[TemplateGenerator] InDesign script saved: ./templates/generated/partnershipBrochure-1699564800000.jsx
[TemplateGenerator] MCP payload saved: ./templates/generated/partnershipBrochure-1699564800000-mcp.json

Generation complete:
  Spec: ./templates/generated/partnershipBrochure-1699564800000.json
  Script: ./templates/generated/partnershipBrochure-1699564800000.jsx
  MCP: ./templates/generated/partnershipBrochure-1699564800000-mcp.json
```

---

## Usage in Node.js

### Basic Usage
```javascript
const TemplateGenerator = require('./template-generator');

const generator = new TemplateGenerator();

// Generate template
await generator.generateTemplate('partnershipBrochure', {
  filename: 'my-partnership-doc'
});
```

### Advanced Usage
```javascript
// Generate with customization
await generator.generateTemplate('partnershipBrochure', {
  filename: 'aws-partnership',
  customization: {
    colorMode: 'CMYK', // For print
    document: {
      pageCount: 10 // Override default 8 pages
    }
  },
  generateScript: true,
  generateMCP: true
});
```

### Generate Specification Only
```javascript
const spec = generator.generateTemplateSpec('programOverview');
console.log(spec);
// Returns complete template specification object
```

### List Available Options
```javascript
// List document types
const types = generator.listDocumentTypes();
// [{ id: 'partnershipBrochure', name: 'Partnership Brochure', pageCount: 8, ... }]

// List layout patterns
const patterns = generator.listLayoutPatterns();
// [{ id: 'coverHero', name: 'Cover Page (Hero Design)', visualDensity: 'high' }]

// List components
const components = generator.listComponents();
// [{ id: 'pullQuote', name: 'Pull Quote', variants: ['floating', 'sidebar', ...] }]
```

---

## Template Specification Structure

Generated templates include:

### 1. Metadata
```json
{
  "name": "Partnership Brochure",
  "documentType": "partnershipBrochure",
  "version": "1.0",
  "generated": "2025-11-08T12:00:00.000Z",
  "brand": "TEEI"
}
```

### 2. Document Settings
```json
{
  "size": { "width": 8.5, "height": 11, "unit": "inches" },
  "margins": { "top": 40, "bottom": 40, "left": 40, "right": 40, "unit": "pt" },
  "columns": { "count": 12, "gutter": 20, "unit": "pt" },
  "baseline": { "increment": 16.5, "unit": "pt" },
  "colorMode": "RGB",
  "pageCount": 8
}
```

### 3. Master Pages
```json
{
  "default": {
    "name": "A-Master",
    "basedOn": null,
    "margins": { ... },
    "elements": [
      {
        "type": "footer",
        "component": "footer",
        "position": { "x": 40, "y": 720 },
        "locked": true
      }
    ]
  }
}
```

### 4. Page Specifications
```json
[
  {
    "pageNumber": 1,
    "masterPage": "cover",
    "pattern": "coverHero",
    "grid": "hierarchical",
    "structure": {
      "heroImage": { "position": "fullBleed", "overlay": 0.4 },
      "title": { "position": "center", "style": "documentTitle", "color": "white" }
    },
    "visualDensity": "high",
    "background": { "color": "#FFFFFF", "opacity": 1 }
  }
]
```

### 5. Paragraph Styles
```json
{
  "Document Title": {
    "name": "Document Title",
    "fontFamily": "Lora",
    "fontStyle": "Bold",
    "fontSize": 42,
    "leading": 46.2,
    "color": "#00393F",
    "spaceBefore": 0,
    "spaceAfter": 12
  }
}
```

### 6. Color Swatches
```json
[
  {
    "name": "Nordshore",
    "colorModel": "RGB",
    "colorValue": [0, 57, 63],
    "colorSpace": "sRGB"
  }
]
```

### 7. Components
```json
{
  "pullQuote": {
    "name": "Pull Quote",
    "variants": ["floating", "sidebar", "fullWidth", "overlapping"],
    "defaultStyle": {
      "background": { "color": "sky", "opacity": 0.2 },
      "padding": 20,
      "textStyle": "pullQuote"
    }
  }
}
```

---

## Integration with Orchestrator

### Option 1: Generate Template, Then Use in Job
```javascript
// Step 1: Generate template
const generator = new TemplateGenerator();
await generator.generateTemplate('partnershipBrochure', {
  filename: 'teei-aws-template'
});

// Step 2: Use in job
const job = {
  jobType: 'document',
  templateId: 'teei-aws-template',
  data: {
    title: 'TEEI AWS Partnership',
    // ... content
  }
};

const orchestrator = new PDFOrchestrator();
await orchestrator.executeJob(job);
```

### Option 2: Dynamic Template Generation
```javascript
// Generate template on-the-fly
const generator = new TemplateGenerator();
const spec = generator.generateTemplateSpec('partnershipBrochure');

// Use MCP to create template in InDesign
const mcpPayload = generator.generateMCPPayload(spec);
// Send to MCP worker for InDesign automation
```

---

## InDesign Script Output

The generator creates `.jsx` ExtendScript files that can be run directly in InDesign:

```javascript
// Auto-generated InDesign Template Script
// Template: Partnership Brochure
// Generated: 2025-11-08T12:00:00.000Z

#target indesign

function createTemplate() {
  var doc, page, textFrame, rect;

  // Create new document
  var docPreset = app.documentPresets.add();
  docPreset.pageWidth = "8.5inches";
  docPreset.pageHeight = "11inches";
  docPreset.facingPages = false;
  docPreset.pagesPerDocument = 8;

  doc = app.documents.add(docPreset);

  // Set margins
  doc.marginPreferences.top = "40pt";
  // ... (full script generated)
}

createTemplate();
```

**To use:**
1. Open InDesign
2. File → Scripts → Other Script...
3. Select generated `.jsx` file
4. Template is created automatically

---

## Design Patterns Implemented

### Visual Rhythm Pattern
Templates implement the "High → Low → Medium → High" density pattern:

**Partnership Brochure (8 pages):**
1. **HIGH** - Cover (full-bleed hero)
2. **MEDIUM** - Vision (asymmetric split)
3. **MEDIUM** - Programs (two-column)
4. **HIGH** - Stats (modular grid)
5. **LOW** - Technology (three-column text)
6. **HIGH** - Story (full-width photo)
7. **MEDIUM** - Benefits (diagonal split)
8. **LOW** - CTA (minimal elements)

### Color Progression
Background colors alternate to create subliminal chapter breaks:
- Page 1: Photo background (cover)
- Page 2: Sky blue (30% opacity)
- Page 3: White
- Page 4: Sand
- Page 5: White
- Page 6: Photo background
- Page 7: Nordshore (dark)
- Page 8: White (CTA)

### Fixed + Variable System
**Fixed Elements (Never Change):**
- 40pt margins
- 20pt gutters
- 16.5pt baseline grid
- TEEI color palette
- Lora + Roboto Flex fonts
- Running footer

**Variable Elements (Change Per Page):**
- Grid type (manuscript → column → modular)
- Column count (1 → 2 → 3)
- Image placement (full-bleed → circular → diagonal)
- Background color
- Visual density

---

## Customization Options

### Add New Document Type
```javascript
// In template-generator.js, add to DOCUMENT_TYPES:
const DOCUMENT_TYPES = {
  // ... existing types
  oneSheet: {
    name: 'One-Sheet Overview',
    pageCount: 1,
    pages: [
      { pattern: 'coverHero', grid: 'hierarchical' }
    ],
    components: ['statCard', 'footer']
  }
};
```

### Add New Layout Pattern
```javascript
// In template-generator.js, add to LAYOUT_PATTERNS:
const LAYOUT_PATTERNS = {
  // ... existing patterns
  timeline: {
    name: 'Timeline/Process Flow',
    structure: {
      orientation: 'horizontal',
      steps: 5,
      connector: { type: 'arrow', color: 'nordshore' }
    },
    visualDensity: 'medium'
  }
};
```

### Add New Component
```javascript
// In template-generator.js, add to COMPONENTS:
const COMPONENTS = {
  // ... existing components
  testimonial: {
    name: 'Testimonial Block',
    structure: {
      photo: { size: 100, shape: 'circular' },
      quote: { style: 'pullQuote' },
      attribution: { style: 'caption' }
    }
  }
};
```

---

## Best Practices

### 1. Template Naming
Use descriptive, consistent names:
- ✅ `teei-aws-partnership-2025`
- ✅ `program-overview-together-ukraine`
- ❌ `template1`, `test`, `new`

### 2. Color Mode Selection
- **RGB** for digital PDFs, presentations, web
- **CMYK** for print production

### 3. Page Count
- **1 page**: One-sheets, overviews
- **4 pages**: Brochures, program summaries
- **8 pages**: Partnership documents, detailed programs
- **12+ pages**: Annual reports, comprehensive documents

### 4. Grid System Selection
- **Manuscript**: Text-heavy (letters, detailed descriptions)
- **Two-Column**: Standard content (most versatile)
- **Three-Column**: Magazine-style (varied content)
- **Modular**: Data/metrics (infographics, stats)
- **Hierarchical**: Visual impact (covers, heroes)

### 5. Component Usage
Use components for consistency:
- Pull quotes on 3 pages minimum
- Stat cards for all metrics
- Section headers for all major sections
- Running footer on all pages except cover

---

## Troubleshooting

### Issue: "Unknown document type"
**Solution**: Use `node template-generator.js list` to see available types.

### Issue: InDesign script fails
**Solution**:
1. Ensure fonts installed (`scripts/install-fonts.ps1`)
2. Check InDesign version compatibility
3. Run script from InDesign Scripts panel (not double-click)

### Issue: MCP integration not working
**Solution**:
1. Check MCP server running (`test_connection.py`)
2. Verify InDesign is open
3. Check MCP payload format

### Issue: Colors don't match brand
**Solution**: Template uses exact TEEI brand colors. If different:
1. Verify color swatches created correctly
2. Check color mode (RGB vs CMYK)
3. Ensure styles applied to text/elements

---

## API Reference

### TemplateGenerator Class

#### Constructor
```javascript
new TemplateGenerator(config)
```
- `config.outputDir` - Output directory (default: `./templates/generated`)
- `config.mcpEnabled` - Enable MCP payload generation (default: `true`)

#### Methods

**generateTemplateSpec(documentType, customization)**
- Generates complete template specification
- Returns: `object` - Template spec

**generateTemplate(documentType, options)**
- Generates complete template package
- Returns: `Promise<{ spec, script, mcpPayload }>`

**listDocumentTypes()**
- Lists available document types
- Returns: `Array<{ id, name, pageCount, components }>`

**listLayoutPatterns()**
- Lists available layout patterns
- Returns: `Array<{ id, name, visualDensity }>`

**listComponents()**
- Lists available components
- Returns: `Array<{ id, name, variants }>`

**generateInDesignScript(spec)**
- Generates ExtendScript for InDesign
- Returns: `string` - ExtendScript code

**generateMCPPayload(spec)**
- Generates MCP-compatible payload
- Returns: `object` - MCP payload

---

## Examples

### Example 1: Basic Partnership Brochure
```bash
node template-generator.js generate partnershipBrochure teei-aws
```

### Example 2: CMYK Print Template
```javascript
await generator.generateTemplate('annualReport', {
  filename: 'annual-report-2025-print',
  customization: {
    colorMode: 'CMYK'
  }
});
```

### Example 3: Custom Page Count
```javascript
await generator.generateTemplate('programOverview', {
  filename: 'extended-overview',
  customization: {
    document: {
      pageCount: 6 // Instead of default 4
    }
  }
});
```

### Example 4: Generate Spec Only (No Files)
```javascript
const spec = generator.generateTemplateSpec('partnershipBrochure');
// Use spec for custom processing
```

---

## Future Enhancements

### Planned Features
1. **Custom grid builder** - Create custom grid systems
2. **Component editor** - Modify component styles visually
3. **Template preview** - Generate PNG previews
4. **Style inheritance** - Create style hierarchies
5. **Multi-brand support** - Support multiple brand guidelines
6. **Template versioning** - Version control for templates
7. **Collaborative editing** - Multi-user template editing
8. **AI-powered layout** - ML-based layout suggestions

### Integration Opportunities
- **InDesign Server** - Automated cloud rendering
- **Figma Export** - Import Figma designs as templates
- **Brand CMS** - Pull brand guidelines from CMS
- **Asset Library** - Integrated asset management
- **Template Marketplace** - Share/sell templates

---

## Support

### Documentation
- **Main README**: `/README.md`
- **TEEI Brand Guidelines**: `/CLAUDE.md`
- **Design Analysis**: `/reports/WORLD_CLASS_NONPROFIT_DESIGN_ANALYSIS.md`

### Get Help
- Review examples in `example-jobs/`
- Check template specs in `templates/generated/`
- Run `node template-generator.js list` for available options

---

**Last Updated**: 2025-11-08
**Version**: 1.0
**Status**: Production Ready
