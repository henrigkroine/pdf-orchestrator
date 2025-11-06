#!/usr/bin/env python3
"""
Export the current InDesign document as PDF RIGHT NOW
So we can see what's actually there!
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
    return response

print("\n" + "="*80)
print("EXPORTING CURRENT INDESIGN DOCUMENT AS PDF")
print("="*80 + "\n")

export_path = "T:/Projects/pdf-orchestrator/exports/indesign-CURRENT-STATE.pdf"

print(f"Exporting to: {export_path}")

response = cmd("exportPDF", {
    "preset": "[High Quality Print]",
    "outputPath": export_path,
    "pageRange": "all"
})

if response.get("status") == "SUCCESS":
    print(f"\nSUCCESS! PDF exported!")
    print(f"Opening: {export_path}")
    os.startfile(export_path)
else:
    print(f"\nFailed: {response}")

print("\n" + "="*80)
