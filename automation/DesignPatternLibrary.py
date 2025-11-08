#!/usr/bin/env python3
"""
Design Pattern Library for InDesign Automation

Provides reusable, world-class design patterns for common document elements.
Each pattern automatically handles spacing, typography, and brand compliance.

Usage:
    from automation.DesignPatternLibrary import DesignComponents
    from automation.TEEI_BrandSystem import TEEIBrand
    from automation.IntelligentLayout import LayoutManager

    components = DesignComponents(send_command_func, create_command_func)
    components.create_hero_banner(page=1, title="Partnership", subtitle="AWS x TEEI")
"""

from typing import Dict, List, Optional, Callable, Any
from automation.TEEI_BrandSystem import TEEIBrand
from automation.IntelligentLayout import LayoutManager


class DesignComponents:
    """
    Reusable design components that automatically create professional elements.
    All components use TEEI brand guidelines and intelligent spacing.
    """

    def __init__(
        self,
        send_command: Callable,
        create_command: Callable,
        page_width: float = 595,
        page_height: float = 842
    ):
        """
        Initialize design components system.

        Args:
            send_command: Function to send commands to InDesign
            create_command: Function to create command objects
            page_width: Page width in points
            page_height: Page height in points
        """
        self.send = send_command
        self.cmd = create_command
        self.brand = TEEIBrand()
        self.layout = LayoutManager(page_width, page_height)

    def _execute(self, action: str, options: Dict) -> Dict:
        """Execute InDesign command and return response."""
        response = self.send(self.cmd(action, options))
        return response

    # ============================================================================
    # HEADER COMPONENTS
    # ============================================================================

    def create_hero_banner(
        self,
        page: int,
        title: str,
        subtitle: Optional[str] = None,
        height: float = 140,
        background_color: str = 'nordshore',
        accent_stripe: bool = True
    ) -> Dict:
        """
        Create professional hero banner with title, subtitle, and optional accent.

        Args:
            page: Page number (1-based)
            title: Main title text
            subtitle: Optional subtitle text
            height: Banner height in points
            background_color: TEEI color name for background
            accent_stripe: Add accent stripe at bottom

        Returns:
            Dict with created element IDs
        """
        result = {}

        # Get layout sections
        header = self.layout.create_header_section(height=height, full_bleed=True)

        # Background rectangle
        bg_color = self.brand.COLORS[background_color]['rgb']
        self._execute("createRectangle", {
            "page": page,
            "x": header['background']['x'],
            "y": header['background']['y'],
            "width": header['background']['width'],
            "height": header['background']['height'],
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]}
        })

        # Accent stripe
        if accent_stripe:
            accent_color = self.brand.COLORS['moss']['rgb']
            self._execute("createRectangle", {
                "page": page,
                "x": 0,
                "y": header['background']['y'] + height - 5,
                "width": self.layout.page_width,
                "height": 5,
                "fillColor": {"red": accent_color[0], "green": accent_color[1], "blue": accent_color[2]}
            })

        # Title text
        title_typo = self.brand.TYPOGRAPHY['document_title']
        title_area = header['title_area']

        self._execute("createTextFrame", {
            "page": page,
            "x": title_area['x'],
            "y": title_area['y'],
            "width": title_area['width'],
            "height": title_area['height'] * 0.6 if subtitle else title_area['height'],
            "content": title,
            "fontSize": title_typo['size'],
            "fontFamily": title_typo['family'],
            "fontWeight": title_typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": 255, "green": 255, "blue": 255}
        })

        # Subtitle (if provided)
        if subtitle:
            subtitle_typo = self.brand.TYPOGRAPHY['subhead']
            subtitle_color = self.brand.COLORS['gold']['rgb']

            self._execute("createTextFrame", {
                "page": page,
                "x": title_area['x'],
                "y": title_area['y'] + (title_area['height'] * 0.6),
                "width": title_area['width'],
                "height": title_area['height'] * 0.4,
                "content": subtitle,
                "fontSize": subtitle_typo['size'],
                "fontFamily": subtitle_typo['family'],
                "fontWeight": subtitle_typo['weight'],
                "alignment": "center",
                "verticalAlignment": "center",
                "fillColor": {"red": subtitle_color[0], "green": subtitle_color[1], "blue": subtitle_color[2]}
            })

        return result

    def create_section_header(
        self,
        page: int,
        text: str,
        x: float,
        y: float,
        width: float,
        background: bool = True,
        background_color: str = 'nordshore'
    ) -> Dict:
        """
        Create section header with optional background.

        Args:
            page: Page number
            text: Header text
            x: X position
            y: Y position
            width: Header width
            background: Include background rectangle
            background_color: Background color name

        Returns:
            Dict with element IDs
        """
        typo = self.brand.TYPOGRAPHY['section_header']
        height = typo['size'] + 30  # Typography + padding

        if background:
            bg_color = self.brand.COLORS[background_color]['rgb']
            self._execute("createRectangle", {
                "page": page,
                "x": x,
                "y": y,
                "width": width,
                "height": height,
                "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]}
            })

        # Text (white on dark background, or brand color on light)
        text_color = self.brand.COLORS['white' if background else typo['color']]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + 20,
            "y": y + 10,
            "width": width - 40,
            "height": height - 20,
            "content": text,
            "fontSize": typo['size'],
            "fontFamily": typo['family'],
            "fontWeight": typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": text_color[0], "green": text_color[1], "blue": text_color[2]}
        })

        return {'height': height}

    # ============================================================================
    # CARD COMPONENTS
    # ============================================================================

    def create_feature_card(
        self,
        page: int,
        x: float,
        y: float,
        width: float,
        height: float,
        title: str,
        description: str,
        background_color: str = 'sky',
        border_color: str = 'moss',
        border_width: float = 2
    ) -> Dict:
        """
        Create feature card with title and description.

        Args:
            page: Page number
            x, y: Position
            width, height: Card dimensions
            title: Card title
            description: Card description text
            background_color: Background color name
            border_color: Border color name
            border_width: Border width in points

        Returns:
            Dict with element IDs
        """
        padding = 20

        # Background
        bg_color = self.brand.COLORS[background_color]['rgb']
        border_rgb = self.brand.COLORS[border_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeColor": {"red": border_rgb[0], "green": border_rgb[1], "blue": border_rgb[2]},
            "strokeWeight": border_width
        })

        # Title (top 30%)
        title_typo = self.brand.TYPOGRAPHY['subhead']
        title_color = self.brand.COLORS[title_typo['color']]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding,
            "width": width - (padding * 2),
            "height": height * 0.3,
            "content": title,
            "fontSize": title_typo['size'],
            "fontFamily": title_typo['family'],
            "fontWeight": 'Bold',
            "alignment": "left",
            "fillColor": {"red": title_color[0], "green": title_color[1], "blue": title_color[2]}
        })

        # Description (bottom 70%)
        desc_typo = self.brand.TYPOGRAPHY['body']
        desc_color = self.brand.COLORS[desc_typo['color']]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding + (height * 0.3),
            "width": width - (padding * 2),
            "height": height * 0.7 - (padding * 2),
            "content": description,
            "fontSize": desc_typo['size'],
            "fontFamily": desc_typo['family'],
            "fontWeight": desc_typo['weight'],
            "alignment": "left",
            "fillColor": {"red": desc_color[0], "green": desc_color[1], "blue": desc_color[2]}
        })

        return {}

    def create_metric_card(
        self,
        page: int,
        x: float,
        y: float,
        width: float,
        height: float,
        metric: str,
        label: str,
        background_color: str = 'sand',
        metric_color: str = 'moss'
    ) -> Dict:
        """
        Create metric display card with large number and label.

        Args:
            page: Page number
            x, y: Position
            width, height: Card dimensions
            metric: Metric value (e.g., "2,600+", "97%")
            label: Metric label (e.g., "STUDENTS REACHED")
            background_color: Background color name
            metric_color: Metric number color

        Returns:
            Dict with element IDs
        """
        padding = 20

        # Background
        bg_color = self.brand.COLORS[background_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeWeight": 1,
            "strokeColor": {"red": 200, "green": 200, "blue": 200}
        })

        # Metric number (top 60%)
        metric_typo = self.brand.TYPOGRAPHY['metric_number']
        metric_rgb = self.brand.COLORS[metric_color]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding,
            "width": width - (padding * 2),
            "height": height * 0.6,
            "content": metric,
            "fontSize": metric_typo['size'],
            "fontFamily": metric_typo['family'],
            "fontWeight": metric_typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": metric_rgb[0], "green": metric_rgb[1], "blue": metric_rgb[2]}
        })

        # Label (bottom 40%)
        label_typo = self.brand.TYPOGRAPHY['metric_label']
        label_color = self.brand.COLORS[label_typo['color']]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + height * 0.6,
            "width": width - (padding * 2),
            "height": height * 0.4 - padding,
            "content": label,
            "fontSize": label_typo['size'],
            "fontFamily": label_typo['family'],
            "fontWeight": label_typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": label_color[0], "green": label_color[1], "blue": label_color[2]}
        })

        return {}

    def create_testimonial_card(
        self,
        page: int,
        x: float,
        y: float,
        width: float,
        height: float,
        quote: str,
        attribution: str,
        background_color: str = 'white',
        accent_color: str = 'gold'
    ) -> Dict:
        """
        Create testimonial card with quote and attribution.

        Args:
            page: Page number
            x, y: Position
            width, height: Card dimensions
            quote: Quote text
            attribution: Attribution text (name, title)
            background_color: Background color
            accent_color: Accent/quote mark color

        Returns:
            Dict with element IDs
        """
        padding = 30

        # Background with accent border
        bg_color = self.brand.COLORS[background_color]['rgb']
        accent_rgb = self.brand.COLORS[accent_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeColor": {"red": accent_rgb[0], "green": accent_rgb[1], "blue": accent_rgb[2]},
            "strokeWeight": 3
        })

        # Large opening quote mark
        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding - 10,
            "width": 60,
            "height": 60,
            "content": '"',
            "fontSize": 72,
            "fontFamily": "Georgia",
            "fontWeight": "Bold",
            "alignment": "left",
            "fillColor": {"red": accent_rgb[0], "green": accent_rgb[1], "blue": accent_rgb[2]}
        })

        # Quote text
        body_typo = self.brand.TYPOGRAPHY['body']
        body_color = self.brand.COLORS['nordshore']['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding + 40,
            "width": width - (padding * 2),
            "height": height - padding - 80,
            "content": quote,
            "fontSize": 13,
            "fontFamily": "Georgia",
            "fontWeight": "Italic",
            "alignment": "left",
            "fillColor": {"red": body_color[0], "green": body_color[1], "blue": body_color[2]}
        })

        # Attribution
        caption_typo = self.brand.TYPOGRAPHY['caption']
        moss_color = self.brand.COLORS['moss']['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + height - 40,
            "width": width - (padding * 2),
            "height": 30,
            "content": f"— {attribution}",
            "fontSize": caption_typo['size'] + 1,
            "fontFamily": caption_typo['family'],
            "fontWeight": "Bold",
            "alignment": "left",
            "fillColor": {"red": moss_color[0], "green": moss_color[1], "blue": moss_color[2]}
        })

        return {}

    # ============================================================================
    # TIMELINE COMPONENTS
    # ============================================================================

    def create_timeline_phase(
        self,
        page: int,
        x: float,
        y: float,
        width: float,
        height: float,
        phase_num: int,
        title: str,
        description: str,
        background_color: str = 'sky',
        circle_color: str = 'moss'
    ) -> Dict:
        """
        Create single timeline phase card with circle marker.

        Args:
            page: Page number
            x, y: Position
            width, height: Phase card dimensions
            phase_num: Phase number (for display)
            title: Phase title
            description: Phase description
            background_color: Card background color
            circle_color: Timeline circle color

        Returns:
            Dict with element IDs
        """
        padding = 15

        # Background card
        bg_color = self.brand.COLORS[background_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeWeight": 0
        })

        # Timeline circle marker
        circle_rgb = self.brand.COLORS[circle_color]['rgb']
        circle_size = 30

        # Note: For actual circle, would use createOval in ExtendScript
        # This is a simplified rectangle representation
        self._execute("createRectangle", {
            "page": page,
            "x": x + (width / 2) - (circle_size / 2),
            "y": y - 45,  # Above the card
            "width": circle_size,
            "height": circle_size,
            "fillColor": {"red": circle_rgb[0], "green": circle_rgb[1], "blue": circle_rgb[2]},
            "strokeWeight": 2,
            "strokeColor": {"red": 255, "green": 255, "blue": 255}
        })

        # Phase number in circle
        self._execute("createTextFrame", {
            "page": page,
            "x": x + (width / 2) - 10,
            "y": y - 40,
            "width": 20,
            "height": 20,
            "content": str(phase_num),
            "fontSize": 14,
            "fontFamily": "Arial",
            "fontWeight": "Bold",
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": 255, "green": 255, "blue": 255}
        })

        # Phase title
        title_typo = self.brand.TYPOGRAPHY['body_bold']
        title_color = self.brand.COLORS['nordshore']['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding,
            "width": width - (padding * 2),
            "height": 30,
            "content": title,
            "fontSize": 12,
            "fontFamily": title_typo['family'],
            "fontWeight": "Bold",
            "alignment": "center",
            "fillColor": {"red": title_color[0], "green": title_color[1], "blue": title_color[2]}
        })

        # Phase description
        desc_typo = self.brand.TYPOGRAPHY['caption']
        desc_color = self.brand.COLORS['nordshore']['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + padding,
            "y": y + padding + 35,
            "width": width - (padding * 2),
            "height": height - padding - 40,
            "content": description,
            "fontSize": desc_typo['size'],
            "fontFamily": desc_typo['family'],
            "fontWeight": desc_typo['weight'],
            "alignment": "left",
            "fillColor": {"red": desc_color[0], "green": desc_color[1], "blue": desc_color[2]}
        })

        return {}

    # ============================================================================
    # CTA (CALL-TO-ACTION) COMPONENTS
    # ============================================================================

    def create_cta_button(
        self,
        page: int,
        x: float,
        y: float,
        width: float,
        height: float,
        text: str,
        background_color: str = 'moss',
        text_color: str = 'white'
    ) -> Dict:
        """
        Create call-to-action button.

        Args:
            page: Page number
            x, y: Position
            width, height: Button dimensions
            text: Button text
            background_color: Button background color
            text_color: Text color

        Returns:
            Dict with element IDs
        """
        # Background
        bg_color = self.brand.COLORS[background_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": x,
            "y": y,
            "width": width,
            "height": height,
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeWeight": 0
        })

        # Button text
        cta_typo = self.brand.TYPOGRAPHY['cta']
        text_rgb = self.brand.COLORS[text_color]['rgb']

        self._execute("createTextFrame", {
            "page": page,
            "x": x + 10,
            "y": y + 5,
            "width": width - 20,
            "height": height - 10,
            "content": text,
            "fontSize": cta_typo['size'],
            "fontFamily": cta_typo['family'],
            "fontWeight": cta_typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": text_rgb[0], "green": text_rgb[1], "blue": text_rgb[2]}
        })

        return {}

    # ============================================================================
    # FOOTER COMPONENTS
    # ============================================================================

    def create_footer(
        self,
        page: int,
        contact_email: str,
        contact_website: str,
        height: float = 60,
        background_color: str = 'nordshore'
    ) -> Dict:
        """
        Create professional footer with contact information.

        Args:
            page: Page number
            contact_email: Contact email
            contact_website: Contact website
            height: Footer height
            background_color: Background color

        Returns:
            Dict with element IDs
        """
        footer = self.layout.create_footer(height=height, full_bleed=True)

        # Background
        bg_color = self.brand.COLORS[background_color]['rgb']

        self._execute("createRectangle", {
            "page": page,
            "x": footer['background']['x'],
            "y": footer['background']['y'],
            "width": footer['background']['width'],
            "height": footer['background']['height'],
            "fillColor": {"red": bg_color[0], "green": bg_color[1], "blue": bg_color[2]},
            "strokeWeight": 0
        })

        # Contact text
        contact_text = f"{contact_email}  |  {contact_website}"
        body_typo = self.brand.TYPOGRAPHY['body']

        self._execute("createTextFrame", {
            "page": page,
            "x": footer['content_area']['x'],
            "y": footer['content_area']['y'],
            "width": footer['content_area']['width'],
            "height": footer['content_area']['height'],
            "content": contact_text,
            "fontSize": body_typo['size'],
            "fontFamily": body_typo['family'],
            "fontWeight": body_typo['weight'],
            "alignment": "center",
            "verticalAlignment": "center",
            "fillColor": {"red": 255, "green": 255, "blue": 255}
        })

        return {}


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    print("DESIGN PATTERN LIBRARY")
    print("=" * 80)
    print("\nAvailable Components:")
    print("  - Hero Banner (title, subtitle, accent stripe)")
    print("  - Section Header (with optional background)")
    print("  - Feature Card (title, description, border)")
    print("  - Metric Card (large number, label)")
    print("  - Testimonial Card (quote, attribution)")
    print("  - Timeline Phase (numbered phases with circles)")
    print("  - CTA Button (call-to-action)")
    print("  - Footer (contact information)")
    print("\nAll components automatically apply TEEI brand guidelines!")
