# Export Optimizer - Quick Start Guide

**Perfect PDFs in one command - Zero manual settings**

---

## 30-Second Start

### Python

```python
from export_optimizer import ExportOptimizer, ExportPurpose

optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership.pdf",
    purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
)

print(f"✓ Exported: {result['file_size_mb']} MB")
```

### JavaScript

```javascript
const { ExportOptimizer, ExportPurpose } = require('./scripts/export-optimizer');

const optimizer = new ExportOptimizer();
const result = await optimizer.exportDocument({
  outputPath: 'exports/TEEI_AWS_Partnership.pdf',
  purpose: ExportPurpose.PARTNERSHIP_PRESENTATION
});

console.log(`✓ Exported: ${result.fileSizeMB} MB`);
```

### CLI

```bash
# Python
python export_optimizer.py exports/document.pdf --purpose partnership_presentation

# JavaScript
node scripts/export-optimizer.js exports/document.pdf --purpose partnership_presentation
```

---

## Choose Your Profile (7 Options)

| Purpose | When to Use | Quality | Size |
|---------|------------|---------|------|
| **print_production** | Commercial printing, magazines | PDF/X-4, 300 DPI, CMYK | Large |
| **partnership_presentation** | Stakeholder presentations, proposals | High-quality digital, 150 DPI | Medium |
| **digital_marketing** | Email campaigns, social media | Web-optimized, 96 DPI | Small |
| **accessibility_first** | Government docs, education | PDF/UA, WCAG 2.1 AA | Medium |
| **draft_review** | Internal review, quick feedback | Fast preview, 72 DPI | Tiny |
| **archive_preservation** | Long-term storage, legal docs | PDF/A-2, 300 DPI | Large |
| **web_optimized** | Website embedding, online docs | Linearized, 96 DPI | Small |

---

## Common Use Cases

### Use Case 1: TEEI Partnership Document

```python
# High-quality digital presentation for AWS/Google/Cornell
optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership.pdf",
    purpose="partnership_presentation"
)
# → sRGB, 150 DPI, web-optimized, ~5-10 MB
```

### Use Case 2: Print-Ready Brochure

```python
# Commercial printing with bleed and trim marks
result = optimizer.export_document(
    output_path="exports/TEEI_Brochure.pdf",
    purpose="print_production"
)
# → PDF/X-4, CMYK, 300 DPI, 3mm bleed, crop marks
```

### Use Case 3: Quick Draft for Review

```python
# Fast preview for stakeholder feedback
result = optimizer.export_document(
    output_path="exports/TEEI_Draft.pdf",
    purpose="draft_review"
)
# → 72 DPI, auto-opens, ~1-2 MB
```

### Use Case 4: Accessible Educational Document

```python
# WCAG 2.1 AA compliant for students
result = optimizer.export_document(
    output_path="exports/TEEI_Course_Materials.pdf",
    purpose="accessibility_first"
)
# → PDF/UA, tagged, alt text, screen reader friendly
```

---

## Auto-Detection (Smart Mode)

The optimizer can auto-detect purpose from filename:

```python
optimizer = ExportOptimizer()

# Filename contains "PRINT" → uses print_production
optimizer.export_document(
    "exports/TEEI_Brochure_PRINT_READY.pdf",
    document_metadata={"filename": "TEEI_Brochure_PRINT_READY.pdf"}
)

# Filename contains "web" → uses web_optimized
optimizer.export_document(
    "exports/Newsletter_Web_Version.pdf",
    document_metadata={"filename": "Newsletter_Web_Version.pdf"}
)

# Filename contains "partnership" → uses partnership_presentation
optimizer.export_document(
    "exports/TEEI_AWS_Partnership.pdf",
    document_metadata={"filename": "TEEI_AWS_Partnership.pdf"}
)
```

---

## List All Profiles

```bash
# Python
python export_optimizer.py --list-profiles

# JavaScript
node scripts/export-optimizer.js --list-profiles
```

Output:

```
Available Export Profiles:

print_production
  Name: Print Production (PDF/X-4)
  Description: Professional print-ready with bleed and trim marks
  Standard: PDF/X-4:2010
  Resolution: 300 DPI
  Color: ISO Coated v2 (ECI)

partnership_presentation
  Name: Partnership Presentation (High-Quality Digital)
  Description: Premium digital document for stakeholder presentations
  Standard: Standard
  Resolution: 150 DPI
  Color: sRGB IEC61966-2.1

...
```

---

## Get Profile Details

```bash
# Python
python export_optimizer.py --profile-info print_production

# JavaScript
node scripts/export-optimizer.js --profile-info print_production
```

Output:

```
Print Production (PDF/X-4)
Professional print-ready with bleed and trim marks

Best for:
  • Commercial offset printing
  • Professional print shops
  • Magazine/brochure production
  • High-quality marketing materials
```

---

## Batch Export

Export multiple documents at once:

```python
optimizer = ExportOptimizer()

jobs = [
    {
        "output_path": "exports/TEEI_AWS_Presentation.pdf",
        "purpose": "partnership_presentation"
    },
    {
        "output_path": "exports/TEEI_AWS_Print.pdf",
        "purpose": "print_production"
    },
    {
        "output_path": "exports/TEEI_AWS_Web.pdf",
        "purpose": "web_optimized"
    }
]

results = optimizer.export_batch(jobs)

# Summary
successful = sum(1 for r in results if r['success'])
print(f"✓ Exported {successful}/{len(jobs)} documents")
```

---

## Validation Report

Every export includes quality validation:

```python
result = optimizer.export_document(
    "exports/document.pdf",
    purpose="partnership_presentation"
)

# Check validation score
print(f"Quality Score: {result['validation']['score']}/100")

# Review warnings
if result['validation']['warnings']:
    print("\nWarnings:")
    for warning in result['validation']['warnings']:
        print(f"  ⚠ {warning}")

# Check errors
if result['validation']['errors']:
    print("\nErrors:")
    for error in result['validation']['errors']:
        print(f"  ✗ {error}")
```

---

## Integration with Existing Scripts

### Replace Manual Export

```python
# OLD: Manual settings (50+ options to configure)
response = cmd("exportPDF", {
    "outputPath": "document.pdf",
    "preset": "High Quality Print",
    "options": {
        "exportReaderSpreads": False,
        "generateThumbnails": True,
        "optimizePDF": True,
        # ... 40+ more options
    }
})

# NEW: One line, perfect settings
from export_optimizer import ExportOptimizer

optimizer = ExportOptimizer()
result = optimizer.export_document(
    "document.pdf",
    purpose="partnership_presentation"
)
```

---

## Decision Tree

```
┌─────────────────────────────────────┐
│ What will you do with this PDF?    │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
    Print it?          Digital use?
        │                   │
        ▼                   ▼
  print_production   ┌──────────────┐
                     │ Purpose?     │
                     └──────┬───────┘
                            │
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    Presentation?      Website?          Quick review?
         │                  │                  │
         ▼                  ▼                  ▼
partnership_presentation  web_optimized   draft_review
```

---

## File Size Comparison

Same document, different profiles:

| Profile | Resolution | Size | Use Case |
|---------|-----------|------|----------|
| print_production | 300 DPI | 25 MB | Commercial printing |
| partnership_presentation | 150 DPI | 8 MB | Stakeholder presentations |
| digital_marketing | 96 DPI | 3 MB | Email campaigns |
| web_optimized | 96 DPI | 2 MB | Website embedding |
| draft_review | 72 DPI | 1 MB | Internal review |

---

## Troubleshooting

### Issue: "Unknown export purpose"

**Problem:** Invalid purpose specified

**Solution:** Use valid purpose from ExportPurpose enum:

```python
# Valid purposes:
- print_production
- partnership_presentation
- digital_marketing
- accessibility_first
- draft_review
- archive_preservation
- web_optimized
```

### Issue: File too large

**Problem:** Output PDF larger than expected

**Solution:** Use more aggressive compression:

```python
# Instead of partnership_presentation (8 MB)
result = optimizer.export_document(
    "document.pdf",
    purpose="web_optimized"  # → 2 MB
)
```

### Issue: Print shop rejects PDF

**Problem:** PDF/X compliance issues

**Solution:** Always use print_production for commercial printing:

```python
result = optimizer.export_document(
    "document.pdf",
    purpose="print_production"  # Guaranteed PDF/X-4 compliance
)
```

---

## Next Steps

1. **Read Full Guide**: `/docs/EXPORT-OPTIMIZER-GUIDE.md`
2. **Review Examples**: `/example-jobs/export-optimizer-examples.py`
3. **Check PDF/X Compliance**: `/docs/PDFX-COMPLIANCE-GUIDE.md`
4. **Integrate with Orchestrator**: See Integration Guide

---

## Quick Reference Card

```python
from export_optimizer import ExportOptimizer

optimizer = ExportOptimizer()

# Print production (PDF/X-4, CMYK, 300 DPI, bleed)
optimizer.export_document("out.pdf", purpose="print_production")

# Partnership presentation (sRGB, 150 DPI, web-optimized)
optimizer.export_document("out.pdf", purpose="partnership_presentation")

# Web version (sRGB, 96 DPI, linearized, small)
optimizer.export_document("out.pdf", purpose="web_optimized")

# Accessible (PDF/UA, WCAG 2.1 AA, tagged)
optimizer.export_document("out.pdf", purpose="accessibility_first")

# Quick draft (72 DPI, auto-open)
optimizer.export_document("out.pdf", purpose="draft_review")

# Archive (PDF/A-2, 300 DPI, full fonts)
optimizer.export_document("out.pdf", purpose="archive_preservation")

# Marketing (96 DPI, small, email-friendly)
optimizer.export_document("out.pdf", purpose="digital_marketing")
```

---

**Perfect PDFs, Zero Manual Settings**

Export Optimizer v1.0.0 | TEEI PDF Orchestrator
