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

# Create a letter-sized document (8.5 x 11 inches = 612 x 792 points)
width = 612
height = 792

print("Creating InDesign document...")
command = createCommand("createDocument", {
    "intent": "WEB_INTENT",
    "pageWidth": width,
    "pageHeight": height,
    "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},  # 1 inch margins
    "columns": {"count": 1, "gutter": 12},
    "pagesPerDocument": 1,
    "pagesFacing": False
})

response = sendCommand(command)

if response and response.get("status") == "SUCCESS":
    print("\nSUCCESS! InDesign document created!")
    print(f"  Size: {width} x {height} points ({width/72:.1f} x {height/72:.1f} inches)")
    print(f"  Format: Letter size")
    print(f"  Margins: 1 inch on all sides")
    print(f"\n  Open InDesign to see your new document!")
else:
    print("FAILED to create document")
    if response:
        print(f"  Error: {response.get('message', 'Unknown error')}")
