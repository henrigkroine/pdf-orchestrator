#!/usr/bin/env python3
"""
Apply colors to the professional document and export
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
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("APPLYING COLORS & EXPORTING PROFESSIONAL DOCUMENT")
print("="*80 + "\n")

# Step 1: Apply colors
print("Step 1: Applying colors via ExtendScript...")
response = cmd("applyColorsViaExtendScript", {})

print(f"Color application response: {response.get('status')}")

if response.get("status") != "SUCCESS":
    print(f"ERROR: {response}")
    sys.exit(1)

# Step 2: Run diagnostics
print("\nStep 2: Running diagnostics...")
diag_response = cmd("diagnoseColors", {})

if diag_response.get("status") == "SUCCESS":
    report = diag_response.get("response", {}).get("report", "")
    print(f"Diagnostic: {report}")

# Step 3: Export PDF
print("\nStep 3: Exporting to PDF...")
export_path = os.path.join(os.path.expanduser("~"), "Downloads", "TEEI_Professional_Premium.pdf")

export_response = cmd("exportPDFViaExtendScript", {
    "outputPath": export_path,
    "preset": "[High Quality Print]"
})

print(f"\nExport response: {export_response.get('status')}")

if export_response.get("status") == "SUCCESS":
    print("\n" + "="*80)
    print("[SUCCESS] PROFESSIONAL DOCUMENT EXPORTED!")
    print("="*80)
    print(f"\nLocation: {export_path}")
    print("\nThis professional document features:")
    print("  • Clean, modern layout with proper spacing")
    print("  • Professional metric cards with accent stripes")
    print("  • Business timeline with phase indicators")
    print("  • Data visualizations with progress bars")
    print("  • Proper typography hierarchy")
    print("  • Consistent TEEI brand colors throughout")
    print("  • No crude icons - clean geometric design")
    print("\n" + "="*80)
else:
    print(f"\nERROR: {export_response}")
