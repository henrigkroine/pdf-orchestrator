#!/usr/bin/env python3
"""
Simple test script to create an InDesign document
Bypasses MCP and communicates directly with the proxy server
"""

import sys
sys.path.insert(0, r'T:\Projects\pdf-orchestrator\adb-mcp\mcp')

import socket_client

# Configure the socket client
socket_client.configure(
    app="indesign",
    url='http://localhost:8013',
    timeout=20
)

# Create the command manually
command = {
    "application": "indesign",
    "action": "createDocument",
    "options": {
        "intent": "WEB_INTENT",
        "pageWidth": 800,
        "pageHeight": 600,
        "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
        "columns": {"count": 1, "gutter": 12},
        "pagesPerDocument": 1,
        "pagesFacing": False
    }
}

print("Sending command to InDesign...")
print(f"Command: {command}")

# Send the command
result = socket_client.send_message_blocking(command)

print("\nResult:")
print(result)
