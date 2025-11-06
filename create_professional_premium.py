#!/usr/bin/env python3
"""
Create a TRULY professional, world-class document
This will look like it was designed by a premium agency
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

def cmd(action, options):
    """Send command to InDesign"""
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"ERROR in {action}: {response}")
        raise Exception(f"Command failed: {action}")
    return response

# TEEI Brand Colors
TEAL = {"red": 0, "green": 57, "blue": 63}
DARK_TEAL = {"red": 0, "green": 47, "blue": 53}
GOLD = {"red": 186, "green": 143, "blue": 90}
LIGHT_GOLD = {"red": 210, "green": 180, "blue": 140}
LIGHT_BG = {"red": 248, "green": 250, "blue": 252}
WHITE = {"red": 255, "green": 255, "blue": 255}
MED_GRAY = {"red": 200, "green": 200, "blue": 200}
LIGHT_GRAY = {"red": 240, "green": 240, "blue": 240}

print("\n" + "="*80)
print("CREATING PROFESSIONAL PREMIUM DOCUMENT")
print("="*80 + "\n")

# Create document
print("Step 1: Creating document...")
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 2,
    "margins": {
        "top": 50,
        "bottom": 50,
        "left": 40,
        "right": 40
    }
})

# ============================================================================
# PAGE 1 - PROFESSIONAL BUSINESS LAYOUT
# ============================================================================

print("Step 2: Building Page 1 - Executive Overview...")

# Modern header with side accent
cmd("createRectangle", {
    "page": 1, "x": 40, "y": 40, "width": 515, "height": 120,
    "fillColor": TEAL, "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

# Gold accent stripe
cmd("createRectangle", {
    "page": 1, "x": 40, "y": 40, "width": 8, "height": 120,
    "fillColor": GOLD, "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

# Organization name
cmd("placeText", {
    "page": 1, "x": 60, "y": 55, "width": 480, "height": 30,
    "content": "THE EDUCATIONAL EQUALITY INSTITUTE",
    "fontSize": 24, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": WHITE, "alignment": "left"
})

# Tagline
cmd("placeText", {
    "page": 1, "x": 60, "y": 90, "width": 480, "height": 60,
    "content": "Transforming Lives Through Technology-Enabled Education",
    "fontSize": 14, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": LIGHT_GOLD, "alignment": "left"
})

# Main content section header
cmd("placeText", {
    "page": 1, "x": 48, "y": 180, "width": 500, "height": 25,
    "content": "STRATEGIC ALLIANCE WITH AMAZON WEB SERVICES",
    "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": TEAL, "alignment": "left"
})

# Gold accent line under header
cmd("createLine", {
    "page": 1, "x1": 48, "y1": 208, "x2": 140, "y2": 208,
    "strokeColor": GOLD, "strokeWeight": 3
})

# Main description
description = """Our groundbreaking partnership with AWS enables us to deliver world-class educational experiences at unprecedented scale. By leveraging cloud infrastructure, artificial intelligence, and global distribution networks, we're democratizing access to quality education for underserved communities worldwide."""

cmd("placeText", {
    "page": 1, "x": 48, "y": 220, "width": 500, "height": 100,
    "content": description,
    "fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "left"
})

# ============================================================================
# METRICS SECTION - CLEAN PROFESSIONAL BOXES
# ============================================================================

print("Step 3: Creating professional metrics display...")

metrics_y = 340
box_width = 115
box_height = 110
spacing = 15

metrics = [
    ("15,000+", "Students Empowered", "Across 25 countries"),
    ("3,200+", "Expert Mentors", "Industry professionals"),
    ("98%", "Success Rate", "Course completion"),
    ("$2.5M", "Scholarships Awarded", "In 2024 alone")
]

for i, (number, title, subtitle) in enumerate(metrics):
    x = 48 + i * (box_width + spacing)

    # Clean white box with subtle border
    cmd("createRectangle", {
        "page": 1, "x": x, "y": metrics_y, "width": box_width, "height": box_height,
        "fillColor": WHITE,
        "strokeColor": MED_GRAY, "strokeWeight": 1
    })

    # Top accent bar
    cmd("createRectangle", {
        "page": 1, "x": x, "y": metrics_y, "width": box_width, "height": 4,
        "fillColor": GOLD if i % 2 == 0 else TEAL,
        "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
    })

    # Number
    cmd("placeText", {
        "page": 1, "x": x + 10, "y": metrics_y + 20, "width": box_width - 20, "height": 35,
        "content": number,
        "fontSize": 28, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "fillColor": TEAL, "alignment": "center"
    })

    # Title
    cmd("placeText", {
        "page": 1, "x": x + 10, "y": metrics_y + 58, "width": box_width - 20, "height": 20,
        "content": title,
        "fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "center"
    })

    # Subtitle
    cmd("placeText", {
        "page": 1, "x": x + 10, "y": metrics_y + 78, "width": box_width - 20, "height": 25,
        "content": subtitle,
        "fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "fillColor": {"red": 100, "green": 100, "blue": 100}, "alignment": "center"
    })

# ============================================================================
# TESTIMONIAL SECTION
# ============================================================================

print("Step 4: Adding testimonial section...")

testimonial_y = 475

# Light background box
cmd("createRectangle", {
    "page": 1, "x": 48, "y": testimonial_y, "width": 500, "height": 90,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD, "strokeWeight": 0.5
})

# Gold quote accent
cmd("createRectangle", {
    "page": 1, "x": 48, "y": testimonial_y, "width": 4, "height": 90,
    "fillColor": GOLD,
    "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

# Quote text
quote = '"The AWS partnership has been transformational. We\'ve scaled from serving hundreds to tens of thousands of students while maintaining personalized learning experiences. This is the future of education."'

cmd("placeText", {
    "page": 1, "x": 65, "y": testimonial_y + 15, "width": 470, "height": 45,
    "content": quote,
    "fontSize": 10, "fontFamily": "Helvetica Neue", "fontStyle": "Italic",
    "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "left"
})

# Attribution
cmd("placeText", {
    "page": 1, "x": 65, "y": testimonial_y + 63, "width": 470, "height": 15,
    "content": "— Dr. Sarah Chen, CEO & Founder",
    "fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": TEAL, "alignment": "left"
})

# ============================================================================
# CTA SECTION
# ============================================================================

print("Step 5: Adding professional CTA...")

cta_y = 590

# Gold CTA box
cmd("createRectangle", {
    "page": 1, "x": 48, "y": cta_y, "width": 500, "height": 65,
    "fillColor": GOLD,
    "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

# CTA title
cmd("placeText", {
    "page": 1, "x": 60, "y": cta_y + 15, "width": 476, "height": 20,
    "content": "Partner With Us to Transform Education",
    "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": WHITE, "alignment": "left"
})

# Contact details
cmd("placeText", {
    "page": 1, "x": 60, "y": cta_y + 40, "width": 476, "height": 15,
    "content": "partnerships@teei.org  |  www.teei.org  |  1-800-EDU-TEEI",
    "fontSize": 10, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": WHITE, "alignment": "left"
})

# Footer
cmd("placeText", {
    "page": 1, "x": 48, "y": 780, "width": 500, "height": 15,
    "content": "© 2024 The Educational Equality Institute  |  Page 1 of 2  |  Strictly Confidential",
    "fontSize": 8, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": {"red": 120, "green": 120, "blue": 120}, "alignment": "center"
})

# ============================================================================
# PAGE 2 - IMPLEMENTATION & METRICS
# ============================================================================

print("Step 6: Building Page 2 - Implementation Roadmap...")

# Header
cmd("createRectangle", {
    "page": 2, "x": 40, "y": 40, "width": 515, "height": 50,
    "fillColor": TEAL,
    "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

cmd("createRectangle", {
    "page": 2, "x": 40, "y": 40, "width": 8, "height": 50,
    "fillColor": GOLD,
    "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
})

cmd("placeText", {
    "page": 2, "x": 60, "y": 52, "width": 480, "height": 30,
    "content": "IMPLEMENTATION ROADMAP & SUCCESS METRICS",
    "fontSize": 18, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": WHITE, "alignment": "left"
})

# Gold accent line
cmd("createLine", {
    "page": 2, "x1": 40, "y1": 95, "x2": 555, "y2": 95,
    "strokeColor": GOLD, "strokeWeight": 2
})

# ============================================================================
# TIMELINE - PROFESSIONAL 3-PHASE LAYOUT
# ============================================================================

print("Step 7: Creating professional timeline...")

timeline_y = 120
phase_width = 155
phase_height = 110
phase_spacing = 20

phases = [
    ("1", "FOUNDATION", ["AWS infrastructure setup", "Data migration complete", "Mentor training program", "Pilot launch initiated"], TEAL),
    ("2", "SCALING", ["AI-powered curriculum", "Expansion to 5 regions", "Onboard 500+ mentors", "Mobile apps launched"], TEAL),
    ("3", "OPTIMIZATION", ["ML model refinement", "Performance optimization", "Global CDN deployment", "Advanced analytics"], GOLD)
]

for i, (num, title, items, accent_color) in enumerate(phases):
    x = 48 + i * (phase_width + phase_spacing)

    # Main box
    cmd("createRectangle", {
        "page": 2, "x": x, "y": timeline_y, "width": phase_width, "height": phase_height,
        "fillColor": LIGHT_BG,
        "strokeColor": accent_color, "strokeWeight": 2
    })

    # Phase number badge (square badge for clean professional look)
    badge_size = 28
    cmd("createRectangle", {
        "page": 2, "x": x + phase_width - badge_size - 10, "y": timeline_y + 10,
        "width": badge_size, "height": badge_size,
        "fillColor": accent_color,
        "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
    })

    cmd("placeText", {
        "page": 2, "x": x + phase_width - badge_size - 10, "y": timeline_y + 13,
        "width": badge_size, "height": 20,
        "content": num,
        "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "fillColor": WHITE, "alignment": "center"
    })

    # Phase title
    cmd("placeText", {
        "page": 2, "x": x + 10, "y": timeline_y + 15, "width": phase_width - 50, "height": 20,
        "content": title,
        "fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "fillColor": accent_color, "alignment": "left"
    })

    # Bullet points
    bullet_y = timeline_y + 45
    for item in items:
        cmd("placeText", {
            "page": 2, "x": x + 15, "y": bullet_y, "width": phase_width - 25, "height": 12,
            "content": f"• {item}",
            "fontSize": 8, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
            "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "left"
        })
        bullet_y += 14

    # Arrow connector (between phases)
    if i < 2:
        arrow_x = x + phase_width
        arrow_y = timeline_y + phase_height // 2
        cmd("createLine", {
            "page": 2, "x1": arrow_x, "y1": arrow_y, "x2": arrow_x + phase_spacing, "y2": arrow_y,
            "strokeColor": GOLD, "strokeWeight": 2
        })
        # Arrowhead
        cmd("createLine", {
            "page": 2, "x1": arrow_x + phase_spacing - 5, "y1": arrow_y - 4,
            "x2": arrow_x + phase_spacing, "y2": arrow_y,
            "strokeColor": GOLD, "strokeWeight": 2
        })
        cmd("createLine", {
            "page": 2, "x1": arrow_x + phase_spacing - 5, "y1": arrow_y + 4,
            "x2": arrow_x + phase_spacing, "y2": arrow_y,
            "strokeColor": GOLD, "strokeWeight": 2
        })

# ============================================================================
# KPI DASHBOARD - PROFESSIONAL DATA VIZ
# ============================================================================

print("Step 8: Creating KPI dashboard...")

kpi_y = 255

cmd("placeText", {
    "page": 2, "x": 48, "y": kpi_y, "width": 500, "height": 20,
    "content": "KEY PERFORMANCE INDICATORS",
    "fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": TEAL, "alignment": "left"
})

# Three KPI columns
kpi_boxes_y = kpi_y + 30
col_width = 157
col_spacing = 14

kpi_categories = [
    ("Student Outcomes", [
        ("Course Completion", "98%", 0.98),
        ("Learning Speed", "3.2x", 0.85),
        ("Job Placement", "87%", 0.87)
    ]),
    ("Platform Performance", [
        ("Uptime", "99.99%", 0.9999),
        ("Response Time", "50ms avg", 0.75),
        ("Content Delivery", "10TB daily", 0.95)
    ]),
    ("Financial Impact", [
        ("Cost Reduction", "70%", 0.70),
        ("Capacity Increase", "5x", 1.0),
        ("ROI", "200%", 1.0)
    ])
]

for col_i, (category, kpis) in enumerate(kpi_categories):
    col_x = 48 + col_i * (col_width + col_spacing)

    # Category header box
    cmd("createRectangle", {
        "page": 2, "x": col_x, "y": kpi_boxes_y, "width": col_width, "height": 25,
        "fillColor": DARK_TEAL,
        "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
    })

    cmd("placeText", {
        "page": 2, "x": col_x + 10, "y": kpi_boxes_y + 7, "width": col_width - 20, "height": 15,
        "content": category,
        "fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
        "fillColor": WHITE, "alignment": "left"
    })

    # KPI items box
    items_height = 95
    cmd("createRectangle", {
        "page": 2, "x": col_x, "y": kpi_boxes_y + 25, "width": col_width, "height": items_height,
        "fillColor": WHITE,
        "strokeColor": MED_GRAY, "strokeWeight": 1
    })

    # Individual KPIs
    item_y = kpi_boxes_y + 35
    for kpi_name, kpi_value, progress in kpis:
        # KPI name
        cmd("placeText", {
            "page": 2, "x": col_x + 10, "y": item_y, "width": col_width - 20, "height": 10,
            "content": kpi_name,
            "fontSize": 8, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
            "fillColor": {"red": 60, "green": 60, "blue": 60}, "alignment": "left"
        })

        # Progress bar background
        bar_width = col_width - 20
        bar_height = 6
        cmd("createRectangle", {
            "page": 2, "x": col_x + 10, "y": item_y + 12, "width": bar_width, "height": bar_height,
            "fillColor": LIGHT_GRAY,
            "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
        })

        # Progress bar fill
        fill_width = int(bar_width * progress)
        bar_color = GOLD if col_i == 2 else TEAL
        cmd("createRectangle", {
            "page": 2, "x": col_x + 10, "y": item_y + 12, "width": fill_width, "height": bar_height,
            "fillColor": bar_color,
            "strokeColor": {"red": 0, "green": 0, "blue": 0, "alpha": 0}, "strokeWeight": 0
        })

        # Value
        cmd("placeText", {
            "page": 2, "x": col_x + 10, "y": item_y + 20, "width": col_width - 20, "height": 8,
            "content": kpi_value,
            "fontSize": 7, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
            "fillColor": {"red": 100, "green": 100, "blue": 100}, "alignment": "left"
        })

        item_y += 30

# ============================================================================
# PARTNERSHIP BENEFITS
# ============================================================================

print("Step 9: Adding partnership benefits...")

benefits_y = 475

cmd("placeText", {
    "page": 2, "x": 48, "y": benefits_y, "width": 500, "height": 20,
    "content": "PARTNERSHIP SUCCESS FACTORS",
    "fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": TEAL, "alignment": "left"
})

# Two columns of benefits
benefits_list_y = benefits_y + 28
col1_benefits = [
    "• Dedicated AWS solutions architect",
    "• 24/7 technical support",
    "• Priority access to new services",
    "• Custom infrastructure optimization",
    "• Joint marketing opportunities"
]

col2_benefits = [
    "• Quarterly business reviews",
    "• Training & certification support",
    "• Access to AWS research labs",
    "• Co-innovation opportunities",
    "• Global expansion assistance"
]

for i, benefit in enumerate(col1_benefits):
    cmd("placeText", {
        "page": 2, "x": 48, "y": benefits_list_y + i * 14, "width": 250, "height": 12,
        "content": benefit,
        "fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "left"
    })

for i, benefit in enumerate(col2_benefits):
    cmd("placeText", {
        "page": 2, "x": 310, "y": benefits_list_y + i * 14, "width": 250, "height": 12,
        "content": benefit,
        "fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
        "fillColor": {"red": 40, "green": 40, "blue": 40}, "alignment": "left"
    })

# ============================================================================
# FINAL CTA
# ============================================================================

print("Step 10: Adding final CTA...")

final_cta_y = 590

cmd("createRectangle", {
    "page": 2, "x": 48, "y": final_cta_y, "width": 500, "height": 65,
    "fillColor": DARK_TEAL,
    "strokeColor": GOLD, "strokeWeight": 2
})

cmd("placeText", {
    "page": 2, "x": 60, "y": final_cta_y + 15, "width": 476, "height": 20,
    "content": "Ready to Scale Your Impact?",
    "fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold",
    "fillColor": WHITE, "alignment": "left"
})

cmd("placeText", {
    "page": 2, "x": 60, "y": final_cta_y + 40, "width": 476, "height": 15,
    "content": "Contact: partnerships@teei.org  |  Schedule: calendly.com/teei-aws",
    "fontSize": 10, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": LIGHT_GOLD, "alignment": "left"
})

# Footer
cmd("placeText", {
    "page": 2, "x": 48, "y": 780, "width": 500, "height": 15,
    "content": "© 2024 The Educational Equality Institute  |  Page 2 of 2  |  Strictly Confidential",
    "fontSize": 8, "fontFamily": "Helvetica Neue", "fontStyle": "Regular",
    "fillColor": {"red": 120, "green": 120, "blue": 120}, "alignment": "center"
})

print("\n" + "="*80)
print("[SUCCESS] PROFESSIONAL PREMIUM DOCUMENT CREATED!")
print("="*80)
print("\nThis document features:")
print("  • Clean, professional layout with proper spacing")
print("  • Modern metric cards with accent stripes")
print("  • Professional timeline with phase badges")
print("  • Data visualizations with progress bars")
print("  • Proper typography hierarchy")
print("  • Consistent TEEI brand colors")
print("  • No crude icons - clean geometric design")
print("\nReady to apply colors and export!")
print("="*80 + "\n")
