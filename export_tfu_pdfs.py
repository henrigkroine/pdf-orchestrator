#!/usr/bin/env python3
"""Export TFU AWS Partnership PDFs (Print CMYK + Digital RGB)"""
import sys
import os
from datetime import datetime

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
import json

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

def main():
    print("=" * 60)
    print("Exporting TFU AWS Partnership PDFs")
    print("=" * 60)

    # Configure and initialize MCP connection
    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
    init(APPLICATION, socket_client)

    # Get absolute export directory
    export_dir = os.path.abspath("exports")
    if not os.path.exists(export_dir):
        os.makedirs(export_dir)
        print(f"Created export directory: {export_dir}")

    base_name = "TEEI-AWS-Partnership-TFU"

    # Export configurations
    exports = [
        {
            "name": "Print (CMYK)",
            "preset": "[PDF/X-4:2010]",  # InDesign preset names use brackets
            "filename": f"{base_name}-PRINT.pdf",
            "description": "Commercial printing (300 DPI, CMYK, with bleed)"
        },
        {
            "name": "Digital (RGB)",
            "preset": "[High Quality Print]",  # InDesign's high quality preset
            "filename": f"{base_name}-DIGITAL.pdf",
            "description": "Digital distribution (150 DPI, RGB, web-optimized)"
        }
    ]

    results = []

    for config in exports:
        print(f"\n{config['name']}:")
        print(f"  {config['description']}")

        output_path = os.path.join(export_dir, config['filename'])
        print(f"  Output: {output_path}")

        command = createCommand(
            action="exportPDFViaExtendScript",
            options={
                "outputPath": output_path,
                "preset": config['preset']
            }
        )

        try:
            result = sendCommand(command)
            if result.get('status') == 'SUCCESS':
                print(f"  Status: SUCCESS!")
                if os.path.exists(output_path):
                    file_size = os.path.getsize(output_path) / 1024 / 1024
                    print(f"  File size: {file_size:.2f} MB")
                    results.append({
                        "name": config['name'],
                        "file": output_path,
                        "size_mb": round(file_size, 2),
                        "success": True
                    })
                else:
                    print(f"  Warning: Export reported success but file not found!")
                    results.append({"name": config['name'], "success": False, "error": "File not found after export"})
            else:
                error_msg = result.get('message', 'Unknown error')
                print(f"  Status: FAILED - {error_msg}")
                results.append({"name": config['name'], "success": False, "error": error_msg})
        except Exception as e:
            print(f"  Status: ERROR - {str(e)}")
            results.append({"name": config['name'], "success": False, "error": str(e)})

    # Summary
    print("\n" + "=" * 60)
    print("EXPORT SUMMARY")
    print("=" * 60)

    successful = [r for r in results if r.get('success')]
    failed = [r for r in results if not r.get('success')]

    if successful:
        print(f"\nSuccessful exports: {len(successful)}")
        for r in successful:
            print(f"  {r['name']}: {r['file']} ({r['size_mb']} MB)")

    if failed:
        print(f"\nFailed exports: {len(failed)}")
        for r in failed:
            print(f"  {r['name']}: {r.get('error', 'Unknown error')}")

    # Next steps
    if successful:
        print("\nNext Steps:")
        print("1. Run TFU validation:")
        print(f"   python validate_document.py \"{successful[0]['file']}\" \\")
        print("     --job-config example-jobs/tfu-aws-partnership.json --strict")
        print("\n2. Run comprehensive QA:")
        print(f"   python pipeline.py --validate-only \\")
        print(f"     --pdf \"{successful[0]['file']}\" \\")
        print("     --job-config example-jobs/tfu-aws-partnership.json --threshold 95 --ci")

    return 0 if len(successful) > 0 else 1

if __name__ == '__main__':
    sys.exit(main())
