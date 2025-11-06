# Install TEEI Brand Fonts for InDesign Automation
# This script auto-installs Lora and Roboto fonts required for TEEI brand compliance
# Run this before executing any InDesign automation to ensure fonts are available

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEEI Brand Fonts Installation Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Font installation may fail without admin rights." -ForegroundColor Yellow
    Write-Host "   To run as admin: Right-click PowerShell → Run as Administrator" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        Write-Host "❌ Installation cancelled." -ForegroundColor Red
        exit 1
    }
}

# Define paths
$fontsSource = "T:\Projects\pdf-orchestrator\assets\fonts"
$fontsDestination = "$env:WINDIR\Fonts"
$fontRegistryPath = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts"

# Verify source directory exists
if (-not (Test-Path $fontsSource)) {
    Write-Host "❌ ERROR: Fonts directory not found at: $fontsSource" -ForegroundColor Red
    Write-Host "   Please ensure fonts are copied to assets/fonts first." -ForegroundColor Red
    exit 1
}

# Get all .ttf files
$fontFiles = Get-ChildItem "$fontsSource\*.ttf"

if ($fontFiles.Count -eq 0) {
    Write-Host "❌ ERROR: No .ttf font files found in $fontsSource" -ForegroundColor Red
    exit 1
}

Write-Host "Found $($fontFiles.Count) font files to install" -ForegroundColor Green
Write-Host ""

$installedCount = 0
$skippedCount = 0
$failedCount = 0

foreach ($font in $fontFiles) {
    $fontName = $font.Name
    $fontDestPath = Join-Path $fontsDestination $fontName

    # Check if font already exists
    if (Test-Path $fontDestPath) {
        Write-Host "⏭️  SKIP: $fontName (already installed)" -ForegroundColor Gray
        $skippedCount++
        continue
    }

    try {
        # Copy font file to Windows Fonts directory
        Copy-Item $font.FullName $fontDestPath -Force -ErrorAction Stop

        # Register font in Windows Registry
        # Extract font display name from file (simplified - uses filename)
        $fontDisplayName = $fontName -replace '\.ttf$', ' (TrueType)'

        # Add to registry (may fail without admin rights, but font will still work)
        try {
            New-ItemProperty -Path $fontRegistryPath -Name $fontDisplayName -Value $fontName -PropertyType String -Force -ErrorAction Stop | Out-Null
        } catch {
            # Registry write failed, but file copy succeeded - font should still work
        }

        Write-Host "✅ INSTALLED: $fontName" -ForegroundColor Green
        $installedCount++

    } catch {
        Write-Host "❌ FAILED: $fontName - $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Installed: $installedCount" -ForegroundColor Green
Write-Host "⏭️  Skipped: $skippedCount (already present)" -ForegroundColor Gray
Write-Host "❌ Failed: $failedCount" -ForegroundColor Red
Write-Host ""

if ($installedCount -gt 0) {
    Write-Host "⚠️  IMPORTANT: Restart InDesign to load new fonts!" -ForegroundColor Yellow
    Write-Host "   Close all InDesign instances and relaunch before running automation." -ForegroundColor Yellow
}

if ($failedCount -gt 0) {
    Write-Host "⚠️  Some fonts failed to install. Try running as Administrator." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Font installation complete!" -ForegroundColor Green
Write-Host "   TEEI brand fonts (Lora, Roboto) are now available for InDesign automation." -ForegroundColor Green
