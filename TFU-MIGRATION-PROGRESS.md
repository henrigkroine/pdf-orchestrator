# TFU Design System Migration - Progress Report

**Date**: 2025-11-13
**Status**: ⏳ In Progress (Steps 1-3 Complete)
**Goal**: Refit AWS partnership PDF to match Together for Ukraine design family

---

## Overview

This migration transforms the AWS partnership PDF from using a made-up "world-class" design to actually matching the existing Together for Ukraine (TFU) print design system.

**Key Changes**:
- 3 pages → 4 pages
- Split teal/sand cover → Full teal cover with centered photo card
- Inline metrics on page 1 → Stats sidebar on page 2
- Card-based programs → Two-column editorial text
- No closing CTA → Full teal closing with TFU badge + 3×3 partner logo grid
- Gold color usage (#BA8F5A) → Pure teal (#00393F) primary

---

## ✅ COMPLETED STEPS

### Step 1: Derive TEEI Print Design System from TFU PDFs

**Files Created**:
- `TEEI_PRINT_DESIGN_SYSTEM_FROM_OVERVIEWS.md` (13 sections, ~450 lines)

**Analyzed Reference PDFs**:
- Together for Ukraine.pdf (8 pages) - Master overview
- Together for Ukraine - Upskilling, Employment & Mentorship Program.pdf (8 pages)
- TEEI Mentorship Platform Overview.pdf (8 pages)
- Together for Ukraine - Mental Health Support Program.pdf (8 pages)

**Documented 6 Component Patterns**:
1. **TFU_Cover** - Full teal background + centered rounded photo card + white title
2. **TFU_AboutGoals** - Hero photo + two-column narrative + light blue stats sidebar
3. **TFU_ProgramMatrix** - Two-column text-based program listings with decorative divider
4. **TFU_PlatformFeatures** - Hero + three-column feature layout
5. **TFU_MentorshipBoxes** - Numbered feature boxes with icons
6. **TFU_ClosingCTA** - Full teal + TFU badge (blue+yellow) + 3×3 white partner logos + contact strip

**Color System Established**:
```
✅ Teal #00393F (RGB 0, 57, 63) - PRIMARY
✅ Light Blue #C9E4EC (RGB 201, 228, 236) - Stats boxes
✅ Blue #3D5CA6 (RGB 61, 92, 166) - TFU badge left
✅ Yellow #FFD500 (RGB 255, 213, 0) - TFU badge right

❌ FORBIDDEN: Gold #BA8F5A (NOT in TFU palette)
❌ FORBIDDEN: Copper/orange (except in partner logos)
```

**Typography System Established**:
```
Headlines: Lora (serif) - Bold/SemiBold, 20-60pt
Body Text: Roboto (sans serif) - Regular, 10-14pt
Labels: Roboto Medium - 10-11pt ALL CAPS, +1.5pt tracking
```

---

### Step 2: Compare AWS PDF to TFU System and Define New Layout

**Files Created**:
- `DESIGN_SPEC_AWS_PARTNERSHIP_TEEI_STYLE.md` (~600 lines)

**Current AWS PDF Problems Documented**:
1. ❌ Split teal/sand cover - should be full teal
2. ❌ Uses gold #BA8F5A extensively - not in TFU palette
3. ❌ Shows metrics on page 1 - should be in sidebar on page 2
4. ❌ Card-based programs with colored backgrounds - should be two-column text
5. ❌ Only 3 pages - should be 4
6. ❌ No TFU badge - signature element missing
7. ❌ No partner logo grid - signature element missing
8. ❌ No full teal closing page - signature element missing

**New 4-Page Layout Specified**:

**Page 1: TFU Cover Pattern**
- Full teal background #00393F (full bleed)
- TEEI logo white, top-left (40pt margins)
- Centered photo card: 460×420pt, 24pt rounded corners
- "Together for Ukraine" title: Lora Bold 60pt white, centered
- "AWS PARTNERSHIP" subtitle: Roboto 14pt ALL CAPS white, 2.5pt tracking

**Page 2: About + Goals Pattern**
- Full-width hero photo at top (~200pt height)
- Left column (60%): Partnership narrative (mission, value prop, impact)
- Right column (35%): Light blue #C9E4EC stats sidebar
  - 50,000 students reached
  - 12 countries
  - 45 partner organizations
  - 3,500 AWS certifications
- Stats format: Lora Bold 34pt numbers + Roboto 10pt ALL CAPS labels + 1pt teal dividers

**Page 3: Programs Matrix Pattern**
- "Programs powered by AWS" heading: Lora 46pt teal
- Decorative curved divider (2pt teal, ~300pt wide)
- Two-column text layout (NOT cards!)
- Three programs:
  1. Cloud Computing Curriculum (15,000 students, 92%, 78%)
  2. Career Pathways Program (12,000 students, 95%, 72%)
  3. AI/ML Learning Path (8,000 students, 88%, 65%)
- Format: "PROGRAM 1" label (ALL CAPS) + Lora SemiBold 20pt name + Roboto 12pt description + inline stats

**Page 4: Closing CTA Pattern**
- Full teal background (full bleed)
- Together for Ukraine badge (centered, 90pt from top)
  - Left box (55%): Blue #3D5CA6 "Together for" (Roboto Medium 16pt white)
  - Right box (45%): Yellow #FFD500 "UKRAINE" (Roboto Bold 18pt black)
- Main heading: Lora SemiBold 32pt white, centered
  - "We are looking for more partners and supporters to work with us."
- Description: Roboto 14pt white, centered
- 3×3 partner logo grid (white boxes on teal)
  - Row 1: Google, Kintell, Babbel
  - Row 2: Sanoma, Oxford Press, AWS (featured)
  - Row 3: Cornell Univ, Inco, Bain & Company
- Contact strip: Phone + email (Roboto 11pt white)
- TEEI logo white, bottom-right

---

### Step 3: Update InDesign Templates to Match TFU System

**Files Created**:
- `create_teei_partnership_TFU_system.py` (~780 lines)

**Template Changes Implemented**:

**Document Structure**:
- Changed from 3 pages to 4 pages
- Maintained 612×792pt (US Letter)
- 40pt margins, 12-column grid

**Color Palette**:
```javascript
// OLD COLORS (REMOVED):
// - gold: #BA8F5A
// - clay: #913B2F
// - moss: #65873B

// NEW TFU COLORS:
var palette = {
    teal: ensureColor("TFU_Teal", [0, 57, 63]),        // PRIMARY
    lightBlue: ensureColor("TFU_LightBlue", [201, 228, 236]),  // Stats box
    blue: ensureColor("TFU_Blue", [61, 92, 166]),       // Badge left
    yellow: ensureColor("TFU_Yellow", [255, 213, 0]),   // Badge right
    graphite: ensureColor("TFU_Graphite", [34, 42, 49]),
    white: doc.swatches.itemByName("Paper"),
    black: doc.swatches.itemByName("Black")
};
```

**Paragraph Styles**:
```javascript
// OLD STYLES (REMOVED):
// - TEEI_H1, TEEI_H2, TEEI_H3, TEEI_Body, etc.

// NEW TFU STYLES:
- TFU_CoverTitle (Lora Bold 60pt white)
- TFU_CoverSubtitle (Roboto 14pt ALL CAPS white)
- TFU_Heading (Lora 46pt teal)
- TFU_SectionHeading (Lora SemiBold 22pt teal)
- TFU_Body (Roboto 12pt black, 1.5× leading)
- TFU_StatNumber (Lora Bold 34pt teal)
- TFU_StatLabel (Roboto 10pt teal ALL CAPS)
- TFU_ProgramLabel (Roboto Medium 11pt teal ALL CAPS)
- TFU_ProgramName (Lora SemiBold 20pt teal)
```

**Page 1 Implementation**:
- Full teal background (no split columns)
- TEEI logo placement function (white, top-left)
- Rounded photo card (24pt corners via cornerOptions)
- Centered title and subtitle with TFU styles

**Page 2 Implementation**:
- Hero photo placeholder (full width, 200pt height)
- Two-column layout (60% / 35% + 20pt gutter)
- Light blue stats sidebar
- Vertical stat list with teal dividers between items

**Page 3 Implementation**:
- `drawCurvedDivider()` helper function for decorative line
- Two-column program grid (no background cards!)
- Editorial text layout with inline statistics

**Page 4 Implementation**:
- TFU badge creation (two rectangles + text frames)
- 3×3 partner logo grid with placeholder boxes
- Contact strip at bottom
- White TEEI logo placement (bottom-right)

**Export Functions**:
- Print PDF: CMYK color space, high quality, with bleed
- Digital PDF: RGB color space, optimized file size

---

## ⏳ IN PROGRESS

### Step 4: Update Layout Scripts and Job Configs

**Current Status**: Script created but not yet successfully executed

**Blockers Encountered**:
1. MCP bridge connection instability during large ExtendScript execution
2. Potential timeout issues with 700+ line ExtendScript
3. InDesign may be disconnecting when trying to close existing documents

**Next Actions Required**:
1. ✅ Start MCP stack (`start-mcp-stack.ps1`) - DONE
2. ⏳ Debug MCP connection stability issues
3. ⏳ Break ExtendScript into smaller chunks to avoid timeouts
4. ⏳ Add proper document cleanup (close existing docs without crashing)
5. ⏳ Successfully generate first 4-page TFU PDF
6. ⏳ Update `data/partnership-aws-example.json` with new content structure:
   ```json
   {
     "subtitle": "AWS Partnership",  // Remove "Empowering..."
     "show_tfu_badge": true,
     "partner_logos": ["google", "kintell", "babbel", "sanoma", "oxford", "aws", "cornell", "inco", "bain"],
     "call_to_action": {
       "headline": "We are looking for more partners and supporters to work with us."
     }
   }
   ```
7. ⏳ Create job configs for all TFU overview PDFs:
   - `example-jobs/tfu-overview.json` - Main Together for Ukraine overview
   - `example-jobs/tfu-upskilling.json` - Upskilling program
   - `example-jobs/tfu-mentorship.json` - Mentorship platform
   - `example-jobs/tfu-mental-health.json` - Mental health support

---

## ⏸️ PENDING

### Step 5: Extend QA System to Enforce TFU Design Compliance

**File to Modify**: `validate_document.py`

**New Validation Category**: TFU Design Compliance (~25 points)

**Required Checks**:
1. **Page Count**: Must be 4 pages (not 3)
2. **Color Compliance**:
   - ✅ Teal #00393F present (primary color)
   - ✅ Light blue #C9E4EC present (stats box)
   - ❌ Gold #BA8F5A NOT present (forbidden)
   - ❌ Copper/orange NOT present (except in partner logos)
3. **Cover Pattern**:
   - Full teal background (check page 1 background color)
   - Centered photo card present (check for rounded rectangle)
   - "Together for Ukraine" title present
4. **Stats Sidebar** (Page 2):
   - Light blue box present on page 2 (not inline metrics on page 1)
   - 4 stats visible (students, countries, partners, certifications)
   - Vertical layout with dividers
5. **Program Matrix** (Page 3):
   - Decorative curved divider present under heading
   - Two-column text layout (NOT card-based with backgrounds)
   - Program labels in ALL CAPS
6. **Closing CTA** (Page 4):
   - Full teal background
   - TFU badge present (blue + yellow boxes)
   - 3×3 partner logo grid present
   - Contact info visible
7. **Typography Compliance**:
   - Lora font used for headings
   - Roboto font used for body text
   - NO MinionPro, Arial, or Helvetica

**Update Scoring**:
```python
# Current scoring
- Structure: 25 points
- Typography: 25 points
- Colors: 25 points
- Content: 25 points

# Add new category
- TFU Design: 25 points
- (Adjust other categories to 20 points each for 125 total)
```

**Expected QA Report Output**:
```
TFU DESIGN COMPLIANCE:
  ✓ Page Count: 4 pages
  ✓ Color Palette: Teal primary, no gold
  ✓ Cover Pattern: Full teal + photo card
  ✓ Stats Sidebar: Present on page 2
  ✓ Program Matrix: Two-column text (not cards)
  ✓ Closing CTA: TFU badge + logo grid
  ✓ Typography: Lora + Roboto only

OVERALL SCORE: 125/125
RATING: ★★★★★ EXCELLENT - TFU-compliant
```

---

### Step 6: Regenerate AWS PDF and Verify Against TFU System

**Actions Required**:
1. Clear Python cache: `rm -rf __pycache__ adb-mcp/mcp/__pycache__`
2. Run TFU script with -B flag: `python -B create_teei_partnership_TFU_system.py`
3. Verify InDesign file created: `exports/TEEI-AWS-Partnership-TFU.indd`
4. Verify PDFs exported:
   - `exports/TEEI-AWS-Partnership-TFU-PRINT.pdf` (CMYK)
   - `exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf` (RGB)
5. Run QA validation: `python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs/aws-tfu.json --json`
6. Visual comparison:
   - Open TFU reference PDFs side-by-side with new AWS PDF
   - Verify color accuracy (teal matches exactly)
   - Verify typography matches (Lora + Roboto, same sizes)
   - Verify layout patterns match (full teal cover, stats sidebar, etc.)
   - Verify TFU badge rendering (blue + yellow boxes)
   - Verify partner logo grid alignment (3×3)
7. Create before/after comparison document with screenshots

**Success Criteria**:
- ✅ 4 pages (not 3)
- ✅ Full teal cover (not split)
- ✅ Stats sidebar on page 2 (not page 1)
- ✅ Two-column editorial programs (not cards)
- ✅ TFU badge visible on closing page
- ✅ 3×3 partner logo grid present
- ✅ NO gold color anywhere
- ✅ Typography: Lora + Roboto only
- ✅ QA score: 125/125
- ✅ Visual match: AWS PDF looks like it's from the TFU series

---

## Key Files Reference

**Design Documentation**:
- `TEEI_PRINT_DESIGN_SYSTEM_FROM_OVERVIEWS.md` - Canonical TFU design system
- `DESIGN_SPEC_AWS_PARTNERSHIP_TEEI_STYLE.md` - 4-page AWS layout spec
- `TFU-MIGRATION-PROGRESS.md` - This file

**Implementation**:
- `create_teei_partnership_TFU_system.py` - NEW TFU-compliant script
- `create_teei_partnership_world_class.py` - OLD script (3 pages, gold colors)

**Reference PDFs** (Source of Truth):
- `reference-pdfs/Together for Ukraine.pdf`
- `reference-pdfs/Together for Ukraine - Upskilling, Employment & Mentorship Program.pdf`
- `reference-pdfs/TEEI Mentorship Platform Overview.pdf`
- `reference-pdfs/Together for Ukraine - Mental Health Support Program.pdf`

**Current Output** (OLD, needs replacement):
- `exports/TEEI-AWS-Partnership-PRINT.pdf` - 3 pages, gold colors ❌
- `exports/TEEI-AWS-Partnership-DIGITAL.pdf` - 3 pages, gold colors ❌

**Target Output** (NEW, TFU-compliant):
- `exports/TEEI-AWS-Partnership-TFU-PRINT.pdf` - 4 pages, teal primary ✅
- `exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf` - 4 pages, teal primary ✅

---

## Known Issues & Resolutions

### Issue 1: MCP Bridge Connection Timeout
**Symptom**: ExtendScript execution fails with "Connection Timed Out"
**Cause**: Large ExtendScript (~700 lines) may be timing out or causing InDesign to hang
**Potential Solutions**:
1. Break ExtendScript into smaller chunks (create document, then populate page by page)
2. Increase timeout from 60s to 120s
3. Remove document closing logic (let user close manually)
4. Test with minimal script first to isolate connection vs. script issues

### Issue 2: Gold Color Usage Throughout Old Script
**Symptom**: Old script uses `palette.gold` extensively
**Resolution**: ✅ Removed all gold references from new TFU script
**Verification**: Search new script for "gold" - no matches

### Issue 3: Card-Based Program Layouts
**Symptom**: Old script creates alternating blue/sand program cards with backgrounds
**Resolution**: ✅ New script uses two-column editorial text layout (no background fills)
**Verification**: New script has two-column grid logic, not card generation

### Issue 4: Missing TFU Signature Elements
**Symptom**: Old script has no TFU badge, no partner logo grid, no full teal closing
**Resolution**: ✅ New script implements all TFU signature elements on page 4
**Verification**: Badge creation code (lines 540-575), logo grid (lines 615-650)

---

## Timeline Estimate

**Remaining Work**: ~3-4 hours

- **Step 4**: Debug and run script (~1-2 hours)
  - Fix MCP connection issues: 30 minutes
  - Successfully generate TFU PDF: 30 minutes
  - Update job configs: 30 minutes

- **Step 5**: Extend QA system (~1 hour)
  - Add TFU design compliance checks: 45 minutes
  - Test validation on new PDF: 15 minutes

- **Step 6**: Verify and document (~30-60 minutes)
  - Run full pipeline end-to-end: 15 minutes
  - Visual comparison with TFU references: 15 minutes
  - Create before/after summary: 15-30 minutes

---

## Next Session Checklist

When resuming this work:

1. **Start MCP Infrastructure**:
   ```powershell
   cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
   .\start-mcp-stack.ps1
   ```
   Wait for ports 8012 and 8013 to be listening.

2. **Open InDesign**:
   - Launch Adobe InDesign
   - Window → Utilities → InDesign MCP Agent
   - Click "Connect" button
   - Verify connection shows socket ID

3. **Test MCP Connection**:
   ```bash
   cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
   python -B -c "from adb-mcp.mcp import core, socket_client; socket_client.configure(app='indesign', url='http://localhost:8013', timeout=60); core.init('indesign', socket_client); print('✓ Connected')"
   ```

4. **Run TFU Script**:
   ```bash
   rm -rf __pycache__ adb-mcp/mcp/__pycache__
   python -B create_teei_partnership_TFU_system.py
   ```

5. **If Script Fails**:
   - Check InDesign console for errors
   - Check MCP proxy logs (in PowerShell window)
   - Try running with smaller ExtendScript chunks
   - Consider manual document cleanup first

6. **Read This File**: `TFU-MIGRATION-PROGRESS.md` for full context

---

**Last Updated**: 2025-11-13 13:45 UTC
**Author**: Claude Code (Sonnet 4.5)
**Session**: TFU Design System Migration
