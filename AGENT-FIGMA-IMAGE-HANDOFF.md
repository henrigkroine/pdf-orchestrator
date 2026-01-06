# Agent 1 → Agent 2: Figma & Image Generation Implementation

**Date:** 2025-11-14
**From:** Agent 1 - Figma & Image Architecture
**To:** Agent 2 - Implementation & Integration

---

## Overview

This handoff specifies the **concrete implementation** of Figma and Image Generation services that will be wired into the TFU AWS V2 generation pipeline.

**Goal:** Transform the pipeline from "static assets" to "dynamic, AI-enhanced asset generation with Figma design system sync."

---

## 1. Figma Service Implementation

### File Location
`services/figma_service.py`

### API Contract

```python
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
```

### Figma REST API Usage

**Base URL:** `https://api.figma.com/v1`

**Authentication:**
- Header: `X-Figma-Token: {access_token}`

**Key Endpoints:**

1. **Get File:**
   ```
   GET /files/{file_id}
   ```
   Returns: Full file structure including styles, components, nodes

2. **Get File Styles:**
   ```
   GET /files/{file_id}/styles
   ```
   Returns: All styles (colors, text, effects, grids)

3. **Export Images:**
   ```
   GET /images/{file_id}?ids={node_ids}&format=png&scale=2
   ```
   Returns: URLs to download exported images

### Output Files

1. **Design Tokens JSON:**
   - Path: `design-tokens/teei-figma-tokens.json`
   - Format:
   ```json
   {
     "colors": [
       {"name": "TFU Teal", "hex": "#00393F", "rgb": [0, 57, 63]},
       {"name": "TFU Light Blue", "hex": "#C9E4EC", "rgb": [201, 228, 236]}
     ],
     "typography": [
       {
         "name": "TFU Cover Title",
         "fontFamily": "Lora",
         "fontSize": 60,
         "fontWeight": 700,
         "lineHeight": 68
       }
     ],
     "spacing": {
       "section": 60,
       "element": 20,
       "paragraph": 12,
       "margin": 40
     },
     "source_file": "https://figma.com/file/abc123...",
     "fetched_at": "2025-11-14T15:30:00Z"
   }
   ```

2. **Figma Frame Exports:**
   - Path: `assets/images/figma-sync/{frame_name}.png`
   - 2x scale PNGs for reference

### Error Handling

- **Missing token:** Log warning, return `{'status': 'disabled', 'message': 'FIGMA_PERSONAL_ACCESS_TOKEN not set'}`
- **Invalid file_id:** Log error, return `{'status': 'error', 'message': 'Figma file not found'}`
- **API error:** Log error, continue with empty tokens (don't crash pipeline)

---

## 2. Image Generation Service Implementation

### File Location
`services/image_generation_service.py`

### API Contract

```python
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

    def _generate_local(self, role: str) -> Dict:
        """Use placeholder images from assets/images/placeholders/"""

    def _generate_openai(self, prompt: str, style: Dict) -> Dict:
        """Call OpenAI DALL-E 3 API"""

    def _generate_bedrock(self, prompt: str, style: Dict) -> Dict:
        """Call AWS Bedrock Stable Diffusion"""

    def _generate_alt_text(self, role: str, image_path: str) -> str:
        """
        Generate alt text for accessibility

        For local provider: template-based
        For AI providers: extract from API response or use GPT-4 Vision
        """
```

### Provider Implementations

#### Local Provider (MVP - Implement First)

```python
def _generate_local(self, role: str) -> Dict:
    """
    Use placeholder images from assets/images/placeholders/

    Logic:
    1. Look for assets/images/placeholders/{role}.png
    2. If found, copy to output_dir/{role}-{timestamp}.png
    3. Generate template alt text
    4. Return metadata
    """
    placeholder_path = f"assets/images/placeholders/{role}.png"

    if not os.path.exists(placeholder_path):
        # Create simple colored placeholder
        placeholder_path = self._create_color_placeholder(role)

    # Copy to output with timestamp
    timestamp = datetime.now().strftime("%Y%m%d")
    output_file = f"{self.output_dir}/{role}-{timestamp}.png"

    os.makedirs(self.output_dir, exist_ok=True)
    shutil.copy2(placeholder_path, output_file)

    return {
        'file': output_file,
        'altText': f"Hero image for {role} - placeholder",
        'provider': 'local',
        'cached': False,
        'generated_at': datetime.now().isoformat()
    }
```

#### OpenAI Provider (Stub with TODO)

```python
def _generate_openai(self, prompt: str, style: Dict) -> Dict:
    """
    Call OpenAI DALL-E 3 API

    TODO: Implement actual API call when IMAGE_API_KEY available
    """
    # Placeholder implementation
    api_key = os.getenv('IMAGE_API_KEY')
    if not api_key:
        return self._generate_local('openai_fallback')

    # TODO: Actual API call
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

    # For now, fall back to local
    return self._generate_local('openai_stub')
```

### Output Files

1. **Generated Images:**
   - Path: `assets/images/tfu/aws/{role}-{timestamp}.png`
   - Example: `assets/images/tfu/aws/cover_hero-20251114.png`

2. **Image Manifest JSON:**
   - Path: `exports/TEEI-AWS-TFU-V2-images.json`
   - Format:
   ```json
   {
     "images": {
       "cover_hero": {
         "file": "assets/images/tfu/aws/cover_hero-20251114.png",
         "altText": "Ukrainian students learning cloud computing with AWS mentor in modern classroom, warm natural lighting",
         "provider": "local",
         "cached": false,
         "generated_at": "2025-11-14T15:30:00Z"
       },
       "impact_hero": {
         "file": "assets/images/tfu/aws/impact_hero-20251114.png",
         "altText": "Diverse students collaborating on laptops in bright educational space",
         "provider": "local",
         "cached": false,
         "generated_at": "2025-11-14T15:30:15Z"
       }
     },
     "manifest_version": "1.0",
     "generated_at": "2025-11-14T15:30:15Z",
     "provider": "local"
   }
   ```

---

## 3. Job Config Schema

### Updated Configuration Structure

```json
{
  "providers": {
    "figma": {
      "enabled": false,
      "fileId": "REPLACE_WITH_FIGMA_FILE_ID",
      "accessTokenEnv": "FIGMA_PERSONAL_ACCESS_TOKEN",
      "useTokensFor": ["colors", "typography", "spacing"],
      "exportFrames": false,
      "frameIds": [],
      "failOnError": false
    },
    "images": {
      "enabled": false,
      "provider": "local",
      "model": null,
      "outputDir": "assets/images/tfu/aws",
      "roles": ["cover_hero", "impact_hero"],
      "failOnError": false,
      "cache": {
        "enabled": true,
        "maxAgeDays": 30
      }
    }
  }
}
```

### Environment Variables

**Required for Figma:**
- `FIGMA_PERSONAL_ACCESS_TOKEN` - Figma Personal Access Token

**Required for OpenAI Images:**
- `IMAGE_API_KEY` - OpenAI API key (for DALL-E 3)

**Required for Bedrock Images:**
- `AWS_ACCESS_KEY_ID` - AWS credentials
- `AWS_SECRET_ACCESS_KEY` - AWS credentials

**Optional:**
- `FIGMA_FILE_ID` - Default Figma file ID (can override in job config)
- `IMAGE_PROVIDER` - Default provider (local, openai, bedrock)

---

## 4. Integration Points

### 4.1 Call Before InDesign Generation

**File to Modify:** `execute_tfu_aws_v2.py`

**Add before calling `scripts/generate_tfu_aws_v2.jsx`:**

```python
import json
from pathlib import Path

# Load job config
with open('example-jobs/tfu-aws-partnership-v2.json', 'r') as f:
    job_config = json.load(f)

providers_cfg = job_config.get('providers', {})

# 1. Figma Design Tokens
figma_cfg = providers_cfg.get('figma', {})
if figma_cfg.get('enabled', False):
    try:
        from services.figma_service import FigmaService

        file_id = figma_cfg.get('fileId')
        if file_id and file_id != 'REPLACE_WITH_FIGMA_FILE_ID':
            print("\n[Figma] Fetching design tokens...")
            figma = FigmaService(file_id=file_id)
            tokens = figma.fetch_design_tokens()

            if tokens.get('status') == 'success':
                print(f"  ✓ Fetched {len(tokens.get('colors', []))} colors")
                print(f"  ✓ Fetched {len(tokens.get('typography', []))} text styles")
                print(f"  → design-tokens/teei-figma-tokens.json")
            else:
                print(f"  ⚠ Figma sync skipped: {tokens.get('message', 'Unknown')}")
        else:
            print("  ⊘ Figma file ID not configured")
    except Exception as e:
        print(f"  ❌ Figma error: {e}")
        if figma_cfg.get('failOnError', False):
            raise

# 2. Image Generation
images_cfg = providers_cfg.get('images', {})
if images_cfg.get('enabled', False):
    try:
        from services.image_generation_service import ImageGenerationService

        print("\n[Images] Generating hero images...")
        image_gen = ImageGenerationService(
            provider=images_cfg.get('provider', 'local'),
            model=images_cfg.get('model'),
            output_dir=images_cfg.get('outputDir', 'assets/images/tfu/aws')
        )

        roles = images_cfg.get('roles', ['cover_hero'])
        manifest = image_gen.generate_hero_images(job_config, roles)

        if manifest.get('status') == 'success':
            print(f"  ✓ Generated {len(manifest.get('images', {}))} images")
            print(f"  Provider: {images_cfg.get('provider', 'local')}")
            print(f"  → {manifest.get('manifest_path')}")
        else:
            print(f"  ⚠ Image generation skipped: {manifest.get('message', 'Unknown')}")
    except Exception as e:
        print(f"  ❌ Image generation error: {e}")
        if images_cfg.get('failOnError', False):
            raise

# Continue with InDesign generation...
```

### 4.2 Use Assets in InDesign Generator

**File to Modify:** `scripts/generate_tfu_aws_v2.jsx`

**Add at start of script:**

```javascript
// Read Figma tokens if available
var figmaTokens = null;
try {
    var tokensFile = new File("D:/Dev/VS Projects/Projects/pdf-orchestrator/design-tokens/teei-figma-tokens.json");
    if (tokensFile.exists) {
        tokensFile.open("r");
        var tokensContent = tokensFile.read();
        tokensFile.close();
        figmaTokens = JSON.parse(tokensContent);
    }
} catch (e) {}

// Read image manifest if available
var imageManifest = null;
try {
    var manifestFile = new File("D:/Dev/VS Projects/Projects/pdf-orchestrator/exports/TEEI-AWS-TFU-V2-images.json");
    if (manifestFile.exists) {
        manifestFile.open("r");
        var manifestContent = manifestFile.read();
        manifestFile.close();
        imageManifest = JSON.parse(manifestContent);
    }
} catch (e) {}

// Later in color setup:
if (figmaTokens && figmaTokens.colors) {
    // Use Figma colors instead of hardcoded values
    for (var i = 0; i < figmaTokens.colors.length; i++) {
        var color = figmaTokens.colors[i];
        if (color.name === "TFU Teal") {
            palette.teal = ensureColor("TFU_Teal", color.rgb);
        }
        // ... map other colors
    }
}

// When placing hero image on cover page:
if (imageManifest && imageManifest.images && imageManifest.images.cover_hero) {
    var heroImagePath = imageManifest.images.cover_hero.file;
    var heroImageFile = new File("D:/Dev/VS Projects/Projects/pdf-orchestrator/" + heroImagePath);
    if (heroImageFile.exists) {
        // Place hero image in cover frame
        var coverHeroFrame = page1.rectangles.add();
        coverHeroFrame.geometricBounds = [100, 40, 500, 572];
        coverHeroFrame.place(heroImageFile);
        coverHeroFrame.fit(FitOptions.FILL_PROPORTIONALLY);
    }
}
```

### 4.3 Wire into Pipeline

**File to Modify:** `pipeline.py`

**Add Smart Generation phase in `run_world_class_pipeline()`:**

```python
def run_smart_generation(self, job_config: dict):
    """
    Execute smart generation phase (Figma + Images)

    Called before InDesign document generation
    """
    print("\n" + "="*60)
    print("SMART GENERATION PHASE")
    print("="*60)

    providers_cfg = job_config.get('providers', {})

    # Figma
    figma_cfg = providers_cfg.get('figma', {})
    if figma_cfg.get('enabled', False):
        try:
            from services.figma_service import FigmaService
            # ... (same as execute_tfu_aws_v2.py code above)
        except Exception as e:
            print(f"[Figma] Error: {e}")

    # Images
    images_cfg = providers_cfg.get('images', {})
    if images_cfg.get('enabled', False):
        try:
            from services.image_generation_service import ImageGenerationService
            # ... (same as execute_tfu_aws_v2.py code above)
        except Exception as e:
            print(f"[Images] Error: {e}")

    print("="*60 + "\n")
```

**Call in world-class pipeline:**

```python
def run_world_class_pipeline(self, job_config_path: str) -> bool:
    # ... load job config ...

    # NEW: Smart Generation Phase
    self.run_smart_generation(job_config)

    # Existing: Generation
    print("\n[Step 0] GENERATION")
    # ... existing code ...
```

---

## 5. Testing Requirements

### Test 1: Figma Service Standalone
```bash
python -m services.figma_service --file-id abc123 --test
```

Expected: Logs "Figma disabled" or fetches tokens if FIGMA_PERSONAL_ACCESS_TOKEN set

### Test 2: Image Service Standalone
```bash
python -m services.image_generation_service --provider local --roles cover_hero,impact_hero
```

Expected: Creates placeholder images in `assets/images/tfu/aws/` and manifest JSON

### Test 3: Pipeline with Providers Disabled
```bash
# Set providers.figma.enabled=false, providers.images.enabled=false
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

Expected: Pipeline runs exactly as before, no provider calls

### Test 4: Pipeline with Local Provider
```bash
# Set providers.images.enabled=true, provider="local"
python pipeline.py --world-class --job-config example-jobs/tfu-aws-partnership-v2.json
```

Expected: Smart Generation phase runs, uses local placeholders, pipeline succeeds

---

## 6. Success Criteria

Agent 2 is complete when:

1. ✅ `services/figma_service.py` implemented with token fetching
2. ✅ `services/image_generation_service.py` implemented with local provider
3. ✅ Both services have standalone CLIs for testing
4. ✅ Services integrated into `execute_tfu_aws_v2.py`
5. ✅ InDesign generator uses Figma tokens and image manifest
6. ✅ `pipeline.py` has Smart Generation phase
7. ✅ All 4 tests pass
8. ✅ Backward compatibility maintained (providers disabled by default)

---

**Handoff Status:** ✅ Complete
**Next Agent:** Agent 2 - Implementation & Integration
**Estimated Effort:** 3-4 hours for full implementation
