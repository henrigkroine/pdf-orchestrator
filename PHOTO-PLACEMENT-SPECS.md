
# TEEI-AWS Partnership Document - Program Photo Placement Specifications

## Image Files Available
Located in: D:\Dev\VS Projects\Projects\pdf-orchestrator\assets\images\

1. **hero-ukraine-education.jpg** (2.8 MB)
   - Authentic classroom scene with diverse students
   - Natural lighting with warm tones (BRAND COMPLIANT)
   - Perfect for main hero image

2. **mentorship-hands.jpg** (32 KB)
   - Intimate teamwork moment
   - Warm Sand background color (BRAND COMPLIANT)
   - Ideal for supporting section

3. **mentorship-team.jpg** (35 KB)
   - Team collaboration scene
   - Sky blue background (BRAND COMPLIANT)
   - Great for CTA area

---

## PAGE 1: HERO IMAGE
**File**: hero-ukraine-education.jpg
**Purpose**: Main visual impact - shows educational program in action

**Placement Coordinates**:
- Top: 180pt (2.5 inches from top)
- Left: 40pt (standard TEEI margin)
- Bottom: 360pt (180pt height)
- Right: 572pt (PAGE_WIDTH - MARGIN)

**Sizing**: 532pt width × 180pt height
**Fit Options**: Proportional fill, centered
**Overlay**: Add 20% Nordshore (#00393F) overlay for text readability
**Position in Layout**: After overview text section, before program details

**InDesign Manual Steps**:
1. File → Place → Select hero-ukraine-education.jpg
2. Draw rectangle: X=40pt, Y=180pt, W=532pt, H=180pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content
5. (Optional) Add rectangle overlay: 20% Nordshore fill

---

## PAGE 2: MENTORSHIP SECTION
**File**: mentorship-hands.jpg
**Purpose**: Supporting visual - shows connection and collaboration

**Placement Coordinates**:
- Top: 340pt (4.72 inches from top)
- Left: 206pt (centered horizontally)
- Bottom: 480pt (140pt height)
- Right: 406pt

**Sizing**: 200pt width × 140pt height
**Fit Options**: Proportional fill, centered
**Overlay**: None (warm background already brand-compliant)
**Position in Layout**: Between program cards in middle section

**InDesign Manual Steps**:
1. File → Place → Select mentorship-hands.jpg
2. Draw rectangle: X=206pt, Y=340pt, W=200pt, H=140pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content

---

## PAGE 3: TEAM COLLABORATION
**File**: mentorship-team.jpg
**Purpose**: Final supporting visual before CTA

**Placement Coordinates**:
- Top: 540pt (7.5 inches from top)
- Left: 40pt (standard TEEI margin)
- Bottom: 660pt (120pt height)
- Right: 290pt

**Sizing**: 250pt width × 120pt height
**Fit Options**: Proportional fill, centered
**Overlay**: None (Sky background already brand-compliant)
**Position in Layout**: Above call-to-action section

**InDesign Manual Steps**:
1. File → Place → Select mentorship-team.jpg
2. Draw rectangle: X=40pt, Y=540pt, W=250pt, H=120pt
3. Object → Fitting → Fill Frame Proportionally
4. Object → Fitting → Center Content

---

## LAYOUT GRID ALIGNMENT

All images align with TEEI's 12-column grid:
- Gutter width: 20pt
- Margins: 40pt all sides
- Column width: ~41pt

**Hero Image**: Spans full 12 columns
**Mentorship Image**: Centered, spans ~5 columns
**Team Image**: Left-aligned, spans ~6 columns

---

## BRAND COMPLIANCE CHECKLIST

Before finalizing:
- [ ] All images use natural lighting (not studio stock)
- [ ] Color tones align with Sand/Beige palette
- [ ] Images show authentic moments (not staged)
- [ ] Diverse representation visible
- [ ] Images convey connection and hope
- [ ] No text cutoffs or awkward cropping
- [ ] Proportional fill maintains aspect ratios
- [ ] 40pt margins respected on all sides
- [ ] Images enhance (not distract from) text content

---

## TECHNICAL SPECIFICATIONS

**Document Setup**:
- Page size: 8.5" × 11" (612pt × 792pt)
- Margins: 40pt all sides
- Grid: 12 columns, 20pt gutters
- Color mode: RGB (for digital), CMYK (for print)

**Image Requirements**:
- Resolution: 150 DPI minimum (digital), 300 DPI (print)
- Color space: RGB or CMYK (match document)
- Compression: High quality JPEG
- Embedded (not linked) for portability

**Export Settings**:
- Format: PDF (high quality)
- Compression: JPEG (maximum quality)
- Resolution: 300 DPI for print, 150 DPI for digital
- Color conversion: Preserve embedded profiles

---

## TROUBLESHOOTING

**Image Not Loading?**
- Verify file path is correct (no typos)
- Check file permissions (read access)
- Confirm image file is not corrupted
- Use absolute paths (not relative)

**Wrong Aspect Ratio?**
- Use "Fill Frame Proportionally" not "Fit Content"
- Center content after filling
- May need to adjust frame dimensions

**Colors Look Wrong?**
- Check document color mode (RGB vs CMYK)
- Verify image color profile is embedded
- Use "Preserve Embedded Profiles" on export

**Text Overlapping Images?**
- Add text wrap (Window → Text Wrap)
- Set offset: 12pt (standard TEEI spacing)
- Or add 20% Nordshore overlay to image

---

## NEXT STEPS AFTER PHOTO INTEGRATION

1. Review layout at 100%, 150%, 200% zoom
2. Verify no text cutoffs near images
3. Check color consistency across all photos
4. Test export quality (PDF preview)
5. Get stakeholder approval on visual balance
6. Proceed to Phase 4: Polish & QA

---

**Generated**: add_program_photos.py
**Project**: TEEI-AWS Partnership Document Automation
**Phase**: 2 - Visual Enhancement
