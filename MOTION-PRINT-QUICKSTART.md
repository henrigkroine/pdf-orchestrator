# Motion Design & Print Production - Quick Start

**Get started in 2 minutes!** ⚡

---

## Interactive PDFs (Motion Design)

### Create Interactive PDF

```bash
# Add navigation buttons to PDF
node scripts/create-interactive-pdf.js your-document.pdf
```

**Output:** `your-document-interactive.pdf`
**Opens in:** Adobe Acrobat Reader

---

### Generate Web Assets

```bash
# Create HTML/CSS/JS for web
node scripts/create-interactive-pdf.js your-document.pdf --animations
```

**Output:** `your-document-interactive-assets/`
- motion.css (animations)
- motion.js (behaviors)
- interactions.css (components)
- interactions.js (handlers)
- preview.html (demo)

**View:** Open `preview.html` in browser

---

## Print Production

### Quick Validation

```bash
# Check if PDF is print-ready
node scripts/prepare-for-print.js your-document.pdf --preflight
```

**Shows:**
- ✅ Grade (A-F)
- 🚨 Critical issues
- ⚠️ Warnings
- 💡 Fixes

---

### Create Print Package

```bash
# Prepare complete print-ready package
node scripts/prepare-for-print.js your-document.pdf --package
```

**Output:** `your-document-PRINT-PACKAGE/`
- PRINT-READY.pdf ← **Send this to printer**
- SPECIFICATIONS.pdf (specs sheet)
- production-report.json (details)
- README.txt (instructions)

---

## Common Commands

### Motion Design

```bash
# Basic interactive PDF
node scripts/create-interactive-pdf.js doc.pdf

# With all features
node scripts/create-interactive-pdf.js doc.pdf --navigation --animations

# Custom configuration
node scripts/create-interactive-pdf.js doc.pdf --config my-config.json

# Help
node scripts/create-interactive-pdf.js --help
```

---

### Print Production

```bash
# Preflight only
node scripts/prepare-for-print.js doc.pdf --preflight

# Complete package (recommended)
node scripts/prepare-for-print.js doc.pdf --package

# Custom bleed (5mm instead of 3mm)
node scripts/prepare-for-print.js doc.pdf --bleed 5

# Individual steps
node scripts/prepare-for-print.js doc.pdf --cmyk
node scripts/prepare-for-print.js doc.pdf --embed-fonts
node scripts/prepare-for-print.js doc.pdf --crop-marks

# Help
node scripts/prepare-for-print.js --help
```

---

## Installation (One-Time Setup)

### Optional Dependencies

**For full print production features:**

```bash
# Ubuntu/Debian
sudo apt-get install ghostscript poppler-utils

# macOS
brew install ghostscript poppler

# Windows
# Download from: https://ghostscript.com/download/gsdnld.html
```

**Note:** Works without these, but with limited features (no CMYK conversion).

---

## Workflow Examples

### Send PDF to Printer

```bash
# 1. Check if ready
node scripts/prepare-for-print.js document.pdf --preflight

# 2. Fix any issues (manually)

# 3. Create print package
node scripts/prepare-for-print.js document.pdf --package

# 4. Send PRINT-READY.pdf to printer
```

---

### Create Engaging Web Version

```bash
# 1. Generate assets
node scripts/create-interactive-pdf.js document.pdf --animations

# 2. Copy files to web project
cp document-interactive-assets/* /path/to/website/

# 3. Use in HTML
# <link rel="stylesheet" href="motion.css">
# <script src="motion.js"></script>
```

---

## Help & Documentation

**Quick Help:**
```bash
node scripts/create-interactive-pdf.js --help
node scripts/prepare-for-print.js --help
```

**Full Guides:**
- 📖 `docs/MOTION-DESIGN-GUIDE.md` (800 lines)
- 📖 `docs/PRINT-PRODUCTION-GUIDE.md` (900 lines)

**Implementation Report:**
- 📊 `MOTION-PRINT-IMPLEMENTATION-REPORT.md` (complete details)

---

## Troubleshooting

**"GhostScript not found"**
→ Install GhostScript (see Installation above)

**"Cannot verify fonts"**
→ Install poppler-utils (see Installation above)

**Interactive PDF doesn't work**
→ Open in Adobe Acrobat Reader (not browser)

**Animations not showing**
→ Check that CSS/JS files are included

**More help:**
→ See full guides in `docs/` folder

---

## Quick Reference

### Motion Design

| What | Command |
|------|---------|
| Interactive PDF | `create-interactive-pdf.js doc.pdf` |
| Web assets | `create-interactive-pdf.js doc.pdf --animations` |
| Preview | `open doc-interactive-assets/preview.html` |

### Print Production

| What | Command |
|------|---------|
| Check quality | `prepare-for-print.js doc.pdf --preflight` |
| Print package | `prepare-for-print.js doc.pdf --package` |
| Add bleed | `prepare-for-print.js doc.pdf --bleed 3` |
| Convert CMYK | `prepare-for-print.js doc.pdf --cmyk` |

---

**That's it! You're ready to create engaging interactive PDFs and professional print-ready documents.** 🎉

For detailed information, see the complete guides in `docs/`.
