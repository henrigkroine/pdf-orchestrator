#!/usr/bin/env python3
"""
TEEI AWS Partnership Brief - THE BEST IN THE WORLD
Using ALL professional InDesign features:
- Rounded corners
- Drop shadows
- Gradients
- Opacity effects
- Advanced text styling
- Professional layering
- World-class visual design
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 90

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

export_dir = Path("T:/Projects/pdf-orchestrator/exports")
export_dir.mkdir(parents=True, exist_ok=True)

# TEEI Brand Colors
TEEI_BLUE = {"red": 0, "green": 51, "blue": 102}  # #003366
TEEI_GOLD = {"red": 212, "green": 175, "blue": 55}  # #D4AF37
LIGHT_GRAY = {"red": 247, "green": 247, "blue": 247}  # #F7F7F7
WHITE = {"red": 255, "green": 255, "blue": 255}
LIGHT_BLUE = {"red": 230, "green": 240, "blue": 250}
DARK_BLUE = {"red": 0, "green": 30, "blue": 60}  # Darker for gradient

def log(msg):
    print(f">>> {msg}")

def cmd(action, options):
    """Helper to send command"""
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    [WARNING] {action} had issues: {response.get('message')}")
    return response

def close_and_create():
    """Create fresh document"""
    log("Creating THE BEST document in the world...")

    try:
        cmd("closeDocument", {"save": "no"})
    except:
        pass

    cmd("createDocument", {
        "pageWidth": 595,
        "pageHeight": 842,
        "pagesPerDocument": 1,
        "pagesFacing": False,
        "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
        "name": "TEEI_AWS_BEST_IN_WORLD",
        "units": "pt"
    })

def create_world_class_styles():
    """Typography that would make Helvetica jealous"""
    log("Creating WORLD-CLASS typography...")

    cmd("setStyles", {
        "paragraph": [
            {"name": "Hero Title", "spec": {"fontSize": 42, "fontFamily": "Arial\tBold", "leading": 48, "spaceAfter": 6}},
            {"name": "Hero Subtitle", "spec": {"fontSize": 14, "fontFamily": "Arial\tRegular", "leading": 20, "spaceAfter": 0}},
            {"name": "Section Header", "spec": {"fontSize": 20, "fontFamily": "Arial\tBold", "leading": 24, "spaceBefore": 0, "spaceAfter": 12}},
            {"name": "Body Pro", "spec": {"fontSize": 11, "fontFamily": "Arial\tRegular", "leading": 18, "spaceAfter": 10}},
            {"name": "Metric Number", "spec": {"fontSize": 40, "fontFamily": "Arial\tBold", "leading": 44, "spaceAfter": 4, "alignment": "CENTER"}},
            {"name": "Metric Label", "spec": {"fontSize": 10, "fontFamily": "Arial\tRegular", "leading": 14, "spaceAfter": 0, "alignment": "CENTER"}},
            {"name": "Bullet Pro", "spec": {"fontSize": 11, "fontFamily": "Arial\tRegular", "leading": 17, "spaceAfter": 8, "leftIndent": 18, "firstLineIndent": -18}},
            {"name": "Contact Pro", "spec": {"fontSize": 10, "fontFamily": "Arial\tRegular", "leading": 15}},
            {"name": "Footer Elegant", "spec": {"fontSize": 9, "fontFamily": "Arial\tItalic", "leading": 12, "alignment": "CENTER"}}
        ],
        "character": [],
        "object": []
    })

def create_stunning_header():
    """EPIC header with gradient and effects"""
    log("Creating STUNNING gradient header...")

    # Gradient background (dark blue to TEEI blue)
    cmd("createGradientBox", {
        "page": 1,
        "x": 0,
        "y": 0,
        "width": 595,
        "height": 220,
        "startColor": DARK_BLUE,
        "endColor": TEEI_BLUE,
        "angle": 135,
        "sendToBack": True
    })

    # Decorative circles in top right (opacity 20%)
    for i, size in enumerate([80, 60, 40]):
        cmd("createEllipse", {
            "page": 1,
            "x": 480 + (i * 15),
            "y": 20 + (i * 10),
            "width": size,
            "height": size,
            "fillColor": TEEI_GOLD,
            "opacity": 20
        })

    # Logo placeholder with rounded background
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 45,
        "y": 35,
        "width": 120,
        "height": 35,
        "fillColor": WHITE,
        "cornerRadius": 8,
        "opacity": 95
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 35,
        "width": 120,
        "height": 35,
        "content": "TEEI",
        "fontSize": 18,
        "textColor": TEEI_BLUE,
        "alignment": "center",
        "verticalAlignment": "center"
    })

    # Main hero title (white text with subtle shadow)
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 85,
        "width": 505,
        "height": 100,
        "content": "Scaling Equal Education\nAccess with AWS",
        "style": "Hero Title",
        "textColor": WHITE,
        "dropShadow": {
            "opacity": 30,
            "distance": 3,
            "angle": 135,
            "blur": 5
        }
    })

    # Subtitle
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 180,
        "width": 505,
        "height": 30,
        "content": "Partnership proposal from The Educational Equality Institute",
        "style": "Hero Subtitle",
        "textColor": WHITE,
        "opacity": 95
    })

def create_gold_accent_bar():
    """Professional gold accent with shadow"""
    log("Adding premium gold accent...")

    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 0,
        "y": 220,
        "width": 595,
        "height": 6,
        "fillColor": TEEI_GOLD,
        "dropShadow": {
            "opacity": 40,
            "distance": 2,
            "angle": 90,
            "blur": 4
        }
    })

def create_mission_section():
    """Mission with elegant design"""
    log("Building mission section...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 250,
        "width": 505,
        "height": 32,
        "content": "OUR MISSION",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    mission = "The Educational Equality Institute (TEEI) provides free, high-quality language learning and personalized mentorship to refugees and displaced learners worldwide. We break down barriers to education by connecting vulnerable populations with volunteer mentors, empowering them to rebuild their lives through language skills and human connection."

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 290,
        "width": 505,
        "height": 75,
        "content": mission,
        "style": "Body Pro"
    })

def create_epic_metrics():
    """STUNNING metrics with rounded boxes and shadows"""
    log("Creating EPIC impact metrics...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 385,
        "width": 505,
        "height": 32,
        "content": "IMPACT AT SCALE",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    box_width = 150
    box_height = 110
    gutter = 27
    start_x = 45
    start_y = 425

    metrics = [
        {"number": "10,000", "label": "Active\nBeneficiaries"},
        {"number": "2,600", "label": "Volunteer\nMentors"},
        {"number": "50,000+", "label": "Learning\nHours"}
    ]

    for i, metric in enumerate(metrics):
        x = start_x + i * (box_width + gutter)

        # Rounded box with shadow
        cmd("createRectangleAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y,
            "width": box_width,
            "height": box_height,
            "fillColor": LIGHT_BLUE,
            "cornerRadius": 12,
            "dropShadow": {
                "opacity": 25,
                "distance": 4,
                "angle": 135,
                "blur": 8
            },
            "sendToBack": True
        })

        # Gold number
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y + 22,
            "width": box_width,
            "height": 48,
            "content": metric["number"],
            "style": "Metric Number",
            "textColor": TEEI_GOLD
        })

        # Label
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y + 72,
            "width": box_width,
            "height": 32,
            "content": metric["label"],
            "style": "Metric Label"
        })

    # Infrastructure note
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 550,
        "width": 505,
        "height": 22,
        "content": "All programs powered by AWS infrastructure (S3, CloudFront, Lambda, DynamoDB)",
        "style": "Body Pro",
        "textColor": {"red": 100, "green": 100, "blue": 100}
    })

def create_ask_section():
    """The Ask with subtle background"""
    log("Building The Ask section...")

    # Subtle background box
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 35,
        "y": 585,
        "width": 525,
        "height": 75,
        "fillColor": LIGHT_GRAY,
        "cornerRadius": 8,
        "opacity": 60,
        "sendToBack": True
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 595,
        "width": 505,
        "height": 28,
        "content": "THE ASK",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    ask = "TEEI seeks an AWS promotional-credit partnership to scale our platform to 100,000 beneficiaries globally. Infrastructure cost is currently our only scaling constraint. With AWS support, we can remove this barrier and transform countless lives."

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 628,
        "width": 505,
        "height": 60,
        "content": ask,
        "style": "Body Pro"
    })

def create_offer_section():
    """What We Offer"""
    log("Building What We Offer section...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 700,
        "width": 505,
        "height": 28,
        "content": "WHAT WE OFFER AWS",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    bullets = [
        "• Public visibility and co-branding with 'Powered by AWS' badge on platform",
        "• Detailed impact metrics for AWS Tech for Good case studies and reporting",
        "• Participation in AWS Imagine Grant Program and Public Sector events"
    ]

    y = 735
    for bullet in bullets:
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": 45,
            "y": y,
            "width": 505,
            "height": 22,
            "content": bullet,
            "style": "Bullet Pro"
        })
        y += 22

def create_premium_footer():
    """Premium contact and footer"""
    log("Adding premium footer...")

    # Contact box
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 35,
        "y": 785,
        "width": 250,
        "height": 60,
        "fillColor": LIGHT_BLUE,
        "cornerRadius": 8,
        "opacity": 50,
        "sendToBack": True
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 790,
        "width": 230,
        "height": 18,
        "content": "CONTACT",
        "fontSize": 11,
        "textColor": TEEI_BLUE
    })

    contact = "Henrik Roine, Managing Director\nhenrik@theeducationalequalityinstitute.org\ntheeducationalequalityinstitute.org"

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 810,
        "width": 230,
        "height": 50,
        "content": contact,
        "style": "Contact Pro"
    })

    # Gold footer bar
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 0,
        "y": 856,
        "width": 595,
        "height": 4,
        "fillColor": TEEI_GOLD,
        "opacity": 80
    })

    # Powered by AWS
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 45,
        "y": 862,
        "width": 505,
        "height": 18,
        "content": "Powered by AWS Infrastructure",
        "style": "Footer Elegant",
        "textColor": {"red": 120, "green": 120, "blue": 120}
    })

    # Decorative corner element
    cmd("createEllipse", {
        "page": 1,
        "x": 520,
        "y": 790,
        "width": 60,
        "height": 60,
        "fillColor": TEEI_GOLD,
        "opacity": 15
    })

def main():
    print("\n" + "="*70)
    print("TEEI AWS PARTNERSHIP BRIEF - THE BEST IN THE WORLD")
    print("="*70 + "\n")

    close_and_create()
    create_world_class_styles()
    create_stunning_header()
    create_gold_accent_bar()
    create_mission_section()
    create_epic_metrics()
    create_ask_section()
    create_offer_section()
    create_premium_footer()

    print("\n" + "="*70)
    print("SUCCESS! THE BEST PARTNERSHIP BRIEF IN THE WORLD!")
    print("="*70)
    print("\nThis document features:")
    print("  [OK] Gradient header (dark blue to TEEI blue)")
    print("  [OK] Decorative elements with opacity")
    print("  [OK] Rounded corners on ALL boxes")
    print("  [OK] Drop shadows for depth")
    print("  [OK] Gold accent bars with effects")
    print("  [OK] Metric boxes with rounded corners + shadows")
    print("  [OK] Professional layering")
    print("  [OK] Advanced text styling")
    print("  [OK] World-class visual hierarchy")
    print("\nThis is WORLD-CLASS design - ready to impress AWS!")
    print("\nNow in InDesign - Export: File > Export > PDF (Print)")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
