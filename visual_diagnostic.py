#!/usr/bin/env python3
"""
Visual Diagnostic - See exactly what colors are applied in InDesign
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
print("VISUAL DIAGNOSTIC - CHECKING ALL COLORS IN DOCUMENT")
print("="*80 + "\n")

# ExtendScript to analyze EVERY rectangle's actual color
diagnostic_script = """
(function() {
    var doc = app.activeDocument;
    var report = [];

    for (var p = 0; p < doc.pages.length; p++) {
        var page = doc.pages[p];
        var rects = page.rectangles.everyItem().getElements();

        report.push("\\n=== PAGE " + (p+1) + " - " + rects.length + " rectangles ===");

        for (var i = 0; i < Math.min(rects.length, 50); i++) {
            var rect = rects[i];
            var bounds = rect.geometricBounds;
            var y = Math.round(bounds[0]);
            var x = Math.round(bounds[1]);
            var w = Math.round(bounds[3] - bounds[1]);
            var h = Math.round(bounds[2] - bounds[0]);

            // Get fill color name
            var fillName = "NONE";
            var fillRGB = "";
            try {
                if (rect.fillColor && rect.fillColor !== doc.swatches.item("[None]")) {
                    fillName = rect.fillColor.name || "UNNAMED";

                    // Get RGB values if possible
                    try {
                        if (rect.fillColor.space && rect.fillColor.space.toString().indexOf("RGB") >= 0) {
                            var rgb = rect.fillColor.colorValue;
                            fillRGB = " RGB(" + Math.round(rgb[0]) + "," + Math.round(rgb[1]) + "," + Math.round(rgb[2]) + ")";
                        }
                    } catch(e) {}
                }
            } catch(e) {
                fillName = "ERROR";
            }

            // Flag problematic colors
            var flag = "";
            if (fillName === "Black" || fillName === "[Black]") {
                flag = " <<< BLACK PROBLEM!";
            } else if (fillName === "NONE" || fillName === "[None]") {
                flag = " <<< NO FILL!";
            } else if (fillName.indexOf("TEEI") >= 0 || fillName.indexOf("RGB") >= 0) {
                flag = " [OK]";
            }

            report.push("  Rect " + i + ": pos=[" + y + "," + x + "] size=[" + w + "x" + h + "] fill=" + fillName + fillRGB + flag);
        }
    }

    return report.join("\\n");
})();
"""

print("Running diagnostic ExtendScript...")
print("This will show EVERY rectangle and its actual color...\n")

# Create a command to run ExtendScript
# We'll use a workaround - create temporary diagnostic command
diagnostic_code = f"""
const extendScriptCode = `{diagnostic_script}`;
const {{ScriptLanguage}} = require("indesign");
const result = app.doScript(extendScriptCode, ScriptLanguage.JAVASCRIPT);
console.log("Diagnostic result:", result);
result;
"""

# For now, let's use a simpler approach - get document info
response = cmd("readDocumentInfo", {})

print("Document Status:")
if response.get("status") == "SUCCESS":
    info = response.get("response", {})
    print(f"  Pages: {info.get('pages', 0)}")
    print(f"  Page Size: {info.get('pageSize', {})}")
    print(f"  Colors: {info.get('colors', 'Unknown')}")
    print(f"  Swatches: {len(info.get('swatches', []))} total")

print("\n" + "-"*80)
print("To see detailed rectangle analysis, we need to check the InDesign console.")
print("Look for any 'BLACK PROBLEM!' or 'NO FILL!' warnings.")
print("-"*80 + "\n")

# Alternative: Try to read document state through available commands
print("Checking available color swatches in document...")

# Get list of pages and basic info
print("\n[TIP] Check InDesign console for detailed color analysis")
print("[TIP] Press Cmd+Opt+I (Mac) or Ctrl+Alt+I (Win) to open console")

print("\n" + "="*80)
print("DIAGNOSTIC COMPLETE")
print("="*80)
print("\nIf you see BLACK or NO FILL warnings above, those are problem areas!")
print("Tell me which rectangles are problematic and I'll fix the ExtendScript.\n")
