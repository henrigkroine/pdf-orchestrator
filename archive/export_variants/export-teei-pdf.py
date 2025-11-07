#!/usr/bin/env python3
"""
Quick PDF export for currently open InDesign document
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Try to export using just the filename (InDesign will use default location)
print("Attempting PDF export...")

command = createCommand("exportPDF", {
    "outputPath": "T:\\Projects\\pdf-orchestrator\\exports\\TEEI_AWS_Partnership_Brief.pdf",
    "preset": "High Quality Print",
    "useDocBleed": False,
    "includeMarks": False,
    "taggedPDF": False,
    "viewPDF": False
})

response = sendCommand(command)
print(f"Response: {response}")
