// Test MCP connection with a ping command
const axios = require('axios');

async function testPing() {
    console.log('Testing MCP connection with ping command...\n');

    const job = {
        jobId: 'test-ping-' + Date.now(),
        jobType: 'test',
        humanSession: false,
        worldClass: false,
        templateId: 'minimal-test',
        output: { format: 'pdf' },
        export: { pdfPreset: 'High Quality Print' },
        qa: { enabled: false },
        data: {
            width: 612,
            height: 792,
            pages: 1,
            testText: 'MCP Connection Test'
        }
    };

    try {
        console.log('Sending test job to HTTP bridge at http://localhost:8012/api/jobs');
        const response = await axios.post('http://localhost:8012/api/jobs', job, {
            timeout: 45000,
            headers: { 'Content-Type': 'application/json' }
        });

        console.log('\n✅ SUCCESS! MCP connection is working!');
        console.log('Response:', JSON.stringify(response.data, null, 2));

        if (response.data.exportPath) {
            console.log(`\n📄 PDF exported to: ${response.data.exportPath}`);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.response?.data || error.message);

        if (error.code === 'ECONNREFUSED') {
            console.log('\n⚠️  HTTP bridge is not running on port 8012');
            console.log('Start it with: cd mcp-local && .venv\\Scripts\\python.exe indesign_mcp_http_bridge.py');
        } else if (error.message.includes('timeout')) {
            console.log('\n⚠️  Request timed out - InDesign is not responding to commands');
            console.log('Make sure:');
            console.log('1. InDesign is running');
            console.log('2. UXP plugin is loaded and connected');
            console.log('3. Plugin is from: D:\\Dev\\VS Projects\\Projects\\pdf-orchestrator\\adb-mcp\\uxp\\id');
        }
    }
}

testPing();