/**
 * MCP Manager - Unified interface for all MCP servers
 * Orchestrates communication between InDesign, Figma, DALL-E, and other MCP servers
 */

const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class MCPManager {
    constructor(configPath = './mcp-servers.config.json') {
        this.configPath = configPath;
        this.config = null;
        this.servers = new Map();
        this.activeConnections = new Map();
    }

    /**
     * Initialize the MCP manager
     */
    async initialize() {
        console.log('[MCP Manager] Initializing...');

        // Load configuration
        const configData = await fs.readFile(this.configPath, 'utf-8');
        this.config = JSON.parse(configData);

        // Register all active servers
        for (const [name, config] of Object.entries(this.config.mcpServers)) {
            if (config.status === 'active') {
                await this.registerServer(name, config);
            }
        }

        console.log(`[MCP Manager] Initialized with ${this.servers.size} active servers`);
    }

    /**
     * Register a single MCP server
     */
    async registerServer(name, config) {
        console.log(`[MCP Manager] Registering server: ${name}`);

        this.servers.set(name, {
            name: config.name,
            type: config.type,
            url: config.url,
            capabilities: config.capabilities,
            priority: config.priority,
            config: config.config || {},
            status: 'registered'
        });

        // Start local servers if needed
        if (config.type === 'local' && name === 'indesign') {
            // InDesign server is already started by start-mcp-stack.ps1
            this.activeConnections.set(name, {
                bridge: config.bridge,
                proxy: config.url
            });
        }

        console.log(`[MCP Manager] ✓ ${name} registered`);
    }

    /**
     * Invoke a tool on a specific MCP server
     */
    async invoke(serverName, tool, params = {}) {
        const server = this.servers.get(serverName);
        if (!server) {
            throw new Error(`Server not found: ${serverName}`);
        }

        console.log(`[MCP Manager] Invoking ${serverName}.${tool}`, params);

        switch (serverName) {
            case 'indesign':
                return await this.invokeInDesign(tool, params);
            case 'figma':
                return await this.invokeFigma(tool, params);
            case 'dalle':
                return await this.invokeDallE(tool, params);
            case 'github':
                return await this.invokeGitHub(tool, params);
            case 'pdfco':
                return await this.invokePDFco(tool, params);
            default:
                throw new Error(`Server implementation not found: ${serverName}`);
        }
    }

    /**
     * InDesign MCP invocation (via HTTP bridge)
     */
    async invokeInDesign(tool, params) {
        const connection = this.activeConnections.get('indesign');
        if (!connection) {
            throw new Error('InDesign server not connected');
        }

        // Map tool names to InDesign commands
        const commandMap = {
            'openTemplate': 'openTemplate',
            'createDocument': 'createDocument',
            'bindData': 'bindData',
            'placeImage': 'placeImage',
            'applyBrandColors': 'applyColors',
            'exportPDF': 'exportDocument'
        };

        const command = commandMap[tool];
        if (!command) {
            throw new Error(`Unknown InDesign tool: ${tool}`);
        }

        // Send job to HTTP bridge
        const job = {
            jobId: `mcp-${Date.now()}`,
            jobType: 'partnership',
            humanSession: false,
            worldClass: true,
            templateId: params.templateId || 'partnership-v1',
            data: params,
            output: { format: 'pdf' },
            export: { pdfPreset: 'High Quality Print' },
            qa: { enabled: true }
        };

        try {
            const response = await axios.post(`${connection.bridge}/api/jobs`, job, {
                timeout: 120000,
                headers: { 'Content-Type': 'application/json' }
            });

            return response.data;
        } catch (error) {
            throw new Error(`InDesign invocation failed: ${error.message}`);
        }
    }

    /**
     * Figma MCP invocation (design token extraction)
     */
    async invokeFigma(tool, params) {
        const server = this.servers.get('figma');
        const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

        if (!figmaToken) {
            throw new Error('FIGMA_ACCESS_TOKEN not set');
        }

        if (tool === 'extractDesignTokens') {
            const fileId = params.fileId || server.config.fileId;
            const url = `https://api.figma.com/v1/files/${fileId}`;

            try {
                const response = await axios.get(url, {
                    headers: {
                        'X-Figma-Token': figmaToken
                    }
                });

                // Extract color styles
                const colors = this.extractColors(response.data);
                const typography = this.extractTypography(response.data);

                return {
                    colors,
                    typography,
                    source: 'figma',
                    fileId
                };
            } catch (error) {
                throw new Error(`Figma invocation failed: ${error.message}`);
            }
        }

        throw new Error(`Unknown Figma tool: ${tool}`);
    }

    /**
     * DALL-E MCP invocation (image generation)
     */
    async invokeDallE(tool, params) {
        const openaiKey = process.env.OPENAI_API_KEY;

        if (!openaiKey) {
            throw new Error('OPENAI_API_KEY not set');
        }

        if (tool === 'generateHeroImage' || tool === 'generate') {
            const url = 'https://api.openai.com/v1/images/generations';

            try {
                const response = await axios.post(url, {
                    model: 'dall-e-3',
                    prompt: params.prompt,
                    n: 1,
                    size: params.size || '1792x1024',
                    quality: params.quality || 'hd',
                    style: params.style || 'natural'
                }, {
                    headers: {
                        'Authorization': `Bearer ${openaiKey}`,
                        'Content-Type': 'application/json'
                    }
                });

                const imageUrl = response.data.data[0].url;

                // Download image
                const imageResponse = await axios.get(imageUrl, {
                    responseType: 'arraybuffer'
                });

                // Save to temp directory
                const imagePath = path.join(__dirname, 'temp', `dalle-${Date.now()}.png`);
                await fs.mkdir(path.dirname(imagePath), { recursive: true });
                await fs.writeFile(imagePath, imageResponse.data);

                return {
                    imagePath,
                    imageUrl,
                    prompt: params.prompt,
                    revisedPrompt: response.data.data[0].revised_prompt
                };
            } catch (error) {
                throw new Error(`DALL-E invocation failed: ${error.message}`);
            }
        }

        throw new Error(`Unknown DALL-E tool: ${tool}`);
    }

    /**
     * GitHub MCP invocation (version control)
     */
    async invokeGitHub(tool, params) {
        const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

        if (!githubToken) {
            throw new Error('GITHUB_PERSONAL_ACCESS_TOKEN not set');
        }

        const server = this.servers.get('github');
        const { owner, repo } = server.config;

        if (tool === 'createCommit') {
            // Implement git commit via GitHub API
            console.log('[GitHub] Creating commit:', params);
            return { success: true, sha: 'abc123' };
        }

        if (tool === 'createPR') {
            const url = `https://api.github.com/repos/${owner}/${repo}/pulls`;

            try {
                const response = await axios.post(url, {
                    title: params.title,
                    body: params.body,
                    head: params.branch,
                    base: params.baseBranch || 'main'
                }, {
                    headers: {
                        'Authorization': `Bearer ${githubToken}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });

                return response.data;
            } catch (error) {
                throw new Error(`GitHub invocation failed: ${error.message}`);
            }
        }

        throw new Error(`Unknown GitHub tool: ${tool}`);
    }

    /**
     * PDF.co MCP invocation (PDF operations)
     */
    async invokePDFco(tool, params) {
        const pdfcoKey = process.env.PDFCO_API_KEY;

        if (!pdfcoKey) {
            throw new Error('PDFCO_API_KEY not set');
        }

        if (tool === 'pdfToJSON') {
            const url = 'https://api.pdf.co/v1/pdf/convert/to/json';

            try {
                const response = await axios.post(url, {
                    url: params.pdfUrl,
                    async: false
                }, {
                    headers: {
                        'x-api-key': pdfcoKey,
                        'Content-Type': 'application/json'
                    }
                });

                return response.data;
            } catch (error) {
                throw new Error(`PDF.co invocation failed: ${error.message}`);
            }
        }

        throw new Error(`Unknown PDF.co tool: ${tool}`);
    }

    /**
     * Execute a complete workflow
     */
    async executeWorkflow(workflowName, contextData = {}) {
        const workflow = this.config.workflows[workflowName];
        if (!workflow) {
            throw new Error(`Workflow not found: ${workflowName}`);
        }

        console.log(`[MCP Manager] Executing workflow: ${workflow.name}`);
        const results = {};

        for (let i = 0; i < workflow.steps.length; i++) {
            const step = workflow.steps[i];
            console.log(`[MCP Manager] Step ${i + 1}/${workflow.steps.length}: ${step.server}.${step.action}`);

            try {
                // Replace param references with actual data
                const params = this.resolveParams(step.params, results, contextData);

                // Execute the step
                const result = await this.invoke(step.server, step.action, params);

                // Store result with step key
                const resultKey = `${step.server}-${step.action}`;
                results[resultKey] = result;

                console.log(`[MCP Manager] ✓ Step ${i + 1} completed`);
            } catch (error) {
                console.error(`[MCP Manager] ✗ Step ${i + 1} failed:`, error.message);
                throw error;
            }
        }

        console.log(`[MCP Manager] Workflow completed: ${workflow.name}`);
        return results;
    }

    /**
     * Resolve parameter references in workflow steps
     */
    resolveParams(params, results, contextData) {
        const resolved = {};

        for (const [key, value] of Object.entries(params)) {
            if (typeof value === 'string' && value.includes('-')) {
                // Check if it's a reference to a previous result
                if (results[value]) {
                    resolved[key] = results[value];
                } else if (contextData[value]) {
                    resolved[key] = contextData[value];
                } else {
                    resolved[key] = value;
                }
            } else {
                resolved[key] = value;
            }
        }

        return resolved;
    }

    /**
     * Extract colors from Figma design file
     */
    extractColors(figmaData) {
        // Implement Figma color extraction
        return {
            primary: '#00393F',    // Nordshore
            secondary: '#C9E4EC',  // Sky
            accent: '#BA8F5A',     // Gold
            neutral: '#FFF1E2'     // Sand
        };
    }

    /**
     * Extract typography from Figma design file
     */
    extractTypography(figmaData) {
        // Implement Figma typography extraction
        return {
            headline: { family: 'Lora', weight: 'Bold', size: 42 },
            body: { family: 'Roboto Flex', weight: 'Regular', size: 11 }
        };
    }

    /**
     * Get server status
     */
    getServerStatus(serverName) {
        const server = this.servers.get(serverName);
        if (!server) {
            return { status: 'not_found' };
        }

        return {
            name: server.name,
            status: server.status,
            capabilities: server.capabilities,
            priority: server.priority
        };
    }

    /**
     * List all registered servers
     */
    listServers() {
        return Array.from(this.servers.entries()).map(([name, server]) => ({
            id: name,
            name: server.name,
            status: server.status,
            capabilities: server.capabilities,
            priority: server.priority
        }));
    }
}

// Export for use in orchestrator
module.exports = MCPManager;

// CLI usage
if (require.main === module) {
    const manager = new MCPManager();

    manager.initialize().then(async () => {
        console.log('\n[MCP Manager] Ready!');
        console.log('[MCP Manager] Registered servers:');
        manager.listServers().forEach(server => {
            console.log(`  - ${server.name} (${server.id}) - ${server.status}`);
        });

        // Test workflow execution
        if (process.argv[2] === 'test') {
            console.log('\n[MCP Manager] Running test workflow...');
            try {
                const results = await manager.executeWorkflow('generate-partnership-pdf', {
                    partnerName: 'AWS',
                    year: 2025
                });
                console.log('\n[MCP Manager] Test workflow completed!');
                console.log(JSON.stringify(results, null, 2));
            } catch (error) {
                console.error('\n[MCP Manager] Test workflow failed:', error.message);
                process.exit(1);
            }
        }
    }).catch(error => {
        console.error('[MCP Manager] Initialization failed:', error);
        process.exit(1);
    });
}
