# TFU Migration Step 7: Final Verification & Certification

**Purpose**: Execute and verify the TFU-compliant AWS Partnership PDF using the canonical workflow
**Status**: Ready to Execute
**Date**: 2025-11-13
**Prerequisites**: Steps 0-6 Complete

---

## Executive Summary

Step 7 finalizes the TFU migration by:
1. Generating the 4-page TFU-compliant PDF using `scripts/generate_tfu_aws.jsx`
2. Running the complete QA validation stack (150-point scoring)
3. Performing human visual QA against TFU design standards
4. Certifying the PDF as TFU-compliant or identifying remediation needs

**Success Criteria**: Score ≥ 140/150 (93%+) + All 3 CRITICAL TFU checks passing + Human visual approval

---

## Canonical Artifacts & Paths

**Standardized Filenames** (DO NOT DEVIATE):
```
exports/TEEI-AWS-Partnership-TFU.indd           InDesign source file
exports/TEEI-AWS-Partnership-TFU-PRINT.pdf      Print version (CMYK, 300 DPI)
exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf    Digital version (RGB, 150 DPI)
```

**Related Files**:
```
scripts/generate_tfu_aws.jsx                    Layout generation script (680 lines)
example-jobs/tfu-aws-partnership.json           TFU job config (validation rules)
TFU-QA-COMMANDS.md                              QA command reference
```

---

## Step 7 Runbook

### Phase 1: PDF Generation (5-10 minutes)

**1.1 Open Adobe InDesign**
- Launch InDesign (no MCP connection required for Option A)

**1.2 Run TFU Generation Script**

**Method 1: Via InDesign Menu (Recommended)**
```
1. File → Scripts → Other Script...
2. Navigate to: D:\Dev\VS Projects\Projects\pdf-orchestrator\scripts\
3. Select: generate_tfu_aws.jsx
4. Click "Open"
```

The script will:
- Close any conflicting documents
- Create a new 4-page document (612×792pt US Letter)
- Apply TFU color palette (teal #00393F, light blue, blue, yellow)
- Create 9 TFU paragraph styles (Lora + Roboto)
- Build Page 1: Full teal cover + centered photo card
- Build Page 2: Hero photo + two-column + stats sidebar
- Build Page 3: Two-column editorial program matrix
- Build Page 4: Full teal closing + TFU badge + 3×3 logo grid

**Expected**: Success alert dialog after ~5-10 seconds

**1.3 Save InDesign File**
```
File → Save As...
  Filename: TEEI-AWS-Partnership-TFU.indd
  Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
  Click Save
```

**1.4 Export Print PDF (CMYK)**
```
File → Export...
  Format: Adobe PDF (Print)
  Filename: TEEI-AWS-Partnership-TFU-PRINT.pdf
  Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
  Click Export

In PDF Export Dialog:
  Preset: [PDF/X-4:2010] or [High Quality Print]
  General Tab:
    - Pages: All
    - Create Acrobat Layers: Off
  Marks and Bleeds Tab:
    - Crop Marks: On
    - Bleed: 3mm (if needed)
  Output Tab:
    - Color Conversion: Convert to Destination
    - Destination: CMYK (US Web Coated SWOP v2 or equivalent)
    - Profile Inclusion Policy: Include All RGB and Tagged CMYK Profiles
  Click Export
```

**1.5 Export Digital PDF (RGB)**
```
File → Export...
  Format: Adobe PDF (Interactive)
  Filename: TEEI-AWS-Partnership-TFU-DIGITAL.pdf
  Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
  Click Export

In PDF Export Dialog:
  View: Single Page
  Compression: High Quality (JPEG)
  Click OK
```

**1.6 Verify Files Created**
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
ls -la exports/TEEI-AWS-Partnership-TFU*
```

**Expected Output**:
```
-rw-r--r-- 1 user user  ~500KB ... TEEI-AWS-Partnership-TFU.indd
-rw-r--r-- 1 user user  1-2MB  ... TEEI-AWS-Partnership-TFU-PRINT.pdf
-rw-r--r-- 1 user user  1-2MB  ... TEEI-AWS-Partnership-TFU-DIGITAL.pdf
```

---

### Phase 2: Automated QA Validation (5-10 minutes)

Run the 5 canonical QA commands in sequence:

#### Command 1: Full TFU Validation (PRIMARY)

**Command**:
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --strict
```

**What It Checks** (150 points total):
- ✅ PDF structure (25 pts): Page count, dimensions, file size
- ✅ Content (25 pts): Organization, partner, metrics, sections
- ✅ Visual hierarchy (20 pts): Headings, sections, CTA
- ✅ Colors (15 pts): Brand colors in InDesign
- ✅ Typography (25 pts): Lora + Roboto fonts, styles
- ✅ Images (15 pts): Intent-aware validation
- ✅ **TFU compliance (25 pts)**:
  - Page count = 4 (5 pts, CRITICAL)
  - No gold #BA8F5A (5 pts, CRITICAL)
  - Teal #00393F present (5 pts, CRITICAL)
  - TFU badge text (5 pts)
  - Correct fonts (3 pts)
  - Logo grid (2 pts)

**Pass Criteria**:
- Score ≥ 140/150 (93%+)
- All 3 CRITICAL TFU checks passing
- Exit code 0

**Expected Output**:
```
Starting comprehensive validation...
Running TFU design system compliance checks...

======================================================================
VALIDATION REPORT
======================================================================
[OK] Score: 148/150 (98.7%)
[OK] Rating: A+ (World-class quality)

TFU Compliance:
  ✓ Page count correct (4 pages)
  ✓ No gold color detected
  ✓ Teal color present (#00393F)
  ✓ TFU badge found
  ✓ Correct fonts (Lora + Roboto)
  ✓ Logo grid found

[OK] TFU Design System Certified
```

**If Failed**:
- Score < 140: Review detailed report, identify failing checks
- Gold color detected: CRITICAL failure - regenerate with correct colors
- Page count ≠ 4: JSX script error - verify generate_tfu_aws.jsx line 120
- Missing TFU badge: Check JSX lines 561-596

---

#### Command 2: Quick TFU Compliance Check (JSON OUTPUT)

**Command**:
```bash
python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --json | jq '.validations.tfu_compliance'
```

**Purpose**: Extract only TFU-specific results for scripting/CI

**Expected Output**:
```json
{
  "tfu_compliant": true,
  "page_count_correct": true,
  "no_gold_color": true,
  "teal_color_present": true,
  "tfu_badge_found": true,
  "correct_fonts": true,
  "logo_grid_found": true,
  "issues": [],
  "warnings": []
}
```

**Pass Criteria**: `"tfu_compliant": true` + empty `"issues"` array

---

#### Command 3: Structural PDF Validation (HTML EXPORT)

**Prerequisites**: Export PDF as HTML in InDesign first
```
File → Export → HTML
  Filename: TEEI-AWS-Partnership-TFU.html
  Location: exports/
```

**Command**:
```bash
node scripts/validate-pdf-quality.js \
  exports/TEEI-AWS-Partnership-TFU.html
```

**What It Checks**:
- ✅ Page dimensions (8.5×11 inches / 612×792pt)
- ✅ Text cutoffs (content beyond page boundaries)
- ✅ Image loading (all images loaded successfully)
- ✅ Color validation (TEEI brand colors present)
- ✅ Font validation (Lora + Roboto usage)

**Pass Criteria**: All 5 checks passed

**Expected Output**:
```
✅ Page Dimensions: PASS (612×792pt Letter size)
✅ Text Cutoffs: PASS (no text extending beyond boundaries)
✅ Image Loading: PASS (all images loaded)
✅ Color Validation: PASS (teal #00393F present, NO gold)
✅ Font Validation: PASS (Lora + Roboto only)

Overall: ✅ ALL CHECKS PASSED

Report saved to: exports/validation-issues/validation-report-TEEI-AWS-Partnership-TFU-[timestamp].json
```

---

#### Command 4: Visual Regression Test (IF BASELINE EXISTS)

**One-time setup** (after first approved TFU PDF):
```bash
node scripts/create-reference-screenshots.js \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  tfu-aws-v1
```

**Subsequent runs** (compare new versions):
```bash
node scripts/compare-pdf-visual.js \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  tfu-aws-v1
```

**What It Checks**:
- Pixel-perfect layout comparison (page by page)
- Color accuracy (teal vs gold detection)
- Text positioning (detect cutoffs or shifts)
- Font rendering consistency

**Pass Criteria**: All pages ≤ 5% difference (anti-aliasing only)

**Expected Output**:
```
Visual Comparison Report:
- Page 1: 2.1% difference (✅ PASS - anti-aliasing only)
- Page 2: 1.8% difference (✅ PASS - anti-aliasing only)
- Page 3: 3.2% difference (✅ PASS - minor changes)
- Page 4: 2.5% difference (✅ PASS - anti-aliasing only)

Overall: ✅ PASS (all pages < 5% difference)

Comparison images saved to: comparisons/tfu-aws-v1-[timestamp]/
```

**If >5% difference**:
- Review diff images (red overlay shows changes)
- Common causes: font changes, color shifts, layout adjustments
- Decide if intentional (update baseline) or regression (fix and regenerate)

---

#### Command 5: Full Pipeline Validation (OPTIONAL - FUTURE)

**Note**: This requires MCP infrastructure to be working (Option B)

**Command** (when available):
```bash
python pipeline.py \
  --job example-jobs/tfu-aws-partnership.json \
  --validate \
  --strict
```

**What It Does**:
1. Connects to InDesign (via MCP)
2. Checks document status
3. Validates colors in InDesign source
4. Exports PDFs (CMYK + RGB)
5. Runs full validation stack
6. Generates comprehensive report

**Status**: Currently blocked by MCP `executeExtendScript` issue (see Option B in TFU-MIGRATION-HANDOFF.md)

---

### Phase 3: Human Visual QA (5 minutes)

Open `exports/TEEI-AWS-Partnership-TFU-PRINT.pdf` in Adobe Acrobat and verify:

#### Critical TFU Design Elements

**Page Count & Structure**:
- [ ] Exactly 4 pages (not 3, not 5)

**Page 1: TFU Cover**:
- [ ] Full teal background (#00393F) - no white/sand
- [ ] TEEI logo (white) in top-left corner
- [ ] Centered photo card (460×420pt) with 24pt rounded corners
- [ ] "Together for Ukraine" title (Lora Bold 60pt white, centered)
- [ ] "AWS PARTNERSHIP" subtitle (Roboto 14pt ALL CAPS white, centered)

**Page 2: About + Goals**:
- [ ] Full-width hero photo placeholder at top (200pt height)
- [ ] Left column (60%): "About the Partnership" heading + narrative text
- [ ] Right column (35%): Light blue stats sidebar (#C9E4EC)
- [ ] Stats sidebar contains 4 metrics with divider lines:
  - 50,000 STUDENTS REACHED
  - 12 COUNTRIES
  - 45 PARTNER ORGANIZATIONS
  - 3,500 AWS CERTIFICATIONS

**Page 3: Programs Matrix**:
- [ ] "Programs powered by AWS" heading (Lora 46pt teal)
- [ ] Decorative curved divider under heading
- [ ] Two-column editorial layout (NOT colored cards)
- [ ] 3 programs listed:
  - Program 1: Cloud Computing Curriculum (left column, top)
  - Program 2: AI/ML Learning Path (right column, top)
  - Program 3: Career Pathways Program (left column, bottom)
- [ ] Each program has: label (ALL CAPS), name (Lora SemiBold 20pt), description, inline statistics

**Page 4: Closing CTA**:
- [ ] Full teal background (#00393F)
- [ ] Together for Ukraine badge (centered, top):
  - Blue box (#3D5CA6) with "Together for" text (white)
  - Yellow box (#FFD500) with "UKRAINE" text (black, ALL CAPS)
- [ ] Heading: "Ready to Transform Education Together?" (Lora SemiBold 32pt white, centered)
- [ ] Description text (Roboto 14pt white, centered)
- [ ] 3×3 partner logo grid (white boxes):
  - Row 1: Google, Kintell, Babbel
  - Row 2: Sanoma, Oxford, AWS
  - Row 3: Cornell, Inco, Bain
- [ ] Contact strip at bottom: "+47 919 08 939 | henrik@theeducationalequalityinstitute.org"
- [ ] TEEI logo (white) in bottom-right corner

#### Color Compliance

- [ ] Primary color is teal #00393F (full bleed on pages 1 & 4)
- [ ] NO gold color (#BA8F5A) anywhere in the document
- [ ] Light blue #C9E4EC used only for stats sidebar (page 2)
- [ ] TFU badge uses correct colors (blue #3D5CA6 + yellow #FFD500)

#### Typography Compliance

- [ ] Headlines use Lora (serif) font family
- [ ] Body text uses Roboto (sans serif) font family
- [ ] NO Roboto Flex detected
- [ ] NO forbidden fonts (MinionPro, Arial, Helvetica, Times)

#### Layout Quality

- [ ] No text cutoffs at page edges
- [ ] Consistent 40pt margins
- [ ] Proper spacing and visual hierarchy
- [ ] No overlapping elements
- [ ] Images/photos (if any) are properly positioned

#### TFU Family Resemblance

- [ ] Document looks like it belongs to the "Together for Ukraine" series
- [ ] Visual style matches TFU reference PDFs:
  - `T:\TEEI\TEEI Overviews\Together for Ukraine Overviews\PDFS\Together for Ukraine.pdf`
  - Similar cover treatment (full teal + photo card)
  - Similar interior layouts (editorial, not card-based)
  - Similar closing page (badge + logo grid)

---

### Phase 4: Decision & Documentation

#### 4.1 Determine Pass/Fail

**PASS Criteria** (all must be true):
1. ✅ Automated QA score ≥ 140/150 (93%+)
2. ✅ All 3 CRITICAL TFU checks passing:
   - Page count = 4 ✓
   - No gold color ✓
   - Teal color present ✓
3. ✅ Human visual QA: All critical elements verified
4. ✅ Structural validation: All checks passed
5. ✅ Visual regression: ≤ 5% difference (if baseline exists)

**FAIL Criteria** (any one triggers fail):
- ❌ Automated QA score < 140/150
- ❌ Any CRITICAL TFU check failing
- ❌ Human visual QA finds missing/incorrect elements
- ❌ Structural validation finds critical issues
- ❌ Visual regression > 5% difference (unintended)

#### 4.2 Record Results

**Update this section with actual run results:**

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Automated QA Score** | ≥ 140/150 | ___ /150 | ⏸️ Pending |
| **CRITICAL: Page Count** | 4 | ___ | ⏸️ Pending |
| **CRITICAL: No Gold** | True | ___ | ⏸️ Pending |
| **CRITICAL: Teal Present** | True | ___ | ⏸️ Pending |
| **TFU Badge Found** | True | ___ | ⏸️ Pending |
| **Correct Fonts** | Lora + Roboto | ___ | ⏸️ Pending |
| **Logo Grid Found** | True | ___ | ⏸️ Pending |
| **Structural Validation** | All Pass | ___ | ⏸️ Pending |
| **Visual Regression** | ≤ 5% | ___% | ⏸️ Pending |
| **Human Visual QA** | All Items Checked | ___/26 | ⏸️ Pending |

**Run Details**:
- Date/Time: _______________
- Operator: _______________
- InDesign Version: _______________
- Fonts Installed: _______________
- Notes: _______________

**Final Verdict**: ⏸️ PENDING / ✅ PASS / ❌ FAIL

#### 4.3 Next Actions

**If PASS**:
1. ✅ Mark TFU Migration as COMPLETE
2. ✅ Create baseline for visual regression (if first run)
3. ✅ Archive PDFs in version control
4. ✅ Update TFU-MIGRATION-SUMMARY.md with final status
5. ✅ Document lessons learned
6. ✅ (Optional) Extend TFU system to other partnership documents

**If FAIL**:
1. ❌ Review detailed validation reports
2. ❌ Identify root cause(s):
   - JSX script issue → Fix `scripts/generate_tfu_aws.jsx`
   - Color palette issue → Check TFU color definitions (lines 149-160)
   - Font issue → Verify Lora + Roboto installed, restart InDesign
   - Layout issue → Review page generation code (lines 340-682)
3. ❌ Fix issue(s)
4. ❌ Clear exports folder
5. ❌ Rerun Step 7 from Phase 1 (PDF Generation)

---

## Acceptance Criteria Summary

### Automated Validation (Non-Negotiable)

**Primary**: `validate_document.py` with TFU job config
- Score: 140-150/150 (93-100%) ✓
- CRITICAL checks:
  - Page count = 4 ✓
  - No gold color ✓
  - Teal color present ✓
- Exit code: 0 ✓

**Structural**: `validate-pdf-quality.js`
- All 5 checks passed ✓
- No text cutoffs ✓
- All images loaded ✓

**Visual**: `compare-pdf-visual.js` (if baseline exists)
- All pages ≤ 5% difference ✓
- No unintended regressions ✓

### Human Validation (Subjective but Required)

**Design Compliance**:
- 4-page structure matches TFU system ✓
- Full teal cover + closing pages ✓
- TFU badge present and correct ✓
- 3×3 partner logo grid ✓
- NO gold color anywhere ✓

**Visual Quality**:
- Professional appearance ✓
- Looks like TFU family member ✓
- No layout issues ✓
- Clear visual hierarchy ✓

---

## TFU Certification Rules

**To be TFU-certified, a PDF MUST**:
1. Score ≥ 140/150 (93%+) in automated validation
2. Pass all 3 CRITICAL TFU checks (page count, no gold, teal present)
3. Pass human visual QA (26/26 checklist items)
4. Pass structural validation (no critical issues)
5. (Optional) Pass visual regression if baseline exists

**TFU certification is REVOKED if**:
- Any CRITICAL check fails (even if overall score is high)
- Gold color #BA8F5A is detected anywhere
- Page count ≠ 4
- TFU badge is missing or incorrect
- Human reviewer finds major design violations

---

## Recording Results (Long-Term Tracking)

**Store validation reports in**:
```
reports/tfu/
  ├── YYYY-MM-DD-validation-report.json
  ├── YYYY-MM-DD-human-qa-notes.md
  └── YYYY-MM-DD-visual-comparison/
```

**Append to this file** (create table if not exists):

| Date | Operator | Score | Visual Diff | Structural | Human QA | Result | Notes |
|------|----------|-------|-------------|------------|----------|--------|-------|
| 2025-11-13 | [Name] | ___/150 | ___% | ___ | ___/26 | ⏸️ | Initial TFU run |

---

## Troubleshooting

### Issue: JSX Script Fails with Error

**Symptoms**: Alert dialog shows error message

**Common Causes**:
1. Fonts not installed (Lora, Roboto)
   - **Fix**: Run `scripts/install-fonts.ps1`, restart InDesign
2. Logo file not found
   - **Fix**: Verify `assets/images/teei-logo-white.png` exists
3. InDesign version incompatibility
   - **Fix**: Update JSX syntax for older InDesign versions

### Issue: Score < 140/150

**Diagnosis**:
```bash
# Get detailed breakdown
python validate_document.py \
  exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json \
  --json > validation-report.json

# Inspect
jq '.validations' validation-report.json
```

**Common Causes**:
- Missing content: Check `data` section in JSX (lines 20-69)
- Font issues: Check embedded fonts in PDF
- TFU compliance fail: See specific TFU issues below

### Issue: Gold Color Detected (CRITICAL)

**Diagnosis**:
```bash
# Find exact match
python validate_document.py ... --json | jq '.validations.tfu_compliance.issues'
```

**Fix**: Review JSX color palette (lines 149-160), ensure NO gold color defined

### Issue: Page Count ≠ 4

**Diagnosis**: Check JSX line 120:
```javascript
pagesPerDocument: 4  // Must be 4!
```

**Fix**: If different, change to 4 and regenerate

### Issue: TFU Badge Missing

**Diagnosis**: Check JSX lines 561-596 (TFU badge creation)

**Fix**: Verify badge text frames are being created

### Issue: Visual Regression > 5%

**Diagnosis**: Review diff images in `comparisons/` folder

**Possible Causes**:
- Intentional design changes → Update baseline
- Font rendering differences → Check font versions
- Color profile changes → Verify CMYK/RGB settings
- Layout shifts → Check margin/spacing in JSX

---

## Quick Reference

**Most Common Commands**:

```bash
# 1. Generate PDF (InDesign)
# - Run scripts/generate_tfu_aws.jsx via File → Scripts
# - Save as TEEI-AWS-Partnership-TFU.indd
# - Export PRINT.pdf (CMYK) and DIGITAL.pdf (RGB)

# 2. Validate (CLI)
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --strict

# 3. Check score programmatically
SCORE=$(python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --json | jq '.score')
echo "TFU Score: $SCORE/150"

# 4. Extract TFU compliance only
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --json | \
  jq '.validations.tfu_compliance'
```

---

## Related Documentation

- **TFU Design System**: `TEEI_PRINT_DESIGN_SYSTEM_FROM_OVERVIEWS.md` (canonical reference)
- **4-Page Specification**: `DESIGN_SPEC_AWS_PARTNERSHIP_TEEI_STYLE.md` (detailed layouts)
- **Execution Guide**: `READY-TO-EXECUTE-TFU-MIGRATION.md` (Option A instructions)
- **QA Commands**: `TFU-QA-COMMANDS.md` (all 5 commands + troubleshooting)
- **Steps 4-6 Summary**: `TFU-MIGRATION-STEPS-4-6-COMPLETE.md` (technical implementation)
- **Migration Progress**: `TFU-MIGRATION-PROGRESS.md` (comprehensive technical log)
- **Migration Summary**: `TFU-MIGRATION-SUMMARY.md` (executive overview)

---

**Last Updated**: 2025-11-13
**TFU System Version**: 3.0
**Validation Schema**: 150-point scoring (125 base + 25 TFU)
**Status**: Ready for Execution
