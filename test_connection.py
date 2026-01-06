#!/usr/bin/env python3
"""Test InDesign MCP connection with comprehensive health check"""

import sys
import os

# Fix Windows console encoding
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
    sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from health import check_indesign_health

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

print("\n" + "="*60)
print("INDESIGN MCP CONNECTION HEALTH CHECK")
print("="*60)

# Run comprehensive health check
health = check_indesign_health(
    application=APPLICATION,
    url=PROXY_URL,
    timeout=10.0,
    check_document=True
)

print(f"\n[Stage] {health.stage}")

if health.ok:
    print("[Status] OK - HEALTHY")
    if health.details:
        if "document_name" in health.details:
            print(f"[Document] {health.details['document_name']}")
            print(f"[Pages] {health.details.get('pages', 'N/A')}")
        elif "note" in health.details:
            print(f"[Note] {health.details['note']}")
    print("\n[OK] MCP connection is working correctly")
    print("[OK] Ready for pipeline execution")
    sys.exit(0)
else:
    print("[Status] FAILED - UNHEALTHY")
    print(f"[Error] {health.error}")

    print("\n" + "="*60)
    print("TROUBLESHOOTING STEPS")
    print("="*60)

    if health.stage == "proxy":
        print("1. Start the MCP proxy:")
        print("   cd adb-mcp/adb-proxy-socket && node proxy.js")
        print("   OR")
        print("   powershell -ExecutionPolicy Bypass -File start-mcp-stack.ps1")

    elif health.stage == "handshake":
        print("1. Proxy is running but Socket.IO handshake failed")
        print("2. Check proxy logs for errors")
        print("3. Restart proxy: Ctrl+C and restart node proxy.js")

    elif health.stage == "plugin":
        print("1. Ensure InDesign is running")
        print("2. Open UXP Developer Tool")
        print("3. Find 'InDesign MCP Plugin'")
        print("4. Click 'Reload' button")
        print("5. Check plugin panel shows 'Connected'")

    sys.exit(2)