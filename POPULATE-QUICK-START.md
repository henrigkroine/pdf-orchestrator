# TEEI AWS Partnership - Content Population Quick Start

**30-Second Setup → Complete 3-Page Document**

---

## Prerequisites (One-Time Setup)

```powershell
# 1. Install TEEI fonts (run as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# 2. Restart InDesign (required after font installation)
```

---

## Usage (Every Time)

### Terminal 1: Start MCP Bridge
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
python mcp-local/mcp_http_bridge.py
```

**Keep this running!**

### Terminal 2: Populate Document
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

# 1. Open InDesign → New Document (3 pages, Letter size)

# 2. Run content population
python populate_content.py
```

**Result**: Complete 3-page AWS partnership document in 5 seconds!

---

## What Gets Created

### Page 1 - Cover
- Title: "TEEI × AWS Partnership Proposal"
- Subtitle: "Transforming Education Through Cloud Technology"
- Logo placeholders (TEEI, AWS)
- 4 Partnership highlights

### Page 2 - Programs
- Partnership Vision section
- Digital Learning Platform (35K students, 94%)
- Teacher Training Initiative (10K students, 97%)
- STEM Excellence Program (5K students, 91%)

### Page 3 - Metrics & CTA
- Key metrics: 50,000 / 95% / 12 countries
- 2 Testimonials (Dr. Johnson, M. Chen)
- Call to Action with contact info

---

## Next Steps

```bash
# 1. Review in InDesign (visual check)

# 2. Replace logo placeholders with real images:
#    - Place assets/images/teei-logo-dark.png (top left)
#    - Place assets/partner-logos/aws.svg (top right)

# 3. Validate brand compliance
python validate_world_class.py

# 4. Export high-quality PDF
python export_world_class_pdf.py

# 5. Visual QA
node scripts/validate-pdf-quality.js exports/TEEI-AWS-Partnership-WorldClass.pdf
```

---

## Troubleshooting

### "Cannot connect to MCP bridge"
**→** Start MCP bridge: `python mcp-local/mcp_http_bridge.py`

### "No document open"
**→** Open InDesign → File → New → Document (3 pages)

### "Font not found: Lora"
**→** Install fonts: `scripts/install-fonts.ps1` → Restart InDesign

### "Document needs 3 pages"
**→** Layout → Pages → Add Page (repeat until 3 pages)

---

## Files Reference

**ExtendScript Source**: `populate_aws_partnership_content.jsx` (3,591 lines)
**Python Wrapper**: `populate_content.py` (192 lines)
**Syntax Verifier**: `verify_extendscript.py` (134 lines)
**Complete Guide**: `CONTENT-POPULATION-GUIDE.md` (436 lines)
**Full Summary**: `CONTENT-POPULATION-COMPLETE.md` (1,000+ lines)
**Content Data**: `jobs/aws-partnership-full.json`

---

## Brand Colors

- **Nordshore** #00393F - Primary (headers, CTA)
- **Sky** #C9E4EC - Secondary (highlights)
- **Sand** #FFF1E2 - Background (warm)
- **Gold** #BA8F5A - Accent (metrics)

---

## Support

**Full Documentation**: See `CONTENT-POPULATION-GUIDE.md`
**Technical Details**: See `CONTENT-POPULATION-COMPLETE.md`
**Brand Guidelines**: See `reports/TEEI_AWS_Design_Fix_Report.md`

---

**Status**: ✅ Production-Ready | **Version**: 1.0.0 | **Date**: 2025-11-12
