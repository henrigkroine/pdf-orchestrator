#!/usr/bin/env python3
"""
Run color diagnostics on the active document
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
print("COLOR DIAGNOSTICS - CHECKING ALL RECTANGLES")
print("="*80 + "\n")

response = cmd("diagnoseColors", {})

print("Response:", response)

if response.get("status") == "SUCCESS":
    report = response.get("response", {}).get("report", "No report available")
    print("\n" + "="*80)
    print("DIAGNOSTIC REPORT:")
    print("="*80)
    print(report)
    print("\n" + "="*80)
else:
    print(f"\n[ERROR] Diagnostic failed: {response}")

print("\nNext steps:")
print("- If there are BLACK rectangles, I'll update the ExtendScript rules")
print("- If there are large NO FILL rectangles, I'll add rules for those")
print("- Once all rectangles are OK, we'll export the final PDF")
print("="*80 + "\n")
