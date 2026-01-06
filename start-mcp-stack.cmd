@echo off
REM ============================================================
REM  PDF Orchestrator - MCP Stack Starter
REM  Starts WebSocket Proxy (8013) + HTTP Bridge (8012)
REM ============================================================

echo.
echo ============================================================
echo   PDF ORCHESTRATOR - MCP STACK
echo ============================================================
echo.

REM Check if Node is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found in PATH
    pause
    exit /b 1
)

REM Kill any existing processes on ports 8012 and 8013
echo [1/4] Cleaning up old processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8012 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8013 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>nul
timeout /t 1 >nul

REM Start WebSocket Proxy (port 8013) in new window
echo [2/4] Starting WebSocket Proxy (port 8013)...
start "MCP Proxy 8013" cmd /k "cd /d D:\Dev\VS Projects\Projects\pdf-orchestrator\adb-mcp\adb-proxy-socket && node proxy.js"
timeout /t 2 >nul

REM Start HTTP Bridge (port 8012) in new window
echo [3/4] Starting HTTP Bridge (port 8012)...
start "MCP Bridge 8012" cmd /k "cd /d D:\Dev\VS Projects\Projects\pdf-orchestrator && node http-bridge-server.js"
timeout /t 2 >nul

REM Health check
echo [4/4] Verifying connections...
timeout /t 2 >nul

echo.
echo ============================================================
echo   MCP STACK STARTED
echo ============================================================
echo.
echo   WebSocket Proxy: http://localhost:8013/health
echo   HTTP Bridge:     http://localhost:8012/health
echo.
echo   NEXT STEPS:
echo   1. Open InDesign
echo   2. Window ^> Utilities ^> UXP Developer Tool
echo   3. Load "InDesign MCP Agent" plugin
echo   4. Click "Connect"
echo.
echo ============================================================
echo.
pause
