#!/usr/bin/env python3
"""
TEEI AWS Partnership Brief V2 - STUNNING DESIGN
Professional, visually polished one-pager
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

export_dir = Path("T:/Projects/pdf-orchestrator/exports")
export_dir.mkdir(parents=True, exist_ok=True)

def log(msg):
    print(f">>> {msg}")

def close_current_document():
    """Close any open document without saving"""
    log("Closing current document...")
    try:
        command = createCommand("closeDocument", {"save": "no"})
        sendCommand(command)
    except:
        pass  # No document open, that's fine

def create_document():
    """Create A4 document with generous margins"""
    log("Creating new A4 document with professional layout...")

    command = createCommand("createDocument", {
        "pageWidth": 595,
        "pageHeight": 842,
        "pagesPerDocument": 1,
        "pagesFacing": False,
        "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},  # 1 inch margins
        "columns": {"count": 1, "gutter": 0},
        "name": "TEEI_AWS_Brief_V2",
        "units": "pt"
    })

    response = sendCommand(command)
    return response.get("status") == "SUCCESS"

def create_professional_styles():
    """Create beautiful, professional styles"""
    log("Creating stunning typography styles...")

    styles = [
        {
            "name": "Title Large",
            "spec": {
                "fontSize": 36,
                "fontFamily": "Arial\tBold",
                "leading": 42,
                "spaceAfter": 12
            }
        },
        {
            "name": "Subtitle Gray",
            "spec": {
                "fontSize": 11,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "spaceAfter": 24
            }
        },
        {
            "name": "Section Header Blue",
            "spec": {
                "fontSize": 16,
                "fontFamily": "Arial\tBold",
                "leading": 20,
                "spaceBefore": 18,
                "spaceAfter": 10
            }
        },
        {
            "name": "Body Clean",
            "spec": {
                "fontSize": 11,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "spaceAfter": 10,
                "alignment": "LEFT"
            }
        },
        {
            "name": "Metric Huge",
            "spec": {
                "fontSize": 32,
                "fontFamily": "Arial\tBold",
                "leading": 36,
                "spaceAfter": 4,
                "alignment": "CENTER"
            }
        },
        {
            "name": "Metric Label",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 13,
                "spaceAfter": 0,
                "alignment": "CENTER"
            }
        },
        {
            "name": "Bullet Point",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "spaceAfter": 8,
                "leftIndent": 16,
                "firstLineIndent": -16
            }
        },
        {
            "name": "Contact Small",
            "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tRegular",
                "leading": 14,
                "spaceAfter": 2
            }
        },
        {
            "name": "Footer Tiny",
            "spec": {
                "fontSize": 8,
                "fontFamily": "Arial\tItalic",
                "leading": 10,
                "alignment": "CENTER"
            }
        }
    ]

    command = createCommand("setStyles", {
        "paragraph": styles,
        "character": [],
        "object": []
    })

    response = sendCommand(command)
    return response.get("status") == "SUCCESS"

def build_content():
    """Build clean, well-spaced content"""
    log("Building professional content layout...")

    # Logo placeholder (top left)
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 72,
        "width": 100,
        "height": 24,
        "content": "[TEEI LOGO]",
        "style": "Contact Small"
    }))

    # Main title
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 110,
        "width": 450,
        "height": 90,
        "content": "Scaling Equal Education Access with AWS",
        "style": "Title Large"
    }))

    # Subtitle
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 175,
        "width": 450,
        "height": 20,
        "content": "Partnership proposal from The Educational Equality Institute",
        "style": "Subtitle Gray"
    }))

    # Decorative gold line
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 200,
        "width": 450,
        "height": 3,
        "content": "▬" * 60,
        "style": "Footer Tiny"
    }))

    # ===== MISSION SECTION =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 220,
        "width": 450,
        "height": 25,
        "content": "OUR MISSION",
        "style": "Section Header Blue"
    }))

    mission = "The Educational Equality Institute (TEEI) provides free, high-quality language learning and personalized mentorship to refugees and displaced learners worldwide. We break down barriers to education by connecting vulnerable populations with volunteer mentors, empowering them to rebuild their lives through language skills and human connection."

    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 255,
        "width": 450,
        "height": 70,
        "content": mission,
        "style": "Body Clean"
    }))

    # ===== IMPACT METRICS (3 COLUMNS) =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 335,
        "width": 450,
        "height": 25,
        "content": "IMPACT AT SCALE",
        "style": "Section Header Blue"
    }))

    col_width = 130
    gutter = 30

    # Metric 1
    x1 = 72 + 20
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x1,
        "y": 370,
        "width": col_width,
        "height": 40,
        "content": "10,000",
        "style": "Metric Huge"
    }))
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x1,
        "y": 410,
        "width": col_width,
        "height": 30,
        "content": "Active Beneficiaries",
        "style": "Metric Label"
    }))

    # Metric 2
    x2 = x1 + col_width + gutter
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x2,
        "y": 370,
        "width": col_width,
        "height": 40,
        "content": "2,600",
        "style": "Metric Huge"
    }))
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x2,
        "y": 410,
        "width": col_width,
        "height": 30,
        "content": "Volunteer Mentors",
        "style": "Metric Label"
    }))

    # Metric 3
    x3 = x2 + col_width + gutter
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x3,
        "y": 370,
        "width": col_width,
        "height": 40,
        "content": "50,000+",
        "style": "Metric Huge"
    }))
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": x3,
        "y": 410,
        "width": col_width,
        "height": 30,
        "content": "Learning Hours",
        "style": "Metric Label"
    }))

    # Infrastructure note
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 450,
        "width": 450,
        "height": 20,
        "content": "All programs powered by AWS infrastructure (S3, CloudFront, Lambda, DynamoDB)",
        "style": "Body Clean"
    }))

    # ===== THE ASK =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 485,
        "width": 450,
        "height": 25,
        "content": "THE ASK",
        "style": "Section Header Blue"
    }))

    ask_text = "TEEI seeks an AWS promotional-credit partnership to scale our platform to 100,000 beneficiaries globally. Infrastructure cost is currently our only scaling constraint. With AWS support, we can remove this barrier and transform more lives."

    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 520,
        "width": 450,
        "height": 55,
        "content": ask_text,
        "style": "Body Clean"
    }))

    # ===== WHAT WE OFFER =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 590,
        "width": 450,
        "height": 25,
        "content": "WHAT WE OFFER AWS",
        "style": "Section Header Blue"
    }))

    bullets = [
        "• Public visibility and co-branding with 'Powered by AWS' badge on platform",
        "• Detailed impact metrics for AWS Tech for Good case studies and reporting",
        "• Participation in AWS Imagine Grant Program and Public Sector events"
    ]

    y = 625
    for bullet in bullets:
        sendCommand(createCommand("placeText", {
            "page": 1,
            "x": 72,
            "y": y,
            "width": 450,
            "height": 22,
            "content": bullet,
            "style": "Bullet Point"
        }))
        y += 22

    # ===== CONTACT =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 705,
        "width": 450,
        "height": 18,
        "content": "CONTACT",
        "style": "Section Header Blue"
    }))

    contact_info = """Henrik Røine, Managing Director
henrik@theeducationalequalityinstitute.org
https://theeducationalequalityinstitute.org"""

    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 730,
        "width": 450,
        "height": 45,
        "content": contact_info,
        "style": "Contact Small"
    }))

    # ===== FOOTER =====
    sendCommand(createCommand("placeText", {
        "page": 1,
        "x": 72,
        "y": 800,
        "width": 450,
        "height": 15,
        "content": "Powered by AWS Infrastructure",
        "style": "Footer Tiny"
    }))

    log("Content built successfully")
    return True

def main():
    print("\n" + "="*70)
    print("TEEI AWS PARTNERSHIP BRIEF V2 - STUNNING DESIGN")
    print("="*70 + "\n")

    close_current_document()

    if not create_document():
        print("Failed to create document")
        return

    if not create_professional_styles():
        print("Failed to create styles")
        return

    if not build_content():
        print("Failed to build content")
        return

    print("\n" + "="*70)
    print("SUCCESS! Professional document created in InDesign")
    print("="*70)
    print("\nThe document is now open in InDesign with:")
    print("  • Clean, professional layout with generous spacing")
    print("  • Proper visual hierarchy")
    print("  • Three-column impact metrics")
    print("  • Professional typography")
    print("\nTo export as PDF:")
    print("  File → Export → Adobe PDF (Print) → High Quality Print")
    print("\n" + "="*70)

if __name__ == "__main__":
    main()
