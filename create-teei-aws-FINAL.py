#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI AWS Partnership Brief - Professional Design from Scratch
Using TEEI Official Design System
"""

import sys
import os
import io

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
init(APPLICATION, socket_client)

# TEEI Official Brand Colors (from Design System)
TEEI_DEEP_TEAL = {"red": 0, "green": 57, "blue": 63}        # #00393f - Primary
TEEI_GOLD = {"red": 186, "green": 143, "blue": 90}          # #BA8F5A - Accent
BG_LIGHT = {"red": 248, "green": 250, "blue": 252}          # #f8fafc - Light sections
TEXT_PRIMARY = {"red": 0, "green": 57, "blue": 63}          # #00393f - Headlines
TEXT_BODY = {"red": 71, "green": 85, "blue": 105}           # #475569 - Body text
TEXT_LIGHT = {"red": 100, "green": 116, "blue": 139}        # #64748b - Secondary
WHITE = {"red": 255, "green": 255, "blue": 255}             # #ffffff - Pure white

def cmd(action, options):
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    ⚠️  {action}: {response.get('message')}")
        raise Exception(f"Command failed: {action}")
    return response

print("\n" + "="*80)
print("CREATING PROFESSIONAL TEEI AWS PARTNERSHIP BRIEF FROM SCRATCH")
print("="*80 + "\n")

# Close any existing document
try:
    cmd("closeDocument", {"save": "no"})
    print("✓ Closed existing document")
except:
    pass

# ============================================================================
# 1. CREATE A4 DOCUMENT
# ============================================================================
print("\n📄 Creating A4 document...")
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 1,
    "pagesFacing": False,
    "margins": {"top": 50, "bottom": 50, "left": 50, "right": 50},
    "name": "TEEI_AWS_Partnership_Brief_FINAL",
    "units": "pt"
})
print("   ✓ A4 document created (595 x 842 pt)")

# ============================================================================
# 2. DEFINE TYPOGRAPHY STYLES
# ============================================================================
print("\n🎨 Creating typography styles...")
cmd("setStyles", {
    "paragraph": [
        # Hero Title
        {
            "name": "Hero Title",
            "spec": {
                "fontSize": 42,
                "fontFamily": "Arial\tBold",
                "leading": 48,
                "spaceAfter": 12
            }
        },
        # Section Header
        {
            "name": "Section Header",
            "spec": {
                "fontSize": 18,
                "fontFamily": "Arial\tBold",
                "leading": 24,
                "spaceBefore": 20,
                "spaceAfter": 12
            }
        },
        # Body Regular
        {
            "name": "Body",
            "spec": {
                "fontSize": 11,
                "fontFamily": "Arial\tRegular",
                "leading": 18,
                "spaceAfter": 12
            }
        },
        # Body Large
        {
            "name": "Body Large",
            "spec": {
                "fontSize": 13,
                "fontFamily": "Arial\tRegular",
                "leading": 20,
                "spaceAfter": 14
            }
        },
        # Metric Number (large stats)
        {
            "name": "Metric Number",
            "spec": {
                "fontSize": 36,
                "fontFamily": "Arial\tBold",
                "leading": 40,
                "spaceAfter": 4,
                "alignment": "CENTER"
            }
        },
        # Metric Label
        {
            "name": "Metric Label",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 14,
                "alignment": "CENTER"
            }
        },
        # List Item
        {
            "name": "List Item",
            "spec": {
                "fontSize": 11,
                "fontFamily": "Arial\tRegular",
                "leading": 18,
                "spaceAfter": 8,
                "leftIndent": 20
            }
        },
        # Contact
        {
            "name": "Contact",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 16
            }
        },
        # Footer
        {
            "name": "Footer",
            "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tItalic",
                "leading": 12,
                "alignment": "CENTER"
            }
        }
    ],
    "character": [],
    "object": []
})
print("   ✓ 9 paragraph styles created")

# ============================================================================
# 3. HEADER SECTION
# ============================================================================
print("\n📌 Creating header section...")

# TEEI Logo area (deep teal background)
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 50,
    "width": 150,
    "height": 60,
    "fillColor": TEEI_DEEP_TEAL
})

cmd("placeText", {
    "page": 1,
    "x": 60,
    "y": 65,
    "width": 130,
    "height": 30,
    "content": "TEEI",
    "style": "Section Header"
})

# Main title
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 130,
    "width": 495,
    "height": 100,
    "content": "Scaling Equal Education Access with AWS",
    "style": "Hero Title"
})

# Subtitle
cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 185,
    "width": 495,
    "height": 30,
    "content": "Partnership Proposal from The Educational Equality Institute",
    "style": "Body Large"
})

# Gold accent line below header
cmd("createLine", {
    "page": 1,
    "x1": 50,
    "y1": 220,
    "x2": 545,
    "y2": 220,
    "strokeColor": TEEI_GOLD,
    "strokeWeight": 3
})
print("   ✓ Header section complete")

# ============================================================================
# 4. MISSION SECTION
# ============================================================================
print("\n🎯 Creating mission section...")

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 240,
    "width": 495,
    "height": 20,
    "content": "Our Mission",
    "style": "Section Header"
})

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 270,
    "width": 495,
    "height": 80,
    "content": "The Educational Equality Institute (TEEI) is a global nonprofit dedicated to democratizing access to quality education. Through technology-enabled mentorship, peer learning platforms, and data-driven interventions, we connect underserved students with the resources and support they need to succeed academically and professionally.",
    "style": "Body"
})
print("   ✓ Mission section complete")

# ============================================================================
# 5. IMPACT METRICS - THREE COLUMNS
# ============================================================================
print("\n📊 Creating impact metrics...")

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 360,
    "width": 495,
    "height": 20,
    "content": "Our Impact at a Glance",
    "style": "Section Header"
})

# Metric boxes - three columns with light teal background
metrics = [
    {"number": "10,000+", "label": "Active Beneficiaries\nWorldwide", "x": 50},
    {"number": "2,600+", "label": "Volunteer Mentors\n& Educators", "x": 215},
    {"number": "50,000+", "label": "Learning Hours\nDelivered", "x": 380}
]

for metric in metrics:
    # Light background box
    cmd("createRectangle", {
        "page": 1,
        "x": metric["x"],
        "y": 390,
        "width": 155,
        "height": 100,
        "fillColor": BG_LIGHT
    })

    # Large number
    cmd("placeText", {
        "page": 1,
        "x": metric["x"] + 10,
        "y": 405,
        "width": 135,
        "height": 45,
        "content": metric["number"],
        "style": "Metric Number"
    })

    # Label
    cmd("placeText", {
        "page": 1,
        "x": metric["x"] + 10,
        "y": 455,
        "width": 135,
        "height": 30,
        "content": metric["label"],
        "style": "Metric Label"
    })

print("   ✓ Impact metrics complete")

# ============================================================================
# 6. THE ASK SECTION
# ============================================================================
print("\n🤝 Creating 'The Ask' section...")

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 510,
    "width": 495,
    "height": 20,
    "content": "The Partnership Opportunity",
    "style": "Section Header"
})

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 540,
    "width": 495,
    "height": 60,
    "content": "We seek AWS's support to scale our cloud infrastructure, enabling us to serve 50,000+ students globally by 2026. Your infrastructure credits, technical expertise, and advocacy would accelerate our mission to close the global education gap.",
    "style": "Body"
})
print("   ✓ The Ask section complete")

# ============================================================================
# 7. WHAT WE OFFER SECTION
# ============================================================================
print("\n💎 Creating 'What We Offer' section...")

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 610,
    "width": 495,
    "height": 20,
    "content": "What We Bring to the Partnership",
    "style": "Section Header"
})

offers = [
    "Impact stories showcasing AWS-powered education transformation",
    "Co-branded case studies and social impact reports",
    "Joint speaking opportunities at education and tech conferences"
]

y_pos = 640
for offer in offers:
    # Bullet point (gold accent line)
    cmd("createLine", {
        "page": 1,
        "x1": 50,
        "y1": y_pos + 6,
        "x2": 65,
        "y2": y_pos + 6,
        "strokeColor": TEEI_GOLD,
        "strokeWeight": 2
    })

    cmd("placeText", {
        "page": 1,
        "x": 70,
        "y": y_pos,
        "width": 475,
        "height": 25,
        "content": offer,
        "style": "Body"
    })

    y_pos += 30

print("   ✓ What We Offer section complete")

# ============================================================================
# 8. CONTACT SECTION
# ============================================================================
print("\n📧 Creating contact section...")

# Contact box with light background
cmd("createRectangle", {
    "page": 1,
    "x": 50,
    "y": 730,
    "width": 250,
    "height": 60,
    "fillColor": BG_LIGHT
})

cmd("placeText", {
    "page": 1,
    "x": 60,
    "y": 738,
    "width": 230,
    "height": 45,
    "content": "CONTACT\n\nHenrik Røine, Managing Director\nhenrik@theeducationalequalityinstitute.org\ntheeducationalequalityinstitute.org",
    "style": "Contact"
})

print("   ✓ Contact section complete")

# ============================================================================
# 9. FOOTER
# ============================================================================
print("\n🔻 Creating footer...")

# Footer line (gold)
cmd("createLine", {
    "page": 1,
    "x1": 50,
    "y1": 800,
    "x2": 545,
    "y2": 800,
    "strokeColor": TEEI_GOLD,
    "strokeWeight": 2
})

cmd("placeText", {
    "page": 1,
    "x": 50,
    "y": 810,
    "width": 495,
    "height": 20,
    "content": "Powered by AWS Infrastructure  •  Building the Future of Education Together",
    "style": "Footer"
})

print("   ✓ Footer complete")

# ============================================================================
# COMPLETION
# ============================================================================
print("\n" + "="*80)
print("✅ SUCCESS! Professional TEEI AWS Partnership Brief Created!")
print("="*80)
print("\n📋 Document Summary:")
print("   • Format: A4 (595 x 842 pt)")
print("   • Design System: TEEI Official Colors")
print("   • Typography: 9 professional styles")
print("   • Sections: 8 complete sections")
print("\n🎨 Brand Colors Used:")
print("   • Deep Teal (#00393f) - Primary brand color")
print("   • Gold (#BA8F5A) - Accent lines & bullets")
print("   • Light Teal (#f8fafc) - Section backgrounds")
print("\n📤 Next Step:")
print("   In InDesign: File → Export → Adobe PDF (Print)")
print("   Preset: High Quality Print")
print("   Save as: TEEI_AWS_Partnership_Brief.pdf")
print("\n" + "="*80 + "\n")
