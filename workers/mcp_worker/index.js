/**
 * MCP Worker
 *
 * Connects to local MCP server to automate InDesign/Illustrator
 * Used for human-session jobs requiring interactive Adobe apps
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

class MCPWorker {
  constructor(config = {}) {
    this.host = config.host || process.env.MCP_SERVER_HOST || 'localhost';
    this.port = config.port || process.env.MCP_SERVER_PORT || 8012;
    this.protocol = config.protocol || process.env.MCP_SERVER_PROTOCOL || 'http';
    this.timeout = config.timeout || 300000; // 5 minutes default
    this.templateRegistry = null;

    console.log(`[MCP Worker] Initialized: ${this.protocol}://${this.host}:${this.port}`);

    // Load template registry
    this.loadTemplateRegistry();
  }

  /**
   * Load template registry for template lookups
   */
  loadTemplateRegistry() {
    try {
      const registryPath = path.join(__dirname, '../../templates/template-registry.json');
      if (fs.existsSync(registryPath)) {
        this.templateRegistry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
        console.log(`[MCP Worker] Loaded ${Object.keys(this.templateRegistry.templates || {}).length} templates`);
      } else {
        console.warn('[MCP Worker] Template registry not found, using default routing');
      }
    } catch (error) {
      console.error('[MCP Worker] Failed to load template registry:', error.message);
    }
  }

  /**
   * Execute job via MCP server
   */
  async execute(job) {
    console.log('[MCP Worker] Starting job execution...');
    console.log(`[MCP Worker] Job type: ${job.jobType}, Template: ${job.templateId || 'dynamic'}`);

    try {
      // Step 1: Determine which Adobe application to use
      const app = this.getApplicationFromTemplate(job.templateId);
      console.log(`[MCP Worker] Target application: ${app}`);

      // Step 2: Build MCP command based on job type
      const mcpCommand = this.buildMCPCommand(job, app);

      // Step 3: Send job ticket to MCP server
      const result = await this.sendJobToMCP(mcpCommand);

      // Step 4: Validate result
      if (result.status === 'SUCCESS') {
        console.log('[MCP Worker] Job completed successfully');
        return {
          status: 'success',
          worker: 'mcp',
          application: app,
          output: result.output || job.output,
          metadata: result.metadata || {},
          result: result
        };
      } else {
        throw new Error(`MCP command failed: ${result.error || 'Unknown error'}`);
      }

    } catch (error) {
      console.error('[MCP Worker] Job failed:', error.message);
      throw error;
    }
  }

  /**
   * Build MCP command from job specification
   */
  buildMCPCommand(job, application) {
    const command = {
      application: application,
      action: this.getActionFromJobType(job.jobType),
      parameters: {
        template: job.templateId,
        data: job.data,
        output: job.output
      }
    };

    // Add job-specific parameters
    if (job.jobType === 'campaign') {
      command.parameters.format = job.output?.format || 'PDF';
      command.parameters.dimensions = job.data?.dimensions;
    } else if (job.jobType === 'report') {
      command.parameters.pages = job.data?.pages || 1;
      command.parameters.layout = job.data?.layout || 'standard';
    }

    return command;
  }

  /**
   * Map job type to MCP action
   */
  getActionFromJobType(jobType) {
    const actionMap = {
      'campaign': 'createFromTemplate',
      'report': 'generateDocument',
      'document': 'generateDocument',
      'custom': 'executeCustom'
    };
    return actionMap[jobType] || 'generateDocument';
  }

  /**
   * Determine which Adobe app to use based on template
   */
  getApplicationFromTemplate(templateId) {
    // Lookup in template registry if available
    if (this.templateRegistry && templateId) {
      const template = this.templateRegistry.templates[templateId];
      if (template) {
        console.log(`[MCP Worker] Found template in registry: ${template.name}`);
        return template.application || 'indesign';
      }
    }

    // Fallback to heuristic-based detection
    if (!templateId) {
      return 'indesign'; // default for dynamic documents
    }

    // File extension-based detection
    if (templateId.endsWith('.indt') || templateId.includes('report') || templateId.includes('document')) {
      return 'indesign';
    } else if (templateId.endsWith('.ait') || templateId.includes('campaign') || templateId.includes('poster')) {
      return 'illustrator';
    }

    // Default to InDesign (more common for documents)
    return 'indesign';
  }

  /**
   * Send job ticket to MCP server with retry logic
   */
  async sendJobToMCP(jobTicket, retries = 3) {
    const data = JSON.stringify(jobTicket);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[MCP Worker] Sending command to MCP server (attempt ${attempt}/${retries})...`);

        const result = await new Promise((resolve, reject) => {
          const options = {
            hostname: this.host,
            port: this.port,
            path: '/api/jobs',
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(data)
            },
            timeout: this.timeout
          };

          const req = http.request(options, (res) => {
            let responseData = '';

            res.on('data', (chunk) => {
              responseData += chunk;
            });

            res.on('end', () => {
              try {
                if (res.statusCode === 200 || res.statusCode === 201) {
                  const parsed = JSON.parse(responseData);
                  resolve(parsed);
                } else if (res.statusCode === 503) {
                  // Service unavailable - may retry
                  reject(new Error(`MCP server unavailable (503): ${responseData}`));
                } else {
                  reject(new Error(`MCP server returned status ${res.statusCode}: ${responseData}`));
                }
              } catch (parseError) {
                reject(new Error(`Failed to parse MCP response: ${parseError.message}`));
              }
            });
          });

          req.on('error', (error) => {
            reject(new Error(`Failed to connect to MCP server at ${this.host}:${this.port}: ${error.message}`));
          });

          req.on('timeout', () => {
            req.destroy();
            reject(new Error(`MCP server request timed out after ${this.timeout}ms`));
          });

          req.write(data);
          req.end();
        });

        // Success!
        return result;

      } catch (error) {
        console.warn(`[MCP Worker] Attempt ${attempt} failed: ${error.message}`);

        if (attempt === retries) {
          // Final attempt failed
          throw error;
        }

        // Wait before retry (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`[MCP Worker] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Check if MCP server is available
   */
  async healthCheck() {
    try {
      console.log('[MCP Worker] Running health check...');

      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: this.host,
          port: this.port,
          path: '/health',
          method: 'GET',
          timeout: 5000
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });

        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });

        req.end();
      });

      if (result) {
        console.log('[MCP Worker] Health check: ✓ Server is available');
      } else {
        console.warn('[MCP Worker] Health check: ✗ Server is not responding');
      }

      return result;

    } catch (error) {
      console.warn('[MCP Worker] Health check failed:', error.message);
      return false;
    }
  }

  /**
   * Get worker status and capabilities
   */
  getStatus() {
    return {
      worker: 'mcp',
      host: this.host,
      port: this.port,
      protocol: this.protocol,
      timeout: this.timeout,
      templatesLoaded: this.templateRegistry ? Object.keys(this.templateRegistry.templates || {}).length : 0,
      capabilities: ['indesign', 'illustrator'],
      ready: true
    };
  }
}

module.exports = MCPWorker;
