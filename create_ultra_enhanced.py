#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ULTRA-ENHANCED WORLD-CLASS DOCUMENT
Maximum visual impact with InDesign MCP capabilities
"""

import sys
import os
import time

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
    return response

# TEEI Brand Colors
TEAL = {"red": 0, "green": 57, "blue": 63}
DARK_TEAL = {"red": 0, "green": 47, "blue": 53}
GOLD = {"red": 186, "green": 143, "blue": 90}
LIGHT_GOLD = {"red": 210, "green": 180, "blue": 140}
LIGHT_BG = {"red": 248, "green": 250, "blue": 252}
WHITE = {"red": 255, "green": 255, "blue": 255}
DARK_TEXT = {"red": 40, "green": 40, "blue": 40}
MED_GRAY = {"red": 120, "green": 120, "blue": 120}

print("\n" + "="*80)
print("CREATING ULTRA-ENHANCED WORLD-CLASS DOCUMENT")
print("="*80)
print("\nFeatures:")
print("  [*] Simulated icons using geometric shapes")
print("  [*] Bar charts for data visualization")
print("  [*] Visual timeline for roadmap")
print("  [*] KPI dashboard with progress bars")
print("  [*] Decorative elements and accents")
print("  [*] Professional multi-column layout")
print("\n" + "-"*80 + "\n")

# Close existing document
try:
    cmd("closeDocument", {"saveChanges": False})
except:
    pass

print("Step 1: Creating document...")
cmd("createDocument", {
    "pageWidth": 595,
    "pageHeight": 842,
    "pagesPerDocument": 2,
    "margins": {"top": 50, "bottom": 50, "left": 40, "right": 40}
})

# =============================================================================
# PAGE 1 - ULTRA-ENHANCED DESIGN
# =============================================================================

print("Step 2: Building enhanced header...")

# Main header background
cmd("createRectangle", {"page": 1, "x": 0, "y": 0, "width": 595, "height": 140, "fillColor": TEAL})

# Decorative gold accent bars on header
cmd("createRectangle", {"page": 1, "x": 0, "y": 135, "width": 200, "height": 5, "fillColor": GOLD})
cmd("createRectangle", {"page": 1, "x": 220, "y": 135, "width": 150, "height": 5, "fillColor": GOLD})
cmd("createRectangle", {"page": 1, "x": 390, "y": 135, "width": 205, "height": 5, "fillColor": GOLD})

# Corner accent - top right
cmd("createRectangle", {"page": 1, "x": 565, "y": 0, "width": 30, "height": 4, "fillColor": GOLD})
cmd("createRectangle", {"page": 1, "x": 591, "y": 0, "width": 4, "height": 30, "fillColor": GOLD})

# Logo placeholder with border
cmd("createRectangle", {"page": 1, "x": 40, "y": 25, "width": 70, "height": 70, "fillColor": WHITE, "strokeColor": GOLD, "strokeWeight": 2})

# Title
cmd("placeText", {
    "page": 1, "x": 130, "y": 30, "width": 430, "height": 45,
    "content": "THE EDUCATIONAL\nEQUALITY INSTITUTE",
    "style": "H1",
    "options": {
        "fontSize": 24,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Bold",
        "fillColor": WHITE,
        "leading": 26,
        "tracking": 20
    }
})

# Tagline
cmd("placeText", {
    "page": 1, "x": 130, "y": 85, "width": 430, "height": 30,
    "content": "Transforming Lives Through Technology-Enabled Education",
    "style": "H3",
    "options": {
        "fontSize": 13,
        "fontFamily": "Georgia",
        "fontStyle": "Italic",
        "fillColor": LIGHT_BG
    }
})

print("Step 3: Building AWS partnership section...")

# Section title with decorative line
cmd("createLine", {"page": 1, "x1": 40, "y1": 175, "x2": 40, "y2": 195, "strokeColor": GOLD, "strokeWeight": 4})

cmd("placeText", {
    "page": 1, "x": 55, "y": 170, "width": 500, "height": 30,
    "content": "STRATEGIC ALLIANCE WITH AMAZON WEB SERVICES",
    "style": "H2",
    "options": {
        "fontSize": 18,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Bold",
        "fillColor": TEAL,
        "tracking": 60
    }
})

# Partnership description
cmd("placeText", {
    "page": 1, "x": 40, "y": 210, "width": 515, "height": 85,
    "content": "Our groundbreaking partnership with AWS enables us to deliver world-class educational experiences at unprecedented scale. By leveraging cloud infrastructure, artificial intelligence, and global distribution networks, we're democratizing access to quality education for underserved communities worldwide.",
    "style": "Body",
    "options": {
        "fontSize": 11,
        "fontFamily": "Minion Pro",
        "leading": 16,
        "fillColor": DARK_TEXT
    }
})

print("Step 4: Creating enhanced metrics with icons...")

# METRIC BOX 1 - Students (with simple person icon)
box1_x = 40
box1_y = 320

# Box
cmd("createRectangle", {
    "page": 1, "x": box1_x, "y": box1_y, "width": 120, "height": 130,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD,
    "strokeWeight": 2
})

# Simple "person" icon made from rectangles
icon_x = box1_x + 45
icon_y = box1_y + 15
cmd("createRectangle", {"page": 1, "x": icon_x, "y": icon_y, "width": 30, "height": 8, "fillColor": TEAL})  # Head
cmd("createRectangle", {"page": 1, "x": icon_x+10, "y": icon_y+10, "width": 10, "height": 20, "fillColor": TEAL})  # Body

# Number
cmd("placeText", {
    "page": 1, "x": box1_x+10, "y": box1_y+45, "width": 100, "height": 30,
    "content": "15,000+",
    "style": "H2",
    "options": {"fontSize": 26, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "justification": "CENTER_ALIGN"}
})

# Label
cmd("placeText", {
    "page": 1, "x": box1_x+10, "y": box1_y+75, "width": 100, "height": 30,
    "content": "Students\nEmpowered",
    "style": "Body",
    "options": {"fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Medium", "fillColor": DARK_TEXT, "justification": "CENTER_ALIGN", "leading": 13}
})

# Detail
cmd("placeText", {
    "page": 1, "x": box1_x+10, "y": box1_y+105, "width": 100, "height": 20,
    "content": "Across 25 countries",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": MED_GRAY, "justification": "CENTER_ALIGN"}
})

# METRIC BOX 2 - Mentors (with graduation cap icon)
box2_x = 180
box2_y = 320

cmd("createRectangle", {
    "page": 1, "x": box2_x, "y": box2_y, "width": 120, "height": 130,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD,
    "strokeWeight": 2
})

# "Graduation cap" icon
icon_x = box2_x + 42
icon_y = box2_y + 15
cmd("createRectangle", {"page": 1, "x": icon_x, "y": icon_y+5, "width": 36, "height": 12, "fillColor": TEAL})  # Cap top
cmd("createRectangle", {"page": 1, "x": icon_x+15, "y": icon_y+17, "width": 6, "height": 12, "fillColor": TEAL})  # Tassel

cmd("placeText", {
    "page": 1, "x": box2_x+10, "y": box2_y+45, "width": 100, "height": 30,
    "content": "3,200+",
    "style": "H2",
    "options": {"fontSize": 26, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 1, "x": box2_x+10, "y": box2_y+75, "width": 100, "height": 30,
    "content": "Expert\nMentors",
    "style": "Body",
    "options": {"fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Medium", "fillColor": DARK_TEXT, "justification": "CENTER_ALIGN", "leading": 13}
})

cmd("placeText", {
    "page": 1, "x": box2_x+10, "y": box2_y+105, "width": 100, "height": 20,
    "content": "Industry professionals",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": MED_GRAY, "justification": "CENTER_ALIGN"}
})

# METRIC BOX 3 - Success Rate (with checkmark icon)
box3_x = 320
box3_y = 320

cmd("createRectangle", {
    "page": 1, "x": box3_x, "y": box3_y, "width": 120, "height": 130,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD,
    "strokeWeight": 2
})

# "Checkmark" icon
icon_x = box3_x + 48
icon_y = box3_y + 15
cmd("createLine", {"page": 1, "x1": icon_x, "y1": icon_y+15, "x2": icon_x+10, "y2": icon_y+25, "strokeColor": TEAL, "strokeWeight": 5})
cmd("createLine", {"page": 1, "x1": icon_x+10, "y1": icon_y+25, "x2": icon_x+28, "y2": icon_y, "strokeColor": TEAL, "strokeWeight": 5})

cmd("placeText", {
    "page": 1, "x": box3_x+10, "y": box3_y+45, "width": 100, "height": 30,
    "content": "98%",
    "style": "H2",
    "options": {"fontSize": 26, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 1, "x": box3_x+10, "y": box3_y+75, "width": 100, "height": 30,
    "content": "Success\nRate",
    "style": "Body",
    "options": {"fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Medium", "fillColor": DARK_TEXT, "justification": "CENTER_ALIGN", "leading": 13}
})

cmd("placeText", {
    "page": 1, "x": box3_x+10, "y": box3_y+105, "width": 100, "height": 20,
    "content": "Course completion",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": MED_GRAY, "justification": "CENTER_ALIGN"}
})

# METRIC BOX 4 - Scholarships (with $ icon)
box4_x = 460
box4_y = 320

cmd("createRectangle", {
    "page": 1, "x": box4_x, "y": box4_y, "width": 120, "height": 130,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD,
    "strokeWeight": 2
})

# "$" icon simplified
icon_x = box4_x + 52
icon_y = box4_y + 15
cmd("createRectangle", {"page": 1, "x": icon_x, "y": icon_y, "width": 16, "height": 8, "fillColor": TEAL})
cmd("createRectangle", {"page": 1, "x": icon_x, "y": icon_y+16, "width": 16, "height": 8, "fillColor": TEAL})
cmd("createRectangle", {"page": 1, "x": icon_x+6, "y": icon_y-3, "width": 4, "height": 32, "fillColor": TEAL})

cmd("placeText", {
    "page": 1, "x": box4_x+10, "y": box4_y+45, "width": 100, "height": 30,
    "content": "$2.5M",
    "style": "H2",
    "options": {"fontSize": 26, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 1, "x": box4_x+10, "y": box4_y+75, "width": 100, "height": 30,
    "content": "Scholarships\nAwarded",
    "style": "Body",
    "options": {"fontSize": 11, "fontFamily": "Helvetica Neue", "fontStyle": "Medium", "fillColor": DARK_TEXT, "justification": "CENTER_ALIGN", "leading": 13}
})

cmd("placeText", {
    "page": 1, "x": box4_x+10, "y": box4_y+105, "width": 100, "height": 20,
    "content": "In 2024 alone",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": MED_GRAY, "justification": "CENTER_ALIGN"}
})

print("Step 5: Adding testimonial with decorative elements...")

# Decorative quote box background
cmd("createRectangle", {"page": 1, "x": 35, "y": 470, "width": 525, "height": 95, "fillColor": LIGHT_BG})

# Left decorative bar
cmd("createRectangle", {"page": 1, "x": 35, "y": 470, "width": 5, "height": 95, "fillColor": GOLD})

# Simplified quotation mark (geometric)
cmd("createRectangle", {"page": 1, "x": 50, "y": 480, "width": 12, "height": 12, "fillColor": TEAL})
cmd("createRectangle", {"page": 1, "x": 50, "y": 492, "width": 4, "height": 10, "fillColor": TEAL})

# Quote text
cmd("placeText", {
    "page": 1, "x": 75, "y": 478, "width": 470, "height": 60,
    "content": "\"The AWS partnership has been transformational. We've scaled from serving hundreds to tens of thousands of students while maintaining personalized learning experiences. This is the future of education.\"",
    "style": "Body",
    "options": {
        "fontSize": 11,
        "fontFamily": "Georgia",
        "fontStyle": "Italic",
        "fillColor": DARK_TEXT,
        "leading": 15
    }
})

# Attribution
cmd("placeText", {
    "page": 1, "x": 75, "y": 540, "width": 470, "height": 20,
    "content": "— Dr. Sarah Chen, CEO & Founder",
    "style": "Body",
    "options": {
        "fontSize": 10,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Bold",
        "fillColor": TEAL
    }
})

print("Step 6: Creating enhanced CTA...")

# CTA box with border accent
cmd("createRectangle", {"page": 1, "x": 35, "y": 585, "width": 525, "height": 80, "fillColor": GOLD})

# Top decorative line
cmd("createRectangle", {"page": 1, "x": 35, "y": 582, "width": 525, "height": 3, "fillColor": DARK_TEAL})

# Corner accents
cmd("createRectangle", {"page": 1, "x": 35, "y": 585, "width": 20, "height": 3, "fillColor": DARK_TEAL})
cmd("createRectangle", {"page": 1, "x": 540, "y": 585, "width": 20, "height": 3, "fillColor": DARK_TEAL})

cmd("placeText", {
    "page": 1, "x": 50, "y": 600, "width": 495, "height": 25,
    "content": "Partner With Us to Transform Education",
    "style": "H2",
    "options": {
        "fontSize": 20,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Bold",
        "fillColor": WHITE,
        "justification": "CENTER_ALIGN"
    }
})

cmd("placeText", {
    "page": 1, "x": 50, "y": 630, "width": 495, "height": 25,
    "content": "partnerships@teei.org  |  www.teei.org  |  1-800-EDU-TEEI",
    "style": "Body",
    "options": {
        "fontSize": 11,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Medium",
        "fillColor": DARK_TEAL,
        "justification": "CENTER_ALIGN"
    }
})

# Footer
cmd("createLine", {"page": 1, "x1": 40, "y1": 785, "x2": 555, "y2": 785, "strokeColor": TEAL, "strokeWeight": 0.5})
cmd("placeText", {
    "page": 1, "x": 40, "y": 795, "width": 515, "height": 20,
    "content": "© 2024 The Educational Equality Institute  |  Page 1 of 2  |  Strictly Confidential",
    "style": "Body",
    "options": {
        "fontSize": 8,
        "fontFamily": "Helvetica Neue",
        "fillColor": MED_GRAY,
        "justification": "CENTER_ALIGN"
    }
})

# =============================================================================
# PAGE 2 - ULTRA-ENHANCED WITH VISUAL TIMELINE & KPI DASHBOARD
# =============================================================================

print("Step 7: Building page 2 header...")

# Page 2 header
cmd("createRectangle", {"page": 2, "x": 0, "y": 0, "width": 595, "height": 60, "fillColor": DARK_TEAL})

# Decorative gold accents
cmd("createRectangle", {"page": 2, "x": 0, "y": 55, "width": 180, "height": 5, "fillColor": GOLD})
cmd("createRectangle", {"page": 2, "x": 200, "y": 55, "width": 395, "height": 5, "fillColor": GOLD})

cmd("placeText", {
    "page": 2, "x": 40, "y": 15, "width": 515, "height": 35,
    "content": "IMPLEMENTATION ROADMAP & SUCCESS METRICS",
    "style": "H1",
    "options": {
        "fontSize": 20,
        "fontFamily": "Helvetica Neue",
        "fontStyle": "Bold",
        "fillColor": WHITE,
        "tracking": 40
    }
})

print("Step 8: Creating visual timeline...")

# VISUAL TIMELINE - 3 phases
timeline_y = 85
phase_width = 160
phase_height = 130
phase_gap = 25

# Phase 1
phase1_x = 40
cmd("createRectangle", {
    "page": 2, "x": phase1_x, "y": timeline_y, "width": phase_width, "height": phase_height,
    "fillColor": LIGHT_BG,
    "strokeColor": TEAL,
    "strokeWeight": 3
})

# Phase number badge
cmd("createRectangle", {"page": 2, "x": phase1_x+5, "y": timeline_y+5, "width": 35, "height": 35, "fillColor": TEAL})
cmd("placeText", {
    "page": 2, "x": phase1_x+5, "y": timeline_y+5, "width": 35, "height": 35,
    "content": "1",
    "style": "H1",
    "options": {"fontSize": 24, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 2, "x": phase1_x+10, "y": timeline_y+48, "width": phase_width-20, "height": 20,
    "content": "FOUNDATION",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL}
})

cmd("placeText", {
    "page": 2, "x": phase1_x+10, "y": timeline_y+70, "width": phase_width-20, "height": 55,
    "content": "• AWS infrastructure\n• Data migration\n• Mentor training\n• Pilot launch",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": DARK_TEXT, "leading": 13}
})

# Connector arrow
arrow_x = phase1_x + phase_width
cmd("createLine", {"page": 2, "x1": arrow_x, "y1": timeline_y+65, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})
cmd("createLine", {"page": 2, "x1": arrow_x+phase_gap-8, "y1": timeline_y+60, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})
cmd("createLine", {"page": 2, "x1": arrow_x+phase_gap-8, "y1": timeline_y+70, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})

# Phase 2
phase2_x = phase1_x + phase_width + phase_gap
cmd("createRectangle", {
    "page": 2, "x": phase2_x, "y": timeline_y, "width": phase_width, "height": phase_height,
    "fillColor": LIGHT_BG,
    "strokeColor": TEAL,
    "strokeWeight": 3
})

cmd("createRectangle", {"page": 2, "x": phase2_x+5, "y": timeline_y+5, "width": 35, "height": 35, "fillColor": TEAL})
cmd("placeText", {
    "page": 2, "x": phase2_x+5, "y": timeline_y+5, "width": 35, "height": 35,
    "content": "2",
    "style": "H1",
    "options": {"fontSize": 24, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 2, "x": phase2_x+10, "y": timeline_y+48, "width": phase_width-20, "height": 20,
    "content": "SCALING",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL}
})

cmd("placeText", {
    "page": 2, "x": phase2_x+10, "y": timeline_y+70, "width": phase_width-20, "height": 55,
    "content": "• AI curriculum\n• 5 new regions\n• 500+ mentors\n• Mobile apps",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": DARK_TEXT, "leading": 13}
})

# Connector arrow
arrow_x = phase2_x + phase_width
cmd("createLine", {"page": 2, "x1": arrow_x, "y1": timeline_y+65, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})
cmd("createLine", {"page": 2, "x1": arrow_x+phase_gap-8, "y1": timeline_y+60, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})
cmd("createLine", {"page": 2, "x1": arrow_x+phase_gap-8, "y1": timeline_y+70, "x2": arrow_x+phase_gap, "y2": timeline_y+65, "strokeColor": GOLD, "strokeWeight": 3})

# Phase 3
phase3_x = phase2_x + phase_width + phase_gap
cmd("createRectangle", {
    "page": 2, "x": phase3_x, "y": timeline_y, "width": phase_width, "height": phase_height,
    "fillColor": LIGHT_BG,
    "strokeColor": GOLD,
    "strokeWeight": 3
})

cmd("createRectangle", {"page": 2, "x": phase3_x+5, "y": timeline_y+5, "width": 35, "height": 35, "fillColor": GOLD})
cmd("placeText", {
    "page": 2, "x": phase3_x+5, "y": timeline_y+5, "width": 35, "height": 35,
    "content": "3",
    "style": "H1",
    "options": {"fontSize": 24, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 2, "x": phase3_x+10, "y": timeline_y+48, "width": phase_width-20, "height": 20,
    "content": "OPTIMIZATION",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL}
})

cmd("placeText", {
    "page": 2, "x": phase3_x+10, "y": timeline_y+70, "width": phase_width-20, "height": 55,
    "content": "• ML refinement\n• Performance tuning\n• Global CDN\n• Analytics",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fillColor": DARK_TEXT, "leading": 13}
})

print("Step 9: Creating KPI dashboard with bar charts...")

# KPI Section Title
kpi_y = 240
cmd("createLine", {"page": 2, "x1": 40, "y1": kpi_y, "x2": 40, "y2": kpi_y+20, "strokeColor": GOLD, "strokeWeight": 4})
cmd("placeText", {
    "page": 2, "x": 55, "y": kpi_y-5, "width": 500, "height": 25,
    "content": "KEY PERFORMANCE INDICATORS",
    "style": "H2",
    "options": {"fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "tracking": 40}
})

# KPI Grid - 3 columns
kpi_start_y = kpi_y + 35
col_width = 165
col_gap = 20

# COLUMN 1 - Student Outcomes
col1_x = 40
cmd("createRectangle", {"page": 2, "x": col1_x, "y": kpi_start_y, "width": col_width, "height": 200, "fillColor": LIGHT_BG, "strokeColor": TEAL, "strokeWeight": 1})

# Header
cmd("createRectangle", {"page": 2, "x": col1_x, "y": kpi_start_y, "width": col_width, "height": 30, "fillColor": TEAL})
cmd("placeText", {
    "page": 2, "x": col1_x+10, "y": kpi_start_y+7, "width": col_width-20, "height": 20,
    "content": "Student Outcomes",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE}
})

# Bar chart 1 - Completion rate 98%
bar_y = kpi_start_y + 45
cmd("placeText", {
    "page": 2, "x": col1_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Course Completion: 98%",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
# Progress bar background
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
# Progress bar fill (98%)
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": int((col_width-20)*0.98), "height": 12, "fillColor": TEAL})

# Bar chart 2 - Learning speed 3.2x
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col1_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Learning Speed: 3.2x",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": int((col_width-20)*0.95), "height": 12, "fillColor": GOLD})

# Bar chart 3 - Job placement 87%
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col1_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Job Placement: 87%",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col1_x+10, "y": bar_y+18, "width": int((col_width-20)*0.87), "height": 12, "fillColor": TEAL})

# COLUMN 2 - Platform Metrics
col2_x = col1_x + col_width + col_gap
cmd("createRectangle", {"page": 2, "x": col2_x, "y": kpi_start_y, "width": col_width, "height": 200, "fillColor": LIGHT_BG, "strokeColor": TEAL, "strokeWeight": 1})

cmd("createRectangle", {"page": 2, "x": col2_x, "y": kpi_start_y, "width": col_width, "height": 30, "fillColor": TEAL})
cmd("placeText", {
    "page": 2, "x": col2_x+10, "y": kpi_start_y+7, "width": col_width-20, "height": 20,
    "content": "Platform Performance",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE}
})

# Uptime 99.99%
bar_y = kpi_start_y + 45
cmd("placeText", {
    "page": 2, "x": col2_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Uptime: 99.99%",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": GOLD})

# Response time
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col2_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Response: 50ms avg",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": int((col_width-20)*0.92), "height": 12, "fillColor": TEAL})

# Content delivery
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col2_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Content: 10TB daily",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col2_x+10, "y": bar_y+18, "width": int((col_width-20)*0.88), "height": 12, "fillColor": GOLD})

# COLUMN 3 - Financial Impact
col3_x = col2_x + col_width + col_gap
cmd("createRectangle", {"page": 2, "x": col3_x, "y": kpi_start_y, "width": col_width, "height": 200, "fillColor": LIGHT_BG, "strokeColor": GOLD, "strokeWeight": 1})

cmd("createRectangle", {"page": 2, "x": col3_x, "y": kpi_start_y, "width": col_width, "height": 30, "fillColor": GOLD})
cmd("placeText", {
    "page": 2, "x": col3_x+10, "y": kpi_start_y+7, "width": col_width-20, "height": 20,
    "content": "Financial Impact",
    "style": "H3",
    "options": {"fontSize": 13, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE}
})

# Cost reduction 70%
bar_y = kpi_start_y + 45
cmd("placeText", {
    "page": 2, "x": col3_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Cost Reduction: 70%",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": int((col_width-20)*0.70), "height": 12, "fillColor": TEAL})

# Capacity increase 5x
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col3_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "Capacity Increase: 5x",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": GOLD})

# ROI 200%
bar_y += 50
cmd("placeText", {
    "page": 2, "x": col3_x+10, "y": bar_y, "width": col_width-20, "height": 15,
    "content": "ROI: 200%",
    "style": "Body",
    "options": {"fontSize": 9, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": DARK_TEXT}
})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": WHITE, "strokeColor": MED_GRAY, "strokeWeight": 0.5})
cmd("createRectangle", {"page": 2, "x": col3_x+10, "y": bar_y+18, "width": col_width-20, "height": 12, "fillColor": TEAL})

print("Step 10: Adding partnership benefits section...")

# Partnership Benefits - Bottom section
benefits_y = 455
cmd("createRectangle", {"page": 2, "x": 40, "y": benefits_y, "width": 515, "height": 170, "fillColor": LIGHT_BG})

# Top accent bar
cmd("createRectangle", {"page": 2, "x": 40, "y": benefits_y, "width": 515, "height": 4, "fillColor": GOLD})

# Title
cmd("placeText", {
    "page": 2, "x": 50, "y": benefits_y+15, "width": 495, "height": 25,
    "content": "PARTNERSHIP SUCCESS FACTORS",
    "style": "H2",
    "options": {"fontSize": 15, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": TEAL, "tracking": 30}
})

# Two column layout
col_left_x = 50
col_right_x = 310

# Left column
benefit_y = benefits_y + 50
benefits_left = [
    "• Dedicated AWS solutions architect",
    "• 24/7 technical support",
    "• Priority access to new services",
    "• Custom infrastructure optimization",
    "• Joint marketing opportunities"
]

for benefit in benefits_left:
    cmd("placeText", {
        "page": 2, "x": col_left_x, "y": benefit_y, "width": 240, "height": 15,
        "content": benefit,
        "style": "Body",
        "options": {"fontSize": 10, "fontFamily": "Helvetica Neue", "fillColor": DARK_TEXT, "leading": 14}
    })
    benefit_y += 18

# Right column with decorative checkmarks
benefit_y = benefits_y + 50
benefits_right = [
    "• Quarterly business reviews",
    "• Training & certification support",
    "• Access to AWS research labs",
    "• Co-innovation opportunities",
    "• Global expansion assistance"
]

for benefit in benefits_right:
    # Small checkmark icon
    cmd("createRectangle", {"page": 2, "x": col_right_x, "y": benefit_y+2, "width": 8, "height": 8, "fillColor": GOLD})

    cmd("placeText", {
        "page": 2, "x": col_right_x+15, "y": benefit_y, "width": 220, "height": 15,
        "content": benefit[2:],  # Remove bullet
        "style": "Body",
        "options": {"fontSize": 10, "fontFamily": "Helvetica Neue", "fillColor": DARK_TEXT, "leading": 14}
    })
    benefit_y += 18

# Bottom CTA banner
cta_y = 640
cmd("createRectangle", {"page": 2, "x": 40, "y": cta_y, "width": 515, "height": 60, "fillColor": TEAL})

# Decorative corners
cmd("createRectangle", {"page": 2, "x": 40, "y": cta_y, "width": 3, "height": 20, "fillColor": GOLD})
cmd("createRectangle", {"page": 2, "x": 40, "y": cta_y, "width": 20, "height": 3, "fillColor": GOLD})
cmd("createRectangle", {"page": 2, "x": 552, "y": cta_y, "width": 3, "height": 20, "fillColor": GOLD})
cmd("createRectangle", {"page": 2, "x": 535, "y": cta_y, "width": 20, "height": 3, "fillColor": GOLD})

cmd("placeText", {
    "page": 2, "x": 50, "y": cta_y+12, "width": 495, "height": 20,
    "content": "Ready to Scale Your Impact?",
    "style": "H2",
    "options": {"fontSize": 16, "fontFamily": "Helvetica Neue", "fontStyle": "Bold", "fillColor": WHITE, "justification": "CENTER_ALIGN"}
})

cmd("placeText", {
    "page": 2, "x": 50, "y": cta_y+35, "width": 495, "height": 20,
    "content": "Contact: partnerships@teei.org  |  Schedule: calendly.com/teei-aws",
    "style": "Body",
    "options": {"fontSize": 10, "fontFamily": "Helvetica Neue", "fontStyle": "Medium", "fillColor": LIGHT_GOLD, "justification": "CENTER_ALIGN"}
})

# Page 2 Footer
cmd("createLine", {"page": 2, "x1": 40, "y1": 785, "x2": 555, "y2": 785, "strokeColor": TEAL, "strokeWeight": 0.5})
cmd("placeText", {
    "page": 2, "x": 40, "y": 795, "width": 515, "height": 20,
    "content": "© 2024 The Educational Equality Institute  |  Page 2 of 2  |  Strictly Confidential",
    "style": "Body",
    "options": {
        "fontSize": 8,
        "fontFamily": "Helvetica Neue",
        "fillColor": MED_GRAY,
        "justification": "CENTER_ALIGN"
    }
})

print("\nStep 11: Applying colors with fixed ExtendScript...")
time.sleep(2)

response = cmd("applyColorsViaExtendScript", {})

if response.get("response", {}).get("success") or response.get("status") == "SUCCESS":
    print("[SUCCESS] All colors applied!")
else:
    print(f"[WARNING] Color response: {response}")

print("\n" + "="*80)
print("*** ULTRA-ENHANCED DOCUMENT COMPLETE! ***")
print("="*80)

print("\nFeatures included:")
print("  [OK] Simulated icons for metrics")
print("  [OK] Bar charts for KPIs")
print("  [OK] Visual timeline with phases")
print("  [OK] Decorative elements throughout")
print("  [OK] Progress indicators")
print("  [OK] Multi-column layouts")
print("  [OK] Enhanced CTAs")
print("  [OK] Professional color coordination")

print("\n[EXPORT NOW]:")
print("  File -> Export -> Adobe PDF (Print)")
print("  Output tab: No Color Conversion + Include All Profiles")
print("\n" + "="*80)
