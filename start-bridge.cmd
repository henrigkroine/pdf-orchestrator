@echo off
REM Start HTTP-to-WebSocket Bridge Server (Port 8012)
REM Connects orchestrator to InDesign MCP proxy (Port 8013)

echo.
echo ============================================
echo  Starting HTTP Bridge Server (Port 8012)
echo ============================================
echo.
echo Prerequisites:
echo   1. Proxy must be running on port 8013
echo   2. InDesign must be open with UXP plugin
echo.
echo Starting bridge...
echo.

cd /d "%~dp0"
node http-bridge-server.js

pause
