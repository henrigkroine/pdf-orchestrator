# World-Class PDF Creation CLI

**Single command to create A+ quality TEEI PDFs** with all design systems applied automatically.

---

## Quick Start

### Node.js Version

```bash
# Partnership document (AWS, Google, etc.)
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json

# Program report (Together for Ukraine, etc.)
npm run create-world-class -- --type program --data data/program-together-ukraine-example.json

# Annual report
npm run create-world-class -- --type report --data data/report-annual-example.json
```

### Python Version

```bash
# Partnership document
python world_class_cli.py --type partnership --data data/partnership-aws-example.json

# Program report
python world_class_cli.py --type program --data data/program-together-ukraine-example.json --verbose

# Annual report
python world_class_cli.py --type report --data data/report-annual-example.json
```

---

## Features

### Automatic Design Systems

The CLI automatically applies **ALL** world-class design systems:

#### 1. **Intelligent Layout Algorithm**
- 12-column responsive grid
- 40pt margins, 60pt section breaks
- Perfect content density
- Visual hierarchy optimization

#### 2. **Typography Automation**
- **Headlines**: Lora (Bold/SemiBold)
- **Body Text**: Roboto Flex (Regular/Medium)
- Proper font sizing: 42pt → 28pt → 18pt → 11pt
- 1.5x line height for readability

#### 3. **Color Harmony System**
- **7 Official TEEI Colors**:
  - Nordshore `#00393F` (Primary)
  - Sky `#C9E4EC` (Accent)
  - Sand `#FFF1E2` (Background)
  - Beige `#EFE1DC` (Neutral)
  - Moss `#65873B` (Natural)
  - Gold `#BA8F5A` (Premium)
  - Clay `#913B2F` (Warm)
- **Color Balance**: 80% primary, 15% accent, 5% highlights
- **NO copper/orange** (brand violation)

#### 4. **Image Placement Intelligence**
- Hero image placement
- Image overlays (Nordshore @ 60% opacity)
- Proper clearspace around logos
- High-resolution exports (300 DPI print, 150 DPI digital)

#### 5. **Brand Compliance Enforcement**
- TEEI brand guidelines validation
- Logo clearspace enforcement
- Color palette compliance
- Typography standards
- Photography requirements

#### 6. **Template Generation**
- Auto-selects template based on document type
- Populates with your JSON data
- Smart content flow
- Responsive layouts

#### 7. **Export Optimization**
- High-quality PDF export
- Proper bleed/trim marks (print)
- Web optimization (digital)
- File size optimization

#### 8. **Automatic Validation**
- Page dimension checks
- Text cutoff detection
- Image loading verification
- Color validation
- Font validation
- Brand compliance audit

---

## Document Types

### 1. Partnership Documents

**Perfect for**: AWS, Google, Cornell partnerships, executive proposals

**Design**: Premium, executive-grade, 3 pages

**Sections**:
- Hero header with partner logos
- Partnership overview
- Program details
- Impact metrics
- Call to action

**Example**:
```bash
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json
```

### 2. Program Reports

**Perfect for**: Together for Ukraine, program impact reports

**Design**: Narrative-driven, storytelling, 4 pages

**Sections**:
- Program header
- Executive summary
- Impact stories
- Data visualization
- Future goals

**Example**:
```bash
python world_class_cli.py --type program --data data/program-together-ukraine-example.json
```

### 3. Annual Reports

**Perfect for**: Annual reports, quarterly reports, board presentations

**Design**: Professional, data-rich, 5 pages

**Sections**:
- Cover page
- Executive summary
- Financial overview
- Achievements
- Future outlook

**Example**:
```bash
npm run create-world-class -- --type report --data data/report-annual-example.json
```

---

## Data File Format

### Required Fields (All Types)

```json
{
  "title": "Document Title",
  "organization": "The Educational Equality Institute"
}
```

### Partnership Document

```json
{
  "title": "AWS Partnership Proposal",
  "subtitle": "Empowering Ukrainian Students Through Technology",
  "organization": "The Educational Equality Institute",
  "partner": "Amazon Web Services",
  "overview": {
    "mission": "...",
    "value_proposition": "...",
    "impact": "..."
  },
  "programs": [
    {
      "name": "Cloud Computing Curriculum",
      "description": "...",
      "students_reached": 15000,
      "success_rate": "92%"
    }
  ],
  "metrics": {
    "students_reached": 50000,
    "countries": 12,
    "partner_organizations": 45
  },
  "call_to_action": {
    "headline": "Ready to Transform Education Together?",
    "description": "...",
    "action": "Schedule a Partnership Discussion",
    "contact": {
      "name": "Henrik Røine",
      "email": "hello@teei.global"
    }
  }
}
```

### Program Report

```json
{
  "title": "Together for Ukraine",
  "subtitle": "2024 Impact Report",
  "organization": "The Educational Equality Institute",
  "program_name": "Together for Ukraine",
  "summary": {
    "mission": "...",
    "duration": "March 2022 - Present",
    "scope": "..."
  },
  "impact": {
    "students_reached": 50000,
    "countries_active": 12,
    "learning_hours_delivered": 2500000
  },
  "stories": [
    {
      "name": "Olena, Age 17",
      "location": "Warsaw, Poland",
      "story": "...",
      "quote": "..."
    }
  ],
  "programs": [
    {
      "name": "Tech Skills Training",
      "students": 25000,
      "completion_rate": "89%"
    }
  ]
}
```

### Annual Report

```json
{
  "title": "2024 Annual Report",
  "subtitle": "Building Educational Equality Through Innovation",
  "organization": "The Educational Equality Institute",
  "fiscal_year": "2024",
  "executive_summary": {
    "overview": "...",
    "highlights": [...]
  },
  "financials": {
    "revenue": { "total": 12500000 },
    "expenses": { "total": 11000000 },
    "program_efficiency": "80%"
  },
  "achievements": {
    "programs": [...],
    "partnerships": [...],
    "impact_metrics": {...}
  },
  "future": {
    "goals_2025": [...],
    "fundraising_target": 20000000
  }
}
```

See `/data/` directory for complete examples.

---

## CLI Options

### Node.js

```bash
node create-world-class-pdf.js [options]

Options:
  -t, --type <type>        Document type (partnership|program|report) [required]
  -d, --data <path>        Path to JSON data file
  -o, --output <path>      Output directory (default: "exports/")
  -v, --verbose            Verbose output
  --skip-validation        Skip PDF validation step
  -h, --help               Display help
```

### Python

```bash
python world_class_cli.py [options]

Options:
  -t, --type <type>        Document type (partnership|program|report) [required]
  -d, --data <path>        Path to JSON data file
  -o, --output <path>      Output directory (default: "exports/")
  -v, --verbose            Verbose output
  --skip-validation        Skip PDF validation step
  -h, --help               Display help
```

---

## Output

### Generated Files

```
exports/
├── TEEI_Partnership_AWS_v1_20251108.pdf        # Final world-class PDF
├── creation-report-1699999999.json             # Creation metadata
└── validation-issues/                          # Validation reports (if issues found)
    ├── validation-report-20251108.json
    ├── validation-report-20251108.txt
    └── screenshots/                            # Issue screenshots
```

### Creation Report

```json
{
  "timestamp": "2025-11-08T10:30:00.000Z",
  "document_type": "partnership",
  "document_name": "Partnership Document",
  "data": {
    "title": "AWS Partnership Proposal",
    "organization": "The Educational Equality Institute"
  },
  "design_systems": {
    "typography": "Lora + Roboto Flex",
    "colors": "nordshore, sky, sand, beige, moss, gold, clay",
    "layout": "executive"
  },
  "validation": {
    "passed": true
  },
  "output": {
    "path": "exports/TEEI_Partnership_AWS_v1_20251108.pdf",
    "size": "2.45 MB"
  },
  "quality": "A+"
}
```

---

## Quality Guarantee

### What "A+" Means

✅ **All brand guidelines followed exactly**
✅ **No text cutoffs anywhere**
✅ **Actual metrics visible (no "XX" placeholders)**
✅ **Professional layout with clear hierarchy**
✅ **Passes 100%/150%/200% zoom test**
✅ **Export quality: 300 DPI (print), 150 DPI (digital)**

### Validation Checks

The CLI automatically runs **5 comprehensive checks**:

1. **Page Dimensions** - Validates exact 8.5×11 inch Letter size
2. **Text Cutoffs** - Detects text extending beyond page boundaries
3. **Image Loading** - Verifies all images loaded successfully
4. **Color Validation** - Checks TEEI brand colors (7 official + NO copper/orange)
5. **Font Validation** - Ensures Lora (headlines) and Roboto Flex (body text) usage

---

## Workflow

### Standard Workflow

```bash
# 1. Create your data file
vim data/my-partnership.json

# 2. Run CLI (creates + validates automatically)
npm run create-world-class -- --type partnership --data data/my-partnership.json

# 3. Review output
open exports/TEEI_Partnership_MyPartner_v1.pdf

# 4. Check validation report (if issues found)
cat exports/validation-issues/validation-report-*.txt
```

### Rapid Iteration

```bash
# Quick test without validation
python world_class_cli.py --type program --data data/test.json --skip-validation

# Verbose output for debugging
npm run create-world-class -- --type partnership --data data/aws.json --verbose

# Custom output directory
python world_class_cli.py --type report --data data/annual.json --output deliverables/
```

---

## Integration with Existing Systems

### Orchestrator Integration

The world-class CLI works seamlessly with the existing orchestrator:

```javascript
// Use via orchestrator
const orchestrator = new PDFOrchestrator();
const job = require('./data/partnership-aws-example.json');

await orchestrator.executeJob({
  jobType: 'partnership',
  data: job,
  output: { format: 'pdf', quality: 'high' }
});
```

### MCP Worker Integration

Behind the scenes, the CLI uses:
- **MCP Worker** for InDesign automation (local)
- **Python Scripts** for document creation
- **Node.js Scripts** for validation

### Design System Scripts

The CLI orchestrates these existing scripts:

- `apply-typography.js` - Typography system
- `audit-brand-compliance.js` - Brand compliance
- `optimize-layout.js` - Layout optimization
- `optimize-whitespace.js` - Whitespace balance
- `validate-pdf-quality.js` - Quality validation
- `compare-pdf-visual.js` - Visual regression (optional)

---

## Troubleshooting

### MCP Connection Issues

**Problem**: "Cannot connect to MCP server"

**Solution**:
```bash
# 1. Verify InDesign is running
# 2. Check MCP server
python test_connection.py

# 3. Restart InDesign and retry
npm run create-world-class -- --type partnership --data data/aws.json
```

### Font Issues

**Problem**: "Lora or Roboto Flex not found"

**Solution**:
```powershell
# Install TEEI brand fonts (Windows)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# Then restart InDesign
```

### Validation Failures

**Problem**: Validation finds issues

**Solution**:
```bash
# 1. Check validation report
cat exports/validation-issues/validation-report-*.txt

# 2. View screenshots
open exports/validation-issues/screenshots/

# 3. Fix issues and re-run
npm run create-world-class -- --type partnership --data data/aws.json
```

### Data File Errors

**Problem**: "Missing required fields"

**Solution**:
```bash
# Check your JSON file has required fields
cat data/my-file.json | jq '.title, .organization'

# Use example as template
cp data/partnership-aws-example.json data/my-file.json
vim data/my-file.json
```

---

## Advanced Usage

### Custom Templates

Create custom templates by modifying document type definitions:

```javascript
// In create-world-class-pdf.js
const DOCUMENT_TYPES = {
  custom_executive: {
    name: 'Custom Executive Report',
    template: 'custom-template',
    pages: 6,
    sections: ['custom-header', 'custom-body'],
    designSystem: 'ultra-premium'
  }
};
```

### Batch Processing

Process multiple documents:

```bash
#!/bin/bash
# batch-create.sh

for file in data/*.json; do
  echo "Processing $file..."
  npm run create-world-class -- --type partnership --data "$file"
done
```

### CI/CD Integration

```yaml
# .github/workflows/pdf-generation.yml
name: Generate PDFs

on:
  push:
    paths:
      - 'data/**/*.json'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Generate PDF
        run: |
          npm run create-world-class -- \
            --type partnership \
            --data data/aws-partnership.json

      - name: Upload PDF
        uses: actions/upload-artifact@v3
        with:
          name: generated-pdf
          path: exports/*.pdf
```

---

## Architecture

### System Flow

```
┌─────────────┐
│ CLI Input   │ --type partnership --data data.json
└──────┬──────┘
       │
       v
┌─────────────────────────────────────────┐
│ World-Class PDF Creator                 │
│                                         │
│ 1. Load & Validate Data                │
│ 2. Apply Design Systems                │
│    - Typography (Lora + Roboto)       │
│    - Colors (7 TEEI colors)           │
│    - Layout (12-column grid)          │
│    - Whitespace (40pt/60pt)           │
│ 3. Create Document (MCP → InDesign)   │
│ 4. Export PDF (High Quality)          │
│ 5. Validate (5 checks)                │
│ 6. Generate Report                    │
└──────┬──────────────────────────────────┘
       │
       v
┌─────────────────────────────────────────┐
│ Output                                  │
│ ✅ World-class PDF                      │
│ ✅ Validation report                    │
│ ✅ Creation metadata                    │
│ ✅ A+ quality guarantee                 │
└─────────────────────────────────────────┘
```

### Design Systems Pipeline

```
Input Data
    │
    ├─→ Intelligent Layout Algorithm
    │       │
    │       ├─→ 12-column grid
    │       ├─→ Content density optimization
    │       └─→ Visual hierarchy
    │
    ├─→ Typography Automation
    │       │
    │       ├─→ Lora (headlines)
    │       ├─→ Roboto Flex (body)
    │       └─→ Size scale (42→28→18→11)
    │
    ├─→ Color Harmony System
    │       │
    │       ├─→ 7 TEEI colors
    │       ├─→ 80/15/5 balance
    │       └─→ NO copper/orange
    │
    ├─→ Image Placement Intelligence
    │       │
    │       ├─→ Hero placement
    │       ├─→ Logo clearspace
    │       └─→ Overlays
    │
    └─→ Brand Compliance Enforcement
            │
            ├─→ Guidelines validation
            ├─→ Quality checks
            └─→ A+ guarantee
```

---

## Contributing

### Adding New Document Types

1. Define in `DOCUMENT_TYPES` (both JS and Python)
2. Create example data file in `/data/`
3. Create corresponding Python creation script
4. Update this README

### Adding New Design Systems

1. Create script in `/scripts/`
2. Add to `applyDesignSystems()` method
3. Document in this README

---

## Credits

**Created by**: Henrik Røine
**Organization**: The Educational Equality Institute (TEEI)
**Purpose**: Automate world-class PDF creation for TEEI programs

**Design Systems**:
- TEEI Brand Guidelines (official)
- Adobe InDesign automation via MCP
- Comprehensive validation framework

---

## License

**PRIVATE** - For TEEI internal use only

---

## Support

For issues or questions:
- **Email**: hello@teei.global
- **Documentation**: `/home/user/pdf-orchestrator/CLAUDE.md`
- **Design Report**: `/home/user/pdf-orchestrator/reports/TEEI_AWS_Design_Fix_Report.md`

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
**Status**: Production Ready ✨
