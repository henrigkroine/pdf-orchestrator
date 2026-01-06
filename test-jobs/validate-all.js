const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const schema = JSON.parse(fs.readFileSync('schemas/report-schema.json'));
const validate = ajv.compile(schema);

const jobs = [
  'test-jobs/world-class-teei-v1-conservative.json',
  'test-jobs/world-class-teei-v2-innovative.json',
  'test-jobs/world-class-teei-v3-ultra-premium.json'
];

console.log('='.repeat(80));
console.log('TEEI World-Class Partnership Document - Schema Validation');
console.log('='.repeat(80));
console.log('');

jobs.forEach(jobFile => {
  const job = JSON.parse(fs.readFileSync(jobFile));
  const isValid = validate(job);

  console.log(`File: ${jobFile}`);
  console.log(`Status: ${isValid ? '✓ PASSED' : '✗ FAILED'}`);

  if (!isValid) {
    console.log('Errors:');
    validate.errors.forEach(err => {
      console.log(`  - ${err.instancePath}: ${err.message}`);
    });
  } else {
    console.log(`Title: ${job.data.title}`);
    console.log(`Content Blocks: ${job.data.content.length}`);
    console.log(`Output: ${job.output.destination}`);
  }
  console.log('');
});

console.log('='.repeat(80));
console.log('All validations complete!');
console.log('='.repeat(80));
