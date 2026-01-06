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

print("Applying TEEI brand colors via ExtendScript...\n")

result = sendCommand(createCommand('applyColorsViaExtendScript', {}))

print(f"\nResult: {result}")

if isinstance(result, dict) and result.get('status') == 'SUCCESS':
    print("\n✅ COLORS APPLIED SUCCESSFULLY!")
    print("Check InDesign now - the document should have proper TEEI colors!")
else:
    print(f"\n❌ Failed: {result}")
