# Preflight Checklist

**15+ Professional Print Production Checks**

---

## Table of Contents

1. [What is Preflight?](#what-is-preflight)
2. [Critical Checks](#critical-checks)
3. [Warning-Level Checks](#warning-level-checks)
4. [Info-Level Checks](#info-level-checks)
5. [How to Fix Each Issue](#how-to-fix-each-issue)
6. [Professional Best Practices](#professional-best-practices)
7. [Printer-Specific Requirements](#printer-specific-requirements)

---

## What is Preflight?

**Preflight** is a comprehensive quality check performed on PDFs before sending to print, similar to pre-flight checks for aircraft.

### Why Preflight?

- **Prevents Costly Errors**: Catch issues before expensive printing
- **Saves Time**: Fixes take minutes before print, hours after
- **Ensures Quality**: Professional validation against standards
- **Reduces Reprints**: Fewer production errors
- **Professional Standards**: Meet commercial printer requirements

### When to Preflight

✅ **Before** sending files to printer
✅ **After** creating PDF from design
✅ **After** any modifications to PDF
✅ **Before** archiving final files

---

## Critical Checks

These are **SHOW-STOPPERS** that will prevent successful printing.

### PF001: Missing Fonts

**Severity:** 🔴 CRITICAL

**What it means:**
Not all fonts are embedded in the PDF.

**Why it's critical:**
- Text may reflow (different line breaks)
- Font substitution (wrong font displays)
- Characters may be missing or show as boxes
- Printer cannot reproduce your design exactly

**How to detect:**
```bash
# Using our auditor
node scripts/audit-print-production.js document.pdf

# In Acrobat Pro
File → Properties → Fonts tab
Check all fonts say "(Embedded)" or "(Embedded Subset)"
```

**How to fix:**
1. **Re-export PDF with fonts embedded**
   - InDesign: Edit → Preferences → Export → Embed fonts
   - Illustrator: Save as PDF → Options → Embed fonts

2. **Outline text (last resort)**
   - Select text → Type → Create Outlines
   - WARNING: Text becomes non-editable

3. **Install missing fonts**
   - Get font files from designer
   - Install on system
   - Re-export PDF

**Prevention:**
- Always use "Embed All Fonts" in export settings
- Check font embedding before sending

---

### PF002: Low Resolution Images

**Severity:** 🔴 CRITICAL

**What it means:**
Images are below 300 DPI at final print size.

**Why it's critical:**
- Pixelated, blurry output
- Unprofessional appearance
- May be rejected by printer

**Minimum requirement:**
- Photos: 300 DPI
- Line art: 600 DPI
- Final size (not original size!)

**How to detect:**
```bash
# Our auditor shows all low-res images
node scripts/audit-print-production.js document.pdf

# In Acrobat Pro
Tools → Print Production → Preflight
Profile: "Images below 300 ppi"
```

**How to fix:**
1. **Replace with higher resolution images**
   - Get original high-res files
   - Re-scan at higher DPI
   - Re-export PDF

2. **Reduce image size in layout**
   - Scale down placed image
   - Check effective resolution increases

3. **Re-shoot photography**
   - If no higher resolution available
   - Professional photography recommended

**Prevention:**
- Always use 300+ DPI images in layouts
- Check effective resolution (after scaling)
- Don't enlarge low-res images

---

### PF003: RGB Color Space

**Severity:** 🔴 CRITICAL (for PDF/X-1a)

**What it means:**
RGB colors detected in CMYK-only PDF/X-1a document.

**Why it's critical:**
- PDF/X-1a requires CMYK only
- Colors will shift when converted at printer
- File will be rejected or delayed
- Unpredictable color output

**How to detect:**
```bash
# Check color spaces
node scripts/audit-print-production.js document.pdf

# In Acrobat Pro
Tools → Print Production → Output Preview
Preview: Separations
Look for unexpected RGB objects
```

**How to fix:**
1. **Convert to CMYK in design application**
   - Edit → Convert to Profile → CMYK
   - Use ISO Coated v2 or SWOP v2

2. **Re-export with color conversion**
   - InDesign/Illustrator: Export settings
   - Color Conversion: Convert to Destination
   - Destination: Working CMYK

3. **Use PDF/X-4 instead**
   - PDF/X-4 allows RGB with profiles
   - Better color management

**Prevention:**
- Work in CMYK mode from start
- Convert RGB images before placing
- Check export color settings

---

### PF004: Missing Bleed

**Severity:** 🔴 CRITICAL

**What it means:**
No bleed or insufficient bleed area.

**Why it's critical:**
- White edges may show after trimming
- Unprofessional appearance
- Printer may reject file
- Requires redesign/re-export

**Minimum requirement:**
- 3mm (0.125") all sides
- 5mm (0.2") recommended

**How to detect:**
```bash
# Check bleed
node scripts/audit-print-production.js document.pdf

# In Acrobat Pro
File → Properties → Description
Check "Trim Box" vs "Bleed Box"
Difference should be 3mm+
```

**How to fix:**
1. **Add bleed in design application**
   - File → Document Setup → Bleed
   - Set 3-5mm on all sides
   - Extend backgrounds into bleed

2. **Re-export PDF with bleed**
   - Export settings: Use Document Bleed
   - Verify bleed is included

3. **Add bleed in Acrobat (advanced)**
   - Tools → Print Production → Add Printer Marks
   - WARNING: May not extend content into bleed

**Prevention:**
- Set up bleed when creating document
- Always extend backgrounds into bleed area
- Include bleed in export settings

---

### PF005: Transparency Not Flattened

**Severity:** 🔴 CRITICAL (for PDF/X-1a & X-3)

**What it means:**
Live transparency effects in PDF/X-1a or X-3 file.

**Why it's critical:**
- PDF/X-1a and X-3 don't allow transparency
- File will be rejected
- Transparency must be flattened

**How to detect:**
```bash
# Check transparency
node scripts/audit-print-production.js document.pdf

# In Acrobat Pro
Tools → Print Production → Preflight
Profile: "Transparency present"
```

**How to fix:**
1. **Flatten transparency in design app**
   - InDesign: Edit → Transparency Flattener Presets
   - Export → Advanced → Transparency Flattener: High Resolution

2. **Use PDF/X-4 instead**
   - PDF/X-4 supports live transparency
   - Better quality (no flattening artifacts)

3. **Flatten in Acrobat**
   - Tools → Print Production → Preflight
   - Fixup: "Flatten transparency"

**Prevention:**
- Use PDF/X-4 for transparency
- Or flatten before export
- Check export settings

---

## Warning-Level Checks

These are **POTENTIAL PROBLEMS** that should be reviewed but may not prevent printing.

### PF101: High Ink Coverage

**Severity:** ⚠️ WARNING

**What it means:**
Total ink coverage (CMYK sum) exceeds 300%.

**Why it's a problem:**
- Ink may not dry properly
- Smearing and offsetting
- Longer press time
- Higher cost

**Maximum:**
- 300% TAC (Total Area Coverage)
- 280% recommended for safety

**Example:**
C:60 + M:40 + Y:40 + K:100 = 240% (OK)
C:80 + M:80 + Y:80 + K:100 = 340% (TOO HIGH!)

**How to fix:**
1. **Reduce ink in dark areas**
   - Lower CMY values in blacks
   - Use rich black: C:60 M:40 Y:40 K:100
   - Reduce shadow values

2. **Use GCR (Gray Component Replacement)**
   - Convert to CMYK with GCR profile
   - Removes excess CMY, adds K

3. **Consult printer**
   - Some papers handle higher TAC
   - Some presses allow 320%

**Prevention:**
- Monitor ink coverage during design
- Use rich black, not 4-color black
- Check dark areas

---

### PF102: Hairline Strokes

**Severity:** ⚠️ WARNING

**What it means:**
Strokes thinner than 0.25pt detected.

**Why it's a problem:**
- May not print visibly
- Inconsistent reproduction
- May drop out completely

**Minimum:**
- 0.25pt for CMYK
- 0.5pt recommended for reliability

**How to fix:**
1. **Increase stroke weight**
   - Select objects with thin strokes
   - Change to 0.25pt or 0.5pt

2. **Remove hairlines**
   - If decorative only
   - May not be needed

3. **Make text or vector**
   - Convert to text if possible
   - Or solid object

**Prevention:**
- Avoid hairlines in design
- Use 0.5pt minimum for strokes
- Check stroke panel regularly

---

### PF103: Small Text Size

**Severity:** ⚠️ WARNING

**What it means:**
Text smaller than 6pt detected.

**Why it's a problem:**
- May be illegible
- Difficult to read
- Accessibility issue

**Minimum:**
- 6pt for legibility
- 8pt recommended
- Depends on font (condensed harder to read)

**How to fix:**
1. **Increase text size**
   - Select small text
   - Increase to 6pt or larger

2. **Simplify content**
   - Remove unnecessary fine print
   - Summarize or abbreviate

3. **Redesign layout**
   - Allocate more space
   - Different layout approach

**Prevention:**
- Use 8pt+ for body text
- 6pt minimum for fine print
- Consider readability always

---

### PF104: White Overprint

**Severity:** ⚠️ WARNING

**What it means:**
White objects are set to overprint.

**Why it's a problem:**
- White ink doesn't exist in CMYK
- White = absence of ink (paper color)
- Overprint makes white disappear
- Almost always an error

**How to fix:**
1. **Disable overprint for white**
   - Select white objects
   - Window → Attributes → Overprint Fill: Off

2. **Check all white elements**
   - Text, shapes, lines
   - Ensure knockout (not overprint)

3. **Use Acrobat Preflight**
   - Tools → Preflight
   - Fixup: "White overprint"

**Prevention:**
- Never set white to overprint
- Check attributes panel
- Use knockout for white

---

### PF105: Registration Color Usage

**Severity:** ⚠️ WARNING

**What it means:**
Registration color [All] used for design objects.

**Why it's a problem:**
- Registration is 100% CMYK (all plates)
- Only for printer marks (registration targets)
- Creates unwanted heavy black
- 400% ink coverage

**How to fix:**
1. **Change to appropriate color**
   - Select objects with registration color
   - Change to rich black or CMYK equivalent

2. **Find and replace color**
   - In design app: Find/Replace color
   - Registration → Rich black

**Prevention:**
- Never use registration for design
- Use rich black instead
- Reserve registration for marks only

---

### PF106: Upsampled Images

**Severity:** ⚠️ WARNING

**What it means:**
Images have been artificially enlarged (upsampled/resampled).

**Why it's a problem:**
- Creates no additional detail
- Soft, blurry, pixelated appearance
- Professional quality issue

**How to detect:**
- Check original vs. placed resolution
- Look for soft edges, lack of sharpness
- Our auditor detects upsampling

**How to fix:**
1. **Use original high-resolution image**
   - Get un-upsampled source file
   - Re-scan at higher DPI

2. **Reduce image size**
   - Scale down in layout
   - Increases effective DPI

3. **Re-shoot if necessary**
   - Higher resolution photography
   - Professional photographer

**Prevention:**
- Never upsample images
- Get high-res originals
- Shoot at high resolution

---

### PF107: Missing Color Profile

**Severity:** ⚠️ WARNING

**What it means:**
ICC color profile not embedded.

**Why it's a problem:**
- Unpredictable color reproduction
- Printer doesn't know target color space
- Colors may shift

**How to fix:**
1. **Embed profile in export**
   - InDesign/Illustrator export settings
   - Profile: ISO Coated v2 or SWOP v2

2. **Add profile in Acrobat**
   - Tools → Print Production → Preflight
   - Fixup: "Add output intent"

**Prevention:**
- Always embed color profile
- Use standard profiles (ISO Coated v2)
- Check export settings

---

## Info-Level Checks

These are **INFORMATIONAL** items to review but typically don't prevent printing.

### PF108: Rich Black Usage

**Severity:** ℹ️ INFO

**What it means:**
Large black areas should use rich black (4-color).

**Why it matters:**
- K:100 alone looks thin, brownish
- Rich black (C:60 M:40 Y:40 K:100) looks deeper
- Better for backgrounds, large areas

**When to use:**
- Large solid black areas
- Full-page backgrounds
- Dark photographs

**When NOT to use:**
- Small text (use K:100 only)
- Thin lines (registration issues)

---

### PF109: Black Text Overprint

**Severity:** ℹ️ INFO

**What it means:**
Black text should be set to overprint.

**Why it helps:**
- Prevents registration issues
- Black prints on top of other colors
- Avoids white gaps from misregistration

**How to set:**
- Select black text
- Window → Attributes → Overprint Fill: On
- For K:100 text only (not rich black)

---

### PF110: Spot Colors Detected

**Severity:** ℹ️ INFO

**What it means:**
Document contains spot colors (Pantone, etc.).

**Why it matters:**
- Each spot color = additional printing plate
- Higher cost
- Verify with printer

**Action required:**
- Confirm spot colors with printer
- Verify Pantone numbers correct
- Understand cost implications

---

## How to Fix Each Issue

### Quick Reference

| Issue | Quick Fix | Time | Difficulty |
|-------|-----------|------|------------|
| Missing fonts | Re-export with embed all fonts | 2 min | Easy |
| Low resolution | Replace with high-res images | 30+ min | Medium |
| RGB colors | Convert to CMYK, re-export | 5 min | Easy |
| Missing bleed | Add bleed, extend backgrounds | 15 min | Medium |
| Transparency | Flatten or use PDF/X-4 | 5 min | Easy |
| High ink | Reduce CMY in blacks | 10 min | Medium |
| Hairlines | Increase stroke weight | 5 min | Easy |
| Small text | Increase font size | 10 min | Easy |
| White overprint | Disable overprint | 2 min | Easy |
| Registration color | Change to rich black | 5 min | Easy |

---

## Professional Best Practices

### Before Creating PDF

1. **Set up document correctly**
   - Correct page size + bleed
   - CMYK color mode
   - 300 DPI images

2. **Design with print in mind**
   - Safety margins (10mm from edge)
   - Rich black for backgrounds
   - Appropriate stroke weights

3. **Check before export**
   - Run app's built-in preflight
   - Fix issues in design app
   - Easier than fixing in PDF

### Creating PDF

1. **Use correct export preset**
   - PDF/X-4 (recommended)
   - Or printer's specific preset

2. **Verify settings**
   - Embed all fonts: ✓
   - Include bleed: ✓
   - Color conversion: CMYK
   - Marks: Crop/trim

3. **Export**
   - Save with descriptive filename
   - Include version number

### After Creating PDF

1. **Preflight immediately**
   ```bash
   node scripts/audit-print-production.js document.pdf --output-html
   ```

2. **Visual inspection**
   - Open in Acrobat
   - Check at 100%, 200%, 400%
   - Verify bleed extends
   - Look for issues

3. **Fix any issues**
   - Ideally in source file
   - Re-export PDF
   - Don't edit PDF directly if avoidable

### Before Sending to Printer

1. **Final preflight**
   - Run comprehensive check
   - Verify all issues resolved
   - Generate preflight report

2. **Create print package**
   - Final PDF
   - Preflight report
   - Spec sheet
   - Proof (if available)

3. **Communicate with printer**
   - Send package
   - Confirm receipt
   - Address any questions

---

## Printer-Specific Requirements

### Always Ask Your Printer

Different printers have different requirements. **Always confirm:**

**PDF Standard:**
- PDF/X-1a, X-3, or X-4?
- Specific PDF version?

**Color:**
- CMYK profile (ISO Coated v2? SWOP?)
- Spot colors allowed?
- Color proof required?

**Bleed:**
- How much? (3mm? 5mm?)
- On which sides?

**Trim Marks:**
- Required?
- Specific format?

**File Delivery:**
- How to send? (Email, FTP, cloud?)
- File naming convention?
- Package format?

**Proofing:**
- Digital proof acceptable?
- Physical proof required?
- Who approves?

### Common Printer Requirements

**Newspapers:**
- PDF/X-1a
- CMYK only
- 3mm bleed
- 200 DPI acceptable

**Magazines:**
- PDF/X-1a or X-3
- CMYK + spot
- 3mm bleed
- 300 DPI required

**Commercial Print:**
- PDF/X-4 (preferred)
- CMYK + spot
- 5mm bleed
- 300 DPI required

**High-End/Art Books:**
- PDF/X-4
- Color managed
- 5mm+ bleed
- 300-600 DPI
- Physical proof required

---

## Quality Assurance Checklist

Print this checklist and check off each item before sending to printer:

### File Preparation
- [ ] Document set up with correct page size
- [ ] Bleed area included (3-5mm all sides)
- [ ] Safety margins observed (10mm from trim)
- [ ] All images 300+ DPI at final size
- [ ] Colors in CMYK (or RGB with profile)
- [ ] All fonts embedded
- [ ] Transparency flattened (if X-1a/X-3)

### PDF Export
- [ ] Exported as PDF/X-4 (or printer requirement)
- [ ] Bleed included in export
- [ ] Trim/crop marks added
- [ ] Color profile embedded
- [ ] Fonts embedded (100%)
- [ ] No encryption/passwords

### Preflight Validation
- [ ] Ran automated preflight check
- [ ] All critical issues resolved
- [ ] Warnings reviewed and addressed
- [ ] Production readiness score 85+
- [ ] Preflight report generated

### Visual Inspection
- [ ] Opened PDF in Acrobat
- [ ] Checked at multiple zoom levels
- [ ] Verified bleed extends properly
- [ ] Confirmed no text cutoffs
- [ ] Colors look correct
- [ ] All pages present

### Communication
- [ ] Confirmed printer requirements
- [ ] Sent complete package (PDF + reports)
- [ ] Received confirmation from printer
- [ ] Requested proof if needed
- [ ] Delivery timeline confirmed

---

## Conclusion

Professional preflight checking is essential for error-free printing. Use this checklist with every project to ensure world-class quality.

**Remember:**
- Fix issues in source file when possible
- Always preflight before sending to printer
- Communicate with printer about requirements
- Request proof for color-critical work

**Automated Preflight:**
```bash
node scripts/audit-print-production.js document.pdf --output-html
```

This generates a comprehensive report with all 15+ checks and recommendations.

---

**Version 1.0.0** | Print Production Auditor | TEEI PDF Orchestrator
