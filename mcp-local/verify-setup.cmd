@echo off
REM Verification script for Adobe MCP servers
REM Tests that all components are properly installed and configured

echo.
echo ========================================
echo Adobe MCP Server Verification
echo ========================================
echo.

REM Navigate to repo root
cd /d "%~dp0.."

echo [1/6] Checking Python installation...
if not exist ".venv\Scripts\python.exe" (
    echo ERROR: Python venv not found at .venv\Scripts\python.exe
    exit /b 1
)
.venv\Scripts\python.exe --version
echo OK: Python found
echo.

echo [2/6] Checking MCP SDK installation...
.venv\Scripts\python.exe -c "from mcp.server.fastmcp import FastMCP; print('OK: MCP SDK installed')" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MCP SDK not installed
    echo Run: .venv\Scripts\pip.exe install mcp
    exit /b 1
)
echo.

echo [3/6] Checking python-socketio installation...
.venv\Scripts\python.exe -c "import socketio; print('OK: python-socketio installed')" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: python-socketio not installed
    echo Run: .venv\Scripts\pip.exe install python-socketio
    exit /b 1
)
echo.

echo [4/6] Checking adb-mcp modules...
.venv\Scripts\python.exe -c "import sys; sys.path.insert(0, 'adb-mcp/mcp'); import core, socket_client, logger; print('OK: adb-mcp modules found')" 2>&1
if %errorlevel% neq 0 (
    echo ERROR: adb-mcp modules not found or have errors
    exit /b 1
)
echo.

echo [5/6] Verifying InDesign MCP server syntax...
.venv\Scripts\python.exe -m py_compile mcp-local\indesign-mcp-server.py 2>&1
if %errorlevel% neq 0 (
    echo ERROR: InDesign server has syntax errors
    exit /b 1
)
echo OK: InDesign server syntax valid
echo.

echo [6/6] Verifying Illustrator MCP server syntax...
.venv\Scripts\python.exe -m py_compile mcp-local\illustrator-mcp-server.py 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Illustrator server has syntax errors
    exit /b 1
)
echo OK: Illustrator server syntax valid
echo.

echo ========================================
echo All checks passed!
echo ========================================
echo.
echo Next steps:
echo 1. Start the Adobe Command Proxy on localhost:8013
echo 2. Launch Adobe InDesign or Illustrator
echo 3. Install and activate the UXP plugins
echo 4. Restart Claude Code to connect to the MCP servers
echo.
echo Logs will be written to:
echo   - logs\mcp\adobe-indesign.log
echo   - logs\mcp\adobe-illustrator.log
echo.

pause
