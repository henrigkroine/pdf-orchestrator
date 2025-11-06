# PDF Orchestrator Documentation

**Project**: PDF Orchestrator - TEEI Partnership Document Automation
**Location**: T:\Projects\pdf-orchestrator\docs\

---

## Available Guides

### 📘 Partner Logo Integration Guide
**File**: `PARTNER-LOGO-INTEGRATION-GUIDE.md`
**Purpose**: Complete guide to downloading and integrating real partner company logos into PDFs

**What's Inside**:
- Step-by-step logo download process (Wikimedia Commons)
- Base64 embedding for self-contained PDFs
- Professional white logo card design (CSS Grid)
- QA validation for image loading
- Troubleshooting common issues (404s, redirects, EPERM)
- Best practices: Never use styled text as fake logos

**When to Use**: Working with partner logos in Together for Ukraine or other partnership documents

**Quick Start**:
```bash
# 1. Download partner logos
node download-logos-direct.js

# 2. Integrate into PDF
node create-ukraine-REAL-LOGOS.js

# 3. Validate
node scripts/validate-pdf-quality.js exports/Together-for-Ukraine-REAL-LOGOS.html
```

---

## Coming Soon

### QA Validation Guide
- Comprehensive QA system overview
- How to interpret validation results
- When to trust QA vs manual inspection
- CI/CD integration examples

### InDesign MCP Troubleshooting
- Common UXP plugin errors
- Color rendering issues
- Font installation verification
- Connection testing

### Brand Compliance Checklist
- TEEI color palette validation
- Typography verification
- Logo clearspace rules
- Photography requirements

---

## Other Project Documentation

### In Project Root
- **CLAUDE.md** - Main project instructions for Claude Code (critical rules, architecture, workflows)
- **README.md** - Project overview and setup instructions (if exists)

### In Reports Folder
- **TEEI_AWS_Design_Fix_Report.md** - Comprehensive 50-page brand compliance guide (D+ → A+ transformation)

### In Assets Folder
- **assets/fonts/README.md** - Font installation guide (Lora, Roboto Flex)

### In Scripts Folder
- **scripts/README-VALIDATOR.md** - PDF quality validator documentation
- **scripts/VISUAL_COMPARISON_README.md** - Visual regression testing system
- **scripts/VISUAL_COMPARISON_QUICKSTART.md** - Quick start for visual QA

---

## External Documentation

### Henrik's Environment
- **C:\Users\ovehe\.claude\CLAUDE.md** - Henrik's global Claude Code instructions
- **T:\System\Scripts\README.md** - MCP setup and configuration

### TEEI Projects
- **T:\Dev\VS Projects\TEEI\Website\START-HERE-TOMORROW.md** - TEEI website documentation
- **T:\Obsidian\TEEI\Dev\Email Configuration - TEEI.md** - Email automation setup
- **T:\TEEI\TEEI Overviews\TEEI Design Guidelines.pdf** - Official 21-page brand guidelines

---

## Quick Reference

### File Locations
```
docs/
├── README.md                           # This file
└── PARTNER-LOGO-INTEGRATION-GUIDE.md  # Logo integration guide

reports/
└── TEEI_AWS_Design_Fix_Report.md      # Brand compliance guide

assets/
├── fonts/README.md                     # Font installation
└── partner-logos/                      # Downloaded company logos
    ├── google.svg
    ├── aws.svg
    ├── cornell.svg
    └── oxford.svg

scripts/
├── validate-pdf-quality.js             # QA validator
├── create-reference-screenshots.js     # Visual baseline
└── compare-pdf-visual.js               # Visual regression
```

### Common Commands
```bash
# Download partner logos
node download-logos-direct.js

# Generate PDF with real logos
node create-ukraine-REAL-LOGOS.js

# Validate PDF quality
node scripts/validate-pdf-quality.js exports/document.html

# Create visual baseline
node scripts/create-reference-screenshots.js exports/approved.pdf baseline-v1

# Compare against baseline
node scripts/compare-pdf-visual.js exports/new-version.pdf baseline-v1

# Install TEEI fonts (run as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
```

---

## Contributing

When adding new documentation:

1. Create guide in `docs/` folder
2. Update this README with link and description
3. Reference in main `CLAUDE.md` if critical
4. Use clear headings and code examples
5. Include troubleshooting section
6. Add to "Related Documentation" in CLAUDE.md

---

## Need Help?

**Can't find what you're looking for?**

1. Check `CLAUDE.md` (main project instructions)
2. Search `reports/TEEI_AWS_Design_Fix_Report.md` (brand guidelines)
3. Look in `scripts/` for tool-specific READMEs
4. Review this documentation index

**Found an issue or have a suggestion?**
- Update the relevant guide
- Add to troubleshooting section
- Reference in CLAUDE.md if critical

---

**Last Updated**: 2025-11-06
**Maintainer**: PDF Orchestrator Project
