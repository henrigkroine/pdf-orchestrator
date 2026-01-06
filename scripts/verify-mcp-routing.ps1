# PDF Orchestrator MCP Routing Verification Script
# Purpose: Validate that premium PDF jobs route through MCP (not PDF Services)
# Usage: .\verify-mcp-routing.ps1

$ErrorActionPreference = "Stop"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PDF ORCHESTRATOR MCP ROUTING VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allGreen = $true
$issues = @()

# Check 1: MCP Proxy Health (port 8013)
Write-Host "[1/5] Checking MCP Proxy Health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8013/health" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✅ MCP Proxy is running on port 8013" -ForegroundColor Green
    } else {
        Write-Host "  ❌ MCP Proxy returned status $($response.StatusCode)" -ForegroundColor Red
        $issues += "MCP Proxy is not healthy (status: $($response.StatusCode))"
        $allGreen = $false
    }
} catch {
    Write-Host "  ❌ MCP Proxy is NOT running (cannot connect to localhost:8013)" -ForegroundColor Red
    $issues += "MCP Proxy is not running"
    $allGreen = $false
}

# Check 2: orchestrator.config.json exists
Write-Host "`n[2/5] Checking orchestrator.config.json..." -ForegroundColor Yellow
$scriptRoot = Split-Path -Parent (Split-Path -Parent $PSCommandPath)
$configPath = Join-Path $scriptRoot "config\orchestrator.config.json"
if (Test-Path $configPath) {
    Write-Host "  ✅ Config file exists: $configPath" -ForegroundColor Green

    # Check 3: Parse config and verify defaultWorker
    Write-Host "`n[3/5] Checking defaultWorker setting..." -ForegroundColor Yellow
    try {
        $config = Get-Content $configPath -Raw | ConvertFrom-Json
        $defaultWorker = $config.routing.defaultWorker

        if ($defaultWorker -eq "mcp") {
            Write-Host "  ✅ defaultWorker is set to 'mcp' (CORRECT for premium docs)" -ForegroundColor Green
        } elseif ($defaultWorker -eq "pdfServices") {
            Write-Host "  ⚠️  defaultWorker is 'pdfServices' (premium docs will use PDF Services by default)" -ForegroundColor Red
            $issues += "defaultWorker should be 'mcp' for premium documents (currently: '$defaultWorker')"
            $allGreen = $false
        } else {
            Write-Host "  ❌ defaultWorker has unexpected value: '$defaultWorker'" -ForegroundColor Red
            $issues += "defaultWorker has unexpected value: '$defaultWorker'"
            $allGreen = $false
        }

        # Check 4: Verify routing rules for premium job types
        Write-Host "`n[4/5] Checking routing rules..." -ForegroundColor Yellow
        $premiumTypes = @("partnership", "program", "report")
        $foundRules = @()

        foreach ($rule in $config.routing.rules) {
            $condition = $rule.condition
            foreach ($type in $premiumTypes) {
                if ($condition -like "*$type*") {
                    $foundRules += $type
                    if ($rule.worker -eq "mcp") {
                        Write-Host "  ✅ Found rule for '$type' routing to MCP" -ForegroundColor Green
                    } else {
                        Write-Host "  ⚠️  Found rule for '$type' but routes to '$($rule.worker)'" -ForegroundColor Yellow
                    }
                }
            }
        }

        $missingRules = $premiumTypes | Where-Object { $_ -notin $foundRules }
        if ($missingRules.Count -eq 0) {
            Write-Host "  ✅ All premium job types have routing rules" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Missing routing rules for: $($missingRules -join ', ')" -ForegroundColor Yellow
            Write-Host "     (These will use defaultWorker: $defaultWorker)" -ForegroundColor Gray
            if ($defaultWorker -ne "mcp") {
                $issues += "Missing MCP routing rules for: $($missingRules -join ', ')"
                $allGreen = $false
            }
        }

    } catch {
        Write-Host "  ❌ Failed to parse config file: $_" -ForegroundColor Red
        $issues += "Config file parse error: $_"
        $allGreen = $false
    }
} else {
    Write-Host "  ❌ Config file NOT found: $configPath" -ForegroundColor Red
    $issues += "orchestrator.config.json is missing"
    $allGreen = $false
}

# Check 5: InDesign MCP Agent connection
Write-Host "`n[5/7] Checking InDesign MCP Agent..." -ForegroundColor Yellow
$mcpLogPath = Join-Path $scriptRoot "logs\mcp\adobe-indesign.log"
if (Test-Path $mcpLogPath) {
    $lastLines = Get-Content $mcpLogPath -Tail 20 -ErrorAction SilentlyContinue
    $hasConnection = $lastLines | Where-Object { $_ -like "*connected*" -or $_ -like "*Connected with ID*" }

    if ($hasConnection) {
        Write-Host "  ✅ InDesign MCP Agent shows recent connection" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  InDesign MCP Agent log exists but no recent connection found" -ForegroundColor Yellow
        Write-Host "     (Check if InDesign is open and plugin is connected)" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  InDesign MCP log not found (has it been used yet?)" -ForegroundColor Yellow
    Write-Host "     Expected: $mcpLogPath" -ForegroundColor Gray
}

# Check 6: Font installation verification
Write-Host "`n[6/7] Checking TEEI brand fonts installation..." -ForegroundColor Yellow
$fontInstallerPath = Join-Path $scriptRoot "scripts\install-fonts.ps1"
$fontsSourcePath = Join-Path $scriptRoot "assets\fonts"
$fontsDestPath = "$env:WINDIR\Fonts"

if (Test-Path $fontInstallerPath) {
    Write-Host "  ✅ Font installer script found" -ForegroundColor Green

    # Check if fonts source directory exists
    if (Test-Path $fontsSourcePath) {
        $fontFiles = Get-ChildItem "$fontsSourcePath\*.ttf" -ErrorAction SilentlyContinue
        if ($fontFiles.Count -gt 0) {
            Write-Host "  ✅ Found $($fontFiles.Count) font files in source directory" -ForegroundColor Green

            # Check if any fonts are installed in Windows
            $installedCount = 0
            foreach ($font in $fontFiles) {
                $destPath = Join-Path $fontsDestPath $font.Name
                if (Test-Path $destPath) {
                    $installedCount++
                }
            }

            if ($installedCount -eq $fontFiles.Count) {
                Write-Host "  ✅ All TEEI brand fonts are installed ($installedCount/$($fontFiles.Count))" -ForegroundColor Green
            } elseif ($installedCount -gt 0) {
                Write-Host "  ⚠️  Partial font installation ($installedCount/$($fontFiles.Count) fonts installed)" -ForegroundColor Yellow
                $issues += "Only $installedCount of $($fontFiles.Count) TEEI fonts are installed"
                $allGreen = $false
            } else {
                Write-Host "  ❌ TEEI brand fonts are NOT installed" -ForegroundColor Red
                $issues += "TEEI brand fonts (Lora, Roboto) are not installed"
                $allGreen = $false
            }
        } else {
            Write-Host "  ⚠️  No font files found in source directory" -ForegroundColor Yellow
            Write-Host "     Expected: $fontsSourcePath\*.ttf" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  Fonts source directory not found" -ForegroundColor Yellow
        Write-Host "     Expected: $fontsSourcePath" -ForegroundColor Gray
    }
} else {
    Write-Host "  ⚠️  Font installer script not found" -ForegroundColor Yellow
    Write-Host "     Expected: $fontInstallerPath" -ForegroundColor Gray
}

# Check 7: World-class CLI verification (optional)
Write-Host "`n[7/7] Checking world-class CLI availability..." -ForegroundColor Yellow
$worldClassCliPath = Join-Path $scriptRoot "world_class_cli.py"

if (Test-Path $worldClassCliPath) {
    Write-Host "  ✅ World-class CLI found: $worldClassCliPath" -ForegroundColor Green
    Write-Host "     Available for premium document generation" -ForegroundColor Gray
} else {
    Write-Host "  ℹ️  World-class CLI not found (optional feature)" -ForegroundColor Gray
    Write-Host "     Not required for standard MCP routing" -ForegroundColor Gray
}

# Final Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

if ($allGreen) {
    Write-Host "🟢 ALL CHECKS PASSED - MCP ROUTING IS CONFIGURED CORRECTLY" -ForegroundColor Green
    Write-Host "`nYour orchestrator will route premium documents through MCP!" -ForegroundColor Green
} else {
    Write-Host "🔴 ISSUES FOUND - MCP ROUTING NEEDS FIXES" -ForegroundColor Red
    Write-Host "`nIssues detected:" -ForegroundColor Yellow
    foreach ($issue in $issues) {
        Write-Host "  • $issue" -ForegroundColor Red
    }

    Write-Host "`n📝 RECOMMENDED FIXES:" -ForegroundColor Yellow
    Write-Host ""

    if ($issues -like "*MCP Proxy*") {
        Write-Host "1. START MCP PROXY:" -ForegroundColor Cyan
        Write-Host "   cd '$scriptRoot\adb-mcp\adb-proxy-socket'" -ForegroundColor Gray
        Write-Host "   node proxy.js" -ForegroundColor Gray
        Write-Host "   (Keep terminal window open!)" -ForegroundColor Gray
        Write-Host ""
    }

    if ($issues -like "*defaultWorker*") {
        Write-Host "2. FIX orchestrator.config.json:" -ForegroundColor Cyan
        Write-Host "   Open: $configPath" -ForegroundColor Gray
        Write-Host "   Change: `"defaultWorker`": `"pdfServices`"" -ForegroundColor Red
        Write-Host "   To:     `"defaultWorker`": `"mcp`"" -ForegroundColor Green
        Write-Host ""
    }

    if ($issues -like "*routing rules*") {
        Write-Host "3. ADD ROUTING RULES for premium job types:" -ForegroundColor Cyan
        Write-Host "   Add to routing.rules array in orchestrator.config.json:" -ForegroundColor Gray
        Write-Host @"
   {
     "condition": "jobType === 'partnership' || jobType === 'program' || jobType === 'report'",
     "worker": "mcp",
     "reason": "Premium documents require MCP for quality control"
   }
"@ -ForegroundColor Gray
        Write-Host ""
    }

    if ($issues -like "*TEEI brand fonts*" -or $issues -like "*font*") {
        Write-Host "4. INSTALL TEEI BRAND FONTS:" -ForegroundColor Cyan
        Write-Host "   Run the font installer (requires Administrator):" -ForegroundColor Gray
        Write-Host "   cd '$scriptRoot\scripts'" -ForegroundColor Gray
        Write-Host "   .\install-fonts.ps1" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Then RESTART INDESIGN to load new fonts!" -ForegroundColor Yellow
        Write-Host ""
    }

    Write-Host "📖 For detailed guidance, see: $scriptRoot\QUICK-START-MCP-ROUTING.md" -ForegroundColor Cyan
}

Write-Host "`n========================================`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($allGreen) {
    exit 0
} else {
    exit 1
}
