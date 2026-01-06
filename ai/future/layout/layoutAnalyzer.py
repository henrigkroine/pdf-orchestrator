"""
Layout Analyzer - Semantic Document Structure Understanding
Uses SmolDocling VLM to analyze PDF layout and spatial relationships

Layer 0 Feature (runs before all other AI analysis layers)
Provides semantic structure understanding for downstream agents
"""

import os
import sys
import json
from typing import Dict, List, Tuple, Optional, Any
from pathlib import Path
from dataclasses import dataclass, asdict
import time

# PDF processing
try:
    from pdf2image import convert_from_path
    from PIL import Image
except ImportError as e:
    print(f"ERROR: {e}")
    print("Install: pip install pdf2image pillow")
    sys.exit(1)

# Local imports
from smolDoclingClient import SmolDoclingClient, DocTagsParser


@dataclass
class BoundingBox:
    """Normalized bounding box (0-1 scale)"""
    x: float  # Left edge
    y: float  # Top edge
    w: float  # Width
    h: float  # Height

    def to_dict(self):
        return asdict(self)

    def center(self) -> Tuple[float, float]:
        """Calculate center point"""
        return (self.x + self.w / 2, self.y + self.h / 2)

    def area(self) -> float:
        """Calculate area"""
        return self.w * self.h

    def overlaps(self, other: 'BoundingBox') -> bool:
        """Check if this bbox overlaps another"""
        return not (
            self.x + self.w < other.x or
            other.x + other.w < self.x or
            self.y + self.h < other.y or
            other.y + other.h < self.y
        )

    def overlap_area(self, other: 'BoundingBox') -> float:
        """Calculate overlap area with another bbox"""
        if not self.overlaps(other):
            return 0.0

        x_overlap = min(self.x + self.w, other.x + other.w) - max(self.x, other.x)
        y_overlap = min(self.y + self.h, other.y + other.h) - max(self.y, other.y)

        return x_overlap * y_overlap

    def is_aligned(self, other: 'BoundingBox', tolerance: float = 0.02) -> Dict[str, bool]:
        """Check alignment with another bbox"""
        return {
            'top': abs(self.y - other.y) < tolerance,
            'bottom': abs((self.y + self.h) - (other.y + other.h)) < tolerance,
            'left': abs(self.x - other.x) < tolerance,
            'right': abs((self.x + self.w) - (other.x + other.w)) < tolerance
        }


@dataclass
class DocumentElement:
    """Semantic document element from SmolDocling"""
    type: str  # header, body, figure, table, etc.
    content: str
    bbox: BoundingBox
    page: int
    confidence: float = 1.0
    style: Optional[str] = None

    def to_dict(self):
        return {
            'type': self.type,
            'content': self.content[:100],  # Truncate for JSON
            'bbox': self.bbox.to_dict(),
            'page': self.page,
            'confidence': self.confidence,
            'style': self.style
        }


@dataclass
class SpatialRelationship:
    """Spatial relationship between two elements"""
    element1_idx: int
    element2_idx: int
    relation_type: str  # overlays, adjacent, aligned, contains
    strength: float  # 0.0 - 1.0
    details: Dict[str, Any]

    def to_dict(self):
        return asdict(self)


class SpatialRelationshipDetector:
    """
    Detects spatial relationships between document elements
    """

    ADJACENCY_THRESHOLD = 0.05  # Within 5% of page size
    ALIGNMENT_TOLERANCE = 0.02  # Within 2% alignment
    OVERLAY_MIN_PERCENT = 0.1   # 10% overlap minimum

    @staticmethod
    def detect_relationships(elements: List[DocumentElement]) -> List[SpatialRelationship]:
        """
        Detect all spatial relationships between elements

        Returns:
            List of detected relationships
        """
        relationships = []

        for i, elem1 in enumerate(elements):
            for j, elem2 in enumerate(elements[i+1:], start=i+1):
                # Same page only
                if elem1.page != elem2.page:
                    continue

                # Check each relationship type
                rel = SpatialRelationshipDetector._check_relationship(i, elem1, j, elem2)
                if rel:
                    relationships.append(rel)

        return relationships

    @staticmethod
    def _check_relationship(
        idx1: int, elem1: DocumentElement,
        idx2: int, elem2: DocumentElement
    ) -> Optional[SpatialRelationship]:
        """Check relationship between two elements"""

        bbox1, bbox2 = elem1.bbox, elem2.bbox

        # OVERLAYS: Elements overlap significantly
        if bbox1.overlaps(bbox2):
            overlap = bbox1.overlap_area(bbox2)
            min_area = min(bbox1.area(), bbox2.area())

            if overlap / min_area > SpatialRelationshipDetector.OVERLAY_MIN_PERCENT:
                return SpatialRelationship(
                    element1_idx=idx1,
                    element2_idx=idx2,
                    relation_type='overlays',
                    strength=overlap / min_area,
                    details={
                        'overlap_percent': round(overlap / min_area * 100, 1),
                        'likely_scenario': 'text_on_image' if elem1.type == 'body' and elem2.type == 'figure' else 'unknown'
                    }
                )

        # CONTAINS: Element 1 fully contains Element 2
        elem2_center = bbox2.center()
        if (bbox1.x <= elem2_center[0] <= bbox1.x + bbox1.w and
            bbox1.y <= elem2_center[1] <= bbox1.y + bbox1.h and
            bbox1.area() > bbox2.area() * 1.5):  # Significantly larger

            return SpatialRelationship(
                element1_idx=idx1,
                element2_idx=idx2,
                relation_type='contains',
                strength=0.9,
                details={
                    'size_ratio': round(bbox1.area() / bbox2.area(), 2)
                }
            )

        # ALIGNED: Elements share edge alignment
        alignment = bbox1.is_aligned(bbox2, SpatialRelationshipDetector.ALIGNMENT_TOLERANCE)
        aligned_edges = [edge for edge, is_aligned in alignment.items() if is_aligned]

        if aligned_edges:
            return SpatialRelationship(
                element1_idx=idx1,
                element2_idx=idx2,
                relation_type='aligned',
                strength=len(aligned_edges) / 4.0,  # 0.25, 0.5, 0.75, 1.0
                details={
                    'edges': aligned_edges
                }
            )

        # ADJACENT: Elements are near each other
        center1 = bbox1.center()
        center2 = bbox2.center()
        distance = ((center1[0] - center2[0]) ** 2 + (center1[1] - center2[1]) ** 2) ** 0.5

        if distance < SpatialRelationshipDetector.ADJACENCY_THRESHOLD:
            # Determine direction
            dx = center2[0] - center1[0]
            dy = center2[1] - center1[1]

            if abs(dx) > abs(dy):
                direction = 'right' if dx > 0 else 'left'
            else:
                direction = 'below' if dy > 0 else 'above'

            return SpatialRelationship(
                element1_idx=idx1,
                element2_idx=idx2,
                relation_type='adjacent',
                strength=1.0 - (distance / SpatialRelationshipDetector.ADJACENCY_THRESHOLD),
                details={
                    'direction': direction,
                    'distance': round(distance, 3)
                }
            )

        return None


class StructureScorer:
    """
    Scores document structure quality
    """

    @staticmethod
    def score_structure(elements: List[DocumentElement]) -> Dict[str, Any]:
        """
        Score logical hierarchy (headers → subheads → body)

        Returns:
            Structure score and analysis
        """
        if not elements:
            return {'score': 0.0, 'reason': 'No elements found'}

        # Count element types
        type_counts = {}
        for elem in elements:
            type_counts[elem.type] = type_counts.get(elem.type, 0) + 1

        # Expected structure (partnership document)
        expected_types = {'title', 'header', 'body', 'figure'}
        found_types = set(type_counts.keys())

        # Coverage score
        coverage = len(found_types & expected_types) / len(expected_types)

        # Hierarchy score (headers before body)
        hierarchy_correct = 0
        hierarchy_total = 0

        for i, elem in enumerate(elements):
            if elem.type == 'body':
                # Check if there's a header before this body element
                has_header_before = any(
                    e.type in {'header', 'title'} and e.page == elem.page
                    for e in elements[:i]
                )
                hierarchy_total += 1
                if has_header_before:
                    hierarchy_correct += 1

        hierarchy_score = hierarchy_correct / hierarchy_total if hierarchy_total > 0 else 0.5

        # Balance score (not too many of one type)
        balance = 1.0
        if len(type_counts) > 0:
            max_count = max(type_counts.values())
            total_count = sum(type_counts.values())
            if max_count / total_count > 0.8:  # One type dominates
                balance = 0.6

        # Overall structure score
        structure_score = (coverage * 0.4 + hierarchy_score * 0.4 + balance * 0.2)

        return {
            'score': round(structure_score, 3),
            'coverage': round(coverage, 3),
            'hierarchy': round(hierarchy_score, 3),
            'balance': round(balance, 3),
            'element_counts': type_counts,
            'reason': 'Good structure' if structure_score >= 0.8 else 'Structure needs improvement'
        }

    @staticmethod
    def score_spatial(relationships: List[SpatialRelationship]) -> Dict[str, Any]:
        """
        Score spatial relationships quality

        Returns:
            Spatial score and analysis
        """
        if not relationships:
            return {'score': 0.5, 'reason': 'No relationships detected'}

        # Count relationship types
        rel_counts = {}
        for rel in relationships:
            rel_counts[rel.relation_type] = rel_counts.get(rel.relation_type, 0) + 1

        # Average relationship strength
        avg_strength = sum(r.strength for r in relationships) / len(relationships)

        # Diversity (multiple relationship types is good)
        diversity = len(rel_counts) / 4.0  # 4 possible types

        # Sensible overlays (text on images is OK, body on body is bad)
        sensible_count = 0
        overlay_count = 0

        for rel in relationships:
            if rel.relation_type == 'overlays':
                overlay_count += 1
                if rel.details.get('likely_scenario') == 'text_on_image':
                    sensible_count += 1

        sensible_ratio = sensible_count / overlay_count if overlay_count > 0 else 1.0

        # Overall spatial score
        spatial_score = (avg_strength * 0.4 + diversity * 0.3 + sensible_ratio * 0.3)

        return {
            'score': round(spatial_score, 3),
            'avg_strength': round(avg_strength, 3),
            'diversity': round(diversity, 3),
            'sensible_ratio': round(sensible_ratio, 3),
            'relationship_counts': rel_counts,
            'reason': 'Good spatial layout' if spatial_score >= 0.8 else 'Spatial layout could improve'
        }

    @staticmethod
    def score_semantic(elements: List[DocumentElement]) -> Dict[str, Any]:
        """
        Score semantic appropriateness (element types match roles)

        Returns:
            Semantic score and analysis
        """
        if not elements:
            return {'score': 0.0, 'reason': 'No elements'}

        # Page role detection
        pages = {}
        for elem in elements:
            if elem.page not in pages:
                pages[elem.page] = []
            pages[elem.page].append(elem)

        page_scores = []

        for page_num, page_elements in pages.items():
            # First page should have title
            if page_num == 1:
                has_title = any(e.type in {'title', 'header'} for e in page_elements)
                page_scores.append(1.0 if has_title else 0.5)

            # Body pages should have body text
            else:
                has_body = any(e.type == 'body' for e in page_elements)
                page_scores.append(1.0 if has_body else 0.7)

        # Element type appropriateness
        appropriate_count = 0
        for elem in elements:
            # Headers should be at top of page
            if elem.type in {'header', 'title'}:
                if elem.bbox.y < 0.3:  # Top 30% of page
                    appropriate_count += 1
            # Footers at bottom
            elif elem.type == 'footer':
                if elem.bbox.y > 0.7:  # Bottom 30%
                    appropriate_count += 1
            # Others are flexible
            else:
                appropriate_count += 1

        appropriateness = appropriate_count / len(elements) if elements else 0

        # Overall semantic score
        semantic_score = (sum(page_scores) / len(page_scores) * 0.6 + appropriateness * 0.4)

        return {
            'score': round(semantic_score, 3),
            'page_appropriateness': round(sum(page_scores) / len(page_scores), 3),
            'element_appropriateness': round(appropriateness, 3),
            'reason': 'Semantic structure appropriate' if semantic_score >= 0.8 else 'Semantic issues detected'
        }


class LayoutAnalyzer:
    """
    Main layout analyzer - coordinates SmolDocling VLM and spatial analysis
    """

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize analyzer

        Args:
            config: Configuration dict with settings
        """
        self.config = config
        self.client = None

    def analyze(self, pdf_path: str) -> Dict[str, Any]:
        """
        Analyze PDF layout using SmolDocling VLM

        Args:
            pdf_path: Path to PDF file

        Returns:
            Complete layout analysis report
        """
        start_time = time.time()

        print(f"=== Layout Analysis (Layer 0) ===")
        print(f"PDF: {pdf_path}")

        # Convert PDF to images
        print("\nConverting PDF to images...")
        images = convert_from_path(pdf_path, dpi=150)  # 150 DPI sufficient for layout
        print(f"  {len(images)} pages converted")

        # Load SmolDocling model
        print("\nLoading SmolDocling VLM...")
        self.client = SmolDoclingClient(device="auto")
        if not self.client.load_model():
            raise RuntimeError("Failed to load SmolDocling model")

        # Analyze each page
        print("\nAnalyzing document structure...")
        page_analyses = []
        all_elements = []

        for page_num, image in enumerate(images, 1):
            print(f"\n  Page {page_num}/{len(images)}:")

            # Get DocTags from SmolDocling
            doctags = self.client.analyze_page(image)

            # Parse DocTags
            parsed = DocTagsParser.parse(doctags)

            # Extract elements (simplified - would need bbox extraction in production)
            elements = self._extract_elements(parsed, page_num)

            page_analyses.append({
                'page': page_num,
                'doctags': doctags[:500],  # Truncate
                'element_count': len(elements),
                'element_types': list(set(e.type for e in elements))
            })

            all_elements.extend(elements)

            print(f"    Elements: {len(elements)}")
            print(f"    Types: {', '.join(set(e.type for e in elements))}")

        # Detect spatial relationships
        print("\nDetecting spatial relationships...")
        relationships = SpatialRelationshipDetector.detect_relationships(all_elements)
        print(f"  {len(relationships)} relationships found")

        # Score document quality
        print("\nScoring document quality...")
        structure_score = StructureScorer.score_structure(all_elements)
        spatial_score = StructureScorer.score_spatial(relationships)
        semantic_score = StructureScorer.score_semantic(all_elements)

        print(f"  Structure: {structure_score['score']}")
        print(f"  Spatial: {spatial_score['score']}")
        print(f"  Semantic: {semantic_score['score']}")

        # Calculate overall score
        weight = self.config.get('weight', 0.25)
        overall_score = (
            structure_score['score'] * 0.4 +
            spatial_score['score'] * 0.3 +
            semantic_score['score'] * 0.3
        )

        # Cleanup
        self.client.unload_model()

        duration = time.time() - start_time

        # Build report
        report = {
            'enabled': True,
            'weight': weight,
            'score': round(overall_score, 3),
            'pages': page_analyses,
            'elements': [e.to_dict() for e in all_elements],
            'relationships': [r.to_dict() for r in relationships],
            'scores': {
                'structure': structure_score,
                'spatial': spatial_score,
                'semantic': semantic_score,
                'overall': round(overall_score, 3)
            },
            'statistics': {
                'page_count': len(images),
                'element_count': len(all_elements),
                'relationship_count': len(relationships),
                'hierarchy_depth': max((p.get('hierarchy_depth', 0) for p in page_analyses), default=0),
                'structural_quality_score': round(overall_score, 3)
            },
            'issues': self._identify_issues(structure_score, spatial_score, semantic_score),
            'summary': f"Layout analysis: {overall_score:.2f} score, {len(all_elements)} elements, {len(relationships)} relationships",
            'duration_seconds': round(duration, 2)
        }

        print(f"\n✓ Layout analysis complete ({duration:.1f}s)")
        print(f"  Overall score: {overall_score:.3f}")

        return report

    def _extract_elements(self, parsed: Dict, page_num: int) -> List[DocumentElement]:
        """
        Extract document elements from parsed DocTags
        (Simplified - production would extract actual bboxes from DocTags)
        """
        elements = []

        # Simulate element extraction based on parsed structure
        for i, elem_info in enumerate(parsed.get('elements', [])):
            # Generate approximate bbox (in production, parse from DocTags)
            bbox = BoundingBox(
                x=0.1 + (i % 2) * 0.4,  # Left or right column
                y=0.1 + (i // 2) * 0.15,  # Vertical stacking
                w=0.35,
                h=0.10
            )

            element = DocumentElement(
                type=elem_info.get('type', 'body'),
                content=elem_info.get('content', ''),
                bbox=bbox,
                page=page_num,
                confidence=0.95
            )

            elements.append(element)

        return elements

    def _identify_issues(
        self,
        structure: Dict,
        spatial: Dict,
        semantic: Dict
    ) -> List[Dict[str, Any]]:
        """Identify layout issues"""
        issues = []

        if structure['score'] < 0.7:
            issues.append({
                'severity': 'warning',
                'category': 'structure',
                'message': f"Document structure score low: {structure['score']:.2f}",
                'suggestion': 'Check logical hierarchy (headers before body text)'
            })

        if spatial['score'] < 0.7:
            issues.append({
                'severity': 'warning',
                'category': 'spatial',
                'message': f"Spatial layout score low: {spatial['score']:.2f}",
                'suggestion': 'Review element positioning and relationships'
            })

        if semantic['score'] < 0.7:
            issues.append({
                'severity': 'warning',
                'category': 'semantic',
                'message': f"Semantic structure score low: {semantic['score']:.2f}",
                'suggestion': 'Element types may not match expected document roles'
            })

        return issues


def analyzeLayout(pdf_path: str, config: Dict[str, Any]) -> Dict[str, Any]:
    """
    Main entry point for layout analysis

    Args:
        pdf_path: Path to PDF
        config: Configuration dict

    Returns:
        Layout analysis report
    """
    analyzer = LayoutAnalyzer(config)
    return analyzer.analyze(pdf_path)


if __name__ == "__main__":
    # CLI test
    if len(sys.argv) < 2:
        print("Usage: python layoutAnalyzer.py <pdf_path>")
        sys.exit(1)

    pdf_path = sys.argv[1]

    config = {
        'weight': 0.25,
        'min_score': 0.85
    }

    result = analyzeLayout(pdf_path, config)

    # Output JSON on last line for JavaScript parsing
    print("\n=== LAYOUT ANALYSIS COMPLETE ===")
    print(json.dumps(result, indent=None))  # Single-line JSON for easy parsing
