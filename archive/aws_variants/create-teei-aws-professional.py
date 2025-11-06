#!/usr/bin/env python3
"""
TEEI AWS Partnership Brief - Professional One-Pager
Clean, polished NGO-style proposal using InDesign automation
"""

import sys
import os
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# TEEI Brand Colors
TEEI_BLUE = {"red": 0, "green": 51, "blue": 102}       # #003366
TEEI_GOLD = {"red": 212, "green": 175, "blue": 55}     # #D4AF37
LIGHT_GRAY = {"red": 247, "green": 247, "blue": 247}   # #F7F7F7
WHITE = {"red": 255, "green": 255, "blue": 255}
LIGHT_BLUE = {"red": 230, "green": 240, "blue": 250}
BLACK = {"red": 0, "green": 0, "blue": 0}
TEXT_GRAY = {"red": 50, "green": 50, "blue": 50}

def log(msg):
    print(f">>> {msg}")

def cmd(action, options):
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    [WARNING] {action}: {response.get('message')}")
    return response

def create_document():
    """Create fresh A4 document"""
    log("Creating A4 document...")

    try:
        cmd("closeDocument", {"save": "no"})
    except:
        pass

    cmd("createDocument", {
        "pageWidth": 595,      # A4 width in points
        "pageHeight": 842,     # A4 height in points
        "pagesPerDocument": 1,
        "pagesFacing": False,
        "margins": {"top": 36, "bottom": 36, "left": 36, "right": 36},
        "name": "TEEI_AWS_Partnership_Brief",
        "units": "pt"
    })

def create_styles():
    """Professional typography styles"""
    log("Creating professional typography...")

    cmd("setStyles", {
        "paragraph": [
            {"name": "Title", "spec": {
                "fontSize": 32,
                "fontFamily": "Arial\tBold",
                "leading": 38,
                "spaceAfter": 4
            }},
            {"name": "Subtitle", "spec": {
                "fontSize": 13,
                "fontFamily": "Arial\tRegular",
                "leading": 18,
                "spaceAfter": 0
            }},
            {"name": "Section Header", "spec": {
                "fontSize": 16,
                "fontFamily": "Arial\tBold",
                "leading": 20,
                "spaceBefore": 16,
                "spaceAfter": 8
            }},
            {"name": "Body", "spec": {
                "fontSize": 10.5,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "spaceAfter": 10
            }},
            {"name": "Metric Number", "spec": {
                "fontSize": 28,
                "fontFamily": "Arial\tBold",
                "leading": 32,
                "spaceAfter": 2,
                "alignment": "CENTER"
            }},
            {"name": "Metric Label", "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tRegular",
                "leading": 13,
                "alignment": "CENTER"
            }},
            {"name": "Bullet", "spec": {
                "fontSize": 10.5,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "leftIndent": 15,
                "firstLineIndent": -15,
                "spaceAfter": 6
            }},
            {"name": "Contact", "spec": {
                "fontSize": 9.5,
                "fontFamily": "Arial\tRegular",
                "leading": 14
            }},
            {"name": "Footer", "spec": {
                "fontSize": 8.5,
                "fontFamily": "Arial\tItalic",
                "leading": 12,
                "alignment": "CENTER"
            }}
        ],
        "character": [],
        "object": []
    })

def create_header():
    """Clean professional header"""
    log("Creating header section...")

    # Logo placeholder box
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 50,
        "y": 50,
        "width": 100,
        "height": 30,
        "fillColor": LIGHT_BLUE,
        "cornerRadius": 4,
        "opacity": 50
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 50,
        "width": 100,
        "height": 30,
        "content": "TEEI",
        "fontSize": 16,
        "textColor": TEEI_BLUE,
        "alignment": "center",
        "verticalAlignment": "center"
    })

    # Main title
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 95,
        "width": 495,
        "height": 50,
        "content": "Scaling Equal Education\nAccess with AWS",
        "style": "Title",
        "textColor": TEEI_BLUE
    })

    # Subtitle
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 145,
        "width": 495,
        "height": 20,
        "content": "A partnership proposal from The Educational Equality Institute",
        "style": "Subtitle",
        "textColor": TEXT_GRAY
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

def create_mission():
    """Mission section"""
    log("Adding mission section...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 190,
        "width": 495,
        "height": 22,
        "content": "OUR MISSION",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    mission = "The Educational Equality Institute (TEEI) provides free, high-quality language learning and personalized mentorship to refugees and displaced learners worldwide. We break down barriers to education by connecting vulnerable populations with volunteer mentors, empowering them to rebuild their lives through language skills and human connection."

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 220,
        "width": 495,
        "height": 65,
        "content": mission,
        "style": "Body",
        "textColor": TEXT_GRAY
    })

def create_metrics():
    """Impact metrics boxes"""
    log("Creating impact metrics...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 300,
        "width": 495,
        "height": 22,
        "content": "IMPACT AT SCALE",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    metrics = [
        {"number": "10,000", "label": "Active\nBeneficiaries"},
        {"number": "2,600", "label": "Volunteer\nMentors"},
        {"number": "50,000+", "label": "Learning\nHours"}
    ]

    box_width = 145
    box_height = 90
    start_x = 50
    start_y = 330
    gap = 30

    for i, metric in enumerate(metrics):
        x = start_x + i * (box_width + gap)

        # Box background
        cmd("createRectangleAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y,
            "width": box_width,
            "height": box_height,
            "fillColor": LIGHT_BLUE,
            "cornerRadius": 8,
            "dropShadow": {
                "opacity": 15,
                "distance": 3,
                "angle": 135,
                "blur": 6
            }
        })

        # Number
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y + 20,
            "width": box_width,
            "height": 35,
            "content": metric["number"],
            "style": "Metric Number",
            "textColor": TEEI_GOLD
        })

        # Label
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": x,
            "y": start_y + 58,
            "width": box_width,
            "height": 28,
            "content": metric["label"],
            "style": "Metric Label",
            "textColor": TEEI_BLUE
        })

    # Infrastructure note
    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 432,
        "width": 495,
        "height": 16,
        "content": "All programs powered by AWS infrastructure (S3, CloudFront, Lambda, DynamoDB)",
        "fontSize": 9,
        "textColor": TEXT_GRAY,
        "alignment": "center"
    })

def create_ask():
    """The Ask section"""
    log("Adding The Ask section...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 465,
        "width": 495,
        "height": 22,
        "content": "THE ASK",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    ask = "TEEI seeks an AWS promotional-credit partnership to scale our platform to 100,000 beneficiaries globally. Infrastructure cost is currently our only scaling constraint. With AWS support, we can remove this barrier and transform countless lives through education."

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 495,
        "width": 495,
        "height": 55,
        "content": ask,
        "style": "Body",
        "textColor": TEXT_GRAY
    })

def create_offer():
    """What We Offer section"""
    log("Adding What We Offer section...")

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 565,
        "width": 495,
        "height": 22,
        "content": "WHAT WE OFFER AWS",
        "style": "Section Header",
        "textColor": TEEI_BLUE
    })

    bullets = [
        "• Public visibility and co-branding with 'Powered by AWS' badge on platform",
        "• Detailed impact metrics for AWS Tech for Good case studies and reporting",
        "• Participation in AWS Imagine Grant Program and Public Sector events"
    ]

    y = 595
    for bullet in bullets:
        cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": 50,
            "y": y,
            "width": 495,
            "height": 20,
            "content": bullet,
            "style": "Bullet",
            "textColor": TEXT_GRAY
        })
        y += 22

def create_contact():
    """Contact information"""
    log("Adding contact section...")

    # Background box
    cmd("createRectangleAdvanced", {
        "page": 1,
        "x": 50,
        "y": 690,
        "width": 240,
        "height": 65,
        "fillColor": LIGHT_GRAY,
        "cornerRadius": 6
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 60,
        "y": 700,
        "width": 220,
        "height": 16,
        "content": "CONTACT",
        "fontSize": 11,
        "textColor": TEEI_BLUE
    })

    contact = "Henrik Røine, Managing Director\nhenrik@theeducationalequalityinstitute.org\ntheeducationalequalityinstitute.org"

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 60,
        "y": 720,
        "width": 220,
        "height": 40,
        "content": contact,
        "style": "Contact",
        "textColor": TEXT_GRAY
    })

def create_footer():
    """Footer with branding"""
    log("Adding footer...")

    # Gold line
    cmd("createLine", {
        "page": 1,
        "x1": 50,
        "y1": 780,
        "x2": 545,
        "y2": 780,
        "strokeColor": TEEI_GOLD,
        "strokeWeight": 1.5
    })

    cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 50,
        "y": 790,
        "width": 495,
        "height": 16,
        "content": "Powered by AWS Infrastructure",
        "style": "Footer",
        "textColor": TEXT_GRAY
    })

def main():
    print("\n" + "="*70)
    print("TEEI AWS PARTNERSHIP BRIEF - PROFESSIONAL ONE-PAGER")
    print("="*70 + "\n")

    create_document()
    create_styles()
    create_header()
    create_mission()
    create_metrics()
    create_ask()
    create_offer()
    create_contact()
    create_footer()

    print("\n" + "="*70)
    print("SUCCESS! Professional partnership brief created!")
    print("="*70)
    print("\nDocument created in InDesign:")
    print("  [OK] Professional header with TEEI branding")
    print("  [OK] Mission statement section")
    print("  [OK] Impact metrics with visual boxes")
    print("  [OK] The Ask - partnership request")
    print("  [OK] What We Offer - value proposition")
    print("  [OK] Contact information")
    print("  [OK] Footer with AWS branding")
    print("\nNext steps:")
    print("  1. Review the document in InDesign")
    print("  2. Export: File > Export > Adobe PDF (Print)")
    print("  3. Choose 'High Quality Print' preset")
    print("  4. Save as: TEEI_AWS_Partnership_Brief.pdf")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
