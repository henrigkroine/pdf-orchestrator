#!/usr/bin/env python3
"""
Diagnose rectangles in the document
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    return response

print("\n" + "="*80)
print("DIAGNOSING RECTANGLES IN DOCUMENT")
print("="*80 + "\n")

# Run diagnostic ExtendScript
extendscript = """
(function() {
    var doc = app.activeDocument;
    var results = [];

    for (var p = 0; p < doc.pages.length; p++) {
        var page = doc.pages[p];
        var rects = page.rectangles.everyItem().getElements();

        results.push("PAGE " + (p + 1) + ": " + rects.length + " rectangles");

        for (var i = 0; i < Math.min(rects.length, 20); i++) {
            var rect = rects[i];
            var bounds = rect.geometricBounds;
            var yPos = Math.round(bounds[0]);
            var xPos = Math.round(bounds[1]);
            var height = Math.round(bounds[2] - bounds[0]);
            var width = Math.round(bounds[3] - bounds[1]);

            var fillColorName = "none";
            try {
                if (rect.fillColor != doc.swatches.item("[None]")) {
                    fillColorName = rect.fillColor.name || "unnamed";
                }
            } catch(e) {
                fillColorName = "error:" + e.message;
            }

            results.push("  Rect " + i + ": bounds=[" + yPos + "," + xPos + "," + height + "," + width + "] fill=" + fillColorName);
        }
    }

    return results.join("\\n");
})();
"""

response = cmd("runExtendScriptCode", {"code": extendscript})

if response.get("status") == "SUCCESS":
    result = response.get("response", {}).get("result", "")
    print(result)
else:
    print(f"ERROR: {response}")

print("\n" + "="*80)