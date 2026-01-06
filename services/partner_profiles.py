#!/usr/bin/env python3
"""
Partner Profile Registry - Partner Context Management

Manages partner-specific profiles for content personalization.
Profiles stored as JSON files in config/partner-profiles/
"""

import os
import json
from typing import List, Dict, Any, Optional


class PartnerProfileRegistry:
    """
    Registry for partner profiles with industry, tone, and content preferences.

    Profiles stored under config/partner-profiles/*.json
    """

    def __init__(self, profiles_dir: str = "config/partner-profiles"):
        """
        Initialize profile registry.

        Args:
            profiles_dir: Directory containing partner profile JSON files
        """
        self.profiles_dir = profiles_dir

        # Ensure profiles directory exists
        os.makedirs(profiles_dir, exist_ok=True)

        # Load all profiles
        self.profiles = self._load_all_profiles()

    def _load_all_profiles(self) -> Dict[str, Dict[str, Any]]:
        """
        Load all partner profiles from directory.

        Returns:
            Dictionary mapping profile_id to profile data
        """
        profiles = {}

        if not os.path.exists(self.profiles_dir):
            return profiles

        for filename in os.listdir(self.profiles_dir):
            if filename.endswith('.json'):
                profile_path = os.path.join(self.profiles_dir, filename)

                try:
                    with open(profile_path, 'r', encoding='utf-8') as f:
                        profile = json.load(f)

                    # Use profile_id from JSON, fallback to filename
                    profile_id = profile.get('id', filename.replace('.json', ''))
                    profiles[profile_id] = profile

                except Exception as e:
                    print(f"[WARN] Failed to load profile {filename}: {e}")

        return profiles

    def get_profile(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """
        Get partner profile by ID.

        Args:
            profile_id: Partner profile identifier

        Returns:
            Profile dictionary or None if not found
        """
        return self.profiles.get(profile_id)

    def list_profiles(self) -> List[Dict[str, Any]]:
        """
        List all available partner profiles.

        Returns:
            List of profile dictionaries
        """
        return list(self.profiles.values())

    def get_profile_ids(self) -> List[str]:
        """
        Get list of all profile IDs.

        Returns:
            List of profile ID strings
        """
        return list(self.profiles.keys())

    def add_profile(self, profile: Dict[str, Any]) -> bool:
        """
        Add or update a partner profile.

        Args:
            profile: Profile dictionary (must contain 'id' field)

        Returns:
            True if successful, False otherwise
        """
        if 'id' not in profile:
            print("[ERROR] Profile must contain 'id' field")
            return False

        profile_id = profile['id']
        profile_path = os.path.join(self.profiles_dir, f"{profile_id}.json")

        try:
            with open(profile_path, 'w', encoding='utf-8') as f:
                json.dump(profile, f, indent=2)

            # Update in-memory registry
            self.profiles[profile_id] = profile
            return True

        except Exception as e:
            print(f"[ERROR] Failed to save profile {profile_id}: {e}")
            return False

    def validate_profile(self, profile: Dict[str, Any]) -> List[str]:
        """
        Validate profile structure and return list of issues.

        Args:
            profile: Profile dictionary

        Returns:
            List of validation error strings (empty if valid)
        """
        issues = []

        # Required fields
        required_fields = ['id', 'name', 'industry']
        for field in required_fields:
            if field not in profile:
                issues.append(f"Missing required field: {field}")

        # Optional but recommended fields
        recommended_fields = ['tone', 'key_themes', 'preferred_metrics']
        for field in recommended_fields:
            if field not in profile:
                issues.append(f"[WARN] Missing recommended field: {field}")

        # Validate field types
        if 'key_themes' in profile and not isinstance(profile['key_themes'], list):
            issues.append("key_themes must be a list")

        if 'preferred_metrics' in profile and not isinstance(profile['preferred_metrics'], list):
            issues.append("preferred_metrics must be a list")

        if 'language_preferences' in profile and not isinstance(profile['language_preferences'], list):
            issues.append("language_preferences must be a list")

        return issues


# CLI for testing
if __name__ == "__main__":
    import sys

    print("=" * 60)
    print("PARTNER PROFILE REGISTRY TEST")
    print("=" * 60)

    # Initialize registry
    registry = PartnerProfileRegistry()

    # List existing profiles
    profiles = registry.list_profiles()
    print(f"\n[REGISTRY] Loaded {len(profiles)} partner profiles")

    if profiles:
        for profile in profiles:
            print(f"  - {profile['id']}: {profile.get('name', 'N/A')} ({profile.get('industry', 'N/A')})")

        # Get specific profile
        if profiles:
            profile_id = profiles[0]['id']
            print(f"\n[GET] Fetching profile: {profile_id}")
            profile = registry.get_profile(profile_id)
            if profile:
                print(f"  Name: {profile.get('name')}")
                print(f"  Industry: {profile.get('industry')}")
                print(f"  Tone: {profile.get('tone', 'N/A')}")
                print(f"  Key Themes: {', '.join(profile.get('key_themes', []))}")
    else:
        print("  (none found)")
        print("\n[INFO] No profiles found in config/partner-profiles/")
        print("  Create profiles using the add_profile() method or manually create JSON files")

    # Test validation
    print("\n[VALIDATE] Testing profile validation...")
    test_profile = {
        "id": "test-partner",
        "name": "Test Partner Inc.",
        "industry": "Technology"
    }
    issues = registry.validate_profile(test_profile)
    if issues:
        print(f"  Validation issues: {len(issues)}")
        for issue in issues:
            print(f"    - {issue}")
    else:
        print("  [OK] Profile is valid")

    sys.exit(0)
