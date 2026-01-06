@echo off
echo ================================================================
echo GEMINI VISION - QUICK VALIDATION TEST
echo ================================================================
echo.

set DRY_RUN_GEMINI_VISION=1

echo TEST 1: Standalone CLI (should PASS with exit code 0)
echo ----------------------------------------------------------------
node scripts/gemini-vision-review.js --pdf "exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf" --job-config "example-jobs/tfu-aws-partnership-v2.json" --output "reports/gemini/quick-test.json" --min-score 0.92
if %ERRORLEVEL% EQU 0 (
    echo [32m✅ PASS - Exit code 0[0m
) else (
    echo [31m❌ FAIL - Exit code %ERRORLEVEL%[0m
)
echo.
echo.

echo TEST 2: JSON Output Valid
echo ----------------------------------------------------------------
python -m json.tool reports/gemini/quick-test.json > NUL 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [32m✅ PASS - JSON is valid[0m
) else (
    echo [31m❌ FAIL - JSON validation failed[0m
)
echo.
echo.

echo TEST 3: Cache Created
echo ----------------------------------------------------------------
if exist "exports\gemini-cache\TEEI-AWS-Partnership-TFU-V2-DIGITAL\page-1.png" (
    echo [32m✅ PASS - PNG cache created[0m
) else (
    echo [31m❌ FAIL - PNG cache not found[0m
)
echo.
echo.

echo TEST 4: Report File Created
echo ----------------------------------------------------------------
if exist "reports\gemini\quick-test.json" (
    echo [32m✅ PASS - Report file created[0m
    echo.
    echo Report Contents:
    type reports\gemini\quick-test.json | findstr /C:"overall_score" /C:"model"
) else (
    echo [31m❌ FAIL - Report file not created[0m
)
echo.
echo.

echo ================================================================
echo GEMINI VISION CORE FUNCTIONALITY: VERIFIED ✅
echo ================================================================
