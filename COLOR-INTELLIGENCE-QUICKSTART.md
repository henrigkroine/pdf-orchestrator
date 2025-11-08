# Color Intelligence Quick Start Guide

**Get started with TEEI Color Intelligence in 5 minutes**

---

## 30-Second Overview

The TEEI Color Intelligence System automatically applies professional, brand-compliant color schemes to your documents. Just pick a document type and the system does the rest.

```javascript
// That's it!
const styled = colorIntelligence.applyColorScheme('partnership_document', { header: {} });
console.log(styled.header.backgroundColor); // "#00393F" (Nordshore)
```

---

## Quick Start (JavaScript)

### 1. Import the System

```javascript
const colorIntelligence = require('./color-intelligence.js');
```

### 2. Choose Your Document Type

- `partnership_document` - Premium partnership materials (AWS, corporate)
- `program_overview` - Community-focused materials (students, public)
- `impact_report` - Data-rich reports (donors, board)
- `executive_summary` - High-level summaries (C-suite)

### 3. Apply Colors

```javascript
// Apply automatic color scheme
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  metrics: {},
  cta: {}
});

// Use the colors
document.querySelector('.header').style.backgroundColor = styled.header.backgroundColor;
document.querySelector('.header h1').style.color = styled.header.textColor;
```

### 4. Validate (Optional)

```javascript
// Check if a color is allowed
const validation = colorIntelligence.validateColor('#C87137');
console.log(validation.message); // "❌ FORBIDDEN: Copper/Orange"

// Check accessibility
const contrast = colorIntelligence.getContrastRatio('nordshore', 'white');
console.log(contrast.ratio); // 12.8:1 ✅
```

---

## Quick Start (Python)

### 1. Import the System

```python
from color_harmony import ColorIntelligence

ci = ColorIntelligence()
```

### 2. Apply Colors

```python
# Apply automatic color scheme
styled = ci.apply_color_scheme('partnership_document', {
    'header': {},
    'metrics': {},
    'cta': {}
})

# Use the colors
header_bg = styled['header']['background_color']  # "#00393F"
header_text = styled['header']['text_color']      # "#FFFFFF"
```

### 3. Use with InDesign Automation

```python
# Full integration example
python apply_colors_intelligent.py partnership_document
```

---

## Command Line Quick Start

### JavaScript CLI

```bash
# Get color palette
node color-intelligence.js palette partnership_document

# Validate a color
node color-intelligence.js validate "#00393F"

# Check contrast
node color-intelligence.js contrast nordshore white

# Export CSS
node color-intelligence.js css partnership_document > colors.css
```

### Python CLI

```bash
# Get color palette
python color_harmony.py palette partnership_document

# Validate a color
python color_harmony.py validate "#C87137"

# Check contrast
python color_harmony.py contrast nordshore sand

# Apply to InDesign
python apply_colors_intelligent.py partnership_document
```

---

## Common Use Cases

### Use Case 1: Creating a Partnership Document

```javascript
const colorIntelligence = require('./color-intelligence.js');

// Get complete color scheme
const scheme = colorIntelligence.getDocumentScheme('partnership_document');

// Apply to elements
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: { title: 'TEEI × AWS Partnership' },
  metrics: { items: ['50,000+ Students', '12 Programs', '95% Success'] },
  cta: { text: 'Partner With Us' }
});

// Use in your HTML/React/etc
console.log(styled.header.backgroundColor);  // "#00393F" (Nordshore)
console.log(styled.metrics.cardBackgrounds); // ["#00393F", "#65873B", "#BA8F5A"]
console.log(styled.cta.button.backgroundColor); // "#00393F" (Nordshore)
```

**Result:** Professional partnership document with perfect color harmony and accessibility.

### Use Case 2: Validating External Design

```javascript
// Designer sends you colors - validate them!
const designerColors = ['#00393F', '#C87137', '#BA8F5A'];

designerColors.forEach(color => {
  const validation = colorIntelligence.validateColor(color);
  console.log(`${color} → ${validation.message}`);
});

// Output:
// #00393F → ✅ Official TEEI color: Nordshore
// #C87137 → ❌ FORBIDDEN: Copper/Orange. Reason: Not in TEEI brand palette
// #BA8F5A → ✅ Official TEEI color: Gold
```

**Result:** Catch brand violations before they go to print!

### Use Case 3: Ensuring Accessibility

```javascript
// Check if text is readable on background
const check = colorIntelligence.validateAccessibility('gold', 'white', 'normal');

if (!check.passes) {
  console.log(check.recommendation);
  // "Low contrast (3.2). Use bolder text or choose different colors."

  // Get safe alternative
  const safeColor = colorIntelligence.getSafeTextColor('white');
  console.log(`Use ${safeColor} instead`); // "Use nordshore instead"
}
```

**Result:** WCAG AA/AAA compliant documents automatically.

### Use Case 4: Image Overlays

```javascript
// Apply Nordshore overlay to hero image
const overlay = colorIntelligence.generateOverlay('dark_overlay');

console.log(overlay.hexColor);    // "#00393F"
console.log(overlay.rgbaColor);   // "rgba(0, 57, 63, 0.4)"
console.log(overlay.opacity_range); // [0.4, 0.6]

// Apply to CSS
document.querySelector('.hero::before').style.background = overlay.rgbaColor;
```

**Result:** Perfect photo overlays for white text readability.

---

## 5-Minute Example: Complete Document

```javascript
const colorIntelligence = require('./color-intelligence.js');

// 1. Pick document type
const docType = 'partnership_document';

// 2. Get full palette
const palette = colorIntelligence.generatePalette(docType);
console.log(palette.name); // "Partnership Document (Premium)"

// 3. Apply to all sections
const styled = colorIntelligence.applyColorScheme(docType, {
  header: {},
  hero: {},
  metrics: {},
  cta: {},
  footer: {}
});

// 4. Use the colors
const css = `
  .header {
    background: ${styled.header.backgroundColor};
    color: ${styled.header.textColor};
  }

  .hero::before {
    background: ${styled.hero.overlay.color};
    opacity: ${styled.hero.overlay.opacity};
  }

  .metric-card-1 { background: ${styled.metrics.cardBackgrounds[0]}; }
  .metric-card-2 { background: ${styled.metrics.cardBackgrounds[1]}; }
  .metric-card-3 { background: ${styled.metrics.cardBackgrounds[2]}; }

  .cta-button {
    background: ${styled.cta.button.backgroundColor};
    color: ${styled.cta.button.textColor};
  }

  .footer {
    background: ${styled.footer.backgroundColor};
    color: ${styled.footer.textColor};
  }
`;

// 5. Export for reuse
const cssVars = colorIntelligence.exportCSSVariables(docType);
require('fs').writeFileSync('partnership-colors.css', cssVars);
```

**Result:** Complete, brand-compliant document in 5 minutes!

---

## Available TEEI Colors

### Official Colors (Use These!)

| Color      | Hex       | RGB             | Usage                           | Percentage |
|------------|-----------|-----------------|----------------------------------|------------|
| Nordshore  | `#00393F` | (0, 57, 63)     | Primary brand color, headers     | 40-80%     |
| Sky        | `#C9E4EC` | (201, 228, 236) | Backgrounds, highlights          | 10-15%     |
| Sand       | `#FFF1E2` | (255, 241, 226) | Warm backgrounds                 | 5-20%      |
| Beige      | `#EFE1DC` | (239, 225, 220) | Neutral backgrounds              | 2-8%       |
| Moss       | `#65873B` | (101, 135, 59)  | Progress, success, growth        | 3-5%       |
| Gold       | `#BA8F5A` | (186, 143, 90)  | Premium accents, metrics         | 5-10%      |
| Clay       | `#913B2F` | (145, 59, 47)   | Urgency, call-to-action          | 2-3%       |

### Neutral Colors

| Color | Hex       | RGB           | Usage           |
|-------|-----------|---------------|-----------------|
| White | `#FFFFFF` | (255, 255, 255) | Backgrounds, text |
| Black | `#000000` | (0, 0, 0)     | Body text       |
| Gray  | `#666666` | (102, 102, 102) | Captions        |

### Forbidden Colors

❌ **NEVER USE:** Copper/Orange (#C87137, #FF6B35, etc.)
**Exception:** AWS logo only (partner branding)

---

## Document Type Recommendations

### Partnership Document
- **Use when:** AWS partnership, corporate collaborations
- **Primary color:** Nordshore (40%)
- **Feel:** Professional, trustworthy, premium
- **Key elements:** Gold accents, Nordshore overlay on images

### Program Overview
- **Use when:** Community programs, student materials
- **Primary color:** Nordshore (30%), Sand (25%)
- **Feel:** Warm, approachable, welcoming
- **Key elements:** Sand backgrounds, Moss for success

### Impact Report
- **Use when:** Annual reports, donor communications
- **Primary color:** Nordshore (35%), Moss (15%)
- **Feel:** Credible, data-driven, impactful
- **Key elements:** Multiple accent colors for data viz

### Executive Summary
- **Use when:** Board reports, C-suite materials
- **Primary color:** Nordshore (30%), White (50%)
- **Feel:** Sophisticated, minimal, authoritative
- **Key elements:** Clean white space, gold dividers

---

## Cheat Sheet

### Most Common Commands

```javascript
// Get a color
colorIntelligence.getHex('nordshore') // "#00393F"

// Check accessibility
colorIntelligence.getContrastRatio('nordshore', 'white') // {ratio: 12.8, wcag_aaa: true}

// Validate color
colorIntelligence.validateColor('#C87137') // {valid: false, type: 'forbidden'}

// Apply scheme
colorIntelligence.applyColorScheme('partnership_document', {header: {}})

// Generate palette
colorIntelligence.generatePalette('partnership_document')

// Export CSS
colorIntelligence.exportCSSVariables('partnership_document')
```

### Most Common Python Commands

```python
from color_harmony import ColorIntelligence
ci = ColorIntelligence()

# Get a color
ci.get_hex('nordshore')  # "#00393F"

# Check accessibility
ci.get_contrast_ratio('nordshore', 'white')  # {'ratio': 12.8, 'wcag_aaa': True}

# Validate color
ci.validate_color('#C87137')  # {'valid': False, 'type': 'forbidden'}

# Apply scheme
ci.apply_color_scheme('partnership_document', {'header': {}})

# Generate palette
ci.generate_palette('partnership_document')
```

---

## Troubleshooting

**Q: How do I know which document type to use?**
A: Partnership documents for corporate, program overviews for community, impact reports for data, executive summaries for leadership.

**Q: Can I mix colors from different document types?**
A: Yes, but stick to one document type's scheme for consistency. All use the same 7 TEEI colors.

**Q: What if my text has low contrast?**
A: Use `getSafeTextColor(background)` to automatically select highest contrast text color.

**Q: How do I handle partner logos (like AWS)?**
A: Partner logos can use their own colors (e.g., AWS orange). Only TEEI-branded elements must use TEEI colors.

**Q: Can I create custom document schemes?**
A: Yes! Edit `color-harmony-config.json` and add your scheme. Follow the existing pattern.

---

## Next Steps

1. **Try the demos:** `node examples/color-intelligence-demos.js`
2. **Read full docs:** `COLOR-INTELLIGENCE-README.md`
3. **Integrate with your project:** Use `apply_colors_intelligent.py` for InDesign
4. **Export CSS:** `node color-intelligence.js css partnership_document > colors.css`
5. **Validate your work:** `colorIntelligence.validateDocumentColors(usedColors)`

---

## Support

- **Full Documentation:** COLOR-INTELLIGENCE-README.md
- **Examples:** examples/color-intelligence-demos.js
- **Brand Guidelines:** CLAUDE.md
- **Design Standards:** reports/TEEI_AWS_Design_Fix_Report.md

---

**Ready to create world-class TEEI documents with perfect color harmony!** 🎨✨
