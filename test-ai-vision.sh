#!/bin/bash
# Quick Test Script for AI Vision QA
# This script helps you test the AI Vision validator

echo "🤖 AI VISION QA - QUICK TEST SETUP"
echo "========================================"
echo ""

# Check if API key is configured
if grep -q "your_gemini_api_key_here" config/.env; then
    echo "❌ Gemini API key not configured yet!"
    echo ""
    echo "TO GET STARTED:"
    echo "1. Get FREE API key: https://makersuite.google.com/app/apikey"
    echo "2. Edit config/.env and replace:"
    echo "   GEMINI_API_KEY=your_gemini_api_key_here"
    echo "   with:"
    echo "   GEMINI_API_KEY=your_actual_key_here"
    echo ""
    echo "3. Then run this script again!"
    echo ""
    exit 1
fi

echo "✅ API key configured!"
echo ""

# Find test image
TEST_IMAGE="exports/visual-analysis/together-ukraine-main/page-1-annotated.png"

if [ ! -f "$TEST_IMAGE" ]; then
    echo "❌ Test image not found: $TEST_IMAGE"
    echo "Looking for other test files..."
    TEST_IMAGE=$(find exports/ -name "*.png" -o -name "*.pdf" | head -1)

    if [ -z "$TEST_IMAGE" ]; then
        echo "❌ No test files found in exports/"
        exit 1
    fi
fi

echo "📄 Test file: $TEST_IMAGE"
echo ""
echo "🚀 Running AI Vision Validator..."
echo "========================================"
echo ""

# Run the validator
node scripts/validate-pdf-ai-vision.js "$TEST_IMAGE"

EXIT_CODE=$?

echo ""
echo "========================================"
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ TEST PASSED!"
else
    echo "❌ TEST FAILED (see report for details)"
fi

echo ""
echo "📊 Check full report in: exports/ai-validation-reports/"
