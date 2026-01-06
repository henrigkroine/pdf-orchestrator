# PDF Orchestrator - Quick Reference Card

**One-page cheat sheet for daily operations**

---

## 🚀 Common Workflows

### Create TFU Partnership Document (AWS, Google, etc.)
```bash
# 1. Create document
python execute_tfu_jsx.py

# 2. Export PDFs
python export_tfu_pdfs.py

# 3. Validate (must score 140+/150)
python validate_document.py exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --strict
```

### Create TEEI World-Class Document
```bash
# Full pipeline (create + validate)
python pipeline.py --job-config example-jobs/aws-world-class.json
```

### Validate Existing PDF
```bash
# Layer 1: Content validation (10 AI agents)
python validate_document.py file.pdf --job-config job.json --threshold 95

# Layer 2: PDF quality checks (5 automated tests)
node scripts/validate-pdf-quality.js file.pdf

# Layer 3: Visual regression (compare to baseline)
node scripts/compare-pdf-visual.mjs file.pdf baseline-v1

# Layer 4: AI design critique (Gemini Vision)
export DRY_RUN_GEMINI_VISION=1  # For testing without API key
node scripts/gemini-vision-review.js \
  --pdf file.pdf \
  --job-config job.json \
  --output reports/gemini/review.json \
  --min-score 0.92
```

---

## 📊 Design System Quick Reference

### TFU (Together for Ukraine)
- **Pages**: 4 (NOT 3!)
- **Primary Color**: #00393F (Nordshore teal)
- **Fonts**: Lora (headlines) + Roboto (body, NOT Roboto Flex!)
- **Forbidden**: Gold #BA8F5A
- **Required**: TFU badge, 3×3 partner grid, full teal cover + closing
- **Min Score**: 140/150 (93.3%)

### TEEI (World-Class)
- **Pages**: 3
- **Colors**: Nordshore #00393F, Sky #C9E4EC, Gold #BA8F5A (allowed)
- **Fonts**: Lora + Roboto Flex
- **Min Score**: 130/150 (86.7%)

---

## 🔧 Troubleshooting

### Connection Issues
```bash
# Test MCP connection
python test_connection.py

# Start proxy server (REQUIRED FIRST!)
START-PROXY.cmd
# Or manually: node adb-mcp/adb-proxy-socket/proxy.js

# Reload InDesign UXP plugin
# Plugins → UXP Developer Tool → Reload

# Check proxy is running
netstat -an | findstr 8013
# Should show LISTENING on port 8013
```

### Export Errors
```python
# ✅ USE ExtendScript (reliable)
action="exportPDFViaExtendScript"

# ❌ AVOID UXP (path issues)
action="exportPDF"
```

### Preset Names
```python
# ✅ CORRECT (use brackets)
preset="[High Quality Print]"
preset="[PDF/X-4:2010]"

# ❌ WRONG (no brackets)
preset="High Quality Print"
```

---

## 📁 Key File Locations

### Scripts
- `execute_tfu_jsx.py` - Create TFU 4-page doc
- `export_tfu_pdfs.py` - Dual export (print + digital)
- `validate_document.py` - 10-agent validation
- `pipeline.py` - Full end-to-end pipeline

### Configs
- `example-jobs/tfu-aws-partnership.json` - TFU job template
- `example-jobs/aws-world-class.json` - TEEI job template
- `config/orchestrator.config.json` - System settings

### Assets
- `assets/images/teei-logo-white.png` - TEEI logo (for teal backgrounds)
- `assets/fonts/` - Lora + Roboto font files
- `scripts/generate_tfu_aws.jsx` - Certified TFU creation script

---

## 🎯 Quality Thresholds

| Rating | Score | Description |
|--------|-------|-------------|
| A+ | 145-150 | World-Class |
| A | 140-144 | Excellent (TFU minimum) |
| B+ | 130-139 | Good (TEEI minimum) |
| B | 120-129 | Acceptable |
| C | 100-119 | Needs Improvement |
| F | <100 | Failed |

---

## 🆘 Quick Fixes

**TFU Validation Failed?**
- Check page count = 4
- Check no gold color (#BA8F5A)
- Check Roboto (not Roboto Flex)
- Check TFU badge present

**Fonts Missing?**
```powershell
# Install TEEI fonts
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
# Then restart InDesign!
```

**Visual Diff Too High?**
- Regenerate baseline at 300 DPI
- Increase tolerance to 15%
- Check for font rendering differences

---

## 📞 Support

**Email**: henrik@theeducationalequalityinstitute.org
**Phone**: +47 919 08 939

---

**Full Documentation**: See `SYSTEM-OVERVIEW.md` for complete system reference
