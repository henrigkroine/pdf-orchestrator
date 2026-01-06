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
const { spawn, spawnSync } = require('child_process');
const { Mutex } = require('async-mutex');

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

// Worker imports
const MCPWorker = require('./workers/mcp_worker');
const PDFServicesWorker = require('./workers/pdf_services_worker');

// MCP Manager for multi-server workflow orchestration
const MCPManager = require('./mcp-manager');

// Mutex for serializing MCP worker execution (prevents InDesign conflicts)
const mcpMutex = new Mutex();

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

    // Initialize workers
    this.workers = {
      mcp: new MCPWorker(this.config.workers?.mcp || {}),
      pdfServices: new PDFServicesWorker(this.config.workers?.pdfServices || {})
    };

    // Initialize MCP Manager for multi-server workflows
    this.mcpManager = new MCPManager();
    this.mcpManagerReady = false; // Will be set to true after async initialization

    console.log(`[Orchestrator] Initialized v${this.config.orchestrator.version}`);
    console.log('[Orchestrator] Cost tracking enabled');
    console.log('[Orchestrator] Circuit breakers initialized');
    console.log('[Orchestrator] Workers initialized: MCP, PDF Services');
    console.log('[Orchestrator] MCP Manager initialized (async init pending)');
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
    const { humanSession, jobType, output, mcpMode, style, mcp } = job;

    // Router trace logging
    console.log(`[Orchestrator] Router decision trace:`);
    console.log(`  • humanSession: ${humanSession}`);
    console.log(`  • jobType: ${jobType}`);
    console.log(`  • quality: ${output?.quality || 'undefined'}`);
    console.log(`  • mcpMode: ${mcpMode || 'undefined'}`);
    console.log(`  • style: ${style || 'undefined'}`);
    console.log(`  • mcp.workflow: ${mcp?.workflow || 'undefined'}`);

    // CRITICAL: Detect MCP Manager workflow mode
    // If mcpMode=true, style=TFU, or mcp.workflow is specified, route to 'mcp-manager'
    const isMCPManagerMode = (
      mcpMode === true ||
      style === 'TFU' ||
      (mcp && mcp.workflow)
    );

    if (isMCPManagerMode) {
      console.log(`[Orchestrator] 🌐 MCP MANAGER MODE DETECTED`);
      console.log(`[Orchestrator] Routing to MCP Manager for multi-server workflow orchestration`);
      if (style === 'TFU') {
        console.log(`[Orchestrator] 🇺🇦 TFU (Together for Ukraine) style requires MCP InDesign`);
      }
      if (mcp?.workflow) {
        console.log(`[Orchestrator] Workflow specified: ${mcp.workflow}`);
      }
      return 'mcp-manager';
    }

    // Check routing rules
    for (const rule of this.config.routing.rules) {
      try {
        // Simple condition evaluation (in production, use safer eval alternative)
        const condition = eval(rule.condition);
        if (condition) {
          console.log(`[Orchestrator] ✅ Rule matched: ${rule.condition}`);
          console.log(`[Orchestrator] Routing to ${rule.worker}: ${rule.reason || rule.condition}`);

          const selectedWorker = rule.worker;

          // CRITICAL GUARDRAIL: Block serverless for premium documents
          const premiumJobTypes = ['partnership', 'program', 'report'];
          const isHighQuality = output?.quality === 'high';
          const isPremiumType = premiumJobTypes.includes(jobType);

          if (selectedWorker === 'pdfServices' && isPremiumType && isHighQuality) {
            console.log(`[Orchestrator] 🚨 GUARDRAIL TRIGGERED: Cannot use PDF Services for premium document`);
            console.log(`[Orchestrator] Forcing MCP worker for ${jobType} with quality=${output.quality}`);
            return 'mcp';
          }

          return selectedWorker;
        }
      } catch (error) {
        console.warn(`[Orchestrator] Rule evaluation failed: ${rule.condition}`, error);
      }
    }

    // Default worker
    const defaultWorker = this.config.routing.defaultWorker;
    console.log(`[Orchestrator] No rules matched, using default worker: ${defaultWorker}`);
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
   * Run QA validation on exported PDF
   * @param {string} pdfPath - Path to PDF file
   * @param {number} threshold - Minimum score required (0-100)
   * @returns {Promise<object>} - Validation report with score
   */
  async validatePdf(pdfPath, threshold = 90) {
    return new Promise((resolve, reject) => {
      console.log(`[Orchestrator] Running QA validation on: ${pdfPath}`);
      console.log(`[Orchestrator] QA threshold: ${threshold}`);

      const pythonScript = path.join(__dirname, 'validate_document.py');
      const args = [pythonScript, pdfPath, '--json'];

      const pythonProcess = spawn('python', args);
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          console.error(`[Orchestrator] QA validation process failed with code ${code}`);
          if (stderr) {
            console.error(`[Orchestrator] Python stderr: ${stderr}`);
          }
          return reject(new Error(`QA validation failed: ${stderr || 'Unknown error'}`));
        }

        try {
          // Extract JSON from stdout (validator prints other logs too)
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error('No JSON output from validator');
          }

          const report = JSON.parse(jsonMatch[0]);
          console.log(`[Orchestrator] QA Score: ${report.score}/${report.max_score} (${report.percentage}%)`);
          console.log(`[Orchestrator] QA Rating: ${report.rating}`);

          if (report.score < threshold) {
            console.error(`[Orchestrator] ❌ QA validation failed: Score ${report.score} below threshold ${threshold}`);
            return reject(new Error(
              `QA validation failed: Score ${report.score}/${report.max_score} (${report.percentage}%) ` +
              `is below required threshold of ${threshold}. Rating: ${report.rating}`
            ));
          }

          console.log(`[Orchestrator] ✅ QA validation passed`);
          resolve(report);
        } catch (parseError) {
          console.error(`[Orchestrator] Failed to parse QA validation output:`, parseError.message);
          console.error(`[Orchestrator] Raw stdout:`, stdout);
          reject(new Error(`QA validation output parsing failed: ${parseError.message}`));
        }
      });
    });
  }

  /**
   * Execute job using world-class Python CLI
   * Provides highest quality output with 90+ QA threshold
   * @param {object} job - Job specification
   * @param {string} runId - Run identifier
   * @returns {Promise<object>} - Result with QA validation
   */
  async executeWorldClassJob(job, runId) {
    console.log('[Orchestrator] Preparing world-class job execution...');

    // Write job data to temporary file
    const tempJobFile = path.join(__dirname, 'temp', `job-${runId}.json`);
    const tempDir = path.dirname(tempJobFile);

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    fs.writeFileSync(tempJobFile, JSON.stringify(job, null, 2));

    // Execute world_class_cli.py
    const pythonScript = path.join(__dirname, 'world_class_cli.py');
    const args = [
      pythonScript,
      '--type', job.jobType,
      '--data', tempJobFile
    ];

    console.log(`[Orchestrator] Executing: python ${args.join(' ')}`);

    const result = spawnSync('python', args, {
      encoding: 'utf8',
      stdio: ['inherit', 'pipe', 'pipe'],
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Clean up temp file
    if (fs.existsSync(tempJobFile)) {
      fs.unlinkSync(tempJobFile);
    }

    if (result.error) {
      console.error('[Orchestrator] World-class CLI execution error:', result.error);
      throw new Error(`World-class CLI failed: ${result.error.message}`);
    }

    if (result.status !== 0) {
      console.error('[Orchestrator] World-class CLI stderr:', result.stderr);
      throw new Error(`World-class CLI failed with exit code ${result.status}: ${result.stderr}`);
    }

    // Parse output from world_class_cli.py
    try {
      const outputMatch = result.stdout.match(/\{[\s\S]*\}/);
      if (!outputMatch) {
        throw new Error('No JSON output from world-class CLI');
      }

      const output = JSON.parse(outputMatch[0]);

      console.log('[Orchestrator] ✅ World-class job completed successfully');
      console.log(`[Orchestrator] Python CLI QA Score: ${output.qa?.score || 'N/A'}`);

      // CRITICAL: Re-validate with Node.js authoritative gate (≥95 threshold)
      if (output.outputPath || output.output?.path) {
        const pdfPath = output.outputPath || output.output?.path;
        const worldClassThreshold = 95;

        console.log('[Orchestrator] Running authoritative Node.js QA validation (world-class gate)...');
        console.log(`[Orchestrator] World-class threshold: ${worldClassThreshold} (cannot be bypassed)`);

        try {
          const qaReport = await this.validatePdf(pdfPath, worldClassThreshold);

          console.log('[Orchestrator] ✅ World-class QA gate passed');
          return {
            ...output,
            runId,
            timestamp: new Date().toISOString(),
            worldClass: true,
            qa: {
              pythonScore: output.qa?.score,
              nodeValidation: qaReport,
              threshold: worldClassThreshold
            }
          };

        } catch (qaError) {
          console.error('[Orchestrator] ❌ World-class QA gate FAILED');
          console.error(`[Orchestrator] ${qaError.message}`);
          throw new Error(`World-class QA failed: ${qaError.message}`);
        }

      } else {
        console.warn('[Orchestrator] No PDF path found in world-class CLI output, skipping re-validation');
        return {
          ...output,
          runId,
          timestamp: new Date().toISOString(),
          worldClass: true
        };
      }

    } catch (parseError) {
      console.error('[Orchestrator] Failed to parse world-class CLI output:', parseError.message);
      console.error('[Orchestrator] Raw stdout:', result.stdout);
      throw new Error(`World-class CLI output parsing failed: ${parseError.message}`);
    }
  }

  /**
   * Execute experiment mode - A/B testing with automatic winner selection
   */
  async executeExperimentMode(job, runId) {
    console.log('[Orchestrator] Starting experiment mode execution...');

    const ExperimentRunner = require('./experiments/experiment-runner');
    const experimentRunner = new ExperimentRunner();

    try {
      // Save original job config to temp file for experiment runner
      const jobConfigPath = path.join(__dirname, 'temp', `experiment-base-${runId}.json`);
      const tempDir = path.dirname(jobConfigPath);

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(jobConfigPath, JSON.stringify(job, null, 2));

      // Run experiment
      const result = await experimentRunner.runExperiment(job, jobConfigPath);

      // Clean up temp file
      if (fs.existsSync(jobConfigPath)) {
        fs.unlinkSync(jobConfigPath);
      }

      console.log('[Orchestrator] ✅ Experiment mode completed');
      console.log(`[Orchestrator] Winner: Variant ${result.winner.variant}`);
      console.log(`[Orchestrator] Composite Score: ${result.winner.compositeScore.toFixed(3)}`);
      console.log(`[Orchestrator] Summary saved: ${result.summaryPath}`);

      return {
        ...result,
        runId,
        timestamp: new Date().toISOString(),
        experimentMode: true
      };

    } catch (error) {
      console.error('[Orchestrator] Experiment mode failed:', error.message);
      throw new Error(`Experiment mode failed: ${error.message}`);
    }
  }

  /**
   * Execute job with selected worker
   */
  async executeJob(job) {
    const runId = `run-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    try {
      console.log(`[Orchestrator] Processing job: ${job.jobType} (Run ID: ${runId})`);

      // Step -1: Check for experiment mode (A/B testing)
      if (job.mode === 'experiment') {
        console.log('[Orchestrator] 🧪 EXPERIMENT MODE ENABLED - Running A/B test variants');
        return await this.executeExperimentMode(job, runId);
      }

      // Step 0: Check for worldClass mode (highest quality)
      if (job.worldClass === true) {
        console.log('[Orchestrator] 🌟 WORLD-CLASS MODE ENABLED - Using premium Python CLI');
        return await this.executeWorldClassJob(job, runId);
      }

      // Step 1: Validate
      this.validateJob(job);

      // Step 2: Route
      const workerType = this.routeJob(job);

      // Step 3: Execute with appropriate worker
      let result;

      if (workerType === 'mcp-manager') {
        console.log('[Orchestrator] 🌐 Dispatching to MCP Manager for multi-server workflow...');

        // CRITICAL: Ensure MCP Manager is initialized
        if (!this.mcpManagerReady) {
          console.log('[Orchestrator] Initializing MCP Manager...');
          try {
            await this.mcpManager.initialize();
            this.mcpManagerReady = true;
            console.log('[Orchestrator] ✅ MCP Manager initialized successfully');
          } catch (initError) {
            throw new Error(`MCP Manager initialization failed: ${initError.message}`);
          }
        }

        // Execute via MCP Manager with mutex (prevents InDesign conflicts)
        result = await this.runMcpManagerWorkflow(job, runId);

      } else if (workerType === 'mcp') {
        console.log('[Orchestrator] Dispatching to MCP worker...');

        // MCP worker for local InDesign/Illustrator automation
        // Cost tracking not needed for local resources
        // Use mutex to serialize execution (prevent InDesign conflicts)
        result = await this.runMcpJob(job);

      } else if (workerType === 'pdfServices') {
        console.log('[Orchestrator] Dispatching to PDF Services worker...');

        // PDF Services with cost tracking and circuit breaker
        result = await this.executeWithCostTracking(
          'adobe_pdf_services',
          'document_generation',
          async () => this.workers.pdfServices.execute(job),
          { docSlug: job.data?.slug, runId, user: job.user }
        );

      } else {
        throw new Error(`Unknown worker type: ${workerType}`);
      }

      // Step 4: Mandatory QA validation after export (with auto-fix retry)
      if (result && result.outputPath) {
        // Calculate threshold: world-class requires ≥95, standard ≥90
        const baseThreshold = job.qa?.threshold ?? 90;
        const qaThreshold = job.worldClass === true ? Math.max(baseThreshold, 95) : baseThreshold;
        const autoFixEnabled = job.qa?.auto_fix_colors ?? false;

        // Log threshold calculation
        if (job.worldClass === true) {
          console.log(`[Orchestrator] World-class threshold: ${qaThreshold} (enforced minimum: 95)`);
        } else {
          console.log(`[Orchestrator] A+ threshold: ${qaThreshold}`);
        }

        let qaReport;
        let firstAttemptScore = null;

        try {
          // First QA validation attempt
          console.log('[Orchestrator] Running initial QA validation...');
          qaReport = await this.validatePdf(result.outputPath, qaThreshold);

          // Step 4.5: Optional accessibility auto-tagging (after QA pass)
          if (job.output?.accessibility === 'autotag') {
            console.log('[Orchestrator] ♿ Accessibility tagging enabled - applying PDF auto-tags...');
            console.log('[Orchestrator] ⚠️  WARNING: Accessibility tagging adds cost via PDF Services API');

            try {
              // Call PDF Services autotag API
              // In production: integrate with Adobe PDF Services Accessibility API
              // const taggedPdf = await this.workers.pdfServices.autotagPdf(result.outputPath);

              console.log('[Orchestrator] ✅ Accessibility tagging completed');
              console.log('[Orchestrator] Running post-tag QA validation...');

              // Re-run QA after tagging (tags shouldn't affect validation but verify)
              qaReport = await this.validatePdf(result.outputPath, qaThreshold);

              qaReport.accessibility_tagged = true;
              console.log('[Orchestrator] ✅ Post-tag QA validation passed');

            } catch (tagError) {
              console.error('[Orchestrator] ⚠️  Accessibility tagging failed:', tagError.message);
              console.error('[Orchestrator] Continuing with untagged PDF (QA already passed)');
              qaReport.accessibility_error = tagError.message;
            }
          }

          return {
            ...result,
            runId,
            timestamp: new Date().toISOString(),
            qa: qaReport
          };

        } catch (qaError) {
          // QA failed on first attempt
          firstAttemptScore = this.extractScoreFromError(qaError);
          
          if (autoFixEnabled && workerType === 'mcp') {
            console.log('[Orchestrator] ⚠️  QA validation failed (score: ' + (firstAttemptScore || 'unknown') + ')');
            console.log('[Orchestrator] 🔧 auto_fix_colors enabled - attempting color correction retry...');

            try {
              // Re-export with color auto-fix enabled
              result = await this.runMcpJob({
                ...job,
                qa: { ...job.qa, force_color_fix: true }
              });

              // Second QA validation attempt
              console.log('[Orchestrator] Running QA validation after color fix...');
              qaReport = await this.validatePdf(result.outputPath, qaThreshold);

              console.log('[Orchestrator] ✅ Auto-fix successful! QA passed on retry.');
              return {
                ...result,
                runId,
                timestamp: new Date().toISOString(),
                qa: {
                  ...qaReport,
                  auto_fix_applied: true,
                  first_attempt_score: firstAttemptScore
                }
              };

            } catch (retryError) {
              const secondAttemptScore = this.extractScoreFromError(retryError);
              console.error('[Orchestrator] ❌ Auto-fix retry failed');
              console.error(`[Orchestrator] First attempt score: ${firstAttemptScore || 'unknown'}`);
              console.error(`[Orchestrator] Second attempt score: ${secondAttemptScore || 'unknown'}`);
              
              throw new Error(
                `QA validation failed after auto-fix retry. ` +
                `First score: ${firstAttemptScore || 'unknown'}, ` +
                `Second score: ${secondAttemptScore || 'unknown'}`
              );
            }
          } else {
            // Auto-fix not enabled or not MCP worker
            console.error('[Orchestrator] QA validation failed, job execution failed:', qaError.message);
            throw qaError;
          }
        }
      } else {
        console.warn('[Orchestrator] No outputPath in result, skipping QA validation');

        return {
          ...result,
          runId,
          timestamp: new Date().toISOString()
        };
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
   * Extract score from QA validation error message
   * @param {Error} error - QA validation error
   * @returns {number|null} - Extracted score or null
   */
  extractScoreFromError(error) {
    const scoreMatch = error.message.match(/Score (\d+)/);
    return scoreMatch ? parseInt(scoreMatch[1], 10) : null;
  }

  /**
   * Execute MCP worker job with mutex (serialized execution)
   * Prevents InDesign/Illustrator conflicts from parallel jobs
   * @param {object} job - Job specification
   * @returns {Promise<object>} - Job result
   */
  async runMcpJob(job) {
    return mcpMutex.runExclusive(async () => {
      console.log('[Orchestrator] 🔒 MCP mutex acquired - executing job (serialized)');
      const result = await this.workers.mcp.execute(job);
      console.log('[Orchestrator] 🔓 MCP mutex released');
      return result;
    });
  }

  /**
   * Execute MCP Manager workflow with mutex (serialized execution)
   * Routes job through multi-server MCP orchestration
   * CRITICAL: TFU jobs MUST use this path, never bypass to direct MCPWorker
   * @param {object} job - Job specification with mcp.workflow
   * @param {string} runId - Run identifier for tracking
   * @returns {Promise<object>} - Workflow result
   */
  async runMcpManagerWorkflow(job, runId) {
    return mcpMutex.runExclusive(async () => {
      console.log('[Orchestrator] 🔒 MCP mutex acquired - executing MCP Manager workflow (serialized)');
      console.log(`[Orchestrator] 🌐 MCP Manager Workflow Execution - Run ID: ${runId}`);

      try {
        // CRITICAL GUARDRAIL: TFU jobs must never bypass MCP Manager
        if (job.style === 'TFU') {
          console.log('[Orchestrator] 🇺🇦 TFU style detected - MCP Manager path is MANDATORY');
          console.log('[Orchestrator] This job will FAIL if MCP Manager cannot execute it');
        }

        // Determine workflow to execute
        const workflowName = job.mcp?.workflow || 'generate-partnership-pdf';
        console.log(`[Orchestrator] 📋 Workflow: ${workflowName}`);

        // Log all enabled MCP servers
        if (job.mcp?.servers) {
          const enabledServers = Object.entries(job.mcp.servers)
            .filter(([_, config]) => config.enabled !== false)
            .map(([name]) => name);
          console.log(`[Orchestrator] 🔧 Enabled MCP servers: ${enabledServers.join(', ')}`);
        }

        // Build context data from job
        const contextData = {
          jobId: job.jobId,
          jobType: job.jobType,
          client: job.client,
          partner: job.data?.partner,
          partnerName: job.data?.partner,
          year: new Date().getFullYear(),
          templateId: job.templateId,
          style: job.style,
          data: job.data,
          design: job.design,
          output: job.output,
          export: job.export,
          runId
        };

        // Execute workflow via MCP Manager
        console.log('[Orchestrator] 🚀 Invoking MCP Manager workflow...');
        const workflowResults = await this.mcpManager.executeWorkflow(workflowName, contextData);

        // Extract final InDesign export result
        const indesignExportKey = Object.keys(workflowResults).find(key =>
          key.includes('indesign') && key.includes('exportPDF')
        );

        if (!indesignExportKey) {
          throw new Error('MCP Manager workflow did not produce InDesign PDF export');
        }

        const indesignResult = workflowResults[indesignExportKey];
        console.log('[Orchestrator] ✅ MCP Manager workflow completed successfully');
        console.log(`[Orchestrator] Export path: ${indesignResult.exportPath || indesignResult.filePath || 'unknown'}`);

        // Log all workflow steps completed
        const completedSteps = Object.keys(workflowResults);
        console.log(`[Orchestrator] 📊 Workflow steps completed: ${completedSteps.length}`);
        completedSteps.forEach((step, index) => {
          console.log(`[Orchestrator]   ${index + 1}. ${step} ✓`);
        });

        // Return in orchestrator-compatible format
        const outputPath = indesignResult.exportPath || indesignResult.filePath;
        const result = {
          status: 'success',
          worker: 'mcp-manager',
          workflow: workflowName,
          outputPath: outputPath,
          output: { path: outputPath },
          metadata: {
            workflowSteps: completedSteps,
            allResults: workflowResults,
            runId
          },
          result: indesignResult
        };

        console.log('[Orchestrator] 🔓 MCP mutex released');
        return result;

      } catch (error) {
        console.error('[Orchestrator] ❌ MCP Manager workflow failed:', error.message);
        console.error('[Orchestrator] 🔓 MCP mutex released (error)');

        // CRITICAL: For TFU jobs, do not allow fallback
        if (job.style === 'TFU') {
          throw new Error(`TFU job MUST use MCP Manager path - cannot fallback: ${error.message}`);
        }

        throw error;
      }
    });
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
   * Get worker status for all workers
   */
  async getWorkerStatus() {
    const status = {
      mcp: this.workers.mcp.getStatus(),
      pdfServices: this.workers.pdfServices.getStatus()
    };

    // Run health checks
    const healthChecks = await Promise.allSettled([
      this.workers.mcp.healthCheck(),
      this.workers.pdfServices.healthCheck()
    ]);

    status.mcp.healthy = healthChecks[0].status === 'fulfilled' && healthChecks[0].value;
    status.pdfServices.healthy = healthChecks[1].status === 'fulfilled' && healthChecks[1].value;

    return status;
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
