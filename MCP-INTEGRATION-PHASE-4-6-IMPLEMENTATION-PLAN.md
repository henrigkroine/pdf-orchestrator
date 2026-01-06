# MCP Integration - Phase 4-6 Implementation Plan

**Date**: 2025-11-13
**Status**: Phase 3 Complete → Ready for Phase 4-6
**Context**: Phase 3 successfully integrated MCP Manager into orchestrator.js. Now need to enhance QA pipeline and add MCP server stubs.

---

## Current QA Flow Analysis

### pipeline.py (Lines 1-436)
**Current behavior:**
- Connects to InDesign (line 317)
- Checks document status (line 322)
- Validates colors (line 328)
- Exports documents (lines 338-343)
- Validates exported PDF using DocumentValidator (lines 349-363)
- Generates and saves report (lines 365-367)

**Key limitation:** REQUIRES InDesign connection and open document

### orchestrator.js validatePdf() (Line 301)
**Current behavior:**
- Spawns Python process: `python validate_document.py <pdf_path> --json`
- Parses JSON output
- Checks score against threshold
- Throws error if validation fails

**Does NOT use pipeline.py** - calls validate_document.py directly

### validate_document.py (Lines 1-100+)
**Current behavior:**
- Accepts: `pdf_path`, optional `--job-config`, `--json` flag
- Validates structure, content, colors, typography
- TFU mode: 150 points (125 base + 25 TFU compliance)
- Standard mode: 125 points
- Returns JSON with detailed scores

### compare-pdf-visual.js (Lines 1-562)
**Current behavior:**
- Accepts: `<test-pdf>` `<reference-name>`
- Loads reference from `references/<name>/`
- Compares pixel-by-pixel with pixelmatch
- Writes JSON to `comparisons/<name>-<timestamp>/comparison-report.json`
- Exit codes: 0 (pass), 1 (fail if critical/major diffs)

---

## Phase 4 Implementation Plan

### 4.1 Analysis ✅ COMPLETE

**Findings:**
- orchestrator.js calls validate_document.py directly (NOT pipeline.py)
- pipeline.py is currently InDesign-centric
- Visual regression tool (compare-pdf-visual.js) is standalone
- Need to either:
  - Option A: Extend pipeline.py with validation-only mode
  - Option B: Create new validation orchestrator script
  - **Recommendation**: Option A (extend pipeline.py) for consistency

---

### 4.2 Add Validation-Only Mode to pipeline.py

**Goal:** Enable pipeline.py to validate pre-existing PDFs without InDesign

**Implementation:**

#### Add CLI Arguments (after line 411):
```python
parser.add_argument(
    "--validate-only",
    action="store_true",
    help="Validation-only mode: skip InDesign export, validate existing PDF(s)"
)
parser.add_argument(
    "--pdf",
    "--pdf-path",
    help="Path to PDF file to validate (required if --validate-only)"
)
parser.add_argument(
    "--job-config",
    help="Path to job JSON config (for TFU compliance checks)"
)
parser.add_argument(
    "--visual-baseline",
    help="Reference name for visual regression testing (e.g. 'teei-aws-tfu-v1')"
)
parser.add_argument(
    "--max-visual-diff",
    type=float,
    default=5.0,
    help="Maximum allowed visual difference percentage (default: 5%%)"
)
```

#### Modify run() method (line 311):
```python
def run(self) -> bool:
    """Execute the complete pipeline"""
    print("\n🚀 Starting InDesign Export & Analysis Pipeline")
    print("=" * 60)

    # NEW: Check for validation-only mode
    if self.config.get("validate_only"):
        return self.run_validation_only()

    # EXISTING: Full export + validation mode
    # Step 1: Connect to InDesign
    if not self.connect_to_indesign():
        print("❌ Failed to connect to InDesign. Ensure it's running.")
        return False
    # ... rest of existing logic
```

#### Add new run_validation_only() method (after line 377):
```python
def run_validation_only(self) -> bool:
    """Execute validation-only pipeline (no InDesign export)"""
    print("[Pipeline] Running in VALIDATION-ONLY mode")
    print("[Pipeline] Skipping InDesign connection and export steps")

    pdf_path = self.config.get("pdf_path")
    if not pdf_path:
        print("❌ ERROR: --pdf required in validation-only mode")
        return False

    if not os.path.exists(pdf_path):
        print(f"❌ ERROR: PDF not found: {pdf_path}")
        return False

    print(f"📄 Validating: {pdf_path}")
    self.log_step("Locate PDF", True, pdf_path)

    # Step 1: Run core document validation
    validation_report = self.validate_pdf(pdf_path)
    score = validation_report.get("score", 0)
    threshold = self.config["validation_threshold"]

    if score >= threshold:
        print(f"✅ Document Validation PASSED (Score: {score}/{validation_report.get('max_score', 100)})")
        self.results["success"] = True
    else:
        print(f"❌ Document Validation FAILED (Score: {score}/{validation_report.get('max_score', 100)})")
        print(f"   Minimum required: {threshold}")
        self.results["success"] = False

    self.results["score"] = score

    # Step 2: Run visual regression if baseline specified
    visual_baseline = self.config.get("visual_baseline")
    if visual_baseline:
        visual_passed = self.run_visual_regression(pdf_path, visual_baseline)
        if not visual_passed:
            print("❌ Visual regression test FAILED")
            self.results["success"] = False

    # Step 3: Generate and save report
    report = self.generate_report()
    report_path = self.save_report(report)
    print(f"\n📊 Report saved: {report_path}")

    # Step 4: Send notification (if configured)
    if self.config.get("notification_webhook"):
        self.notify_webhook(validation_report)

    # Print summary
    print("\n" + report)

    return self.results["success"]
```

#### Update main() to pass new args (line 413-428):
```python
args = parser.parse_args()

# Override config with CLI arguments
config_overrides = {}
if args.ci:
    config_overrides["ci_mode"] = True
if args.threshold:
    config_overrides["validation_threshold"] = args.threshold
if args.export_formats:
    config_overrides["export_formats"] = args.export_formats
if args.no_fix:
    config_overrides["auto_fix_colors"] = False

# NEW: Validation-only mode arguments
if args.validate_only:
    config_overrides["validate_only"] = True
if args.pdf:
    config_overrides["pdf_path"] = args.pdf
if args.job_config:
    config_overrides["job_config_path"] = args.job_config
if args.visual_baseline:
    config_overrides["visual_baseline"] = args.visual_baseline
if args.max_visual_diff is not None:
    config_overrides["max_visual_diff"] = args.max_visual_diff
```

---

### 4.3 Integrate Visual Regression Gating

**Goal:** Call compare-pdf-visual.js from pipeline.py and enforce thresholds

**Implementation:**

#### Add run_visual_regression() method (after run_validation_only):
```python
def run_visual_regression(self, pdf_path: str, baseline_name: str) -> bool:
    """Run visual regression testing against baseline"""
    print(f"\n📸 Running visual regression test against: {baseline_name}")

    script_path = os.path.join(os.path.dirname(__file__), 'scripts', 'compare-pdf-visual.js')
    if not os.path.exists(script_path):
        print("⚠️  WARNING: compare-pdf-visual.js not found, skipping visual regression")
        return True  # Don't fail pipeline if script missing

    try:
        result = subprocess.run(
            ['node', script_path, pdf_path, baseline_name],
            capture_output=True,
            text=True,
            timeout=120
        )

        # Parse comparison report JSON
        comparison_dir = self._find_latest_comparison_dir(baseline_name)
        if comparison_dir:
            report_path = os.path.join(comparison_dir, 'comparison-report.json')
            if os.path.exists(report_path):
                with open(report_path, 'r') as f:
                    comparison_data = json.load(f)

                # Extract average diff percentage
                avg_diff = comparison_data.get('summary', {}).get('avgDiffPercent', 0)
                max_allowed = self.config.get("max_visual_diff", 5.0)

                print(f"   Average diff: {avg_diff:.2f}%")
                print(f"   Max allowed: {max_allowed}%")

                if avg_diff > max_allowed:
                    print(f"❌ Visual regression FAILED: {avg_diff:.2f}% > {max_allowed}%")
                    self.log_step("Visual Regression", False, f"Diff {avg_diff:.2f}% exceeds {max_allowed}%")
                    return False
                else:
                    print(f"✅ Visual regression PASSED: {avg_diff:.2f}% ≤ {max_allowed}%")
                    self.log_step("Visual Regression", True, f"Diff {avg_diff:.2f}%")
                    return True

        # Fallback: Check exit code
        if result.returncode == 0:
            print("✅ Visual regression PASSED")
            self.log_step("Visual Regression", True)
            return True
        else:
            print("❌ Visual regression FAILED")
            self.log_step("Visual Regression", False, result.stderr)
            return False

    except subprocess.TimeoutExpired:
        print("⚠️  Visual regression timed out")
        self.log_step("Visual Regression", False, "Timeout")
        return False
    except Exception as e:
        print(f"⚠️  Visual regression error: {e}")
        self.log_step("Visual Regression", False, str(e))
        return False

def _find_latest_comparison_dir(self, baseline_name: str) -> Optional[str]:
    """Find latest comparison directory for baseline"""
    comparisons_dir = os.path.join(os.path.dirname(__file__), 'comparisons')
    if not os.path.exists(comparisons_dir):
        return None

    matching_dirs = [
        d for d in os.listdir(comparisons_dir)
        if d.startswith(baseline_name)
    ]

    if not matching_dirs:
        return None

    # Sort by timestamp (assuming format: baseline-YYYYMMDD-HHMMSS)
    latest = sorted(matching_dirs)[-1]
    return os.path.join(comparisons_dir, latest)
```

---

### 4.4 Create QA Scorecard JSON

**Goal:** Aggregate all QA results into single JSON file

**Implementation:**

#### Enhance save_report() method (line 248):
```python
def save_report(self, report: str, path: str = None) -> str:
    """Save report to file"""
    if not path:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        job_id = self.config.get("job_id", "unknown")
        reports_dir = os.path.join(os.path.dirname(__file__), 'reports', 'pipeline')
        os.makedirs(reports_dir, exist_ok=True)
        path = os.path.join(reports_dir, f"pipeline_report_{job_id}_{timestamp}.txt")

    with open(path, 'w') as f:
        f.write(report)

    # NEW: Generate QA scorecard JSON
    scorecard_path = path.replace('.txt', '-scorecard.json')
    scorecard = self._generate_scorecard()
    with open(scorecard_path, 'w') as f:
        json.dump(scorecard, f, indent=2, default=str)

    print(f"📊 Scorecard JSON: {scorecard_path}")

    # Existing: Also save full JSON version
    json_path = path.replace('.txt', '.json')
    with open(json_path, 'w') as f:
        json.dump(self.results, f, indent=2, default=str)

    return path

def _generate_scorecard(self) -> Dict:
    """Generate compact QA scorecard"""
    # Find validation report in results
    validation_step = next(
        (s for s in self.results["steps"] if s["name"] == "Validate PDF"),
        None
    )

    # Find visual regression step
    visual_step = next(
        (s for s in self.results["steps"] if s["name"] == "Visual Regression"),
        None
    )

    scorecard = {
        "jobId": self.config.get("job_id", "unknown"),
        "jobName": self.config.get("job_name", ""),
        "pdfPath": self.config.get("pdf_path", ""),
        "timestamp": self.results["timestamp"],

        # Core validation scores
        "totalScore": self.results.get("score", 0),
        "maxScore": 150 if self.config.get("design_system") == "tfu" else 125,
        "threshold": self.config["validation_threshold"],

        # TFU compliance (if applicable)
        "tfuCompliance": self.config.get("design_system") == "tfu",

        # Visual regression
        "visualDiffPercent": None,
        "maxVisualDiffAllowed": self.config.get("max_visual_diff", 5.0),
        "visualBaseline": self.config.get("visual_baseline"),

        # Overall result
        "passed": self.results["success"],
        "steps": len(self.results["steps"]),
        "failedSteps": len([s for s in self.results["steps"] if not s["success"]])
    }

    # Extract visual diff if available
    if visual_step and "details" in visual_step:
        # Parse "Diff X.XX%" from details
        import re
        match = re.search(r"Diff ([\d.]+)%", visual_step.get("details", ""))
        if match:
            scorecard["visualDiffPercent"] = float(match.group(1))

    return scorecard
```

---

### 4.5 Align Orchestrator QA Calls

**Goal:** Make orchestrator.js use the new pipeline.py validation-only mode for MCP jobs

**Current state:** orchestrator.js calls `validate_document.py` directly
**New behavior:** For MCP Manager jobs, optionally use `pipeline.py --validate-only`

**Implementation (orchestrator.js):**

#### Option A: Keep current behavior (minimal change)
- orchestrator.js continues calling validate_document.py directly
- pipeline.py validation-only mode is for manual/CLI usage
- **Advantage:** No orchestrator changes needed
- **Disadvantage:** Visual regression not integrated into orchestrator flow

#### Option B: Route to pipeline.py (recommended)
Modify orchestrator.js validatePdf() method (line 301):

```javascript
async validatePdf(pdfPath, threshold = 90, jobConfig = null, visualBaseline = null) {
  return new Promise((resolve, reject) => {
    console.log(`[Orchestrator] Running QA validation on: ${pdfPath}`);
    console.log(`[Orchestrator] QA threshold: ${threshold}`);

    // NEW: Use pipeline.py if visual baseline specified
    if (visualBaseline) {
      console.log(`[Orchestrator] Using pipeline.py with visual regression`);
      const args = [
        'pipeline.py',
        '--validate-only',
        '--pdf', pdfPath,
        '--threshold', threshold.toString(),
        '--visual-baseline', visualBaseline,
        '--ci'
      ];

      if (jobConfig) {
        args.push('--job-config', jobConfig);
      }

      const pythonProcess = spawn('python', args);
      // ... handle output and exit code
    } else {
      // EXISTING: Direct validate_document.py call
      const pythonScript = path.join(__dirname, 'validate_document.py');
      const args = [pythonScript, pdfPath, '--json'];
      if (jobConfig) {
        args.push('--job-config', jobConfig);
      }
      // ... existing logic
    }
  });
}
```

#### Update runMcpManagerWorkflow() to pass visual baseline (line 720):
```javascript
// Build context data from job
const contextData = {
  // ... existing fields
  visualBaseline: job.qa?.visualRegression?.baseline || null
};

// Later, when calling QA:
const jobConfigPath = `example-jobs/${job.jobId}.json`;  // Or actual path
const visualBaseline = job.qa?.visualRegression?.baseline;
const qaReport = await this.validatePdf(
  outputPath,
  qaThreshold,
  jobConfigPath,
  visualBaseline
);
```

---

### 4.6 Ensure TFU QA Works from MCP Path

**Goal:** Verify TFU jobs get proper validation when routed through MCP Manager

**Test command:**
```bash
node orchestrator.js example-jobs/aws-tfu-mcp-world-class.json
```

**Expected behavior:**
1. MCP Manager mode detected (✅ from Phase 3)
2. TFU failsafe triggered (✅ from Phase 3)
3. InDesign MCP exports PDF
4. QA validation runs with:
   - TFU job config passed to validate_document.py
   - 150-point scale (125 base + 25 TFU)
   - 140/150 threshold enforced
   - Visual regression against `teei-aws-tfu-v1` baseline

**Documentation update:**
Update `TFU-QA-COMMANDS.md` to add MCP variant:

```markdown
## Command 6: Via MCP Manager (Automated)

**Full automation via orchestrator**

\`\`\`bash
cd "D:\\Dev\\VS Projects\\Projects\\pdf-orchestrator"

node orchestrator.js example-jobs/aws-tfu-mcp-world-class.json
\`\`\`

**What happens:**
1. 🌐 MCP Manager mode detected
2. 🇺🇦 TFU failsafe activated
3. 📄 InDesign MCP exports PDF via HTTP Bridge
4. ✅ QA validation runs automatically (140/150 threshold)
5. 📊 Scorecard JSON saved to reports/pipeline/

**Expected output:**
\`\`\`
[Orchestrator] 🌐 MCP MANAGER MODE DETECTED
[Orchestrator] 🇺🇦 TFU style detected - MCP Manager path is MANDATORY
[Orchestrator] Running QA validation on: exports/TEEI-AWS-Partnership-TFU.pdf
[Orchestrator] QA threshold: 140
[Orchestrator] ✅ QA validation passed: 148/150 (98.7%)
\`\`\`
```

---

## Phase 5 Implementation Plan

### 5.1-5.2 Create MCP Flows Module

**Goal:** Add optional hooks for non-InDesign MCP servers

**Directory structure:**
```
mcp-flows/
├── index.js (exports all flows)
├── figmaBrand.js
├── dalleImages.js
├── githubSync.js
├── notionSync.js
└── mongoArchive.js
```

**Each module template:**
```javascript
/**
 * <Service Name> MCP Flow
 * Optional hook for <service> integration
 */

const MCPManager = require('../mcp-manager');

/**
 * Run <service> operation for job
 * @param {object} jobContext - Job data
 * @param {MCPManager} mcpManager - MCP Manager instance
 * @returns {Promise<object>} - Result with status: 'success'|'skipped'|'error'
 */
async function run<Service>Flow(jobContext, mcpManager) {
  // Check if enabled in job
  const enabled = jobContext.mcpFeatures?.use<Service> || false;
  if (!enabled) {
    console.log('[MCP Flow] <Service> - SKIPPED (not enabled in job)');
    return { status: 'skipped', reason: 'not_enabled' };
  }

  // Check if server is configured
  const serverStatus = mcpManager.getServerStatus('<service>');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] <Service> - SKIPPED (server not configured)');
    return { status: 'skipped', reason: 'not_configured' };
  }

  // Check environment variables
  const requiredEnv = process.env.<SERVICE>_API_KEY || process.env.<SERVICE>_TOKEN;
  if (!requiredEnv) {
    console.log('[MCP Flow] <Service> - SKIPPED (missing API credentials)');
    return { status: 'skipped', reason: 'missing_credentials' };
  }

  try {
    console.log('[MCP Flow] <Service> - RUNNING...');

    // STUB: Log what would happen
    console.log('[MCP Flow] <Service> - Would call: <service>.<tool>()');
    console.log('[MCP Flow] <Service> - Job ID:', jobContext.jobId);

    // TODO: Actual MCP call
    // const result = await mcpManager.invoke('<service>', '<tool>', params);

    console.log('[MCP Flow] <Service> - SUCCESS (stub)');
    return {
      status: 'success',
      data: { note: 'Stub implementation - no actual call made' }
    };

  } catch (error) {
    console.error('[MCP Flow] <Service> - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}

module.exports = { run<Service>Flow };
```

**Implementation for each service:**

1. **figmaBrand.js** - Extract design tokens from Figma file
2. **dalleImages.js** - Generate hero images with DALL-E
3. **githubSync.js** - Commit PDFs to GitHub repo
4. **notionSync.js** - Record job summary in Notion
5. **mongoArchive.js** - Archive job metadata in MongoDB

---

### 5.3 Extend Job Model with MCP Feature Flags

**Add to job JSON files:**
```json
"mcpFeatures": {
  "useFigmaBrandCheck": false,
  "useAiImages": false,
  "useGitHubSync": false,
  "useNotionSummary": false,
  "useMongoArchive": false
}
```

**Update example-jobs/aws-tfu-mcp-world-class.json:**
```json
{
  "jobId": "aws-partnership-tfu-mcp-2025",
  "mcpMode": true,
  "style": "TFU",
  "worldClass": true,

  "mcpFeatures": {
    "useFigmaBrandCheck": false,
    "useAiImages": false,
    "useGitHubSync": true,
    "useNotionSummary": false,
    "useMongoArchive": false
  },

  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "figma": { "enabled": false },
      "dalle": { "enabled": false },
      "indesign": { "enabled": true },
      "github": { "enabled": true }
    }
  }
}
```

---

## Phase 6 Implementation Plan

### 6.1 Update README-MCP-INTEGRATION.md

**Add sections:**
- **Validation-Only Mode**: How to use `pipeline.py --validate-only`
- **Visual Regression**: How to create baselines and run comparisons
- **QA Scorecard**: Where to find scorecard JSON files
- **MCP Flows**: Optional services and how to enable them

### 6.2 Update MCP-QUICK-START.md

**Add concrete run commands:**
```bash
# Run MCP Manager job with full QA
node orchestrator.js example-jobs/aws-tfu-mcp-world-class.json

# Validate existing PDF (no InDesign)
python pipeline.py --validate-only --pdf exports/TEEI-AWS.pdf --threshold 95

# Validate with visual regression
python pipeline.py --validate-only \
  --pdf exports/TEEI-AWS.pdf \
  --visual-baseline teei-aws-tfu-v1 \
  --threshold 95

# Check QA scorecard
cat reports/pipeline/pipeline_report_aws-partnership-tfu-mcp-2025_*-scorecard.json
```

### 6.3 Update TFU-QA-COMMANDS.md

**Add Command 6 (shown in 4.6 above)**

### 6.4 Create MCP-FLOWS-GUIDE.md

**New document explaining:**
- Purpose of each MCP flow
- How to enable in job config
- Required environment variables
- Stub vs production behavior
- Troubleshooting

---

## Implementation Order (Recommended)

1. **Phase 4.2** - Add validation-only mode to pipeline.py
2. **Phase 4.3** - Integrate visual regression
3. **Phase 4.4** - Add scorecard JSON
4. **Test Phase 4** - Run validation-only mode manually
5. **Phase 4.5** - Update orchestrator (optional)
6. **Phase 4.6** - Test TFU + MCP end-to-end
7. **Phase 5.1-5.3** - Create MCP flows stubs
8. **Phase 6** - Update all documentation
9. **Final test** - Run complete AWS TFU workflow

---

## Success Criteria

### Phase 4 Complete When:
- [ ] `python pipeline.py --validate-only --pdf <path>` works
- [ ] Visual regression integrated and enforces thresholds
- [ ] Scorecard JSON generated with all QA metrics
- [ ] orchestrator.js passes visual baseline to QA (if specified)
- [ ] TFU jobs get 140/150 threshold via MCP path

### Phase 5 Complete When:
- [ ] mcp-flows/ directory created with 5 stub modules
- [ ] Each stub checks configuration and logs intent
- [ ] Job model supports mcpFeatures flags
- [ ] Stubs never block or fail jobs

### Phase 6 Complete When:
- [ ] README-MCP-INTEGRATION.md updated with validation-only section
- [ ] MCP-QUICK-START.md has concrete run commands
- [ ] TFU-QA-COMMANDS.md includes MCP variant
- [ ] New MCP-FLOWS-GUIDE.md created

---

## Files to Modify

### Phase 4:
- `pipeline.py` (add validation-only mode, visual regression, scorecard)
- `orchestrator.js` (optional: route to pipeline.py for visual regression)
- `TFU-QA-COMMANDS.md` (add MCP variant)

### Phase 5:
- Create `mcp-flows/` directory with 5 modules
- `example-jobs/aws-tfu-mcp-world-class.json` (add mcpFeatures)
- `example-jobs/aws-tfu-mcp-test.json` (add mcpFeatures)

### Phase 6:
- `README-MCP-INTEGRATION.md` (add validation, visual regression, flows sections)
- `MCP-QUICK-START.md` (add concrete commands)
- Create `MCP-FLOWS-GUIDE.md`

---

**Status**: Implementation plan complete - ready for execution
**Estimated effort**: 6-8 hours for Phase 4-6 complete implementation
**Priority**: Phase 4 (QA pipeline) is highest priority for production readiness
