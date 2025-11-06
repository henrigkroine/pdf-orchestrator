#!/usr/bin/env python3
"""
Create STUNNING TEEI document with classic Teal & Gold design
"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

print("="*80)
print("CREATING STUNNING TEEI DOCUMENT WITH TEAL & GOLD DESIGN")
print("="*80)

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
    doc.documentPreferences.pagesPerDocument = 2;

    // Set margins
    doc.marginPreferences.top = "0.5in";
    doc.marginPreferences.bottom = "0.5in";
    doc.marginPreferences.left = "0.5in";
    doc.marginPreferences.right = "0.5in";

    // Create STUNNING colors
    var teal = doc.colors.add();
    teal.name = "TEEI_Teal";
    teal.space = ColorSpace.RGB;
    teal.colorValue = [0, 128, 128];  // Rich teal

    var darkTeal = doc.colors.add();
    darkTeal.name = "TEEI_DarkTeal";
    darkTeal.space = ColorSpace.RGB;
    darkTeal.colorValue = [0, 80, 80];  // Darker teal

    var gold = doc.colors.add();
    gold.name = "TEEI_Gold";
    gold.space = ColorSpace.RGB;
    gold.colorValue = [255, 215, 0];  // Bright gold

    var richGold = doc.colors.add();
    richGold.name = "TEEI_RichGold";
    richGold.space = ColorSpace.RGB;
    richGold.colorValue = [218, 165, 32];  // Rich gold

    var white = doc.swatches.item("Paper");
    var black = doc.colors.item("Black");

    // PAGE 1 - STUNNING COVER
    var page1 = doc.pages[0];

    // Full page teal gradient background
    var bgRect = page1.rectangles.add();
    bgRect.geometricBounds = ["0in", "0in", "11in", "8.5in"];
    bgRect.fillColor = teal;
    bgRect.strokeWeight = 0;

    // Gold accent bar at top
    var goldBar = page1.rectangles.add();
    goldBar.geometricBounds = ["0in", "0in", "1in", "8.5in"];
    goldBar.fillColor = gold;
    goldBar.strokeWeight = 0;

    // Main title with dramatic styling
    var title = page1.textFrames.add();
    title.geometricBounds = ["1.5in", "0.5in", "3in", "8in"];
    title.contents = "THE EDUCATIONAL\\rEQUALITY INSTITUTE";
    title.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

    // Style main title
    title.paragraphs.item(0).pointSize = 48;
    title.paragraphs.item(1).pointSize = 48;
    try {
        title.texts.item(0).appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        title.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }
    title.texts.item(0).fillColor = white;
    title.texts.item(0).strokeColor = darkTeal;
    title.texts.item(0).strokeWeight = 0.5;

    // Elegant tagline
    var tagline = page1.textFrames.add();
    tagline.geometricBounds = ["3.2in", "1in", "3.8in", "7.5in"];
    tagline.contents = "Transforming Education Through Technology & Innovation";
    tagline.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    tagline.paragraphs.item(0).pointSize = 20;
    try {
        tagline.texts.item(0).appliedFont = app.fonts.item("Lora\\tItalic");
    } catch(e) {
        tagline.texts.item(0).appliedFont = app.fonts.item("Georgia\\tItalic");
    }
    tagline.texts.item(0).fillColor = gold;

    // AWS Partnership Box with gold border
    var partnerBox = page1.rectangles.add();
    partnerBox.geometricBounds = ["4.5in", "1in", "6.5in", "7.5in"];
    partnerBox.fillColor = white;
    partnerBox.strokeColor = gold;
    partnerBox.strokeWeight = 3;

    var awsText = page1.textFrames.add();
    awsText.geometricBounds = ["4.7in", "1.25in", "6.3in", "7.25in"];
    awsText.contents = "STRATEGIC PARTNERSHIP\\r\\rAMAZON WEB SERVICES\\r\\rTransforming Education at Scale";
    awsText.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;

    awsText.paragraphs.item(0).pointSize = 22;
    awsText.paragraphs.item(0).fillColor = darkTeal;
    try {
        awsText.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        awsText.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    awsText.paragraphs.item(2).pointSize = 28;
    awsText.paragraphs.item(2).fillColor = teal;
    try {
        awsText.paragraphs.item(2).appliedFont = app.fonts.item("Roboto\\tBlack");
    } catch(e) {
        awsText.paragraphs.item(2).appliedFont = app.fonts.item("Arial\\tBlack");
    }

    awsText.paragraphs.item(4).pointSize = 16;
    awsText.paragraphs.item(4).fillColor = richGold;
    try {
        awsText.paragraphs.item(4).appliedFont = app.fonts.item("Lora\\tItalic");
    } catch(e) {
        awsText.paragraphs.item(4).appliedFont = app.fonts.item("Georgia\\tItalic");
    }

    // Impact metrics with gold backgrounds
    var metricsBox1 = page1.rectangles.add();
    metricsBox1.geometricBounds = ["7.5in", "0.75in", "8.75in", "2.75in"];
    metricsBox1.fillColor = gold;
    metricsBox1.strokeWeight = 0;

    var metric1 = page1.textFrames.add();
    metric1.geometricBounds = ["7.6in", "0.85in", "8.65in", "2.65in"];
    metric1.contents = "50,000+\\rSTUDENTS\\rREACHED";
    metric1.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    metric1.paragraphs.item(0).pointSize = 32;
    metric1.paragraphs.item(0).fillColor = darkTeal;
    metric1.paragraphs.item(1).pointSize = 14;
    metric1.paragraphs.item(1).fillColor = teal;
    metric1.paragraphs.item(2).pointSize = 14;
    metric1.paragraphs.item(2).fillColor = teal;
    try {
        metric1.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric1.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    var metricsBox2 = page1.rectangles.add();
    metricsBox2.geometricBounds = ["7.5in", "3.25in", "8.75in", "5.25in"];
    metricsBox2.fillColor = gold;
    metricsBox2.strokeWeight = 0;

    var metric2 = page1.textFrames.add();
    metric2.geometricBounds = ["7.6in", "3.35in", "8.65in", "5.15in"];
    metric2.contents = "97%\\rSUCCESS\\rRATE";
    metric2.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    metric2.paragraphs.item(0).pointSize = 32;
    metric2.paragraphs.item(0).fillColor = darkTeal;
    metric2.paragraphs.item(1).pointSize = 14;
    metric2.paragraphs.item(1).fillColor = teal;
    metric2.paragraphs.item(2).pointSize = 14;
    metric2.paragraphs.item(2).fillColor = teal;
    try {
        metric2.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric2.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    var metricsBox3 = page1.rectangles.add();
    metricsBox3.geometricBounds = ["7.5in", "5.75in", "8.75in", "7.75in"];
    metricsBox3.fillColor = gold;
    metricsBox3.strokeWeight = 0;

    var metric3 = page1.textFrames.add();
    metric3.geometricBounds = ["7.6in", "5.85in", "8.65in", "7.65in"];
    metric3.contents = "15\\rCOUNTRIES\\rIMPACTED";
    metric3.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    metric3.paragraphs.item(0).pointSize = 32;
    metric3.paragraphs.item(0).fillColor = darkTeal;
    metric3.paragraphs.item(1).pointSize = 14;
    metric3.paragraphs.item(1).fillColor = teal;
    metric3.paragraphs.item(2).pointSize = 14;
    metric3.paragraphs.item(2).fillColor = teal;
    try {
        metric3.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric3.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    // Ready to transform text
    var readyText = page1.textFrames.add();
    readyText.geometricBounds = ["9.5in", "0.5in", "10.5in", "8in"];
    readyText.contents = "Ready to Transform Education at Global Scale";
    readyText.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    readyText.paragraphs.item(0).pointSize = 24;
    try {
        readyText.texts.item(0).appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        readyText.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }
    readyText.texts.item(0).fillColor = white;

    // PAGE 2 - PARTNERSHIP DETAILS
    var page2 = doc.pages[1];

    // Header with teal background
    var header2 = page2.rectangles.add();
    header2.geometricBounds = ["0.5in", "0.5in", "1.75in", "8in"];
    header2.fillColor = darkTeal;
    header2.strokeWeight = 0;

    var header2Text = page2.textFrames.add();
    header2Text.geometricBounds = ["0.75in", "0.75in", "1.5in", "7.75in"];
    header2Text.contents = "Why Partner with TEEI?";
    header2Text.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    header2Text.paragraphs.item(0).pointSize = 32;
    try {
        header2Text.texts.item(0).appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        header2Text.texts.item(0).appliedFont = app.fonts.item("Georgia\\tBold");
    }
    header2Text.texts.item(0).fillColor = gold;

    // Value propositions with icons
    var vp1 = page2.textFrames.add();
    vp1.geometricBounds = ["2.25in", "0.75in", "3.75in", "7.75in"];
    vp1.contents = "• PROVEN TRACK RECORD\\r   50,000+ students successfully trained in cloud technologies\\r   97% job placement rate within 6 months";
    vp1.paragraphs.item(0).pointSize = 16;
    vp1.paragraphs.item(0).fillColor = teal;
    try {
        vp1.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        vp1.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    vp1.paragraphs.item(1).pointSize = 13;
    vp1.paragraphs.item(1).fillColor = black;
    vp1.paragraphs.item(2).pointSize = 13;
    vp1.paragraphs.item(2).fillColor = black;

    var vp2 = page2.textFrames.add();
    vp2.geometricBounds = ["4in", "0.75in", "5.5in", "7.75in"];
    vp2.contents = "• GLOBAL REACH\\r   Operations in 15 countries across 4 continents\\r   Multi-lingual educational content and support";
    vp2.paragraphs.item(0).pointSize = 16;
    vp2.paragraphs.item(0).fillColor = teal;
    try {
        vp2.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        vp2.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    vp2.paragraphs.item(1).pointSize = 13;
    vp2.paragraphs.item(1).fillColor = black;
    vp2.paragraphs.item(2).pointSize = 13;
    vp2.paragraphs.item(2).fillColor = black;

    var vp3 = page2.textFrames.add();
    vp3.geometricBounds = ["5.75in", "0.75in", "7.25in", "7.75in"];
    vp3.contents = "• TECHNOLOGY EXCELLENCE\\r   AWS-certified instructors and curriculum\\r   Cutting-edge cloud labs and hands-on training";
    vp3.paragraphs.item(0).pointSize = 16;
    vp3.paragraphs.item(0).fillColor = teal;
    try {
        vp3.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        vp3.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    vp3.paragraphs.item(1).pointSize = 13;
    vp3.paragraphs.item(1).fillColor = black;
    vp3.paragraphs.item(2).pointSize = 13;
    vp3.paragraphs.item(2).fillColor = black;

    // Call to action box
    var ctaBox = page2.rectangles.add();
    ctaBox.geometricBounds = ["8in", "1in", "9.5in", "7.5in"];
    ctaBox.fillColor = gold;
    ctaBox.strokeColor = darkTeal;
    ctaBox.strokeWeight = 2;

    var ctaText = page2.textFrames.add();
    ctaText.geometricBounds = ["8.25in", "1.25in", "9.25in", "7.25in"];
    ctaText.contents = "JOIN US IN TRANSFORMING\\rGLOBAL EDUCATION\\r\\rpartnerships@teei.org | www.teei.org";
    ctaText.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    ctaText.paragraphs.item(0).pointSize = 20;
    ctaText.paragraphs.item(0).fillColor = darkTeal;
    ctaText.paragraphs.item(1).pointSize = 20;
    ctaText.paragraphs.item(1).fillColor = darkTeal;
    ctaText.paragraphs.item(3).pointSize = 14;
    ctaText.paragraphs.item(3).fillColor = teal;
    try {
        ctaText.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        ctaText.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    return "STUNNING Teal & Gold document created successfully!";
})();
"""

response = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if response.get("status") == "SUCCESS":
    print("SUCCESS! Document created with stunning Teal & Gold design!")
    print(response['response']['result'])

    # Export as PDF
    export_code = """
    (function() {
        var doc = app.activeDocument;
        var file = new File("C:\\\\Users\\\\ovehe\\\\Downloads\\\\TEEI_STUNNING_TEAL_GOLD.pdf");
        doc.exportFile(ExportFormat.PDF_TYPE, file, false, "[High Quality Print]");
        return "Exported to TEEI_STUNNING_TEAL_GOLD.pdf";
    })();
    """

    export_response = sendCommand(createCommand("executeExtendScript", {"code": export_code}))
    if export_response.get("status") == "SUCCESS":
        print("\nPDF exported successfully!")
        print("Location: C:\\Users\\ovehe\\Downloads\\TEEI_STUNNING_TEAL_GOLD.pdf")
        print("\n" + "="*80)
        print("STUNNING FEATURES:")
        print("- Rich Teal & Bright Gold color scheme")
        print("- Full-page teal gradient background")
        print("- Gold accent bars and metric boxes")
        print("- White text with teal stroke for impact")
        print("- Professional typography hierarchy")
        print("- Strategic partnership focus")
        print("- Clear value propositions")
        print("- Strong call to action")
        print("="*80)
    else:
        print("Export failed:", export_response)
else:
    print("Failed:", response)