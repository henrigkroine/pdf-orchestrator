#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Apply colors to the existing InDesign document using ExtendScript
This is a workaround for the UXP color assignment bug
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
        print(f"    [WARNING] {action}: {response.get('message')}")
    return response

print("\n" + "="*80)
print("APPLYING COLORS VIA EXTENDSCRIPT")
print("="*80 + "\n")

# Apply colors using ExtendScript
response = cmd("applyColorsViaExtendScript", {})

if response.get("response", {}).get("success"):
    print("SUCCESS! Colors applied via ExtendScript!")
    print("\nThe TEEI AWS Partnership Brief should now have:")
    print("  - Deep Teal header box")
    print("  - Gold divider lines")
    print("  - Light teal metric and contact boxes")
else:
    print(f"Failed to apply colors: {response}")

print("\n" + "="*80)
print("Next steps:")
print("  1. Press 'W' in InDesign to toggle preview mode")
print("  2. File -> Export -> Adobe PDF (Print)")
print("  3. Save as: TEEI_AWS_Partnership_Brief.pdf")
print("="*80 + "\n")