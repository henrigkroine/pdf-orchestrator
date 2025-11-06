#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Export TEEI AWS Partnership Brief to PDF
"""

import sys
import os
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    ⚠️  {action}: {response.get('message')}")
        raise Exception(f"Command failed: {action}")
    return response

print("\n" + "="*80)
print("EXPORTING TEEI AWS PARTNERSHIP BRIEF TO PDF")
print("="*80 + "\n")

# Create exports directory if it doesn't exist
os.makedirs("T:/Projects/pdf-orchestrator/exports", exist_ok=True)

# Export to PDF
try:
    print("📤 Exporting PDF...")
    result = cmd("exportPDF", {
        "outputPath": "T:/Projects/pdf-orchestrator/exports/TEEI_AWS_Partnership_Brief.pdf",
        "preset": "High Quality Print"
    })

    print("\n" + "="*80)
    print("✅ SUCCESS! PDF exported to:")
    print("T:/Projects/pdf-orchestrator/exports/TEEI_AWS_Partnership_Brief.pdf")
    print("="*80 + "\n")

except Exception as e:
    print(f"\n❌ Export failed: {e}")
    print("\nManual export required:")
    print("1. In InDesign: File → Export → Adobe PDF (Print)")
    print("2. Choose preset: High Quality Print")
    print("3. Save as: TEEI_AWS_Partnership_Brief.pdf")
