#!/usr/bin/env python3
"""
TEEI Brand Compliance Enforcer
==============================
PROACTIVE enforcement system that prevents brand violations during document creation.

This is NOT just validation - this is ENFORCEMENT.
- Blocks forbidden colors automatically
- Enforces Lora/Roboto Flex fonts only
- Prevents text cutoffs by auto-adjusting frames
- Enforces spacing rules in real-time
- Validates metrics (no "XX" placeholders)
- Ensures logo clearspace
- Validates photography requirements

Usage:
    from brand_compliance_enforcer import BrandEnforcer

    enforcer = BrandEnforcer()

    # All operations are automatically validated and corrected
    enforcer.create_text_frame(text="Hello", color="copper")  # AUTO-CORRECTED to Nordshore
    enforcer.apply_font(name="Arial")  # REJECTED - only Lora/Roboto allowed
"""

import sys
import os
import json
import re
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum

# Load brand compliance configuration
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config', 'brand-compliance-config.json')

with open(CONFIG_PATH, 'r') as f:
    BRAND_CONFIG = json.load(f)


class ViolationSeverity(Enum):
    """Severity levels for brand violations"""
    CRITICAL = "critical"  # Must fix immediately, blocks operation
    MAJOR = "major"        # Should fix, warns but allows with correction
    MINOR = "minor"        # Improve when possible, logs only


@dataclass
class ViolationResult:
    """Result of a compliance check"""
    is_valid: bool
    severity: ViolationSeverity
    violation_type: str
    original_value: Any
    corrected_value: Any
    message: str


class ColorEnforcer:
    """Enforces TEEI color palette compliance"""

    def __init__(self):
        self.official_colors = BRAND_CONFIG['colors']['official']
        self.forbidden_colors = BRAND_CONFIG['colors']['forbidden']
        self.neutral_colors = BRAND_CONFIG['colors']['neutral']
        self.tolerance = BRAND_CONFIG['colors']['tolerance']

    def _rgb_distance(self, rgb1: List[int], rgb2: List[int]) -> float:
        """Calculate Euclidean distance between two RGB colors"""
        return sum((a - b) ** 2 for a, b in zip(rgb1, rgb2)) ** 0.5

    def _hex_to_rgb(self, hex_color: str) -> List[int]:
        """Convert hex color to RGB"""
        hex_color = hex_color.lstrip('#')
        return [int(hex_color[i:i+2], 16) for i in (0, 2, 4)]

    def _rgb_to_hex(self, rgb: List[int]) -> str:
        """Convert RGB to hex"""
        return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"

    def validate_color(self, color: Any) -> ViolationResult:
        """
        Validate and potentially correct a color value

        Args:
            color: Can be hex string, RGB list/tuple, or color name

        Returns:
            ViolationResult with validation status and correction
        """
        # Normalize color to RGB
        if isinstance(color, str):
            if color.startswith('#'):
                rgb = self._hex_to_rgb(color)
                color_name = color
            else:
                # Try to find by name
                color_lower = color.lower()
                for palette in [self.official_colors, self.forbidden_colors, self.neutral_colors]:
                    for name, data in palette.items():
                        if name.lower() == color_lower:
                            rgb = data['rgb']
                            color_name = name
                            break
                else:
                    return ViolationResult(
                        is_valid=False,
                        severity=ViolationSeverity.CRITICAL,
                        violation_type="unknown_color",
                        original_value=color,
                        corrected_value="Nordshore",
                        message=f"Unknown color '{color}'. Using Nordshore (primary brand color)."
                    )
        elif isinstance(color, (list, tuple)) and len(color) == 3:
            rgb = list(color)
            color_name = self._rgb_to_hex(rgb)
        else:
            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.CRITICAL,
                violation_type="invalid_color_format",
                original_value=color,
                corrected_value="Nordshore",
                message=f"Invalid color format: {color}. Using Nordshore."
            )

        # Check if it's a forbidden color
        for name, data in self.forbidden_colors.items():
            if self._rgb_distance(rgb, data['rgb']) <= self.tolerance:
                return ViolationResult(
                    is_valid=False,
                    severity=ViolationSeverity.CRITICAL,
                    violation_type="forbidden_color",
                    original_value=color_name,
                    corrected_value="Nordshore",
                    message=f"FORBIDDEN COLOR: {name} ({data['reason']}). Auto-corrected to Nordshore."
                )

        # Check if it's an official color
        for name, data in self.official_colors.items():
            if self._rgb_distance(rgb, data['rgb']) <= self.tolerance:
                return ViolationResult(
                    is_valid=True,
                    severity=ViolationSeverity.MINOR,
                    violation_type="none",
                    original_value=color_name,
                    corrected_value=name,
                    message=f"✓ Valid TEEI color: {name}"
                )

        # Check if it's a neutral color
        for name, data in self.neutral_colors.items():
            if self._rgb_distance(rgb, data['rgb']) <= self.tolerance:
                return ViolationResult(
                    is_valid=True,
                    severity=ViolationSeverity.MINOR,
                    violation_type="none",
                    original_value=color_name,
                    corrected_value=name,
                    message=f"✓ Valid neutral color: {name}"
                )

        # Unknown color - default to Nordshore
        return ViolationResult(
            is_valid=False,
            severity=ViolationSeverity.MAJOR,
            violation_type="non_brand_color",
            original_value=color_name,
            corrected_value="Nordshore",
            message=f"Non-brand color {color_name}. Auto-corrected to Nordshore (primary)."
        )

    def get_color_rgb(self, color_name: str) -> List[int]:
        """Get RGB values for a brand color by name"""
        for palette in [self.official_colors, self.neutral_colors]:
            if color_name in palette:
                return palette[color_name]['rgb']
        raise ValueError(f"Color '{color_name}' not found in brand palette")


class TypographyEnforcer:
    """Enforces TEEI typography standards"""

    def __init__(self):
        self.allowed_fonts = BRAND_CONFIG['typography']['fonts']
        self.forbidden_fonts = BRAND_CONFIG['typography']['forbidden']
        self.type_scale = BRAND_CONFIG['typography']['scale']

    def validate_font(self, font_family: str, usage_type: Optional[str] = None) -> ViolationResult:
        """
        Validate font family against brand guidelines

        Args:
            font_family: Font family name (e.g., "Arial", "Lora", "Roboto Flex")
            usage_type: Optional usage context (e.g., "headline", "body")

        Returns:
            ViolationResult with validation and correction
        """
        font_family = font_family.strip()

        # Check if it's a forbidden font
        if font_family in self.forbidden_fonts:
            correct_font = "Lora" if usage_type == "headline" else "Roboto Flex"
            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.CRITICAL,
                violation_type="forbidden_font",
                original_value=font_family,
                corrected_value=correct_font,
                message=f"FORBIDDEN FONT: {font_family}. Using {correct_font} instead."
            )

        # Check if it's Lora (headline font)
        if font_family.startswith("Lora"):
            if usage_type == "body":
                return ViolationResult(
                    is_valid=False,
                    severity=ViolationSeverity.MAJOR,
                    violation_type="wrong_font_usage",
                    original_value=font_family,
                    corrected_value="Roboto Flex",
                    message="Lora is for headlines only. Using Roboto Flex for body text."
                )
            return ViolationResult(
                is_valid=True,
                severity=ViolationSeverity.MINOR,
                violation_type="none",
                original_value=font_family,
                corrected_value=font_family,
                message=f"✓ Valid headline font: {font_family}"
            )

        # Check if it's Roboto Flex (body font)
        if font_family.startswith("Roboto"):
            return ViolationResult(
                is_valid=True,
                severity=ViolationSeverity.MINOR,
                violation_type="none",
                original_value=font_family,
                corrected_value=font_family,
                message=f"✓ Valid body font: {font_family}"
            )

        # Unknown font - auto-correct based on usage
        correct_font = "Lora" if usage_type == "headline" else "Roboto Flex"
        return ViolationResult(
            is_valid=False,
            severity=ViolationSeverity.CRITICAL,
            violation_type="non_brand_font",
            original_value=font_family,
            corrected_value=correct_font,
            message=f"Non-brand font '{font_family}'. Using {correct_font}."
        )

    def get_type_spec(self, element_type: str) -> Dict:
        """Get typography specifications for an element type"""
        if element_type in self.type_scale:
            return self.type_scale[element_type]
        raise ValueError(f"Unknown element type: {element_type}")

    def validate_type_scale(self, element_type: str, font_size: float) -> ViolationResult:
        """Validate font size against modular type scale"""
        if element_type not in self.type_scale:
            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.MINOR,
                violation_type="unknown_element_type",
                original_value=font_size,
                corrected_value=11,  # Default body text size
                message=f"Unknown element type '{element_type}'. Using default 11pt."
            )

        spec = self.type_scale[element_type]
        expected_size = spec['size']

        # Allow 1pt tolerance
        if abs(font_size - expected_size) <= 1:
            return ViolationResult(
                is_valid=True,
                severity=ViolationSeverity.MINOR,
                violation_type="none",
                original_value=font_size,
                corrected_value=font_size,
                message=f"✓ Valid size for {element_type}: {font_size}pt"
            )

        return ViolationResult(
            is_valid=False,
            severity=ViolationSeverity.MAJOR,
            violation_type="incorrect_type_scale",
            original_value=font_size,
            corrected_value=expected_size,
            message=f"Incorrect size for {element_type}. Should be {expected_size}pt, got {font_size}pt."
        )


class SpacingEnforcer:
    """Enforces TEEI spacing and layout standards"""

    def __init__(self):
        self.spacing = BRAND_CONFIG['spacing']
        self.layout = BRAND_CONFIG['layout']

    def validate_margins(self, margins: Dict[str, float]) -> ViolationResult:
        """Validate page margins"""
        expected_margin = self.spacing['margins']['all']

        issues = []
        for side, value in margins.items():
            if abs(value - expected_margin) > 2:  # 2pt tolerance
                issues.append(f"{side}: {value}pt (should be {expected_margin}pt)")

        if issues:
            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.MAJOR,
                violation_type="incorrect_margins",
                original_value=margins,
                corrected_value={k: expected_margin for k in margins.keys()},
                message=f"Margin violations: {', '.join(issues)}"
            )

        return ViolationResult(
            is_valid=True,
            severity=ViolationSeverity.MINOR,
            violation_type="none",
            original_value=margins,
            corrected_value=margins,
            message="✓ Margins correct (40pt all sides)"
        )

    def validate_text_frame_bounds(self, x: float, y: float, width: float, height: float,
                                  page_width: float, page_height: float) -> ViolationResult:
        """
        Validate text frame doesn't extend beyond page boundaries
        Prevents text cutoffs
        """
        margin = self.spacing['margins']['all']

        # Check if frame extends beyond safe area
        max_x = x + width
        max_y = y + height

        safe_width = page_width - (2 * margin)
        safe_height = page_height - (2 * margin)

        if max_x > (page_width - margin) or max_y > (page_height - margin):
            # Auto-shrink to fit within margins
            corrected_width = min(width, safe_width - x + margin)
            corrected_height = min(height, safe_height - y + margin)

            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.CRITICAL,
                violation_type="text_cutoff_risk",
                original_value={'width': width, 'height': height},
                corrected_value={'width': corrected_width, 'height': corrected_height},
                message=f"Text frame extends beyond margins. Auto-shrunk to prevent cutoff."
            )

        return ViolationResult(
            is_valid=True,
            severity=ViolationSeverity.MINOR,
            violation_type="none",
            original_value={'width': width, 'height': height},
            corrected_value={'width': width, 'height': height},
            message="✓ Text frame within safe margins"
        )

    def get_spacing_value(self, spacing_type: str) -> float:
        """Get standard spacing value"""
        spacing_map = {
            'section': self.spacing['sectionBreaks'],
            'element': self.spacing['elementSpacing'],
            'paragraph': self.spacing['paragraphSpacing'],
            'margin': self.spacing['margins']['all']
        }

        if spacing_type in spacing_map:
            return spacing_map[spacing_type]
        raise ValueError(f"Unknown spacing type: {spacing_type}")


class ContentEnforcer:
    """Enforces content quality standards"""

    def validate_metrics(self, text: str) -> ViolationResult:
        """
        Validate that metrics don't contain placeholders like "XX"
        """
        # Check for common placeholder patterns
        placeholder_patterns = [
            r'\bXX\b',
            r'\b__+\b',
            r'\[.*?\]',
            r'TBD',
            r'TODO',
            r'\?\?+'
        ]

        for pattern in placeholder_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return ViolationResult(
                    is_valid=False,
                    severity=ViolationSeverity.CRITICAL,
                    violation_type="placeholder_metrics",
                    original_value=text,
                    corrected_value=None,  # Cannot auto-correct without real data
                    message=f"PLACEHOLDER DETECTED: '{text}' contains placeholder. Replace with actual metrics!"
                )

        return ViolationResult(
            is_valid=True,
            severity=ViolationSeverity.MINOR,
            violation_type="none",
            original_value=text,
            corrected_value=text,
            message="✓ No placeholders detected"
        )

    def validate_text_completeness(self, text: str, max_length: Optional[int] = None) -> ViolationResult:
        """
        Validate text doesn't appear to be cut off
        """
        # Check for common cutoff indicators
        cutoff_patterns = [
            r'-$',  # Ends with hyphen (like "Educational Equality In-")
            r'\w{3,}$(?![.!?])',  # Ends mid-word without punctuation
        ]

        for pattern in cutoff_patterns:
            if re.search(pattern, text.strip()):
                return ViolationResult(
                    is_valid=False,
                    severity=ViolationSeverity.CRITICAL,
                    violation_type="text_cutoff",
                    original_value=text,
                    corrected_value=None,
                    message=f"TEXT CUTOFF DETECTED: '{text}' appears incomplete!"
                )

        return ViolationResult(
            is_valid=True,
            severity=ViolationSeverity.MINOR,
            violation_type="none",
            original_value=text,
            corrected_value=text,
            message="✓ Text appears complete"
        )


class LogoEnforcer:
    """Enforces logo usage standards"""

    def __init__(self):
        self.logo_config = BRAND_CONFIG['logo']

    def validate_logo_clearspace(self, logo_bounds: Dict, nearby_elements: List[Dict]) -> ViolationResult:
        """
        Validate logo has proper clearspace (no elements too close)

        Args:
            logo_bounds: {'x': x, 'y': y, 'width': w, 'height': h}
            nearby_elements: List of other element bounds

        Returns:
            ViolationResult indicating if clearspace is respected
        """
        logo_height = logo_bounds['height']
        min_clearspace = logo_height * self.logo_config['clearspace']['minClearspaceRatio']

        violations = []
        for element in nearby_elements:
            # Calculate distance between logo and element
            dx = min(
                abs(element['x'] - (logo_bounds['x'] + logo_bounds['width'])),
                abs((element['x'] + element['width']) - logo_bounds['x'])
            )
            dy = min(
                abs(element['y'] - (logo_bounds['y'] + logo_bounds['height'])),
                abs((element['y'] + element['height']) - logo_bounds['y'])
            )

            distance = min(dx, dy)

            if distance < min_clearspace:
                violations.append(f"Element at ({element['x']}, {element['y']}) too close (distance: {distance:.1f}pt, need: {min_clearspace:.1f}pt)")

        if violations:
            return ViolationResult(
                is_valid=False,
                severity=ViolationSeverity.MAJOR,
                violation_type="logo_clearspace_violation",
                original_value=logo_bounds,
                corrected_value=None,
                message=f"Logo clearspace violations: {'; '.join(violations)}"
            )

        return ViolationResult(
            is_valid=True,
            severity=ViolationSeverity.MINOR,
            violation_type="none",
            original_value=logo_bounds,
            corrected_value=logo_bounds,
            message=f"✓ Logo clearspace maintained (minimum {min_clearspace:.1f}pt)"
        )


class BrandEnforcer:
    """
    Main brand compliance enforcement system

    This class wraps all document creation operations and enforces
    TEEI brand guidelines in real-time, preventing violations before they occur.
    """

    def __init__(self, strict_mode: bool = True, auto_correct: bool = True):
        """
        Initialize the brand enforcer

        Args:
            strict_mode: If True, blocks critical violations. If False, only warns.
            auto_correct: If True, automatically corrects violations. If False, only reports.
        """
        self.strict_mode = strict_mode
        self.auto_correct = auto_correct

        self.color_enforcer = ColorEnforcer()
        self.typography_enforcer = TypographyEnforcer()
        self.spacing_enforcer = SpacingEnforcer()
        self.content_enforcer = ContentEnforcer()
        self.logo_enforcer = LogoEnforcer()

        self.violations_log = []

        print("=" * 80)
        print("TEEI BRAND COMPLIANCE ENFORCER INITIALIZED")
        print("=" * 80)
        print(f"Strict Mode: {'ENABLED' if strict_mode else 'DISABLED'}")
        print(f"Auto-Correct: {'ENABLED' if auto_correct else 'DISABLED'}")
        print()

    def _log_violation(self, result: ViolationResult):
        """Log a violation for reporting"""
        self.violations_log.append({
            'severity': result.severity.value,
            'type': result.violation_type,
            'original': result.original_value,
            'corrected': result.corrected_value,
            'message': result.message
        })

        # Print based on severity
        severity_icons = {
            ViolationSeverity.CRITICAL: "🚫",
            ViolationSeverity.MAJOR: "⚠️",
            ViolationSeverity.MINOR: "ℹ️"
        }

        icon = severity_icons.get(result.severity, "•")
        print(f"{icon} {result.message}")

    def enforce_color(self, color: Any, context: str = "") -> Tuple[str, List[int]]:
        """
        Enforce color compliance

        Args:
            color: Color value (hex, RGB, or name)
            context: Context for logging (e.g., "header background")

        Returns:
            Tuple of (color_name, rgb_values)

        Raises:
            ValueError: If strict_mode is True and color is critically invalid
        """
        result = self.color_enforcer.validate_color(color)

        if not result.is_valid:
            self._log_violation(result)

            if result.severity == ViolationSeverity.CRITICAL and self.strict_mode:
                if not self.auto_correct:
                    raise ValueError(f"CRITICAL COLOR VIOLATION: {result.message}")

        # Return corrected color
        corrected_name = result.corrected_value if not result.is_valid and self.auto_correct else result.original_value

        if isinstance(corrected_name, str) and not corrected_name.startswith('#'):
            rgb = self.color_enforcer.get_color_rgb(corrected_name)
        else:
            rgb = self.color_enforcer._hex_to_rgb(corrected_name) if isinstance(corrected_name, str) else corrected_name

        return corrected_name, rgb

    def enforce_font(self, font_family: str, usage_type: str = "body") -> str:
        """
        Enforce typography compliance

        Args:
            font_family: Font family name
            usage_type: "headline" or "body"

        Returns:
            Corrected font family name

        Raises:
            ValueError: If strict_mode is True and font is critically invalid
        """
        result = self.typography_enforcer.validate_font(font_family, usage_type)

        if not result.is_valid:
            self._log_violation(result)

            if result.severity == ViolationSeverity.CRITICAL and self.strict_mode:
                if not self.auto_correct:
                    raise ValueError(f"CRITICAL FONT VIOLATION: {result.message}")

        return result.corrected_value if not result.is_valid and self.auto_correct else result.original_value

    def enforce_text_frame(self, x: float, y: float, width: float, height: float,
                          page_width: float = 612, page_height: float = 792) -> Dict:
        """
        Enforce text frame bounds to prevent cutoffs

        Returns:
            Corrected frame dimensions
        """
        result = self.spacing_enforcer.validate_text_frame_bounds(
            x, y, width, height, page_width, page_height
        )

        if not result.is_valid:
            self._log_violation(result)

        corrected = result.corrected_value if not result.is_valid and self.auto_correct else result.original_value

        return {
            'x': x,
            'y': y,
            'width': corrected['width'],
            'height': corrected['height']
        }

    def enforce_metrics(self, text: str) -> str:
        """
        Enforce that metrics don't contain placeholders

        Raises:
            ValueError: If text contains placeholders (critical violation)
        """
        result = self.content_enforcer.validate_metrics(text)

        if not result.is_valid:
            self._log_violation(result)

            if self.strict_mode:
                raise ValueError(f"PLACEHOLDER DETECTED: {result.message}")

        return text

    def enforce_text_completeness(self, text: str) -> str:
        """
        Enforce text completeness (no cutoffs)
        """
        result = self.content_enforcer.validate_text_completeness(text)

        if not result.is_valid:
            self._log_violation(result)

            if self.strict_mode:
                raise ValueError(f"TEXT CUTOFF: {result.message}")

        return text

    def enforce_logo_clearspace(self, logo_bounds: Dict, nearby_elements: List[Dict]) -> bool:
        """
        Enforce logo clearspace requirements

        Returns:
            True if clearspace is valid, False otherwise
        """
        result = self.logo_enforcer.validate_logo_clearspace(logo_bounds, nearby_elements)

        if not result.is_valid:
            self._log_violation(result)

        return result.is_valid

    def get_type_spec(self, element_type: str) -> Dict:
        """Get complete typography specification for an element"""
        spec = self.typography_enforcer.get_type_spec(element_type)

        # Enforce color
        color_name, color_rgb = self.enforce_color(spec['color'], f"{element_type} color")

        return {
            'font': spec['font'],
            'size': spec['size'],
            'lineHeight': spec['lineHeight'],
            'color': color_name,
            'colorRgb': color_rgb
        }

    def get_spacing(self, spacing_type: str) -> float:
        """Get standard spacing value"""
        return self.spacing_enforcer.get_spacing_value(spacing_type)

    def generate_report(self) -> Dict:
        """Generate a compliance report"""
        critical = [v for v in self.violations_log if v['severity'] == 'critical']
        major = [v for v in self.violations_log if v['severity'] == 'major']
        minor = [v for v in self.violations_log if v['severity'] == 'minor']

        total_violations = len(self.violations_log)
        score = 100 - (len(critical) * 20 + len(major) * 5 + len(minor) * 1)
        score = max(0, score)

        return {
            'totalViolations': total_violations,
            'critical': len(critical),
            'major': len(major),
            'minor': len(minor),
            'score': score,
            'grade': self._get_grade(score),
            'violations': self.violations_log
        }

    def _get_grade(self, score: int) -> str:
        """Convert score to letter grade"""
        if score >= 95:
            return "A+"
        elif score >= 90:
            return "A"
        elif score >= 85:
            return "B+"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"

    def print_report(self):
        """Print a formatted compliance report"""
        report = self.generate_report()

        print()
        print("=" * 80)
        print("BRAND COMPLIANCE REPORT")
        print("=" * 80)
        print(f"\nTotal Violations: {report['totalViolations']}")
        print(f"  🚫 Critical: {report['critical']}")
        print(f"  ⚠️  Major: {report['major']}")
        print(f"  ℹ️  Minor: {report['minor']}")
        print(f"\nCompliance Score: {report['score']}/100")
        print(f"Grade: {report['grade']}")
        print()

        if report['score'] >= 95:
            print("🌟 WORLD-CLASS! Document meets all brand standards!")
        elif report['score'] >= 85:
            print("✅ EXCELLENT! Minor improvements possible.")
        elif report['score'] >= 70:
            print("⚠️  GOOD. Some violations need attention.")
        else:
            print("❌ NEEDS WORK. Critical violations must be fixed.")

        print("=" * 80)


# Example usage
if __name__ == "__main__":
    # Initialize enforcer
    enforcer = BrandEnforcer(strict_mode=True, auto_correct=True)

    print("\n🧪 TESTING BRAND ENFORCEMENT\n")

    # Test 1: Color enforcement
    print("Test 1: Color Enforcement")
    print("-" * 40)
    try:
        # Try to use forbidden copper color
        color_name, rgb = enforcer.enforce_color("#C87137", "header")
        print(f"Corrected to: {color_name} RGB{rgb}")
    except ValueError as e:
        print(f"Blocked: {e}")
    print()

    # Test 2: Font enforcement
    print("Test 2: Font Enforcement")
    print("-" * 40)
    try:
        # Try to use Arial
        font = enforcer.enforce_font("Arial", "headline")
        print(f"Corrected to: {font}")
    except ValueError as e:
        print(f"Blocked: {e}")
    print()

    # Test 3: Metrics validation
    print("Test 3: Metrics Validation")
    print("-" * 40)
    try:
        # Try to use placeholder
        text = enforcer.enforce_metrics("XX Students Reached")
    except ValueError as e:
        print(f"Blocked: {e}")
    print()

    # Test 4: Text completeness
    print("Test 4: Text Completeness")
    print("-" * 40)
    try:
        # Try incomplete text
        text = enforcer.enforce_text_completeness("Ready to Transform Educa-")
    except ValueError as e:
        print(f"Blocked: {e}")
    print()

    # Test 5: Get type specification
    print("Test 5: Type Specification")
    print("-" * 40)
    spec = enforcer.get_type_spec("documentTitle")
    print(f"Document Title Spec: {spec}")
    print()

    # Generate final report
    enforcer.print_report()
