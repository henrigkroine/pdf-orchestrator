#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Save and Export World-Class Document to PDF
"""

import sys
import os
import time
from datetime import datetime

# Add InDesign automation modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configuration
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

# Initialize connection
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    print(f"Command: {action}")
    print(f"Response status: {response.get('status')}")
    if response.get("status") != "SUCCESS":
        print(f"Response details: {response}")
    return response

print("\n" + "="*80)
print("SAVING AND EXPORTING WORLD-CLASS DOCUMENT")
print("="*80)

# First, try to get document info
print("\nStep 1: Getting document info...")
response = cmd("readDocumentInfo", {})

if response.get("status") == "SUCCESS":
    doc_info = response.get("response", {})
    print(f"Document name: {doc_info.get('name', 'Untitled')}")
    print(f"Pages: {doc_info.get('pages', 'Unknown')}")

# Try a simpler export without save
print("\nStep 2: Attempting direct PDF export...")

# Use desktop path for export
desktop_path = os.path.expanduser("~/Desktop")
pdf_filename = f"TEEI_WorldClass_{datetime.now().strftime('%H%M%S')}.pdf"
full_path = os.path.join(desktop_path, pdf_filename)

print(f"Export target: {full_path}")

# Try with minimal options
response = cmd("exportPDF", {
    "outputPath": full_path,
    "preset": "[High Quality Print]"  # Try with brackets
})

if response.get("status") == "SUCCESS":
    print(f"\n[SUCCESS] PDF exported!")
    print(f"Location: {full_path}")
else:
    # Try alternative approach
    print("\nTrying alternative export method...")

    # Just try with the filename only
    response = cmd("exportPDF", {
        "outputPath": pdf_filename
    })

    if response.get("status") == "SUCCESS":
        print(f"\n[SUCCESS] PDF exported to default location!")
        print(f"Check InDesign's default export folder")
    else:
        print("\n[WARNING] Automatic export failed")
        print("Manual export instructions:")
        print("1. In InDesign, go to File > Export")
        print("2. Choose Adobe PDF (Print)")
        print("3. Select 'High Quality Print' preset")
        print("4. Save as 'WorldClass_TEEI_AWS.pdf'")

print("\n" + "="*80)
print("Next steps:")
print("1. View the exported PDF")
print("2. Run: python validate_document.py [path_to_pdf]")
print("3. Run: python preview_server.py")
print("="*80)