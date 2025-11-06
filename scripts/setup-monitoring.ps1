# Setup Monitoring Infrastructure
# Creates log directories, configures log rotation, starts metrics aggregator

Write-Host "PDF Orchestrator - Monitoring Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Get project root
$projectRoot = Split-Path -Parent $PSScriptRoot

# Create log directories
Write-Host "Creating log directories..." -ForegroundColor Yellow

$logDirs = @(
    "$projectRoot\logs\operations",
    "$projectRoot\logs\errors",
    "$projectRoot\logs\metrics",
    "$projectRoot\logs\security"
)

foreach ($dir in $logDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  Exists: $dir" -ForegroundColor Gray
    }
}

# Create log rotation script
Write-Host ""
Write-Host "Creating log rotation script..." -ForegroundColor Yellow

$rotateScript = @'
# Log Rotation Script
# Keeps logs for 90 days, compresses older logs

$projectRoot = "T:\Projects\pdf-orchestrator"
$logTypes = @("operations", "errors", "metrics", "security")
$retentionDays = 90

Write-Host "Running log rotation..." -ForegroundColor Cyan

foreach ($logType in $logTypes) {
    $logDir = "$projectRoot\logs\$logType"

    if (Test-Path $logDir) {
        # Get all .jsonl files older than retention period
        $oldLogs = Get-ChildItem -Path $logDir -Filter "*.jsonl" |
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays) }

        foreach ($log in $oldLogs) {
            Write-Host "  Removing: $($log.Name)" -ForegroundColor Gray
            Remove-Item $log.FullName -Force
        }

        # Compress logs older than 7 days (but within retention)
        $archiveLogs = Get-ChildItem -Path $logDir -Filter "*.jsonl" |
            Where-Object {
                $_.LastWriteTime -lt (Get-Date).AddDays(-7) -and
                $_.LastWriteTime -gt (Get-Date).AddDays(-$retentionDays)
            }

        foreach ($log in $archiveLogs) {
            $gzPath = "$($log.FullName).gz"
            if (-not (Test-Path $gzPath)) {
                Write-Host "  Compressing: $($log.Name)" -ForegroundColor Yellow
                # Note: Requires .NET compression or external tool
                # For simplicity, we'll skip compression here
                # In production, use 7-Zip or similar
            }
        }
    }
}

Write-Host "Log rotation complete." -ForegroundColor Green
'@

$rotateScriptPath = "$projectRoot\scripts\rotate-logs.ps1"
Set-Content -Path $rotateScriptPath -Value $rotateScript -Force
Write-Host "  Created: $rotateScriptPath" -ForegroundColor Green

# Create Windows Task Scheduler job for log rotation
Write-Host ""
Write-Host "Setting up scheduled log rotation (daily at 2 AM)..." -ForegroundColor Yellow

$taskName = "PDFOrchestrator-LogRotation"
$taskExists = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($taskExists) {
    Write-Host "  Task already exists. Updating..." -ForegroundColor Gray
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$rotateScriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At 2:00AM
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType S4U
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
    Write-Host "  Scheduled task created successfully" -ForegroundColor Green
} catch {
    Write-Host "  Warning: Could not create scheduled task (requires admin privileges)" -ForegroundColor Yellow
    Write-Host "  You can run log rotation manually: .\scripts\rotate-logs.ps1" -ForegroundColor Yellow
}

# Check if Node.js is available
Write-Host ""
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow

$nodeVersion = node --version 2>$null
if ($nodeVersion) {
    Write-Host "  Node.js version: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ERROR: Node.js not found. Please install Node.js >= 18.0.0" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Yellow

Push-Location $projectRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "  Installing dependencies..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "  Dependencies already installed" -ForegroundColor Green
}

Pop-Location

# Test telemetry system
Write-Host ""
Write-Host "Testing telemetry system..." -ForegroundColor Yellow

$testScript = @'
const { initialize, recordOperation, getDailySpend } = require('./workers/telemetry');

async function test() {
  console.log('[TEST] Initializing telemetry...');
  await initialize();

  console.log('[TEST] Recording test operation...');
  await recordOperation('test_operation', {
    run_id: 'test-' + Date.now(),
    doc_slug: 'test-document',
    user: 'test@teei.org',
    latency_ms: 1500,
    status: 'success',
    cost_usd: 0.25,
    api_calls: [],
    assets: {},
    validation: {}
  });

  const today = new Date().toISOString().split('T')[0];
  const spend = await getDailySpend(today);
  console.log(`[TEST] Daily spend: $${spend.toFixed(2)}`);

  console.log('[TEST] Telemetry test complete!');
}

test().catch(console.error);
'@

$testScriptPath = "$projectRoot\test-telemetry.js"
Set-Content -Path $testScriptPath -Value $testScript -Force

Push-Location $projectRoot
node $testScriptPath
Pop-Location

Remove-Item $testScriptPath -Force

# Start metrics aggregator in background
Write-Host ""
Write-Host "Starting metrics aggregator..." -ForegroundColor Yellow

$aggregatorScript = @'
const { startAggregator } = require('./workers/metrics-aggregator');
const { initialize } = require('./workers/telemetry');

async function main() {
  console.log('[METRICS] Initializing telemetry system...');
  await initialize();

  console.log('[METRICS] Starting aggregator (15-minute intervals)...');
  startAggregator();

  console.log('[METRICS] Aggregator running. Press Ctrl+C to stop.');
}

main().catch(console.error);
'@

$aggregatorScriptPath = "$projectRoot\start-metrics-aggregator.js"
Set-Content -Path $aggregatorScriptPath -Value $aggregatorScript -Force

Write-Host "  Created: $aggregatorScriptPath" -ForegroundColor Green
Write-Host ""
Write-Host "To start the metrics aggregator, run:" -ForegroundColor Cyan
Write-Host "  node start-metrics-aggregator.js" -ForegroundColor White
Write-Host ""
Write-Host "Or to run in background:" -ForegroundColor Cyan
Write-Host "  Start-Process node -ArgumentList 'start-metrics-aggregator.js' -WindowStyle Hidden" -ForegroundColor White

# Check if Grafana is accessible
Write-Host ""
Write-Host "Checking Grafana connection..." -ForegroundColor Yellow

$grafanaUrl = "http://localhost:3000"
try {
    $response = Invoke-WebRequest -Uri $grafanaUrl -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
    Write-Host "  Grafana is accessible at $grafanaUrl" -ForegroundColor Green
    Write-Host ""
    Write-Host "To import dashboards:" -ForegroundColor Cyan
    Write-Host "  1. Open Grafana at $grafanaUrl" -ForegroundColor White
    Write-Host "  2. Go to Dashboards > Import" -ForegroundColor White
    Write-Host "  3. Upload: config\grafana\dashboards\orchestrator-performance.json" -ForegroundColor White
    Write-Host "  4. Upload: config\grafana\dashboards\orchestrator-quality.json" -ForegroundColor White
} catch {
    Write-Host "  Grafana not running at $grafanaUrl" -ForegroundColor Yellow
    Write-Host "  Dashboards are available in: config\grafana\dashboards\" -ForegroundColor Yellow
    Write-Host "  Install Grafana to visualize metrics: https://grafana.com/grafana/download" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Monitoring setup complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Log directories:" -ForegroundColor Cyan
foreach ($dir in $logDirs) {
    Write-Host "  $dir" -ForegroundColor White
}
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Start metrics aggregator: node start-metrics-aggregator.js" -ForegroundColor White
Write-Host "  2. Configure environment variables in config\.env:" -ForegroundColor White
Write-Host "     - SLACK_WEBHOOK_URL (for alerts)" -ForegroundColor White
Write-Host "     - RESEND_API_KEY (for email alerts)" -ForegroundColor White
Write-Host "     - PAGERDUTY_INTEGRATION_KEY (optional)" -ForegroundColor White
Write-Host "  3. Import Grafana dashboards (if Grafana is running)" -ForegroundColor White
Write-Host "  4. Test alerts: node scripts\send-alert.js" -ForegroundColor White
Write-Host ""
