# Ready to Execute TFU Migration

**Status**: 🔧 READY TO RUN (InDesign needs to be started)
**Date**: 2025-11-13
**Progress**: Steps 0-3 Complete, Step 4 Ready to Execute

---

## What's Been Completed ✅

### Step 0-1: Design System Analysis & Documentation
- **Analyzed**: 4 Together for Ukraine reference PDFs
- **Created**: `TEEI_PRINT_DESIGN_SYSTEM_FROM_OVERVIEWS.md` (450 lines)
- **Result**: Complete TFU design system documented (colors, typography, layout patterns)

### Step 2-3: Layout Specification & Implementation
- **Created**: `DESIGN_SPEC_AWS_PARTNERSHIP_TEEI_STYLE.md` (600 lines)
- **Created**: `create_teei_partnership_TFU_system.py` (780 lines)
- **Result**: 4-page TFU-compliant ExtendScript implementation ready to execute

### MCP Infrastructure
- **Status**: MCP stack running (port 8013 listening)
- **Issue**: InDesign not open, so MCP Agent plugin not connected

---

## What Needs to Happen Now (5 Minutes)

### 1. Start InDesign with MCP Plugin

**Action Required**:
```
1. Launch Adobe InDesign
2. Window → Utilities → InDesign MCP Agent
3. Click "Connect" button
4. Verify: "Connected with ID: [socket-id]" appears
```

**Why**: The MCP bridge is running and waiting, but InDesign needs to be open with the MCP Agent plugin connected for the Python scripts to communicate with it.

---

## HOW TO GENERATE THE TFU AWS PDF (OPTION A - RECOMMENDED)

**Option A: Manual ExtendScript Execution** (bypasses MCP infrastructure issues)

### Step 1: Open InDesign

1. Launch Adobe InDesign
2. **Do NOT need to connect MCP Agent plugin** (Option A bypasses MCP)

### Step 2: Run the JSX Script

**Method 1: Via InDesign Menu (Recommended)**
```
1. InDesign → File → Scripts → Other Script...
2. Navigate to: D:\Dev\VS Projects\Projects\pdf-orchestrator\scripts\
3. Select: generate_tfu_aws.jsx
4. Click "Open"
```

**Method 2: Copy-Paste into ExtendScript Toolkit** (if menu fails)
```
1. Open ExtendScript Toolkit (installed with InDesign)
2. Target: Adobe InDesign (select from dropdown)
3. Open scripts/generate_tfu_aws.jsx
4. Click "Run" button (green play icon)
```

### Step 3: Save the Generated Document

Once script completes (you'll see success alert):
```
1. File → Save As...
2. Filename: TEEI-AWS-Partnership-TFU.indd
3. Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
4. Click Save
```

### Step 4: Export PDFs

**For Print (CMYK):**
```
1. File → Export...
2. Format: Adobe PDF (Print)
3. Filename: TEEI-AWS-Partnership-TFU-PRINT.pdf
4. Preset: [PDF/X-4:2010] or [High Quality Print]
5. Click Export
6. In PDF Export dialog:
   - Marks and Bleeds: Enable crop marks
   - Output: Color Conversion = Convert to Destination (CMYK)
7. Click Export
```

**For Digital (RGB):**
```
1. File → Export...
2. Format: Adobe PDF (Interactive)
3. Filename: TEEI-AWS-Partnership-TFU-DIGITAL.pdf
4. Click Export
5. In PDF Export dialog:
   - Compression: High Quality
   - View After Exporting: Enable (optional)
6. Click OK
```

### Step 5: Verify Output

Check the exports folder:
```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
ls -la exports/TEEI-AWS-Partnership-TFU*
```

You should see:
- ✅ `TEEI-AWS-Partnership-TFU.indd` (InDesign source, ~500KB)
- ✅ `TEEI-AWS-Partnership-TFU-PRINT.pdf` (CMYK, 1-2MB)
- ✅ `TEEI-AWS-Partnership-TFU-DIGITAL.pdf` (RGB, 1-2MB)

**Visual Verification:**
Open the PDF and confirm:
- ✅ 4 pages (not 3!)
- ✅ Page 1: Full teal cover with white photo card
- ✅ Page 2: Light blue stats sidebar on right
- ✅ Page 3: Two-column program text (NOT colored cards)
- ✅ Page 4: Together for Ukraine badge (blue + yellow) + 3×3 logo grid
- ✅ NO gold color anywhere (#BA8F5A forbidden)
- ✅ Pure teal #00393F throughout

---

## OPTION B: Python-Based Execution (If MCP Fixed)

### 2. Run the TFU Migration Script

Once InDesign is connected to MCP, execute:

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

# Clear Python cache
rm -rf __pycache__ adb-mcp/mcp/__pycache__

# Run TFU-compliant script
python -B create_teei_partnership_TFU_system.py
```

**Expected Output**:
```
======================================================================
TEEI × AWS TFU DESIGN SYSTEM PIPELINE (V3.0)
======================================================================
[INFO] Generating 4-page PDF matching Together for Ukraine design family
[CONFIG] Connected to InDesign MCP bridge at http://localhost:8013
[CHECK] InDesign connection verified
[DATA] Loaded content: AWS Partnership Proposal

======================================================================
STEP 1: BUILD TFU-COMPLIANT LAYOUT (4 PAGES)
======================================================================
[MCP] Generating TFU layout (4 pages) ...
[MCP] Generating TFU layout (4 pages) complete

======================================================================
STEP 2: EXPORT PDFS
======================================================================
[MCP] Exporting Print PDF (CMYK) ...
[MCP] Exporting Print PDF (CMYK) complete
[MCP] Exporting Digital PDF (RGB) ...
[MCP] Exporting Digital PDF (RGB) complete

======================================================================
PIPELINE COMPLETE
======================================================================
[OK] TFU-compliant AWS partnership PDF generated
[FILE] InDesign source : exports/TEEI-AWS-Partnership-TFU.indd
[FILE] Print PDF (CMYK): exports/TEEI-AWS-Partnership-TFU-PRINT.pdf
[FILE] Digital PDF (RGB): exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf

[NOTE] This PDF now matches Together for Ukraine design system:
  - Full teal cover with centered photo card
  - Two-column About + Goals with stats sidebar
  - Two-column text-based program matrix (NOT cards)
  - Full teal closing CTA with TFU badge and 3x3 logo grid
  - NO gold color usage (teal primary only)
```

### 3. Verify the Output

Check the generated files:
```bash
ls -la exports/TEEI-AWS-Partnership-TFU*
```

Expected files:
- `TEEI-AWS-Partnership-TFU.indd` (InDesign source)
- `TEEI-AWS-Partnership-TFU-PRINT.pdf` (CMYK, for printing)
- `TEEI-AWS-Partnership-TFU-DIGITAL.pdf` (RGB, for screens)

---

## What the TFU Script Does

### Page 1: TFU Cover Pattern
```
┌─────────────────────────────────────────────┐
│ FULL TEAL BACKGROUND (#00393F)              │
│                                             │
│ [TEEI Logo]                                 │
│  white, top-left                            │
│                                             │
│     ┌───────────────────────────────┐      │
│     │                               │      │
│     │   [Hero Photo Card]          │      │
│     │   460×420pt, 24pt corners    │      │
│     │                               │      │
│     └───────────────────────────────┘      │
│                                             │
│        Together for Ukraine                │  ← Lora Bold 60pt white
│      AWS PARTNERSHIP                       │  ← Roboto 14pt ALL CAPS white
│                                             │
└─────────────────────────────────────────────┘
```

### Page 2: About + Goals Pattern
```
┌─────────────────────────────────────────────┐
│ [Full-width hero photo - 200pt height]     │
└─────────────────────────────────────────────┘

About the Partnership        ┌───────────────┐
                             │  50,000       │
Left column (60%) with       │  STUDENTS     │
narrative about TEEI × AWS   │  REACHED      │
partnership                  │      │        │
                             │   12          │
Multiple paragraphs          │  COUNTRIES    │
explaining mission           │      │        │
                             │   45          │
                             │  PARTNER      │
                             │  ORGS         │
                             │      │        │
                             │  3,500        │
                             │  AWS CERTS    │
                             └───────────────┘
                          Light blue sidebar (35%)
```

### Page 3: Programs Matrix Pattern
```
┌─────────────────────────────────────────────┐
│ Programs powered by AWS                     │  ← Lora 46pt teal
│ ~~~~~~~~~~~~~~~~~~~~~~~~~ (decorative)      │
│                                             │
│ PROGRAM 1            │ PROGRAM 2           │
│ Cloud Computing      │ Career Pathways     │
│ Curriculum           │ Program             │
│                      │                     │
│ Description text...  │ Description text... │
│ 15,000 • 92% • 78%  │ 12,000 • 95% • 72% │
│                      │                     │
│ PROGRAM 3            │                     │
│ AI/ML Learning Path  │                     │
│                      │                     │
│ Description text...  │                     │
│ 8,000 • 88% • 65%   │                     │
└─────────────────────────────────────────────┘
```

### Page 4: Closing CTA Pattern
```
┌─────────────────────────────────────────────┐
│ FULL TEAL BACKGROUND (#00393F)              │
│                                             │
│     ┌────────────┬──────────┐              │
│     │Together for│ UKRAINE  │              │  ← TFU Badge
│     │  (blue)    │ (yellow) │              │    Blue #3D5CA6
│     └────────────┴──────────┘              │    Yellow #FFD500
│                                             │
│  We are looking for more partners          │  ← Lora SemiBold 32pt
│  and supporters to work with us.           │    white, centered
│                                             │
│  Partner with TEEI and AWS to scale        │  ← Roboto 14pt white
│  technology education...                   │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Google│ │Kintell│ │Babbel│               │  ← 3×3 Partner
│  └──────┘ └──────┘ └──────┘               │    Logo Grid
│  ┌──────┐ ┌──────┐ ┌──────┐               │    (white boxes)
│  │Sanoma│ │Oxford│ │ AWS  │               │
│  └──────┘ └──────┘ └──────┘               │
│  ┌──────┐ ┌──────┐ ┌──────┐               │
│  │Cornell│ │ Inco │ │ Bain │               │
│  └──────┘ └──────┘ └──────┘               │
│                                             │
│  +47 919 08 939 | hello@teei.global       │  ← Contact strip
│                               [TEEI Logo]  │    Roboto 11pt white
└─────────────────────────────────────────────┘
```

---

## Design Differences: Old vs. New

### OLD (Current 3-page PDF - WRONG)
```
❌ Page 1: Split teal/sand cover with inline metrics
❌ Page 2: Beige background with alternating blue/sand program cards
❌ Page 3: Sand background with simple bullet list CTA
❌ Uses gold color (#BA8F5A) throughout
❌ No TFU badge
❌ No partner logo grid
❌ No full teal pages (only narrow sidebar)
```

### NEW (TFU-Compliant 4-page PDF - CORRECT)
```
✅ Page 1: Full teal cover with centered photo card
✅ Page 2: Hero photo + two-column + light blue stats sidebar
✅ Page 3: Two-column editorial program matrix (NO cards!)
✅ Page 4: Full teal closing with TFU badge + 3×3 logos
✅ Pure teal #00393F primary (NO gold!)
✅ TFU badge (blue + yellow boxes) present
✅ Partner logo grid with AWS featured
✅ Full teal pages (cover + closing)
```

---

## TFU Design System Summary

### Color Palette (from Reference PDFs)
```
PRIMARY:   Teal #00393F     RGB(0, 57, 63)      - Cover + closing backgrounds
ACCENT:    Light Blue #C9E4EC  RGB(201, 228, 236)  - Stats sidebar
BADGE:     Blue #3D5CA6     RGB(61, 92, 166)    - TFU badge left
BADGE:     Yellow #FFD500    RGB(255, 213, 0)     - TFU badge right
TEXT:      Black #000000    - Body text
TEXT:      White #FFFFFF    - Cover/closing text

FORBIDDEN: Gold #BA8F5A     - NOT in TFU system!
FORBIDDEN: Copper/orange    - NOT in TFU system!
```

### Typography (from Reference PDFs)
```
COVER TITLE:       Lora Bold 60pt white
COVER SUBTITLE:    Roboto 14pt ALL CAPS white (+2.5pt tracking)
PAGE HEADING:      Lora Regular 46pt teal
SECTION HEADING:   Lora SemiBold 22pt teal
BODY TEXT:         Roboto Regular 12pt black (1.5× leading)
STAT NUMBER:       Lora Bold 34pt teal
STAT LABEL:        Roboto Regular 10pt teal ALL CAPS
PROGRAM LABEL:     Roboto Medium 11pt teal ALL CAPS
PROGRAM NAME:      Lora SemiBold 20pt teal
```

### Layout Patterns (from Reference PDFs)
```
PAGE SETUP:        612×792pt (US Letter), 40pt margins, 12-column grid
COVER:             Full teal + centered photo card (460×420pt, 24pt corners)
INTERIOR:          White background, two-column layouts, generous whitespace
STATS SIDEBAR:     Light blue box, vertical list, teal dividers
PROGRAMS:          Two-column editorial text (NOT cards with backgrounds!)
CLOSING CTA:       Full teal + TFU badge + 3×3 logo grid + contact strip
```

---

## After Execution: Remaining Steps

### Step 5: Extend QA System (1 hour)
**File**: `validate_document.py`

Add TFU design compliance checks:
- Page count: Must be 4 pages
- Color compliance: Teal primary, NO gold
- Cover pattern: Full teal + photo card
- Stats sidebar: Present on page 2
- Program matrix: Two-column text (not cards)
- Closing CTA: TFU badge + logo grid

### Step 6: Verify & Document (30 minutes)
- Visual comparison with TFU reference PDFs
- QA validation (expect 125/125)
- Create before/after screenshots
- Update documentation

---

## Troubleshooting

### If Script Fails
1. **"Connection Timed Out"**:
   - Check InDesign is running: `tasklist | findstr "InDesign"`
   - Check MCP Agent connected: Look for socket ID in plugin
   - Restart MCP stack: `.\start-mcp-stack.ps1`

2. **"ExtendScript execution failed"**:
   - Check InDesign console for error details
   - Check fonts installed: Lora + Roboto
   - Try running with smaller test script first

3. **Generated PDF doesn't match TFU**:
   - Review ExtendScript in `create_teei_partnership_TFU_system.py`
   - Compare colors manually (should be pure teal #00393F)
   - Check page count (should be 4, not 3)

---

## Quick Start Commands

```bash
# 1. Start InDesign (manual step - do this first!)
# 2. Connect MCP Agent plugin (Window → Utilities → InDesign MCP Agent → Connect)

# 3. Verify MCP bridge is running
netstat -ano | findstr ":8013"
# Should show LISTENING

# 4. Run TFU migration
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"
rm -rf __pycache__ adb-mcp/mcp/__pycache__
python -B create_teei_partnership_TFU_system.py

# 5. Check output
ls -la exports/TEEI-AWS-Partnership-TFU*

# 6. Open and verify
# Open exports/TEEI-AWS-Partnership-TFU-PRINT.pdf in Acrobat
```

---

## Complete Step 7 Runbook

**See**: `TFU-MIGRATION-STEP-7-FINAL-VERIFICATION.md` for the comprehensive Step 7 workflow:
- ✅ Phase 1: PDF Generation (this page, Option A)
- ✅ Phase 2: Automated QA Validation (5 canonical commands)
- ✅ Phase 3: Human Visual QA (26-item checklist)
- ✅ Phase 4: Decision & Documentation (pass/fail criteria)

**Quick Command**:
```bash
# After generating PDF with Option A above:
python validate_document.py exports/TEEI-AWS-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-aws-partnership.json --strict

# Expected: 140-150/150 (93-100%) + Exit code 0
```

---

**Current Status**: Ready to Execute Option A
**Last Updated**: 2025-11-13 16:45 UTC
**Step 7 Documentation**: COMPLETE
