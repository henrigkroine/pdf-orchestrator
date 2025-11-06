#!/usr/bin/env python3
"""
Create TRULY PROFESSIONAL WORLD-CLASS TEEI document
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
print("CREATING PROFESSIONAL WORLD-CLASS TEEI DOCUMENT")
print("="*80)

extendscript = """
(function() {
    // Close existing documents
    while (app.documents.length > 0) {
        app.documents[0].close(SaveOptions.NO);
    }

    // Create new document with professional settings
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = "8.5in";
    doc.documentPreferences.pageHeight = "11in";
    doc.documentPreferences.pagesPerDocument = 2;

    // Professional margins
    doc.marginPreferences.top = "0.75in";
    doc.marginPreferences.bottom = "0.75in";
    doc.marginPreferences.left = "0.75in";
    doc.marginPreferences.right = "0.75in";

    // Professional color palette
    var teeiNavy = doc.colors.add();
    teeiNavy.name = "TEEI_Navy";
    teeiNavy.space = ColorSpace.RGB;
    teeiNavy.colorValue = [0, 48, 64];  // Professional navy

    var teeiTeal = doc.colors.add();
    teeiTeal.name = "TEEI_Teal";
    teeiTeal.space = ColorSpace.RGB;
    teeiTeal.colorValue = [0, 128, 128];  // Professional teal

    var teeiGold = doc.colors.add();
    teeiGold.name = "TEEI_Gold";
    teeiGold.space = ColorSpace.RGB;
    teeiGold.colorValue = [186, 143, 90];  // Sophisticated gold

    var lightGray = doc.colors.add();
    lightGray.name = "Light_Gray";
    lightGray.space = ColorSpace.RGB;
    lightGray.colorValue = [245, 245, 245];  // Light gray background

    var white = doc.swatches.item("Paper");
    var black = doc.colors.item("Black");

    // PAGE 1 - PROFESSIONAL COVER
    var page1 = doc.pages[0];

    // Subtle background
    var bgRect = page1.rectangles.add();
    bgRect.geometricBounds = ["0in", "0in", "11in", "8.5in"];
    bgRect.fillColor = white;
    bgRect.strokeWeight = 0;

    // Professional header stripe
    var headerStripe = page1.rectangles.add();
    headerStripe.geometricBounds = ["0.75in", "0.75in", "2.5in", "7.75in"];
    headerStripe.fillColor = teeiNavy;
    headerStripe.strokeWeight = 0;

    // Logo placeholder
    var logoBox = page1.rectangles.add();
    logoBox.geometricBounds = ["1in", "1in", "2.25in", "2.5in"];
    logoBox.fillColor = white;
    logoBox.strokeColor = teeiGold;
    logoBox.strokeWeight = 1;

    var logoText = page1.textFrames.add();
    logoText.geometricBounds = ["1.4in", "1.1in", "1.85in", "2.4in"];
    logoText.contents = "TEEI\\rLOGO";
    logoText.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    logoText.paragraphs.everyItem().pointSize = 14;
    logoText.texts.item(0).fillColor = teeiGold;

    // Professional title
    var title = page1.textFrames.add();
    title.geometricBounds = ["1in", "2.75in", "2.25in", "7.5in"];
    title.contents = "THE EDUCATIONAL\\rEQUALITY INSTITUTE";
    title.paragraphs.everyItem().justification = Justification.LEFT_ALIGN;
    title.paragraphs.item(0).pointSize = 28;
    title.paragraphs.item(1).pointSize = 28;
    title.paragraphs.everyItem().leading = 32;
    try {
        title.texts.item(0).appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        try {
            title.texts.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
        } catch(e2) {
            title.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
        }
    }
    title.texts.item(0).fillColor = white;

    // Professional tagline
    var tagline = page1.textFrames.add();
    tagline.geometricBounds = ["2.75in", "0.75in", "3.25in", "7.75in"];
    tagline.contents = "Transforming Education Through Strategic Technology Partnerships";
    tagline.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    tagline.paragraphs.item(0).pointSize = 16;
    try {
        tagline.texts.item(0).appliedFont = app.fonts.item("Roboto\\tLight");
    } catch(e) {
        tagline.texts.item(0).appliedFont = app.fonts.item("Arial\\tRegular");
    }
    tagline.texts.item(0).fillColor = teeiNavy;

    // AWS Partnership section with professional design
    var awsSection = page1.rectangles.add();
    awsSection.geometricBounds = ["4in", "0.75in", "6.5in", "7.75in"];
    awsSection.fillColor = lightGray;
    awsSection.strokeWeight = 0;

    // AWS Logo placeholder
    var awsLogoBox = page1.rectangles.add();
    awsLogoBox.geometricBounds = ["4.25in", "1in", "5.25in", "2.5in"];
    awsLogoBox.fillColor = white;
    awsLogoBox.strokeColor = teeiTeal;
    awsLogoBox.strokeWeight = 1;

    var awsLogoText = page1.textFrames.add();
    awsLogoText.geometricBounds = ["4.6in", "1.1in", "4.9in", "2.4in"];
    awsLogoText.contents = "AWS LOGO";
    awsLogoText.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    awsLogoText.paragraphs.item(0).pointSize = 12;
    awsLogoText.texts.item(0).fillColor = teeiTeal;

    // Partnership text
    var partnerText = page1.textFrames.add();
    partnerText.geometricBounds = ["4.25in", "2.75in", "6.25in", "7.5in"];
    partnerText.contents = "STRATEGIC PARTNERSHIP\\r\\rAmazon Web Services\\r\\rEmpowering global education through\\rcloud technology and innovation";
    partnerText.paragraphs.item(0).justification = Justification.LEFT_ALIGN;
    partnerText.paragraphs.item(0).pointSize = 20;
    partnerText.paragraphs.item(0).fillColor = teeiNavy;
    try {
        partnerText.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        partnerText.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    partnerText.paragraphs.item(2).pointSize = 18;
    partnerText.paragraphs.item(2).fillColor = teeiTeal;

    partnerText.paragraphs.item(4).pointSize = 14;
    partnerText.paragraphs.item(4).fillColor = teeiNavy;
    partnerText.paragraphs.item(5).pointSize = 14;
    partnerText.paragraphs.item(5).fillColor = teeiNavy;

    // Professional metrics section
    var metricsTitle = page1.textFrames.add();
    metricsTitle.geometricBounds = ["7in", "0.75in", "7.5in", "7.75in"];
    metricsTitle.contents = "OUR IMPACT";
    metricsTitle.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    metricsTitle.paragraphs.item(0).pointSize = 18;
    try {
        metricsTitle.texts.item(0).appliedFont = app.fonts.item("Roboto\\tMedium");
    } catch(e) {
        metricsTitle.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    metricsTitle.texts.item(0).fillColor = teeiNavy;

    // Three metric columns
    var metric1 = page1.textFrames.add();
    metric1.geometricBounds = ["7.75in", "0.75in", "9in", "3in"];
    metric1.contents = "50,000+\\rStudents Reached\\r\\rAcross 15 countries";
    metric1.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    metric1.paragraphs.item(0).pointSize = 24;
    metric1.paragraphs.item(0).fillColor = teeiTeal;
    metric1.paragraphs.item(1).pointSize = 11;
    metric1.paragraphs.item(1).fillColor = teeiNavy;
    metric1.paragraphs.item(3).pointSize = 10;
    metric1.paragraphs.item(3).fillColor = black;
    try {
        metric1.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric1.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    var metric2 = page1.textFrames.add();
    metric2.geometricBounds = ["7.75in", "3.125in", "9in", "5.375in"];
    metric2.contents = "97%\\rSuccess Rate\\r\\rJob placement within\\r6 months";
    metric2.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    metric2.paragraphs.item(0).pointSize = 24;
    metric2.paragraphs.item(0).fillColor = teeiTeal;
    metric2.paragraphs.item(1).pointSize = 11;
    metric2.paragraphs.item(1).fillColor = teeiNavy;
    metric2.paragraphs.item(3).pointSize = 10;
    metric2.paragraphs.item(3).fillColor = black;
    metric2.paragraphs.item(4).pointSize = 10;
    metric2.paragraphs.item(4).fillColor = black;
    try {
        metric2.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric2.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    var metric3 = page1.textFrames.add();
    metric3.geometricBounds = ["7.75in", "5.5in", "9in", "7.75in"];
    metric3.contents = "500+\\rIndustry Partners\\r\\rGlobal network of\\remployers";
    metric3.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    metric3.paragraphs.item(0).pointSize = 24;
    metric3.paragraphs.item(0).fillColor = teeiTeal;
    metric3.paragraphs.item(1).pointSize = 11;
    metric3.paragraphs.item(1).fillColor = teeiNavy;
    metric3.paragraphs.item(3).pointSize = 10;
    metric3.paragraphs.item(3).fillColor = black;
    metric3.paragraphs.item(4).pointSize = 10;
    metric3.paragraphs.item(4).fillColor = black;
    try {
        metric3.paragraphs.item(0).appliedFont = app.fonts.item("Roboto\\tBold");
    } catch(e) {
        metric3.paragraphs.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    // Footer
    var footer1 = page1.textFrames.add();
    footer1.geometricBounds = ["10in", "0.75in", "10.25in", "7.75in"];
    footer1.contents = "www.teei.org  |  partnerships@teei.org  |  +1 (555) 123-4567";
    footer1.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    footer1.paragraphs.item(0).pointSize = 10;
    footer1.texts.item(0).fillColor = teeiNavy;

    // PAGE 2 - PARTNERSHIP BENEFITS
    var page2 = doc.pages[1];

    // Header
    var header2 = page2.textFrames.add();
    header2.geometricBounds = ["0.75in", "0.75in", "1.5in", "7.75in"];
    header2.contents = "Partnership Benefits & Timeline";
    header2.paragraphs.item(0).justification = Justification.LEFT_ALIGN;
    header2.paragraphs.item(0).pointSize = 28;
    try {
        header2.texts.item(0).appliedFont = app.fonts.item("Lora\\tBold");
    } catch(e) {
        header2.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    header2.texts.item(0).fillColor = teeiNavy;

    // Benefits section
    var benefitsTitle = page2.textFrames.add();
    benefitsTitle.geometricBounds = ["2in", "0.75in", "2.5in", "7.75in"];
    benefitsTitle.contents = "Why Partner with TEEI?";
    benefitsTitle.paragraphs.item(0).pointSize = 20;
    benefitsTitle.paragraphs.item(0).fillColor = teeiTeal;
    try {
        benefitsTitle.texts.item(0).appliedFont = app.fonts.item("Roboto\\tMedium");
    } catch(e) {
        benefitsTitle.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    // Benefits list
    var benefits = page2.textFrames.add();
    benefits.geometricBounds = ["2.75in", "0.75in", "5.5in", "7.75in"];
    benefits.contents = "• Proven Track Record: 5+ years delivering technology education at scale\\r\\r• Global Infrastructure: Established operations in 15 countries\\r\\r• AWS Certified Team: 100+ certified instructors and curriculum developers\\r\\r• Industry Connections: Direct pathways to employment with 500+ partners\\r\\r• Measurable Impact: 97% student success rate with transparent metrics";
    benefits.paragraphs.everyItem().pointSize = 13;
    benefits.paragraphs.everyItem().leading = 20;
    benefits.texts.item(0).fillColor = black;

    // Timeline section
    var timelineTitle = page2.textFrames.add();
    timelineTitle.geometricBounds = ["6in", "0.75in", "6.5in", "7.75in"];
    timelineTitle.contents = "Implementation Timeline";
    timelineTitle.paragraphs.item(0).pointSize = 20;
    timelineTitle.paragraphs.item(0).fillColor = teeiTeal;
    try {
        timelineTitle.texts.item(0).appliedFont = app.fonts.item("Roboto\\tMedium");
    } catch(e) {
        timelineTitle.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }

    // Timeline items
    var timeline = page2.textFrames.add();
    timeline.geometricBounds = ["6.75in", "0.75in", "9in", "7.75in"];
    timeline.contents = "Q1 2025: Partnership agreement and initial planning\\r\\rQ2 2025: Curriculum development and instructor training\\r\\rQ3 2025: Pilot program launch in 3 countries\\r\\rQ4 2025: Full-scale rollout and expansion\\r\\rQ1 2026: 10,000 students enrolled target";
    timeline.paragraphs.everyItem().pointSize = 12;
    timeline.paragraphs.everyItem().leading = 18;
    timeline.texts.item(0).fillColor = black;

    // Call to action
    var ctaBox = page2.rectangles.add();
    ctaBox.geometricBounds = ["9.5in", "0.75in", "10.25in", "7.75in"];
    ctaBox.fillColor = teeiNavy;
    ctaBox.strokeWeight = 0;

    var ctaText = page2.textFrames.add();
    ctaText.geometricBounds = ["9.65in", "0.9in", "10.1in", "7.6in"];
    ctaText.contents = "Ready to transform global education? Let's connect.";
    ctaText.paragraphs.item(0).justification = Justification.CENTER_ALIGN;
    ctaText.paragraphs.item(0).pointSize = 16;
    try {
        ctaText.texts.item(0).appliedFont = app.fonts.item("Roboto\\tMedium");
    } catch(e) {
        ctaText.texts.item(0).appliedFont = app.fonts.item("Arial\\tBold");
    }
    ctaText.texts.item(0).fillColor = white;

    return "Professional world-class document created successfully!";
})();
"""

response = sendCommand(createCommand("executeExtendScript", {"code": extendscript}))

if response.get("status") == "SUCCESS":
    print("SUCCESS! Professional document created!")
    print(response['response']['result'])

    # Export as PDF
    export_code = """
    (function() {
        var doc = app.activeDocument;
        var file = new File("C:\\\\Users\\\\ovehe\\\\Downloads\\\\TEEI_PROFESSIONAL_WORLD_CLASS.pdf");
        doc.exportFile(ExportFormat.PDF_TYPE, file, false, "[High Quality Print]");
        return "Exported to TEEI_PROFESSIONAL_WORLD_CLASS.pdf";
    })();
    """

    export_response = sendCommand(createCommand("executeExtendScript", {"code": export_code}))
    if export_response.get("status") == "SUCCESS":
        print("\nPDF exported successfully!")
        print("Location: C:\\Users\\ovehe\\Downloads\\TEEI_PROFESSIONAL_WORLD_CLASS.pdf")
        print("\n" + "="*80)
        print("PROFESSIONAL FEATURES:")
        print("- Clean, corporate design")
        print("- Professional navy and teal color scheme")
        print("- Logo placeholders for TEEI and AWS")
        print("- Clear typography hierarchy")
        print("- Organized metrics display")
        print("- Benefits and timeline sections")
        print("- Professional contact information")
        print("- Call to action")
        print("="*80)
    else:
        print("Export failed:", export_response)
else:
    print("Failed:", response)