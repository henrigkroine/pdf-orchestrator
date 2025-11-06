# CI/CD Integration for InDesign Document Pipeline

## Overview
This document provides comprehensive guidance for integrating the InDesign automated pipeline into various CI/CD systems. The pipeline validates, exports, and quality-checks InDesign documents automatically.

## Table of Contents
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Pipeline Components](#pipeline-components)
- [CI/CD Platforms](#cicd-platforms)
- [Configuration](#configuration)
- [Deployment Strategies](#deployment-strategies)
- [Monitoring & Alerts](#monitoring--alerts)
- [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────┐
│   Git Commit    │──────▶│  CI/CD Job   │──────▶│  InDesign   │
│  (.indd files)  │      │   Trigger    │      │   Server    │
└─────────────────┘      └──────────────┘      └─────────────┘
                                │
                                ▼
                    ┌────────────────────┐
                    │  Pipeline.py       │
                    │  • Connect          │
                    │  • Validate Colors  │
                    │  • Export PDF/PNG   │
                    │  • Quality Check    │
                    └────────────────────┘
                                │
                        ┌───────┴────────┐
                        ▼                ▼
                ┌──────────────┐  ┌──────────────┐
                │   Success    │  │   Failure    │
                │  • Deploy    │  │  • Notify    │
                │  • Archive   │  │  • Rollback  │
                └──────────────┘  └──────────────┘
```

---

## Prerequisites

### Software Requirements
- **InDesign Server** 2024 or later (for server deployments)
- **InDesign Desktop** 2024 or later (for local/development)
- **Python** 3.10+
- **Node.js** 18+ (for MCP proxy)
- **Git** for version control

### Python Dependencies
```bash
# Core dependencies
pip install -r requirements.txt

# Extended PDF processing
pip install -r requirements-extended.txt
```

### InDesign Setup
1. Install InDesign Server or Desktop version
2. Install UXP plugin (adb-mcp folder)
3. Start MCP proxy server:
```bash
cd adb-mcp
npm install
npm start
```

---

## Pipeline Components

### 1. Main Pipeline Script (`pipeline.py`)
- Orchestrates the entire workflow
- Connects to InDesign via Socket.IO
- Handles retries and error recovery
- Generates comprehensive reports

### 2. Document Validator (`validate_document.py`)
- PDF structure validation
- Content verification
- Visual hierarchy analysis
- Brand color checking
- Scoring system (0-100)

### 3. Preview Server (`preview_server.py`)
- Real-time document preview
- Auto-refresh capability
- Validation integration
- Web-based interface

### 4. Color Validator (`check_colors.js`)
- InDesign swatch validation
- Missing color detection
- Automatic color fixing
- Usage analysis

---

## CI/CD Platforms

### GitHub Actions

**Setup:**
1. Copy `.github/workflows/indesign-pipeline.yml` to your repository
2. Configure secrets in GitHub Settings → Secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `CLOUDFRONT_DISTRIBUTION_ID`
   - `SLACK_WEBHOOK`

**Usage:**
```yaml
# Trigger on InDesign file changes
on:
  push:
    paths:
      - '**.indd'
      - '**.indt'
```

**Key Features:**
- Automatic PR comments with validation results
- Artifact uploads for exported documents
- Conditional deployment to staging
- Parallel job execution

### Jenkins

**Setup:**
1. Install required plugins:
   - Pipeline
   - AWS Steps
   - HTML Publisher
   - Slack Notification

2. Create pipeline job with `Jenkinsfile`

3. Configure credentials:
   - AWS credentials (ID: `aws-teei-credentials`)
   - Slack webhook in environment variables

**Usage:**
```groovy
// Manual trigger with parameters
parameters {
    choice(name: 'QUALITY_PRESET', choices: ['production', 'review', 'draft'])
    booleanParam(name: 'AUTO_FIX_COLORS', defaultValue: true)
}
```

**Key Features:**
- Parameterized builds
- Windows agent support
- HTML report publishing
- Stage-based execution

### GitLab CI

**Setup (`gitlab-ci.yml`):**
```yaml
stages:
  - validate
  - export
  - deploy

variables:
  INDESIGN_PROXY: "http://localhost:8013"
  VALIDATION_THRESHOLD: "85"

validate-document:
  stage: validate
  script:
    - python pipeline.py --ci --threshold $VALIDATION_THRESHOLD
  artifacts:
    reports:
      junit: pipeline_report.xml
    paths:
      - exports/

deploy-staging:
  stage: deploy
  only:
    - main
  script:
    - aws s3 cp exports/ s3://staging-bucket/ --recursive
  dependencies:
    - validate-document
```

### Azure DevOps

**Setup (`azure-pipelines.yml`):**
```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - '**.indd'

pool:
  vmImage: 'windows-latest'

stages:
- stage: Build
  jobs:
  - job: ValidateAndExport
    steps:
    - task: UsePythonVersion@0
      inputs:
        versionSpec: '3.10'

    - script: |
        pip install -r requirements.txt
        python pipeline.py --ci
      displayName: 'Run Pipeline'

    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: 'exports'
        artifactName: 'documents'
```

---

## Configuration

### Pipeline Configuration (`pipeline.config.json`)

```json
{
  "proxy_url": "http://localhost:8013",
  "export_path": "./exports",
  "validation_threshold": 80,
  "auto_fix_colors": true,

  "quality_presets": {
    "production": {
      "validation_threshold": 95,
      "pdf_preset": "Press Quality"
    },
    "draft": {
      "validation_threshold": 60,
      "pdf_preset": "Smallest File Size"
    }
  }
}
```

### Environment Variables

```bash
# InDesign connection
export INDESIGN_PROXY_URL="http://localhost:8013"
export INDESIGN_TIMEOUT=30

# Export settings
export EXPORT_PATH="/path/to/exports"
export PDF_PRESET="High Quality Print"

# Validation
export VALIDATION_THRESHOLD=80
export AUTO_FIX_COLORS=true

# Notifications
export SLACK_WEBHOOK="https://hooks.slack.com/..."
export EMAIL_RECIPIENTS="team@example.com"
```

---

## Deployment Strategies

### 1. Blue-Green Deployment
```bash
# Deploy to green environment
aws s3 cp exports/ s3://documents-green/ --recursive

# Test green environment
python validate_deployment.py --env green

# Switch traffic to green
aws cloudfront update-distribution \
  --id $DISTRIBUTION_ID \
  --default-root-object green/index.html
```

### 2. Canary Deployment
```javascript
// CloudFront Lambda@Edge for canary routing
exports.handler = async (event) => {
    const request = event.Records[0].cf.request;
    const random = Math.random();

    // 10% traffic to new version
    if (random < 0.1) {
        request.origin.s3.path = '/canary';
    }

    return request;
};
```

### 3. Rolling Deployment
```python
# deploy.py
def rolling_deploy(documents, batch_size=5):
    """Deploy documents in batches with validation"""
    for i in range(0, len(documents), batch_size):
        batch = documents[i:i+batch_size]

        # Deploy batch
        deploy_batch(batch)

        # Validate deployment
        if not validate_batch(batch):
            rollback_batch(batch)
            raise Exception(f"Batch {i} failed validation")

        # Wait before next batch
        time.sleep(30)
```

---

## Monitoring & Alerts

### CloudWatch Metrics
```python
# Send custom metrics
import boto3

cloudwatch = boto3.client('cloudwatch')

def send_validation_metric(score):
    cloudwatch.put_metric_data(
        Namespace='InDesignPipeline',
        MetricData=[
            {
                'MetricName': 'ValidationScore',
                'Value': score,
                'Unit': 'Count',
                'Timestamp': datetime.now()
            }
        ]
    )
```

### Slack Notifications
```python
def notify_slack(webhook_url, message):
    payload = {
        "text": f"Pipeline Status: {message['status']}",
        "attachments": [{
            "color": "good" if message['success'] else "danger",
            "fields": [
                {"title": "Score", "value": message['score'], "short": True},
                {"title": "Document", "value": message['document'], "short": True}
            ]
        }]
    }
    requests.post(webhook_url, json=payload)
```

### DataDog Integration
```yaml
# datadog.yaml
init_config:

instances:
  - min_collection_interval: 30
    metrics:
      - indesign.pipeline.validation_score
      - indesign.pipeline.export_time
      - indesign.pipeline.color_fixes
```

---

## Troubleshooting

### Common Issues

#### 1. InDesign Connection Failed
```bash
# Check if InDesign is running
tasklist | findstr InDesign

# Check proxy status
curl http://localhost:8013/health

# Restart services
npm run restart-proxy
```

#### 2. Color Validation Failures
```javascript
// Debug color issues
const debugColors = () => {
    const doc = app.activeDocument;
    const swatches = doc.colors.everyItem().getElements();

    swatches.forEach(swatch => {
        console.log(`Color: ${swatch.name}, RGB: ${swatch.colorValue}`);
    });
};
```

#### 3. Export Timeouts
```python
# Increase timeout in pipeline.py
socket_client.configure(
    app=self.APPLICATION,
    url=self.PROXY_URL,
    timeout=60  # Increase from 30 to 60 seconds
)
```

#### 4. Memory Issues
```yaml
# Jenkins: Increase heap size
environment {
    JAVA_OPTS = '-Xmx2048m -Xms1024m'
}
```

### Debug Mode
```bash
# Enable verbose logging
python pipeline.py --debug --log-level DEBUG

# Save debug output
python pipeline.py --ci 2>&1 | tee debug.log
```

### Health Checks
```python
# health_check.py
def check_pipeline_health():
    checks = {
        "indesign_connection": test_indesign_connection(),
        "python_dependencies": verify_dependencies(),
        "export_path_writable": check_export_permissions(),
        "memory_available": check_memory() > 2048  # MB
    }

    return all(checks.values()), checks
```

---

## Best Practices

### 1. Version Control
- Tag InDesign template versions
- Use semantic versioning for documents
- Track color swatches in Git

### 2. Testing
```python
# test_pipeline.py
def test_color_validation():
    """Test color validation logic"""
    validator = ColorValidator()
    result = validator.validate(test_document)
    assert result.score >= 80
```

### 3. Security
- Store credentials in CI/CD secrets
- Use IAM roles for AWS access
- Implement rate limiting for API endpoints

### 4. Performance
- Cache validation results
- Use parallel exports when possible
- Optimize PDF settings for target use

### 5. Documentation
- Document custom color names
- Maintain export preset definitions
- Keep CI/CD configurations in sync

---

## Integration Examples

### Webhook Integration
```python
# webhook_handler.py
@app.route('/webhook/indesign', methods=['POST'])
def handle_indesign_webhook():
    """Handle InDesign document updates"""
    data = request.json

    if data['event'] == 'document_saved':
        # Trigger pipeline
        result = run_pipeline(data['document_path'])

        # Send response
        return jsonify({
            'status': 'success',
            'validation_score': result['score']
        })
```

### API Integration
```python
# api.py
from fastapi import FastAPI

app = FastAPI()

@app.post("/validate")
async def validate_document(file_path: str):
    """REST API endpoint for document validation"""
    pipeline = InDesignPipeline()
    result = pipeline.run_validation(file_path)
    return result
```

### Event-Driven Architecture
```python
# sqs_handler.py
import boto3

sqs = boto3.client('sqs')

def process_queue():
    """Process InDesign jobs from SQS"""
    messages = sqs.receive_message(
        QueueUrl=QUEUE_URL,
        MaxNumberOfMessages=10
    )

    for message in messages.get('Messages', []):
        job = json.loads(message['Body'])
        run_pipeline(job['document'])
        sqs.delete_message(
            QueueUrl=QUEUE_URL,
            ReceiptHandle=message['ReceiptHandle']
        )
```

---

## Conclusion

This CI/CD integration provides:
- ✅ Automated document validation
- ✅ Quality score tracking
- ✅ Automatic color fixing
- ✅ Multi-format exports
- ✅ Deployment automation
- ✅ Comprehensive reporting

For support or questions, refer to the main documentation or submit an issue in the repository.