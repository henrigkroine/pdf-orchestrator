# TEEI Color Intelligence System

**World-class color harmony automation for TEEI brand compliance**

---

## Overview

The TEEI Color Intelligence System is a comprehensive toolkit for automatically applying professional color schemes to TEEI documents. It ensures 100% brand compliance while leveraging color theory principles for maximum visual impact.

### Key Features

✅ **Automatic Color Selection** - Intelligently chooses optimal color combinations from TEEI's 7 official colors
✅ **Accessibility Built-in** - Calculates contrast ratios for WCAG AA/AAA compliance
✅ **Strategic Color Blocking** - Applies professional color distribution based on document type
✅ **Forbidden Color Prevention** - Automatically blocks copper/orange colors (not in TEEI palette)
✅ **Visual Interest** - Creates complementary, analogous, and triadic harmonies
✅ **Image Overlays** - Generates Nordshore overlays at 40-60% opacity for photos
✅ **Multi-Format Export** - CSS variables, InDesign swatches, JSON palettes

---

## System Components

### 1. Brand Compliance Configuration (`brand-compliance-config.json`)

**Complete TEEI brand color library with:**
- All 7 official TEEI colors (Nordshore, Sky, Sand, Beige, Moss, Gold, Clay)
- RGB, HEX, CMYK, and HSL values for each color
- Pre-calculated contrast ratios for accessibility
- Forbidden colors list (copper/orange)
- Typography system (Lora + Roboto Flex)
- Layout standards (grid, spacing, margins)
- Photography requirements

**Example Color Entry:**
```json
"nordshore": {
  "name": "Nordshore",
  "description": "Primary brand color - deep teal, use for 80% of elements",
  "hex": "#00393F",
  "rgb": { "r": 0, "g": 57, "b": 63 },
  "cmyk": { "c": 100, "m": 10, "y": 0, "k": 75 },
  "usage": ["headers", "primary_text", "backgrounds", "accents"],
  "recommended_usage_percentage": 80,
  "accessibility": {
    "contrast_with_white": 12.8,
    "wcag_aa": true,
    "wcag_aaa": true
  }
}
```

### 2. Color Harmony Configuration (`color-harmony-config.json`)

**Color theory and document schemes:**
- 5 harmony types (complementary, analogous, triadic, split-complementary, monochromatic)
- 4 document schemes (partnership, program overview, impact report, executive summary)
- Pre-configured color blocking strategies
- Overlay configurations (dark, light, gradient)
- Accessibility matrix (all TEEI color combinations tested)
- Color psychology associations

**Example Document Scheme:**
```json
"partnership_document": {
  "name": "Partnership Document (Premium)",
  "primary_color": "nordshore",
  "secondary_colors": ["sky", "gold"],
  "color_blocking": {
    "header": {
      "background": "nordshore",
      "text": "white",
      "accent": "gold"
    },
    "metrics": {
      "card_backgrounds": ["nordshore", "moss", "gold"],
      "numbers": "white",
      "accent_stripes": "gold"
    }
  },
  "usage_distribution": {
    "nordshore": 0.40,
    "gold": 0.10,
    "sand": 0.20
  }
}
```

### 3. Color Intelligence Engine

**JavaScript Implementation** (`color-intelligence.js`)
- Full-featured color intelligence API
- Contrast ratio calculations
- Color validation and suggestions
- Scheme application
- Export to CSS/InDesign

**Python Implementation** (`color_harmony.py`)
- Compatible with existing InDesign automation scripts
- Same feature set as JavaScript version
- CLI interface for quick operations

---

## Quick Start

### JavaScript Usage

```javascript
const colorIntelligence = require('./color-intelligence.js');

// Get a TEEI color
const nordshore = colorIntelligence.getColor('nordshore');
console.log(nordshore.hex); // "#00393F"

// Check accessibility
const contrast = colorIntelligence.getContrastRatio('nordshore', 'white');
console.log(contrast.ratio); // 12.8:1
console.log(contrast.wcag_aaa); // true

// Validate a color
const validation = colorIntelligence.validateColor('#C87137');
console.log(validation.message); // "❌ FORBIDDEN: Copper/Orange"

// Get document color scheme
const scheme = colorIntelligence.getDocumentScheme('partnership_document');

// Apply color scheme to elements
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  hero: {},
  metrics: {},
  cta: {}
});

console.log(styled.header.backgroundColor); // "#00393F"
console.log(styled.header.textColor);       // "#FFFFFF"

// Generate complete palette
const palette = colorIntelligence.generatePalette('partnership_document');

// Export CSS variables
const css = colorIntelligence.exportCSSVariables('partnership_document');
```

### Python Usage

```python
from color_harmony import ColorIntelligence

ci = ColorIntelligence()

# Get a TEEI color
nordshore = ci.get_color('nordshore')
print(nordshore['hex'])  # "#00393F"

# Check accessibility
contrast = ci.get_contrast_ratio('nordshore', 'white')
print(f"Ratio: {contrast['ratio']}:1")  # 12.8:1
print(f"WCAG AAA: {contrast['wcag_aaa']}")  # True

# Validate a color
validation = ci.validate_color('#C87137')
print(validation['message'])  # "❌ FORBIDDEN: Copper/Orange"

# Get document color scheme
scheme = ci.get_document_scheme('partnership_document')

# Apply color scheme
styled = ci.apply_color_scheme('partnership_document', {
    'header': {},
    'hero': {},
    'metrics': {},
    'cta': {}
})

print(styled['header']['background_color'])  # "#00393F"

# Generate palette
palette = ci.generate_palette('partnership_document')

# Export CSS
css = ci.export_css_variables('partnership_document')
```

### Command Line Interface

**JavaScript CLI:**
```bash
# Generate palette
node color-intelligence.js palette partnership_document

# Validate color
node color-intelligence.js validate "#00393F"

# Check contrast
node color-intelligence.js contrast nordshore white

# Export CSS variables
node color-intelligence.js css partnership_document > teei-colors.css

# Export InDesign swatches
node color-intelligence.js swatches partnership_document > teei-swatches.xml
```

**Python CLI:**
```bash
# Generate palette
python color_harmony.py palette partnership_document

# Validate color
python color_harmony.py validate "#C87137"

# Check contrast
python color_harmony.py contrast nordshore sand

# Export CSS
python color_harmony.py css executive_summary

# Apply scheme
python color_harmony.py apply impact_report
```

---

## Document Types

### 1. Partnership Document (Premium)

**Best for:** AWS partnership, corporate collaborations, executive presentations

**Color Strategy:**
- **Primary:** Nordshore (40%) - Professional, trustworthy
- **Secondary:** Sky (15%), Gold (10%) - Premium accents
- **Background:** Sand (20%), White (10%) - Warm, approachable
- **Accent:** Moss (3%), Clay (2%) - Visual interest

**Color Blocking:**
- **Header:** Nordshore background, white text, gold accent
- **Hero:** Sand background with Nordshore 40% overlay on images
- **Metrics:** Colorful cards (Nordshore, Moss, Gold) with white text
- **CTA:** Gold background, Nordshore button
- **Footer:** Nordshore background, white text

**Psychology:** Trust + Prestige + Warmth

### 2. Program Overview (Approachable)

**Best for:** Community programs, student-facing materials, public communications

**Color Strategy:**
- **Primary:** Nordshore (30%) - Professional foundation
- **Secondary:** Sand (25%), Sky (20%) - Warm, welcoming
- **Background:** White (15%), Beige (2%) - Clean, accessible
- **Accent:** Moss (5%), Gold (3%) - Hope and achievement

**Color Blocking:**
- **Header:** Sand background, Nordshore text, Moss accent
- **Sections:** Alternating white/beige backgrounds
- **Highlights:** Sky cards with Nordshore text
- **CTA:** Moss background, white text

**Psychology:** Warmth + Accessibility + Hope

### 3. Impact Report (Data-Driven)

**Best for:** Annual reports, donor communications, data presentations

**Color Strategy:**
- **Primary:** Nordshore (35%) - Professional credibility
- **Secondary:** Moss (15%), Gold (10%) - Success metrics
- **Background:** White (25%), Beige (8%) - Data clarity
- **Accent:** Sky (5%), Clay (2%) - Visual hierarchy

**Color Blocking:**
- **Header:** Nordshore background, white text, gold accent
- **Data Viz:** Full palette (Nordshore, Moss, Gold, Sky, Clay)
- **Key Metrics:** Moss (positive), Gold (neutral), Clay (urgent)
- **Narrative:** Beige backgrounds with Sand quote cards

**Psychology:** Credibility + Achievement + Impact

### 4. Executive Summary (Minimal)

**Best for:** Board reports, high-level overviews, C-suite communications

**Color Strategy:**
- **Primary:** Nordshore (30%) - Executive professionalism
- **Secondary:** Gold (10%), White (50%) - Sophisticated simplicity
- **Background:** White (50%), Beige (8%) - Clean, focused
- **Accent:** Sky (2%) - Subtle refinement

**Color Blocking:**
- **Header:** White background, Nordshore text, gold border
- **Sections:** Minimal white backgrounds, gold dividers
- **Highlights:** Beige backgrounds for emphasis
- **Conclusion:** Nordshore background, white text

**Psychology:** Sophistication + Clarity + Authority

---

## API Reference

### Core Methods

#### `getColor(colorName)`
Get complete color information for a TEEI color.

**Parameters:**
- `colorName` (string) - Name of TEEI color ('nordshore', 'sky', 'sand', etc.)

**Returns:** Object with hex, rgb, cmyk, hsl, usage, accessibility

**Example:**
```javascript
const gold = colorIntelligence.getColor('gold');
// { name: 'Gold', hex: '#BA8F5A', rgb: {r:186, g:143, b:90}, ... }
```

#### `getContrastRatio(color1, color2)`
Calculate contrast ratio between two colors for accessibility.

**Parameters:**
- `color1` (string) - First TEEI color name
- `color2` (string) - Second TEEI color name

**Returns:** Object with ratio, WCAG compliance levels

**Example:**
```javascript
const contrast = colorIntelligence.getContrastRatio('nordshore', 'white');
// { ratio: 12.8, wcag_aa_normal: true, wcag_aaa: true }
```

#### `validateAccessibility(textColor, bgColor, textSize)`
Check if text/background combination meets accessibility standards.

**Parameters:**
- `textColor` (string) - Text color name
- `bgColor` (string) - Background color name
- `textSize` (string) - 'normal' or 'large'

**Returns:** Object with validation result and recommendations

**Example:**
```javascript
const check = colorIntelligence.validateAccessibility('gold', 'white', 'normal');
// { passes: false, recommendation: "Low contrast (3.2). Use bolder text..." }
```

#### `validateColor(hexColor)`
Validate if a hex color is allowed in TEEI brand.

**Parameters:**
- `hexColor` (string) - Hex color code (e.g., '#00393F')

**Returns:** Object with validation status, type, message, suggestion

**Example:**
```javascript
colorIntelligence.validateColor('#C87137');
// { valid: false, type: 'forbidden', message: '❌ FORBIDDEN: Copper/Orange' }

colorIntelligence.validateColor('#00393F');
// { valid: true, type: 'official', name: 'Nordshore', message: '✅ Official...' }
```

#### `getDocumentScheme(documentType)`
Get complete color scheme for a document type.

**Parameters:**
- `documentType` (string) - 'partnership_document', 'program_overview', 'impact_report', 'executive_summary'

**Returns:** Object with colors, color_blocking strategy, usage_distribution

**Example:**
```javascript
const scheme = colorIntelligence.getDocumentScheme('partnership_document');
// { name: 'Partnership Document (Premium)', primary_color: 'nordshore', ... }
```

#### `applyColorScheme(documentType, elements)`
Apply color scheme to document elements.

**Parameters:**
- `documentType` (string) - Document type
- `elements` (object) - Elements to style (header, hero, metrics, cta, footer)

**Returns:** Object with styled elements (backgroundColor, textColor, etc.)

**Example:**
```javascript
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: { title: 'Partnership Document' },
  cta: { text: 'Get Started' }
});
// { header: { backgroundColor: '#00393F', textColor: '#FFFFFF', ... } }
```

#### `generatePalette(documentType)`
Generate complete color palette with all values.

**Parameters:**
- `documentType` (string) - Document type

**Returns:** Object with primary, secondary, accent, background colors (hex, rgb, cmyk)

**Example:**
```javascript
const palette = colorIntelligence.generatePalette('impact_report');
// { primary: { name: 'nordshore', hex: '#00393F', rgb: {...}, cmyk: {...} }, ... }
```

#### `generateOverlay(overlayType)`
Generate image overlay configuration.

**Parameters:**
- `overlayType` (string) - 'dark_overlay', 'light_overlay', 'gradient_overlay'

**Returns:** Object with color, opacity, blend mode, RGBA string

**Example:**
```javascript
const overlay = colorIntelligence.generateOverlay('dark_overlay');
// { color: 'nordshore', opacity_range: [0.4, 0.6], rgbaColor: 'rgba(0,57,63,0.4)' }
```

#### `exportCSSVariables(documentType)`
Export color scheme as CSS custom properties.

**Parameters:**
- `documentType` (string) - Document type

**Returns:** String with CSS :root {} variable declarations

**Example:**
```javascript
const css = colorIntelligence.exportCSSVariables('partnership_document');
// ":root {\n  --teei-primary: #00393F;\n  --teei-sky: #C9E4EC;\n  ..."
```

#### `exportInDesignSwatches(documentType)`
Export color scheme as InDesign swatch XML.

**Parameters:**
- `documentType` (string) - Document type

**Returns:** String with InDesign-compatible XML

**Example:**
```javascript
const xml = colorIntelligence.exportInDesignSwatches('program_overview');
// "<?xml version="1.0"?>\n<Swatches>\n  <Swatch Name="nordshore" ..."
```

---

## Advanced Usage

### Custom Color Harmonies

```javascript
// Get complementary colors
const complements = colorIntelligence.getComplementaryColors('nordshore');
// ['gold']

// Get analogous colors
const analogous = colorIntelligence.getAnalogousColors('nordshore');
// ['sky', 'moss']

// Get triadic colors
const triadic = colorIntelligence.getTriadicColors('nordshore');
// ['gold', 'moss']
```

### Color Psychology

```javascript
// Get usage recommendations
const recommendations = colorIntelligence.getColorUsageRecommendations('moss');
// {
//   name: 'Moss',
//   psychology: { emotions: ['growth', 'sustainability'], ... },
//   usage: ['progress_indicators', 'success_states'],
//   pairs_well_with: ['sand', 'beige', 'white']
// }
```

### Document Validation

```javascript
// Validate all colors used in a document
const usedColors = ['#00393F', '#BA8F5A', '#FFFFFF', '#C87137'];
const report = colorIntelligence.validateDocumentColors(usedColors);
// {
//   passes: false,
//   valid_colors: [{ hex: '#00393F', name: 'Nordshore' }, ...],
//   forbidden_colors: [{ hex: '#C87137', name: 'Copper/Orange' }],
//   warnings: ['Nordshore usage is 25%, should be 40-80%']
// }
```

### Gradient Generation

```javascript
// Get CSS gradient for section background
const gradientConfig = {
  colors: ['white', 'sky'],
  direction: 'to bottom',
  opacity: 0.3
};
const gradient = colorIntelligence.getCSSGradient(gradientConfig);
// "linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(201,228,236,0.3))"
```

---

## Integration Examples

### InDesign Automation (Python)

```python
from color_harmony import ColorIntelligence
import sys
sys.path.insert(0, 'adb-mcp/mcp')
from core import init, sendCommand, createCommand
import socket_client

# Initialize
ci = ColorIntelligence()
APPLICATION = "indesign"
socket_client.configure(app=APPLICATION, url='http://localhost:8013', timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    return sendCommand(createCommand(action, options))

# Get partnership document colors
scheme = ci.get_document_scheme('partnership_document')
header = scheme['color_blocking']['header']

# Apply to InDesign document
cmd("setTextColor", {
    "elementId": "header-text",
    "color": ci.get_rgb(header['text'])
})

cmd("setBackgroundColor", {
    "elementId": "header-background",
    "color": ci.get_rgb(header['background'])
})

# Create overlay for hero image
overlay = ci.generate_overlay('dark_overlay')
cmd("applyOverlay", {
    "imageId": "hero-image",
    "color": ci.get_rgb(overlay['color']),
    "opacity": overlay['opacity_range'][0]
})
```

### HTML/CSS Generation

```javascript
const colorIntelligence = require('./color-intelligence.js');
const fs = require('fs');

// Generate CSS file for partnership document
const css = colorIntelligence.exportCSSVariables('partnership_document');
fs.writeFileSync('teei-partnership-colors.css', css);

// Apply to HTML template
const scheme = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  hero: {},
  cta: {}
});

const html = `
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="teei-partnership-colors.css">
  <style>
    .header {
      background-color: ${scheme.header.backgroundColor};
      color: ${scheme.header.textColor};
    }
    .hero {
      background-color: ${scheme.hero.backgroundColor};
      position: relative;
    }
    .hero::before {
      content: '';
      position: absolute;
      background: ${scheme.hero.overlay.color};
      opacity: ${scheme.hero.overlay.opacity};
    }
    .cta-button {
      background: ${scheme.cta.button.backgroundColor};
      color: ${scheme.cta.button.textColor};
    }
  </style>
</head>
<body>
  <header class="header">TEEI Partnership</header>
  <section class="hero">
    <img src="hero.jpg" alt="Students">
  </section>
  <button class="cta-button">Partner With Us</button>
</body>
</html>
`;

fs.writeFileSync('partnership-document.html', html);
```

### React Component

```javascript
import colorIntelligence from './color-intelligence.js';

function PartnershipDocument() {
  const scheme = colorIntelligence.applyColorScheme('partnership_document', {
    header: {},
    metrics: {},
    cta: {}
  });

  return (
    <div>
      <header style={{
        backgroundColor: scheme.header.backgroundColor,
        color: scheme.header.textColor
      }}>
        <h1>TEEI AWS Partnership</h1>
      </header>

      <section className="metrics">
        {scheme.metrics.cardBackgrounds.map((bgColor, i) => (
          <div key={i} style={{
            backgroundColor: bgColor,
            color: scheme.metrics.textColor
          }}>
            <h2>50,000+</h2>
            <p>Students Reached</p>
          </div>
        ))}
      </section>

      <section style={{
        backgroundColor: scheme.cta.backgroundColor,
        color: scheme.cta.textColor
      }}>
        <button style={{
          backgroundColor: scheme.cta.button.backgroundColor,
          color: scheme.cta.button.textColor
        }}>
          Get Started
        </button>
      </section>
    </div>
  );
}
```

---

## Accessibility Guidelines

### Contrast Requirements

**WCAG AA (Minimum):**
- Normal text: 4.5:1 contrast ratio
- Large text (18pt+ or 14pt+ bold): 3.0:1 contrast ratio

**WCAG AAA (Enhanced):**
- Normal text: 7.0:1 contrast ratio
- Large text: 4.5:1 contrast ratio

### Safe TEEI Combinations

**✅ Excellent Contrast (WCAG AAA):**
- Nordshore on White (12.8:1)
- Nordshore on Sand (8.2:1)
- Black on White (21.0:1)
- White on Nordshore (12.8:1)

**✅ Good Contrast (WCAG AA):**
- Moss on White (4.8:1)
- Clay on White (6.1:1)
- Clay on Sand (4.2:1)

**⚠️ Use with Caution (Large text only):**
- Gold on White (3.2:1) - Use 18pt+ or bold
- Moss on Sand (3.2:1) - Use 18pt+ or bold

**❌ Avoid:**
- Gold on Sand (2.1:1) - Too low
- Sky on White (1.8:1) - Too low
- Any light color on light background

### Automatic Accessibility

The Color Intelligence System automatically ensures accessibility:

```javascript
// Get safe text color for any background
const textColor = colorIntelligence.getSafeTextColor('nordshore');
// 'white' (highest contrast)

// Validate before using
const check = colorIntelligence.validateAccessibility('white', 'nordshore', 'normal');
// { passes: true, wcag_level: 'AAA', ratio: 12.8 }
```

---

## Troubleshooting

### Issue: "Color not found in TEEI palette"

**Cause:** Using a color name that doesn't exist in the official palette.

**Solution:** Use only these color names:
- `nordshore`, `sky`, `sand`, `beige`, `moss`, `gold`, `clay` (official)
- `white`, `black`, `gray` (neutral)

### Issue: "Low contrast warning"

**Cause:** Text/background combination doesn't meet WCAG standards.

**Solution:**
```javascript
// Check accessibility first
const check = colorIntelligence.validateAccessibility('gold', 'white', 'normal');
if (!check.passes) {
  // Use safe alternative
  const safeColor = colorIntelligence.getSafeTextColor('white');
  // or increase text size to 'large'
}
```

### Issue: Forbidden color detected

**Cause:** Using copper/orange colors not in TEEI palette.

**Solution:**
```javascript
const validation = colorIntelligence.validateColor('#C87137');
if (!validation.valid) {
  // Get TEEI alternative
  const alternative = validation.suggestion;
  console.log(`Use ${alternative.name} (${alternative.hex}) instead`);
}
```

---

## Best Practices

### 1. Start with Document Type

Always begin by selecting the appropriate document scheme:

```javascript
// ✅ Good
const scheme = colorIntelligence.getDocumentScheme('partnership_document');

// ❌ Bad
const colors = ['#00393F', '#BA8F5A', '#C87137']; // Manual, includes forbidden color
```

### 2. Respect Usage Distribution

Follow recommended color percentages:

```javascript
const palette = colorIntelligence.generatePalette('partnership_document');
console.log(palette.usageDistribution);
// { nordshore: 0.40, sky: 0.15, gold: 0.10, ... }

// Nordshore should be 40% of colored elements
// Gold should be ~10% (accents only)
```

### 3. Validate Everything

Always validate colors before using:

```javascript
// ✅ Good
const validation = colorIntelligence.validateColor(userInputColor);
if (validation.valid) {
  applyColor(userInputColor);
} else {
  applyColor(validation.suggestion.hex);
}

// ❌ Bad
applyColor(userInputColor); // No validation
```

### 4. Check Accessibility

Test contrast before finalizing:

```javascript
// ✅ Good
const check = colorIntelligence.validateAccessibility(textColor, bgColor, textSize);
if (!check.passes) {
  console.warn(check.recommendation);
  // Use alternative or adjust design
}

// ❌ Bad
// Assuming colors are accessible without testing
```

### 5. Use Pre-Configured Schemes

Leverage color blocking strategies instead of manual assignment:

```javascript
// ✅ Good
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  metrics: {}
});

// ❌ Bad
const header = {
  backgroundColor: '#00393F', // Manual hex codes
  textColor: '#FFFFFF'
};
```

---

## Testing

### Run Tests

```bash
# JavaScript tests
npm test

# Python tests
python -m pytest test_color_harmony.py

# CLI tests
./test-color-intelligence.sh
```

### Example Test Cases

```javascript
// Test 1: Validate official color
const test1 = colorIntelligence.validateColor('#00393F');
assert(test1.valid === true);
assert(test1.name === 'Nordshore');

// Test 2: Detect forbidden color
const test2 = colorIntelligence.validateColor('#C87137');
assert(test2.valid === false);
assert(test2.type === 'forbidden');

// Test 3: Contrast calculation
const test3 = colorIntelligence.getContrastRatio('nordshore', 'white');
assert(test3.ratio >= 12.0);
assert(test3.wcag_aaa === true);

// Test 4: Safe text color
const test4 = colorIntelligence.getSafeTextColor('nordshore');
assert(test4 === 'white'); // Highest contrast

// Test 5: Document scheme
const test5 = colorIntelligence.getDocumentScheme('partnership_document');
assert(test5.primary_color === 'nordshore');
assert(test5.secondary_colors.includes('sky'));
```

---

## Changelog

### Version 1.0.0 (2025-11-08)
- Initial release
- 7 official TEEI colors configured
- 4 document schemes (partnership, program, impact, executive)
- Accessibility validation (WCAG AA/AAA)
- Color harmony rules (complementary, analogous, triadic)
- JavaScript and Python implementations
- CLI interfaces
- CSS and InDesign export

---

## Support

**Documentation:** See CLAUDE.md for TEEI brand guidelines
**Issues:** Contact Claude Code team
**Examples:** See `/examples/color-intelligence-demos.js`

---

## License

Proprietary - TEEI Internal Use Only
