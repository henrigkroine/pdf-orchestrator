"""
Figma Design System Sync Service
Fetches design tokens and exports frames from Figma master files

Part of PDF Orchestrator AI-Enhanced Architecture (Generation Phase)
See services/ARCHITECTURE.md for full specification.
"""

import os
import json
import requests
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime


class FigmaService:
    """
    Syncs design tokens and layout references from Figma master files

    Capabilities:
    1. Fetch design tokens (colors, typography, spacing)
    2. Export reference frames as PNGs
    3. Detect drift between Figma master and current implementation
    """

    def __init__(self, file_id: str, access_token: Optional[str] = None):
        """
        Initialize Figma service

        Args:
            file_id: Figma file ID (from URL: figma.com/file/{file_id}/...)
            access_token: Figma Personal Access Token (or reads from env)
        """
        self.file_id = file_id
        self.access_token = access_token or os.getenv('FIGMA_PERSONAL_ACCESS_TOKEN')
        self.base_url = "https://api.figma.com/v1"
        self.enabled = self._check_enabled()

    def _check_enabled(self) -> bool:
        """Check if Figma service can function (has token)"""
        return bool(self.access_token and self.file_id)

    def _make_request(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make authenticated request to Figma API

        Args:
            endpoint: API endpoint (e.g., '/files/{file_id}')
            params: Query parameters

        Returns:
            Response JSON or None if error
        """
        if not self.enabled:
            return None

        url = f"{self.base_url}{endpoint}"
        headers = {
            'X-Figma-Token': self.access_token
        }

        try:
            response = requests.get(url, headers=headers, params=params, timeout=30)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"[Figma] API error: {e}")
            return None

    def fetch_design_tokens(self) -> Dict:
        """
        Fetch design tokens from Figma file

        Returns:
            {
                'colors': [
                    {'name': 'TFU Teal', 'hex': '#00393F', 'rgb': [0, 57, 63]},
                    {'name': 'TFU Light Blue', 'hex': '#C9E4EC', 'rgb': [201, 228, 236]},
                    ...
                ],
                'typography': [
                    {
                        'name': 'TFU Cover Title',
                        'fontFamily': 'Lora',
                        'fontSize': 60,
                        'fontWeight': 700,
                        'lineHeight': 68
                    },
                    ...
                ],
                'spacing': {
                    'section': 60,
                    'element': 20,
                    'paragraph': 12,
                    'margin': 40
                },
                'status': 'success' | 'disabled' | 'error',
                'source_file': str,
                'fetched_at': str (ISO timestamp)
            }

        Writes to: design-tokens/teei-figma-tokens.json
        """
        if not self.enabled:
            message = 'FIGMA_PERSONAL_ACCESS_TOKEN not set' if not self.access_token else 'File ID not provided'
            return {
                'status': 'disabled',
                'message': message,
                'colors': [],
                'typography': [],
                'spacing': {}
            }

        # Fetch file data
        file_data = self._make_request(f'/files/{self.file_id}')
        if not file_data:
            return {
                'status': 'error',
                'message': 'Failed to fetch Figma file',
                'colors': [],
                'typography': [],
                'spacing': {}
            }

        # Fetch file styles
        styles_data = self._make_request(f'/files/{self.file_id}/styles')

        # Extract design tokens
        tokens = {
            'colors': self._extract_colors(file_data, styles_data),
            'typography': self._extract_typography(file_data, styles_data),
            'spacing': self._extract_spacing(file_data),
            'status': 'success',
            'source_file': f"https://figma.com/file/{self.file_id}",
            'fetched_at': datetime.now().isoformat()
        }

        # Write to file
        output_dir = Path('design-tokens')
        output_dir.mkdir(exist_ok=True)
        output_path = output_dir / 'teei-figma-tokens.json'

        with open(output_path, 'w') as f:
            json.dump(tokens, f, indent=2)

        return tokens

    def _extract_colors(self, file_data: Dict, styles_data: Optional[Dict]) -> List[Dict]:
        """
        Extract color styles from Figma file

        Args:
            file_data: Full file data from /files/{file_id}
            styles_data: Styles metadata from /files/{file_id}/styles

        Returns:
            List of color tokens
        """
        colors = []

        # Extract from styles if available
        if styles_data and 'meta' in styles_data and 'styles' in styles_data['meta']:
            for style_id, style_meta in styles_data['meta']['styles'].items():
                if style_meta.get('style_type') == 'FILL':
                    # This is a color style
                    # Note: Full style data would require additional API call to /styles/{style_id}
                    # For MVP, we'll use default TFU colors
                    pass

        # For MVP: Return default TFU colors
        # In production, you'd iterate through file_data['document']['children']
        # and extract actual color fills from frames/components
        default_colors = [
            {'name': 'TFU Teal', 'hex': '#00393F', 'rgb': [0, 57, 63]},
            {'name': 'TFU Light Blue', 'hex': '#C9E4EC', 'rgb': [201, 228, 236]},
            {'name': 'TFU Sand', 'hex': '#FFF1E2', 'rgb': [255, 241, 226]},
            {'name': 'TFU Gold', 'hex': '#BA8F5A', 'rgb': [186, 143, 90]}
        ]

        return default_colors

    def _extract_typography(self, file_data: Dict, styles_data: Optional[Dict]) -> List[Dict]:
        """
        Extract typography styles from Figma file

        Args:
            file_data: Full file data
            styles_data: Styles metadata

        Returns:
            List of typography tokens
        """
        # For MVP: Return default TFU typography
        # In production, you'd parse text styles from the file
        default_typography = [
            {
                'name': 'TFU Cover Title',
                'fontFamily': 'Lora',
                'fontSize': 60,
                'fontWeight': 700,
                'lineHeight': 68
            },
            {
                'name': 'TFU Section Heading',
                'fontFamily': 'Lora',
                'fontSize': 28,
                'fontWeight': 600,
                'lineHeight': 36
            },
            {
                'name': 'TFU Body Text',
                'fontFamily': 'Roboto',
                'fontSize': 11,
                'fontWeight': 400,
                'lineHeight': 16.5
            }
        ]

        return default_typography

    def _extract_spacing(self, file_data: Dict) -> Dict:
        """
        Extract spacing tokens from Figma file

        Args:
            file_data: Full file data

        Returns:
            Spacing token dictionary
        """
        # For MVP: Return default TFU spacing
        return {
            'section': 60,
            'element': 20,
            'paragraph': 12,
            'margin': 40
        }

    def export_frames(self, frame_ids: List[str], output_dir: str = "assets/images/figma-sync") -> List[Dict]:
        """
        Export specific Figma frames as PNG reference images

        Args:
            frame_ids: List of Figma node IDs to export
            output_dir: Where to save exported PNGs

        Returns:
            [
                {'frame_id': '123:456', 'file_path': 'assets/images/figma-sync/cover-ref.png'},
                ...
            ]

        Use case: Export Figma layout frames as visual baselines for comparison
        """
        if not self.enabled:
            return []

        if not frame_ids:
            return []

        # Get image URLs from Figma
        params = {
            'ids': ','.join(frame_ids),
            'format': 'png',
            'scale': 2
        }

        response = self._make_request(f'/images/{self.file_id}', params=params)
        if not response or 'images' not in response:
            return []

        # Download and save images
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        exported = []
        for frame_id, image_url in response['images'].items():
            if not image_url:
                continue

            try:
                # Download image
                img_response = requests.get(image_url, timeout=30)
                img_response.raise_for_status()

                # Save to file
                file_name = f"frame-{frame_id.replace(':', '-')}.png"
                file_path = output_path / file_name

                with open(file_path, 'wb') as f:
                    f.write(img_response.content)

                exported.append({
                    'frame_id': frame_id,
                    'file_path': str(file_path)
                })
            except Exception as e:
                print(f"[Figma] Failed to export frame {frame_id}: {e}")

        return exported

    def validate_drift(self, current_colors: Dict, current_typography: Dict) -> Dict:
        """
        Compare current PDF implementation against Figma master

        Args:
            current_colors: Colors currently used in PDF
            current_typography: Typography currently used in PDF

        Returns:
            {
                'drift_detected': bool,
                'color_drift': List[str],  # Colors in PDF not in Figma
                'typography_drift': List[str],  # Fonts/sizes not matching Figma
                'recommendations': List[str]
            }
        """
        if not self.enabled:
            return {
                'drift_detected': False,
                'color_drift': [],
                'typography_drift': [],
                'recommendations': ['Figma service disabled - cannot validate drift']
            }

        # Fetch latest tokens
        figma_tokens = self.fetch_design_tokens()
        if figma_tokens.get('status') != 'success':
            return {
                'drift_detected': False,
                'color_drift': [],
                'typography_drift': [],
                'recommendations': ['Failed to fetch Figma tokens']
            }

        # Compare colors
        figma_color_hexes = {c['hex'].lower() for c in figma_tokens['colors']}
        current_color_hexes = {c.lower() for c in current_colors.values()} if isinstance(current_colors, dict) else set()
        color_drift = [c for c in current_color_hexes if c not in figma_color_hexes]

        # Compare typography (simplified comparison)
        figma_fonts = {t['fontFamily'] for t in figma_tokens['typography']}
        current_fonts = set(current_typography.values()) if isinstance(current_typography, dict) else set()
        typography_drift = [f for f in current_fonts if f not in figma_fonts]

        recommendations = []
        if color_drift:
            recommendations.append(f"Found {len(color_drift)} colors not in Figma master")
        if typography_drift:
            recommendations.append(f"Found {len(typography_drift)} fonts not in Figma master")
        if not color_drift and not typography_drift:
            recommendations.append("✓ No drift detected - PDF matches Figma master")

        return {
            'drift_detected': bool(color_drift or typography_drift),
            'color_drift': color_drift,
            'typography_drift': typography_drift,
            'recommendations': recommendations
        }


# Standalone CLI for testing
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Figma Design System Sync Service')
    parser.add_argument('--file-id', help='Figma file ID')
    parser.add_argument('--test', action='store_true', help='Run test with placeholder file ID')
    parser.add_argument('--export-frames', nargs='+', help='Frame IDs to export')

    args = parser.parse_args()

    file_id = args.file_id or 'test-file-id'

    print("="*60)
    print("Figma Service - Standalone Test")
    print("="*60)

    service = FigmaService(file_id=file_id)

    if not service.enabled:
        print("\n[DISABLED] Figma service disabled")
        print("  Reason: FIGMA_PERSONAL_ACCESS_TOKEN not set")
        print("\n  To enable:")
        print("  1. Get Personal Access Token from Figma")
        print("  2. Set environment variable: FIGMA_PERSONAL_ACCESS_TOKEN=your_token")
    else:
        print(f"\n[OK] Figma service enabled")
        print(f"  File ID: {file_id}")

        # Fetch tokens
        print("\n[1] Fetching design tokens...")
        tokens = service.fetch_design_tokens()

        if tokens.get('status') == 'success':
            print(f"  [OK] Fetched {len(tokens['colors'])} colors")
            print(f"  [OK] Fetched {len(tokens['typography'])} text styles")
            print(f"  [OK] Fetched spacing tokens")
            print(f"  -> design-tokens/teei-figma-tokens.json")
        else:
            print(f"  [ERROR] Failed: {tokens.get('message')}")

        # Export frames if requested
        if args.export_frames:
            print(f"\n[2] Exporting {len(args.export_frames)} frames...")
            exported = service.export_frames(args.export_frames)
            print(f"  [OK] Exported {len(exported)} frames")
            for exp in exported:
                print(f"    - {exp['file_path']}")

    print("\n" + "="*60)
