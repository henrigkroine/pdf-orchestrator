# Monitoring Setup Guide

**Project**: PDF Orchestrator
**Purpose**: Complete guide to monitoring, telemetry, and alerting
**Last Updated**: 2025-11-05

---

## Quick Start

### 1. Run Setup Script

```powershell
# Windows PowerShell (recommended)
.\scripts\setup-monitoring.ps1
```

This will:
- Create log directories (`logs/operations`, `logs/errors`, `logs/metrics`, `logs/security`)
- Configure log rotation (keeps 90 days)
- Test telemetry system
- Create metrics aggregator script

### 2. Configure Environment Variables

Create or update `config/.env`:

```bash
# Slack Alerts
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email Alerts (via Resend API)
RESEND_API_KEY=re_your_api_key_here

# PagerDuty (optional)
PAGERDUTY_INTEGRATION_KEY=your_integration_key_here
```

**IMPORTANT**: Use TEEI credentials for this project:
- Resend API key: `T:\Secrets\teei\resend\api-key.txt`
- Slack webhook: `T:\Secrets\teei\slack\pdf-orchestrator-webhook.txt`

### 3. Start Metrics Aggregator

```bash
# Foreground (for testing)
node start-metrics-aggregator.js

# Background (production)
Start-Process node -ArgumentList "start-metrics-aggregator.js" -WindowStyle Hidden
```

The aggregator runs every 15 minutes and calculates:
- P50, P95, P99 latency
- Success rate, error rate
- Daily and monthly spend
- Operations by type
- Errors by service

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PDF Orchestrator                        │
│                                                             │
│  orchestrator.js ──► telemetry.recordOperation()           │
│                      │                                      │
│                      ├─► logs/operations/YYYY-MM-DD.jsonl   │
│                      ├─► logs/errors/YYYY-MM-DD.jsonl       │
│                      └─► logs/metrics/YYYY-MM-DD.jsonl      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Metrics Aggregator (15-minute cycle)           │
│                                                             │
│  - Calculate P50, P95, P99 latency                         │
│  - Calculate success rate, error rate                       │
│  - Sum daily/monthly spend                                  │
│  - Write to logs/metrics/aggregated.jsonl                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Alert Dispatcher                         │
│                                                             │
│  - Check alert conditions                                   │
│  - Send to Slack, Email, PagerDuty                         │
│  - Follow escalation policies                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Grafana Dashboards                          │
│                                                             │
│  - orchestrator-performance.json                            │
│  - orchestrator-quality.json                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Viewing Logs

### Log Locations

All logs are stored in JSON Lines format (`.jsonl`):

```
logs/
├── operations/      # Operation logs (success, failure, timeout)
│   └── 2025-11-05.jsonl
├── errors/          # Error logs with full context
│   └── 2025-11-05.jsonl
├── metrics/         # Custom metrics and aggregated data
│   ├── 2025-11-05.jsonl
│   └── aggregated.jsonl
└── security/        # Security audit logs
    └── 2025-11-05.jsonl
```

### Reading Logs (PowerShell)

```powershell
# View today's operations
Get-Content "logs\operations\$(Get-Date -Format 'yyyy-MM-dd').jsonl" | ForEach-Object { $_ | ConvertFrom-Json | ConvertTo-Json -Depth 10 }

# Count operations today
(Get-Content "logs\operations\$(Get-Date -Format 'yyyy-MM-dd').jsonl").Count

# View errors today
Get-Content "logs\errors\$(Get-Date -Format 'yyyy-MM-dd').jsonl" | ForEach-Object { $_ | ConvertFrom-Json | ConvertTo-Json -Depth 10 }

# View aggregated metrics
Get-Content "logs\metrics\aggregated.jsonl" | Select-Object -Last 10 | ForEach-Object { $_ | ConvertFrom-Json | ConvertTo-Json }
```

### Reading Logs (Node.js)

```javascript
const { readOperationLogs, getDailySpend } = require('./workers/telemetry');

// Read today's logs
const today = new Date().toISOString().split('T')[0];
const logs = await readOperationLogs(today, today);

console.log(`Total operations: ${logs.length}`);
console.log(`Daily spend: $${await getDailySpend(today)}`);

// Filter by operation type
const docGenerations = logs.filter(log => log.operation === 'generate_document');
console.log(`Documents generated: ${docGenerations.length}`);
```

### Log Schema

**Operation Log Entry**:
```json
{
  "timestamp": "2025-11-05T10:30:00.000Z",
  "level": "info",
  "service": "pdf-orchestrator",
  "operation": "generate_document",
  "run_id": "uuid-1234-5678",
  "doc_slug": "teei-aws-partnership-v2",
  "user": "henrik@teei.org",
  "latency_ms": 18500,
  "status": "success",
  "cost_usd": 0.61,
  "api_calls": [
    {
      "service": "openai_images",
      "operation": "generate",
      "latency_ms": 12000,
      "cost_usd": 0.12,
      "model": "dall-e-3"
    }
  ],
  "assets": {
    "images_generated": 4,
    "pages": 12,
    "file_size_bytes": 2450000
  },
  "validation": {
    "accessibility_pass": true,
    "visual_ssim": 0.97,
    "brand_compliance": true
  }
}
```

---

## Grafana Dashboards

### Installation

1. **Install Grafana** (if not already installed):
   ```powershell
   # Using Chocolatey
   choco install grafana

   # Or download from https://grafana.com/grafana/download
   ```

2. **Start Grafana**:
   ```powershell
   # Windows service
   Start-Service Grafana

   # Or run manually
   grafana-server.exe
   ```

3. **Access Grafana**: http://localhost:3000
   - Default username: `admin`
   - Default password: `admin` (change on first login)

### Import Dashboards

1. Open Grafana at http://localhost:3000
2. Go to **Dashboards** → **Import**
3. Upload JSON files:
   - `config/grafana/dashboards/orchestrator-performance.json`
   - `config/grafana/dashboards/orchestrator-quality.json`

### Dashboard Overview

#### Performance Dashboard

**URL**: http://localhost:3000/d/pdf-orchestrator-performance

**Panels**:
1. **Latency Percentiles** - Time series showing P50, P95, P99 latency
2. **Request Rate** - Gauge showing requests per minute
3. **Success Rate** - Stat showing percentage of successful operations
4. **Daily Spend** - Bar chart of daily costs
5. **Monthly Spend Trend** - Line graph of monthly costs
6. **Cost Per Document** - Stat showing average cost per document
7. **Circuit Breaker States** - State timeline showing CLOSED/HALF_OPEN/OPEN
8. **Error Rate by Service** - Bar chart of errors by service

**Refresh**: 30 seconds
**Time Range**: Last 6 hours (adjustable)

#### Quality Dashboard

**URL**: http://localhost:3000/d/pdf-orchestrator-quality

**Panels**:
1. **Accessibility Pass Rate** - Percentage of PDFs passing accessibility checks
2. **Visual SSIM Average** - Similarity score for visual regression tests
3. **Brand Compliance Rate** - Percentage passing brand validation
4. **Validation Gate Pass Rates** - Success rates for each validation gate
5. **Recent Validation Failures** - Table of recent failures
6. **Image Resolution Distribution** - Histogram of image DPI
7. **PDF File Size Distribution** - Histogram of PDF sizes

**Refresh**: 1 minute
**Time Range**: Last 24 hours (adjustable)

### Data Source Configuration

Grafana dashboards expect Prometheus as the data source. To integrate:

**Option 1: Prometheus + Node Exporter** (recommended for production):
```bash
# Install Prometheus
choco install prometheus

# Configure prometheus.yml to scrape metrics endpoint
# (Requires implementing /metrics endpoint in orchestrator.js)
```

**Option 2: Direct JSON Log Parsing** (for development):
- Use Grafana's JSON API plugin
- Point to `logs/metrics/aggregated.jsonl`
- Parse JSON Lines format

**Option 3: Loki + Promtail** (for full log aggregation):
```bash
# Install Loki and Promtail
choco install grafana-loki promtail

# Configure promtail to tail logs/
```

---

## Alerting

### Alert Rules

All alert rules are defined in `config/alerting/alert-rules.json`.

**Priority Levels**:
- **P1 (Critical)**: Service down, budget exceeded, circuit breaker open >15min
- **P2 (High)**: SLO violations, high latency, approaching budget limits
- **P3 (Medium)**: Elevated latency, high fallback rate, cost anomalies
- **P4 (Low)**: Visual drift, quota warnings, non-critical issues

### Testing Alerts

```bash
# Test alert dispatcher (sends test alert)
node scripts/send-alert.js
```

This will send a test alert to all configured channels (Slack, Email, PagerDuty).

### Alert Channels

#### Slack

**Setup**:
1. Create Slack webhook at https://api.slack.com/messaging/webhooks
2. Add webhook URL to `config/.env`:
   ```
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
   ```
3. Test: `node scripts/send-alert.js`

**Message Format**:
- Color-coded by severity (red=critical, orange=high, yellow=medium, green=low)
- Includes alert name, condition, current value, action, runbook link

#### Email

**Setup** (via Resend API):
1. Get Resend API key from `T:\Secrets\teei\resend\api-key.txt`
2. Add to `config/.env`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   ```
3. Configure recipients in `config/alerting/alert-rules.json`:
   ```json
   "email": {
     "to": ["tech-lead@teei.org", "ops@teei.org"]
   }
   ```
4. Test: `node scripts/send-alert.js`

**Message Format**:
- HTML formatted with color-coded alert boxes
- Includes full alert details, action required, runbook link

#### PagerDuty (Optional)

**Setup**:
1. Create PagerDuty integration key
2. Add to `config/.env`:
   ```
   PAGERDUTY_INTEGRATION_KEY=your_key_here
   ```
3. Test: `node scripts/send-alert.js`

**When to Use**:
- Only for P1 (critical) alerts
- Service down, budget exceeded, circuit breaker open >15min
- Escalates after 5 minutes if not acknowledged

### Escalation Policy

Defined in `config/alerting/alert-rules.json`:

**P1 (Critical)**:
- **Immediate**: PagerDuty + Slack
- **After 5 minutes**: Email
- **After 15 minutes**: Re-page PagerDuty

**P2 (High)**:
- **Immediate**: Slack
- **After 10 minutes**: Email

**P3 (Medium)**:
- **Immediate**: Slack only

**P4 (Low)**:
- **Daily digest**: Email summary at 9 AM

### Custom Alerts

To add a custom alert:

1. Edit `config/alerting/alert-rules.json`
2. Add new rule:
   ```json
   {
     "priority": "P3",
     "name": "Custom Alert Name",
     "description": "Alert description",
     "condition": {
       "metric": "orchestrator.custom.metric",
       "operator": ">",
       "threshold": 100,
       "duration": "5m"
     },
     "severity": "medium",
     "routes": ["slack"],
     "runbook": "https://docs.internal/runbooks/custom",
     "action": "What to do when this alert fires"
   }
   ```
3. Restart metrics aggregator

---

## Metrics Reference

### Performance Metrics

| Metric | Description | Unit | Target |
|--------|-------------|------|--------|
| `orchestrator.latency.p50` | Median latency | milliseconds | <10,000 ms |
| `orchestrator.latency.p95` | 95th percentile latency | milliseconds | <30,000 ms |
| `orchestrator.latency.p99` | 99th percentile latency | milliseconds | <60,000 ms |
| `orchestrator.operations.count` | Total operations | count | - |
| `orchestrator.success_rate` | Success rate | percent | >98% |
| `orchestrator.error_rate` | Error rate | percent | <2% |

### Cost Metrics

| Metric | Description | Unit | Target |
|--------|-------------|------|--------|
| `orchestrator.cost.daily` | Daily spend | USD | <$25 |
| `orchestrator.cost.monthly` | Monthly spend | USD | <$500 |
| `orchestrator.cost.per_document` | Cost per document | USD | <$0.75 |
| `orchestrator.cost.total` | Cumulative cost | USD | - |

### Quality Metrics

| Metric | Description | Unit | Target |
|--------|-------------|------|--------|
| `orchestrator.validation.accessibility.pass_rate` | Accessibility pass rate | percent | >95% |
| `orchestrator.validation.visual_ssim` | Visual similarity | 0-1 | >0.95 |
| `orchestrator.validation.brand_compliance.pass_rate` | Brand compliance rate | percent | 100% |
| `orchestrator.gate.pass_rate` | Validation gate pass rate | percent | >95% |

### Reliability Metrics

| Metric | Description | Unit | Target |
|--------|-------------|------|--------|
| `orchestrator.circuit_breaker.state` | Circuit breaker state | 0=CLOSED, 1=HALF_OPEN, 2=OPEN | 0 |
| `orchestrator.fallback_rate` | Fallback usage rate | percent | <10% |
| `orchestrator.quota.usage_percent` | API quota usage | percent | <80% |

---

## Troubleshooting

### Problem: No logs being created

**Symptoms**: Log directories are empty

**Solution**:
1. Verify telemetry is initialized:
   ```javascript
   const { initialize } = require('./workers/telemetry');
   await initialize();
   ```
2. Check log directory permissions
3. Verify `recordOperation()` is being called in `orchestrator.js`

### Problem: Metrics aggregator not running

**Symptoms**: No entries in `logs/metrics/aggregated.jsonl`

**Solution**:
1. Check if aggregator is running:
   ```powershell
   Get-Process | Where-Object { $_.CommandLine -like "*start-metrics-aggregator*" }
   ```
2. Start manually:
   ```bash
   node start-metrics-aggregator.js
   ```
3. Check for errors in console output

### Problem: Alerts not sending

**Symptoms**: Alerts trigger but no notifications received

**Solution**:

**For Slack**:
1. Verify webhook URL is correct:
   ```bash
   echo $env:SLACK_WEBHOOK_URL
   ```
2. Test webhook manually:
   ```bash
   curl -X POST $env:SLACK_WEBHOOK_URL -H "Content-Type: application/json" -d "{\"text\":\"Test\"}"
   ```

**For Email**:
1. Verify Resend API key is set:
   ```bash
   echo $env:RESEND_API_KEY
   ```
2. Check Resend dashboard for delivery logs: https://resend.com/dashboard

**For PagerDuty**:
1. Verify integration key is correct
2. Check PagerDuty dashboard for incidents

### Problem: Grafana dashboards show no data

**Symptoms**: Dashboards load but panels are empty

**Solution**:
1. Verify Prometheus data source is configured
2. Check if metrics endpoint is accessible: http://localhost:XXXX/metrics
3. Verify log files exist and contain data:
   ```powershell
   Get-Content "logs\metrics\aggregated.jsonl" | Select-Object -Last 5
   ```
4. Consider using Loki + Promtail for log aggregation instead

### Problem: Log files growing too large

**Symptoms**: Log directory exceeds disk space

**Solution**:
1. Verify log rotation is running:
   ```powershell
   Get-ScheduledTask -TaskName "PDFOrchestrator-LogRotation"
   ```
2. Run log rotation manually:
   ```powershell
   .\scripts\rotate-logs.ps1
   ```
3. Adjust retention period in `rotate-logs.ps1` (default: 90 days)

---

## Best Practices

### Development

1. **Always initialize telemetry first**:
   ```javascript
   await telemetry.initialize();
   ```

2. **Wrap operations with telemetry**:
   ```javascript
   const startTime = Date.now();
   try {
     const result = await someOperation();
     await telemetry.recordOperation('operation_name', {
       run_id: uuid(),
       status: 'success',
       latency_ms: Date.now() - startTime,
       cost_usd: calculatedCost
     });
   } catch (error) {
     await telemetry.recordError(error, { operation: 'operation_name' });
     throw error;
   }
   ```

3. **Include cost tracking**:
   ```javascript
   const cost = await costTracker.checkBudget('openai', 'generate_image', 0.12);
   // ... perform operation ...
   await costTracker.recordCost('openai', 'generate_image', 0.12, metadata);
   ```

### Production

1. **Run metrics aggregator as Windows service**:
   ```powershell
   # Use NSSM (Non-Sucking Service Manager)
   nssm install PDFOrchestratorMetrics "node" "start-metrics-aggregator.js"
   nssm start PDFOrchestratorMetrics
   ```

2. **Set up log rotation**:
   - Already configured via `setup-monitoring.ps1`
   - Runs daily at 2 AM
   - Keeps 90 days of logs

3. **Monitor alert channels**:
   - Check Slack #pdf-orchestrator-alerts daily
   - Review email digest every morning
   - Respond to PagerDuty incidents within 15 minutes

4. **Review dashboards weekly**:
   - Check latency trends (are they increasing?)
   - Review cost trends (are we approaching budget?)
   - Check success rate (any degradation?)

5. **Update golden snapshots**:
   - When design changes are intentional
   - Document why snapshot was updated
   - Commit to git with descriptive message

---

## Related Documentation

- **Operations Policy**: `docs/OPS_POLICY.md` - Full operations policy with SLOs, incident playbooks
- **Main README**: `README.md` - Project overview
- **CLAUDE.md**: Project-specific instructions for Claude Code

---

## Support

**For issues or questions**:
1. Check troubleshooting section above
2. Review logs in `logs/errors/`
3. Contact tech lead: tech-lead@teei.org
4. Slack: #pdf-orchestrator-dev

**Last Updated**: 2025-11-05
**Maintained By**: TEEI Technical Team
