# Brand Enforcement System - Quick Start Guide

**Get started in 5 minutes**

---

## What This Does

Makes it **IMPOSSIBLE** to create non-compliant TEEI documents by enforcing brand guidelines in real-time:

- ❌ **Blocks** forbidden colors (copper, orange)
- ✅ **Auto-corrects** to official TEEI palette
- ❌ **Blocks** forbidden fonts (Arial, Helvetica, etc.)
- ✅ **Auto-corrects** to Lora/Roboto Flex
- ❌ **Blocks** placeholder metrics ("XX Students")
- ❌ **Blocks** text cutoffs ("Transform Educa-")
- ✅ **Auto-adjusts** text frames to prevent cutoffs
- ✅ **Enforces** 40pt margins, 60pt/20pt/12pt spacing

---

## Installation

### Prerequisites

Already installed - no additional dependencies needed!

- Python 3.7+ (already installed)
- Node.js 14+ (already installed)
- Brand compliance config (already exists at `config/brand-compliance-config.json`)

### Verify Installation

```bash
# Test Python version
python3 brand_compliance_enforcer.py

# Test Node.js version
node brand-enforcer.js
```

You should see enforcement tests with violations detected and corrected.

---

## Quick Start: Python

### 1. Import and Initialize

```python
from brand_compliance_enforcer import BrandEnforcer

# Strict mode (recommended for production)
enforcer = BrandEnforcer(strict_mode=True, auto_correct=True)
```

### 2. Enforce Colors

```python
# This will auto-correct copper to Nordshore
color_name, rgb = enforcer.enforce_color("#C87137", "header")
# → ("Nordshore", [0, 57, 63])
```

### 3. Enforce Fonts

```python
# This will auto-correct Arial to Lora
font = enforcer.enforce_font("Arial", "headline")
# → "Lora"
```

### 4. Get Type Specifications

```python
# Get complete typography spec
spec = enforcer.get_type_spec("documentTitle")
# → {
#     'font': 'Lora Bold',
#     'size': 42,
#     'lineHeight': 1.2,
#     'color': 'Nordshore',
#     'colorRgb': [0, 57, 63]
# }
```

### 5. Generate Report

```python
# Print compliance report
enforcer.print_report()
```

---

## Quick Start: JavaScript

### 1. Import and Initialize

```javascript
const { BrandEnforcer } = require('./brand-enforcer');

// Strict mode (recommended for production)
const enforcer = new BrandEnforcer({ strictMode: true, autoCorrect: true });
```

### 2. Enforce Colors

```javascript
// This will auto-correct copper to Nordshore
const { colorName, rgb } = enforcer.enforceColor('#C87137', 'header');
// → { colorName: 'Nordshore', rgb: [0, 57, 63] }
```

### 3. Enforce Fonts

```javascript
// This will auto-correct Arial to Lora
const font = enforcer.enforceFont('Arial', 'headline');
// → 'Lora'
```

### 4. Get Type Specifications

```javascript
// Get complete typography spec
const spec = enforcer.getTypeSpec('documentTitle');
// → {
//     font: 'Lora Bold',
//     size: 42,
//     lineHeight: 1.2,
//     color: 'Nordshore',
//     colorRgb: [0, 57, 63]
// }
```

### 5. Generate Report

```javascript
// Print compliance report
enforcer.printReport();
```

---

## Complete Example

### Create Enforced Document

```bash
# Run the example script
python3 create_with_enforcement.py
```

This demonstrates:
1. Color enforcement (copper → Nordshore)
2. Font enforcement (Arial → Lora)
3. Content validation (blocks "XX Students")
4. Text cutoff prevention
5. Typography specifications
6. Spacing enforcement
7. Compliance reporting

---

## Common Use Cases

### Use Case 1: Validate User Input

```python
from brand_compliance_enforcer import BrandEnforcer

enforcer = BrandEnforcer()

# User provides color
user_color = "#C87137"  # Copper

# Enforce compliance
color_name, rgb = enforcer.enforce_color(user_color, "user-provided color")
# Auto-corrected to Nordshore

# Use enforced color
create_rectangle(color=rgb)
```

---

### Use Case 2: Prevent Placeholder Metrics

```python
from brand_compliance_enforcer import BrandEnforcer

enforcer = BrandEnforcer()

# User provides metric text
metric_text = "XX Students Reached"

try:
    enforcer.enforce_metrics(metric_text)
    # Use in document
    create_metric(text=metric_text)
except ValueError as e:
    # Placeholder detected - prompt for real data
    print(f"Error: {e}")
    metric_text = prompt_user("Enter actual student count:")
```

---

### Use Case 3: Get Brand-Compliant Typography

```python
from brand_compliance_enforcer import BrandEnforcer

enforcer = BrandEnforcer()

# Get specs for all text elements
title_spec = enforcer.get_type_spec('documentTitle')
header_spec = enforcer.get_type_spec('sectionHeader')
body_spec = enforcer.get_type_spec('bodyText')

# Apply to document
create_title(
    font=title_spec['font'],
    size=title_spec['size'],
    color=title_spec['colorRgb']
)
```

---

### Use Case 4: Prevent Text Cutoffs

```python
from brand_compliance_enforcer import BrandEnforcer

enforcer = BrandEnforcer()

# User creates large text frame
frame = enforcer.enforce_text_frame(
    x=500, y=100, width=200, height=100,
    page_width=612, page_height=792
)

# Frame auto-shrunk to fit within margins
# Use corrected dimensions
create_text_frame(
    x=frame['x'],
    y=frame['y'],
    width=frame['width'],   # Auto-adjusted
    height=frame['height']  # Auto-adjusted
)
```

---

### Use Case 5: Integration with Orchestrator

```javascript
const { BrandEnforcer } = require('./brand-enforcer');

class EnforcedOrchestrator {
  constructor() {
    this.enforcer = new BrandEnforcer({ strictMode: true });
  }

  async processJob(jobData) {
    // Enforce all colors
    const enforcedColors = {};
    for (const [key, color] of Object.entries(jobData.colors)) {
      const { colorName, rgb } = this.enforcer.enforceColor(color);
      enforcedColors[key] = { name: colorName, rgb };
    }

    // Enforce all fonts
    const enforcedFonts = {};
    for (const [key, font] of Object.entries(jobData.fonts)) {
      const usageType = key.includes('head') ? 'headline' : 'body';
      enforcedFonts[key] = this.enforcer.enforceFont(font, usageType);
    }

    // Return compliant job
    return {
      ...jobData,
      colors: enforcedColors,
      fonts: enforcedFonts
    };
  }
}
```

---

## API Cheat Sheet

### Python

```python
from brand_compliance_enforcer import BrandEnforcer

enforcer = BrandEnforcer(strict_mode=True, auto_correct=True)

# Colors
color_name, rgb = enforcer.enforce_color(color, context="")

# Fonts
font = enforcer.enforce_font(font_family, usage_type="body|headline")

# Text Frames
frame = enforcer.enforce_text_frame(x, y, width, height, page_width, page_height)

# Content
enforcer.enforce_metrics(text)  # Raises ValueError if placeholder
enforcer.enforce_text_completeness(text)  # Raises ValueError if cutoff

# Typography Specs
spec = enforcer.get_type_spec("documentTitle|sectionHeader|subhead|bodyText|caption")

# Spacing
value = enforcer.get_spacing("margin|section|element|paragraph")

# Logo
is_valid = enforcer.enforce_logo_clearspace(logo_bounds, nearby_elements)

# Report
report = enforcer.generate_report()
enforcer.print_report()
```

---

### JavaScript

```javascript
const { BrandEnforcer } = require('./brand-enforcer');

const enforcer = new BrandEnforcer({ strictMode: true, autoCorrect: true });

// Colors
const { colorName, rgb } = enforcer.enforceColor(color, context);

// Fonts
const font = enforcer.enforceFont(fontFamily, usageType);

// Text Frames
const frame = enforcer.enforceTextFrame(x, y, width, height, pageWidth, pageHeight);

// Content
enforcer.enforceMetrics(text);  // Throws Error if placeholder
enforcer.enforceTextCompleteness(text);  // Throws Error if cutoff

// Typography Specs
const spec = enforcer.getTypeSpec(elementType);

// Spacing
const value = enforcer.getSpacing(spacingType);

// Logo
const isValid = enforcer.enforceLogoClearspace(logoBounds, nearbyElements);

// Report
const report = enforcer.generateReport();
enforcer.printReport();
```

---

## Enforcement Modes

### Strict Mode (Recommended)

```python
enforcer = BrandEnforcer(strict_mode=True, auto_correct=True)
```

- Critical violations: **BLOCKED** ❌
- Major violations: Auto-corrected ✅
- Minor violations: Auto-corrected ✅

**Use for:** Production documents, client deliverables

---

### Permissive Mode

```python
enforcer = BrandEnforcer(strict_mode=False, auto_correct=True)
```

- Critical violations: Auto-corrected ⚠️
- Major violations: Auto-corrected ✅
- Minor violations: Auto-corrected ✅

**Use for:** Development, prototyping

---

### Audit Mode

```python
enforcer = BrandEnforcer(strict_mode=False, auto_correct=False)
```

- Critical violations: Logged only 📝
- Major violations: Logged only 📝
- Minor violations: Logged only 📝

**Use for:** Analyzing existing documents

---

## Testing

### Run Built-in Tests

```bash
# Python
python3 brand_compliance_enforcer.py

# JavaScript
node brand-enforcer.js
```

### Expected Results

Both should show:
- ✅ Copper color blocked and corrected
- ✅ Arial font blocked and corrected
- ❌ "XX Students" placeholder blocked
- ❌ "Educa-" text cutoff blocked
- ✅ Type specs retrieved

---

## Troubleshooting

### "ModuleNotFoundError: No module named 'brand_compliance_enforcer'"

**Solution:**
```bash
# Ensure you're in the correct directory
cd /home/user/pdf-orchestrator

# Run from project root
python3 brand_compliance_enforcer.py
```

---

### "Cannot find module './brand-enforcer'"

**Solution:**
```bash
# Ensure you're in the correct directory
cd /home/user/pdf-orchestrator

# Run from project root
node brand-enforcer.js
```

---

### "FileNotFoundError: config/brand-compliance-config.json"

**Solution:**
Config file exists at `/home/user/pdf-orchestrator/config/brand-compliance-config.json`.

Ensure you're running from project root:
```bash
cd /home/user/pdf-orchestrator
python3 brand_compliance_enforcer.py
```

---

## Next Steps

1. ✅ **Test the system:** Run `python3 brand_compliance_enforcer.py`
2. ✅ **Try the example:** Run `python3 create_with_enforcement.py`
3. ✅ **Read full docs:** See `BRAND-ENFORCEMENT-SYSTEM.md`
4. ✅ **Integrate:** Add enforcer to your document creation scripts

---

## Resources

- **Full Documentation:** `BRAND-ENFORCEMENT-SYSTEM.md`
- **Python Implementation:** `brand_compliance_enforcer.py`
- **JavaScript Implementation:** `brand-enforcer.js`
- **Example Script:** `create_with_enforcement.py`
- **Brand Config:** `config/brand-compliance-config.json`
- **Design Fix Report:** `reports/TEEI_AWS_Design_Fix_Report.md`

---

## Support

**Questions?** Check the full documentation in `BRAND-ENFORCEMENT-SYSTEM.md`

---

**Version:** 1.0.0
**Last Updated:** 2025-11-08
**Status:** Production Ready
