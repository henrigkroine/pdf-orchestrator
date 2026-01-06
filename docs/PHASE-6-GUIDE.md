# Phase 6: Enterprise-Grade PDF Orchestration

**Complete guide to Phase 6 production-ready features**

Phase 6 transforms PDF Orchestrator from a development tool into an enterprise-grade automation platform with config-driven QA, automatic baseline creation, runtime metrics tracking, job dependency graphs, MCP workflow orchestration, human-in-the-loop approval, and A/B testing capabilities.

---

## Table of Contents

1. [Overview](#overview)
2. [QA Profiles](#qa-profiles)
3. [Automatic Baseline Creation](#automatic-baseline-creation)
4. [Runtime Metrics Tracking](#runtime-metrics-tracking)
5. [Job Dependency Graphs](#job-dependency-graphs)
6. [MCP Flows](#mcp-flows)
7. [Approval Workflows](#approval-workflows)
8. [Experiment Mode](#experiment-mode)
9. [Integration Patterns](#integration-patterns)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What's New in Phase 6?

Phase 6 introduces **7 major enterprise features**:

| Feature | Purpose | Documentation |
|---------|---------|---------------|
| **QA Profiles** | Config-driven validation rules | [QAPROFILE-GUIDE.md](./QAPROFILE-GUIDE.md) |
| **Auto Baselines** | First-pass baseline creation | [This guide](#automatic-baseline-creation) |
| **Runtime Metrics** | Performance tracking | [This guide](#runtime-metrics-tracking) |
| **Job Dependencies** | Multi-job orchestration | [This guide](#job-dependency-graphs) |
| **MCP Flows** | Multi-server workflows | [MCP-FLOWS-GUIDE.md](./MCP-FLOWS-GUIDE.md) |
| **Approval Workflows** | Human-in-the-loop gates | [This guide](#approval-workflows) |
| **Experiment Mode** | A/B testing PDFs | [EXPERIMENT-MODE-GUIDE.md](./EXPERIMENT-MODE-GUIDE.md) |

### Key Benefits

✅ **Zero-config QA** - Define validation rules in job config
✅ **No manual baselines** - Auto-create on first successful run
✅ **Production metrics** - Track every job's performance
✅ **Complex workflows** - Chain jobs with dependencies
✅ **Multi-server MCP** - Orchestrate Figma + DALL-E + InDesign
✅ **Human approval** - Slack integration for design sign-off
✅ **A/B testing** - Compare multiple PDF variants automatically

---

## QA Profiles

### Quick Start

Define QA requirements directly in your job config:

```json
{
  "jobId": "aws-partnership-2025",
  "jobType": "partnership",

  "qaProfile": {
    "id": "world_class_partnership",
    "min_score": 95,
    "min_tfu_score": 140,
    "max_visual_diff_percent": 5,
    "visual_baseline_id": "tfu-aws-v1",
    "create_baseline_on_first_pass": true,
    "fail_on_brand_violations": true,
    "checks": {
      "typography": { "enabled": true, "weight": 20 },
      "colors": { "enabled": true, "weight": 25 },
      "layout": { "enabled": true, "weight": 20 },
      "accessibility": { "enabled": true, "weight": 15 },
      "visual_regression": { "enabled": true, "weight": 20 }
    }
  }
}
```

### How It Works

1. **Job submission** - Include `qaProfile` in job config
2. **Orchestrator reads profile** - Loads validation rules
3. **PDF generation** - Runs normally
4. **QA validation** - Applies profile rules automatically
5. **Pass/fail decision** - Based on profile thresholds

### Profile Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `id` | string | required | Unique profile identifier |
| `min_score` | number | 80 | Minimum overall QA score (0-100) |
| `min_tfu_score` | number | 120 | Minimum TFU-specific score (0-150) |
| `max_visual_diff_percent` | number | 10 | Max visual change vs baseline (%) |
| `visual_baseline_id` | string | null | Baseline reference ID |
| `create_baseline_on_first_pass` | boolean | false | Auto-create baseline on first success |
| `fail_on_brand_violations` | boolean | false | Hard fail on brand guideline violations |
| `checks` | object | {} | Individual check configurations |

### CLI Overrides

Override profile settings via CLI:

```bash
# Override minimum score
node orchestrator.js job.json --qa-min-score 98

# Override visual diff threshold
node orchestrator.js job.json --qa-max-diff 3

# Disable specific checks
node orchestrator.js job.json --qa-disable-accessibility
```

### Examples

See [QAPROFILE-GUIDE.md](./QAPROFILE-GUIDE.md) for complete guide with:
- 5 pre-built profiles (draft, standard, premium, world-class, print)
- Custom profile creation
- Check weight tuning
- Brand-specific profiles

---

## Automatic Baseline Creation

### Problem Solved

**Before Phase 6**: Manual baseline creation required:
1. Generate approved PDF
2. Run `create-reference-screenshots.js` manually
3. Save baseline to `references/` directory
4. Update job config with baseline ID

**After Phase 6**: Automatic on first success:
```json
{
  "qaProfile": {
    "visual_baseline_id": "tfu-aws-v1",
    "create_baseline_on_first_pass": true
  }
}
```

### How It Works

**First Run** (no baseline exists):
1. Job executes normally
2. PDF generated
3. QA validation runs (skips visual regression)
4. If QA passes → **Auto-creates baseline**
5. Saves to `references/{visual_baseline_id}/`
6. Job succeeds

**Subsequent Runs** (baseline exists):
1. Job executes normally
2. PDF generated
3. QA validation runs **with visual regression**
4. Compares against baseline
5. Job passes/fails based on diff threshold

### Baseline Storage

Baselines stored in:
```
references/
├── tfu-aws-v1/           # Baseline ID
│   ├── page-1.png        # 300 DPI reference screenshots
│   ├── page-2.png
│   ├── metadata.json     # Baseline metadata
│   └── colors.json       # Color analysis
```

### Baseline Metadata

```json
{
  "baselineId": "tfu-aws-v1",
  "createdAt": "2025-11-13T10:30:00Z",
  "jobId": "aws-partnership-2025",
  "pdfPath": "exports/TEEI-AWS-Partnership-TFU.pdf",
  "pageCount": 8,
  "dimensions": {
    "width": 2550,
    "height": 3300,
    "dpi": 300
  },
  "qaScore": 97,
  "approved": true
}
```

### Manual Baseline Creation (Optional)

If you need to create baseline from existing PDF:

```bash
# Create baseline manually
node scripts/create-reference-screenshots.js exports/approved.pdf my-baseline-id

# Use in job config
{
  "qaProfile": {
    "visual_baseline_id": "my-baseline-id",
    "create_baseline_on_first_pass": false
  }
}
```

### Baseline Versioning

Best practices for baseline management:

```json
// Version baselines by content/date
"visual_baseline_id": "tfu-aws-2025-q1-v1"

// Update when design changes significantly
"visual_baseline_id": "tfu-aws-2025-q1-v2"

// Use separate baselines per client
"visual_baseline_id": "tfu-google-v1"
```

---

## Runtime Metrics Tracking

### Overview

Phase 6 tracks detailed performance metrics for every job:

```json
{
  "jobId": "aws-partnership-2025",
  "metrics": {
    "startTime": "2025-11-13T10:30:00Z",
    "endTime": "2025-11-13T10:32:15Z",
    "duration_ms": 135000,
    "stages": {
      "validation": { "duration_ms": 500, "passed": true },
      "routing": { "duration_ms": 50, "worker": "mcp-manager" },
      "mcp_workflow": {
        "duration_ms": 120000,
        "steps": {
          "figma_extract": { "duration_ms": 2000 },
          "dalle_generate": { "duration_ms": 15000 },
          "indesign_create": { "duration_ms": 60000 },
          "indesign_export": { "duration_ms": 30000 },
          "playwright_qa": { "duration_ms": 13000 }
        }
      },
      "qa_validation": {
        "duration_ms": 14000,
        "score": 97,
        "passed": true
      }
    },
    "output": {
      "pdfPath": "exports/TEEI-AWS-Partnership-TFU.pdf",
      "fileSize_mb": 8.5,
      "pageCount": 8
    }
  }
}
```

### Metrics Collected

#### Job-Level Metrics
- Total duration (ms)
- Start/end timestamps
- Success/failure status
- Worker type used
- QA score achieved

#### Stage-Level Metrics
- Validation duration
- Routing decision time
- Worker execution time
- QA validation time
- Baseline creation time (if applicable)

#### MCP Workflow Metrics
- Per-step duration
- Server response times
- Tool invocation counts
- Failure recovery attempts

#### Output Metrics
- PDF file size
- Page count
- Resolution (DPI)
- Export format

### Metrics Storage

Metrics saved to:
```
reports/metrics/
├── job-aws-partnership-2025-metrics.json
├── job-google-partnership-2025-metrics.json
└── daily/
    ├── 2025-11-13-metrics.json
    └── 2025-11-14-metrics.json
```

### Metrics API

Access metrics programmatically:

```javascript
const orchestrator = new PDFOrchestrator();

// Get metrics for specific job
const metrics = await orchestrator.getJobMetrics('aws-partnership-2025');

// Get daily metrics
const dailyMetrics = await orchestrator.getDailyMetrics('2025-11-13');

// Get aggregated metrics
const aggMetrics = await orchestrator.getAggregatedMetrics({
  startDate: '2025-11-01',
  endDate: '2025-11-30',
  groupBy: 'jobType'
});
```

### Dashboard Integration

View metrics in real-time dashboard:

```bash
# Start metrics dashboard
npm run start-metrics

# Access at http://localhost:3000/dashboard
```

Dashboard shows:
- Jobs per day
- Average duration by worker
- QA score trends
- Success/failure rates
- Cost tracking (if enabled)

---

## Job Dependency Graphs

### Overview

Chain multiple jobs with dependencies:

```json
{
  "workflow": {
    "id": "aws-complete-package",
    "jobs": [
      {
        "id": "generate-partnership-pdf",
        "jobFile": "example-jobs/tfu-aws-partnership.json",
        "dependencies": []
      },
      {
        "id": "generate-program-overview",
        "jobFile": "example-jobs/aws-program-overview.json",
        "dependencies": ["generate-partnership-pdf"]
      },
      {
        "id": "generate-presentation",
        "jobFile": "example-jobs/aws-presentation.json",
        "dependencies": ["generate-partnership-pdf", "generate-program-overview"]
      }
    ]
  }
}
```

### How It Works

1. **Parse workflow** - Load all job definitions
2. **Build dependency graph** - Determine execution order
3. **Execute sequentially** - Run jobs respecting dependencies
4. **Pass context** - Share outputs between jobs
5. **Aggregate results** - Collect all outputs

### Dependency Types

#### Sequential Dependencies
```json
{
  "id": "job-b",
  "dependencies": ["job-a"]
}
```
Job B waits for Job A to complete.

#### Parallel Execution
```json
{
  "id": "job-c",
  "dependencies": []
},
{
  "id": "job-d",
  "dependencies": []
}
```
Jobs C and D run in parallel.

#### Diamond Dependencies
```json
{
  "id": "job-d",
  "dependencies": ["job-b", "job-c"]
}
```
Job D waits for both Job B and Job C.

### Context Passing

Pass outputs between jobs:

```json
{
  "id": "generate-presentation",
  "jobFile": "example-jobs/aws-presentation.json",
  "dependencies": ["generate-partnership-pdf"],
  "contextMapping": {
    "pdfPath": "$.generate-partnership-pdf.outputPath",
    "qaScore": "$.generate-partnership-pdf.qa.score"
  }
}
```

### CLI Usage

```bash
# Run workflow from file
node orchestrator.js --workflow workflows/aws-complete-package.json

# Dry-run (show execution plan)
node orchestrator.js --workflow workflows/aws-complete-package.json --dry-run

# Run specific job in workflow
node orchestrator.js --workflow workflows/aws-complete-package.json --job generate-presentation
```

### Error Handling

Workflow execution stops on first failure by default:

```json
{
  "workflow": {
    "id": "aws-complete-package",
    "continueOnError": false,  // Stop on first failure
    "jobs": [...]
  }
}
```

Continue despite failures:

```json
{
  "workflow": {
    "continueOnError": true,  // Keep going despite failures
    "jobs": [...]
  }
}
```

---

## MCP Flows

Multi-server MCP workflow orchestration. See [MCP-FLOWS-GUIDE.md](./MCP-FLOWS-GUIDE.md) for complete details.

### Quick Overview

Enable multi-server workflows:

```json
{
  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "figma": {
        "enabled": true,
        "action": "extractDesignTokens"
      },
      "dalle": {
        "enabled": true,
        "action": "generateHeroImage"
      },
      "indesign": {
        "enabled": true,
        "actions": ["openTemplate", "applyBrandColors", "bindData", "exportPDF"]
      }
    }
  }
}
```

### Available Flows

1. **Figma Flow** - Extract brand tokens from Figma
2. **DALL-E Flow** - Generate AI images
3. **InDesign Flow** - Create PDFs
4. **Playwright Flow** - Run QA validation
5. **GitHub Flow** - Commit results

See [MCP-FLOWS-GUIDE.md](./MCP-FLOWS-GUIDE.md) for detailed configuration.

---

## Approval Workflows

### Overview

Human-in-the-loop approval before finalizing PDFs:

```json
{
  "approval": {
    "mode": "slack",
    "channel": "#design-approvals",
    "timeout": 3600,
    "approvers": ["@designer", "@manager"]
  }
}
```

### Approval Modes

| Mode | Description | When to Use |
|------|-------------|-------------|
| `none` | Skip approval (auto-approve) | Development, trusted automation |
| `auto` | Approve if QA passes | Standard production jobs |
| `slack` | Request approval via Slack | Client deliverables, new designs |
| `manual` | CLI prompt for approval | Local development, testing |

### Slack Integration

#### Setup

1. Create Slack incoming webhook:
   ```
   https://api.slack.com/messaging/webhooks
   ```

2. Add webhook URL to `.env`:
   ```bash
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. Configure approval in job:
   ```json
   {
     "approval": {
       "mode": "slack",
       "channel": "#design-approvals"
     }
   }
   ```

#### Approval Message

Slack message includes:
- Job ID and type
- Client name
- QA score
- Screenshot preview (if available)
- Approve/Reject buttons
- Timeout countdown

#### Response Handling

**Approved**:
- Job continues to finalization
- PDF moved to `exports/approved/`
- Approval logged to `reports/approvals/`

**Rejected**:
- Job fails with rejection reason
- PDF moved to `exports/rejected/`
- Rejection logged

**Timeout**:
- Job auto-approves (configurable)
- Timeout logged

### CLI Usage

```bash
# Test approval workflow
node approval/approval-manager.js \
  --scorecard reports/pipeline/job-scorecard.json \
  --mode slack \
  --channel #design-approvals

# Manual approval prompt
node approval/approval-manager.js \
  --scorecard reports/pipeline/job-scorecard.json \
  --mode manual
```

### Approval Log Format

```json
{
  "jobId": "aws-partnership-2025",
  "approved": true,
  "mode": "slack",
  "approver": "@designer",
  "timestamp": "2025-11-13T10:35:00Z",
  "duration_seconds": 120,
  "scorecard": {
    "score": 97,
    "passed": true
  },
  "note": "approved_by_user"
}
```

---

## Experiment Mode

A/B testing for PDFs. See [EXPERIMENT-MODE-GUIDE.md](./EXPERIMENT-MODE-GUIDE.md) for complete details.

### Quick Overview

Compare multiple PDF variants:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      {
        "id": "variant-a-traditional",
        "design": { "layout": "classic", "colorScheme": "nordshore" }
      },
      {
        "id": "variant-b-modern",
        "design": { "layout": "asymmetric", "colorScheme": "sky" }
      }
    ],
    "selectionCriteria": {
      "metric": "qa_score",
      "mode": "highest"
    }
  }
}
```

### Winner Selection

Automatically selects best variant based on:
- QA score (highest/lowest)
- File size (smallest/largest)
- Generation time (fastest/slowest)
- Visual diff from baseline (smallest)
- Custom criteria

See [EXPERIMENT-MODE-GUIDE.md](./EXPERIMENT-MODE-GUIDE.md) for examples.

---

## Integration Patterns

### CI/CD Integration

#### GitHub Actions

```yaml
name: Generate Partnership PDFs

on:
  push:
    branches: [main]
    paths:
      - 'example-jobs/**'

jobs:
  generate-pdfs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Generate PDFs
        run: |
          node orchestrator.js example-jobs/tfu-aws-partnership.json
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          FIGMA_ACCESS_TOKEN: ${{ secrets.FIGMA_ACCESS_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: pdfs
          path: exports/*.pdf

      - name: Upload metrics
        uses: actions/upload-artifact@v3
        with:
          name: metrics
          path: reports/metrics/*.json
```

#### GitLab CI

```yaml
generate-pdfs:
  stage: build
  image: node:18
  script:
    - npm install
    - node orchestrator.js example-jobs/tfu-aws-partnership.json
  artifacts:
    paths:
      - exports/*.pdf
      - reports/metrics/*.json
    expire_in: 30 days
  only:
    - main
```

### Webhook Integration

Trigger jobs via webhook:

```javascript
// webhook-server.js
const express = require('express');
const PDFOrchestrator = require('./orchestrator.js');

const app = express();
app.use(express.json());

app.post('/api/jobs', async (req, res) => {
  const orchestrator = new PDFOrchestrator();

  try {
    const result = await orchestrator.executeJob(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

### Scheduled Jobs

Run jobs on schedule:

```javascript
// scheduled-jobs.js
const cron = require('node-cron');
const PDFOrchestrator = require('./orchestrator.js');

// Generate daily reports at 8 AM
cron.schedule('0 8 * * *', async () => {
  const orchestrator = new PDFOrchestrator();
  await orchestrator.processJobFile('example-jobs/daily-report.json');
});

// Generate weekly partnership PDFs on Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  const orchestrator = new PDFOrchestrator();
  await orchestrator.processJobFile('example-jobs/tfu-aws-partnership.json');
});
```

---

## Troubleshooting

### QA Profile Issues

**Problem**: QA validation fails despite good PDF

**Solution**:
1. Check QA profile thresholds - may be too strict
2. Review individual check scores in validation report
3. Adjust check weights in profile
4. Create new baseline if design changed significantly

```bash
# View detailed QA report
cat reports/validation/job-aws-partnership-2025-qa.json

# Adjust profile thresholds
{
  "qaProfile": {
    "min_score": 90  # Lower from 95
  }
}
```

### Baseline Creation Issues

**Problem**: Baseline not auto-created on first pass

**Solution**:
1. Verify `create_baseline_on_first_pass: true` in profile
2. Check QA passed on first run (baselines only created on success)
3. Verify write permissions to `references/` directory
4. Check logs for baseline creation errors

```bash
# Check if baseline exists
ls references/tfu-aws-v1/

# Manually create if needed
node scripts/create-reference-screenshots.js exports/approved.pdf tfu-aws-v1
```

### MCP Flow Issues

**Problem**: MCP workflow fails at specific step

**Solution**:
1. Check MCP server status (Figma, DALL-E, InDesign)
2. Verify environment variables set (FIGMA_ACCESS_TOKEN, OPENAI_API_KEY)
3. Check MCP server logs in `logs/mcp/`
4. Test individual MCP servers separately

```bash
# Test Figma connection
node scripts/test-figma-mcp.js

# Test DALL-E connection
node scripts/test-dalle-mcp.js

# Check MCP server logs
cat logs/mcp/mcp-manager.log
```

### Approval Workflow Issues

**Problem**: Slack approval not sending

**Solution**:
1. Verify `SLACK_WEBHOOK_URL` in `.env`
2. Test webhook manually
3. Check Slack channel exists and bot has access
4. Review approval logs in `reports/approvals/`

```bash
# Test Slack webhook
node scripts/test-slack-approval.js

# Check webhook URL
echo $SLACK_WEBHOOK_URL
```

### Performance Issues

**Problem**: Jobs taking too long

**Solution**:
1. Check metrics to identify bottleneck stage
2. Optimize slow MCP steps (e.g., disable AI image generation for testing)
3. Use faster QA tier (`fast` instead of `premium`)
4. Disable unnecessary checks in QA profile

```bash
# View performance metrics
cat reports/metrics/job-aws-partnership-2025-metrics.json

# Disable slow features for testing
{
  "mcp": {
    "servers": {
      "dalle": { "enabled": false }  # Skip AI image generation
    }
  },
  "qaProfile": {
    "checks": {
      "visual_regression": { "enabled": false }  # Skip visual diff
    }
  }
}
```

---

## Next Steps

1. **Learn QA Profiles** - Read [QAPROFILE-GUIDE.md](./QAPROFILE-GUIDE.md)
2. **Explore MCP Flows** - Read [MCP-FLOWS-GUIDE.md](./MCP-FLOWS-GUIDE.md)
3. **Try Experiments** - Read [EXPERIMENT-MODE-GUIDE.md](./EXPERIMENT-MODE-GUIDE.md)
4. **Migrate from Phase 5** - Read [MIGRATION-TO-PHASE-6.md](./MIGRATION-TO-PHASE-6.md)
5. **Run Examples** - Try jobs in `examples/phase-6/`

---

## Support

- **Issues**: Create GitHub issue with `phase-6` label
- **Questions**: Ask in `#pdf-orchestrator` Slack channel
- **Documentation**: Check `docs/` directory for specific guides

---

**Last Updated**: 2025-11-13
**Version**: Phase 6.0
**Status**: Production-ready
