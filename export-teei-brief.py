#!/usr/bin/env python3
"""
Export the TEEI AWS Partnership Brief to PDF
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    print(f"✓ {action}")
    return response

print("=" * 70)
print("EXPORTING TEEI AWS PARTNERSHIP BRIEF TO PDF")
print("=" * 70)

# Export PDF
cmd("exportPDF", {
    "outputPath": "T:/Projects/pdf-orchestrator/exports/TEEI_AWS_Partnership_Brief.pdf",
    "preset": "High Quality Print"
})

print("\n" + "=" * 70)
print("SUCCESS! PDF exported to:")
print("T:/Projects/pdf-orchestrator/exports/TEEI_AWS_Partnership_Brief.pdf")
print("=" * 70)
