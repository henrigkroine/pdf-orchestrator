# Export Optimizer

**Intelligent PDF export automation for perfect PDFs every time**

> Zero manual settings. World-class quality. One command.

---

## What is Export Optimizer?

Export Optimizer is an intelligent system that automatically selects optimal PDF export settings based on document purpose. It eliminates the need to manually configure 50+ export options and ensures consistent, high-quality output every time.

### The Problem

Traditional PDF export requires manual configuration:
- 50+ export options to configure
- Risk of wrong color profile (RGB in CMYK document)
- Inconsistent quality across exports
- Missing bleed/trim marks for print
- Files either too large or too compressed
- PDF/X compliance issues at print shop

### The Solution

Export Optimizer automates everything:
- ✅ One command, perfect settings
- ✅ 7 pre-optimized profiles for every use case
- ✅ Smart purpose detection from filename
- ✅ Automatic PDF/X-4 compliance for print
- ✅ Intelligent color management (CMYK/sRGB)
- ✅ File size optimization without quality loss
- ✅ Built-in quality validation

---

## Quick Start

### Installation

```bash
# Already included in PDF Orchestrator
# No additional installation needed
```

### Basic Usage (Python)

```python
from export_optimizer import ExportOptimizer, ExportPurpose

optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership.pdf",
    purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
)

print(f"✓ Exported: {result['file_size_mb']} MB")
```

### Basic Usage (JavaScript)

```javascript
const { ExportOptimizer, ExportPurpose } = require('./scripts/export-optimizer');

const optimizer = new ExportOptimizer();
const result = await optimizer.exportDocument({
  outputPath: 'exports/TEEI_AWS_Partnership.pdf',
  purpose: ExportPurpose.PARTNERSHIP_PRESENTATION
});

console.log(`✓ Exported: ${result.fileSizeMB} MB`);
```

### CLI Usage

```bash
# Python
python export_optimizer.py exports/document.pdf --purpose partnership_presentation

# JavaScript
node scripts/export-optimizer.js exports/document.pdf --purpose partnership_presentation
```

---

## Export Profiles (7 Options)

### 1. Print Production (PDF/X-4)
**For:** Commercial printing, magazines, brochures
```
• PDF/X-4:2010 compliance
• CMYK color (ISO Coated v2)
• 300 DPI resolution
• 3mm bleed all sides
• Crop marks, registration marks, color bars
• Full font embedding
```

### 2. Partnership Presentation
**For:** Stakeholder presentations, partnership proposals
```
• High-quality digital (sRGB)
• 150 DPI resolution
• Web-optimized
• Tagged PDF for accessibility
• Balanced file size (5-10 MB)
```

### 3. Digital Marketing
**For:** Email campaigns, social media, website downloads
```
• Web-optimized (sRGB)
• 96 DPI resolution
• Linearized for fast loading
• Small file size (2-5 MB)
```

### 4. Accessibility-First (PDF/UA)
**For:** Government documents, educational materials
```
• PDF/UA-1 compliance
• WCAG 2.1 AA compliant
• Tagged PDF with structure
• Alt text for images
• Screen reader friendly
```

### 5. Draft Review
**For:** Internal review cycles, quick feedback
```
• Fast preview (72 DPI)
• Auto-open after export
• Minimal file size (1-2 MB)
• No conversion (fastest)
```

### 6. Archive Preservation (PDF/A-2)
**For:** Long-term storage, legal documents
```
• PDF/A-2b compliance
• Full font embedding
• 300 DPI resolution
• XMP metadata included
• No dependencies
```

### 7. Web-Optimized
**For:** Website embedding, online documentation
```
• Linearized (page-at-a-time)
• 96 DPI resolution
• Small file size (2-3 MB)
• Fast web view
```

---

## Features

### Smart Purpose Detection

Automatically detects export purpose from filename:

```python
optimizer = ExportOptimizer()

# "PRINT" in filename → uses print_production
optimizer.export_document("TEEI_Brochure_PRINT_READY.pdf")

# "partnership" in filename → uses partnership_presentation
optimizer.export_document("TEEI_AWS_Partnership.pdf")

# "web" in filename → uses web_optimized
optimizer.export_document("Newsletter_Web_Version.pdf")
```

### Batch Export

Export multiple documents at once:

```python
jobs = [
    {"output_path": "exports/doc1.pdf", "purpose": "partnership_presentation"},
    {"output_path": "exports/doc2.pdf", "purpose": "print_production"},
    {"output_path": "exports/doc3.pdf", "purpose": "web_optimized"}
]

results = optimizer.export_batch(jobs)
print(f"Exported {len(results)} documents")
```

### Quality Validation

Every export includes quality validation:

```python
result = optimizer.export_document("document.pdf", purpose="print_production")

print(f"Quality Score: {result['validation']['score']}/100")

# Review warnings
for warning in result['validation']['warnings']:
    print(f"⚠ {warning}")
```

### Custom Settings

Override default settings when needed:

```python
settings = optimizer.optimize_for_purpose("partnership_presentation")
settings['resolution'] = 200  # Higher than default 150 DPI

result = optimizer.export_document("document.pdf", settings=settings)
```

---

## Documentation

### Quick Start Guide
**File:** `/EXPORT-OPTIMIZER-QUICK-START.md`
**Contents:** 30-second start, common use cases, decision tree

### Complete Guide
**File:** `/docs/EXPORT-OPTIMIZER-GUIDE.md`
**Contents:** Full API reference, integration guide, best practices, troubleshooting

### Technical Specification
**File:** `/docs/EXPORT-OPTIMIZER-SPEC.md`
**Contents:** System architecture, algorithms, performance metrics, testing

### Examples
**File:** `/example-jobs/export-optimizer-examples.py`
**Contents:** 12 complete usage examples

---

## Usage Examples

### Example 1: TEEI Partnership Document

```python
optimizer = ExportOptimizer()

result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership_v2.pdf",
    purpose="partnership_presentation"
)

# Result:
# • sRGB color (best for screens)
# • 150 DPI (optimal for digital viewing)
# • Web-optimized
# • Tagged PDF for accessibility
# • ~5-10 MB file size
```

### Example 2: Print-Ready Brochure

```python
result = optimizer.export_document(
    output_path="exports/TEEI_Brochure.pdf",
    purpose="print_production"
)

# Result:
# • PDF/X-4:2010 compliant
# • CMYK color (ISO Coated v2)
# • 300 DPI resolution
# • 3mm bleed all sides
# • Crop marks, registration marks
# • Full font embedding
# • Ready for commercial printing
```

### Example 3: Quick Draft for Review

```python
result = optimizer.export_document(
    output_path="exports/TEEI_Draft.pdf",
    purpose="draft_review"
)

# Result:
# • 72 DPI (fast generation)
# • Auto-opens in PDF viewer
# • ~1-2 MB file size
# • Perfect for quick feedback
```

### Example 4: Accessible Educational Materials

```python
result = optimizer.export_document(
    output_path="exports/TEEI_Course_Materials.pdf",
    purpose="accessibility_first"
)

# Result:
# • PDF/UA-1 compliant
# • WCAG 2.1 AA compliant
# • Tagged PDF structure
# • Alt text for images
# • Screen reader friendly
# • Section 508 compliant
```

---

## Integration

### Integrate with Orchestrator

```javascript
// orchestrator.js
const { ExportOptimizer } = require('./scripts/export-optimizer');

class PDFOrchestrator {
  constructor() {
    this.exportOptimizer = new ExportOptimizer();
  }

  async executeJob(job) {
    const result = await this.exportOptimizer.exportDocument({
      outputPath: job.output.path,
      purpose: job.output.purpose,
      documentMetadata: job.metadata
    });

    return result;
  }
}
```

### Update Existing Export Scripts

```python
# OLD: Manual export
response = cmd("exportPDF", {
    "outputPath": pdf_path,
    "preset": "High Quality Print"
})

# NEW: Smart export
from export_optimizer import ExportOptimizer

optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path=pdf_path,
    purpose="partnership_presentation"
)
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│              Export Optimizer                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │   Purpose Detection Engine                │ │
│  │   • Filename analysis                     │ │
│  │   • Metadata parsing                      │ │
│  └───────────────────────────────────────────┘ │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐ │
│  │   Profile Selection Engine                │ │
│  │   • 7 pre-optimized profiles              │ │
│  │   • Custom override support               │ │
│  └───────────────────────────────────────────┘ │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐ │
│  │   Export Execution Engine                 │ │
│  │   • InDesign MCP integration              │ │
│  │   • Batch processing                      │ │
│  └───────────────────────────────────────────┘ │
│                    ↓                            │
│  ┌───────────────────────────────────────────┐ │
│  │   Validation Engine                       │ │
│  │   • PDF/X compliance                      │ │
│  │   • Quality scoring (0-100)               │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## API Reference

### ExportOptimizer Class

#### `export_document(output_path, purpose=None, settings=None, document_metadata=None)`
Export a document with optimized settings.

**Returns:**
```python
{
  "success": True,
  "output_path": "exports/document.pdf",
  "file_size_mb": 8.5,
  "settings": {...},
  "validation": {
    "score": 95,
    "warnings": [],
    "errors": []
  }
}
```

#### `optimize_for_purpose(purpose, overrides=None)`
Get optimized export settings for a specific purpose.

#### `detect_purpose(document_metadata=None)`
Intelligently detect document purpose from metadata.

#### `export_batch(jobs)`
Export multiple documents with optimized settings.

#### `list_profiles()`
List all available export profiles.

---

## CLI Commands

```bash
# List all profiles
python export_optimizer.py --list-profiles
node scripts/export-optimizer.js --list-profiles

# Get profile information
python export_optimizer.py --profile-info print_production
node scripts/export-optimizer.js --profile-info print_production

# Export with specific purpose
python export_optimizer.py exports/doc.pdf --purpose partnership_presentation
node scripts/export-optimizer.js exports/doc.pdf --purpose partnership_presentation
```

---

## File Size Comparison

Same document, different profiles:

| Profile | Resolution | File Size | Best For |
|---------|-----------|-----------|----------|
| print_production | 300 DPI | ~25 MB | Commercial printing |
| partnership_presentation | 150 DPI | ~8 MB | Stakeholder presentations |
| digital_marketing | 96 DPI | ~3 MB | Email campaigns |
| web_optimized | 96 DPI | ~2 MB | Website embedding |
| draft_review | 72 DPI | ~1 MB | Internal review |

---

## Best Practices

### 1. Use Descriptive Filenames

```python
# ✅ Good - Purpose clear from filename
"TEEI_AWS_Partnership_Presentation.pdf"  # → partnership_presentation
"TEEI_Brochure_PRINT_READY.pdf"          # → print_production
"Newsletter_Web_Version.pdf"              # → web_optimized

# ❌ Bad - Generic filename
"document.pdf"  # → Falls back to default
```

### 2. Always Enable Validation

```python
optimizer = ExportOptimizer()
optimizer.config['validation_enabled'] = True  # Default

result = optimizer.export_document("doc.pdf", purpose="print_production")

if result['validation']['score'] < 90:
    print("Quality issues detected")
```

### 3. Test Multiple Profiles

```python
purposes = ["print_production", "partnership_presentation", "web_optimized"]

for purpose in purposes:
    result = optimizer.export_document(f"exports/doc_{purpose}.pdf", purpose=purpose)
    print(f"{purpose}: {result['file_size_mb']} MB")
```

---

## Troubleshooting

### Issue: Wrong Purpose Detected

**Solution:** Explicitly specify purpose:
```python
result = optimizer.export_document("doc.pdf", purpose="print_production")
```

### Issue: File Size Too Large

**Solution:** Use more aggressive compression:
```python
result = optimizer.export_document("doc.pdf", purpose="web_optimized")
```

### Issue: Print Shop Rejects PDF

**Solution:** Always use print_production:
```python
result = optimizer.export_document("doc.pdf", purpose="print_production")
# Guaranteed PDF/X-4 compliance
```

---

## Performance

| Metric | Value |
|--------|-------|
| Purpose detection | ~5ms |
| Profile selection | ~2ms |
| Settings generation | ~10ms |
| Total overhead | ~500ms |

---

## Dependencies

### Python
- `pdf-lib` - PDF structure analysis
- `socket_client` - MCP communication (included in adb-mcp)

### JavaScript
- `pdf-lib` - PDF structure analysis
- Native Node.js modules

---

## Support

- **Quick Start**: `/EXPORT-OPTIMIZER-QUICK-START.md`
- **Complete Guide**: `/docs/EXPORT-OPTIMIZER-GUIDE.md`
- **Technical Spec**: `/docs/EXPORT-OPTIMIZER-SPEC.md`
- **Examples**: `/example-jobs/export-optimizer-examples.py`

---

## Version

**v1.0.0** (2025-11-08)

---

## License

PRIVATE - TEEI PDF Orchestrator

---

**Perfect PDFs, Zero Manual Settings**

> "The best PDF export is the one you don't have to configure."

---

## Next Steps

1. **Try the Quick Start**: `/EXPORT-OPTIMIZER-QUICK-START.md`
2. **Review Examples**: `/example-jobs/export-optimizer-examples.py`
3. **Read the Complete Guide**: `/docs/EXPORT-OPTIMIZER-GUIDE.md`
4. **Integrate with Your Workflow**: See Integration Guide above
