/**
 * Illustration Library
 *
 * Predefined illustration templates and scene compositions for TEEI materials
 *
 * Features:
 * - Scene templates (hero, people, technology, education)
 * - Character generator (diverse, inclusive)
 * - Background patterns
 * - Decorative elements
 * - Composition presets
 *
 * @module illustration-library
 */

class IllustrationLibrary {
  constructor() {
    // TEEI brand colors
    this.colors = {
      primary: {
        nordshore: '#00393F',
        sky: '#C9E4EC',
        sand: '#FFF1E2',
        beige: '#EFE1DC'
      },
      accent: {
        moss: '#65873B',
        gold: '#BA8F5A',
        clay: '#913B2F'
      }
    };

    // Scene templates
    this.sceneTemplates = this.initSceneTemplates();

    // Character templates
    this.characterTemplates = this.initCharacterTemplates();

    // Background patterns
    this.backgroundPatterns = this.initBackgroundPatterns();

    // Decorative elements
    this.decorativeElements = this.initDecorativeElements();

    // Composition presets
    this.compositionPresets = this.initCompositionPresets();
  }

  /**
   * Initialize scene templates
   */
  initSceneTemplates() {
    return {
      hero: {
        name: 'Hero Scene',
        description: 'Large, impactful scene for cover or header',
        templates: {
          educationTransformation: {
            name: 'Education Transformation',
            prompt: 'Diverse students in modern learning environment, warm natural lighting, using technology collaboratively, inspiring and hopeful atmosphere',
            mood: 'inspiring, hopeful, empowering',
            composition: 'landscape, balanced, clear focal point',
            elements: ['students', 'technology', 'learning', 'collaboration']
          },
          globalConnection: {
            name: 'Global Connection',
            prompt: 'Students from different backgrounds connected through technology, world map elements, warm colors, sense of unity and hope',
            mood: 'connected, inclusive, hopeful',
            composition: 'centered focal point, flowing connections',
            elements: ['diversity', 'technology', 'global', 'connection']
          },
          brightFuture: {
            name: 'Bright Future',
            prompt: 'Young students looking toward horizon, bright warm light, educational elements, sense of possibility and opportunity',
            mood: 'hopeful, optimistic, inspiring',
            composition: 'rule of thirds, horizon focus',
            elements: ['students', 'horizon', 'light', 'opportunity']
          },
          innovationHub: {
            name: 'Innovation Hub',
            prompt: 'Modern learning space with collaborative technology, students engaged in creative work, warm professional environment',
            mood: 'innovative, collaborative, professional',
            composition: 'dynamic, multiple focal points',
            elements: ['innovation', 'collaboration', 'technology', 'creativity']
          },
          inclusiveClassroom: {
            name: 'Inclusive Classroom',
            prompt: 'Diverse students of all backgrounds learning together, accessible technology, warm welcoming atmosphere, celebration of diversity',
            mood: 'inclusive, welcoming, empowering',
            composition: 'balanced, circular arrangement',
            elements: ['diversity', 'inclusion', 'accessibility', 'community']
          }
        }
      },

      people: {
        name: 'People-Focused',
        description: 'Emphasizes human stories and connections',
        templates: {
          studentSuccess: {
            name: 'Student Success',
            prompt: 'Individual student celebrating learning achievement, genuine expression, warm natural lighting, educational setting',
            mood: 'joyful, authentic, inspiring',
            composition: 'portrait orientation, close-up',
            elements: ['student', 'achievement', 'joy', 'authenticity']
          },
          teacherMentor: {
            name: 'Teacher Mentor',
            prompt: 'Educator guiding student, warm supportive interaction, modern learning environment, respect and empowerment',
            mood: 'supportive, respectful, nurturing',
            composition: 'two-person interaction, eye-level',
            elements: ['teacher', 'student', 'mentorship', 'support']
          },
          peerCollaboration: {
            name: 'Peer Collaboration',
            prompt: 'Students working together on project, diverse group, technology-enabled collaboration, shared excitement',
            mood: 'collaborative, energetic, inclusive',
            composition: 'group arrangement, shared focus',
            elements: ['collaboration', 'peers', 'teamwork', 'technology']
          },
          communityGathering: {
            name: 'Community Gathering',
            prompt: 'Educational community coming together, diverse ages and backgrounds, warm welcoming space, sense of belonging',
            mood: 'communal, welcoming, inclusive',
            composition: 'wide shot, community gathering',
            elements: ['community', 'diversity', 'gathering', 'belonging']
          },
          familyEngagement: {
            name: 'Family Engagement',
            prompt: 'Family members engaged in learning together, intergenerational, warm home or community setting, technology bridging connections',
            mood: 'warm, familial, supportive',
            composition: 'family group, intimate setting',
            elements: ['family', 'intergenerational', 'support', 'connection']
          }
        }
      },

      technology: {
        name: 'Technology-Focused',
        description: 'Highlights educational technology and innovation',
        templates: {
          cloudLearning: {
            name: 'Cloud Learning',
            prompt: 'Modern cloud-based learning platform, clean interface, students accessing from multiple devices, seamless connection',
            mood: 'modern, efficient, accessible',
            composition: 'layered, device showcase',
            elements: ['cloud', 'devices', 'connectivity', 'platform']
          },
          aiEducation: {
            name: 'AI in Education',
            prompt: 'AI-powered learning tools helping students, transparent technology, human-centered design, empowering not replacing',
            mood: 'innovative, supportive, transparent',
            composition: 'human-tech balance, clear interface',
            elements: ['AI', 'assistance', 'transparency', 'empowerment']
          },
          digitalAccessibility: {
            name: 'Digital Accessibility',
            prompt: 'Accessible technology enabling all students, assistive features, inclusive design, barrier-free learning',
            mood: 'inclusive, empowering, accessible',
            composition: 'accessibility features prominent',
            elements: ['accessibility', 'inclusion', 'assistive tech', 'universal design']
          },
          virtualClassroom: {
            name: 'Virtual Classroom',
            prompt: 'Students connected in virtual learning environment, warm personal touches despite digital medium, sense of presence',
            mood: 'connected, personal, engaging',
            composition: 'screen grid, personal connections',
            elements: ['virtual', 'connection', 'presence', 'engagement']
          },
          dataVisualization: {
            name: 'Data Visualization',
            prompt: 'Educational data presented beautifully and clearly, student progress and growth, inspiring insights, warm professional design',
            mood: 'clear, insightful, inspiring',
            composition: 'data-driven, visual hierarchy',
            elements: ['data', 'visualization', 'progress', 'insights']
          }
        }
      },

      education: {
        name: 'Education-Focused',
        description: 'Core educational themes and activities',
        templates: {
          activelearning: {
            name: 'Active Learning',
            prompt: 'Students actively engaged in hands-on learning, experimentation and discovery, excitement and curiosity, supportive environment',
            mood: 'curious, engaged, exploratory',
            composition: 'action-oriented, dynamic',
            elements: ['hands-on', 'discovery', 'curiosity', 'engagement']
          },
          criticalThinking: {
            name: 'Critical Thinking',
            prompt: 'Students solving complex problems, thoughtful expressions, collaborative problem-solving, intellectual engagement',
            mood: 'thoughtful, analytical, engaged',
            composition: 'problem-solving focus, concentrated',
            elements: ['thinking', 'problem-solving', 'analysis', 'collaboration']
          },
          creativity: {
            name: 'Creativity',
            prompt: 'Students expressing creativity through various mediums, artistic and technical creation, supportive space for experimentation',
            mood: 'creative, expressive, supportive',
            composition: 'creative process, diverse media',
            elements: ['creativity', 'expression', 'creation', 'experimentation']
          },
          literacyDevelopment: {
            name: 'Literacy Development',
            prompt: 'Students developing reading and writing skills, diverse languages, supportive learning environment, joy of literacy',
            mood: 'supportive, developmental, joyful',
            composition: 'learning focused, supportive setting',
            elements: ['literacy', 'language', 'development', 'support']
          },
          stemExploration: {
            name: 'STEM Exploration',
            prompt: 'Students exploring science, technology, engineering, math through hands-on activities, diverse participation, excitement of discovery',
            mood: 'exploratory, exciting, inclusive',
            composition: 'hands-on activities, diverse participants',
            elements: ['STEM', 'exploration', 'hands-on', 'discovery']
          }
        }
      },

      impact: {
        name: 'Impact & Results',
        description: 'Showcasing outcomes and transformations',
        templates: {
          beforeAfter: {
            name: 'Before & After',
            prompt: 'Visual representation of transformation, student journey from challenge to success, hopeful and empowering narrative',
            mood: 'transformative, hopeful, empowering',
            composition: 'split-screen or sequential',
            elements: ['transformation', 'journey', 'progress', 'success']
          },
          graduationSuccess: {
            name: 'Graduation Success',
            prompt: 'Students celebrating educational achievement, diverse graduates, families celebrating, hopeful future ahead',
            mood: 'celebratory, proud, hopeful',
            composition: 'celebration focused, joyful',
            elements: ['graduation', 'achievement', 'celebration', 'success']
          },
          communityImpact: {
            name: 'Community Impact',
            prompt: 'Educational program transforming entire community, multiple generations benefiting, ripple effect of positive change',
            mood: 'impactful, transformative, hopeful',
            composition: 'wide view, community scale',
            elements: ['community', 'impact', 'transformation', 'ripple effect']
          },
          globalReach: {
            name: 'Global Reach',
            prompt: 'Students across the world benefiting from educational programs, global connections, diverse cultures unified in learning',
            mood: 'global, connected, inclusive',
            composition: 'world map, global connections',
            elements: ['global', 'reach', 'diversity', 'connection']
          },
          sustainableChange: {
            name: 'Sustainable Change',
            prompt: 'Long-term sustainable educational impact, growing and thriving over time, roots taking hold, future-focused',
            mood: 'sustainable, growing, future-focused',
            composition: 'growth metaphor, timeline',
            elements: ['sustainability', 'growth', 'long-term', 'future']
          }
        }
      },

      abstract: {
        name: 'Abstract & Conceptual',
        description: 'Symbolic and conceptual representations',
        templates: {
          growingKnowledge: {
            name: 'Growing Knowledge',
            prompt: 'Abstract representation of knowledge and learning growing like a tree or network, organic forms, warm colors, sense of expansion',
            mood: 'organic, growing, expansive',
            composition: 'central growth, radiating outward',
            elements: ['growth', 'knowledge', 'network', 'organic']
          },
          bridgingDivides: {
            name: 'Bridging Divides',
            prompt: 'Abstract bridges connecting separated elements, overcoming barriers, unity and inclusion, warm hopeful colors',
            mood: 'unifying, hopeful, connecting',
            composition: 'bridge metaphor, connection',
            elements: ['bridge', 'connection', 'unity', 'inclusion']
          },
          lighteningPath: {
            name: 'Lightening the Path',
            prompt: 'Light illuminating a path forward, guidance and hope, warm golden light, clear direction and purpose',
            mood: 'hopeful, guiding, purposeful',
            composition: 'path with light, directional',
            elements: ['light', 'path', 'guidance', 'hope']
          },
          openDoors: {
            name: 'Opening Doors',
            prompt: 'Doors opening to reveal opportunities, bright light beyond, welcoming and accessible, sense of possibility',
            mood: 'welcoming, opportunistic, accessible',
            composition: 'doorway, threshold, transition',
            elements: ['doors', 'opportunity', 'access', 'possibility']
          },
          risingTogether: {
            name: 'Rising Together',
            prompt: 'Abstract figures or elements rising together, collective uplift, unity in ascension, warm supportive energy',
            mood: 'collective, uplifting, supportive',
            composition: 'upward movement, together',
            elements: ['rising', 'collective', 'uplift', 'unity']
          }
        }
      }
    };
  }

  /**
   * Initialize character templates
   */
  initCharacterTemplates() {
    return {
      demographics: {
        ages: ['child (6-10)', 'adolescent (11-14)', 'teen (15-18)', 'young adult (19-25)', 'adult (26-50)', 'senior (50+)'],
        ethnicities: ['diverse ethnicities', 'multiple backgrounds', 'global representation'],
        abilities: ['various abilities', 'visible and invisible differences', 'universal accessibility'],
        genders: ['diverse gender presentations', 'inclusive representation']
      },
      roles: {
        students: 'Primary learners, curious and engaged',
        teachers: 'Supportive educators and mentors',
        families: 'Supportive family members and caregivers',
        administrators: 'Educational leaders and organizers',
        community: 'Community members and supporters',
        partners: 'Partnership representatives and collaborators'
      },
      expressions: {
        joyful: 'Genuine happiness and excitement',
        thoughtful: 'Engaged in deep thinking',
        curious: 'Exploring and discovering',
        proud: 'Celebrating achievement',
        supportive: 'Helping and encouraging',
        determined: 'Focused and committed',
        hopeful: 'Looking forward with optimism'
      },
      activities: {
        learning: 'Engaged in active learning',
        teaching: 'Sharing knowledge and skills',
        collaborating: 'Working together',
        creating: 'Making and building',
        presenting: 'Sharing ideas and work',
        celebrating: 'Recognizing achievement',
        supporting: 'Helping and encouraging'
      }
    };
  }

  /**
   * Initialize background patterns
   */
  initBackgroundPatterns() {
    return {
      geometric: {
        gridPattern: {
          description: 'Subtle grid pattern suggesting structure and organization',
          colors: ['Sand #FFF1E2', 'Beige #EFE1DC'],
          opacity: 0.3,
          usage: 'Technical or structured content backgrounds'
        },
        circlePattern: {
          description: 'Overlapping circles suggesting connection and community',
          colors: ['Sky #C9E4EC', 'Sand #FFF1E2'],
          opacity: 0.2,
          usage: 'Community and collaboration themes'
        },
        hexagonPattern: {
          description: 'Hexagon tessellation suggesting efficiency and innovation',
          colors: ['Nordshore #00393F', 'Sky #C9E4EC'],
          opacity: 0.15,
          usage: 'Technology and innovation themes'
        }
      },
      organic: {
        wavePattern: {
          description: 'Flowing waves suggesting movement and growth',
          colors: ['Sky #C9E4EC', 'Sand #FFF1E2'],
          opacity: 0.25,
          usage: 'Progress and transformation themes'
        },
        leafPattern: {
          description: 'Subtle leaf motifs suggesting growth and nature',
          colors: ['Moss #65873B', 'Sand #FFF1E2'],
          opacity: 0.2,
          usage: 'Growth and sustainability themes'
        },
        cloudPattern: {
          description: 'Soft cloud shapes suggesting possibility and aspiration',
          colors: ['Sky #C9E4EC', 'White'],
          opacity: 0.3,
          usage: 'Vision and future themes'
        }
      },
      textured: {
        paperTexture: {
          description: 'Subtle paper texture adding warmth and authenticity',
          colors: ['Sand #FFF1E2', 'Beige #EFE1DC'],
          opacity: 0.4,
          usage: 'Traditional and authentic content'
        },
        fabricTexture: {
          description: 'Woven fabric texture suggesting craftsmanship',
          colors: ['Beige #EFE1DC', 'Sand #FFF1E2'],
          opacity: 0.3,
          usage: 'Handcrafted and artisanal themes'
        },
        watercolorTexture: {
          description: 'Watercolor wash adding artistic warmth',
          colors: ['Sky #C9E4EC', 'Sand #FFF1E2', 'Gold #BA8F5A'],
          opacity: 0.35,
          usage: 'Creative and artistic content'
        }
      }
    };
  }

  /**
   * Initialize decorative elements
   */
  initDecorativeElements() {
    return {
      icons: {
        education: ['book', 'graduation cap', 'pencil', 'lightbulb', 'globe', 'certificate'],
        technology: ['laptop', 'cloud', 'connection', 'gear', 'graph', 'shield'],
        people: ['group', 'handshake', 'heart', 'star', 'trophy', 'badge'],
        nature: ['tree', 'leaf', 'sun', 'mountain', 'wave', 'seed']
      },
      shapes: {
        structural: ['circle', 'square', 'triangle', 'hexagon', 'rectangle'],
        organic: ['blob', 'wave', 'curve', 'spiral', 'leaf'],
        directional: ['arrow', 'line', 'path', 'flow', 'beam']
      },
      accents: {
        lines: 'Decorative lines for section breaks',
        dots: 'Dot patterns for visual interest',
        corners: 'Corner flourishes for elegance',
        borders: 'Subtle borders for definition',
        highlights: 'Color highlights for emphasis'
      }
    };
  }

  /**
   * Initialize composition presets
   */
  initCompositionPresets() {
    return {
      hero: {
        name: 'Hero Composition',
        aspectRatio: '16:9',
        layout: 'Full-width header image',
        textPlacement: 'Left or right third with overlay',
        visualWeight: 'Strong focal point, balanced negative space',
        usage: 'Cover pages, section headers, landing pages'
      },
      split: {
        name: 'Split Composition',
        aspectRatio: '1:1 or 16:9',
        layout: '50/50 split between image and text',
        textPlacement: 'One half dedicated to text',
        visualWeight: 'Balanced, equal weight to both sides',
        usage: 'Feature highlights, program descriptions'
      },
      card: {
        name: 'Card Composition',
        aspectRatio: '4:3 or 3:2',
        layout: 'Contained image with caption/text below',
        textPlacement: 'Below image in dedicated space',
        visualWeight: 'Image focal point, supporting text',
        usage: 'Program cards, feature grid, gallery'
      },
      background: {
        name: 'Background Composition',
        aspectRatio: 'Flexible',
        layout: 'Full-bleed background with text overlay',
        textPlacement: 'Centered or rule-of-thirds with overlay',
        visualWeight: 'Subtle background, text is primary',
        usage: 'Call-to-action sections, quotes, testimonials'
      },
      sidebar: {
        name: 'Sidebar Composition',
        aspectRatio: '3:4 or 9:16',
        layout: 'Tall image in sidebar position',
        textPlacement: 'Adjacent to image in main column',
        visualWeight: 'Supporting visual to main text',
        usage: 'Blog posts, case studies, detailed content'
      }
    };
  }

  /**
   * Get scene template
   */
  getSceneTemplate(category, templateName) {
    if (this.sceneTemplates[category] && this.sceneTemplates[category].templates[templateName]) {
      return this.sceneTemplates[category].templates[templateName];
    }
    return null;
  }

  /**
   * Get all templates by category
   */
  getTemplatesByCategory(category) {
    return this.sceneTemplates[category] || null;
  }

  /**
   * Get random template
   */
  getRandomTemplate(category = null) {
    if (category && this.sceneTemplates[category]) {
      const templates = Object.values(this.sceneTemplates[category].templates);
      return templates[Math.floor(Math.random() * templates.length)];
    } else {
      // Random category
      const categories = Object.keys(this.sceneTemplates);
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      return this.getRandomTemplate(randomCategory);
    }
  }

  /**
   * Build character description
   */
  buildCharacterDescription(options = {}) {
    const {
      age = 'adolescent (11-14)',
      role = 'students',
      expression = 'joyful',
      activity = 'learning',
      diversity = true
    } = options;

    let description = '';

    if (diversity) {
      description += 'Diverse ';
    }

    description += `${age} ${role}, ${expression}, ${activity}`;

    return description;
  }

  /**
   * Combine template with customization
   */
  customizeTemplate(category, templateName, customizations = {}) {
    const template = this.getSceneTemplate(category, templateName);

    if (!template) {
      return null;
    }

    let prompt = template.prompt;

    // Apply customizations
    if (customizations.addCharacters) {
      const charDesc = this.buildCharacterDescription(customizations.addCharacters);
      prompt += `, featuring ${charDesc}`;
    }

    if (customizations.addElements) {
      prompt += `, including ${customizations.addElements.join(', ')}`;
    }

    if (customizations.colorEmphasis) {
      prompt += `, emphasizing ${customizations.colorEmphasis} colors`;
    }

    if (customizations.style) {
      prompt += `, in ${customizations.style} style`;
    }

    return {
      ...template,
      prompt,
      customizations
    };
  }

  /**
   * Get all scene categories
   */
  getCategories() {
    return Object.keys(this.sceneTemplates).map(key => ({
      key,
      name: this.sceneTemplates[key].name,
      description: this.sceneTemplates[key].description,
      templateCount: Object.keys(this.sceneTemplates[key].templates).length
    }));
  }

  /**
   * Search templates
   */
  searchTemplates(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [category, categoryData] of Object.entries(this.sceneTemplates)) {
      for (const [templateKey, template] of Object.entries(categoryData.templates)) {
        const searchText = `${template.name} ${template.prompt} ${template.mood} ${template.elements.join(' ')}`.toLowerCase();

        if (searchText.includes(lowerQuery)) {
          results.push({
            category,
            templateKey,
            ...template,
            categoryName: categoryData.name
          });
        }
      }
    }

    return results;
  }
}

module.exports = IllustrationLibrary;
