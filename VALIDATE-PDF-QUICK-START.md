# PDF Validator Quick Start

## One-Line Usage

```bash
# Validate a PDF (checks page dimensions)
node scripts/validate-pdf-quality.js exports/your-document.pdf

# Validate HTML (full validation: text, colors, fonts)
node scripts/validate-pdf-quality.js exports/your-document.html
```

## What It Checks

✅ **Page Dimensions** - Must be exactly 8.5 x 11 inches
✅ **Text Cutoffs** - No text extending beyond boundaries
✅ **Image Loading** - All images render correctly
✅ **TEEI Brand Colors** - Uses official palette only
✅ **TEEI Fonts** - Lora (headlines) + Roboto Flex (body)

## Exit Codes

- `0` = All checks passed ✅
- `1` = One or more checks failed ❌

## Output Location

```
exports/validation-issues/
├── validation-report-[filename]-[timestamp].json  # Machine-readable
├── validation-report-[filename]-[timestamp].txt   # Human-readable
└── screenshots/
    └── [issue-type]-issues.png                    # Visual evidence
```

## Quick Examples

### Example 1: Check PDF dimensions
```bash
node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf
```

### Example 2: Full validation on HTML
```bash
node scripts/validate-pdf-quality.js exports/mentorship-platform.html
```

### Example 3: Validate all PDFs
```bash
for file in exports/*.pdf; do
    echo "Validating: $file"
    node scripts/validate-pdf-quality.js "$file"
done
```

## TEEI Brand Colors (Reference)

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| Nordshore | #00393F | 0, 57, 63 | Primary |
| Sky | #C9E4EC | 201, 228, 236 | Secondary |
| Sand | #FFF1E2 | 255, 241, 226 | Background |
| Gold | #BA8F5A | 186, 143, 90 | Accent |

**Forbidden:** Copper/orange colors

## Common Issues & Fixes

### ❌ Text Cutoff
**Fix:** Increase container width or reduce font size

### ❌ Wrong Colors
**Fix:** Use only TEEI brand palette

### ❌ Wrong Fonts
**Fix:** Use Lora for headlines, Roboto Flex for body

### ❌ Wrong Page Size
**Fix:** Set InDesign document to 8.5 x 11 inches

## Full Documentation

- **Complete Guide:** `scripts/README-VALIDATOR.md`
- **Examples:** `scripts/VALIDATOR-EXAMPLES.md`
- **Summary:** `scripts/VALIDATOR-SUMMARY.md`

---

**TIP:** For best results, export HTML from InDesign first, validate with script, fix issues, then export final PDF.
