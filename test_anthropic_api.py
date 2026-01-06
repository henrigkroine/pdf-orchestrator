#!/usr/bin/env python3
"""Quick test of Anthropic API key and model names."""

import os
from pathlib import Path

# Load .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

# Get API key
api_key = os.environ.get("ANTHROPIC_API_KEY")
if not api_key:
    print("ERROR: ANTHROPIC_API_KEY not set")
    exit(1)

print(f"API Key: {api_key[:20]}...")

# Try to import and test Anthropic client
try:
    import anthropic
    print(f"Anthropic SDK version: {anthropic.__version__}")
except ImportError:
    print("ERROR: anthropic package not installed")
    print("Run: pip install anthropic")
    exit(1)

# Test different model names
models_to_test = [
    "claude-3-5-sonnet-20241022",  # Latest Claude 3.5 Sonnet
    "claude-3-5-sonnet-20240620",  # Previous Claude 3.5 Sonnet
    "claude-3-opus-20240229",      # Claude 3 Opus
    "claude-3-sonnet-20240229",    # Claude 3 Sonnet
    "claude-3-haiku-20240307",     # Claude 3 Haiku
]

client = anthropic.Anthropic(api_key=api_key)

for model in models_to_test:
    print(f"\nTesting model: {model}")
    try:
        message = client.messages.create(
            model=model,
            max_tokens=10,
            messages=[
                {"role": "user", "content": "Say 'test successful'"}
            ]
        )
        print(f"  SUCCESS! Model {model} works")
        print(f"    Response: {message.content[0].text}")
        break
    except anthropic.NotFoundError as e:
        print(f"  404 Not Found: {model}")
        print(f"      Details: {e}")
    except anthropic.AuthenticationError as e:
        print(f"  Authentication Error: {e}")
        print("  The API key is not valid for authentication")
        break
    except anthropic.PermissionDeniedError as e:
        print(f"  Permission Denied: {e}")
        print("  The API key doesn't have access to this model")
    except Exception as e:
        print(f"  Error ({type(e).__name__}): {e}")
