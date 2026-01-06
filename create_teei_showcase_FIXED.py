#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI Partnership Showcase - FIXED VERSION
Uses correct parameter names that match the UXP plugin
"""

import sys
import os
import io

# Fix Windows console encoding
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add adb-mcp/mcp to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'
PROXY_TIMEOUT = 60

# Configure socket client
socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=PROXY_TIMEOUT)
init(APPLICATION, socket_client)

print("=" * 80)
print("CREATING TEEI PARTNERSHIP SHOWCASE - FIXED VERSION")
print("=" * 80)
print()

# TEEI Brand Colors
def rgb_dict(r, g, b):
    """Convert RGB to dict format"""
    return {"red": r, "green": g, "blue": b}

TEEI_BLUE = rgb_dict(0, 57, 63)      # #00393F
TEEI_GREEN = rgb_dict(0, 150, 136)   # #009688
TEEI_GOLD = rgb_dict(255, 183, 77)   # #FFB74D
WHITE = rgb_dict(255, 255, 255)
DARK_GRAY = rgb_dict(51, 51, 51)     # #333333
MEDIUM_GRAY = rgb_dict(102, 102, 102) # #666666

def send_cmd(action, options):
    """Helper to send command and handle errors"""
    try:
        command = createCommand(action, options)
        result = sendCommand(command)
        if isinstance(result, dict):
            status = result.get('status', '')
            response_data = result.get('response', {})

            if status == 'SUCCESS' or response_data.get('success'):
                print(f"✅ {action} - Success")
                return {'ok': True, 'result': result, 'response': response_data}
            else:
                error_msg = response_data.get('error', response_data.get('message', 'Unknown error'))
                print(f"❌ {action} - Error: {error_msg}")
                return {'ok': False, 'error': error_msg, 'result': result}
        else:
            print(f"⚠️  {action} - Unexpected response format: {result}")
            return {'ok': True, 'result': result}
    except Exception as e:
        print(f"❌ {action} - Exception: {str(e)}")
        return {'ok': False, 'error': str(e)}

# Step 1: Create document
print("\n[1/5] Creating document...")
result = send_cmd("createDocument", {
    "intent": "PRINT_INTENT",
    "pageWidth": 595,
    "pageHeight": 842,
    "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},
    "columns": {"count": 1, "gutter": 12},
    "pagesPerDocument": 1,
    "pagesFacing": False
})

if not result.get('ok'):
    print("❌ Failed to create document. Exiting.")
    sys.exit(1)

# Step 2: Create gradient header box
print("\n[2/5] Creating gradient header...")
result = send_cmd("createGradientBox", {
    "page": 1,
    "x": 0,
    "y": 0,
    "width": 595,
    "height": 180,
    "startColor": TEEI_BLUE,
    "endColor": TEEI_GREEN,
    "angle": 90,
    "sendToBack": True  # Send gradient to back so text appears on top
})

# Step 3: Create title text (simplified - no curved path since it's broken)
print("\n[3/5] Creating title...")
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": 80,
    "width": 451,
    "height": 60,
    "content": "TEEI AI-Powered Education Revolution 2025",
    "fontSize": 32,
    "fontFamily": "Arial",
    "fontStyle": "Bold",
    "textColor": WHITE,  # FIXED: Use textColor not fillColor!
    "horizontalAlign": "center",
    "verticalAlign": "center"
})

# Step 4: Create subtitle
print("\n[4/5] Creating subtitle...")
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": 200,
    "width": 451,
    "height": 30,
    "content": "World-Class Partnership Showcase Document",
    "fontSize": 18,
    "fontFamily": "Arial",
    "fontStyle": "Regular",
    "textColor": TEEI_BLUE,  # FIXED: Use textColor!
    "horizontalAlign": "center"
})

# Step 5: Add main content
print("\n[5/5] Adding content...")
current_y = 250

content_sections = [
    {"text": "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Revolutionary AI Platform Features:", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "• Adaptive learning pathways personalized for each student", "size": 11, "color": DARK_GRAY, "style": "Regular"},
    {"text": "• Real-time progress tracking and intervention alerts", "size": 11, "color": DARK_GRAY, "style": "Regular"},
    {"text": "• Multi-language support (25+ languages)", "size": 11, "color": DARK_GRAY, "style": "Regular"},
    {"text": "• Teacher dashboard with actionable insights", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Proven Impact:", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "• 85% improvement in student engagement", "size": 11, "color": DARK_GRAY, "style": "Regular"},
    {"text": "• 92% teacher satisfaction rate", "size": 11, "color": DARK_GRAY, "style": "Regular"},
    {"text": "• 78% reduction in learning gaps", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Strategic Partnership Benefits", "size": 16, "color": TEEI_BLUE, "style": "Bold"},

    {"text": "Technology Leadership", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "Partner with a proven EdTech innovator transforming education at scale", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Global Reach", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "Access to established networks in 12 countries across 3 continents", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Innovation Pipeline", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "Collaborate on cutting-edge AI/ML educational research", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Data Excellence", "size": 14, "color": TEEI_GREEN, "style": "Bold"},
    {"text": "Leverage world-class learning analytics and outcomes measurement", "size": 11, "color": DARK_GRAY, "style": "Regular"},

    {"text": "Contact: Henrik Røine | CEO & Founder", "size": 10, "color": DARK_GRAY, "style": "Regular"},
    {"text": "Email: henrik@theeducationalequalityinstitute.org", "size": 10, "color": DARK_GRAY, "style": "Regular"},
    {"text": "Web: www.educationalequality.institute", "size": 10, "color": DARK_GRAY, "style": "Regular"},
]

for section in content_sections:
    height = 25 if section["size"] >= 14 else 18

    result = send_cmd("createTextFrameAdvanced", {
        "page": 1,
        "x": 72,
        "y": current_y,
        "width": 451,
        "height": height,
        "content": section["text"],
        "fontSize": section["size"],
        "fontFamily": "Arial",
        "fontStyle": section["style"],
        "textColor": section["color"],  # FIXED: Use textColor!
        "horizontalAlign": "left"
    })

    current_y += height + 6

    if current_y > 700:
        break

# Footer
footer_y = 734
result = send_cmd("createLine", {
    "page": 1,
    "x1": 72,
    "y1": footer_y,
    "x2": 523,
    "y2": footer_y,
    "strokeColor": TEEI_BLUE,
    "strokeWeight": 1
})

result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": footer_y + 6,
    "width": 451,
    "height": 15,
    "content": "© 2025 The Educational Equality Institute | Confidential Partnership Document",
    "fontSize": 9,
    "fontFamily": "Arial",
    "fontStyle": "Regular",
    "textColor": MEDIUM_GRAY,  # FIXED: Use textColor!
    "horizontalAlign": "center"
})

print("\n✅ DOCUMENT CREATED WITH ALL COLORS!")
print("\n📋 Now export manually from InDesign:")
print("   File → Export → Adobe PDF (Print)")
print("   Choose 'High Quality Print'")
print("   Save to: T:\\Projects\\pdf-orchestrator\\exports\\teei-partnership-showcase-premium.pdf")
print("\n" + "=" * 80)
