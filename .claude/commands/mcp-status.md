# Check MCP Status

Check if the MCP servers are running and healthy.

Run these health checks:

```powershell
# Check WebSocket Proxy (8013)
try {
    $r = Invoke-RestMethod http://localhost:8013/health -TimeoutSec 2
    Write-Host "Proxy (8013): $($r.status)" -ForegroundColor Green
} catch {
    Write-Host "Proxy (8013): DOWN" -ForegroundColor Red
}

# Check HTTP Bridge (8012)
try {
    $r = Invoke-RestMethod http://localhost:8012/health -TimeoutSec 2
    Write-Host "Bridge (8012): $($r.status)" -ForegroundColor Green
} catch {
    Write-Host "Bridge (8012): DOWN" -ForegroundColor Red
}
```

If servers are down, run `/start-mcp` to start them.
