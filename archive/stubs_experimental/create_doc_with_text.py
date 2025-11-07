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

# Create a new document
print("Creating new InDesign document...")
width = 800
height = 600

doc_command = createCommand("createDocument", {
    "intent": "WEB_INTENT",
    "pageWidth": width,
    "pageHeight": height,
    "margins": {"top": 50, "bottom": 50, "left": 50, "right": 50},
    "columns": {"count": 1, "gutter": 12},
    "pagesPerDocument": 1,
    "pagesFacing": False
})

response = sendCommand(doc_command)

if response and response.get("status") == "SUCCESS":
    print("Success! Document created!")
else:
    print("Failed to create document")
    sys.exit(1)

# Add text to the document
print("\nAdding text 'Hello I am Claude' to the document...")

text_command = createCommand("createTextFrame", {
    "text": "Hello I am Claude",
    "x": 100,
    "y": 200,
    "width": 600,
    "height": 200,
    "fontSize": 48,
    "fontName": "Arial",
    "textColor": {"red": 0, "green": 0, "blue": 255}  # Blue text
})

response = sendCommand(text_command)

if response and response.get("status") == "SUCCESS":
    print("Success! Text added to document!")
    print(f"  Text: 'Hello I am Claude'")
    print(f"  Position: (100, 200)")
    print(f"  Size: 48pt Arial")
    print(f"  Color: Blue")
else:
    print("Failed to add text")
    if response:
        print(f"  Error: {response.get('message', 'Unknown error')}")
