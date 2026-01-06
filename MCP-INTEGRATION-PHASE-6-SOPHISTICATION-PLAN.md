# MCP Integration Phase 6: Sophistication Layer Implementation Plan

**Date**: 2025-11-13
**Status**: 🚧 **In Progress** - Building next layer of sophistication
**Dependencies**: Phases 1-5 complete (MCP Manager, validation-only mode, MCP flow stubs)

---

## Executive Summary

This plan adds the next layer of sophistication to the MCP integration system:
- **Automatic QA profiles and baselines** - First-class config-driven QA
- **Job metrics and dependency graphs** - Machine-readable execution tracking
- **Real MCP flows** - Useful optional integrations (Figma, DALL-E, GitHub, etc.)
- **Approval & experiment modes** - Human-in-the-loop and A/B testing capabilities

**Goal**: Transform the system from "working" to "production-grade intelligent automation"

---

## Phase 1: QA Profiles + Automatic Baselines ✅ (STARTED)

### 1.1 Job Config Extensions (COMPLETE)

**Files Modified**:
- `example-jobs/aws-tfu-mcp-world-class.json`
- `example-jobs/tfu-aws-partnership.json`
- `example-jobs/tfu-partnership-template.json`

**New Structure Added**:
```json
"qaProfile": {
  "id": "aws_tfu_world_class",
  "min_score": 95,
  "min_tfu_score": 140,
  "max_visual_diff_percent": 5,
  "visual_baseline_id": "tfu-aws-v1",
  "create_baseline_on_first_pass": true
},

"approval": {
  "mode": "none",           // or "slack"
  "channel": "#design-approvals"
},

"mode": "normal",            // or "experiment"

"data": {
  "aiImageSlots": {
    "cover": "prompt for cover image",
    "hero": "prompt for hero image",
    "program_1": "prompt for program section"
  }
}
```

### 1.2 Pipeline.py Enhancement (TODO)

**File**: `pipeline.py`

**Changes Needed**:

1. **Load qaProfile from job config** (around line 50):
```python
def load_qa_profile(self, job_config_path: str) -> Dict:
    """Load QA profile from job config"""
    if not job_config_path or not os.path.exists(job_config_path):
        return {}

    with open(job_config_path, 'r') as f:
        job = json.load(f)

    qa_profile = job.get('qaProfile', {})

    # Override with CLI args if present
    if self.config.get('validation_threshold'):
        qa_profile['min_score'] = self.config['validation_threshold']
    if self.config.get('max_visual_diff'):
        qa_profile['max_visual_diff_percent'] = self.config['max_visual_diff']
    if self.config.get('visual_baseline'):
        qa_profile['visual_baseline_id'] = self.config['visual_baseline']

    return qa_profile
```

2. **Use qaProfile in run_validation_only()** (around line 400):
```python
def run_validation_only(self) -> bool:
    """Execute validation-only pipeline (no InDesign export)"""
    print("[Pipeline] Running in VALIDATION-ONLY mode")

    # Load QA profile
    qa_profile = self.load_qa_profile(self.config.get('job_config_path'))

    # Derive thresholds from profile
    threshold = qa_profile.get('min_score', self.config['validation_threshold'])
    tfu_threshold = qa_profile.get('min_tfu_score', 140)
    visual_baseline = qa_profile.get('visual_baseline_id')
    max_visual_diff = qa_profile.get('max_visual_diff_percent', 5.0)

    print(f"[Pipeline] QA Profile: {qa_profile.get('id', 'default')}")
    print(f"[Pipeline] Threshold: {threshold}, TFU: {tfu_threshold}, Visual diff: {max_visual_diff}%")

    # ... rest of validation logic
```

3. **Automatic baseline creation** (new method around line 550):
```python
def create_baseline_if_needed(self, pdf_path: str, qa_profile: Dict) -> bool:
    """Create visual baseline if configured and missing"""
    baseline_id = qa_profile.get('visual_baseline_id')
    create_on_first_pass = qa_profile.get('create_baseline_on_first_pass', False)

    if not baseline_id:
        return False

    # Check if baseline exists
    baseline_dir = Path('references') / baseline_id
    if baseline_dir.exists():
        print(f"[Pipeline] Baseline exists: {baseline_id}")
        return False

    # Create baseline if configured
    if create_on_first_pass and self.results.get('success'):
        print(f"[Pipeline] Creating baseline: {baseline_id}")
        script_path = 'scripts/create-reference-screenshots.js'

        if not os.path.exists(script_path):
            print("[Pipeline] ⚠️  create-reference-screenshots.js not found, skipping baseline creation")
            return False

        try:
            result = subprocess.run(
                ['node', script_path, pdf_path, baseline_id],
                capture_output=True,
                text=True,
                timeout=60
            )

            if result.returncode == 0:
                print(f"[Pipeline] ✅ Baseline created: {baseline_id}")
                return True
            else:
                print(f"[Pipeline] ❌ Baseline creation failed: {result.stderr}")
                return False
        except Exception as e:
            print(f"[Pipeline] ❌ Baseline creation error: {e}")
            return False

    return False
```

### 1.3 Enhanced Scorecard JSON (TODO)

**File**: `pipeline.py` method `_generate_scorecard()` (around line 537)

**Enhance to include**:
```python
def _generate_scorecard(self) -> Dict:
    """Generate compact QA scorecard with profile info"""
    # ... existing code ...

    # Add QA profile info
    qa_profile = self.load_qa_profile(self.config.get('job_config_path'))

    scorecard = {
        # ... existing fields ...

        "qaProfile": {
            "id": qa_profile.get('id', 'default'),
            "min_score": qa_profile.get('min_score', 80),
            "min_tfu_score": qa_profile.get('min_tfu_score', 140),
            "max_visual_diff_percent": qa_profile.get('max_visual_diff_percent', 5.0),
            "visual_baseline_id": qa_profile.get('visual_baseline_id')
        },

        "baseline_status": "used" if visual_step else "missing",
        "baseline_created": False,  # Set by create_baseline_if_needed()

        # ... rest of scorecard
    }

    return scorecard
```

---

## Phase 2: Metrics + Job Graph JSON (TODO)

### 2.1 Runtime Metrics (TODO)

**File**: `pipeline.py`

**Add timing metrics**:
```python
class InDesignPipeline:
    def __init__(self, config_path: str = None):
        # ... existing code ...
        self.start_time = time.time()
        self.step_timings = {}

    def log_step(self, name: str, success: bool, details: str = ""):
        """Log pipeline step with timing"""
        step_time = time.time()
        step_duration = step_time - self.start_time

        self.results["steps"].append({
            "name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.fromtimestamp(step_time).isoformat(),
            "duration_seconds": step_duration
        })

        self.step_timings[name] = step_duration

        status = "✓" if success else "✗"
        print(f"[Pipeline] {status} {name} ({step_duration:.2f}s)")
        if details:
            print(f"           {details}")
```

**Enhance scorecard with metrics** (in `_generate_scorecard()`):
```python
def _generate_scorecard(self) -> Dict:
    total_time = time.time() - self.start_time

    scorecard = {
        # ... existing fields ...

        "metrics": {
            "runtime_seconds": total_time,
            "steps_completed": len(self.results["steps"]),
            "steps_failed": len([s for s in self.results["steps"] if not s["success"]]),
            "validation_time": self.step_timings.get("Validate PDF", 0),
            "visual_regression_time": self.step_timings.get("Visual Regression", 0)
        }
    }

    return scorecard
```

### 2.2 Job Graph JSON Generation (TODO)

**New file**: `reports/graphs/generate-job-graph.py`

```python
#!/usr/bin/env python3
"""
Generate job dependency graph JSON from job config and execution results
"""

import json
import os
import sys
from pathlib import Path
from datetime import datetime

def generate_job_graph(job_config_path: str, scorecard_path: str = None) -> dict:
    """Generate job graph from config and optional scorecard"""

    with open(job_config_path, 'r') as f:
        job = json.load(f)

    scorecard = {}
    if scorecard_path and os.path.exists(scorecard_path):
        with open(scorecard_path, 'r') as f:
            scorecard = json.load(f)

    # Build node list
    nodes = [
        {"id": "job", "type": "job", "label": job.get('name', 'Job'), "status": "completed"}
    ]

    edges = []

    # Add MCP server nodes if mcpMode enabled
    if job.get('mcpMode') or job.get('style') == 'TFU':
        mcp_config = job.get('mcp', {})
        servers = mcp_config.get('servers', {})

        for server_name, server_config in servers.items():
            if server_config.get('enabled'):
                nodes.append({
                    "id": server_name,
                    "type": "mcp",
                    "label": f"{server_name.title()} MCP",
                    "status": "completed" if scorecard else "pending"
                })
                edges.append({
                    "from": "job",
                    "to": server_name,
                    "label": ", ".join(server_config.get('actions', ['process']))
                })

    # Add InDesign node
    if not job.get('validate_only', False):
        nodes.append({
            "id": "indesign",
            "type": "indesign",
            "label": "InDesign",
            "status": "completed" if scorecard else "pending"
        })
        edges.append({"from": "job", "to": "indesign", "label": "layout"})

    # Add QA nodes
    nodes.append({
        "id": "validator",
        "type": "qa",
        "label": "Document Validator",
        "status": "completed" if scorecard and scorecard.get('passed') else "failed"
    })
    edges.append({"from": "indesign" if not job.get('validate_only') else "job", "to": "validator", "label": "validate"})

    # Add visual regression node if enabled
    qa_profile = job.get('qaProfile', {})
    if qa_profile.get('visual_baseline_id'):
        nodes.append({
            "id": "visual",
            "type": "qa",
            "label": "Visual Regression",
            "status": "completed" if scorecard else "pending"
        })
        edges.append({"from": "validator", "to": "visual", "label": "compare"})

    # Build graph
    graph = {
        "jobId": job.get('jobId', job.get('name', 'unknown')),
        "generatedAt": datetime.now().isoformat(),
        "nodes": nodes,
        "edges": edges,
        "metadata": {
            "jobType": job.get('jobType', 'unknown'),
            "client": job.get('client', 'unknown'),
            "style": job.get('style', 'default'),
            "mcpMode": job.get('mcpMode', False)
        }
    }

    if scorecard:
        graph["executionMetrics"] = {
            "totalScore": scorecard.get('totalScore', 0),
            "passed": scorecard.get('passed', False),
            "runtime_seconds": scorecard.get('metrics', {}).get('runtime_seconds', 0)
        }

    return graph

def main():
    if len(sys.argv) < 2:
        print("Usage: python generate-job-graph.py <job-config.json> [scorecard.json]")
        sys.exit(1)

    job_config_path = sys.argv[1]
    scorecard_path = sys.argv[2] if len(sys.argv) > 2 else None

    graph = generate_job_graph(job_config_path, scorecard_path)

    # Save graph
    job_id = graph['jobId']
    output_dir = Path('reports/graphs')
    output_dir.mkdir(parents=True, exist_ok=True)

    output_path = output_dir / f"{job_id}-graph.json"
    with open(output_path, 'w') as f:
        json.dump(graph, f, indent=2)

    print(f"[Graph] Generated: {output_path}")
    print(f"[Graph] Nodes: {len(graph['nodes'])}, Edges: {len(graph['edges'])}")

if __name__ == "__main__":
    main()
```

**Integration**: Call from `pipeline.py` at end of run:
```python
def save_report(self, report: Dict) -> str:
    # ... existing scorecard save code ...

    # Generate job graph
    job_config_path = self.config.get('job_config_path')
    if job_config_path:
        try:
            import subprocess
            subprocess.run([
                'python', 'reports/graphs/generate-job-graph.py',
                job_config_path,
                scorecard_path
            ], check=False)  # Don't fail if graph generation fails
        except Exception as e:
            print(f"[Pipeline] ⚠️  Job graph generation failed: {e}")

    return report_path
```

---

## Phase 3: Real MCP Flows (TODO)

### 3.1 DALL-E Image Generation (TODO)

**File**: `mcp-flows/dalleImages.js`

**Enhance stub with real implementation**:
```javascript
async function runDalleFlow(jobContext, mcpManager) {
  const enabled = jobContext.mcpFeatures?.useAiImages || false;
  if (!enabled) return { status: 'skipped', reason: 'not_enabled' };

  const serverStatus = mcpManager.getServerStatus('dalle');
  if (serverStatus.status === 'not_found')
    return { status: 'skipped', reason: 'not_configured' };

  const requiredEnv = process.env.OPENAI_API_KEY;
  if (!requiredEnv)
    return { status: 'skipped', reason: 'missing_credentials' };

  try {
    console.log('[MCP Flow] DALL-E - RUNNING...');

    // Get AI image slots from job context
    const aiImageSlots = jobContext.data?.aiImageSlots || {};
    const slots = Object.keys(aiImageSlots);

    if (slots.length === 0) {
      console.log('[MCP Flow] DALL-E - No image slots defined, skipping');
      return { status: 'skipped', reason: 'no_slots_defined' };
    }

    const generatedImages = {};

    for (const slotName of slots) {
      const prompt = aiImageSlots[slotName];
      console.log(`[MCP Flow] DALL-E - Generating image for slot: ${slotName}`);
      console.log(`[MCP Flow] DALL-E - Prompt: ${prompt}`);

      try {
        // Call DALL-E MCP server
        const result = await mcpManager.invoke('dalle', 'generate_image', {
          prompt: prompt,
          model: 'dall-e-3',
          quality: 'hd',
          size: '1792x1024',
          style: 'natural'
        });

        if (result.status === 'success') {
          // Save image to assets
          const imagePath = `assets/ai/${jobContext.jobId}/${slotName}.png`;
          const dir = path.dirname(imagePath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          // Download and save image
          const imageUrl = result.data.url;
          const imageData = await fetch(imageUrl).then(r => r.buffer());
          fs.writeFileSync(imagePath, imageData);

          generatedImages[slotName] = {
            path: imagePath,
            url: imageUrl,
            prompt: prompt
          };

          console.log(`[MCP Flow] DALL-E - ✅ Saved: ${imagePath}`);
        } else {
          console.error(`[MCP Flow] DALL-E - ❌ Generation failed for ${slotName}: ${result.message}`);
        }
      } catch (slotError) {
        console.error(`[MCP Flow] DALL-E - ❌ Error generating ${slotName}: ${slotError.message}`);
        // Continue with other slots
      }
    }

    console.log('[MCP Flow] DALL-E - SUCCESS');
    return {
      status: 'success',
      data: {
        generatedImages: generatedImages,
        slotsProcessed: slots.length,
        slotsSucceeded: Object.keys(generatedImages).length
      }
    };

  } catch (error) {
    console.error('[MCP Flow] DALL-E - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}
```

### 3.2 Figma Brand Check (TODO)

**File**: `mcp-flows/figmaBrand.js`

```javascript
async function runFigmaFlow(jobContext, mcpManager) {
  // ... existing checks ...

  try {
    console.log('[MCP Flow] Figma - RUNNING...');

    const fileId = process.env.FIGMA_FILE_ID || 'TEEI-Brand-System';
    console.log(`[MCP Flow] Figma - Extracting tokens from: ${fileId}`);

    // Call Figma MCP to get design tokens
    const result = await mcpManager.invoke('figma', 'extract_design_tokens', {
      fileId: fileId,
      types: ['colors', 'typography', 'spacing']
    });

    if (result.status === 'success') {
      const tokens = result.data;

      // Save brand tokens to file
      const brandReportPath = `reports/brand/${jobContext.jobId}-figma-tokens.json`;
      const dir = path.dirname(brandReportPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(brandReportPath, JSON.stringify(tokens, null, 2));
      console.log(`[MCP Flow] Figma - ✅ Brand tokens saved: ${brandReportPath}`);

      // Compare with expected brand colors (if available)
      const expectedColors = jobContext.tfu_requirements?.primary_color;
      if (expectedColors && tokens.colors) {
        const primaryColor = tokens.colors.find(c => c.name === 'Primary' || c.name === 'Nordshore');
        if (primaryColor) {
          console.log(`[MCP Flow] Figma - Primary color from Figma: ${primaryColor.value}`);
          console.log(`[MCP Flow] Figma - Expected TFU color: ${expectedColors}`);

          if (primaryColor.value.toLowerCase() === expectedColors.toLowerCase()) {
            console.log(`[MCP Flow] Figma - ✅ Color match!`);
          } else {
            console.log(`[MCP Flow] Figma - ⚠️  Color mismatch!`);
          }
        }
      }

      return {
        status: 'success',
        data: {
          tokensExtracted: Object.keys(tokens).length,
          colors: tokens.colors?.length || 0,
          typography: tokens.typography?.length || 0,
          reportPath: brandReportPath
        }
      };
    } else {
      throw new Error(result.message || 'Figma extraction failed');
    }

  } catch (error) {
    console.error('[MCP Flow] Figma - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}
```

### 3.3 GitHub Sync (TODO)

**File**: `mcp-flows/githubSync.js`

```javascript
async function runGitHubFlow(jobContext, mcpManager) {
  // ... existing checks ...

  try {
    console.log('[MCP Flow] GitHub - RUNNING...');

    // Collect files to commit
    const filesToCommit = [];

    // PDFs
    const exportPath = jobContext.output?.exportPath || './exports';
    const filenameBase = jobContext.output?.filename_base || jobContext.jobId;

    const pdfPaths = [
      `${exportPath}/${filenameBase}-PRINT.pdf`,
      `${exportPath}/${filenameBase}-DIGITAL.pdf`
    ];

    for (const pdfPath of pdfPaths) {
      if (fs.existsSync(pdfPath)) {
        filesToCommit.push(pdfPath);
      }
    }

    // Scorecard JSON
    const scorecardPath = `reports/pipeline/${jobContext.jobId}-scorecard.json`;
    if (fs.existsSync(scorecardPath)) {
      filesToCommit.push(scorecardPath);
    }

    // Job graph JSON
    const graphPath = `reports/graphs/${jobContext.jobId}-graph.json`;
    if (fs.existsSync(graphPath)) {
      filesToCommit.push(graphPath);
    }

    if (filesToCommit.length === 0) {
      console.log('[MCP Flow] GitHub - No files to commit');
      return { status: 'skipped', reason: 'no_files' };
    }

    console.log(`[MCP Flow] GitHub - Files to commit: ${filesToCommit.length}`);

    // Load scorecard for commit message
    let score = 0;
    let maxScore = 150;
    let visualDiff = 0;

    if (fs.existsSync(scorecardPath)) {
      const scorecard = JSON.parse(fs.readFileSync(scorecardPath, 'utf8'));
      score = scorecard.totalScore || 0;
      maxScore = scorecard.maxScore || 150;
      visualDiff = scorecard.visualDiffPercent || 0;
    }

    // Create commit message
    const commitMessage = `[${jobContext.client || 'PDF'}] ${jobContext.jobId}\n\nScore: ${score}/${maxScore}, Visual diff: ${visualDiff.toFixed(1)}%\n\nGenerated with MCP Manager + InDesign automation`;

    console.log(`[MCP Flow] GitHub - Commit message: ${commitMessage.split('\n')[0]}`);

    // Call GitHub MCP
    const result = await mcpManager.invoke('github', 'commit_files', {
      files: filesToCommit,
      message: commitMessage,
      branch: process.env.GITHUB_BRANCH || 'main'
    });

    if (result.status === 'success') {
      console.log(`[MCP Flow] GitHub - ✅ Committed: ${result.data.commitHash}`);
      return {
        status: 'success',
        data: {
          commitHash: result.data.commitHash,
          filesCommitted: filesToCommit.length,
          branch: result.data.branch
        }
      };
    } else {
      throw new Error(result.message || 'GitHub commit failed');
    }

  } catch (error) {
    console.error('[MCP Flow] GitHub - ERROR:', error.message);
    return {
      status: 'error',
      error: error.message
    };
  }
}
```

### 3.4 Notion & MongoDB (TODO)

Similar pattern to above - implement record insertion with error handling.

**Key points**:
- Notion: Append page with job summary, scores, links
- MongoDB: Insert job document with full metrics
- Both: Non-blocking, return structured status

---

## Phase 4: Approval & Experiment Modes (TODO)

### 4.1 Slack Approval Stub (TODO)

**File**: `mcp-flows/slackApproval.js` (NEW)

```javascript
/**
 * Slack Approval Flow
 * Requests human approval before proceeding with GitHub/Notion/Mongo
 */

async function runSlackApprovalFlow(jobContext, mcpManager) {
  const approvalConfig = jobContext.approval || {};
  const mode = approvalConfig.mode || 'none';

  if (mode === 'none') {
    return { status: 'skipped', reason: 'approval_not_required' };
  }

  if (mode !== 'slack') {
    console.log(`[MCP Flow] Approval - Unsupported mode: ${mode}`);
    return { status: 'skipped', reason: 'unsupported_mode' };
  }

  // Check if Slack MCP is configured
  const serverStatus = mcpManager.getServerStatus('slack');
  if (serverStatus.status === 'not_found') {
    console.log('[MCP Flow] Approval - Slack not configured, auto-approving');
    return { status: 'success', data: { approved: true, note: 'auto_approved' } };
  }

  try {
    console.log('[MCP Flow] Approval - Requesting via Slack...');

    const channel = approvalConfig.channel || '#design-approvals';

    // Load scorecard for approval message
    const scorecardPath = `reports/pipeline/${jobContext.jobId}-scorecard.json`;
    let scorecard = {};
    if (fs.existsSync(scorecardPath)) {
      scorecard = JSON.parse(fs.readFileSync(scorecardPath, 'utf8'));
    }

    // Build approval message
    const message = {
      text: `🎨 New PDF ready for approval: ${jobContext.jobId}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `PDF Approval Request: ${jobContext.client || 'Client'}`
          }
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Job ID:*\n${jobContext.jobId}` },
            { type: "mrkdwn", text: `*Score:*\n${scorecard.totalScore || 0}/${scorecard.maxScore || 150}` },
            { type: "mrkdwn", text: `*Visual Diff:*\n${(scorecard.visualDiffPercent || 0).toFixed(1)}%` },
            { type: "mrkdwn", text: `*Status:*\n${scorecard.passed ? '✅ Passed' : '❌ Failed'}` }
          ]
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "Approve ✅" },
              style: "primary",
              value: "approve"
            },
            {
              type: "button",
              text: { type: "plain_text", text: "Reject ❌" },
              style: "danger",
              value: "reject"
            }
          ]
        }
      ]
    };

    // Post to Slack
    const result = await mcpManager.invoke('slack', 'post_message', {
      channel: channel,
      ...message
    });

    if (result.status === 'success') {
      console.log(`[MCP Flow] Approval - Awaiting response in ${channel}`);

      // TODO: In real implementation, wait for callback
      // For now, auto-approve after posting
      console.log(`[MCP Flow] Approval - ⚠️  Auto-approving (callback not implemented)`);

      return {
        status: 'success',
        data: {
          approved: true,
          channel: channel,
          messageTs: result.data.ts,
          note: 'Posted to Slack, auto-approved (callback TBD)'
        }
      };
    } else {
      throw new Error(result.message || 'Slack post failed');
    }

  } catch (error) {
    console.error('[MCP Flow] Approval - ERROR:', error.message);
    // Auto-approve on error to not block pipeline
    console.log('[MCP Flow] Approval - Auto-approving due to error');
    return {
      status: 'success',
      data: {
        approved: true,
        note: 'auto_approved_on_error',
        error: error.message
      }
    };
  }
}

module.exports = { runSlackApprovalFlow };
```

### 4.2 Experiment Mode (TODO)

**File**: `orchestrator.js` enhancement

**Add experiment handling before main execution**:
```javascript
async function runMcpManagerWorkflow(job, runId) {
  // ... existing setup ...

  // Check for experiment mode
  if (job.mode === 'experiment') {
    const variants = job.experiment?.variants || 1;

    if (variants > 1) {
      console.log(`[Orchestrator] 🧪 EXPERIMENT MODE: Generating ${variants} variants`);

      const variantResults = [];

      for (let i = 1; i <= variants; i++) {
        console.log(`[Orchestrator] 🧪 Variant ${i}/${variants}`);

        // Create variant context (modify job slightly)
        const variantJob = {
          ...job,
          jobId: `${job.jobId}-variant-${i}`,
          variantNumber: i
        };

        // Run workflow for this variant
        const variantResult = await this.mcpManager.executeWorkflow(
          workflow,
          variantJob
        );

        variantResults.push({
          variant: i,
          jobId: variantJob.jobId,
          score: variantResult.score || 0,
          success: variantResult.success
        });
      }

      // Choose winner by score
      const winner = variantResults.reduce((best, current) =>
        current.score > best.score ? current : best
      );

      console.log(`[Orchestrator] 🏆 Winner: Variant ${winner.variant} (score: ${winner.score})`);

      // Save experiment summary
      const experimentSummary = {
        jobId: job.jobId,
        variants: variantResults,
        winner: winner,
        timestamp: new Date().toISOString()
      };

      const summaryPath = `reports/experiments/${job.jobId}-variants.json`;
      fs.writeFileSync(summaryPath, JSON.stringify(experimentSummary, null, 2));
      console.log(`[Orchestrator] 📊 Experiment summary: ${summaryPath}`);

      return {
        success: true,
        experimentMode: true,
        variants: variantResults,
        winner: winner
      };
    }
  }

  // Normal mode - single execution
  // ... existing workflow execution ...
}
```

---

## Phase 5: Wire Everything into Orchestrator (TODO)

### 5.1 QA Profile Integration (TODO)

**File**: `orchestrator.js`

**In runMcpManagerWorkflow method**:
```javascript
async function runMcpManagerWorkflow(job, runId) {
  // ... existing setup ...

  // Extract QA profile
  const qaProfile = job.qaProfile || {};
  console.log(`[Orchestrator] QA Profile: ${qaProfile.id || 'default'}`);
  console.log(`[Orchestrator] Thresholds: score=${qaProfile.min_score || 80}, tfu=${qaProfile.min_tfu_score || 140}, visual=${qaProfile.max_visual_diff_percent || 5}%`);

  // Pass to pipeline when calling validation
  if (result.pdfPath) {
    // Run validation with QA profile
    const validationCommand = [
      'python', 'pipeline.py',
      '--validate-only',
      '--pdf', result.pdfPath,
      '--job-config', jobConfigPath,
      '--threshold', String(qaProfile.min_score || 80)
    ];

    if (qaProfile.visual_baseline_id) {
      validationCommand.push('--visual-baseline', qaProfile.visual_baseline_id);
      validationCommand.push('--max-visual-diff', String(qaProfile.max_visual_diff_percent || 5));
    }

    const validationResult = await this.runCommand(validationCommand);
    // ... handle result ...
  }
}
```

### 5.2 MCP Flow Integration (TODO)

**File**: `orchestrator.js`

**Add flow orchestration**:
```javascript
async function runMcpManagerWorkflow(job, runId) {
  // ... existing workflow execution ...

  // After InDesign export completes but before QA:

  // 1. Run Figma brand check (if enabled)
  if (job.mcpFeatures?.useFigmaBrandCheck) {
    console.log('[Orchestrator] Running Figma brand check...');
    const figmaResult = await runFigmaFlow(job, this.mcpManager);
    console.log(`[Orchestrator] Figma: ${figmaResult.status}`);
  }

  // 2. Generate AI images (if enabled) - BEFORE InDesign export
  if (job.mcpFeatures?.useAiImages) {
    console.log('[Orchestrator] Generating AI images...');
    const dalleResult = await runDalleFlow(job, this.mcpManager);
    console.log(`[Orchestrator] DALL-E: ${dalleResult.status}`);

    // Update job context with generated images
    if (dalleResult.status === 'success') {
      job.generatedImages = dalleResult.data.generatedImages;
    }
  }

  // ... InDesign export ...
  // ... QA validation ...

  // After QA passes:
  if (result.qaScore >= qaThreshold) {

    // 3. Request approval (if required)
    if (job.approval?.mode !== 'none') {
      console.log('[Orchestrator] Requesting approval...');
      const approvalResult = await runSlackApprovalFlow(job, this.mcpManager);
      console.log(`[Orchestrator] Approval: ${approvalResult.status}`);

      if (!approvalResult.data?.approved) {
        console.log('[Orchestrator] ❌ Approval rejected, stopping');
        return { success: false, reason: 'approval_rejected' };
      }
    }

    // 4. Sync to GitHub (if enabled)
    if (job.mcpFeatures?.useGitHubSync) {
      console.log('[Orchestrator] Syncing to GitHub...');
      const githubResult = await runGitHubFlow(job, this.mcpManager);
      console.log(`[Orchestrator] GitHub: ${githubResult.status}`);
    }

    // 5. Record in Notion (if enabled)
    if (job.mcpFeatures?.useNotionSummary) {
      console.log('[Orchestrator] Recording in Notion...');
      const notionResult = await runNotionFlow(job, this.mcpManager);
      console.log(`[Orchestrator] Notion: ${notionResult.status}`);
    }

    // 6. Archive in MongoDB (if enabled)
    if (job.mcpFeatures?.useMongoArchive) {
      console.log('[Orchestrator] Archiving in MongoDB...');
      const mongoResult = await runMongoFlow(job, this.mcpManager);
      console.log(`[Orchestrator] MongoDB: ${mongoResult.status}`);
    }
  }

  // ... rest of workflow ...
}
```

### 5.3 Enhanced Logging (TODO)

**Add summary log line** at end of workflow:
```javascript
async function runMcpManagerWorkflow(job, runId) {
  // ... all workflow steps ...

  // Final summary
  const summaryParts = [
    `[${job.client || 'PDF'}]`,
    `score=${result.score || 0}/${result.maxScore || 150}`,
    `tfu=${result.tfuScore || 0}/25`,
    `diff=${(result.visualDiff || 0).toFixed(1)}%`
  ];

  if (result.baselineId) {
    summaryParts.push(`baseline=${result.baselineId}`);
  }

  if (job.mcpFeatures?.useGitHubSync) {
    summaryParts.push(githubResult?.status === 'success' ? 'github=ok' : 'github=skip');
  }

  if (job.mcpFeatures?.useNotionSummary) {
    summaryParts.push(notionResult?.status === 'success' ? 'notion=ok' : 'notion=skip');
  }

  if (job.mcpFeatures?.useMongoArchive) {
    summaryParts.push(mongoResult?.status === 'success' ? 'mongo=ok' : 'mongo=skip');
  }

  console.log(`[Orchestrator] ${summaryParts.join(' ')}`);

  return result;
}
```

---

## Phase 6: Testing & Documentation (TODO)

### 6.1 End-to-End Test (TODO)

**Test command**:
```bash
# Start MCP stack
powershell -ExecutionPolicy Bypass -File start-mcp-stack.ps1

# Run advanced job
node orchestrator.js example-jobs/aws-tfu-mcp-world-class.json
```

**Expected output files**:
- `exports/TEEI-AWS-Partnership-TFU-PRINT.pdf`
- `exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf`
- `reports/pipeline/aws-partnership-tfu-mcp-2025-scorecard.json`
- `reports/graphs/aws-partnership-tfu-mcp-2025-graph.json`
- `reports/brand/aws-partnership-tfu-mcp-2025-figma-tokens.json` (if Figma enabled)
- `assets/ai/aws-partnership-tfu-mcp-2025/cover.png` (if DALL-E enabled)

### 6.2 Validation Checklist (TODO)

- [ ] QA profile loads from job config
- [ ] Thresholds override via CLI still works
- [ ] Visual baseline auto-creation works
- [ ] Job graph JSON generated
- [ ] Metrics (runtime, step timings) recorded
- [ ] DALL-E flow generates images (if enabled)
- [ ] Figma flow extracts tokens (if enabled)
- [ ] GitHub flow commits files (if enabled)
- [ ] Approval flow posts to Slack (if enabled)
- [ ] Experiment mode generates variants (if enabled)
- [ ] Summary log line shows all statuses

### 6.3 Documentation Updates (TODO)

**Files to update**:
- `README-MCP-INTEGRATION.md` - Add Phase 6 section
- `MCP-QUICK-START.md` - Add qaProfile examples
- Create `QAPROFILE-GUIDE.md` - Comprehensive QA profile documentation
- Create `MCP-FLOWS-GUIDE.md` - How to use optional MCP integrations
- Create `EXPERIMENT-MODE-GUIDE.md` - A/B testing documentation

---

## Summary: What This Achieves

### Before (Phase 5):
- ✅ MCP Manager integration working
- ✅ Validation-only mode functional
- ✅ MCP flow stubs present but inactive
- ❌ No automatic baselines
- ❌ No metrics tracking
- ❌ No optional service integrations
- ❌ No approval workflows
- ❌ No experiment mode

### After (Phase 6):
- ✅ **Config-driven QA profiles** - Baselines and thresholds in job files
- ✅ **Automatic baseline creation** - First successful run creates reference
- ✅ **Job metrics tracking** - Runtime, step timings, execution graphs
- ✅ **Job dependency graphs** - Machine-readable workflow visualization
- ✅ **Real MCP flows** - Figma, DALL-E, GitHub, Notion, MongoDB working
- ✅ **Approval workflows** - Human-in-the-loop via Slack (stub)
- ✅ **Experiment mode** - A/B testing with automatic winner selection
- ✅ **Enhanced observability** - Comprehensive logging and status tracking

### Production Readiness:
- **Required features**: QA profiles, metrics, baselines ✅
- **Optional features**: MCP flows, approval, experiments ✅
- **Failure resilience**: All MCP flows non-blocking ✅
- **Observability**: Metrics, graphs, logs ✅
- **Extensibility**: Easy to add new MCP servers ✅

---

**Next Actions**:
1. Implement pipeline.py enhancements (QA profile loading, automatic baselines)
2. Add job graph generation script
3. Enhance MCP flows with real implementations
4. Add approval and experiment mode to orchestrator
5. Test end-to-end with aws-tfu-mcp-world-class.json
6. Document all new features

**Estimated Time**: 6-8 hours of focused implementation

**Status**: 🚧 Implementation plan complete, ready for execution
