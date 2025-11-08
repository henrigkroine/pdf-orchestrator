#!/usr/bin/env python3
"""
TEEI Color Harmony System (Python)

Intelligent color harmony system for TEEI brand compliance
- Automatically selects optimal color combinations from TEEI palette
- Calculates contrast ratios for accessibility (WCAG AA/AAA)
- Applies strategic color blocking based on content type
- Prevents forbidden colors automatically
- Generates color overlays and gradients

@version 1.0.0
@author Claude Code
@date 2025-11-08
"""

import json
import math
import os
from typing import Dict, List, Tuple, Optional, Any


class ColorIntelligence:
    """TEEI Color Intelligence Engine"""

    def __init__(self, config_dir: str = None):
        """Initialize color intelligence system with TEEI brand configs"""
        if config_dir is None:
            config_dir = os.path.dirname(os.path.abspath(__file__))

        # Load configurations
        with open(os.path.join(config_dir, 'brand-compliance-config.json'), 'r') as f:
            self.brand_config = json.load(f)

        with open(os.path.join(config_dir, 'color-harmony-config.json'), 'r') as f:
            self.harmony_config = json.load(f)

        self.brand_colors = self.brand_config['colors']['official']
        self.forbidden_colors = self.brand_config['colors']['forbidden']
        self.neutral_colors = self.brand_config['colors']['neutral']
        self.document_schemes = self.harmony_config['document_schemes']
        self.accessibility_matrix = self.harmony_config['accessibility_matrix']
        self.harmony_rules = self.harmony_config['color_theory']['harmony_rules']

    def get_color(self, color_name: str) -> Dict[str, Any]:
        """Get complete color information for a TEEI color"""
        color = self.brand_colors.get(color_name) or self.neutral_colors.get(color_name)
        if not color:
            raise ValueError(f"Color '{color_name}' not found in TEEI palette")
        return color

    def get_hex(self, color_name: str) -> str:
        """Get hex value for a color"""
        return self.get_color(color_name)['hex']

    def get_rgb(self, color_name: str) -> Dict[str, int]:
        """Get RGB values for a color"""
        return self.get_color(color_name)['rgb']

    def get_cmyk(self, color_name: str) -> Dict[str, int]:
        """Get CMYK values for a color (for print)"""
        return self.get_color(color_name)['cmyk']

    def hex_to_rgb(self, hex_color: str) -> Dict[str, int]:
        """Convert hex color to RGB"""
        hex_color = hex_color.lstrip('#')
        return {
            'r': int(hex_color[0:2], 16),
            'g': int(hex_color[2:4], 16),
            'b': int(hex_color[4:6], 16)
        }

    def rgb_to_hex(self, r: int, g: int, b: int) -> str:
        """Convert RGB to hex"""
        return f"#{r:02x}{g:02x}{b:02x}".upper()

    def calculate_luminance(self, rgb: Dict[str, int]) -> float:
        """Calculate relative luminance for WCAG contrast calculations"""
        def adjust(val):
            val = val / 255.0
            return val / 12.92 if val <= 0.03928 else ((val + 0.055) / 1.055) ** 2.4

        r = adjust(rgb['r'])
        g = adjust(rgb['g'])
        b = adjust(rgb['b'])

        return 0.2126 * r + 0.7152 * g + 0.0722 * b

    def get_contrast_ratio(self, color1: str, color2: str) -> Dict[str, Any]:
        """Calculate contrast ratio between two colors"""
        rgb1 = self.get_rgb(color1)
        rgb2 = self.get_rgb(color2)

        l1 = self.calculate_luminance(rgb1)
        l2 = self.calculate_luminance(rgb2)

        lighter = max(l1, l2)
        darker = min(l1, l2)
        ratio = (lighter + 0.05) / (darker + 0.05)

        return {
            'ratio': round(ratio, 1),
            'wcag_aa_normal': ratio >= 4.5,
            'wcag_aa_large': ratio >= 3.0,
            'wcag_aaa': ratio >= 7.0,
            'passes_minimum': ratio >= 4.5
        }

    def validate_accessibility(
        self,
        text_color: str,
        bg_color: str,
        text_size: str = 'normal'
    ) -> Dict[str, Any]:
        """Check if a color combination is accessible"""
        contrast = self.get_contrast_ratio(text_color, bg_color)
        required = 3.0 if text_size == 'large' else 4.5

        passes = contrast['ratio'] >= required
        wcag_level = 'AAA' if contrast['wcag_aaa'] else ('AA' if contrast['wcag_aa_normal'] else 'Fail')

        recommendation = (
            'Accessible - safe to use' if passes
            else f"Low contrast ({contrast['ratio']}). Use {'larger' if text_size == 'large' else 'bolder'} text or choose different colors."
        )

        return {
            'text_color': text_color,
            'bg_color': bg_color,
            'text_size': text_size,
            'contrast': contrast['ratio'],
            'required': required,
            'passes': passes,
            'wcag_level': wcag_level,
            'recommendation': recommendation
        }

    def get_safe_text_color(self, bg_color: str) -> str:
        """Get safe text color for a background"""
        safe_combos = self.accessibility_matrix['safe_combinations']

        # Find pre-calculated safe combination
        for combo in safe_combos:
            if combo['background'] == bg_color:
                return combo['text']

        # Fallback: test white vs black
        white_contrast = self.get_contrast_ratio('white', bg_color)
        black_contrast = self.get_contrast_ratio('black', bg_color)

        return 'white' if white_contrast['ratio'] > black_contrast['ratio'] else 'black'

    def validate_color(self, hex_color: str) -> Dict[str, Any]:
        """Validate if a color is allowed in TEEI brand"""
        hex_color = hex_color.upper()

        # Check if it's a TEEI official color
        for name, color in self.brand_colors.items():
            if color['hex'].upper() == hex_color:
                return {
                    'valid': True,
                    'type': 'official',
                    'name': color['name'],
                    'message': f"✅ Official TEEI color: {color['name']}"
                }

        # Check if it's a neutral color
        for name, color in self.neutral_colors.items():
            if color['hex'].upper() == hex_color:
                return {
                    'valid': True,
                    'type': 'neutral',
                    'name': color['name'],
                    'message': f"✅ Neutral color: {color['name']}"
                }

        # Check if it's a forbidden color
        for key, forbidden in self.forbidden_colors.items():
            if hex_color in [p.upper() for p in forbidden['hex_patterns']]:
                return {
                    'valid': False,
                    'type': 'forbidden',
                    'name': forbidden['name'],
                    'message': f"❌ FORBIDDEN: {forbidden['name']}. Reason: {forbidden['reason']}",
                    'exception': forbidden.get('acceptable_exception')
                }

        # Unknown color - not in TEEI palette
        closest = self.find_closest_teei_color(hex_color)
        return {
            'valid': False,
            'type': 'unknown',
            'message': f"⚠️ Color {hex_color} not in TEEI brand palette. Use official TEEI colors only.",
            'suggestion': closest
        }

    def color_distance(self, rgb1: Dict[str, int], rgb2: Dict[str, int]) -> float:
        """Calculate Euclidean distance between two RGB colors"""
        return math.sqrt(
            (rgb1['r'] - rgb2['r']) ** 2 +
            (rgb1['g'] - rgb2['g']) ** 2 +
            (rgb1['b'] - rgb2['b']) ** 2
        )

    def find_closest_teei_color(self, hex_color: str) -> Dict[str, Any]:
        """Find closest TEEI color to a given hex color"""
        target_rgb = self.hex_to_rgb(hex_color)
        closest_color = None
        min_distance = float('inf')

        for name, color in self.brand_colors.items():
            distance = self.color_distance(target_rgb, color['rgb'])
            if distance < min_distance:
                min_distance = distance
                closest_color = {'name': name, **color}

        return {
            'name': closest_color['name'],
            'hex': closest_color['hex'],
            'message': f"Closest TEEI color: {closest_color['name']} ({closest_color['hex']})"
        }

    def get_document_scheme(self, document_type: str) -> Dict[str, Any]:
        """Get document-specific color scheme"""
        if document_type not in self.document_schemes:
            available = ', '.join(self.document_schemes.keys())
            raise ValueError(
                f"Document type '{document_type}' not found. Available types: {available}"
            )

        scheme = self.document_schemes[document_type]

        # Enrich scheme with actual color values
        return {
            **scheme,
            'colors': {
                'primary': self.get_color(scheme['primary_color']),
                'secondary': [
                    {'name': name, **self.get_color(name)}
                    for name in scheme['secondary_colors']
                ],
                'accent': [
                    {'name': name, **self.get_color(name)}
                    for name in scheme['accent_colors']
                ],
                'background': [
                    {'name': name, **self.get_color(name)}
                    for name in scheme['background_colors']
                ]
            }
        }

    def apply_color_scheme(
        self,
        document_type: str,
        elements: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Apply color scheme to document elements"""
        if elements is None:
            elements = {}

        scheme = self.get_document_scheme(document_type)
        styled = {}

        # Apply header colors
        if 'header' in elements:
            header_scheme = scheme['color_blocking']['header']
            styled['header'] = {
                'background_color': self.get_hex(header_scheme['background']),
                'text_color': self.get_hex(header_scheme['text']),
                'accent_color': self.get_hex(header_scheme['accent']),
                **elements['header']
            }

        # Apply hero section colors
        if 'hero' in elements and 'hero_section' in scheme['color_blocking']:
            hero_scheme = scheme['color_blocking']['hero_section']
            styled['hero'] = {
                'background_color': self.get_hex(hero_scheme['background']),
                'text_color': self.get_hex(hero_scheme['text']),
                'accent_color': self.get_hex(hero_scheme['accent']),
                **elements['hero']
            }

            if 'image_overlay' in hero_scheme:
                styled['hero']['overlay'] = {
                    'color': self.get_hex(hero_scheme['image_overlay']['color']),
                    'opacity': hero_scheme['image_overlay']['opacity']
                }

        # Apply metrics colors
        if 'metrics' in elements and 'metrics' in scheme['color_blocking']:
            metrics_scheme = scheme['color_blocking']['metrics']
            styled['metrics'] = {
                'background_color': self.get_hex(metrics_scheme['background']),
                'card_backgrounds': [
                    self.get_hex(color)
                    for color in metrics_scheme['card_backgrounds']
                ],
                'text_color': self.get_hex(metrics_scheme['numbers']),
                **elements['metrics']
            }

            if 'accent_stripes' in metrics_scheme:
                styled['metrics']['accent_color'] = self.get_hex(metrics_scheme['accent_stripes'])

        # Apply CTA colors
        if 'cta' in elements and 'call_to_action' in scheme['color_blocking']:
            cta_scheme = scheme['color_blocking']['call_to_action']
            styled['cta'] = {
                'background_color': self.get_hex(cta_scheme['background']),
                'text_color': self.get_hex(cta_scheme['text']),
                **elements['cta']
            }

            if 'button' in cta_scheme:
                styled['cta']['button'] = {
                    'background_color': self.get_hex(cta_scheme['button']['background']),
                    'text_color': self.get_hex(cta_scheme['button']['text']),
                    'hover_color': self.get_hex(cta_scheme['button']['hover'])
                }

        # Apply footer colors
        if 'footer' in elements and 'footer' in scheme['color_blocking']:
            footer_scheme = scheme['color_blocking']['footer']
            styled['footer'] = {
                'background_color': self.get_hex(footer_scheme['background']),
                'text_color': self.get_hex(footer_scheme['text']),
                'accent_color': self.get_hex(footer_scheme['accent']),
                **elements['footer']
            }

        return styled

    def generate_overlay(self, overlay_type: str) -> Dict[str, Any]:
        """Generate image overlay configuration"""
        overlays = self.harmony_config['overlay_configurations']['image_overlays']

        if overlay_type not in overlays:
            available = ', '.join(overlays.keys())
            raise ValueError(
                f"Overlay type '{overlay_type}' not found. Available types: {available}"
            )

        overlay = overlays[overlay_type].copy()

        if 'color' in overlay:
            overlay['hex_color'] = self.get_hex(overlay['color'])
            overlay['rgba_color'] = self.get_rgba_string(
                overlay['color'],
                overlay['opacity_range'][0]
            )

        if 'colors' in overlay:
            overlay['hex_colors'] = [
                'transparent' if c == 'transparent' else self.get_hex(c)
                for c in overlay['colors']
            ]

        return overlay

    def get_rgba_string(self, color_name: str, opacity: float = 1.0) -> str:
        """Get RGBA color string"""
        rgb = self.get_rgb(color_name)
        return f"rgba({rgb['r']}, {rgb['g']}, {rgb['b']}, {opacity})"

    def get_css_gradient(self, gradient_config: Dict[str, Any]) -> str:
        """Get CSS gradient string"""
        colors = gradient_config['colors']
        direction = gradient_config['direction']
        opacity = gradient_config.get('opacity', 1)

        color_stops = [
            'transparent' if color == 'transparent' else self.get_rgba_string(color, opacity)
            for color in colors
        ]

        return f"linear-gradient({direction}, {', '.join(color_stops)})"

    def generate_palette(self, document_type: str) -> Dict[str, Any]:
        """Generate complete color palette for a document"""
        scheme = self.get_document_scheme(document_type)

        palette = {
            'document_type': document_type,
            'name': scheme['name'],
            'description': scheme['description'],
            'primary': {
                'name': scheme['primary_color'],
                'hex': self.get_hex(scheme['primary_color']),
                'rgb': self.get_rgb(scheme['primary_color']),
                'cmyk': self.get_cmyk(scheme['primary_color'])
            },
            'secondary': [
                {
                    'name': name,
                    'hex': self.get_hex(name),
                    'rgb': self.get_rgb(name),
                    'cmyk': self.get_cmyk(name)
                }
                for name in scheme['secondary_colors']
            ],
            'accent': [
                {
                    'name': name,
                    'hex': self.get_hex(name),
                    'rgb': self.get_rgb(name),
                    'cmyk': self.get_cmyk(name)
                }
                for name in scheme['accent_colors']
            ],
            'background': [
                {
                    'name': name,
                    'hex': self.get_hex(name),
                    'rgb': self.get_rgb(name),
                    'cmyk': self.get_cmyk(name)
                }
                for name in scheme['background_colors']
            ],
            'usage_distribution': scheme['usage_distribution'],
            'color_blocking': scheme['color_blocking']
        }

        return palette

    def export_css_variables(self, document_type: str) -> str:
        """Export color scheme as CSS variables"""
        palette = self.generate_palette(document_type)
        css = [':root {', '  /* Primary */']

        # Primary
        p = palette['primary']
        css.append(f"  --teei-primary: {p['hex']};")
        css.append(f"  --teei-primary-rgb: {p['rgb']['r']}, {p['rgb']['g']}, {p['rgb']['b']};")

        # Secondary
        css.append('\n  /* Secondary */')
        for i, color in enumerate(palette['secondary'], 1):
            css.append(f"  --teei-secondary-{i}: {color['hex']};")
            css.append(f"  --teei-{color['name']}: {color['hex']};")

        # Accent
        css.append('\n  /* Accent */')
        for i, color in enumerate(palette['accent'], 1):
            css.append(f"  --teei-accent-{i}: {color['hex']};")
            css.append(f"  --teei-{color['name']}: {color['hex']};")

        # Background
        css.append('\n  /* Backgrounds */')
        for i, color in enumerate(palette['background'], 1):
            css.append(f"  --teei-bg-{i}: {color['hex']};")

        css.append('}')
        return '\n'.join(css)

    def validate_document_colors(self, used_colors: List[str]) -> Dict[str, Any]:
        """Validate entire document color usage"""
        report = {
            'total_colors': len(used_colors),
            'valid_colors': [],
            'invalid_colors': [],
            'forbidden_colors': [],
            'warnings': [],
            'passes': True
        }

        for hex_color in used_colors:
            validation = self.validate_color(hex_color)

            if validation['valid']:
                report['valid_colors'].append({'hex': hex_color, **validation})
            else:
                report['passes'] = False
                if validation['type'] == 'forbidden':
                    report['forbidden_colors'].append({'hex': hex_color, **validation})
                else:
                    report['invalid_colors'].append({'hex': hex_color, **validation})

        # Check nordshore usage (should be 40-80%)
        nordshore_hex = self.get_hex('nordshore').upper()
        nordshore_count = sum(1 for c in used_colors if c.upper() == nordshore_hex)
        nordshore_pct = nordshore_count / len(used_colors) if used_colors else 0

        if nordshore_pct < 0.40:
            report['warnings'].append(
                f"Nordshore usage is {nordshore_pct * 100:.1f}%, should be 40-80% (primary brand color)"
            )

        return report

    def get_color_usage_recommendations(self, color_name: str) -> Dict[str, Any]:
        """Get usage recommendations for a color"""
        color = self.get_color(color_name)
        psychology = self.harmony_config['color_theory']['color_psychology'].get(color_name)

        return {
            'name': color['name'],
            'hex': color['hex'],
            'usage': color.get('usage', []),
            'recommended_percentage': color.get('recommended_usage_percentage'),
            'pairs_well_with': color.get('pairs_well_with', []),
            'psychology': psychology,
            'accessibility': color.get('accessibility'),
            'overlay_range': color.get('overlay_opacity_range')
        }


def main():
    """CLI interface for color intelligence system"""
    import sys

    ci = ColorIntelligence()

    if len(sys.argv) < 2:
        print("""
TEEI Color Intelligence System
==============================

Usage:
  python color_harmony.py <command> [options]

Commands:
  palette <type>              Generate color palette for document type
  validate <hex>              Validate if color is allowed
  contrast <color1> <color2>  Calculate contrast ratio
  scheme <type>               Get complete color scheme
  css <type>                  Export CSS variables
  apply <type>                Apply color scheme to elements

Document Types:
  - partnership_document      Premium partnership materials
  - program_overview          Community-focused program materials
  - impact_report             Data-rich reports
  - executive_summary         High-level summaries

Examples:
  python color_harmony.py palette partnership_document
  python color_harmony.py validate "#C87137"
  python color_harmony.py contrast nordshore white
  python color_harmony.py css partnership_document
        """)
        sys.exit(0)

    command = sys.argv[1]

    try:
        if command == 'palette':
            palette = ci.generate_palette(sys.argv[2])
            print(json.dumps(palette, indent=2))

        elif command == 'validate':
            validation = ci.validate_color(sys.argv[2])
            print(validation['message'])
            if 'suggestion' in validation:
                print(validation['suggestion']['message'])
            sys.exit(0 if validation['valid'] else 1)

        elif command == 'contrast':
            contrast = ci.get_contrast_ratio(sys.argv[2], sys.argv[3])
            print(f"Contrast ratio: {contrast['ratio']}:1")
            print(f"WCAG AA (normal): {'✅ Pass' if contrast['wcag_aa_normal'] else '❌ Fail'}")
            print(f"WCAG AA (large): {'✅ Pass' if contrast['wcag_aa_large'] else '❌ Fail'}")
            print(f"WCAG AAA: {'✅ Pass' if contrast['wcag_aaa'] else '❌ Fail'}")

        elif command == 'scheme':
            scheme = ci.get_document_scheme(sys.argv[2])
            print(json.dumps(scheme, indent=2))

        elif command == 'css':
            css = ci.export_css_variables(sys.argv[2])
            print(css)

        elif command == 'apply':
            # Example: Apply color scheme with sample elements
            elements = {
                'header': {},
                'hero': {},
                'metrics': {},
                'cta': {},
                'footer': {}
            }
            styled = ci.apply_color_scheme(sys.argv[2], elements)
            print(json.dumps(styled, indent=2))

        else:
            print(f"Unknown command: {command}")
            sys.exit(1)

    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)


if __name__ == '__main__':
    main()
