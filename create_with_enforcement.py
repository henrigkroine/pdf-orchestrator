#!/usr/bin/env python3
"""
BRAND-ENFORCED TEEI AWS PARTNERSHIP DOCUMENT
=============================================
Demonstrates brand compliance enforcement in action.

This script creates a world-class TEEI AWS partnership document with
real-time brand compliance enforcement, making it IMPOSSIBLE to violate
brand guidelines.

Author: TEEI Brand Compliance System
Version: 1.0.0
Date: 2025-11-08
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
from brand_compliance_enforcer import BrandEnforcer

# Initialize MCP
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

print("=" * 80)
print("CREATING BRAND-ENFORCED TEEI AWS PARTNERSHIP DOCUMENT")
print("=" * 80)
print()

# ============================================================================
# STEP 1: Initialize Brand Enforcer
# ============================================================================
print("Step 1: Initializing Brand Compliance Enforcer...")
enforcer = BrandEnforcer(strict_mode=True, auto_correct=True)
print()

# ============================================================================
# STEP 2: Define Document Colors (will be enforced)
# ============================================================================
print("Step 2: Enforcing Brand Colors...")
print("-" * 80)

# Try to use various colors (some forbidden, some non-brand)
colors_to_test = {
    'primary': '#C87137',      # Copper - FORBIDDEN
    'secondary': '#FF6600',    # Orange - FORBIDDEN
    'accent': '#C9E4EC',       # Sky - VALID
    'background': '#FFF1E2',   # Sand - VALID
    'random': '#123456',       # Unknown - will correct to Nordshore
}

enforced_colors = {}
for name, color in colors_to_test.items():
    color_name, rgb = enforcer.enforce_color(color, context=f"{name} color")
    enforced_colors[name] = {
        'name': color_name,
        'rgb': rgb,
        'rgb_string': f"{rgb[0]}, {rgb[1]}, {rgb[2]}"
    }

print()

# ============================================================================
# STEP 3: Define Typography (will be enforced)
# ============================================================================
print("Step 3: Enforcing Typography...")
print("-" * 80)

# Get enforced type specifications
title_spec = enforcer.get_type_spec('documentTitle')
header_spec = enforcer.get_type_spec('sectionHeader')
subhead_spec = enforcer.get_type_spec('subhead')
body_spec = enforcer.get_type_spec('bodyText')
caption_spec = enforcer.get_type_spec('caption')

print(f"✓ Document Title: {title_spec['font']}, {title_spec['size']}pt")
print(f"✓ Section Header: {header_spec['font']}, {header_spec['size']}pt")
print(f"✓ Subhead: {subhead_spec['font']}, {subhead_spec['size']}pt")
print(f"✓ Body Text: {body_spec['font']}, {body_spec['size']}pt")
print(f"✓ Caption: {caption_spec['font']}, {caption_spec['size']}pt")
print()

# ============================================================================
# STEP 4: Define Spacing (will be enforced)
# ============================================================================
print("Step 4: Enforcing Spacing Standards...")
print("-" * 80)

margin = enforcer.get_spacing('margin')
section_spacing = enforcer.get_spacing('section')
element_spacing = enforcer.get_spacing('element')
paragraph_spacing = enforcer.get_spacing('paragraph')

print(f"✓ Margins: {margin}pt all sides")
print(f"✓ Section breaks: {section_spacing}pt")
print(f"✓ Element spacing: {element_spacing}pt")
print(f"✓ Paragraph spacing: {paragraph_spacing}pt")
print()

# ============================================================================
# STEP 5: Validate Content (no placeholders, no cutoffs)
# ============================================================================
print("Step 5: Validating Content...")
print("-" * 80)

# Test various content strings
content_items = [
    ("Partnership Title", "AWS World Class Partnership"),
    ("Tagline", "Empowering Educators, Transforming Lives"),
    ("Metric 1", "50,000+ Students Reached"),  # Valid
    ("Metric 2", "XX Students Reached"),        # INVALID - placeholder
    ("CTA Full", "Ready to Transform Education?"),  # Valid
    ("CTA Cut", "Ready to Transform Educa-"),      # INVALID - cutoff
]

validated_content = {}
for name, text in content_items:
    try:
        # Validate metrics (no placeholders)
        if "Metric" in name:
            enforcer.enforce_metrics(text)

        # Validate completeness (no cutoffs)
        enforcer.enforce_text_completeness(text)

        validated_content[name] = text
        print(f"✓ {name}: VALID")
    except ValueError as e:
        print(f"✗ {name}: BLOCKED - {str(e)[:50]}...")

print()

# ============================================================================
# STEP 6: Build ExtendScript with Enforced Values
# ============================================================================
print("Step 6: Building Document with Enforced Brand Standards...")
print("-" * 80)

# Get primary enforced color
primary_color = enforced_colors['accent']  # Using valid Sky color
bg_color = enforced_colors['background']   # Using valid Sand color

extendscript = f"""
(function() {{
    try {{
        // Create new document - Letter size (8.5 x 11 inches)
        var doc = app.documents.add();
        doc.documentPreferences.pageWidth = "8.5in";
        doc.documentPreferences.pageHeight = "11in";
        doc.documentPreferences.pagesPerDocument = 1;
        doc.documentPreferences.facingPages = false;

        // Set enforced margins ({margin}pt = ~14.11mm)
        var marginMm = {margin} * 0.352778;  // Convert pt to mm
        doc.marginPreferences.top = marginMm + "mm";
        doc.marginPreferences.bottom = marginMm + "mm";
        doc.marginPreferences.left = marginMm + "mm";
        doc.marginPreferences.right = marginMm + "mm";

        // Create enforced brand color swatches
        var primaryColor = doc.colors.add();
        primaryColor.name = "{primary_color['name']}";
        primaryColor.space = ColorSpace.RGB;
        primaryColor.colorValue = [{primary_color['rgb_string']}];

        var bgColor = doc.colors.add();
        bgColor.name = "{bg_color['name']}";
        bgColor.space = ColorSpace.RGB;
        bgColor.colorValue = [{bg_color['rgb_string']}];

        var page = doc.pages[0];

        // Background rectangle with enforced color
        var bgRect = page.rectangles.add();
        bgRect.geometricBounds = [0, 0, "11in", "8.5in"];
        bgRect.fillColor = bgColor;
        bgRect.strokeWeight = 0;

        // Title with enforced typography
        var titleFrame = page.textFrames.add();
        titleFrame.geometricBounds = [
            "{margin}pt",
            "{margin}pt",
            "{margin + title_spec['size'] * 2}pt",
            "8.5in - {margin}pt"
        ];
        titleFrame.contents = "{validated_content.get('Partnership Title', 'AWS World Class Partnership')}";

        // Apply enforced typography
        titleFrame.paragraphs[0].appliedFont = app.fonts.item("{title_spec['font']}");
        titleFrame.paragraphs[0].pointSize = {title_spec['size']};
        titleFrame.paragraphs[0].leading = {title_spec['size'] * title_spec['lineHeight']};
        titleFrame.paragraphs[0].fillColor = primaryColor;
        titleFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

        // Tagline
        var taglineY = {margin + title_spec['size'] * 2 + element_spacing};
        var taglineFrame = page.textFrames.add();
        taglineFrame.geometricBounds = [
            taglineY + "pt",
            "{margin}pt",
            taglineY + {subhead_spec['size'] * 2} + "pt",
            "8.5in - {margin}pt"
        ];
        taglineFrame.contents = "{validated_content.get('Tagline', 'Empowering Educators, Transforming Lives')}";

        taglineFrame.paragraphs[0].appliedFont = app.fonts.item("{subhead_spec['font']}");
        taglineFrame.paragraphs[0].pointSize = {subhead_spec['size']};
        taglineFrame.paragraphs[0].fillColor = primaryColor;
        taglineFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

        // Metrics section (only valid metrics)
        var metricsY = taglineY + {subhead_spec['size'] * 2 + section_spacing};
        var metricFrame = page.textFrames.add();
        metricFrame.geometricBounds = [
            metricsY + "pt",
            "{margin}pt",
            metricsY + 100 + "pt",
            "8.5in - {margin}pt"
        ];
        metricFrame.contents = "{validated_content.get('Metric 1', '50,000+ Students Reached')}";

        metricFrame.paragraphs[0].appliedFont = app.fonts.item("{header_spec['font']}");
        metricFrame.paragraphs[0].pointSize = {header_spec['size']};
        metricFrame.paragraphs[0].fillColor = primaryColor;
        metricFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

        // CTA section (only complete text)
        var ctaY = metricsY + 100 + {section_spacing};
        var ctaFrame = page.textFrames.add();
        ctaFrame.geometricBounds = [
            ctaY + "pt",
            "{margin}pt",
            ctaY + 50 + "pt",
            "8.5in - {margin}pt"
        ];
        ctaFrame.contents = "{validated_content.get('CTA Full', 'Ready to Transform Education?')}";

        ctaFrame.paragraphs[0].appliedFont = app.fonts.item("{body_spec['font']}");
        ctaFrame.paragraphs[0].pointSize = {body_spec['size']};
        ctaFrame.paragraphs[0].fillColor = primaryColor;
        ctaFrame.paragraphs[0].justification = Justification.CENTER_ALIGN;

        return "✅ SUCCESS: Brand-enforced document created!";
    }} catch (err) {{
        return "❌ ERROR: " + err.toString();
    }}
}})()
"""

# ============================================================================
# STEP 7: Execute Document Creation
# ============================================================================
print("Executing document creation with enforced brand standards...")
result = sendCommand(createCommand(extendscript))
print(f"Result: {result}")
print()

# ============================================================================
# STEP 8: Generate Compliance Report
# ============================================================================
print("=" * 80)
print("FINAL BRAND COMPLIANCE REPORT")
print("=" * 80)
enforcer.print_report()

# Save report to file
report = enforcer.generate_report()
import json
with open('exports/brand-compliance-report.json', 'w') as f:
    json.dump(report, f, indent=2)

print(f"\n✅ Full report saved to: exports/brand-compliance-report.json")
print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 80)
print("SUMMARY")
print("=" * 80)
print()
print("Brand Violations Detected and Corrected:")
print("  • Copper color (#C87137) → Auto-corrected to Nordshore")
print("  • Orange color (#FF6600) → Auto-corrected to Nordshore")
print("  • Unknown color (#123456) → Auto-corrected to Nordshore")
print("  • 'XX Students Reached' → BLOCKED (placeholder detected)")
print("  • 'Ready to Transform Educa-' → BLOCKED (text cutoff detected)")
print()
print("Brand Compliance Features Applied:")
print(f"  • Official TEEI colors: {primary_color['name']}, {bg_color['name']}")
print(f"  • Typography scale: {title_spec['size']}pt, {header_spec['size']}pt, {subhead_spec['size']}pt, {body_spec['size']}pt")
print(f"  • Standard margins: {margin}pt all sides")
print(f"  • Proper spacing: {section_spacing}pt sections, {element_spacing}pt elements")
print()
print(f"Final Score: {report['score']}/100 (Grade: {report['grade']})")
print()
print("🌟 " + ("WORLD-CLASS DOCUMENT!" if report['score'] >= 95 else "EXCELLENT QUALITY!" if report['score'] >= 85 else "GOOD QUALITY"))
print("=" * 80)
