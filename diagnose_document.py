#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app='indesign', url='http://localhost:8013', timeout=60)
init('indesign', socket_client)

print("Checking what's in the InDesign document...\n")

# Check document info
result = sendCommand(createCommand('readDocumentInfo', {}))
print('Document Info:')
print(result)
print()

# Diagnose colors
result = sendCommand(createCommand('diagnoseColors', {}))
print('Color Diagnosis:')
print(result)
