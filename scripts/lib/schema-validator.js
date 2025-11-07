/**
 * Schema Validator
 * Validates AI output against JSON schemas with helpful error messages and auto-retry
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs').promises;
const path = require('path');

class SchemaValidator {
  constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false
    });
    addFormats(this.ajv);

    this.schemas = new Map();
    this.validators = new Map();
  }

  /**
   * Load a JSON schema from file
   */
  async loadSchema(schemaName, schemaPath) {
    try {
      const schemaContent = await fs.readFile(schemaPath, 'utf8');
      const schema = JSON.parse(schemaContent);

      this.schemas.set(schemaName, schema);
      const validator = this.ajv.compile(schema);
      this.validators.set(schemaName, validator);

      console.log(`✅ Loaded schema: ${schemaName}`);
      return schema;
    } catch (error) {
      console.error(`❌ Failed to load schema ${schemaName}:`, error.message);
      throw error;
    }
  }

  /**
   * Load all schemas from schemas/ directory
   */
  async loadAllSchemas(schemasDir) {
    const files = await fs.readdir(schemasDir);
    const schemaFiles = files.filter(f => f.endsWith('.schema.json'));

    for (const file of schemaFiles) {
      const schemaName = file.replace('.schema.json', '');
      const schemaPath = path.join(schemasDir, file);
      await this.loadSchema(schemaName, schemaPath);
    }

    console.log(`✅ Loaded ${schemaFiles.length} schemas`);
  }

  /**
   * Validate data against a schema
   */
  validate(schemaName, data) {
    const validator = this.validators.get(schemaName);

    if (!validator) {
      throw new Error(`Schema not found: ${schemaName}. Available: ${Array.from(this.validators.keys()).join(', ')}`);
    }

    const valid = validator(data);

    return {
      valid,
      errors: valid ? null : validator.errors,
      formattedErrors: valid ? null : this.formatErrors(validator.errors)
    };
  }

  /**
   * Format validation errors in human-readable way
   */
  formatErrors(errors) {
    if (!errors || errors.length === 0) return null;

    const formatted = errors.map(err => {
      const path = err.instancePath || 'root';
      const message = err.message || 'Unknown error';

      let detail = `${path}: ${message}`;

      // Add helpful context based on error type
      if (err.keyword === 'required') {
        detail += ` (missing: ${err.params.missingProperty})`;
      } else if (err.keyword === 'enum') {
        detail += ` (allowed: ${err.params.allowedValues.join(', ')})`;
      } else if (err.keyword === 'type') {
        detail += ` (expected ${err.params.type}, got ${typeof err.data})`;
      } else if (err.keyword === 'minimum' || err.keyword === 'maximum') {
        detail += ` (limit: ${err.params.limit})`;
      }

      return detail;
    });

    return formatted;
  }

  /**
   * Validate with retry logic
   * If validation fails, returns error details for prompt correction
   */
  async validateWithRetry(schemaName, data, retryCallback, maxRetries = 2) {
    let attempts = 0;
    let lastResult;

    while (attempts <= maxRetries) {
      const result = this.validate(schemaName, data);
      lastResult = result;

      if (result.valid) {
        if (attempts > 0) {
          console.log(`✅ Validation succeeded after ${attempts} retries`);
        }
        return { success: true, data, attempts };
      }

      attempts++;

      if (attempts <= maxRetries) {
        console.log(`⚠️  Validation failed (attempt ${attempts}/${maxRetries + 1})`);
        console.log('Errors:', result.formattedErrors.join('\n'));

        // Call retry callback to get corrected data
        try {
          data = await retryCallback(result.formattedErrors, attempts);
        } catch (error) {
          console.error(`❌ Retry callback failed:`, error.message);
          break;
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      errors: lastResult.formattedErrors,
      attempts
    };
  }

  /**
   * Get schema definition
   */
  getSchema(schemaName) {
    return this.schemas.get(schemaName);
  }

  /**
   * Generate example data from schema
   */
  generateExample(schemaName) {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema not found: ${schemaName}`);
    }

    return this._generateFromSchema(schema);
  }

  /**
   * Recursively generate example data from schema definition
   */
  _generateFromSchema(schema) {
    if (schema.type === 'object') {
      const example = {};
      const props = schema.properties || {};

      // Add required properties
      if (schema.required) {
        for (const prop of schema.required) {
          if (props[prop]) {
            example[prop] = this._generateFromSchema(props[prop]);
          }
        }
      }

      return example;
    }

    if (schema.type === 'array') {
      const items = schema.items || { type: 'string' };
      return [this._generateFromSchema(items)];
    }

    if (schema.type === 'string') {
      if (schema.enum) return schema.enum[0];
      if (schema.format === 'date') return new Date().toISOString().split('T')[0];
      return schema.description || 'example';
    }

    if (schema.type === 'number' || schema.type === 'integer') {
      if (schema.minimum !== undefined) return schema.minimum;
      if (schema.maximum !== undefined) return schema.maximum;
      return 0;
    }

    if (schema.type === 'boolean') {
      return true;
    }

    return null;
  }

  /**
   * Create correction prompt from validation errors
   */
  createCorrectionPrompt(errors) {
    return `
The previous JSON output had validation errors. Please correct these issues:

${errors.map((err, i) => `${i + 1}. ${err}`).join('\n')}

Return ONLY the corrected JSON, ensuring all required fields are present and properly formatted.
Do not include any explanatory text, just the JSON object.
`.trim();
  }

  /**
   * Validate training annotation
   */
  validateTrainingAnnotation(annotation) {
    return this.validate('training-annotation', annotation);
  }

  /**
   * Validate AI vision output
   */
  validateAIVisionOutput(output) {
    return this.validate('ai-vision-output', output);
  }
}

module.exports = SchemaValidator;
