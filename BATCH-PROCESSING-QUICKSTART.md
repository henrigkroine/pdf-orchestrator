# Batch Processing Quick Start

**Get started with batch PDF validation in 2 minutes!**

## 1️⃣ Basic Usage

Process multiple PDFs:

```bash
node scripts/validate-pdf-batch.js exports/*.pdf
```

## 2️⃣ With Caching (Recommended)

90% faster on repeated runs:

```bash
node scripts/validate-pdf-batch.js exports/*.pdf --cache
```

## 3️⃣ Custom Concurrency

Adjust workers based on your CPU:

```bash
# More workers = faster (up to CPU cores × 1.5)
node scripts/validate-pdf-batch.js exports/*.pdf --concurrency 10
```

## 4️⃣ Generate Reports

Create HTML dashboard:

```bash
# Find latest report
REPORT=$(ls -t batch-reports/batch-report-*.json | head -1)

# Generate HTML + CSV
node scripts/generate-batch-report.js $REPORT
```

## 5️⃣ NPM Scripts

```bash
# Validate single PDF
npm run validate:single exports/test.pdf

# Validate batch
npm run validate:batch exports/*.pdf

# With cache
npm run validate:batch-cached exports/*.pdf

# Without cache
npm run validate:batch-nocache exports/*.pdf

# Generate report
npm run batch:report batch-reports/batch-report-*.json

# Cache management
npm run cache:stats   # View statistics
npm run cache:clean   # Remove expired
npm run cache:clear   # Clear all
```

## 6️⃣ Run Tests

```bash
# Full test suite
./test-batch.sh

# Quick tests
./test-batch.sh --quick

# Performance benchmarks
./test-batch.sh --performance
```

## Common Options

| Option | Description | Example |
|--------|-------------|---------|
| `--concurrency N` | Set worker threads | `--concurrency 10` |
| `--cache` | Enable caching | `--cache` |
| `--no-cache` | Disable caching | `--no-cache` |
| `--format F` | Output formats | `--format html,csv` |
| `--directory D` | Process directory | `--directory exports/` |

## Output Locations

- **Batch reports**: `batch-reports/batch-report-*.{json,txt,html,csv}`
- **Cache**: `.cache/validations/`
- **Temp files**: `exports/ai-validation-reports/batch-temp/`

## Performance Expectations

| Scenario | Speed | Cache Hit Rate |
|----------|-------|----------------|
| First run | Baseline | 0% |
| Second run (same files) | **31x faster** | 100% |
| After file changes | **5x faster** | ~80% |

## Troubleshooting

### "Worker timeout"
```bash
# Increase timeout in config/batch-config.json
"workerTimeout": 180000
```

### "Out of memory"
```bash
# Reduce concurrency
node scripts/validate-pdf-batch.js exports/*.pdf --concurrency 2
```

### "Low cache hit rate"
```bash
# Check if validator version changed (expected)
npm run cache:stats
```

## Full Documentation

See `BATCH-PROCESSING-README.md` for complete details.

---

**Need help?** Run: `node scripts/validate-pdf-batch.js --help`
