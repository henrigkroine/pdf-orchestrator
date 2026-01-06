# Approval Workflows

Human-in-the-loop PDF validation with Slack integration.

## Overview

The approval system adds a gatekeeper step between validation and downstream actions (GitHub sync, Notion recording, etc.). It supports multiple approval modes to fit different workflows.

## Approval Modes

### 1. **none** - Skip Approval
No approval required, pipeline continues immediately.

**Use case**: Automated CI/CD pipelines where validation is sufficient

```json
{
  "approval": {
    "mode": "none"
  }
}
```

### 2. **auto** - Automatic Approval
Approves if validation passed, rejects if failed.

**Use case**: Quality gates based on validation scores only

```json
{
  "approval": {
    "mode": "auto"
  }
}
```

### 3. **slack** - Slack Approval (Recommended)
Posts scorecard to Slack channel with approve/reject buttons.

**Use case**: Design team review before client delivery

```json
{
  "approval": {
    "mode": "slack",
    "channel": "#design-approvals",
    "timeout": 3600
  }
}
```

**Requirements**:
- Slack webhook URL configured (see Configuration below)
- Channel must exist and bot must have access

**Current Limitation**: Interactive button callbacks not yet implemented. System will post to Slack and auto-approve after timeout. Full interactive approval coming in future version.

### 4. **manual** - Manual Approval
Prompts for keyboard input (y/n) in terminal.

**Use case**: Local development and testing

```json
{
  "approval": {
    "mode": "manual",
    "timeout": 600
  }
}
```

## Configuration

### Slack Webhook Setup

1. **Create Slack App**:
   - Go to https://api.slack.com/apps
   - Create new app or select existing app
   - Enable "Incoming Webhooks"
   - Add webhook to desired channel

2. **Configure Webhook URL**:

   **Option A: Environment Variable (Recommended)**
   ```bash
   # Windows PowerShell
   $env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

   # Linux/Mac
   export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
   ```

   **Option B: Pass via CLI**
   ```bash
   node approval-manager.js --scorecard scorecard.json --mode slack --webhook-url https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```

3. **Test Webhook**:
   ```bash
   node approval-manager.js --scorecard reports/pipeline/test-scorecard.json --mode slack
   ```

### Job Config Integration

Add approval config to job JSON:

```json
{
  "jobId": "aws-partnership-2025",
  "client": "AWS",

  "approval": {
    "mode": "slack",
    "channel": "#design-approvals",
    "timeout": 3600
  },

  "qaProfile": {
    "min_score": 95
  }
}
```

## Usage

### CLI Usage

```bash
# Auto-approve if validation passed
node approval/approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode auto

# Request approval via Slack
node approval/approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode slack --channel #design-approvals

# Manual approval with prompt
node approval/approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode manual --timeout 600

# Skip approval
node approval/approval-manager.js --scorecard reports/pipeline/job-scorecard.json --mode none
```

### Pipeline Integration

The approval step is automatically triggered by `pipeline.py` after validation (if enabled in job config).

**Add to pipeline.py**:
```python
# After validation passes
if approval_mode != 'none':
    approval_result = run_approval(scorecard_path, job_config_path, approval_mode)
    if not approval_result['approved']:
        print("❌ Approval rejected, stopping pipeline")
        return False
```

## Timeout Behavior

All modes support timeout configuration:

- **Default**: 3600 seconds (1 hour)
- **On timeout**: Auto-approves to prevent pipeline from blocking indefinitely
- **Recommendation**: Set shorter timeouts for CI/CD (e.g., 300s), longer for manual review (e.g., 3600s)

```json
{
  "approval": {
    "mode": "slack",
    "timeout": 1800  // 30 minutes
  }
}
```

## Approval Decision Logs

All approval decisions are logged to `reports/approvals/` for audit trail:

```
reports/approvals/
├── approval-aws-partnership-2025-2025-11-13T14-30-00.json
├── approval-cornell-brochure-2025-11-13T15-45-00.json
└── approval-oxford-flyer-2025-11-13T16-20-00.json
```

**Log format**:
```json
{
  "approved": true,
  "mode": "slack",
  "note": "Posted to Slack, auto-approved (callback not implemented)",
  "duration_seconds": 2.3,
  "timestamp": "2025-11-13T14:30:00.000Z",
  "scorecard": {
    "jobId": "aws-partnership-2025",
    "score": 145,
    "passed": true
  },
  "channel": "#design-approvals",
  "messageTs": "2025-11-13T14:30:00.000Z"
}
```

## Testing Locally

### Test Auto Mode
```bash
# Create test scorecard
echo '{"jobId":"test","totalScore":95,"maxScore":150,"passed":true,"threshold":80}' > test-scorecard.json

# Run approval
node approval/approval-manager.js --scorecard test-scorecard.json --mode auto

# Should output: Decision: APPROVED
```

### Test Slack Mode (No Webhook)
```bash
# Without webhook, should auto-approve
node approval/approval-manager.js --scorecard test-scorecard.json --mode slack

# Should output: No webhook URL configured, auto-approving
```

### Test Slack Mode (With Webhook)
```bash
# Set webhook URL
$env:SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Run approval
node approval/approval-manager.js --scorecard test-scorecard.json --mode slack --channel #test

# Check Slack channel for message
```

### Test Manual Mode
```bash
node approval/approval-manager.js --scorecard test-scorecard.json --mode manual

# Will prompt: Approve? (y/n):
# Type 'y' and press Enter
```

## Exit Codes

The approval manager uses exit codes for CI/CD integration:

- `0` - Approved
- `1` - Rejected or error

Example CI/CD usage:
```bash
# Run validation
python pipeline.py --validate-only --pdf output.pdf || exit 1

# Request approval
node approval/approval-manager.js --scorecard reports/pipeline/scorecard.json --mode slack || exit 1

# Continue with deployment
echo "✅ Approved, deploying..."
```

## Architecture

```
approval/
├── approval-manager.js     # Main coordinator, handles all modes
├── slack-approval.js       # Slack-specific logic
└── README.md              # This file

Workflow:
1. approval-manager.js loads scorecard and job config
2. Routes to appropriate mode handler (none/auto/slack/manual)
3. Returns approval decision
4. Logs decision to reports/approvals/
5. Exits with 0 (approved) or 1 (rejected)
```

## Roadmap

### Current Status
- ✅ Four approval modes (none, auto, slack, manual)
- ✅ Slack message posting with scorecard
- ✅ Timeout handling
- ✅ Approval decision logging
- ⚠️ Slack interactive buttons (posted but callback not implemented)

### Future Enhancements
- [ ] Slack Events API listener for real button interactions
- [ ] Microsoft Teams integration
- [ ] Email approval workflow
- [ ] Multi-approver support (require N approvals)
- [ ] Approval templates (different message formats)
- [ ] Approval history dashboard

## Troubleshooting

### Slack webhook not working
- Verify webhook URL is correct
- Check channel exists and bot has access
- Test webhook manually:
  ```bash
  curl -X POST -H 'Content-Type: application/json' \
    --data '{"text":"Test message"}' \
    https://hooks.slack.com/services/YOUR/WEBHOOK/URL
  ```

### Approval times out immediately
- Check timeout value is in seconds (not milliseconds)
- Default is 3600s (1 hour)
- Minimum recommended: 60s

### Pipeline continues despite rejection
- Verify exit code is being checked
- Use `|| exit 1` in bash scripts
- Check approval mode is not "none"

### Interactive buttons don't work
- Known limitation - callback not yet implemented
- System will auto-approve after timeout
- Use "manual" mode for actual human gate in meantime

## Support

For questions or issues:
1. Check this README first
2. Review approval decision logs in `reports/approvals/`
3. Test with `--mode auto` to verify basic functionality
4. Check Slack webhook configuration
