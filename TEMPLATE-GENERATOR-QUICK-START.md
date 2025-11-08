# Template Generator - Quick Start (5 Minutes)

## What Is This?

The Template Generator creates professional InDesign templates programmatically. No more manual template building—just specify what you want and get world-class, brand-compliant templates instantly.

---

## Quick Examples

### Example 1: Generate Partnership Brochure (30 seconds)

```bash
node template-generator.js generate partnershipBrochure
```

**Output:**
```
[TemplateGenerator] Generating template: partnershipBrochure
[TemplateGenerator] Template spec saved: ./templates/generated/partnershipBrochure-1699564800.json
[TemplateGenerator] InDesign script saved: ./templates/generated/partnershipBrochure-1699564800.jsx
[TemplateGenerator] MCP payload saved: ./templates/generated/partnershipBrochure-1699564800-mcp.json

Generation complete:
  Spec: ./templates/generated/partnershipBrochure-1699564800.json
  Script: ./templates/generated/partnershipBrochure-1699564800.jsx
  MCP: ./templates/generated/partnershipBrochure-1699564800-mcp.json
```

**What You Get:**
- 8-page partnership brochure template
- TEEI brand colors (Nordshore, Sky, Gold, etc.)
- Lora + Roboto Flex typography
- Professional layout patterns (cover hero, stats grid, CTA)
- Ready to use in InDesign

---

### Example 2: Generate Annual Report (30 seconds)

```bash
node template-generator.js generate annualReport teei-annual-2025
```

**What You Get:**
- 12-page annual report template
- Executive letter, stats, infographics, timeline
- CMYK-ready for print
- Complete component library

---

### Example 3: List Available Templates (5 seconds)

```bash
node template-generator.js list
```

**Output:**
```
Available Document Types:
  partnershipBrochure: Partnership Brochure (8 pages)
  programOverview: Program Overview (4 pages)
  annualReport: Annual Report (12 pages)

Available Layout Patterns:
  coverHero: Cover Page (Hero Design) [high]
  twoColumnSplit: Two-Column Split (Text + Image) [medium]
  statsModular: Stats/Metrics Page (Modular Grid) [high]
  ctaPage: Call-to-Action Page [low]

Available Components:
  pullQuote: Pull Quote
  statCard: Statistic Card
  sectionHeader: Section Header
  imageFrame: Image Frame
  footer: Running Footer
```

---

## Using Generated Templates

### Option 1: InDesign Script (Immediate Use)

```bash
# 1. Generate template
node template-generator.js generate partnershipBrochure my-template

# 2. Open InDesign

# 3. File → Scripts → Other Script...

# 4. Select: templates/generated/my-template.jsx

# 5. Template created in InDesign!
```

### Option 2: With PDF Orchestrator

```bash
# 1. Generate template
node template-generator.js generate partnershipBrochure aws-partnership

# 2. Create job file
cat > example-jobs/my-job.json << 'EOF'
{
  "jobType": "document",
  "templateId": "aws-partnership",
  "data": {
    "title": "TEEI AWS Partnership",
    "metrics": {
      "studentsReached": 15000
    }
  }
}
EOF

# 3. Run orchestrator
node orchestrator.js example-jobs/my-job.json
```

---

## Python Version (Alternative)

### Generate Template with Python

```bash
# List templates
python template_builder.py list

# Generate partnership brochure
python template_builder.py generate partnershipBrochure

# Generate with custom name
python template_builder.py generate annualReport --output my-annual-report

# Generate for print (CMYK)
python template_builder.py generate partnershipBrochure --cmyk
```

---

## What's Inside a Template?

### Template Specification (JSON)
```json
{
  "metadata": {
    "name": "Partnership Brochure",
    "documentType": "partnershipBrochure",
    "brand": "TEEI"
  },
  "document": {
    "size": { "width": 8.5, "height": 11 },
    "margins": { "top": 40, "bottom": 40, "left": 40, "right": 40 },
    "pageCount": 8
  },
  "pages": [
    {
      "pageNumber": 1,
      "pattern": "coverHero",
      "grid": "hierarchical",
      "visualDensity": "high"
    }
  ],
  "styles": { ... },
  "colors": [ ... ],
  "components": { ... }
}
```

### InDesign Script (.jsx)
Auto-generated ExtendScript that creates the template in InDesign with:
- Exact page sizes and margins
- Brand color swatches
- Paragraph styles
- Master pages
- Baseline grid

### MCP Payload (JSON)
Commands for real-time InDesign automation via MCP server.

---

## Common Use Cases

### Use Case 1: New Partnership Document
```bash
# Generate template
node template-generator.js generate partnershipBrochure google-partnership

# Edit template in InDesign
# Add content
# Export PDF
```

### Use Case 2: Batch Generate for Multiple Programs
```bash
# Generate templates for each program
node template-generator.js generate programOverview ukraine-program
node template-generator.js generate programOverview literacy-program
node template-generator.js generate programOverview teacher-program
```

### Use Case 3: Annual Report Production
```bash
# Generate CMYK template for print
node template-generator.js generate annualReport teei-annual-2025

# Review spec: templates/generated/teei-annual-2025.json
# Run script in InDesign: templates/generated/teei-annual-2025.jsx
# Populate with content
# Export for print (PDF/X-4, CMYK)
```

---

## Customization

### Generate with Custom Page Count
```javascript
// custom-generate.js
const TemplateGenerator = require('./template-generator');

const generator = new TemplateGenerator();

await generator.generateTemplate('partnershipBrochure', {
  filename: 'extended-partnership',
  customization: {
    document: {
      pageCount: 10 // Instead of default 8
    }
  }
});
```

### Generate for Print (CMYK)
```javascript
await generator.generateTemplate('annualReport', {
  filename: 'annual-report-print',
  customization: {
    colorMode: 'CMYK' // Instead of default RGB
  }
});
```

---

## Template Types Reference

### Partnership Brochure (8 pages)
**Best For**: Partner collaboration documents, program partnerships
**Pages**: Cover → Vision → Programs → Stats → Technology → Story → Benefits → CTA
**Time to Generate**: 1 second

### Program Overview (4 pages)
**Best For**: Single program summaries, quick overviews
**Pages**: Cover → Overview → Stats → CTA
**Time to Generate**: 1 second

### Annual Report (12 pages)
**Best For**: Comprehensive annual reports, impact reports
**Pages**: Cover → Letter → Programs → Stats → Content → Visuals → Timeline → CTA
**Time to Generate**: 1 second

---

## Troubleshooting

### "Unknown document type"
**Solution**: Run `node template-generator.js list` to see available types.

### InDesign script fails
**Solution**:
```bash
# 1. Install TEEI fonts
powershell -ExecutionPolicy Bypass -File scripts/install-fonts.ps1

# 2. Restart InDesign

# 3. Try again
```

### Generated files not found
**Solution**: Check `templates/generated/` directory. Files are saved there.

### Want to modify templates?
**Solution**: Edit generated `.json` spec, then regenerate `.jsx` script:
```javascript
const spec = require('./templates/generated/my-template.json');
// Modify spec...
const script = generator.generateInDesignScript(spec);
// Save updated script
```

---

## Next Steps

1. **Try it now**: `node template-generator.js generate partnershipBrochure`
2. **Review output**: Check `templates/generated/` folder
3. **Test in InDesign**: Run the `.jsx` script
4. **Read full docs**: See `TEMPLATE-GENERATOR-README.md`
5. **Integrate**: See `TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md`

---

## Questions?

**What templates can I generate?**
Run: `node template-generator.js list`

**How do I use generated templates?**
See: `TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md`

**Can I create custom templates?**
Yes! See: `TEMPLATE-GENERATOR-README.md` → "Customization Options"

**Python or JavaScript?**
Both work! Use `node template-generator.js` or `python template_builder.py`

---

**That's it! You're ready to generate world-class templates in seconds.**

---

**Quick Command Reference:**
```bash
# JavaScript
node template-generator.js list
node template-generator.js generate <type> [name]

# Python
python template_builder.py list
python template_builder.py generate <type> --output <name>
```

---

**Last Updated**: 2025-11-08
