# Start Complete MCP Stack: WebSocket proxy (8013) + HTTP bridge (8012)
# Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\start-mcp-stack.ps1
param([switch]$SkipInstall)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSCommandPath
$proxyDir  = Join-Path $root "adb-mcp\adb-proxy-socket"
$bridgeDir = Join-Path $root "mcp-local"
$logsDir   = Join-Path $root "logs"

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

Write-Host "`n═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  MCP Stack Launcher" -ForegroundColor Cyan
Write-Host "  WebSocket Proxy (8013) + HTTP Bridge (8012)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Python venv + deps for FastAPI bridge
if (-not $SkipInstall) {
    if (-not (Test-Path (Join-Path $bridgeDir ".venv"))) {
        Write-Host "[Setup] Creating Python virtual environment..." -ForegroundColor Yellow
        Push-Location $bridgeDir
        python -m venv .venv
        Pop-Location
    }
    Write-Host "[Setup] Installing dependencies..." -ForegroundColor Yellow
    & (Join-Path $bridgeDir ".venv\Scripts\pip.exe") install --disable-pip-version-check -q fastapi uvicorn websockets httpx pydantic
    Write-Host "[Setup] ✅ Dependencies installed" -ForegroundColor Green
}

# Start WebSocket proxy (8013)
Write-Host "`n[1/3] Launching WebSocket proxy on 8013..." -ForegroundColor Yellow
Start-Job -Name mcp-proxy -ScriptBlock {
  param($dir,$log)
  Set-Location $dir
  node proxy.js *>> $log
} -ArgumentList $proxyDir,(Join-Path $logsDir "proxy-8013.log") | Out-Null

# Start HTTP bridge (8012)
Write-Host "[2/3] Launching HTTP bridge on 8012..." -ForegroundColor Yellow
Start-Job -Name mcp-bridge -ScriptBlock {
  param($dir,$log)
  Set-Location $dir
  & .\.venv\Scripts\python.exe indesign_mcp_http_bridge.py *>> $log
} -ArgumentList $bridgeDir,(Join-Path $logsDir "bridge-8012.log") | Out-Null

Start-Sleep -Seconds 2

# Health checks
Write-Host "[3/3] Verifying health..." -ForegroundColor Yellow
try {
    $proxyHealth  = Invoke-RestMethod -Uri "http://127.0.0.1:8013/health" -Method GET -ErrorAction Stop
    $bridgeHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8012/health" -Method GET -ErrorAction Stop
    Write-Host "  Proxy (8013): $($proxyHealth.status)" -ForegroundColor Green
    Write-Host "  Bridge(8012): $($bridgeHealth.status)" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
    Stop-Job -Name mcp-proxy,mcp-bridge -ErrorAction SilentlyContinue
    Remove-Job -Name mcp-proxy,mcp-bridge -ErrorAction SilentlyContinue
    exit 1
}

Write-Host "`nStack ready." -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Open Adobe InDesign + connect MCP Agent" -ForegroundColor White
Write-Host "  2. Run smoke test: .\scripts\smoke-test.ps1" -ForegroundColor White
Write-Host "  3. Generate PDF: node orchestrator.js jobs\aws-partnership-mcp.json" -ForegroundColor White
Write-Host ""
Write-Host "Logs:" -ForegroundColor Yellow
Write-Host "  Proxy:  $logsDir\proxy-8013.log" -ForegroundColor Gray
Write-Host "  Bridge: $logsDir\bridge-8012.log" -ForegroundColor Gray
Write-Host ""
Write-Host "To stop:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Name mcp-proxy,mcp-bridge" -ForegroundColor Gray
Write-Host "  Remove-Job -Name mcp-proxy,mcp-bridge" -ForegroundColor Gray
Write-Host ""
