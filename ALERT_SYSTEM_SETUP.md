# Alert System Setup - PDF Orchestrator

**Status**: ✅ **WORKING** (Console + File Logging)
**Date**: 2025-11-05

---

## Current Configuration

### Alert Methods Enabled

✅ **Console Alerts** - Color-coded terminal output
- P1 (Critical): Red background
- P2 (High): Yellow background
- P3 (Medium): Blue background
- P4 (Low): Green background

✅ **File Alerts** - JSON Lines log files
- Location: `logs/alerts/YYYY-MM-DD.jsonl`
- Format: One JSON object per line
- Retention: 90 days (configurable)

❌ **Email Alerts** - Disabled (domain not verified)
- Resend API configured but domain `yourpersonalai.net` not verified
- Can be enabled later once domain is verified in Resend dashboard

---

## Testing the Alert System

### Send Test Alert
```bash
node scripts/send-alert-simple.js test
```

**Expected Output**:
- Colored alert box in console
- Log entry written to `logs/alerts/2025-11-05.jsonl`
- Success message: "Alert system is working correctly"

### Check Alert Conditions (Simulated Metrics)
```bash
node scripts/send-alert-simple.js check
```

This checks sample metrics and triggers alerts if thresholds are exceeded.

---

## Alert Rules (13 Total)

### P1 - Critical
1. **Service Down** - Availability <90%
2. **Daily Budget Exceeded** - Spend ≥$25
3. **Circuit Breaker Open >15min** - Service degraded

### P2 - High
4. **Availability Below SLO** - <99%
5. **Success Rate Below Target** - <98%
6. **High Latency** - P95 >45 seconds
7. **Monthly Budget Warning** - >75% ($375)

### P3 - Medium
8. **P99 Latency High** - >90 seconds
9. **High Fallback Rate** - >10%
10. **Cost Per Document High** - >$0.75
11. **Brand Compliance Failure** - Non-brand colors/fonts detected

### P4 - Low
12. **Golden Snapshot Drift** - SSIM <0.95
13. **Quota Usage Warning** - >50%

**Configuration**: `config/alerting/alert-rules.json`

---

## Environment Variables

### Current (.env)
```bash
# Alerts (Console + File)
ENABLE_CONSOLE_ALERTS=true
ENABLE_FILE_ALERTS=true
ALERT_ENV=Development

# Email (Disabled until domain verified)
ENABLE_RESEND_ALERTS=false
RESEND_API_KEY=re_YC7t9L67_CH2K5sDtZYutxoH3cjJXiYKr
ALERT_FROM=henrik@yourpersonalai.net
ALERT_TO=henrik@yourpersonalai.net
```

---

## Enabling Email Alerts (Future)

Once the `yourpersonalai.net` domain is verified in Resend:

1. **Verify Domain in Resend Dashboard**:
   - Go to https://resend.com/domains
   - Add `yourpersonalai.net`
   - Follow DNS verification steps

2. **Enable Email Alerts**:
   ```bash
   # Edit config/.env
   ENABLE_RESEND_ALERTS=true
   ```

3. **Test Email Alerts**:
   ```bash
   node scripts/send-alert-resend.js test
   ```

---

## Alert Logs

### View Today's Alerts
```bash
cat "logs/alerts/$(date +%Y-%m-%d).jsonl"
```

### View Last 5 Alerts
```bash
tail -5 "logs/alerts/$(date +%Y-%m-%d).jsonl" | jq
```

### Count Alerts by Priority
```bash
cat logs/alerts/*.jsonl | jq -r '.priority' | sort | uniq -c
```

### Search for Critical Alerts
```bash
cat logs/alerts/*.jsonl | jq 'select(.priority == "P1")'
```

---

## Integration with Cost Tracker

The cost tracker automatically sends alerts when:
- Daily spend exceeds $20 (80% of $25 cap)
- Monthly spend exceeds $375 (75% of $500 cap)
- Per-document cost exceeds $1

**Example**:
```javascript
const { sendAlert } = require('./scripts/send-alert-simple');

// In cost-tracker.js
if (dailySpend + estimatedCost > DAILY_ALERT_THRESHOLD) {
  await sendAlert({
    priority: 'P2',
    name: 'Daily Budget Warning',
    description: `Daily spend approaching cap: $${dailySpend.toFixed(2)} / $25.00`,
    condition: {
      metric: 'orchestrator.cost.daily',
      operator: '>=',
      threshold: 20.0,
      duration: '1m'
    },
    severity: 'high',
    action: 'Review recent high-cost operations. Consider deferring non-critical jobs.',
    currentValue: dailySpend
  });
}
```

---

## Alert Log Rotation

Logs are automatically rotated based on date (one file per day).

**Manual Cleanup** (keep last 90 days):
```powershell
# PowerShell
Get-ChildItem "logs\alerts" -Filter "*.jsonl" |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-90) } |
  Remove-Item -Verbose
```

**Automated** (via scheduled task - future):
```bash
# Run daily at midnight
0 0 * * * find logs/alerts -name "*.jsonl" -mtime +90 -delete
```

---

## Troubleshooting

### Alert Not Showing in Console
**Check**: `ENABLE_CONSOLE_ALERTS=true` in `.env`

### Alert File Not Created
**Check**:
- `ENABLE_FILE_ALERTS=true` in `.env`
- `logs/alerts/` directory exists (created automatically)
- Write permissions on logs directory

### Email Alerts Not Working
**Cause**: Domain not verified in Resend
**Solution**: See "Enabling Email Alerts (Future)" section above

---

## Summary

✅ **Alert system fully functional** with console and file logging
✅ **13 alert rules** configured (P1-P4 severity levels)
✅ **Test command** working: `node scripts/send-alert-simple.js test`
✅ **Integrated** with cost tracker and metrics aggregator
📧 **Email alerts** ready to enable once domain is verified

**Next Steps**:
1. Monitor `logs/alerts/` for triggered alerts
2. Review alert frequency after first production week
3. Adjust thresholds in `config/alerting/alert-rules.json` if needed
4. Verify `yourpersonalai.net` domain in Resend to enable email alerts
