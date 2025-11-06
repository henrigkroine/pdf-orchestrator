#!/usr/bin/env python3
"""Test InDesign connection"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=10)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    return response

print("Testing InDesign connection...")
try:
    response = cmd("ping", {})
except Exception as e:
    # Check if it's the "no documents open" error which actually means we're connected
    if "No documents are open" in str(e):
        print("✓ InDesign is connected! (No document open)")
        exit(0)
    else:
        print(f"✗ InDesign connection failed: {e}")
        exit(1)
print(f"Response: {response}")

if response.get("status") == "SUCCESS":
    print("✓ InDesign is connected!")
else:
    print("✗ InDesign is NOT connected")
    print("Please ensure the UXP plugin is loaded and connected in InDesign")