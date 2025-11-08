#!/usr/bin/env python3
"""
Template Builder - Python Version
Intelligent InDesign template creation for TEEI brand compliance

Alternative Python implementation of template-generator.js
Useful for Python-based workflows and MCP integration

Usage:
    python template_builder.py list
    python template_builder.py generate partnershipBrochure
    python template_builder.py generate annualReport --output my-template
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Literal

# TEEI Brand Guidelines
TEEI_BRAND = {
    "colors": {
        "nordshore": {"hex": "#00393F", "rgb": [0, 57, 63], "cmyk": [100, 10, 0, 75]},
        "sky": {"hex": "#C9E4EC", "rgb": [201, 228, 236], "cmyk": [15, 3, 0, 7]},
        "sand": {"hex": "#FFF1E2", "rgb": [255, 241, 226], "cmyk": [0, 6, 11, 0]},
        "beige": {"hex": "#EFE1DC", "rgb": [239, 225, 220], "cmyk": [0, 6, 8, 6]},
        "gold": {"hex": "#BA8F5A", "rgb": [186, 143, 90], "cmyk": [0, 23, 52, 27]},
        "moss": {"hex": "#65873B", "rgb": [101, 135, 59], "cmyk": [25, 0, 56, 47]},
        "clay": {"hex": "#913B2F", "rgb": [145, 59, 47], "cmyk": [0, 59, 68, 43]}
    },
    "typography": {
        "documentTitle": {"font": "Lora", "weight": "Bold", "size": 42, "color": "nordshore", "leading": 1.1},
        "sectionHeader": {"font": "Lora", "weight": "SemiBold", "size": 28, "color": "nordshore", "leading": 1.2},
        "subsectionHeader": {"font": "Roboto Flex", "weight": "Medium", "size": 18, "color": "nordshore", "leading": 1.3},
        "bodyText": {"font": "Roboto Flex", "weight": "Regular", "size": 11, "color": "black", "leading": 1.5},
        "caption": {"font": "Roboto Flex", "weight": "Regular", "size": 9, "color": "#666666", "leading": 1.4},
        "pullQuote": {"font": "Lora", "weight": "Italic", "size": 18, "color": "nordshore", "leading": 1.3},
        "statNumber": {"font": "Lora", "weight": "Bold", "size": 48, "color": "gold", "leading": 1.0},
        "buttonText": {"font": "Roboto Flex", "weight": "Bold", "size": 18, "color": "white", "leading": 1.0}
    },
    "layout": {
        "pageSize": {"width": 8.5, "height": 11, "unit": "inches"},
        "margins": {"top": 40, "bottom": 40, "left": 40, "right": 40, "unit": "pt"},
        "columns": {"count": 12, "gutter": 20, "unit": "pt"},
        "baseline": {"increment": 16.5, "unit": "pt"}
    }
}

# Document type definitions
DOCUMENT_TYPES = {
    "partnershipBrochure": {
        "name": "Partnership Brochure",
        "pageCount": 8,
        "pages": [
            {"pattern": "coverHero", "grid": "hierarchical"},
            {"pattern": "twoColumnSplit", "grid": "twoColumn"},
            {"pattern": "twoColumnSplit", "grid": "twoColumn"},
            {"pattern": "statsModular", "grid": "modular"},
            {"pattern": "threeColumn", "grid": "threeColumn"},
            {"pattern": "fullWidthPhoto", "grid": "hierarchical"},
            {"pattern": "diagonalSplit", "grid": "twoColumn"},
            {"pattern": "ctaPage", "grid": "manuscript"}
        ],
        "components": ["pullQuote", "statCard", "sectionHeader", "footer"]
    },
    "programOverview": {
        "name": "Program Overview",
        "pageCount": 4,
        "pages": [
            {"pattern": "coverHero", "grid": "hierarchical"},
            {"pattern": "twoColumnSplit", "grid": "twoColumn"},
            {"pattern": "statsModular", "grid": "modular"},
            {"pattern": "ctaPage", "grid": "manuscript"}
        ],
        "components": ["pullQuote", "statCard", "footer"]
    },
    "annualReport": {
        "name": "Annual Report",
        "pageCount": 12,
        "pages": [
            {"pattern": "coverHero", "grid": "hierarchical"},
            {"pattern": "executiveLetter", "grid": "manuscript"},
            {"pattern": "twoColumnSplit", "grid": "twoColumn"},
            {"pattern": "statsModular", "grid": "modular"},
            {"pattern": "threeColumn", "grid": "threeColumn"},
            {"pattern": "fullWidthPhoto", "grid": "hierarchical"},
            {"pattern": "twoColumnSplit", "grid": "twoColumn"},
            {"pattern": "statsModular", "grid": "modular"},
            {"pattern": "timeline", "grid": "hierarchical"},
            {"pattern": "beforeAfter", "grid": "twoColumn"},
            {"pattern": "infographic", "grid": "modular"},
            {"pattern": "ctaPage", "grid": "manuscript"}
        ],
        "components": ["pullQuote", "statCard", "sectionHeader", "footer", "timeline"]
    }
}


class TemplateBuilder:
    """
    Intelligent InDesign template builder with TEEI brand compliance
    """

    def __init__(self, output_dir: str = "./templates/generated"):
        self.brand = TEEI_BRAND
        self.document_types = DOCUMENT_TYPES
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

        print("[TemplateBuilder] Initialized with TEEI brand guidelines")

    def generate_template_spec(
        self,
        document_type: str,
        customization: Optional[Dict] = None
    ) -> Dict:
        """
        Generate complete template specification

        Args:
            document_type: Type of document (e.g., 'partnershipBrochure')
            customization: Custom overrides

        Returns:
            Complete template specification dictionary
        """
        if document_type not in self.document_types:
            raise ValueError(
                f"Unknown document type: {document_type}. "
                f"Available: {', '.join(self.document_types.keys())}"
            )

        doc_type = self.document_types[document_type]
        customization = customization or {}

        spec = {
            "metadata": {
                "name": doc_type["name"],
                "documentType": document_type,
                "version": "1.0",
                "generated": datetime.utcnow().isoformat() + "Z",
                "brand": "TEEI"
            },
            "document": {
                "size": self.brand["layout"]["pageSize"],
                "margins": self.brand["layout"]["margins"],
                "columns": self.brand["layout"]["columns"],
                "baseline": self.brand["layout"]["baseline"],
                "colorMode": customization.get("colorMode", "RGB"),
                "pageCount": doc_type["pageCount"]
            },
            "masterPages": self._generate_master_pages(doc_type),
            "pages": self._generate_page_specs(doc_type),
            "styles": self._generate_styles(),
            "colors": self._generate_color_swatches(),
            "components": self._generate_component_specs(doc_type["components"])
        }

        # Apply customizations
        if customization:
            spec.update(customization)

        return spec

    def _generate_master_pages(self, doc_type: Dict) -> Dict:
        """Generate master page specifications"""
        return {
            "default": {
                "name": "A-Master",
                "basedOn": None,
                "margins": self.brand["layout"]["margins"],
                "columns": self.brand["layout"]["columns"],
                "elements": [
                    {
                        "type": "footer",
                        "component": "footer",
                        "position": {"x": 40, "y": 720},
                        "locked": True
                    }
                ]
            },
            "cover": {
                "name": "B-Cover",
                "basedOn": None,
                "margins": {"top": 0, "bottom": 0, "left": 0, "right": 0},
                "columns": {"count": 1, "gutter": 0},
                "elements": []
            }
        }

    def _generate_page_specs(self, doc_type: Dict) -> List[Dict]:
        """Generate page-by-page specifications"""
        pages = []

        for index, page_config in enumerate(doc_type["pages"]):
            pages.append({
                "pageNumber": index + 1,
                "masterPage": "cover" if index == 0 else "default",
                "pattern": page_config["pattern"],
                "grid": page_config["grid"],
                "structure": {},
                "visualDensity": self._get_visual_density(page_config["pattern"]),
                "background": self._generate_background_spec(index, len(doc_type["pages"])),
                "layout": self._generate_page_layout(page_config["grid"])
            })

        return pages

    def _get_visual_density(self, pattern: str) -> Literal["low", "medium", "high"]:
        """Determine visual density from pattern"""
        high_density = ["coverHero", "statsModular", "fullWidthPhoto"]
        low_density = ["ctaPage", "executiveLetter"]

        if pattern in high_density:
            return "high"
        elif pattern in low_density:
            return "low"
        else:
            return "medium"

    def _generate_background_spec(self, page_index: int, total_pages: int) -> Dict:
        """Generate background with color rhythm"""
        rhythm_pattern = ["white", "sky30", "white", "sand", "white", "nordshore", "white", "white"]
        pattern = rhythm_pattern[page_index % len(rhythm_pattern)]

        backgrounds = {
            "white": {"color": "#FFFFFF", "opacity": 1},
            "sky30": {"color": self.brand["colors"]["sky"]["hex"], "opacity": 0.3},
            "sand": {"color": self.brand["colors"]["sand"]["hex"], "opacity": 1},
            "nordshore": {"color": self.brand["colors"]["nordshore"]["hex"], "opacity": 1}
        }

        return backgrounds.get(pattern, backgrounds["white"])

    def _generate_page_layout(self, grid_type: str) -> Dict:
        """Generate page layout based on grid"""
        grid_configs = {
            "manuscript": {"gridType": "Manuscript Grid", "columns": 1},
            "twoColumn": {"gridType": "Two-Column Grid", "columns": 2, "gutter": 20},
            "threeColumn": {"gridType": "Three-Column Grid", "columns": 3, "gutter": 20},
            "modular": {"gridType": "Modular Grid", "structure": "4x6"},
            "hierarchical": {"gridType": "Hierarchical Grid", "columns": 1}
        }

        return grid_configs.get(grid_type, {"gridType": "Default", "columns": 1})

    def _generate_styles(self) -> Dict:
        """Generate paragraph and character styles"""
        paragraph_styles = {}

        for key, config in self.brand["typography"].items():
            style_name = self._camel_to_title_case(key)

            paragraph_styles[style_name] = {
                "name": style_name,
                "basedOn": "Basic Paragraph",
                "fontFamily": config["font"],
                "fontStyle": config["weight"],
                "fontSize": config["size"],
                "leading": config["size"] * config["leading"],
                "color": self._resolve_color(config["color"]),
                "alignment": "left",
                "spaceBefore": 60 if "Header" in key or "Title" in key else 0,
                "spaceAfter": 24 if "Header" in key else 12,
                "hyphenation": key == "bodyText"
            }

        return {
            "paragraph": paragraph_styles,
            "character": {}
        }

    def _generate_color_swatches(self) -> List[Dict]:
        """Generate color swatches for InDesign"""
        swatches = []

        for name, color in self.brand["colors"].items():
            # RGB swatch
            swatches.append({
                "name": name.capitalize(),
                "colorModel": "RGB",
                "colorValue": color["rgb"],
                "colorSpace": "sRGB"
            })

            # CMYK swatch
            swatches.append({
                "name": f"{name.capitalize()} CMYK",
                "colorModel": "CMYK",
                "colorValue": color["cmyk"],
                "colorSpace": "FOGRA39"
            })

        return swatches

    def _generate_component_specs(self, component_list: List[str]) -> Dict:
        """Generate component specifications"""
        components = {
            "pullQuote": {
                "name": "Pull Quote",
                "variants": ["floating", "sidebar", "fullWidth", "overlapping"],
                "defaultStyle": {
                    "background": {"color": "sky", "opacity": 0.2},
                    "padding": 20,
                    "textStyle": "pullQuote"
                }
            },
            "statCard": {
                "name": "Statistic Card",
                "structure": {
                    "icon": {"size": 60, "color": "nordshore"},
                    "number": {"style": "statNumber", "color": "gold"},
                    "label": {"style": "caption", "color": "#666666"}
                }
            },
            "sectionHeader": {
                "name": "Section Header",
                "defaultStyle": {
                    "textStyle": "sectionHeader",
                    "underline": {"color": "sky", "width": 5, "offset": 10},
                    "spaceBefore": 60,
                    "spaceAfter": 24
                }
            },
            "footer": {
                "name": "Running Footer",
                "structure": {
                    "logo": {"size": 40, "position": "left"},
                    "pageNumber": {"style": "caption", "position": "center"},
                    "tagline": {"style": "caption", "position": "right"}
                }
            }
        }

        return {name: components[name] for name in component_list if name in components}

    def generate_indesign_script(self, spec: Dict) -> str:
        """Generate ExtendScript for InDesign"""
        script = f"""
// Auto-generated InDesign Template Script
// Template: {spec['metadata']['name']}
// Generated: {spec['metadata']['generated']}
// Brand: TEEI

#target indesign

function createTemplate() {{
  var doc, page, textFrame, rect;

  // Create new document
  var docPreset = app.documentPresets.add();
  docPreset.pageWidth = "{spec['document']['size']['width']}{spec['document']['size']['unit']}";
  docPreset.pageHeight = "{spec['document']['size']['height']}{spec['document']['size']['unit']}";
  docPreset.facingPages = false;
  docPreset.pagesPerDocument = {spec['document']['pageCount']};

  doc = app.documents.add(docPreset);

  // Set margins
  doc.marginPreferences.top = "{spec['document']['margins']['top']}{spec['document']['margins']['unit']}";
  doc.marginPreferences.bottom = "{spec['document']['margins']['bottom']}{spec['document']['margins']['unit']}";
  doc.marginPreferences.left = "{spec['document']['margins']['left']}{spec['document']['margins']['unit']}";
  doc.marginPreferences.right = "{spec['document']['margins']['right']}{spec['document']['margins']['unit']}";

  // Set baseline grid
  doc.gridPreferences.baselineStart = "{spec['document']['baseline']['increment']}{spec['document']['baseline']['unit']}";
  doc.gridPreferences.baselineDivision = "{spec['document']['baseline']['increment']}{spec['document']['baseline']['unit']}";

  alert("Template '{spec['metadata']['name']}' created successfully!");
  return doc;
}}

// Execute
createTemplate();
"""
        return script

    def save_template_spec(self, spec: Dict, filename: str) -> Path:
        """Save template specification to JSON"""
        filepath = self.output_dir / f"{filename}.json"
        with open(filepath, 'w') as f:
            json.dump(spec, f, indent=2)

        print(f"[TemplateBuilder] Template spec saved: {filepath}")
        return filepath

    def save_indesign_script(self, spec: Dict, filename: str) -> Path:
        """Save InDesign script to .jsx file"""
        script = self.generate_indesign_script(spec)
        filepath = self.output_dir / f"{filename}.jsx"

        with open(filepath, 'w') as f:
            f.write(script)

        print(f"[TemplateBuilder] InDesign script saved: {filepath}")
        return filepath

    def generate_template(
        self,
        document_type: str,
        filename: Optional[str] = None,
        customization: Optional[Dict] = None,
        generate_script: bool = True
    ) -> Dict[str, Path]:
        """
        Generate complete template package

        Args:
            document_type: Type of document
            filename: Output filename (without extension)
            customization: Custom overrides
            generate_script: Whether to generate InDesign script

        Returns:
            Dictionary with paths to generated files
        """
        print(f"[TemplateBuilder] Generating template: {document_type}")

        # Generate specification
        spec = self.generate_template_spec(document_type, customization)

        # Determine filename
        if not filename:
            filename = f"{document_type}-{int(datetime.now().timestamp())}"

        # Save outputs
        outputs = {}

        # Save spec
        outputs["spec"] = self.save_template_spec(spec, filename)

        # Save script
        if generate_script:
            outputs["script"] = self.save_indesign_script(spec, filename)

        print(f"[TemplateBuilder] Template generation complete")
        return outputs

    def list_document_types(self) -> List[Dict]:
        """List available document types"""
        return [
            {
                "id": key,
                "name": value["name"],
                "pageCount": value["pageCount"],
                "components": value["components"]
            }
            for key, value in self.document_types.items()
        ]

    # Utility methods

    def _camel_to_title_case(self, text: str) -> str:
        """Convert camelCase to Title Case"""
        import re
        return re.sub(r'([A-Z])', r' \1', text).strip().title()

    def _resolve_color(self, color: str) -> str:
        """Resolve color name to hex"""
        if color.startswith('#'):
            return color
        if color in self.brand["colors"]:
            return self.brand["colors"][color]["hex"]
        return color


def main():
    """CLI interface"""
    import argparse

    parser = argparse.ArgumentParser(description='TEEI Template Builder')
    subparsers = parser.add_subparsers(dest='command', help='Commands')

    # List command
    subparsers.add_parser('list', help='List available document types')

    # Generate command
    generate_parser = subparsers.add_parser('generate', help='Generate a template')
    generate_parser.add_argument('type', help='Document type')
    generate_parser.add_argument('--output', '-o', help='Output filename')
    generate_parser.add_argument('--no-script', action='store_true', help='Skip InDesign script')
    generate_parser.add_argument('--cmyk', action='store_true', help='Use CMYK color mode')

    args = parser.parse_args()

    builder = TemplateBuilder()

    if args.command == 'list':
        print("\nAvailable Document Types:")
        for doc_type in builder.list_document_types():
            print(f"  {doc_type['id']}: {doc_type['name']} ({doc_type['pageCount']} pages)")

    elif args.command == 'generate':
        customization = {}
        if args.cmyk:
            customization['colorMode'] = 'CMYK'

        outputs = builder.generate_template(
            args.type,
            filename=args.output,
            customization=customization,
            generate_script=not args.no_script
        )

        print("\nGeneration complete:")
        for key, path in outputs.items():
            print(f"  {key.capitalize()}: {path}")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
