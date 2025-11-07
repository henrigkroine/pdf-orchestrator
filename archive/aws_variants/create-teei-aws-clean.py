#!/usr/bin/env python3
"""
TEEI AWS Partnership Brief - Clean Professional Version
Using only tested Core v1 commands
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

# TEEI Brand Colors (Official Design System)
TEEI_DEEP_TEAL = {"red": 0, "green": 57, "blue": 63}        # #00393f - Primary brand color
TEEI_GOLD = {"red": 186, "green": 143, "blue": 90}          # #BA8F5A - Accent color
LIGHT_TEAL = {"red": 248, "green": 250, "blue": 252}        # #f8fafc - Light background
TEXT_GRAY = {"red": 71, "green": 85, "blue": 105}           # #475569 - Body text
LIGHT_GRAY = {"red": 248, "green": 250, "blue": 252}        # #f8fafc - Light sections

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    [WARNING] {action}: {response.get('message')}")
    return response

print("\n" + "="*70)
print("CREATING TEEI AWS PARTNERSHIP BRIEF")
print("="*70 + "\n")

# Close any open document
try:
    cmd("closeDocument", {"save": "no"})
except:
    pass

# Create A4 document
print(">>> Creating A4 document...")
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 1,
    "pagesFacing": False,
    "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
    "name": "TEEI_AWS_Partnership_Brief",
    "units": "pt"
})

# Create styles
print(">>> Creating typography styles...")
cmd("setStyles", {
    "paragraph": [
        {"name": "Title", "spec": {"fontSize": 32, "fontFamily": "Arial\tBold", "leading": 38, "spaceAfter": 4}},
        {"name": "Subtitle", "spec": {"fontSize": 13, "fontFamily": "Arial\tRegular", "leading": 18, "spaceAfter": 0}},
        {"name": "Section Header", "spec": {"fontSize": 16, "fontFamily": "Arial\tBold", "leading": 20, "spaceBefore": 16, "spaceAfter": 8}},
        {"name": "Body", "spec": {"fontSize": 10.5, "fontFamily": "Arial\tRegular", "leading": 16, "spaceAfter": 10}},
        {"name": "Metric Number", "spec": {"fontSize": 28, "fontFamily": "Arial\tBold", "leading": 32, "spaceAfter": 2, "alignment": "CENTER"}},
        {"name": "Metric Label", "spec": {"fontSize": 9, "fontFamily": "Arial\tRegular", "leading": 13, "alignment": "CENTER"}},
        {"name": "Contact", "spec": {"fontSize": 9.5, "fontFamily": "Arial\tRegular", "leading": 14}},
        {"name": "Footer", "spec": {"fontSize": 8.5, "fontFamily": "Arial\tItalic", "leading": 12, "alignment": "CENTER"}}
    ],
    "character": [],
    "object": []
})

# HEADER SECTION
print(">>> Creating header...")

# Logo placeholder
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 50,
    "width": 100,
    "height": 30,
    "fillColor": LIGHT_TEAL
})

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 50,
    "width": 100,
    "height": 30,
    "content": "TEEI",
    "style": None
})

# Title
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 95,
    "width": 495,
    "height": 50,
    "content": "Scaling Equal Education Access with AWS",
    "style": "Title"
})

# Subtitle
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 145,
    "width": 495,
    "height": 20,
    "content": "A partnership proposal from The Educational Equality Institute",
    "style": "Subtitle"
})

# Gold accent line
cmd("createLine", {
    "page": 1,
    "x1": 50,
    "y1": 172,
    "x2": 545,
    "y2": 172,
    "strokeColor": TEEI_GOLD,
    "strokeWeight": 2
})

# MISSION
print(">>> Adding mission section...")
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 190,
    "width": 495,
    "height": 22,
    "content": "OUR MISSION",
    "style": "Section Header"
})

mission = "The Educational Equality Institute (TEEI) provides free, high-quality language learning and personalized mentorship to refugees and displaced learners worldwide. We break down barriers to education by connecting vulnerable populations with volunteer mentors, empowering them to rebuild their lives through language skills and human connection."

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 220,
    "width": 495,
    "height": 65,
    "content": mission,
    "style": "Body"
})

# IMPACT METRICS
print(">>> Creating impact metrics...")
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 300,
    "width": 495,
    "height": 22,
    "content": "IMPACT AT SCALE",
    "style": "Section Header"
})

# Metric boxes
metrics = [
    {"number": "10,000", "label": "Active Beneficiaries", "x": 50},
    {"number": "2,600", "label": "Volunteer Mentors", "x": 225},
    {"number": "50,000+", "label": "Learning Hours", "x": 400}
]

for metric in metrics:
    # Background box
    cmd("createRectangle", {
        "page": 1,
        "x": metric["x"],
        "y": 330,
        "width": 145,
        "height": 90,
        "fillColor": LIGHT_TEAL
    })

    # Number
    cmd("placeText", {
        "page": 1,
        "x": metric["x"],
        "y": 350,
        "width": 145,
        "height": 35,
        "content": metric["number"],
        "style": "Metric Number"
    })

    # Label
    cmd("placeText", {
        "page": 1,
        "x": metric["x"],
        "y": 388,
        "width": 145,
        "height": 28,
        "content": metric["label"],
        "style": "Metric Label"
    })

# Infrastructure note
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 432,
    "width": 495,
    "height": 16,
    "content": "All programs powered by AWS infrastructure (S3, CloudFront, Lambda, DynamoDB)",
    "style": "Footer"
})

# THE ASK
print(">>> Adding The Ask...")
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 465,
    "width": 495,
    "height": 22,
    "content": "THE ASK",
    "style": "Section Header"
})

ask = "TEEI seeks an AWS promotional-credit partnership to scale our platform to 100,000 beneficiaries globally. Infrastructure cost is currently our only scaling constraint. With AWS support, we can remove this barrier and transform countless lives through education."

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 495,
    "width": 495,
    "height": 55,
    "content": ask,
    "style": "Body"
})

# WHAT WE OFFER
print(">>> Adding What We Offer...")
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 565,
    "width": 495,
    "height": 22,
    "content": "WHAT WE OFFER AWS",
    "style": "Section Header"
})

offer = "• Public visibility and co-branding with 'Powered by AWS' badge on platform\n• Detailed impact metrics for AWS Tech for Good case studies and reporting\n• Participation in AWS Imagine Grant Program and Public Sector events"

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 595,
    "width": 495,
    "height": 70,
    "content": offer,
    "style": "Body"
})

# CONTACT
print(">>> Adding contact information...")

# Contact box
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 690,
    "width": 240,
    "height": 65,
    "fillColor": LIGHT_GRAY
})

cmd("placeText", {
    "page": 1,
    "x": 60,
    "y": 700,
    "width": 220,
    "height": 50,
    "content": "CONTACT\n\nHenrik Røine, Managing Director\nhenrik@theeducationalequalityinstitute.org\ntheeducationalequalityinstitute.org",
    "style": "Contact"
})

# FOOTER
print(">>> Adding footer...")
cmd("createLine", {
    "page": 1,
    "x1": 50,
    "y1": 780,
    "x2": 545,
    "y2": 780,
    "strokeColor": TEEI_GOLD,
    "strokeWeight": 1.5
})

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 790,
    "width": 495,
    "height": 16,
    "content": "Powered by AWS Infrastructure",
    "style": "Footer"
})

print("\n" + "="*70)
print("SUCCESS! Professional partnership brief created!")
print("="*70)
print("\nDocument contains:")
print("  [OK] Professional header with TEEI logo placeholder")
print("  [OK] Mission statement")
print("  [OK] Impact metrics with visual boxes")
print("  [OK] The Ask - partnership request")
print("  [OK] What We Offer - value proposition")
print("  [OK] Contact information")
print("  [OK] Footer with AWS branding")
print("\nNext step:")
print("  In InDesign: File > Export > Adobe PDF (Print)")
print("  Preset: High Quality Print")
print("  Save as: TEEI_AWS_Partnership_Brief.pdf")
print("="*70 + "\n")
