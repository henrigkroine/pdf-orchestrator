#!/bin/bash

echo "================================================================================"
echo "TEEI BRAND COMPLIANCE ENFORCEMENT SYSTEM - VERIFICATION"
echo "================================================================================"
echo ""

# Color formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: Check Python implementation exists
echo "Test 1: Python Implementation"
echo "--------------------------------------------------------------------------------"
if [ -f "brand_compliance_enforcer.py" ]; then
    echo -e "${GREEN}✓ PASS${NC} - brand_compliance_enforcer.py exists"
    ((PASS++))

    # Count lines
    LINES=$(wc -l < brand_compliance_enforcer.py)
    echo "  Lines of code: $LINES"
else
    echo -e "${RED}✗ FAIL${NC} - brand_compliance_enforcer.py not found"
    ((FAIL++))
fi
echo ""

# Test 2: Check JavaScript implementation exists
echo "Test 2: JavaScript Implementation"
echo "--------------------------------------------------------------------------------"
if [ -f "brand-enforcer.js" ]; then
    echo -e "${GREEN}✓ PASS${NC} - brand-enforcer.js exists"
    ((PASS++))

    # Count lines
    LINES=$(wc -l < brand-enforcer.js)
    echo "  Lines of code: $LINES"
else
    echo -e "${RED}✗ FAIL${NC} - brand-enforcer.js not found"
    ((FAIL++))
fi
echo ""

# Test 3: Check configuration file
echo "Test 3: Brand Compliance Configuration"
echo "--------------------------------------------------------------------------------"
if [ -f "config/brand-compliance-config.json" ]; then
    echo -e "${GREEN}✓ PASS${NC} - config/brand-compliance-config.json exists"
    ((PASS++))

    # Validate JSON
    if python3 -c "import json; json.load(open('config/brand-compliance-config.json'))" 2>/dev/null; then
        echo -e "${GREEN}✓ PASS${NC} - JSON is valid"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} - JSON is invalid"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ FAIL${NC} - Configuration file not found"
    ((FAIL++))
fi
echo ""

# Test 4: Check documentation
echo "Test 4: Documentation Files"
echo "--------------------------------------------------------------------------------"
DOC_FILES=(
    "BRAND-ENFORCEMENT-SYSTEM.md"
    "TECHNICAL-SPECIFICATION.md"
    "ENFORCEMENT-QUICK-START.md"
    "BRAND-ENFORCEMENT-README.md"
)

for doc in "${DOC_FILES[@]}"; do
    if [ -f "$doc" ]; then
        LINES=$(wc -l < "$doc")
        echo -e "${GREEN}✓ PASS${NC} - $doc exists ($LINES lines)"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} - $doc not found"
        ((FAIL++))
    fi
done
echo ""

# Test 5: Check example integration
echo "Test 5: Example Integration"
echo "--------------------------------------------------------------------------------"
if [ -f "create_with_enforcement.py" ]; then
    echo -e "${GREEN}✓ PASS${NC} - create_with_enforcement.py exists"
    ((PASS++))
else
    echo -e "${RED}✗ FAIL${NC} - Example integration not found"
    ((FAIL++))
fi
echo ""

# Test 6: Run Python enforcement tests
echo "Test 6: Python Enforcement Tests"
echo "--------------------------------------------------------------------------------"
if python3 brand_compliance_enforcer.py > /tmp/python_test_output.txt 2>&1; then
    # Check for expected outputs
    if grep -q "FORBIDDEN COLOR: Copper" /tmp/python_test_output.txt && \
       grep -q "FORBIDDEN FONT: Arial" /tmp/python_test_output.txt && \
       grep -q "PLACEHOLDER DETECTED" /tmp/python_test_output.txt && \
       grep -q "TEXT CUTOFF DETECTED" /tmp/python_test_output.txt; then
        echo -e "${GREEN}✓ PASS${NC} - All enforcement tests passed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠ PARTIAL${NC} - Some tests missing expected output"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ FAIL${NC} - Python tests failed to run"
    ((FAIL++))
fi
echo ""

# Test 7: Run JavaScript enforcement tests
echo "Test 7: JavaScript Enforcement Tests"
echo "--------------------------------------------------------------------------------"
if node brand-enforcer.js > /tmp/js_test_output.txt 2>&1; then
    # Check for expected outputs
    if grep -q "FORBIDDEN COLOR: Copper" /tmp/js_test_output.txt && \
       grep -q "FORBIDDEN FONT: Arial" /tmp/js_test_output.txt && \
       grep -q "PLACEHOLDER DETECTED" /tmp/js_test_output.txt && \
       grep -q "TEXT CUTOFF DETECTED" /tmp/js_test_output.txt; then
        echo -e "${GREEN}✓ PASS${NC} - All enforcement tests passed"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠ PARTIAL${NC} - Some tests missing expected output"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗ FAIL${NC} - JavaScript tests failed to run"
    ((FAIL++))
fi
echo ""

# Test 8: Verify enforcement engines
echo "Test 8: Enforcement Engines"
echo "--------------------------------------------------------------------------------"
ENGINES=(
    "ColorEnforcer"
    "TypographyEnforcer"
    "SpacingEnforcer"
    "ContentEnforcer"
    "LogoEnforcer"
)

for engine in "${ENGINES[@]}"; do
    if grep -q "class $engine" brand_compliance_enforcer.py; then
        echo -e "${GREEN}✓ PASS${NC} - $engine found in Python"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} - $engine not found in Python"
        ((FAIL++))
    fi
done
echo ""

# Test 9: Verify configuration completeness
echo "Test 9: Configuration Completeness"
echo "--------------------------------------------------------------------------------"
CONFIG_SECTIONS=(
    "\"colors\""
    "\"typography\""
    "\"spacing\""
    "\"logo\""
    "\"photography\""
    "\"brandVoice\""
)

for section in "${CONFIG_SECTIONS[@]}"; do
    if grep -q "$section" config/brand-compliance-config.json; then
        echo -e "${GREEN}✓ PASS${NC} - $section section exists"
        ((PASS++))
    else
        echo -e "${RED}✗ FAIL${NC} - $section section missing"
        ((FAIL++))
    fi
done
echo ""

# Test 10: System integration check
echo "Test 10: System Integration"
echo "--------------------------------------------------------------------------------"
# Count total lines of code and documentation
TOTAL_LINES=$(wc -l brand_compliance_enforcer.py brand-enforcer.js BRAND-ENFORCEMENT-SYSTEM.md TECHNICAL-SPECIFICATION.md create_with_enforcement.py ENFORCEMENT-QUICK-START.md 2>/dev/null | tail -1 | awk '{print $1}')

if [ "$TOTAL_LINES" -gt 4000 ]; then
    echo -e "${GREEN}✓ PASS${NC} - System is comprehensive ($TOTAL_LINES lines)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠ WARNING${NC} - System may be incomplete ($TOTAL_LINES lines)"
fi
echo ""

# Final Summary
echo "================================================================================"
echo "VERIFICATION SUMMARY"
echo "================================================================================"
echo ""
echo "Tests Passed: $PASS"
echo "Tests Failed: $FAIL"
echo ""

TOTAL=$((PASS + FAIL))
if [ $TOTAL -gt 0 ]; then
    PERCENT=$((PASS * 100 / TOTAL))
    echo "Success Rate: $PERCENT%"
fi
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
    echo ""
    echo "🌟 Brand Compliance Enforcement System is ready for production!"
    echo ""
    echo "Next steps:"
    echo "  1. Read quick start: cat ENFORCEMENT-QUICK-START.md"
    echo "  2. Try example: python3 create_with_enforcement.py"
    echo "  3. Review full docs: cat BRAND-ENFORCEMENT-SYSTEM.md"
    exit 0
else
    echo -e "${RED}✗ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please review the failures above and fix before using in production."
    exit 1
fi
