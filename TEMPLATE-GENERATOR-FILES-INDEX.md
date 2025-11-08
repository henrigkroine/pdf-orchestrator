# Template Generator - Files Index

Quick reference for all template generator files and their purposes.

---

## Core System Files

### 1. Main Generator (JavaScript)
**File**: `/home/user/pdf-orchestrator/template-generator.js`
**Size**: 850 lines
**Purpose**: Main template generation engine (Node.js)
**Usage**:
```bash
node template-generator.js list
node template-generator.js generate partnershipBrochure my-template
```

---

### 2. Python Builder
**File**: `/home/user/pdf-orchestrator/template_builder.py`
**Size**: 650 lines
**Purpose**: Python implementation of template generator
**Usage**:
```bash
python template_builder.py list
python template_builder.py generate annualReport --output my-template --cmyk
```

---

## Documentation Files

### 1. Quick Start Guide (START HERE)
**File**: `/home/user/pdf-orchestrator/TEMPLATE-GENERATOR-QUICK-START.md`
**Length**: 5-minute read
**Purpose**: Get started immediately
**When to Use**: First time using template generator

---

### 2. Integration Guide
**File**: `/home/user/pdf-orchestrator/TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md`
**Length**: 30-minute read
**Purpose**: Integrate with PDF orchestrator
**When to Use**: Connecting template generator to existing workflows

---

### 3. Complete Reference
**File**: `/home/user/pdf-orchestrator/TEMPLATE-GENERATOR-README.md`
**Length**: 1-hour read
**Purpose**: Comprehensive documentation
**When to Use**: Deep customization, API reference, troubleshooting

---

### 4. Implementation Summary
**File**: `/home/user/pdf-orchestrator/TEMPLATE-SYSTEM-SUMMARY.md`
**Length**: 20-minute read
**Purpose**: System overview and technical details
**When to Use**: Understanding architecture, reviewing implementation

---

### 5. This Index
**File**: `/home/user/pdf-orchestrator/TEMPLATE-GENERATOR-FILES-INDEX.md`
**Purpose**: Quick file reference
**When to Use**: Finding the right file

---

## Schema and Configuration

### Template Specification Schema
**File**: `/home/user/pdf-orchestrator/templates/template-spec-schema.json`
**Purpose**: JSON schema for validating template specifications
**When to Use**: Validating custom template specs

---

### Template Registry (Existing)
**File**: `/home/user/pdf-orchestrator/templates/template-registry.json`
**Purpose**: Registry of all available templates
**When to Use**: Adding generated templates to orchestrator

---

## Generated Output (Example)

### Example Template Files
**Location**: `/home/user/pdf-orchestrator/templates/generated/`

**Test Template Files Created**:
1. `test-template.json` (14 KB) - Template specification
2. `test-template.jsx` (5.6 KB) - InDesign script
3. `test-template-mcp.json` (15 KB) - MCP automation payload

**Each Generated Template Includes**:
- `.json` - Complete template specification (data structure)
- `.jsx` - ExtendScript for InDesign (executable script)
- `-mcp.json` - MCP commands (real-time automation)

---

## File Size Reference

```
template-generator.js          ~35 KB   (core system)
template_builder.py            ~25 KB   (Python version)
TEMPLATE-GENERATOR-README.md   ~50 KB   (comprehensive docs)
INTEGRATION-GUIDE.md           ~35 KB   (integration guide)
QUICK-START.md                 ~20 KB   (quick start)
SYSTEM-SUMMARY.md              ~30 KB   (implementation summary)
template-spec-schema.json      ~3 KB    (validation schema)

Generated per template:
  template.json                ~15 KB   (specification)
  template.jsx                 ~6 KB    (InDesign script)
  template-mcp.json            ~15 KB   (MCP payload)
```

---

## Directory Structure

```
/home/user/pdf-orchestrator/
│
├── template-generator.js                    ← Main generator (JavaScript)
├── template_builder.py                      ← Python builder
│
├── TEMPLATE-GENERATOR-QUICK-START.md        ← Start here
├── TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md  ← Integration guide
├── TEMPLATE-GENERATOR-README.md             ← Complete reference
├── TEMPLATE-SYSTEM-SUMMARY.md               ← Implementation summary
├── TEMPLATE-GENERATOR-FILES-INDEX.md        ← This file
│
└── templates/
    ├── template-registry.json               ← Template registry
    ├── template-spec-schema.json            ← Validation schema
    └── generated/                           ← Generated templates
        ├── test-template.json
        ├── test-template.jsx
        └── test-template-mcp.json
```

---

## Quick Command Reference

### List Available Templates
```bash
# JavaScript
node template-generator.js list

# Python
python template_builder.py list
```

### Generate Template
```bash
# JavaScript
node template-generator.js generate <type> [filename]

# Python
python template_builder.py generate <type> --output <filename>
```

### Examples
```bash
# Partnership brochure
node template-generator.js generate partnershipBrochure

# Annual report (CMYK for print)
python template_builder.py generate annualReport --cmyk

# Program overview with custom name
node template-generator.js generate programOverview my-program
```

---

## File Usage Flow

```
1. READ: TEMPLATE-GENERATOR-QUICK-START.md
   ↓
2. RUN: node template-generator.js list
   ↓
3. RUN: node template-generator.js generate partnershipBrochure
   ↓
4. REVIEW: templates/generated/[template-name].json
   ↓
5. EXECUTE: Open .jsx in InDesign OR use with orchestrator
   ↓
6. FOR INTEGRATION: Read TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md
   ↓
7. FOR CUSTOMIZATION: Read TEMPLATE-GENERATOR-README.md
```

---

## When to Use Which File

### I want to...

**...get started quickly (5 min)**
→ Read: `TEMPLATE-GENERATOR-QUICK-START.md`

**...integrate with orchestrator**
→ Read: `TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md`

**...customize templates**
→ Read: `TEMPLATE-GENERATOR-README.md` → "Customization Options"

**...understand the implementation**
→ Read: `TEMPLATE-SYSTEM-SUMMARY.md`

**...find a specific file**
→ Read: `TEMPLATE-GENERATOR-FILES-INDEX.md` (this file)

**...generate a template now**
→ Run: `node template-generator.js generate partnershipBrochure`

**...see what templates are available**
→ Run: `node template-generator.js list`

**...validate a template spec**
→ Use: `templates/template-spec-schema.json` with ajv

**...use with Python**
→ Run: `python template_builder.py list`

---

## Related Files (Existing System)

### Orchestrator
- `/home/user/pdf-orchestrator/orchestrator.js` - Main orchestrator
- `/home/user/pdf-orchestrator/example-jobs/*.json` - Job examples
- `/home/user/pdf-orchestrator/schemas/*.json` - Job schemas

### Brand Guidelines
- `/home/user/pdf-orchestrator/CLAUDE.md` - TEEI brand guidelines
- `/home/user/pdf-orchestrator/reports/WORLD_CLASS_NONPROFIT_DESIGN_ANALYSIS.md` - Design patterns

### Workers
- `/home/user/pdf-orchestrator/workers/mcp_worker/` - MCP integration
- `/home/user/pdf-orchestrator/workers/pdf_services_worker/` - Adobe PDF Services

---

## Version History

**Version 1.0** (2025-11-08)
- Initial release
- 3 document types (Partnership Brochure, Program Overview, Annual Report)
- 5 grid systems (Manuscript, Two-Column, Three-Column, Modular, Hierarchical)
- 5 components (Pull Quote, Stat Card, Section Header, Image Frame, Footer)
- JavaScript and Python implementations
- Complete documentation suite

---

## File Maintenance

### Adding New Templates
1. Edit `template-generator.js` or `template_builder.py`
2. Add to `DOCUMENT_TYPES` constant
3. Document in `TEMPLATE-GENERATOR-README.md`
4. Test generation
5. Update this index

### Updating Documentation
1. Edit relevant `.md` file
2. Update "Last Updated" date
3. Regenerate any affected templates
4. Test commands and examples

---

## Support and Resources

### Documentation Hierarchy
1. **Quick Start** → 5 minutes → Get started
2. **Integration Guide** → 30 minutes → Connect to orchestrator
3. **Complete Reference** → 1 hour → Deep dive
4. **Implementation Summary** → 20 minutes → Technical overview

### External Resources
- **TEEI Brand Guidelines**: See `CLAUDE.md`
- **Design Patterns**: See `reports/WORLD_CLASS_NONPROFIT_DESIGN_ANALYSIS.md`
- **Orchestrator Docs**: See `README.md`

---

## Last Updated

**Date**: 2025-11-08
**Version**: 1.0
**Status**: Production Ready

---

**Need Help?**
1. Start with `TEMPLATE-GENERATOR-QUICK-START.md`
2. For integration: `TEMPLATE-GENERATOR-INTEGRATION-GUIDE.md`
3. For details: `TEMPLATE-GENERATOR-README.md`
4. For overview: `TEMPLATE-SYSTEM-SUMMARY.md`
