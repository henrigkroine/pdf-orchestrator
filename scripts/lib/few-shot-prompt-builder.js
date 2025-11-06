/**
 * Few-Shot Prompt Builder
 * Builds AI prompts with training examples for improved accuracy
 * Research: Adding examples improves task performance by 10-15%
 */

const fs = require('fs').promises;
const path = require('path');

class FewShotPromptBuilder {
  constructor(trainingExamplesDir) {
    this.trainingDir = trainingExamplesDir;
    this.examples = {
      good: [],
      bad: []
    };
    this.loaded = false;
  }

  /**
   * Load all training examples from directory
   */
  async loadExamples() {
    console.log('📚 Loading training examples...');

    try {
      // Load good examples
      const goodAnnotationsDir = path.join(this.trainingDir, 'good-examples', 'annotations');
      const goodFiles = await this._loadAnnotationsFromDir(goodAnnotationsDir, 'good');
      this.examples.good = goodFiles;

      // Load bad examples
      const badAnnotationsDir = path.join(this.trainingDir, 'bad-examples', 'annotations');
      const badFiles = await this._loadAnnotationsFromDir(badAnnotationsDir, 'bad');
      this.examples.bad = badFiles;

      this.loaded = true;

      console.log(`✅ Loaded ${this.examples.good.length} good examples, ${this.examples.bad.length} bad examples`);

      return {
        good: this.examples.good.length,
        bad: this.examples.bad.length,
        total: this.examples.good.length + this.examples.bad.length
      };
    } catch (error) {
      console.error('❌ Failed to load training examples:', error.message);
      throw error;
    }
  }

  /**
   * Load annotation files from directory
   */
  async _loadAnnotationsFromDir(dir, category) {
    try {
      const files = await fs.readdir(dir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      const examples = [];

      for (const file of jsonFiles) {
        const filePath = path.join(dir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const annotation = JSON.parse(content);

        // Get corresponding image path
        const documentId = annotation.documentId;
        const imagePath = path.join(
          this.trainingDir,
          `${category}-examples`,
          `${documentId}.png`
        );

        examples.push({
          id: documentId,
          category,
          annotation,
          imagePath,
          annotationPath: filePath
        });
      }

      return examples;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.warn(`⚠️  Directory not found: ${dir} (no ${category} examples yet)`);
        return [];
      }
      throw error;
    }
  }

  /**
   * Build prompt with few-shot examples
   */
  async buildPrompt(taskDescription, options = {}) {
    const {
      goodExampleCount = 2,
      badExampleCount = 2,
      includeImages = false,
      includeFullAnnotations = true
    } = options;

    if (!this.loaded) {
      await this.loadExamples();
    }

    let prompt = '';

    // Base task description
    prompt += taskDescription + '\n\n';

    // Add system context
    prompt += this._buildSystemContext() + '\n\n';

    // Add good examples
    if (this.examples.good.length > 0 && goodExampleCount > 0) {
      prompt += this._buildGoodExamplesSection(goodExampleCount, includeFullAnnotations) + '\n\n';
    }

    // Add bad examples
    if (this.examples.bad.length > 0 && badExampleCount > 0) {
      prompt += this._buildBadExamplesSection(badExampleCount, includeFullAnnotations) + '\n\n';
    }

    // Add final instructions
    prompt += this._buildFinalInstructions();

    return prompt;
  }

  /**
   * Build system context section
   */
  _buildSystemContext() {
    return `
## System Context

You are an expert TEEI brand compliance analyst. Your task is to evaluate PDF documents against strict brand guidelines and provide detailed, structured analysis.

**TEEI Brand Standards:**
- **Colors**: Nordshore #00393F (primary), Sky #C9E4EC, Sand #FFF1E2, Gold #BA8F5A
- **Forbidden Colors**: Copper/orange tones (not in brand palette)
- **Typography**: Lora (headlines), Roboto Flex (body text)
- **Forbidden Fonts**: Arial, Helvetica, Times New Roman
- **Layout**: 12-column grid, 40pt margins, 60pt section breaks
- **Photography**: Warm, natural lighting, authentic moments (not stock)
- **Logo Clearspace**: Minimum clearspace = logo icon height

**Grading Scale:**
- A+ (9.5-10): Perfect brand compliance, world-class quality
- A (9.0-9.4): Excellent, minor improvements possible
- B+ (8.5-8.9): Very good, some improvements needed
- B (8.0-8.4): Good, several improvements needed
- C (7.0-7.9): Acceptable, significant improvements needed
- D (6.0-6.9): Poor, major violations present
- F (<6.0): Failing, critical violations throughout
`.trim();
  }

  /**
   * Build good examples section
   */
  _buildGoodExamplesSection(count, includeFullAnnotations) {
    const examples = this.examples.good.slice(0, count);

    let section = '## Examples of EXCELLENT Brand Compliance (Learn from these)\n\n';

    examples.forEach((example, index) => {
      const annotation = example.annotation;

      section += `### Good Example ${index + 1}: ${annotation.documentName}\n`;
      section += `**Grade**: ${annotation.grade} (Score: ${annotation.overallScore}/10)\n`;
      section += `**Why this is excellent**:\n`;

      // Add strengths
      if (annotation.strengths && annotation.strengths.length > 0) {
        annotation.strengths.forEach(strength => {
          section += `- ✅ ${strength}\n`;
        });
      }

      // Add key learnings
      if (annotation.keyLearnings && annotation.keyLearnings.length > 0) {
        section += `\n**Key Learnings**:\n`;
        annotation.keyLearnings.forEach(learning => {
          section += `- 📚 ${learning}\n`;
        });
      }

      // Add full annotation if requested
      if (includeFullAnnotations) {
        section += `\n**Full Analysis**:\n\`\`\`json\n${JSON.stringify(annotation, null, 2)}\n\`\`\`\n`;
      }

      section += '\n';
    });

    return section;
  }

  /**
   * Build bad examples section
   */
  _buildBadExamplesSection(count, includeFullAnnotations) {
    const examples = this.examples.bad.slice(0, count);

    let section = '## Examples of POOR Brand Compliance (Avoid these mistakes)\n\n';

    examples.forEach((example, index) => {
      const annotation = example.annotation;

      section += `### Bad Example ${index + 1}: ${annotation.documentName}\n`;
      section += `**Grade**: ${annotation.grade} (Score: ${annotation.overallScore}/10)\n`;
      section += `**Critical Violations**:\n`;

      // Add violations
      if (annotation.violations && annotation.violations.length > 0) {
        // Group by severity
        const critical = annotation.violations.filter(v => v.severity === 'critical');
        const major = annotation.violations.filter(v => v.severity === 'major');
        const minor = annotation.violations.filter(v => v.severity === 'minor');

        if (critical.length > 0) {
          section += `\n**CRITICAL** (${critical.length}):\n`;
          critical.forEach(v => {
            section += `- 🚨 ${v.description} (${v.location})\n`;
            section += `  Fix: ${v.recommendation}\n`;
          });
        }

        if (major.length > 0) {
          section += `\n**MAJOR** (${major.length}):\n`;
          major.forEach(v => {
            section += `- ⚠️  ${v.description} (${v.location})\n`;
          });
        }

        if (minor.length > 0) {
          section += `\n**MINOR** (${minor.length}):\n`;
          minor.forEach(v => {
            section += `- ℹ️  ${v.description}\n`;
          });
        }
      }

      // Add key learnings
      if (annotation.keyLearnings && annotation.keyLearnings.length > 0) {
        section += `\n**What to Learn**:\n`;
        annotation.keyLearnings.forEach(learning => {
          section += `- 📚 ${learning}\n`;
        });
      }

      // Add full annotation if requested
      if (includeFullAnnotations) {
        section += `\n**Full Analysis**:\n\`\`\`json\n${JSON.stringify(annotation, null, 2)}\n\`\`\`\n`;
      }

      section += '\n';
    });

    return section;
  }

  /**
   * Build final instructions
   */
  _buildFinalInstructions() {
    return `
## Now Analyze This Document

Using the examples above as reference:
1. Evaluate this document against TEEI brand guidelines
2. Assign appropriate scores (0-10) for each category
3. Calculate overall score and letter grade
4. List all violations with severity levels
5. Provide specific, actionable recommendations
6. Return response as structured JSON matching the schema

**Important**:
- Be precise with color detection (distinguish Nordshore from copper/orange)
- Check for text cutoffs carefully (incomplete words are CRITICAL violations)
- Verify typography (Lora vs. Roboto Flex vs. generic fonts)
- Assess photography quality (warm tones, authenticity)
- Consider overall visual hierarchy and professionalism

Return ONLY valid JSON. No explanatory text before or after.
`.trim();
  }

  /**
   * Build prompt for specific validation task
   */
  async buildValidationPrompt(options = {}) {
    const taskDescription = `
# TEEI Brand Compliance Validation Task

You are analyzing a TEEI partnership document for brand compliance. Evaluate the document against official TEEI brand guidelines and return a detailed analysis.
`.trim();

    return this.buildPrompt(taskDescription, {
      goodExampleCount: options.goodExampleCount || 2,
      badExampleCount: options.badExampleCount || 2,
      includeFullAnnotations: options.includeFullAnnotations !== false
    });
  }

  /**
   * Build lightweight prompt (without full annotations)
   */
  async buildLightweightPrompt(options = {}) {
    return this.buildPrompt(
      'Analyze this document for TEEI brand compliance.',
      {
        goodExampleCount: options.goodExampleCount || 1,
        badExampleCount: options.badExampleCount || 1,
        includeFullAnnotations: false
      }
    );
  }

  /**
   * Get example by ID
   */
  getExample(category, documentId) {
    const examples = this.examples[category];
    return examples.find(ex => ex.id === documentId);
  }

  /**
   * Get all examples of specific grade
   */
  getExamplesByGrade(grade) {
    const all = [...this.examples.good, ...this.examples.bad];
    return all.filter(ex => ex.annotation.grade === grade);
  }

  /**
   * Get statistics about loaded examples
   */
  getStats() {
    if (!this.loaded) {
      return { loaded: false };
    }

    const allExamples = [...this.examples.good, ...this.examples.bad];

    // Grade distribution
    const gradeDistribution = allExamples.reduce((acc, ex) => {
      const grade = ex.annotation.grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    // Average scores
    const scores = allExamples.map(ex => ex.annotation.overallScore);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Violation types
    const violationTypes = {};
    allExamples.forEach(ex => {
      if (ex.annotation.violations) {
        ex.annotation.violations.forEach(v => {
          violationTypes[v.type] = (violationTypes[v.type] || 0) + 1;
        });
      }
    });

    return {
      loaded: true,
      totalExamples: allExamples.length,
      goodExamples: this.examples.good.length,
      badExamples: this.examples.bad.length,
      gradeDistribution,
      averageScore: avgScore.toFixed(2),
      violationTypes
    };
  }
}

module.exports = FewShotPromptBuilder;
