/**
 * ENSEMBLE ENGINE - Multi-Model Orchestration Library
 *
 * Provides reusable ensemble learning capabilities for combining multiple AI models.
 * Uses weighted voting, confidence scoring, and disagreement resolution to achieve
 * superior accuracy compared to single-model approaches.
 *
 * Research-backed: Ensemble models are at least as skillful as, if not better than,
 * the best individual model (Nature Scientific Reports, 2025)
 *
 * @module ensemble-engine
 * @version 1.0.0
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import fs from 'fs/promises';

/**
 * Model adapter interface for consistent API across different AI providers
 */
class ModelAdapter {
  /**
   * Analyze an image with the specific model
   * @param {string} prompt - Analysis prompt
   * @param {Buffer|string} imageData - Image as Buffer or base64 string
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<Object>} Analysis result
   */
  async analyze(prompt, imageData, mimeType) {
    throw new Error('analyze() must be implemented by adapter');
  }

  /**
   * Get model name
   * @returns {string} Model identifier
   */
  getModelName() {
    throw new Error('getModelName() must be implemented by adapter');
  }

  /**
   * Get model weight (confidence multiplier)
   * @returns {number} Weight value (0-1)
   */
  getWeight() {
    return 1.0;
  }
}

/**
 * Gemini Vision adapter
 */
class GeminiAdapter extends ModelAdapter {
  constructor(apiKey, modelName = 'gemini-1.5-flash', weight = 0.4) {
    super();
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });
    this.modelName = modelName;
    this.weight = weight;
  }

  async analyze(prompt, imageData, mimeType) {
    try {
      const base64Data = Buffer.isBuffer(imageData)
        ? imageData.toString('base64')
        : imageData;

      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const response = result.response;
      const text = response.text();

      // Parse JSON (Gemini should return JSON due to responseMimeType)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }

  getModelName() {
    return `gemini:${this.modelName}`;
  }

  getWeight() {
    return this.weight;
  }
}

/**
 * Gemini 2.5 Pro adapter - Premium tier with Deep Think mode
 * Released Mid-2025, tops LMArena leaderboard, 1M token context
 */
class Gemini25ProAdapter extends ModelAdapter {
  constructor(apiKey, modelName = 'gemini-2.5-pro', weight = 0.35, useDeepThink = true) {
    super();
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 8192,
        // Deep Think mode for superior reasoning
        ...(useDeepThink && { thinkingMode: 'deep' })
      }
    });
    this.modelName = modelName;
    this.weight = weight;
    this.useDeepThink = useDeepThink;
  }

  /**
   * Analyze single image
   */
  async analyze(prompt, imageData, mimeType) {
    try {
      const base64Data = Buffer.isBuffer(imageData)
        ? imageData.toString('base64')
        : imageData;

      const result = await this.model.generateContent([
        { text: prompt },
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]);

      const response = result.response;
      const text = response.text();

      // Parse JSON (Gemini should return JSON due to responseMimeType)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini 2.5 Pro response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(`Gemini 2.5 Pro analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze multiple pages at once using 1M context window
   * This is a premium feature unique to Gemini 2.5 Pro
   */
  async analyzeFullDocument(prompt, imagePagesData) {
    try {
      const content = [{ text: prompt }];

      // Add all page images (leveraging 1M context!)
      imagePagesData.forEach((imageData, idx) => {
        const base64Data = Buffer.isBuffer(imageData.buffer)
          ? imageData.buffer.toString('base64')
          : imageData.buffer;

        content.push({
          inlineData: {
            data: base64Data,
            mimeType: imageData.mimeType
          }
        });
      });

      const result = await this.model.generateContent(content);
      const response = result.response;
      const text = response.text();

      // Parse JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini 2.5 Pro full document response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(`Gemini 2.5 Pro full document analysis failed: ${error.message}`);
    }
  }

  getModelName() {
    return `gemini:${this.modelName}${this.useDeepThink ? '-deep' : ''}`;
  }

  getWeight() {
    return this.weight;
  }
}

/**
 * Claude Vision adapter (Anthropic) - Supports Claude 4 series with extended thinking
 *
 * Claude 4 Series (2025):
 * - Claude Opus 4.1 (Aug 2025): Best for agentic tasks, complex reasoning, real-world coding
 * - Claude Sonnet 4.5 (Sep 2025): Most capable for coding, agents, computer use. Best-in-class vision.
 * - Claude Haiku 4.5 (Oct 2025): Fast, low-cost, high-volume processing
 *
 * All models: 200K context window, extended thinking mode, superior vision capabilities
 */
class ClaudeAdapter extends ModelAdapter {
  constructor(apiKey, modelName = 'claude-sonnet-4.5', weight = 0.40, options = {}) {
    super();
    this.anthropic = new Anthropic({ apiKey });
    this.modelName = modelName;
    this.weight = weight;
    this.options = {
      enableThinking: options.enableThinking !== false, // Default: enabled
      thinkingType: options.thinkingType || 'enabled', // 'enabled', 'extended', or 'disabled'
      thinkingBudget: options.thinkingBudget || 5000, // Default 5K tokens for standard, 10K for extended
      maxTokens: options.maxTokens || 8192, // Increased for Claude 4
      ...options
    };
  }

  async analyze(prompt, imageData, mimeType) {
    try {
      const base64Data = Buffer.isBuffer(imageData)
        ? imageData.toString('base64')
        : imageData;

      // Determine media type for Claude
      const mediaType = mimeType.includes('png') ? 'image/png' :
                       mimeType.includes('jpeg') || mimeType.includes('jpg') ? 'image/jpeg' :
                       mimeType.includes('webp') ? 'image/webp' :
                       mimeType.includes('gif') ? 'image/gif' : 'image/png';

      // Build request with extended thinking if enabled
      const requestConfig = {
        model: this.modelName,
        max_tokens: this.options.maxTokens,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data
                }
              },
              {
                type: 'text',
                text: prompt + '\n\nProvide your analysis as valid JSON matching the requested structure.'
              }
            ]
          }
        ]
      };

      // Add extended thinking configuration for Claude 4 models
      if (this.options.enableThinking && this.options.thinkingType !== 'disabled') {
        requestConfig.thinking = {
          type: this.options.thinkingType,
          budget_tokens: this.options.thinkingBudget
        };
      }

      const message = await this.anthropic.messages.create(requestConfig);

      // Extract thinking process if available (Claude 4 extended thinking)
      const thinkingContent = message.content.find(c => c.type === 'thinking');
      const textContent = message.content.find(c => c.type === 'text');

      if (!textContent) {
        throw new Error('No text content in Claude response');
      }

      // Extract JSON from response
      const responseText = textContent.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // Include thinking process in metadata if available
      if (thinkingContent) {
        analysis._metadata = {
          ...(analysis._metadata || {}),
          thinking: thinkingContent.thinking,
          thinkingEnabled: true,
          thinkingType: this.options.thinkingType,
          thinkingTokens: thinkingContent.thinking?.length || 0,
          model: this.modelName
        };
      }

      return analysis;

    } catch (error) {
      throw new Error(`Claude analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze multiple pages using Claude 4's 200K context window
   * Superior to single-page analysis for cross-page consistency checking
   */
  async analyzeMultiplePages(prompt, imagePagesData) {
    try {
      const content = [{ type: 'text', text: prompt }];

      // Add all page images (leveraging 200K context)
      imagePagesData.forEach((imageData, idx) => {
        const base64Data = Buffer.isBuffer(imageData.buffer)
          ? imageData.buffer.toString('base64')
          : imageData.buffer;

        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: imageData.mimeType,
            data: base64Data
          }
        });
      });

      const requestConfig = {
        model: this.modelName,
        max_tokens: this.options.maxTokens,
        messages: [{ role: 'user', content }]
      };

      // Add extended thinking for multi-page analysis
      if (this.options.enableThinking && this.options.thinkingType !== 'disabled') {
        requestConfig.thinking = {
          type: this.options.thinkingType,
          budget_tokens: this.options.thinkingBudget
        };
      }

      const message = await this.anthropic.messages.create(requestConfig);

      const thinkingContent = message.content.find(c => c.type === 'thinking');
      const textContent = message.content.find(c => c.type === 'text');

      if (!textContent) {
        throw new Error('No text content in Claude multi-page response');
      }

      const responseText = textContent.text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in Claude multi-page response');
      }

      const analysis = JSON.parse(jsonMatch[0]);

      if (thinkingContent) {
        analysis._metadata = {
          ...(analysis._metadata || {}),
          thinking: thinkingContent.thinking,
          thinkingEnabled: true,
          thinkingType: this.options.thinkingType,
          multiPageAnalysis: true,
          pageCount: imagePagesData.length,
          model: this.modelName
        };
      }

      return analysis;

    } catch (error) {
      throw new Error(`Claude multi-page analysis failed: ${error.message}`);
    }
  }

  getModelName() {
    return `claude:${this.modelName}`;
  }

  getWeight() {
    return this.weight;
  }

  /**
   * Get model capabilities for Claude 4 series
   * @returns {Object} Model capabilities
   */
  getCapabilities() {
    const isOpus = this.modelName.includes('opus');
    const isSonnet = this.modelName.includes('sonnet');
    const isHaiku = this.modelName.includes('haiku');
    const isClaude4 = this.modelName.includes('4.') || this.modelName.includes('4-');

    return {
      model: this.modelName,
      generation: isClaude4 ? 4 : 3.5,
      contextWindow: 200000, // Claude 4 series has 200K context
      extendedThinking: isClaude4,
      agenticCapabilities: isOpus,
      bestForCoding: isSonnet,
      fastProcessing: isHaiku,
      visionQuality: isClaude4 ? 'best-in-class' : 'excellent',
      costTier: isOpus ? 'premium' : isSonnet ? 'balanced' : 'economy'
    };
  }
}

/**
 * GPT-5 Vision adapter (OpenAI) - 2025 Release
 * Natively multimodal with 84.2% MMMU accuracy, superior visual perception
 */
class GPT5Adapter extends ModelAdapter {
  constructor(apiKey, modelName = 'gpt-5', weight = 0.30) {
    super();
    this.openai = new OpenAI({ apiKey });
    this.modelName = modelName;
    this.weight = weight;
  }

  async analyze(prompt, imageData, mimeType) {
    try {
      const base64Data = Buffer.isBuffer(imageData)
        ? imageData.toString('base64')
        : imageData;

      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt + '\n\nProvide your analysis as valid JSON matching the requested structure.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content;

      // GPT-5 should return JSON due to response_format
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in GPT-5 response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(`GPT-5 analysis failed: ${error.message}`);
    }
  }

  getModelName() {
    return `gpt5:${this.modelName}`;
  }

  getWeight() {
    return this.weight;
  }
}

/**
 * GPT-4 Vision adapter (OpenAI) - Legacy support
 */
class GPT4VisionAdapter extends ModelAdapter {
  constructor(apiKey, modelName = 'gpt-4-vision-preview', weight = 0.25) {
    super();
    this.openai = new OpenAI({ apiKey });
    this.modelName = modelName;
    this.weight = weight;
  }

  async analyze(prompt, imageData, mimeType) {
    try {
      const base64Data = Buffer.isBuffer(imageData)
        ? imageData.toString('base64')
        : imageData;

      const response = await this.openai.chat.completions.create({
        model: this.modelName,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt + '\n\nProvide your analysis as valid JSON matching the requested structure.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Data}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 4096,
        response_format: { type: 'json_object' }
      });

      const responseText = response.choices[0].message.content;

      // GPT-4 should return JSON due to response_format
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in GPT-4V response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      throw new Error(`GPT-4V analysis failed: ${error.message}`);
    }
  }

  getModelName() {
    return `gpt4v:${this.modelName}`;
  }

  getWeight() {
    return this.weight;
  }
}

/**
 * Ensemble Engine - Orchestrates multiple AI models for superior predictions
 */
export class EnsembleEngine {
  /**
   * Create ensemble engine
   * @param {Object} config - Configuration object
   * @param {Object} config.models - Model configurations
   * @param {Object} config.thresholds - Confidence thresholds
   * @param {Object} config.ensembleStrategy - Strategy configuration
   */
  constructor(config) {
    this.config = config;
    this.adapters = [];
    this.modelWeights = {};
  }

  /**
   * Initialize model adapters based on configuration
   * @param {Object} apiKeys - API keys for each model
   */
  async initialize(apiKeys) {
    console.log('\n🤖 Initializing Ensemble Engine...');

    // Initialize Gemini
    if (this.config.models.gemini?.enabled && apiKeys.gemini) {
      const adapter = new GeminiAdapter(
        apiKeys.gemini,
        this.config.models.gemini.model,
        this.config.models.gemini.weight
      );
      this.adapters.push(adapter);
      this.modelWeights[adapter.getModelName()] = this.config.models.gemini.weight;
      console.log(`  ✅ Gemini ${this.config.models.gemini.model} initialized (weight: ${this.config.models.gemini.weight})`);
    }

    // Initialize Claude
    if (this.config.models.claude?.enabled && apiKeys.claude) {
      const adapter = new ClaudeAdapter(
        apiKeys.claude,
        this.config.models.claude.model,
        this.config.models.claude.weight
      );
      this.adapters.push(adapter);
      this.modelWeights[adapter.getModelName()] = this.config.models.claude.weight;
      console.log(`  ✅ Claude ${this.config.models.claude.model} initialized (weight: ${this.config.models.claude.weight})`);
    }

    // Initialize Gemini 2.5 Pro (Premium)
    if (this.config.models.gemini25pro?.enabled && apiKeys.gemini) {
      const adapter = new Gemini25ProAdapter(
        apiKeys.gemini,
        this.config.models.gemini25pro.model,
        this.config.models.gemini25pro.weight,
        this.config.models.gemini25pro.useDeepThink
      );
      this.adapters.push(adapter);
      this.modelWeights[adapter.getModelName()] = this.config.models.gemini25pro.weight;
      console.log(`  ✅ Gemini 2.5 Pro ${this.config.models.gemini25pro.model} initialized (weight: ${this.config.models.gemini25pro.weight}, Deep Think: ${this.config.models.gemini25pro.useDeepThink})`);
    }

    // Initialize GPT-5 (2025 Release)
    if (this.config.models.gpt5?.enabled && apiKeys.openai) {
      const adapter = new GPT5Adapter(
        apiKeys.openai,
        this.config.models.gpt5.model,
        this.config.models.gpt5.weight
      );
      this.adapters.push(adapter);
      this.modelWeights[adapter.getModelName()] = this.config.models.gpt5.weight;
      console.log(`  ✅ GPT-5 ${this.config.models.gpt5.model} initialized (weight: ${this.config.models.gpt5.weight})`);
    }

    // Initialize GPT-4V (Legacy)
    if (this.config.models.gpt4v?.enabled && apiKeys.gpt4v) {
      const adapter = new GPT4VisionAdapter(
        apiKeys.gpt4v,
        this.config.models.gpt4v.model,
        this.config.models.gpt4v.weight
      );
      this.adapters.push(adapter);
      this.modelWeights[adapter.getModelName()] = this.config.models.gpt4v.weight;
      console.log(`  ✅ GPT-4V ${this.config.models.gpt4v.model} initialized (weight: ${this.config.models.gpt4v.weight})`);
    }

    if (this.adapters.length === 0) {
      throw new Error('No models enabled. Check configuration and API keys.');
    }

    console.log(`\n📊 Ensemble ready with ${this.adapters.length} models\n`);
  }

  /**
   * Analyze image with all models in parallel
   * @param {string} prompt - Analysis prompt
   * @param {Buffer|string} imageData - Image data
   * @param {string} mimeType - Image MIME type
   * @returns {Promise<Object>} Ensemble result with confidence scores
   */
  async analyze(prompt, imageData, mimeType) {
    console.log(`\n🔍 Running ensemble analysis with ${this.adapters.length} models...`);

    const startTime = Date.now();
    const results = [];
    const errors = [];

    // Analyze with all models in parallel
    const promises = this.adapters.map(async (adapter) => {
      const modelName = adapter.getModelName();
      try {
        console.log(`  🤖 Starting ${modelName}...`);
        const result = await adapter.analyze(prompt, imageData, mimeType);

        return {
          model: modelName,
          weight: adapter.getWeight(),
          result: result,
          success: true,
          error: null
        };
      } catch (error) {
        console.error(`  ❌ ${modelName} failed: ${error.message}`);

        return {
          model: modelName,
          weight: adapter.getWeight(),
          result: null,
          success: false,
          error: error.message
        };
      }
    });

    const modelResults = await Promise.all(promises);

    // Separate successful and failed results
    const successfulResults = modelResults.filter(r => r.success);
    const failedResults = modelResults.filter(r => !r.success);

    if (successfulResults.length === 0) {
      throw new Error('All models failed. Cannot produce ensemble result.');
    }

    if (successfulResults.length < this.config.ensembleStrategy.requireMinimumModels) {
      console.warn(`⚠️  Only ${successfulResults.length} models succeeded (minimum: ${this.config.ensembleStrategy.requireMinimumModels})`);

      if (!this.config.ensembleStrategy.allowPartialFailure) {
        throw new Error('Insufficient models for ensemble (partial failure not allowed)');
      }
    }

    // Log results
    successfulResults.forEach(r => {
      console.log(`  ✅ ${r.model} completed successfully`);
    });

    const duration = Date.now() - startTime;
    console.log(`\n⏱️  Ensemble analysis completed in ${duration}ms\n`);

    // Aggregate results
    const ensembleResult = this.aggregateResults(successfulResults, failedResults);

    return {
      ...ensembleResult,
      metadata: {
        totalModels: this.adapters.length,
        successfulModels: successfulResults.length,
        failedModels: failedResults.length,
        duration: duration,
        timestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Aggregate multiple model results using weighted voting
   * @param {Array} successfulResults - Results from successful models
   * @param {Array} failedResults - Results from failed models
   * @returns {Object} Aggregated ensemble result
   */
  aggregateResults(successfulResults, failedResults) {
    // Calculate weighted average scores
    const weightedScores = this.calculateWeightedScores(successfulResults);

    // Calculate model agreement
    const agreement = this.calculateModelAgreement(successfulResults);

    // Calculate confidence
    const confidence = this.calculateEnsembleConfidence(successfulResults, agreement);

    // Identify disagreements
    const disagreements = this.identifyDisagreements(successfulResults);

    // Aggregate violations
    const violations = this.aggregateViolations(successfulResults);

    // Aggregate recommendations
    const recommendations = this.aggregateRecommendations(successfulResults);

    // Determine overall grade
    const overallGrade = this.calculateGrade(weightedScores.overall);

    return {
      overallScore: weightedScores.overall,
      overallGrade: overallGrade,
      confidence: confidence,
      confidenceLevel: this.getConfidenceLevel(confidence),
      requiresReview: confidence < this.config.thresholds.requiresReview,
      scores: weightedScores,
      agreement: agreement,
      disagreements: disagreements,
      criticalViolations: violations,
      recommendations: recommendations,
      individualAnalyses: successfulResults,
      failedModels: failedResults.map(r => ({ model: r.model, error: r.error }))
    };
  }

  /**
   * Calculate weighted average scores across all categories
   * @param {Array} results - Model results
   * @returns {Object} Weighted scores
   */
  calculateWeightedScores(results) {
    const scores = {
      overall: 0,
      brandCompliance: 0,
      designQuality: 0,
      contentQuality: 0
    };

    let totalWeight = 0;

    results.forEach(({ result, weight }) => {
      scores.overall += (result.overallScore || 0) * weight;
      scores.brandCompliance += (result.brandCompliance?.score || 0) * weight;
      scores.designQuality += (result.designQuality?.score || 0) * weight;
      scores.contentQuality += (result.contentQuality?.score || 0) * weight;
      totalWeight += weight;
    });

    // Normalize by total weight
    Object.keys(scores).forEach(key => {
      scores[key] = Number((scores[key] / totalWeight).toFixed(2));
    });

    return scores;
  }

  /**
   * Calculate model agreement percentage
   * @param {Array} results - Model results
   * @returns {Object} Agreement metrics
   */
  calculateModelAgreement(results) {
    if (results.length < 2) {
      return { percentage: 100, details: 'Only one model available' };
    }

    const scores = results.map(r => r.result.overallScore);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);

    // Agreement based on standard deviation
    // Low stddev = high agreement
    const agreementPercentage = Math.max(0, 100 - (stdDev * 10));

    return {
      percentage: Number(agreementPercentage.toFixed(2)),
      standardDeviation: Number(stdDev.toFixed(2)),
      scoreRange: {
        min: Math.min(...scores),
        max: Math.max(...scores),
        mean: Number(mean.toFixed(2))
      }
    };
  }

  /**
   * Calculate ensemble confidence score (0-100)
   * @param {Array} results - Model results
   * @param {Object} agreement - Agreement metrics
   * @returns {number} Confidence score (0-100)
   */
  calculateEnsembleConfidence(results, agreement) {
    const agreementWeight = this.config.ensembleStrategy.confidenceCalculation.agreementWeight;
    const scoreWeight = this.config.ensembleStrategy.confidenceCalculation.modelWeightedScoreWeight;

    // Agreement component (0-100)
    const agreementScore = agreement.percentage;

    // Model count component (more models = higher confidence)
    const modelCountBonus = Math.min(20, results.length * 5);

    // Weighted score component
    const weightedScoreComponent = 80; // Base assumption

    // Combined confidence
    const confidence = (agreementScore * agreementWeight) +
                      (weightedScoreComponent * scoreWeight) +
                      modelCountBonus;

    return Math.min(100, Number(confidence.toFixed(2)));
  }

  /**
   * Identify disagreements between models
   * @param {Array} results - Model results
   * @returns {Array} Disagreement details
   */
  identifyDisagreements(results) {
    const disagreements = [];

    if (results.length < 2) {
      return disagreements;
    }

    // Check score disagreements
    const scores = results.map(r => ({
      model: r.model,
      score: r.result.overallScore,
      grade: r.result.gradeLevel
    }));

    const scoreDiff = Math.max(...scores.map(s => s.score)) - Math.min(...scores.map(s => s.score));

    if (scoreDiff > 2.0) {
      disagreements.push({
        type: 'score',
        severity: 'major',
        description: `Models disagree on overall score by ${scoreDiff.toFixed(1)} points`,
        models: scores
      });
    }

    // Check grade disagreements
    const uniqueGrades = [...new Set(scores.map(s => s.grade))];
    if (uniqueGrades.length > 1) {
      disagreements.push({
        type: 'grade',
        severity: 'minor',
        description: `Models assigned different grades: ${uniqueGrades.join(', ')}`,
        models: scores
      });
    }

    return disagreements;
  }

  /**
   * Aggregate violations from all models
   * @param {Array} results - Model results
   * @returns {Array} Aggregated violations with confidence
   */
  aggregateViolations(results) {
    const violationMap = new Map();

    results.forEach(({ model, result }) => {
      const violations = result.criticalViolations || [];

      violations.forEach(violation => {
        const normalized = violation.toLowerCase().trim();

        if (!violationMap.has(normalized)) {
          violationMap.set(normalized, {
            violation: violation,
            detectedBy: [],
            confidence: 0
          });
        }

        const entry = violationMap.get(normalized);
        entry.detectedBy.push(model);
        entry.confidence = (entry.detectedBy.length / results.length) * 100;
      });
    });

    // Convert to array and sort by confidence
    return Array.from(violationMap.values())
      .map(v => ({
        ...v,
        confidence: Number(v.confidence.toFixed(2))
      }))
      .sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Aggregate recommendations from all models
   * @param {Array} results - Model results
   * @returns {Array} Aggregated recommendations
   */
  aggregateRecommendations(results) {
    const recommendationMap = new Map();

    results.forEach(({ model, result }) => {
      const recommendations = result.recommendations || [];

      recommendations.forEach(rec => {
        const normalized = rec.toLowerCase().trim();

        if (!recommendationMap.has(normalized)) {
          recommendationMap.set(normalized, {
            recommendation: rec,
            suggestedBy: [],
            frequency: 0
          });
        }

        const entry = recommendationMap.get(normalized);
        entry.suggestedBy.push(model);
        entry.frequency = entry.suggestedBy.length;
      });
    });

    // Convert to array and sort by frequency
    return Array.from(recommendationMap.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10); // Top 10 recommendations
  }

  /**
   * Calculate grade from score
   * @param {number} score - Overall score (0-10)
   * @returns {string} Grade letter
   */
  calculateGrade(score) {
    if (score >= 9.5) return 'A+';
    if (score >= 9.0) return 'A';
    if (score >= 8.0) return 'B';
    if (score >= 7.0) return 'C';
    if (score >= 6.0) return 'D';
    return 'F';
  }

  /**
   * Get confidence level label
   * @param {number} confidence - Confidence score (0-100)
   * @returns {string} Confidence level
   */
  getConfidenceLevel(confidence) {
    if (confidence >= this.config.thresholds.highConfidence) return 'HIGH';
    if (confidence >= this.config.thresholds.mediumConfidence) return 'MEDIUM';
    return 'LOW';
  }
}

export {
  GeminiAdapter,
  Gemini25ProAdapter,
  ClaudeAdapter,
  GPT5Adapter,
  GPT4VisionAdapter
};
