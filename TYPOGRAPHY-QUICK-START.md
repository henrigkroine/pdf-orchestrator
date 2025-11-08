# Typography Automation - Quick Start Guide

## Get Started in 5 Minutes

### 🚀 Installation

No installation needed! The system is ready to use.

**Requirements:**
- Python 3.7+ (for InDesign automation)
- Node.js 16+ (for JavaScript/web usage)

---

## 📝 Usage

### Option 1: Python (Recommended for InDesign)

```python
from typography_automation import TypographyAutomation

# Initialize
automation = TypographyAutomation()

# Define your text elements
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
```

**Run the example:**
```bash
python3 typography_automation.py
```

### Option 2: JavaScript (For Node.js/web)

```javascript
const TypographyAutomation = require('./scripts/lib/typography-automation');

const automation = new TypographyAutomation();

const elements = [
    {
        type: 'title',
        content: 'TEEI AWS Partnership',
        frameWidth: 500,
        frameHeight: 100
    }
];

const result = await automation.applyAutomaticTypography(elements);
```

### Option 3: Command Line

```bash
# Create input file (sample-input.json)
{
  "elements": [
    {
      "type": "title",
      "content": "Your Title",
      "frameWidth": 500,
      "frameHeight": 100
    }
  ]
}

# Run automation
node scripts/apply-typography-automation.js sample-input.json

# Export CSS and InDesign styles
node scripts/apply-typography-automation.js sample-input.json --css --indesign
```

---

## 📊 Element Types

| Type | Font | Size | Usage |
|------|------|------|-------|
| `title` | Lora Bold | 42pt | Document titles |
| `h2` | Lora SemiBold | 28pt | Section headers |
| `h3` | Roboto Flex Medium | 18pt | Subheadings |
| `body` | Roboto Flex Regular | 11pt | Body text |
| `caption` | Roboto Flex Regular | 9pt | Captions |

---

## 🎯 Common Tasks

### Prevent Text Cutoffs

```python
element = {
    'type': 'h2',
    'content': 'THE EDUCATIONAL EQUALITY INSTITUTE',
    'frameWidth': 400,  # Too narrow
    'frameHeight': 80
}

result = automation.optimize_element(element)
print(f"Adjusted: {result['optimized']['fontSize']}pt")
# Output: Adjusted: 24pt (reduced from 28pt)
```

### Apply Hierarchy to Entire Document

```python
elements = [
    {'type': 'title', 'content': 'Main Title', ...},
    {'type': 'h2', 'content': 'Section 1', ...},
    {'type': 'body', 'content': 'Paragraph...', ...}
]

result = automation.apply_automatic_typography(elements)

# Access optimized elements
for el in result['elements']:
    print(f"{el['optimized']['hierarchyLevel']}: {el['optimized']['fontSize']}pt")
```

### Export for InDesign

```python
# Get InDesign paragraph styles
styles = automation.export_indesign_styles()

# Save to JSON for import
automation.export_to_json('typography-styles.json')

# Use in InDesign automation
for style in styles:
    print(f"{style['name']}: {style['pointSize']}pt {style['fontFamily']}")
```

---

## 📦 Output Format

```python
{
    'elements': [
        {
            'original': {...},  # Your input
            'optimized': {
                'font': 'Lora',
                'weight': 'Bold',
                'fontSize': 42,
                'lineHeight': 1.2,
                'tracking': -0.02,
                'color': '#00393F',
                'frameWidth': 500,
                'frameHeight': 100,
                'alignment': 'center',
                'spacing': {
                    'marginTop': 0,
                    'marginBottom': 84,
                    'paragraphSpacing': 31.5
                },
                'hierarchyLevel': 'documentTitle',
                'cutoffPrevented': False,
                'confidence': 100
            }
        }
    ],
    'stats': {
        'elementsProcessed': 1,
        'cutoffsPrevented': 0,
        'sizesOptimized': 0
    },
    'summary': {
        'totalElements': 1,
        'averageConfidence': 100
    }
}
```

---

## 🔧 Configuration

### Customize Settings

```python
automation = TypographyAutomation({
    'preventCutoffs': True,          # Enable cutoff prevention
    'cutoffThreshold': 0.95,         # Start adjusting at 95% width
    'minFontSizeReduction': 0.5,     # Min reduction: 0.5pt
    'maxFontSizeReduction': 6,       # Max reduction: 6pt
    'framePadding': {
        'left': 10,
        'right': 10,
        'top': 5,
        'bottom': 5
    }
})
```

### Disable Features

```python
automation = TypographyAutomation({
    'preventCutoffs': False,     # Disable cutoff prevention
})
```

---

## ✅ Testing

### Run Example

```bash
# Python
python3 typography_automation.py

# JavaScript
node scripts/apply-typography-automation.js --example
```

### Test Sample Document

```bash
# Apply automation to sample
node scripts/apply-typography-automation.js examples/typography/sample-input.json

# View output
cat examples/typography/sample-input-optimized.json
```

---

## 📚 Next Steps

1. **Read Full Documentation:** `TYPOGRAPHY-AUTOMATION-README.md`
2. **Review Examples:** `examples/typography/`
3. **Check Configuration:** `config/typography-config.json`
4. **Integration Guide:** See integration examples below

---

## 🔗 Integration Examples

### InDesign Automation (Python)

```python
from typography_automation import TypographyAutomation

# Initialize
automation = TypographyAutomation()

# Get document elements from InDesign
# (using Adobe InDesign MCP)
doc_elements = [...]

# Apply typography
result = automation.apply_automatic_typography(doc_elements)

# Apply styles to InDesign document
for element in result['elements']:
    opt = element['optimized']

    # Set text properties
    # textFrame.pointSize = opt['fontSize']
    # textFrame.fontFamily = opt['font']
    # textFrame.leading = opt['fontSize'] * opt['lineHeight']
    # etc.
```

### HTML/CSS Export

```python
# Export CSS stylesheet
automation = TypographyAutomation()
css = automation.export_css()

# Save to file
with open('typography.css', 'w') as f:
    f.write(css)

# Use in HTML
# <link rel="stylesheet" href="typography.css">
# <h1 class="teei-document-title">Title</h1>
```

### JSON API

```python
import json

# Export complete system
automation = TypographyAutomation()
automation.export_to_json('typography-system.json')

# Load in another application
with open('typography-system.json') as f:
    system = json.load(f)

hierarchy = system['hierarchy']
styles = system['styles']
```

---

## 🐛 Common Issues

### Issue: Text still cutting off

**Solution:** Increase `maxFontSizeReduction` or provide larger `frameWidth`

```python
automation = TypographyAutomation({
    'maxFontSizeReduction': 10,  # Allow more reduction
})
```

### Issue: Font size too small

**Solution:** Decrease `maxFontSizeReduction` or enable frame expansion

```python
automation = TypographyAutomation({
    'maxFontSizeReduction': 4,  # Reduce less aggressively
})
```

### Issue: Low confidence scores

**Solution:** Review frame dimensions and content length

```python
result = automation.optimize_element(element)
if result['optimized']['confidence'] < 80:
    print(f"Warning: Low confidence ({result['optimized']['confidence']}%)")
    print(f"Adjustments: {result['optimized']['adjustmentsMade']}")
```

---

## 📞 Support

- **Documentation:** `TYPOGRAPHY-AUTOMATION-README.md`
- **Examples:** `examples/typography/`
- **Config Reference:** `config/typography-config.json`
- **TEEI Guidelines:** `reports/TEEI_AWS_Design_Fix_Report.md`

---

**Quick Reference Card**

```python
# Initialize
automation = TypographyAutomation()

# Single element
result = automation.optimize_element({'type': 'title', 'content': '...'})

# Multiple elements
result = automation.apply_automatic_typography(elements)

# Export styles
styles = automation.export_indesign_styles()

# Export JSON
automation.export_to_json('output.json')
```

---

**Last Updated:** 2025-11-08
**Status:** Production Ready ✅
