# Export Optimizer - Complete Guide

**Intelligent PDF export automation for perfect PDFs every time**

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Export Profiles](#export-profiles)
4. [Usage Examples](#usage-examples)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Integration Guide](#integration-guide)
8. [Best Practices](#best-practices)

---

## Overview

The Export Optimizer is an intelligent system that automatically selects optimal PDF export settings based on document purpose. It eliminates manual configuration and ensures consistent, high-quality output every time.

### Key Features

✅ **Smart Purpose Detection** - Auto-detects export purpose from filename and metadata
✅ **7 Pre-Optimized Profiles** - Print, Digital, Web, Accessibility, Archive, Draft, Review
✅ **PDF/X Compliance** - Automatic PDF/X-4, X-3, X-1a configuration
✅ **Color Management** - Intelligent CMYK/sRGB selection
✅ **Resolution Optimization** - 300 DPI print, 150 DPI presentation, 96 DPI web
✅ **File Size Control** - Quality, balanced, or minimal size targets
✅ **Accessibility Support** - PDF/UA compliance with WCAG 2.1 AA
✅ **Validation Built-In** - Quality checks before and after export

### Why Use Export Optimizer?

**Without Export Optimizer:**
- Manual settings selection (50+ options)
- Risk of wrong color profile (RGB in CMYK document)
- Inconsistent quality across exports
- Missing bleed/trim marks for print
- Files too large or too compressed

**With Export Optimizer:**
- One command, perfect settings
- Purpose-driven automation
- Consistent world-class quality
- Print-ready PDFs with proper marks
- Optimized file sizes

---

## Quick Start

### Python Usage

```python
from export_optimizer import ExportOptimizer, ExportPurpose

# Initialize optimizer
optimizer = ExportOptimizer()

# Export for partnership presentation (auto-optimized)
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership.pdf",
    purpose=ExportPurpose.PARTNERSHIP_PRESENTATION.value
)

print(f"Success: {result['success']}")
print(f"File size: {result['file_size_mb']} MB")
```

### JavaScript Usage

```javascript
const { ExportOptimizer, ExportPurpose } = require('./scripts/export-optimizer');

// Initialize optimizer
const optimizer = new ExportOptimizer();

// Export for partnership presentation
const result = await optimizer.exportDocument({
  outputPath: 'exports/TEEI_AWS_Partnership.pdf',
  purpose: ExportPurpose.PARTNERSHIP_PRESENTATION
});

console.log(`Success: ${result.success}`);
console.log(`File size: ${result.fileSizeMB} MB`);
```

### CLI Usage

```bash
# Python CLI
python export_optimizer.py exports/document.pdf --purpose partnership_presentation

# JavaScript CLI
node scripts/export-optimizer.js exports/document.pdf --purpose partnership_presentation

# List available profiles
python export_optimizer.py --list-profiles
node scripts/export-optimizer.js --list-profiles

# Get profile information
python export_optimizer.py --profile-info print_production
node scripts/export-optimizer.js --profile-info print_production
```

---

## Export Profiles

The Export Optimizer includes 7 pre-configured profiles optimized for different use cases:

### 1. Print Production (PDF/X-4)

**Best for:** Professional printing, commercial offset, magazines, brochures

```
Standard: PDF/X-4:2010
Color: CMYK (ISO Coated v2)
Resolution: 300 DPI
Bleed: 3mm all sides
Marks: Crop, bleed, registration, color bars
File Size: Quality priority
```

**Perfect for:**
- Commercial printing
- Magazine/brochure production
- High-quality marketing materials
- Professional print shops

### 2. Partnership Presentation (High-Quality Digital)

**Best for:** Stakeholder presentations, partnership proposals, executive briefings

```
Standard: Standard PDF
Color: sRGB
Resolution: 150 DPI
Optimization: Web-optimized, tagged PDF
File Size: Balanced (quality vs size)
```

**Perfect for:**
- AWS/Google/Cornell partnership docs
- Executive presentations
- Client deliverables
- Digital proposals

### 3. Digital Marketing (Web-Optimized)

**Best for:** Email campaigns, social media, website downloads

```
Standard: Standard PDF
Color: sRGB
Resolution: 96 DPI
Optimization: Fast web view, linearized
File Size: Minimal
```

**Perfect for:**
- Email attachments
- Social media shares
- Website download links
- Quick promotional materials

### 4. Accessibility-First (PDF/UA)

**Best for:** Government documents, educational materials, public-facing content

```
Standard: PDF/UA-1 (WCAG 2.1 AA)
Color: sRGB
Resolution: 150 DPI
Accessibility: Tagged, alt text, reading order
File Size: Balanced
```

**Perfect for:**
- Section 508 compliance (US gov)
- Educational materials (TEEI docs)
- Public-facing documents
- Inclusive design requirements

### 5. Draft Review (Fast Preview)

**Best for:** Internal review cycles, quick feedback, work-in-progress

```
Standard: Standard PDF
Color: No conversion (fastest)
Resolution: 72 DPI
Optimization: Auto-open after export
File Size: Minimal (speed priority)
```

**Perfect for:**
- Internal team review
- Quick stakeholder feedback
- Iteration cycles
- WIP sharing

### 6. Archive Preservation (PDF/A-2)

**Best for:** Long-term storage, legal documents, historical records

```
Standard: PDF/A-2b
Color: sRGB
Resolution: 300 DPI
Fonts: Full embedding (100%)
File Size: Quality priority
```

**Perfect for:**
- Long-term archives
- Legal compliance
- Historical records
- Document preservation

### 7. Web-Optimized (Linearized)

**Best for:** Website embedding, online documentation, mobile viewing

```
Standard: Standard PDF
Color: sRGB
Resolution: 96 DPI
Optimization: Linearized (page-at-a-time)
File Size: Minimal
```

**Perfect for:**
- Website embedding
- Online documentation
- Fast page-at-a-time loading
- Mobile-friendly viewing

---

## Usage Examples

### Example 1: Export TEEI Partnership Document

```python
from export_optimizer import ExportOptimizer

optimizer = ExportOptimizer()

# Export high-quality presentation for AWS
result = optimizer.export_document(
    output_path="exports/TEEI_AWS_Partnership_v2.pdf",
    purpose="partnership_presentation"
)

# Validation report
if result['validation']:
    print(f"Quality score: {result['validation']['score']}/100")
    print(f"Warnings: {len(result['validation']['warnings'])}")
```

### Example 2: Auto-Detect Purpose from Filename

```python
optimizer = ExportOptimizer()

# Optimizer will detect "print" in filename and use print_production profile
result = optimizer.export_document(
    output_path="exports/TEEI_Brochure_PRINT_READY.pdf",
    document_metadata={
        "filename": "TEEI_Brochure_PRINT_READY.pdf"
    }
)
# Uses: print_production (PDF/X-4, CMYK, 300 DPI, bleed)
```

### Example 3: Batch Export Multiple Documents

```python
optimizer = ExportOptimizer()

jobs = [
    {
        "output_path": "exports/TEEI_AWS_Presentation.pdf",
        "purpose": "partnership_presentation"
    },
    {
        "output_path": "exports/TEEI_AWS_Print_Version.pdf",
        "purpose": "print_production"
    },
    {
        "output_path": "exports/TEEI_AWS_Web_Version.pdf",
        "purpose": "web_optimized"
    }
]

results = optimizer.export_batch(jobs)

# Summary
successful = sum(1 for r in results if r['success'])
print(f"Exported {successful}/{len(jobs)} documents")
```

### Example 4: Custom Settings Override

```python
optimizer = ExportOptimizer()

# Start with partnership_presentation, but customize resolution
settings = optimizer.optimize_for_purpose("partnership_presentation")
settings['resolution'] = 200  # Higher than default 150 DPI

result = optimizer.export_document(
    output_path="exports/TEEI_AWS_HighRes.pdf",
    settings=settings
)
```

### Example 5: Integration with InDesign MCP

```python
from export_optimizer import ExportOptimizer
# Your MCP client code here

optimizer = ExportOptimizer()

# Export via InDesign with MCP
result = optimizer.export_document(
    output_path="exports/TEEI_Document.pdf",
    purpose="print_production"
)

# The optimizer will automatically:
# 1. Detect InDesign is running
# 2. Send optimized export command via MCP
# 3. Validate the output PDF
# 4. Return result with validation report
```

### Example 6: JavaScript Integration

```javascript
const { ExportOptimizer, ExportPurpose } = require('./scripts/export-optimizer');

const optimizer = new ExportOptimizer();

// Export with auto-detection
const result = await optimizer.exportDocument({
  outputPath: 'exports/document.pdf',
  documentMetadata: {
    filename: 'TEEI_AWS_Partnership_Presentation.pdf',
    tags: ['presentation', 'aws'],
    keywords: ['partnership', 'education']
  }
});

// Optimizer detects "partnership" and "presentation" → uses partnership_presentation profile
console.log(`Used profile: ${result.settings.name}`);
```

---

## Configuration

### Custom Configuration File

Create `config/export-optimizer-config.json`:

```json
{
  "mcp_server": {
    "application": "indesign",
    "proxy_url": "http://localhost:8013",
    "timeout": 60
  },
  "output_directory": "exports",
  "validation_enabled": true,
  "auto_backup": true,
  "file_naming_convention": "{name}_{purpose}_{timestamp}.pdf",
  "custom_profiles": {
    "teei_standard": {
      "name": "TEEI Standard Export",
      "description": "Standard TEEI brand-compliant export",
      "pdf_standard": "Standard",
      "color_profile": "sRGB IEC61966-2.1",
      "resolution": 150,
      "fonts": {
        "embed_all": true
      }
    }
  }
}
```

Load custom configuration:

```python
optimizer = ExportOptimizer(config_path="config/export-optimizer-config.json")
```

### Environment Variables

Create `config/.env`:

```bash
# Export Optimizer Configuration
EXPORT_OPTIMIZER_OUTPUT_DIR=exports
EXPORT_OPTIMIZER_VALIDATION_ENABLED=true
EXPORT_OPTIMIZER_AUTO_BACKUP=true

# MCP Server
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=8013
MCP_TIMEOUT=60
```

---

## API Reference

### ExportOptimizer Class

#### Constructor

```python
optimizer = ExportOptimizer(config_path=None)
```

**Parameters:**
- `config_path` (str, optional): Path to custom configuration JSON

#### Methods

##### `export_document(output_path, purpose=None, settings=None, document_metadata=None)`

Export a document with optimized settings.

**Parameters:**
- `output_path` (str): Output PDF file path
- `purpose` (str, optional): Export purpose (auto-detected if not provided)
- `settings` (dict, optional): Pre-computed settings
- `document_metadata` (dict, optional): Metadata for auto-detection

**Returns:**
- `dict`: Export result with validation report

```python
{
  "success": True,
  "output_path": "exports/document.pdf",
  "settings": {...},
  "file_size": 2048576,
  "file_size_mb": 2.0,
  "validation": {
    "score": 95,
    "checks": [...],
    "warnings": [...],
    "errors": []
  }
}
```

##### `optimize_for_purpose(purpose, overrides=None)`

Get optimized export settings for a specific purpose.

**Parameters:**
- `purpose` (str): Export purpose
- `overrides` (dict, optional): Settings to override

**Returns:**
- `dict`: Complete export settings

##### `detect_purpose(document_metadata=None)`

Intelligently detect document purpose from metadata.

**Parameters:**
- `document_metadata` (dict, optional): Document information

**Returns:**
- `str`: Detected export purpose

##### `export_batch(jobs)`

Export multiple documents with optimized settings.

**Parameters:**
- `jobs` (list): List of export jobs

**Returns:**
- `list`: List of export results

##### `list_profiles()`

List all available export profiles.

**Returns:**
- `list`: Profile information

##### `get_profile_info(purpose)`

Get information about a specific export profile.

**Parameters:**
- `purpose` (str): Export purpose

**Returns:**
- `dict`: Profile information

---

## Integration Guide

### Integrate with Orchestrator

Add to `orchestrator.js`:

```javascript
const { ExportOptimizer } = require('./scripts/export-optimizer');

class PDFOrchestrator {
  constructor() {
    // ... existing code ...
    this.exportOptimizer = new ExportOptimizer();
  }

  async executeJob(job) {
    // ... existing code ...

    // Use export optimizer for output
    const result = await this.exportOptimizer.exportDocument({
      outputPath: job.output.path,
      purpose: job.output.purpose || 'partnership_presentation',
      documentMetadata: job.metadata
    });

    return result;
  }
}
```

### Integrate with Python Scripts

Update existing export scripts:

```python
# OLD: Manual export
response = cmd("exportPDF", {
    "outputPath": pdf_path,
    "preset": "High Quality Print"
})

# NEW: Smart export with optimizer
from export_optimizer import ExportOptimizer

optimizer = ExportOptimizer()
result = optimizer.export_document(
    output_path=pdf_path,
    purpose="partnership_presentation"
)
```

### Integrate with Job Schema

Update `schemas/report-schema.json`:

```json
{
  "output": {
    "type": "object",
    "properties": {
      "path": { "type": "string" },
      "purpose": {
        "type": "string",
        "enum": [
          "print_production",
          "partnership_presentation",
          "digital_marketing",
          "accessibility_first",
          "draft_review",
          "archive_preservation",
          "web_optimized"
        ]
      }
    }
  }
}
```

---

## Best Practices

### 1. Use Purpose-Driven Exports

Always specify the export purpose for optimal settings:

```python
# ✅ Good - Explicit purpose
optimizer.export_document("doc.pdf", purpose="print_production")

# ⚠️ OK - Auto-detection (but less predictable)
optimizer.export_document("doc.pdf")
```

### 2. Validate Output Quality

Always enable validation to catch issues:

```python
optimizer = ExportOptimizer()
optimizer.config['validation_enabled'] = True  # Default

result = optimizer.export_document("doc.pdf", purpose="print_production")

# Check validation score
if result['validation']['score'] < 90:
    print("Warning: Quality issues detected")
    for warning in result['validation']['warnings']:
        print(f"  - {warning}")
```

### 3. Use Descriptive Filenames

Help auto-detection with descriptive filenames:

```python
# ✅ Good - Purpose clear from filename
"TEEI_AWS_Partnership_Presentation.pdf"  # → partnership_presentation
"TEEI_Brochure_PRINT_READY.pdf"          # → print_production
"Newsletter_Web_Version.pdf"              # → web_optimized

# ❌ Bad - Generic filename
"document.pdf"  # → Falls back to default
```

### 4. Batch Similar Documents

Use batch export for multiple documents:

```python
# ✅ Efficient - Batch export
jobs = [
    {"output_path": f"exports/doc{i}.pdf", "purpose": "web_optimized"}
    for i in range(10)
]
optimizer.export_batch(jobs)

# ❌ Slow - Individual exports in loop
for i in range(10):
    optimizer.export_document(f"exports/doc{i}.pdf", purpose="web_optimized")
```

### 5. Test Multiple Profiles

For critical documents, export multiple versions:

```python
purposes = ["print_production", "partnership_presentation", "web_optimized"]

for purpose in purposes:
    result = optimizer.export_document(
        output_path=f"exports/TEEI_AWS_{purpose}.pdf",
        purpose=purpose
    )
    print(f"{purpose}: {result['file_size_mb']} MB")

# Compare and choose best version for each distribution channel
```

### 6. Monitor File Sizes

Track file sizes to optimize storage:

```python
result = optimizer.export_document("doc.pdf", purpose="web_optimized")

if result['file_size_mb'] > 5:
    print("Warning: Web PDF larger than 5 MB, consider compression")
```

### 7. Document Your Export Strategy

Create a table of export purposes for your project:

| Document Type | Export Purpose | Why |
|--------------|---------------|-----|
| TEEI AWS Partnership | `partnership_presentation` | Stakeholder presentations, balanced quality/size |
| TEEI Brochure | `print_production` | Commercial printing with bleed |
| Newsletter | `web_optimized` | Fast web loading |
| Annual Report | `archive_preservation` | Long-term storage |

---

## Troubleshooting

### Issue: Wrong Purpose Detected

**Problem:** Auto-detection selects wrong profile

**Solution:** Explicitly specify purpose:

```python
# Instead of auto-detection
result = optimizer.export_document("doc.pdf", purpose="print_production")
```

### Issue: File Size Too Large

**Problem:** Output PDF larger than expected

**Solution:** Use more aggressive profile:

```python
# Use web_optimized or digital_marketing for smaller files
result = optimizer.export_document("doc.pdf", purpose="web_optimized")
```

### Issue: Print Shop Rejects PDF

**Problem:** PDF/X compliance issue

**Solution:** Use print_production profile and validate:

```python
result = optimizer.export_document("doc.pdf", purpose="print_production")

# Check validation
if result['validation']['errors']:
    print("PDF/X issues detected:")
    for error in result['validation']['errors']:
        print(f"  - {error}")
```

### Issue: MCP Connection Failed

**Problem:** Cannot connect to InDesign

**Solution:** Check MCP server configuration:

```python
# Verify MCP server is running
optimizer = ExportOptimizer()
print(optimizer.config['mcp_server'])

# Test connection
# Run: python test_connection.py
```

---

## Version History

- **v1.0.0** (2025-11-08) - Initial release
  - 7 pre-optimized export profiles
  - Smart purpose detection
  - PDF/X compliance
  - Accessibility support
  - Validation system

---

## Support

- **Documentation**: `/docs/EXPORT-OPTIMIZER-GUIDE.md`
- **Examples**: `/example-jobs/export-optimizer-examples.py`
- **Issues**: Report via project repository

---

**Last Updated:** 2025-11-08
**Version:** 1.0.0
**Author:** PDF Orchestrator Team
