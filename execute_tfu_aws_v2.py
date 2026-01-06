#!/usr/bin/env python3
"""Execute TFU AWS Partnership V2 (World-Class) via MCP"""
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

from core import init, sendCommand, createCommand
import socket_client
import json

APPLICATION = "indesign"
PROXY_URL = 'http://localhost:8013'

def main():
    print("=" * 60)
    print("TFU AWS Partnership V2 - World-Class Generator")
    print("=" * 60)

    # Load job config
    job_config_path = 'example-jobs/tfu-aws-partnership-v2.json'
    print(f"\nLoading job config: {job_config_path}")

    with open(job_config_path, 'r') as f:
        job_config = json.load(f)

    providers_cfg = job_config.get('providers', {})

    # ==============================================================
    # LLM CLIENT INITIALIZATION
    # ==============================================================

    # Create LLM client from job config
    try:
        from services.llm_client import create_llm_client_from_config

        llm_client = create_llm_client_from_config(job_config)
        llm_info = llm_client.get_provider_info()

        print(f"\n[LLM] Provider: {llm_info['provider']}")
        print(f"  Model: {llm_info['model']}")
        print(f"  Available: {llm_info['available']}")

        if not llm_info['available']:
            print("  ⚠ LLM not available - using offline fallbacks")

    except Exception as e:
        print(f"\n[LLM] ❌ Error initializing LLM client: {e}")
        print("  → Continuing with offline mode")
        llm_client = None

    # ==============================================================
    # CONTENT PLANNING PHASE (RAG + Personalization + Translation)
    # ==============================================================

    planning_cfg = job_config.get('planning', {})
    i18n_cfg = job_config.get('i18n', {})

    # Base content for TFU AWS Partnership
    base_content = {
        'cover_title': job_config.get('data', {}).get('title', 'Building Europe\'s Cloud-Native Workforce'),
        'cover_subtitle': job_config.get('data', {}).get('subtitle', 'Together for Ukraine · AWS Strategic Partnership'),
        'intro_text': 'TEEI provides technical training programs to Ukrainian refugees across Europe, partnering with leading technology companies to create pathways to employment.',
        'programs': [
            {
                'name': 'Cloud Fundamentals',
                'description': 'Introduction to cloud computing and AWS services with focus on employment outcomes.'
            },
            {
                'name': 'DevOps Engineering',
                'description': 'Advanced training in CI/CD, infrastructure as code, and cloud-native development.'
            },
            {
                'name': 'Data Analytics',
                'description': 'SQL, Python, and AWS data services for business intelligence careers.'
            }
        ],
        'cta_text': 'Ready to transform education through technology and create lasting impact?',
        'metrics': {
            'students_reached': '50,000',
            'countries': '12',
            'employment_rate': '78%',
            'avg_salary': '€45k'
        }
    }

    # Initialize content (may be personalized and/or translated)
    final_content = base_content.copy()

    # 1. Build RAG index if enabled
    rag_cfg = planning_cfg.get('rag', {})
    rag_engine = None  # Will be set if enabled
    if rag_cfg.get('enabled', False):
        try:
            from services.rag_content_engine import RAGContentEngine
            import glob

            print("\n[RAG] Building knowledge base...")
            rag_engine = RAGContentEngine(
                store_dir=rag_cfg.get('store_dir', 'rag_store'),
                llm_client=llm_client
            )

            # Build index if not exists
            index_path = os.path.join(rag_cfg.get('store_dir', 'rag_store'), 'index.json')
            if not os.path.exists(index_path):
                sources = []
                for pattern in rag_cfg.get('sources', ['deliverables/*.md', 'reports/*.md']):
                    sources.extend(glob.glob(pattern))

                if sources:
                    result = rag_engine.build_or_update_index(sources)
                    print(f"  ✓ Indexed {result['num_documents']} documents -> {result['num_chunks']} chunks")
                else:
                    print("  ⊘ No source documents found")
            else:
                print(f"  ✓ Using existing index: {index_path}")

        except Exception as e:
            print(f"\n[RAG] ❌ Error: {e}")

    # 2. Personalize content if enabled
    if planning_cfg.get('personalization_enabled', False):
        try:
            from services.content_personalizer import ContentPersonalizer

            print("\n[Personalization] Customizing content for partner...")
            personalizer = ContentPersonalizer(
                rag_engine=rag_engine,
                llm_client=llm_client
            )

            final_content = personalizer.personalize(final_content, job_config)

            summary = personalizer.get_personalization_summary(final_content)
            print(f"  ✓ Personalized for: {summary['partner_name']}")
            print(f"  Industry: {summary['industry']}")
            print(f"  Sections modified: {len(summary['sections_modified'])}")

        except Exception as e:
            print(f"\n[Personalization] ❌ Error: {e}")

    # 3. Translate content if enabled
    if i18n_cfg.get('enabled', False):
        try:
            from services.multilingual_generator import MultilingualGenerator

            target_lang = i18n_cfg.get('target_language', 'en')

            if target_lang.lower() != 'en':
                print(f"\n[Translation] Translating to {target_lang.upper()}...")
                translator = MultilingualGenerator(
                    provider=i18n_cfg.get('provider', 'local'),
                    llm_client=llm_client
                )

                final_content = translator.translate_content(
                    final_content,
                    target_lang=target_lang,
                    fallback=i18n_cfg.get('fallback', 'en')
                )

                print(f"  ✓ Content translated to {target_lang.upper()}")
            else:
                print(f"\n[Translation] ⊘ Target language is EN (no translation needed)")

        except Exception as e:
            print(f"\n[Translation] ❌ Error: {e}")

    # 4. Export content JSON for JSX to read
    content_export_path = 'exports/TEEI-AWS-TFU-V2-content.json'
    os.makedirs('exports', exist_ok=True)

    with open(content_export_path, 'w', encoding='utf-8') as f:
        json.dump(final_content, f, indent=2, ensure_ascii=False)

    print(f"\n[Content Export] ✓ Content saved to: {content_export_path}")
    print(f"  Keys: {', '.join(final_content.keys())}")

    # ==============================================================
    # SMART GENERATION PHASE (Figma + Images)
    # ==============================================================

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
                print("\n[Figma] ⊘ Figma file ID not configured")
        except Exception as e:
            print(f"\n[Figma] ❌ Error: {e}")
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
            print(f"\n[Images] ❌ Error: {e}")
            if images_cfg.get('failOnError', False):
                raise

    # ==============================================================
    # INDESIGN GENERATION
    # ==============================================================

    print("\n" + "=" * 60)
    print("INDESIGN DOCUMENT GENERATION")
    print("=" * 60)

    socket_client.configure(app=APPLICATION, url=PROXY_URL, timeout=60)
    init(APPLICATION, socket_client)

    script_path = "scripts/generate_tfu_aws_v2.jsx"
    print(f"\nReading V2 script: {script_path}")

    with open(script_path, 'r', encoding='utf-8') as f:
        script_content = f.read()

    print(f"Script size: {len(script_content):,} characters")
    print("\nSending to InDesign...")

    command = createCommand(
        action="executeExtendScript",
        options={"code": script_content}
    )

    try:
        result = sendCommand(command)

        print("\nResult:")
        print(json.dumps(result, indent=2))

        if result.get('status') == 'SUCCESS':
            print("\n" + "=" * 60)
            print("SUCCESS: TFU AWS V2 document created!")
            print("=" * 60)
            print("\nNext steps:")
            print("1. Save document as: TEEI-AWS-Partnership-TFU-V2.indd")
            print("2. Export PDF: python export_tfu_pdfs.py")
            print("3. Validate: python validate_document.py exports/TEEI-AWS-Partnership-TFU-DIGITAL.pdf \\")
            print("              --job-config example-jobs/tfu-aws-partnership-v2.json --strict")
            return 0
        else:
            print("\n" + "=" * 60)
            print("ERROR: Document creation failed")
            print("=" * 60)
            print(f"Message: {result.get('message', 'Unknown error')}")
            return 1

    except Exception as e:
        print(f"\nException: {str(e)}")
        return 1

if __name__ == '__main__':
    sys.exit(main())
