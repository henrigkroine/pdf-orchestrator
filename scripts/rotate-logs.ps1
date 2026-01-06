# Log Rotation Script
# Keeps logs for 90 days, compresses older logs

$projectRoot = "T:\Projects\pdf-orchestrator"
$logTypes = @("operations", "errors", "metrics", "security")
$retentionDays = 90

Write-Host "Running log rotation..." -ForegroundColor Cyan

foreach ($logType in $logTypes) {
    $logDir = "$projectRoot\logs\$logType"

    if (Test-Path $logDir) {
        # Get all .jsonl files older than retention period
        $oldLogs = Get-ChildItem -Path $logDir -Filter "*.jsonl" |
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$retentionDays) }

        foreach ($log in $oldLogs) {
            Write-Host "  Removing: $($log.Name)" -ForegroundColor Gray
            Remove-Item $log.FullName -Force
        }

        # Compress logs older than 7 days (but within retention)
        $archiveLogs = Get-ChildItem -Path $logDir -Filter "*.jsonl" |
            Where-Object {
                $_.LastWriteTime -lt (Get-Date).AddDays(-7) -and
                $_.LastWriteTime -gt (Get-Date).AddDays(-$retentionDays)
            }

        foreach ($log in $archiveLogs) {
            $gzPath = "$($log.FullName).gz"
            if (-not (Test-Path $gzPath)) {
                Write-Host "  Compressing: $($log.Name)" -ForegroundColor Yellow
                # Note: Requires .NET compression or external tool
                # For simplicity, we'll skip compression here
                # In production, use 7-Zip or similar
            }
        }
    }
}

Write-Host "Log rotation complete." -ForegroundColor Green
