# Archived Scripts

This directory contains scripts that have been archived during the consolidation process.

**Archive Date**: 2025-11-06
**Reason**: Consolidation to reduce confusion and maintain only production-ready scripts

---

## Archive Categories

### `aws_variants/` (7 scripts)
**Consolidated into**: `create_brand_compliant_ultimate.py`

Scripts archived:
- `create-teei-aws-FINAL.py`
- `create-teei-aws-WORLD-CLASS.py`
- `create-teei-aws-PROPER.py`
- `create-teei-aws-professional.py`
- `create-teei-aws-brief-v2.py`
- `create-teei-aws-brief.py`
- `create-teei-aws-clean.py`

**Reason**: 95% duplicate functionality, different margin/spacing tweaks only

---

### `ukraine_variants/` (9 scripts)
**Consolidated into**:
- `create-ukraine-WORLD-CLASS.js` (JavaScript)
- `create-ukraine-STUNNING-clean.py` (Python)

Scripts archived:
- `create-ukraine-FONTS-FIXED.js`
- `create-ukraine-PROFESSIONAL-PARTNERS.js`
- `create-ukraine-SYSTEM-FONTS.js`
- `create-ukraine-STUNNING-HTML.js`
- `create-ukraine-WITH-LOGOS.js`
- `create-ukraine-WORKING-SIMPLE.js`
- `create-ukraine-REAL-LOGOS.js`
- `create-ukraine-SIMPLE-WORKING.py`
- `create-ukraine-WITH-IMAGES.js`

**Reason**: Iterative development versions, consolidated into most complete implementations

---

### `stubs_experimental/` (13+ scripts)
**Status**: Experimental, incomplete, or trivial stubs

Scripts archived:
- `create_nice_doc.py` - Minimal stub (47 lines)
- `create_simple_doc.py` - Minimal stub (47 lines)
- `create_indesign_doc.py` - Minimal stub (45 lines)
- `create_doc_with_text.py` - Simple text document (69 lines)
- `create_with_roboto.py` - Font testing only (140 lines)
- `create-teei-with-extendscript-colors.py` - Deprecated approach (58 lines)
- `test_create_document.py` - Development test
- `test-simple-rect.py` - Development test
- `start-metrics-aggregator.js` - Incomplete stub (14 lines)
- `create-teei-ABSOLUTE-INSANITY.py` - Marketing/experimental variant
- `create-teei-BEST-IN-WORLD.py` - Marketing/experimental variant
- `create-teei-complete.py` - Experimental variant
- `create-teei-executive.py` - Experimental variant
- `create_with_actual_brand_fonts.py` - Font testing
- `fix_black_sections.py` - Diagnostic utility
- `diagnose_rectangles.py` - Diagnostic utility
- `demo-fancy-report.py` - Demo script
- `test-acceptance.py` - Acceptance test suite
- `save_and_export.py` - Experimental utility

**Reason**: Low production value, incomplete, or used for development only

---

### `export_variants/` (7 scripts)
**Consolidated into**: `export_world_class_pdf.py`

Scripts archived:
- `export-pdf-now.py`
- `export-current-doc-NOW.py`
- `export-teei-brief.py`
- `export-teei-pdf.py`
- `export_brand_pdf.py`
- `export_world_class.py`
- `export-indesign-screenshot.py`

**Reason**: 90% duplicate export logic

---

### `color_variants/` (3 scripts)
**Consolidated into**: `apply_fixed_colors.py`

Scripts archived:
- `apply-colors-extendscript.py` - Minimal version
- `manual_color_fix.py` - Manual correction utility
- `test-connection.py` - Duplicate of `test_connection.py`

**Reason**: Duplicate or less comprehensive than production version

---

## Statistics

**Before Consolidation**: 78 scripts in root directory
**After Consolidation**: 35 scripts in root directory
**Scripts Archived**: 43 scripts (55% reduction)

**Result**: Cleaner root directory, reduced confusion, easier maintenance

---

## Using Archived Scripts

These scripts are preserved for reference purposes. If you need functionality from an archived script:

1. **Check production scripts first** - The consolidated versions likely include the functionality
2. **Review the script** - Extract specific logic if needed
3. **Do not move back to root** - Create new production script instead if truly needed

---

## Restoration Policy

Archived scripts should **NOT** be restored to the root directory without:
1. Clear business justification
2. Confirmation no production script provides the functionality
3. Refactoring to meet production standards
4. Documentation of why it's being restored

---

**Maintained by**: PDF Orchestrator Team
**Last Updated**: 2025-11-06
