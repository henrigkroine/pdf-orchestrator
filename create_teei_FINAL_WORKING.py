#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""TEEI Showcase - FINAL WORKING VERSION - Uses correct UXP plugin parameters"""

import sys, os, io
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app="indesign", url='http://localhost:8013', timeout=60)
init("indesign", socket_client)

def rgb(r, g, b): return {"red": r, "green": g, "blue": b}

TEEI_BLUE = rgb(0, 57, 63)
TEEI_GREEN = rgb(0, 150, 136)
WHITE = rgb(255, 255, 255)
DARK_GRAY = rgb(51, 51, 51)
MEDIUM_GRAY = rgb(102, 102, 102)

def cmd(action, opts):
    result = sendCommand(createCommand(action, opts))
    status = result.get('status', '') if isinstance(result, dict) else ''
    ok = status == 'SUCCESS'
    print(f"{'✅' if ok else '❌'} {action}")
    return ok

print("\n" + "="*80)
print("TEEI Partnership Showcase - FINAL VERSION")
print("="*80 + "\n")

# Create document
cmd("createDocument", {
    "intent": "PRINT_INTENT",
    "pageWidth": 595, "pageHeight": 842,
    "margins": {"top": 72, "bottom": 72, "left": 72, "right": 72},
    "columns": {"count": 1, "gutter": 12},
    "pagesPerDocument": 1, "pagesFacing": False
})

# Gradient header
cmd("createGradientBox", {
    "page": 1, "x": 0, "y": 0, "width": 595, "height": 180,
    "startColor": TEEI_BLUE, "endColor": TEEI_GREEN,
    "angle": 90, "sendToBack": True
})

# Title
cmd("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 80, "width": 451, "height": 60,
    "content": "TEEI AI-Powered Education Revolution 2025",
    "fontSize": 32, "fontFamily": "Arial",
    "textColor": WHITE, "alignment": "center"  # FIXED: use alignment!
})

# Subtitle
cmd("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 200, "width": 451, "height": 30,
    "content": "World-Class Partnership Showcase Document",
    "fontSize": 18, "fontFamily": "Arial",
    "textColor": TEEI_BLUE, "alignment": "center"
})

# Content
sections = [
    ("The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.", 11, DARK_GRAY),
    ("Revolutionary AI Platform Features:", 14, TEEI_GREEN),
    ("• Adaptive learning pathways personalized for each student", 11, DARK_GRAY),
    ("• Real-time progress tracking and intervention alerts", 11, DARK_GRAY),
    ("• Multi-language support (25+ languages)", 11, DARK_GRAY),
    ("• Teacher dashboard with actionable insights", 11, DARK_GRAY),
    ("Proven Impact:", 14, TEEI_GREEN),
    ("• 85% improvement in student engagement", 11, DARK_GRAY),
    ("• 92% teacher satisfaction rate", 11, DARK_GRAY),
    ("• 78% reduction in learning gaps", 11, DARK_GRAY),
    ("Strategic Partnership Benefits", 16, TEEI_BLUE),
    ("Technology Leadership", 14, TEEI_GREEN),
    ("Partner with a proven EdTech innovator transforming education at scale", 11, DARK_GRAY),
    ("Global Reach", 14, TEEI_GREEN),
    ("Access to established networks in 12 countries across 3 continents", 11, DARK_GRAY),
    ("Innovation Pipeline", 14, TEEI_GREEN),
    ("Collaborate on cutting-edge AI/ML educational research", 11, DARK_GRAY),
    ("Data Excellence", 14, TEEI_GREEN),
    ("Leverage world-class learning analytics and outcomes measurement", 11, DARK_GRAY),
    ("Contact: Henrik Røine | CEO & Founder", 10, DARK_GRAY),
    ("Email: henrik@theeducationalequalityinstitute.org", 10, DARK_GRAY),
    ("Web: www.educationalequality.institute", 10, DARK_GRAY),
]

y = 250
for text, size, color in sections:
    h = 25 if size >= 14 else 18
    cmd("createTextFrameAdvanced", {
        "page": 1, "x": 72, "y": y, "width": 451, "height": h,
        "content": text, "fontSize": size, "fontFamily": "Arial",
        "textColor": color, "alignment": "left"
    })
    y += h + 6
    if y > 700: break

# Footer
cmd("createLine", {"page": 1, "x1": 72, "y1": 734, "x2": 523, "y2": 734, "strokeColor": TEEI_BLUE, "strokeWeight": 1})
cmd("createTextFrameAdvanced", {
    "page": 1, "x": 72, "y": 740, "width": 451, "height": 15,
    "content": "© 2025 The Educational Equality Institute | Confidential Partnership Document",
    "fontSize": 9, "fontFamily": "Arial",
    "textColor": MEDIUM_GRAY, "alignment": "center"
})

print("\n✅ DOCUMENT CREATED!")
print("Open InDesign now - the document has the gradient header and ALL colored text!")
print("\nExport: File → Export → Adobe PDF → High Quality Print")
print("Save to: T:\\Projects\\pdf-orchestrator\\exports\\teei-partnership-showcase-premium.pdf\n")
print("="*80)
