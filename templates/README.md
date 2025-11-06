# Adobe Templates Directory

This folder contains references to Adobe InDesign (.indt) and Illustrator (.ait) templates used for PDF generation.

## Structure

Templates are organized by type:

```
/templates/
  /reports/
    - annual-report.indt
    - monthly-summary.indt
  /campaigns/
    - flyer-template.ait
    - brochure-template.indt
    - social-media-post.ait
```

## Template Registry

Maintain a `template-registry.json` file that maps template IDs to file paths:

```json
{
  "report-annual-v1": {
    "file": "./reports/annual-report.indt",
    "application": "indesign",
    "version": "1.0",
    "description": "Standard annual report template"
  },
  "campaign-flyer-v2": {
    "file": "./campaigns/flyer-template.ait",
    "application": "illustrator",
    "version": "2.0",
    "description": "Marketing flyer template with variable data"
  }
}
```

## Template Requirements

### For MCP Worker (Human Sessions)
- Templates must be accessible on local filesystem
- InDesign/Illustrator must be installed and licensed
- Templates should use text variables or data merge fields

### For PDF Services Worker (Serverless)
- Templates must be uploaded to Adobe Cloud
- Reference by Cloud asset ID
- Use Adobe's template format requirements

## Adding New Templates

1. Create template in InDesign/Illustrator
2. Save as `.indt` or `.ait` format
3. Place in appropriate subfolder
4. Update `template-registry.json`
5. Test with orchestrator using sample data
