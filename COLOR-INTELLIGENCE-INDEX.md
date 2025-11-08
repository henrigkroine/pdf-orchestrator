# TEEI Color Intelligence System - Complete Index

**Your comprehensive guide to the TEEI Color Intelligence System**

---

## 📚 Start Here

### New Users (5-Minute Quick Start)
1. **Read:** `COLOR-INTELLIGENCE-QUICKSTART.md` - Get started in 5 minutes
2. **Try:** `node examples/color-intelligence-demos.js` - See it in action
3. **Use:** `node color-intelligence.js palette partnership_document` - Generate your first palette

### Developers (Complete Integration)
1. **Read:** `COLOR-INTELLIGENCE-README.md` - Complete technical documentation
2. **Review:** `COLOR-INTELLIGENCE-SUMMARY.md` - Implementation summary
3. **Reference:** `TEEI-COLOR-REFERENCE-CARD.md` - Quick color reference

### Designers (Visual Reference)
1. **Print:** `TEEI-COLOR-REFERENCE-CARD.md` - Keep on desk while designing
2. **Review:** `brand-compliance-config.json` - Official brand specifications
3. **Explore:** `color-harmony-config.json` - Color theory and schemes

---

## 📁 File Structure

### Core System Files

#### Configuration Files
```
/home/user/pdf-orchestrator/
├── brand-compliance-config.json       # TEEI brand colors & standards
│   ├── 7 official TEEI colors (complete specs)
│   ├── RGB, HEX, CMYK, HSL values
│   ├── Pre-calculated contrast ratios
│   ├── Typography system
│   └── Layout & photography standards
│
└── color-harmony-config.json          # Color theory & document schemes
    ├── 5 harmony types
    ├── 4 document schemes (partnership, program, impact, executive)
    ├── Color blocking strategies
    ├── Overlay configurations
    └── Complete accessibility matrix
```

#### Implementation Files
```
/home/user/pdf-orchestrator/
├── color-intelligence.js              # JavaScript implementation (800 lines)
│   ├── 30+ API methods
│   ├── Contrast calculations
│   ├── Color validation
│   ├── Scheme application
│   ├── CSS/InDesign export
│   └── CLI interface
│
├── color_harmony.py                   # Python implementation (600 lines)
│   ├── Same API as JavaScript
│   ├── MCP/InDesign compatible
│   ├── CLI interface
│   └── Full color theory
│
└── apply_colors_intelligent.py        # InDesign automation integration
    ├── Automatic color scheme application
    ├── Accessibility validation
    ├── Usage reports
    └── Palette export
```

### Documentation Files

```
/home/user/pdf-orchestrator/
├── COLOR-INTELLIGENCE-README.md       # Complete technical docs (3000+ lines)
│   ├── System overview
│   ├── Quick start guides
│   ├── Complete API reference
│   ├── Integration examples
│   ├── Accessibility guidelines
│   └── Troubleshooting
│
├── COLOR-INTELLIGENCE-QUICKSTART.md   # 5-minute quick start guide
│   ├── 30-second overview
│   ├── Quick start examples
│   ├── Common use cases
│   ├── Cheat sheet
│   └── FAQ
│
├── COLOR-INTELLIGENCE-SUMMARY.md      # Implementation summary
│   ├── What was built
│   ├── System components
│   ├── Testing results
│   ├── Benefits
│   └── Next steps
│
├── TEEI-COLOR-REFERENCE-CARD.md       # Visual quick reference
│   ├── All 7 TEEI colors
│   ├── Document schemes
│   ├── Accessibility matrix
│   ├── Color harmonies
│   └── Quick commands
│
└── COLOR-INTELLIGENCE-INDEX.md        # This file
    └── Complete index & navigation
```

### Example Files

```
/home/user/pdf-orchestrator/examples/
└── color-intelligence-demos.js        # 11 comprehensive examples
    ├── Creating partnership documents
    ├── Validating external colors
    ├── Accessibility checking
    ├── Generating palettes
    ├── Image overlays
    ├── Color harmonies
    ├── Export formats
    ├── Color psychology
    ├── Safe text colors
    ├── Document audits
    └── InDesign integration
```

---

## 🚀 Quick Commands Reference

### JavaScript

```bash
# Get color palette
node color-intelligence.js palette partnership_document

# Validate color
node color-intelligence.js validate "#00393F"

# Check contrast
node color-intelligence.js contrast nordshore white

# Get complete scheme
node color-intelligence.js scheme partnership_document

# Export CSS variables
node color-intelligence.js css partnership_document > colors.css

# Export InDesign swatches
node color-intelligence.js swatches partnership_document > swatches.xml

# Run comprehensive demos
node examples/color-intelligence-demos.js
```

### Python

```bash
# Get color palette
python color_harmony.py palette partnership_document

# Validate color
python color_harmony.py validate "#C87137"

# Check contrast
python color_harmony.py contrast nordshore sand

# Get complete scheme
python color_harmony.py scheme impact_report

# Export CSS
python color_harmony.py css executive_summary

# Apply to InDesign (automatic)
python apply_colors_intelligent.py partnership_document
```

---

## 📖 Documentation Guide

### What to Read First?

**For Quick Integration (5 minutes):**
→ `COLOR-INTELLIGENCE-QUICKSTART.md`

**For Complete Understanding (30 minutes):**
→ `COLOR-INTELLIGENCE-README.md`

**For Visual Reference (Always):**
→ `TEEI-COLOR-REFERENCE-CARD.md` (print and keep on desk)

**For Implementation Details:**
→ `COLOR-INTELLIGENCE-SUMMARY.md`

**For Navigation:**
→ `COLOR-INTELLIGENCE-INDEX.md` (this file)

---

## 🎨 Document Schemes Overview

### 1. Partnership Document (Premium)
**File:** `color-harmony-config.json` → `partnership_document`

**Best For:**
- AWS partnership materials
- Corporate collaborations
- Executive presentations

**Color Distribution:**
- Nordshore (40%) - Primary brand color
- Sky (15%) - Accents and highlights
- Gold (10%) - Premium feel
- Sand (20%) - Warm backgrounds
- Others (15%)

**Psychology:** Trust + Prestige + Warmth

**Command:**
```bash
node color-intelligence.js palette partnership_document
```

### 2. Program Overview (Approachable)
**File:** `color-harmony-config.json` → `program_overview`

**Best For:**
- Community programs
- Student-facing materials
- Public communications

**Color Distribution:**
- Nordshore (30%) - Professional foundation
- Sand (25%) - Warm, welcoming
- Sky (20%) - Light, hopeful
- White (15%) - Clean, accessible
- Others (10%)

**Psychology:** Warmth + Accessibility + Hope

**Command:**
```bash
python color_harmony.py scheme program_overview
```

### 3. Impact Report (Data-Driven)
**File:** `color-harmony-config.json` → `impact_report`

**Best For:**
- Annual reports
- Donor communications
- Data presentations

**Color Distribution:**
- Nordshore (35%) - Professional credibility
- White (25%) - Data clarity
- Moss (15%) - Success metrics
- Gold (10%) - Achievement
- Others (15%)

**Psychology:** Credibility + Achievement + Impact

**Command:**
```bash
python apply_colors_intelligent.py impact_report
```

### 4. Executive Summary (Minimal)
**File:** `color-harmony-config.json` → `executive_summary`

**Best For:**
- Board reports
- High-level overviews
- C-suite communications

**Color Distribution:**
- White (50%) - Clean, focused
- Nordshore (30%) - Authority
- Gold (10%) - Sophistication
- Beige (8%) - Subtle warmth
- Sky (2%) - Refinement

**Psychology:** Sophistication + Clarity + Authority

**Command:**
```bash
node color-intelligence.js css executive_summary > exec-colors.css
```

---

## 🔧 Integration Paths

### Path 1: HTML/CSS/Web
```javascript
const colorIntelligence = require('./color-intelligence.js');

// Get scheme
const styled = colorIntelligence.applyColorScheme('partnership_document', {
  header: {},
  cta: {}
});

// Apply to DOM
document.querySelector('.header').style.backgroundColor = styled.header.backgroundColor;
```

**See:** `COLOR-INTELLIGENCE-README.md` → "Integration Examples" → "HTML/CSS Generation"

### Path 2: InDesign Automation (Python)
```python
from color_harmony import ColorIntelligence

ci = ColorIntelligence()
scheme = ci.get_document_scheme('partnership_document')

# Use with MCP commands
```

**Or use automated script:**
```bash
python apply_colors_intelligent.py partnership_document
```

**See:** `COLOR-INTELLIGENCE-README.md` → "Integration Examples" → "InDesign Automation"

### Path 3: React/Vue/Modern JS
```javascript
import colorIntelligence from './color-intelligence.js';

function PartnershipDoc() {
  const styled = colorIntelligence.applyColorScheme('partnership_document', {
    header: {},
    metrics: {}
  });

  return <header style={{ backgroundColor: styled.header.backgroundColor }}>
    ...
  </header>
}
```

**See:** `COLOR-INTELLIGENCE-README.md` → "Integration Examples" → "React Component"

---

## 🎯 Common Use Cases

### Use Case 1: "I need to create a partnership document"
```bash
# Step 1: Generate palette
node color-intelligence.js palette partnership_document

# Step 2: Apply to your design tool
# (Use the hex values from the palette)

# Step 3: Validate when done
node color-intelligence.js validate "#00393F"  # Test each color
```

**Detailed Guide:** `COLOR-INTELLIGENCE-QUICKSTART.md` → "Use Case 1"

### Use Case 2: "A designer sent me colors - are they TEEI compliant?"
```bash
# Validate each color
node color-intelligence.js validate "#C87137"  # ❌ FORBIDDEN
node color-intelligence.js validate "#00393F"  # ✅ Valid

# Check accessibility
node color-intelligence.js contrast nordshore white  # ✅ 12.8:1 AAA
```

**Detailed Guide:** `COLOR-INTELLIGENCE-QUICKSTART.md` → "Use Case 2"

### Use Case 3: "I need to ensure WCAG accessibility"
```javascript
const check = colorIntelligence.validateAccessibility('gold', 'white', 'normal');
if (!check.passes) {
  console.log(check.recommendation);
  // "Low contrast (3.2). Use bolder text or choose different colors."
}
```

**Detailed Guide:** `COLOR-INTELLIGENCE-README.md` → "Accessibility Guidelines"

### Use Case 4: "I need image overlays for photos"
```bash
# Generate dark overlay (for white text)
node color-intelligence.js palette partnership_document | grep overlay

# Or use programmatically:
# const overlay = colorIntelligence.generateOverlay('dark_overlay');
```

**Detailed Guide:** `COLOR-INTELLIGENCE-README.md` → "Advanced Usage" → "Gradient Generation"

---

## 🧪 Testing & Validation

### Run All Tests
```bash
# JavaScript tests
node color-intelligence.js validate "#00393F"  # Should pass
node color-intelligence.js validate "#C87137"  # Should fail (exit code 1)
node color-intelligence.js contrast nordshore white  # Should show 12.8:1

# Python tests
python color_harmony.py validate "#00393F"  # Should pass
python color_harmony.py contrast nordshore sand  # Should show 8.2:1

# Comprehensive demos
node examples/color-intelligence-demos.js  # All 11 examples
```

### Validation Checklist
- [ ] All 7 TEEI colors validate as official
- [ ] Copper/orange colors fail validation
- [ ] Nordshore + White contrast ≥ 12.0:1
- [ ] Partnership document scheme has Nordshore as primary
- [ ] CSS export includes all custom properties
- [ ] InDesign swatches export as valid XML

**See:** `COLOR-INTELLIGENCE-SUMMARY.md` → "Testing Results"

---

## 📊 System Capabilities Matrix

| Feature | JavaScript | Python | CLI | InDesign |
|---------|-----------|--------|-----|----------|
| Color validation | ✅ | ✅ | ✅ | ✅ |
| Contrast calculation | ✅ | ✅ | ✅ | ✅ |
| Document schemes | ✅ | ✅ | ✅ | ✅ |
| Palette generation | ✅ | ✅ | ✅ | ✅ |
| CSS export | ✅ | ✅ | ✅ | N/A |
| InDesign swatches | ✅ | ❌ | ✅ | ✅ |
| Image overlays | ✅ | ✅ | ❌ | ✅ |
| Color harmonies | ✅ | ❌ | ❌ | N/A |
| Accessibility check | ✅ | ✅ | ✅ | ✅ |

---

## 🆘 Troubleshooting Guide

### Problem: "Color not found"
**Cause:** Invalid color name
**Solution:** Use only: `nordshore`, `sky`, `sand`, `beige`, `moss`, `gold`, `clay`, `white`, `black`, `gray`
**Reference:** `TEEI-COLOR-REFERENCE-CARD.md` → "Official TEEI Colors"

### Problem: "Low contrast warning"
**Cause:** Text/background combination doesn't meet WCAG
**Solution:** Use `getSafeTextColor(background)` for automatic selection
**Reference:** `COLOR-INTELLIGENCE-README.md` → "Troubleshooting"

### Problem: "Forbidden color detected"
**Cause:** Using copper/orange (#C87137, etc.)
**Solution:** Use suggested TEEI alternative from validation message
**Reference:** `TEEI-COLOR-REFERENCE-CARD.md` → "Forbidden Colors"

### Problem: "Unknown document type"
**Cause:** Invalid document type parameter
**Solution:** Use: `partnership_document`, `program_overview`, `impact_report`, `executive_summary`
**Reference:** `COLOR-INTELLIGENCE-QUICKSTART.md` → "Document Type Recommendations"

---

## 🎓 Learning Path

### Beginner (1 hour)
1. Read: `COLOR-INTELLIGENCE-QUICKSTART.md` (15 min)
2. Run: `node examples/color-intelligence-demos.js` (15 min)
3. Try: Generate a palette for partnership document (15 min)
4. Practice: Validate 5 colors (15 min)

### Intermediate (3 hours)
1. Read: `COLOR-INTELLIGENCE-README.md` sections 1-5 (1 hour)
2. Implement: Apply color scheme in a simple HTML page (1 hour)
3. Test: Check accessibility of all combinations (30 min)
4. Export: Create CSS variables file (30 min)

### Advanced (1 day)
1. Read: Complete `COLOR-INTELLIGENCE-README.md` (2 hours)
2. Integrate: Add to existing InDesign automation (3 hours)
3. Customize: Create a new document scheme (2 hours)
4. Document: Write integration guide for team (1 hour)

---

## 🔗 Quick Links

### Essential Files
- **Quick Start:** `/home/user/pdf-orchestrator/COLOR-INTELLIGENCE-QUICKSTART.md`
- **Complete Docs:** `/home/user/pdf-orchestrator/COLOR-INTELLIGENCE-README.md`
- **Reference Card:** `/home/user/pdf-orchestrator/TEEI-COLOR-REFERENCE-CARD.md`
- **Summary:** `/home/user/pdf-orchestrator/COLOR-INTELLIGENCE-SUMMARY.md`

### Configuration Files
- **Brand Config:** `/home/user/pdf-orchestrator/brand-compliance-config.json`
- **Harmony Config:** `/home/user/pdf-orchestrator/color-harmony-config.json`

### Implementation Files
- **JavaScript:** `/home/user/pdf-orchestrator/color-intelligence.js`
- **Python:** `/home/user/pdf-orchestrator/color_harmony.py`
- **InDesign:** `/home/user/pdf-orchestrator/apply_colors_intelligent.py`

### Examples
- **Demos:** `/home/user/pdf-orchestrator/examples/color-intelligence-demos.js`

---

## 📞 Support

### Documentation Issues
Check the troubleshooting section in:
- `COLOR-INTELLIGENCE-README.md` → "Troubleshooting"
- `COLOR-INTELLIGENCE-QUICKSTART.md` → "Troubleshooting"

### Integration Help
See integration examples in:
- `COLOR-INTELLIGENCE-README.md` → "Integration Examples"
- `examples/color-intelligence-demos.js` → Example 11

### Color Questions
Reference the visual guide:
- `TEEI-COLOR-REFERENCE-CARD.md` → Print and keep on desk

---

## 🎯 Next Steps

### Immediate Actions
1. ✅ Print `TEEI-COLOR-REFERENCE-CARD.md` for desk reference
2. ✅ Run `node examples/color-intelligence-demos.js` to see capabilities
3. ✅ Generate your first palette: `node color-intelligence.js palette partnership_document`

### This Week
1. ✅ Integrate with one existing document/workflow
2. ✅ Create CSS variables file for web projects
3. ✅ Validate all existing TEEI materials for color compliance

### This Month
1. ✅ Update all TEEI document templates to use Color Intelligence
2. ✅ Train team on using the system
3. ✅ Add automated color validation to CI/CD pipeline

---

**System Status:** ✅ Production Ready
**Last Updated:** 2025-11-08
**Version:** 1.0.0

**Happy color designing!** 🎨✨
