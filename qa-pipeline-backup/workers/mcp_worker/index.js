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

      // Step 2: Verify export preset exists (if specified in job.export)
      if (job.export?.pdfPreset && app === 'indesign') {
        console.log(`[MCP Worker] Export preset specified: ${job.export.pdfPreset}`);
      }

      // Step 3: Send job to HTTP bridge (bridge handles template loading, data binding, export, QA)
      const result = await this.sendJobToMCP(job);

      // Step 4: Validate result from bridge
      if (result.ok) {
        console.log('[MCP Worker] ✅ Job completed with QA validation');
        console.log(`[MCP Worker] Export path: ${result.exportPath}`);
        console.log(`[MCP Worker] QA score: ${result.qa?.score?.total || 'N/A'}`);

        return {
          status: 'success',
          worker: 'mcp',
          application: app,
          output: { path: result.exportPath },
          metadata: { qa: result.qa },
          result: result
        };
      } else {
        throw new Error(`MCP bridge returned unexpected result: ${JSON.stringify(result)}`);
      }

    } catch (error) {
      console.error('[MCP Worker] Job failed:', error.message);
      throw error;
    }
  }

  /**
   * Build MCP command from job specification
   * Format matches FastAPI bridge JobTicket schema
   */
  buildMCPCommand(job, application) {
    const steps = [];

    // Step 1: Load or create document
    if (job.templateId) {
      steps.push({
        command: 'loadTemplate',
        params: {
          templateId: job.templateId,
          templatePath: this.getTemplatePath(job.templateId)
        }
      });
    } else {
      steps.push({
        command: 'createDocument',
        params: {
          width: job.data?.dimensions?.width || 612,
          height: job.data?.dimensions?.height || 792,
          pages: job.data?.pages || 1
        }
      });
    }

    // Step 2: Apply brand colors
    if (job.data?.brand?.required_colors) {
      for (const colorName of job.data.brand.required_colors) {
        const colorHex = this.getColorHex(colorName);
        if (colorHex) {
          steps.push({
            command: 'applyColor',
            params: { color_name: colorName, hex_value: colorHex }
          });
        }
      }
    }

    // Step 3: Populate data
    steps.push({
      command: 'populateData',
      params: {
        data: job.data,
        jobType: job.jobType
      }
    });

    // Step 4: Export document
    const exportFilename = `exports/${job.jobId || 'output'}.pdf`;
    steps.push({
      command: 'exportDocument',
      params: {
        format: 'pdf',
        quality: job.output?.quality || 'high',
        filename: exportFilename,
        preset: job.export?.pdfPreset || job.output?.preset || 'High Quality Print',
        intent: job.output?.intent || 'print'
      }
    });

    return {
      application: application,
      steps: steps,
      options: {
        jobId: job.jobId,
        jobType: job.jobType,
        worldClass: job.worldClass || false,
        qaThreshold: job.qa?.threshold || 90
      },
      timeoutSec: Math.floor(this.timeout / 1000)
    };
  }

  /**
   * Get template file path from registry
   */
  getTemplatePath(templateId) {
    if (this.templateRegistry && this.templateRegistry.templates[templateId]) {
      return this.templateRegistry.templates[templateId].file;
    }
    return null;
  }

  /**
   * Map color names to hex values (TEEI color palette)
   * AUTHORITATIVE SOURCE: world_class_cli.py TEEI_COLORS
   * All 7 official TEEI brand colors + utility colors
   */
  getColorHex(colorName) {
    const colorMap = {
      // TEEI Brand Colors (official)
      'Nordshore': '#00393F',
      'Sky': '#C9E4EC',
      'Sand': '#FFF1E2',
      'Beige': '#EFE1DC',
      'Moss': '#65873B',
      'Gold': '#BA8F5A',
      'Clay': '#913B2F',
      // Utility colors
      'White': '#FFFFFF',
      'Black': '#000000',
      // Case-insensitive aliases
      'nordshore': '#00393F',
      'sky': '#C9E4EC',
      'sand': '#FFF1E2',
      'beige': '#EFE1DC',
      'moss': '#65873B',
      'gold': '#BA8F5A',
      'clay': '#913B2F'
    };
    return colorMap[colorName] || null;
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
   * Now targets the new indesign_mcp_http_bridge.py on port 8012
   */
  async sendJobToMCP(job, retries = 3) {
    // Convert orchestrator job format to bridge-compatible format
    const bridgeJob = {
      jobId: job.jobId || `job-${Date.now()}`,
      jobType: job.jobType,
      humanSession: job.humanSession !== false,
      worldClass: job.worldClass || false,
      templateId: job.templateId,
      output: job.output || {},
      export: job.export || {},
      qa: job.qa || {},
      data: job.data || {}
    };

    const data = JSON.stringify(bridgeJob);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`[MCP Worker] Sending job to HTTP bridge (attempt ${attempt}/${retries})...`);

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
                } else if (res.statusCode === 422) {
                  // QA validation failed
                  const parsed = JSON.parse(responseData);
                  reject(new Error(`QA validation failed: ${JSON.stringify(parsed.detail?.qa_failed || parsed)}`));
                } else if (res.statusCode === 503) {
                  // Service unavailable - may retry
                  reject(new Error(`MCP bridge unavailable (503): ${responseData}`));
                } else {
                  reject(new Error(`MCP bridge returned status ${res.statusCode}: ${responseData}`));
                }
              } catch (parseError) {
                reject(new Error(`Failed to parse bridge response: ${parseError.message}`));
              }
            });
          });

          req.on('error', (error) => {
            reject(new Error(`Failed to connect to MCP bridge at ${this.host}:${this.port}: ${error.message}`));
          });

          req.on('timeout', () => {
            req.destroy();
            reject(new Error(`MCP bridge request timed out after ${this.timeout}ms`));
          });

          req.write(data);
          req.end();
        });

        // Success!
        console.log('[MCP Worker] ✅ Job completed via HTTP bridge');
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
   * Verify that an export preset exists in InDesign
   * Falls back to "Press Quality" if preset not found
   * @param {string} wantedPreset - Desired preset name
   * @returns {Promise<string>} - Verified preset name
   */
  async verifyExportPreset(wantedPreset) {
    try {
      console.log(`[MCP Worker] Verifying export preset: "${wantedPreset}"`);

      // Try to list available presets from MCP server
      const presets = await this.listPdfPresets();

      if (presets && presets.includes(wantedPreset)) {
        console.log(`[MCP Worker] ✅ Export preset verified: "${wantedPreset}"`);
        return wantedPreset;
      } else {
        const fallback = "Press Quality";
        console.warn(`[MCP Worker] ⚠️  Preset "${wantedPreset}" not found`);
        console.warn(`[MCP Worker] Using fallback preset: "${fallback}"`);
        console.warn(`[MCP Worker] Available presets: ${presets ? presets.join(', ') : 'unable to list'}`);
        return fallback;
      }
    } catch (error) {
      // If preset listing fails, use fallback
      const fallback = "Press Quality";
      console.warn(`[MCP Worker] Failed to verify preset: ${error.message}`);
      console.warn(`[MCP Worker] Using fallback preset: "${fallback}"`);
      return fallback;
    }
  }

  /**
   * List available PDF export presets from InDesign via MCP
   * @returns {Promise<string[]>} - Array of preset names
   */
  async listPdfPresets() {
    try {
      const result = await new Promise((resolve, reject) => {
        const options = {
          hostname: this.host,
          port: this.port,
          path: '/api/presets',
          method: 'GET',
          timeout: 5000
        };

        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode === 200) {
              try {
                const parsed = JSON.parse(data);
                resolve(parsed.presets || []);
              } catch (parseError) {
                reject(new Error('Failed to parse presets response'));
              }
            } else {
              reject(new Error(`Failed to list presets: HTTP ${res.statusCode}`));
            }
          });
        });

        req.on('error', (error) => reject(error));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Preset listing timeout'));
        });

        req.end();
      });

      return result;
    } catch (error) {
      console.warn(`[MCP Worker] Failed to list PDF presets: ${error.message}`);
      return null;
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
