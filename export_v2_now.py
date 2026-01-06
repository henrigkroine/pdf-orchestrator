#!/usr/bin/env python3
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

output_path = "D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-Partnership-TFU-V2-DIGITAL.pdf"
command = createCommand(action="exportPDFViaExtendScript", options={"outputPath": output_path, "preset": "[High Quality Print]"})
result = sendCommand(command)
print(f"Export: {result.get('status')}")
