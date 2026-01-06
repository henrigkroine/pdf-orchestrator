@echo off
REM ================================================================
REM PDF Orchestrator - WebSocket Proxy Startup
REM ================================================================
REM
REM Starts the MCP WebSocket proxy on localhost:8013
REM Required for Python <-> InDesign communication
REM
REM ================================================================

echo.
echo ============================================================
echo  PDF ORCHESTRATOR - WEBSOCKET PROXY
echo ============================================================
echo.
echo Starting proxy server on ws://localhost:8013...
echo.

cd /d "%~dp0"

node adb-mcp/adb-proxy-socket/proxy.js

REM If node exits, show error
if errorlevel 1 (
    echo.
    echo [ERROR] Proxy server failed to start!
    echo.
    echo Troubleshooting:
    echo 1. Check Node.js is installed: node --version
    echo 2. Check port 8013 is available: netstat -ano ^| findstr :8013
    echo 3. Check dependencies installed: cd adb-mcp/adb-proxy-socket ^&^& npm install
    echo.
    pause
)
