# Migration to Phase 6

**Step-by-step guide to upgrade from Phase 5**

This guide walks you through migrating existing jobs and workflows to Phase 6 with its new enterprise features (QA profiles, auto-baselines, MCP flows, approval workflows, and experiment mode).

---

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Backward Compatibility](#backward-compatibility)
4. [Step-by-Step Migration](#step-by-step-migration)
5. [Feature-by-Feature Migration](#feature-by-feature-migration)
6. [Testing Your Migration](#testing-your-migration)
7. [Rollback Plan](#rollback-plan)

---

## Overview

### What Changed in Phase 6?

**New Features** (opt-in):
- QA Profiles (config-driven validation)
- Automatic baseline creation
- Runtime metrics tracking
- Job dependency graphs
- MCP flows (multi-server orchestration)
- Approval workflows (human-in-the-loop)
- Experiment mode (A/B testing)

**Enhancements** (automatic):
- Improved error handling
- Better logging and diagnostics
- Performance optimizations
- Cost tracking improvements

**Deprecated** (still functional):
- External QA scripts (use QA profiles instead)
- Manual baseline creation scripts (use auto-baselines)
- Direct MCP worker invocation (use MCP Manager)

---

## Breaking Changes

### None!

Phase 6 is **100% backward compatible** with Phase 5 job configs. All existing jobs will continue to work without modification.

### Optional Migrations

To use Phase 6 features, you need to:

1. **Add `qaProfile`** to job config (optional - defaults to Phase 5 behavior)
2. **Enable MCP flows** in job config (optional - defaults to direct worker)
3. **Add `experimentMode`** for A/B testing (optional)
4. **Add `approval`** for human sign-off (optional)

---

## Backward Compatibility

### Phase 5 Jobs Work As-Is

Existing Phase 5 jobs run unchanged:

```json
{
  "jobId": "my-job",
  "jobType": "partnership",
  "output": { "format": "pdf" },
  "qa": {
    "enabled": true,
    "threshold": 90
  }
}
```

This continues to work in Phase 6 using legacy QA validation.

### Gradual Migration

Migrate one job at a time. No "big bang" required.

---

## Step-by-Step Migration

### Step 1: Backup Existing Jobs

```bash
# Backup all job configs
cp -r example-jobs example-jobs-phase5-backup

# Backup config
cp config/orchestrator.config.json config/orchestrator.config.json.phase5
```

### Step 2: Update Dependencies

```bash
# Pull latest Phase 6 code
git pull origin main

# Install new dependencies
npm install

# No Python dependency changes
```

### Step 3: Test Backward Compatibility

```bash
# Run existing job (should work unchanged)
node orchestrator.js example-jobs/report-sample.json

# Verify output matches Phase 5 behavior
```

### Step 4: Migrate One Job to QA Profiles

Convert existing `qa` block to `qaProfile`:

**Before (Phase 5)**:
```json
{
  "qa": {
    "enabled": true,
    "threshold": 90,
    "auto_fix_colors": true
  }
}
```

**After (Phase 6)**:
```json
{
  "qaProfile": {
    "id": "standard",
    "min_score": 90
  },
  "qa": {
    "auto_fix_colors": true
  }
}
```

### Step 5: Test Migrated Job

```bash
# Run migrated job
node orchestrator.js example-jobs/report-sample.json

# Compare output with Phase 5 version
node scripts/compare-pdf-visual.js \
  exports-phase5/report.pdf \
  exports/report.pdf
```

### Step 6: Repeat for All Jobs

Migrate remaining jobs one by one, testing each.

### Step 7: Enable New Features

Add Phase 6 features as needed:
- QA profiles (all jobs)
- Auto-baselines (jobs needing visual regression)
- MCP flows (jobs using multiple MCP servers)
- Approval workflows (client-facing jobs)
- Experiment mode (jobs needing A/B testing)

---

## Feature-by-Feature Migration

### Migrating to QA Profiles

#### Phase 5: External QA Script

```json
{
  "qa": {
    "enabled": true,
    "threshold": 90,
    "auto_fix_colors": true,
    "visualRegression": {
      "enabled": true,
      "baseline": "my-baseline",
      "maxDiffPercent": 5
    }
  }
}
```

#### Phase 6: QA Profile

```json
{
  "qaProfile": {
    "id": "standard",
    "min_score": 90,
    "visual_baseline_id": "my-baseline",
    "max_visual_diff_percent": 5,
    "create_baseline_on_first_pass": true
  },
  "qa": {
    "auto_fix_colors": true
  }
}
```

**Benefits**:
- All QA config in one place
- Reusable profiles across jobs
- Automatic baseline creation
- Better reporting

### Migrating to Auto-Baselines

#### Phase 5: Manual Baseline Creation

```bash
# Generate PDF
node orchestrator.js job.json

# Manually create baseline
node scripts/create-reference-screenshots.js exports/output.pdf my-baseline

# Update job config with baseline ID
# Run job again for visual regression
```

#### Phase 6: Automatic

```json
{
  "qaProfile": {
    "visual_baseline_id": "my-baseline",
    "create_baseline_on_first_pass": true
  }
}
```

**First run**: Auto-creates baseline
**Subsequent runs**: Compares against baseline

**Benefits**:
- No manual baseline creation
- Baseline created on first success
- Automatic versioning

### Migrating to MCP Flows

#### Phase 5: Direct Worker Invocation

```json
{
  "mcpMode": true,
  "style": "TFU"
}
```

Orchestrator directly called MCP worker.

#### Phase 6: MCP Manager

```json
{
  "mcp": {
    "workflow": "generate-partnership-pdf",
    "servers": {
      "figma": { "enabled": true, "action": "extractDesignTokens" },
      "dalle": { "enabled": true, "action": "generateHeroImage" },
      "indesign": { "enabled": true, "actions": ["openTemplate", "exportPDF"] }
    }
  }
}
```

**Benefits**:
- Multi-server orchestration
- Context passing between steps
- Better error handling
- Retry and fallback logic

### Migrating to Approval Workflows

#### Phase 5: Manual Approval

Generate PDF, manually review, manually move to approved directory.

#### Phase 6: Automated Approval

```json
{
  "approval": {
    "mode": "slack",
    "channel": "#design-approvals",
    "timeout": 3600
  }
}
```

**Benefits**:
- Automated approval requests
- Slack integration
- Audit trail
- Timeout handling

### Adding Experiment Mode (New Feature)

No Phase 5 equivalent. Add to existing jobs:

```json
{
  "experimentMode": {
    "enabled": true,
    "variants": [
      { "id": "variant-a", "design": { "layout": "classic" } },
      { "id": "variant-b", "design": { "layout": "modern" } }
    ],
    "selectionCriteria": {
      "metric": "qa_score",
      "mode": "highest"
    }
  }
}
```

---

## Testing Your Migration

### Test 1: Backward Compatibility

Ensure Phase 5 jobs still work:

```bash
# Run Phase 5 job unchanged
node orchestrator.js example-jobs-phase5-backup/report-sample.json

# Should complete successfully
```

### Test 2: QA Profile Migration

Compare Phase 5 vs Phase 6 QA validation:

```bash
# Phase 5 (with old qa block)
node orchestrator.js example-jobs-phase5-backup/partnership.json

# Phase 6 (with qaProfile)
node orchestrator.js example-jobs/partnership.json

# Compare QA scores (should be similar)
```

### Test 3: Auto-Baseline Creation

Verify baseline auto-creation:

```bash
# Delete existing baseline
rm -rf references/test-baseline

# Run job with auto-baseline enabled
node orchestrator.js example-jobs/test-baseline.json

# Verify baseline created
ls references/test-baseline/
```

### Test 4: MCP Flows

Test multi-server workflow:

```bash
# Set environment variables
export FIGMA_ACCESS_TOKEN=your_token
export OPENAI_API_KEY=your_key

# Run MCP flow job
node orchestrator.js example-jobs/tfu-aws-partnership.json

# Verify all MCP servers invoked
grep "MCP Manager" logs/orchestrator.log
```

### Test 5: Approval Workflow

Test Slack approval:

```bash
# Set Slack webhook
export SLACK_WEBHOOK_URL=your_webhook

# Run job with approval
node orchestrator.js example-jobs/test-approval.json

# Check Slack for approval message
```

---

## Rollback Plan

### If Migration Fails

**Option 1: Revert Specific Job**

```bash
# Restore Phase 5 job config
cp example-jobs-phase5-backup/job.json example-jobs/job.json

# Run restored job
node orchestrator.js example-jobs/job.json
```

**Option 2: Revert All Jobs**

```bash
# Restore all Phase 5 jobs
rm -rf example-jobs
cp -r example-jobs-phase5-backup example-jobs

# Restore Phase 5 config
cp config/orchestrator.config.json.phase5 config/orchestrator.config.json
```

**Option 3: Rollback Code**

```bash
# Find Phase 5 commit
git log --oneline | grep "Phase 5"

# Revert to Phase 5
git checkout <phase5-commit-sha>

# Install Phase 5 dependencies
npm install
```

### Disable Phase 6 Features

Temporarily disable Phase 6 features via environment variable:

```bash
# Disable QA profiles (use legacy QA)
export DISABLE_QA_PROFILES=true

# Disable MCP Manager (use direct worker)
export DISABLE_MCP_MANAGER=true

# Run job
node orchestrator.js example-jobs/job.json
```

---

## Migration Checklist

Use this checklist to track migration progress:

### Pre-Migration
- [ ] Backup all job configs
- [ ] Backup orchestrator config
- [ ] Document current behavior
- [ ] Test all Phase 5 jobs

### Migration
- [ ] Update dependencies (`npm install`)
- [ ] Test backward compatibility
- [ ] Migrate job #1 to QA profiles
- [ ] Test migrated job #1
- [ ] Migrate job #2 to QA profiles
- [ ] Test migrated job #2
- [ ] (Repeat for all jobs)
- [ ] Enable auto-baselines where needed
- [ ] Add MCP flows where needed
- [ ] Add approval workflows where needed

### Post-Migration
- [ ] Run full test suite
- [ ] Compare outputs vs Phase 5
- [ ] Update documentation
- [ ] Train team on Phase 6 features
- [ ] Delete Phase 5 backups (after verification)

---

## Common Issues

### Issue 1: QA Scores Different

**Problem**: Phase 6 QA scores differ from Phase 5

**Cause**: QA profile uses different weighting

**Solution**: Adjust check weights in profile to match Phase 5 behavior

```json
{
  "qaProfile": {
    "checks": {
      "typography": { "weight": 20 },
      "colors": { "weight": 25 },
      "layout": { "weight": 20 },
      "accessibility": { "weight": 15 },
      "visual_regression": { "weight": 20 }
    }
  }
}
```

### Issue 2: Baseline Not Created

**Problem**: Auto-baseline not created on first run

**Cause**: Job failed QA validation

**Solution**: Fix QA issues first, then re-run

```bash
# Check QA report
cat reports/validation/job-qa.json

# Fix issues, then re-run
node orchestrator.js example-jobs/job.json
```

### Issue 3: MCP Flow Fails

**Problem**: MCP Manager workflow fails

**Cause**: Missing environment variables or MCP server not running

**Solution**: Verify MCP servers and environment variables

```bash
# Check environment variables
echo $FIGMA_ACCESS_TOKEN
echo $OPENAI_API_KEY

# Check MCP server status
node scripts/test-mcp-servers.js
```

### Issue 4: Approval Timeout

**Problem**: Approval workflow times out

**Cause**: No response within timeout period

**Solution**: Increase timeout or enable auto-approve on timeout

```json
{
  "approval": {
    "mode": "slack",
    "timeout": 7200,
    "autoApproveOnTimeout": true
  }
}
```

---

## Getting Help

### Resources

- **Phase 6 Guide**: [PHASE-6-GUIDE.md](./PHASE-6-GUIDE.md)
- **QA Profile Guide**: [QAPROFILE-GUIDE.md](./QAPROFILE-GUIDE.md)
- **MCP Flows Guide**: [MCP-FLOWS-GUIDE.md](./MCP-FLOWS-GUIDE.md)
- **Experiment Mode Guide**: [EXPERIMENT-MODE-GUIDE.md](./EXPERIMENT-MODE-GUIDE.md)

### Support Channels

- **GitHub Issues**: Tag with `migration` label
- **Slack**: `#pdf-orchestrator` channel
- **Email**: support@example.com

---

## Next Steps

1. **Backup existing jobs** - Safety first
2. **Test backward compatibility** - Ensure Phase 5 jobs still work
3. **Migrate one job** - Start small
4. **Enable one Phase 6 feature** - Try QA profiles first
5. **Migrate remaining jobs** - One by one
6. **Enable advanced features** - MCP flows, approval, experiments

---

**Last Updated**: 2025-11-13
**Version**: Phase 6.0
**Status**: Production-ready
