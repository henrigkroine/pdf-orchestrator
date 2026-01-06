#!/bin/bash
# Test all exit codes for Gemini Vision CLI

echo "=========================================="
echo "Exit Code Verification Test Suite"
echo "=========================================="
echo ""

export DRY_RUN_GEMINI_VISION=1
SCRIPT="scripts/gemini-vision-review.js"
PDF="exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf"
JOB="example-jobs/tfu-aws-partnership-v2.json"

echo "Test 1: Exit code 0 (PASS - score >= threshold)"
node $SCRIPT --pdf "$PDF" --job-config "$JOB" --output "reports/gemini/exit-0.json" --min-score 0.90 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 0 ]; then
    echo "✅ PASS - Exit code: $CODE (expected: 0)"
else
    echo "❌ FAIL - Exit code: $CODE (expected: 0)"
fi
echo ""

echo "Test 2: Exit code 1 (FAIL - score < threshold)"
node $SCRIPT --pdf "$PDF" --job-config "$JOB" --output "reports/gemini/exit-1.json" --min-score 0.99 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 1 ]; then
    echo "✅ PASS - Exit code: $CODE (expected: 1)"
else
    echo "❌ FAIL - Exit code: $CODE (expected: 1)"
fi
echo ""

echo "Test 3: Exit code 3 (ERROR - missing PDF)"
node $SCRIPT --pdf "nonexistent.pdf" --job-config "$JOB" --output "reports/gemini/exit-3.json" --min-score 0.90 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 3 ]; then
    echo "✅ PASS - Exit code: $CODE (expected: 3)"
else
    echo "❌ FAIL - Exit code: $CODE (expected: 3)"
fi
echo ""

echo "=========================================="
echo "All exit code tests completed!"
echo "=========================================="
