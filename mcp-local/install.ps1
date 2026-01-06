# Install HTTP API Bridge dependencies
Write-Host "Installing MCP HTTP Bridge (Port 8012)" -ForegroundColor Cyan

# Create virtual environment if it doesn't exist
if (-not (Test-Path ".\.venv")) {
    Write-Host "Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv .venv
}

# Install dependencies
Write-Host "Installing dependencies (FastAPI, uvicorn, websockets, httpx)..." -ForegroundColor Yellow
.\.venv\Scripts\pip install fastapi uvicorn websockets httpx --quiet --disable-pip-version-check

Write-Host "`n✅ Installation complete!" -ForegroundColor Green
Write-Host "`nTo start the bridge:" -ForegroundColor Cyan
Write-Host "  .\.venv\Scripts\uvicorn mcp_http_bridge:app --host 127.0.0.1 --port 8012" -ForegroundColor White
