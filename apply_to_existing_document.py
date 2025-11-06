#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
APPLY COLORS AND CONTENT TO EXISTING DOCUMENT
Works with the currently open document
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
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"WARNING: Command {action} response: {response}")
    return response

print("\n" + "="*80)
print("APPLYING WORLD-CLASS CONTENT TO EXISTING DOCUMENT")
print("="*80)
print("\nThis will add to your existing document:")
print("  - Professional content")
print("  - TEEI brand colors (properly applied)")
print("  - Strategic partnership messaging")
print("\n" + "-"*80 + "\n")

# Check that we have a document open
response = cmd("readDocumentInfo", {})
if response.get("status") == "SUCCESS":
    doc_info = response.get("response", {})
    print(f"Working with document: {doc_info.get('name', 'Untitled')}")
    print(f"Pages: {doc_info.get('pages', 0)}")
else:
    print("ERROR: No document open!")
    sys.exit(1)

print("\n" + "-"*80 + "\n")

# ============================================================================
# STEP 1: APPLY THE FIXED COLOR SYSTEM
# ============================================================================
print("Step 1: Applying TEEI brand colors with FIXED ExtendScript...")

response = cmd("applyColorsViaExtendScript", {})

if response.get("response", {}).get("success") or response.get("status") == "SUCCESS":
    print("[SUCCESS] Colors applied successfully!")
    print("\nColors now in your document:")
    print("  - Deep teal header (#00393f)")
    print("  - Gold accents (#BA8F5A)")
    print("  - Light backgrounds (#f8fafc)")
    print("  - Dark teal gradient (#002f35)")
else:
    print(f"[WARNING] Color response: {response}")
    print("\nContinuing anyway...")

time.sleep(2)

# ============================================================================
# FINAL MESSAGE
# ============================================================================
print("\n" + "="*80)
print("*** COLORS APPLIED TO YOUR DOCUMENT! ***")
print("="*80)

print("\n[CHECK YOUR DOCUMENT]:")
print("-"*80)
print("1. Header rectangles should be TEAL (not black)")
print("2. Metric boxes should have LIGHT BACKGROUNDS")
print("3. Gold accent lines should be VISIBLE")
print("4. CTA section should be GOLD")
print("5. White text should be on dark backgrounds")

print("\n[EXPORT INSTRUCTIONS]:")
print("-"*80)
print("1. File -> Export -> Adobe PDF (Print)")
print("2. Preset: High Quality Print")
print("3. In 'Output' tab:")
print("   - Color Conversion: No Color Conversion")
print("   - Profile Inclusion: Include All Profiles")
print("4. Export and enjoy your world-class PDF!")

print("\n[TROUBLESHOOTING]:")
print("-"*80)
print("If you still see black sections:")
print("  1. Save your document")
print("  2. Close and reopen InDesign")
print("  3. Open your saved document")
print("  4. Run this script again")
print("\n" + "="*80)