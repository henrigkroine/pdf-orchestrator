#!/usr/bin/env python3
"""
Use the PROVEN WORKING approach from Indesign.md:
Just use ExtendScript for EVERYTHING - forget UXP's broken text system
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
    if response.get("status") != "SUCCESS":
        print(f"ERROR: {response}")
        raise Exception(f"Command failed: {action}")
    return response

print("\n" + "="*80)
print("CREATING PROFESSIONAL DOCUMENT VIA EXTENDSCRIPT")
print("="*80 + "\n")

# Use ONE BIG ExtendScript to create EVERYTHING
extendscript = """
(function() {
    // Create document
    var doc = app.documents.add();
    doc.documentPreferences.pageWidth = "595px";
    doc.documentPreferences.pageHeight = "842px";
    doc.documentPreferences.pagesPerDocument = 2;
    doc.documentPreferences.facingPages = false;

    // Set margins
    with (doc.marginPreferences) {
        top = "50px";
        bottom = "50px";
        left = "40px";
        right = "40px";
    }

    // Create TEEI brand colors
    var teeiTeal = doc.colors.add();
    teeiTeal.name = "TEEI_Teal";
    teeiTeal.space = ColorSpace.RGB;
    teeiTeal.colorValue = [0, 57, 63];

    var teeiGold = doc.colors.add();
    teeiGold.name = "TEEI_Gold";
    teeiGold.space = ColorSpace.RGB;
    teeiGold.colorValue = [186, 143, 90];

    var lightGold = doc.colors.add();
    lightGold.name = "TEEI_LightGold";
    lightGold.space = ColorSpace.RGB;
    lightGold.colorValue = [210, 180, 140];

    var lightBg = doc.colors.add();
    lightBg.name = "TEEI_LightBg";
    lightBg.space = ColorSpace.RGB;
    lightBg.colorValue = [248, 250, 252];

    var white = doc.swatches.item("Paper");
    var none = doc.swatches.item("None");

    var page1 = doc.pages[0];

    // === PAGE 1 ===

    // Header box (teal)
    var headerBox = page1.rectangles.add();
    headerBox.geometricBounds = ["40px", "40px", "160px", "555px"];
    headerBox.fillColor = teeiTeal;
    headerBox.strokeColor = none;

    // Gold accent stripe
    var goldStripe = page1.rectangles.add();
    goldStripe.geometricBounds = ["40px", "40px", "160px", "48px"];
    goldStripe.fillColor = teeiGold;
    goldStripe.strokeColor = none;

    // Organization title (white text in header)
    var titleFrame = page1.textFrames.add();
    titleFrame.geometricBounds = ["55px", "60px", "85px", "440px"];
    titleFrame.contents = "THE EDUCATIONAL EQUALITY INSTITUTE";
    titleFrame.parentStory.characters.everyItem().pointSize = 24;
    titleFrame.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    titleFrame.parentStory.characters.everyItem().fillColor = white;
    titleFrame.fillColor = none;
    titleFrame.strokeColor = none;

    // Tagline (light gold)
    var taglineFrame = page1.textFrames.add();
    taglineFrame.geometricBounds = ["90px", "60px", "150px", "540px"];
    taglineFrame.contents = "Transforming Lives Through Technology-Enabled Education";
    taglineFrame.parentStory.characters.everyItem().pointSize = 14;
    taglineFrame.parentStory.characters.everyItem().fillColor = lightGold;
    taglineFrame.fillColor = none;
    taglineFrame.strokeColor = none;

    // Section header
    var sectionHeader = page1.textFrames.add();
    sectionHeader.geometricBounds = ["180px", "48px", "205px", "548px"];
    sectionHeader.contents = "STRATEGIC ALLIANCE WITH AMAZON WEB SERVICES";
    sectionHeader.parentStory.characters.everyItem().pointSize = 16;
    sectionHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    sectionHeader.parentStory.characters.everyItem().fillColor = teeiTeal;
    sectionHeader.fillColor = none;
    sectionHeader.strokeColor = none;

    // Gold divider line
    var dividerLine = page1.graphicLines.add();
    dividerLine.paths[0].entirePath = [["210px", "48px"], ["210px", "548px"]];
    dividerLine.strokeColor = teeiGold;
    dividerLine.strokeWeight = "3px";

    // Metrics boxes (4 columns)
    var metrics = [
        {label: "STUDENTS REACHED", value: "10,000+", x: 48},
        {label: "ACTIVE MENTORS", value: "2,600+", x: 173},
        {label: "SUCCESS RATE", value: "97%", x: 298},
        {label: "COUNTRIES", value: "15", x: 423}
    ];

    for (var i = 0; i < metrics.length; i++) {
        var m = metrics[i];

        // Metric box background
        var metricBox = page1.rectangles.add();
        metricBox.geometricBounds = ["230px", m.x + "px", "320px", (m.x + 115) + "px"];
        metricBox.fillColor = lightBg;
        metricBox.strokeColor = none;

        // Metric value (gold, large)
        var valueFrame = page1.textFrames.add();
        valueFrame.geometricBounds = ["245px", (m.x + 10) + "px", "280px", (m.x + 105) + "px"];
        valueFrame.contents = m.value;
        valueFrame.parentStory.characters.everyItem().pointSize = 28;
        valueFrame.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
        valueFrame.parentStory.characters.everyItem().fillColor = teeiGold;
        valueFrame.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
        valueFrame.fillColor = none;
        valueFrame.strokeColor = none;

        // Metric label (small, dark)
        var labelFrame = page1.textFrames.add();
        labelFrame.geometricBounds = ["285px", (m.x + 10) + "px", "305px", (m.x + 105) + "px"];
        labelFrame.contents = m.label;
        labelFrame.parentStory.characters.everyItem().pointSize = 9;
        labelFrame.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
        labelFrame.fillColor = none;
        labelFrame.strokeColor = none;
    }

    // Value proposition header
    var vpHeader = page1.textFrames.add();
    vpHeader.geometricBounds = ["340px", "48px", "360px", "548px"];
    vpHeader.contents = "Why Partner With TEEI?";
    vpHeader.parentStory.characters.everyItem().pointSize = 14;
    vpHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    vpHeader.parentStory.characters.everyItem().fillColor = teeiTeal;
    vpHeader.fillColor = none;
    vpHeader.strokeColor = none;

    // Value props
    var props = [
        "• Proven track record of educational transformation at scale",
        "• Technology-first approach aligned with AWS innovation",
        "• Deep reach into underserved communities across 15 countries",
        "• 97% program success rate backed by rigorous metrics"
    ];

    var yOffset = 370;
    for (var j = 0; j < props.length; j++) {
        var propFrame = page1.textFrames.add();
        propFrame.geometricBounds = [yOffset + "px", "58px", (yOffset + 18) + "px", "538px"];
        propFrame.contents = props[j];
        propFrame.parentStory.characters.everyItem().pointSize = 11;
        propFrame.fillColor = none;
        propFrame.strokeColor = none;
        yOffset += 22;
    }

    // === PAGE 2 ===

    var page2 = doc.pages[1];

    // Timeline header
    var timelineHeader = page2.textFrames.add();
    timelineHeader.geometricBounds = ["60px", "48px", "85px", "548px"];
    timelineHeader.contents = "IMPLEMENTATION TIMELINE";
    timelineHeader.parentStory.characters.everyItem().pointSize = 16;
    timelineHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    timelineHeader.parentStory.characters.everyItem().fillColor = teeiTeal;
    timelineHeader.fillColor = none;
    timelineHeader.strokeColor = none;

    // Timeline line
    var timelineLine = page2.graphicLines.add();
    timelineLine.paths[0].entirePath = [["90px", "48px"], ["90px", "548px"]];
    timelineLine.strokeColor = teeiGold;
    timelineLine.strokeWeight = "3px";

    // Timeline phases
    var phases = [
        {phase: "Phase 1", title: "Discovery & Planning", duration: "Weeks 1-4", y: 120},
        {phase: "Phase 2", title: "Infrastructure Setup", duration: "Weeks 5-8", y: 220},
        {phase: "Phase 3", title: "Pilot Launch", duration: "Weeks 9-16", y: 320},
        {phase: "Phase 4", title: "Full Deployment", duration: "Weeks 17-24", y: 420}
    ];

    for (var k = 0; k < phases.length; k++) {
        var p = phases[k];

        // Phase number box (teal)
        var phaseBox = page2.rectangles.add();
        phaseBox.geometricBounds = [p.y + "px", "48px", (p.y + 70) + "px", "148px"];
        phaseBox.fillColor = teeiTeal;
        phaseBox.strokeColor = none;

        // Phase number (white text)
        var phaseNum = page2.textFrames.add();
        phaseNum.geometricBounds = [(p.y + 25) + "px", "58px", (p.y + 45) + "px", "138px"];
        phaseNum.contents = p.phase;
        phaseNum.parentStory.characters.everyItem().pointSize = 12;
        phaseNum.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
        phaseNum.parentStory.characters.everyItem().fillColor = white;
        phaseNum.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
        phaseNum.fillColor = none;
        phaseNum.strokeColor = none;

        // Arrow line
        var arrow = page2.graphicLines.add();
        arrow.paths[0].entirePath = [[(p.y + 35) + "px", "158px"], [(p.y + 35) + "px", "210px"]];
        arrow.strokeColor = teeiGold;
        arrow.strokeWeight = "2px";

        // Phase detail box (light bg)
        var detailBox = page2.rectangles.add();
        detailBox.geometricBounds = [p.y + "px", "220px", (p.y + 70) + "px", "548px"];
        detailBox.fillColor = lightBg;
        detailBox.strokeColor = none;

        // Phase title
        var phaseTitle = page2.textFrames.add();
        phaseTitle.geometricBounds = [(p.y + 15) + "px", "235px", (p.y + 35) + "px", "533px"];
        phaseTitle.contents = p.title;
        phaseTitle.parentStory.characters.everyItem().pointSize = 13;
        phaseTitle.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
        phaseTitle.fillColor = none;
        phaseTitle.strokeColor = none;

        // Duration
        var duration = page2.textFrames.add();
        duration.geometricBounds = [(p.y + 45) + "px", "235px", (p.y + 63) + "px", "533px"];
        duration.contents = p.duration;
        duration.parentStory.characters.everyItem().pointSize = 10;
        duration.fillColor = none;
        duration.strokeColor = none;
    }

    // Contact CTA box
    var ctaBox = page2.rectangles.add();
    ctaBox.geometricBounds = ["720px", "48px", "800px", "548px"];
    ctaBox.fillColor = lightBg;
    ctaBox.strokeColor = none;

    // CTA header
    var ctaHeader = page2.textFrames.add();
    ctaHeader.geometricBounds = ["735px", "68px", "755px", "528px"];
    ctaHeader.contents = "Ready to Transform Education Together?";
    ctaHeader.parentStory.characters.everyItem().pointSize = 14;
    ctaHeader.parentStory.characters.everyItem().appliedFont = app.fonts.item("Arial\\tBold");
    ctaHeader.parentStory.characters.everyItem().fillColor = teeiTeal;
    ctaHeader.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    ctaHeader.fillColor = none;
    ctaHeader.strokeColor = none;

    // Contact info
    var contact = page2.textFrames.add();
    contact.geometricBounds = ["765px", "68px", "783px", "528px"];
    contact.contents = "Contact: partnerships@teei.org | www.teei.org/aws-partnership";
    contact.parentStory.characters.everyItem().pointSize = 11;
    contact.parentStory.paragraphs.everyItem().justification = Justification.CENTER_ALIGN;
    contact.fillColor = none;
    contact.strokeColor = none;

    return "Document created successfully with all colors!";
})();
"""

print("Running ExtendScript to create complete document...")
response = cmd("executeExtendScript", {"code": extendscript})

print("\n" + "="*80)
print("SUCCESS! PROFESSIONAL DOCUMENT CREATED!")
print("="*80)
print("\nEverything created via ExtendScript in one shot:")
print("  ✓ 2-page document with margins")
print("  ✓ TEEI brand colors (Teal, Gold, Light backgrounds)")
print("  ✓ Professional header with title and tagline")
print("  ✓ 4 metrics boxes with values")
print("  ✓ Value proposition section")
print("  ✓ Implementation timeline on page 2")
print("  ✓ Contact CTA box")
print("  ✓ ALL text properly colored")
print("\nPress 'W' in InDesign to toggle preview mode")
print("="*80 + "\n")
