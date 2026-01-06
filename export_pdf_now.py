#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Quick export of current InDesign document to PDF"""

import sys
import os
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

# Configure socket client
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
init(APPLICATION, socket_client)

print("Exporting current InDesign document to PDF...")

# Export with simpler parameters (avoid includeMarks/useDocBleed which might not be supported)
command = createCommand("exportPDF", {
    "outputPath": "T:/Projects/pdf-orchestrator/exports/teei-partnership-showcase-premium.pdf",
    "preset": "High Quality Print"
})

result = sendCommand(command)

print(f"\nResult: {result}")

if isinstance(result, dict):
    status = result.get('status', '')
    if status == 'SUCCESS':
        print("\n✅ PDF EXPORTED SUCCESSFULLY!")
        print("Location: T:\\Projects\\pdf-orchestrator\\exports\\teei-partnership-showcase-premium.pdf")
    else:
        print(f"\n❌ Export failed: {result.get('message', 'Unknown error')}")
else:
    print(f"\n⚠️  Unexpected response: {result}")
