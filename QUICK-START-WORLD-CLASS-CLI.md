# Quick Start: World-Class PDF CLI

**Create A+ quality TEEI PDFs in ONE command.**

---

## TL;DR

```bash
# Node.js
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json

# Python
python world_class_cli.py --type partnership --data data/partnership-aws-example.json
```

**Result**: World-class PDF in `exports/` with automatic validation ✨

---

## 3-Step Guide

### Step 1: Choose Document Type

- `partnership` - Executive partnership docs (AWS, Google, etc.)
- `program` - Program impact reports (Together for Ukraine)
- `report` - Annual/quarterly reports

### Step 2: Prepare Data File

**Use examples in `/data/` directory:**

```bash
# Copy example
cp data/partnership-aws-example.json data/my-partnership.json

# Edit with your data
vim data/my-partnership.json
```

**Minimum required:**
```json
{
  "title": "Your Document Title",
  "organization": "The Educational Equality Institute"
}
```

### Step 3: Run CLI

```bash
# Node.js
npm run create-world-class -- --type partnership --data data/my-partnership.json

# Python
python world_class_cli.py --type partnership --data data/my-partnership.json
```

**Output:**
- ✅ World-class PDF in `exports/`
- ✅ Validation report
- ✅ Creation metadata
- ✅ A+ quality guaranteed

---

## What Gets Applied Automatically

### 🎨 Design Systems (ALL automatic)

1. **Typography** - Lora + Roboto Flex, proper sizing
2. **Colors** - 7 TEEI brand colors, NO copper/orange
3. **Layout** - 12-column grid, 40pt margins, 60pt sections
4. **Whitespace** - Perfect content density
5. **Images** - Hero placement, logo clearspace
6. **Brand Compliance** - TEEI guidelines enforced
7. **Export** - 300 DPI print, 150 DPI digital
8. **Validation** - 5 comprehensive checks

### ✅ Quality Checks (automatic)

1. Page dimensions (8.5×11 Letter)
2. Text cutoffs (none allowed)
3. Image loading (all verified)
4. Color validation (7 TEEI colors)
5. Font validation (Lora + Roboto Flex)

---

## Examples

### AWS Partnership Document

```bash
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json
```

**Creates:**
- 3-page executive partnership proposal
- TEEI + AWS logos
- Program details, metrics, CTA
- A+ professional design

### Together for Ukraine Report

```bash
python world_class_cli.py --type program --data data/program-together-ukraine-example.json
```

**Creates:**
- 4-page narrative impact report
- Student stories, data viz
- Warm, authentic design
- A+ storytelling quality

### Annual Report

```bash
npm run create-world-class -- --type report --data data/report-annual-example.json --verbose
```

**Creates:**
- 5-page professional report
- Financials, achievements, future goals
- Data-rich, board-ready
- A+ executive quality

---

## Options

```bash
-t, --type <type>        partnership | program | report [REQUIRED]
-d, --data <path>        JSON data file
-o, --output <path>      Output directory (default: exports/)
-v, --verbose            Show detailed output
--skip-validation        Skip validation (faster, but not recommended)
```

---

## Output Files

```
exports/
├── TEEI_Partnership_AWS_v1_20251108.pdf     # Your world-class PDF
├── creation-report-1699999999.json          # Creation metadata
└── validation-issues/                       # Only if issues found
    ├── validation-report-*.txt
    └── screenshots/
```

---

## Common Commands

```bash
# Partnership doc
npm run create-world-class -- --type partnership --data data/aws.json

# Program report with verbose output
python world_class_cli.py --type program --data data/ukraine.json --verbose

# Annual report, skip validation (faster)
npm run create-world-class -- --type report --data data/annual.json --skip-validation

# Custom output directory
python world_class_cli.py --type partnership --data data/google.json --output deliverables/
```

---

## Troubleshooting

### "Cannot find data file"

```bash
# Check file exists
ls -la data/my-file.json

# Use absolute path
npm run create-world-class -- --type partnership --data /full/path/to/data.json
```

### "MCP connection failed"

```bash
# 1. Start InDesign
# 2. Test connection
python test_connection.py

# 3. Retry
npm run create-world-class -- --type partnership --data data/aws.json
```

### "Font not found"

```powershell
# Install TEEI fonts (run as Admin)
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# Restart InDesign, then retry
```

### "Missing required fields"

```bash
# Check JSON has required fields
cat data/my-file.json | jq '.title, .organization'

# Add missing fields
{
  "title": "My Document",          ← REQUIRED
  "organization": "TEEI"            ← REQUIRED
}
```

---

## Next Steps

1. **Read full documentation**: `WORLD-CLASS-CLI-README.md`
2. **Study examples**: `/data/*.json`
3. **Customize templates**: Modify document type definitions
4. **Review validation**: `exports/validation-issues/`
5. **Check design report**: `reports/TEEI_AWS_Design_Fix_Report.md`

---

## Support

- **Documentation**: `/home/user/pdf-orchestrator/WORLD-CLASS-CLI-README.md`
- **Examples**: `/home/user/pdf-orchestrator/data/`
- **Design Guidelines**: `/home/user/pdf-orchestrator/CLAUDE.md`

---

**Ready to create world-class PDFs?** 🚀

```bash
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json
```
