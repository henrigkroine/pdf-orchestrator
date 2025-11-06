#!/usr/bin/env python3
"""
Check what's actually in InDesign right now
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
    return response

print("\n" + "="*80)
print("CHECKING INDESIGN STATUS")
print("="*80 + "\n")

# Ping to see if connected
response = cmd("ping", {})
print(f"Connection: {response.get('status')}")

# Try to get document info
response = cmd("getDocumentInfo", {})
print(f"\nDocument Info:")
print(f"  Status: {response.get('status')}")
if response.get('status') == 'SUCCESS':
    info = response.get('response', {})
    print(f"  Document: {info}")
else:
    print(f"  Message: {response.get('message')}")

print("\n" + "="*80)
