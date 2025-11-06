# PDF Validator - Usage Examples

## Quick Start

```bash
# Navigate to project directory
cd T:/Projects/pdf-orchestrator

# Test with PDF file (checks page dimensions only)
node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf

# Test with HTML file (full validation including text/color/fonts)
node scripts/validate-pdf-quality.js exports/mentorship-platform.html
```

## Example 1: Validate PDF Page Dimensions

```bash
node scripts/validate-pdf-quality.js exports/mentorship-platform.pdf
```

**Output:**
```
=====================================
PDF QUALITY VALIDATION
=====================================

Target PDF: T:\Projects\pdf-orchestrator\exports\mentorship-platform.pdf
Started: 2025-11-05T14:21:19.637Z

=====================================
CHECK 1: PAGE DIMENSIONS
=====================================

Total pages: 5

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

Overall Status: ✅ PASSED
Checks Passed: 1
Errors: 0
Warnings: 3
```

## Example 2: Full Validation with HTML Export

```bash
node scripts/validate-pdf-quality.js exports/mentorship-platform.html
```

**Output:**
```
=====================================
PDF QUALITY VALIDATION
=====================================

Target PDF: T:\Projects\pdf-orchestrator\exports\mentorship-platform.html

=====================================
CHECK 2: TEXT CUTOFFS
=====================================

Loading PDF in browser...
Analyzing text elements...

❌ Found 52 text cutoff issue(s):

Issue 1:
  Text: "Mentorship platform..."
  Overflow: YES
  Exceeds viewport: YES
  Content size: 816x1195px
  Container size: 816x1056px
  Font: Georgia, serif, 14.6667px

Screenshot saved: T:\Projects\pdf-orchestrator\exports\validation-issues\screenshots\text-cutoff-issues.png

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

Overall Status: ❌ FAILED
Checks Passed: 3
Errors: 2
Warnings: 0
```

## Example 3: Automated Testing Script

Create a test script `test-all-pdfs.ps1`:

```powershell
# Test all PDFs in exports directory
$pdfs = Get-ChildItem "exports/*.pdf"

Write-Host "Testing $($pdfs.Count) PDF files..."

$passed = 0
$failed = 0

foreach ($pdf in $pdfs) {
    Write-Host "`nTesting: $($pdf.Name)" -ForegroundColor Cyan

    node scripts/validate-pdf-quality.js $pdf.FullName

    if ($LASTEXITCODE -eq 0) {
        $passed++
        Write-Host "✅ PASSED" -ForegroundColor Green
    } else {
        $failed++
        Write-Host "❌ FAILED" -ForegroundColor Red
    }
}

Write-Host "`n=================================="
Write-Host "Summary: $passed passed, $failed failed"
Write-Host "=================================="
```

Run:
```bash
powershell -ExecutionPolicy Bypass -File test-all-pdfs.ps1
```

## Example 4: CI/CD Integration

### GitHub Actions

```yaml
name: Validate PDFs

on:
  pull_request:
    paths:
      - 'exports/**.pdf'
      - 'exports/**.html'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install chromium

      - name: Validate TEEI AWS PDF
        run: node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf

      - name: Upload validation reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: validation-reports
          path: exports/validation-issues/
```

### GitLab CI

```yaml
validate-pdfs:
  stage: test
  image: node:18
  before_script:
    - npm install
    - npx playwright install chromium
  script:
    - node scripts/validate-pdf-quality.js exports/TEEI_AWS_Partnership.pdf
  artifacts:
    when: always
    paths:
      - exports/validation-issues/
    reports:
      junit: exports/validation-issues/*.xml
```

## Example 5: Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Get list of staged PDF/HTML files
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(pdf|html)$')

if [ -z "$STAGED_FILES" ]; then
    echo "No PDF/HTML files to validate"
    exit 0
fi

echo "Validating PDF/HTML files..."

FAILED=0

for FILE in $STAGED_FILES; do
    if [ -f "$FILE" ]; then
        echo "Validating: $FILE"
        node scripts/validate-pdf-quality.js "$FILE"

        if [ $? -ne 0 ]; then
            echo "❌ Validation failed for: $FILE"
            FAILED=1
        fi
    fi
done

if [ $FAILED -ne 0 ]; then
    echo ""
    echo "❌ PDF validation failed. Please fix issues before committing."
    echo "   Review reports in: exports/validation-issues/"
    exit 1
fi

echo "✅ All PDFs validated successfully"
exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Example 6: Batch Validation with Report

```bash
# Create validation report for all exports
mkdir -p validation-reports

for file in exports/*.pdf exports/*.html; do
    if [ -f "$file" ]; then
        echo "Validating: $(basename $file)"
        node scripts/validate-pdf-quality.js "$file" > "validation-reports/$(basename $file).log" 2>&1
    fi
done

echo "All validation reports saved to: validation-reports/"
```

## Example 7: Watch Mode for Development

Create `watch-validate.ps1`:

```powershell
# Watch exports directory and auto-validate on changes
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = "T:\Projects\pdf-orchestrator\exports"
$watcher.Filter = "*.*"
$watcher.IncludeSubdirectories = $false
$watcher.EnableRaisingEvents = $true

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $changeType = $Event.SourceEventArgs.ChangeType

    if ($path -match '\.(pdf|html)$') {
        Write-Host "`n[$(Get-Date -Format 'HH:mm:ss')] File $changeType: $(Split-Path $path -Leaf)" -ForegroundColor Yellow
        Write-Host "Running validation..." -ForegroundColor Cyan

        node scripts/validate-pdf-quality.js $path

        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Validation passed" -ForegroundColor Green
        } else {
            Write-Host "❌ Validation failed" -ForegroundColor Red
        }
    }
}

Register-ObjectEvent $watcher "Created" -Action $action
Register-ObjectEvent $watcher "Changed" -Action $action

Write-Host "Watching for changes in exports directory..." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop"

try {
    while ($true) {
        Start-Sleep -Seconds 1
    }
} finally {
    $watcher.Dispose()
}
```

## Example 8: Custom Validation Rules

Modify `validate-pdf-quality.js` to add custom checks:

```javascript
// Add after line 50 (TEEI_COLORS definition)

// Custom validation rules
const CUSTOM_RULES = {
  maxFileSize: 5 * 1024 * 1024, // 5 MB
  requiredTextElements: [
    'THE EDUCATIONAL EQUALITY INSTITUTE',
    'Contact',
    'www.teei.org'
  ],
  forbiddenWords: [
    'lorem ipsum',
    'placeholder',
    'TBD',
    'TODO'
  ]
};

// Add new check function
async function checkCustomRules(pdfPath) {
  console.log('=====================================');
  console.log('CHECK 6: CUSTOM RULES');
  console.log('=====================================\n');

  // Check file size
  const stats = await fs.stat(pdfPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

  console.log(`File size: ${sizeMB} MB`);

  if (stats.size > CUSTOM_RULES.maxFileSize) {
    results.passed = false;
    results.errors.push({
      check: 'File Size',
      message: `File size ${sizeMB} MB exceeds limit of ${CUSTOM_RULES.maxFileSize / (1024 * 1024)} MB`
    });
  } else {
    console.log('✅ File size within limits\n');
  }
}
```

## Validation Report Samples

### JSON Report Sample

```json
{
  "passed": false,
  "checks": [
    {
      "name": "Page Dimensions",
      "status": "PASS",
      "message": "All 5 pages have correct dimensions (8.5 x 11 inches)"
    },
    {
      "name": "Color Validation",
      "status": "PASS",
      "message": "3 TEEI brand colors detected correctly",
      "brandColors": [
        {
          "detected": { "r": 0, "g": 57, "b": 63, "hex": "#00393f" },
          "matched": { "name": "Nordshore", "hex": "#00393F" },
          "frequency": "12.34%"
        }
      ]
    }
  ],
  "errors": [
    {
      "check": "Text Cutoffs",
      "message": "2 text cutoff issue(s) detected",
      "screenshot": "exports/validation-issues/screenshots/text-cutoff-issues.png"
    }
  ],
  "warnings": [],
  "timestamp": "2025-11-05T14:21:19.636Z"
}
```

## Tips and Best Practices

1. **Always validate HTML first** - Get full validation results before final PDF export
2. **Fix text cutoffs immediately** - These are the most critical issues
3. **Review color warnings** - Some non-brand colors are OK (photos, gradients)
4. **Automate in CI/CD** - Catch issues before they reach production
5. **Keep validation reports** - Track quality improvements over time
6. **Use watch mode during development** - Get instant feedback on changes

## Troubleshooting Common Issues

### Issue: "Module type not specified" warning

**Fix:** Add to `package.json`:
```json
{
  "type": "module"
}
```

### Issue: Text cutoff false positives

**Solution:** The HTML may have scrollable containers. Review the screenshot to verify if it's a real issue.

### Issue: Color validation too strict

**Solution:** Adjust `COLOR_TOLERANCE` in the script (line 43):
```javascript
const COLOR_TOLERANCE = 20; // Increase from 15 to 20
```

### Issue: Browser crashes on large PDFs

**Solution:** Increase timeout in Playwright calls:
```javascript
await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 60000 }); // 60 seconds
```

---

**Related Documentation:**
- Main validator README: `scripts/README-VALIDATOR.md`
- TEEI Design Fix Report: `reports/TEEI_AWS_Design_Fix_Report.md`
- Project CLAUDE.md: `CLAUDE.md`
