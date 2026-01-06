#!/usr/bin/env pwsh
# InDesign MCP Status Check Script

Write-Host "`n=== INDESIGN MCP STATUS CHECK ===" -ForegroundColor Cyan

# 1. Check if InDesign is running
Write-Host "`n[1/4] Checking if Adobe InDesign is running..." -ForegroundColor Yellow
$indesign = Get-Process -Name 'InDesign' -ErrorAction SilentlyContinue
if ($indesign) {
    Write-Host "  ✅ InDesign is RUNNING (PID: $($indesign.Id))" -ForegroundColor Green
} else {
    Write-Host "  ❌ InDesign is NOT running" -ForegroundColor Red
    Write-Host "     Action: Launch Adobe InDesign" -ForegroundColor Yellow
}

# 2. Check if WebSocket proxy is running on port 8013
Write-Host "`n[2/4] Checking if WebSocket proxy is running on port 8013..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 8013 -State Listen -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host "  ✅ Proxy is RUNNING on port 8013" -ForegroundColor Green
} else {
    Write-Host "  ❌ Proxy is NOT running on port 8013" -ForegroundColor Red
    Write-Host "     Action: Start proxy manually with:" -ForegroundColor Yellow
    $proxyPath = Join-Path $PSScriptRoot "adb-mcp\adb-proxy-socket"
    Write-Host "     cd $proxyPath" -ForegroundColor White
    Write-Host "     node proxy.js" -ForegroundColor White
}

# 3. Check if generated_tools.py exists
Write-Host "`n[3/4] Checking if generated tools file exists..." -ForegroundColor Yellow
$generatedToolsPath = Join-Path $PSScriptRoot "adb-mcp\mcp\generated_tools.py"
if (Test-Path $generatedToolsPath) {
    $lineCount = (Get-Content $generatedToolsPath | Measure-Object -Line).Lines
    Write-Host "  ✅ generated_tools.py exists ($lineCount lines)" -ForegroundColor Green
} else {
    Write-Host "  ❌ generated_tools.py NOT found" -ForegroundColor Red
}

# 4. Check if MCP is configured in Claude Code settings
Write-Host "`n[4/4] Checking Claude Code MCP configuration..." -ForegroundColor Yellow
if (Test-Path "C:\Users\ovehe\.claude\settings.json") {
    $settings = Get-Content "C:\Users\ovehe\.claude\settings.json" | ConvertFrom-Json
    if ($settings.mcpServers.'adobe-indesign') {
        Write-Host "  ✅ adobe-indesign MCP is configured" -ForegroundColor Green
    } else {
        Write-Host "  ❌ adobe-indesign MCP is NOT configured" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ Claude Code settings.json NOT found" -ForegroundColor Red
}

Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
Write-Host @"

To use InDesign MCP with all 61 commands, you need:

1. ✓ InDesign running
2. ✓ UXP Developer Tool with plugin loaded ($PSScriptRoot\adb-mcp\uxp\id)
3. ✓ WebSocket proxy running (node proxy.js on port 8013)
4. ✓ Claude Code restarted (already done)

Then in Claude Code, you can create documents with commands like:
  "Create a new InDesign document 595x842pt"
  "Add text frame with TEEI branding"
  etc.

"@ -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
