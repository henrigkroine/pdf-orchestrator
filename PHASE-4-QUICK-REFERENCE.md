# Phase 4 Quick Reference Card

**World-Class QA System Commands**

---

## 🔍 Object Detection

```bash
# Run object detection on single image
GEMINI_API_KEY=your_key node scripts/validate-pdf-object-detection.js image.png

# View report
cat exports/object-detection-reports/object-detection-*.txt
```

**Output**: Bounding boxes, spatial violations, brand compliance score

---

## 📊 Metrics Collection

```bash
# Collect metrics (last 24 hours)
node scripts/collect-metrics.js 24

# View metrics
cat dashboard/data/metrics.json | jq .

# View history
cat dashboard/data/metrics-history.json | jq .
```

**Output**:
- `dashboard/data/metrics.json` - Current metrics
- `dashboard/data/metrics-history.json` - 90-day history

---

## 📈 Dashboard

```bash
# Serve dashboard locally
npx http-server dashboard -p 8080

# Open browser
open http://localhost:8080
```

**Features**: Real-time metrics, charts, tables, insights (auto-refresh every 30s)

---

## 🧠 Adaptive Learning

```bash
# View learning statistics
node scripts/adaptive-learning.js stats

# Show current model weights
node scripts/adaptive-learning.js weights

# Retrain with feedback
node scripts/adaptive-learning.js retrain
```

**Output**: Feedback count, agreement rate, model weights, improvement rate

---

## 👤 Human Review

```bash
# Start review session (low confidence only)
node scripts/lib/human-review-interface.js start

# Review all pending
node scripts/lib/human-review-interface.js all

# View statistics
node scripts/lib/human-review-interface.js stats
```

**Confidence Thresholds**:
- >90%: Auto-accept
- 70-90%: Flag for review
- <70%: Require validation

---

## 🚦 Quality Gate

```bash
# Check with default thresholds
node scripts/check-quality-gate.js

# Custom threshold (B+ = 8.0)
node scripts/check-quality-gate.js --threshold 8.5

# Multiple thresholds
node scripts/check-quality-gate.js --threshold 8.0 --confidence 0.80
```

**Thresholds**:
- Minimum Score: 8.0/10 (B+)
- Minimum Confidence: 0.70 (70%)
- Maximum Error Rate: 5.0% (5%)

**Exit Codes**: 0 = pass, 1 = fail, 2 = error

---

## 🔄 CI/CD

### Setup

1. Add GitHub secret: `GEMINI_API_KEY`
2. Enable GitHub Pages (Settings → Pages → `gh-pages` branch)
3. Push to main/develop to trigger workflow

### Workflow Jobs

1. **AI Vision QA** - Validate PDFs, check quality gate
2. **Object Detection** - Spatial analysis
3. **Collect Metrics** - Aggregate metrics
4. **Post Comment** - PR comments (PRs only)
5. **Deploy Dashboard** - GitHub Pages (main only)

### Dashboard URL
```
https://your-username.github.io/pdf-orchestrator/qa-dashboard/
```

---

## 📁 Key Files

### Scripts
- `scripts/validate-pdf-object-detection.js` - Object detection
- `scripts/collect-metrics.js` - Metrics collection
- `scripts/adaptive-learning.js` - Learning system
- `scripts/check-quality-gate.js` - Quality checker
- `scripts/lib/object-analyzer.js` - Spatial analysis
- `scripts/lib/human-review-interface.js` - Review CLI

### Dashboard
- `dashboard/index.html` - Dashboard UI
- `dashboard/css/dashboard.css` - Styles
- `dashboard/js/api.js` - API layer
- `dashboard/js/charts.js` - Chart.js integration
- `dashboard/js/metrics.js` - Main controller

### Data
- `dashboard/data/metrics.json` - Current metrics
- `dashboard/data/metrics-history.json` - Historical data
- `data/feedback/` - Human feedback
- `data/reviews/` - Human reviews
- `data/model-weights.json` - Adaptive weights

### Reports
- `exports/ai-validation-reports/` - AI validation
- `exports/object-detection-reports/` - Object detection
- `exports/validation-issues/` - Screenshots

### CI/CD
- `.github/workflows/qa-validation.yml` - GitHub Actions

---

## 🎯 Common Workflows

### 1. Validate New PDF

```bash
# Convert to image
pdftoppm -png -singlefile document.pdf page

# Run object detection
GEMINI_API_KEY=your_key node scripts/validate-pdf-object-detection.js page.png

# Check quality gate
node scripts/check-quality-gate.js --threshold 8.0
```

### 2. Review Low Confidence Results

```bash
# Start review session
node scripts/lib/human-review-interface.js start

# Follow prompts to review each validation
# Corrections feed back to adaptive learning automatically
```

### 3. Update Dashboard

```bash
# Collect latest metrics
node scripts/collect-metrics.js 24

# Serve dashboard
npx http-server dashboard -p 8080

# Dashboard auto-refreshes every 30 seconds
```

### 4. Monitor Learning Progress

```bash
# View statistics
node scripts/adaptive-learning.js stats

# Check agreement rate (target: >90%)
# Check improvement rate (target: +1.2% per month)

# Retrain if needed
node scripts/adaptive-learning.js retrain
```

### 5. CI/CD Deployment

```bash
# Commit changes
git add .
git commit -m "Update documents"
git push

# Workflow runs automatically:
# 1. Validates PDFs
# 2. Checks quality gate
# 3. Collects metrics
# 4. Deploys dashboard
```

---

## 📊 Metrics Reference

### Validation Metrics
- **Total Validations**: Count of all validations
- **Average Score**: 0-10 scale
- **Average Accuracy**: AI-human agreement %
- **Grade Distribution**: A+ through F counts
- **Human Review Rate**: % requiring review

### Performance Metrics
- **Processing Time**: Avg, median, P95, P99 (seconds)
- **Cache Hit Rate**: % of cached results
- **API Error Rate**: % of failed API calls
- **Throughput**: Validations per hour

### Cost Metrics
- **Total Cost**: USD total
- **Cost Per Validation**: USD per validation
- **Breakdown**: By model (Gemini, Claude, GPT-4V)
- **Projected Monthly**: Based on current usage

### Model Metrics (per model)
- **Accuracy**: % correct predictions
- **Speed**: Average seconds
- **Cost**: USD per validation
- **Usage Count**: Total uses
- **Confidence**: Average confidence score
- **Error Rate**: % errors

---

## 🎓 Thresholds & Targets

### Quality Gate Thresholds
- Minimum Score: **8.0/10** (B+)
- Minimum Accuracy: **85%**
- Maximum Error Rate: **5%**
- Minimum Confidence: **0.70** (70%)

### Performance Targets
- Accuracy: **96-97%** (world-class)
- Speed: **0.5-2 seconds** (with caching)
- Cost: **$0.08-0.12** per validation
- Human Review: **2-4%** of validations

### Learning Targets
- AI-Human Agreement: **>90%**
- Average Correction: **<1.0 points**
- Improvement Rate: **+1.2% per month**
- False Positive Rate: **<1%**

---

## 🔧 Troubleshooting

### Object Detection Fails
```bash
# Check API key
echo $GEMINI_API_KEY

# Verify image format (PNG, JPG supported)
file image.png

# Check image size (max 20MB)
ls -lh image.png
```

### Dashboard Not Loading
```bash
# Check metrics file exists
ls -la dashboard/data/metrics.json

# Collect metrics if missing
node scripts/collect-metrics.js 24

# Verify http-server
npx http-server dashboard -p 8080
```

### Quality Gate Fails
```bash
# View detailed report
node scripts/check-quality-gate.js --threshold 8.0

# Check specific reports
ls exports/ai-validation-reports/

# Adjust threshold if needed
node scripts/check-quality-gate.js --threshold 7.5
```

### Adaptive Learning Issues
```bash
# Verify feedback directory
ls -la data/feedback/

# Check model weights
cat data/model-weights.json

# Reset if corrupted
rm data/model-weights.json
node scripts/adaptive-learning.js stats
```

---

## 📚 Documentation

- **PHASE-4-IMPLEMENTATION-REPORT.md** - Full implementation details
- **PHASE-4-SUMMARY.md** - Executive summary
- **WORLD-CLASS-QA-IMPROVEMENTS.md** - Research and improvements
- **schemas/metrics.schema.json** - Metrics data structure

---

## 💡 Tips

1. **Run metrics collection regularly** to track improvement
2. **Review low-confidence validations** to improve learning
3. **Monitor dashboard daily** for quality trends
4. **Retrain monthly** with accumulated feedback
5. **Adjust thresholds** based on project needs
6. **Use CI/CD** to enforce quality gates
7. **Check model weights** to optimize costs

---

**Quick Reference v1.0**
**Last Updated**: November 6, 2025
