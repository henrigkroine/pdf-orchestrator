# Design Standards for PDF Orchestrator

**Project**: PDF Orchestrator - TEEI Partnership Documents
**Last Updated**: 2025-11-05
**Owner**: TEEI Design & Technical Team

---

## Color Profiles and ICC Standards

### Color Management Strategy

**Principle**: Use ICC profiles to ensure consistent color across all outputs (screen, web, print).

### ICC Profiles by Output Type

#### Screen/Web PDFs (Digital Distribution)

**Profile**: **sRGB IEC61966-2.1**

**Rationale**:
- Standard for web and digital displays
- Widest compatibility across browsers and devices
- Smaller color gamut, safe for screen

**Usage**:
- Partnership PDFs viewed on desktop/tablet
- Email attachments
- Website downloads

**Export Settings** (InDesign):
```
Color Conversion: Convert to Destination (Preserve Numbers)
Destination: sRGB IEC61966-2.1
Profile Inclusion Policy: Include Destination Profile
```

#### Print PDFs (Offset/Digital Printing)

**Profile**: **Coated FOGRA39 (ISO 12647-2:2004)**

**Rationale**:
- Standard for European coated paper offset printing
- CMYK color space (required for commercial printing)
- Matches most print vendors in US/Europe

**Usage**:
- High-volume print runs
- Professional marketing materials
- Conference handouts

**Export Settings** (InDesign):
```
Color Conversion: Convert to Destination (Preserve Numbers)
Destination: Coated FOGRA39
Profile Inclusion Policy: Include Destination Profile
Intent: Relative Colorimetric (preserve TEEI brand colors)
Black Point Compensation: On
```

**Alternative for US Printers**: **US Web Coated (SWOP) v2**
- Use if printer specifically requests
- Similar to FOGRA39, optimized for US web presses

#### Premium Print (Art/Photography Books)

**Profile**: **Adobe RGB (1998)**

**Rationale**:
- Wider gamut than sRGB
- Better color accuracy for photography
- Preserves image quality

**Usage**:
- Annual reports with high-quality photography
- Donor recognition books
- Premium marketing materials

**Export Settings** (InDesign):
```
Color Conversion: Convert to Destination
Destination: Adobe RGB (1998)
Profile Inclusion Policy: Include Destination Profile
```

---

## PDF Export Presets

### PDF/X Standards

**What is PDF/X?**
- ISO standard for graphic content exchange
- Ensures print-ready PDFs with no missing fonts, images, or color issues

### PDF/X-4:2010 (RECOMMENDED)

**Use Case**: Modern print workflows, TEEI standard

**Features**:
- Supports transparency (no flattening)
- Supports layers
- RGB, CMYK, or LAB color spaces
- PDF 1.6 (Acrobat 7+)

**Export Settings** (InDesign `File → Export → Adobe PDF (Print)`):
```
Standard: PDF/X-4:2010
Compatibility: Acrobat 7 (PDF 1.6)

--- General ---
Pages: All
Spreads: OFF (single pages)
View PDF after Exporting: OFF

--- Compression ---
Color Images:
  Downsampling: Do Not Downsample
  Compression: Automatic (JPEG)
  Quality: Maximum

Grayscale Images:
  Downsampling: Do Not Downsample
  Compression: Automatic (JPEG)
  Quality: Maximum

Monochrome Images:
  Downsampling: Do Not Downsample
  Compression: CCITT Group 4

--- Marks and Bleeds ---
Trim Marks: ON (if printing with bleed)
Bleed Marks: ON (if printing with bleed)
Registration Marks: ON (for press check)
Color Bars: OFF (unless printer requests)
Page Information: OFF

Use Document Bleed Settings: ON
  Top/Bottom/Left/Right: 3mm (0.125 inches)

Include Slug Area: OFF

--- Output ---
Color Conversion: Convert to Destination
Destination: Coated FOGRA39 (for print) OR sRGB (for digital)
Profile Inclusion Policy: Include Destination Profile
Simulate Overprint: OFF

--- Advanced ---
Fonts:
  Subset Fonts: 100% (embed all fonts completely)

Transparency Flattener:
  Preset: [High Resolution] (preserve quality)

OPI: Leave Images

--- Security ---
No security settings (password protect externally if needed)
```

### PDF/X-1a:2001 (Legacy, if required by printer)

**Use Case**: Older print workflows, conservative printers

**Features**:
- CMYK or spot colors only (no RGB)
- No transparency (must flatten)
- PDF 1.3 (Acrobat 4+)

**Export Settings**:
```
Standard: PDF/X-1a:2001
Compatibility: Acrobat 4 (PDF 1.3)

Same as PDF/X-4, except:
  - Output: CMYK only (convert RGB images before export)
  - Transparency Flattener: High Resolution (required)
```

### High-Quality Print (Non-X)

**Use Case**: Internal proofs, desktop printers

**Export Settings**:
```
Adobe PDF Preset: [High Quality Print]
Compatibility: Acrobat 7 (PDF 1.6)

Same compression/font settings as PDF/X-4
No trim marks or bleed (unless needed)
```

---

## Bleed and Slug Configuration

### Bleed

**Definition**: Extra area beyond trim edge (for cutting tolerances)

**TEEI Standard Bleed**:
- **3mm** (0.125 inches) on all sides
- Required for any element that touches page edge

**When to Use Bleed**:
- Background colors/images that extend to edge
- Photos that bleed off page
- Colored page borders

**When NOT to Use Bleed**:
- Digital-only PDFs (no printing)
- Documents with white margins

**InDesign Setup**:
```
File → Document Setup → Bleed and Slug
  Bleed: Top 3mm, Bottom 3mm, Inside 3mm, Outside 3mm
```

### Slug

**Definition**: Area outside bleed for printer instructions, color bars

**TEEI Standard Slug**: Not used (keep OFF)

---

## Image Rules

### Resolution Requirements

**Print Images**:
- **Minimum Effective Resolution**: 300 DPI (dots per inch)
- **Optimal Resolution**: 300-400 DPI
- **Maximum Resolution**: 600 DPI (larger = bigger file size, no visual gain)

**Calculating Effective DPI**:
```
Effective DPI = (Image Width in Pixels) / (Placed Width in Inches)

Example:
  Image: 3600 × 2400 pixels
  Placed at: 12 × 8 inches
  Effective DPI = 3600 / 12 = 300 DPI ✓ GOOD
```

**Web/Screen Images**:
- **Minimum Resolution**: 150 DPI effective (for high-DPI displays)
- **Optimal Resolution**: 150-200 DPI
- **Standard Display**: 72-96 DPI

**Image Preflight Check**:
```javascript
function validateImageResolution(image) {
  const effectiveDPI = image.widthPx / image.placedWidthInches;

  if (effectiveDPI < 150) {
    return { status: 'FAIL', message: 'Resolution too low for print' };
  } else if (effectiveDPI < 300) {
    return { status: 'WARN', message: 'Resolution below 300 DPI' };
  } else {
    return { status: 'PASS', message: `Effective DPI: ${effectiveDPI}` };
  }
}
```

### Permitted Formats

**Print Workflows**:
- **TIFF** (.tif, .tiff) - Uncompressed, lossless (BEST for print)
- **PSD** (.psd) - Photoshop native with layers
- **JPEG** (.jpg) - Compressed, use quality 90+ only
- **PNG** (.png) - Lossless, good for graphics with transparency

**Web Workflows**:
- **JPEG** (.jpg) - Compressed, quality 85-90
- **PNG** (.png) - Lossless, use for logos/graphics
- **WebP** (.webp) - Modern, smaller file size (not for InDesign)

**Vector Graphics**:
- **EPS** (.eps) - Encapsulated PostScript (legacy)
- **AI** (.ai) - Adobe Illustrator native
- **SVG** (.svg) - Scalable Vector Graphics (web/icons)
- **PDF** (.pdf) - Vector PDF (can place in InDesign)

**NOT Permitted**:
- **GIF** (.gif) - Low quality, limited colors
- **BMP** (.bmp) - Outdated, no compression
- **HEIC** (.heic) - Not supported by InDesign

### CMYK Conversion

**When to Convert**:
- For print PDFs (PDF/X with CMYK profile)
- Before placing images in InDesign (if print workflow)

**How to Convert** (Photoshop):
```
Edit → Convert to Profile
  Destination Space: Coated FOGRA39
  Engine: Adobe (ACE)
  Intent: Relative Colorimetric
  Black Point Compensation: ON
  Flatten Image: Yes (if layers not needed)
```

**TEEI Brand Colors in CMYK**:

| Color | HEX | CMYK (FOGRA39) |
|-------|-----|----------------|
| Nordshore | #00393F | C100 M45 Y40 K70 |
| Sky | #C9E4EC | C25 M5 Y5 K0 |
| Sand | #FFF1E2 | C0 M6 Y12 K0 |
| Beige | #EFE1DC | C5 M8 Y10 K0 |
| Moss | #65873B | C50 M20 Y90 K10 |
| Gold | #BA8F5A | C25 M35 Y65 K10 |
| Clay | #913B2F | C20 M75 Y75 K30 |

**Conversion Workflow**:
```
RGB Image (sRGB) → Photoshop Convert to Profile (FOGRA39) → CMYK TIFF → InDesign
```

### Max File Size per Page

**Print PDFs**:
- **Per Image**: 5 MB max (after compression)
- **Per Page**: 25 MB max (all assets combined)
- **Full Document**: 100 MB max (prefer <50 MB)

**Web PDFs**:
- **Per Image**: 500 KB max
- **Per Page**: 2 MB max
- **Full Document**: 10 MB max (prefer <5 MB)

**If Exceeding Limits**:
1. Reduce image dimensions (if placed smaller than source)
2. Increase JPEG compression (quality 90 → 85)
3. Convert TIFF to JPEG
4. Remove unused image data (crop to frame in Photoshop)

---

## Typography Standards

### Font Pairings for TEEI

**Headlines**: **Lora** (serif)
- Font Family: Lora
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
- Italics: Available for all weights
- Source: Google Fonts (installed locally via `scripts/install-fonts.ps1`)

**Body Text**: **Roboto Flex** (sans-serif)
- Font Family: Roboto Flex (variable font)
- Weights: Thin (100) → Black (900)
- Variants: Regular, Condensed, Semi-Condensed
- Source: Google Fonts (installed locally)

**Fallback Fonts** (if Lora/Roboto missing):
- Headlines: Georgia, Times New Roman, serif
- Body: Arial, Helvetica, sans-serif

### Typography Scale

```
Document Title: Lora Bold, 42pt, Nordshore (#00393F), Line Height 1.2
Section Headers: Lora Semibold, 28pt, Nordshore, Line Height 1.2
Subheads: Roboto Flex Medium, 18pt, Nordshore, Line Height 1.3
Body Text: Roboto Flex Regular, 11pt, Black (#000000), Line Height 1.5
Captions: Roboto Flex Regular, 9pt, Gray (#666666), Line Height 1.4
```

### Ligatures

**Enable Standard Ligatures**:
- fi, fl, ff, ffi, ffl

**InDesign Settings**:
```
Character Panel → OpenType → Ligatures: Standard
```

**Do NOT Use**:
- Discretionary ligatures (ct, st) - not suitable for professional documents
- Historical ligatures - not appropriate for TEEI brand

### Hyphenation Rules

**Enable Hyphenation** for body text (improves rag, reduces rivers):
```
Paragraph Panel → Hyphenation: ON

Hyphenation Settings:
  Words with at Least: 6 letters
  After First: 3 letters
  Before Last: 3 letters
  Hyphen Limit: 2 consecutive lines
  Hyphenation Zone: 0.5 inches
```

**Disable Hyphenation** for:
- Headlines
- Subheads
- Captions
- URLs

### Widow and Orphan Control

**Widow**: Last line of paragraph alone at top of column/page
**Orphan**: First line of paragraph alone at bottom of column/page

**InDesign Settings**:
```
Paragraph Panel → Keep Options

Keep with Next: 0 lines (except headings)
Keep Lines Together: At Start/End of Paragraph
  Start: 2 lines
  End: 2 lines
```

**For Headings**:
```
Keep with Next: 2 lines (keep heading with at least 2 lines of body text)
```

---

## Iconography Standards

### Icon Set Source

**Primary**: **Custom TEEI Icons** (Illustrator source files)
- Location: `assets/icons/teei-icon-set.ai`
- Format: SVG (vector)
- Style: Minimalist, flat, 2px stroke

**Fallback**: **Noun Project** (licensed icons)
- License: Royalty-free with attribution (or Creative Commons)
- Style: Match TEEI custom icons (minimalist, line-based)

**Never Use**:
- Emoji (unprofessional for print)
- Clipart (outdated style)
- Unlicensed stock icons

### SVG Only Rule

**Why SVG**:
- Scalable without quality loss
- Smaller file size than raster
- Editable colors
- Crisp at any size

**Placing SVG in InDesign**:
```
File → Place → Select .svg file

Check:
  - Bounding box correct (no extra whitespace)
  - Colors match TEEI palette
  - Stroke width consistent (2px at 100% scale)
```

**Converting SVG to InDesign Format**:
```
Option 1: Place SVG directly (InDesign CC 2019+)
Option 2: Open in Illustrator → Save As → .ai → Place .ai in InDesign
Option 3: Export from Illustrator as high-res PNG (if vector issues)
```

### Stroke Rules

**TEEI Icon Stroke Standard**:
- **Width**: 2px at 100% scale
- **Cap**: Round
- **Join**: Round
- **Color**: Nordshore (#00393F) or Gold (#BA8F5A)

**Scaling Icons**:
- Scale proportionally (maintain stroke width ratio)
- If icon placed at 50% scale, stroke appears as 1px (acceptable)
- Never scale non-uniformly (distorts stroke)

**Icon Sizes**:
```
Small (inline with text): 16×16 px (0.22 inches at 72 DPI)
Medium (section markers): 32×32 px (0.44 inches)
Large (page headers): 64×64 px (0.89 inches)
```

---

## Accessibility Standards

### Target: PDF/UA and WCAG 2.2 AA

**PDF/UA** (ISO 14289-1): PDF accessibility standard
**WCAG 2.2 AA**: Web Content Accessibility Guidelines Level AA

### Tags (Structure)

**All Documents Must Have**:
- Document title (metadata)
- Language (en-US)
- Logical reading order
- Semantic tags (headings, lists, tables, figures)

**Tag Hierarchy**:
```
<Document>
  <H1>Document Title</H1>
  <P>Introduction paragraph...</P>
  <H2>Section Heading</H2>
  <P>Body text...</P>
  <Figure>
    <Caption>Figure caption</Caption>
  </Figure>
  <Table>
    <THead><TR><TH>Header</TH></TR></THead>
    <TBody><TR><TD>Cell</TD></TR></TBody>
  </Table>
</Document>
```

**InDesign Tag Mapping**:
```
Paragraph Styles → Export Tagging
  Document Title → H1
  Section Header → H2
  Subhead → H3
  Body Text → P
  Caption → Caption
  List Item → LI
```

### Alt Text

**Required for All Images**:
- Decorative images: `<Figure Alt="" />` (empty alt = decorative)
- Informative images: `<Figure Alt="Description of content and purpose" />`

**Writing Alt Text**:
```
Bad:  "image.jpg"
Bad:  "A photo"
Good: "Students collaborating on laptops in a modern classroom"
Good: "TEEI Together for Ukraine program logo"
```

**Character Limit**: 125 characters (screen reader best practice)

**InDesign Alt Text**:
```
Select image → Object → Object Export Options → Alt Text
  Alt Text Source: Custom
  Custom Alt Text: [descriptive text]
```

### Reading Order

**Logical Order**:
1. Document title
2. Introduction
3. Body content (top to bottom, left to right)
4. Sidebars (after related content)
5. Captions (immediately after images)
6. Footnotes (at end of page or document)

**Testing Reading Order**:
```
Acrobat Pro → Accessibility → Reading Order Tool
  - Verify content flows logically
  - No out-of-order elements
```

**InDesign Articles Panel**:
```
Window → Articles
  - Create Article
  - Drag frames in correct reading order
  - Check "Use for Reading Order in Tagged PDF"
```

### Table Headers

**All Tables Must Have**:
- Header row (`<TH>` tags)
- Scope attribute (col or row)
- Caption or title

**InDesign Table Setup**:
```
Table → Table Options → Headers and Footers
  Header Rows: 1
  Repeat Header: Every Text Column

Cell Options → Text
  - Select header row cells
  - Paragraph Style: [Table Header]
  - Export as <TH> tag
```

**Complex Tables**:
- Avoid merged cells (breaks screen readers)
- Use simple table structure
- If complex, split into multiple simple tables

### Bookmarks

**Required Bookmarks**:
- Document title (top level)
- All section headings (H2)
- Subsections (H3) if document >20 pages

**InDesign Bookmarks**:
```
Window → Interactive → Bookmarks
  - Create Bookmark from each heading
  - Organize hierarchically (matching heading levels)

Export → Adobe PDF (Interactive)
  Include: Bookmarks
```

**Testing Bookmarks**:
```
Acrobat Pro → Bookmarks Panel
  - Click each bookmark
  - Verify correct destination
  - Check hierarchy matches document structure
```

### Color Contrast

**WCAG AA Requirements**:
- Normal text (< 18pt): 4.5:1 contrast ratio
- Large text (≥ 18pt): 3:1 contrast ratio
- UI components: 3:1 contrast ratio

**TEEI Brand Compliance**:

| Foreground | Background | Ratio | Pass |
|------------|------------|-------|------|
| Nordshore (#00393F) | White (#FFFFFF) | 11.6:1 | ✅ AAA |
| Nordshore (#00393F) | Sand (#FFF1E2) | 10.8:1 | ✅ AAA |
| Black (#000000) | Sand (#FFF1E2) | 19.2:1 | ✅ AAA |
| Gold (#BA8F5A) | White (#FFFFFF) | 3.2:1 | ✅ AA Large |
| Gold (#BA8F5A) | Nordshore (#00393F) | 3.6:1 | ✅ AA Large |

**Testing Contrast**:
- Tool: WebAIM Contrast Checker (https://webaim.org/resources/contrastchecker/)
- Tool: Acrobat Pro Accessibility Checker

---

## Validation Checklist

### Pre-Export Checklist (InDesign)

- [ ] All fonts embedded (no missing fonts warning)
- [ ] All images linked (no missing links)
- [ ] All images ≥300 DPI effective resolution
- [ ] Color profile set (sRGB or FOGRA39)
- [ ] Bleed set to 3mm (if print)
- [ ] Paragraph styles applied (not local overrides)
- [ ] Alt text added to all images
- [ ] Reading order verified (Articles panel)
- [ ] Bookmarks created for headings
- [ ] No text cutoffs at 100%, 150%, 200% zoom
- [ ] Document metadata complete (title, author, subject)

### Post-Export Validation (Acrobat Pro)

- [ ] PDF/X-4 compliant (if print)
- [ ] All fonts embedded and subsetted
- [ ] Color profile embedded
- [ ] Accessibility checker: 0 errors
  - `Tools → Accessibility → Full Check`
- [ ] Reading order logical
- [ ] Alt text present for all images
- [ ] Bookmarks functional
- [ ] File size within limits (<100 MB print, <10 MB web)
- [ ] No security restrictions (can copy text, print)

### Automated Preflight (Adobe Preflight)

```
Acrobat Pro → Tools → Print Production → Preflight

Run Profile: PDF/X-4 Compliance
  - All checks must pass
  - Fix errors if any
  - Re-export from InDesign if structural issues
```

---

## Review Schedule

- **Weekly**: Review new designs against brand guidelines
- **Monthly**: Audit exported PDFs for accessibility compliance
- **Quarterly**: Update color profiles if ICC standards change
- **Annually**: Review and update design standards document

**Next Review Due**: 2025-12-05
