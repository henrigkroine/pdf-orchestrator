#!/bin/bash
# Full Gemini Vision Layer 4 Integration Test
# Tests: Standalone CLI + Full Pipeline + All Exit Codes

export DRY_RUN_GEMINI_VISION=1
PDF="exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf"
JOB_V2="example-jobs/tfu-aws-partnership-v2.json"
JOB_V1="example-jobs/tfu-aws-partnership.json"

echo "=================================================================="
echo "GEMINI VISION LAYER 4 - FULL INTEGRATION TEST"
echo "=================================================================="
echo ""
echo "Test Suite: 10 comprehensive tests"
echo "Mode: DRY_RUN (no API key required)"
echo "PDF: TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf"
echo ""
echo "=================================================================="
echo ""

PASSED=0
FAILED=0

# Helper function
test_case() {
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "TEST $1: $2"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

pass() {
    echo "✅ PASS: $1"
    ((PASSED++))
    echo ""
}

fail() {
    echo "❌ FAIL: $1"
    ((FAILED++))
    echo ""
}

# Test 1: CLI with passing score
test_case 1 "Standalone CLI - Passing Score (0.92 threshold)"
node scripts/gemini-vision-review.js \
    --pdf "$PDF" \
    --job-config "$JOB_V2" \
    --output "reports/gemini/full-test-pass.json" \
    --min-score 0.92 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 0 ]; then
    pass "Exit code 0, score should be 0.93 ≥ 0.92"
else
    fail "Expected exit code 0, got $CODE"
fi

# Test 2: CLI with failing score
test_case 2 "Standalone CLI - Failing Score (0.95 threshold)"
node scripts/gemini-vision-review.js \
    --pdf "$PDF" \
    --job-config "$JOB_V2" \
    --output "reports/gemini/full-test-fail.json" \
    --min-score 0.95 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 1 ]; then
    pass "Exit code 1, score 0.93 < 0.95 threshold"
else
    fail "Expected exit code 1, got $CODE"
fi

# Test 3: CLI with missing PDF
test_case 3 "Standalone CLI - Error Handling (missing PDF)"
node scripts/gemini-vision-review.js \
    --pdf "nonexistent.pdf" \
    --job-config "$JOB_V2" \
    --output "reports/gemini/full-test-error.json" \
    --min-score 0.90 > /dev/null 2>&1
CODE=$?
if [ $CODE -eq 3 ]; then
    pass "Exit code 3, infrastructure error detected"
else
    fail "Expected exit code 3, got $CODE"
fi

# Test 4: JSON output validation
test_case 4 "JSON Output Validation"
if [ -f "reports/gemini/full-test-pass.json" ]; then
    python -m json.tool "reports/gemini/full-test-pass.json" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        pass "JSON is valid and well-formed"
    else
        fail "JSON validation failed"
    fi
else
    fail "JSON file not found"
fi

# Test 5: JSON schema validation
test_case 5 "JSON Schema Completeness"
if [ -f "reports/gemini/full-test-pass.json" ]; then
    # Check for required fields
    REQUIRED_FIELDS=("model" "overall_score" "summary" "page_scores" "recommendations_md" "requires_changes" "metadata")
    ALL_PRESENT=true

    for field in "${REQUIRED_FIELDS[@]}"; do
        grep -q "\"$field\"" "reports/gemini/full-test-pass.json"
        if [ $? -ne 0 ]; then
            ALL_PRESENT=false
            echo "  Missing field: $field"
        fi
    done

    if [ "$ALL_PRESENT" = true ]; then
        pass "All required fields present (model, overall_score, summary, page_scores, etc.)"
    else
        fail "Some required fields missing"
    fi
else
    fail "JSON file not found"
fi

# Test 6: Cache generation
test_case 6 "PNG Cache Generation"
CACHE_DIR="exports/gemini-cache/TEEI-AWS-Partnership-TFU-V2-DIGITAL"
if [ -d "$CACHE_DIR" ]; then
    PNG_COUNT=$(ls -1 "$CACHE_DIR"/page-*.png 2>/dev/null | wc -l)
    if [ $PNG_COUNT -eq 4 ]; then
        pass "4 PNG files cached successfully"
    else
        fail "Expected 4 PNG files, found $PNG_COUNT"
    fi
else
    fail "Cache directory not created"
fi

# Test 7: Cache metadata
test_case 7 "Cache Metadata Validation"
META_FILE="$CACHE_DIR/cache-meta.json"
if [ -f "$META_FILE" ]; then
    python -m json.tool "$META_FILE" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        # Check for required metadata fields
        grep -q "pdfHash" "$META_FILE" && grep -q "pageCount" "$META_FILE"
        if [ $? -eq 0 ]; then
            pass "Cache metadata valid with pdfHash and pageCount"
        else
            fail "Cache metadata missing required fields"
        fi
    else
        fail "Cache metadata is not valid JSON"
    fi
else
    fail "cache-meta.json not found"
fi

# Test 8: Cache reuse
test_case 8 "PNG Cache Reuse"
# Delete cache first
rm -rf "$CACHE_DIR"
# First run - should generate
node scripts/gemini-vision-review.js \
    --pdf "$PDF" \
    --job-config "$JOB_V2" \
    --output "reports/gemini/cache-test-1.json" \
    --min-score 0.90 2>&1 | grep -q "Generating new images"
GENERATED=$?

# Second run - should reuse
node scripts/gemini-vision-review.js \
    --pdf "$PDF" \
    --job-config "$JOB_V2" \
    --output "reports/gemini/cache-test-2.json" \
    --min-score 0.90 2>&1 | grep -q "Using cached images"
REUSED=$?

if [ $GENERATED -eq 0 ] && [ $REUSED -eq 0 ]; then
    pass "First run generates, second run reuses cache"
else
    fail "Cache reuse not working (generated=$GENERATED, reused=$REUSED)"
fi

# Test 9: Full Pipeline - Gemini Enabled
test_case 9 "Full Pipeline Integration - Gemini Enabled (V2)"
echo "Running: python pipeline.py --validate-only --pdf $PDF --job-config $JOB_V2"
echo "(This may take 20-30 seconds for all 4 layers...)"
echo ""

python pipeline.py --validate-only \
    --pdf "$PDF" \
    --job-config "$JOB_V2" 2>&1 | tee /tmp/pipeline-test-v2.log > /dev/null

# Check if all 4 layers executed
grep -q "Running Gemini Vision review (Layer 4)" /tmp/pipeline-test-v2.log
LAYER4_FOUND=$?

grep -q "Gemini Vision review PASSED" /tmp/pipeline-test-v2.log
LAYER4_PASSED=$?

if [ $LAYER4_FOUND -eq 0 ] && [ $LAYER4_PASSED -eq 0 ]; then
    pass "Layer 4 executed and passed in pipeline"
else
    fail "Layer 4 not found or failed (found=$LAYER4_FOUND, passed=$LAYER4_PASSED)"
fi

# Test 10: Full Pipeline - Gemini Disabled
test_case 10 "Full Pipeline Integration - Gemini Disabled (V1)"
echo "Running: python pipeline.py --validate-only --pdf exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf --job-config $JOB_V1"
echo "(Should skip Layer 4...)"
echo ""

python pipeline.py --validate-only \
    --pdf "exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf" \
    --job-config "$JOB_V1" 2>&1 | tee /tmp/pipeline-test-v1.log > /dev/null

# Check if Layer 4 was skipped
grep -q "Skipped (disabled in job config)" /tmp/pipeline-test-v1.log
SKIPPED=$?

if [ $SKIPPED -eq 0 ]; then
    pass "Layer 4 skipped when disabled (backward compatible)"
else
    fail "Layer 4 not skipped properly"
fi

# Final Summary
echo ""
echo "=================================================================="
echo "FULL TEST RESULTS"
echo "=================================================================="
echo ""
echo "Total Tests: 10"
echo "Passed:      $PASSED ✅"
echo "Failed:      $FAILED ❌"
echo ""
if [ $FAILED -eq 0 ]; then
    echo "=================================================================="
    echo "🎉 ALL TESTS PASSED! PRODUCTION READY! 🚀"
    echo "=================================================================="
    exit 0
else
    echo "=================================================================="
    echo "⚠️  SOME TESTS FAILED - REVIEW ABOVE OUTPUT"
    echo "=================================================================="
    exit 1
fi
