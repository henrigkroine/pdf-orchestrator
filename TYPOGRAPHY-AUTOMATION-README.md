# Typography Automation System

## World-Class Typography, Automatically Applied

Advanced typography automation that prevents text cutoffs, optimizes readability, and applies TEEI brand standards automatically.

---

## ✨ Features

### 🎯 Core Capabilities

1. **Content-Aware Font Sizing**
   - Automatically calculates optimal font sizes based on content length
   - Prevents text cutoffs by analyzing frame dimensions
   - Maintains brand hierarchy while ensuring text fits

2. **Automatic Text Frame Adjustment**
   - Expands frames when text doesn't fit
   - Reduces font size intelligently (with limits)
   - Applies safety margins to prevent edge cutoffs

3. **Perfect Typography Standards**
   - Optimal line heights (golden ratio for body: 1.618)
   - Professional tracking/kerning (tighter for large, looser for small)
   - TEEI brand hierarchy (42pt → 28pt → 18pt → 11pt → 9pt)

4. **Intelligent Hyphenation & Justification**
   - Context-aware hyphenation (disabled for headlines)
   - Professional justification settings (word/letter spacing)
   - Optimal paragraph composer selection

5. **Column/Page Balancing**
   - Automatically distributes text across columns
   - Balances column heights within 10% tolerance
   - Prevents orphans and widows

---

## 🚀 Quick Start

### JavaScript (Node.js)

```javascript
const TypographyAutomation = require('./scripts/lib/typography-automation');

// Initialize
const automation = new TypographyAutomation();

// Define text elements
const elements = [
  {
    type: 'title',
    content: 'TEEI AWS Partnership',
    frameWidth: 500,
    frameHeight: 100
  },
  {
    type: 'body',
    content: 'Your body text here...',
    frameWidth: 450,
    frameHeight: 300
  }
];

// Apply automatic typography
const result = await automation.applyAutomaticTypography(elements);

// Export styles
const indesignStyles = automation.exportInDesignStyles();
const css = automation.exportCSS();
```

### Python (InDesign MCP)

```python
from typography_automation import TypographyAutomation

# Initialize
automation = TypographyAutomation()

# Define text elements
elements = [
    {
        'type': 'title',
        'content': 'TEEI AWS Partnership',
        'frameWidth': 500,
        'frameHeight': 100
    },
    {
        'type': 'body',
        'content': 'Your body text here...',
        'frameWidth': 450,
        'frameHeight': 300
    }
]

# Apply automatic typography
result = automation.apply_automatic_typography(elements)

# Export InDesign styles
styles = automation.export_indesign_styles()

# Export to JSON
automation.export_to_json('typography-system.json')
```

---

## 📐 TEEI Typography Hierarchy

### Document Title
- **Size:** 42pt
- **Font:** Lora Bold
- **Color:** Nordshore (#00393F)
- **Line Height:** 1.2
- **Tracking:** -0.02em
- **Usage:** Main document title, cover page

### Section Header
- **Size:** 28pt
- **Font:** Lora SemiBold
- **Color:** Nordshore (#00393F)
- **Line Height:** 1.2
- **Tracking:** -0.01em
- **Usage:** Major section divisions

### Subhead
- **Size:** 18pt
- **Font:** Roboto Flex Medium
- **Color:** Nordshore (#00393F)
- **Line Height:** 1.3
- **Tracking:** 0em
- **Usage:** Sub-sections, card titles

### Body Text
- **Size:** 11pt
- **Font:** Roboto Flex Regular
- **Color:** #333333
- **Line Height:** 1.618 (golden ratio)
- **Tracking:** 0em
- **Usage:** Paragraphs, main content

### Caption
- **Size:** 9pt
- **Font:** Roboto Flex Regular
- **Color:** #666666
- **Line Height:** 1.4
- **Tracking:** 0.01em
- **Usage:** Image captions, footnotes

---

## 🔧 Configuration

### Full Configuration Options

```javascript
const config = {
  // Brand settings
  brand: 'TEEI',
  typeScale: 1.250,      // Major Third ratio
  baseSize: 11,          // Body text size

  // Cutoff prevention
  preventCutoffs: true,
  cutoffThreshold: 0.95, // Start adjusting at 95% width
  minFontSizeReduction: 0.5,
  maxFontSizeReduction: 6,

  // Frame padding (safety margins)
  framePadding: {
    left: 10,
    right: 10,
    top: 5,
    bottom: 5
  },

  // Content-aware sizing
  contentAwareSizing: true,
  charCountThresholds: {
    veryShort: 20,
    short: 50,
    medium: 100,
    long: 200,
    veryLong: 300
  },

  // Line height optimization
  autoLineHeight: true,
  lineHeightRules: {
    display: 1.0,
    heading: 1.2,
    subhead: 1.3,
    body: 1.618,
    caption: 1.4
  },

  // Tracking optimization
  autoTracking: true,
  trackingRules: {
    display: -0.02,
    heading: -0.01,
    body: 0,
    small: 0.01,
    allCaps: 0.05
  },

  // Hyphenation
  hyphenation: {
    enabled: true,
    minWordLength: 6,
    minCharsBefore: 3,
    minCharsAfter: 3,
    hyphenationZone: '0.5in',
    consecutiveHyphens: 2
  },

  // Justification
  justification: {
    wordSpacing: {
      min: 80,
      desired: 100,
      max: 133
    },
    letterSpacing: {
      min: -5,
      desired: 0,
      max: 5
    },
    glyphScaling: {
      min: 97,
      desired: 100,
      max: 103
    }
  }
};

const automation = new TypographyAutomation(config);
```

---

## 📊 Element Format

### Input Element Structure

```javascript
{
  // Required
  content: 'Your text content here',
  type: 'title|h2|h3|body|caption',

  // Frame dimensions (optional but recommended)
  frameWidth: 500,      // Points
  frameHeight: 300,     // Points

  // Optional
  importance: 85,       // 0-100 (used if type not specified)
  maxLines: 5,          // Maximum lines allowed
  isAllCaps: false,     // Apply extra tracking if true
  currentSize: 14,      // Current font size
  currentFont: 'Arial'  // Current font
}
```

### Output Element Structure

```javascript
{
  original: { /* Original element */ },
  optimized: {
    // Typography
    font: 'Lora',
    weight: 'Bold',
    fontSize: 42,
    lineHeight: 1.2,
    tracking: -0.02,
    color: '#00393F',

    // Frame adjustments
    frameWidth: 500,
    frameHeight: 100,
    framePadding: { left: 10, right: 10, top: 5, bottom: 5 },

    // Advanced settings
    hyphenation: { enabled: false },
    justification: { enabled: false },
    alignment: 'center',

    // Spacing
    spacing: {
      marginTop: 0,
      marginBottom: 84,
      paragraphSpacing: 31.5
    },

    // Metadata
    hierarchyLevel: 'documentTitle',
    adjustmentsMade: ['fontSize'],
    cutoffPrevented: true,
    confidence: 95
  }
}
```

---

## 🎯 Usage Examples

### Example 1: Prevent Text Cutoff

```javascript
const element = {
  type: 'h2',
  content: 'THE EDUCATIONAL EQUALITY INSTITUTE',
  frameWidth: 400,  // Too narrow for 28pt text
  frameHeight: 80
};

const result = automation.optimizeElement(element);

console.log(result.optimized);
// fontSize: 24 (reduced from 28pt to fit)
// cutoffPrevented: true
// adjustmentsMade: ['fontSize']
```

### Example 2: Apply Hierarchy to Document

```javascript
const elements = [
  {
    type: 'title',
    content: 'TEEI AWS Partnership',
    frameWidth: 500,
    frameHeight: 100
  },
  {
    type: 'h2',
    content: 'Together for Ukraine Program',
    frameWidth: 500,
    frameHeight: 80
  },
  {
    type: 'body',
    content: 'Program description...',
    frameWidth: 450,
    frameHeight: 300
  }
];

const result = await automation.applyAutomaticTypography(elements);

console.log(result.summary);
// {
//   totalElements: 3,
//   hierarchyDistribution: {
//     documentTitle: 1,
//     sectionHeader: 1,
//     bodyText: 1
//   },
//   adjustments: {
//     cutoffsPrevented: 0,
//     sizesOptimized: 0
//   },
//   averageConfidence: 100
// }
```

### Example 3: Balance Columns

```javascript
const elements = [/* array of text elements */];

const balanced = automation.balanceColumns(
  elements,
  2,        // 2 columns
  225,      // 225pt wide per column
  20        // 20pt gutter
);

console.log(balanced);
// {
//   columns: [
//     { elements: [...], currentHeight: 650 },
//     { elements: [...], currentHeight: 640 }
//   ],
//   balanced: true  // Heights within 10% tolerance
// }
```

### Example 4: Export Styles

```javascript
// Export InDesign paragraph styles
const indesignStyles = automation.exportInDesignStyles();
console.log(indesignStyles);
// [
//   {
//     name: 'documentTitle',
//     fontFamily: 'Lora',
//     fontStyle: 'Bold',
//     pointSize: 42,
//     leading: 50,
//     tracking: -20,
//     fillColor: '#00393F',
//     justification: 'center',
//     hyphenation: false,
//     spaceBefore: 0,
//     spaceAfter: 84
//   },
//   // ... more styles
// ]

// Export CSS
const css = automation.exportCSS();
console.log(css);
// .teei-document-title {
//   font-family: 'Lora', serif;
//   font-weight: 700;
//   font-size: 42pt;
//   line-height: 1.2;
//   letter-spacing: -0.02em;
//   color: #00393F;
//   margin-top: 0pt;
//   margin-bottom: 84pt;
//   text-align: center;
// }
```

---

## 🧮 How It Works

### 1. Content-Aware Sizing Algorithm

```
1. Measure content length (character count)
2. Estimate average character width for font
3. Calculate required width = chars × avgCharWidth
4. Calculate width ratio = required / available
5. If ratio > threshold (0.95):
   a. Calculate reduction factor = available / required
   b. Apply reduction to font size
   c. Enforce min/max reduction limits
   d. If reduction too small, expand frame instead
6. Verify result and calculate confidence score
```

### 2. Line Height Optimization

```
Size-based rules:
- 60pt+:  1.0 (tight for display)
- 24-60pt: 1.2 (compact for headings)
- 18-24pt: 1.3 (balanced for subheads)
- 11-18pt: 1.618 (golden ratio for body)
- < 11pt: 1.4 (tighter for small text)
```

### 3. Tracking Optimization

```
Size-based rules:
- 48pt+: -0.02em (tighten large text)
- 24-48pt: -0.01em (slightly tight)
- 11-24pt: 0em (normal)
- < 11pt: 0.01em (open up small text)
- ALL CAPS: 0.05em (much more space)
```

### 4. Hyphenation Logic

```
Enable hyphenation if:
- Content > 50 characters
- Font size ≤ 24pt (not headlines)
- Frame width suitable for reading

Settings:
- Min word length: 6 characters
- Min chars before hyphen: 3
- Min chars after hyphen: 3
- Max consecutive hyphens: 2
```

---

## 📈 Statistics & Reporting

The system tracks comprehensive statistics:

```javascript
{
  stats: {
    elementsProcessed: 15,
    cutoffsPrevented: 3,
    sizesOptimized: 5,
    lineHeightsAdjusted: 15,
    trackingAdjusted: 15
  },
  summary: {
    totalElements: 15,
    hierarchyDistribution: {
      documentTitle: 1,
      sectionHeader: 3,
      subhead: 5,
      bodyText: 5,
      caption: 1
    },
    averageConfidence: 97
  }
}
```

---

## 🔬 Advanced Features

### Custom Typography Scale

```javascript
const automation = new TypographyAutomation({
  typeScale: 1.618  // Golden ratio instead of Major Third
});
```

### Override Hierarchy Levels

```javascript
const customHierarchy = {
  documentTitle: {
    size: 48,  // Larger title
    font: 'Lora',
    weight: 'Bold',
    // ... other properties
  }
};

const automation = new TypographyAutomation({
  teeiHierarchy: customHierarchy
});
```

### Disable Specific Features

```javascript
const automation = new TypographyAutomation({
  preventCutoffs: false,      // Disable cutoff prevention
  autoLineHeight: false,      // Disable line height optimization
  autoTracking: false,        // Disable tracking optimization
  contentAwareSizing: false   // Disable content-aware sizing
});
```

---

## 🎓 Best Practices

### 1. Always Provide Frame Dimensions

```javascript
// ✅ Good
{
  content: 'Text here',
  frameWidth: 450,
  frameHeight: 300
}

// ❌ Bad (can't prevent cutoffs)
{
  content: 'Text here'
}
```

### 2. Use Hierarchy Types Consistently

```javascript
// ✅ Good
elements = [
  { type: 'title', ... },
  { type: 'h2', ... },
  { type: 'body', ... }
]

// ⚠️ OK but less clear
elements = [
  { importance: 95, ... },
  { importance: 80, ... },
  { importance: 50, ... }
]
```

### 3. Test at Multiple Sizes

```javascript
// Test with varying content lengths
const shortText = { content: 'TEEI', ... };
const mediumText = { content: 'Together for Ukraine Program', ... };
const longText = { content: 'Long paragraph...', ... };

[shortText, mediumText, longText].forEach(element => {
  const result = automation.optimizeElement(element);
  console.log(`${element.content}: ${result.optimized.fontSize}pt`);
});
```

### 4. Review Confidence Scores

```javascript
const result = automation.optimizeElement(element);

if (result.optimized.confidence < 80) {
  console.warn('Low confidence - manual review recommended');
  console.log('Adjustments:', result.optimized.adjustmentsMade);
}
```

---

## 🐛 Troubleshooting

### Text Still Cutting Off

**Problem:** Text gets cut off despite automation

**Solutions:**
1. Check frame dimensions are provided
2. Increase `cutoffThreshold` (e.g., 0.90 instead of 0.95)
3. Increase `maxFontSizeReduction`
4. Add more `framePadding`

```javascript
const automation = new TypographyAutomation({
  cutoffThreshold: 0.90,
  maxFontSizeReduction: 10,
  framePadding: { left: 15, right: 15, top: 10, bottom: 10 }
});
```

### Font Size Too Small

**Problem:** Optimized font size is too small to read

**Solutions:**
1. Increase `minFontSizeReduction` (reduce less aggressively)
2. Allow frame expansion
3. Use shorter content

```javascript
const automation = new TypographyAutomation({
  minFontSizeReduction: 1,  // Only reduce if at least 1pt benefit
  maxFontSizeReduction: 4   // Never reduce more than 4pt
});
```

### Hierarchy Not Applied

**Problem:** Elements not getting correct hierarchy level

**Solutions:**
1. Use explicit `type` property
2. Adjust `importance` scores
3. Customize hierarchy logic

```javascript
// ✅ Explicit type
{ type: 'h2', content: 'Section Header', ... }

// ✅ High importance
{ importance: 85, content: 'Important Header', ... }
```

---

## 📚 Related Documentation

- **Typography Config:** `/home/user/pdf-orchestrator/config/typography-config.json`
- **TEEI Brand Guidelines:** `/home/user/pdf-orchestrator/reports/TEEI_AWS_Design_Fix_Report.md`
- **Typography Inspector:** `/home/user/pdf-orchestrator/scripts/lib/typography-inspector.js`
- **Typography Optimizer:** `/home/user/pdf-orchestrator/scripts/lib/typography-optimizer.js`

---

## 🤝 Contributing

### Adding New Hierarchy Levels

```javascript
// In configuration
teeiHierarchy: {
  // Add custom level
  pullQuote: {
    size: 16,
    font: 'Lora',
    weight: 'Medium',
    color: '#65873B',
    lineHeight: 1.4,
    tracking: 0,
    usage: 'Pull quotes, callouts'
  }
}
```

### Extending Character Width Estimation

```javascript
// In TypographyAutomation class
CHAR_WIDTH_FACTORS = {
  'Lora': 0.55,
  'Roboto Flex': 0.52,
  // Add new font
  'Montserrat': 0.54,
  'Open Sans': 0.53
}
```

---

## 📝 License

Part of the TEEI PDF Orchestrator project.

---

## 🙏 Acknowledgments

Based on professional typography standards from:
- **Robert Bringhurst** - The Elements of Typographic Style
- **Ellen Lupton** - Thinking with Type
- **Matthew Butterick** - Butterick's Practical Typography
- **WCAG 2.1** - Web Content Accessibility Guidelines

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Status:** Production Ready ✅
