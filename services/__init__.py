"""
PDF Orchestrator Services Module
AI-Enhanced Architecture - Service Layer

Provides intelligent planning, generation, and validation capabilities.
See services/ARCHITECTURE.md for full documentation.
"""

# Layer 0: Structure Analysis
from .smoldocling_service import LayoutAnalyzer

# Generation Services
from .font_pairing_engine import FontPairingEngine
from .figma_service import FigmaService
from .image_generation_service import ImageGenerationService

# Layer 5: Accessibility
from .accessibility_remediator import AccessibilityRemediator

# Stub imports (will be implemented by Agent 2/3)
# from .rag_content_engine import RAGContentEngine
# from .content_personalizer import ContentPersonalizer
# from .layout_iteration_engine import LayoutIterationEngine
# from .performance_intelligence import PerformanceIntelligence
# from .multilingual_generator import MultilingualGenerator

__all__ = [
    # Implemented
    'LayoutAnalyzer',
    'FontPairingEngine',
    'FigmaService',
    'ImageGenerationService',
    'AccessibilityRemediator',

    # Future (stubs)
    # 'RAGContentEngine',
    # 'ContentPersonalizer',
    # 'LayoutIterationEngine',
    # 'PerformanceIntelligence',
    # 'MultilingualGenerator',
]

__version__ = '2.0.0-ai-enhanced'
