/**
 * PDF Orchestrator - Main Controller
 *
 * The "brain" of the PDF automation system.
 * Routes jobs to appropriate workers based on configuration and job requirements.
 */

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Load configuration
const config = require('./config/orchestrator.config.json');
require('dotenv').config({ path: './config/.env' });

// Initialize JSON schema validator
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// Cost tracking and reliability imports
const CostTracker = require('./workers/cost-tracker');
const CircuitBreaker = require('./workers/circuit-breaker');
const FallbackQueue = require('./workers/fallback-queue');
const { CostExceededError, CircuitBreakerOpenError } = require('./workers/errors');

// Worker imports (to be implemented)
// const mcpWorker = require('./workers/mcp_worker');
// const pdfServicesWorker = require('./workers/pdf_services_worker');

class PDFOrchestrator {
  constructor() {
    this.config = config;
    this.schemas = this.loadSchemas();
    this.templateRegistry = this.loadTemplateRegistry();

    // Initialize cost tracking and reliability components
    this.costTracker = new CostTracker();
    this.fallbackQueue = new FallbackQueue();

    // Initialize circuit breakers for each service
    const costConfig = require('./config/cost-limits.json');
    this.circuitBreakers = {
      adobe_pdf_services: new CircuitBreaker('adobe_pdf_services', {
        failureThreshold: costConfig.circuitBreaker.failureThreshold,
        timeout: costConfig.circuitBreaker.timeout,
        resetTimeout: costConfig.circuitBreaker.resetTimeout
      }),
      openai_images: new CircuitBreaker('openai_images', {
        failureThreshold: costConfig.circuitBreaker.failureThreshold,
        timeout: costConfig.circuitBreaker.timeout,
        resetTimeout: costConfig.circuitBreaker.resetTimeout
      })
    };

    console.log(`[Orchestrator] Initialized v${this.config.orchestrator.version}`);
    console.log('[Orchestrator] Cost tracking enabled');
    console.log('[Orchestrator] Circuit breakers initialized');
  }

  /**
   * Load all JSON schemas from schemas directory
   */
  loadSchemas() {
    const schemasPath = path.join(__dirname, config.validation.schemasPath);
    const schemas = {};

    if (!fs.existsSync(schemasPath)) {
      console.warn('[Orchestrator] Schemas directory not found');
      return schemas;
    }

    const files = fs.readdirSync(schemasPath);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const schemaPath = path.join(schemasPath, file);
        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        const schemaName = path.basename(file, '.json');
        schemas[schemaName] = ajv.compile(schema);
        console.log(`[Orchestrator] Loaded schema: ${schemaName}`);
      }
    });

    return schemas;
  }

  /**
   * Load template registry
   */
  loadTemplateRegistry() {
    const registryPath = path.join(__dirname, config.templates.registryPath);

    if (!fs.existsSync(registryPath)) {
      console.warn('[Orchestrator] Template registry not found');
      return { templates: {} };
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
    console.log(`[Orchestrator] Loaded ${Object.keys(registry.templates).length} templates`);
    return registry;
  }

  /**
   * Validate job JSON against schema
   */
  validateJob(job) {
    const { jobType } = job;
    const schemaKey = `${jobType}-schema`;

    if (!this.schemas[schemaKey]) {
      throw new Error(`No schema found for job type: ${jobType}`);
    }

    const validate = this.schemas[schemaKey];
    const valid = validate(job);

    if (!valid) {
      const errors = validate.errors.map(err =>
        `${err.instancePath} ${err.message}`
      ).join(', ');
      throw new Error(`Validation failed: ${errors}`);
    }

    console.log(`[Orchestrator] Job validated successfully: ${jobType}`);
    return true;
  }

  /**
   * Route job to appropriate worker based on rules
   */
  routeJob(job) {
    const { humanSession, jobType, output } = job;

    // Check routing rules
    for (const rule of this.config.routing.rules) {
      try {
        // Simple condition evaluation (in production, use safer eval alternative)
        const condition = eval(rule.condition);
        if (condition) {
          console.log(`[Orchestrator] Routing to ${rule.worker}: ${rule.reason || rule.condition}`);
          return rule.worker;
        }
      } catch (error) {
        console.warn(`[Orchestrator] Rule evaluation failed: ${rule.condition}`, error);
      }
    }

    // Default worker
    const defaultWorker = this.config.routing.defaultWorker;
    console.log(`[Orchestrator] Using default worker: ${defaultWorker}`);
    return defaultWorker;
  }

  /**
   * Execute API call with cost tracking and circuit breaker
   * @param {string} service - Service name (e.g., 'openai_images', 'adobe_pdf_services')
   * @param {string} operation - Operation name (e.g., 'dall-e-3-hd', 'document_generation')
   * @param {Function} apiCall - Async function that makes the API call
   * @param {object} metadata - Additional metadata for cost tracking
   * @returns {Promise<any>} - API call result
   */
  async executeWithCostTracking(service, operation, apiCall, metadata = {}) {
    const runId = metadata.runId || `run-${Date.now()}`;

    // Step 1: Pre-flight budget check
    const estimatedCost = this.costTracker.getEstimatedCost(service, operation);

    try {
      await this.costTracker.checkBudget(service, operation, estimatedCost);
    } catch (error) {
      if (error instanceof CostExceededError) {
        console.error(`[Orchestrator] Budget exceeded, operation blocked: ${service}.${operation}`);
        throw error;
      }
      throw error;
    }

    // Step 2: Execute with circuit breaker
    const circuitBreaker = this.circuitBreakers[service];

    if (!circuitBreaker) {
      console.warn(`[Orchestrator] No circuit breaker for ${service}, executing without protection`);
    }

    try {
      const startTime = Date.now();

      // Execute API call with circuit breaker (if available)
      const result = circuitBreaker
        ? await circuitBreaker.execute(apiCall)
        : await apiCall();

      const latency = Date.now() - startTime;

      // Step 3: Record actual cost
      await this.costTracker.recordCost(service, operation, estimatedCost, {
        ...metadata,
        runId,
        latency,
        success: true
      });

      console.log(`[Orchestrator] ${service}.${operation} completed: $${estimatedCost.toFixed(2)}, ${latency}ms`);

      return result;

    } catch (error) {
      // Handle circuit breaker open error
      if (error instanceof CircuitBreakerOpenError) {
        console.warn(`[Orchestrator] Circuit breaker OPEN for ${service}, queueing job...`);

        // Queue job for later retry
        await this.fallbackQueue.enqueue({
          type: 'api_call',
          payload: {
            service,
            operation,
            metadata
          }
        });

        throw error;
      }

      // Record failure
      console.error(`[Orchestrator] ${service}.${operation} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute job with selected worker
   */
  async executeJob(job) {
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      console.log(`[Orchestrator] Processing job: ${job.jobType} (Run ID: ${runId})`);

      // Step 1: Validate
      this.validateJob(job);

      // Step 2: Route
      const workerType = this.routeJob(job);

      // Step 3: Execute with cost tracking
      if (workerType === 'mcp') {
        console.log('[Orchestrator] Dispatching to MCP worker...');
        // Example: return await this.executeWithCostTracking(
        //   'mcp_worker',
        //   'generate_document',
        //   async () => mcpWorker.execute(job),
        //   { docSlug: job.data?.slug, runId, user: job.user }
        // );
        return { status: 'stub', message: 'MCP worker not yet implemented', worker: 'mcp', runId };
      } else if (workerType === 'pdfServices') {
        console.log('[Orchestrator] Dispatching to PDF Services worker...');
        // Example: return await this.executeWithCostTracking(
        //   'adobe_pdf_services',
        //   'document_generation',
        //   async () => pdfServicesWorker.execute(job),
        //   { docSlug: job.data?.slug, runId, user: job.user }
        // );
        return { status: 'stub', message: 'PDF Services worker not yet implemented', worker: 'pdfServices', runId };
      } else {
        throw new Error(`Unknown worker type: ${workerType}`);
      }

    } catch (error) {
      console.error('[Orchestrator] Job execution failed:', error.message);

      // Log error details
      if (error instanceof CostExceededError) {
        console.error('[Orchestrator] Cost budget exceeded:', error.toJSON());
      } else if (error instanceof CircuitBreakerOpenError) {
        console.error('[Orchestrator] Circuit breaker open:', error.toJSON());
      }

      throw error;
    }
  }

  /**
   * Get cost tracking status
   * @returns {Promise<object>} - Status object with daily/monthly spend
   */
  async getCostStatus() {
    const dailySpend = await this.costTracker.getDailySpend();
    const monthlySpend = await this.costTracker.getMonthlySpend();

    const costConfig = require('./config/cost-limits.json');
    const { dailyCap, monthlyCap } = costConfig.budget;

    return {
      daily: {
        spend: dailySpend,
        cap: dailyCap,
        remaining: dailyCap - dailySpend,
        percentage: (dailySpend / dailyCap) * 100
      },
      monthly: {
        spend: monthlySpend,
        cap: monthlyCap,
        remaining: monthlyCap - monthlySpend,
        percentage: (monthlySpend / monthlyCap) * 100
      },
      circuitBreakers: Object.entries(this.circuitBreakers).map(([service, breaker]) => ({
        service,
        status: breaker.getStatus()
      }))
    };
  }

  /**
   * Cleanup resources
   */
  close() {
    console.log('[Orchestrator] Closing resources...');

    if (this.costTracker) {
      this.costTracker.close();
    }

    if (this.fallbackQueue) {
      this.fallbackQueue.close();
    }
  }

  /**
   * Process job from JSON file
   */
  async processJobFile(filePath) {
    console.log(`[Orchestrator] Loading job from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Job file not found: ${filePath}`);
    }

    const job = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return await this.executeJob(job);
  }
}

// CLI interface
if (require.main === module) {
  const orchestrator = new PDFOrchestrator();

  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node orchestrator.js <job-file.json>');
    process.exit(1);
  }

  const jobFile = args[0];
  orchestrator.processJobFile(jobFile)
    .then(result => {
      console.log('[Orchestrator] Job completed:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('[Orchestrator] Job failed:', error.message);
      process.exit(1);
    });
}

module.exports = PDFOrchestrator;
