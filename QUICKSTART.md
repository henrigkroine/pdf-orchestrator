# Quick Start Guide

Get up and running with PDF Orchestrator in 5 minutes.

## Step 1: Install Dependencies

```bash
cd "T:\Projects\pdf Orchestrator"
npm install
```

## Step 2: Configure Environment

```bash
# Copy example config
copy config\.env.example config\.env

# Edit config\.env with your credentials
notepad config\.env
```

## Step 3: Test with Sample Job

```bash
# Test report generation (serverless)
npm run test:report

# Test campaign generation (MCP)
npm run test:campaign
```

## Step 4: Understand the Flow

### What Just Happened?

1. **orchestrator.js** loaded your job file
2. Validated it against JSON schema
3. Decided which worker to use based on rules
4. Returned a stub response (workers not yet fully implemented)

### Current Status

✅ **Working:**
- Project structure
- JSON validation
- Routing logic
- Configuration system

🚧 **TODO:**
- Complete MCP worker implementation
- Complete PDF Services worker implementation
- Add R2 storage integration
- Create actual templates

## Next: Customize Your First Job

### Create a Custom Report

1. Copy `example-jobs/report-sample.json` to `example-jobs/my-report.json`
2. Edit the data section
3. Run: `node orchestrator.js example-jobs/my-report.json`

### Example Customization

```json
{
  "jobType": "report",
  "templateId": "report-monthly-v1",
  "humanSession": false,
  "data": {
    "title": "My Custom Report",
    "subtitle": "January 2025",
    "content": [
      {
        "type": "text",
        "content": "Your content here..."
      }
    ]
  },
  "output": {
    "format": "pdf",
    "destination": "my-reports/january-2025.pdf",
    "quality": "standard"
  }
}
```

## Routing Examples

### Force MCP Worker (Human Session)

Set `"humanSession": true` in your job JSON.

### Force PDF Services (Serverless)

Set `"humanSession": false` and use standard quality.

### Check Which Worker Was Selected

Look for this line in output:
```
[Orchestrator] Routing to mcp: ...
```
or
```
[Orchestrator] Using default worker: pdfServices
```

## Troubleshooting

### "No schema found for job type"

- Make sure your `jobType` matches a schema file: `{jobType}-schema.json`
- Check `schemas/` directory has the right files

### "Validation failed"

- Your job JSON doesn't match the schema
- Read the error message carefully - it tells you which field is wrong
- Compare with example jobs

### "Worker not yet implemented"

- This is expected! Workers return stub responses until fully implemented
- The orchestrator routing logic still works

## What to Build Next

1. **MCP Worker**: Connect to your local MCP server
2. **PDF Services Worker**: Implement Adobe API calls
3. **Templates**: Create actual InDesign/Illustrator templates
4. **Storage**: Add R2 upload functionality

See `README.md` for full documentation.
