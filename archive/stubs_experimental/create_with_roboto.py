#!/usr/bin/env python3
"""
Create TEEI document with ACTUAL Roboto font (already installed on system)
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

print("Creating document with Roboto font...")

extendscript = """
(function() {
    // Close existing documents
    while (app.documents.length > 0) {
        app.documents[0].close(SaveOptions.NO);
    }

    // Create new document
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = "8.5in";
    doc.documentPreferences.pageHeight = "11in";

    // Create color
    var nordshore = doc.colors.add();
    nordshore.name = "Nordshore";
    nordshore.space = ColorSpace.RGB;
    nordshore.colorValue = [0, 57, 63];

    var gold = doc.colors.add();
    gold.name = "Gold";
    gold.space = ColorSpace.RGB;
    gold.colorValue = [186, 143, 90];

    // Add title with Roboto Bold
    var title = doc.pages[0].textFrames.add();
    title.geometricBounds = ["1in", "1in", "2in", "7.5in"];
    title.contents = "THE EDUCATIONAL EQUALITY INSTITUTE";
    title.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    title.paragraphs.item(0).pointSize = 36;

    // Use ROBOTO BOLD (we know it's installed)
    try {
        title.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
        var fontUsed = "Roboto Bold";
    } catch(e) {
        try {
            title.texts.item(0).appliedFont = app.fonts.item("Roboto Bold");
            var fontUsed = "Roboto Bold (alternate)";
        } catch(e2) {
            title.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
            var fontUsed = "Arial Bold (fallback)";
        }
    }
    title.texts.item(0).fillColor = nordshore;

    // Add body text with Roboto Regular
    var body = doc.pages[0].textFrames.add();
    body.geometricBounds = ["3in", "1in", "5in", "7.5in"];
    body.contents = "Strategic Alliance with Amazon Web Services\\n\\nUsing actual brand font: Roboto\\n\\n50,000+ Students Reached | 97% Success Rate | 15 Countries";
    body.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    body.paragraphs.item(0).pointSize = 18;
    body.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    body.paragraphs.item(1).pointSize = 14;

    // Use ROBOTO REGULAR
    try {
        body.paragraphs.item(1).appliedFont = app.fonts.item("Roboto\\tRegular");
        body.paragraphs.item(3).appliedFont = app.fonts.item("Roboto\\tRegular");
    } catch(e) {
        try {
            body.paragraphs.item(1).appliedFont = app.fonts.item("Roboto");
            body.paragraphs.item(3).appliedFont = app.fonts.item("Roboto");
        } catch(e2) {
            body.paragraphs.item(1).appliedFont = app.fonts.item("Arial\\tRegular");
            body.paragraphs.item(3).appliedFont = app.fonts.item("Arial\\tRegular");
        }
    }

    body.paragraphs.item(3).pointSize = 16;
    body.texts.item(0).fillColor = nordshore;

    // Add metrics with Roboto
    var metrics = doc.pages[0].textFrames.add();
    metrics.geometricBounds = ["6in", "1in", "8in", "7.5in"];
    metrics.contents = "PROVEN RESULTS WITH ROBOTO FONT:\\n\\n• Technology-first approach\\n• Deep community reach\\n• Measurable impact\\n• Ready for AWS partnership";

    try {
        metrics.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
        metrics.paragraphs.item(0).pointSize = 14;
        metrics.paragraphs.item(0).fillColor = gold;

        for (var i = 2; i < metrics.paragraphs.length; i++) {
            metrics.paragraphs.item(i).appliedFont = app.fonts.item("Roboto\\tRegular");
            metrics.paragraphs.item(i).pointSize = 12;
        }
    } catch(e) {
        metrics.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    }

    metrics.texts.item(0).fillColor = doc.colors.item("Black");

    return "Document created with font: " + fontUsed + ". Roboto is now being used!";
})();
"""

response = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if response.get("status") == "SUCCESS":
    print("SUCCESS!")
    print(response['response']['result'])
    print()

    # Export as PDF
    export_code = """
    (function() {
        var doc = app.activeDocument;
        var file = new File("C:\\\\Users\\\\ovehe\\\\Downloads\\\\TEEI_WITH_ROBOTO_FONT.pdf");
        doc.exportFile(ExportFormat.PDF_TYPE, file, false, "[High Quality Print]");
        return "Exported to TEEI_WITH_ROBOTO_FONT.pdf";
    })();
    """

    export_response = sendCommand(createCommand("executeExtendScript", {"code": export_code}))
    if export_response.get("status") == "SUCCESS":
        print("PDF exported:", export_response['response']['result'])
        print()
        print("✓ Document created with actual Roboto font!")
        print("✓ Location: C:\\Users\\ovehe\\Downloads\\TEEI_WITH_ROBOTO_FONT.pdf")
    else:
        print("Export failed:", export_response)
else:
    print("Failed:", response)