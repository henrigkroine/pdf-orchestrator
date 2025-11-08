#!/usr/bin/env python3
"""
TEEI Brand System Automation Module

Provides automated application of TEEI brand guidelines to InDesign documents.
Eliminates manual color/font coding and ensures 100% brand compliance.

Usage:
    from automation.TEEI_BrandSystem import TEEIBrand

    brand = TEEIBrand()
    brand.apply_colors_to_document(doc)
    brand.create_paragraph_styles(doc)
"""

class TEEIBrand:
    """
    Complete TEEI Brand Guidelines implementation for automated document creation.
    Based on official TEEI Design Guidelines.pdf
    """

    # ============================================================================
    # OFFICIAL TEEI COLOR PALETTE
    # ============================================================================

    COLORS = {
        # Primary Colors (80% usage recommended)
        'nordshore': {
            'hex': '#00393F',
            'rgb': (0, 57, 63),
            'cmyk': (100, 10, 0, 75),
            'usage': 'Primary brand color - headers, key elements',
            'weight': 0.8
        },
        'sky': {
            'hex': '#C9E4EC',
            'rgb': (201, 228, 236),
            'cmyk': (15, 3, 0, 7),
            'usage': 'Secondary accent - backgrounds, highlights',
            'weight': 0.6
        },
        'sand': {
            'hex': '#FFF1E2',
            'rgb': (255, 241, 226),
            'cmyk': (0, 6, 11, 0),
            'usage': 'Warm neutral background',
            'weight': 0.5
        },
        'beige': {
            'hex': '#EFE1DC',
            'rgb': (239, 225, 220),
            'cmyk': (0, 6, 8, 6),
            'usage': 'Soft neutral background',
            'weight': 0.5
        },

        # Accent Colors (20% usage)
        'moss': {
            'hex': '#65873B',
            'rgb': (101, 135, 59),
            'cmyk': (55, 20, 100, 10),
            'usage': 'Natural green accent',
            'weight': 0.2
        },
        'moss_bg': {
            'hex': '#CCD7CB',
            'rgb': (204, 215, 203),
            'cmyk': (20, 5, 20, 0),
            'usage': 'Light moss background',
            'weight': 0.2
        },
        'gold': {
            'hex': '#BA8F5A',
            'rgb': (186, 143, 90),
            'cmyk': (20, 35, 65, 10),
            'usage': 'Warm metallic accent - premium feel, metrics',
            'weight': 0.15
        },
        'clay': {
            'hex': '#913B2F',
            'rgb': (145, 59, 47),
            'cmyk': (20, 80, 80, 30),
            'usage': 'Rich terracotta accent',
            'weight': 0.1
        },

        # Neutral Colors
        'white': {
            'hex': '#FFFFFF',
            'rgb': (255, 255, 255),
            'cmyk': (0, 0, 0, 0),
            'usage': 'Background, text on dark',
            'weight': 1.0
        },
        'black': {
            'hex': '#000000',
            'rgb': (0, 0, 0),
            'cmyk': (0, 0, 0, 100),
            'usage': 'Body text',
            'weight': 1.0
        },
        'gray_light': {
            'hex': '#666666',
            'rgb': (100, 100, 100),
            'cmyk': (0, 0, 0, 60),
            'usage': 'Captions, secondary text',
            'weight': 0.5
        },
        'gray_dark': {
            'hex': '#333333',
            'rgb': (50, 50, 50),
            'cmyk': (0, 0, 0, 80),
            'usage': 'Dark text',
            'weight': 0.5
        }
    }

    # ============================================================================
    # TYPOGRAPHY SYSTEM
    # ============================================================================

    TYPOGRAPHY = {
        'document_title': {
            'family': 'Lora',
            'weight': 'Bold',
            'size': 42,
            'leading': 50.4,  # 1.2x
            'color': 'nordshore',
            'usage': 'Main document title'
        },
        'section_header': {
            'family': 'Lora',
            'weight': 'Semibold',
            'size': 28,
            'leading': 33.6,  # 1.2x
            'color': 'nordshore',
            'usage': 'Section headers'
        },
        'subhead': {
            'family': 'Roboto Flex',
            'weight': 'Medium',
            'size': 18,
            'leading': 27,  # 1.5x
            'color': 'nordshore',
            'usage': 'Subheadings'
        },
        'body': {
            'family': 'Roboto Flex',
            'weight': 'Regular',
            'size': 11,
            'leading': 16.5,  # 1.5x
            'color': 'black',
            'usage': 'Body text'
        },
        'body_bold': {
            'family': 'Roboto Flex',
            'weight': 'Bold',
            'size': 11,
            'leading': 16.5,
            'color': 'black',
            'usage': 'Bold body text'
        },
        'caption': {
            'family': 'Roboto Flex',
            'weight': 'Regular',
            'size': 9,
            'leading': 13.5,  # 1.5x
            'color': 'gray_light',
            'usage': 'Captions, footnotes'
        },
        'metric_number': {
            'family': 'Lora',
            'weight': 'Bold',
            'size': 32,
            'leading': 38.4,  # 1.2x
            'color': 'moss',
            'usage': 'Large metric numbers'
        },
        'metric_label': {
            'family': 'Roboto Flex',
            'weight': 'Regular',
            'size': 10,
            'leading': 12,
            'color': 'nordshore',
            'usage': 'Metric labels'
        },
        'cta': {
            'family': 'Roboto Flex',
            'weight': 'Bold',
            'size': 14,
            'leading': 21,  # 1.5x
            'color': 'white',
            'usage': 'Call-to-action buttons'
        }
    }

    # ============================================================================
    # LAYOUT STANDARDS
    # ============================================================================

    LAYOUT = {
        'grid': {
            'columns': 12,
            'gutter': 20,  # pt
            'margin_top': 40,  # pt
            'margin_bottom': 40,
            'margin_left': 40,
            'margin_right': 40
        },
        'spacing': {
            'section_break': 60,  # pt between sections
            'element_gap': 20,    # pt between related elements
            'paragraph_gap': 12,  # pt between paragraphs
            'line_height_body': 1.5,  # multiplier
            'line_height_headline': 1.2  # multiplier
        },
        'logo_clearspace': {
            'minimum': 'icon_height',  # Minimum clearspace = height of logo icon
            'recommended': 'icon_height * 1.5'
        }
    }

    # ============================================================================
    # FORBIDDEN ELEMENTS (BRAND VIOLATIONS)
    # ============================================================================

    FORBIDDEN = {
        'colors': [
            '#C87137',  # Copper/Orange (NOT in brand palette)
            '#FF6600',  # Bright orange
            '#CC5500',  # Rust orange
        ],
        'fonts': [
            'Comic Sans',
            'Papyrus',
            'Brush Script'
        ],
        'patterns': [
            'XX',  # Placeholder metrics
            'Lorem ipsum'  # Placeholder text
        ]
    }

    # ============================================================================
    # EXTENDSCRIPT GENERATION
    # ============================================================================

    def generate_color_swatches_extendscript(self):
        """
        Generate ExtendScript code to create all TEEI brand color swatches in InDesign.

        Returns:
            str: ExtendScript code to execute
        """
        script_lines = []
        script_lines.append("// TEEI Brand Color Swatches - Auto-generated")
        script_lines.append("(function() {")
        script_lines.append("    var doc = app.activeDocument;")
        script_lines.append("")

        for color_name, color_data in self.COLORS.items():
            rgb = color_data['rgb']
            swatch_name = f"TEEI_{color_name.title()}"

            script_lines.append(f"    // {color_data['usage']}")
            script_lines.append(f"    var {color_name};")
            script_lines.append(f"    try {{")
            script_lines.append(f"        {color_name} = doc.colors.item('{swatch_name}');")
            script_lines.append(f"        {color_name}.name;")
            script_lines.append(f"    }} catch(e) {{")
            script_lines.append(f"        {color_name} = doc.colors.add();")
            script_lines.append(f"        {color_name}.name = '{swatch_name}';")
            script_lines.append(f"        {color_name}.space = ColorSpace.RGB;")
            script_lines.append(f"        {color_name}.colorValue = [{rgb[0]}, {rgb[1]}, {rgb[2]}];")
            script_lines.append(f"    }}")
            script_lines.append("")

        script_lines.append("    return 'Created ' + doc.colors.length + ' color swatches';")
        script_lines.append("})();")

        return "\n".join(script_lines)

    def generate_paragraph_styles_extendscript(self):
        """
        Generate ExtendScript code to create all TEEI paragraph styles in InDesign.

        Returns:
            str: ExtendScript code to execute
        """
        script_lines = []
        script_lines.append("// TEEI Paragraph Styles - Auto-generated")
        script_lines.append("(function() {")
        script_lines.append("    var doc = app.activeDocument;")
        script_lines.append("")

        for style_name, style_data in self.TYPOGRAPHY.items():
            indd_style_name = f"TEEI_{style_name.replace('_', ' ').title()}"

            # Font family mapping (InDesign names)
            font_family = style_data['family']
            font_weight = style_data['weight']
            font_size = style_data['size']
            leading = style_data['leading']
            color_name = style_data['color']
            color_rgb = self.COLORS[color_name]['rgb']

            # Map to InDesign font names
            if font_family == 'Lora':
                indd_font = f"Lora\\t{font_weight}"
                fallback_font = f"Georgia\\t{font_weight}"
            elif font_family == 'Roboto Flex':
                indd_font = f"Roboto\\t{font_weight}"
                fallback_font = f"Arial\\t{font_weight}"
            else:
                indd_font = f"{font_family}\\t{font_weight}"
                fallback_font = f"Arial\\t{font_weight}"

            script_lines.append(f"    // {style_data['usage']}")
            script_lines.append(f"    var style_{style_name};")
            script_lines.append(f"    try {{")
            script_lines.append(f"        style_{style_name} = doc.paragraphStyles.item('{indd_style_name}');")
            script_lines.append(f"        style_{style_name}.name;")
            script_lines.append(f"    }} catch(e) {{")
            script_lines.append(f"        style_{style_name} = doc.paragraphStyles.add();")
            script_lines.append(f"        style_{style_name}.name = '{indd_style_name}';")
            script_lines.append(f"    }}")
            script_lines.append(f"")
            script_lines.append(f"    style_{style_name}.pointSize = {font_size};")
            script_lines.append(f"    style_{style_name}.leading = {leading};")
            script_lines.append(f"    try {{")
            script_lines.append(f"        style_{style_name}.appliedFont = app.fonts.item('{indd_font}');")
            script_lines.append(f"    }} catch(e) {{")
            script_lines.append(f"        style_{style_name}.appliedFont = app.fonts.item('{fallback_font}');")
            script_lines.append(f"    }}")

            # Apply color
            script_lines.append(f"    var color_{style_name} = doc.colors.item('TEEI_{color_name.title()}');")
            script_lines.append(f"    style_{style_name}.fillColor = color_{style_name};")
            script_lines.append("")

        script_lines.append("    return 'Created ' + doc.paragraphStyles.length + ' paragraph styles';")
        script_lines.append("})();")

        return "\n".join(script_lines)

    def validate_color(self, hex_code):
        """
        Check if a color is in the TEEI brand palette.

        Args:
            hex_code (str): Hex color code (e.g., '#00393F')

        Returns:
            dict: {'valid': bool, 'color_name': str or None, 'message': str}
        """
        # Normalize hex code
        hex_code = hex_code.upper()
        if not hex_code.startswith('#'):
            hex_code = '#' + hex_code

        # Check if forbidden
        if hex_code in self.FORBIDDEN['colors']:
            return {
                'valid': False,
                'color_name': None,
                'message': f'Color {hex_code} is FORBIDDEN (not in TEEI brand palette)'
            }

        # Check if in brand palette
        for name, data in self.COLORS.items():
            if data['hex'].upper() == hex_code:
                return {
                    'valid': True,
                    'color_name': name,
                    'message': f'Valid TEEI color: {name} - {data["usage"]}'
                }

        # Not in palette
        return {
            'valid': False,
            'color_name': None,
            'message': f'Color {hex_code} not found in TEEI brand palette'
        }

    def get_color_for_context(self, context):
        """
        Recommend appropriate TEEI color based on usage context.

        Args:
            context (str): Usage context (e.g., 'header', 'background', 'accent', 'metric')

        Returns:
            dict: Color data for recommended color
        """
        context_map = {
            'header': 'nordshore',
            'header_bg': 'nordshore',
            'section_header': 'nordshore',
            'background': 'sand',
            'background_light': 'sky',
            'background_neutral': 'beige',
            'accent': 'moss',
            'accent_warm': 'gold',
            'accent_bold': 'clay',
            'metric': 'moss',
            'metric_premium': 'gold',
            'text': 'black',
            'text_secondary': 'gray_light',
            'text_on_dark': 'white',
            'cta_bg': 'moss',
            'cta_text': 'white'
        }

        color_name = context_map.get(context.lower(), 'nordshore')
        return self.COLORS[color_name]

    def get_typography_for_context(self, context):
        """
        Get typography specifications for a given context.

        Args:
            context (str): Typography context (e.g., 'title', 'header', 'body')

        Returns:
            dict: Typography specifications
        """
        context_map = {
            'title': 'document_title',
            'main_title': 'document_title',
            'header': 'section_header',
            'section': 'section_header',
            'subheader': 'subhead',
            'subhead': 'subhead',
            'body': 'body',
            'text': 'body',
            'body_bold': 'body_bold',
            'bold': 'body_bold',
            'caption': 'caption',
            'footnote': 'caption',
            'metric': 'metric_number',
            'metric_label': 'metric_label',
            'cta': 'cta',
            'button': 'cta'
        }

        style_name = context_map.get(context.lower(), 'body')
        return self.TYPOGRAPHY[style_name]

    def calculate_grid_position(self, column, row=0, span=1):
        """
        Calculate position based on 12-column grid system.

        Args:
            column (int): Starting column (0-11)
            row (int): Row number (for vertical positioning)
            span (int): Number of columns to span

        Returns:
            dict: {'x': float, 'y': float, 'width': float}
        """
        grid = self.LAYOUT['grid']

        # Calculate column width
        total_gutter_space = grid['gutter'] * (grid['columns'] - 1)
        page_width = 595  # A4 width in points
        available_width = page_width - grid['margin_left'] - grid['margin_right'] - total_gutter_space
        column_width = available_width / grid['columns']

        # Calculate x position
        x = grid['margin_left'] + (column * (column_width + grid['gutter']))

        # Calculate width
        width = (column_width * span) + (grid['gutter'] * (span - 1))

        # Calculate y position (if row-based layout)
        y = grid['margin_top'] + (row * 100)  # 100pt per row (adjustable)

        return {
            'x': x,
            'y': y,
            'width': width,
            'height': 100  # Default height
        }

    def get_spacing(self, context):
        """
        Get appropriate spacing for a given context.

        Args:
            context (str): Spacing context ('section', 'element', 'paragraph')

        Returns:
            float: Spacing in points
        """
        spacing_map = {
            'section': self.LAYOUT['spacing']['section_break'],
            'section_break': self.LAYOUT['spacing']['section_break'],
            'element': self.LAYOUT['spacing']['element_gap'],
            'element_gap': self.LAYOUT['spacing']['element_gap'],
            'paragraph': self.LAYOUT['spacing']['paragraph_gap'],
            'paragraph_gap': self.LAYOUT['spacing']['paragraph_gap']
        }

        return spacing_map.get(context.lower(), self.LAYOUT['spacing']['element_gap'])


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def create_teei_brand_environment(send_command_func, create_command_func):
    """
    Set up complete TEEI brand environment in InDesign document.
    Creates all color swatches and paragraph styles.

    Args:
        send_command_func: Function to send commands to InDesign
        create_command_func: Function to create command objects

    Returns:
        dict: Status of setup
    """
    brand = TEEIBrand()

    # Create color swatches
    color_script = brand.generate_color_swatches_extendscript()
    color_response = send_command_func(create_command_func("executeExtendScript", {"code": color_script}))

    # Create paragraph styles
    style_script = brand.generate_paragraph_styles_extendscript()
    style_response = send_command_func(create_command_func("executeExtendScript", {"code": style_script}))

    return {
        'colors': color_response.get('status') == 'SUCCESS',
        'styles': style_response.get('status') == 'SUCCESS',
        'brand': brand
    }


# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    # Example: Print brand specifications
    brand = TEEIBrand()

    print("TEEI BRAND SYSTEM")
    print("=" * 80)

    print("\nOFFICIAL COLORS:")
    for name, data in brand.COLORS.items():
        print(f"  {name:15} {data['hex']}  RGB{data['rgb']}  - {data['usage']}")

    print("\nTYPOGRAPHY SYSTEM:")
    for name, data in brand.TYPOGRAPHY.items():
        print(f"  {name:20} {data['family']} {data['weight']} {data['size']}pt - {data['usage']}")

    print("\nLAYOUT GRID:")
    print(f"  Columns: {brand.LAYOUT['grid']['columns']}")
    print(f"  Gutter: {brand.LAYOUT['grid']['gutter']}pt")
    print(f"  Margins: {brand.LAYOUT['grid']['margin_top']}pt")

    print("\nCOLOR VALIDATION EXAMPLE:")
    print(brand.validate_color('#00393F'))  # Valid
    print(brand.validate_color('#C87137'))  # Forbidden

    print("\nGRID POSITIONING EXAMPLE:")
    print(brand.calculate_grid_position(column=0, span=6))  # Left half
    print(brand.calculate_grid_position(column=6, span=6))  # Right half
