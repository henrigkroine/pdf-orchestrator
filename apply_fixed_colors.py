#!/usr/bin/env python3
"""
Apply Fixed Colors to InDesign Document
IMPORTANT: Reload the UXP plugin first in InDesign!
"""

import sys
import os
import time

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
print("APPLYING FIXED COLORS TO DOCUMENT")
print("="*80)
print("\n⚠️  IMPORTANT: Make sure you've reloaded the UXP plugin!")
print("   In UXP Developer Tool → Select plugin → Click 'Reload'")
print("\nPress Enter when ready...")
input()

print("\nApplying comprehensive color fix...")

# Apply colors using the updated ExtendScript
response = cmd("applyColorsViaExtendScript", {})

print(f"Status: {response.get('status')}")

if response.get("status") == "SUCCESS":
    print("\n" + "="*80)
    print("✅ COLORS APPLIED SUCCESSFULLY!")
    print("="*80)
    print("\nColors now applied:")
    print("  • Teal header (#00393f)")
    print("  • Dark teal gradient overlay")
    print("  • Gold accent lines (#BA8F5A)")
    print("  • Light background for metric boxes (#f8fafc)")
    print("  • Gold CTA section")
    print("  • White logo placeholder")

    print("\n📋 EXPORT INSTRUCTIONS:")
    print("-"*80)
    print("1. In InDesign: File → Export → Adobe PDF (Print)")
    print("2. Preset: High Quality Print")
    print("3. CRITICAL - In the Export Adobe PDF dialog:")
    print("   • Click 'Output' in left panel")
    print("   • Color Conversion: No Color Conversion")
    print("   • Profile Inclusion Policy: Include All Profiles")
    print("4. Click Export")
    print("\nThis will preserve all the TEEI brand colors in the PDF!")
else:
    print(f"\nError: {response.get('response', response)}")
    print("\n⚠️  If this failed, make sure:")
    print("  1. InDesign is running")
    print("  2. The document is open")
    print("  3. The UXP plugin was reloaded after editing")

print("\n" + "="*80)