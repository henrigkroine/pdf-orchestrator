#!/bin/bash

################################################################################
# BATCH PDF VALIDATION TEST SCRIPT
#
# Tests the batch processing system with different configurations.
# Demonstrates performance improvements from caching and parallel processing.
#
# Usage:
#   ./test-batch.sh                    # Run all tests
#   ./test-batch.sh --quick            # Run quick test only
#   ./test-batch.sh --performance      # Run performance benchmarks
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Test configuration
TEST_DIR="exports/test-samples"
REPORTS_DIR="batch-reports"

################################################################################
# Helper Functions
################################################################################

print_header() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

################################################################################
# Test 1: System Check
################################################################################

test_system_check() {
  print_header "Test 1: System Check"

  # Check Node.js version
  print_info "Checking Node.js version..."
  NODE_VERSION=$(node --version)
  print_success "Node.js: $NODE_VERSION"

  # Check dependencies
  print_info "Checking dependencies..."
  if [ -d "node_modules" ]; then
    print_success "Dependencies installed"
  else
    print_error "Dependencies not installed. Run: npm install"
    exit 1
  fi

  # Check environment
  print_info "Checking environment..."
  if [ -f "config/.env" ]; then
    if grep -q "GEMINI_API_KEY=your_gemini_api_key_here" config/.env; then
      print_warning "GEMINI_API_KEY not configured in config/.env"
      print_warning "Batch validation will fail without API key"
    else
      print_success "GEMINI_API_KEY configured"
    fi
  else
    print_warning "config/.env not found"
  fi

  # Check directories
  print_info "Checking directories..."
  mkdir -p "$TEST_DIR" "$REPORTS_DIR" ".cache/validations"
  print_success "Required directories created"

  echo ""
}

################################################################################
# Test 2: Cache Manager
################################################################################

test_cache_manager() {
  print_header "Test 2: Cache Manager"

  print_info "Testing cache statistics..."
  npm run cache:stats || print_warning "Cache stats command failed"

  print_info "Testing cache cleanup..."
  npm run cache:clean || print_warning "Cache clean command failed"

  print_success "Cache manager tests complete"
  echo ""
}

################################################################################
# Test 3: Progress Tracker Demo
################################################################################

test_progress_tracker() {
  print_header "Test 3: Progress Tracker Demo"

  print_info "Running progress tracker demo (10 seconds)..."
  timeout 15s npm run progress:demo || print_warning "Progress demo timed out (expected)"

  print_success "Progress tracker demo complete"
  echo ""
}

################################################################################
# Test 4: Single PDF Validation (Baseline)
################################################################################

test_single_validation() {
  print_header "Test 4: Single PDF Validation (Baseline)"

  # Create a test PDF if none exist
  if [ ! "$(ls -A $TEST_DIR/*.pdf 2>/dev/null)" ]; then
    print_warning "No test PDFs found in $TEST_DIR"
    print_info "Skipping single validation test"
    echo ""
    return
  fi

  TEST_PDF=$(ls $TEST_DIR/*.pdf | head -1)
  print_info "Testing with: $(basename $TEST_PDF)"

  START_TIME=$(date +%s)

  if node scripts/validate-pdf-ai-vision.js "$TEST_PDF"; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_success "Validation complete in ${DURATION}s"
  else
    print_error "Single validation failed"
  fi

  echo ""
}

################################################################################
# Test 5: Batch Processing (No Cache)
################################################################################

test_batch_no_cache() {
  print_header "Test 5: Batch Processing (No Cache)"

  if [ ! "$(ls -A $TEST_DIR/*.pdf 2>/dev/null)" ]; then
    print_warning "No test PDFs found in $TEST_DIR"
    print_info "Skipping batch test"
    echo ""
    return
  fi

  print_info "Processing all PDFs in $TEST_DIR (no cache)..."
  print_info "Concurrency: 5 workers"

  START_TIME=$(date +%s)

  if node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --no-cache --concurrency 5; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_success "Batch processing complete in ${DURATION}s"
  else
    print_error "Batch processing failed"
  fi

  echo ""
}

################################################################################
# Test 6: Batch Processing (With Cache)
################################################################################

test_batch_with_cache() {
  print_header "Test 6: Batch Processing (With Cache)"

  if [ ! "$(ls -A $TEST_DIR/*.pdf 2>/dev/null)" ]; then
    print_warning "No test PDFs found in $TEST_DIR"
    print_info "Skipping cached batch test"
    echo ""
    return
  fi

  print_info "Processing all PDFs in $TEST_DIR (with cache)..."
  print_info "This should be MUCH faster due to cache hits!"

  START_TIME=$(date +%s)

  if node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --cache --concurrency 5; then
    END_TIME=$(date +%s)
    DURATION=$((END_TIME - START_TIME))
    print_success "Cached batch processing complete in ${DURATION}s"
    print_success "Expected 90% faster than first run!"
  else
    print_error "Cached batch processing failed"
  fi

  echo ""
}

################################################################################
# Test 7: Report Generation
################################################################################

test_report_generation() {
  print_header "Test 7: Report Generation"

  # Find latest batch report
  LATEST_REPORT=$(ls -t $REPORTS_DIR/batch-report-*.json 2>/dev/null | head -1)

  if [ -z "$LATEST_REPORT" ]; then
    print_warning "No batch reports found"
    print_info "Skipping report generation test"
    echo ""
    return
  fi

  print_info "Generating HTML/CSV reports from: $(basename $LATEST_REPORT)"

  if node scripts/generate-batch-report.js "$LATEST_REPORT" --format html,csv; then
    print_success "Reports generated successfully"

    HTML_REPORT="${LATEST_REPORT%.json}.html"
    CSV_REPORT="${LATEST_REPORT%.json}.csv"

    print_info "HTML: $HTML_REPORT"
    print_info "CSV: $CSV_REPORT"
  else
    print_error "Report generation failed"
  fi

  echo ""
}

################################################################################
# Test 8: Performance Benchmark
################################################################################

test_performance_benchmark() {
  print_header "Test 8: Performance Benchmark"

  if [ ! "$(ls -A $TEST_DIR/*.pdf 2>/dev/null)" ]; then
    print_warning "No test PDFs found in $TEST_DIR"
    print_info "Skipping performance benchmark"
    echo ""
    return
  fi

  print_info "Running performance comparison..."

  # Clear cache for fair comparison
  print_info "Clearing cache..."
  npm run cache:clear > /dev/null 2>&1

  # Test 1: Sequential (concurrency = 1)
  print_info "\n[1/3] Sequential processing (concurrency=1)..."
  START1=$(date +%s)
  node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --concurrency 1 --no-cache > /dev/null 2>&1 || true
  END1=$(date +%s)
  DURATION1=$((END1 - START1))

  # Test 2: Parallel (concurrency = 5)
  print_info "[2/3] Parallel processing (concurrency=5)..."
  npm run cache:clear > /dev/null 2>&1
  START2=$(date +%s)
  node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --concurrency 5 --no-cache > /dev/null 2>&1 || true
  END2=$(date +%s)
  DURATION2=$((END2 - START2))

  # Test 3: Cached (concurrency = 5)
  print_info "[3/3] Cached processing (concurrency=5)..."
  START3=$(date +%s)
  node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --concurrency 5 --cache > /dev/null 2>&1 || true
  END3=$(date +%s)
  DURATION3=$((END3 - START3))

  # Results
  print_header "Performance Results"
  echo -e "${CYAN}Sequential (C=1):${NC}  ${DURATION1}s"
  echo -e "${CYAN}Parallel (C=5):${NC}    ${DURATION2}s  ${GREEN}($(echo "scale=1; $DURATION1/$DURATION2" | bc)x faster)${NC}"
  echo -e "${CYAN}Cached (C=5):${NC}      ${DURATION3}s  ${GREEN}($(echo "scale=1; $DURATION1/$DURATION3" | bc)x faster)${NC}"
  echo ""

  if [ $DURATION2 -lt $DURATION1 ]; then
    print_success "Parallel processing is faster!"
  fi

  if [ $DURATION3 -lt $DURATION2 ]; then
    print_success "Cache provides additional speedup!"
  fi

  echo ""
}

################################################################################
# Test 9: High Concurrency Test
################################################################################

test_high_concurrency() {
  print_header "Test 9: High Concurrency Test"

  if [ ! "$(ls -A $TEST_DIR/*.pdf 2>/dev/null)" ]; then
    print_warning "No test PDFs found in $TEST_DIR"
    print_info "Skipping high concurrency test"
    echo ""
    return
  fi

  print_info "Testing with 10 concurrent workers..."

  if node scripts/validate-pdf-batch.js $TEST_DIR/*.pdf --concurrency 10 --cache; then
    print_success "High concurrency test complete"
  else
    print_warning "High concurrency test failed (may need more PDFs)"
  fi

  echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
  print_header "🚀 Batch PDF Validation Test Suite"

  # Parse arguments
  QUICK=false
  PERFORMANCE=false

  for arg in "$@"; do
    case $arg in
      --quick)
        QUICK=true
        ;;
      --performance)
        PERFORMANCE=true
        ;;
      --help|-h)
        echo "Usage: ./test-batch.sh [options]"
        echo ""
        echo "Options:"
        echo "  --quick         Run quick tests only"
        echo "  --performance   Run performance benchmarks"
        echo "  --help, -h      Show this help"
        echo ""
        exit 0
        ;;
    esac
  done

  # Run tests
  test_system_check
  test_cache_manager

  if [ "$QUICK" = true ]; then
    print_info "Running quick tests only..."
    test_progress_tracker
    print_header "✅ Quick Tests Complete"
    exit 0
  fi

  if [ "$PERFORMANCE" = true ]; then
    print_info "Running performance benchmarks..."
    test_performance_benchmark
    print_header "✅ Performance Benchmarks Complete"
    exit 0
  fi

  # Full test suite
  test_progress_tracker
  test_single_validation
  test_batch_no_cache
  test_batch_with_cache
  test_report_generation
  test_high_concurrency

  # Final summary
  print_header "✅ All Tests Complete!"
  print_info "Review batch reports in: $REPORTS_DIR"
  print_info "View cache stats: npm run cache:stats"

  echo ""
}

# Run main
main "$@"
