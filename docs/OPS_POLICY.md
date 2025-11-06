# Operations Policy for PDF Orchestrator

**Project**: PDF Orchestrator - TEEI Partnership Documents
**Last Updated**: 2025-11-05
**Owner**: TEEI Technical & Operations Team

---

## Cost Controls

### Budget Caps

**Per-Document Limits**:
```javascript
const COST_LIMITS = {
  // API costs per document
  maxCostPerDocument: 1.00,        // $1.00 total

  // Per-service limits
  maxCostPerImage: 0.15,           // OpenAI image generation
  maxCostPerPDFOperation: 0.25,    // Adobe PDF Services
  maxCostPerEdit: 0.05,            // Lightroom color grading

  // Aggregate limits
  dailyCap: 25.00,                 // $25/day
  monthlyCap: 500.00,              // $500/month

  // Alert thresholds
  dailyAlertThreshold: 20.00,      // Alert at $20/day (80%)
  monthlyAlertThreshold: 375.00    // Alert at $375/month (75%)
};
```

**Typical Document Cost Breakdown**:
```
Hero Image (OpenAI DALL-E 3 HD): $0.12
Section Art (3× OpenAI 1024×1024): $0.24
PDF Generation (Adobe): $0.10
Accessibility Auto-Tag (Adobe): $0.15
Lightroom Color Grading (5 images): $0.00 (included in plan)
-------------------------------------------
Total per Document: $0.61

100 documents/month = $61/month
Well under $500/month cap ✓
```

### Hard Stop Implementation

**Cost Tracking**:
```javascript
class CostTracker {
  async checkBudget(service, operation, estimatedCost) {
    const daily = await this.getDailySpend();
    const monthly = await this.getMonthlySpend();

    // Hard stop if exceeded
    if (daily + estimatedCost > COST_LIMITS.dailyCap) {
      throw new CostExceededError('Daily budget cap exceeded', {
        current: daily,
        limit: COST_LIMITS.dailyCap,
        attempted: estimatedCost
      });
    }

    if (monthly + estimatedCost > COST_LIMITS.monthlyCap) {
      throw new CostExceededError('Monthly budget cap exceeded', {
        current: monthly,
        limit: COST_LIMITS.monthlyCap,
        attempted: estimatedCost
      });
    }

    // Alert if approaching threshold
    if (daily + estimatedCost > COST_LIMITS.dailyAlertThreshold) {
      await this.sendAlert('daily_threshold', daily, estimatedCost);
    }

    if (monthly + estimatedCost > COST_LIMITS.monthlyAlertThreshold) {
      await this.sendAlert('monthly_threshold', monthly, estimatedCost);
    }

    return { approved: true, remaining: { daily, monthly } };
  }

  async recordCost(service, operation, actualCost, metadata) {
    await this.db.insert('cost_log', {
      timestamp: new Date().toISOString(),
      service,
      operation,
      cost_usd: actualCost,
      doc_slug: metadata.docSlug,
      run_id: metadata.runId,
      user: metadata.user
    });

    // Update running totals
    await this.updateDailyTotal(actualCost);
    await this.updateMonthlyTotal(actualCost);
  }
}
```

**Alert Destinations**:
- **Slack**: #pdf-orchestrator-alerts
- **Email**: tech-lead@teei.org
- **PagerDuty**: P3 (non-critical alert)

---

## Rate Limiting

### Provider-Specific Ceilings

**Adobe PDF Services**:
```javascript
const ADOBE_RATE_LIMITS = {
  requestsPerMinute: 25,
  concurrentRequests: 5,
  transactionsPerMonth: 10000
};
```

**OpenAI Images**:
```javascript
const OPENAI_RATE_LIMITS = {
  requestsPerMinute: 7,         // DALL-E 3
  concurrentRequests: 5,
  imagesPerDay: 200             // Self-imposed limit
};
```

**Adobe Lightroom**:
```javascript
const LIGHTROOM_RATE_LIMITS = {
  requestsPerMinute: 60,
  uploadPerMinute: 10,
  concurrentRequests: 3
};
```

**Unsplash**:
```javascript
const UNSPLASH_RATE_LIMITS = {
  requestsPerHour: 50,
  downloadsPerMonth: 1000       // Free tier
};
```

### Circuit Breaker Pattern

**Implementation**:
```javascript
class CircuitBreaker {
  constructor(service, options = {}) {
    this.service = service;
    this.failureThreshold = options.failureThreshold || 5;
    this.timeout = options.timeout || 60000; // 60 seconds
    this.resetTimeout = options.resetTimeout || 300000; // 5 minutes

    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      // Check if enough time has passed to try again
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.failureCount = 0;
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker OPEN for ${this.service}. Try again in ${this.getRemainingTime()}ms`
        );
      }
    }

    try {
      const result = await Promise.race([
        operation(),
        this.timeoutPromise()
      ]);

      // Success - reset if in HALF_OPEN
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
      }

      return result;
    } catch (error) {
      this.handleFailure(error);
      throw error;
    }
  }

  handleFailure(error) {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.sendAlert('circuit_breaker_open', {
        service: this.service,
        failures: this.failureCount,
        resetIn: this.resetTimeout
      });
    }
  }

  timeoutPromise() {
    return new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Operation timeout')), this.timeout)
    );
  }

  getRemainingTime() {
    return Math.max(0, this.resetTimeout - (Date.now() - this.lastFailureTime));
  }
}

// Usage
const adobeCircuit = new CircuitBreaker('adobe_pdf_services', {
  failureThreshold: 5,
  resetTimeout: 300000 // 5 minutes
});

const result = await adobeCircuit.execute(() =>
  callAdobeAPI(endpoint, payload)
);
```

### Fallback Queue

**When Circuit Breaker Opens**:
1. **Queue Job**: Store in fallback queue (Redis or SQLite)
2. **Notify User**: "Document queued for processing, estimated wait: 10 minutes"
3. **Retry Worker**: Background process retries queue every 5 minutes
4. **Expiration**: Jobs expire after 24 hours

**Queue Implementation**:
```javascript
class FallbackQueue {
  async enqueue(job) {
    await this.db.insert('job_queue', {
      id: uuid(),
      job_type: job.type,
      payload: JSON.stringify(job.payload),
      status: 'queued',
      attempts: 0,
      max_attempts: 3,
      created_at: new Date(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  }

  async processQueue() {
    const jobs = await this.db.query(`
      SELECT * FROM job_queue
      WHERE status = 'queued'
        AND attempts < max_attempts
        AND expires_at > NOW()
      ORDER BY created_at ASC
      LIMIT 10
    `);

    for (const job of jobs) {
      try {
        await this.retryJob(job);
        await this.markComplete(job.id);
      } catch (error) {
        await this.incrementAttempts(job.id);
        if (job.attempts + 1 >= job.max_attempts) {
          await this.markFailed(job.id, error);
        }
      }
    }
  }
}

// Run queue processor every 5 minutes
setInterval(() => queue.processQueue(), 5 * 60 * 1000);
```

---

## Telemetry and Logging

### Log Schema

**Standard Log Format** (JSON Lines):
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
      "model": "dall-e-3",
      "prompt_hash": "sha256:abc123..."
    },
    {
      "service": "adobe_pdf_services",
      "operation": "document_generation",
      "latency_ms": 3400,
      "cost_usd": 0.10
    },
    {
      "service": "adobe_pdf_services",
      "operation": "autotag",
      "latency_ms": 5100,
      "cost_usd": 0.15
    }
  ],
  "assets": {
    "images_generated": 4,
    "images_sourced": 0,
    "fonts_embedded": 2,
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

**Error Log Format**:
```json
{
  "timestamp": "2025-11-05T10:35:00.000Z",
  "level": "error",
  "service": "pdf-orchestrator",
  "operation": "generate_image",
  "run_id": "uuid-1234-5678",
  "error": {
    "code": "OPENAI_SAFETY_FILTER",
    "message": "Prompt rejected by safety filter",
    "stack": "Error: SAFETY_FILTER...",
    "prompt_hash": "sha256:def456...",
    "original_prompt": "students in classroom...",
    "revised_prompt": null,
    "http_status": 400
  },
  "context": {
    "doc_slug": "teei-program-overview",
    "user": "henrik@teei.org",
    "fallback_used": "unsplash"
  }
}
```

### Telemetry Collection

**Metrics to Track**:
```javascript
const METRICS = {
  // Performance
  latency: {
    p50: null,  // Median
    p95: null,  // 95th percentile
    p99: null   // 99th percentile
  },

  // Volume
  documents_generated: 0,
  images_generated: 0,
  api_calls: 0,

  // Reliability
  success_rate: 0.0,      // % successful operations
  error_rate: 0.0,        // % failed operations
  fallback_rate: 0.0,     // % using fallback

  // Cost
  daily_spend: 0.0,
  monthly_spend: 0.0,
  cost_per_document: 0.0,

  // Quality
  accessibility_pass_rate: 0.0,
  visual_ssim_avg: 0.0,
  brand_compliance_rate: 0.0
};
```

**Aggregation**:
```javascript
// Aggregate every 15 minutes
setInterval(async () => {
  const last15min = await db.query(`
    SELECT
      COUNT(*) as total_ops,
      AVG(latency_ms) as avg_latency,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY latency_ms) as p50,
      PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY latency_ms) as p95,
      SUM(cost_usd) as total_cost,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) / COUNT(*) as success_rate
    FROM operation_log
    WHERE timestamp > NOW() - INTERVAL '15 minutes'
  `);

  await metrics.record('orchestrator.performance', last15min);
}, 15 * 60 * 1000);
```

**Observability Stack**:
- **Logs**: JSON files → CloudWatch Logs (or Loki)
- **Metrics**: Prometheus + Grafana
- **Traces**: OpenTelemetry (future)
- **Dashboards**: Grafana dashboards for real-time monitoring

---

## Validation Gates

### Gate Definitions

**Gate 1: Input Validation**
```javascript
async function validateInput(jobSpec) {
  const errors = [];

  // Required fields
  if (!jobSpec.templateId) errors.push('Missing templateId');
  if (!jobSpec.data) errors.push('Missing data');

  // Template exists
  const template = await templates.get(jobSpec.templateId);
  if (!template) errors.push(`Template not found: ${jobSpec.templateId}`);

  // Data matches template schema
  const schemaErrors = validateSchema(jobSpec.data, template.schema);
  errors.push(...schemaErrors);

  return {
    pass: errors.length === 0,
    errors,
    gate: 'input_validation'
  };
}
```

**Gate 2: Asset Generation**
```javascript
async function validateAssets(assets) {
  const errors = [];

  for (const asset of assets) {
    // Image resolution
    if (asset.type === 'image') {
      const effectiveDPI = asset.widthPx / asset.placedWidthInches;
      if (effectiveDPI < 150) {
        errors.push(`Low resolution: ${asset.name} (${effectiveDPI} DPI)`);
      }
    }

    // File size
    if (asset.sizeBytes > 5 * 1024 * 1024) {
      errors.push(`File too large: ${asset.name} (${asset.sizeBytes} bytes)`);
    }

    // Format
    const allowedFormats = ['image/jpeg', 'image/png', 'image/tiff'];
    if (asset.type === 'image' && !allowedFormats.includes(asset.mimeType)) {
      errors.push(`Invalid format: ${asset.name} (${asset.mimeType})`);
    }
  }

  return {
    pass: errors.length === 0,
    errors,
    gate: 'asset_validation',
    artifacts: assets.map(a => ({ name: a.name, path: a.path, size: a.sizeBytes }))
  };
}
```

**Gate 3: PDF Export**
```javascript
async function validatePDF(pdfPath) {
  const errors = [];

  // Run Adobe Preflight
  const preflightResult = await runPreflight(pdfPath, 'PDF/X-4');
  if (!preflightResult.pass) {
    errors.push(...preflightResult.errors);
  }

  // Check accessibility
  const accessibilityResult = await runAccessibilityCheck(pdfPath);
  if (!accessibilityResult.pass) {
    errors.push(...accessibilityResult.errors);
  }

  // File size
  const stats = await fs.stat(pdfPath);
  if (stats.size > 100 * 1024 * 1024) {
    errors.push(`File too large: ${stats.size} bytes`);
  }

  return {
    pass: errors.length === 0,
    errors,
    gate: 'pdf_validation',
    artifacts: [{
      name: path.basename(pdfPath),
      path: pdfPath,
      size: stats.size,
      preflight: preflightResult,
      accessibility: accessibilityResult
    }]
  };
}
```

**Gate 4: Visual Regression**
```javascript
async function validateVisual(pdfPath, goldenSnapshotPath) {
  // Convert PDF to images
  const pages = await pdf2images(pdfPath);
  const goldenPages = await loadGoldenSnapshots(goldenSnapshotPath);

  const ssimScores = [];
  const errors = [];

  for (let i = 0; i < pages.length; i++) {
    const ssim = await compareImages(pages[i], goldenPages[i]);
    ssimScores.push(ssim);

    if (ssim < MIN_VISUAL_SSIM) {
      errors.push(`Page ${i + 1}: SSIM ${ssim.toFixed(3)} below threshold ${MIN_VISUAL_SSIM}`);
    }
  }

  const avgSSIM = ssimScores.reduce((a, b) => a + b, 0) / ssimScores.length;

  return {
    pass: avgSSIM >= MIN_VISUAL_SSIM,
    errors,
    gate: 'visual_regression',
    ssim_avg: avgSSIM,
    ssim_per_page: ssimScores,
    artifacts: pages.map((p, i) => ({
      page: i + 1,
      ssim: ssimScores[i],
      diff_path: `${pdfPath}.page${i + 1}.diff.png`
    }))
  };
}
```

**Gate 5: Brand Compliance**
```javascript
async function validateBrand(pdfPath) {
  const errors = [];

  // Extract colors from PDF
  const colors = await extractColors(pdfPath);
  const brandColors = ['#00393F', '#C9E4EC', '#FFF1E2', '#BA8F5A'];

  // Check if non-brand colors used
  const nonBrandColors = colors.filter(c => !brandColors.includes(c));
  if (nonBrandColors.length > 0) {
    errors.push(`Non-brand colors found: ${nonBrandColors.join(', ')}`);
  }

  // Extract fonts
  const fonts = await extractFonts(pdfPath);
  const brandFonts = ['Lora', 'Roboto Flex'];

  const nonBrandFonts = fonts.filter(f => !brandFonts.some(bf => f.includes(bf)));
  if (nonBrandFonts.length > 0) {
    errors.push(`Non-brand fonts found: ${nonBrandFonts.join(', ')}`);
  }

  // Check text cutoffs
  const cutoffs = await detectTextCutoffs(pdfPath);
  if (cutoffs.length > 0) {
    errors.push(...cutoffs.map(c => `Text cutoff on page ${c.page}: "${c.text}"`));
  }

  return {
    pass: errors.length === 0,
    errors,
    gate: 'brand_compliance',
    colors_used: colors,
    fonts_used: fonts
  };
}
```

### Gate Execution

**Sequential Execution**:
```javascript
async function runValidationGates(context) {
  const gates = [
    validateInput,
    validateAssets,
    validatePDF,
    validateVisual,
    validateBrand
  ];

  const results = [];

  for (const gate of gates) {
    const result = await gate(context);
    results.push(result);

    if (!result.pass) {
      // Gate failed - stop execution
      return {
        success: false,
        failedGate: result.gate,
        allResults: results
      };
    }
  }

  // All gates passed
  return {
    success: true,
    allResults: results
  };
}
```

---

## Visual Regression Testing

### SSIM Threshold

**SSIM** (Structural Similarity Index Measure):
- Range: 0.0 (completely different) to 1.0 (identical)
- **Threshold**: 0.95 (95% similarity required)

**Why 0.95?**:
- Allows for minor font rendering differences across systems
- Accounts for JPEG compression artifacts
- Strict enough to catch layout shifts, color changes

**Calculating SSIM**:
```javascript
const { compare } = require('resemblejs');

async function calculateSSIM(imagePath1, imagePath2) {
  return new Promise((resolve, reject) => {
    compare(imagePath1, imagePath2, (err, data) => {
      if (err) return reject(err);

      // resemblejs returns "misMatchPercentage" (0-100)
      // Convert to SSIM (0-1)
      const ssim = 1 - (data.misMatchPercentage / 100);

      resolve({
        ssim,
        rawDiff: data.rawMisMatchPercentage,
        diffImage: data.getBuffer()
      });
    });
  });
}
```

### Golden Snapshot Location

**Directory Structure**:
```
tests/golden-snapshots/
├── teei-aws-partnership/
│   ├── page-01.png (2400×3000 px, 300 DPI)
│   ├── page-02.png
│   └── page-12.png
├── teei-program-overview/
│   ├── page-01.png
│   └── page-06.png
└── README.md (instructions for updating snapshots)
```

**Generating Golden Snapshots**:
```bash
# 1. Generate reference PDF (manually verified as perfect)
node orchestrator.js example-jobs/teei-aws-partnership.json

# 2. Convert to high-res images
magick convert -density 300 \
  exports/teei-aws-partnership-v2.pdf \
  tests/golden-snapshots/teei-aws-partnership/page-%02d.png

# 3. Commit to git
git add tests/golden-snapshots/teei-aws-partnership/
git commit -m "Add golden snapshots for TEEI AWS partnership doc"
```

**Updating Snapshots** (when design intentionally changes):
```bash
# Review visual diff first
npm run test:visual:diff

# If changes are intentional, update snapshots
npm run test:visual:update

# Commit new snapshots
git add tests/golden-snapshots/
git commit -m "Update golden snapshots: new TEEI brand colors"
```

---

## Incident Playbooks

### Playbook 1: Timeout Errors

**Symptom**: Operation exceeds timeout (60-300s)

**Diagnosis**:
1. Check service status page (Adobe, OpenAI)
2. Review latency metrics (P95, P99)
3. Check network connectivity

**Resolution**:
1. **If service degraded**: Wait 5 minutes, retry
2. **If network issue**: Check proxy, firewall
3. **If consistent timeouts**: Increase timeout, investigate root cause

**Prevention**:
- Set appropriate timeouts per operation
- Implement circuit breaker
- Monitor latency trends

---

### Playbook 2: 429 Rate Limit Exceeded

**Symptom**: `429 Too Many Requests` from API

**Diagnosis**:
1. Check current request rate vs limit
2. Review recent operation logs
3. Identify burst traffic or loop

**Resolution**:
1. **Immediate**: Backoff per `Retry-After` header
2. **Short-term**: Enable request queue with rate limiting
3. **Long-term**: Upgrade API plan or optimize batching

**Prevention**:
- Implement token bucket rate limiter
- Queue non-urgent requests
- Monitor request rate dashboard

---

### Playbook 3: Quota Exceeded

**Symptom**: `403 Forbidden` or "Quota exceeded" error

**Diagnosis**:
1. Check current usage vs quota (Adobe Console, OpenAI Dashboard)
2. Review cost tracking logs
3. Identify unexpected usage spike

**Resolution**:
1. **Immediate**: Halt non-critical operations
2. **Alert**: Notify tech lead and finance
3. **Short-term**: Upgrade plan or wait for quota reset
4. **Long-term**: Implement stricter cost controls

**Prevention**:
- Set monthly budget caps
- Alert at 75% quota usage
- Review usage weekly

---

### Playbook 4: Authentication Errors (401)

**Symptom**: `401 Unauthorized` from API

**Diagnosis**:
1. Check if token expired (JWT, OAuth)
2. Verify API key still valid in provider console
3. Review recent credential rotations

**Resolution**:
1. **If token expired**: Refresh token (OAuth) or regenerate (JWT)
2. **If key revoked**: Generate new key, update secrets vault
3. **If config error**: Verify environment variables loaded

**Prevention**:
- Proactive token refresh (before expiry)
- Monitor token expiration dates
- Test auth after credential rotation

---

### Playbook 5: PDF Preflight Failures

**Symptom**: PDF/X validation fails in Acrobat Preflight

**Diagnosis**:
1. Review Preflight report (specific errors)
2. Common issues:
   - Missing fonts
   - Incorrect color profile
   - Low-resolution images
   - Missing bleed

**Resolution**:
1. **Missing fonts**: Re-export with "Embed All Fonts" enabled
2. **Color profile**: Set correct profile in export settings
3. **Low-res images**: Replace images with 300 DPI versions
4. **Missing bleed**: Update InDesign document bleed settings

**Prevention**:
- Validate images before InDesign placement
- Use PDF export presets (don't manually configure)
- Run preflight check in InDesign before export

---

## Service Level Objectives (SLOs)

### Availability

**Target**: 99.5% uptime
- **Downtime**: Max 3.6 hours/month
- **Measurement**: HTTP 200 responses / total requests
- **Alert**: If availability <99.5% over 24 hours

### Latency

**Target**:
- P50 (median): <10 seconds
- P95: <30 seconds
- P99: <60 seconds

**Measurement**: End-to-end document generation time
**Alert**: If P95 >45 seconds over 1 hour

### Success Rate

**Target**: 98% success rate
- **Failure**: Any operation that doesn't produce expected output
- **Measurement**: Successful ops / total ops
- **Alert**: If success rate <98% over 1 hour

### Cost Efficiency

**Target**: <$0.75 per document
- **Measurement**: Total API costs / documents generated
- **Alert**: If cost >$0.75 averaged over 1 day

---

## Monitoring and Alerts

### Alert Routing

**P1 - Critical** (PagerDuty):
- Service down (availability <90%)
- Daily budget exceeded
- Circuit breaker OPEN >15 minutes

**P2 - High** (Slack + Email):
- Availability <99%
- Success rate <98%
- P95 latency >45s
- Monthly budget >75%

**P3 - Medium** (Slack only):
- P99 latency >90s
- Fallback rate >10%
- Cost per doc >$0.75

**P4 - Low** (Email digest):
- Golden snapshot drift detected
- Quota usage >50%

### Dashboard Panels

**Grafana Dashboards**:

**Panel 1: Performance**
- Latency (P50, P95, P99) - line graph
- Request rate - gauge
- Success rate - percentage

**Panel 2: Cost**
- Daily spend - bar chart
- Monthly spend - line graph
- Cost per document - stat

**Panel 3: Reliability**
- Circuit breaker states - state timeline
- Error rate by service - bar chart
- Fallback usage - percentage

**Panel 4: Quality**
- Accessibility pass rate - stat
- Visual SSIM average - line graph
- Brand compliance rate - stat

---

## Review Schedule

- **Daily**: Review cost and error logs
- **Weekly**: Review SLO dashboard, address P3/P4 alerts
- **Monthly**: Cost optimization review, update budgets
- **Quarterly**: Incident retrospective, update playbooks
- **Annually**: Full ops audit, capacity planning

**Next Review Due**: 2025-11-12 (weekly)
