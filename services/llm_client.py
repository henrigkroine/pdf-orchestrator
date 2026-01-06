#!/usr/bin/env python3
"""
LLM Client - Clean abstraction for LLM providers

Supports:
  - provider="anthropic" - Real Claude API calls (primary)
  - provider="none" - Offline deterministic fallbacks

Usage:
    from services.llm_client import LLMClient

    llm = LLMClient(provider="anthropic", model="claude-3-5-sonnet-20241022")
    response = llm.generate(
        system_prompt="You are a helpful assistant",
        user_prompt="Write a headline",
        temperature=0.3
    )
"""

import os
import logging
from typing import Literal, Optional, Dict, List, Any

# Configure logging
logger = logging.getLogger(__name__)

ProviderName = Literal["anthropic", "none"]


class LLMClient:
    """
    Universal LLM client with provider abstraction.

    Supports graceful degradation: if API fails or keys missing,
    falls back to deterministic responses.
    """

    def __init__(
        self,
        provider: ProviderName = "none",
        model: Optional[str] = None,
        max_tokens: int = 1024,
        timeout: int = 30
    ):
        """
        Initialize LLM client.

        Args:
            provider: "anthropic" for real AI, "none" for offline
            model: Model name (defaults to claude-3-5-sonnet-20241022 for Anthropic)
            max_tokens: Maximum tokens in response
            timeout: Request timeout in seconds
        """
        self.provider = provider
        self.max_tokens = max_tokens
        self.timeout = timeout

        # Set default model per provider
        if model:
            self.model = model
        else:
            self.model = "claude-3-opus-20240229" if provider == "anthropic" else None

        # Initialize provider
        self.client = None
        self._initialize_provider()

    def _initialize_provider(self):
        """Initialize the selected provider."""
        if self.provider == "anthropic":
            try:
                import anthropic

                api_key = os.environ.get("ANTHROPIC_API_KEY")

                if not api_key:
                    logger.warning(
                        "ANTHROPIC_API_KEY not found in environment. "
                        "Falling back to offline mode."
                    )
                    self.provider = "none"
                    return

                self.client = anthropic.Anthropic(api_key=api_key)
                logger.info(f"Initialized Anthropic client with model: {self.model}")

            except ImportError:
                logger.error(
                    "anthropic package not installed. "
                    "Install with: pip install anthropic"
                )
                self.provider = "none"
            except Exception as e:
                logger.error(f"Failed to initialize Anthropic client: {e}")
                self.provider = "none"

        elif self.provider == "none":
            logger.info("LLM provider set to 'none' - using offline deterministic fallbacks")

    def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.3
    ) -> str:
        """
        Generate text using LLM.

        Args:
            system_prompt: System context/instructions
            user_prompt: User query/request
            temperature: Randomness (0.0 = deterministic, 1.0 = creative)

        Returns:
            Generated text (or deterministic fallback)
        """
        if self.provider == "anthropic" and self.client:
            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=self.max_tokens,
                    temperature=temperature,
                    system=system_prompt,
                    messages=[
                        {"role": "user", "content": user_prompt}
                    ],
                    timeout=self.timeout
                )

                # Extract text from response
                return response.content[0].text

            except Exception as e:
                logger.error(f"Anthropic API call failed: {e}")
                logger.warning("Falling back to deterministic response")
                return self._fallback_generate(system_prompt, user_prompt)

        else:
            # Offline mode
            return self._fallback_generate(system_prompt, user_prompt)

    def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.3
    ) -> str:
        """
        Multi-message chat interface.

        Args:
            messages: List of {role: "system"|"user"|"assistant", content: "..."}
            temperature: Randomness

        Returns:
            Generated response
        """
        if self.provider == "anthropic" and self.client:
            try:
                # Convert messages to Anthropic format
                # Extract system message if present
                system_msg = None
                api_messages = []

                for msg in messages:
                    if msg["role"] == "system":
                        system_msg = msg["content"]
                    else:
                        api_messages.append({
                            "role": msg["role"],
                            "content": msg["content"]
                        })

                kwargs = {
                    "model": self.model,
                    "max_tokens": self.max_tokens,
                    "temperature": temperature,
                    "messages": api_messages,
                    "timeout": self.timeout
                }

                if system_msg:
                    kwargs["system"] = system_msg

                response = self.client.messages.create(**kwargs)

                return response.content[0].text

            except Exception as e:
                logger.error(f"Anthropic chat API call failed: {e}")
                logger.warning("Falling back to deterministic response")
                return self._fallback_chat(messages)

        else:
            # Offline mode
            return self._fallback_chat(messages)

    def _fallback_generate(self, system_prompt: str, user_prompt: str) -> str:
        """
        Deterministic fallback when LLM unavailable.

        Returns a safe placeholder that echoes the request.
        """
        logger.info("[LLM-OFFLINE] Using deterministic fallback")

        # Return a clearly marked fallback response
        return f"[LLM-OFFLINE] Request: {user_prompt[:100]}..."

    def _fallback_chat(self, messages: List[Dict[str, str]]) -> str:
        """Deterministic fallback for chat."""
        logger.info("[LLM-OFFLINE] Using deterministic chat fallback")

        # Extract last user message
        last_user_msg = None
        for msg in reversed(messages):
            if msg["role"] == "user":
                last_user_msg = msg["content"]
                break

        return f"[LLM-OFFLINE] Response to: {last_user_msg[:100] if last_user_msg else 'chat'}..."

    def is_available(self) -> bool:
        """Check if LLM is actually available (not in offline mode)."""
        return self.provider == "anthropic" and self.client is not None

    def get_provider_info(self) -> Dict[str, Any]:
        """Get current provider configuration."""
        return {
            "provider": self.provider,
            "model": self.model,
            "max_tokens": self.max_tokens,
            "available": self.is_available()
        }


# Convenience function for creating client from job config
def create_llm_client_from_config(job_config: Dict[str, Any]) -> LLMClient:
    """
    Create LLMClient from job configuration.

    Args:
        job_config: Job config dict with optional "llm" section

    Returns:
        Initialized LLMClient
    """
    llm_config = job_config.get("llm", {})

    provider = llm_config.get("provider", "none")
    model = llm_config.get("model")
    max_tokens = llm_config.get("max_tokens", 1024)

    return LLMClient(
        provider=provider,
        model=model,
        max_tokens=max_tokens
    )


# CLI test mode
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("LLM CLIENT TEST")
    print("=" * 60)

    # Test 1: Offline mode
    print("\n[TEST 1] Offline mode (provider='none')")
    offline_client = LLMClient(provider="none")

    response = offline_client.generate(
        system_prompt="You are a helpful assistant",
        user_prompt="Write a test message",
        temperature=0.3
    )

    print(f"Provider: {offline_client.provider}")
    print(f"Available: {offline_client.is_available()}")
    print(f"Response: {response[:200]}")

    # Test 2: Anthropic mode
    print("\n[TEST 2] Anthropic mode (provider='anthropic')")
    anthropic_client = LLMClient(provider="anthropic")

    if anthropic_client.is_available():
        print("✓ Anthropic client initialized successfully")
        print(f"Model: {anthropic_client.model}")

        # Try a simple generation
        response = anthropic_client.generate(
            system_prompt="You are a concise assistant. Respond in 1 sentence.",
            user_prompt="Say hello and confirm you are Claude",
            temperature=0.3
        )

        print(f"Response: {response[:200]}")
    else:
        print("⚠ Anthropic client not available")
        print("Reason: Check ANTHROPIC_API_KEY environment variable")
        print(f"Fallback mode active: {anthropic_client.provider}")

    # Test 3: Chat interface
    print("\n[TEST 3] Chat interface")
    messages = [
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "What is 2+2?"},
        {"role": "assistant", "content": "4"},
        {"role": "user", "content": "And 3+3?"}
    ]

    response = anthropic_client.chat(messages, temperature=0.3)
    print(f"Chat response: {response[:200]}")

    # Provider info
    print("\n[INFO] Provider configuration:")
    info = anthropic_client.get_provider_info()
    for key, value in info.items():
        print(f"  {key}: {value}")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
    print("=" * 60)

    sys.exit(0)
