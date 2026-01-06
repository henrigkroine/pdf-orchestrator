#!/usr/bin/env python3
"""Execute TFU AWS Partnership JSX Script via MCP"""
import sys
import os

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
import json

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

def main():
    print("=" * 60)
    print("Executing TFU AWS Partnership Document Creation")
    print("=" * 60)

    # Configure and initialize MCP connection
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=30)
    init(APPLICATION, socket_client)

    # Read the certified TFU script
    script_path = "scripts/generate_tfu_aws.jsx"
    print(f"\nReading script: {script_path}")

    with open(script_path, 'r', encoding='utf-8') as f:
        script_content = f.read()

    print(f"Script size: {len(script_content):,} characters")

    # Create command to execute ExtendScript
    command = createCommand(
        action="executeExtendScript",
        options={"code": script_content}  # UXP plugin expects 'code', not 'scriptString'
    )

    print("\nSending to InDesign...")
    result = sendCommand(command)

    print("\nResult:")
    print(json.dumps(result, indent=2))

    if result.get('status') == 'SUCCESS':
        print("\n✅ Document created successfully!")
        print("\nNext steps:")
        print("1. Check InDesign for the newly created document")
        print("2. Run pipeline: python pipeline.py --job-config example-jobs/tfu-aws-partnership.json")
    else:
        print("\n❌ Document creation failed!")
        print(f"Error: {result.get('message', 'Unknown error')}")
        return 1

    return 0

if __name__ == '__main__':
    sys.exit(main())
