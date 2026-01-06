# A+ Quality Verification Checklist

**Purpose**: Step-by-step verification that PDF Orchestrator produces A+ quality (90-94) or World-Class (95-100) premium documents.

**Context**: Premium partnership, program, and report documents MUST meet validation threshold with all brand compliance requirements satisfied.

**Quality Tiers**:
- **A+ Quality** (90-94): Premium production-ready documents
- **World-Class** (95-100): Top-tier partnerships (AWS, Google) - requires `worldClass: true` flag

---

## Pre-Flight Checks (Before Job Submission)

### 1. Environment Setup

```powershell
# Verify MCP proxy is running
curl http://localhost:8013/health
# Expected: {"status":"ok"}
```

✅ **PASS**: Proxy returns status:ok
❌ **FAIL**: Start proxy with `cd T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket && node proxy.js`

---

### 2. InDesign MCP Agent Connection

**Steps**:
1. Open Adobe InDesign
2. Navigate to: Window → Utilities → InDesign MCP Agent
3. Click "Connect" button
4. Verify connection status shows: "Connected with ID: [socket-id]"

✅ **PASS**: Plugin shows green "Connected" status
❌ **FAIL**: Restart InDesign, ensure proxy started first, then reconnect

---

### 3. Configuration Validation

```powershell
cd "T:\Projects\pdf-orchestrator"

# Check default worker
$config = Get-Content "config\orchestrator.config.json" | ConvertFrom-Json
$config.routing.defaultWorker
# Expected: "mcp"

# Check validation threshold
$config.qa.threshold
# Expected: 90 (A+ quality) OR 95 (World-Class when worldClass: true)

# Check export preset
$config.export.pdfPreset
# Expected: "High Quality Print"

# Check fonts embedded
$config.qa.fonts_embedded
# Expected: true
```

✅ **PASS**: All values match expected
❌ **FAIL**: Update config file with correct values

---

### 4. Claude Code MCP Tools Available

**Verify InDesign MCP tool is listed**:
1. Open Claude Code
2. Check Tools panel (usually on left side)
3. Search for "indesign" or "mcp"
4. Confirm tools like `create_document`, `apply_color`, `export_document` are available

✅ **PASS**: InDesign MCP tools listed in tools panel
❌ **FAIL**: Restart Claude Code, verify .claude/mcp.json includes InDesign MCP server

---

## Job Submission Checks

### 5. Job Spec Requirements

**Review job JSON file** (e.g., `world-class-sample.json`):

```json
{
  "jobType": "report",           // ✅ Must be partnership/program/report
  "humanSession": true,           // ✅ Forces MCP routing
  "worldClass": true,             // ✅ Enables top-tier mode (optional)
  "output": {
    "quality": "high",            // ✅ Triggers advanced typography
    "intent": "print"             // ✅ Required for world-class (print: 300 DPI CMYK)
  },
  "export": {
    "pdfPreset": "High Quality Print"  // ✅ 300 DPI, CMYK, fonts embedded
  },
  "qa": {
    "enabled": true,              // ✅ Validation enabled
    "threshold": 95,              // ✅ World-Class (95) OR A+ (90)
    "fonts_embedded": true        // ✅ No missing fonts
  }
}
```

**Note**: When `worldClass: true`, threshold should be 95 (not 90) for 100% world-class compliance.

✅ **PASS**: All required fields present with correct values
❌ **FAIL**: Add missing fields or correct values

---

### 6. Template File Exists

```powershell
# Verify template exists
Test-Path "T:\Projects\pdf-orchestrator\templates\reports\annual-report.indt"
# Expected: True
```

✅ **PASS**: Template file exists (.indt for InDesign)
❌ **FAIL**: Create template or use existing template ID from template-registry.json

---

## Execution Monitoring

### 7. Router Trace Verification

**Run job**:
```bash
node orchestrator.js example-jobs\world-class-sample.json
```

**Watch console output for**:

```
[ROUTER] Evaluating routing rules...
[ROUTER] Rule matched: jobType === 'report'
[ROUTER] Selected worker: mcp          ← ✅ CRITICAL: Must say "mcp"
[ROUTER] Reason: Premium documents require MCP for quality control
```

✅ **PASS**: Router selects "mcp" worker
❌ **FAIL**: Check routing rules in orchestrator.config.json

---

### 8. Export Preset Logged

**Watch for**:
```
[MCP] Connecting to MCP server...
[MCP] Job submitted successfully
[MCP] Export preset: High Quality Print   ← ✅ CRITICAL: Must be "High Quality Print"
[MCP] World-class mode: ENABLED
```

✅ **PASS**: Export preset is "High Quality Print"
❌ **FAIL**: Check job spec export.pdfPreset value

---

### 9. Validation Execution

**Watch for**:
```
[QA] Starting validation...
[QA] Validation threshold: 95 (World-Class) ← ✅ CRITICAL: Must be 95 (World-Class) OR 90 (A+)
[QA] Intent-aware validation: print (300 DPI CMYK)
[QA] Checking PDF structure...
[QA] Checking content completeness...
[QA] Checking visual hierarchy...
[QA] Checking brand colors...
```

✅ **PASS**: Validation runs with threshold 90
❌ **FAIL**: Check qa.threshold in job spec or config

---

## Post-Execution Validation

### 10. Validation Report - Total Score

**Check final output**:
```
[QA] Validation complete
[QA] Final score: 96/100        ← ✅ CRITICAL: Must be >= threshold (95 or 90)
[QA] Status: ✅ PASSED
```

✅ **PASS**: Score >= threshold (95 for World-Class, 90 for A+)
❌ **FAIL**: Review detailed validation report in exports/validation-reports/

---

### 11. Fonts Embedded Check

**Verify fonts embedded**:
```
[QA] Fonts embedded: true       ← ✅ CRITICAL: Must be true
[QA] Missing fonts: []          ← ✅ CRITICAL: Must be empty
```

**Manual verification** (if needed):
```powershell
# Use PDF tool to inspect fonts
# All fonts should show "Embedded: Yes"
```

✅ **PASS**: All fonts embedded
❌ **FAIL**: Check export preset, may need to re-export with "Embed All Fonts" option

---

### 12. Forbidden Colors Absent

**Check validation report**:
```
[QA] Brand color validation...
[QA] Primary color present: Nordshore (#00393F)   ← ✅ Required
[QA] Forbidden colors found: []                   ← ✅ CRITICAL: Must be empty
```

**Forbidden colors that should NEVER appear**:
- Copper (#C87137)
- Orange (#FF6600)
- Bright Red (#FF0000)
- Lime Green (#00FF00)

✅ **PASS**: No forbidden colors detected
❌ **FAIL**: Review color usage, replace with TEEI brand colors

---

### 13. PDF File Output

**Verify output file**:
```powershell
# Check file exists
Test-Path "T:\Projects\pdf-orchestrator\exports\TEEI-AWS-Partnership-Overview-WorldClass.pdf"
# Expected: True

# Check file size (should be > 1MB for premium docs)
(Get-Item "T:\Projects\pdf-orchestrator\exports\TEEI-AWS-Partnership-Overview-WorldClass.pdf").Length / 1MB
# Expected: > 1.0
```

✅ **PASS**: File exists and size > 1MB
❌ **FAIL**: Check logs for export errors

---

## Detailed Validation Breakdown

### 14. Structure Validation (0-25 points)

**Expected checks**:
- ✅ File exists and valid PDF
- ✅ File size > 1KB
- ✅ Page count > 0
- ✅ Text extractable
- ✅ Valid dimensions (standard page sizes)
- ✅ Fonts embedded
- ✅ Correct color space (RGB or CMYK)

**Target**: 23-25 points (92-100%)

---

### 15. Content Validation (0-25 points)

**Expected checks**:
- ✅ Organization name present (TEEI)
- ✅ Partner name included (if applicable)
- ✅ Date present
- ✅ Contact information visible
- ✅ Minimum 3 sections
- ✅ Key metrics/data visible

**Target**: 23-25 points (92-100%)

---

### 16. Visual Hierarchy Validation (0-30 points)

**Expected checks**:
- ✅ Header section detected
- ✅ Footer section detected
- ✅ 3+ different text sizes
- ✅ 25%+ whitespace
- ✅ WCAG AA contrast (4.5:1 minimum)
- ✅ Images at 72+ DPI (print: 300+ DPI)
- ✅ Even content distribution

**Target**: 27-30 points (90-100%)

---

### 17. Brand Colors Validation (0-20 points)

**Expected checks**:
- ✅ Primary color present (Nordshore #00393F)
- ✅ At least one secondary color (Teal/Gold)
- ✅ No forbidden colors
- ✅ Color palette consistency >80%
- ✅ 4+ color swatches defined

**Target**: 18-20 points (90-100%)

---

## Troubleshooting Failed Validations

### Score 80-89 (A, not A+)

**Common Issues**:
- Whitespace ratio slightly low
- One forbidden color detected
- Font not fully embedded
- Image quality 200 DPI (needs 300 DPI)

**Fix**: Review validation report details, address specific issues

---

### Score 70-79 (B)

**Common Issues**:
- Missing primary color (Nordshore)
- Multiple forbidden colors
- Poor contrast (<4.5:1)
- No header/footer sections

**Fix**: Major color/layout revisions needed

---

### Score <70 (C or F)

**Common Issues**:
- Generic template used (not TEEI branded)
- Wrong worker used (PDF Services instead of MCP)
- Job routed incorrectly

**Fix**: Verify routing configuration, re-submit with correct job spec

---

## Quick Command Reference

```powershell
# Start proxy (must run first!)
cd "T:\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket"
node proxy.js

# Check proxy health
curl http://localhost:8013/health

# Run verification script
cd "T:\Projects\pdf-orchestrator"
.\scripts\verify-mcp-routing.ps1

# Test with world-class sample
node orchestrator.js example-jobs\world-class-sample.json

# Check validation report
Get-Content "exports\validation-reports\TEEI-AWS-Partnership-Overview-WorldClass-report.json" | ConvertFrom-Json

# View detailed logs
Get-Content "logs\mcp\adobe-indesign.log" -Tail 50
```

---

## Final Quality Criteria

### A+ Quality Standards (90-94)

Your PDF meets A+ quality standards when:

✅ **Router trace shows**: `selected: mcp`
✅ **Export preset logged**: `"High Quality Print"`
✅ **Validator report returns**: `total >= 90`
✅ **Intent verification**: `output.intent` matches expected (print/screen)
✅ **Fonts embedded**: `true`
✅ **Forbidden colors**: `[]` (none found)
✅ **File size**: > 1MB (high-resolution images)
✅ **All validation tiers**: ≥ 90% of maximum points
✅ **Visual inspection**: Matches TEEI brand guidelines

### World-Class Standards (95-100)

Your PDF meets World-Class standards when:

✅ **All A+ criteria above** PLUS:
✅ **worldClass flag**: `true` in job spec
✅ **Validator threshold**: `qa.threshold: 95` (explicit, not 90)
✅ **Intent required**: `output.intent: "print"` (MANDATORY for world-class)
✅ **Validator report**: `total >= 95`
✅ **MCP mutex verified**: Console shows serialized execution (no parallel jobs)
✅ **Export preset verified**: Console logs preset name before export
✅ **Enhanced typography**: Roboto Flex variable font used
✅ **Advanced color harmony**: TEEI 7-color palette with consistency check
✅ **Grid system**: 12-column grid, 40pt margins minimum

---

## Related Documentation

- **Full System Docs**: T:\Obsidian\Henrik_Vault_2025Q4\PDF Builder\PDF-Orchestrator-Complete-Documentation.md
- **Quick Start**: T:\Projects\pdf-orchestrator\QUICK-START-MCP-ROUTING.md
- **Brand Guidelines**: T:\Projects\pdf-orchestrator\reports\TEEI_AWS_Design_Fix_Report.md
- **CLAUDE.md**: C:\Users\ovehe\.claude\CLAUDE.md (PDF Orchestrator section)

---

**Last Updated**: 2025-11-10
**Checklist Version**: 2.0
**Quality Tiers**: A+ (90-94) | World-Class (95-100)
**Key Updates**: Added world-class threshold (95), intent verification, MCP mutex check, export preset verification
