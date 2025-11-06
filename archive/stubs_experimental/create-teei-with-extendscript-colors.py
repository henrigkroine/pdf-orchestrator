#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI AWS Partnership Brief with ExtendScript Color Fix
Creates the document structure, then applies colors via ExtendScript
"""

import sys
import os
import io
import time

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
    return response

print("\n" + "="*80)
print("TEEI AWS PARTNERSHIP BRIEF - WITH EXTENDSCRIPT COLOR FIX")
print("="*80 + "\n")

# First, run the original script to create the document structure
with open('create-teei-aws-PROPER.py', 'r', encoding='utf-8') as f:
    exec(f.read())

print("\n" + "="*80)
print("APPLYING COLORS VIA EXTENDSCRIPT WORKAROUND...")
print("="*80 + "\n")

# Give InDesign a moment to update
time.sleep(1)

# Now apply colors using ExtendScript
response = cmd("applyColorsViaExtendScript", {})

if response.get("success"):
    print("✅ Colors applied successfully via ExtendScript!")
else:
    print(f"❌ Failed to apply colors: {response.get('message')}")

print("\n" + "="*80)
print("COMPLETE! Check InDesign - colors should now be visible!")
print("Press 'W' to toggle preview mode")
print("Then: File → Export → Adobe PDF (Print)")
print("="*80 + "\n")