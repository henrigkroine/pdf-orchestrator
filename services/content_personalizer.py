#!/usr/bin/env python3
"""
Content Personalization Engine

Adapts content based on partner profiles and RAG suggestions.
Integrates RAGContentEngine + PartnerProfileRegistry.

LLM Integration: Uses LLM for narrative generation when available.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional

# Import Agent 1 services
from services.rag_content_engine import RAGContentEngine
from services.partner_profiles import PartnerProfileRegistry

# Configure logging
logger = logging.getLogger(__name__)


class ContentPersonalizer:
    """
    Personalizes document content using partner profiles and RAG knowledge base.
    Uses LLM for narrative generation when available.
    """

    def __init__(
        self,
        rag_engine: Optional[RAGContentEngine] = None,
        profile_registry: Optional[PartnerProfileRegistry] = None,
        llm_client=None
    ):
        """
        Initialize content personalizer.

        Args:
            rag_engine: RAG content engine instance (optional, will create if None)
            profile_registry: Partner profile registry (optional, will create if None)
            llm_client: Optional LLMClient for narrative generation
        """
        self.rag_engine = rag_engine or RAGContentEngine()
        self.profile_registry = profile_registry or PartnerProfileRegistry()
        self.llm_client = llm_client

        # Log LLM availability
        if llm_client and hasattr(llm_client, 'is_available') and llm_client.is_available():
            logger.info("[PERSONALIZER] LLM-powered narrative generation enabled")
        else:
            logger.info("[PERSONALIZER] Using template-based personalization")

    def personalize(self, base_content: Dict[str, Any], job_config: Dict[str, Any]) -> Dict[str, Any]:
        """
        Personalize content based on partner profile and RAG suggestions.

        Args:
            base_content: Base content dictionary with sections:
                {
                    'cover_title': str,
                    'cover_subtitle': str,
                    'intro_text': str,
                    'programs': List[dict],
                    'cta_text': str,
                    ...
                }
            job_config: Job configuration with planning settings

        Returns:
            Personalized content dictionary (same structure as input)
        """
        # Check if personalization is enabled
        planning_cfg = job_config.get('planning', {})
        if not planning_cfg.get('personalization_enabled', False):
            return base_content

        # Get partner profile
        partner_profile_id = planning_cfg.get('partner_profile_id')
        if not partner_profile_id:
            print("[WARN] Personalization enabled but no partner_profile_id specified")
            return base_content

        profile = self.profile_registry.get_profile(partner_profile_id)
        if not profile:
            print(f"[WARN] Partner profile '{partner_profile_id}' not found, using base content")
            return base_content

        print(f"[PERSONALIZE] Using profile: {profile['name']} ({profile['industry']})")

        # Create personalized copy
        personalized = base_content.copy()

        # Personalize each section
        personalized['cover_title'] = self._personalize_cover_title(
            base_content.get('cover_title', ''),
            profile
        )

        personalized['cover_subtitle'] = self._personalize_cover_subtitle(
            base_content.get('cover_subtitle', ''),
            profile
        )

        personalized['intro_text'] = self._personalize_intro(
            base_content.get('intro_text', ''),
            profile,
            planning_cfg.get('rag', {}).get('enabled', False)
        )

        personalized['programs'] = self._personalize_programs(
            base_content.get('programs', []),
            profile
        )

        personalized['cta_text'] = self._personalize_cta(
            base_content.get('cta_text', ''),
            profile
        )

        # Add metadata
        personalized['_metadata'] = {
            'personalized': True,
            'partner_id': partner_profile_id,
            'partner_name': profile['name'],
            'industry': profile['industry']
        }

        return personalized

    def _personalize_cover_title(self, base_title: str, profile: Dict[str, Any]) -> str:
        """Personalize cover title based on partner profile"""
        # Get content emphasis for cover
        cover_emphasis = profile.get('content_emphasis', {}).get('cover', '')

        # If profile emphasizes strategic partnership, enhance title
        if 'strategic' in cover_emphasis.lower():
            # Keep base title but potentially adjust tone
            return base_title  # TFU design is fixed, keep as-is

        return base_title

    def _personalize_cover_subtitle(self, base_subtitle: str, profile: Dict[str, Any]) -> str:
        """Personalize cover subtitle with partner name"""
        # Insert partner name if not already present
        if profile['name'] not in base_subtitle:
            # For AWS: "Together for Ukraine · AWS Strategic Partnership"
            parts = base_subtitle.split('·')
            if len(parts) == 2:
                return f"{parts[0].strip()} · {profile['name']} {parts[1].strip()}"

        return base_subtitle

    def _personalize_intro(
        self,
        base_intro: str,
        profile: Dict[str, Any],
        rag_enabled: bool
    ) -> str:
        """
        Personalize intro text using partner themes and optionally RAG suggestions.
        Uses LLM for narrative generation when available.
        """
        # Try LLM-powered personalization if available
        if self.llm_client and hasattr(self.llm_client, 'is_available') and self.llm_client.is_available():
            try:
                logger.info(f"[PERSONALIZER] Generating intro narrative for {profile['name']} using LLM...")

                # Get RAG context if enabled
                rag_context = ""
                if rag_enabled:
                    try:
                        answer = self.rag_engine.answer(
                            question=f"What are the key themes for {profile['industry']} partnerships?",
                            top_k=3
                        )
                        if answer['method'] in ['llm_synthesis', 'retrieval_only']:
                            rag_context = f"\n\nRelevant context from past partnerships:\n{answer['answer'][:500]}"
                    except Exception as e:
                        logger.warning(f"[RAG] Could not retrieve context: {e}")

                # Build LLM prompt
                system_prompt = (
                    "You are a content specialist for TEEI (The Educational Equality Institute). "
                    "Write concise, professional introductory paragraphs for partnership documents. "
                    "Focus on impact, mutual benefits, and specific partnership value."
                )

                key_themes_str = ", ".join(profile.get('key_themes', []))
                user_prompt = (
                    f"Write a 2-3 sentence introduction for a TEEI partnership document with {profile['name']} ({profile['industry']}).\n\n"
                    f"Base content: {base_intro}\n\n"
                    f"Partner key themes: {key_themes_str}\n"
                    f"Tone: {profile.get('tone', 'professional')}\n"
                    f"{rag_context}\n\n"
                    f"Requirements:\n"
                    f"- Mention {profile['name']} by name\n"
                    f"- Emphasize key themes: {key_themes_str}\n"
                    f"- Keep TEEI brand voice (empowering, hopeful, clear)\n"
                    f"- Maximum 3 sentences\n\n"
                    f"Introduction:"
                )

                intro = self.llm_client.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.3
                )

                logger.info(f"[PERSONALIZER] ✓ Generated {len(intro)} chars of intro text")
                return intro.strip()

            except Exception as e:
                logger.warning(f"[PERSONALIZER] LLM generation failed: {e}. Using template fallback.")

        # Fallback: Template-based personalization
        intro = base_intro

        # Get partner key themes
        key_themes = profile.get('key_themes', [])

        # If RAG is enabled, get suggestions for intro enhancement
        if rag_enabled:
            try:
                suggestions = self.rag_engine.suggest_sections(
                    topic=f"{profile['industry']} partnership introduction",
                    context={'partner_id': profile['id'], 'industry': profile['industry']}
                )

                # If we have high-confidence suggestions, consider incorporating them
                if suggestions['confidence'] > 0.5 and suggestions['suggestions']:
                    # For now, keep base intro but log that suggestions are available
                    print(f"[RAG] Found {len(suggestions['suggestions'])} suggestions for intro (confidence: {suggestions['confidence']:.2f})")

            except Exception as e:
                print(f"[WARN] RAG suggestions failed: {e}")

        # Ensure partner name appears in intro
        if profile['name'] not in intro:
            # Simple insertion: mention partner in context
            intro = intro.replace(
                "training programs",
                f"training programs in partnership with {profile['name']}"
            )

        # Emphasize key themes if not already present
        for theme in key_themes[:2]:  # Top 2 themes only
            if theme.lower() not in intro.lower():
                # Theme not mentioned, could enhance but keep minimal for now
                pass

        return intro

    def _personalize_programs(
        self,
        base_programs: List[Dict[str, Any]],
        profile: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Personalize program descriptions based on partner preferences.
        """
        personalized_programs = []

        # Get preferred metrics
        preferred_metrics = profile.get('preferred_metrics', [])

        for program in base_programs:
            personalized_program = program.copy()

            # Emphasize preferred metrics in program descriptions
            if 'description' in program and preferred_metrics:
                desc = program['description']

                # Highlight metrics that match partner preferences
                # (Simple keyword matching for MVP)
                for metric in preferred_metrics:
                    metric_key = metric.replace('_', ' ')
                    if metric_key in desc.lower():
                        # Metric already mentioned, good
                        pass

            # Ensure partner branding if specified
            visual_prefs = profile.get('visual_preferences', {})
            if visual_prefs.get('logo_prominence') == 'high':
                # Note: Logo prominence is handled by JSX, just flag it
                personalized_program['_partner_branding'] = True

            personalized_programs.append(personalized_program)

        return personalized_programs

    def _personalize_cta(self, base_cta: str, profile: Dict[str, Any]) -> str:
        """Personalize call-to-action based on partner CTA style"""
        cta_style = profile.get('cta_style', 'standard')

        if cta_style == 'co_marketing_long_term':
            # Emphasize mutual benefits and long-term partnership
            # Ensure language reflects strategic partnership
            if 'strategic' not in base_cta.lower() and 'partnership' not in base_cta.lower():
                cta = base_cta.replace(
                    "Ready to",
                    f"Ready to expand our {profile['name']} partnership and"
                )
                return cta

        return base_cta

    def get_personalization_summary(self, personalized_content: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get summary of personalization changes.

        Args:
            personalized_content: Personalized content dictionary

        Returns:
            {
                'personalized': bool,
                'partner_name': str,
                'industry': str,
                'sections_modified': List[str]
            }
        """
        metadata = personalized_content.get('_metadata', {})

        return {
            'personalized': metadata.get('personalized', False),
            'partner_name': metadata.get('partner_name', 'N/A'),
            'industry': metadata.get('industry', 'N/A'),
            'sections_modified': ['cover_subtitle', 'intro_text', 'programs', 'cta_text']
        }


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("CONTENT PERSONALIZER TEST")
    print("=" * 60)

    # Initialize personalizer
    personalizer = ContentPersonalizer()

    # Test base content
    base_content = {
        'cover_title': 'Building Europe\'s Cloud-Native Workforce',
        'cover_subtitle': 'Together for Ukraine · Strategic Partnership',
        'intro_text': 'TEEI provides technical training programs to Ukrainian refugees across Europe.',
        'programs': [
            {
                'name': 'Cloud Fundamentals',
                'description': 'Introduction to cloud computing with focus on employment outcomes.'
            }
        ],
        'cta_text': 'Ready to transform education through technology?'
    }

    # Mock job config
    job_config = {
        'planning': {
            'personalization_enabled': True,
            'partner_profile_id': 'aws-cloud',
            'rag': {'enabled': False}
        }
    }

    # Personalize
    print("\n[TEST] Personalizing content for AWS partner...")
    personalized = personalizer.personalize(base_content, job_config)

    # Show results
    summary = personalizer.get_personalization_summary(personalized)
    print(f"\n[OK] Personalization complete:")
    print(f"  Partner: {summary['partner_name']}")
    print(f"  Industry: {summary['industry']}")
    print(f"  Sections modified: {len(summary['sections_modified'])}")

    print(f"\n[BEFORE] Cover subtitle: {base_content['cover_subtitle']}")
    print(f"[AFTER]  Cover subtitle: {personalized['cover_subtitle']}")

    print(f"\n[BEFORE] Intro: {base_content['intro_text'][:80]}...")
    print(f"[AFTER]  Intro: {personalized['intro_text'][:80]}...")

    # Test with personalization disabled
    job_config['planning']['personalization_enabled'] = False
    print("\n[TEST] Testing with personalization disabled...")
    result = personalizer.personalize(base_content, job_config)

    if result == base_content:
        print("[OK] Content unchanged when personalization disabled")
    else:
        print("[ERROR] Content modified when personalization disabled!")

    sys.exit(0)
