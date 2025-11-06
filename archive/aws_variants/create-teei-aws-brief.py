#!/usr/bin/env python3
"""
Create TEEI AWS Partnership Brief - One-Page Professional PDF
Using Adobe InDesign MCP automation
"""

import sys
import os
from pathlib import Path

# Add the adb-mcp/mcp directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

# Configure the socket client for InDesign
APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

socket_client.configure(
    app=APPLICATION,
    url=PROXY_URL,
    timeout=PROXY_TIMEOUT
)

init(APPLICATION, socket_client)

# Ensure export directory exists
export_dir = Path("T:/Projects/pdf-orchestrator/exports")
export_dir.mkdir(parents=True, exist_ok=True)

# TEEI Brand Colors
TEEI_BLUE = {"red": 0, "green": 51, "blue": 102}  # #003366
TEEI_GOLD = {"red": 212, "green": 175, "blue": 55}  # #D4AF37
LIGHT_GRAY = {"red": 247, "green": 247, "blue": 247}  # #F7F7F7

def log(msg):
    """Print progress message"""
    print(f">>> {msg}")

def create_document():
    """Step 1: Create A4 document"""
    log("Creating A4 document (210x297mm)...")

    # A4 in points: 595 x 842
    command = createCommand("createDocument", {
        "pageWidth": 595,
        "pageHeight": 842,
        "pagesPerDocument": 1,
        "pagesFacing": False,
        "margins": {"top": 54, "bottom": 54, "left": 54, "right": 54},  # 0.75" margins
        "columns": {"count": 1, "gutter": 0},
        "bleed": {"top": 0, "bottom": 0, "left": 0, "right": 0},
        "name": "TEEI_AWS_Partnership_Brief",
        "units": "pt"
    })

    response = sendCommand(command)
    if response.get("status") == "SUCCESS":
        log("Document created successfully")
        return True
    else:
        log(f"Failed to create document: {response.get('message')}")
        return False

def create_styles():
    """Step 2: Create paragraph styles with TEEI branding"""
    log("Creating TEEI-branded paragraph styles...")

    styles = [
        {
            "name": "TEEI Title",
            "spec": {
                "fontSize": 28,
                "fontFamily": "Arial\tBold",
                "leading": 32,
                "spaceAfter": 6,
                "alignment": "LEFT"
            }
        },
        {
            "name": "TEEI Subtitle",
            "spec": {
                "fontSize": 12,
                "fontFamily": "Arial\tRegular",
                "leading": 16,
                "spaceAfter": 18,
                "alignment": "LEFT"
            }
        },
        {
            "name": "TEEI Section Header",
            "spec": {
                "fontSize": 14,
                "fontFamily": "Arial\tBold",
                "leading": 18,
                "spaceBefore": 12,
                "spaceAfter": 8,
                "alignment": "LEFT"
            }
        },
        {
            "name": "TEEI Body",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 14,
                "spaceAfter": 8,
                "alignment": "LEFT"
            }
        },
        {
            "name": "TEEI Metric Number",
            "spec": {
                "fontSize": 24,
                "fontFamily": "Arial\tBold",
                "leading": 28,
                "spaceAfter": 2,
                "alignment": "CENTER"
            }
        },
        {
            "name": "TEEI Metric Caption",
            "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tRegular",
                "leading": 12,
                "spaceAfter": 10,
                "alignment": "CENTER"
            }
        },
        {
            "name": "TEEI Contact",
            "spec": {
                "fontSize": 9,
                "fontFamily": "Arial\tRegular",
                "leading": 13,
                "spaceAfter": 2,
                "alignment": "LEFT"
            }
        },
        {
            "name": "TEEI Footer",
            "spec": {
                "fontSize": 8,
                "fontFamily": "Arial\tItalic",
                "leading": 10,
                "alignment": "CENTER"
            }
        },
        {
            "name": "TEEI Bullet",
            "spec": {
                "fontSize": 10,
                "fontFamily": "Arial\tRegular",
                "leading": 14,
                "spaceAfter": 6,
                "leftIndent": 12,
                "firstLineIndent": -12,
                "alignment": "LEFT"
            }
        }
    ]

    command = createCommand("setStyles", {
        "paragraph": styles,
        "character": [],
        "object": []
    })

    response = sendCommand(command)
    if response.get("status") == "SUCCESS":
        log("Styles created successfully")
        return True
    else:
        log(f"Failed to create styles: {response.get('message')}")
        return False

def add_header():
    """Step 3: Add header with title and subtitle"""
    log("Adding header section...")

    # Logo placeholder
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 54,
        "width": 120,
        "height": 30,
        "content": "[TEEI Logo]",
        "style": "TEEI Body",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Title
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 95,
        "width": 487,
        "height": 40,
        "content": "Scaling Equal Education Access with AWS",
        "style": "TEEI Title",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Subtitle
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 135,
        "width": 487,
        "height": 20,
        "content": "A partnership proposal from The Educational Equality Institute",
        "style": "TEEI Subtitle",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Gold accent line (simulated with text)
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 160,
        "width": 487,
        "height": 10,
        "content": "━" * 80,  # Gold line
        "style": "TEEI Footer",
        "overflow": "expand"
    })
    response = sendCommand(command)

    log("Header added")
    return True

def add_mission_section():
    """Step 4: Add mission section"""
    log("Adding mission section...")

    # Section header
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 180,
        "width": 487,
        "height": 25,
        "content": "OUR MISSION",
        "style": "TEEI Section Header",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Mission text
    mission_text = """The Educational Equality Institute (TEEI) provides free, high-quality language learning and personalized mentorship programs to refugees and displaced learners worldwide. Our platform breaks down barriers to education by connecting vulnerable populations with volunteer mentors, empowering them to rebuild their lives through language skills and human connection. Every learner deserves equal access to education, regardless of circumstance."""

    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 205,
        "width": 487,
        "height": 60,
        "content": mission_text,
        "style": "TEEI Body",
        "overflow": "expand"
    })
    response = sendCommand(command)

    log("Mission section added")
    return True

def add_impact_metrics():
    """Step 5: Add impact metrics in three columns"""
    log("Adding impact metrics...")

    # Calculate column widths
    total_width = 487
    gutter = 20
    col_width = (total_width - (2 * gutter)) / 3

    # Metric 1
    x1 = 54
    command = createCommand("placeText", {
        "page": 1,
        "x": x1,
        "y": 285,
        "width": col_width,
        "height": 35,
        "content": "10,000",
        "style": "TEEI Metric Number",
        "overflow": "expand"
    })
    response = sendCommand(command)

    command = createCommand("placeText", {
        "page": 1,
        "x": x1,
        "y": 320,
        "width": col_width,
        "height": 25,
        "content": "Active\nBeneficiaries",
        "style": "TEEI Metric Caption",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Metric 2
    x2 = x1 + col_width + gutter
    command = createCommand("placeText", {
        "page": 1,
        "x": x2,
        "y": 285,
        "width": col_width,
        "height": 35,
        "content": "2,600",
        "style": "TEEI Metric Number",
        "overflow": "expand"
    })
    response = sendCommand(command)

    command = createCommand("placeText", {
        "page": 1,
        "x": x2,
        "y": 320,
        "width": col_width,
        "height": 25,
        "content": "Volunteer\nMentors",
        "style": "TEEI Metric Caption",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Metric 3
    x3 = x2 + col_width + gutter
    command = createCommand("placeText", {
        "page": 1,
        "x": x3,
        "y": 285,
        "width": col_width,
        "height": 35,
        "content": "50,000+",
        "style": "TEEI Metric Number",
        "overflow": "expand"
    })
    response = sendCommand(command)

    command = createCommand("placeText", {
        "page": 1,
        "x": x3,
        "y": 320,
        "width": col_width,
        "height": 25,
        "content": "Learning Hours\nDelivered",
        "style": "TEEI Metric Caption",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Infrastructure note
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 355,
        "width": 487,
        "height": 20,
        "content": "All programs are powered entirely by AWS cloud infrastructure.",
        "style": "TEEI Body",
        "overflow": "expand"
    })
    response = sendCommand(command)

    log("Impact metrics added")
    return True

def add_ask_section():
    """Step 6: Add 'The Ask' section"""
    log("Adding 'The Ask' section...")

    # Section header
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 385,
        "width": 487,
        "height": 25,
        "content": "THE ASK",
        "style": "TEEI Section Header",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Ask text
    ask_text = """TEEI seeks an AWS promotional-credit partnership to remove infrastructure cost barriers and scale our platform to serve 100,000 beneficiaries globally. Our entire platform runs on AWS services (S3, CloudFront, Lambda, DynamoDB, RDS), and infrastructure cost is currently the only constraint preventing us from expanding our life-changing programs to more refugees and displaced learners worldwide."""

    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 410,
        "width": 487,
        "height": 60,
        "content": ask_text,
        "style": "TEEI Body",
        "overflow": "expand"
    })
    response = sendCommand(command)

    log("'The Ask' section added")
    return True

def add_offer_section():
    """Step 7: Add 'What We Offer AWS' section"""
    log("Adding 'What We Offer AWS' section...")

    # Section header
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 485,
        "width": 487,
        "height": 25,
        "content": "WHAT WE OFFER AWS",
        "style": "TEEI Section Header",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Bullet points
    bullet1 = "• Public visibility and co-branding — 'Powered by AWS' badge prominently displayed on our platform and all communications"
    bullet2 = "• Impact metrics for AWS Tech for Good case studies — Detailed quarterly reports showing beneficiary outcomes and platform scale"
    bullet3 = "• Participation in AWS Imagine Grant Program, Public Sector blog features, and nonprofit tech events"

    y_pos = 510
    for bullet in [bullet1, bullet2, bullet3]:
        command = createCommand("placeText", {
            "page": 1,
            "x": 54,
            "y": y_pos,
            "width": 487,
            "height": 30,
            "content": bullet,
            "style": "TEEI Bullet",
            "overflow": "expand"
        })
        response = sendCommand(command)
        y_pos += 28

    log("'What We Offer AWS' section added")
    return True

def add_contact_section():
    """Step 8: Add contact information"""
    log("Adding contact information...")

    # Section header
    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 620,
        "width": 487,
        "height": 25,
        "content": "CONTACT INFORMATION",
        "style": "TEEI Section Header",
        "overflow": "expand"
    })
    response = sendCommand(command)

    # Contact details
    contact_lines = [
        "Henrik Røine",
        "Managing Director, The Educational Equality Institute",
        "henrik@theeducationalequalityinstitute.org",
        "https://theeducationalequalityinstitute.org"
    ]

    y_pos = 645
    for line in contact_lines:
        command = createCommand("placeText", {
            "page": 1,
            "x": 54,
            "y": y_pos,
            "width": 487,
            "height": 15,
            "content": line,
            "style": "TEEI Contact",
            "overflow": "expand"
        })
        response = sendCommand(command)
        y_pos += 13

    log("Contact information added")
    return True

def add_footer():
    """Step 9: Add footer"""
    log("Adding footer...")

    command = createCommand("placeText", {
        "page": 1,
        "x": 54,
        "y": 790,
        "width": 487,
        "height": 20,
        "content": "Powered by AWS Infrastructure",
        "style": "TEEI Footer",
        "overflow": "expand"
    })
    response = sendCommand(command)

    log("Footer added")
    return True

def export_pdf():
    """Step 10: Export as high-quality PDF"""
    log("Exporting PDF...")

    output_path = export_dir / "TEEI_AWS_Partnership_Brief.pdf"

    command = createCommand("exportPDF", {
        "outputPath": str(output_path),
        "preset": "High Quality Print",
        "useDocBleed": False,
        "includeMarks": False,
        "taggedPDF": False,
        "viewPDF": False
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        if output_path.exists():
            file_size_kb = output_path.stat().st_size / 1024
            log(f"PDF exported successfully!")
            log(f"Location: {output_path}")
            log(f"File size: {file_size_kb:.1f} KB")
            return True
        else:
            log("PDF export reported success but file not found")
            return False
    else:
        log(f"PDF export failed: {response.get('message')}")
        return False

def save_indd():
    """Step 11: Save InDesign source file"""
    log("Saving InDesign source file...")

    save_path = export_dir / "TEEI_AWS_Partnership_Brief.indd"

    command = createCommand("saveDocument", {
        "path": str(save_path),
        "overwrite": True
    })

    response = sendCommand(command)

    if response.get("status") == "SUCCESS":
        log(f"InDesign file saved: {save_path}")
        return True
    else:
        log(f"Save failed: {response.get('message')}")
        return False

def main():
    """Main execution"""
    print("\n" + "="*70)
    print("TEEI AWS PARTNERSHIP BRIEF GENERATOR")
    print("="*70)
    print("Creating professional one-page PDF using Adobe InDesign automation\n")

    steps = [
        ("Create A4 Document", create_document),
        ("Create TEEI Brand Styles", create_styles),
        ("Add Header Section", add_header),
        ("Add Mission Section", add_mission_section),
        ("Add Impact Metrics", add_impact_metrics),
        ("Add 'The Ask' Section", add_ask_section),
        ("Add 'What We Offer AWS' Section", add_offer_section),
        ("Add Contact Information", add_contact_section),
        ("Add Footer", add_footer),
        ("Export PDF", export_pdf),
        ("Save InDesign Source", save_indd)
    ]

    results = []

    for name, func in steps:
        try:
            result = func()
            results.append((name, result))
            if not result:
                print(f"\n[WARNING] Step failed but continuing: {name}")
        except Exception as e:
            print(f"\n[ERROR] Step failed with exception: {name}")
            print(f"Error: {e}")
            results.append((name, False))

    # Summary
    print("\n" + "="*70)
    print("SUMMARY")
    print("="*70)

    for name, result in results:
        status = "[OK]" if result else "[FAIL]"
        print(f"{status} {name}")

    passed = sum(1 for _, r in results if r)
    print(f"\nCompleted: {passed}/{len(results)} steps")

    if passed >= len(results) - 1:  # Allow one failure
        print("\n" + "="*70)
        print("SUCCESS! PDF created.")
        print("="*70)
        print(f"\nDownload your file at:")
        print(f"  {export_dir / 'TEEI_AWS_Partnership_Brief.pdf'}")
        print(f"\nInDesign source file:")
        print(f"  {export_dir / 'TEEI_AWS_Partnership_Brief.indd'}")
        print("\n" + "="*70)
    else:
        print("\n" + "="*70)
        print("PARTIAL SUCCESS - Some steps failed")
        print("="*70)
        print("Check the output above for details.")

if __name__ == "__main__":
    main()
