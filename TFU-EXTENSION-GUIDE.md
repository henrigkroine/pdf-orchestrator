# TFU System Extension Guide: Onboarding New Partners

**Purpose**: Step-by-step guide to extend the Together for Ukraine (TFU) design system to new partnership documents
**Audience**: Developers, designers, content creators onboarding new TEEI partners
**Prerequisites**: TFU migration Steps 0-7 complete (AWS partnership certified)
**Time Required**: 30-60 minutes per new partner

---

## What You'll Create

For each new partner (e.g., Google, Microsoft, Cornell), you will:
1. ✅ Create a partner-specific TFU job config (JSON)
2. ✅ Create partnership content file (JSON with programs, metrics, CTA)
3. ✅ Generate a TFU-compliant 4-page layout (JSX script)
4. ✅ Run the script in InDesign to produce PDF
5. ✅ Validate TFU compliance (score ≥ 140/150)
6. ✅ Certify the PDF as TFU-compliant

**Result**: A world-class 4-page partnership PDF matching the canonical TFU design system.

---

## Step 1: Copy the TFU Partnership Template (2 minutes)

**Action**: Create a new job config for your partner

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

# Copy the template
cp example-jobs/tfu-partnership-template.json example-jobs/tfu-google-partnership.json
```

**What you copied**: A fully-documented job config template with:
- TFU validation rules (`validate_tfu: true`)
- 140-point certification threshold
- Output settings (CMYK print, RGB digital)
- TFU design requirements
- Inline instructions in `notes` array

---

## Step 2: Customize the Job Config (10 minutes)

**Action**: Replace all "REPLACE_ME" placeholders with Google-specific values

Open `example-jobs/tfu-google-partnership.json` and update:

### Basic Information
```json
{
  "name": "TFU Google Partnership",
  "description": "Together for Ukraine Partnership Proposal for Google",
  "client": "Google",
  "data": {
    "title": "Google Partnership Proposal",
    "subtitle": "Empowering Ukrainian Students Through Technology Education",
    "partner": "Google"
  }
}
```

### Content Sources
```json
{
  "content_sources": {
    "content_json": "data/google-partnership.json",
    "content_markdown": "deliverables/Google-Partnership-Content.md"
  }
}
```

### Output Settings
```json
{
  "output": {
    "filename_base": "TEEI-Google-Partnership-TFU",
    "export_path": "./exports"
  }
}
```

### QA Profile
```json
{
  "qa_profile": {
    "use_tfu_certification": true,
    "visual_baseline_id": "google-tfu-v1"
  }
}
```

### TFU Rules (Optional Flexibility)

**Default** (Standard TFU, like AWS):
```json
{
  "tfu_rules": {
    "require_logo_grid": true,
    "require_tfu_badge": true,
    "allow_flexible_metrics": false
  }
}
```

**Custom** (Partner with only 4 logos):
```json
{
  "tfu_rules": {
    "require_logo_grid": false,  // ← Skip 3×3 grid check
    "require_tfu_badge": true,
    "allow_flexible_metrics": false
  }
}
```

**Note**: The 3 CRITICAL checks (page count = 4, no gold, teal present) are **always enforced**, regardless of `tfu_rules`.

---

## Step 3: Create Partnership Content (15 minutes)

**Action**: Create the content JSON with Google-specific programs, metrics, and messaging

### 3.1 Copy the AWS Example
```bash
cp data/partnership-aws-example.json data/google-partnership.json
```

### 3.2 Update Content Structure

Open `data/google-partnership.json` and customize:

#### Cover Page
```json
{
  "title": "Google Partnership Proposal",
  "subtitle": "Empowering Ukrainian Students Through Technology Education",
  "organization": "The Educational Equality Institute",
  "partner": "Google"
}
```

#### Overview (Page 2 Content)
```json
{
  "overview": {
    "mission": "TEEI partners with Google to provide world-class technology education to displaced Ukrainian students, enabling them to build careers in cloud computing, AI/ML, and software development.",
    "value_proposition": "By combining TEEI's proven educational methodology with Google's industry-leading platforms and certifications, we create pathways to economic stability and professional growth for thousands of Ukrainian students.",
    "impact": "Together, we will scale technology education to 50,000 students across 12 countries, delivering Google Cloud certifications and career-ready skills that transform lives."
  }
}
```

#### Programs (Page 3 Content)
```json
{
  "programs": [
    {
      "name": "Google Cloud Curriculum",
      "description": "Comprehensive training in Google Cloud Platform, covering compute, storage, networking, and ML services. Students earn Google Cloud Associate certifications.",
      "students_reached": 15000,
      "success_rate": "92%",
      "certification_rate": "78%"
    },
    {
      "name": "Android Development Pathways",
      "description": "Mobile development training using Kotlin and Android Studio, preparing students for careers in app development with real-world project experience.",
      "students_reached": 12000,
      "success_rate": "95%",
      "certification_rate": "72%"
    },
    {
      "name": "AI/ML Learning Path",
      "description": "Machine learning fundamentals using TensorFlow and Google AI tools, enabling students to build intelligent applications and pursue ML careers.",
      "students_reached": 8000,
      "success_rate": "88%",
      "placement_rate": "65%"
    }
  ]
}
```

#### Metrics (Page 2 Sidebar)
```json
{
  "metrics": {
    "students_reached": 50000,
    "countries": 12,
    "partner_organizations": 45,
    "certifications": 3500
  }
}
```

#### Call to Action (Page 4 Content)
```json
{
  "call_to_action": {
    "headline": "We are looking for more partners and supporters to work with us.",
    "description": "Partner with TEEI and Google to scale technology education and create economic opportunities for displaced Ukrainian students. Together, we can transform lives through education.",
    "action": "Schedule a Partnership Discussion",
    "contact": {
      "name": "Henrik Røine",
      "email": "henrik@theeducationalequalityinstitute.org",
      "phone": "+47 919 08 939"
    }
  }
}
```

**Save** the file.

---

## Step 4: Generate TFU Layout Script (2 minutes)

**Action**: Use the generic TFU generator to create a Google-specific JSX script

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

python create_tfu_partnership_from_json.py \
  --content-json data/google-partnership.json \
  --client-name "Google" \
  --output-prefix exports/TEEI-Google-Partnership-TFU \
  --generate-jsx
```

**Expected Output**:
```
[INFO] Loading content from: data/google-partnership.json
[INFO] Generating TFU layout script for: Google
[OK] Generated JSX script: exports/TEEI-Google-Partnership-TFU.jsx

======================================================================
NEXT STEPS (Manual InDesign Run):
======================================================================
1. Open Adobe InDesign
2. File → Scripts → Other Script...
3. Select: exports/TEEI-Google-Partnership-TFU.jsx
4. Save as: exports/TEEI-Google-Partnership-TFU.indd
5. Export Print PDF: exports/TEEI-Google-Partnership-TFU-PRINT.pdf (CMYK)
6. Export Digital PDF: exports/TEEI-Google-Partnership-TFU-DIGITAL.pdf (RGB)
7. Run TFU validation:
   python validate_document.py exports/TEEI-Google-Partnership-TFU-PRINT.pdf \
     --job-config example-jobs/tfu-google-partnership.json --strict
======================================================================
```

**What happened**: The generator:
1. Loaded your Google content JSON
2. Parsed the certified AWS TFU script as a template
3. Replaced the embedded AWS data with Google data
4. Created a standalone JSX file ready to run in InDesign

---

## Step 5: Run Script in InDesign (5 minutes)

**Action**: Execute the generated JSX to create the 4-page TFU layout

### 5.1 Open InDesign
1. Launch Adobe InDesign
2. No need to create a new document (script will do it)

### 5.2 Run the JSX Script
**Method 1: Via InDesign Menu** (Recommended)
```
1. File → Scripts → Other Script...
2. Navigate to: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
3. Select: TEEI-Google-Partnership-TFU.jsx
4. Click "Open"
```

**Method 2: ExtendScript Toolkit** (If menu fails)
```
1. Open ExtendScript Toolkit
2. Target: Adobe InDesign
3. Open: exports/TEEI-Google-Partnership-TFU.jsx
4. Click "Run" (green play button)
```

### 5.3 Verify Layout
You should see a 4-page document with:
- ✅ **Page 1**: Full teal cover (#00393F) with white photo card
- ✅ **Page 2**: Hero photo + two-column "About the Partnership" + light blue stats sidebar
- ✅ **Page 3**: Two-column "Programs powered by Google" editorial text (NOT cards)
- ✅ **Page 4**: Full teal closing with TFU badge (blue + yellow) + 3×3 logo grid

### 5.4 Save the InDesign File
```
File → Save As...
Filename: TEEI-Google-Partnership-TFU.indd
Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\exports\
```

---

## Step 6: Export PDFs (5 minutes)

**Action**: Export both print (CMYK) and digital (RGB) versions

### 6.1 Export Print PDF (CMYK)
```
1. File → Export...
2. Format: Adobe PDF (Print)
3. Filename: TEEI-Google-Partnership-TFU-PRINT.pdf
4. Location: exports\
5. Click Export
6. In PDF Export dialog:
   - Preset: [PDF/X-4:2010] or [High Quality Print]
   - Marks and Bleeds: Enable crop marks
   - Output: Color Conversion = Convert to Destination (CMYK)
7. Click Export
```

### 6.2 Export Digital PDF (RGB)
```
1. File → Export...
2. Format: Adobe PDF (Interactive)
3. Filename: TEEI-Google-Partnership-TFU-DIGITAL.pdf
4. Location: exports\
5. Click Export
6. In PDF Export dialog:
   - Compression: High Quality
   - View After Exporting: Enable (optional)
7. Click OK
```

### 6.3 Verify Exports
```bash
ls -la exports/TEEI-Google-Partnership-TFU*
```

You should see:
- ✅ `TEEI-Google-Partnership-TFU.indd` (~500KB)
- ✅ `TEEI-Google-Partnership-TFU.jsx` (~30KB)
- ✅ `TEEI-Google-Partnership-TFU-PRINT.pdf` (1-2MB)
- ✅ `TEEI-Google-Partnership-TFU-DIGITAL.pdf` (1-2MB)

---

## Step 7: Validate TFU Compliance (3 minutes)

**Action**: Run automated validation to ensure TFU certification

```bash
cd "D:\Dev\VS Projects\Projects\pdf-orchestrator"

python validate_document.py \
  exports/TEEI-Google-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-google-partnership.json \
  --strict
```

### Expected Output (PASS)
```
Starting comprehensive validation...
Running TFU design system compliance checks...

======================================================================
VALIDATION REPORT
======================================================================
[OK] Score: 148/150 (98.7%)
[OK] Rating: A+ (World-class quality)

TFU Compliance:
  ✓ Page count correct (4 pages)
  ✓ No gold color detected
  ✓ Teal color present (#00393F)
  ✓ TFU badge found
  ✓ Correct fonts (Lora + Roboto)
  ✓ Logo grid found

[OK] TFU Design System Certified

Exit code: 0
```

### If Validation Fails
**Score < 140/150**:
```bash
# Get detailed JSON report
python validate_document.py \
  exports/TEEI-Google-Partnership-TFU-PRINT.pdf \
  --job-config example-jobs/tfu-google-partnership.json \
  --json > validation-report.json

# Inspect issues
cat validation-report.json | jq '.validations'
```

**Common Issues**:
- **Page count ≠ 4**: Check JSX script `pagesPerDocument: 4` (line ~144 in generated script)
- **Gold color detected**: Verify color palette in JSX (should only have teal #00393F, no gold #BA8F5A)
- **TFU badge missing**: Check Page 4 text includes "Together for" + "UKRAINE"
- **Logo grid missing**: If partner has < 9 logos, set `"require_logo_grid": false` in job config

---

## Step 8: Human Visual QA (5 minutes)

**Action**: Manually verify the 26-item TFU checklist

Open `exports/TEEI-Google-Partnership-TFU-PRINT.pdf` and verify:

### Page 1: Cover
- [ ] Full teal background (#00393F, not sand/beige)
- [ ] TEEI logo (white) in top-left
- [ ] Centered photo card (460×420pt, 24pt rounded corners)
- [ ] Title: "Together for Ukraine" (Lora Bold 60pt white)
- [ ] Subtitle: "GOOGLE PARTNERSHIP" (Roboto 14pt ALL CAPS white)

### Page 2: About + Goals
- [ ] Full-width hero photo (200pt height)
- [ ] Two-column layout (60% left, 35% right)
- [ ] "About the Partnership" headline (Lora 46pt teal)
- [ ] Light blue stats sidebar (#C9E4EC)
- [ ] 4 stat boxes (students, countries, orgs, certifications)
- [ ] Stat numbers in Lora Bold 34pt teal

### Page 3: Programs
- [ ] "Programs powered by Google" headline (Lora 46pt teal)
- [ ] Decorative underline below headline
- [ ] Two-column editorial text (NOT colored cards!)
- [ ] 3 programs: Google Cloud, Android, AI/ML
- [ ] Program names in Lora SemiBold 20pt teal
- [ ] Metrics inline (e.g., "15,000 • 92% • 78%")

### Page 4: Closing CTA
- [ ] Full teal background (#00393F)
- [ ] TFU badge (blue #3D5CA6 + yellow #FFD500 boxes)
- [ ] "Together for" (blue box) + "UKRAINE" (yellow box)
- [ ] CTA headline (Lora SemiBold 32pt white, centered)
- [ ] CTA description (Roboto 14pt white)
- [ ] 3×3 partner logo grid (white boxes)
- [ ] Google logo featured in grid
- [ ] Contact strip at bottom (Roboto 11pt white)
- [ ] TEEI logo in bottom-right

### Universal Checks
- [ ] NO gold color anywhere (#BA8F5A forbidden)
- [ ] Pure teal #00393F throughout
- [ ] Lora for all headlines
- [ ] Roboto for all body text (NOT Roboto Flex)
- [ ] No text cutoffs at page edges
- [ ] Consistent 40pt margins

**Pass Criteria**: 26/26 items checked ✓

---

## Step 9: Create Visual Baseline (Optional, 5 minutes)

**Action**: Create a reference baseline for future visual regression testing

```bash
# Only do this AFTER the PDF is approved and certified
node scripts/create-reference-screenshots.js \
  exports/TEEI-Google-Partnership-TFU-PRINT.pdf \
  google-tfu-v1

# Baseline saved to: references/google-tfu-v1/
```

**Future Validations**:
```bash
# Compare new versions against this baseline
node scripts/compare-pdf-visual.js \
  exports/TEEI-Google-Partnership-TFU-v2-PRINT.pdf \
  google-tfu-v1
```

---

## Success Criteria

✅ **TFU Certification Achieved** when ALL of the following are true:

1. **Automated Validation**: Score ≥ 140/150 (93%+)
2. **3 CRITICAL Checks**: All passing
   - Page count = 4
   - No gold color (#BA8F5A)
   - Teal color present (#00393F)
3. **Human Visual QA**: 26/26 items verified
4. **Exit Code**: `0` (validation passed)

---

## Troubleshooting

### Issue: "Script execution failed in InDesign"
**Solution**:
1. Check InDesign console (Window → Utilities → Console)
2. Verify fonts installed: `Lora` and `Roboto` (NOT Roboto Flex)
3. Run font installation: `powershell -ExecutionPolicy Bypass -File scripts/install-fonts.ps1`
4. Restart InDesign after font installation
5. Retry script

### Issue: "Page count is 3, must be 4"
**Solution**:
1. Open the generated JSX script: `exports/TEEI-Google-Partnership-TFU.jsx`
2. Find line ~144: `pagesPerDocument: 4`
3. If it says `3`, change to `4` and save
4. Re-run script in InDesign

### Issue: "Forbidden gold color detected"
**Solution**:
1. Open the JSX script
2. Search for `#BA8F5A` or `186,143,90` (gold color)
3. Replace ALL instances with `#00393F` or `0,57,63` (teal)
4. Re-run script

### Issue: "TFU badge text not found"
**Solution**:
1. Check Page 4 in PDF
2. Verify text includes "Together for" AND "UKRAINE"
3. If missing, edit JSX script lines ~575-596 (TFU badge section)
4. Re-run script

### Issue: "Partner logo grid missing"
**Options**:
1. **Add logos**: Update `data/google-partnership.json` with logo paths
2. **Skip check**: Set `"require_logo_grid": false` in job config
3. Re-validate

---

## Extending to More Partners

**Repeat this process** for each new partner:
- Microsoft → `tfu-microsoft-partnership.json` + `data/microsoft-partnership.json`
- Cornell → `tfu-cornell-partnership.json` + `data/cornell-partnership.json`
- Oxford → `tfu-oxford-partnership.json` + `data/oxford-partnership.json`

**Typical Workflow Time**:
- First partner: 60 minutes (learning curve)
- Subsequent partners: 30 minutes (copy-paste-customize)

**Batch Processing** (Future Enhancement):
```bash
# Run for all partners in one command
for partner in google microsoft cornell oxford; do
  python create_tfu_partnership_from_json.py \
    --content-json data/${partner}-partnership.json \
    --client-name "${partner^}" \
    --output-prefix exports/TEEI-${partner^}-Partnership-TFU \
    --generate-jsx
done
```

---

## Related Documentation

- **TFU Migration Summary**: `TFU-MIGRATION-COMPLETE.md` (how we got here)
- **TFU QA Commands**: `TFU-QA-COMMANDS.md` (validation reference)
- **Step 7 Runbook**: `TFU-MIGRATION-STEP-7-FINAL-VERIFICATION.md` (detailed workflow)
- **Job Template**: `example-jobs/tfu-partnership-template.json` (copy this for new partners)
- **Generator Script**: `create_tfu_partnership_from_json.py` (how it works)

---

## Summary

**You've successfully extended the TFU system to a new partner!**

**What you created**:
1. ✅ Partner-specific job config (`example-jobs/tfu-google-partnership.json`)
2. ✅ Partnership content JSON (`data/google-partnership.json`)
3. ✅ TFU-compliant JSX script (`exports/TEEI-Google-Partnership-TFU.jsx`)
4. ✅ 4-page InDesign document (`exports/TEEI-Google-Partnership-TFU.indd`)
5. ✅ Print PDF (CMYK, `exports/TEEI-Google-Partnership-TFU-PRINT.pdf`)
6. ✅ Digital PDF (RGB, `exports/TEEI-Google-Partnership-TFU-DIGITAL.pdf`)
7. ✅ TFU certification (score ≥ 140/150, all CRITICAL checks passing)

**Next Steps**:
- Share the certified PDF with stakeholders
- Use the PDF for partnership presentations
- Create visual baseline for regression testing
- Onboard the next partner (Microsoft, Cornell, Oxford, etc.)

---

**Last Updated**: 2025-11-13
**TFU System Version**: 3.0 (Multi-Partner)
**Certification Status**: Reusable for any partnership document
