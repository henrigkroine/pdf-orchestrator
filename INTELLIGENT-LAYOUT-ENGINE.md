# Intelligent Layout Engine

**Automatic World-Class PDF Layout Generation**

Transform any content into professionally designed PDFs using AI, mathematical design principles, and proven nonprofit design patterns—**no design expertise required**.

---

## Quick Start

### 1. Generate Layout from Content

```bash
# Basic usage
node scripts/generate-layout.js examples/sample-content.json

# With specific style
node scripts/generate-layout.js examples/sample-content.json --style nonprofit-modern

# Export to all formats
node scripts/generate-layout.js examples/sample-content.json --export-all
```

### 2. Use Programmatically

```javascript
const IntelligentLayoutEngine = require('./scripts/lib/intelligent-layout-engine');

const engine = new IntelligentLayoutEngine();

const content = {
  blocks: [
    { type: 'h1', content: 'Document Title' },
    { type: 'body', content: 'Body text here...' },
    { type: 'image', width: 400, height: 300 }
  ]
};

const result = await engine.generate(content, {
  style: 'nonprofit-modern',
  density: 'auto'
});

console.log(`Layout quality: ${result.metadata.grade}`);
console.log(`Grid: ${result.grid.columns}-column`);
```

---

## System Architecture

The Intelligent Layout Engine combines multiple specialized modules to create world-class layouts automatically:

```
IntelligentLayoutEngine (Orchestrator)
├── Content Analysis          → Analyzes text density, structure, complexity
├── Pattern Selection         → Picks optimal design pattern for content
├── Grid System              → Swiss 12-column, modular, manuscript grids
├── Golden Ratio             → Mathematical proportions for harmony
├── Typography Scale         → Automatic font sizing (golden ratio)
├── Spacing Calculator       → Fibonacci-based spacing system
├── Element Positioner       → Intelligent placement with eye flow
├── Hierarchy Optimizer      → Visual hierarchy (size, color, position)
├── Whitespace Optimizer     → 30-40% optimal whitespace distribution
├── Alignment Engine         → Pixel-perfect grid alignment
└── Validation & QA          → Auto-detect and fix layout issues
```

---

## Features

### 1. **Content-Aware Layout Selection**

Automatically analyzes your content and selects the optimal layout pattern:

| Content Type | Pattern Selected | Grid | Best For |
|--------------|------------------|------|----------|
| Dense text (700+ words) | Text-Focused | 1-column manuscript | Academic papers, reports |
| Image-heavy (1:1 text/image) | Visual Storytelling | 6-column asymmetric | Photo essays, portfolios |
| Complex structure (7+ block types) | Swiss Flexible | 12-column | Multi-section documents |
| Editorial content (3+ quotes) | Editorial Magazine | 3-column | Articles, newsletters |
| Hierarchical (5+ headings) | Modular Sections | 6×12 modular | Data-heavy layouts |
| Balanced (default) | Nonprofit Modern | 12-column | Partnership docs (default) |

**Example:**

```javascript
// Content analysis happens automatically
const analysis = engine.analyzeContent(content);
// {
//   density: 'balanced',
//   visualBalance: 'text-dominant',
//   complexity: 'moderate',
//   structure: 'hierarchical'
// }

// Pattern selected automatically based on analysis
const pattern = engine.selectDesignPattern(analysis);
// Returns: 'nonprofit-modern' (12-column balanced grid)
```

### 2. **Automatic Typography Scale**

Generates harmonious font sizes using the golden ratio (φ = 1.618):

```javascript
const typography = engine.calculateTypographyScale(analysis, pattern);
// {
//   hero: { size: 48, font: 'Lora', weight: 'bold', lineHeight: 1.1 },
//   h1:   { size: 42, font: 'Lora', weight: 'bold', lineHeight: 1.2 },
//   h2:   { size: 28, font: 'Lora', weight: 'semibold', lineHeight: 1.2 },
//   h3:   { size: 18, font: 'Roboto Flex', weight: 'medium', lineHeight: 1.3 },
//   body: { size: 11, font: 'Roboto Flex', weight: 'regular', lineHeight: 1.5 },
//   stat: { size: 36, font: 'Lora', color: '#BA8F5A' (TEEI Gold) }
// }
```

**Size Progression:** Each level is ~1.5x larger than the next (golden ratio), creating natural visual hierarchy.

### 3. **Fibonacci Spacing System**

Automatically calculates perfect spacing based on content density:

```javascript
const spacing = engine.calculateSpacingSystem(analysis, pattern);
// {
//   xs: 8pt,    sm: 13pt,   md: 21pt,
//   lg: 34pt,   xl: 55pt,   xxl: 89pt,
//   betweenParagraphs: 21pt,
//   betweenSections: 55pt,
//   betweenElements: 34pt
// }
```

**Density Adaptation:**
- **Sparse content** (< 150 words): 1.3x multiplier (more generous spacing)
- **Balanced** (150-400 words): 1.0x multiplier (standard spacing)
- **Dense** (400-700 words): 0.85x multiplier (tighter spacing)
- **Very Dense** (700+ words): 0.75x multiplier (compact spacing)

### 4. **Smart Element Positioning**

Positions elements using eye flow patterns (F-pattern for text, Z-pattern for visual):

**F-Pattern** (Text-Heavy Content):
```
╔════════════════╗
║ ████████       ║  ← Top horizontal bar (primary scan)
║ ██             ║  ← Left vertical bar (vertical scan)
║ ██             ║
║ ██ ████        ║  ← Lower horizontal bar (secondary scan)
║ ██             ║
╚════════════════╝
```

**Z-Pattern** (Visual Content):
```
╔════════════════╗
║ █          █   ║  ← Top left → Top right
║    ╲      ╱    ║  ← Diagonal flow
║     ╲    ╱     ║
║      ╲  ╱      ║
║ █          █   ║  ← Bottom left → Bottom right
╚════════════════╝
```

**Golden Ratio Focal Point:**

Most important element positioned near (61.8%, 61.8%) focal point—the natural eye attraction point.

### 5. **Visual Hierarchy Automation**

Automatically applies TEEI brand colors and emphasis:

```javascript
// Hierarchy Level 1 (Titles)
color: '#00393F'  // Nordshore (primary brand)
fontSize: 42pt
weight: 'bold'

// Level 2 (Section Headers)
color: '#00393F'  // Nordshore
fontSize: 28pt
weight: 'semibold'

// Stats/Metrics
color: '#BA8F5A'  // Gold (premium feel)
fontSize: 36pt
weight: 'bold'

// Body Text
color: '#000000'  // Black
fontSize: 11pt
weight: 'regular'
```

### 6. **Whitespace Optimization**

Maintains optimal 30-40% whitespace ratio:

```javascript
// Too dense (< 30% whitespace)
→ Increases spacing between elements

// Too sparse (> 40% whitespace)
→ Reduces spacing, adds more content

// Optimal (30-40%)
→ No adjustment needed
```

### 7. **Pixel-Perfect Alignment**

All elements snap to:
- **Grid columns** (±2px tolerance)
- **Baseline grid** (8pt rhythm)
- **Optical adjustments** (circles, triangles need visual offset)

```javascript
// Auto-fixes detected issues:
// - Near-misses (elements almost aligned)
// - Grid misalignments (not snapped to columns)
// - Baseline misalignments (text not on baseline)
// - Uneven spacing (irregular gaps between elements)
```

### 8. **Automatic Validation & Fixing**

Runs comprehensive quality checks:

```javascript
const validation = await engine.validateAndFix(layout, grid);
// {
//   hierarchy: { score: 92/100 },     // Visual hierarchy clarity
//   spacing: { score: 88/100 },       // Spacing consistency
//   alignment: { fixedIssues: 3 }     // Auto-fixed alignment issues
// }
```

---

## Design Patterns

### 1. **Nonprofit Modern** (Default)

**Best For:** Partnership documents, annual reports, general nonprofit materials

**Grid:** 12-column flexible (20pt gutters, 40pt margins)
**Typography:** Lora (headings) + Roboto Flex (body), 11pt base
**Spacing:** Fibonacci scale (8, 13, 21, 34, 55, 89)
**Eye Flow:** Z-pattern (visual scanning)

**When to Use:**
- Balanced text/image ratio
- Professional presentation
- Moderate complexity
- Default choice when unsure

**Example Output:**
```
┌──────────────────────────────────┐
│                                  │
│  ████ DOCUMENT TITLE ████        │ ← H1 (42pt, full-width)
│                                  │
│  Body text in 8-column width     │ ← Body (11pt, 8/12 columns)
│  with comfortable margins and    │
│  optimal line length (66 chars)  │
│                                  │
│  █ Section Header █              │ ← H2 (28pt, full-width)
│                                  │
│  [IMAGE]    Body text flows      │ ← Image + Text (golden ratio)
│  [400px]    alongside image      │
│  [247px]    in 2-column layout   │
│                                  │
│  ▶ Call to Action                │ ← CTA (emphasized)
│                                  │
└──────────────────────────────────┘
```

### 2. **Text-Focused** (Manuscript)

**Best For:** Dense text, academic papers, detailed reports

**Grid:** 1-column manuscript (54pt margins)
**Typography:** Larger base (12pt), wider line spacing (1.6x)
**Spacing:** Generous (1.2x multiplier)
**Eye Flow:** F-pattern (text reading)

**When to Use:**
- 700+ words per page
- Academic/formal content
- No images
- Maximum readability

**Example Output:**
```
┌──────────────────────────────┐
│                              │
│    ██ RESEARCH PAPER ██      │
│                              │
│    Body text in single       │
│    column with generous      │
│    margins and optimal       │
│    line length. Perfect      │
│    for academic reading.     │
│                              │
│    Multiple paragraphs       │
│    flow naturally with       │
│    consistent spacing and    │
│    clear hierarchy.          │
│                              │
│    Footnotes and citations   │
│    are properly formatted    │
│    with smaller text size.   │
│                              │
└──────────────────────────────┘
```

### 3. **Visual Storytelling** (Asymmetric)

**Best For:** Photo essays, portfolios, image-heavy content

**Grid:** 6-column asymmetric (30pt gutters, 36pt margins)
**Typography:** Larger headings, minimal body text
**Spacing:** Generous around images (1.4x multiplier)
**Eye Flow:** Z-pattern (corner to corner)

**When to Use:**
- 1:1 or higher image/text ratio
- Visual impact priority
- Modern, dynamic feel
- Portfolio/showcase style

**Example Output:**
```
┌───────────────────────────────────┐
│                                   │
│ ██ Visual Story ██    [IMAGE]     │
│                       [LARGE]     │
│ Caption text          [600px]     │
│                       [371px]     │
│                                   │
│ [IMAGE]  [IMAGE]                  │
│ [280px]  [280px]  Body text flows │
│ [173px]  [173px]  in remaining    │
│                   space with      │
│                   asymmetric grid │
│                                   │
│           ▶ Continue Story        │
│                                   │
└───────────────────────────────────┘
```

### 4. **Swiss Flexible** (12-Column)

**Best For:** Complex layouts, multi-section documents

**Grid:** 12-column Swiss (20pt gutters, 40pt margins)
**Typography:** Standard TEEI scale
**Spacing:** Modular (8pt baseline)
**Eye Flow:** Gutenberg diagram (quadrant-based)

**When to Use:**
- Complex structure (7+ block types)
- Varied content (text, images, data, callouts)
- Maximum flexibility needed
- Multi-section documents

### 5. **Editorial Magazine** (3-Column)

**Best For:** Articles, newsletters, editorial content

**Grid:** 3-column magazine (20pt gutters, 36pt margins)
**Typography:** Larger body text (12pt), pull quotes
**Spacing:** Tighter (0.9x multiplier)
**Eye Flow:** F-pattern (reading)

**When to Use:**
- 3+ pull quotes
- Article/newsletter format
- Editorial style
- Magazine aesthetic

### 6. **Modular Sections** (Grid + Rows)

**Best For:** Data-heavy, metrics, comparison tables

**Grid:** 6 columns × 12 rows modular (20pt gutters, 40pt margins)
**Typography:** Fibonacci scale for data hierarchy
**Spacing:** Consistent module-based
**Eye Flow:** Gutenberg (natural quadrants)

**When to Use:**
- 5+ sections with clear breaks
- Data visualization
- Metrics and statistics
- Infographic style

---

## API Reference

### `IntelligentLayoutEngine`

#### Constructor

```javascript
const engine = new IntelligentLayoutEngine(options);
```

**Options:**
- `debug` (boolean): Enable debug logging (default: `false`)
- `defaultStyle` (string): Default design style (default: `'nonprofit-modern'`)
- `defaultDensity` (string): Default density (default: `'auto'`)
- `enableAI` (boolean): Enable AI refinement (default: `true`)
- `enableValidation` (boolean): Enable quality validation (default: `true`)
- `aiModel` (string): AI model for refinement (default: `'claude-opus-4-20250514'`)

#### Methods

##### `generate(content, options)`

**Main API:** Generate complete layout from content.

**Parameters:**
- `content` (Object): Document content with `blocks` array
- `options` (Object):
  - `style` (string): Design style override
  - `pattern` (string): Force specific pattern
  - `density` (string): Content density override

**Returns:** Promise<Object>
```javascript
{
  layout: { elements: [...], page: {...} },
  grid: { columns: 12, gutters: 20, ... },
  pattern: { name: 'Nonprofit Modern', ... },
  typography: { h1: {...}, h2: {...}, ... },
  spacing: { xs: 8, sm: 13, ... },
  metadata: {
    qualityScore: 92,
    grade: 'A+ (Excellent)',
    qualityFactors: {...}
  },
  analysis: { density: 'balanced', ... }
}
```

##### `analyzeContent(content)`

Analyze content characteristics.

**Returns:** Object
```javascript
{
  totalBlocks: 15,
  types: { text: 8, image: 3, heading: 4, ... },
  density: 'balanced',
  visualBalance: 'text-dominant',
  complexity: 'moderate',
  structure: 'hierarchical'
}
```

##### `exportLayout(layout, format, outputPath)`

Export layout to various formats.

**Parameters:**
- `layout` (Object): Generated layout
- `format` (string): `'json'` | `'indesign'` | `'css-grid'` | `'html'`
- `outputPath` (string): Output file path

---

## Usage Examples

### Example 1: Basic Layout Generation

```javascript
const IntelligentLayoutEngine = require('./scripts/lib/intelligent-layout-engine');

async function createBasicLayout() {
  const engine = new IntelligentLayoutEngine();

  const content = {
    blocks: [
      { type: 'h1', content: 'TEEI AWS Partnership' },
      { type: 'body', content: 'Creating educational opportunities...' },
      { type: 'h2', content: 'Our Impact', isSection: true },
      { type: 'stat', content: '50,000+', isStat: true },
      { type: 'caption', content: 'Students Reached' }
    ]
  };

  const result = await engine.generate(content);

  console.log(`Quality: ${result.metadata.grade}`);
  console.log(`Pattern: ${result.pattern.name}`);

  // Save layout
  await engine.exportLayout(result.layout, 'json', 'exports/layout.json');
}

createBasicLayout();
```

### Example 2: Custom Style and Export

```javascript
async function createCustomLayout() {
  const engine = new IntelligentLayoutEngine({ debug: true });

  const content = require('./examples/sample-content.json');

  const result = await engine.generate(content, {
    style: 'nonprofit-modern',
    density: 'balanced'
  });

  // Export to multiple formats
  await engine.exportLayout(result.layout, 'json', 'exports/layout.json');
  await engine.exportLayout(result.layout, 'indesign', 'exports/layout.xml');
  await engine.exportLayout(result.layout, 'css-grid', 'exports/layout.css');
  await engine.exportLayout(result.layout, 'html', 'exports/layout.html');

  console.log('✅ Exported to 4 formats');
}

createCustomLayout();
```

### Example 3: Force Specific Pattern

```javascript
async function createVisualLayout() {
  const engine = new IntelligentLayoutEngine();

  const content = {
    blocks: [
      { type: 'h1', content: 'Photo Essay' },
      { type: 'image', width: 600, height: 371 },
      { type: 'body', content: 'Caption...' },
      { type: 'image', width: 400, height: 247 },
      { type: 'image', width: 400, height: 247 }
    ]
  };

  // Force visual storytelling pattern
  const result = await engine.generate(content, {
    pattern: 'visual-storytelling'
  });

  console.log(`Grid: ${result.grid.columns}-column asymmetric`);
}

createVisualLayout();
```

### Example 4: Validation and Quality Check

```javascript
async function validateLayout() {
  const engine = new IntelligentLayoutEngine({ enableValidation: true });

  const content = require('./examples/sample-content.json');
  const result = await engine.generate(content);

  // Check validation results
  const { hierarchy, spacing, alignment } = result.layout.validation;

  console.log(`Hierarchy Score: ${hierarchy.overall.score}/100`);
  console.log(`Spacing Score: ${spacing.overall.score}/100`);
  console.log(`Alignment Fixes: ${alignment.fixedIssues}`);

  // Print recommendations
  if (hierarchy.recommendations.length > 0) {
    console.log('\n📝 Recommendations:');
    hierarchy.recommendations.forEach(rec => console.log(`  ${rec}`));
  }
}

validateLayout();
```

---

## Quality Scoring

The engine calculates a comprehensive quality score (0-100):

### Quality Factors (Weighted Average)

| Factor | Weight | Description |
|--------|--------|-------------|
| **Hierarchy Clarity** | 25% | Visual hierarchy effectiveness (size, color, position) |
| **Spacing Consistency** | 20% | Adherence to Fibonacci spacing scale |
| **Grid Alignment** | 20% | Pixel-perfect alignment to grid |
| **Golden Ratio Compliance** | 15% | Mathematical harmony (proportions, focal points) |
| **Brand Compliance** | 20% | TEEI colors, fonts, standards |

### Grade Scale

- **A++** (95-100): Mathematical Perfection (award-winning)
- **A+** (90-94): Excellent Professional (publication-ready)
- **A** (85-89): Very Good (minor improvements possible)
- **B** (80-84): Good (some precision issues)
- **C** (70-79): Fair (multiple alignment/spacing issues)
- **D** (60-69): Poor (significant layout work needed)
- **F** (0-59): Failing (complete redesign recommended)

---

## Integration with Existing Tools

The Intelligent Layout Engine integrates seamlessly with other PDF Orchestrator tools:

### 1. **Use with PDF Validation**

```javascript
const IntelligentLayoutEngine = require('./scripts/lib/intelligent-layout-engine');

// Generate layout
const engine = new IntelligentLayoutEngine();
const result = await engine.generate(content);

// Export to HTML
await engine.exportLayout(result.layout, 'html', 'exports/layout.html');

// Validate with PDF Quality Validator
const { execSync } = require('child_process');
execSync('node scripts/validate-pdf-quality.js exports/layout.html');
```

### 2. **Use with Visual Comparison**

```javascript
// Generate baseline layout
const baseline = await engine.generate(contentV1);
await engine.exportLayout(baseline.layout, 'html', 'baselines/v1.html');

// Generate new version
const newVersion = await engine.generate(contentV2);
await engine.exportLayout(newVersion.layout, 'html', 'exports/v2.html');

// Compare visually
execSync('node scripts/compare-pdf-visual.js exports/v2.pdf baselines/v1');
```

### 3. **Use with InDesign Automation**

```javascript
// Generate layout
const result = await engine.generate(content);

// Export to InDesign XML
await engine.exportLayout(result.layout, 'indesign', 'exports/layout.xml');

// Apply to InDesign via MCP
// (InDesign MCP server can read this XML and apply layout)
```

---

## Troubleshooting

### Issue: "Quality score too low"

**Solution:** Enable debug mode to see detailed analysis:

```javascript
const engine = new IntelligentLayoutEngine({ debug: true });
```

Check validation results for specific issues:
- Low hierarchy score → Adjust font sizes or add more hierarchy levels
- Low spacing score → Content may be too dense for pattern
- Low alignment score → Check for custom positioning overrides

### Issue: "Wrong pattern selected"

**Solution:** Force specific pattern:

```javascript
const result = await engine.generate(content, {
  pattern: 'nonprofit-modern'  // Force pattern
});
```

Or adjust content to trigger desired pattern:
- Add more images → Visual Storytelling
- Add more headings → Modular Sections
- Simplify structure → Swiss Flexible

### Issue: "Typography too small/large"

**Solution:** Content density affects sizing. Override density:

```javascript
const result = await engine.generate(content, {
  density: 'sparse'  // Larger spacing and sizes
});
```

---

## Performance

**Typical Generation Times:**
- Simple layout (< 10 blocks): ~100ms
- Medium complexity (10-20 blocks): ~300ms
- Complex layout (20-50 blocks): ~800ms
- With AI refinement: +2000ms

**Optimization Tips:**
- Disable AI for faster generation: `enableAI: false`
- Disable validation for speed: `enableValidation: false`
- Pre-analyze content and cache results

---

## Roadmap

**Upcoming Features:**
- [ ] Multi-page layout support (automatic page breaks)
- [ ] Table layout automation (data tables with styling)
- [ ] Chart integration (automatic chart positioning)
- [ ] Custom pattern creation API
- [ ] Layout template library
- [ ] Real-time layout preview
- [ ] PDF direct export (skip InDesign)
- [ ] Accessibility optimization
- [ ] Print optimization (CMYK, bleed, trim)

---

## Credits

Built on top of proven design systems:
- **Swiss Grid System** (Josef Müller-Brockmann)
- **Golden Ratio** (Euclid, ~300 BC)
- **Fibonacci Sequence** (Leonardo Fibonacci, 1202)
- **Nonprofit Design Patterns** (UNICEF, Red Cross, WWF, Charity: Water)
- **TEEI Brand Guidelines** (2024)

---

## License

Part of the PDF Orchestrator project.
© 2025 TEEI (The Educational Equality Institute)
