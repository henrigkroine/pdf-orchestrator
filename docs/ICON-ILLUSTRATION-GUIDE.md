# Icon & Illustration Generation Guide

Complete guide to generating TEEI brand icons and illustrations using AI.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Icon Generation](#icon-generation)
3. [Illustration Generation](#illustration-generation)
4. [Template Library](#template-library)
5. [Style Consistency](#style-consistency)
6. [SVG Optimization](#svg-optimization)
7. [Best Practices](#best-practices)
8. [Advanced Usage](#advanced-usage)

---

## Quick Start

### Prerequisites

```bash
# Ensure you have required API keys
export OPENAI_API_KEY="your-openai-api-key"
export ANTHROPIC_API_KEY="your-anthropic-api-key"

# Install dependencies (already done)
npm install
```

### Generate Your First Icon

```bash
# Single icon
npm run generate:icons -- icon --concept "cloud computing" --style flat

# Icon set
npm run generate:icons -- icon-set \
  --theme "AWS Partnership" \
  --concepts "cloud" "collaboration" "security" "analytics" --style flat
```

### Generate Your First Illustration

```bash
# Custom illustration
npm run generate:illustrations -- illustration \
  --scene "students learning with technology" \
  --mood "inspiring and hopeful"

# From template
npm run generate:illustrations -- template \
  --category hero \
  --template educationTransformation
```

---

## Icon Generation

### Icon Styles

TEEI supports 8 icon styles:

#### **1. Flat Design** (Recommended)
- **Best for:** UI elements, app icons, infographics
- **Characteristics:** Clean, minimal, 2D, solid colors
- **TEEI usage:** Primary icon style for digital materials

```bash
npm run generate:icons -- icon \
  --concept "education" \
  --style flat
```

#### **2. Line Art** (Recommended)
- **Best for:** Technical diagrams, print materials
- **Characteristics:** Outlined shapes, uniform line weight
- **TEEI usage:** Documentation, wireframes

```bash
npm run generate:icons -- icon \
  --concept "network" \
  --style line
```

#### **3. Duotone** (Recommended)
- **Best for:** Modern graphics, social media
- **Characteristics:** Two-color design with depth
- **TEEI usage:** Hero graphics, feature highlights

```bash
npm run generate:icons -- icon \
  --concept "partnership" \
  --style duotone
```

#### **4. Hand-Drawn** (Recommended)
- **Best for:** Education materials, friendly branding
- **Characteristics:** Organic, warm, approachable
- **TEEI usage:** Student-facing materials

```bash
npm run generate:icons -- icon \
  --concept "learning" \
  --style handDrawn
```

### Generating Icon Sets

For cohesive visual language, generate icon sets with unified style:

```bash
npm run generate:icons -- icon-set \
  --theme "Digital Learning Platform" \
  --concepts "dashboard" "courses" "progress" "community" "resources" \
  --style flat
```

**Features:**
- Unified style guide generated automatically
- AI ensures consistency across all icons
- Color palette aligned with TEEI brand
- SVG optimization included
- Style consistency validation

### Style Consistency Checking

After generating icon sets, check consistency:

```bash
# Automatic consistency check (included by default)
npm run generate:icons -- icon-set \
  --theme "My Icons" \
  --concepts "icon1" "icon2" "icon3" \
  --check-consistency
```

**Consistency Metrics:**
- Color consistency (70%+ match with TEEI palette)
- Size consistency (uniform dimensions)
- Visual weight balance
- Aspect ratio consistency (1:1 preferred)

**Grading:**
- A+ (9-10): Excellent consistency
- A (8-9): Very good
- B (7-8): Good, minor improvements needed
- C (6-7): Acceptable, some issues
- D/F (<6): Significant inconsistencies

---

## Illustration Generation

### Custom Illustrations

Generate publication-quality illustrations:

```bash
npm run generate:illustrations -- illustration \
  --scene "diverse students collaborating with AI tools" \
  --mood "hopeful and empowering" \
  --size "1792x1024"
```

**Options:**
- `--scene`: Description of what to illustrate
- `--mood`: Emotional tone (inspiring, hopeful, professional, etc.)
- `--size`: Dimensions (1792x1024 landscape, 1024x1792 portrait, 1024x1024 square)
- `--alternatives <count>`: Generate alternative versions (default: 2)

### AI-Generated Placement Suggestions

After generation, receive intelligent placement suggestions:

```
Placement Suggestions:
  Page: Overview
  Position: Hero
  Size: Full-bleed
  Text Overlay: Use negative space on left for text
  Alternatives: Supporting image, Background with 60% opacity
```

### Alternative Versions

Automatically generate variations:

```bash
# Generate 3 alternatives
npm run generate:illustrations -- illustration \
  --scene "online learning" \
  --mood "engaging" \
  --alternatives 3
```

**Variation Types:**
- Different composition
- Alternative color palette
- Different perspective
- Simplified style

---

## Template Library

### Available Categories

1. **Hero** - Large, impactful cover scenes
2. **People** - Human-focused stories
3. **Technology** - Educational tech
4. **Education** - Core learning activities
5. **Impact** - Results and transformations
6. **Abstract** - Conceptual representations

### Using Templates

#### List All Templates

```bash
# See all categories
npm run generate:illustrations -- list-templates

# See templates in a category
npm run generate:illustrations -- list-templates --category hero

# Search templates
npm run generate:illustrations -- list-templates --search "collaboration"
```

#### Generate from Template

```bash
npm run generate:illustrations -- template \
  --category hero \
  --template globalConnection
```

### Hero Templates

**educationTransformation**
- Diverse students in modern learning environment
- Mood: Inspiring, hopeful, empowering
- Best for: Cover pages, main headers

**globalConnection**
- Students connected through technology worldwide
- Mood: Connected, inclusive, hopeful
- Best for: Partnership materials, global programs

**brightFuture**
- Students looking toward horizon
- Mood: Hopeful, optimistic, inspiring
- Best for: Vision statements, future-focused content

**innovationHub**
- Modern collaborative learning space
- Mood: Innovative, collaborative, professional
- Best for: Technology programs, innovation initiatives

**inclusiveClassroom**
- Diverse students learning together
- Mood: Inclusive, welcoming, empowering
- Best for: Equity programs, diversity initiatives

### People Templates

**studentSuccess**
- Individual student celebrating achievement
- Mood: Joyful, authentic, inspiring
- Best for: Success stories, testimonials

**teacherMentor**
- Educator guiding student
- Mood: Supportive, respectful, nurturing
- Best for: Mentorship programs, teacher materials

**peerCollaboration**
- Students working together on project
- Mood: Collaborative, energetic, inclusive
- Best for: Group projects, teamwork emphasis

### Technology Templates

**cloudLearning**
- Cloud-based learning platform
- Mood: Modern, efficient, accessible
- Best for: AWS partnership, cloud platforms

**aiEducation**
- AI-powered learning tools
- Mood: Innovative, supportive, transparent
- Best for: AI programs, future-focused materials

**digitalAccessibility**
- Accessible technology for all students
- Mood: Inclusive, empowering, accessible
- Best for: Accessibility programs, inclusive design

### Customizing Templates

```bash
npm run generate:illustrations -- template \
  --category education \
  --template activelearning \
  --customize '{
    "addCharacters": {
      "age": "teen (15-18)",
      "role": "students",
      "expression": "curious",
      "diversity": true
    },
    "colorEmphasis": "Nordshore and Gold",
    "style": "warm natural lighting"
  }'
```

---

## Style Consistency

### Automatic Consistency Checking

The system automatically checks:

1. **Color Consistency**
   - Alignment with TEEI palette
   - Color usage patterns
   - Brand compliance

2. **Size Consistency**
   - Uniform dimensions
   - Aspect ratio matching
   - Scalability

3. **Visual Weight**
   - Balanced presence
   - Consistent density
   - Harmonious composition

4. **Aspect Ratio**
   - Square (1:1) preferred for icons
   - Landscape for illustrations
   - Consistent proportions

### Consistency Report Example

```json
{
  "summary": {
    "totalIcons": 5,
    "overallScore": "8.5",
    "grade": "A"
  },
  "scores": {
    "colorConsistency": {
      "score": "8.2",
      "matchRate": "85%",
      "message": "Excellent color consistency"
    },
    "sizeConsistency": {
      "score": "9.0",
      "averageSize": "256x256",
      "variance": "±5px"
    }
  },
  "recommendations": [
    {
      "priority": "low",
      "category": "color",
      "action": "Consider normalizing edge colors to exact TEEI values"
    }
  ]
}
```

---

## SVG Optimization

### Automatic Optimization

SVG icons are automatically optimized:

```bash
# Optimization happens automatically
npm run generate:icons -- icon --concept "cloud" --optimize
```

### Manual SVG Optimization

```bash
# Single file
npm run generate:icons -- optimize-svg ./path/to/icon.svg --output ./optimized.svg

# Batch directory
npm run generate:icons -- optimize-svg ./icons --batch --output ./optimized
```

### Optimization Features

- Path simplification
- Unused element removal
- Color normalization to TEEI palette
- File size reduction (typically 30-60%)
- Accessibility attribute addition
- SVGO-powered optimization

### Results

```
Original size: 24.5 KB
Optimized size: 9.8 KB (60% reduction)
```

---

## Best Practices

### Icon Design

**DO:**
- Use flat or line styles for consistency
- Keep concepts simple and recognizable
- Generate icon sets with unified themes
- Validate consistency after generation
- Use TEEI brand colors
- Optimize SVGs before use

**DON'T:**
- Mix styles within a set
- Use overly complex concepts
- Skip consistency checking
- Use non-TEEI colors
- Forget accessibility attributes

### Illustration Design

**DO:**
- Use templates for consistency
- Specify clear moods aligned with TEEI values
- Request alternative versions
- Follow placement suggestions
- Include diverse representation
- Use warm, natural lighting

**DON'T:**
- Use generic stock imagery descriptions
- Ignore mood specifications
- Skip alternative generation
- Use cold or artificial lighting
- Forget inclusive representation

### Color Usage

**TEEI Brand Colors:**
- **Nordshore** #00393F - Primary (80% usage)
- **Sky** #C9E4EC - Secondary highlights
- **Sand** #FFF1E2 - Warm backgrounds
- **Beige** #EFE1DC - Soft backgrounds
- **Moss** #65873B - Natural accent
- **Gold** #BA8F5A - Premium accent
- **Clay** #913B2F - Rich accent

**Never use:**
- Copper/orange (not TEEI colors)
- Pure black/white (use Nordshore/Sand)
- Neon or saturated colors

---

## Advanced Usage

### Programmatic Generation

```javascript
const IconIllustrationGenerator = require('./scripts/lib/icon-illustration-generator');
const IllustrationLibrary = require('./scripts/lib/illustration-library');

// Generate icon
const generator = new IconIllustrationGenerator();
const icon = await generator.generateIcon('cloud computing', 'flat');

// Generate icon set
const iconSet = await generator.generateIconSet(
  ['concept1', 'concept2', 'concept3'],
  'My Theme'
);

// Use template
const library = new IllustrationLibrary();
const template = library.getSceneTemplate('hero', 'educationTransformation');
const illustration = await generator.generateIllustration(
  template.prompt,
  template.mood
);
```

### Custom Style Guides

```javascript
const generator = new IconIllustrationGenerator();

// Generate with custom style guide
const iconSet = await generator.generateIconSet(concepts, theme, {
  style: 'flat',
  styleGuide: {
    recommendedStyle: 'flat',
    colors: {
      primary: '#00393F',
      secondary: '#C9E4EC',
      accent: '#BA8F5A'
    },
    principles: [
      'Consistent 2pt stroke width',
      'Rounded corners (4pt radius)',
      'Simple geometric shapes'
    ]
  }
});
```

### Batch Generation

```javascript
// Generate multiple icon sets
const themes = [
  { name: 'AWS Services', concepts: ['ec2', 's3', 'lambda', 'dynamodb'] },
  { name: 'Learning Tools', concepts: ['quiz', 'video', 'discussion', 'assignment'] }
];

for (const theme of themes) {
  const iconSet = await generator.generateIconSet(
    theme.concepts,
    theme.name,
    { style: 'flat' }
  );

  console.log(`Generated ${iconSet.icons.length} icons for ${theme.name}`);
}
```

---

## Troubleshooting

### Common Issues

**Issue: Icons look inconsistent**
- Solution: Use `icon-set` command instead of individual icons
- Enable `--check-consistency` flag
- Review and apply consistency recommendations

**Issue: Colors don't match TEEI palette**
- Solution: SVG optimization normalizes colors
- Use `optimize-svg` command with `--normalize-colors`

**Issue: Generation fails**
- Check API keys are set correctly
- Verify internet connection
- Check rate limits (5-second delay between requests)
- Review error messages for specific issues

**Issue: SVG files too large**
- Run `optimize-svg` command
- Check precision settings in config
- Remove unnecessary elements

---

## Statistics & Monitoring

### View Generation Stats

```bash
npm run generate:icons -- stats

# Output:
# Icons: 24 (18 SVG)
# Illustrations: 12
# Output Directory: assets/generated
```

### File Organization

```
assets/generated/
├── icons/
│   ├── cloud-computing-flat.png
│   ├── cloud-computing-flat-metadata.json
│   └── aws-partnership-set.json
├── illustrations/
│   ├── students-learning-inspiring.png
│   ├── students-learning-inspiring-metadata.json
│   └── students-learning-inspiring-alt1.png
└── svg/
    ├── cloud-computing-flat.svg
    └── cloud-computing-flat-optimized.svg
```

---

## Examples

### Example 1: AWS Partnership Icon Set

```bash
npm run generate:icons -- icon-set \
  --theme "AWS Partnership" \
  --concepts "cloud storage" "compute power" "machine learning" "security" "analytics" \
  --style flat \
  --check-consistency
```

**Result:** 5 cohesive icons with TEEI branding, optimized SVGs, consistency score 8.7/10 (A)

### Example 2: Student Success Story

```bash
npm run generate:illustrations -- template \
  --category people \
  --template studentSuccess \
  --customize '{
    "addCharacters": {
      "age": "adolescent (11-14)",
      "expression": "proud"
    },
    "colorEmphasis": "Gold and Sky"
  }'
```

**Result:** Inspiring illustration of student celebrating achievement, warm TEEI colors, 2 alternatives

### Example 3: Hero Section Illustration

```bash
npm run generate:illustrations -- illustration \
  --scene "diverse group of students using AI-powered learning tools, collaborating in modern classroom" \
  --mood "hopeful, innovative, inclusive" \
  --size "1792x1024" \
  --alternatives 2
```

**Result:** Publication-quality hero image + 2 alternatives, placement suggestions included

---

## Configuration

Edit `config/icon-illustration-config.json` to customize:

```json
{
  "generator": {
    "outputDir": "assets/generated",
    "quality": "hd",
    "autoOptimizeSVG": true
  },
  "svgOptimization": {
    "precision": 2,
    "removeComments": true,
    "convertColors": true
  },
  "styleConsistency": {
    "minimumScore": 7.0
  }
}
```

---

## Resources

- **TEEI Brand Guidelines:** `reports/TEEI_AWS_Design_Fix_Report.md`
- **Configuration:** `config/icon-illustration-config.json`
- **Library Reference:** `scripts/lib/illustration-library.js`
- **Main CLAUDE.md:** See "Icon & Illustration Generation" section

---

**Need Help?**

Check the main CLAUDE.md file or review the library source code for additional details and examples.
