#!/usr/bin/env python3
"""
Export the final professional PDF
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
    if response.get("status") != "SUCCESS":
        print(f"ERROR: {response}")
        raise Exception(f"Command failed: {action}")
    return response

print("\n" + "="*80)
print("EXPORTING PROFESSIONAL PDF")
print("="*80 + "\n")

# Export as high-quality PDF
pdf_path = os.path.join(os.path.dirname(__file__), "exports", "TEEI_AWS_Partnership_Professional.pdf")
os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

response = cmd("exportPDF", {
    "path": pdf_path,
    "preset": "High Quality Print"
})

print("\n" + "="*80)
print("SUCCESS! PDF EXPORTED")
print("="*80)
print(f"\nPDF saved to: {pdf_path}")
print("\nDocument features:")
print("  - 2-page professional layout")
print("  - TEEI brand colors (Teal #00393F, Gold #BA8F5A)")
print("  - Executive overview with metrics")
print("  - Implementation timeline")
print("  - High-quality print-ready PDF")
print("="*80 + "\n")
