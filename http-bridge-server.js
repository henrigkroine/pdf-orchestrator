#!/usr/bin/env node

/**
 * HTTP-to-WebSocket Bridge Server
 *
 * Provides HTTP API on port 8012 for the orchestrator
 * Forwards requests to WebSocket proxy on port 8013
 * Communicates with InDesign UXP Plugin
 */

const express = require('express');
const { io: ioClient } = require('socket.io-client');

const app = express();
app.use(express.json({ limit: '50mb' }));

const PROXY_PORT = 8013;
const BRIDGE_PORT = 8012;

// Connect to WebSocket proxy on port 8013
console.log(`[HTTP Bridge] Connecting to MCP proxy on port ${PROXY_PORT}...`);
const socket = ioClient(`http://localhost:${PROXY_PORT}`, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('connect', () => {
  console.log('[HTTP Bridge] ✅ Connected to MCP proxy on port', PROXY_PORT);
  // Register as BRIDGE role (not executor) - Architecture Fix v2.0
  socket.emit('register', {
    application: 'indesign',
    role: 'bridge'  // This tells the proxy we SEND commands, not EXECUTE them
  });
});

socket.on('disconnect', () => {
  console.warn('[HTTP Bridge] ⚠️  Disconnected from MCP proxy');
});

socket.on('registration_response', (data) => {
  console.log('[HTTP Bridge] Registration confirmed:', data.message);
});

socket.on('connect_error', (error) => {
  console.error('[HTTP Bridge] ❌ Connection error:', error.message);
});

// ============================================================
// PRE-FLIGHT CHECK (Architecture Fix v2.0)
// ============================================================
// Check if an executor (UXP plugin) is connected BEFORE sending commands
// This provides fast-fail instead of waiting 5 minutes for timeout
async function checkExecutorReady() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const resp = await fetch(`http://localhost:${PROXY_PORT}/ready`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const data = await resp.json();
    return data.ready ? { ok: true, executors: data.executors } : { ok: false, error: data };
  } catch (e) {
    if (e.name === 'AbortError') {
      return { ok: false, error: { code: 'PROXY_TIMEOUT', message: 'Proxy health check timeout' } };
    }
    return { ok: false, error: { code: 'PROXY_DOWN', message: e.message } };
  }
}

// Command-specific timeouts (in ms)
// Fast timeouts instead of blanket 5-minute wait
const COMMAND_TIMEOUTS = {
  ping: 5000,
  createDocument: 15000,
  placeText: 20000,
  exportPDF: 120000,
  capturePageScreenshot: 30000,
  loadTemplate: 30000,
  listPresets: 5000,
  default: 30000
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: socket.connected ? 'ok' : 'disconnected',
    connected: socket.connected,
    proxyPort: PROXY_PORT
  });
});

// Submit job endpoint - with pre-flight check and fast timeouts (Architecture Fix v2.0)
app.post('/api/jobs', async (req, res) => {
  const jobTicket = req.body;
  const action = jobTicket.action || jobTicket.command || 'unknown';

  console.log('[HTTP Bridge] Received job request:', {
    application: jobTicket.application,
    action: action
  });

  // ============================================================
  // PRE-FLIGHT CHECK (Architecture Fix v2.0)
  // ============================================================
  // Check if executor is ready BEFORE sending command
  // This provides immediate feedback instead of 5-minute timeout
  const ready = await checkExecutorReady();
  if (!ready.ok) {
    console.error('[HTTP Bridge] ❌ Pre-flight failed:', ready.error);
    return res.status(503).json({
      status: 'ERROR',
      code: ready.error.code || 'NO_EXECUTOR',
      message: ready.error.message,
      action: ready.error.action || 'Load UXP plugin in InDesign and click Connect'
    });
  }

  if (!socket.connected) {
    return res.status(503).json({
      status: 'ERROR',
      code: 'BRIDGE_DISCONNECTED',
      message: 'Bridge not connected to proxy'
    });
  }

  // Generate unique ID for this request
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  jobTicket.requestId = requestId;

  // Send command to InDesign via WebSocket
  socket.emit('command_packet', {
    application: 'indesign',
    command: jobTicket
  });

  // Use command-specific timeout instead of blanket 5 minutes
  const timeout = COMMAND_TIMEOUTS[action] || COMMAND_TIMEOUTS.default;
  console.log(`[HTTP Bridge] Sent ${action} to InDesign, timeout: ${timeout/1000}s`);

  // Wait for response with command-specific timeout
  const responseTimeout = setTimeout(() => {
    socket.off('packet_response', responseHandler);
    console.error(`[HTTP Bridge] ⏱️  ${action} timeout after ${timeout/1000}s`);
    res.status(504).json({
      status: 'ERROR',
      code: 'COMMAND_TIMEOUT',
      message: `${action} timed out after ${timeout/1000}s`,
      action: 'Check InDesign is responsive'
    });
  }, timeout);

  // Listen for response
  const responseHandler = (packet) => {
    // Check if this response is for our request
    if (packet.requestId === requestId || packet.command?.requestId === requestId || !packet.requestId) {
      clearTimeout(responseTimeout);
      socket.off('packet_response', responseHandler);

      // Check for proxy-level errors (NO_EXECUTOR)
      if (packet.status === 'ERROR' && packet.error) {
        console.error('[HTTP Bridge] ❌ Error from proxy:', packet.error.code);
        return res.status(503).json({
          status: 'ERROR',
          code: packet.error.code,
          message: packet.error.message
        });
      }

      console.log('[HTTP Bridge] ✅ Received response from InDesign');

      // Return response to orchestrator
      res.json({
        status: packet.status || 'SUCCESS',
        output: packet.output,
        response: packet.response,
        metadata: packet.metadata,
        error: packet.error
      });
    }
  };

  socket.on('packet_response', responseHandler);
});

// List PDF presets endpoint
app.get('/api/presets', async (req, res) => {
  console.log('[HTTP Bridge] Listing PDF presets...');

  if (!socket.connected) {
    return res.status(503).json({
      error: 'Not connected to MCP proxy'
    });
  }

  const requestId = `preset-${Date.now()}`;

  socket.emit('command_packet', {
    application: 'indesign',
    command: {
      action: 'listPresets',
      requestId: requestId
    }
  });

  const timeout = setTimeout(() => {
    res.status(504).json({ error: 'Timeout listing presets' });
  }, 5000);

  const presetHandler = (packet) => {
    if (packet.requestId === requestId || !packet.requestId) {
      clearTimeout(timeout);
      socket.off('packet_response', presetHandler);

      res.json({
        presets: packet.presets || ['Press Quality', 'High Quality Print']
      });
    }
  };

  socket.on('packet_response', presetHandler);
});

// Start HTTP server
app.listen(BRIDGE_PORT, () => {
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  HTTP-to-WebSocket Bridge Server');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`  HTTP API:      http://localhost:${BRIDGE_PORT}`);
  console.log(`  Proxy Target:  ws://localhost:${PROXY_PORT}`);
  console.log(`  Status:        ${socket.connected ? '✅ Connected' : '⏳ Connecting...'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('Endpoints:');
  console.log('  GET  /health       - Health check');
  console.log('  POST /api/jobs     - Submit InDesign job');
  console.log('  GET  /api/presets  - List PDF export presets');
  console.log('');
});
