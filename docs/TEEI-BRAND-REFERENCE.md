# TEEI Brand Reference

**Quick Reference for All TEEI Brand Elements**

---

## Official Color Palette

### Primary Colors

| Color      | Hex       | RGB             | CMYK               | Usage                              |
|------------|-----------|-----------------|--------------------|------------------------------------|
| **Nordshore** | `#00393F` | `0, 57, 63`    | `100, 9, 0, 75`    | **PRIMARY** - 80% usage, headlines, primary elements |
| **Sky**       | `#C9E4EC` | `201, 228, 236`| `15, 3, 0, 7`      | **SECONDARY** - Light blue accents, highlights |
| **Sand**      | `#FFF1E2` | `255, 241, 226`| `0, 6, 11, 0`      | Warm neutral backgrounds, content areas |
| **Beige**     | `#EFE1DC` | `239, 225, 220`| `0, 6, 8, 6`       | Soft neutral backgrounds, sections |

### Accent Colors (Use Sparingly)

| Color   | Hex       | RGB            | CMYK           | Usage                              |
|---------|-----------|----------------|----------------|------------------------------------|
| **Moss**   | `#65873B` | `101, 135, 59` | `25, 0, 56, 47`| Green accent - environmental themes, growth |
| **Gold**   | `#BA8F5A` | `186, 143, 90` | `0, 23, 52, 27`| Warm metallic - premium feel, awards |
| **Clay**   | `#913B2F` | `145, 59, 47`  | `0, 59, 68, 43`| Terracotta accent - warmth, CTAs |

### Neutral Colors

| Color   | Hex       | RGB          | Usage                |
|---------|-----------|--------------|----------------------|
| **Black**  | `#000000` | `0, 0, 0`    | Body text, primary text |
| **Gray**   | `#666666` | `102, 102, 102` | Captions, secondary text |
| **White**  | `#FFFFFF` | `255, 255, 255` | Backgrounds, negative space |

### ❌ Forbidden Colors

| Color   | Hex       | Why Forbidden                        |
|---------|-----------|--------------------------------------|
| **Copper** | `#C87137` | Not in TEEI palette - creates brand confusion |
| **Orange** | `#FF6600` | Not in TEEI palette - only in partner logos |
| **Bright Orange** | `#FF8800` | Not in TEEI palette |

**Exception**: AWS orange can ONLY appear in the AWS logo itself, never elsewhere.

### Color Usage Rules

✅ **DO:**
- Use Nordshore as dominant color (80% of colored elements)
- Use Sky for accents and highlights (10%)
- Use Sand/Beige for warm backgrounds (10%)
- Use Gold for premium feel and metrics
- Maintain WCAG AA contrast (4.5:1 for text)

❌ **DON'T:**
- Use copper or orange anywhere except partner logos
- Use more than 3-4 brand colors in one document
- Use Nordshore on dark backgrounds without sufficient contrast

---

## Typography System

### Font Families

**Headlines**: **Lora** (serif) - Elegant, authoritative
- Variants: Regular, Medium, SemiBold, Bold (+ Italic)
- Usage: Document titles, section headers, all headlines

**Body Text**: **Roboto Flex** (sans-serif) - Clean, readable
- Variants: Regular, Medium, Bold (all weights available)
- Usage: Body text, captions, UI elements

### Type Scale

| Element          | Font               | Size | Line Height | Color     | Usage                    |
|------------------|--------------------|------|-------------|-----------|--------------------------|
| **Document Title**  | Lora Bold          | 42pt | 1.2x        | Nordshore | Main document title      |
| **Section Header**  | Lora SemiBold      | 28pt | 1.2x        | Nordshore | Major section headings   |
| **Subhead**         | Roboto Flex Medium | 18pt | 1.3x        | Nordshore | Subsection headings      |
| **Body Text**       | Roboto Flex Regular| 11pt | 1.5x        | Black     | Primary body text        |
| **Caption**         | Roboto Flex Regular| 9pt  | 1.4x        | Gray      | Image captions, footnotes|

### Typography Rules

✅ **DO:**
- Use Lora for ALL headlines and section titles
- Use Roboto Flex for ALL body text
- Follow modular type scale (42, 28, 18, 11, 9)
- Maintain line heights: 1.2x headlines, 1.5x body
- Ensure clear hierarchy (size contrast ≥1.5x)

❌ **DON'T:**
- Use Arial, Helvetica, Times New Roman, Georgia, Calibri
- Use font sizes not in the scale
- Use all caps for long text (max 3 words)
- Justify body text (left-align only)
- Set body text below 11pt

### Font Installation

```powershell
# Windows (run as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# Then restart InDesign
```

Fonts installed:
- Lora: 8 styles (Regular, Medium, SemiBold, Bold + Italic)
- Roboto: 66 fonts (all weights, condensed, semi-condensed)

Location: `assets/fonts/`

---

## Logo Usage

### TEEI Logo

**Colors Allowed:**
- Nordshore (#00393F) on light backgrounds
- White (#FFFFFF) on dark backgrounds

**Minimum Sizes:**
- Print: 0.5 inches
- Digital: 48 pixels

### Clearspace Rule

**Minimum clearspace = height of logo icon element**

No text, graphics, or other logos within this zone.

```
┌─────────────────────────────┐
│                             │  ↕ clearspace
│    ┌─────────┐              │
│    │  TEEI   │              │  ↕ logo height
│    │  LOGO   │              │
│    └─────────┘              │
│                             │  ↕ clearspace
└─────────────────────────────┘
  ↔ clearspace    ↔ clearspace
```

### Logo Rules

✅ **DO:**
- Maintain minimum clearspace
- Use only Nordshore or White
- Scale proportionally
- Place on uncluttered backgrounds

❌ **DON'T:**
- Stretch or distort
- Rotate or skew
- Add effects (drop shadow, glow, outline)
- Place on busy backgrounds
- Use colors other than Nordshore/White

---

## Spacing & Layout

### Grid System

**12-column grid**
- Gutter: 20pt
- Margin: 40pt all sides

### Spacing Scale

| Element              | Spacing | Usage                           |
|----------------------|---------|---------------------------------|
| **Page margins**        | 40pt    | All sides                       |
| **Section breaks**      | 60pt    | Between major sections          |
| **Element spacing**     | 20pt    | Between content elements        |
| **Paragraph spacing**   | 12pt    | Between paragraphs              |
| **Line height (body)**  | 1.5x    | Body text readability           |
| **Line height (headlines)** | 1.2x| Headline compactness            |

### Page Size

**Letter**: 8.5" × 11" (612 × 792 points)

### Layout Rules

✅ **DO:**
- Maintain 40pt margins all sides
- Use 60pt breaks between sections
- Keep 20pt between elements
- Align to 12-column grid
- Use optical alignment for visual balance

❌ **DON'T:**
- Let text run to edges (no margin)
- Cram content (insufficient spacing)
- Mix spacing scales
- Ignore grid alignment

---

## Photography Guidelines

### Required Style

| Attribute     | Required              | Forbidden                  |
|---------------|-----------------------|----------------------------|
| **Lighting**     | Natural, warm         | Studio, cold, clinical     |
| **Tone**         | Warm (Sand/Beige)     | Cool, blue-toned           |
| **Authenticity** | Real moments          | Staged, generic stock      |
| **Diversity**    | Varied representation | Single demographic         |
| **Emotion**      | Hope, connection      | Sadness, despair           |

### Photography Requirements

✅ **DO:**
- Use natural lighting (outdoor or near windows)
- Apply warm color grading (align with Sand/Beige palette)
- Capture authentic educational moments
- Show diverse ages, ethnicities, genders, abilities
- Convey hope, empowerment, connection

❌ **DON'T:**
- Use cold/clinical studio lighting
- Use generic stock photography
- Use corporate headshots
- Stage artificial moments
- Show only one demographic
- Convey sadness or despair

### Image Specifications

**Resolution:**
- Print: 300 DPI
- Digital: 150 DPI minimum

**Color Mode:**
- Print: CMYK
- Digital: RGB

**Formats:**
- Preferred: TIFF (print), PNG (digital)
- Acceptable: JPEG (high quality)

---

## Brand Voice

### The 6 Brand Qualities

| Quality        | Description                    | Examples                          |
|----------------|--------------------------------|-----------------------------------|
| **Empowering**    | Uplifting, capability-focused  | "You can transform education"     |
| **Urgent**        | Important, timely              | "Now is the time to act"          |
| **Hopeful**       | Optimistic, forward-looking    | "Together we build a better future"|
| **Inclusive**     | Celebrating diversity          | "All students deserve opportunity"|
| **Respectful**    | Honoring all stakeholders      | "We value every voice"            |
| **Clear**         | Jargon-free, accessible        | "Simple, straightforward language"|

### Voice Rules

✅ **DO:**
- Use active voice ("We provide" not "Provided by")
- Use short sentences (<20 words average)
- Use inclusive language ("folks", "people", "everyone")
- Use plain English (avoid jargon)
- Be specific and concrete
- Show empowerment and hope

❌ **DON'T:**
- Use condescending words ("simply", "just", "obviously")
- Use panic-inducing language
- Use naive optimism ("Everything is perfect!")
- Use exclusionary terms ("guys", "mankind")
- Use corporate jargon ("synergy", "leverage", "paradigm")
- Use complex/passive voice

### Forbidden Language

**Condescending:**
- simply, just, obviously, clearly, merely, you should, you must

**Jargon:**
- synergy, paradigm, leverage, optimize, utilize, facilitate
- bandwidth, ecosystem, scalable, disruption, pivot

**Non-Inclusive:**
- guys, mankind, manpower, man-hours

**Replacements:**
- "guys" → "folks", "everyone", "team"
- "mankind" → "humanity", "people"
- "manpower" → "workforce", "staff"

---

## Export Specifications

### For Print

| Setting          | Value            |
|------------------|------------------|
| **Format**          | PDF/X-4          |
| **Resolution**      | 300 DPI          |
| **Color Mode**      | CMYK             |
| **Bleed**           | 3mm all sides    |
| **Trim Marks**      | Yes              |
| **Embed Fonts**     | Yes (all fonts)  |

### For Digital

| Setting          | Value            |
|------------------|------------------|
| **Format**          | PDF (high quality)|
| **Resolution**      | 150 DPI minimum  |
| **Color Mode**      | RGB              |
| **Optimize**        | Yes (web)        |
| **Embed Fonts**     | Yes              |

### File Naming

```
TEEI_[Partner]_[DocType]_v[Version]_[YYYYMMDD].pdf

Examples:
TEEI_AWS_WorldClass_Partnership_v2_20251104.pdf
TEEI_Google_Overview_v1_20251105.pdf
```

---

## Quick Validation Checklist

### ✅ Color
- [ ] Nordshore (#00393F) used as primary (80%)
- [ ] No copper/orange (except partner logos)
- [ ] At least 2-3 brand colors used
- [ ] WCAG AA contrast maintained

### ✅ Typography
- [ ] Lora for all headlines
- [ ] Roboto Flex for all body text
- [ ] Font sizes in scale (42, 28, 18, 11, 9)
- [ ] Line heights correct (1.2x headlines, 1.5x body)
- [ ] Clear visual hierarchy

### ✅ Logo
- [ ] Minimum clearspace maintained
- [ ] Correct colors (Nordshore or White only)
- [ ] No distortion or effects
- [ ] Minimum size requirements met

### ✅ Spacing
- [ ] 40pt margins all sides
- [ ] 60pt section breaks
- [ ] 20pt element spacing
- [ ] Letter size (8.5" × 11")

### ✅ Brand Voice
- [ ] No condescending language
- [ ] No jargon or buzzwords
- [ ] Inclusive language throughout
- [ ] Clear, accessible writing
- [ ] Empowering and hopeful tone

### ✅ Photography
- [ ] 3-5 authentic photos included
- [ ] Natural warm lighting
- [ ] Warm color tones (Sand/Beige aligned)
- [ ] Diverse representation
- [ ] Positive emotions (hope, connection)

---

## Common Mistakes & Fixes

| Mistake | Fix |
|---------|-----|
| Using copper/orange | Replace all with Nordshore (#00393F) |
| Arial/Helvetica fonts | Install TEEI fonts, replace with Lora/Roboto Flex |
| Text cutoffs | Expand text frames, reduce font size, add padding |
| "XX" placeholders | Replace with actual numbers |
| Generic stock photos | Use authentic TEEI program photos |
| "guys" | Replace with "folks", "everyone", "team" |
| Corporate jargon | Replace with plain English |
| Studio lighting | Use natural light photos |
| Cold color tones | Apply warm color grading |

---

## Resources

### Brand Guidelines
- **Official**: `T:\TEEI\TEEI Overviews\TEEI Design Guidelines.pdf` (21 pages)
- **Design Fix Report**: `reports/TEEI_AWS_Design_Fix_Report.md` (comprehensive)
- **This Reference**: `docs/TEEI-BRAND-REFERENCE.md`

### Assets
- **Logos**: `T:\TEEI\Logos\` or `assets/images/`
- **Fonts**: `assets/fonts/`
- **Partner Logos**: `assets/partner-logos/`

### Tools
- **Compliance Audit**: `node scripts/audit-brand-compliance.js <pdf>`
- **Font Install**: `powershell scripts/install-fonts.ps1`
- **Color Validation**: Built into compliance audit

### Examples
- **Excellent**: See world-class examples in `T:\TEEI\Examples\`
- **Poor**: See violations in design fix report
- **Templates**: `templates/` directory

---

## Contact & Support

For brand guideline questions:
- Review official guidelines: `TEEI Design Guidelines.pdf`
- Check design fix report: `TEEI_AWS_Design_Fix_Report.md`
- Run compliance audit: `audit-brand-compliance.js`

---

**Last Updated**: 2025-11-06
**Version**: 1.0.0
**Status**: Official TEEI Brand Reference
