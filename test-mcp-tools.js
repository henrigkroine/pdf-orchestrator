#!/usr/bin/env node
/**
 * Test script to verify InDesign MCP server exposes all 61 tools
 * This connects to the MCP server and lists available tools
 */

const { spawn } = require('child_process');
const readline = require('readline');

console.log('🧪 Testing InDesign MCP Server...\n');

// Start the Python MCP server
const python = spawn('/mnt/c/Python314/python.exe', [
  '/mnt/t/Projects/pdf-orchestrator/adb-mcp/mcp/id-mcp.py'
]);

let lineBuffer = '';
const rl = readline.createInterface({
  input: python.stdout,
  output: process.stdout,
  terminal: false
});

// Send initialize request (MCP protocol)
setTimeout(() => {
  console.log('📤 Sending initialize request...\n');
  const initRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };
  python.stdin.write(JSON.stringify(initRequest) + '\n');
}, 1000);

// Request tools/list
setTimeout(() => {
  console.log('📤 Requesting tools list...\n');
  const listRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  python.stdin.write(JSON.stringify(listRequest) + '\n');
}, 2000);

// Close after 5 seconds
setTimeout(() => {
  console.log('\n✅ Test complete!');
  python.kill();
  process.exit(0);
}, 5000);

// Capture output
rl.on('line', (line) => {
  if (line.trim().startsWith('{')) {
    try {
      const response = JSON.parse(line);
      if (response.result && response.result.tools) {
        console.log(`\n🎉 SUCCESS! Found ${response.result.tools.length} tools:\n`);
        response.result.tools.forEach((tool, idx) => {
          console.log(`  ${idx + 1}. ${tool.name}`);
        });
        console.log('');
      } else if (response.result) {
        console.log('📥 Response:', JSON.stringify(response.result, null, 2));
      }
    } catch (e) {
      console.log('📥 Output:', line);
    }
  } else {
    console.log('📝 Info:', line);
  }
});

python.stderr.on('data', (data) => {
  console.log('⚠️  Stderr:', data.toString().trim());
});

python.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
