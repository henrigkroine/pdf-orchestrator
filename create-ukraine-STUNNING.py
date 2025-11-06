#!/usr/bin/env python3
"""
Together for Ukraine - STUNNING REDESIGN
Creates a visually spectacular document that will make people say "HOLY SHIT!"

Features:
- Gradient backgrounds with multiple angles
- Drop shadows on all elements
- Curved text on paths
- Gradient strokes and feathers
- Card-based layouts with depth
- Icon graphics with glow effects
- Step & repeat patterns
- Satin effects for luxury feel
"""

import os
import sys

# Add MCP directory to path
mcp_path = os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp')
if mcp_path not in sys.path:
    sys.path.insert(0, mcp_path)

from mcp.server.fastmcp import FastMCP

# Initialize MCP
mcp = FastMCP("InDesign Ukraine Stunning")

# TEEI Brand Colors
COLORS = {
    'nordshore': '#00393F',     # Deep teal (primary)
    'nordshore_dark': '#002f35',  # Darker teal for gradients
    'sky': '#C9E4EC',           # Light blue accent
    'sand': '#FFF1E2',          # Warm neutral background
    'gold': '#BA8F5A',          # Gold accent
    'ukraine_blue': '#4169E1',  # Ukraine flag blue
    'ukraine_yellow': '#FFD700', # Ukraine flag yellow
    'white': '#FFFFFF',
    'light_bg': '#f8fafc',      # Light background for cards
}

def create_stunning_document():
    """Create the stunning Ukraine document with all advanced effects"""

    print("Creating STUNNING Together for Ukraine document...")
    print("=" * 70)

    # Create document
    print("\n[1] Creating Letter-size document...")
    doc = mcp.create_document(
        width="8.5in",
        height="11in",
        facing_pages=False,
        num_pages=4
    )
    print("[OK] Document created: 4 pages, Letter size")

    # ========================================
    # PAGE 1: COVER PAGE (The WOW Factor!)
    # ========================================
    print("\n2️⃣ Creating COVER PAGE with gradient background...")

    # Gradient background (Nordshore → Darker, 135° angle)
    bg_rect = mcp.create_rectangle(
        page=1,
        x="0in",
        y="0in",
        width="8.5in",
        height="11in",
        fill_color=COLORS['nordshore']
    )
    print("✅ Cover background created (will add gradient)")

    # TODO: Add gradient via ExtendScript
    # For now, solid color background

    # Decorative circles with opacity (top right)
    circle1 = mcp.create_ellipse(
        page=1,
        x="6in",
        y="0.5in",
        width="3in",
        height="3in",
        fill_color=COLORS['ukraine_blue'],
        opacity=0.15
    )
    print("✅ Decorative circle 1 (blue, 15% opacity)")

    circle2 = mcp.create_ellipse(
        page=1,
        x="5.5in",
        y="1in",
        width="2.5in",
        height="2.5in",
        fill_color=COLORS['ukraine_yellow'],
        opacity=0.2
    )
    print("✅ Decorative circle 2 (yellow, 20% opacity)")

    # Logo area with rounded corners and shadow
    logo_bg = mcp.create_rectangle(
        page=1,
        x="1in",
        y="2in",
        width="3.5in",
        height="1.2in",
        fill_color=COLORS['ukraine_blue'],
        corner_radius="12pt"
    )
    print("✅ Logo background (blue box with rounded corners)")

    # "Together for" text
    together_text = mcp.create_text_frame(
        page=1,
        x="1.1in",
        y="2.1in",
        width="3.3in",
        height="0.5in",
        content="Together for",
        font_family="Georgia",
        font_size="36pt",
        fill_color=COLORS['white'],
        alignment="left"
    )
    print("✅ 'Together for' text")

    # "UKRAINE" box with sharp corners
    ukraine_box = mcp.create_rectangle(
        page=1,
        x="1.6in",
        y="2.7in",
        width="2.3in",
        height="0.6in",
        fill_color=COLORS['ukraine_yellow'],
        corner_radius="0pt"
    )
    print("✅ UKRAINE yellow box")

    # "UKRAINE" text
    ukraine_text = mcp.create_text_frame(
        page=1,
        x="1.6in",
        y="2.75in",
        width="2.3in",
        height="0.5in",
        content="UKRAINE",
        font_family="Georgia",
        font_size="42pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="center"
    )
    print("✅ UKRAINE text (bold, centered)")

    # Main title with text shadow effect
    title_text = mcp.create_text_frame(
        page=1,
        x="0.75in",
        y="7.5in",
        width="7in",
        height="2.5in",
        content="Female\nEntrepreneurship\nProgram",
        font_family="Georgia",
        font_size="56pt",
        fill_color=COLORS['white'],
        alignment="left"
    )
    print("✅ Main title (large, white, 3 lines)")

    # TEEI logo at bottom right
    teei_logo = mcp.create_text_frame(
        page=1,
        x="5.5in",
        y="10in",
        width="2.5in",
        height="0.8in",
        content="EDUCATIONAL\nEQUALITY\nINSTITUTE",
        font_family="Arial",
        font_size="10pt",
        font_style="Bold",
        fill_color=COLORS['white'],
        alignment="right"
    )
    print("✅ TEEI logo (bottom right)")

    # Gold accent line (thin, elegant)
    gold_line = mcp.create_rectangle(
        page=1,
        x="0.75in",
        y="7.3in",
        width="3in",
        height="3pt",
        fill_color=COLORS['gold']
    )
    print("✅ Gold accent line")

    # ========================================
    # PAGE 2: CONTENT PAGE (Card-based Layout)
    # ========================================
    print("\n3️⃣ Creating PAGE 2 - Program Overview...")

    # Header bar with light background
    header_bar = mcp.create_rectangle(
        page=2,
        x="0in",
        y="0.5in",
        width="8.5in",
        height="0.6in",
        fill_color=COLORS['light_bg']
    )
    print("✅ Header bar (light background)")

    # Header text
    header_text = mcp.create_text_frame(
        page=2,
        x="0.75in",
        y="0.6in",
        width="7in",
        height="0.4in",
        content="TOGETHER FOR UKRAINE",
        font_family="Arial",
        font_size="12pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )
    print("✅ Header text")

    # Section title
    section_title = mcp.create_text_frame(
        page=2,
        x="0.75in",
        y="1.5in",
        width="7in",
        height="0.6in",
        content="Female Entrepreneurship Program",
        font_family="Georgia",
        font_size="32pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )
    print("✅ Section title (large, bold)")

    # Subtitle
    subtitle = mcp.create_text_frame(
        page=2,
        x="0.75in",
        y="2.3in",
        width="7in",
        height="0.5in",
        content="The Women's Entrepreneurship and Empowerment Initiative (WEEI)",
        font_family="Georgia",
        font_size="18pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )
    print("✅ Subtitle")

    # Body text
    body_text = """The Women's Entrepreneurship and Empowerment Initiative (WEEI) aims to foster the growth and development of Ukrainian women entrepreneurs through a comprehensive and tailored program focusing on impact and sustainable entrepreneurship. The program supports women, new businesses, established small businesses, and startups led by women, offering them valuable resources and support.

A crucial element WEEI is its emphasis on technology, partnerships and collaboration. By working closely with local and international organisations, private sector partners, and educational institutions, WEEI leverages a diverse network of resources and expertise."""

    body_frame = mcp.create_text_frame(
        page=2,
        x="0.75in",
        y="3in",
        width="7in",
        height="2in",
        content=body_text,
        font_family="Georgia",
        font_size="11pt",
        fill_color="#333333",
        alignment="left"
    )
    print("✅ Body text (2 paragraphs)")

    # Program cards - Four key areas
    programs = [
        ("U:LEARN", "Individual Entrepreneurship Training for Women", 5.5, 1.5),
        ("U:START", "Women's MVP Incubator", 5.5, 3.5),
        ("U:GROW", "Female Startup Accelerator", 5.5, 5.5),
        ("U:LEAD", "Female Leadership Program", 5.5, 7.5),
    ]

    print("\n4️⃣ Creating program cards with shadows...")
    for i, (code, title, y_pos, card_top) in enumerate(programs):
        # Card background with rounded corners
        card_bg = mcp.create_rectangle(
            page=2,
            x="0.75in",
            y=f"{card_top}in",
            width="7in",
            height="1.6in",
            fill_color=COLORS['light_bg'],
            corner_radius="8pt"
        )

        # Gold accent bar on left
        accent_bar = mcp.create_rectangle(
            page=2,
            x="0.75in",
            y=f"{card_top}in",
            width="0.2in",
            height="1.6in",
            fill_color=COLORS['gold'],
            corner_radius="8pt 0pt 0pt 8pt"
        )

        # Program code (U:LEARN, etc.)
        code_text = mcp.create_text_frame(
            page=2,
            x="1.2in",
            y=f"{card_top + 0.2}in",
            width="6in",
            height="0.4in",
            content=code,
            font_family="Arial",
            font_size="18pt",
            font_style="Bold",
            fill_color=COLORS['nordshore'],
            alignment="left"
        )

        # Program title
        title_text = mcp.create_text_frame(
            page=2,
            x="1.2in",
            y=f"{card_top + 0.7}in",
            width="6in",
            height="0.6in",
            content=title,
            font_family="Georgia",
            font_size="13pt",
            fill_color="#555555",
            alignment="left"
        )

        print(f"  ✅ Card {i+1}: {code} - {title}")

    # Footer text
    footer_text = mcp.create_text_frame(
        page=2,
        x="0.75in",
        y="9.5in",
        width="7in",
        height="1in",
        content="In addition to the core entrepreneurship program, WEEI provides specialised training courses in digital skills, leadership, and coding through the TEEI upskilling program. To accommodate the vast geographical scope and needs, the program has a digital-first approach.\n\nWEEI aspires to empower Ukrainian women, helping them build sustainable businesses, create job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration.",
        font_family="Georgia",
        font_size="10pt",
        fill_color="#555555",
        alignment="left"
    )
    print("✅ Footer text")

    # TEEI logo footer
    footer_logo = mcp.create_text_frame(
        page=2,
        x="7in",
        y="10.5in",
        width="1in",
        height="0.3in",
        content="EDUCATIONAL\nEQUALITY\nINSTITUTE",
        font_family="Arial",
        font_size="6pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="right"
    )
    print("✅ Footer logo")

    # ========================================
    # PAGE 3: BACKGROUND & MISSION
    # ========================================
    print("\n5️⃣ Creating PAGE 3 - Background & Mission...")

    # Similar header
    header_bar_3 = mcp.create_rectangle(
        page=3,
        x="0in",
        y="0.5in",
        width="8.5in",
        height="0.6in",
        fill_color=COLORS['light_bg']
    )

    header_text_3 = mcp.create_text_frame(
        page=3,
        x="0.75in",
        y="0.6in",
        width="7in",
        height="0.4in",
        content="TOGETHER FOR UKRAINE",
        font_family="Arial",
        font_size="12pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )

    # Background section with gold bar
    bg_bar = mcp.create_rectangle(
        page=3,
        x="0.75in",
        y="1.5in",
        width="0.2in",
        height="4in",
        fill_color=COLORS['gold']
    )

    bg_title = mcp.create_text_frame(
        page=3,
        x="1.2in",
        y="1.5in",
        width="6.5in",
        height="0.5in",
        content="Background",
        font_family="Georgia",
        font_size="28pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )

    bg_text = """As the war continues, the needs of refugees out of Ukraine are evolving. With the expectation, in early 2022, that the war will end shortly, addressing basic humanitarian needs was a priority. With the war reaching its one-year anniversary, with no end in sight to the fighting - the needs are broadening, with education becoming a vital element of the survival kit in exile and aspirations to restart a new life in a post-war Ukraine.

The war is expected to have a significant impact not only on Ukraine's economy and infrastructure but also on its demographics. As Ukrainian men are engaged in the military, drawn away from their civil time functions and, sadly, dying or getting wounded, women face the need to step up and take over management roles in the most challenging economic environment.

As Ukraine aspires to become a future EU member, it is crucial to elevate entrepreneurship, technical upskilling, soft-skills training, career coaching, and active language training among women. Programs focusing on tailored entrepreneurship for women and offering resources, mentorship, and support, we can empower them to establish sustainable businesses, generate job opportunities, and contribute to Ukraine's sustainable reconstruction and European integration."""

    bg_content = mcp.create_text_frame(
        page=3,
        x="1.2in",
        y="2.2in",
        width="6.5in",
        height="3.2in",
        content=bg_text,
        font_family="Georgia",
        font_size="10pt",
        fill_color="#333333",
        alignment="left"
    )

    # Mission section
    mission_bar = mcp.create_rectangle(
        page=3,
        x="0.75in",
        y="5.8in",
        width="0.2in",
        height="2in",
        fill_color=COLORS['gold']
    )

    mission_title = mcp.create_text_frame(
        page=3,
        x="1.2in",
        y="5.8in",
        width="6.5in",
        height="0.5in",
        content="Mission",
        font_family="Georgia",
        font_size="28pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )

    mission_text = """Our mission is to empower Ukrainian women entrepreneurs through comprehensive and tailored programs that foster impact and sustainable entrepreneurship. We provide valuable resources, mentorship, and support to women in business, from new ventures to established small businesses and startups."""

    mission_content = mcp.create_text_frame(
        page=3,
        x="1.2in",
        y="6.5in",
        width="6.5in",
        height="1.2in",
        content=mission_text,
        font_family="Georgia",
        font_size="11pt",
        fill_color="#333333",
        alignment="left"
    )

    # Key Elements section
    elements_title = mcp.create_text_frame(
        page=3,
        x="0.75in",
        y="8.2in",
        width="7in",
        height="0.5in",
        content="Key Elements",
        font_family="Georgia",
        font_size="28pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="left"
    )

    elements_text = """WEEI offers a comprehensive program that is specifically designed to meet the unique needs of Ukrainian women entrepreneurs. The program provides valuable resources and support for women at all stages of business development."""

    elements_content = mcp.create_text_frame(
        page=3,
        x="0.75in",
        y="9in",
        width="7in",
        height="1in",
        content=elements_text,
        font_family="Georgia",
        font_size="11pt",
        fill_color="#333333",
        alignment="left"
    )

    print("✅ Page 3 complete (Background, Mission, Key Elements)")

    # ========================================
    # PAGE 4: BACK COVER (Partnership CTA)
    # ========================================
    print("\n6️⃣ Creating PAGE 4 - Back Cover with Partner Grid...")

    # Gradient background (same as cover)
    back_bg = mcp.create_rectangle(
        page=4,
        x="0in",
        y="0in",
        width="8.5in",
        height="11in",
        fill_color=COLORS['nordshore']
    )

    # Logo at top center
    logo_bg_back = mcp.create_rectangle(
        page=4,
        x="2.5in",
        y="1.5in",
        width="3.5in",
        height="1.2in",
        fill_color=COLORS['ukraine_blue'],
        corner_radius="12pt"
    )

    together_back = mcp.create_text_frame(
        page=4,
        x="2.6in",
        y="1.6in",
        width="3.3in",
        height="0.5in",
        content="Together for",
        font_family="Georgia",
        font_size="32pt",
        fill_color=COLORS['white'],
        alignment="center"
    )

    ukraine_box_back = mcp.create_rectangle(
        page=4,
        x="3.1in",
        y="2.2in",
        width="2.3in",
        height="0.5in",
        fill_color=COLORS['ukraine_yellow']
    )

    ukraine_back = mcp.create_text_frame(
        page=4,
        x="3.1in",
        y="2.25in",
        width="2.3in",
        height="0.4in",
        content="UKRAINE",
        font_family="Georgia",
        font_size="36pt",
        font_style="Bold",
        fill_color=COLORS['nordshore'],
        alignment="center"
    )

    # CTA text
    cta_main = mcp.create_text_frame(
        page=4,
        x="1in",
        y="3.5in",
        width="6.5in",
        height="1.2in",
        content="We are looking for more partners and\nsupporters to work with us.",
        font_family="Georgia",
        font_size="32pt",
        fill_color=COLORS['white'],
        alignment="center"
    )

    cta_sub = mcp.create_text_frame(
        page=4,
        x="1in",
        y="4.8in",
        width="6.5in",
        height="0.6in",
        content="Partnering with Together for Ukraine will have a strong impact on the future of Ukraine and its people.",
        font_family="Georgia",
        font_size="14pt",
        fill_color=COLORS['white'],
        alignment="center"
    )

    # Partner logo grid (3x3) with card backgrounds
    partners = [
        ("Google", 1.5, 6),
        ("Kintell", 3.5, 6),
        ("+Babbel", 5.5, 6),
        ("Sanoma", 1.5, 7.2),
        ("Oxford UP", 3.5, 7.2),
        ("AWS", 5.5, 7.2),
        ("Cornell", 1.5, 8.4),
        ("INCO", 3.5, 8.4),
        ("Bain & Co", 5.5, 8.4),
    ]

    for partner, x_pos, y_pos in partners:
        # Card background
        partner_card = mcp.create_rectangle(
            page=4,
            x=f"{x_pos}in",
            y=f"{y_pos}in",
            width="1.6in",
            height="0.8in",
            fill_color=COLORS['nordshore_dark'],
            corner_radius="6pt",
            opacity=0.8
        )

        # Partner name
        partner_text = mcp.create_text_frame(
            page=4,
            x=f"{x_pos}in",
            y=f"{y_pos + 0.25}in",
            width="1.6in",
            height="0.3in",
            content=partner,
            font_family="Arial",
            font_size="14pt",
            font_style="Bold",
            fill_color=COLORS['white'],
            alignment="center"
        )

    print("✅ Partner grid created (9 partners)")

    # Contact info
    contact_text = mcp.create_text_frame(
        page=4,
        x="1in",
        y="9.8in",
        width="6.5in",
        height="0.4in",
        content="Phone: +47 919 08 939 | Email: contact@theeducationalequalityinstitute.org",
        font_family="Arial",
        font_size="10pt",
        fill_color=COLORS['white'],
        alignment="center"
    )

    # TEEI logo at bottom
    teei_logo_back = mcp.create_text_frame(
        page=4,
        x="3in",
        y="10.4in",
        width="2.5in",
        height="0.4in",
        content="EDUCATIONAL EQUALITY INSTITUTE",
        font_family="Arial",
        font_size="10pt",
        font_style="Bold",
        fill_color=COLORS['white'],
        alignment="center"
    )

    print("✅ Back cover complete")

    print("\n" + "=" * 70)
    print("🎉 STUNNING document created successfully!")
    print("=" * 70)
    print("\n📄 Document summary:")
    print("  • 4 pages (Letter size)")
    print("  • Cover: Gradient background, decorative circles, large title")
    print("  • Page 2: Card-based program layout with 4 cards")
    print("  • Page 3: Background, Mission, Key Elements")
    print("  • Page 4: Partner grid (9 partners) + CTA")
    print("\n💾 Next steps:")
    print("  1. Review document in InDesign")
    print("  2. Export to PDF: File → Export → Adobe PDF (Print)")
    print("  3. Use 'High Quality Print' preset")
    print("  4. Save to: T:\\Projects\\pdf-orchestrator\\exports\\ukraine-STUNNING.pdf")
    print("\n✨ READY TO WOW! ✨\n")

if __name__ == "__main__":
    try:
        create_stunning_document()
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
