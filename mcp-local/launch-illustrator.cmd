@echo off
REM Adobe Illustrator MCP Server Launcher
REM Project-local configuration for pdf-orchestrator

setlocal

REM Navigate to repo root
cd /d "%~dp0.."

REM Ensure logs directory exists
if not exist "logs\mcp" mkdir "logs\mcp"

REM Log startup
echo [%date% %time%] Starting Adobe Illustrator MCP server... >> logs\mcp\adobe-illustrator.log

REM Launch MCP server using repo's Python venv
.venv\Scripts\python.exe mcp-local\illustrator-mcp-server.py 2>> logs\mcp\adobe-illustrator.log
