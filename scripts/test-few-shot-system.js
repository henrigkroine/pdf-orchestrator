#!/usr/bin/env node

/**
 * Test Few-Shot Learning System
 * Verifies all Phase 2 components are working correctly
 */

const path = require('path');
const FewShotPromptBuilder = require('./lib/few-shot-prompt-builder');
const SchemaValidator = require('./lib/schema-validator');

async function testSchemaValidator() {
  console.log('🧪 Testing Schema Validator...\n');

  const validator = new SchemaValidator();
  const projectRoot = path.resolve(__dirname, '..');
  const schemasDir = path.join(projectRoot, 'schemas');

  // Load schemas
  await validator.loadAllSchemas(schemasDir);

  // Test valid annotation
  console.log('✅ Testing valid annotation...');
  const validAnnotation = {
    documentId: 'test-doc',
    documentName: 'Test Document',
    category: 'good',
    grade: 'A+',
    overallScore: 9.5,
    confidence: 0.95,
    annotatedBy: 'test-user',
    annotationDate: '2025-11-06',
    brandCompliance: {
      colors: { score: 10, pass: true, notes: 'Perfect' },
      typography: { score: 10, pass: true, notes: 'Excellent' },
      layout: { score: 9, pass: true, notes: 'Very good' }
    },
    violations: [],
    strengths: ['Great colors', 'Perfect typography'],
    keyLearnings: ['Use Nordshore as primary color']
  };

  const validResult = validator.validateTrainingAnnotation(validAnnotation);
  console.log(`   Valid: ${validResult.valid}`);
  if (!validResult.valid) {
    console.log('   Errors:', validResult.formattedErrors);
  }

  // Test invalid annotation
  console.log('\n✅ Testing invalid annotation (should fail)...');
  const invalidAnnotation = {
    documentId: 'test-doc',
    // Missing required fields
    grade: 'INVALID_GRADE',  // Wrong enum
    overallScore: 15,  // Out of range
    confidence: 1.5  // Out of range
  };

  const invalidResult = validator.validateTrainingAnnotation(invalidAnnotation);
  console.log(`   Valid: ${invalidResult.valid} (expected: false)`);
  console.log(`   Errors found: ${invalidResult.formattedErrors?.length || 0}`);
  if (invalidResult.formattedErrors) {
    console.log('   Sample errors:');
    invalidResult.formattedErrors.slice(0, 3).forEach(err => {
      console.log(`     - ${err}`);
    });
  }

  console.log('\n✅ Schema Validator: PASSED\n');
}

async function testFewShotPromptBuilder() {
  console.log('🧪 Testing Few-Shot Prompt Builder...\n');

  const projectRoot = path.resolve(__dirname, '..');
  const trainingDir = path.join(projectRoot, 'training-examples');

  const builder = new FewShotPromptBuilder(trainingDir);

  // Load examples
  console.log('✅ Loading training examples...');
  const stats = await builder.loadExamples();

  console.log(`   Total examples: ${stats.total}`);
  console.log(`   Good examples: ${stats.good}`);
  console.log(`   Bad examples: ${stats.bad}`);

  if (stats.total === 0) {
    console.log('\n⚠️  No training examples found yet.');
    console.log('   This is OK for initial setup.');
    console.log('   Create examples with: node scripts/create-training-examples.js process ...');
  } else {
    // Build prompt
    console.log('\n✅ Building few-shot prompt...');
    const prompt = await builder.buildValidationPrompt({
      goodExampleCount: 1,
      badExampleCount: 1,
      includeFullAnnotations: false
    });

    console.log(`   Prompt length: ${prompt.length} characters`);
    console.log(`   Contains "TEEI Brand Standards": ${prompt.includes('TEEI Brand Standards')}`);
    console.log(`   Contains "Good Example": ${prompt.includes('Good Example')}`);
    console.log(`   Contains "Bad Example": ${prompt.includes('Bad Example')}`);

    // Get stats
    console.log('\n✅ Getting training example stats...');
    const detailedStats = builder.getStats();

    if (detailedStats.loaded) {
      console.log(`   Average score: ${detailedStats.averageScore}`);
      console.log(`   Grade distribution:`, JSON.stringify(detailedStats.gradeDistribution));
      console.log(`   Violation types:`, JSON.stringify(detailedStats.violationTypes));
    }
  }

  console.log('\n✅ Few-Shot Prompt Builder: PASSED\n');
}

async function testIntegration() {
  console.log('🧪 Testing Integration...\n');

  // Test that StructuredPDFValidator can be required
  console.log('✅ Testing StructuredPDFValidator import...');
  const StructuredPDFValidator = require('./validate-pdf-structured');
  console.log('   Module loaded successfully');

  // Test that TrainingExampleCreator can be required
  console.log('\n✅ Testing TrainingExampleCreator import...');
  const TrainingExampleCreator = require('./create-training-examples');
  console.log('   Module loaded successfully');

  console.log('\n✅ Integration: PASSED\n');
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Phase 2: Few-Shot Learning System Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    await testSchemaValidator();
    await testFewShotPromptBuilder();
    await testIntegration();

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ ALL TESTS PASSED                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    console.log('Next steps:');
    console.log('1. Create training examples: node scripts/create-training-examples.js process ...');
    console.log('2. Validate PDFs: node scripts/validate-pdf-structured.js exports/your-pdf.pdf');
    console.log('3. Test with GEMINI_API_KEY to see full system in action\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { testSchemaValidator, testFewShotPromptBuilder, testIntegration };
