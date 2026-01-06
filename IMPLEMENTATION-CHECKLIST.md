# Photo Integration - Implementation Checklist

**Purpose**: Step-by-step guide to integrate program photos into TEEI-AWS document
**Time Required**: 5-30 minutes (depending on approach)
**Skill Level**: Basic InDesign knowledge

---

## Pre-Flight Checks

Before starting, verify:

- [ ] InDesign CC 2023 or later installed
- [ ] TEEI-AWS partnership document open (3+ pages)
- [ ] Backup saved (File > Save As > add "_backup" to filename)
- [ ] Images exist in `assets/images/` directory:
  - [ ] hero-ukraine-education.jpg (2.84 MB)
  - [ ] mentorship-hands.jpg (32 KB)
  - [ ] mentorship-team.jpg (35 KB)

---

## Implementation Path Selection

Choose ONE of the following:

### ✅ Option A: Automated (RECOMMENDED)
**Time**: 5 minutes | **Skill**: Beginner

**When to use**:
- First-time integration
- Standard document structure
- Want fastest results

**Proceed to**: Section 1 - Automated Integration

---

### Option B: Manual Placement
**Time**: 30 minutes | **Skill**: Intermediate

**When to use**:
- Custom positioning needed
- Learning InDesign workflow
- ExtendScript issues

**Proceed to**: Section 2 - Manual Integration

---

## Section 1: Automated Integration

### Step 1.1: Open Script
- [ ] In InDesign: File > Scripts > Other Script...
- [ ] Navigate to: `D:\Dev\VS Projects\Projects\pdf-orchestrator\`
- [ ] Select: `add_photos_teei_aws.jsx`
- [ ] Click "Open"

**Expected**: Script execution progress dialog appears

### Step 1.2: Wait for Completion
- [ ] Wait ~5 seconds for script to complete
- [ ] Success alert appears: "Program photography integration complete!"
- [ ] Alert shows 3 checkmarks for each page

**If error occurs**: See Troubleshooting section below

### Step 1.3: Visual Verification
- [ ] Zoom to 100%: Overall layout looks balanced
- [ ] Zoom to 150%: Images are sharp and clear
- [ ] Zoom to 200%: Minimal pixelation (expected at this level)
- [ ] Pan through all 3 pages: No text cutoffs near images

### Step 1.4: Quality Check
- [ ] Page 1: Hero image visible with classroom scene
- [ ] Page 2: Mentorship hands image centered
- [ ] Page 3: Team collaboration image left-aligned
- [ ] All images proportional (no stretching/distortion)
- [ ] Text still readable and properly positioned

### Step 1.5: Export Test
- [ ] File > Export > Adobe PDF (Print)
- [ ] Preset: "High Quality Print"
- [ ] Location: `exports/TEEI_AWS_Photos_Test.pdf`
- [ ] Click "Export"
- [ ] Open exported PDF and verify images appear

**If all checks pass**: ✅ Integration complete! Proceed to Final Steps.

**If issues found**: See Troubleshooting section below.

---

## Section 2: Manual Integration

### Step 2.1: Prepare Document
- [ ] Open TEEI-AWS document in InDesign
- [ ] Window > Layers (verify all layers unlocked)
- [ ] View > Grids & Guides > Show Guides
- [ ] Zoom to 100%

### Step 2.2: Page 1 - Hero Image

**Image**: hero-ukraine-education.jpg

- [ ] Navigate to Page 1
- [ ] File > Place
- [ ] Select: `assets/images/hero-ukraine-education.jpg`
- [ ] Click "Open" (cursor becomes image preview)
- [ ] Click at position: X=40pt, Y=180pt
- [ ] Drag to create rectangle: Width=532pt, Height=180pt
- [ ] Release mouse (image appears in frame)
- [ ] Object > Fitting > Fill Frame Proportionally
- [ ] Object > Fitting > Center Content

**Optional Overlay**:
- [ ] Create rectangle: Same bounds as image (40, 180, 572, 360)
- [ ] Fill: Nordshore (#00393F)
- [ ] Opacity: 20%
- [ ] Object > Arrange > Send to Back

### Step 2.3: Page 2 - Mentorship Image

**Image**: mentorship-hands.jpg

- [ ] Navigate to Page 2
- [ ] File > Place
- [ ] Select: `assets/images/mentorship-hands.jpg`
- [ ] Click at position: X=206pt, Y=340pt
- [ ] Drag to create rectangle: Width=200pt, Height=140pt
- [ ] Object > Fitting > Fill Frame Proportionally
- [ ] Object > Fitting > Center Content

### Step 2.4: Page 3 - Team Image

**Image**: mentorship-team.jpg

- [ ] Navigate to Page 3
- [ ] File > Place
- [ ] Select: `assets/images/mentorship-team.jpg`
- [ ] Click at position: X=40pt, Y=540pt
- [ ] Drag to create rectangle: Width=250pt, Height=120pt
- [ ] Object > Fitting > Fill Frame Proportionally
- [ ] Object > Fitting > Center Content

### Step 2.5: Quality Check
- [ ] All 3 images placed and visible
- [ ] No distortion or stretching
- [ ] Images align with margins (40pt left/right)
- [ ] No text overlap or cutoffs
- [ ] Color balance looks consistent

**If all checks pass**: ✅ Manual integration complete! Proceed to Final Steps.

---

## Final Steps (All Paths)

### Verify Brand Compliance
- [ ] Natural lighting evident in all photos
- [ ] Warm tones align with TEEI palette (Sand/Beige)
- [ ] Images show authentic moments (not staged)
- [ ] Diverse representation visible
- [ ] Conveys hope and connection

### Test at Multiple Zoom Levels
- [ ] 100% zoom: Balanced layout, clear visual hierarchy
- [ ] 150% zoom: Images sharp, text readable
- [ ] 200% zoom: Acceptable quality (slight pixelation OK)

### Export Quality Test
- [ ] File > Export > Adobe PDF (Print)
- [ ] Preset: High Quality Print
- [ ] Review exported PDF at all zoom levels
- [ ] File size: Verify <10 MB (ideal for digital distribution)

### Save Final Version
- [ ] File > Save
- [ ] Consider versioning: "TEEI_AWS_Partnership_v2_Photos.indd"
- [ ] Archive backup copy to safe location

---

## Troubleshooting

### Script Error: "Image Not Found"
**Cause**: File paths don't match actual locations

**Fix**:
1. Verify images exist: Open file explorer
2. Navigate to: `D:\Dev\VS Projects\Projects\pdf-orchestrator\assets\images\`
3. Confirm 3 JPG files present
4. If missing, contact project lead for image files

### Images Appear Distorted
**Cause**: Wrong fit option or frame manually resized

**Fix**:
1. Select image frame
2. Object > Fitting > Fill Frame Proportionally
3. Object > Fitting > Center Content
4. If still distorted, delete frame and re-place image

### Overlay Covers Image Completely
**Cause**: Layer order incorrect

**Fix**:
1. Select overlay rectangle (not image)
2. Object > Arrange > Send to Back
3. If still covering, delete overlay (optional feature)

### Poor Quality at High Zoom
**Cause**: Expected behavior at extreme magnification

**Fix**:
- 150 DPI images look excellent at 100% and 150% zoom
- Slight pixelation at 200% zoom is normal for screen viewing
- Current images are production-ready for digital distribution
- For print, 150 DPI is acceptable (300 DPI ideal)

### Text Overlapping Images
**Cause**: Text frames positioned over images

**Fix**:
1. Select image frame
2. Window > Text Wrap
3. Choose: "Wrap around bounding box"
4. Set offset: 12pt (standard TEEI spacing)
5. Or reposition text frames to avoid overlap

### File Size Too Large
**Cause**: High-resolution uncompressed images

**Fix**:
- Current total: ~3.5 MB for all 3 images (acceptable)
- If file size >10 MB after export:
  1. File > Export > Adobe PDF
  2. Compression: JPEG, Quality "High" (not "Maximum")
  3. Resolution: 150 DPI (not 300 DPI)

---

## Success Criteria

Integration is complete when ALL checked:

**Visual Quality**:
- [ ] All 3 images visible and properly positioned
- [ ] No distortion or stretching (aspect ratios maintained)
- [ ] Sharp at 100% and 150% zoom levels
- [ ] Color balance consistent across photos
- [ ] No text cutoffs or awkward cropping

**Brand Compliance**:
- [ ] Natural lighting (not studio flash)
- [ ] Warm color tones (Sand/Beige palette)
- [ ] Authentic moments (not staged)
- [ ] Diverse representation
- [ ] Conveys hope and connection

**Technical Quality**:
- [ ] Images embedded (not linked)
- [ ] Color space: RGB for digital
- [ ] Resolution: 150+ DPI at display size
- [ ] File size: <10 MB for digital distribution
- [ ] PDF exports without errors

**Layout Integrity**:
- [ ] 40pt margins maintained
- [ ] 12-column grid alignment preserved
- [ ] Spacing: 20pt minimum between elements
- [ ] Text wrap working correctly (if applicable)
- [ ] No overlapping elements

---

## Next Actions

After successful integration:

1. **Stakeholder Review**:
   - [ ] Share PDF with internal team
   - [ ] Gather feedback on image selection
   - [ ] Note any requested adjustments

2. **Continue Roadmap**:
   - [ ] Phase 3: Layout refinement (card-based sections, icons)
   - [ ] Phase 4: Polish & QA (brand review, multi-zoom testing)
   - [ ] Phase 5: Production (export for print/digital, distribute)

3. **Documentation**:
   - [ ] Update project log with completion date
   - [ ] Archive source files with version control
   - [ ] Note any custom adjustments made

---

## Support Resources

**Quick Reference**: `PHOTO-INTEGRATION-QUICKSTART.md`
**Complete Guide**: `PHOTO-INTEGRATION-COMPLETE.md`
**Visual Coords**: `PHOTO-COORDINATES-VISUAL.txt`
**Manual Steps**: `PHOTO-PLACEMENT-SPECS.md`
**Summary**: `SUMMARY-PHOTO-INTEGRATION.md`

**Questions?** Review comprehensive documentation in project root.

---

**Checklist Version**: 1.0
**Last Updated**: 2025-11-13
**Project**: PDF Orchestrator - TEEI AWS Partnership Automation
