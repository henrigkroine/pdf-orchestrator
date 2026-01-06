# QA Validation System Enhancements

## Implementation Summary

Enhanced the PDF Orchestrator's QA validation system with auto-fix retry logic and comprehensive verification checks.

---

## 1. Color Auto-Fix Retry Logic (orchestrator.js)

### Location
`T:\Projects\pdf-orchestrator\orchestrator.js` - `executeJob()` method

### Implementation

Added intelligent retry logic that automatically attempts to fix color violations when QA validation fails:

```javascript
// Step 4: Mandatory QA validation after export (with auto-fix retry)
if (result && result.outputPath) {
  const qaThreshold = job.qa?.threshold ?? 80;
  const autoFixEnabled = job.qa?.auto_fix_colors ?? false;

  let qaReport;
  let firstAttemptScore = null;

  try {
    // First QA validation attempt
    console.log('[Orchestrator] Running initial QA validation...');
    qaReport = await this.validatePdf(result.outputPath, qaThreshold);

    return { ...result, runId, timestamp: new Date().toISOString(), qa: qaReport };

  } catch (qaError) {
    // QA failed on first attempt
    firstAttemptScore = this.extractScoreFromError(qaError);
    
    if (autoFixEnabled && workerType === 'mcp') {
      console.log('[Orchestrator] ⚠️  QA validation failed (score: ' + (firstAttemptScore || 'unknown') + ')');
      console.log('[Orchestrator] 🔧 auto_fix_colors enabled - attempting color correction retry...');

      try {
        // Re-export with color auto-fix enabled
        result = await this.workers.mcp.execute({
          ...job,
          qa: { ...job.qa, force_color_fix: true }
        });

        // Second QA validation attempt
        console.log('[Orchestrator] Running QA validation after color fix...');
        qaReport = await this.validatePdf(result.outputPath, qaThreshold);

        console.log('[Orchestrator] ✅ Auto-fix successful! QA passed on retry.');
        return {
          ...result,
          runId,
          timestamp: new Date().toISOString(),
          qa: {
            ...qaReport,
            auto_fix_applied: true,
            first_attempt_score: firstAttemptScore
          }
        };

      } catch (retryError) {
        const secondAttemptScore = this.extractScoreFromError(retryError);
        console.error('[Orchestrator] ❌ Auto-fix retry failed');
        console.error(`[Orchestrator] First attempt score: ${firstAttemptScore || 'unknown'}`);
        console.error(`[Orchestrator] Second attempt score: ${secondAttemptScore || 'unknown'}`);
        
        throw new Error(
          `QA validation failed after auto-fix retry. ` +
          `First score: ${firstAttemptScore || 'unknown'}, ` +
          `Second score: ${secondAttemptScore || 'unknown'}`
        );
      }
    } else {
      // Auto-fix not enabled or not MCP worker
      console.error('[Orchestrator] QA validation failed, job execution failed:', qaError.message);
      throw qaError;
    }
  }
}
```

### Helper Method Added

```javascript
/**
 * Extract score from QA validation error message
 * @param {Error} error - QA validation error
 * @returns {number|null} - Extracted score or null
 */
extractScoreFromError(error) {
  const scoreMatch = error.message.match(/Score (\d+)/);
  return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
}
```

### How It Works

1. **First QA Attempt**: Runs `validatePdf()` after MCP worker export
2. **Failure Detection**: If QA fails, checks if `auto_fix_colors` is enabled in job config
3. **Auto-Fix Retry**: If enabled, re-runs MCP worker with `force_color_fix: true` flag
4. **Second QA Attempt**: Validates the re-exported PDF
5. **Result Tracking**: Includes both scores in final output if auto-fix was applied
6. **Blocking Failure**: Throws error if both attempts fail, preventing bad PDFs from being delivered

### Usage in Job Specs

```json
{
  "jobType": "partnership",
  "humanSession": true,
  "qa": {
    "enabled": true,
    "threshold": 80,
    "auto_fix_colors": true
  },
  "output": {
    "quality": "high"
  }
}
```

---

## 2. Enhanced Verification Script (verify-mcp-routing.ps1)

### Location
`T:\Projects\pdf-orchestrator\scripts\verify-mcp-routing.ps1`

### New Checks Added

#### Check 6: Font Installation Verification

```powershell
# Check 6: Font installation verification
Write-Host "`n[6/7] Checking TEEI brand fonts installation..." -ForegroundColor Yellow

# Checks:
# 1. Font installer script exists (install-fonts.ps1)
# 2. Font source directory has .ttf files
# 3. Fonts are installed in Windows\Fonts
# 4. Counts installed vs. expected fonts
```

**Verification Logic**:
- ✅ **All fonts installed**: All TEEI brand fonts (Lora, Roboto) are present
- ⚠️ **Partial installation**: Some fonts missing (shows count)
- ❌ **No fonts installed**: TEEI fonts not found in system

**Output Example**:
```
[6/7] Checking TEEI brand fonts installation...
  ✅ Font installer script found
  ✅ Found 8 font files in source directory
  ✅ All TEEI brand fonts are installed (8/8)
```

#### Check 7: World-Class CLI Verification

```powershell
# Check 7: World-class CLI verification (optional)
Write-Host "`n[7/7] Checking world-class CLI availability..." -ForegroundColor Yellow

$worldClassCliPath = "T:\Projects\pdf-orchestrator\world_class_cli.py"
if (Test-Path $worldClassCliPath) {
    Write-Host "  ✅ World-class CLI found: $worldClassCliPath" -ForegroundColor Green
}
```

**Purpose**: Verifies that the premium Python CLI is available for highest-quality document generation.

### Updated Summary Section

Added automatic recommendations for font installation:

```powershell
if ($issues -like "*TEEI brand fonts*" -or $issues -like "*font*") {
    Write-Host "4. INSTALL TEEI BRAND FONTS:" -ForegroundColor Cyan
    Write-Host "   Run the font installer (requires Administrator):" -ForegroundColor Gray
    Write-Host "   cd 'T:\Projects\pdf-orchestrator\scripts'" -ForegroundColor Gray
    Write-Host "   .\install-fonts.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Then RESTART INDESIGN to load new fonts!" -ForegroundColor Yellow
}
```

---

## 3. Existing Font Installer Script

### Location
`T:\Projects\pdf-orchestrator\scripts\install-fonts.ps1`

### Features
- ✅ Auto-installs Lora and Roboto fonts for TEEI brand compliance
- ✅ Checks for Administrator privileges
- ✅ Skips already-installed fonts
- ✅ Registers fonts in Windows Registry
- ✅ Provides installation summary

### Usage

```powershell
# Run as Administrator
cd "T:\Projects\pdf-orchestrator\scripts"
.\install-fonts.ps1
```

### Output
```
========================================
TEEI Brand Fonts Installation Script
========================================

Found 8 font files to install

✅ INSTALLED: Lora-Regular.ttf
✅ INSTALLED: Lora-Bold.ttf
✅ INSTALLED: RobotoFlex-Regular.ttf
...

========================================
Installation Summary
========================================
✅ Installed: 8
⏭️  Skipped: 0 (already present)
❌ Failed: 0

⚠️  IMPORTANT: Restart InDesign to load new fonts!
```

---

## 4. Blocking QA Validation (Verified)

### Existing Implementation
The `validatePdf()` method already properly blocks execution on QA failures:

```javascript
if (report.score < threshold) {
  console.error(`[Orchestrator] ❌ QA validation failed: Score ${report.score} below threshold ${threshold}`);
  return reject(new Error(
    `QA validation failed: Score ${report.score}/${report.max_score} (${report.percentage}%) ` +
    `is below required threshold of ${threshold}. Rating: ${report.rating}`
  ));
}
```

### Error Flow
1. **Python validator** (`validate_document.py`) calculates QA score
2. **orchestrator.js** receives score and compares to threshold
3. **Promise rejection** with detailed error message if below threshold
4. **Try-catch in executeJob()** catches rejection and throws error
5. **Job fails** - no PDF is returned if QA doesn't pass

### Error Message Format
```
QA validation failed: Score 72/100 (72%) is below required threshold of 80. Rating: Good
```

---

## 5. Configuration Files

### Auto-Fix Config
`T:\Projects\pdf-orchestrator\config\auto-fix-config.json`

Already contains comprehensive auto-fix rules for:
- ✅ Color violations (forbidden colors, mismatches)
- ✅ Typography (font family, size, line height)
- ✅ Layout (text cutoff, page dimensions)
- ✅ Spacing (inconsistent spacing, logo clearspace)
- ⚠️ Content (placeholder text - requires AI generation)
- ⚠️ Accessibility (alt text - requires AI generation)

**Key Settings**:
```json
{
  "auto_fix": {
    "enabled": true,
    "require_approval": true,
    "max_fixes_per_run": 50,
    "rollback_on_failure": true
  },
  "fixable_violations": {
    "color": {
      "auto": true,
      "risk": "low",
      "require_approval": false
    }
  }
}
```

### Orchestrator Config
`T:\Projects\pdf-orchestrator\config\orchestrator.config.json`

**Routing Rules** (already configured):
```json
{
  "routing": {
    "defaultWorker": "mcp",
    "rules": [
      {
        "condition": "humanSession === true",
        "worker": "mcp"
      },
      {
        "condition": "output.quality === 'high'",
        "worker": "mcp"
      },
      {
        "condition": "jobType === 'partnership' || jobType === 'program' || jobType === 'report'",
        "worker": "mcp",
        "reason": "Premium document types require MCP worker with mandatory QA"
      }
    ]
  }
}
```

---

## Usage Examples

### Example 1: Job with Auto-Fix Retry

```json
{
  "jobType": "partnership",
  "humanSession": true,
  "data": {
    "title": "AWS Partnership Document",
    "content": { ... }
  },
  "qa": {
    "enabled": true,
    "threshold": 80,
    "auto_fix_colors": true
  },
  "output": {
    "quality": "high",
    "format": "pdf"
  }
}
```

**Execution Flow**:
1. MCP worker generates PDF
2. QA validation runs (score: 75 - FAIL)
3. Auto-fix detects `auto_fix_colors: true`
4. MCP worker re-generates PDF with color corrections
5. QA validation runs again (score: 88 - PASS)
6. Returns PDF with QA report including both scores

### Example 2: Verification Script Usage

```powershell
# Run comprehensive verification
cd "T:\Projects\pdf-orchestrator\scripts"
.\verify-mcp-routing.ps1
```

**Output**:
```
========================================
PDF ORCHESTRATOR MCP ROUTING VERIFICATION
========================================

[1/7] Checking MCP Proxy Health...
  ✅ MCP Proxy is running on port 8013

[2/7] Checking orchestrator.config.json...
  ✅ Config file exists

[3/7] Checking defaultWorker setting...
  ✅ defaultWorker is set to 'mcp'

[4/7] Checking routing rules...
  ✅ Found rule for 'partnership' routing to MCP
  ✅ Found rule for 'program' routing to MCP
  ✅ Found rule for 'report' routing to MCP

[5/7] Checking InDesign MCP Agent...
  ✅ InDesign MCP Agent shows recent connection

[6/7] Checking TEEI brand fonts installation...
  ✅ Font installer script found
  ✅ Found 8 font files in source directory
  ✅ All TEEI brand fonts are installed (8/8)

[7/7] Checking world-class CLI availability...
  ✅ World-class CLI found: T:\Projects\pdf-orchestrator\world_class_cli.py

========================================
VERIFICATION SUMMARY
========================================

🟢 ALL CHECKS PASSED - MCP ROUTING IS CONFIGURED CORRECTLY

Your orchestrator will route premium documents through MCP!
```

---

## Benefits

### 1. **Automatic Quality Recovery**
- Failed QA validations can now auto-fix color violations
- Reduces manual intervention for common issues
- Maintains high quality standards

### 2. **Comprehensive Pre-flight Checks**
- Verifies MCP proxy health
- Validates routing configuration
- Checks font installation status
- Confirms InDesign connectivity
- Verifies world-class CLI availability

### 3. **Transparent Retry Logic**
- Logs both QA scores (before/after fix)
- Clear indication when auto-fix is applied
- Detailed error messages when both attempts fail

### 4. **Blocking Quality Gates**
- QA validation failures block job completion
- No bad PDFs delivered to production
- Error messages include score and threshold details

### 5. **Developer Experience**
- Single script to verify entire system (`verify-mcp-routing.ps1`)
- Automatic recommendations for fixing issues
- Clear status indicators (✅ ⚠️ ❌)

---

## Testing Recommendations

### Test 1: Auto-Fix Retry
```bash
# Create test job with intentional color violation
node orchestrator.js test-jobs/color-violation-test.json

# Expected: First QA fails, auto-fix triggers, second QA passes
```

### Test 2: Font Verification
```powershell
# Check font status
.\scripts\verify-mcp-routing.ps1

# If fonts missing, install them
.\scripts\install-fonts.ps1

# Restart InDesign and re-verify
.\scripts\verify-mcp-routing.ps1
```

### Test 3: QA Blocking
```bash
# Job with quality issues and auto-fix disabled
node orchestrator.js test-jobs/low-quality-no-fix.json

# Expected: QA fails, job throws error, no PDF returned
```

---

## Files Modified

1. **T:\Projects\pdf-orchestrator\orchestrator.js**
   - Added auto-fix retry logic to `executeJob()`
   - Added `extractScoreFromError()` helper method
   - Enhanced error messages with both scores

2. **T:\Projects\pdf-orchestrator\scripts\verify-mcp-routing.ps1**
   - Added Check 6: Font installation verification
   - Added Check 7: World-class CLI verification
   - Updated summary section with font installation guidance
   - Changed check count from 5 to 7

3. **T:\Projects\pdf-orchestrator\QA-VALIDATION-ENHANCEMENTS.md** (NEW)
   - This documentation file

---

## Next Steps

1. **Test auto-fix retry** with real partnership document
2. **Run verification script** to ensure all checks pass
3. **Install fonts if needed** using `install-fonts.ps1`
4. **Monitor QA scores** in production to track auto-fix effectiveness
5. **Consider adding retry logic** for typography violations (future enhancement)

---

## Related Documentation

- **MCP Routing Guide**: `T:\Projects\pdf-orchestrator\QUICK-START-MCP-ROUTING.md`
- **Auto-Fix Config**: `T:\Projects\pdf-orchestrator\config\auto-fix-config.json`
- **Font Installer**: `T:\Projects\pdf-orchestrator\scripts\install-fonts.ps1`
- **QA Validator**: `T:\Projects\pdf-orchestrator\validate_document.py`
- **World-Class CLI**: `T:\Projects\pdf-orchestrator\world_class_cli.py`

---

**Implementation Date**: 2025-11-10  
**Status**: ✅ Complete and Ready for Testing
