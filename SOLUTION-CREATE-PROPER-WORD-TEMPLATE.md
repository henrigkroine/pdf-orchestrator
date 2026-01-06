# How to Create Proper Word Templates for Adobe Document Generation

## Problem Summary

PDFs are generating successfully but contain **unmerged template fields** like `{{title}}` `{{subtitle}}` instead of actual data.

**Root Cause**: Word templates created with python-docx library have XML structure incompatible with Adobe Document Generation API.

## SOLUTION: Use Adobe Document Generation Word Add-In

### Step 1: Install Adobe Document Generation Add-In

1. Open Microsoft Word (desktop version required, not Word Online)
2. Go to **Insert** → **Get Add-ins**
3. Search for "Adobe Document Generation"
4. Click **Add** to install the official Adobe add-in
5. The add-in will appear in the **Home** ribbon

### Step 2: Create Template in Word

1. Open Microsoft Word
2. Click the **Adobe Document Generation** button in the ribbon
3. Import the data structure from `test-jobs/teei-showcase-simple.json`
   - The add-in will parse your JSON and show available fields
4. Insert merge fields by dragging from the add-in panel:
   - `{{title}}` - Main title
   - `{{subtitle}}` - Subtitle  
   - `{{#content}}{{content}}{{/content}}` - Array loop for content blocks
   - `{{metadata.author}}` - Nested field access
   - `{{metadata.date}}`
   - `{{metadata.organization}}`

5. Format the document:
   - **Title**: 32pt Arial Bold, TEEI Primary color (#00393F), centered
   - **Subtitle**: 16pt Arial, gray (#646464), centered
   - **Body text**: 11pt Arial, 16pt leading
   - **Bullet points**: Proper indentation (18pt)

### Step 3: Save and Upload Template

1. Save the Word document: `templates/word/teei-showcase-template-proper.docx`
2. Upload to Adobe:
   ```bash
   cd T:\Projects\pdf-orchestrator
   node scripts/upload-template-to-adobe.js
   ```
3. Copy the returned Asset ID
4. Update `test-jobs/teei-showcase-simple.json` with new `templateAssetId`

### Step 4: Test the Template

```bash
cd T:\Projects\pdf-orchestrator
node orchestrator.js test-jobs/teei-showcase-simple.json
```

Verify PDF content:
```bash
node -e "const pdfParse = require('pdf-parse'); const fs = require('fs'); pdfParse(fs.readFileSync('exports/output-XXXX.pdf')).then(data => console.log(data.text.substring(0, 500)))"
```

## Why This Works

The Adobe Document Generation Word Add-in creates merge fields with the **exact XML structure** Adobe's API expects:

- Single continuous `<w:r>` (run) elements for each merge field
- Proper field markers that Adobe's parser recognizes
- Correct namespace declarations
- Compatible formatting structures

## Alternative: Use InDesign MCP (Recommended)

Since you already have a fully functional InDesign automation system with 61 professional commands, consider using that instead:

```bash
cd T:\Projects\pdf-orchestrator
node scripts/generate-teei-showcase-indesign.js
node orchestrator.js test-jobs/teei-showcase-indesign.json
```

**Advantages**:
- Full design control (gradients, shadows, curved text)
- No template compatibility issues
- Professional layouts
- Already working in your system

## Data Structure Reference

Your TEEI showcase data structure:
```json
{
  "title": "🌟 TEEI AI-Powered Education Revolution 2025",
  "subtitle": "World-Class Partnership Showcase Document",
  "content": [
    "The Educational Equality Institute (TEEI) has transformed...",
    "",
    "Revolutionary AI Platform Features:",
    ...
  ],
  "metadata": {
    "author": "The Educational Equality Institute",
    "date": "2025-01-07",
    "organization": "TEEI"
  }
}
```

## Template Field Syntax

- Simple field: `{{title}}`
- Nested field: `{{metadata.author}}`
- Array loop: `{{#content}}{{content}}{{/content}}`
- Conditional: `{{#metadata.date}}Date: {{metadata.date}}{{/metadata.date}}`

## Debugging Tips

1. **Check PDF content**: Always verify merged data, not just PDF generation success
2. **Use Adobe's samples**: Test with Adobe's official templates first
3. **Validate JSON**: Ensure data structure matches template fields exactly
4. **Check Asset IDs**: Make sure `templateAssetId` in job file is correct

## Cost Tracking

Current usage from logs:
- Daily: $0.10 / $25 budget
- Monthly: $18.47 / $500 budget
- Cost per generation: $0.10
- Processing time: ~2-3 seconds

## Next Steps

1. ✅ Install Adobe Document Generation Word Add-In
2. ✅ Create template with proper merge fields
3. ✅ Upload and get new Asset ID
4. ✅ Update job file with new template
5. ✅ Test and verify data merges correctly

OR

1. ✅ Use existing InDesign MCP system (already working!)
2. ✅ Run `node scripts/generate-teei-showcase-indesign.js`
3. ✅ No template compatibility issues
4. ✅ Professional design quality
