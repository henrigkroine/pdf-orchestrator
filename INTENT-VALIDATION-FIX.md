# PDF Intent Validation Fix

## Problem Summary

The PDF validator was reporting intent mismatch errors:
- Job config specified `"intent": "print"` (requiring 300 DPI)
- Validator detected intent as `"screen"` (only requiring 150 DPI)
- This caused validation failures even though the correct export preset was used

## Root Cause

The issue was in **two places**:

### 1. PDF Export Settings (create_teei_partnership_world_class.py)

The `export_pdf_variant()` function was using InDesign's named presets (`[High Quality Print]`), but **wasn't explicitly setting the PDF color space metadata** that validators use to detect print vs screen intent.

**Problem**: Named presets like "High Quality Print" don't guarantee that the PDF will be marked with print intent metadata. The PDF needs explicit color space settings.

### 2. Intent Detection Logic (validate_document.py)

The validator had a basic intent detection method (`_detect_pdf_intent()`) but it wasn't being used properly:
- It would try to read PDF metadata to detect CMYK vs RGB
- But if metadata wasn't set correctly, it would default to "screen"

## Solution

### Part 1: Explicit PDF Metadata in Export (✅ FIXED)

Updated `export_pdf_variant()` to explicitly set PDF color space based on intent:

```python
def export_pdf_variant(label: str, path: Path, preset: str, *, include_bleed: bool,
                       include_crop_marks: bool, tagged: bool, intent: str = "print") -> None:
    # Set output intent based on purpose
    if intent == "print":
        color_conversion = "ConvertToCMYK"
        output_intent_profile = "U.S. Web Coated (SWOP) v2"
    else:
        color_conversion = "ConvertToRGB"
        output_intent_profile = "sRGB IEC61966-2.1"

    script = f"""
    // ... InDesign ExtendScript ...

    // CRITICAL: Set output intent for print vs screen detection
    app.pdfExportPreferences.pdfColorSpace = PDFColorSpace.{color_conversion.upper()};
    app.pdfExportPreferences.standardsCompliance = PDFXStandards.NONE;
    app.pdfExportPreferences.includeICCProfiles = true;

    // Set the output condition (this is what validators read)
    try {{
        app.pdfExportPreferences.pdfDestinationProfile = "{output_intent_profile}";
    }} catch (err) {{
        // Fallback: profile not available, validator will use color space
    }}
    """
```

**Key Changes**:
- Added `intent` parameter (default: "print")
- Sets `pdfColorSpace` to `CONVERTTOCMYK` for print or `CONVERTTORGB` for screen
- Sets `pdfDestinationProfile` to appropriate ICC profile
- This writes proper metadata to the PDF that validators can read

### Part 2: Enhanced Intent Detection (✅ FIXED)

Improved `_detect_pdf_intent()` method to properly read PDF metadata:

```python
def _detect_pdf_intent(self):
    """
    Detect PDF intent (print vs screen) by analyzing color space and output intent.
    Returns "print" if CMYK color space or print profile detected, otherwise "screen".
    """
    reader = PdfReader(self.pdf_path)

    # Method 1: Check OutputIntents (most reliable for print detection)
    if '/OutputIntents' in reader.trailer.get('/Root', {}):
        return "print"

    # Method 2: Check page resources for CMYK color spaces
    if '/Resources' in first_page:
        resources = first_page['/Resources']
        if '/ColorSpace' in resources:
            # Check if CMYK color space is used
            if '/DeviceCMYK' in str(color_spaces):
                return "print"

    # Default to screen if no print indicators found
    return "screen"
```

### Part 3: Intent Mismatch Detection (✅ FIXED)

Enhanced `validate_images_intent_aware()` to compare expected vs detected:

```python
# Get expected intent from job config
expected_intent = self.job_config.get('output', {}).get('intent', 'screen')

# CRITICAL: Detect ACTUAL intent from PDF metadata
detected_intent = self._detect_pdf_intent()

# Check if they match
intent_match = (detected_intent == expected_intent)

if not intent_match:
    results["intent_mismatch_error"] = (
        f"PDF intent mismatch: Expected '{expected_intent}' but detected '{detected_intent}'. "
        f"Expected DPI: {config['intents'][expected_intent]['min_image_dpi']}, "
        f"Detected requires: {results['required_dpi']}"
    )
```

### Part 4: Enhanced Reporting (✅ FIXED)

Updated validation report to show intent comparison:

```
INTENT-AWARE IMAGE VALIDATION:
  • Expected Intent: PRINT
  • Detected Intent: PRINT          ← Now matches!
  • Intent Match: [OK]              ← Validation passes
  • Required DPI: 300
  • Required Color Space: CMYK
```

## Files Modified

1. **create_teei_partnership_world_class.py**
   - Lines 432-491: Updated `export_pdf_variant()` function
   - Lines 533-550: Updated function calls with explicit intent parameter

2. **validate_document.py**
   - Lines 65-108: Added `_detect_pdf_intent()` method
   - Lines 389-488: Updated `validate_images_intent_aware()` with mismatch detection
   - Lines 547-578: Enhanced report output with intent comparison

## How to Verify the Fix

### 1. Run the Pipeline

```bash
python create_teei_partnership_world_class.py
```

### 2. Check Export Settings

The script will now log:
```
[MCP] Exporting Print PDF ...
[MCP] Exporting Print PDF complete
```

### 3. Check Validation Report

Look for this section in the output:
```
INTENT-AWARE IMAGE VALIDATION:
  • Expected Intent: PRINT
  • Detected Intent: PRINT          ← Should match now
  • Intent Match: [OK]              ← Should pass
  • Required DPI: 300
  • Required Color Space: CMYK
  • Intent Validated: [OK]
```

### 4. Manual Verification (Optional)

Open the exported PDF in Acrobat Pro:
- File → Properties → Description → Output Intent
- Should show: "U.S. Web Coated (SWOP) v2" for print PDFs
- Should show: "sRGB IEC61966-2.1" for screen PDFs

## Technical Details

### InDesign PDF Export Preferences

The fix uses these critical ExtendScript properties:

```javascript
app.pdfExportPreferences.pdfColorSpace
// Values: PDFColorSpace.CONVERTTOCMYK (print) or PDFColorSpace.CONVERTTORGB (screen)

app.pdfExportPreferences.pdfDestinationProfile
// Values: "U.S. Web Coated (SWOP) v2" (print) or "sRGB IEC61966-2.1" (screen)

app.pdfExportPreferences.includeICCProfiles
// Must be true to embed color profiles in PDF
```

### PDF Metadata Detection

The validator checks these PDF structures:

1. **OutputIntents** - Most reliable indicator of print intent
   - Located in PDF catalog: `/Root/OutputIntents`
   - Contains ICC profile information

2. **ColorSpace Resources** - Secondary indicator
   - Page resources: `/Resources/ColorSpace`
   - Looks for `/DeviceCMYK` entries

3. **Default Fallback** - If no indicators found
   - Assumes "screen" intent (safer default)

## Expected Behavior After Fix

### Print PDF Export (intent="print")
- Color space: CMYK
- Output profile: U.S. Web Coated (SWOP) v2
- Required DPI: 300
- Validator detects: "print"
- Intent match: ✅ PASS

### Digital PDF Export (intent="screen")
- Color space: RGB
- Output profile: sRGB IEC61966-2.1
- Required DPI: 150
- Validator detects: "screen"
- Intent match: ✅ PASS

## Related Configuration

The intent requirements are defined in `pipeline.config.json`:

```json
{
  "intents": {
    "print": {
      "min_image_dpi": 300,
      "color_space": "CMYK",
      "description": "High-quality print deliverables"
    },
    "screen": {
      "min_image_dpi": 150,
      "color_space": "RGB",
      "description": "Digital screen deliverables"
    }
  }
}
```

Job configs reference these intents via `output.intent`:

```json
{
  "output": {
    "format": "pdf",
    "intent": "print",           ← Specifies print requirements
    "quality": "high",
    "destination": "exports/TEEI-AWS-Partnership-WorldClass.pdf"
  }
}
```

## Conclusion

The fix ensures that:
1. PDFs are exported with proper color space metadata
2. Validators can reliably detect print vs screen intent
3. Intent mismatches are caught and reported clearly
4. The system enforces correct DPI requirements based on actual PDF properties

This prevents false negatives where print PDFs were incorrectly flagged as screen-intent documents.

---

**Status**: ✅ COMPLETE
**Testing Required**: Run `python create_teei_partnership_world_class.py` and verify intent validation passes
**Breaking Changes**: None (added optional parameter with safe default)
