# Auto-Start MCP Stack for PDF Orchestrator
# This script starts the WebSocket Proxy and HTTP Bridge as background processes
# Location: D:\Dev\VS Projects\Projects\pdf-orchestrator\auto-start-mcp.ps1

$ErrorActionPreference = "SilentlyContinue"
$root = "D:\Dev\VS Projects\Projects\pdf-orchestrator"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "  PDF Orchestrator - MCP Auto-Start" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Check if ports are already in use (servers already running)
$port8012 = Get-NetTCPConnection -LocalPort 8012 -State Listen -ErrorAction SilentlyContinue
$port8013 = Get-NetTCPConnection -LocalPort 8013 -State Listen -ErrorAction SilentlyContinue

if ($port8012 -and $port8013) {
    Write-Host "[OK] MCP Stack already running!" -ForegroundColor Green
    Write-Host "  - HTTP Bridge (8012): Running" -ForegroundColor Green
    Write-Host "  - WebSocket Proxy (8013): Running" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Kill any zombie processes on these ports
Write-Host "[1/4] Cleaning up old processes..." -ForegroundColor Yellow
if ($port8012) {
    $pid8012 = $port8012.OwningProcess
    Stop-Process -Id $pid8012 -Force -ErrorAction SilentlyContinue
}
if ($port8013) {
    $pid8013 = $port8013.OwningProcess
    Stop-Process -Id $pid8013 -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Milliseconds 500

# Start WebSocket Proxy (port 8013)
Write-Host "[2/4] Starting WebSocket Proxy (8013)..." -ForegroundColor Yellow
$proxyPath = Join-Path $root "adb-mcp\adb-proxy-socket"
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title MCP Proxy 8013 && cd /d `"$proxyPath`" && node proxy.js" -WindowStyle Minimized

Start-Sleep -Seconds 2

# Start HTTP Bridge (port 8012)
Write-Host "[3/4] Starting HTTP Bridge (8012)..." -ForegroundColor Yellow
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "title MCP Bridge 8012 && cd /d `"$root`" && node http-bridge-server.js" -WindowStyle Minimized

Start-Sleep -Seconds 2

# Health check
Write-Host "[4/5] Verifying health..." -ForegroundColor Yellow
Start-Sleep -Seconds 1

try {
    $proxy = Invoke-RestMethod -Uri "http://127.0.0.1:8013/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  - WebSocket Proxy (8013): $($proxy.status)" -ForegroundColor Green
} catch {
    Write-Host "  - WebSocket Proxy (8013): FAILED" -ForegroundColor Red
}

try {
    $bridge = Invoke-RestMethod -Uri "http://127.0.0.1:8012/health" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "  - HTTP Bridge (8012): $($bridge.status)" -ForegroundColor Green
} catch {
    Write-Host "  - HTTP Bridge (8012): FAILED" -ForegroundColor Red
}

# Check for InDesign executor (Architecture Fix v2.0)
Write-Host "[5/5] Checking InDesign executor..." -ForegroundColor Yellow

$maxWait = 30
$waited = 0
$executorReady = $false

while ($waited -lt $maxWait) {
    try {
        $ready = Invoke-RestMethod -Uri "http://127.0.0.1:8013/ready" -TimeoutSec 2 -ErrorAction Stop
        if ($ready.ready) {
            Write-Host "  - InDesign executor: CONNECTED ($($ready.executors) executor(s))" -ForegroundColor Green
            $executorReady = $true
            break
        }
    } catch {
        # Executor not ready yet
    }
    Start-Sleep -Seconds 2
    $waited += 2
    Write-Host "  - Waiting for InDesign executor... ($waited s)" -ForegroundColor Yellow
}

if (-not $executorReady) {
    Write-Host "  - InDesign executor: NOT CONNECTED" -ForegroundColor Yellow
    Write-Host "    Open InDesign and load the UXP plugin" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
if ($executorReady) {
    Write-Host "  MCP Stack FULLY Ready!" -ForegroundColor Green
} else {
    Write-Host "  MCP Stack Ready (Awaiting InDesign)" -ForegroundColor Yellow
}
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
if (-not $executorReady) {
    Write-Host "  1. Open InDesign" -ForegroundColor White
    Write-Host "  2. Window > Utilities > UXP Developer Tool" -ForegroundColor White
    Write-Host "  3. Load plugin from: adb-mcp\uxp\id\" -ForegroundColor White
    Write-Host "  4. Click 'Connect'" -ForegroundColor White
} else {
    Write-Host "  Ready to execute PDF commands!" -ForegroundColor Green
}
Write-Host ""
Write-Host "Health endpoints:" -ForegroundColor Gray
Write-Host "  curl http://localhost:8012/health     # Bridge status" -ForegroundColor Gray
Write-Host "  curl http://localhost:8013/health     # Proxy status" -ForegroundColor Gray
Write-Host "  curl http://localhost:8013/ready      # Executor check" -ForegroundColor Gray
Write-Host "  curl http://localhost:8013/health/detailed  # Full diagnostics" -ForegroundColor Gray
Write-Host ""
