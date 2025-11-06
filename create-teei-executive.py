#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI AWS Executive Partnership Brief
Ultra-professional, enterprise-grade design
"""

import sys
import os
import io
import time

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
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
print("TEEI × AWS EXECUTIVE PARTNERSHIP BRIEF")
print("Enterprise-Grade Professional Document")
print("="*80 + "\n")

# Close any existing document
print("🎯 Initializing executive document...")
try:
    cmd("closeDocument", {"save": "no"})
except:
    pass  # No document open, that's fine

# Create new A4 document with tighter margins for professional look
print("📐 Creating premium layout...")
response = cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 1,
    "pagesFacing": False,
    "margins": {"top": 48, "bottom": 48, "left": 54, "right": 54},
    "name": "TEEI_AWS_Executive_Partnership",
    "units": "pt"
})
print("   ✓ Premium A4 canvas ready")

# Professional typography hierarchy
print("🎨 Establishing executive typography...")
cmd("setStyles", {
    "paragraph": [
        {"name": "Hero", "spec": {"fontSize": 42, "fontFamily": "Helvetica Neue\tLight", "leading": 48, "spaceAfter": 20, "tracking": -20}},
        {"name": "H1", "spec": {"fontSize": 28, "fontFamily": "Helvetica Neue\tBold", "leading": 32, "spaceAfter": 16}},
        {"name": "H2", "spec": {"fontSize": 16, "fontFamily": "Helvetica Neue\tMedium", "leading": 22, "spaceBefore": 20, "spaceAfter": 10, "tracking": 30}},
        {"name": "Lead", "spec": {"fontSize": 13, "fontFamily": "Helvetica Neue\tRegular", "leading": 20, "spaceAfter": 8, "tracking": 10}},
        {"name": "Body", "spec": {"fontSize": 10.5, "fontFamily": "Helvetica Neue\tRegular", "leading": 16, "spaceAfter": 10}},
        {"name": "Metric", "spec": {"fontSize": 36, "fontFamily": "Helvetica Neue\tBold", "leading": 38, "spaceAfter": 4, "alignment": "CENTER", "tracking": -10}},
        {"name": "MetricLabel", "spec": {"fontSize": 8.5, "fontFamily": "Helvetica Neue\tMedium", "leading": 11, "alignment": "CENTER", "tracking": 50, "capitalization": "ALL_CAPS"}},
        {"name": "Quote", "spec": {"fontSize": 14, "fontFamily": "Georgia\tItalic", "leading": 22, "spaceAfter": 12, "leftIndent": 20, "rightIndent": 20}},
        {"name": "CTA", "spec": {"fontSize": 11, "fontFamily": "Helvetica Neue\tMedium", "leading": 14, "tracking": 30}},
        {"name": "Footer", "spec": {"fontSize": 8, "fontFamily": "Helvetica Neue\tRegular", "leading": 11, "alignment": "CENTER", "tracking": 20}}
    ]
})
print("   ✓ Executive typography established")

# HEADER: Premium brand header with gradient effect
print("🏢 Building executive header...")
# Main header background
cmd("createRectangle", {
    "page": 1, "x": 0, "y": 0, "width": 595, "height": 120,
    "fillColor": {"red": 0, "green": 57, "blue": 63}
})

# TEEI Logo area with subtle accent
cmd("createRectangle", {
    "page": 1, "x": 54, "y": 35, "width": 140, "height": 50,
    "fillColor": {"red": 0, "green": 47, "blue": 53}
})

cmd("placeText", {
    "page": 1, "x": 64, "y": 47, "width": 120, "height": 30,
    "content": "TEEI",
    "style": "H1"
})

# Tagline
cmd("placeText", {
    "page": 1, "x": 210, "y": 50, "width": 320, "height": 20,
    "content": "THE EDUCATIONAL EQUALITY INSTITUTE",
    "style": "MetricLabel"
})

print("   ✓ Executive header complete")

# HERO SECTION: Powerful value proposition
print("💼 Crafting value proposition...")
cmd("placeText", {
    "page": 1, "x": 54, "y": 145, "width": 487, "height": 100,
    "content": "Transforming Global Education Through Cloud-Powered Innovation",
    "style": "Hero"
})

# Strategic partnership positioning
cmd("placeText", {
    "page": 1, "x": 54, "y": 255, "width": 487, "height": 30,
    "content": "Strategic Partnership Opportunity with Amazon Web Services",
    "style": "Lead"
})

# Executive divider
cmd("createLine", {
    "page": 1, "x1": 54, "y1": 300, "x2": 541, "y2": 300,
    "strokeColor": {"red": 186, "green": 143, "blue": 90},
    "strokeWeight": 3
})

# EXECUTIVE SUMMARY
print("📊 Executive summary...")
cmd("placeText", {
    "page": 1, "x": 54, "y": 320, "width": 487, "height": 20,
    "content": "EXECUTIVE SUMMARY",
    "style": "H2"
})

cmd("placeText", {
    "page": 1, "x": 54, "y": 350, "width": 487, "height": 75,
    "content": "The Educational Equality Institute seeks a strategic cloud infrastructure partnership with AWS to scale our proven education delivery platform from 10,000 to 50,000+ beneficiaries by 2026. This partnership will enable TEEI to democratize access to quality education across emerging markets while showcasing AWS's commitment to global social impact through technology innovation.",
    "style": "Body"
})

# IMPACT METRICS - Premium visualization
print("📈 Visualizing impact metrics...")
cmd("placeText", {
    "page": 1, "x": 54, "y": 445, "width": 487, "height": 20,
    "content": "PROVEN IMPACT AT SCALE",
    "style": "H2"
})

# Create sophisticated metric cards
metrics = [
    {"x": 54, "value": "10,000+", "label": "STUDENTS", "sublabel": "TRANSFORMED"},
    {"x": 207, "value": "2,600+", "label": "EXPERT", "sublabel": "MENTORS"},
    {"x": 360, "value": "97%", "label": "SUCCESS", "sublabel": "RATE"},
    {"x": 460, "value": "15", "label": "COUNTRIES", "sublabel": "REACHED"}
]

for metric in metrics:
    width = 135 if metric["x"] < 460 else 81
    # Gradient background effect
    cmd("createRectangle", {
        "page": 1, "x": metric["x"], "y": 480, "width": width, "height": 90,
        "fillColor": {"red": 248, "green": 250, "blue": 252}
    })
    # Accent line
    cmd("createLine", {
        "page": 1, "x1": metric["x"], "y1": 480, "x2": metric["x"] + width, "y2": 480,
        "strokeColor": {"red": 186, "green": 143, "blue": 90},
        "strokeWeight": 2
    })
    # Metric value
    cmd("placeText", {
        "page": 1, "x": metric["x"], "y": 495, "width": width, "height": 40,
        "content": metric["value"], "style": "Metric"
    })
    # Labels
    cmd("placeText", {
        "page": 1, "x": metric["x"], "y": 535, "width": width, "height": 12,
        "content": metric["label"], "style": "MetricLabel"
    })
    cmd("placeText", {
        "page": 1, "x": metric["x"], "y": 548, "width": width, "height": 12,
        "content": metric["sublabel"], "style": "MetricLabel"
    })

print("   ✓ Impact visualization complete")

# STRATEGIC ALIGNMENT
print("🎯 Strategic alignment...")
cmd("placeText", {
    "page": 1, "x": 54, "y": 590, "width": 240, "height": 20,
    "content": "STRATEGIC ALIGNMENT",
    "style": "H2"
})

# Two-column layout for benefits
cmd("placeText", {
    "page": 1, "x": 54, "y": 620, "width": 230, "height": 100,
    "content": "AWS BENEFITS:\n\n• Global social impact leadership\n• Education sector case studies\n• Emerging market penetration\n• ESG portfolio enhancement\n• Co-innovation opportunities",
    "style": "Body"
})

cmd("placeText", {
    "page": 1, "x": 300, "y": 620, "width": 241, "height": 100,
    "content": "TEEI DELIVERS:\n\n• Measurable social ROI metrics\n• AWS success stories\n• Joint PR & thought leadership\n• Conference speaking opportunities\n• Annual impact reporting",
    "style": "Body"
})

# CALL TO ACTION
print("🚀 Call to action...")
cmd("createRectangle", {
    "page": 1, "x": 54, "y": 730, "width": 487, "height": 50,
    "fillColor": {"red": 186, "green": 143, "blue": 90}
})

cmd("placeText", {
    "page": 1, "x": 64, "y": 745, "width": 467, "height": 25,
    "content": "JOIN US IN DEMOCRATIZING EDUCATION AT SCALE",
    "style": "CTA"
})

# Professional footer
print("📍 Professional footer...")
cmd("createLine", {
    "page": 1, "x1": 54, "y1": 800, "x2": 541, "y2": 800,
    "strokeColor": {"red": 0, "green": 57, "blue": 63},
    "strokeWeight": 0.5
})

cmd("placeText", {
    "page": 1, "x": 54, "y": 808, "width": 487, "height": 20,
    "content": "henrik@teei.org  |  www.teei.org  |  LinkedIn: /in/henrik-roine  |  Confidential & Proprietary",
    "style": "Footer"
})

print("   ✓ Document structure complete")

# Apply professional colors
print("\n🎨 Applying executive color scheme...")
time.sleep(1)
response = cmd("applyColorsViaExtendScript", {})

if response.get("response", {}).get("success"):
    print("✅ Executive colors applied successfully!")
else:
    print(f"⚠️ Manual color application may be needed")

print("\n" + "="*80)
print("✅ EXECUTIVE PARTNERSHIP BRIEF COMPLETE!")
print("="*80)
print("\n🏆 Professional Features:")
print("  • Enterprise-grade typography (Helvetica Neue)")
print("  • Executive color palette (Teal, Gold, Premium grays)")
print("  • Strategic two-column layout")
print("  • Data-driven impact metrics")
print("  • Clear value proposition & CTA")
print("\n📤 Export Instructions:")
print("  1. Review in InDesign (Press 'W' for preview)")
print("  2. File -> Export -> Adobe PDF (Print)")
print("  3. Preset: 'High Quality Print' or 'Press Quality'")
print("  4. Filename: TEEI_AWS_Executive_Partnership_2024.pdf")
print("\n💼 Ready for C-Suite presentation!")
print("="*80 + "\n")