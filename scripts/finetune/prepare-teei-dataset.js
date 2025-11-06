#!/usr/bin/env node

/**
 * TEEI Brand Training Dataset Preparation
 *
 * Prepares comprehensive training dataset for LoRA/QLoRA fine-tuning
 * to create TEEI-specific brand compliance models.
 *
 * Features:
 * - Collects A+ (good) and D/F (bad) brand examples
 * - Generates detailed annotations for each example
 * - Converts to LoRA training format (JSONL)
 * - Creates validation split (80/20)
 * - Extracts visual features for vector DB indexing
 *
 * Usage:
 *   node scripts/finetune/prepare-teei-dataset.js
 *   node scripts/finetune/prepare-teei-dataset.js --augment
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from 'playwright';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// TEEI Brand Guidelines (ground truth)
const TEEI_BRAND_SPEC = {
  colors: {
    approved: [
      { name: 'Nordshore', hex: '#00393F', usage: 'primary' },
      { name: 'Sky', hex: '#C9E4EC', usage: 'secondary' },
      { name: 'Sand', hex: '#FFF1E2', usage: 'background' },
      { name: 'Beige', hex: '#EFE1DC', usage: 'background' },
      { name: 'Moss', hex: '#65873B', usage: 'accent' },
      { name: 'Gold', hex: '#BA8F5A', usage: 'accent' },
      { name: 'Clay', hex: '#913B2F', usage: 'accent' }
    ],
    forbidden: [
      { name: 'Copper/Orange', hex: '#E87722', reason: 'Not in brand palette' },
      { name: 'Bright Orange', hex: '#FF6B00', reason: 'Too aggressive' }
    ]
  },
  typography: {
    headlines: {
      family: 'Lora',
      weights: ['Bold', 'SemiBold'],
      sizes: ['28pt', '42pt', '48pt']
    },
    body: {
      family: 'Roboto Flex',
      weights: ['Regular', 'Medium'],
      sizes: ['11pt', '12pt', '14pt']
    },
    captions: {
      family: 'Roboto Flex',
      weight: 'Regular',
      size: '9pt'
    }
  },
  layout: {
    grid: { columns: 12, gutter: '20pt' },
    margins: '40pt',
    spacing: {
      sections: '60pt',
      elements: '20pt',
      paragraphs: '12pt'
    },
    lineHeight: {
      body: 1.5,
      headlines: 1.2
    }
  },
  photography: {
    required: true,
    style: ['natural_light', 'warm_tones', 'authentic', 'diverse', 'hopeful'],
    forbidden: ['stock_corporate', 'staged', 'cold_lighting']
  },
  voice: {
    tone: ['empowering', 'urgent', 'hopeful', 'inclusive', 'respectful', 'clear'],
    forbidden: ['condescending', 'panic', 'naive', 'jargon']
  }
};

/**
 * Training example structure
 */
class TrainingExample {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.type = data.type; // 'good' or 'bad'
    this.grade = data.grade; // 'A+', 'A', 'B', 'C', 'D', 'F'
    this.score = data.score; // 0-10
    this.image_path = data.image_path;
    this.page_number = data.page_number || 1;
    this.violations = data.violations || [];
    this.strengths = data.strengths || [];
    this.metadata = data.metadata || {};
    this.features = data.features || {};
  }

  generateId() {
    return createHash('md5').update(JSON.stringify({
      timestamp: Date.now(),
      random: Math.random()
    })).digest('hex').substring(0, 16);
  }

  toLoRAFormat() {
    // Convert to OpenAI/Anthropic fine-tuning format
    const userPrompt = this.createUserPrompt();
    const assistantResponse = this.createAssistantResponse();

    return {
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: this.image_path
            },
            {
              type: 'text',
              text: userPrompt
            }
          ]
        },
        {
          role: 'assistant',
          content: assistantResponse
        }
      ]
    };
  }

  createUserPrompt() {
    return `Validate this TEEI partnership document for brand compliance.

Analyze against TEEI Brand Guidelines:

**Colors**: Nordshore #00393F (primary), Sky #C9E4EC (secondary), Sand #FFF1E2, Beige #EFE1DC, Moss #65873B, Gold #BA8F5A, Clay #913B2F. FORBIDDEN: Copper/orange tones.

**Typography**: Lora (headlines Bold/SemiBold 28-48pt), Roboto Flex (body Regular 11-14pt, captions 9pt).

**Layout**: 12-column grid, 40pt margins, 60pt section spacing, 20pt element spacing.

**Photography**: Natural light, warm tones, authentic moments (not stock/staged).

**Voice**: Empowering, urgent, hopeful, inclusive, respectful, clear.

Provide detailed validation results with grade (A+ to F), violations, and strengths.`;
  }

  createAssistantResponse() {
    const response = {
      grade: this.grade,
      score: this.score,
      overall_assessment: this.getOverallAssessment(),
      violations: this.violations.map(v => ({
        type: v.type,
        severity: v.severity,
        issue: v.issue,
        location: v.location,
        fix: v.fix,
        priority: v.priority
      })),
      strengths: this.strengths.map(s => ({
        aspect: s.aspect,
        description: s.description,
        impact: s.impact
      })),
      recommendations: this.generateRecommendations(),
      next_steps: this.generateNextSteps()
    };

    return JSON.stringify(response, null, 2);
  }

  getOverallAssessment() {
    if (this.grade === 'A+') {
      return 'World-class TEEI brand compliance. This document exemplifies perfect adherence to all brand guidelines with exceptional execution.';
    } else if (this.grade === 'A') {
      return 'Excellent TEEI brand compliance with minor areas for refinement.';
    } else if (this.grade === 'B') {
      return 'Good brand compliance with several moderate issues to address.';
    } else if (this.grade === 'C') {
      return 'Acceptable but requires significant improvements to meet TEEI standards.';
    } else if (this.grade === 'D') {
      return 'Multiple critical brand violations. Major revisions required.';
    } else {
      return 'Fails to meet TEEI brand standards. Complete redesign necessary.';
    }
  }

  generateRecommendations() {
    if (this.violations.length === 0) {
      return ['Maintain current quality standards', 'Use as reference for future documents'];
    }

    const recommendations = [];
    const violationTypes = new Set(this.violations.map(v => v.type));

    if (violationTypes.has('color')) {
      recommendations.push('Replace all non-brand colors with approved TEEI palette');
    }
    if (violationTypes.has('typography')) {
      recommendations.push('Update fonts to Lora (headlines) and Roboto Flex (body)');
    }
    if (violationTypes.has('text_cutoff')) {
      recommendations.push('Extend text frames and verify at 150%/200% zoom levels');
    }
    if (violationTypes.has('photography')) {
      recommendations.push('Replace stock images with authentic program photography');
    }
    if (violationTypes.has('layout')) {
      recommendations.push('Align to 12-column grid with proper spacing');
    }

    return recommendations;
  }

  generateNextSteps() {
    if (this.violations.length === 0) {
      return ['Approve for production', 'Archive as reference example'];
    }

    const critical = this.violations.filter(v => v.severity === 'critical');
    const high = this.violations.filter(v => v.severity === 'high');
    const medium = this.violations.filter(v => v.severity === 'medium');

    const steps = [];

    if (critical.length > 0) {
      steps.push(`Fix ${critical.length} critical violation(s) immediately`);
    }
    if (high.length > 0) {
      steps.push(`Address ${high.length} high-priority issue(s)`);
    }
    if (medium.length > 0) {
      steps.push(`Resolve ${medium.length} medium-priority issue(s)`);
    }

    steps.push('Re-validate after fixes applied');
    steps.push('Get stakeholder approval');

    return steps;
  }
}

/**
 * TEEI Dataset Builder
 */
class TEEIDatasetBuilder {
  constructor() {
    this.examples = [];
    this.browser = null;
    this.outputDir = path.join(ROOT_DIR, 'training-data');
    this.examplesDir = path.join(ROOT_DIR, 'training-examples');
  }

  async initialize() {
    console.log('🚀 Initializing TEEI Dataset Builder...\n');

    // Create directories
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.examplesDir, 'good-examples'), { recursive: true });
    await fs.mkdir(path.join(this.examplesDir, 'bad-examples'), { recursive: true });

    // Launch browser for screenshot extraction
    this.browser = await chromium.launch({ headless: true });

    console.log('✅ Initialized\n');
  }

  async buildDataset() {
    console.log('📚 Building TEEI training dataset...\n');

    // Collect good examples (A+/A)
    await this.collectGoodExamples();

    // Collect bad examples (D/F)
    await this.collectBadExamples();

    // Generate synthetic variations (data augmentation)
    await this.generateAugmentedExamples();

    // Split train/validation (80/20)
    const split = this.splitDataset(0.8);

    // Export to LoRA format
    await this.exportLoRAFormat(split);

    // Generate summary statistics
    const stats = this.generateStatistics();

    console.log('\n✅ Dataset built successfully!\n');
    console.log('📊 Statistics:');
    console.log(`   Total examples: ${this.examples.length}`);
    console.log(`   Training: ${split.train.length}`);
    console.log(`   Validation: ${split.validation.length}`);
    console.log(`   Good examples (A+/A): ${stats.good}`);
    console.log(`   Bad examples (D/F): ${stats.bad}`);
    console.log(`   Violation types: ${stats.violationTypes.join(', ')}`);

    return stats;
  }

  async collectGoodExamples() {
    console.log('📗 Collecting good examples (A+/A)...\n');

    const goodExamples = [
      // Example 1: Perfect color usage
      {
        type: 'good',
        grade: 'A+',
        score: 10.0,
        image_path: 'training-examples/good-examples/perfect-colors.png',
        strengths: [
          {
            aspect: 'color_palette',
            description: 'Perfect Nordshore #00393F usage throughout with Sky #C9E4EC accents',
            impact: 'Creates strong brand recognition and visual cohesion'
          },
          {
            aspect: 'color_contrast',
            description: 'WCAG AAA contrast ratios (10.7:1 for Nordshore on white)',
            impact: 'Ensures accessibility and readability'
          },
          {
            aspect: 'color_consistency',
            description: 'Consistent color application across all sections',
            impact: 'Professional, polished appearance'
          }
        ],
        metadata: {
          primary_color: '#00393F',
          secondary_color: '#C9E4EC',
          background: '#FFFFFF',
          contrast_ratio: 10.7
        },
        features: {
          colors_used: ['#00393F', '#C9E4EC', '#FFFFFF'],
          color_violations: []
        }
      },

      // Example 2: Perfect typography
      {
        type: 'good',
        grade: 'A+',
        score: 10.0,
        image_path: 'training-examples/good-examples/perfect-typography.png',
        strengths: [
          {
            aspect: 'font_selection',
            description: 'Lora Bold for headlines, Roboto Flex Regular for body text',
            impact: 'Perfect adherence to TEEI typography system'
          },
          {
            aspect: 'type_hierarchy',
            description: 'Clear hierarchy: 42pt titles, 28pt headers, 11pt body',
            impact: 'Easy to scan and comprehend'
          },
          {
            aspect: 'line_spacing',
            description: '1.5x body text, 1.2x headlines',
            impact: 'Optimal readability'
          },
          {
            aspect: 'text_completeness',
            description: 'No text cutoffs, all copy fully visible',
            impact: 'Professional finish, complete information'
          }
        ],
        metadata: {
          headline_font: 'Lora Bold',
          body_font: 'Roboto Flex Regular',
          headline_size: '42pt',
          body_size: '11pt'
        },
        features: {
          fonts_used: ['Lora', 'Roboto Flex'],
          font_violations: [],
          text_cutoffs: []
        }
      },

      // Example 3: Perfect layout
      {
        type: 'good',
        grade: 'A+',
        score: 9.8,
        image_path: 'training-examples/good-examples/perfect-layout.png',
        strengths: [
          {
            aspect: 'grid_alignment',
            description: '12-column grid with 20pt gutters, all elements aligned',
            impact: 'Clean, organized visual structure'
          },
          {
            aspect: 'spacing_consistency',
            description: '60pt section breaks, 20pt element spacing, 12pt paragraph spacing',
            impact: 'Visual rhythm and breathing room'
          },
          {
            aspect: 'margins',
            description: '40pt margins on all sides',
            impact: 'Professional framing and balance'
          },
          {
            aspect: 'logo_clearspace',
            description: 'Proper clearspace (logo icon height) maintained',
            impact: 'Brand integrity and visual clarity'
          }
        ],
        metadata: {
          grid: '12-column',
          margins: '40pt',
          section_spacing: '60pt'
        },
        features: {
          layout_violations: [],
          spacing_consistent: true
        }
      },

      // Example 4: Perfect photography
      {
        type: 'good',
        grade: 'A+',
        score: 9.9,
        image_path: 'training-examples/good-examples/perfect-photography.png',
        strengths: [
          {
            aspect: 'image_quality',
            description: 'High-resolution program photography, natural lighting',
            impact: 'Authentic, engaging visual storytelling'
          },
          {
            aspect: 'color_grading',
            description: 'Warm tones aligned with Sand/Beige palette',
            impact: 'Cohesive brand aesthetic'
          },
          {
            aspect: 'authenticity',
            description: 'Real program moments, diverse representation',
            impact: 'Emotional connection and credibility'
          },
          {
            aspect: 'composition',
            description: 'Well-composed shots showing connection and hope',
            impact: 'Supports brand voice (hopeful, empowering)'
          }
        ],
        metadata: {
          image_type: 'authentic_program_photo',
          lighting: 'natural',
          color_tone: 'warm'
        },
        features: {
          photography_style: 'authentic',
          stock_images: false
        }
      },

      // Example 5: Complete world-class document
      {
        type: 'good',
        grade: 'A+',
        score: 10.0,
        image_path: 'training-examples/good-examples/world-class-complete.png',
        strengths: [
          {
            aspect: 'comprehensive_compliance',
            description: 'All brand guidelines followed perfectly',
            impact: 'World-class quality, ready for production'
          },
          {
            aspect: 'visual_impact',
            description: 'Striking design that captures attention',
            impact: 'Strong first impression'
          },
          {
            aspect: 'content_quality',
            description: 'Clear value proposition, specific program details, compelling CTA',
            impact: 'Effective communication and call to action'
          },
          {
            aspect: 'emotional_resonance',
            description: 'Evokes hope, empowerment, and urgency',
            impact: 'Motivates partnership action'
          }
        ],
        metadata: {
          document_type: 'partnership_overview',
          page_count: 1,
          quality: 'world-class'
        },
        features: {
          complete_compliance: true,
          violations: []
        }
      }
    ];

    for (const data of goodExamples) {
      const example = new TrainingExample(data);
      this.examples.push(example);
    }

    console.log(`   Added ${goodExamples.length} good examples\n`);
  }

  async collectBadExamples() {
    console.log('📕 Collecting bad examples (D/F)...\n');

    const badExamples = [
      // Example 1: Wrong colors (copper/orange)
      {
        type: 'bad',
        grade: 'D',
        score: 3.5,
        image_path: 'training-examples/bad-examples/wrong-colors.png',
        violations: [
          {
            type: 'color',
            severity: 'critical',
            issue: 'Using copper/orange #E87722 instead of Nordshore #00393F',
            location: 'Page 1: Header, section backgrounds',
            fix: 'Replace all copper/orange with Nordshore #00393F',
            priority: 1
          },
          {
            type: 'color',
            severity: 'critical',
            issue: 'Orange accent color #FF6B00 not in brand palette',
            location: 'Page 1: Metric callouts, CTA button',
            fix: 'Replace with Gold #BA8F5A or Nordshore #00393F',
            priority: 1
          },
          {
            type: 'color',
            severity: 'high',
            issue: 'Inconsistent color usage across sections',
            location: 'Page 1: Multiple sections',
            fix: 'Establish consistent color system per brand guidelines',
            priority: 2
          }
        ],
        strengths: [],
        metadata: {
          colors_used: ['#E87722', '#FF6B00', '#333333'],
          forbidden_colors: ['#E87722', '#FF6B00']
        },
        features: {
          color_violations: ['copper', 'orange'],
          approved_colors_used: []
        }
      },

      // Example 2: Wrong typography
      {
        type: 'bad',
        grade: 'D',
        score: 4.0,
        image_path: 'training-examples/bad-examples/wrong-fonts.png',
        violations: [
          {
            type: 'typography',
            severity: 'critical',
            issue: 'Using Arial instead of Lora for headlines',
            location: 'Page 1: All headline text',
            fix: 'Replace Arial with Lora Bold/SemiBold',
            priority: 1
          },
          {
            type: 'typography',
            severity: 'high',
            issue: 'Using Helvetica instead of Roboto Flex for body text',
            location: 'Page 1: All body copy',
            fix: 'Replace Helvetica with Roboto Flex Regular',
            priority: 1
          },
          {
            type: 'typography',
            severity: 'medium',
            issue: 'Inconsistent font sizes (14pt, 16pt, 19pt used)',
            location: 'Page 1: Various text blocks',
            fix: 'Standardize to 42pt titles, 28pt headers, 11pt body',
            priority: 2
          }
        ],
        strengths: [],
        metadata: {
          fonts_used: ['Arial', 'Helvetica'],
          required_fonts: ['Lora', 'Roboto Flex']
        },
        features: {
          font_violations: ['Arial', 'Helvetica'],
          approved_fonts_used: []
        }
      },

      // Example 3: Text cutoffs
      {
        type: 'bad',
        grade: 'D',
        score: 3.0,
        image_path: 'training-examples/bad-examples/text-cutoffs.png',
        violations: [
          {
            type: 'text_cutoff',
            severity: 'critical',
            issue: 'Header text cut off: "THE EDUCATIONAL EQUALITY IN-"',
            location: 'Page 1: Header, right edge',
            fix: 'Extend text frame width by 30pt or reduce font size to 38pt',
            priority: 1
          },
          {
            type: 'text_cutoff',
            severity: 'critical',
            issue: 'CTA text cut off: "Ready to Transform Educa-"',
            location: 'Page 1: Call to action section, bottom',
            fix: 'Extend text frame or reduce font size',
            priority: 1
          },
          {
            type: 'text_cutoff',
            severity: 'high',
            issue: 'Metric label incomplete: "XX Stude"',
            location: 'Page 1: Metrics section',
            fix: 'Increase text frame width, verify at 150%/200% zoom',
            priority: 1
          }
        ],
        strengths: [],
        metadata: {
          cutoffs_found: 3,
          locations: ['header', 'cta', 'metrics']
        },
        features: {
          text_cutoffs: ['header', 'cta', 'metrics'],
          complete_text: false
        }
      },

      // Example 4: Missing photography
      {
        type: 'bad',
        grade: 'D',
        score: 4.5,
        image_path: 'training-examples/bad-examples/no-photography.png',
        violations: [
          {
            type: 'photography',
            severity: 'critical',
            issue: 'No photography included (brand requires authentic program images)',
            location: 'Page 1: Entire document',
            fix: 'Add 3-5 high-quality program photos with natural lighting',
            priority: 1
          },
          {
            type: 'photography',
            severity: 'high',
            issue: 'Text-only design lacks visual engagement',
            location: 'Page 1: All sections',
            fix: 'Integrate hero image and section supporting images',
            priority: 1
          },
          {
            type: 'visual_impact',
            severity: 'medium',
            issue: 'Limited visual hierarchy and impact',
            location: 'Page 1: Overall design',
            fix: 'Add imagery to create visual interest and emotional connection',
            priority: 2
          }
        ],
        strengths: [],
        metadata: {
          images_included: 0,
          images_required: 3
        },
        features: {
          photography_included: false,
          image_count: 0
        }
      },

      // Example 5: Layout violations
      {
        type: 'bad',
        grade: 'D',
        score: 3.8,
        image_path: 'training-examples/bad-examples/layout-violations.png',
        violations: [
          {
            type: 'layout',
            severity: 'high',
            issue: 'Not using 12-column grid, elements misaligned',
            location: 'Page 1: All sections',
            fix: 'Implement 12-column grid with 20pt gutters, align all elements',
            priority: 1
          },
          {
            type: 'layout',
            severity: 'high',
            issue: 'Inconsistent spacing (15pt, 25pt, 40pt used randomly)',
            location: 'Page 1: Between sections and elements',
            fix: 'Apply standard spacing: 60pt sections, 20pt elements, 12pt paragraphs',
            priority: 1
          },
          {
            type: 'layout',
            severity: 'medium',
            issue: 'Margins too tight (20pt instead of 40pt)',
            location: 'Page 1: All edges',
            fix: 'Increase margins to 40pt on all sides',
            priority: 2
          },
          {
            type: 'layout',
            severity: 'medium',
            issue: 'Logo clearspace violated',
            location: 'Page 1: Header, TEEI logo',
            fix: 'Add clearspace equal to logo icon height',
            priority: 2
          }
        ],
        strengths: [],
        metadata: {
          grid_used: 'none',
          margins: '20pt',
          spacing_consistent: false
        },
        features: {
          layout_violations: ['grid', 'spacing', 'margins', 'clearspace'],
          grid_compliant: false
        }
      },

      // Example 6: Multiple critical violations
      {
        type: 'bad',
        grade: 'F',
        score: 1.5,
        image_path: 'training-examples/bad-examples/multiple-violations.png',
        violations: [
          {
            type: 'color',
            severity: 'critical',
            issue: 'Wrong color palette (copper/orange)',
            location: 'Page 1: Throughout',
            fix: 'Replace with TEEI approved colors',
            priority: 1
          },
          {
            type: 'typography',
            severity: 'critical',
            issue: 'Wrong fonts (Arial/Helvetica)',
            location: 'Page 1: All text',
            fix: 'Replace with Lora/Roboto Flex',
            priority: 1
          },
          {
            type: 'text_cutoff',
            severity: 'critical',
            issue: 'Multiple text cutoffs',
            location: 'Page 1: Header, CTA, metrics',
            fix: 'Extend all text frames',
            priority: 1
          },
          {
            type: 'photography',
            severity: 'critical',
            issue: 'No photography',
            location: 'Page 1: Entire document',
            fix: 'Add authentic program photos',
            priority: 1
          },
          {
            type: 'layout',
            severity: 'critical',
            issue: 'No grid structure',
            location: 'Page 1: Overall',
            fix: 'Implement 12-column grid',
            priority: 1
          },
          {
            type: 'content',
            severity: 'high',
            issue: 'Placeholder text ("XX Students")',
            location: 'Page 1: Metrics',
            fix: 'Replace with actual numbers',
            priority: 1
          }
        ],
        strengths: [],
        metadata: {
          violations_count: 6,
          critical_count: 5,
          quality: 'unacceptable'
        },
        features: {
          complete_compliance: false,
          requires_redesign: true
        }
      }
    ];

    for (const data of badExamples) {
      const example = new TrainingExample(data);
      this.examples.push(example);
    }

    console.log(`   Added ${badExamples.length} bad examples\n`);
  }

  async generateAugmentedExamples() {
    console.log('🔄 Generating augmented examples (data augmentation)...\n');

    // Create variations of existing examples
    const augmentations = [];

    // Color variations
    augmentations.push({
      type: 'bad',
      grade: 'C',
      score: 5.5,
      image_path: 'training-examples/bad-examples/color-variation-1.png',
      violations: [
        {
          type: 'color',
          severity: 'high',
          issue: 'Using Sky #C9E4EC as primary color instead of accent',
          location: 'Page 1: Header background',
          fix: 'Use Nordshore #00393F as primary, Sky as accent',
          priority: 1
        }
      ],
      strengths: [
        {
          aspect: 'typography',
          description: 'Correct fonts used (Lora/Roboto Flex)',
          impact: 'Typography compliance maintained'
        }
      ],
      metadata: {
        primary_color: '#C9E4EC',
        should_be: '#00393F'
      }
    });

    // Typography variations
    augmentations.push({
      type: 'bad',
      grade: 'C',
      score: 6.0,
      image_path: 'training-examples/bad-examples/font-variation-1.png',
      violations: [
        {
          type: 'typography',
          severity: 'medium',
          issue: 'Using Lora Regular instead of Lora Bold for main headline',
          location: 'Page 1: Document title',
          fix: 'Change to Lora Bold for proper hierarchy',
          priority: 2
        }
      ],
      strengths: [
        {
          aspect: 'color_palette',
          description: 'Correct TEEI colors used throughout',
          impact: 'Strong brand recognition'
        }
      ],
      metadata: {
        headline_weight: 'Regular',
        should_be: 'Bold'
      }
    });

    // Layout variations
    augmentations.push({
      type: 'bad',
      grade: 'B',
      score: 7.0,
      image_path: 'training-examples/bad-examples/layout-variation-1.png',
      violations: [
        {
          type: 'layout',
          severity: 'medium',
          issue: 'Section spacing inconsistent (40pt and 80pt used)',
          location: 'Page 1: Between sections',
          fix: 'Standardize to 60pt section spacing',
          priority: 2
        }
      ],
      strengths: [
        {
          aspect: 'overall_design',
          description: 'Good foundation with minor spacing issues',
          impact: 'Nearly compliant, easy fix'
        }
      ],
      metadata: {
        spacing_values: ['40pt', '80pt'],
        should_be: '60pt'
      }
    });

    for (const data of augmentations) {
      const example = new TrainingExample(data);
      this.examples.push(example);
    }

    console.log(`   Generated ${augmentations.length} augmented examples\n`);
  }

  splitDataset(trainRatio = 0.8) {
    console.log('✂️  Splitting dataset (train/validation)...\n');

    // Shuffle examples
    const shuffled = [...this.examples].sort(() => Math.random() - 0.5);

    // Split
    const trainSize = Math.floor(shuffled.length * trainRatio);
    const train = shuffled.slice(0, trainSize);
    const validation = shuffled.slice(trainSize);

    console.log(`   Training: ${train.length} examples (${Math.round(trainRatio * 100)}%)`);
    console.log(`   Validation: ${validation.length} examples (${Math.round((1 - trainRatio) * 100)}%)\n`);

    return { train, validation };
  }

  async exportLoRAFormat(split) {
    console.log('💾 Exporting to LoRA training format (JSONL)...\n');

    // Export training set
    const trainPath = path.join(this.outputDir, 'teei-train.jsonl');
    const trainLines = split.train.map(ex => JSON.stringify(ex.toLoRAFormat()));
    await fs.writeFile(trainPath, trainLines.join('\n'), 'utf-8');
    console.log(`   ✅ Training set: ${trainPath}`);

    // Export validation set
    const valPath = path.join(this.outputDir, 'teei-validation.jsonl');
    const valLines = split.validation.map(ex => JSON.stringify(ex.toLoRAFormat()));
    await fs.writeFile(valPath, valLines.join('\n'), 'utf-8');
    console.log(`   ✅ Validation set: ${valPath}`);

    // Export full dataset (for reference)
    const fullPath = path.join(this.outputDir, 'teei-full-dataset.json');
    await fs.writeFile(fullPath, JSON.stringify({
      version: '1.0.0',
      created: new Date().toISOString(),
      total_examples: this.examples.length,
      brand_spec: TEEI_BRAND_SPEC,
      examples: this.examples.map(ex => ({
        id: ex.id,
        type: ex.type,
        grade: ex.grade,
        score: ex.score,
        violations_count: ex.violations.length,
        strengths_count: ex.strengths.length
      }))
    }, null, 2), 'utf-8');
    console.log(`   ✅ Full dataset: ${fullPath}\n`);
  }

  generateStatistics() {
    const stats = {
      total: this.examples.length,
      good: this.examples.filter(ex => ex.type === 'good').length,
      bad: this.examples.filter(ex => ex.type === 'bad').length,
      byGrade: {},
      violationTypes: new Set(),
      strengthAspects: new Set()
    };

    // Count by grade
    for (const ex of this.examples) {
      stats.byGrade[ex.grade] = (stats.byGrade[ex.grade] || 0) + 1;

      for (const v of ex.violations) {
        stats.violationTypes.add(v.type);
      }

      for (const s of ex.strengths) {
        stats.strengthAspects.add(s.aspect);
      }
    }

    stats.violationTypes = Array.from(stats.violationTypes);
    stats.strengthAspects = Array.from(stats.strengthAspects);

    return stats;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const builder = new TEEIDatasetBuilder();

  try {
    await builder.initialize();
    const stats = await builder.buildDataset();

    console.log('\n📦 Training dataset ready!');
    console.log('   Location: training-data/');
    console.log('   Files:');
    console.log('   - teei-train.jsonl (training examples)');
    console.log('   - teei-validation.jsonl (validation examples)');
    console.log('   - teei-full-dataset.json (complete dataset with metadata)');
    console.log('\n🚀 Next steps:');
    console.log('   1. Review generated dataset in training-data/');
    console.log('   2. Add actual PDF/image examples to training-examples/');
    console.log('   3. Run: node scripts/finetune/train-lora-model.js');
    console.log('   4. Deploy fine-tuned model for TEEI-specific validation\n');

    return stats;
  } catch (error) {
    console.error('❌ Error building dataset:', error);
    throw error;
  } finally {
    await builder.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { TEEIDatasetBuilder, TrainingExample, TEEI_BRAND_SPEC };
