# Cost Tracking and Budget Control Guide

**Project**: PDF Orchestrator - TEEI
**Version**: 1.0.0
**Last Updated**: 2025-11-05

---

## Overview

The PDF Orchestrator includes a comprehensive cost tracking and budget control system that:

- **Tracks all API costs** in real-time (OpenAI, Adobe PDF Services, etc.)
- **Enforces budget caps** with hard stops ($1/doc, $25/day, $500/month)
- **Implements circuit breakers** to prevent cascading failures
- **Queues failed jobs** for automatic retry
- **Sends alerts** when thresholds are exceeded
- **Provides monitoring tools** for budget visibility

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      PDF Orchestrator                        │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ CostTracker  │    │CircuitBreaker│    │FallbackQueue │  │
│  │              │    │              │    │              │  │
│  │ • Pre-check  │    │ • Timeout    │    │ • Job queue  │  │
│  │ • Record     │    │ • Failures   │    │ • Auto retry │  │
│  │ • Alert      │    │ • Open/Close │    │ • Expiration │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│           │                   │                   │          │
│           └───────────────────┴───────────────────┘          │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  SQLite Database│
                    │                 │
                    │ • cost_log      │
                    │ • job_queue     │
                    │ • circuit_state │
                    │ • alert_history │
                    └─────────────────┘
```

---

## Budget Caps

### Per-Document Limits
```javascript
{
  maxCostPerDocument: $1.00,
  maxCostPerImage: $0.15,
  maxCostPerPDFOperation: $0.25
}
```

### Aggregate Limits
```javascript
{
  dailyCap: $25.00,      // Hard stop
  monthlyCap: $500.00,   // Hard stop
  dailyAlertThreshold: $20.00,     // 80% warning
  monthlyAlertThreshold: $375.00   // 75% warning
}
```

### Typical Document Cost
```
Hero Image (DALL-E 3 HD):        $0.12
Section Images (3× 1024×1024):   $0.24
PDF Generation (Adobe):          $0.10
Accessibility Auto-Tag:          $0.15
Color Grading (Lightroom):       $0.00 (included)
─────────────────────────────────────────
Total:                           $0.61

100 documents/month = $61/month (well under $500 cap ✓)
```

---

## Usage

### 1. Check Budget Status

```bash
npm run check-budget
```

**Output**:
```
DAILY BUDGET
─────────────────────────────────────────────
Current Spend:  $18.37
Daily Cap:      $25.00
Remaining:      $6.63 (26.5% remaining)
Status:         🟢 OK (73.5%)

MONTHLY BUDGET
─────────────────────────────────────────────
Current Spend:  $18.37
Monthly Cap:    $500.00
Remaining:      $481.63 (96.3% remaining)
Status:         🟢 OK (3.7%)

RECENT HIGH-COST OPERATIONS (>$0.25)
─────────────────────────────────────────────
Timestamp       | Service    | Operation   | Cost
Nov 5, 12:03 PM | openai     | dall-e-3-hd | $0.12
```

### 2. Integrate Cost Tracking in Code

```javascript
const PDFOrchestrator = require('./orchestrator');

const orchestrator = new PDFOrchestrator();

// Execute API call with automatic cost tracking
const result = await orchestrator.executeWithCostTracking(
  'openai_images',           // service
  'dall-e-3-hd',             // operation
  async () => {              // API call
    return await openai.images.generate({
      model: 'dall-e-3',
      prompt: 'Students in classroom',
      quality: 'hd'
    });
  },
  {                          // metadata
    docSlug: 'teei-aws-partnership',
    runId: 'run-123',
    user: 'henrik@teei.org'
  }
);

// Cost is automatically:
// 1. Pre-checked against budget caps
// 2. Protected by circuit breaker
// 3. Recorded to database
// 4. Monitored for alerts
```

### 3. Query Cost Data Directly

```javascript
const CostTracker = require('./workers/cost-tracker');

const tracker = new CostTracker();

// Get current spending
const dailySpend = await tracker.getDailySpend();
const monthlySpend = await tracker.getMonthlySpend();

// Pre-flight budget check
try {
  await tracker.checkBudget('openai_images', 'dall-e-3-hd', 0.12);
  console.log('Budget check passed');
} catch (error) {
  if (error instanceof CostExceededError) {
    console.error('Budget exceeded:', error.toJSON());
  }
}

// Record actual cost
await tracker.recordCost('adobe_pdf_services', 'document_generation', 0.10, {
  docSlug: 'test-doc',
  runId: 'run-456',
  user: 'test@example.com'
});

tracker.close();
```

### 4. Circuit Breaker Usage

```javascript
const CircuitBreaker = require('./workers/circuit-breaker');

const breaker = new CircuitBreaker('adobe_pdf_services', {
  failureThreshold: 5,      // Open after 5 failures
  timeout: 60000,           // 60s operation timeout
  resetTimeout: 300000      // 5 min reset period
});

// Execute with circuit breaker protection
try {
  const result = await breaker.execute(async () => {
    return await adobeAPI.generatePDF(payload);
  });
} catch (error) {
  if (error instanceof CircuitBreakerOpenError) {
    // Circuit breaker is OPEN, queue job for later
    console.log('Service unavailable, queueing job...');
  }
}
```

### 5. Fallback Queue

```javascript
const FallbackQueue = require('./workers/fallback-queue');

const queue = new FallbackQueue();

// Enqueue failed job
const jobId = await queue.enqueue({
  type: 'pdf_generation',
  payload: {
    docSlug: 'teei-aws',
    templateId: 'teei-aws-partnership'
  }
});

// Start background processor (retries every 5 minutes)
queue.startProcessor();

// Get queue stats
const stats = await queue.getStats();
console.log('Queue:', {
  total: stats.total,
  queued: stats.queued,
  completed: stats.completed,
  failed: stats.failed
});

queue.close();
```

---

## Alert System

### Alert Types

**P1 - Critical** (Hard Stop):
- Daily budget cap exceeded
- Monthly budget cap exceeded

**P2 - High** (Warning):
- Daily budget > 80% ($20)
- Monthly budget > 75% ($375)
- Circuit breaker OPEN

**P3 - Medium**:
- Unusual cost spike detected
- High-cost operation (>$0.25)

### Alert Destinations

Configure in `config/cost-limits.json`:

```json
{
  "alertDestinations": {
    "slack": {
      "enabled": false,
      "channel": "#pdf-orchestrator-alerts",
      "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
    },
    "email": {
      "enabled": false,
      "recipients": ["tech-lead@teei.org"],
      "smtpConfig": {}
    },
    "console": {
      "enabled": true
    }
  }
}
```

**Console Alert Example**:
```
================================================================================
[COST ALERT] Daily budget threshold WARNING!
Current: $20.50, Threshold: $20.00 (82% of cap)
================================================================================
```

---

## Database Schema

### cost_log Table
```sql
CREATE TABLE cost_log (
    id INTEGER PRIMARY KEY,
    timestamp TEXT NOT NULL,
    service TEXT NOT NULL,
    operation TEXT NOT NULL,
    cost_usd REAL NOT NULL,
    doc_slug TEXT,
    run_id TEXT,
    user TEXT,
    metadata TEXT
);
```

### job_queue Table
```sql
CREATE TABLE job_queue (
    id TEXT PRIMARY KEY,
    job_type TEXT NOT NULL,
    payload TEXT NOT NULL,
    status TEXT DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    created_at TEXT,
    expires_at TEXT
);
```

### Useful Queries

**Get today's spending by service**:
```sql
SELECT service, SUM(cost_usd) as total
FROM cost_log
WHERE date(timestamp) = date('now')
GROUP BY service
ORDER BY total DESC;
```

**Get most expensive documents**:
```sql
SELECT doc_slug, SUM(cost_usd) as total_cost, COUNT(*) as operations
FROM cost_log
WHERE doc_slug IS NOT NULL
GROUP BY doc_slug
ORDER BY total_cost DESC
LIMIT 10;
```

**Get failed jobs needing retry**:
```sql
SELECT * FROM job_queue
WHERE status = 'queued'
  AND attempts < max_attempts
  AND datetime(expires_at) > datetime('now')
ORDER BY created_at;
```

---

## Testing

### Run Unit Tests

```bash
npm run test:cost
```

### Run Demo

```bash
node scripts/demo-cost-tracking.js
```

**Demo includes**:
1. Recording API costs
2. Pre-flight budget checks
3. Circuit breaker success/failure
4. Budget cap enforcement
5. Fallback queue operations
6. Cost estimation

---

## Configuration

### Cost Limits (config/cost-limits.json)

```json
{
  "budget": {
    "maxCostPerDocument": 1.00,
    "dailyCap": 25.00,
    "monthlyCap": 500.00
  },
  "services": {
    "openai_images": {
      "dall-e-3-hd": 0.12,
      "dall-e-3-standard": 0.08
    },
    "adobe_pdf_services": {
      "document_generation": 0.10,
      "autotag": 0.15
    }
  },
  "circuitBreaker": {
    "failureThreshold": 5,
    "timeout": 60000,
    "resetTimeout": 300000
  }
}
```

### Environment Variables (.env)

```bash
# Database location
DATABASE_PATH=./database/orchestrator.db

# Alert settings
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK
ALERT_EMAIL=tech-lead@teei.org
```

---

## Monitoring

### Real-time Dashboard

```bash
# Watch budget status
watch -n 10 npm run check-budget
```

### Grafana Dashboard (Future)

Planned metrics:
- Daily/monthly spend (line chart)
- Cost per document (bar chart)
- Circuit breaker states (state timeline)
- Queue depth (gauge)
- Alert history (table)

---

## Best Practices

### 1. Always Use executeWithCostTracking()

**Do this**:
```javascript
await orchestrator.executeWithCostTracking(
  'openai_images',
  'dall-e-3-hd',
  async () => openai.images.generate(...),
  { docSlug, runId, user }
);
```

**Don't do this**:
```javascript
// ❌ No cost tracking!
await openai.images.generate(...);
```

### 2. Set Appropriate Timeouts

```javascript
const breaker = new CircuitBreaker('slow_service', {
  timeout: 120000  // 2 minutes for slow operations
});
```

### 3. Monitor Budget Weekly

```bash
# Check budget every Monday
0 9 * * 1 cd /path/to/orchestrator && npm run check-budget | mail -s "Weekly Budget Report" tech-lead@teei.org
```

### 4. Clean Up Old Data

```bash
# Archive cost logs older than 1 year
sqlite3 database/orchestrator.db "DELETE FROM cost_log WHERE datetime(timestamp) < datetime('now', '-1 year');"

# Vacuum database to reclaim space
sqlite3 database/orchestrator.db "VACUUM;"
```

### 5. Test Before Production

```bash
# Test circuit breaker
node scripts/demo-cost-tracking.js

# Test budget enforcement
npm run test:cost
```

---

## Troubleshooting

### Issue: Database Locked

**Error**: `SQLITE_BUSY: database is locked`

**Solution**:
```javascript
// Ensure proper cleanup
process.on('SIGINT', () => {
  tracker.close();
  queue.close();
  process.exit(0);
});
```

### Issue: Budget Check Taking Too Long

**Solution**: Add indexes:
```sql
CREATE INDEX IF NOT EXISTS idx_cost_log_date ON cost_log(date(timestamp));
CREATE INDEX IF NOT EXISTS idx_cost_log_service ON cost_log(service);
```

### Issue: Circuit Breaker Not Resetting

**Solution**: Check reset timeout:
```javascript
const status = breaker.getStatus();
console.log('Time until reset:', status.remainingTime);
```

### Issue: Alerts Not Sending

**Solution**: Verify configuration:
```javascript
const costConfig = require('./config/cost-limits.json');
console.log('Alert destinations:', costConfig.alertDestinations);
```

---

## API Reference

### CostTracker

```typescript
class CostTracker {
  constructor(dbPath?: string)

  // Pre-flight budget check (throws CostExceededError if over budget)
  checkBudget(service: string, operation: string, estimatedCost: number): Promise<{
    approved: boolean,
    remaining: { daily: number, monthly: number }
  }>

  // Record actual cost after operation
  recordCost(service: string, operation: string, actualCost: number, metadata: object): Promise<void>

  // Query current spending
  getDailySpend(): Promise<number>
  getMonthlySpend(): Promise<number>

  // Get estimated cost for operation
  getEstimatedCost(service: string, operation: string): number

  // Close database connection
  close(): void
}
```

### CircuitBreaker

```typescript
class CircuitBreaker {
  constructor(service: string, options?: {
    failureThreshold?: number,  // Default: 5
    timeout?: number,            // Default: 60000ms
    resetTimeout?: number        // Default: 300000ms
  })

  // Execute operation with circuit breaker protection
  execute(operation: () => Promise<any>): Promise<any>

  // Get current status
  getStatus(): {
    service: string,
    state: 'CLOSED' | 'OPEN' | 'HALF_OPEN',
    failureCount: number,
    remainingTime: number
  }

  // Manual controls
  reset(): void
  forceOpen(): void
}
```

### FallbackQueue

```typescript
class FallbackQueue {
  constructor(options?: {
    dbPath?: string,
    retryInterval?: number,     // Default: 300000ms (5 min)
    maxAttempts?: number,       // Default: 3
    jobExpiration?: number      // Default: 86400000ms (24h)
  })

  // Enqueue job
  enqueue(job: { type: string, payload: object }): Promise<string>

  // Mark job status
  markComplete(jobId: string): Promise<void>
  markFailed(jobId: string, error: Error): Promise<void>

  // Queue management
  getPendingJobs(limit?: number): Promise<Array>
  getStats(): Promise<{ total, queued, completed, failed }>
  cleanupExpired(): Promise<number>

  // Background processor
  startProcessor(): void
  stopProcessor(): void

  // Close database connection
  close(): void
}
```

---

## Future Enhancements

### Phase 2 (Q1 2025)
- [ ] Grafana dashboard integration
- [ ] Slack webhook implementation
- [ ] Email alerting via SendGrid
- [ ] Cost optimization suggestions

### Phase 3 (Q2 2025)
- [ ] Machine learning cost prediction
- [ ] Automated budget adjustment
- [ ] Multi-tenant cost tracking
- [ ] Export to CSV/Excel

---

## Support

**Documentation**: `docs/OPS_POLICY.md`
**Issues**: Contact tech-lead@teei.org
**Updates**: Check `CHANGELOG.md`

---

**Last Updated**: 2025-11-05
**Version**: 1.0.0
**Status**: Production Ready ✅
