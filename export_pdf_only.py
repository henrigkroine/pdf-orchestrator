#!/usr/bin/env python3
"""
Export the currently open InDesign document to PDF (skip save)
"""

import sys
import os
from pathlib import Path

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configuration
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 30

def configure_connection():
    """Configure Socket.IO connection to InDesign proxy"""
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
    init(APPLICATION, socket_client)

def export_pdfs():
    """Export PDFs directly"""
    print("Exporting PDFs from current InDesign document...")

    # Ensure exports directory exists
    exports_dir = Path(__file__).parent / "exports"
    exports_dir.mkdir(exist_ok=True)

    # Export Print PDF
    print_path = str(exports_dir / "TEEI-AWS-Partnership-PRINT.pdf")
    print(f"\n1. Exporting Print PDF to: {print_path}")

    print_cmd = createCommand("exportPDF", {
        "path": print_path,
        "preset": "[PDF/X-4:2010]",
        "includeBleed": True,
        "includeCropMarks": True,
        "colorSpace": "CMYK",
        "resolution": 300
    })

    print_response = sendCommand(print_cmd)

    if print_response.get("status") == "SUCCESS":
        print("   ✓ Print PDF exported (PDF/X-4, 300 DPI, CMYK)")
    else:
        print(f"   ✗ Print PDF failed: {print_response.get('message')}")

    # Export Digital PDF
    digital_path = str(exports_dir / "TEEI-AWS-Partnership-DIGITAL.pdf")
    print(f"\n2. Exporting Digital PDF to: {digital_path}")

    digital_cmd = createCommand("exportPDF", {
        "path": digital_path,
        "preset": "[Smallest File Size]",
        "includeBleed": False,
        "includeCropMarks": False,
        "colorSpace": "RGB",
        "resolution": 150,
        "createTaggedPDF": True,
        "optimizeForWeb": True
    })

    digital_response = sendCommand(digital_cmd)

    if digital_response.get("status") == "SUCCESS":
        print("   ✓ Digital PDF exported (150 DPI, RGB, tagged)")
    else:
        print(f"   ✗ Digital PDF failed: {digital_response.get('message')}")

    print("\n" + "="*70)
    print("EXPORT COMPLETE")
    print("="*70)
    print(f"Files saved to: {exports_dir}")

    return True

def main():
    print("\n" + "="*70)
    print("EXPORT PDFs FROM CURRENT INDESIGN DOCUMENT")
    print("="*70)

    configure_connection()
    export_pdfs()

if __name__ == "__main__":
    main()
