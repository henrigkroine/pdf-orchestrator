#!/usr/bin/env python3
"""Test InDesign connection"""

import sys
import os
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=10)
init(APPLICATION, socket_client)

print("\nTesting InDesign connection...")
print("-" * 50)

# Try to get document info
try:
    response = sendCommand(createCommand("readDocumentInfo", {}))
    print(f"Connection status: {response.get('status', 'UNKNOWN')}")

    if response.get("status") == "SUCCESS":
        print("[SUCCESS] InDesign is connected and responding!")
        doc_info = response.get("response", {})
        if doc_info:
            print(f"Active document: {doc_info.get('name', 'Untitled')}")
    else:
        print("[ERROR] InDesign is not responding properly")
        print(f"Response: {response}")
        print("\n[ACTION NEEDED]:")
        print("1. Make sure InDesign is running")
        print("2. In UXP Developer Tool, reload the plugin")
        print("3. Check that the plugin shows 'Connected' status")

except Exception as e:
    print(f"[ERROR] Failed to connect: {e}")
    print("\n[ACTION NEEDED]:")
    print("1. Make sure InDesign is running")
    print("2. Open UXP Developer Tool")
    print("3. Select 'InDesign MCP Plugin'")
    print("4. Click 'Reload' button")
    print("5. Verify plugin shows 'Connected to Socket.IO server'")