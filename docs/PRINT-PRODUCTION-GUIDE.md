# TEEI Print Production Guide

**Complete guide to preparing PDFs for professional print production**

Version: 1.0.0
Last Updated: November 6, 2025

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Print Specifications](#print-specifications)
4. [Preflight Validation](#preflight-validation)
5. [Print Preparation Workflow](#print-preparation-workflow)
6. [Common Issues & Solutions](#common-issues--solutions)
7. [Working with Printers](#working-with-printers)
8. [Advanced Topics](#advanced-topics)

---

## Overview

The TEEI Print Production system ensures your PDFs meet professional print standards, preventing costly reprints and delays.

### What It Does

✅ **Validates** PDFs against print standards
✅ **Converts** RGB to CMYK color mode
✅ **Adds** bleed area (3-5mm standard)
✅ **Embeds** all fonts
✅ **Optimizes** image resolution (300 DPI)
✅ **Generates** PDF/X-4 compliant files
✅ **Creates** crop marks and registration
✅ **Produces** complete print packages

### Why It Matters

**Without proper print preparation:**
- ❌ Colors look different than on screen
- ❌ Text gets cut off at edges
- ❌ Images appear blurry or pixelated
- ❌ Fonts don't print correctly
- ❌ Printer rejects your file
- ❌ Costly reprints and delays

**With TEEI print production:**
- ✅ Perfect color reproduction
- ✅ Professional quality output
- ✅ No surprises at the printer
- ✅ First-time print success
- ✅ Save time and money

---

## Quick Start

### 1. Run Preflight Check (Always Do This First!)

```bash
node scripts/prepare-for-print.js document.pdf --preflight
```

This validates your PDF and shows what needs to be fixed.

### 2. Create Print-Ready Package

```bash
node scripts/prepare-for-print.js document.pdf --package
```

This creates a complete folder with everything your printer needs.

### 3. Send to Printer

Send the `PRINT-READY.pdf` file from the package folder to your printer.

**That's it!** 🎉

---

## Print Specifications

### Standard Requirements

| Specification | Requirement | Why It Matters |
|--------------|-------------|----------------|
| **Color Mode** | CMYK | RGB colors look different when printed |
| **Resolution** | 300 DPI minimum | Lower resolution = blurry images |
| **Bleed** | 3mm (0.118") | Prevents white edges after cutting |
| **Fonts** | All embedded | Ensures text prints exactly as designed |
| **Format** | PDF/X-4 | Industry standard for print production |
| **Line Weight** | 0.25pt minimum | Thinner lines may not print reliably |

### Paper Sizes

**Common US Sizes:**
- **Letter**: 8.5" × 11" (215.9mm × 279.4mm)
- **Legal**: 8.5" × 14" (215.9mm × 355.6mm)
- **Tabloid**: 11" × 17" (279.4mm × 431.8mm)

**International Sizes:**
- **A4**: 210mm × 297mm
- **A3**: 297mm × 420mm
- **A5**: 148mm × 210mm

### Bleed Explained

**Bleed** is extra space beyond the edge where you extend background colors/images.

```
┌─────────────────────────┐
│       BLEED AREA       │  ← Extend backgrounds here
│  ┌─────────────────┐   │
│  │                 │   │
│  │   SAFE ZONE    │   │  ← Keep important content here
│  │                 │   │
│  └─────────────────┘   │
│       (gets cut)       │  ← Trim line
└─────────────────────────┘
```

**Standard measurements:**
- Bleed: 3mm (extends past trim)
- Safe Zone: 6mm (inside trim edge)
- Keep text/logos inside safe zone!

---

## Preflight Validation

### What is Preflight?

Preflight checks your PDF against print standards **before** sending to the printer.

### Running Preflight

```bash
node scripts/prepare-for-print.js document.pdf --preflight
```

### Understanding Results

**Grade System:**
- **A** = Perfect, ready to print
- **B** = Minor issues, probably OK
- **C** = Some issues to fix
- **D** = Multiple problems
- **F** = Critical issues, must fix

**Issue Severity:**
- 🚨 **CRITICAL** - Must fix before printing
- ⚠️ **HIGH** - Should fix before printing
- ⚡ **MEDIUM** - Consider fixing
- ℹ️ **LOW** - Nice to fix

### Common Preflight Issues

#### 1. Fonts Not Embedded

**Issue:**
```
🚨 CRITICAL: 3 fonts not embedded
  • Arial
  • Times New Roman
  • Helvetica
```

**Fix:**
```bash
node scripts/prepare-for-print.js document.pdf --embed-fonts
```

**Why:** If fonts aren't embedded, the printer may substitute different fonts, changing your layout.

---

#### 2. Wrong Color Mode (RGB instead of CMYK)

**Issue:**
```
🚨 CRITICAL: Document contains RGB colors
```

**Fix:**
```bash
node scripts/prepare-for-print.js document.pdf --cmyk
```

**Why:** RGB colors look vibrant on screen but print differently. CMYK is the printer's color space.

**Color Conversion:**
- RGB: Red + Green + Blue (light, screens)
- CMYK: Cyan + Magenta + Yellow + Black (ink, print)

---

#### 3. No Bleed

**Issue:**
```
⚠️ HIGH: No bleed detected
```

**Fix:**
```bash
node scripts/prepare-for-print.js document.pdf --bleed 3
```

**Why:** Without bleed, you risk white edges if cutting is slightly off.

---

#### 4. Low Resolution Images

**Issue:**
```
⚠️ HIGH: 5 images below 300 DPI
  Page 1: 150 DPI
  Page 2: 200 DPI
```

**Fix:** Replace low-resolution images with higher quality versions (300+ DPI).

**Cannot fix automatically** - you need better source images.

**DPI Guide:**
- **Below 200 DPI**: Blurry, unprofessional
- **200-250 DPI**: Acceptable for some uses
- **300 DPI**: Standard for print
- **600+ DPI**: Premium quality (larger files)

---

#### 5. File Size Too Large

**Issue:**
```
⚡ MEDIUM: File size (150MB) exceeds recommended 100MB
```

**Fix:** Optimize images or compress PDF.

**Why:** Large files slow down printing and may not upload to some systems.

---

## Print Preparation Workflow

### Complete Workflow (Recommended)

```bash
# Step 1: Check current status
node scripts/prepare-for-print.js document.pdf --preflight

# Step 2: Fix any critical issues manually
# (replace low-res images, fix design issues, etc.)

# Step 3: Create print package (does everything)
node scripts/prepare-for-print.js document.pdf --package

# Step 4: Review the package contents
# - PRINT-READY.pdf (send this to printer)
# - SPECIFICATIONS.pdf (print specs sheet)
# - production-report.json (technical details)
# - README.txt (instructions)

# Step 5: Send PRINT-READY.pdf to your printer
```

### Custom Workflow

**Add 5mm bleed instead of standard 3mm:**
```bash
node scripts/prepare-for-print.js document.pdf --bleed 5
```

**Convert to CMYK only:**
```bash
node scripts/prepare-for-print.js document.pdf --cmyk
```

**Embed fonts only:**
```bash
node scripts/prepare-for-print.js document.pdf --embed-fonts
```

**Add crop marks only:**
```bash
node scripts/prepare-for-print.js document.pdf --crop-marks
```

**Generate PDF/X-4:**
```bash
node scripts/prepare-for-print.js document.pdf --pdfx
```

**All steps with custom bleed:**
```bash
node scripts/prepare-for-print.js document.pdf \
  --bleed 5 \
  --cmyk \
  --embed-fonts \
  --crop-marks \
  --pdfx
```

---

## Common Issues & Solutions

### Issue: "GhostScript not found"

**Problem:** Many features require GhostScript but it's not installed.

**Solution:**

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ghostscript
```

**macOS:**
```bash
brew install ghostscript
```

**Windows:**
Download from: https://www.ghostscript.com/download/gsdnld.html

**Verify installation:**
```bash
gs --version
```

---

### Issue: "Cannot verify font embedding"

**Problem:** Font checking requires `poppler-utils`.

**Solution:**

**Ubuntu/Debian:**
```bash
sudo apt-get install poppler-utils
```

**macOS:**
```bash
brew install poppler
```

**Verify:**
```bash
pdffonts --help
```

---

### Issue: Colors look different when printed

**Causes:**
1. PDF is in RGB mode (not CMYK)
2. Wrong color profile
3. Monitor not calibrated
4. Printer not calibrated

**Solutions:**

1. **Convert to CMYK:**
```bash
node scripts/prepare-for-print.js document.pdf --cmyk
```

2. **Use TEEI brand colors (already CMYK optimized):**
   - Nordshore: C100 M45 Y38 K65
   - Sky: C20 M2 Y5 K0
   - Gold: C20 M35 Y65 K15

3. **Request color proof from printer** (shows actual printed colors)

4. **Remember:** Screens show RGB, print is CMYK. Some colors simply can't be reproduced exactly.

---

### Issue: Text cutoff at edges

**Causes:**
1. No bleed area
2. Content too close to trim edge
3. Safe zone violation

**Solutions:**

1. **Add bleed:**
```bash
node scripts/prepare-for-print.js document.pdf --bleed 3
```

2. **Move content inward:**
   - Keep text/logos **6mm from trim edge**
   - Extend backgrounds **3mm past trim edge**

3. **Design principle:**
```
┌─────────────────────┐
│    3mm BLEED       │
│  ┌───────────────┐ │
│  │  6mm SAFE    │ │
│  │  ┌─────────┐ │ │
│  │  │ CONTENT│ │ │  ← Keep important stuff here
│  │  └─────────┘ │ │
│  └───────────────┘ │
└─────────────────────┘
```

---

### Issue: Images look blurry when printed

**Cause:** Image resolution too low for print size.

**Solution:** Replace with higher resolution images.

**How to check image resolution:**

```bash
# List all images and their DPI
pdfimages -list document.pdf
```

**DPI Calculation:**
```
DPI = Image Pixels / Print Size (inches)

Example:
- Image: 1000 pixels wide
- Print size: 5 inches wide
- DPI: 1000 / 5 = 200 DPI (too low!)

Need: 300 DPI minimum
So: 5 inches × 300 DPI = 1500 pixels minimum
```

**Cannot fix in post-processing** - need original high-res images.

---

## Working with Printers

### Questions Printers May Ask

**"What format is the PDF?"**
→ PDF/X-4 (ISO 15930-7:2008)

**"Is it CMYK?"**
→ Yes, converted to CMYK with Coated FOGRA39 profile

**"Does it have bleed?"**
→ Yes, 3mm bleed on all sides (or specify if different)

**"Are fonts embedded?"**
→ Yes, all fonts are embedded and subset

**"What's the resolution?"**
→ 300 DPI for images

**"Do you need crop marks?"**
→ Yes, included (if you used --crop-marks or --package)

### Information to Provide Printer

Send the `SPECIFICATIONS.pdf` from your print package. It contains:
- Paper size
- Color mode (CMYK)
- Resolution (300 DPI)
- Bleed settings
- Color profile
- PDF/X compliance

### Requesting a Proof

**Always request a proof for important jobs!**

**Types of proofs:**

1. **Digital Proof** (cheap, quick)
   - PDF preview of how it will print
   - Good for checking layout

2. **Soft Proof** (medium cost)
   - Printed on office printer
   - Shows approximate colors

3. **Hard Proof / Press Proof** (expensive, accurate)
   - Printed on actual press
   - Exact colors and finish
   - Worth it for critical jobs

---

## Advanced Topics

### PDF/X Standards

**PDF/X-1a** (oldest, most compatible)
- CMYK only, no RGB
- No transparency
- PDF version 1.3
- Use when: Printer requires maximum compatibility

**PDF/X-3** (allows device-independent color)
- CMYK and calibrated RGB
- No transparency
- PDF version 1.3
- Use when: Need color-managed RGB

**PDF/X-4** (modern, recommended)
- CMYK, RGB, and spot colors
- Transparency supported
- PDF version 1.6
- Use when: Modern printer, need transparency

**TEEI Default: PDF/X-4** (best balance of features and compatibility)

---

### Spot Colors vs. Process Colors

**Process Colors (CMYK)**
- Mixed from 4 inks: Cyan, Magenta, Yellow, Black
- Can create millions of colors
- Standard for most print jobs
- TEEI uses CMYK

**Spot Colors (Pantone)**
- Pre-mixed special inks
- Exact, consistent color match
- More expensive (extra print run)
- Use for: logos requiring exact color match

**TEEI Brand Color CMYK Values:**
```json
{
  "nordshore": "C100 M45 Y38 K65",
  "sky": "C20 M2 Y5 K0",
  "gold": "C20 M35 Y65 K15",
  "moss": "C50 M15 Y90 K30",
  "clay": "C20 M80 Y75 K35"
}
```

**Pantone equivalents available in:** `config/print-production-config.json`

---

### Overprint and Trapping

**Overprint:** One color prints on top of another (instead of knocking out)

**Trapping:** Slight overlap between colors to prevent white gaps from misalignment

**TEEI system handles automatically**, but you can check:

```bash
# Check overprint settings (requires GhostScript)
gs -o - -sDEVICE=inkcov document.pdf
```

**When to worry:**
- If you have adjacent dark colors
- If you're using spot colors
- If printer mentions "registration issues"

**Usually handled by:** Professional printers in prepress

---

### Ink Coverage

**Total Ink Coverage** = C% + M% + Y% + K%

**Maximum:** 300% (some printers: 280%)

**Why it matters:**
- Too much ink = drying problems
- Paper may curl or smudge
- Expensive (uses more ink)

**TEEI Brand Colors (Total Ink):**
- Nordshore: 248% ✅
- Gold: 135% ✅
- Moss: 185% ✅
- All within safe limits!

**Check your document:**
```bash
# Analyze ink coverage
gs -o - -sDEVICE=inkcov document.pdf
```

---

### Color Management

**What is color management?**
Ensuring colors look consistent across devices (screen → proof → final print)

**Color Profiles:**
- **sRGB**: Standard for screens
- **Coated FOGRA39**: Standard for coated paper print
- **Uncoated FOGRA29**: For uncoated paper

**TEEI Default:** Coated FOGRA39 (glossy paper)

**For different paper:**
- Uncoated/Matte: Use FOGRA29 profile
- Newsprint: Use IFRA profile
- Special: Ask printer for profile

---

### Troubleshooting Print Issues

#### Banding (visible lines in gradients)

**Causes:**
- Low-quality gradient in design
- Printer calibration
- Insufficient bit depth

**Solutions:**
- Redesign with higher-quality gradients
- Add noise to gradient (1-2%)
- Use printer calibration

---

#### Color shifts

**Causes:**
- RGB to CMYK conversion
- Different color profiles
- Paper type
- Lighting conditions

**Solutions:**
- Design in CMYK from start
- Request press proof
- Use TEEI brand colors (pre-tested)

---

#### Moiré patterns (weird wavy patterns)

**Causes:**
- Screen angle conflicts
- Scanned images with halftone patterns
- Low-resolution images scaled up

**Solutions:**
- Use high-resolution images
- Rescan images without screens
- Apply slight blur to scanned images

---

## Print Production Checklist

Use this before sending to printer:

### Pre-Flight Checklist

- [ ] Run preflight check
- [ ] All critical issues resolved
- [ ] High-priority issues addressed
- [ ] Images at least 300 DPI
- [ ] No RGB colors (all CMYK)
- [ ] All fonts embedded
- [ ] Bleed added (3-5mm)
- [ ] Safe zone respected (6mm from trim)
- [ ] Crop marks included (if required)
- [ ] PDF/X-4 generated
- [ ] File size under 100MB (or printer's limit)

### Communication Checklist

- [ ] Sent PRINT-READY.pdf to printer
- [ ] Sent SPECIFICATIONS.pdf
- [ ] Confirmed paper size
- [ ] Confirmed paper type (coated/uncoated)
- [ ] Confirmed quantity
- [ ] Confirmed deadline
- [ ] Requested proof (if needed)
- [ ] Confirmed delivery method

### Quality Checklist

- [ ] Reviewed PDF at 100% zoom
- [ ] Reviewed PDF at 200% zoom
- [ ] Checked all text is readable
- [ ] Verified images look sharp
- [ ] Confirmed colors look correct
- [ ] No white gaps or artifacts
- [ ] Page numbers correct
- [ ] No typos or errors

---

## Resources

### Required Software

**GhostScript** (CMYK conversion, PDF/X)
- Download: https://www.ghostscript.com/download/gsdnld.html
- Ubuntu: `sudo apt-get install ghostscript`
- macOS: `brew install ghostscript`

**Poppler Utils** (font/image checking)
- Ubuntu: `sudo apt-get install poppler-utils`
- macOS: `brew install poppler`

### Further Reading

- **PDF/X Standards**: https://www.pdfa.org/pdfx/
- **Color Management**: https://www.color.org/
- **FOGRA Profiles**: https://www.fogra.org/
- **Pantone Colors**: https://www.pantone.com/

### TEEI Print Resources

- `config/print-production-config.json` - Print specifications
- `scripts/prepare-for-print.js` - Main tool
- `scripts/lib/print-production.js` - Print production engine
- `scripts/lib/preflight-checker.js` - Validation system

---

## Support

**Questions?** Check:
1. This guide
2. Run `--help`: `node scripts/prepare-for-print.js --help`
3. Review `production-report.json` for technical details
4. Contact your printer with questions

**Common Printer Questions Answered:**
- Format: PDF/X-4
- Color: CMYK (Coated FOGRA39)
- Bleed: 3mm
- Resolution: 300 DPI
- Fonts: Embedded
- Compression: High quality JPEG

---

**Remember:** When in doubt, request a proof! It's cheaper than reprinting thousands of copies.

Good luck with your print production! 🖨️✨
