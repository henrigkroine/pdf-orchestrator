#!/usr/bin/env python3
"""
Intelligent Layout System for InDesign Automation

Provides sophisticated layout algorithms that automatically create world-class
designs with proper spacing, hierarchy, and grid alignment.

Usage:
    from automation.IntelligentLayout import LayoutManager

    layout = LayoutManager(page_width=595, page_height=842)
    header_bounds = layout.create_header_section(height=140)
    content_area = layout.create_content_grid(columns=3)
"""

from typing import Dict, List, Tuple, Optional
import math


class LayoutManager:
    """
    Intelligent layout manager for creating world-class InDesign documents.
    Implements golden ratio, rule of thirds, and professional spacing systems.
    """

    def __init__(
        self,
        page_width: float = 595,  # A4 width in points
        page_height: float = 842,  # A4 height in points
        columns: int = 12,
        gutter: float = 20,
        margins: Optional[Dict[str, float]] = None
    ):
        """
        Initialize layout manager.

        Args:
            page_width: Page width in points
            page_height: Page height in points
            columns: Number of grid columns
            gutter: Space between columns in points
            margins: Dict with 'top', 'bottom', 'left', 'right' margins
        """
        self.page_width = page_width
        self.page_height = page_height
        self.columns = columns
        self.gutter = gutter

        # Default margins (40pt all around - professional standard)
        self.margins = margins or {
            'top': 40,
            'bottom': 40,
            'left': 40,
            'right': 40
        }

        # Calculate usable area
        self.content_width = page_width - self.margins['left'] - self.margins['right']
        self.content_height = page_height - self.margins['top'] - self.margins['bottom']

        # Calculate column width
        total_gutter_space = gutter * (columns - 1)
        self.column_width = (self.content_width - total_gutter_space) / columns

        # Golden ratio constant
        self.GOLDEN_RATIO = 1.618

        # Tracking cursor for progressive layout
        self.current_y = self.margins['top']

    # ============================================================================
    # GRID-BASED POSITIONING
    # ============================================================================

    def grid_position(
        self,
        column: int,
        span: int = 1,
        row: Optional[int] = None,
        height: Optional[float] = None
    ) -> Dict[str, float]:
        """
        Calculate position based on grid system.

        Args:
            column: Starting column (0 to columns-1)
            span: Number of columns to span
            row: Optional row number (for multi-row layouts)
            height: Optional height, otherwise uses default

        Returns:
            Dict with 'x', 'y', 'width', 'height'
        """
        # Validate inputs
        if column < 0 or column >= self.columns:
            raise ValueError(f"Column must be between 0 and {self.columns-1}")
        if column + span > self.columns:
            raise ValueError(f"Column span exceeds grid ({column} + {span} > {self.columns})")

        # Calculate x position
        x = self.margins['left'] + (column * (self.column_width + self.gutter))

        # Calculate width
        width = (self.column_width * span) + (self.gutter * (span - 1))

        # Calculate y position
        if row is not None:
            # Row-based positioning (100pt per row default)
            y = self.margins['top'] + (row * 100)
        else:
            # Use current cursor position
            y = self.current_y

        # Default height if not specified
        if height is None:
            height = 100

        return {
            'x': x,
            'y': y,
            'width': width,
            'height': height
        }

    def advance_cursor(self, distance: float, min_space: float = 20):
        """
        Move the layout cursor down by distance, with minimum spacing.

        Args:
            distance: Distance to advance
            min_space: Minimum spacing to add
        """
        self.current_y += distance + min_space

    def reset_cursor(self, y: Optional[float] = None):
        """
        Reset cursor to top or specified Y position.

        Args:
            y: Y position to reset to (defaults to top margin)
        """
        self.current_y = y if y is not None else self.margins['top']

    # ============================================================================
    # GOLDEN RATIO LAYOUTS
    # ============================================================================

    def golden_split_vertical(self, start_y: float, height: float) -> Tuple[Dict, Dict]:
        """
        Split an area vertically using golden ratio (1:1.618).

        Args:
            start_y: Starting Y position
            height: Total height to split

        Returns:
            Tuple of (upper_area, lower_area) dicts with bounds
        """
        upper_height = height / (1 + self.GOLDEN_RATIO)
        lower_height = height - upper_height

        upper_area = {
            'x': self.margins['left'],
            'y': start_y,
            'width': self.content_width,
            'height': upper_height
        }

        lower_area = {
            'x': self.margins['left'],
            'y': start_y + upper_height,
            'width': self.content_width,
            'height': lower_height
        }

        return upper_area, lower_area

    def golden_split_horizontal(self, start_x: float, width: float, y: float, height: float) -> Tuple[Dict, Dict]:
        """
        Split an area horizontally using golden ratio.

        Args:
            start_x: Starting X position
            width: Total width to split
            y: Y position
            height: Height of areas

        Returns:
            Tuple of (left_area, right_area) dicts with bounds
        """
        left_width = width / (1 + self.GOLDEN_RATIO)
        right_width = width - left_width

        left_area = {
            'x': start_x,
            'y': y,
            'width': left_width,
            'height': height
        }

        right_area = {
            'x': start_x + left_width,
            'y': y,
            'width': right_width,
            'height': height
        }

        return left_area, right_area

    # ============================================================================
    # COMMON LAYOUT PATTERNS
    # ============================================================================

    def create_header_section(
        self,
        height: float = 140,
        logo_size: float = 70,
        full_bleed: bool = True
    ) -> Dict[str, Dict]:
        """
        Create professional header section with logo placement.

        Args:
            height: Header height in points
            logo_size: Logo width/height in points
            full_bleed: Extend to page edges (no margins)

        Returns:
            Dict with 'background', 'logo_left', 'title_area', 'logo_right'
        """
        if full_bleed:
            background = {
                'x': 0,
                'y': 0,
                'width': self.page_width,
                'height': height
            }
        else:
            background = {
                'x': self.margins['left'],
                'y': self.margins['top'],
                'width': self.content_width,
                'height': height
            }

        # Logo positions with proper clearspace
        logo_clearspace = logo_size  # Clearspace = logo size (brand standard)

        logo_left = {
            'x': self.margins['left'] + logo_clearspace,
            'y': self.margins['top'] + (height - logo_size) / 2,
            'width': logo_size,
            'height': logo_size
        }

        logo_right = {
            'x': self.page_width - self.margins['right'] - logo_clearspace - logo_size,
            'y': self.margins['top'] + (height - logo_size) / 2,
            'width': logo_size,
            'height': logo_size
        }

        # Title area (center, between logos)
        title_area = {
            'x': logo_left['x'] + logo_size + logo_clearspace,
            'y': self.margins['top'] + 20,
            'width': logo_right['x'] - (logo_left['x'] + logo_size + logo_clearspace) - logo_clearspace,
            'height': height - 40
        }

        # Advance cursor past header
        self.current_y = height + 20  # Header + spacing

        return {
            'background': background,
            'logo_left': logo_left,
            'logo_right': logo_right,
            'title_area': title_area
        }

    def create_card_layout(
        self,
        cards: int,
        spacing: float = 20,
        height: float = 150
    ) -> List[Dict]:
        """
        Create evenly-spaced card layout (e.g., for features, benefits).

        Args:
            cards: Number of cards to create
            spacing: Space between cards
            height: Card height

        Returns:
            List of card bounds dicts
        """
        # Calculate spans per card
        total_spacing = spacing * (cards - 1)
        available_columns = self.columns
        columns_per_card = available_columns // cards

        card_bounds = []
        for i in range(cards):
            column = i * columns_per_card
            card = self.grid_position(
                column=column,
                span=columns_per_card,
                height=height
            )
            card_bounds.append(card)

        # Advance cursor past cards
        self.advance_cursor(height, spacing)

        return card_bounds

    def create_hero_section(
        self,
        height: Optional[float] = None,
        split_ratio: str = 'golden'  # 'golden', '50-50', '60-40'
    ) -> Dict[str, Dict]:
        """
        Create hero section with image and text areas.

        Args:
            height: Hero section height (defaults to page_height / 3)
            split_ratio: How to split the area ('golden', '50-50', '60-40')

        Returns:
            Dict with 'background', 'image_area', 'text_area'
        """
        if height is None:
            height = self.content_height / 3

        if split_ratio == 'golden':
            image_area, text_area = self.golden_split_horizontal(
                start_x=self.margins['left'],
                width=self.content_width,
                y=self.current_y,
                height=height
            )
        elif split_ratio == '50-50':
            half_width = self.content_width / 2
            image_area = {
                'x': self.margins['left'],
                'y': self.current_y,
                'width': half_width,
                'height': height
            }
            text_area = {
                'x': self.margins['left'] + half_width,
                'y': self.current_y,
                'width': half_width,
                'height': height
            }
        elif split_ratio == '60-40':
            left_width = self.content_width * 0.6
            right_width = self.content_width * 0.4
            image_area = {
                'x': self.margins['left'],
                'y': self.current_y,
                'width': left_width,
                'height': height
            }
            text_area = {
                'x': self.margins['left'] + left_width,
                'y': self.current_y,
                'width': right_width,
                'height': height
            }
        else:
            raise ValueError(f"Invalid split_ratio: {split_ratio}")

        background = {
            'x': self.margins['left'],
            'y': self.current_y,
            'width': self.content_width,
            'height': height
        }

        # Advance cursor
        self.advance_cursor(height, 40)

        return {
            'background': background,
            'image_area': image_area,
            'text_area': text_area
        }

    def create_metric_grid(
        self,
        metrics: int,
        columns_per_metric: int = 3
    ) -> List[Dict]:
        """
        Create grid layout for metrics/statistics.

        Args:
            metrics: Number of metrics to display
            columns_per_metric: Grid columns per metric

        Returns:
            List of metric area bounds
        """
        metrics_per_row = self.columns // columns_per_metric
        rows = math.ceil(metrics / metrics_per_row)

        metric_bounds = []
        metric_height = 120  # Standard metric card height

        for i in range(metrics):
            row = i // metrics_per_row
            col = i % metrics_per_row
            column = col * columns_per_metric

            bounds = self.grid_position(
                column=column,
                span=columns_per_metric,
                height=metric_height
            )
            bounds['y'] = self.current_y + (row * (metric_height + 20))

            metric_bounds.append(bounds)

        # Advance cursor past all metrics
        self.advance_cursor(rows * metric_height + (rows - 1) * 20, 40)

        return metric_bounds

    def create_timeline(
        self,
        phases: int,
        orientation: str = 'horizontal'  # 'horizontal' or 'vertical'
    ) -> Dict:
        """
        Create timeline layout with phases.

        Args:
            phases: Number of timeline phases
            orientation: 'horizontal' or 'vertical'

        Returns:
            Dict with 'line', 'phases' (list of phase bounds)
        """
        if orientation == 'horizontal':
            return self._create_horizontal_timeline(phases)
        else:
            return self._create_vertical_timeline(phases)

    def _create_horizontal_timeline(self, phases: int) -> Dict:
        """Create horizontal timeline."""
        timeline_height = 200
        phase_width = self.content_width / phases
        spacing = 20

        # Timeline line
        line = {
            'x': self.margins['left'],
            'y': self.current_y + 100,
            'width': self.content_width,
            'height': 3  # Line thickness
        }

        # Phase areas
        phase_bounds = []
        for i in range(phases):
            bounds = {
                'x': self.margins['left'] + (i * phase_width) + spacing,
                'y': self.current_y + (50 if i % 2 == 0 else 120),  # Alternating heights
                'width': phase_width - (spacing * 2),
                'height': 80,
                'circle': {  # Timeline node circle
                    'x': self.margins['left'] + (i * phase_width) + (phase_width / 2) - 15,
                    'y': self.current_y + 85,
                    'width': 30,
                    'height': 30
                }
            }
            phase_bounds.append(bounds)

        self.advance_cursor(timeline_height, 40)

        return {
            'line': line,
            'phases': phase_bounds
        }

    def _create_vertical_timeline(self, phases: int) -> Dict:
        """Create vertical timeline."""
        phase_height = 120
        spacing = 20

        # Timeline line (vertical)
        line = {
            'x': self.margins['left'] + (self.content_width / 2),
            'y': self.current_y,
            'width': 3,
            'height': phases * (phase_height + spacing)
        }

        # Phase areas
        phase_bounds = []
        for i in range(phases):
            # Alternate left and right
            if i % 2 == 0:
                # Left side
                x = self.margins['left']
                width = (self.content_width / 2) - 40
            else:
                # Right side
                x = self.margins['left'] + (self.content_width / 2) + 40
                width = (self.content_width / 2) - 40

            bounds = {
                'x': x,
                'y': self.current_y + (i * (phase_height + spacing)),
                'width': width,
                'height': phase_height,
                'circle': {  # Timeline node circle
                    'x': self.margins['left'] + (self.content_width / 2) - 15,
                    'y': self.current_y + (i * (phase_height + spacing)) + (phase_height / 2) - 15,
                    'width': 30,
                    'height': 30
                }
            }
            phase_bounds.append(bounds)

        self.advance_cursor(phases * (phase_height + spacing), 40)

        return {
            'line': line,
            'phases': phase_bounds
        }

    def create_footer(
        self,
        height: float = 60,
        full_bleed: bool = True
    ) -> Dict[str, Dict]:
        """
        Create footer section at bottom of page.

        Args:
            height: Footer height
            full_bleed: Extend to page edges

        Returns:
            Dict with 'background', 'content_area'
        """
        footer_y = self.page_height - height

        if full_bleed:
            background = {
                'x': 0,
                'y': footer_y,
                'width': self.page_width,
                'height': height
            }
        else:
            background = {
                'x': self.margins['left'],
                'y': footer_y,
                'width': self.content_width,
                'height': height
            }

        content_area = {
            'x': self.margins['left'] + 20,
            'y': footer_y + 15,
            'width': self.content_width - 40,
            'height': height - 30
        }

        return {
            'background': background,
            'content_area': content_area
        }

    # ============================================================================
    # SPACING UTILITIES
    # ============================================================================

    def calculate_optimal_spacing(
        self,
        elements: int,
        available_space: float,
        element_size: float
    ) -> Dict[str, float]:
        """
        Calculate optimal spacing between elements to fill available space.

        Args:
            elements: Number of elements
            available_space: Total space available
            element_size: Size of each element

        Returns:
            Dict with 'element_size', 'spacing', 'total_used'
        """
        total_element_space = elements * element_size
        remaining_space = available_space - total_element_space
        spacing = remaining_space / (elements + 1)  # Including edges

        return {
            'element_size': element_size,
            'spacing': spacing,
            'total_used': available_space
        }

    def distribute_vertically(
        self,
        count: int,
        start_y: float,
        end_y: float,
        element_height: float
    ) -> List[float]:
        """
        Distribute elements evenly in vertical space.

        Args:
            count: Number of elements
            start_y: Starting Y position
            end_y: Ending Y position
            element_height: Height of each element

        Returns:
            List of Y positions for each element
        """
        available_space = end_y - start_y
        spacing_info = self.calculate_optimal_spacing(count, available_space, element_height)

        positions = []
        current_y = start_y + spacing_info['spacing']

        for i in range(count):
            positions.append(current_y)
            current_y += element_height + spacing_info['spacing']

        return positions


# ============================================================================
# DESIGN PATTERNS LIBRARY
# ============================================================================

class DesignPatterns:
    """
    Library of common design patterns for InDesign documents.
    """

    @staticmethod
    def feature_card_with_icon(
        layout: LayoutManager,
        column: int,
        span: int = 3,
        icon_size: float = 40
    ) -> Dict:
        """
        Create a feature card layout with icon, title, and description areas.

        Args:
            layout: LayoutManager instance
            column: Starting column
            span: Column span
            icon_size: Icon size in points

        Returns:
            Dict with 'background', 'icon', 'title', 'description'
        """
        card_height = 200
        padding = 20

        # Card background
        background = layout.grid_position(column, span, height=card_height)

        # Icon (top, centered)
        icon = {
            'x': background['x'] + (background['width'] / 2) - (icon_size / 2),
            'y': background['y'] + padding,
            'width': icon_size,
            'height': icon_size
        }

        # Title (below icon)
        title = {
            'x': background['x'] + padding,
            'y': icon['y'] + icon_size + 15,
            'width': background['width'] - (padding * 2),
            'height': 40
        }

        # Description (remaining space)
        description = {
            'x': background['x'] + padding,
            'y': title['y'] + title['height'] + 10,
            'width': background['width'] - (padding * 2),
            'height': card_height - (title['y'] + title['height'] + 10 - background['y']) - padding
        }

        return {
            'background': background,
            'icon': icon,
            'title': title,
            'description': description
        }

    @staticmethod
    def metric_card(
        layout: LayoutManager,
        column: int,
        span: int = 3
    ) -> Dict:
        """
        Create a metric display card with number and label.

        Args:
            layout: LayoutManager instance
            column: Starting column
            span: Column span

        Returns:
            Dict with 'background', 'number', 'label'
        """
        card_height = 120
        padding = 20

        background = layout.grid_position(column, span, height=card_height)

        # Large number (top 60%)
        number = {
            'x': background['x'] + padding,
            'y': background['y'] + padding,
            'width': background['width'] - (padding * 2),
            'height': card_height * 0.6
        }

        # Label (bottom 40%)
        label = {
            'x': background['x'] + padding,
            'y': number['y'] + number['height'],
            'width': background['width'] - (padding * 2),
            'height': card_height * 0.4 - padding
        }

        return {
            'background': background,
            'number': number,
            'label': label
        }


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example: Create a professional document layout
    layout = LayoutManager(page_width=595, page_height=842)

    print("INTELLIGENT LAYOUT SYSTEM")
    print("=" * 80)

    print("\nHEADER SECTION:")
    header = layout.create_header_section(height=140, logo_size=70)
    print(f"  Background: {header['background']}")
    print(f"  Logo Left: {header['logo_left']}")
    print(f"  Title Area: {header['title_area']}")
    print(f"  Logo Right: {header['logo_right']}")

    print("\nCARD LAYOUT (3 cards):")
    cards = layout.create_card_layout(cards=3, spacing=20, height=150)
    for i, card in enumerate(cards):
        print(f"  Card {i+1}: {card}")

    print("\nMETRIC GRID (4 metrics):")
    metrics = layout.create_metric_grid(metrics=4, columns_per_metric=3)
    for i, metric in enumerate(metrics):
        print(f"  Metric {i+1}: {metric}")

    print("\nTIMELINE (4 phases):")
    timeline = layout.create_timeline(phases=4, orientation='horizontal')
    print(f"  Line: {timeline['line']}")
    for i, phase in enumerate(timeline['phases']):
        print(f"  Phase {i+1}: {phase}")

    print("\nFOOTER:")
    footer = layout.create_footer(height=60)
    print(f"  Background: {footer['background']}")
    print(f"  Content Area: {footer['content_area']}")

    print("\nGRID POSITIONING EXAMPLES:")
    print(f"  Full width (span 12): {layout.grid_position(0, 12)}")
    print(f"  Half width left (span 6): {layout.grid_position(0, 6)}")
    print(f"  Half width right (span 6): {layout.grid_position(6, 6)}")
    print(f"  Third width (span 4): {layout.grid_position(0, 4)}")
