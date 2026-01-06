"""
AI Image Generation Service
Generates hero and program imagery for PDF documents

Part of PDF Orchestrator AI-Enhanced Architecture (Generation Phase)
See services/ARCHITECTURE.md for full specification.
"""

import os
import json
import shutil
from typing import Dict, List, Optional
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont


class ImageGenerationService:
    """
    Generates or fetches hero images for PDF layouts

    Supports multiple providers:
    - local: Use placeholder images from assets/images/placeholders/
    - openai: OpenAI DALL-E 3 (requires IMAGE_API_KEY)
    - bedrock: AWS Bedrock Stable Diffusion (future)
    """

    SUPPORTED_PROVIDERS = ['local', 'openai', 'bedrock']

    def __init__(self, provider: str = 'local', model: Optional[str] = None, output_dir: str = 'assets/images/tfu/aws'):
        """
        Initialize image generation service

        Args:
            provider: 'local' | 'openai' | 'bedrock'
            model: Model name (provider-specific, optional)
            output_dir: Where to save generated images
        """
        if provider not in self.SUPPORTED_PROVIDERS:
            raise ValueError(f"Unsupported provider: {provider}. Must be one of {self.SUPPORTED_PROVIDERS}")

        self.provider = provider
        self.model = model or self._get_default_model()
        self.output_dir = output_dir
        self.enabled = self._check_enabled()

    def _check_enabled(self) -> bool:
        """Check if provider is available"""
        if self.provider == 'local':
            return True
        elif self.provider == 'openai':
            return bool(os.getenv('IMAGE_API_KEY'))
        elif self.provider == 'bedrock':
            return bool(os.getenv('AWS_ACCESS_KEY_ID'))
        return False

    def _get_default_model(self) -> str:
        """Get default model for provider"""
        defaults = {
            'local': 'placeholder',
            'openai': 'dall-e-3',
            'bedrock': 'stability.stable-diffusion-xl-v1'
        }
        return defaults.get(self.provider, 'default')

    def generate_hero_images(self, job_config: Dict, roles: List[str]) -> Dict:
        """
        Generate or fetch hero images for specified roles

        Args:
            job_config: Full job configuration (contains prompts, styles)
            roles: ['cover_hero', 'impact_hero', 'program_image_1', ...]

        Returns:
            {
                'images': {
                    'cover_hero': {
                        'file': 'assets/images/tfu/aws/cover_hero-20251114.png',
                        'altText': 'Ukrainian students learning cloud computing...',
                        'provider': 'local',
                        'cached': true
                    },
                    ...
                },
                'manifest_path': 'exports/TEEI-AWS-TFU-V2-images.json',
                'status': 'success' | 'disabled' | 'error'
            }

        Side effects:
        - Creates images in output_dir/
        - Writes manifest JSON to exports/TEEI-AWS-TFU-V2-images.json
        """
        if not self.enabled:
            message = f"{self.provider} provider not available (missing API key)"
            return {
                'images': {},
                'manifest_path': '',
                'status': 'disabled',
                'message': message
            }

        # Extract image generation config
        generation_cfg = job_config.get('generation', {})
        image_gen_cfg = generation_cfg.get('imageGeneration', {})
        prompts = image_gen_cfg.get('prompts', {})
        style_cfg = {
            'size': image_gen_cfg.get('size', '1792x1024'),
            'quality': image_gen_cfg.get('quality', 'hd'),
            'style': image_gen_cfg.get('style', 'natural')
        }

        # Generate images for each role
        images = {}
        for role in roles:
            try:
                prompt = prompts.get(role, f"Hero image for {role}")
                result = self.generate_single_image(role, prompt, style_cfg)
                images[role] = result
            except Exception as e:
                print(f"[Images] Failed to generate {role}: {e}")
                images[role] = {
                    'file': '',
                    'altText': f"Failed to generate {role}",
                    'provider': self.provider,
                    'cached': False,
                    'error': str(e)
                }

        # Create manifest
        manifest = {
            'images': images,
            'manifest_version': '1.0',
            'generated_at': datetime.now().isoformat(),
            'provider': self.provider
        }

        # Write manifest to file
        manifest_path = Path('exports') / f"{job_config.get('output', {}).get('filename_base', 'TEEI-AWS-TFU-V2')}-images.json"
        manifest_path.parent.mkdir(exist_ok=True)

        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)

        return {
            'images': images,
            'manifest_path': str(manifest_path),
            'status': 'success'
        }

    def generate_single_image(self, role: str, prompt: str, style: Dict) -> Dict:
        """
        Generate or fetch single image

        Args:
            role: Image role (cover_hero, impact_hero, etc.)
            prompt: Image generation prompt
            style: {
                'size': '1792x1024',
                'quality': 'hd',
                'style': 'natural'  # for DALL-E 3
            }

        Returns:
            {
                'file': str,  # Path to image
                'altText': str,  # AI-generated alt text
                'provider': str,
                'cached': bool,
                'generated_at': str (ISO timestamp)
            }
        """
        if self.provider == 'local':
            return self._generate_local(role)
        elif self.provider == 'openai':
            return self._generate_openai(prompt, style)
        elif self.provider == 'bedrock':
            return self._generate_bedrock(prompt, style)
        else:
            raise ValueError(f"Unknown provider: {self.provider}")

    def _generate_local(self, role: str) -> Dict:
        """
        Use placeholder images from assets/images/placeholders/

        Logic:
        1. Look for assets/images/placeholders/{role}.png
        2. If found, copy to output_dir/{role}-{timestamp}.png
        3. Generate template alt text
        4. Return metadata
        """
        placeholder_dir = Path('assets/images/placeholders')
        placeholder_path = placeholder_dir / f"{role}.png"

        # If placeholder doesn't exist, create a colored placeholder
        if not placeholder_path.exists():
            placeholder_path = self._create_color_placeholder(role, placeholder_dir)

        # Copy to output with timestamp
        timestamp = datetime.now().strftime("%Y%m%d")
        output_path = Path(self.output_dir)
        output_path.mkdir(parents=True, exist_ok=True)

        output_file = output_path / f"{role}-{timestamp}.png"

        # Copy if source exists, otherwise create new
        if placeholder_path.exists():
            shutil.copy2(placeholder_path, output_file)
        else:
            # Fallback: create simple colored block
            self._create_simple_placeholder(output_file, role)

        return {
            'file': str(output_file),
            'altText': self._generate_alt_text(role, str(output_file)),
            'provider': 'local',
            'cached': False,
            'generated_at': datetime.now().isoformat()
        }

    def _create_color_placeholder(self, role: str, output_dir: Path) -> Path:
        """
        Create a colored placeholder image with role text

        Args:
            role: Image role name
            output_dir: Directory to save placeholder

        Returns:
            Path to created placeholder
        """
        output_dir.mkdir(parents=True, exist_ok=True)
        output_file = output_dir / f"{role}.png"

        self._create_simple_placeholder(output_file, role)

        return output_file

    def _create_simple_placeholder(self, output_file: Path, role: str):
        """
        Create simple colored placeholder with text

        Args:
            output_file: Path to save image
            role: Text to display on placeholder
        """
        # Create image with TFU teal background
        width, height = 1792, 1024
        img = Image.new('RGB', (width, height), color='#00393F')

        draw = ImageDraw.Draw(img)

        # Try to use a font, fall back to default if not available
        try:
            font = ImageFont.truetype('arial.ttf', 60)
        except:
            font = ImageFont.load_default()

        # Draw role text in center
        text = role.replace('_', ' ').title()

        # Get text bbox for centering
        try:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        except:
            # Fallback for older Pillow versions
            text_width, text_height = draw.textsize(text, font=font) if hasattr(draw, 'textsize') else (400, 60)

        x = (width - text_width) // 2
        y = (height - text_height) // 2

        draw.text((x, y), text, fill='#C9E4EC', font=font)

        # Save image
        img.save(output_file, 'PNG')

    def _generate_openai(self, prompt: str, style: Dict) -> Dict:
        """
        Call OpenAI DALL-E 3 API

        TODO: Implement actual API call when IMAGE_API_KEY available
        """
        api_key = os.getenv('IMAGE_API_KEY')
        if not api_key:
            print("[Images] IMAGE_API_KEY not set, falling back to local placeholder")
            return self._generate_local('openai_fallback')

        # TODO: Implement actual OpenAI API call
        # For now, return stub that falls back to local
        print("[Images] OpenAI provider not fully implemented, using local fallback")
        print(f"[Images] Would generate with prompt: {prompt[:100]}...")

        # import openai
        # response = openai.images.generate(
        #     model='dall-e-3',
        #     prompt=prompt,
        #     size=style.get('size', '1792x1024'),
        #     quality=style.get('quality', 'hd'),
        #     style=style.get('style', 'natural')
        # )
        # image_url = response.data[0].url
        # # Download and save
        # ...

        return self._generate_local('openai_stub')

    def _generate_bedrock(self, prompt: str, style: Dict) -> Dict:
        """
        Call AWS Bedrock Stable Diffusion

        TODO: Implement actual API call when AWS credentials available
        """
        aws_key = os.getenv('AWS_ACCESS_KEY_ID')
        if not aws_key:
            print("[Images] AWS credentials not set, falling back to local placeholder")
            return self._generate_local('bedrock_fallback')

        # TODO: Implement actual Bedrock API call
        print("[Images] Bedrock provider not fully implemented, using local fallback")
        print(f"[Images] Would generate with prompt: {prompt[:100]}...")

        # import boto3
        # bedrock = boto3.client('bedrock-runtime')
        # response = bedrock.invoke_model(
        #     modelId='stability.stable-diffusion-xl-v1',
        #     body=json.dumps({
        #         'text_prompts': [{'text': prompt}],
        #         'cfg_scale': 7,
        #         'steps': 50,
        #         'width': int(style.get('size', '1792x1024').split('x')[0]),
        #         'height': int(style.get('size', '1792x1024').split('x')[1])
        #     })
        # )
        # # Parse and save
        # ...

        return self._generate_local('bedrock_stub')

    def _generate_alt_text(self, role: str, image_path: str) -> str:
        """
        Generate alt text for accessibility

        For local provider: template-based
        For AI providers: extract from API response or use GPT-4 Vision

        Args:
            role: Image role
            image_path: Path to image file

        Returns:
            Alt text string
        """
        # Template-based alt text for common roles
        templates = {
            'cover_hero': 'Ukrainian students learning cloud computing with AWS mentor in modern classroom, warm natural lighting',
            'impact_hero': 'Diverse students collaborating on laptops in bright educational space',
            'program_image_1': 'Students engaged in technical training session with modern educational technology',
            'program_image_2': 'Ukrainian mentor teaching AWS cloud skills to students in authentic classroom moment',
            'program_image_3': 'Educational program participants working together in hopeful atmosphere'
        }

        return templates.get(role, f"Hero image for {role.replace('_', ' ')} - educational partnership documentation")


# Standalone CLI for testing
if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='AI Image Generation Service')
    parser.add_argument('--provider', default='local', choices=ImageGenerationService.SUPPORTED_PROVIDERS,
                        help='Image generation provider')
    parser.add_argument('--roles', default='cover_hero,impact_hero',
                        help='Comma-separated list of image roles')
    parser.add_argument('--output-dir', default='assets/images/tfu/aws',
                        help='Output directory for images')

    args = parser.parse_args()

    print("="*60)
    print("Image Generation Service - Standalone Test")
    print("="*60)

    service = ImageGenerationService(
        provider=args.provider,
        output_dir=args.output_dir
    )

    if not service.enabled:
        print(f"\n⊘ {args.provider} provider disabled")
        if args.provider == 'openai':
            print("  Reason: IMAGE_API_KEY not set")
            print("\n  To enable:")
            print("  1. Get API key from OpenAI")
            print("  2. Set environment variable: IMAGE_API_KEY=your_key")
        elif args.provider == 'bedrock':
            print("  Reason: AWS credentials not set")
            print("\n  To enable:")
            print("  1. Configure AWS credentials")
            print("  2. Set: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY")
    else:
        print(f"\n[OK] {args.provider} provider enabled")
        print(f"  Output directory: {args.output_dir}")

        # Generate images
        roles = args.roles.split(',')
        print(f"\n[1] Generating {len(roles)} images...")

        # Create minimal job config for testing
        job_config = {
            'output': {'filename_base': 'TEST'},
            'generation': {
                'imageGeneration': {
                    'prompts': {
                        role: f"Test prompt for {role}" for role in roles
                    },
                    'size': '1792x1024',
                    'quality': 'hd',
                    'style': 'natural'
                }
            }
        }

        manifest = service.generate_hero_images(job_config, roles)

        if manifest.get('status') == 'success':
            print(f"  [OK] Generated {len(manifest['images'])} images")
            print(f"  Provider: {args.provider}")
            print(f"  -> {manifest['manifest_path']}")
            print("\n  Images:")
            for role, img_data in manifest['images'].items():
                print(f"    - {role}: {img_data.get('file', 'N/A')}")
        else:
            print(f"  [ERROR] Failed: {manifest.get('message')}")

    print("\n" + "="*60)
