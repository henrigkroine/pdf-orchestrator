#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TEEI Partnership Showcase - Premium InDesign Document
Creates a professional showcase document with gradient header, curved text, and premium effects
"""

import sys
import os
import io

# Fix Windows console encoding for emojis
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
print("CREATING TEEI PARTNERSHIP SHOWCASE - PREMIUM DOCUMENT")
print("=" * 80)
print()

# TEEI Brand Colors (RGB values as dict with red/green/blue keys)
def rgb_dict(r, g, b):
    """Convert RGB array to dict format expected by InDesign"""
    return {"red": r, "green": g, "blue": b}

TEEI_BLUE = rgb_dict(0, 57, 63)      # #00393F
TEEI_GREEN = rgb_dict(0, 150, 136)   # #009688
TEEI_GOLD = rgb_dict(255, 183, 77)   # #FFB74D (approximate, using #FFB74D from spec)
WHITE = rgb_dict(255, 255, 255)
DARK_GRAY = rgb_dict(51, 51, 51)     # #333333
MEDIUM_GRAY = rgb_dict(102, 102, 102) # #666666

# Content array (31 blocks)
CONTENT = [
    "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.",
    "",
    "Revolutionary AI Platform Features:",
    "• Adaptive learning pathways personalized for each student",
    "• Real-time progress tracking and intervention alerts",
    "• Multi-language support (25+ languages)",
    "• Accessibility features for diverse learning needs",
    "• Teacher dashboard with actionable insights",
    "",
    "Proven Impact:",
    "• 85% improvement in student engagement",
    "• 92% teacher satisfaction rate",
    "• 78% reduction in learning gaps",
    "• 10x cost savings vs. traditional methods",
    "",
    "Strategic Partnership Benefits:",
    "",
    "🤝 Technology Leadership",
    "Partner with a proven EdTech innovator transforming education at scale",
    "",
    "🌍 Global Reach",
    "Access to established networks in 12 countries across 3 continents",
    "",
    "💡 Innovation Pipeline",
    "Collaborate on cutting-edge AI/ML educational research",
    "",
    "📊 Data Excellence",
    "Leverage world-class learning analytics and outcomes measurement",
    "",
    "Contact: Henrik Røine | CEO & Founder",
    "Email: henrik@theeducationalequalityinstitute.org",
    "Web: www.educationalequality.institute"
]

def send_cmd(action, options):
    """Helper to send command and handle errors"""
    try:
        command = createCommand(action, options)
        result = sendCommand(command)
        # Handle response format: {"status": "SUCCESS", "response": {"success": true, ...}}
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
            return {'ok': True, 'result': result}  # Assume success if no error
    except Exception as e:
        print(f"❌ {action} - Exception: {str(e)}")
        return {'ok': False, 'error': str(e)}

# Step 1: Create document
print("\n📄 Step 1: Creating document...")
result = send_cmd("createDocument", {
    "intent": "PRINT_INTENT",  # CMYK for print (as specified)
    "pageWidth": 595,
    "pageHeight": 842,
    "margins": {
        "top": 72,
        "bottom": 72,
        "left": 72,
        "right": 72
    },
    "columns": {
        "count": 1,
        "gutter": 12
    },
    "pagesPerDocument": 1,
    "pagesFacing": False
})

if not result.get('ok'):
    print("❌ Failed to create document. Exiting.")
    sys.exit(1)

# Step 2: Create gradient header box
print("\n🎨 Step 2: Creating gradient header...")
result = send_cmd("createGradientBox", {
    "page": 1,
    "x": 0,
    "y": 0,
    "width": 595,
    "height": 180,
    "startColor": TEEI_BLUE,
    "endColor": TEEI_GREEN,
    "angle": 90  # Top to bottom
})

# Step 3: Create curved title text on path
print("\n🌈 Step 3: Creating curved title text...")
result = send_cmd("createTextOnPath", {
    "page": 1,
    "x": 297.5,  # Center X
    "y": 100,     # Center Y
    "diameter": 240,  # Radius * 2 = 120 * 2
    "content": "🌟 TEEI AI-Powered Education Revolution 2025",
    "fontSize": 28,
    "fontFamily": "Arial",
    "fontStyle": "Bold",
    "textColor": WHITE,  # Use textColor not fillColor
    "pathEffect": "rainbow"  # Curved along top arc
})

# Step 4: Create subtitle
print("\n📝 Step 4: Creating subtitle...")
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": 200,
    "width": 451,  # Page width minus margins
    "height": 30,
    "content": "World-Class Partnership Showcase Document",
    "fontSize": 18,
    "fontFamily": "Arial",
    "fontStyle": "Regular",
    "fillColor": TEEI_BLUE,
    "horizontalAlign": "center",
    "verticalAlign": "top"
})

# Step 5: Add content sections
print("\n📄 Step 5: Adding content sections...")
current_y = 250  # Start below subtitle

for i, block in enumerate(CONTENT):
    if block == "":
        # Empty string = 12pt vertical space
        current_y += 12
        continue
    
    # Determine styling based on content
    if block.startswith("•"):
        # Bullet point
        result = send_cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": 90,  # 72pt margin + 18pt indent
            "y": current_y,
            "width": 415,  # 451 - 36 (indent)
            "height": 20,
            "content": block,
            "fontSize": 11,
            "fontFamily": "Arial",
            "fontStyle": "Regular",
            "fillColor": DARK_GRAY,
            "leading": 16,
            "horizontalAlign": "left"
        })
        current_y += 20
    
    elif any(block.startswith(emoji) for emoji in ["🤝", "🌍", "💡", "📊"]):
        # Section heading with emoji
        result = send_cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": 72,
            "y": current_y,
            "width": 451,
            "height": 25,
            "content": block,
            "fontSize": 16,
            "fontFamily": "Arial",
            "fontStyle": "Bold",
            "fillColor": TEEI_GREEN,
            "horizontalAlign": "left"
        })
        current_y += 25
        
        # Add gradient accent bar below heading
        result = send_cmd("createGradientBox", {
            "page": 1,
            "x": 72,
            "y": current_y,
            "width": 451,
            "height": 3,
            "startColor": TEEI_BLUE,
            "endColor": TEEI_GOLD,
            "angle": 0  # Horizontal
        })
        current_y += 6  # 3pt bar + 3pt spacing
    
    else:
        # Regular text
        # Estimate height needed (rough calculation)
        text_height = max(20, len(block) // 50 * 16)  # Approximate
        
        result = send_cmd("createTextFrameAdvanced", {
            "page": 1,
            "x": 72,
            "y": current_y,
            "width": 451,
            "height": text_height,
            "content": block,
            "fontSize": 11,
            "fontFamily": "Arial",
            "fontStyle": "Regular",
            "fillColor": DARK_GRAY,
            "leading": 16,
            "horizontalAlign": "left"
        })
        current_y += text_height + 8  # Add spacing
    
    # Check if we need to stop (approaching footer area)
    if current_y > 750:
        print(f"⚠️  Content truncated at block {i+1}/{len(CONTENT)} (reached footer area)")
        break

# Step 6: Create ultra-premium boxes for partnership benefits
print("\n💎 Step 6: Creating ultra-premium boxes for partnership benefits...")

# Find the 4 partnership benefit sections and wrap them in premium boxes
benefit_sections = [
    {"y": 450, "height": 60},  # Technology Leadership
    {"y": 520, "height": 60},  # Global Reach
    {"y": 590, "height": 60},  # Innovation Pipeline
    {"y": 660, "height": 60}   # Data Excellence
]

for section in benefit_sections:
    result = send_cmd("createUltraPremiumBox", {
        "page": 1,
        "x": 72,
        "y": section["y"],
        "width": 451,
        "height": section["height"],
        "fillColor": WHITE,
        "stroke": {
            "color": TEEI_GREEN,
            "weight": 1
        },
        "cornerRadius": 8,
        "dropShadow": {
            "offsetX": 2,
            "offsetY": 2,
            "blur": 8,
            "opacity": 30
        },
        "outerGlow": {
            "color": TEEI_GREEN,
            "spread": 4,
            "blur": 8,
            "opacity": 40
        },
        "innerGlow": {
            "color": TEEI_GOLD,
            "spread": 2,
            "blur": 6,
            "opacity": 20
        }
    })

# Step 7: Add decorative pattern (step and repeat circles)
print("\n⭐ Step 7: Adding decorative pattern...")
# Create exactly 10 circles: 5 horizontal × 2 vertical
# Starting at X=480, Y=20 with 12pt horizontal, 8pt vertical spacing
start_x = 480
start_y = 20

for row in range(2):
    for col in range(5):
        x = start_x + (col * (12 + 6))  # 12pt spacing + 6pt diameter
        y = start_y + (row * (8 + 6))   # 8pt spacing + 6pt diameter
        
        result = send_cmd("createEllipse", {
            "page": 1,
            "x": x,
            "y": y,
            "width": 6,
            "height": 6,
            "fillColor": TEEI_BLUE,
            "opacity": 40
        })

# Step 8: Create footer
print("\n📋 Step 8: Creating footer...")
footer_y = 734  # Exact Y position as specified

# Horizontal rule (Width=451pt, Height=1pt)
result = send_cmd("createLine", {
    "page": 1,
    "x1": 72,
    "y1": footer_y,
    "x2": 523,  # 72 + 451
    "y2": footer_y,
    "strokeColor": TEEI_BLUE,
    "strokeWeight": 1
})

# Footer text
result = send_cmd("createTextFrameAdvanced", {
    "page": 1,
    "x": 72,
    "y": footer_y + 6,  # Below the line
    "width": 451,
    "height": 15,
    "content": "© 2025 The Educational Equality Institute | Confidential Partnership Document",
    "fontSize": 9,
    "fontFamily": "Arial",
    "fontStyle": "Regular",
    "fillColor": MEDIUM_GRAY,
    "horizontalAlign": "center"
})

# Step 9: Export to PDF
print("\n💾 Step 9: Exporting to PDF...")
export_path = r"T:\Projects\pdf-orchestrator\exports\teei-partnership-showcase-premium.pdf"

# Ensure exports directory exists
os.makedirs(os.path.dirname(export_path), exist_ok=True)

result = send_cmd("exportPDF", {
    "outputPath": export_path,
    "preset": "High Quality Print",
    "includeMarks": True,  # Include crop marks
    "useDocBleed": True    # Include bleed
})

if result.get('ok'):
    print(f"\n✅ SUCCESS! PDF exported to: {export_path}")
    print("\n" + "=" * 80)
    print("TEEI PARTNERSHIP SHOWCASE DOCUMENT CREATED SUCCESSFULLY!")
    print("=" * 80)
else:
    print(f"\n❌ Export failed: {result.get('error', 'Unknown error')}")
    sys.exit(1)

