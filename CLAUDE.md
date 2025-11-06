# PDF Orchestrator - Claude Code Instructions

**Project**: PDF Orchestrator (TEEI AWS Partnership Document Automation)  
**Location**: T:\Projects\pdf-orchestrator\  
**Purpose**: Intelligent PDF automation system for creating world-class TEEI partnership materials

---

## CRITICAL RULES

1. ❌ **NEVER MAKE UP STUFF** - If you don't have real assets (logos, images), DON'T create fake text-based substitutes. ASK or SEARCH for the real thing!
2. ✅ **ALWAYS follow TEEI brand guidelines** (see reports/TEEI_AWS_Design_Fix_Report.md)
3. ✅ **Use official TEEI colors**: Nordshore #00393F (primary), Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
4. ✅ **Use official fonts**: Lora (headlines), Roboto Flex (body text)
5. 🔤 **Install fonts BEFORE automation**: Run `scripts/install-fonts.ps1` then restart InDesign
6. ❌ **NEVER use copper/orange colors** (not in TEEI brand palette)
7. ❌ **NEVER allow text cutoffs** (all text must be complete and visible)
8. ✅ **Always include actual metrics** (no "XX" placeholders)
9. ✅ **Photography required**: Warm, natural light, authentic moments (not stock)
10. ✅ **Use ACTUAL partner logos** - Download real logo images, never use styled text as substitute
11. ✅ **Test at multiple zoom levels**: 100%, 150%, 200% (verify no cutoffs)

---

## Architecture Overview

```
pdf-orchestrator/
├── orchestrator.js              # Main controller ("brain")
├── config/                      # Configuration files
│   ├── .env.example            # Environment variables template
│   └── orchestrator.config.json # Orchestrator settings
├── workers/                     # Worker implementations
│   ├── mcp_worker/             # Local MCP server integration (InDesign)
│   └── pdf_services_worker/    # Adobe PDF Services API
├── schemas/                     # JSON validation schemas
├── templates/                   # Adobe template references
├── example-jobs/               # Sample job files
├── reports/                    # Design analysis and reports
│   └── TEEI_AWS_Design_Fix_Report.md  # World-class design standards
├── exports/                    # Generated PDF outputs
├── docs/                       # Documentation and guides
│   └── PARTNER-LOGO-INTEGRATION-GUIDE.md  # Logo integration guide
└── assets/                     # Images, fonts, resources
    ├── images/                 # Logo files
    │   ├── together-ukraine-logo.png    # Together for Ukraine logo (white)
    │   ├── teei-logo-dark.png          # TEEI logo (Nordshore)
    │   └── teei-logo-white.png         # TEEI logo (white)
    ├── partner-logos/          # Partner company logos (SVG/PNG)
    │   ├── google.svg          # Google logo (1.9 KB)
    │   ├── aws.svg             # AWS logo (3.4 KB)
    │   ├── cornell.svg         # Cornell logo (29 KB)
    │   └── oxford.svg          # Oxford University Press logo (101 KB)
    └── fonts/                  # Brand fonts (Lora, Roboto)
```

**Logo Locations**:
- TEEI/Ukraine logos: `T:\TEEI\Logos\` (source for all official TEEI logos)
- Partner logos: `assets/partner-logos/` (downloaded company logos)

---

## Current Project Status

**Active Work**: Creating world-class TEEI AWS partnership document  
**Design Standard**: A+ (world-class quality per brand guidelines)  
**Key Document**: `reports/TEEI_AWS_Design_Fix_Report.md` (comprehensive 50-page guide)

### Recent Accomplishments
- ✅ Comprehensive design analysis of AWS partnership document
- ✅ Identified 6 critical brand violations
- ✅ Created detailed fix report with page-by-page mockups
- ✅ 3-week implementation roadmap defined
- ✅ Quality assurance checklist established

### Active Issues to Fix
1. ❌ Wrong color palette (copper/orange → Nordshore/Sky/Gold)
2. ❌ Wrong typography (→ Lora/Roboto Flex)
3. ❌ Text cutoffs: "THE EDUCATIONAL EQUALITY IN-", "Ready to Transform Educa-"
4. ❌ Missing student numbers ("XX Students Reached")
5. ❌ No photography (brand requires warm authentic images)
6. ❌ Logo clearspace violations

---

## TEEI Brand Guidelines (MANDATORY)

### Official Color Palette

**Primary Colors:**
- **Nordshore #00393F** - Deep teal (80% usage recommended, primary brand color)
- **Sky #C9E4EC** - Light blue accent (secondary highlights)
- **Sand #FFF1E2** - Warm neutral background
- **Beige #EFE1DC** - Soft neutral background

**Accent Colors:**
- **Moss #65873B** - Natural green accent
- **Gold #BA8F5A** - Warm metallic accent (use for premium feel, metrics)
- **Clay #913B2F** - Rich terracotta accent

**Typography System:**
- **Headlines**: Lora (serif) - Bold/Semibold, 28-48pt
- **Body Text**: Roboto Flex (sans-serif) - Regular, 11-14pt
- **Captions**: Roboto Flex Regular, 9pt

**Typography Scale:**
```
Document Title: Lora Bold, 42pt, Nordshore
Section Headers: Lora Semibold, 28pt, Nordshore
Subheads: Roboto Flex Medium, 18pt, Nordshore
Body Text: Roboto Flex Regular, 11pt, Black
Captions: Roboto Flex Regular, 9pt, Gray #666666
```

**Layout Standards:**
- **Grid**: 12-column with 20pt gutters
- **Margins**: 40pt all sides
- **Section breaks**: 60pt
- **Between elements**: 20pt
- **Between paragraphs**: 12pt
- **Line height (body)**: 1.5x
- **Line height (headlines)**: 1.2x

**Logo Clearspace:**
- Minimum clearspace = height of logo icon element
- No text, graphics, or other logos within this zone

**Photography Requirements:**
- Natural lighting (not studio)
- Warm color tones (align with Sand/Beige palette)
- Authentic moments (not staged corporate stock)
- Diverse representation
- Shows connection and hope

**Brand Voice:**
- Empowering (not condescending)
- Urgent (without panic)
- Hopeful (not naive)
- Inclusive (celebrating diversity)
- Respectful (of all stakeholders)
- Clear and jargon-free

---

## Key Documents

### Design Fix Report (MUST READ)
**Location**: `reports/TEEI_AWS_Design_Fix_Report.md`
**Purpose**: Comprehensive guide to transform AWS document from D+ → A+ quality
**Contents**:
- Critical violations identified (colors, fonts, cutoffs, photography)
- Page-by-page redesign blueprints with visual mockups
- 3-week implementation roadmap
- Technical specifications (export settings, file naming)
- Quality assurance checklist
- Brand voice compliance guide

**READ THIS BEFORE**: Starting any TEEI design work

### Partner Logo Integration Guide (NEW)
**Location**: `docs/PARTNER-LOGO-INTEGRATION-GUIDE.md`
**Purpose**: Complete guide to downloading and integrating real partner company logos
**Contents**:
- How to download logos from Wikimedia Commons (most reliable source)
- Base64 embedding for self-contained PDFs
- Professional white logo card design (CSS Grid)
- QA validation for image loading
- Troubleshooting common download issues
- Best practices (never use styled text as fake logos)

**READ THIS BEFORE**: Working with partner logos in PDFs

**Key Learning**: NEVER make up assets. If you don't have real logos, use clear text fallbacks - don't create fake styled text that looks like logos.

### Source Materials
- **Brand Guidelines**: T:\TEEI\TEEI Overviews\TEEI Design Guidelines.pdf (21 pages, official standards)
- **AWS Document**: C:\Users\ovehe\Downloads\TEEI_AWS_WORLD_CLASS.pdf (current version with violations)
- **Together for Ukraine Docs**: T:\TEEI\TEEI Overviews\Together for Ukraine Overviews\ (program details)

---

## Python Scripts (InDesign Automation)

### Active Scripts

**Document Creation:**
- `create_world_class_document.py` - Creates brand-compliant TEEI documents
- `create_brand_compliant_ultimate.py` - Ultimate brand compliance version
- `create_via_extendscript.py` - ExtendScript-based document creation

**Color Application:**
- `apply_colors_and_export.py` - Applies TEEI colors and exports PDF
- `apply_fixed_colors.py` - Fixes color violations
- `manual_color_fix.py` - Manual color correction tool

**Export & Validation:**
- `export_world_class_pdf.py` - Exports world-class quality PDF
- `export_final_pdf.py` - Final production export
- `validate_world_class.py` - Validates against brand guidelines
- `validate_document.py` - General document validation

**Diagnostics:**
- `run_diagnostics.py` - Comprehensive diagnostic checks
- `visual_diagnostic.py` - Visual inspection tool
- `test_connection.py` - MCP connection test

### Script Usage Pattern

**Standard Workflow:**
```bash
# 1. Test MCP connection
python test_connection.py

# 2. Create brand-compliant document
python create_brand_compliant_ultimate.py

# 3. Validate against brand guidelines
python validate_world_class.py

# 4. Export final PDF
python export_world_class_pdf.py

# 5. Visual verification (if needed)
python visual_diagnostic.py
```

---

## MCP Integration

**MCP Server**: Adobe InDesign automation via MCP protocol  
**Connection**: localhost:8012 (default)  
**Purpose**: Programmatic control of InDesign for document generation

**Available MCP Tools** (via adb-mcp):
- Document creation and manipulation
- Text frame styling (fonts, colors, sizes)
- Rectangle/shape creation with fills
- Image placement
- Color application (RGB, CMYK)
- PDF export with quality settings

**Testing Connection:**
```bash
python test_connection.py
# Should return: "✅ MCP connection successful"
```

---

## Export Specifications

### For Print
- **Format**: PDF/X-4
- **Resolution**: 300 DPI
- **Color mode**: CMYK
- **Bleed**: 3mm all sides
- **Trim marks**: Yes

### For Digital
- **Format**: PDF (high quality)
- **Resolution**: 150 DPI minimum
- **Color mode**: RGB
- **Optimize for web**: Yes

### File Naming Convention
```
TEEI_AWS_WorldClass_Partnership_v[VERSION]_[DATE].pdf
Example: TEEI_AWS_WorldClass_Partnership_v2_20251104.pdf
```

---

## Quality Assurance Checklist

### Brand Compliance
- [ ] All colors from official palette (Nordshore, Sky, Sand, Beige, Moss, Gold, Clay)
- [ ] Typography: Lora for headlines, Roboto Flex for body
- [ ] Logo clearspace: minimum = icon height
- [ ] Photography: warm, natural, authentic (not stock)
- [ ] Voice: empowering, urgent, hopeful, inclusive, respectful

### Technical Quality
- [ ] No text cutoffs anywhere
- [ ] All metrics show actual numbers (no "XX" placeholders)
- [ ] Consistent spacing (60pt sections, 20pt elements, 12pt paragraphs)
- [ ] 12-column grid alignment
- [ ] High-resolution images (300 DPI print, 150+ digital)
- [ ] Proper file naming convention

### Content Quality
- [ ] Clear value proposition (Why partner with TEEI?)
- [ ] Specific program details (not generic)
- [ ] Compelling call to action (complete text, clear next step)
- [ ] Contact information visible
- [ ] Proofread (no typos, grammar errors)

### User Experience
- [ ] Easy to scan (clear hierarchy)
- [ ] Visually engaging (balanced text/images)
- [ ] Professional impression (world-class quality)
- [ ] Emotionally resonant (hope and empowerment)
- [ ] Action-oriented (clear CTA)

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1) - CRITICAL
**Priority**: Fix violations immediately

- [ ] Install Lora and Roboto Flex fonts
- [ ] Create color palette swatches in InDesign
- [ ] Set up 12-column grid (20pt gutters, 40pt margins)
- [ ] Fix all text cutoffs (header, CTA, metrics)
- [ ] Replace "XX" with actual student numbers
- [ ] Apply Nordshore/Sky/Gold colors (remove copper/orange)

**Deliverable**: Clean document with proper fonts, colors, complete text

### Phase 2: Visual Enhancement (Week 2)
**Priority**: HIGH

- [ ] Source 3-5 high-quality program photos (natural light, warm tones)
- [ ] Color grade photos to align with Sand/Beige palette
- [ ] Add hero image to header
- [ ] Add supporting images to program sections
- [ ] Create photo overlays (Nordshore at 40-60% opacity)

**Deliverable**: Visually engaging document with authentic photography

### Phase 3: Layout Refinement (Week 2)
**Priority**: HIGH

- [ ] Implement card-based program sections
- [ ] Add simple line icons (cloud, graduation, lightbulb)
- [ ] Apply consistent spacing scale
- [ ] Verify logo clearspace
- [ ] Balance content density
- [ ] Establish clear visual hierarchy

**Deliverable**: Professional layout with clear visual hierarchy

### Phase 4: Polish & QA (Week 3)
**Priority**: MEDIUM

- [ ] Review against brand guidelines (page by page)
- [ ] Test at multiple zoom levels (100%, 150%, 200%)
- [ ] Verify all colors match exact hex codes
- [ ] Check typography consistency
- [ ] Proofread all text
- [ ] Get internal stakeholder review
- [ ] Make revisions based on feedback

**Deliverable**: Final document ready for AWS presentation

### Phase 5: Production (Week 3)
**Priority**: MEDIUM

- [ ] Export PDF for print (300 DPI, CMYK, with bleed)
- [ ] Export PDF for digital (150 DPI, RGB, web-optimized)
- [ ] Create PowerPoint version (if needed)
- [ ] Archive source files with version control
- [ ] Distribute to stakeholders

**Deliverable**: Production-ready files in multiple formats

---

## Font Installation (REQUIRED FIRST STEP)

### Quick Start

**BEFORE running ANY automation**, install TEEI brand fonts:

```powershell
# Run as Administrator for best results
powershell -ExecutionPolicy Bypass -File "T:\Projects\pdf-orchestrator\scripts\install-fonts.ps1"
```

**Then RESTART InDesign** to load the new fonts!

### What Gets Installed

- **Lora** (8 styles): Regular, Medium, SemiBold, Bold + Italic variants
- **Roboto** (66 fonts): All weights (Thin → Black), Condensed, SemiCondensed + Italic variants

**Total**: 74 font files for complete TEEI brand compliance

### Font Storage Architecture

```
assets/fonts/
├── Lora-Regular.ttf          # TEEI headlines
├── Lora-Bold.ttf             # TEEI document titles
├── Lora-SemiBold.ttf         # TEEI section headers
├── Roboto-Regular.ttf        # TEEI body text
├── Roboto-Medium.ttf         # TEEI subheads
└── ... (69 more font files)
```

**Why stored locally?**
- ✅ Makes automation portable across systems
- ✅ No manual font setup required
- ✅ Auto-install script ensures consistency
- ✅ InDesign can only use system-installed fonts (not cloud fonts)

### Verification

After installation, verify fonts are available:

```powershell
# Check if fonts are in Windows Fonts directory
Get-ChildItem "$env:WINDIR\Fonts" | Where-Object { $_.Name -like "Lora*" -or $_.Name -like "Roboto*" }
```

Or open InDesign → Type Tool → Font menu → Search for "Lora" and "Roboto"

**See full documentation**: `assets/fonts/README.md`

---

## Common Commands

### Development
```bash
# 1. FIRST: Install fonts (run as Administrator)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"
# Then restart InDesign!

# 2. Test MCP connection
python test_connection.py

# 3. Create new document
python create_brand_compliant_ultimate.py

# 4. Apply brand colors
python apply_colors_and_export.py

# 5. Run diagnostics
python run_diagnostics.py

# 6. Validate document
python validate_world_class.py
```

### Export
```bash
# Export world-class PDF
python export_world_class_pdf.py

# Export final production PDF
python export_final_pdf.py

# Export via ExtendScript
python export_via_extendscript.py
```

---

## Troubleshooting

### MCP Connection Issues
**Problem**: "Cannot connect to MCP server"  
**Solution**:
1. Verify InDesign is running
2. Check MCP server status: `Get-Service MCPGateway` (if applicable)
3. Test connection: `python test_connection.py`
4. Restart InDesign and retry

### Color Application Issues
**Problem**: "Colors not applying correctly"  
**Solution**:
1. Verify color hex codes match brand guidelines exactly
2. Use CMYK for print, RGB for digital
3. Check color profile settings in InDesign
4. Use `apply_fixed_colors.py` to force correct colors

### Text Cutoff Issues
**Problem**: "Text getting cut off at edges"  
**Solution**:
1. Increase text frame width by 20pt
2. Reduce font size by 2pt
3. Check 40pt margin requirements
4. Test at 150% and 200% zoom
5. Use diagnostic tool: `python visual_diagnostic.py`

### Export Quality Issues
**Problem**: "PDF quality not meeting standards"  
**Solution**:
1. Verify export settings: 300 DPI for print, 150+ for digital
2. Check image resolution in source files
3. Use world-class export script: `python export_world_class_pdf.py`
4. Validate output: `python validate_world_class.py`

---

## Development Workflow

### Starting New Document
1. **Install fonts** (if not done): `scripts/install-fonts.ps1` → Restart InDesign
2. Read design fix report: `reports/TEEI_AWS_Design_Fix_Report.md`
3. Review brand guidelines: T:\TEEI\TEEI Overviews\TEEI Design Guidelines.pdf
4. Test MCP connection: `python test_connection.py`
5. Create document: `python create_brand_compliant_ultimate.py`
6. Validate: `python validate_world_class.py`

### Fixing Existing Document
1. Run diagnostics: `python run_diagnostics.py`
2. Apply color fixes: `python apply_fixed_colors.py`
3. Fix text cutoffs manually in InDesign
4. Add actual metrics (replace "XX")
5. Validate: `python validate_world_class.py`
6. Export: `python export_world_class_pdf.py`

### Quality Assurance
1. Test at multiple zoom levels (100%, 150%, 200%)
2. Verify all brand guidelines followed
3. Check no text cutoffs
4. Confirm actual metrics visible
5. Review photography (warm, authentic)
6. Validate voice and tone
7. Get stakeholder approval

---

## Credentials & Configuration

### Environment Variables
**Location**: `config/.env` (copy from `config/.env.example`)

```bash
# Adobe PDF Services
ADOBE_CLIENT_ID=your_client_id
ADOBE_CLIENT_SECRET=your_client_secret
ADOBE_ORGANIZATION_ID=your_org_id

# Cloudflare R2 (for output storage)
R2_ACCOUNT_ID=your_account
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET_NAME=pdf-outputs

# MCP Server
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8012
```

**Actual credentials**: T:\Secrets\teei\ (NEVER commit to git)

---

## Related Documentation

### Project-Specific Guides
- **Partner Logo Integration**: `docs/PARTNER-LOGO-INTEGRATION-GUIDE.md` (how to download and integrate real partner logos)
- **Design Fix Report**: `reports/TEEI_AWS_Design_Fix_Report.md` (comprehensive brand compliance guide)
- **Font Installation**: `assets/fonts/README.md` (Lora and Roboto installation guide)

### External Documentation
- **Main CLAUDE.md**: C:\Users\ovehe\.claude\CLAUDE.md (Henrik's global instructions)
- **TEEI Website**: T:\Dev\VS Projects\TEEI\Website\START-HERE-TOMORROW.md
- **Email Config**: T:\Obsidian\TEEI\Dev\Email Configuration - TEEI.md
- **MCP Setup**: T:\System\Scripts\README.md

---

## Anti-Hallucination Protocol

Before responding:
1. Did I verify against brand guidelines?
2. Am I making design assumptions?
3. Did I test the export quality?
4. Are all colors EXACTLY correct (hex codes)?
5. Is typography EXACTLY Lora/Roboto Flex?

**No answer > Incorrect answer**  
**ALWAYS verify against**: `reports/TEEI_AWS_Design_Fix_Report.md`

---

## Project Goals

**Current Grade**: D+ (multiple critical violations)  
**Target Grade**: A+ (world-class quality)

**Success Criteria**:
✅ All brand guidelines followed exactly  
✅ No text cutoffs anywhere  
✅ Actual metrics visible (no "XX")  
✅ Warm authentic photography included  
✅ Professional layout with clear hierarchy  
✅ Passes 100%/150%/200% zoom test  
✅ AWS approves for partnership presentation  

---

**Last Updated**: 2025-11-04  
**Status**: Active development - Phase 1 (Foundation) in progress  
**Next Milestone**: Fix all critical violations (colors, fonts, text cutoffs)

---

## Quality Assurance System (NEW)

### Automated PDF Validation

**Three-layer QA approach** for ensuring world-class TEEI documents:

#### Layer 1: PDF Quality Validator
**Script**: `scripts/validate-pdf-quality.js`
**Purpose**: Automated quality checks on PDFs and HTML exports

**5 Comprehensive Checks:**
1. ✅ **Page Dimensions** - Validates exact 8.5×11 inch Letter size
2. ✅ **Text Cutoffs** - Detects text extending beyond page boundaries
3. ✅ **Image Loading** - Verifies all images loaded successfully
4. ✅ **Color Validation** - Checks TEEI brand colors (7 official colors + forbidden copper/orange)
5. ✅ **Font Validation** - Ensures Lora (headlines) and Roboto Flex (body text) usage

**Usage:**
```bash
# Validate PDF (page dimensions only)
node scripts/validate-pdf-quality.js exports/document.pdf

# Validate HTML (full 5-check validation)
node scripts/validate-pdf-quality.js exports/document.html
```

**Output:**
- JSON report: `exports/validation-issues/validation-report-[name]-[timestamp].json`
- Text report: `exports/validation-issues/validation-report-[name]-[timestamp].txt`
- Screenshots: `exports/validation-issues/screenshots/` (when issues found)

**Exit Codes:**
- `0` = All checks passed ✅
- `1` = One or more checks failed ❌

#### Layer 2: Visual Baseline System
**Scripts**: `scripts/create-reference-screenshots.js`
**Purpose**: Create high-resolution baseline from approved PDF

**What it captures:**
- 300 DPI PNG screenshots of each page
- Color analysis (dominant colors per page)
- Dimension metadata
- Edge content analysis (text cutoff detection)

**Usage:**
```bash
# Create baseline from approved PDF
node scripts/create-reference-screenshots.js exports/approved-v1.pdf baseline-v1

# Baselines saved to: references/baseline-v1/
```

#### Layer 3: Visual Regression Testing
**Script**: `scripts/compare-pdf-visual.js`
**Purpose**: Pixel-perfect comparison against baseline

**What it detects:**
- Layout changes (pixel differences)
- Color shifts (brand color accuracy)
- Text cutoffs (NEW content at edges)
- Font rendering differences
- Any visual regressions

**5 Threshold Levels:**
- < 5% = ✅ PASS (anti-aliasing only)
- 5-10% = ⚠️ MINOR (small changes)
- 10-20% = ⚠️ WARNING (noticeable differences)
- 20-30% = ❌ MAJOR (significant issues)
- \> 30% = 🚨 CRITICAL (completely different)

**Usage:**
```bash
# Compare new PDF against baseline
node scripts/compare-pdf-visual.js exports/new-version.pdf baseline-v1

# Results saved to: comparisons/baseline-v1-[timestamp]/
```

**Output Files (per page):**
- `page-N-test.png` - Screenshot of test PDF
- `page-N-diff.png` - Diff with red overlay showing changes
- `page-N-comparison.png` - Side-by-side (reference | test | diff)
- `comparison-report.json` - Detailed results with percentages

### QA Workflow (Recommended)

**Step 1: Create/Update Baseline** (when approved document ready)
```bash
node scripts/create-reference-screenshots.js exports/TEEI_AWS_v1.pdf teei-aws-v1
```

**Step 2: Validate New Versions**
```bash
# Quick validation (dimensions, content)
node scripts/validate-pdf-quality.js exports/TEEI_AWS_v2.html

# Visual regression test
node scripts/compare-pdf-visual.js exports/TEEI_AWS_v2.pdf teei-aws-v1
```

**Step 3: Review Results**
```bash
# View validation issues
explorer exports/validation-issues

# View visual comparisons
explorer comparisons
```

### Integration Options

**1. CI/CD Integration**
Both scripts support exit codes for automated pipelines:
```yaml
# GitHub Actions example
- name: Validate PDF Quality
  run: node scripts/validate-pdf-quality.js exports/build.pdf
  
- name: Visual Regression Test
  run: node scripts/compare-pdf-visual.js exports/build.pdf production-v1
```

**2. Pre-commit Hook**
Run validation before commits to catch issues early

**3. Manual Review**
Use for final quality check before client delivery

### Documentation

**Quick Start:**
- `VALIDATE-PDF-QUICK-START.md` - One-page reference
- `scripts/VISUAL_COMPARISON_QUICKSTART.md` - Visual QA quick start

**Complete Guides:**
- `scripts/README-VALIDATOR.md` - Full validator documentation
- `scripts/VISUAL_COMPARISON_README.md` - Visual comparison system
- `scripts/VALIDATOR-EXAMPLES.md` - CI/CD integration examples
- `scripts/VALIDATOR-CHECKLIST.md` - Step-by-step workflow

### Dependencies

QA system uses:
- `playwright` - Browser automation (already installed)
- `sharp` - Image processing
- `pdf-lib` - PDF structure analysis
- `pixelmatch` - Pixel-perfect comparison (already installed)
- `canvas` - Pixel-level analysis (already installed)
- `pngjs` - PNG parsing (already installed)
- `pdf-to-img` - PDF to PNG conversion

All dependencies installed and tested. System is production-ready.

---
