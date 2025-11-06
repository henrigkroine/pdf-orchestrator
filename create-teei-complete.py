#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Complete TEEI AWS Partnership Brief with Colors
Creates the full document and applies colors via ExtendScript
"""

import sys
import os
import time
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    ⚠️  {action}: {response.get('message')}")
    return response

print("\n" + "="*80)
print("COMPLETE TEEI AWS PARTNERSHIP BRIEF - WITH COLORS")
print("="*80 + "\n")

# Close any existing document
print("📄 Preparing workspace...")
cmd("closeDocument", {"save": "no"})

# Create new A4 document
print("📄 Creating A4 document...")
response = cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 1,
    "pagesFacing": False,
    "margins": {"top": 60, "bottom": 60, "left": 60, "right": 60},
    "name": "TEEI_AWS_Partnership_Complete",
    "units": "pt"
})
print("   ✓ A4 document created")

# Create typography styles
print("🎨 Creating TEEI typography styles...")
cmd("setStyles", {
    "paragraph": [
        {"name": "H1", "spec": {"fontSize": 38, "fontFamily": "Arial\tBold", "leading": 44, "spaceAfter": 16}},
        {"name": "H2", "spec": {"fontSize": 18, "fontFamily": "Arial\tBold", "leading": 24, "spaceBefore": 24, "spaceAfter": 12}},
        {"name": "Subtitle", "spec": {"fontSize": 14, "fontFamily": "Arial\tRegular", "leading": 20, "spaceAfter": 8}},
        {"name": "Body", "spec": {"fontSize": 11, "fontFamily": "Arial\tRegular", "leading": 17, "spaceAfter": 12}},
        {"name": "Metric Number", "spec": {"fontSize": 32, "fontFamily": "Arial\tBold", "leading": 36, "spaceAfter": 6, "alignment": "CENTER"}},
        {"name": "Metric Label", "spec": {"fontSize": 9.5, "fontFamily": "Arial\tRegular", "leading": 13, "alignment": "CENTER"}},
        {"name": "Contact", "spec": {"fontSize": 10, "fontFamily": "Arial\tRegular", "leading": 15}},
        {"name": "Footer", "spec": {"fontSize": 9, "fontFamily": "Arial\tItalic", "leading": 12, "alignment": "CENTER"}}
    ]
})
print("   ✓ Typography styles created")

# Header section with TEEI branding
print("📌 Creating header...")
cmd("createRectangle", {
    "page": 1, "x": 60, "y": 60, "width": 120, "height": 50,
    "fillColor": {"red": 0, "green": 57, "blue": 63}
})
cmd("placeText", {
    "page": 1, "x": 70, "y": 72, "width": 100, "height": 30,
    "content": "TEEI", "style": "H2"
})
print("   ✓ Header complete")

# Hero title
cmd("placeText", {
    "page": 1, "x": 60, "y": 130, "width": 475, "height": 80,
    "content": "Scaling Equal Education Access with AWS",
    "style": "H1"
})

# Subtitle
cmd("placeText", {
    "page": 1, "x": 60, "y": 220, "width": 475, "height": 25,
    "content": "Partnership Proposal from The Educational Equality Institute",
    "style": "Subtitle"
})

# Gold divider line
cmd("createLine", {
    "page": 1, "x1": 60, "y1": 255, "x2": 535, "y2": 255,
    "strokeColor": {"red": 186, "green": 143, "blue": 90},
    "strokeWeight": 2.5
})

# Mission section
print("🎯 Mission section...")
cmd("placeText", {
    "page": 1, "x": 60, "y": 280, "width": 475, "height": 24,
    "content": "Our Mission", "style": "H2"
})
cmd("placeText", {
    "page": 1, "x": 60, "y": 320, "width": 475, "height": 70,
    "content": "The Educational Equality Institute (TEEI) is a global nonprofit dedicated to democratizing access to quality education. Through technology-enabled mentorship, peer learning platforms, and data-driven interventions, we connect underserved students with the resources they need to succeed.",
    "style": "Body"
})
print("   ✓ Mission complete")

# Impact metrics section
print("📊 Impact metrics...")
cmd("placeText", {
    "page": 1, "x": 60, "y": 410, "width": 475, "height": 24,
    "content": "Our Impact at a Glance", "style": "H2"
})

# Metric boxes with light background
metrics = [
    {"x": 60, "number": "10,000+", "label": "Active Beneficiaries"},
    {"x": 220, "number": "2,600+", "label": "Volunteer Mentors"},
    {"x": 380, "number": "50,000+", "label": "Learning Hours"}
]

for metric in metrics:
    # Background box
    cmd("createRectangle", {
        "page": 1, "x": metric["x"], "y": 450,
        "width": 145 if metric["x"] < 380 else 155, "height": 85,
        "fillColor": {"red": 248, "green": 250, "blue": 252}
    })
    # Number
    cmd("placeText", {
        "page": 1, "x": metric["x"] + 10, "y": 465,
        "width": 125 if metric["x"] < 380 else 135, "height": 40,
        "content": metric["number"], "style": "Metric Number"
    })
    # Label
    cmd("placeText", {
        "page": 1, "x": metric["x"] + 10, "y": 510,
        "width": 125 if metric["x"] < 380 else 135, "height": 20,
        "content": metric["label"], "style": "Metric Label"
    })
print("   ✓ Metrics complete")

# Partnership ask section
print("🤝 The Ask...")
cmd("placeText", {
    "page": 1, "x": 60, "y": 560, "width": 475, "height": 24,
    "content": "The Partnership Opportunity", "style": "H2"
})
cmd("placeText", {
    "page": 1, "x": 60, "y": 600, "width": 475, "height": 55,
    "content": "We seek AWS's support to scale our cloud infrastructure, enabling us to serve 50,000+ students globally by 2026. Your infrastructure credits, technical expertise, and advocacy would accelerate our mission to close the education gap.",
    "style": "Body"
})
print("   ✓ The Ask complete")

# What we offer section
print("💎 What We Offer...")
cmd("placeText", {
    "page": 1, "x": 60, "y": 670, "width": 475, "height": 24,
    "content": "What We Bring", "style": "H2"
})

offerings = [
    "• Impact stories showcasing AWS-powered education transformation",
    "• Co-branded case studies and social impact reports",
    "• Speaking opportunities at education and tech conferences"
]

y_pos = 710
for offering in offerings:
    cmd("placeText", {
        "page": 1, "x": 60, "y": y_pos, "width": 475, "height": 18,
        "content": offering, "style": "Body"
    })
    y_pos += 20
print("   ✓ What We Offer complete")

# Contact section
print("📧 Contact...")
cmd("createRectangle", {
    "page": 1, "x": 60, "y": 745, "width": 200, "height": 35,
    "fillColor": {"red": 248, "green": 250, "blue": 252}
})
cmd("placeText", {
    "page": 1, "x": 70, "y": 752, "width": 180, "height": 25,
    "content": "Let's Connect:\nhenrik@teei.org | www.teei.org",
    "style": "Contact"
})
print("   ✓ Contact complete")

# Footer divider and text
print("🔻 Footer...")
cmd("createLine", {
    "page": 1, "x1": 60, "y1": 795, "x2": 535, "y2": 795,
    "strokeColor": {"red": 186, "green": 143, "blue": 90},
    "strokeWeight": 1.5
})
cmd("placeText", {
    "page": 1, "x": 60, "y": 805, "width": 475, "height": 15,
    "content": "Together, we can democratize education at scale",
    "style": "Footer"
})
print("   ✓ Footer complete")

print("\n" + "="*80)
print("APPLYING COLORS VIA EXTENDSCRIPT...")
print("="*80 + "\n")

# Apply colors using ExtendScript
response = cmd("applyColorsViaExtendScript", {})

if response.get("response", {}).get("success"):
    print("✅ Colors applied successfully!")
    print("\nThe document now has:")
    print("  - Deep Teal (#00393f) header box")
    print("  - Gold (#BA8F5A) divider lines")
    print("  - Light (#f8fafc) metric and contact boxes")
else:
    print(f"⚠️ Color application issue: {response.get('response', {}).get('message')}")

print("\n" + "="*80)
print("✅ COMPLETE TEEI AWS PARTNERSHIP BRIEF READY!")
print("="*80)
print("\n📤 Next Steps:")
print("  1. Press 'W' in InDesign to toggle preview mode")
print("  2. File -> Export -> Adobe PDF (Print)")
print("  3. Choose 'High Quality Print' preset")
print("  4. Save as: TEEI_AWS_Partnership_Brief.pdf")
print("\nThe document showcases:")
print("  - TEEI's mission and impact")
print("  - 10,000+ beneficiaries, 2,600+ mentors, 50,000+ hours")
print("  - Clear partnership ask for AWS")
print("  - Professional TEEI branding")
print("="*80 + "\n")