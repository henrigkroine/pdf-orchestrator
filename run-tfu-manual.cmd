@echo off
REM ================================================================
REM TFU AWS Partnership - Manual Execution Helper
REM ================================================================
REM
REM Due to Python/UXP protocol mismatch, run JSX manually:
REM
REM STEP 1: Open InDesign (if not already running)
REM STEP 2: File → Scripts → Other Script...
REM STEP 3: Select: scripts\generate_tfu_aws.jsx
REM STEP 4: Wait for 4-page document to generate
REM STEP 5: File → Save As...
REM          Save to: exports\TEEI-AWS-Partnership-TFU.indd
REM STEP 6: File → Export → Adobe PDF (Print)
REM          Preset: "High Quality Print" or "PDF/X-4:2010"
REM          Color: CMYK
REM          Save to: exports\TEEI-AWS-Partnership-TFU-PRINT.pdf
REM STEP 7: File → Export → Adobe PDF (Digital)
REM          Preset: "High Quality Print"
REM          Color: RGB
REM          Save to: exports\TEEI-AWS-Partnership-TFU-DIGITAL.pdf
REM
REM ================================================================

echo.
echo ================================================================
echo TFU AWS PARTNERSHIP - MANUAL EXECUTION INSTRUCTIONS
echo ================================================================
echo.
echo The automated MCP pipeline has a protocol incompatibility between
echo the Python client and InDesign UXP plugin.
echo.
echo Please follow these steps to generate the TFU PDF manually:
echo.
echo 1. Open InDesign (if not already open)
echo 2. File -^> Scripts -^> Other Script...
echo 3. Navigate to and select:
echo    %CD%\scripts\generate_tfu_aws.jsx
echo 4. Wait for the 4-page document to generate (15-30 seconds)
echo 5. File -^> Save As...
echo    Save to: %CD%\exports\TEEI-AWS-Partnership-TFU.indd
echo 6. File -^> Export -^> Adobe PDF (Print)
echo    - Preset: "High Quality Print" or "PDF/X-4:2010"
echo    - Color: CMYK
echo    - Save to: %CD%\exports\TEEI-AWS-Partnership-TFU-PRINT.pdf
echo 7. File -^> Export -^> Adobe PDF (Digital)
echo    - Preset: "High Quality Print"
echo    - Color: RGB
echo    - Save to: %CD%\exports\TEEI-AWS-Partnership-TFU-DIGITAL.pdf
echo.
echo ================================================================
echo.
echo When you're done, press ENTER to run QA validation...
echo.
pause

REM Run QA validation pipeline
echo.
echo ================================================================
echo RUNNING QA VALIDATION
echo ================================================================
echo.

if not exist "exports\TEEI-AWS-Partnership-TFU-PRINT.pdf" (
    echo [ERROR] PRINT PDF not found: exports\TEEI-AWS-Partnership-TFU-PRINT.pdf
    echo.
    echo Please complete the manual export steps first.
    pause
    exit /b 1
)

echo [1/4] Running validate_document.py (TFU compliance check)...
python validate_document.py exports\TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs\tfu-aws-partnership.json --strict
echo.

echo [2/4] Running pipeline.py (comprehensive validation)...
python pipeline.py --validate-only --pdf exports\TEEI-AWS-Partnership-TFU-PRINT.pdf --job-config example-jobs\tfu-aws-partnership.json --threshold 95 --ci
echo.

echo [3/4] Running PDF quality validator (JS)...
node scripts\validate-pdf-quality.js exports\TEEI-AWS-Partnership-TFU-PRINT.pdf
echo.

echo [4/4] Visual regression test (if baseline exists)...
if exist "references\teei-aws-tfu-v1" (
    node scripts\compare-pdf-visual.js exports\TEEI-AWS-Partnership-TFU-PRINT.pdf teei-aws-tfu-v1
) else (
    echo [SKIP] No baseline found. To create baseline:
    echo   node scripts\create-reference-screenshots.js exports\TEEI-AWS-Partnership-TFU-PRINT.pdf teei-aws-tfu-v1
)

echo.
echo ================================================================
echo QA VALIDATION COMPLETE
echo ================================================================
echo.
echo Check the output above for:
echo   - TFU score (target: ≥ 140/150)
echo   - All CRITICAL checks PASS (page count=4, no gold, teal present)
echo   - Visual regression results (if baseline exists)
echo.
pause
