#!/usr/bin/env python3
"""
Together for Ukraine - SIMPLE WORKING VERSION
Uses correct fonts: Lora (headlines) and Roboto Flex (body)
Avoids buggy gradient commands
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
    response = sendCommand(createCommand(action, options))
    if response.get("status") != "SUCCESS":
        print(f"    [WARNING] {action}: {response.get('message')}")
    return response

print("\n" + "="*80)
print("TOGETHER FOR UKRAINE - SIMPLE WORKING VERSION")
print("Using TEEI Brand Fonts: Lora + Roboto Flex")
print("="*80 + "\n")

# Close any existing
try:
    cmd("closeDocument", {"save": "no"})
except:
    pass

# Create Letter size document (8.5 x 11 inches = 612 x 792 points)
print("Creating Letter size document...")
cmd("createDocument", {
    "pageWidth": 612,
    "pageHeight": 792,
    "pagesPerDocument": 4,
    "pagesFacing": False,
    "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
    "name": "Together_for_Ukraine",
    "units": "pt"
})

# Set up typography with CORRECT fonts
print("Setting up TEEI typography (Lora + Roboto Flex)...")
cmd("setStyles", {
    "paragraph": [
        {"name": "Cover Title", "spec": {"fontSize": 56, "fontFamily": "Lora\tRegular", "leading": 64, "spaceAfter": 20}},
        {"name": "Section Header", "spec": {"fontSize": 32, "fontFamily": "Lora\tBold", "leading": 38, "spaceAfter": 16}},
        {"name": "Subhead", "spec": {"fontSize": 18, "fontFamily": "Lora\tSemiBold", "leading": 24, "spaceAfter": 12}},
        {"name": "Body Text", "spec": {"fontSize": 11, "fontFamily": "Roboto Flex\tRegular", "leading": 18, "spaceAfter": 10}},
        {"name": "Small Caps", "spec": {"fontSize": 12, "fontFamily": "Roboto Flex\tMedium", "leading": 16, "tracking": 50, "capitalization": "ALL_CAPS"}},
    ]
})

print("\nPage 1: COVER PAGE")
print("-" * 80)

# Nordshore background (full page)
print("  Creating Nordshore background...")
cmd("createRectangle", {
    "page": 1,
    "x": 0,
    "y": 0,
    "width": 612,
    "height": 792,
    "fillColor": {"red": 0, "green": 57, "blue": 63}  # Nordshore #00393F
})

# Together for UKRAINE logo area
print("  Creating logo...")
cmd("createRectangle", {
    "page": 1,
    "x": 100,
    "y": 200,
    "width": 250,
    "height": 80,
    "fillColor": {"red": 65, "green": 105, "blue": 225}  # Blue
})

cmd("placeText", {
    "page": 1,
    "x": 110,
    "y": 210,
    "width": 230,
    "height": 30,
    "content": "Together for",
    "style": "Body Text"
})

# Ukraine yellow box
cmd("createRectangle", {
    "page": 1,
    "x": 140,
    "y": 250,
    "width": 180,
    "height": 50,
    "fillColor": {"red": 255, "green": 215, "blue": 0}  # Ukraine yellow #FFD700
})

cmd("placeText", {
    "page": 1,
    "x": 150,
    "y": 258,
    "width": 160,
    "height": 40,
    "content": "UKRAINE",
    "style": "Section Header"
})

# Main title
print("  Adding main title...")
cmd("placeText", {
    "page": 1,
    "x": 80,
    "y": 500,
    "width": 450,
    "height": 150,
    "content": "Female\nEntrepreneurship\nProgram",
    "style": "Cover Title"
})

# TEEI logo text at bottom
cmd("placeText", {
    "page": 1,
    "x": 380,
    "y": 720,
    "width": 200,
    "height": 50,
    "content": "EDUCATIONAL\nEQUALITY\nINSTITUTE",
    "style": "Small Caps"
})

print("\nPage 2: PROGRAM OVERVIEW")
print("-" * 80)

# Header bar
cmd("createRectangle", {
    "page": 2,
    "x": 0,
    "y": 40,
    "width": 612,
    "height": 50,
    "fillColor": {"red": 248, "green": 250, "blue": 252}  # Light background
})

cmd("placeText", {
    "page": 2,
    "x": 60,
    "y": 52,
    "width": 500,
    "height": 30,
    "content": "TOGETHER FOR UKRAINE",
    "style": "Small Caps"
})

# Section title
cmd("placeText", {
    "page": 2,
    "x": 60,
    "y": 120,
    "width": 490,
    "height": 50,
    "content": "Female Entrepreneurship Program",
    "style": "Section Header"
})

# Subtitle
cmd("placeText", {
    "page": 2,
    "x": 60,
    "y": 180,
    "width": 490,
    "height": 35,
    "content": "The Women's Entrepreneurship and Empowerment Initiative (WEEI)",
    "style": "Subhead"
})

# Body text
body1 = """The Women's Entrepreneurship and Empowerment Initiative (WEEI) aims to foster the growth and development of Ukrainian women entrepreneurs through a comprehensive and tailored program focusing on impact and sustainable entrepreneurship.

A crucial element WEEI is its emphasis on technology, partnerships and collaboration. By working closely with local and international organisations, private sector partners, and educational institutions, WEEI leverages a diverse network of resources and expertise."""

cmd("placeText", {
    "page": 2,
    "x": 60,
    "y": 230,
    "width": 490,
    "height": 180,
    "content": body1,
    "style": "Body Text"
})

# Program cards with gold accent bars
programs = [
    ("U:LEARN", "Individual Entrepreneurship Training for Women", 440),
    ("U:START", "Women's MVP Incubator", 500),
    ("U:GROW", "Female Startup Accelerator", 560),
    ("U:LEAD", "Female Leadership Program", 620),
]

print("  Creating program cards...")
for code, title, y in programs:
    # Gold accent bar
    cmd("createRectangle", {
        "page": 2,
        "x": 60,
        "y": y,
        "width": 8,
        "height": 45,
        "fillColor": {"red": 186, "green": 143, "blue": 90}  # Gold #BA8F5A
    })

    # Program code
    cmd("placeText", {
        "page": 2,
        "x": 80,
        "y": y + 5,
        "width": 100,
        "height": 20,
        "content": code,
        "style": "Subhead"
    })

    # Program title
    cmd("placeText", {
        "page": 2,
        "x": 80,
        "y": y + 25,
        "width": 450,
        "height": 18,
        "content": title,
        "style": "Body Text"
    })

print("\nPage 3: BACKGROUND & MISSION")
print("-" * 80)

# Header bar
cmd("createRectangle", {
    "page": 3,
    "x": 0,
    "y": 40,
    "width": 612,
    "height": 50,
    "fillColor": {"red": 248, "green": 250, "blue": 252}
})

cmd("placeText", {
    "page": 3,
    "x": 60,
    "y": 52,
    "width": 500,
    "height": 30,
    "content": "TOGETHER FOR UKRAINE",
    "style": "Small Caps"
})

# Background section with gold bar
cmd("createRectangle", {
    "page": 3,
    "x": 60,
    "y": 120,
    "width": 8,
    "height": 280,
    "fillColor": {"red": 186, "green": 143, "blue": 90}
})

cmd("placeText", {
    "page": 3,
    "x": 80,
    "y": 120,
    "width": 470,
    "height": 40,
    "content": "Background",
    "style": "Section Header"
})

bg_text = """As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022, that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education becoming a vital element of the survival kit in exile.

The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on its demographics. As Ukrainian men are engaged in the military, women face the need to step up and take over management roles in the most challenging economic environment.

As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical upskilling, soft-skills training, career coaching, and active language training among women."""

cmd("placeText", {
    "page": 3,
    "x": 80,
    "y": 170,
    "width": 470,
    "height": 220,
    "content": bg_text,
    "style": "Body Text"
})

# Mission section
cmd("createRectangle", {
    "page": 3,
    "x": 60,
    "y": 420,
    "width": 8,
    "height": 180,
    "fillColor": {"red": 186, "green": 143, "blue": 90}
})

cmd("placeText", {
    "page": 3,
    "x": 80,
    "y": 420,
    "width": 470,
    "height": 40,
    "content": "Mission",
    "style": "Section Header"
})

mission_text = """Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and support to women in business, from new ventures to established small businesses and startups."""

cmd("placeText", {
    "page": 3,
    "x": 80,
    "y": 470,
    "width": 470,
    "height": 120,
    "content": mission_text,
    "style": "Body Text"
})

print("\nPage 4: BACK COVER - PARTNERSHIP CTA")
print("-" * 80)

# Nordshore background
cmd("createRectangle", {
    "page": 4,
    "x": 0,
    "y": 0,
    "width": 612,
    "height": 792,
    "fillColor": {"red": 0, "green": 57, "blue": 63}
})

# Logo at top center
cmd("createRectangle", {
    "page": 4,
    "x": 180,
    "y": 120,
    "width": 250,
    "height": 80,
    "fillColor": {"red": 65, "green": 105, "blue": 225}
})

cmd("placeText", {
    "page": 4,
    "x": 190,
    "y": 130,
    "width": 230,
    "height": 30,
    "content": "Together for",
    "style": "Body Text"
})

cmd("createRectangle", {
    "page": 4,
    "x": 220,
    "y": 170,
    "width": 180,
    "height": 45,
    "fillColor": {"red": 255, "green": 215, "blue": 0}
})

cmd("placeText", {
    "page": 4,
    "x": 230,
    "y": 178,
    "width": 160,
    "height": 35,
    "content": "UKRAINE",
    "style": "Section Header"
})

# CTA text
cmd("placeText", {
    "page": 4,
    "x": 80,
    "y": 280,
    "width": 450,
    "height": 100,
    "content": "We are looking for more partners and\nsupporters to work with us.",
    "style": "Section Header"
})

cmd("placeText", {
    "page": 4,
    "x": 80,
    "y": 390,
    "width": 450,
    "height": 50,
    "content": "Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.",
    "style": "Body Text"
})

# Partner names (simple text-based)
print("  Adding partner logos (text)...")
partners = [
    ("Google", 100, 480),
    ("Kintell", 240, 480),
    ("+Babbel", 380, 480),
    ("Sanoma", 100, 530),
    ("Oxford UP", 240, 530),
    ("AWS", 380, 530),
    ("Cornell", 100, 580),
    ("INCO", 240, 580),
    ("Bain & Co", 380, 580),
]

for partner, x, y in partners:
    # Dark card
    cmd("createRectangle", {
        "page": 4,
        "x": x,
        "y": y,
        "width": 120,
        "height": 35,
        "fillColor": {"red": 0, "green": 47, "blue": 53},
        "opacity": 80
    })

    # Partner name
    cmd("placeText", {
        "page": 4,
        "x": x + 10,
        "y": y + 10,
        "width": 100,
        "height": 20,
        "content": partner,
        "style": "Body Text"
    })

# Contact info
cmd("placeText", {
    "page": 4,
    "x": 100,
    "y": 680,
    "width": 410,
    "height": 30,
    "content": "Phone: +47 919 08 939 | Email: contact@theeducationalequalityinstitute.org",
    "style": "Body Text"
})

# TEEI logo
cmd("placeText", {
    "page": 4,
    "x": 220,
    "y": 730,
    "width": 170,
    "height": 40,
    "content": "EDUCATIONAL EQUALITY INSTITUTE",
    "style": "Small Caps"
})

print("\n" + "="*80)
print("DOCUMENT CREATED SUCCESSFULLY!")
print("="*80)
print("\nCheck InDesign - you should now see:")
print("  Page 1: Dark teal cover with Together for UKRAINE logo")
print("  Page 2: Program overview with 4 cards + gold accent bars")
print("  Page 3: Background & Mission with gold sidebar")
print("  Page 4: Dark teal back cover with partner grid")
print("\nNow export manually:")
print("  File → Export → Adobe PDF (Print)")
print("  Save as: ukraine-indesign-WORKING.pdf")
print("\n" + "="*80)
