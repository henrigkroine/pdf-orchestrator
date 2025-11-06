/**
 * MCP Worker
 *
 * Connects to local MCP server to automate InDesign/Illustrator
 * Used for human-session jobs requiring interactive Adobe apps
 */

const http = require('http');

class MCPWorker {
  constructor(config) {
    this.host = config.host || process.env.MCP_SERVER_HOST || 'localhost';
    this.port = config.port || process.env.MCP_SERVER_PORT || 8012;
    this.protocol = config.protocol || 'http';
    this.timeout = config.timeout || 300000; // 5 minutes default

    console.log(`[MCP Worker] Initialized: ${this.protocol}://${this.host}:${this.port}`);
  }

  /**
   * Execute job via MCP server
   */
  async execute(job) {
    console.log('[MCP Worker] Starting job execution...');

    try {
      // Determine which Adobe application to use
      const app = this.getApplicationFromTemplate(job.templateId);

      // Send job ticket to MCP server
      const result = await this.sendJobToMCP({
        application: app,
        template: job.templateId,
        data: job.data,
        output: job.output
      });

      console.log('[MCP Worker] Job completed successfully');
      return {
        status: 'success',
        worker: 'mcp',
        result: result
      };

    } catch (error) {
      console.error('[MCP Worker] Job failed:', error.message);
      throw error;
    }
  }

  /**
   * Determine which Adobe app to use based on template
   */
  getApplicationFromTemplate(templateId) {
    // In production, lookup template registry
    // For now, simple heuristic
    if (templateId.includes('report')) {
      return 'indesign';
    } else if (templateId.includes('campaign')) {
      return 'illustrator';
    }
    return 'indesign'; // default
  }

  /**
   * Send job ticket to MCP server
   */
  async sendJobToMCP(jobTicket) {
    return new Promise((resolve, reject) => {
      const data = JSON.stringify(jobTicket);

      const options = {
        hostname: this.host,
        port: this.port,
        path: '/api/jobs',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length
        },
        timeout: this.timeout
      };

      const req = http.request(options, (res) => {
        let responseData = '';

        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(JSON.parse(responseData));
          } else {
            reject(new Error(`MCP server returned status ${res.statusCode}: ${responseData}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Failed to connect to MCP server: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('MCP server request timed out'));
      });

      req.write(data);
      req.end();
    });
  }

  /**
   * Check if MCP server is available
   */
  async healthCheck() {
    try {
      await this.sendJobToMCP({ action: 'ping' });
      return true;
    } catch (error) {
      console.warn('[MCP Worker] Health check failed:', error.message);
      return false;
    }
  }
}

module.exports = MCPWorker;
