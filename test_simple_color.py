#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

print("\nTesting text color parameters...\n")

# Create document
result = sendCommand(createCommand("createDocument", {
    "intent": "PRINT_INTENT",
    "pageWidth": 595, "pageHeight": 842,
    "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},
    "pagesPerDocument": 1, "pagesFacing": False
}))
print(f"Document: {result.get('status')}")

# Test 1: Basic text frame with NO color parameters
result = sendCommand(createCommand("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 100, "width": 400, "height": 30,
    "content": "Test 1: Default black text (no color params)",
    "fontSize": 14
}))
print(f"Test 1 (no color): {result.get('status')}")

# Test 2: Text frame with ONLY textColor
result = sendCommand(createCommand("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 150, "width": 400, "height": 30,
    "content": "Test 2: Red text with textColor",
    "fontSize": 14,
    "textColor": {"red": 255, "green": 0, "blue": 0}
}))
print(f"Test 2 (textColor): {result.get('status')}")

# Test 3: Text frame with ONLY fillColor
result = sendCommand(createCommand("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 200, "width": 400, "height": 30,
    "content": "Test 3: Blue fillColor (frame background)",
    "fontSize": 14,
    "fillColor": {"red": 0, "green": 0, "blue": 255}
}))
print(f"Test 3 (fillColor): {result.get('status')}")

# Test 4: Simple parameters only
result = sendCommand(createCommand("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 250, "width": 400, "height": 30,
    "content": "Test 4: Minimal parameters",
    "fontSize": 14,
    "fontFamily": "Arial"
}))
print(f"Test 4 (minimal): {result.get('status')}")

print("\nCheck InDesign - which tests show COLOR?\n")
