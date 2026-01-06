/**
 * Test script for experiment mode components
 * Tests winner selection logic without running full pipeline
 */

const WinnerSelector = require('./winner-selector');

// Mock variant results
const mockVariantResults = [
  {
    variant: 1,
    description: 'Classic Layout (Nordshore primary)',
    jobId: 'aws-partnership-variant-1',
    success: true,
    scorecard: {
      totalScore: 128,
      maxScore: 150,
      tfuScore: 23,
      tfuMaxScore: 25,
      visualDiffPercent: 3.2,
      passed: true
    },
    score: 128,
    tfuScore: 23,
    visualDiff: 3.2,
    passed: true,
    duration: 45.3
  },
  {
    variant: 2,
    description: 'Modern Layout (Sky accents)',
    jobId: 'aws-partnership-variant-2',
    success: true,
    scorecard: {
      totalScore: 135,
      maxScore: 150,
      tfuScore: 24,
      tfuMaxScore: 25,
      visualDiffPercent: 2.1,
      passed: true
    },
    score: 135,
    tfuScore: 24,
    visualDiff: 2.1,
    passed: true,
    duration: 43.8
  },
  {
    variant: 3,
    description: 'Bold Layout (Gold highlights)',
    jobId: 'aws-partnership-variant-3',
    success: true,
    scorecard: {
      totalScore: 122,
      maxScore: 150,
      tfuScore: 22,
      tfuMaxScore: 25,
      visualDiffPercent: 4.8,
      passed: true
    },
    score: 122,
    tfuScore: 22,
    visualDiff: 4.8,
    passed: true,
    duration: 47.2
  }
];

// Test winner selection
console.log('\n=== Testing Winner Selection ===\n');

const selector = new WinnerSelector();

// Test 1: Default weights
console.log('Test 1: Default Weights');
console.log('─'.repeat(80));
const winner1 = selector.selectWinner(mockVariantResults);
console.log(`\nWinner: Variant ${winner1.variant} (${winner1.description})`);
console.log(`Composite Score: ${winner1.compositeScore.toFixed(3)}`);
console.log(`Reason: ${winner1.reason}`);
console.log('\n');

// Print comparison table
selector.printComparisonTable(winner1.allScores);

// Test 2: Quality-focused weights
console.log('\n\nTest 2: Quality-Focused Weights');
console.log('─'.repeat(80));
const qualityWeights = {
  totalScore: 0.8,
  tfuScore: 0.1,
  visualDiff: 0.05,
  passed: 0.05
};
const winner2 = selector.selectWinner(mockVariantResults, qualityWeights);
console.log(`\nWinner: Variant ${winner2.variant} (${winner2.description})`);
console.log(`Composite Score: ${winner2.compositeScore.toFixed(3)}`);
console.log(`Reason: ${winner2.reason}`);
console.log('\n');
selector.printComparisonTable(winner2.allScores);

// Test 3: Brand-focused weights
console.log('\n\nTest 3: Brand-Focused Weights');
console.log('─'.repeat(80));
const brandWeights = {
  totalScore: 0.3,
  tfuScore: 0.6,
  visualDiff: 0.05,
  passed: 0.05
};
const winner3 = selector.selectWinner(mockVariantResults, brandWeights);
console.log(`\nWinner: Variant ${winner3.variant} (${winner3.description})`);
console.log(`Composite Score: ${winner3.compositeScore.toFixed(3)}`);
console.log(`Reason: ${winner3.reason}`);
console.log('\n');
selector.printComparisonTable(winner3.allScores);

// Test 4: Consistency-focused weights
console.log('\n\nTest 4: Consistency-Focused Weights');
console.log('─'.repeat(80));
const consistencyWeights = {
  totalScore: 0.3,
  tfuScore: 0.2,
  visualDiff: 0.45,
  passed: 0.05
};
const winner4 = selector.selectWinner(mockVariantResults, consistencyWeights);
console.log(`\nWinner: Variant ${winner4.variant} (${winner4.description})`);
console.log(`Composite Score: ${winner4.compositeScore.toFixed(3)}`);
console.log(`Reason: ${winner4.reason}`);
console.log('\n');
selector.printComparisonTable(winner4.allScores);

// Test 5: Tied variants
console.log('\n\nTest 5: Testing Tie Resolution');
console.log('─'.repeat(80));
const tiedVariants = [
  {
    variant: 1,
    description: 'Variant A',
    jobId: 'test-variant-1',
    success: true,
    scorecard: {},
    score: 130,
    tfuScore: 23,
    visualDiff: 3.0,
    passed: true,
    duration: 45.0
  },
  {
    variant: 2,
    description: 'Variant B (same score)',
    jobId: 'test-variant-2',
    success: true,
    scorecard: {},
    score: 130,
    tfuScore: 23,
    visualDiff: 3.0,
    passed: true,
    duration: 40.0  // Faster execution
  }
];
const winner5 = selector.selectWinner(tiedVariants);
console.log(`\nWinner: Variant ${winner5.variant} (${winner5.description})`);
console.log(`Composite Score: ${winner5.compositeScore.toFixed(3)}`);
console.log(`Tiebreaker: ${winner5.tiebreaker}`);
console.log('\n');
selector.printComparisonTable(winner5.allScores);

// Test 6: Failed variants
console.log('\n\nTest 6: Handling Failed Variants');
console.log('─'.repeat(80));
const mixedVariants = [
  {
    variant: 1,
    description: 'Failed Variant',
    jobId: 'test-variant-1',
    success: false,
    error: 'Export failed',
    score: 0,
    tfuScore: 0,
    visualDiff: 100,
    passed: false
  },
  {
    variant: 2,
    description: 'Successful Variant',
    jobId: 'test-variant-2',
    success: true,
    scorecard: {},
    score: 120,
    tfuScore: 22,
    visualDiff: 4.5,
    passed: true,
    duration: 45.0
  }
];
const winner6 = selector.selectWinner(mixedVariants);
console.log(`\nWinner: Variant ${winner6.variant} (${winner6.description})`);
console.log(`Composite Score: ${winner6.compositeScore.toFixed(3)}`);
console.log(`Reason: ${winner6.reason}`);
console.log('\n');

console.log('\n=== All Tests Completed ===\n');
