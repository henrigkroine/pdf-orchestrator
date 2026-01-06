#!/usr/bin/env python3
"""
Multilingual Generator

Basic translation support for TEEI partnership documents.
Supports EN (identity) + stub translations for offline operation.

LLM Integration: Uses LLM for real translation when available.
"""

import os
import json
import logging
from typing import Dict, Any, Optional

# Configure logging
logger = logging.getLogger(__name__)


class MultilingualGenerator:
    """
    Translates document content to target languages.

    Current support:
    - EN (English) - identity
    - DE (German) - stub/deterministic phrases or LLM
    - UK (Ukrainian) - stub/deterministic phrases or LLM

    Uses LLM for translation when available and provider != "local".
    """

    def __init__(self, provider: str = "local", llm_client=None):
        """
        Initialize multilingual generator.

        Args:
            provider: Translation provider ("local" for stubs, or use LLM)
            llm_client: Optional LLMClient for real translation
        """
        self.provider = provider
        self.llm_client = llm_client

        # Load stub translations (always available as fallback)
        self.translations = self._load_stub_translations()

        # Log LLM availability
        if llm_client and hasattr(llm_client, 'is_available') and llm_client.is_available() and provider != "local":
            logger.info("[MULTILINGUAL] LLM-powered translation enabled")
        else:
            logger.info("[MULTILINGUAL] Using stub translations (offline mode)")

    def _load_stub_translations(self) -> Dict[str, Dict[str, str]]:
        """
        Load stub translations for offline operation.

        Returns dictionary mapping language codes to phrase translations.
        """
        return {
            'de': {
                # German stub translations
                'Together for Ukraine': 'Gemeinsam für die Ukraine',
                'Strategic Partnership': 'Strategische Partnerschaft',
                'Building Europe': 'Aufbau Europas',
                'Cloud-Native Workforce': 'Cloud-Native-Arbeitskräfte',
                'Technical Training': 'Technische Ausbildung',
                'AWS': 'AWS',
                'Ready to': 'Bereit zu',
                'Partnership': 'Partnerschaft',
                'Program': 'Programm',
                'Students': 'Studierende',
                'Impact': 'Auswirkung'
            },
            'uk': {
                # Ukrainian stub translations (Cyrillic)
                'Together for Ukraine': 'Разом для України',
                'Strategic Partnership': 'Стратегічне партнерство',
                'Building Europe': 'Розбудова Європи',
                'Cloud-Native Workforce': 'Хмарна робоча сила',
                'Technical Training': 'Технічна підготовка',
                'AWS': 'AWS',
                'Ready to': 'Готові',
                'Partnership': 'Партнерство',
                'Program': 'Програма',
                'Students': 'Студенти',
                'Impact': 'Вплив'
            }
        }

    def translate_content(
        self,
        content: Dict[str, Any],
        target_lang: str,
        fallback: str = "en"
    ) -> Dict[str, Any]:
        """
        Translate structured content to target language.

        Args:
            content: Content dictionary with text fields
            target_lang: Target language code (en, de, uk)
            fallback: Fallback language if translation unavailable

        Returns:
            Translated content dictionary
        """
        # English is identity (no translation)
        if target_lang.lower() == 'en':
            return content

        # Check if target language is supported
        if target_lang.lower() not in self.translations:
            print(f"[WARN] Language '{target_lang}' not supported, using fallback '{fallback}'")
            if fallback.lower() == 'en':
                return content
            target_lang = fallback

        print(f"[TRANSLATE] Translating content to {target_lang.upper()}...")

        # Create translated copy
        translated = {}

        for key, value in content.items():
            if isinstance(value, str):
                translated[key] = self._translate_text(value, target_lang)
            elif isinstance(value, list):
                translated[key] = [
                    self._translate_item(item, target_lang) for item in value
                ]
            elif isinstance(value, dict):
                # Recursively translate nested dicts
                translated[key] = self.translate_content(value, target_lang, fallback)
            else:
                # Copy other types as-is
                translated[key] = value

        # Add metadata
        translated['_translation_metadata'] = {
            'target_language': target_lang,
            'provider': self.provider,
            'fallback': fallback
        }

        return translated

    def _translate_text(self, text: str, target_lang: str) -> str:
        """
        Translate a single text string using LLM or stub fallback.

        Args:
            text: Source text (English)
            target_lang: Target language code

        Returns:
            Translated text
        """
        # Use stub translations if provider is "local"
        if self.provider == "local":
            return self._stub_translate(text, target_lang)

        # Try LLM translation if available
        if self.llm_client and hasattr(self.llm_client, 'is_available') and self.llm_client.is_available():
            try:
                logger.info(f"[TRANSLATE] Using LLM for {target_lang.upper()}: {text[:50]}...")

                # Map language codes to full names
                lang_names = {
                    'de': 'German',
                    'uk': 'Ukrainian',
                    'fr': 'French',
                    'es': 'Spanish',
                    'pl': 'Polish'
                }
                target_language = lang_names.get(target_lang.lower(), target_lang.upper())

                system_prompt = (
                    f"You are a professional translator specializing in educational and partnership documents. "
                    f"Translate English text to {target_language} while maintaining:\n"
                    f"- Professional tone and clarity\n"
                    f"- Cultural appropriateness\n"
                    f"- Brand voice consistency\n"
                    f"- Accurate terminology for technical/educational content"
                )

                user_prompt = (
                    f"Translate the following text from English to {target_language}:\n\n"
                    f"{text}\n\n"
                    f"Translation:"
                )

                translation = self.llm_client.generate(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.1  # Low temperature for consistent translations
                )

                logger.info(f"[TRANSLATE] ✓ Translated {len(text)} → {len(translation)} chars")
                return translation.strip()

            except Exception as e:
                logger.warning(f"[TRANSLATE] LLM translation failed: {e}. Using stub fallback.")

        # Fallback to stub translation
        return self._stub_translate(text, target_lang)

    def _stub_translate(self, text: str, target_lang: str) -> str:
        """
        Stub translation using phrase lookup.

        Simple deterministic translation for common phrases.
        Falls back to English if phrase not in dictionary.
        """
        translations = self.translations.get(target_lang, {})

        # Try direct lookup first
        if text in translations:
            return translations[text]

        # Try phrase-by-phrase replacement
        translated = text
        for en_phrase, target_phrase in translations.items():
            translated = translated.replace(en_phrase, target_phrase)

        return translated

    def _translate_item(self, item: Any, target_lang: str) -> Any:
        """Translate list item (could be string, dict, or other)"""
        if isinstance(item, str):
            return self._translate_text(item, target_lang)
        elif isinstance(item, dict):
            return self.translate_content(item, target_lang)
        else:
            return item

    def get_supported_languages(self) -> list[str]:
        """Get list of supported language codes"""
        return ['en'] + list(self.translations.keys())


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("MULTILINGUAL GENERATOR TEST")
    print("=" * 60)

    # Initialize generator
    generator = MultilingualGenerator(provider="local")

    # Show supported languages
    supported = generator.get_supported_languages()
    print(f"\n[SUPPORTED] Languages: {', '.join(supported)}")

    # Test content
    base_content = {
        'cover_title': 'Building Europe\'s Cloud-Native Workforce',
        'cover_subtitle': 'Together for Ukraine · AWS Strategic Partnership',
        'section_heading': 'Technical Training Program',
        'cta': 'Ready to join our Partnership?'
    }

    # Test German translation
    print("\n[TEST] Translating to German (DE)...")
    de_content = generator.translate_content(base_content, target_lang='de')

    print(f"\n[EN] {base_content['cover_title']}")
    print(f"[DE] {de_content['cover_title']}")

    print(f"\n[EN] {base_content['cover_subtitle']}")
    print(f"[DE] {de_content['cover_subtitle']}")

    # Test Ukrainian translation
    print("\n[TEST] Translating to Ukrainian (UK)...")
    uk_content = generator.translate_content(base_content, target_lang='uk')

    print(f"\n[EN] {base_content['cover_subtitle']}")
    print(f"[UK] {uk_content['cover_subtitle']}")

    # Test English (identity)
    print("\n[TEST] Translating to English (identity)...")
    en_content = generator.translate_content(base_content, target_lang='en')

    if en_content == base_content:
        print("[OK] English translation is identity (no changes)")
    else:
        print("[ERROR] English translation modified content!")

    # Test unsupported language (fallback)
    print("\n[TEST] Translating to unsupported language (FR -> EN fallback)...")
    fr_content = generator.translate_content(base_content, target_lang='fr', fallback='en')

    if fr_content == base_content:
        print("[OK] Unsupported language falls back to English")
    else:
        print("[ERROR] Fallback behavior incorrect!")

    sys.exit(0)
