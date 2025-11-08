# Intelligent Layout Engine - Quick Start

**Generate world-class PDF layouts in 3 steps. No design expertise required.**

---

## Step 1: Create Content File

Create a JSON file with your content blocks:

**`my-content.json`:**
```json
{
  "blocks": [
    {
      "type": "h1",
      "content": "Your Document Title"
    },
    {
      "type": "body",
      "content": "Your body text goes here. The engine will automatically size, position, and style everything."
    },
    {
      "type": "h2",
      "content": "Section Header",
      "isSection": true
    },
    {
      "type": "stat",
      "content": "10,000+",
      "isStat": true
    },
    {
      "type": "caption",
      "content": "Metric description"
    }
  ]
}
```

**Block Types Available:**
- `h1`, `h2`, `h3` - Headings (auto-sized: 42pt, 28pt, 18pt)
- `body` - Body text (11pt, optimal line length)
- `stat` - Large numbers/metrics (36pt, gold color)
- `quote` - Pull quotes (18pt italic)
- `image` - Images (specify width/height)
- `callout` - Callout boxes (background color)
- `cta` - Call to action (emphasized)
- `caption` - Small text (9pt)

---

## Step 2: Generate Layout

### Option A: Command Line (Easiest)

```bash
node scripts/generate-layout.js my-content.json
```

**That's it!** Layout saved to `exports/generated-layout.json`

### Option B: Node.js Script

**`generate-my-layout.js`:**
```javascript
const IntelligentLayoutEngine = require('./scripts/lib/intelligent-layout-engine');

async function generate() {
  const engine = new IntelligentLayoutEngine();

  const content = require('./my-content.json');

  const result = await engine.generate(content);

  console.log(`✅ Quality: ${result.metadata.grade}`);
  console.log(`📐 Grid: ${result.grid.columns}-column`);

  await engine.exportLayout(result.layout, 'json', 'exports/my-layout.json');
}

generate();
```

Run it:
```bash
node generate-my-layout.js
```

---

## Step 3: Use the Layout

The engine generates a complete layout specification:

**`exports/generated-layout.json`:**
```json
{
  "layout": {
    "elements": [
      {
        "id": "element-0",
        "type": "h1",
        "content": "Your Document Title",
        "x": 40,
        "y": 40,
        "width": 532,
        "height": 50,
        "fontSize": 42,
        "fontFamily": "Lora",
        "fontWeight": "bold",
        "color": "#00393F",
        "gridColumn": 1,
        "gridSpan": 12
      }
      // ... more elements
    ]
  },
  "grid": {
    "columns": 12,
    "gutters": 20,
    "margins": { "top": 40, "right": 40, "bottom": 40, "left": 40 }
  },
  "metadata": {
    "qualityScore": 92,
    "grade": "A+ (Excellent)"
  }
}
```

### Use with InDesign

Export to InDesign XML:
```bash
node scripts/generate-layout.js my-content.json --export-all
```

This creates:
- `exports/generated-layout.json` - Layout data
- `exports/generated-layout.xml` - InDesign XML
- `exports/generated-layout.css` - CSS Grid
- `exports/generated-layout.html` - HTML preview

### Use with PDF Libraries

```javascript
const layout = require('./exports/generated-layout.json');

// Use with pdf-lib, pdfkit, etc.
layout.layout.elements.forEach(element => {
  pdf.text(element.content, element.x, element.y, {
    fontSize: element.fontSize,
    font: element.fontFamily,
    color: element.color
  });
});
```

---

## Common Scenarios

### Scenario 1: Simple Document (Default)

```bash
# Just run with defaults
node scripts/generate-layout.js my-content.json
```

**Automatic decisions:**
- ✅ Analyzes content density
- ✅ Selects optimal grid (12-column nonprofit-modern)
- ✅ Calculates typography scale (golden ratio)
- ✅ Positions elements with eye flow (Z-pattern)
- ✅ Validates and fixes alignment issues

### Scenario 2: Dense Text Document

**Content:** 700+ words, academic paper

```bash
node scripts/generate-layout.js academic-paper.json
```

**Engine automatically:**
- Detects: `density: 'very-dense'`
- Selects: `pattern: 'text-focused'` (1-column manuscript)
- Applies: Tighter spacing (0.75x multiplier)
- Uses: Larger base font (12pt)
- Flow: F-pattern (text reading)

### Scenario 3: Image-Heavy Portfolio

**Content:** 10 images, minimal text

```bash
node scripts/generate-layout.js portfolio.json
```

**Engine automatically:**
- Detects: `visualBalance: 'image-heavy'`
- Selects: `pattern: 'visual-storytelling'` (6-column asymmetric)
- Applies: Generous spacing around images (1.4x)
- Uses: Larger headings, smaller body text
- Flow: Z-pattern (corner scanning)

### Scenario 4: Force Specific Style

```bash
# Force editorial magazine style
node scripts/generate-layout.js content.json --pattern editorial-magazine

# Force minimal spacing
node scripts/generate-layout.js content.json --density sparse
```

---

## Customization Options

### Available Styles

```bash
# Balanced, warm (default)
--style nonprofit-modern

# Professional, clean
--style corporate

# Magazine-style
--style editorial

# Simple, lots of whitespace
--style minimal
```

### Available Patterns

```bash
# 12-column flexible (default)
--pattern nonprofit-modern

# 1-column for dense text
--pattern text-focused

# Image-heavy asymmetric
--pattern visual-storytelling

# 12-column max flexibility
--pattern swiss-flexible

# 3-column magazine
--pattern editorial-magazine

# 6×12 modular grid
--pattern modular-sections
```

### Content Density

```bash
# Auto-detect (default)
--density auto

# Force generous spacing
--density sparse

# Force standard spacing
--density balanced

# Force tight spacing
--density dense

# Force compact spacing
--density very-dense
```

---

## Quality Validation

Every layout is automatically validated:

```json
{
  "metadata": {
    "qualityScore": 92,
    "grade": "A+ (Excellent)",
    "qualityFactors": {
      "hierarchyClarity": 95,      // ← Visual hierarchy effectiveness
      "spacingConsistency": 90,    // ← Adherence to spacing scale
      "gridAlignment": 92,         // ← Pixel-perfect alignment
      "goldenRatioCompliance": 88, // ← Mathematical harmony
      "brandCompliance": 95        // ← TEEI brand standards
    }
  }
}
```

**Grades:**
- **A++ (95-100):** Mathematical Perfection
- **A+ (90-94):** Excellent Professional ← Most layouts achieve this
- **A (85-89):** Very Good
- **B (80-84):** Good
- **C+ (70-79):** Fair

---

## Debugging

Enable debug mode to see detailed analysis:

```bash
node scripts/generate-layout.js my-content.json --debug
```

**Output:**
```
🎨 Intelligent Layout Engine Starting...
   Style: nonprofit-modern
   Analyzing content structure...

   Content Analysis:
   - Total blocks: 12
   - Density: balanced (280 words/page)
   - Visual balance: text-dominant (3.5:1 ratio)
   - Complexity: moderate (5 unique block types)
   - Structure: hierarchical

   Pattern Selection:
   ✅ Selected: Nonprofit Modern (12-column)
   Reason: Balanced content, moderate complexity

   Positioning elements with intelligent flow...
   - Eye flow pattern: z-pattern
   - Positioned 12 elements

   Applying visual hierarchy...
   Optimizing whitespace...
   - Current whitespace: 35.2% ✅ (target: 30-40%)

   Applying golden ratio refinements...
   - Focal point: (378, 489)
   - Hero element adjusted to golden section

   Validating layout quality...
   - Hierarchy score: 95/100
   - Spacing score: 90/100
   - Alignment fixes: 0

✅ Layout Generation Complete (287ms)
   Elements positioned: 12
   Grid: Swiss 12-Column
   Quality score: 92/100
```

---

## Tips & Best Practices

### 1. Mark Section Breaks

Add `isSection: true` to major headers:

```json
{
  "type": "h2",
  "content": "New Section",
  "isSection": true  // ← More spacing before this
}
```

### 2. Use Semantic Types

Use specific types instead of manual sizing:

**❌ Don't do this:**
```json
{ "type": "body", "fontSize": 36 }  // Confusing
```

**✅ Do this:**
```json
{ "type": "stat", "content": "36" }  // Clear intent
```

### 3. Let the Engine Decide

Trust the automatic decisions:

**❌ Over-specifying:**
```json
{
  "type": "h1",
  "fontSize": 42,
  "fontFamily": "Lora",
  "fontWeight": "bold",
  "x": 40,
  "y": 100,
  "width": 532
}
```

**✅ Minimal specification:**
```json
{
  "type": "h1",
  "content": "Title"
}
// Engine calculates everything else perfectly
```

### 4. Test with Real Content

Use actual text, not placeholders:

**❌ Placeholders:**
```json
{ "type": "body", "content": "Lorem ipsum..." }
```

**✅ Real content:**
```json
{ "type": "body", "content": "TEEI partners with leading..." }
// Engine analyzes real word count, complexity
```

---

## Examples

### Example 1: Partnership Document

**File:** `examples/sample-content.json` (included)

```bash
node scripts/generate-layout.js examples/sample-content.json --export-all
```

**Result:**
- Quality: A+ (92/100)
- Pattern: Nonprofit Modern
- Grid: 12-column Swiss
- Elements: 23 perfectly positioned
- Exports: JSON, XML, CSS, HTML

### Example 2: Minimal 2-Page Brief

**File:** `brief-content.json`
```json
{
  "blocks": [
    { "type": "h1", "content": "Executive Summary" },
    { "type": "body", "content": "Brief overview..." },
    { "type": "h2", "content": "Key Points", "isSection": true },
    { "type": "body", "content": "Point 1..." },
    { "type": "body", "content": "Point 2..." },
    { "type": "cta", "content": "Contact Us", "isCTA": true }
  ]
}
```

```bash
node scripts/generate-layout.js brief-content.json
```

**Result:**
- Auto-detects: Sparse content
- Uses: Generous spacing (1.2x)
- Pattern: Nonprofit Modern
- Quality: A+ (94/100)

---

## Next Steps

1. **Create your content** → JSON file with blocks
2. **Run the generator** → `node scripts/generate-layout.js your-content.json`
3. **Review the output** → Check quality score, adjust if needed
4. **Export to your format** → Use `--export-all` for all formats
5. **Use in production** → Import to InDesign, PDF library, or HTML

**Need help?** See full documentation: `INTELLIGENT-LAYOUT-ENGINE.md`

---

## Cheat Sheet

```bash
# Basic usage (auto-everything)
node scripts/generate-layout.js content.json

# With debug output
node scripts/generate-layout.js content.json --debug

# Export to all formats
node scripts/generate-layout.js content.json --export-all

# Force specific pattern
node scripts/generate-layout.js content.json --pattern text-focused

# Force spacing
node scripts/generate-layout.js content.json --density sparse

# Custom output path
node scripts/generate-layout.js content.json -o my-custom-layout.json

# Disable AI (faster)
node scripts/generate-layout.js content.json --no-ai
```

**That's it! You now have world-class layout automation.** 🎨
