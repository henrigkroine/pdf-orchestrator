#!/usr/bin/env python3
"""
Simple test - create rectangle without fillColor
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
    print(f"Response: {response}")
    if response.get("status") != "SUCCESS":
        print(f"    [WARNING] {action}: {response.get('message')}")
    return response

print("Test 1: Create document...")
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 1,
    "pagesFacing": False,
    "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
    "name": "SimpleRectangleTest",
    "units": "pt"
})

print("\nTest 2: Create rectangle WITHOUT fillColor...")
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 50,
    "width": 100,
    "height": 100
})

print("\nTest 3: Create another rectangle WITHOUT fillColor...")
cmd("createRectangle", {
    "page": 1,
    "x": 200,
    "y": 50,
    "width": 100,
    "height": 100
})

print("\nTest 4: Create rectangle WITH fillColor...")
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 200,
    "width": 100,
    "height": 100,
    "fillColor": {"red": 230, "green": 240, "blue": 250}
})

print("\nDone!")
