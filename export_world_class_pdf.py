#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Export World-Class Document to PDF
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
    if response.get("status") != "SUCCESS":
        print(f"WARNING: Command {action} response: {response}")
    return response

print("\n" + "="*80)
print("EXPORTING WORLD-CLASS DOCUMENT TO PDF")
print("="*80)

# Create exports directory if it doesn't exist
os.makedirs("exports", exist_ok=True)

# Generate output filename - use simple filename without path
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
pdf_filename = f"WorldClass_TEEI_AWS_{timestamp}.pdf"
pdf_path = pdf_filename  # Just the filename, let InDesign handle the path

print(f"\nExporting to: {pdf_path}")
print("Using preset: High Quality Print")

# Export to PDF
response = cmd("exportPDF", {
    "outputPath": pdf_path,
    "preset": "High Quality Print",
    "viewPDF": False,
    "options": {
        "exportReaderSpreads": False,
        "generateThumbnails": True,
        "optimizePDF": True,
        "viewPDFAfterExporting": False
    }
})

if response.get("response", {}).get("success"):
    print(f"\n[SUCCESS] PDF exported successfully!")
    print(f"Location: {pdf_path}")

    # Get file size
    if os.path.exists(pdf_path):
        size = os.path.getsize(pdf_path) / (1024 * 1024)  # Convert to MB
        print(f"File size: {size:.2f} MB")

    print("\n" + "="*80)
    print("EXPORT COMPLETE!")
    print("="*80)
    print("\nNext steps:")
    print(f"  1. View PDF: start \"\" \"{pdf_path}\"")
    print(f"  2. Validate: python validate_document.py \"{pdf_path}\"")
    print("  3. Preview: python preview_server.py")

else:
    print(f"\n[ERROR] PDF export failed")
    print(f"Response: {response}")

print("\n" + "="*80)