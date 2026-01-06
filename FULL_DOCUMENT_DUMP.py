#!/usr/bin/env python3
import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

print("="*80)
print("FULL DOCUMENT DUMP - CHECKING EVERYTHING")
print("="*80)

extendscript = """
(function() {
    var doc = app.activeDocument;
    var page = doc.pages[0];
    var report = [];

    report.push("\\n===== DOCUMENT COLORS =====");
    for (var i = 0; i < doc.colors.length; i++) {
        var c = doc.colors[i];
        report.push("Color " + i + ": " + c.name + " RGB:[" + c.colorValue + "]");
    }

    report.push("\\n===== RECTANGLES =====");
    var rects = page.rectangles.everyItem().getElements();
    report.push("Total rectangles: " + rects.length);
    for (var i = 0; i < rects.length; i++) {
        var r = rects[i];
        var fillName = "NO FILL";
        try { if (r.fillColor) fillName = r.fillColor.name; } catch(e) {}
        report.push("  Rect " + i + ": bounds=" + r.geometricBounds + " fill=" + fillName);
    }

    report.push("\\n===== TEXT FRAMES =====");
    var frames = page.textFrames.everyItem().getElements();
    report.push("Total text frames: " + frames.length);
    for (var i = 0; i < frames.length; i++) {
        var tf = frames[i];
        var preview = tf.contents.substring(0, 50).replace(/\\r/g, " ");
        var textColor = "UNKNOWN";
        try {
            if (tf.texts.item(0).fillColor) {
                textColor = tf.texts.item(0).fillColor.name;
            }
        } catch(e) { textColor = "ERROR: " + e; }
        report.push("  Frame " + i + ": text=" + preview + "... textColor=" + textColor);
    }

    return report.join("\\n");
})();
"""

result = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if isinstance(result, dict) and result.get('status') == 'SUCCESS':
    output = result.get('response', {}).get('result', '')
    print(output)
else:
    print(f"ERROR: {result}")

print("="*80)
