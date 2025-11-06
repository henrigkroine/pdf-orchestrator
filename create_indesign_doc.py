#!/usr/bin/env python3
import sys
sys.path.insert(0, 'adb-mcp/mcp')

from core import init, sendCommand, createCommand
import socket_client

# Configure the socket client for InDesign
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 20

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Create the document
width = 800
height = 600

command = createCommand("createDocument", {
    "intent": "WEB_INTENT",
    "pageWidth": width,
    "pageHeight": height,
    "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
    "columns": {"count": 1, "gutter": 12},
    "pagesPerDocument": 0,
    "pagesFacing": False
})

print(f"Creating InDesign document: {width}x{height} points...")
response = sendCommand(command)

if response and response.get("status") == "SUCCESS":
    print(f"✓ Successfully created InDesign document!")
    print(f"  Width: {width} points ({width/72:.2f} inches)")
    print(f"  Height: {height} points ({height/72:.2f} inches)")
else:
    print(f"✗ Failed to create document")
    if response:
        print(f"  Error: {response.get('message', 'Unknown error')}")
