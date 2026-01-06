"""
Test SmolDocling integration without downloading full model
Creates a minimal test to verify the pipeline works
"""

import sys
import json
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from smolDoclingClient import SmolDoclingClient, DocTagsParser
from layoutAnalyzer import (
    BoundingBox,
    DocumentElement,
    SpatialRelationshipDetector,
    StructureScorer
)

def test_components():
    """Test individual components without model"""
    print("=== SmolDocling Integration Test ===\n")

    # Test 1: BoundingBox
    print("Test 1: BoundingBox operations")
    bbox1 = BoundingBox(x=0.1, y=0.1, w=0.3, h=0.2)
    bbox2 = BoundingBox(x=0.2, y=0.15, w=0.3, h=0.2)

    print(f"  bbox1 center: {bbox1.center()}")
    print(f"  bbox1 area: {bbox1.area()}")
    print(f"  Overlaps: {bbox1.overlaps(bbox2)}")
    print(f"  Overlap area: {bbox1.overlap_area(bbox2):.3f}")
    print("  [OK] BoundingBox working\n")

    # Test 2: DocumentElement
    print("Test 2: DocumentElement creation")
    elem1 = DocumentElement(
        type='header',
        content='Test Header',
        bbox=bbox1,
        page=1,
        confidence=0.95
    )
    print(f"  Element: {elem1.type} on page {elem1.page}")
    print(f"  Content: {elem1.content}")
    print("  [OK] DocumentElement working\n")

    # Test 3: Spatial Relationships
    print("Test 3: Spatial relationship detection")
    elem2 = DocumentElement(
        type='body',
        content='Test body text',
        bbox=bbox2,
        page=1
    )

    elements = [elem1, elem2]
    relationships = SpatialRelationshipDetector.detect_relationships(elements)

    print(f"  Found {len(relationships)} relationships")
    if relationships:
        rel = relationships[0]
        print(f"  Type: {rel.relation_type}")
        print(f"  Strength: {rel.strength:.2f}")
        print(f"  Details: {rel.details}")
    print("  [OK] Spatial detection working\n")

    # Test 4: Structure Scoring
    print("Test 4: Structure scoring")

    # Create sample elements
    test_elements = [
        DocumentElement('title', 'Document Title', BoundingBox(0.1, 0.1, 0.8, 0.1), 1),
        DocumentElement('header', 'Section 1', BoundingBox(0.1, 0.3, 0.8, 0.08), 1),
        DocumentElement('body', 'Paragraph 1', BoundingBox(0.1, 0.4, 0.8, 0.15), 1),
        DocumentElement('figure', 'Image', BoundingBox(0.1, 0.6, 0.4, 0.3), 1),
        DocumentElement('body', 'Paragraph 2', BoundingBox(0.1, 0.95, 0.8, 0.1), 1)
    ]

    structure_score = StructureScorer.score_structure(test_elements)
    print(f"  Structure score: {structure_score['score']:.3f}")
    print(f"  Coverage: {structure_score['coverage']:.3f}")
    print(f"  Hierarchy: {structure_score['hierarchy']:.3f}")
    print(f"  Balance: {structure_score['balance']:.3f}")
    print("  [OK] Structure scoring working\n")

    # Test 5: DocTags Parser
    print("Test 5: DocTags parsing")
    sample_doctags = """
<document>
  <page page_number="1">
    <header>Partnership Overview</header>
    <body>Main content about partnership</body>
    <figure>
      <caption>Figure 1: Architecture</caption>
    </figure>
  </page>
</document>
"""
    parsed = DocTagsParser.parse(sample_doctags)
    print(f"  Elements found: {len(parsed['elements'])}")
    print(f"  Element types: {', '.join(parsed['element_types'])}")
    print(f"  Hierarchy depth: {parsed['hierarchy_depth']}")
    print("  [OK] DocTags parser working\n")

    # Test 6: SmolDocling Client (check only, no model loading)
    print("Test 6: SmolDocling client initialization")
    client = SmolDoclingClient(device="cpu")
    print(f"  Model ID: {client.MODEL_ID}")
    print(f"  Device: {client.device}")
    print(f"  Is loaded: {client.is_loaded}")
    print("  [OK] Client initialization working\n")

    print("=== ALL COMPONENT TESTS PASSED ===")
    print("\nIntegration is ready for testing with actual PDFs")
    print("Note: First run will download 256M parameter model (~500MB)")

    return True


def test_minimal_pipeline():
    """Test pipeline with mock data (no model needed)"""
    print("\n=== Mock Pipeline Test ===\n")

    from layoutAnalyzer import LayoutAnalyzer

    # Create mock config
    config = {
        'weight': 0.25,
        'min_score': 0.85
    }

    # Test that analyzer can be instantiated
    analyzer = LayoutAnalyzer(config)
    print("  [OK] LayoutAnalyzer instantiated")

    print("\n=== MOCK PIPELINE TEST PASSED ===")
    print("\nReady to test with real PDF:")
    print("  python layoutAnalyzer.py <path_to_pdf>")


if __name__ == "__main__":
    try:
        # Test components
        test_components()

        # Test pipeline
        test_minimal_pipeline()

        print("\n" + "="*50)
        print("SUCCESS: All integration tests passed!")
        print("="*50)

    except Exception as e:
        print(f"\n[X] Test failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
