# Template Generator Integration Guide

## Overview

This guide shows how to integrate the Template Generator with the existing PDF Orchestrator system for automated, brand-compliant document creation.

---

## Architecture Integration

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      PDF Orchestrator                       │
│                         (Brain)                             │
└───────────────────┬─────────────────────────────────────────┘
                    │
        ┌───────────┴──────────┐
        │                      │
┌───────▼──────────┐  ┌───────▼──────────┐
│ Template         │  │ Job Processing   │
│ Generator        │  │ Workers          │
│ (New)            │  │ (Existing)       │
└───────┬──────────┘  └───────┬──────────┘
        │                      │
        │              ┌───────┴──────────┐
        │              │                  │
        │         ┌────▼────┐      ┌─────▼──────┐
        │         │ MCP     │      │ PDF        │
        │         │ Worker  │      │ Services   │
        │         └─────────┘      └────────────┘
        │
┌───────▼──────────────────────────────────────┐
│ InDesign Template Files (.indt, .jsx)        │
└───────────────────────────────────────────────┘
```

---

## Integration Methods

### Method 1: Pre-Generate Templates (Recommended)

Generate templates ahead of time, then reference in jobs.

**Step 1: Generate Template**
```bash
node template-generator.js generate partnershipBrochure teei-aws-partnership
```

**Step 2: Update Template Registry**
```json
// templates/template-registry.json
{
  "templates": {
    "teei-aws-partnership": {
      "file": "./templates/generated/teei-aws-partnership.jsx",
      "application": "indesign",
      "version": "1.0",
      "description": "TEEI AWS Partnership 8-page brochure",
      "documentType": "partnershipBrochure",
      "requiredFields": ["title", "subtitle", "metrics", "sections"]
    }
  }
}
```

**Step 3: Create Job Referencing Template**
```json
// example-jobs/teei-aws-job.json
{
  "jobType": "document",
  "jobId": "aws-partnership-001",
  "templateId": "teei-aws-partnership",
  "humanSession": true,
  "data": {
    "title": "TEEI AWS Partnership",
    "subtitle": "Together for Ukraine Program Overview",
    "metrics": {
      "studentsReached": 15000,
      "schoolsConnected": 25,
      "regionsServed": 5
    },
    "sections": [
      {
        "heading": "About TEEI",
        "content": "..."
      }
    ]
  },
  "output": {
    "format": "pdf",
    "quality": "high",
    "destination": "exports/teei-aws-partnership.pdf"
  }
}
```

**Step 4: Run Orchestrator**
```bash
node orchestrator.js example-jobs/teei-aws-job.json
```

---

### Method 2: Dynamic Template Generation

Generate templates on-the-fly during job execution.

**Implementation in Orchestrator:**
```javascript
// orchestrator.js (enhanced)
const TemplateGenerator = require('./template-generator');

class PDFOrchestrator {
  constructor() {
    // ... existing code
    this.templateGenerator = new TemplateGenerator();
  }

  async executeJob(job) {
    // Check if template needs to be generated
    if (job.generateTemplate) {
      console.log('[Orchestrator] Generating template dynamically...');

      const outputs = await this.templateGenerator.generateTemplate(
        job.generateTemplate.documentType,
        {
          filename: job.templateId,
          customization: job.generateTemplate.customization
        }
      );

      // Register generated template
      this.registerTemplate(job.templateId, outputs);
    }

    // Continue with normal job processing
    return await this.processJob(job);
  }

  registerTemplate(templateId, outputs) {
    this.templateRegistry.templates[templateId] = {
      file: outputs.script.toString(),
      application: 'indesign',
      version: '1.0',
      description: `Dynamically generated ${templateId}`,
      generated: new Date().toISOString()
    };

    console.log(`[Orchestrator] Registered template: ${templateId}`);
  }
}
```

**Job with Dynamic Template Generation:**
```json
{
  "jobType": "document",
  "jobId": "dynamic-template-001",
  "templateId": "custom-program-overview",
  "generateTemplate": {
    "documentType": "programOverview",
    "customization": {
      "colorMode": "CMYK"
    }
  },
  "data": {
    "title": "Custom Program",
    "content": "..."
  }
}
```

---

### Method 3: MCP Integration (Real-Time InDesign Control)

Use Template Generator with MCP worker for real-time InDesign automation.

**Implementation:**
```javascript
// workers/mcp_worker/index.js (enhanced)
const TemplateGenerator = require('../../template-generator');

class MCPWorker {
  constructor(config) {
    this.generator = new TemplateGenerator();
    // ... existing code
  }

  async execute(job) {
    // Generate template specification
    const spec = this.generator.generateTemplateSpec(
      job.documentType || 'partnershipBrochure',
      job.customization
    );

    // Convert to MCP commands
    const mcpCommands = this.convertSpecToMCPCommands(spec);

    // Execute via MCP
    for (const command of mcpCommands) {
      await this.mcpClient.send(command);
    }

    // ... continue with content population
  }

  convertSpecToMCPCommands(spec) {
    const commands = [];

    // Create document
    commands.push({
      action: 'create_document',
      params: {
        width: spec.document.size.width,
        height: spec.document.size.height,
        unit: spec.document.size.unit,
        pageCount: spec.document.pageCount
      }
    });

    // Create color swatches
    spec.colors.forEach(color => {
      commands.push({
        action: 'create_color_swatch',
        params: color
      });
    });

    // Create paragraph styles
    Object.values(spec.styles.paragraph).forEach(style => {
      commands.push({
        action: 'create_paragraph_style',
        params: style
      });
    });

    return commands;
  }
}
```

---

## Usage Patterns

### Pattern 1: Standard Partnership Document

```bash
# 1. Generate template
node template-generator.js generate partnershipBrochure teei-standard

# 2. Create job file
cat > example-jobs/partnership.json << 'EOF'
{
  "jobType": "document",
  "templateId": "teei-standard",
  "data": {
    "title": "Partnership with [Partner Name]",
    "metrics": { ... }
  }
}
EOF

# 3. Execute
node orchestrator.js example-jobs/partnership.json
```

### Pattern 2: Annual Report with Custom Colors

```bash
# 1. Generate CMYK template for print
node template-generator.js generate annualReport teei-annual-2025

# 2. Customize in job
cat > example-jobs/annual-report.json << 'EOF'
{
  "jobType": "document",
  "templateId": "teei-annual-2025",
  "customization": {
    "colorMode": "CMYK"
  }
}
EOF
```

### Pattern 3: Batch Generation for Multiple Programs

```javascript
// batch-generate-templates.js
const TemplateGenerator = require('./template-generator');

const generator = new TemplateGenerator();

const programs = [
  'Together for Ukraine',
  'Digital Literacy Initiative',
  'Teacher Training Program'
];

async function generateProgramTemplates() {
  for (const program of programs) {
    const slug = program.toLowerCase().replace(/\s+/g, '-');

    await generator.generateTemplate('programOverview', {
      filename: `program-${slug}`,
      customization: {
        metadata: {
          program: program
        }
      }
    });
  }
}

generateProgramTemplates();
```

---

## Python Integration

### Using Python Template Builder

```python
# generate_templates.py
from template_builder import TemplateBuilder

builder = TemplateBuilder()

# Generate template
outputs = builder.generate_template(
    'partnershipBrochure',
    filename='teei-aws',
    customization={'colorMode': 'CMYK'}
)

print(f"Generated: {outputs['spec']}")
```

### Integration with Python MCP Client

```python
# python_mcp_worker.py
import json
from template_builder import TemplateBuilder

class PythonMCPWorker:
    def __init__(self):
        self.builder = TemplateBuilder()

    def execute_job(self, job):
        # Generate template spec
        spec = self.builder.generate_template_spec(
            job['documentType'],
            job.get('customization')
        )

        # Convert to MCP commands
        commands = self.convert_spec_to_mcp(spec)

        # Send to InDesign via MCP
        for command in commands:
            self.send_mcp_command(command)

    def convert_spec_to_mcp(self, spec):
        # Implementation similar to JavaScript version
        pass
```

---

## Testing Templates

### Test Generated Template in InDesign

**Option 1: Run JSX Script Directly**
```bash
# Generate template
node template-generator.js generate partnershipBrochure test-template

# Open InDesign and run script:
# File → Scripts → Other Script...
# Select: templates/generated/test-template.jsx
```

**Option 2: Test via MCP**
```python
# test_template.py
import json

# Load generated MCP payload
with open('templates/generated/test-template-mcp.json') as f:
    mcp_payload = json.load(f)

# Send to MCP worker
# (requires MCP server running)
```

### Validate Template Spec

```bash
# Validate against schema
npx ajv validate \
  -s templates/template-spec-schema.json \
  -d templates/generated/test-template.json
```

---

## Common Workflows

### Workflow 1: New Partnership Document

```bash
# Day 1: Generate template
node template-generator.js generate partnershipBrochure aws-partnership
# Review template spec in templates/generated/aws-partnership.json

# Day 2: Create job with content
cat > example-jobs/aws-partnership.json
# ... add content

# Day 3: Execute and review
node orchestrator.js example-jobs/aws-partnership.json
# Review PDF in exports/
```

### Workflow 2: Template Iteration

```javascript
// iterate-template.js
const TemplateGenerator = require('./template-generator');

const generator = new TemplateGenerator();

// Generate v1
await generator.generateTemplate('partnershipBrochure', {
  filename: 'partnership-v1'
});

// Review, then customize v2
await generator.generateTemplate('partnershipBrochure', {
  filename: 'partnership-v2',
  customization: {
    document: {
      pageCount: 10 // Extended version
    }
  }
});
```

---

## Advanced Customization

### Custom Document Type

```javascript
// In template-generator.js, add to DOCUMENT_TYPES:
const DOCUMENT_TYPES = {
  // ... existing types

  impactReport: {
    name: 'Impact Report',
    pageCount: 6,
    pages: [
      { pattern: 'coverHero', grid: 'hierarchical' },
      { pattern: 'executiveLetter', grid: 'manuscript' },
      { pattern: 'statsModular', grid: 'modular' },
      { pattern: 'beforeAfter', grid: 'twoColumn' },
      { pattern: 'testimonials', grid: 'threeColumn' },
      { pattern: 'ctaPage', grid: 'manuscript' }
    ],
    components: ['pullQuote', 'statCard', 'testimonial', 'footer']
  }
};

// Use it
await generator.generateTemplate('impactReport');
```

### Custom Layout Pattern

```javascript
// In template-generator.js, add to LAYOUT_PATTERNS:
const LAYOUT_PATTERNS = {
  // ... existing patterns

  testimonials: {
    name: 'Testimonials Grid',
    structure: {
      grid: '2x2',
      testimonial: {
        photo: { size: 100, shape: 'circular', position: 'top' },
        quote: { style: 'pullQuote', position: 'middle' },
        attribution: { style: 'caption', position: 'bottom' }
      }
    },
    visualDensity: 'medium'
  }
};
```

---

## Troubleshooting Integration

### Issue: Template not found in registry

**Solution**: Ensure template is registered after generation:
```bash
# Regenerate and update registry
node template-generator.js generate partnershipBrochure my-template
# Then update templates/template-registry.json
```

### Issue: MCP commands failing

**Solution**: Test MCP connection first:
```python
python test_connection.py
```

### Issue: InDesign script errors

**Solution**: Check font installation:
```bash
# Verify fonts installed
powershell -ExecutionPolicy Bypass -File scripts/install-fonts.ps1
# Restart InDesign
```

---

## Performance Optimization

### Cache Generated Templates

```javascript
// orchestrator.js
class PDFOrchestrator {
  constructor() {
    this.templateCache = new Map();
  }

  async getTemplate(templateId, documentType) {
    // Check cache
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId);
    }

    // Generate if not cached
    const spec = await this.templateGenerator.generateTemplateSpec(documentType);
    this.templateCache.set(templateId, spec);

    return spec;
  }
}
```

### Parallel Template Generation

```javascript
// batch-generate.js
const TemplateGenerator = require('./template-generator');
const generator = new TemplateGenerator();

const templates = [
  'partnershipBrochure',
  'programOverview',
  'annualReport'
];

// Generate in parallel
await Promise.all(
  templates.map(type =>
    generator.generateTemplate(type, { filename: type })
  )
);
```

---

## Best Practices

1. **Version Control Templates**: Commit generated `.json` specs to git, not `.jsx` scripts
2. **Naming Convention**: Use descriptive names: `teei-aws-partnership-v2-cmyk`
3. **Template Registry**: Keep registry updated with all generated templates
4. **Testing**: Always test generated templates in InDesign before production use
5. **Documentation**: Document custom document types and patterns in code comments

---

## Next Steps

1. Generate your first template: `node template-generator.js generate partnershipBrochure`
2. Review generated files in `templates/generated/`
3. Test template in InDesign
4. Create job file referencing template
5. Execute via orchestrator

---

**Last Updated**: 2025-11-08
**Integration Version**: 1.0
