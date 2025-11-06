# PDF Quality Validator

Comprehensive validation script for TEEI PDF documents against brand guidelines and quality standards.

## Features

The validator performs the following checks:

### 1. Page Dimensions
- Verifies all pages are exactly 8.5 x 11 inches (612 x 792 points)
- Allows 2-point tolerance for rounding
- Flags any pages with incorrect dimensions

### 2. Text Cutoffs
- Detects text extending beyond page boundaries
- Identifies text overflow within containers
- Captures screenshots of issues
- Reports element details (font, size, position)

### 3. Image Loading
- Checks all images loaded successfully
- Detects broken image references
- Tracks failed image requests
- Validates image rendering

### 4. Color Validation
- Analyzes dominant colors in the document
- Matches colors against TEEI brand palette:
  - Nordshore #00393F (primary)
  - Sky #C9E4EC (secondary)
  - Sand #FFF1E2 (background)
  - Gold #BA8F5A (accent)
  - Moss #65873B, Clay #913B2F, Beige #EFE1DC
- Detects forbidden colors (copper/orange)
- Provides color frequency analysis

### 5. Font Validation
- Verifies Lora font used for headlines
- Verifies Roboto/Roboto Flex used for body text
- Detects non-brand fonts
- Provides font usage statistics

## Installation

```bash
# Install dependencies (if not already installed)
cd T:/Projects/pdf-orchestrator
npm install
```

Dependencies:
- `playwright` - Browser automation for rendering
- `pdf-lib` - PDF structure analysis
- `sharp` - Image analysis
- `canvas` - Pixel-level color checks

## Usage

### Basic Usage

```bash
# Validate a PDF file
node scripts/validate-pdf-quality.js <path-to-pdf>

# Example
node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf
```

### Using npm script

```bash
# Add this to package.json scripts (if not already added):
"validate-pdf": "node scripts/validate-pdf-quality.js"

# Then run:
npm run validate-pdf exports/TEEI_AWS_Partnership.pdf
```

## Output

The validator generates:

1. **Console output** - Real-time validation progress and results
2. **JSON report** - Machine-readable validation results
   - Location: `exports/validation-issues/validation-report-[filename]-[timestamp].json`
3. **Text report** - Human-readable summary
   - Location: `exports/validation-issues/validation-report-[filename]-[timestamp].txt`
4. **Screenshots** - Visual evidence of issues
   - Location: `exports/validation-issues/screenshots/`

### Exit Codes

- `0` - All checks passed
- `1` - One or more checks failed

## Example Output

```
=====================================
PDF QUALITY VALIDATION
=====================================

Target PDF: exports/TEEI_AWS_Partnership.pdf
Started: 2025-11-05T12:00:00.000Z

=====================================
CHECK 1: PAGE DIMENSIONS
=====================================

Total pages: 3

Page 1:
  Dimensions: 612 x 792 points
  Expected: 612 x 792 points
  Difference: 0.00 x 0.00 points
  Status: ✅ PASS

Page 2:
  Dimensions: 612 x 792 points
  Expected: 612 x 792 points
  Difference: 0.00 x 0.00 points
  Status: ✅ PASS

...

=====================================
CHECK 2: TEXT CUTOFFS
=====================================

Loading PDF in browser...
Analyzing text elements...

✅ No text cutoff issues detected

=====================================
CHECK 3: IMAGE LOADING
=====================================

Loading PDF and checking images...
Total images: 5
Failed requests: 0
Broken images: 0

✅ All images loaded successfully

=====================================
CHECK 4: COLOR VALIDATION
=====================================

Loading PDF for color analysis...
Analyzing colors in 816x1056 image...

Top 10 dominant colors:

1. RGB(0, 57, 63) - #00393f
   Frequency: 12.34%
   ✅ Matches: Nordshore (#00393F)

2. RGB(201, 228, 236) - #c9e4ec
   Frequency: 8.76%
   ✅ Matches: Sky (#C9E4EC)

...

Summary:
  TEEI brand colors: 3
  Non-brand colors: 2
  Forbidden colors: 0

=====================================
CHECK 5: FONT VALIDATION
=====================================

Loading PDF for font analysis...

Font usage analysis:

Lora (Headlines/Titles):
  ✅ Lora, 42px, 700
     Type: heading, Count: 3
     Sample: "THE EDUCATIONAL EQUALITY INSTITUTE"

Roboto/Roboto Flex (Body Text):
  ✅ Roboto Flex, 11px, 400
     Type: body, Count: 156
     Sample: "Partnering with AWS to transform education..."

✅ Font validation PASSED

=====================================
VALIDATION COMPLETE
=====================================

Overall Status: ✅ PASSED
Checks Passed: 5
Errors: 0
Warnings: 0
```

## Integration with CI/CD

The validator can be integrated into continuous integration pipelines:

```yaml
# Example GitHub Actions workflow
- name: Validate PDF Quality
  run: |
    node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf
  continue-on-error: false
```

## Troubleshooting

### Browser Issues
If Playwright fails to launch browser:
```bash
# Install browser dependencies
npx playwright install chromium
npx playwright install-deps
```

### Font Detection Issues
Font validation may not work on all PDF formats. This is normal - the validator will log a warning but continue with other checks.

### Color Analysis Slow
Color analysis samples every 10th pixel for performance. Adjust the sampling rate in the code if needed (line ~388):
```javascript
for (let i = 0; i < data.length; i += info.channels * 10) {
  // Change 10 to 5 for more detailed analysis (slower)
  // Change 10 to 20 for faster analysis (less detailed)
}
```

## TEEI Brand Guidelines Reference

### Official Colors
- **Nordshore** #00393F - RGB(0, 57, 63) - Primary
- **Sky** #C9E4EC - RGB(201, 228, 236) - Secondary
- **Sand** #FFF1E2 - RGB(255, 241, 226) - Background
- **Beige** #EFE1DC - RGB(239, 225, 220) - Background
- **Moss** #65873B - RGB(101, 135, 59) - Accent
- **Gold** #BA8F5A - RGB(186, 143, 90) - Accent
- **Clay** #913B2F - RGB(145, 59, 47) - Accent

### Required Fonts
- **Headlines**: Lora (Bold, Semibold)
- **Body Text**: Roboto Flex (Regular, Medium)

### Required Page Size
- **8.5 x 11 inches** (612 x 792 points)

## Related Documentation

- **Main CLAUDE.md**: T:/Projects/pdf-orchestrator/CLAUDE.md
- **Design Fix Report**: T:/Projects/pdf-orchestrator/reports/TEEI_AWS_Design_Fix_Report.md
- **TEEI Brand Guidelines**: T:/TEEI/TEEI Overviews/TEEI Design Guidelines.pdf

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the TEEI Design Fix Report for context
3. Consult the TEEI Brand Guidelines for official standards

---

**Version**: 1.0.0
**Author**: Henrik Røine
**Last Updated**: 2025-11-05
