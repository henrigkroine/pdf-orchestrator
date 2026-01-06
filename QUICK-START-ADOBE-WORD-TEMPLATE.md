# Quick Start: Create Adobe-Compatible Word Template (15 Minutes)

## Goal
Generate TEEI Partnership Showcase PDF using Adobe PDF Services API with proper data merging.

## Problem Recap
- python-docx templates don't work with Adobe Document Generation API
- PDFs generate but contain unmerged fields like `{{title}}` `{{subtitle}}`
- Solution: Create template manually using Adobe's Word Add-In

---

## Step 1: Install Adobe Document Generation Add-In (5 minutes)

1. **Open Microsoft Word** (desktop version - NOT Word Online)
2. Click **Insert** tab → **Get Add-ins** (or **Add-ins** button)
3. Search for: **"Adobe Document Generation"**
4. Click **Add** to install
5. Close the add-in dialog
6. The add-in should now appear in your **Home** ribbon

**Troubleshooting:**
- If you don't see "Get Add-ins", try **Insert** → **My Add-ins**
- Restart Word if the add-in doesn't appear after installation
- Ensure you're signed into your Microsoft account

---

## Step 2: Prepare Your Data (Already Done!)

Your test data is ready at: `T:\Projects\pdf-orchestrator\test-jobs\teei-showcase-simple.json`

**Data Structure:**
```json
{
  "title": "🌟 TEEI AI-Powered Education Revolution 2025",
  "subtitle": "World-Class Partnership Showcase Document",
  "content": [
    "The Educational Equality Institute (TEEI) has transformed...",
    "",
    "Revolutionary AI Platform Features:",
    "• Intelligent Content Generation Engine",
    "• Multi-Language Support (50+ Languages)",
    "• Advanced Analytics Dashboard",
    "• Real-Time Collaboration Tools",
    "• Adaptive Learning Pathways",
    "• Assessment Automation System",
    "• Resource Library Management",
    "• Progress Tracking & Reporting",
    "",
    "Partnership Benefits:",
    "• Access to cutting-edge educational technology",
    "• Comprehensive training and support",
    "• Custom branding and white-labeling options",
    "• Dedicated account management",
    "• Priority feature development",
    "• Integration with existing systems",
    "• Scalable infrastructure",
    "• Data security and privacy compliance",
    "",
    "Implementation Timeline:",
    "• Week 1-2: Initial setup and configuration",
    "• Week 3-4: Team training and onboarding",
    "• Week 5-6: Content migration and customization",
    "• Week 7-8: Testing and quality assurance",
    "• Week 9+: Full deployment and ongoing support",
    "",
    "Contact Information:",
    "For partnership inquiries, please contact:",
    "Email: partnerships@theeducationalequalityinstitute.org",
    "Website: https://theeducationalequalityinstitute.org"
  ],
  "metadata": {
    "author": "The Educational Equality Institute",
    "date": "2025-01-07",
    "organization": "TEEI"
  }
}
```

---

## Step 3: Create Template in Word (8 minutes)

### 3.1 Start New Document
1. Open Microsoft Word
2. Create new blank document
3. Set page margins: **Layout** → **Margins** → **Normal** (1" all sides)

### 3.2 Open Adobe Document Generation Add-In
1. Click **Adobe Document Generation** button in Home ribbon
2. In the add-in panel, click **Import Sample Data**
3. Browse to: `T:\Projects\pdf-orchestrator\test-jobs\teei-showcase-simple.json`
4. Click **Import**

The add-in will parse your JSON and show available fields in the panel:
- title
- subtitle
- content (array)
- metadata.author
- metadata.date
- metadata.organization

### 3.3 Design the Template

**Title Section:**
1. Type or drag `{{title}}` from add-in panel
2. Select the text
3. Format:
   - Font: **Arial**
   - Size: **28pt**
   - Color: **#00393F** (TEEI Primary - Custom Color)
   - Alignment: **Center**
   - Bold: **Yes**

**Subtitle Section:**
1. Press Enter twice after title
2. Type or drag `{{subtitle}}`
3. Format:
   - Font: **Arial**
   - Size: **14pt**
   - Color: **#646464** (Gray)
   - Alignment: **Center**
   - Italic: **Yes**

**Divider:**
1. Press Enter twice
2. Insert horizontal line: **Insert** → **Shapes** → **Line**
3. Or type three hyphens `---` and press Enter (Word auto-formats to line)

**Content Section (Array Loop):**
1. Press Enter twice after divider
2. Click **Insert Array Loop** in add-in panel
3. Select **content** array
4. Add-in inserts: `{{#content}}{{.}}{{/content}}`

This creates a loop that outputs each item in the content array.

**Format content text:**
- Font: **Arial**
- Size: **11pt**
- Color: **#333333** (Dark gray)
- Line spacing: **1.15** or **1.5**
- Alignment: **Left**

**Metadata Footer:**
1. Go to end of document
2. Insert page break or leave space
3. Add metadata section:

```
Document Information:
Author: {{metadata.author}}
Date: {{metadata.date}}
Organization: {{metadata.organization}}
```

Format as small gray text (9pt, #646464)

### 3.4 Test Preview
1. In Adobe add-in panel, click **Preview**
2. Verify data appears correctly (no `{{}}` brackets in preview)
3. Check formatting looks professional

---

## Step 4: Save and Upload Template (2 minutes)

### 4.1 Save Template
1. **File** → **Save As**
2. Location: `T:\Projects\pdf-orchestrator\templates\word\`
3. Filename: `teei-showcase-template-proper.docx`
4. Format: **Word Document (.docx)**

### 4.2 Upload to Adobe
```powershell
cd T:\Projects\pdf-orchestrator
node scripts/upload-template-to-adobe.js templates/word/teei-showcase-template-proper.docx
```

**Output will show:**
```
Asset ID: urn:aaid:AS:UE1:XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

**COPY THIS ASSET ID!**

---

## Step 5: Update Job File and Generate (1 minute)

### 5.1 Update Job Configuration
1. Open: `T:\Projects\pdf-orchestrator\test-jobs\teei-showcase-simple.json`
2. Find line: `"templateAssetId": "urn:aaid:AS:UE1:..."`
3. Replace with YOUR NEW ASSET ID from Step 4.2
4. Save file

### 5.2 Generate PDF
```powershell
cd T:\Projects\pdf-orchestrator
node orchestrator.js test-jobs/teei-showcase-simple.json
```

### 5.3 Verify Output
```powershell
# Check PDF was created
ls exports/*.pdf | sort -Property LastWriteTime | select -Last 1

# Extract and verify content (should show ACTUAL data, not {{fields}})
node -e "const pdfParse = require('pdf-parse'); const fs = require('fs'); const files = fs.readdirSync('exports').filter(f => f.endsWith('.pdf')).sort().reverse(); pdfParse(fs.readFileSync('exports/' + files[0])).then(data => console.log(data.text.substring(0, 500)))"
```

**Expected output should start with:**
```
🌟 TEEI AI-Powered Education Revolution 2025
World-Class Partnership Showcase Document

The Educational Equality Institute (TEEI) has transformed...
```

**NOT:**
```
{{title}}
{{subtitle}}
{{#content}}...
```

---

## Troubleshooting

### Add-in doesn't show fields after import
- Ensure JSON is valid (no syntax errors)
- Try **Refresh** button in add-in panel
- Close and reopen add-in

### Preview shows {{fields}} instead of data
- Click **Generate Document** in add-in to see actual output
- Preview may show template syntax, but generation should work

### Upload fails
- Check credentials in `config/.env`
- Verify CLIENT_ID and CLIENT_SECRET are correct
- Check internet connection

### PDF generates but still has {{fields}}
- Template wasn't created with Adobe add-in (use only the add-in, not manual typing!)
- Array loop syntax incorrect: use `{{#content}}{{.}}{{/content}}` for simple arrays
- Re-create template following steps exactly

### Array items not appearing
- Use `{{.}}` inside array loop for simple string arrays
- For object arrays, use `{{propertyName}}`

---

## TEEI Brand Colors (For Reference)

Add these custom colors in Word:
1. **Home** → **Font Color** → **More Colors** → **Custom**
2. Enter RGB values:

| Color Name    | Hex Code | RGB Values    | Usage          |
|---------------|----------|---------------|----------------|
| TEEI Primary  | #00393F  | 0, 57, 63     | Titles, headers|
| TEEI Accent   | #009688  | 0, 150, 136   | Highlights     |
| TEEI Text     | #333333  | 51, 51, 51    | Body text      |
| TEEI Gray     | #646464  | 100, 100, 100 | Subtitles, meta|

---

## Summary

**Time Investment:** ~15 minutes one-time setup
**Result:** Reusable template for all TEEI partnership documents
**Benefits:**
- ✅ Proper data merging (no more {{fields}})
- ✅ Professional appearance
- ✅ Fast generation (~2-3 seconds)
- ✅ Cloud-based (no local software required)
- ✅ Cost: $0.10 per PDF

**Next Documents:**
Just update the data JSON and use the same template Asset ID!

---

## Alternative: Use InDesign for Complex Designs

For documents requiring advanced layouts (curves, gradients, shadows), use your InDesign MCP system via Cursor:
1. Open Cursor
2. Use MCP commands to build document programmatically
3. Export as PDF

**InDesign is better for:**
- Marketing materials
- Complex multi-column layouts
- Custom graphics and effects
- Print-quality output

**Adobe PDF Services is better for:**
- Text-heavy documents
- Batch processing
- Simple layouts
- Fast turnaround
