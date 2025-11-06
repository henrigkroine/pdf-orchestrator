# WCAG 2.2 Accessibility Validation - Quick Start

**5-Minute Getting Started Guide**

---

## Installation

```bash
# Install dependencies (if not already done)
npm install
```

---

## Test the System

```bash
# Run test suite (should show 42 passing tests)
npm run test:accessibility
```

**Expected output**:
```
✓ ALL TESTS PASSED!
Total Tests: 42
Passed: 42
Pass Rate: 100.0%
```

---

## Validate Your First Document

```bash
# Validate a PDF
npm run validate:accessibility exports/your-document.pdf

# Validate HTML
npm run validate:accessibility exports/your-document.html
```

---

## View Results

Reports are saved to:
```
exports/accessibility-issues/
├── accessibility-report-[timestamp].html  ← Open this in browser
└── accessibility-report-[timestamp].json  ← For automation
```

---

## Common Commands

```bash
# Test suite
npm run test:accessibility

# Validate PDF
npm run validate:accessibility exports/document.pdf

# Validate HTML
node scripts/validate-accessibility.js exports/document.html
```

---

## Exit Codes

- `0` = All checks passed ✅
- `1` = One or more checks failed ❌

Perfect for CI/CD:
```bash
npm run validate:accessibility exports/build.pdf || exit 1
```

---

## What Gets Checked

✅ **Color Contrast** - 4.5:1 minimum for text
✅ **Text Size** - 11pt body, 14pt headings
✅ **Touch Targets** - 24×24px minimum
✅ **Alt Text** - All images must have alt text
✅ **Heading Hierarchy** - Proper h1→h2→h3 nesting
✅ **Text Spacing** - 1.5× line height minimum
✅ **Focus Indicators** - Keyboard navigation
✅ **Color Blindness** - Protanopia, deuteranopia, tritanopia

---

## TEEI Brand Colors - Quick Reference

### ✅ Safe Combinations (Pass AA)

| Text Color | Background | Contrast |
|------------|------------|----------|
| Nordshore #00393F | White | 10.7:1 ✅ |
| Nordshore #00393F | Sand #FFF1E2 | 10.2:1 ✅ |
| White | Nordshore | 10.7:1 ✅ |
| Black | White | 21.0:1 ✅ |

### ⚠️ Avoid These (Fail AA)

| Text Color | Background | Issue |
|------------|------------|-------|
| Sky #C9E4EC | White | Only 1.3:1 ❌ |
| Gold #BA8F5A | White | Only 2.9:1 ❌ |

**Rule of Thumb**: Use Nordshore or Black for text on light backgrounds!

---

## Programmatic Usage

```javascript
import validateAccessibility from './scripts/validate-accessibility.js';
import * as wcag from './scripts/lib/wcag-checker.js';

// Validate document
const exitCode = await validateAccessibility('document.pdf');

// Check colors
const contrast = wcag.calculateContrast([0, 57, 63], [255, 255, 255]);
console.log(contrast); // 10.7 (passes AA!)

// Check compliance
const result = wcag.checkContrastCompliance(contrast, 12, false, 'AA');
console.log(result.passes); // true
```

---

## Troubleshooting

### Problem: Tests fail on first run
**Solution**: `npm install` to get dependencies

### Problem: "Cannot find module"
**Solution**: Files must be ES6 modules, check `package.json` has `"type": "module"`

### Problem: PDF not validating
**Solution**: Ensure PDF is valid: `file exports/document.pdf`

---

## CI/CD Integration

### GitHub Actions
```yaml
- name: Accessibility Check
  run: npm run validate:accessibility exports/build.pdf
```

### GitLab CI
```yaml
accessibility:
  script:
    - npm run validate:accessibility exports/build.pdf
```

---

## Files You'll Use

| File | Purpose |
|------|---------|
| `scripts/validate-accessibility.js` | Main validator |
| `scripts/lib/wcag-checker.js` | Reusable functions |
| `config/wcag-config.json` | Settings |
| `test-accessibility.js` | Test suite |

---

## Getting Help

1. **Read full docs**: `docs/ACCESSIBILITY-VALIDATION-README.md`
2. **Implementation details**: `ACCESSIBILITY-IMPLEMENTATION-REPORT.md`
3. **Test examples**: Run `npm run test:accessibility` and review code
4. **WCAG reference**: https://www.w3.org/WAI/WCAG22/quickref/

---

## Next Steps

1. ✅ Run `npm run test:accessibility` to verify installation
2. ✅ Validate a test document
3. ✅ Open the HTML report in browser
4. ✅ Review TEEI brand color findings
5. ✅ Add to your CI/CD pipeline

---

**Questions?** See full documentation in `docs/ACCESSIBILITY-VALIDATION-README.md`

**Status**: Production Ready ✅
