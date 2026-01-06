# MCP HTTP Bridge Smoke Test
# Validates: proxy 8013, bridge 8012, basic InDesign commands + export

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $PSCommandPath)

Write-Host "`n== MCP HTTP Bridge Smoke Test ==" -ForegroundColor Cyan

# 1) Health (proxy is WebSocket-only, no HTTP health endpoint)
Write-Host "[1/3] Checking services..." -ForegroundColor Yellow
try {
    $bridge = Invoke-RestMethod -Uri "http://127.0.0.1:8012/health" -Method GET -ErrorAction Stop
    Write-Host "  Bridge(8012): $($bridge.status)" -ForegroundColor Green
    Write-Host "  Proxy (8013): WebSocket (no HTTP health check)" -ForegroundColor Gray
} catch {
    Write-Host "  ❌ Bridge not responding. Run: .\start-mcp-stack.ps1" -ForegroundColor Red
    exit 1
}

# 2) InDesign agent should be connected via the proxy
Write-Host "[2/3] Running bridge job..." -ForegroundColor Yellow
$exportPath = Join-Path $root "exports\bridge-smoke.pdf"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$job = @{
  jobId = "smoke-test-$timestamp"
  jobType = "test"
  humanSession = $true
  worldClass = $false
  templateId = "minimal-test"
  output = @{ quality = "medium"; intent = "screen"; formats = @("pdf") }
  export = @{ pdfPreset = "High Quality Print" }
  qa = @{ enabled = $false; threshold = 80 }
  data = @{
    title = "Smoke Test"
    color = @{ name = "Nordshore"; hex = "#00393F" }
    exportPath = $exportPath
  }
} | ConvertTo-Json -Depth 5

try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8012/api/jobs" -Method POST -ContentType "application/json" -Body $job -ErrorAction Stop
    Write-Host "  Response: success" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Job failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    Write-Host "  Make sure InDesign MCP Agent is connected!" -ForegroundColor Yellow
    exit 1
}

# 3) Verify export
Write-Host "[3/3] Verifying export..." -ForegroundColor Yellow
if (Test-Path $exportPath) {
  Write-Host "  ✅ Export created: $exportPath" -ForegroundColor Green
} else {
  Write-Host "  ❌ Export missing: $exportPath" -ForegroundColor Red
  exit 1
}

Write-Host "`n🎉 Smoke test passed." -ForegroundColor Green
Write-Host ""
