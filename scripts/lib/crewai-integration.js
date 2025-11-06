/**
 * CREWAI INTEGRATION - Role-Based Agent Teams (JavaScript Implementation)
 *
 * Inspired by CrewAI's Python framework, this module provides structured
 * team collaboration with role-based agents, task delegation, and
 * hierarchical or sequential process management.
 *
 * Key Concepts (adapted from CrewAI):
 * - Crew: A team of agents working toward a common goal
 * - Agent: Individual AI with specific role and expertise
 * - Task: Specific work item with description, expected output, and assigned agent
 * - Process: How tasks are executed (sequential, parallel, hierarchical)
 *
 * Process Types:
 * - Sequential: Tasks executed one after another
 * - Parallel: Tasks executed simultaneously
 * - Hierarchical: Manager agent delegates to worker agents
 *
 * @module crewai-integration
 * @version 1.0.0
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Task - Represents a unit of work for an agent
 */
class Task {
  /**
   * Create a task
   * @param {Object} config - Task configuration
   * @param {string} config.description - Task description
   * @param {string} config.expectedOutput - What output is expected
   * @param {string} config.agent - Agent assigned to this task (role name)
   * @param {Array} config.dependencies - Task IDs this depends on
   */
  constructor(config) {
    this.id = config.id || `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.description = config.description;
    this.expectedOutput = config.expectedOutput;
    this.agent = config.agent;
    this.dependencies = config.dependencies || [];
    this.status = 'pending'; // pending, in_progress, completed, failed
    this.result = null;
    this.startTime = null;
    this.endTime = null;
  }

  /**
   * Mark task as started
   */
  start() {
    this.status = 'in_progress';
    this.startTime = new Date().toISOString();
  }

  /**
   * Mark task as completed
   */
  complete(result) {
    this.status = 'completed';
    this.result = result;
    this.endTime = new Date().toISOString();
  }

  /**
   * Mark task as failed
   */
  fail(error) {
    this.status = 'failed';
    this.result = { error: error.message };
    this.endTime = new Date().toISOString();
  }
}

/**
 * Crew Agent (enhanced version of multi-agent Agent)
 */
class CrewAgent {
  /**
   * Create a crew agent
   * @param {Object} config - Agent configuration
   */
  constructor(config) {
    this.role = config.role;
    this.goal = config.goal;
    this.backstory = config.backstory;
    this.model = config.model || 'gpt-4o';
    this.tools = config.tools || [];
    this.maxIterations = config.maxIterations || 5;
    this.allowDelegation = config.allowDelegation !== false;
    this.verbose = config.verbose || false;

    this.initializeModel();
  }

  /**
   * Initialize AI model
   */
  initializeModel() {
    if (this.model.startsWith('gpt') || this.model.includes('o3')) {
      this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.provider = 'openai';
    } else if (this.model.startsWith('claude')) {
      this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      this.provider = 'anthropic';
    } else if (this.model.startsWith('gemini')) {
      this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.provider = 'google';
    }
  }

  /**
   * Execute a task
   * @param {Task} task - Task to execute
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Task result
   */
  async executeTask(task, context) {
    if (this.verbose) {
      console.log(`  🤖 ${this.role} starting task: ${task.description.substring(0, 50)}...`);
    }

    try {
      const prompt = this.buildTaskPrompt(task, context);

      let result;
      if (this.provider === 'openai') {
        result = await this.executeWithOpenAI(prompt, context);
      } else if (this.provider === 'anthropic') {
        result = await this.executeWithClaude(prompt, context);
      } else if (this.provider === 'google') {
        result = await this.executeWithGemini(prompt, context);
      }

      if (this.verbose) {
        console.log(`  ✅ ${this.role} completed task`);
      }

      return result;

    } catch (error) {
      if (this.verbose) {
        console.error(`  ❌ ${this.role} failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Build task-specific prompt
   */
  buildTaskPrompt(task, context) {
    let prompt = `You are a ${this.role}.

YOUR GOAL: ${this.goal}

YOUR BACKSTORY: ${this.backstory}

TASK: ${task.description}

EXPECTED OUTPUT: ${task.expectedOutput}
`;

    if (context.previousResults && context.previousResults.length > 0) {
      prompt += `\n\nPREVIOUS TASK RESULTS:\n`;
      for (const prev of context.previousResults) {
        prompt += `\n**Task**: ${prev.task.description}\n`;
        prompt += `**Result**: ${JSON.stringify(prev.result, null, 2)}\n`;
      }
    }

    if (context.imageData) {
      prompt += `\n\nYou have access to the document image for analysis.\n`;
    }

    prompt += `\n\nProvide your result in the expected format. Be thorough and professional.`;

    return prompt;
  }

  /**
   * Execute with OpenAI
   */
  async executeWithOpenAI(prompt, context) {
    const messages = [
      {
        role: 'system',
        content: `You are a ${this.role}. ${this.backstory}`
      }
    ];

    if (context.imageData) {
      const base64Data = Buffer.isBuffer(context.imageData)
        ? context.imageData.toString('base64')
        : context.imageData;

      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: `data:${context.mimeType || 'image/png'};base64,${base64Data}`,
              detail: 'high'
            }
          },
          {
            type: 'text',
            text: prompt
          }
        ]
      });
    } else {
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages,
      temperature: 0.3,
      max_tokens: 2048
    });

    return {
      output: response.choices[0].message.content,
      model: this.model,
      tokens: response.usage.total_tokens
    };
  }

  /**
   * Execute with Claude
   */
  async executeWithClaude(prompt, context) {
    const content = [];

    if (context.imageData) {
      const base64Data = Buffer.isBuffer(context.imageData)
        ? context.imageData.toString('base64')
        : context.imageData;

      content.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: context.mimeType || 'image/png',
          data: base64Data
        }
      });
    }

    content.push({
      type: 'text',
      text: prompt
    });

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{ role: 'user', content }]
    });

    const textBlock = response.content.find(block => block.type === 'text');

    return {
      output: textBlock.text,
      model: this.model,
      tokens: response.usage.input_tokens + response.usage.output_tokens
    };
  }

  /**
   * Execute with Gemini
   */
  async executeWithGemini(prompt, context) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: { temperature: 0.3 }
    });

    const parts = [{ text: prompt }];

    if (context.imageData) {
      const base64Data = Buffer.isBuffer(context.imageData)
        ? context.imageData.toString('base64')
        : context.imageData;

      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: context.mimeType || 'image/png'
        }
      });
    }

    const result = await model.generateContent(parts);
    const response = result.response;

    return {
      output: response.text(),
      model: this.model,
      tokens: response.usageMetadata?.totalTokenCount || 0
    };
  }
}

/**
 * Crew - A team of agents working together
 */
export class Crew {
  /**
   * Create a crew
   * @param {Object} config - Crew configuration
   * @param {Array<CrewAgent>} config.agents - Team members
   * @param {Array<Task>} config.tasks - Tasks to complete
   * @param {string} config.process - Process type ('sequential', 'parallel', 'hierarchical')
   * @param {boolean} config.verbose - Enable verbose logging
   */
  constructor(config) {
    this.agents = config.agents || [];
    this.tasks = config.tasks || [];
    this.process = config.process || 'sequential';
    this.verbose = config.verbose !== false;
    this.manager = config.manager || null; // For hierarchical process

    this.completedTasks = [];
    this.failedTasks = [];
  }

  /**
   * Execute the crew's tasks
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Crew results
   */
  async kickoff(context = {}) {
    console.log(`\n🚀 Crew Starting: ${this.process} process with ${this.agents.length} agents\n`);

    const startTime = Date.now();

    try {
      let results;

      if (this.process === 'sequential') {
        results = await this.executeSequential(context);
      } else if (this.process === 'parallel') {
        results = await this.executeParallel(context);
      } else if (this.process === 'hierarchical') {
        results = await this.executeHierarchical(context);
      } else {
        throw new Error(`Unknown process type: ${this.process}`);
      }

      const duration = Date.now() - startTime;

      console.log(`\n✅ Crew Completed in ${(duration / 1000).toFixed(2)}s\n`);

      return {
        success: true,
        process: this.process,
        results,
        completedTasks: this.completedTasks.length,
        failedTasks: this.failedTasks.length,
        duration,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error(`\n❌ Crew Failed: ${error.message}\n`);

      return {
        success: false,
        error: error.message,
        completedTasks: this.completedTasks.length,
        failedTasks: this.failedTasks.length,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Execute tasks sequentially
   */
  async executeSequential(context) {
    const results = [];

    for (const task of this.tasks) {
      if (this.verbose) {
        console.log(`\n📋 Task ${this.tasks.indexOf(task) + 1}/${this.tasks.length}: ${task.description.substring(0, 60)}...`);
      }

      // Check if dependencies are satisfied
      if (task.dependencies.length > 0) {
        const dependenciesMet = task.dependencies.every(depId =>
          this.completedTasks.some(t => t.id === depId)
        );

        if (!dependenciesMet) {
          task.fail(new Error('Dependencies not met'));
          this.failedTasks.push(task);
          continue;
        }
      }

      // Find agent for this task
      const agent = this.agents.find(a => a.role === task.agent);
      if (!agent) {
        task.fail(new Error(`No agent found for role: ${task.agent}`));
        this.failedTasks.push(task);
        continue;
      }

      try {
        task.start();

        // Add previous results to context
        const taskContext = {
          ...context,
          previousResults: results
        };

        const result = await agent.executeTask(task, taskContext);
        task.complete(result);

        this.completedTasks.push(task);
        results.push({
          task,
          result,
          agent: agent.role
        });

      } catch (error) {
        task.fail(error);
        this.failedTasks.push(task);

        // In sequential mode, failure stops the process
        throw new Error(`Task failed: ${task.description} - ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Execute tasks in parallel
   */
  async executeParallel(context) {
    console.log(`  ⚡ Running ${this.tasks.length} tasks in parallel...\n`);

    const taskPromises = this.tasks.map(async (task) => {
      const agent = this.agents.find(a => a.role === task.agent);
      if (!agent) {
        task.fail(new Error(`No agent found for role: ${task.agent}`));
        this.failedTasks.push(task);
        return { task, error: 'No agent found' };
      }

      try {
        task.start();
        const result = await agent.executeTask(task, context);
        task.complete(result);
        this.completedTasks.push(task);

        return {
          task,
          result,
          agent: agent.role
        };

      } catch (error) {
        task.fail(error);
        this.failedTasks.push(task);
        return {
          task,
          error: error.message
        };
      }
    });

    const results = await Promise.all(taskPromises);
    return results.filter(r => !r.error);
  }

  /**
   * Execute with hierarchical process (manager delegates)
   */
  async executeHierarchical(context) {
    if (!this.manager) {
      throw new Error('Hierarchical process requires a manager agent');
    }

    console.log(`  👔 Manager ${this.manager.role} delegating tasks...\n`);

    // Manager decides task allocation
    const delegationTask = new Task({
      description: `Review the following tasks and decide how to delegate them to team members: ${this.tasks.map(t => t.description).join('; ')}`,
      expectedOutput: 'JSON with task assignments',
      agent: this.manager.role
    });

    const delegation = await this.manager.executeTask(delegationTask, context);

    // Parse delegation decisions and execute
    // For simplicity, fall back to sequential execution
    return await this.executeSequential(context);
  }

  /**
   * Get agent by role
   */
  getAgent(role) {
    return this.agents.find(a => a.role === role);
  }

  /**
   * Add task to crew
   */
  addTask(task) {
    this.tasks.push(task);
  }

  /**
   * Add agent to crew
   */
  addAgent(agent) {
    this.agents.push(agent);
  }
}

/**
 * Create a validation crew for PDF documents
 * @param {Object} config - Crew configuration
 * @returns {Crew} Configured crew
 */
export function createValidationCrew(config = {}) {
  // Create specialized agents
  const agents = [
    new CrewAgent({
      role: 'Brand Compliance Specialist',
      goal: 'Ensure perfect adherence to TEEI brand guidelines',
      backstory: 'Expert in TEEI brand standards with 15 years experience in brand management. Knows every detail of the color palette, typography, and logo guidelines.',
      model: 'gpt-4o',
      verbose: config.verbose
    }),

    new CrewAgent({
      role: 'Design Quality Analyst',
      goal: 'Assess visual design quality and professional appearance',
      backstory: 'Award-winning designer with expertise in layout, hierarchy, and visual balance. Published author on design principles.',
      model: 'claude-sonnet-4-20250514',
      verbose: config.verbose
    }),

    new CrewAgent({
      role: 'Accessibility Auditor',
      goal: 'Validate WCAG 2.2 AA compliance',
      backstory: 'Certified accessibility specialist with deep knowledge of inclusive design and WCAG standards.',
      model: 'gemini-2.5-flash',
      verbose: config.verbose
    }),

    new CrewAgent({
      role: 'Content Quality Reviewer',
      goal: 'Verify text quality, completeness, and brand voice',
      backstory: 'Professional editor with 12 years in educational publishing. Expert in grammar, tone, and clarity.',
      model: 'claude-sonnet-4-20250514',
      verbose: config.verbose
    }),

    new CrewAgent({
      role: 'QA Synthesizer',
      goal: 'Synthesize all findings into final quality assessment',
      backstory: 'Senior QA manager with expertise in multi-stakeholder decision-making and quality standards.',
      model: 'gpt-4o',
      verbose: config.verbose
    })
  ];

  // Create tasks
  const tasks = [
    new Task({
      id: 'brand-check',
      description: 'Analyze document for TEEI brand compliance: colors, typography, logos, spacing',
      expectedOutput: 'JSON with brand compliance issues and score',
      agent: 'Brand Compliance Specialist'
    }),

    new Task({
      id: 'design-check',
      description: 'Evaluate design quality: layout, hierarchy, whitespace, visual balance',
      expectedOutput: 'JSON with design quality issues and score',
      agent: 'Design Quality Analyst'
    }),

    new Task({
      id: 'accessibility-check',
      description: 'Audit accessibility: color contrast, readability, WCAG 2.2 compliance',
      expectedOutput: 'JSON with accessibility issues and score',
      agent: 'Accessibility Auditor'
    }),

    new Task({
      id: 'content-check',
      description: 'Review content quality: grammar, completeness, tone, brand voice alignment',
      expectedOutput: 'JSON with content issues and score',
      agent: 'Content Quality Reviewer'
    }),

    new Task({
      id: 'synthesis',
      description: 'Synthesize all findings into final quality report with prioritized recommendations',
      expectedOutput: 'JSON with final assessment, grade, and action items',
      agent: 'QA Synthesizer',
      dependencies: ['brand-check', 'design-check', 'accessibility-check', 'content-check']
    })
  ];

  return new Crew({
    agents,
    tasks,
    process: config.process || 'parallel', // Parallel for speed
    verbose: config.verbose !== false
  });
}

/**
 * Factory functions
 */
export function createTask(config) {
  return new Task(config);
}

export function createAgent(config) {
  return new CrewAgent(config);
}

export { CrewAgent, Task };
export default Crew;
