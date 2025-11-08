# InDesign Automation Quick Start Guide

**Last Updated**: 2025-11-08

## 🚀 Get Started in 5 Minutes

### 1. Run the Example (30 seconds)

```bash
cd /home/user/pdf-orchestrator
python create_world_class_automated.py
```

This creates a complete 3-page TEEI AWS partnership document with:
- Hero banner
- 4 metric cards
- 3 feature cards
- Testimonial
- 4-phase timeline
- Footers on all pages
- 100% brand compliance

### 2. Review in InDesign

Open the created document in InDesign and see:
- ✅ All TEEI brand colors applied correctly
- ✅ Lora and Roboto Flex fonts used properly
- ✅ Perfect grid alignment
- ✅ Professional spacing and hierarchy
- ✅ No text cutoffs

### 3. Understand the Code (5 minutes)

Open `create_world_class_automated.py` and see how simple it is:

```python
# Step 1: Set up brand environment
brand_setup = create_teei_brand_environment(sendCommand, createCommand)

# Step 2: Initialize systems
components = DesignComponents(sendCommand, createCommand)
layout = LayoutManager(page_width=595, page_height=842)

# Step 3: Create elements
components.create_hero_banner(
    page=1,
    title="YOUR TITLE",
    background_color='nordshore'  # Automatic brand color!
)

# Step 4: Add metrics
metric_areas = layout.create_metric_grid(metrics=4)
for area in metric_areas:
    components.create_metric_card(
        page=1,
        x=area['x'], y=area['y'],
        width=area['width'], height=area['height'],
        metric="2,600+", label="STUDENTS"
    )
```

That's it! No manual color coding, no font selection, no positioning calculations.

---

## 📚 Core Concepts

### 1. Brand System - Automatic Colors & Fonts

```python
from automation.TEEI_BrandSystem import TEEIBrand

brand = TEEIBrand()

# Get color by context
header_color = brand.get_color_for_context('header')  # → Nordshore
bg_color = brand.get_color_for_context('background')  # → Sand

# Get typography by context
title_typo = brand.get_typography_for_context('title')  # → Lora Bold 42pt
body_typo = brand.get_typography_for_context('body')   # → Roboto Flex Regular 11pt
```

**Available Color Contexts**:
- `header`, `section_header` → Nordshore
- `background`, `background_light` → Sand, Sky
- `accent`, `metric` → Moss
- `accent_warm`, `metric_premium` → Gold

**Available Typography Contexts**:
- `title`, `main_title` → Document Title (Lora Bold 42pt)
- `header`, `section` → Section Header (Lora Semibold 28pt)
- `body`, `text` → Body Text (Roboto Flex Regular 11pt)
- `metric` → Metric Number (Lora Bold 32pt)
- `cta`, `button` → CTA (Roboto Flex Bold 14pt)

### 2. Layout System - Grid Positioning

```python
from automation.IntelligentLayout import LayoutManager

layout = LayoutManager(page_width=595, page_height=842)

# Grid positioning (12-column system)
full_width = layout.grid_position(column=0, span=12)  # All columns
left_half = layout.grid_position(column=0, span=6)    # Left half
right_half = layout.grid_position(column=6, span=6)   # Right half
third = layout.grid_position(column=0, span=4)        # First third

# Common patterns
header = layout.create_header_section(height=140)     # Hero header
cards = layout.create_card_layout(cards=3)            # 3 cards
metrics = layout.create_metric_grid(metrics=4)        # 4 metrics
timeline = layout.create_timeline(phases=4)           # 4 phases
footer = layout.create_footer(height=60)              # Footer
```

### 3. Design Components - Ready-to-Use Elements

```python
from automation.DesignPatternLibrary import DesignComponents

components = DesignComponents(sendCommand, createCommand)

# Hero banner
components.create_hero_banner(page=1, title="Title", subtitle="Subtitle")

# Metric card
components.create_metric_card(
    page=1, x=40, y=200, width=120, height=120,
    metric="2,600+", label="STUDENTS"
)

# Feature card
components.create_feature_card(
    page=1, x=40, y=350, width=160, height=180,
    title="FEATURE", description="Description here..."
)

# Testimonial
components.create_testimonial_card(
    page=2, x=40, y=200, width=515, height=180,
    quote="Quote text...", attribution="Name, Title"
)

# Timeline phase
components.create_timeline_phase(
    page=3, x=40, y=200, width=120, height=100,
    phase_num=1, title="PHASE 1", description="Details..."
)

# CTA button
components.create_cta_button(
    page=1, x=150, y=700, width=300, height=50,
    text="Click Here"
)

# Footer
components.create_footer(
    page=1,
    contact_email="email@example.com",
    contact_website="www.example.com"
)
```

---

## 🎨 Available TEEI Colors

Use these color names in all components:

**Primary** (80% usage):
- `nordshore` - #00393F (primary brand color)
- `sky` - #C9E4EC (light blue)
- `sand` - #FFF1E2 (warm background)
- `beige` - #EFE1DC (neutral background)

**Accent** (20% usage):
- `moss` - #65873B (green accent)
- `gold` - #BA8F5A (premium accent)
- `clay` - #913B2F (terracotta accent)

**Neutral**:
- `white`, `black`, `gray_light`, `gray_dark`

**Example**:
```python
components.create_hero_banner(
    background_color='nordshore',  # ✅ Validated
    # NOT: background_color='orange'  # ❌ Would fail validation
)
```

---

## 📐 Grid System Cheat Sheet

**12-Column Grid** (A4 page):
- Page width: 595pt
- Margins: 40pt all sides
- Columns: 12
- Gutter: 20pt
- Column width: ~38.75pt

**Common Spans**:
```python
span=12  # Full width (515pt)
span=6   # Half width (257.5pt)
span=4   # Third width (165pt)
span=3   # Quarter width (120.75pt)
```

**Example Layout**:
```python
# 3-column layout
left = layout.grid_position(column=0, span=4)    # Columns 0-3
center = layout.grid_position(column=4, span=4)  # Columns 4-7
right = layout.grid_position(column=8, span=4)   # Columns 8-11
```

---

## 🔧 Common Patterns

### Pattern 1: Header + Metrics + CTA

```python
# Header
components.create_hero_banner(page=1, title="Title", subtitle="Subtitle")

# Metrics (4 cards in grid)
metric_areas = layout.create_metric_grid(metrics=4)
for area in metric_areas:
    components.create_metric_card(page=1, x=area['x'], y=area['y'],
                                  width=area['width'], height=area['height'],
                                  metric="2,600+", label="LABEL")

# CTA
components.create_cta_button(page=1, x=150, y=700, width=300, height=50,
                             text="Call to Action")
```

### Pattern 2: Section + Features + Testimonial

```python
# Section header
components.create_section_header(page=2, text="WHY CHOOSE US?",
                                 x=40, y=40, width=515)

# Features (3 cards)
card_areas = layout.create_card_layout(cards=3, height=180)
for area in card_areas:
    components.create_feature_card(page=2, x=area['x'], y=area['y'],
                                   width=area['width'], height=area['height'],
                                   title="FEATURE", description="Details...")

# Testimonial
components.create_testimonial_card(page=2, x=40, y=500, width=515, height=180,
                                   quote="...", attribution="Name, Title")
```

### Pattern 3: Timeline + Footer

```python
# Timeline
timeline = layout.create_timeline(phases=4, orientation='horizontal')
for i, phase in enumerate(timeline['phases']):
    components.create_timeline_phase(page=3, x=phase['x'], y=phase['y'],
                                     width=phase['width'], height=phase['height'],
                                     phase_num=i+1, title=f"PHASE {i+1}",
                                     description="Phase details...")

# Footer
components.create_footer(page=3, contact_email="...", contact_website="...")
```

---

## ⚡ Quick Reference

### Import All Modules

```python
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
from automation.TEEI_BrandSystem import create_teei_brand_environment
from automation.IntelligentLayout import LayoutManager
from automation.DesignPatternLibrary import DesignComponents

# Initialize
socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

# Set up
brand_setup = create_teei_brand_environment(sendCommand, createCommand)
layout = LayoutManager()
components = DesignComponents(sendCommand, createCommand)
```

### Complete Minimal Example

```python
#!/usr/bin/env python3
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
from automation.TEEI_BrandSystem import create_teei_brand_environment
from automation.DesignPatternLibrary import DesignComponents

# Initialize
socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

# Create document
sendCommand(createCommand("createDocument", {
    "pageWidth": 595, "pageHeight": 842, "pagesPerDocument": 1
}))

# Set up brand
brand_setup = create_teei_brand_environment(sendCommand, createCommand)
components = DesignComponents(sendCommand, createCommand)

# Create content
components.create_hero_banner(page=1, title="My Document")
components.create_footer(page=1, contact_email="email@example.com",
                        contact_website="www.example.com")

print("✅ Document created!")
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"
**Solution**: Ensure you're in the correct directory and path is set:
```python
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '.'))
```

### Issue: "Fonts not found"
**Solution**: Install TEEI fonts first:
```bash
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
```
Then restart InDesign.

### Issue: Colors not applying
**Solution**: Set up brand environment:
```python
brand_setup = create_teei_brand_environment(sendCommand, createCommand)
```

### Issue: Elements overlapping
**Solution**: Use cursor tracking:
```python
layout.advance_cursor(element_height, min_space=20)
```

---

## 📖 Full Documentation

For complete details, see:
- **Main Guide**: `/home/user/pdf-orchestrator/automation/README.md`
- **Enhancement Summary**: `/home/user/pdf-orchestrator/INDESIGN_AUTOMATION_ENHANCEMENTS.md`
- **Example Code**: `/home/user/pdf-orchestrator/create_world_class_automated.py`

---

## ✅ Checklist for New Scripts

When creating a new document automation script:

- [ ] Import automation modules
- [ ] Initialize MCP connection
- [ ] Set up brand environment
- [ ] Create document
- [ ] Use components (not manual rectangles/text frames)
- [ ] Reference colors by name (not RGB values)
- [ ] Use grid positioning (not magic numbers)
- [ ] Add footer to all pages
- [ ] Test at 100%, 150%, 200% zoom
- [ ] Validate with `validate_world_class.py`

---

**Need Help?** Check the full documentation in `/home/user/pdf-orchestrator/automation/README.md`

**Ready to Start?** Run `python create_world_class_automated.py` to see it in action!
