# Create TEEI Partnership Showcase with InDesign MCP

## Quick Start (Use in Cursor)

1. **Open Adobe InDesign**
2. **Open Cursor IDE**
3. **Paste these commands to Claude in Cursor**

---

## TEEI Showcase Document Creation

### Step 1: Create Document
```python
cmd("createDocument", {
    "pageWidth": 595,   # A4 width (8.27 inches)
    "pageHeight": 842,  # A4 height (11.69 inches)
    "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},  # 1 inch margins
    "intent": "print"
})
```

### Step 2: Create TEEI Brand Colors
```python
# TEEI Primary Blue
cmd("ensureColorSwatch", {"name": "TEEI-Blue", "r": 0, "g": 57, "b": 63})

# TEEI Accent Green
cmd("ensureColorSwatch", {"name": "TEEI-Green", "r": 0, "g": 150, "b": 136})

# TEEI Gold
cmd("ensureColorSwatch", {"name": "TEEI-Gold", "r": 255, "g": 193, "b": 7})

# Text colors
cmd("ensureColorSwatch", {"name": "TEEI-Text", "r": 51, "g": 51, "b": 51})
cmd("ensureColorSwatch", {"name": "TEEI-Gray", "r": 100, "g": 100, "b": 100})
```

### Step 3: Create Premium Header with Gradient
```python
cmd("createGradientBox", {
    "x": 0,
    "y": 0,
    "width": 595,
    "height": 180,
    "startColor": [0, 57, 63],      # TEEI Blue
    "endColor": [0, 150, 136],      # TEEI Green
    "angle": 135
})
```

### Step 4: Add Curved Title Text
```python
cmd("createTextOnPath", {
    "x": 297.5,       # Center of page
    "y": 60,
    "diameter": 220,
    "content": "🌟 TEEI AI-Powered Education Revolution 2025",
    "fontSize": 18,
    "fillColor": [255, 255, 255],
    "pathEffect": "rainbow"
})
```

### Step 5: Add Subtitle
```python
cmd("createTextFrameAdvanced", {
    "x": 72,
    "y": 150,
    "width": 451,
    "height": 30,
    "content": "World-Class Partnership Showcase Document",
    "fontSize": 16,
    "fillColor": [255, 255, 255],
    "horizontalAlign": "center"
})
```

### Step 6: Add Gradient Accent Bar
```python
cmd("createStrokeGradient", {
    "x": 0,
    "y": 218,
    "width": 595,
    "height": 1,
    "startColor": [0, 57, 63],
    "endColor": [255, 193, 7],
    "angle": 0,
    "strokeWeight": 8
})
```

### Step 7: Add Content Section
```python
# Content text (your 31 content blocks from teei-showcase-simple.json)
content = """
The Educational Equality Institute (TEEI) has transformed educational accessibility through innovative AI-powered solutions, reaching thousands of students across underserved communities worldwide.

Revolutionary AI Platform Features:
• Adaptive learning pathways that adjust in real-time to student performance
• Multilingual support covering 50+ languages and dialects
• Accessibility-first design meeting WCAG 2.1 AAA standards
• Automated content generation and curriculum adaptation
• Real-time progress tracking and intervention systems

... [rest of your content from the JSON file]
"""

cmd("createTextFrameAdvanced", {
    "x": 72,
    "y": 240,
    "width": 451,
    "height": 500,
    "content": content,
    "fontSize": 11,
    "fillColor": [51, 51, 51],
    "leading": 16,
    "horizontalAlign": "left"
})
```

### Step 8: Add Premium Box with Effects
```python
cmd("createUltraPremiumBox", {
    "x": 72,
    "y": 760,
    "width": 451,
    "height": 60,
    "fillColor": [240, 240, 240],
    "strokeColor": [0, 57, 63],
    "strokeWeight": 2,
    "cornerRadius": 12,
    "dropShadow": True,
    "innerGlow": True
})
```

### Step 9: Add Metadata Footer
```python
cmd("createTextFrame", {
    "x": 82,
    "y": 770,
    "width": 431,
    "height": 40,
    "content": "Author: The Educational Equality Institute\nDate: 2025-01-07\nOrganization: TEEI",
    "fontSize": 9,
    "fillColor": [100, 100, 100]
})
```

### Step 10: Export to PDF
```python
cmd("exportPDF", {
    "outputPath": "T:/Projects/pdf-orchestrator/exports/teei-showcase-premium.pdf",
    "preset": "High Quality Print",
    "compatibility": "PDF1.7",
    "includeBookmarks": True
})
```

---

## Full Content (from teei-showcase-simple.json)

```
The Educational Equality Institute (TEEI) has transformed educational accessibility through innovative AI-powered solutions, reaching thousands of students across underserved communities worldwide.

Revolutionary AI Platform Features:

• Adaptive learning pathways that adjust in real-time to student performance
• Multilingual support covering 50+ languages and dialects
• Accessibility-first design meeting WCAG 2.1 AAA standards
• Automated content generation and curriculum adaptation
• Real-time progress tracking and intervention systems

Evidence-Based Impact:

Our data-driven approach has demonstrated measurable improvements across all key educational metrics. Students using TEEI's platform show:
- 47% improvement in standardized test scores
- 68% increase in engagement rates
- 82% reduction in learning gaps
- 95% user satisfaction across all stakeholder groups

Technical Excellence:

Built on enterprise-grade infrastructure with 99.9% uptime, our platform handles millions of concurrent users while maintaining sub-200ms response times globally.

Partnership Opportunities:

We seek strategic partnerships to scale our impact:
- Technology integrations with leading EdTech platforms
- Content partnerships with curriculum developers
- Research collaborations with educational institutions
- Philanthropic partnerships to expand free tier access

Global Reach:

Currently serving 127 countries with localized content and support:
- 2.3 million active students
- 45,000+ educators
- 1,800+ educational institutions
- 50+ language variants

Innovation Pipeline:

Our R&D team continuously advances the platform with cutting-edge research in:
- Natural language processing for automated assessment
- Computer vision for accessibility enhancements
- Predictive analytics for early intervention
- Blockchain for credential verification

Commitment to Equity:

Every feature prioritizes accessibility and inclusion:
- Screen reader optimization
- Keyboard navigation support
- High contrast modes
- Dyslexia-friendly typography
- Cognitive load optimization

Recognition & Awards:

- 2024 UNESCO ICT in Education Prize
- EdTech Breakthrough Award for Innovation
- Fast Company World Changing Ideas Award
- Forbes 30 Under 30 Education (Founder)

Financial Sustainability:

Proven business model balancing social impact with sustainability:
- 60% free tier serving underserved communities
- 30% institutional partnerships
- 10% premium individual subscriptions
- Zero advertising, zero data monetization

Join Our Mission:

Together, we can ensure every student, regardless of background or circumstance, has access to world-class educational opportunities.

Contact: partnerships@teei.org | www.teei.org
```

---

## Alternative: Use Advanced Visual Effects

If you want to make it even more impressive, add these effects:

### Decorative Elements
```python
# Add decorative circles with step and repeat
cmd("createEllipse", {
    "x": 500,
    "y": 30,
    "width": 60,
    "height": 60,
    "fillColor": [255, 193, 7],
    "opacity": 20
})

cmd("stepAndRepeat", {
    "objectId": "last",  # Reference last created object
    "count": 4,
    "offsetX": -15,
    "offsetY": 15,
    "fadeOpacity": True
})
```

### Gradient Feather Background
```python
cmd("createRectangle", {
    "x": 0,
    "y": 220,
    "width": 595,
    "height": 622,
    "fillColor": [240, 248, 255]
})

cmd("createGradientFeather", {
    "type": "radial",
    "length": 50,
    "opacity": 90
})
```

### Satin Effect on Title
```python
cmd("createSatinEffect", {
    "objectId": "title-text",
    "angle": 45,
    "distance": 5,
    "size": 7,
    "opacity": 50
})
```

---

## Summary

**Time to create**: 5-10 minutes in Cursor with InDesign MCP
**Result**: Professional PDF with TEEI branding and advanced visual effects
**Advantages**:
- Full design control
- Professional print quality
- Reusable command sequences
- No template compatibility issues

**Your 61 InDesign MCP commands are PERFECT for this!**
