# TEEI AWS Partnership - Content Population Guide

**Purpose**: Populate 3-page InDesign document with AWS partnership content using ExtendScript

**Content Source**: `jobs/aws-partnership-full.json`

---

## Quick Start (30 seconds)

```bash
# 1. Open InDesign with 3-page document

# 2. Start MCP bridge (if not running)
python mcp-local/mcp_http_bridge.py

# 3. Run content population
python populate_content.py
```

**Result**: Document populated with complete AWS partnership content

---

## What Gets Created

### Page 1 - Cover
- **Background**: Sand (#FFF1E2) with Nordshore header band
- **Title**: "TEEI × AWS Partnership Proposal" (Lora Bold 42pt, centered)
- **Subtitle**: "Transforming Education Through Cloud Technology" (Roboto Flex 18pt)
- **Logo placeholders**: TEEI (top left), AWS (top right)
- **Highlight box**: 4 key partnership benefits with Sky accent
- **Decorative elements**: Gold accent line

### Page 2 - Overview & Programs
- **Partnership Vision section**:
  - Heading (Lora SemiBold 28pt, Nordshore)
  - Body text describing partnership value
  - 4 highlights with gold bullet dots

- **Programs section** (3 cards):
  1. **Digital Learning Platform**
     - 35,000 students reached
     - 94% completion rate
     - Sand background

  2. **Teacher Training Initiative**
     - 10,000 students reached
     - 97% completion rate
     - Sky background (20% opacity)

  3. **STEM Excellence Program**
     - 5,000 students reached
     - 91% completion rate
     - Sand background

### Page 3 - Metrics & CTA
- **Key Metrics row** (3 columns):
  - 50,000 Students Reached (Gold 36pt)
  - 95% Completion Rate (Gold 36pt)
  - 12 Countries Served (Gold 36pt)

- **Testimonials** (2 quotes):
  - Dr. Sarah Johnson (Program Director)
  - Michael Chen (Technology Director)
  - Sky and Sand backgrounds

- **Call to Action box** (Nordshore background):
  - "Join Us in Making a Difference" (White 24pt)
  - Partnership message
  - Contact: Sarah Johnson, Partnership Director
  - Email: sarah.johnson@teei.org
  - Phone: +1 (555) 123-4567

---

## Brand Compliance

### Colors Used
✅ **Nordshore** #00393F - Primary brand color (headers, CTA)
✅ **Sky** #C9E4EC - Secondary accent (highlight boxes)
✅ **Sand** #FFF1E2 - Warm background (cover, program cards)
✅ **Gold** #BA8F5A - Accent (metrics, bullets, contact)
✅ **White** #FFFFFF - Text on dark backgrounds
✅ **Black** #000000 - Body text

### Typography
✅ **Lora Bold** - Document title (42pt)
✅ **Lora SemiBold** - Section headers (28pt)
✅ **Roboto Flex Bold** - Metric labels, program stats
✅ **Roboto Flex Medium** - Program names (16pt)
✅ **Roboto Flex Regular** - Body text (11pt), captions (9pt)

### Layout Standards
✅ **Margins**: 40pt all sides
✅ **Section spacing**: 50-60pt between sections
✅ **Element spacing**: 20-30pt between elements
✅ **Paragraph spacing**: 8-12pt
✅ **Grid**: 12-column (implicit in spacing)

---

## File Architecture

```
pdf-orchestrator/
├── populate_content.py                      # Python execution wrapper
├── populate_aws_partnership_content.jsx     # ExtendScript source
├── jobs/
│   └── aws-partnership-full.json           # Content data source
├── assets/
│   ├── images/
│   │   └── teei-logo-dark.png             # TEEI logo
│   └── partner-logos/
│       └── aws.svg                         # AWS logo
└── exports/
    └── TEEI-AWS-Partnership-WorldClass.pdf # Final output
```

---

## Workflow

### Standard Usage

```bash
# 1. Prepare InDesign
#    - Open InDesign
#    - Create new document: File → New → Document
#    - Pages: 3
#    - Size: Letter (8.5 × 11 inches)
#    - Orientation: Portrait
#    - Margins: 40pt all sides

# 2. Start MCP bridge (separate terminal)
cd D:\Dev\VS Projects\Projects\pdf-orchestrator
python mcp-local/mcp_http_bridge.py

# 3. Run content population
python populate_content.py
```

**Output**:
```
===================================================================
TEEI AWS Partnership - Content Population
===================================================================

Step 1: Checking MCP bridge connection...
✅ MCP bridge is running

Step 2: Validating InDesign document...
✅ Document ready: Untitled-1 (3 pages)

Step 3: Loading ExtendScript...
✅ Loaded populate_aws_partnership_content.jsx (12847 chars)

Step 4: Populating document content...
✅ Content population complete!

===================================================================
SUCCESS - Document populated with AWS partnership content
===================================================================
```

### Customization Workflow

**To modify content**:

1. Edit `jobs/aws-partnership-full.json` with new data
2. Edit `populate_aws_partnership_content.jsx` to adjust layout
3. Run `python populate_content.py` to regenerate

**Common customizations**:
- Change partner name/logo (edit JSON `partner` section)
- Update metrics (edit JSON `metrics` section)
- Add/remove programs (edit JSON `programs` array)
- Adjust colors (edit `COLORS` object in .jsx)
- Change typography (edit `FONTS` and `SIZES` in .jsx)

---

## Troubleshooting

### "Cannot connect to MCP bridge"

**Problem**: Python script can't reach MCP bridge

**Solution**:
```bash
# Start MCP bridge in separate terminal
python mcp-local/mcp_http_bridge.py

# Verify it's running
curl http://localhost:8012/health
```

### "No document open"

**Problem**: InDesign has no active document

**Solution**:
1. Open InDesign
2. Create new document: File → New → Document
3. Set pages: 3
4. Run script again

### "Document needs 3 pages"

**Problem**: Document has fewer than 3 pages

**Solution**:
1. In InDesign: Layout → Pages → Add Page
2. Add pages until total = 3
3. Run script again

### "Font not found: Lora/Roboto Flex"

**Problem**: TEEI brand fonts not installed

**Solution**:
```powershell
# Run as Administrator
powershell -ExecutionPolicy Bypass -File "scripts/install-fonts.ps1"

# Restart InDesign
```

### ExtendScript execution error

**Problem**: Script fails during execution

**Solution**:
1. Check InDesign error panel: Window → Utilities → JavaScript Console
2. Review error message (line number provided)
3. Common issues:
   - Color not found → Run `setupColors()` first
   - Font not found → Install fonts and restart InDesign
   - Bounds error → Check page dimensions (must be Letter size)

---

## Validation & Export

### After Population

**Validate brand compliance**:
```bash
python validate_world_class.py
```

**Export high-quality PDF**:
```bash
python export_world_class_pdf.py
```

**Run visual QA**:
```bash
node scripts/validate-pdf-quality.js exports/TEEI-AWS-Partnership-WorldClass.pdf
```

---

## Advanced Usage

### Execute ExtendScript directly (bypass Python)

```bash
# Via MCP bridge API
curl -X POST http://localhost:8012/execute \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "executeExtendScript",
    "args": {
      "scriptString": "alert(\"Hello from ExtendScript\");"
    }
  }'
```

### Run individual page population

Edit `populate_aws_partnership_content.jsx` and comment out pages:

```javascript
function main() {
    var doc = app.activeDocument;
    setupColors(doc);

    populatePage1_Cover(doc);       // ✅ Run
    // populatePage2_OverviewPrograms(doc);  // ❌ Skip
    // populatePage3_MetricsCTA(doc);        // ❌ Skip
}
```

Then run: `python populate_content.py`

### Batch processing (future)

Create multiple partnership documents from different JSON files:

```python
# populate_batch.py (example)
import glob

for json_file in glob.glob("jobs/partnership-*.json"):
    # Load JSON
    # Modify ExtendScript variables
    # Execute ExtendScript
    # Export PDF
```

---

## Technical Details

### ExtendScript Functions

**Core functions**:
- `setupColors(doc)` - Creates TEEI color swatches
- `createTextFrame(page, bounds, content, fontSize, fontName, colorName)` - Text creation
- `createRectangle(page, bounds, fillColorName)` - Shape creation
- `populatePage1_Cover(doc)` - Page 1 content
- `populatePage2_OverviewPrograms(doc)` - Page 2 content
- `populatePage3_MetricsCTA(doc)` - Page 3 content

**Coordinate system**:
- Origin: Top-left corner of page
- Units: Points (1 pt = 1/72 inch)
- Page size: 612pt × 792pt (8.5" × 11")
- Bounds: `[y1, x1, y2, x2]` (top, left, bottom, right)

**Example**:
```javascript
// Create text at (100pt, 50pt) with size 200pt × 40pt
var frame = page.textFrames.add();
frame.geometricBounds = [50, 100, 90, 300];  // [y, x, y+h, x+w]
```

---

## Quality Checklist

After running content population:

### Visual Check (InDesign)
- [ ] All text is visible (no cutoffs)
- [ ] Colors match brand guidelines (Nordshore, Sky, Sand, Gold)
- [ ] Typography is correct (Lora headlines, Roboto Flex body)
- [ ] Spacing is consistent (40pt margins, 60pt sections)
- [ ] No overlapping elements
- [ ] Logo placeholders are visible

### Content Check
- [ ] Title correct: "TEEI × AWS Partnership Proposal"
- [ ] All 3 programs present with metrics
- [ ] Metrics accurate: 50,000 students, 95%, 12 countries
- [ ] Testimonials complete with attribution
- [ ] Contact info correct (Sarah Johnson email/phone)
- [ ] Call to action clear and compelling

### Brand Compliance
- [ ] No copper/orange colors (not in TEEI palette)
- [ ] Proper font hierarchy (Lora → Roboto Flex)
- [ ] Consistent color usage (Nordshore primary, Gold accent)
- [ ] Professional layout (not cluttered)
- [ ] Warm and hopeful tone (not corporate cold)

### Technical Check
- [ ] 3 pages total
- [ ] Letter size (8.5 × 11 inches)
- [ ] 40pt margins all sides
- [ ] All fonts embedded
- [ ] Images linked (not embedded as placeholders)

---

## Next Steps

After successful content population:

**Immediate**:
1. Replace text logo placeholders with actual images:
   - Place `assets/images/teei-logo-dark.png` at top left
   - Place `assets/partner-logos/aws.svg` at top right
2. Fine-tune spacing if needed (manual adjustments in InDesign)
3. Add authentic photography (optional, see brand guidelines)

**Validation**:
1. Run brand compliance check: `python validate_world_class.py`
2. Test at multiple zoom levels (100%, 150%, 200%)
3. Review against design fix report

**Export**:
1. Export high-quality PDF: `python export_world_class_pdf.py`
2. Run visual QA: `node scripts/validate-pdf-quality.js`
3. Compare against baseline (if available)

**Delivery**:
1. Get stakeholder approval
2. Archive source files with version control
3. Distribute final PDF to AWS partnership team

---

**Created**: 2025-11-12
**Status**: Production-ready
**Tested**: ✅ ExtendScript syntax validated, brand compliance verified
