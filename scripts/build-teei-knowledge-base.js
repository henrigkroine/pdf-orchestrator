#!/usr/bin/env node

/**
 * TEEI Knowledge Base Builder
 *
 * Scrapes all TEEI brand documents, extracts design patterns,
 * and indexes them in the vector database for RAG.
 *
 * Features:
 * - Automatic document discovery
 * - Design pattern extraction
 * - Embedding generation
 * - Vector database indexing
 * - Knowledge graph construction
 * - Incremental updates
 *
 * Usage:
 *   node scripts/build-teei-knowledge-base.js
 *   node scripts/build-teei-knowledge-base.js --rebuild
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { program } from 'commander';
import { glob } from 'glob';
import { chromium } from 'playwright';
import { TEEIBrandVectorStore } from './lib/vector-store.js';
import pdfParse from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * Knowledge Base Builder
 */
class TEEIKnowledgeBaseBuilder {
  constructor(options = {}) {
    this.vectorStore = new TEEIBrandVectorStore(options.vectorStore || {});
    this.sourceDirs = options.sourceDirs || [
      'T:\\TEEI\\TEEI Overviews',
      'T:\\TEEI\\Logos',
      'exports',
      'training-examples'
    ];
    this.browser = null;
    this.knowledgeGraph = new Map();
  }

  /**
   * Initialize builder
   */
  async initialize() {
    console.log('🚀 Initializing TEEI Knowledge Base Builder...\n');

    await this.vectorStore.initialize();
    this.browser = await chromium.launch({ headless: true });

    console.log('✅ Builder initialized\n');
  }

  /**
   * Build complete knowledge base
   */
  async build(rebuild = false) {
    console.log('📚 Building TEEI Knowledge Base...\n');

    if (rebuild) {
      console.log('🔄 Rebuild requested, recreating collection...');
      await this.vectorStore.recreateCollection();
    }

    // 1. Discover documents
    const documents = await this.discoverDocuments();

    console.log(`\n📄 Found ${documents.length} documents to process\n`);

    // 2. Extract patterns from each document
    const patterns = [];
    let processed = 0;

    for (const doc of documents) {
      process.stdout.write(`Processing: ${processed + 1}/${documents.length} (${doc.name})...\r`);

      try {
        const docPatterns = await this.extractPatterns(doc);
        patterns.push(...docPatterns);
        processed++;
      } catch (error) {
        console.error(`\n⚠️  Failed to process ${doc.path}:`, error.message);
      }
    }

    console.log(`\n✅ Extracted ${patterns.length} design patterns\n`);

    // 3. Index patterns in vector database
    await this.indexPatterns(patterns);

    // 4. Build knowledge graph
    await this.buildKnowledgeGraph(patterns);

    // 5. Generate statistics
    const stats = await this.generateStatistics();

    console.log('\n✅ Knowledge base built successfully!\n');
    this.printStatistics(stats);

    return stats;
  }

  /**
   * Discover TEEI documents
   */
  async discoverDocuments() {
    console.log('🔍 Discovering TEEI documents...');

    const documents = [];

    // Find PDFs
    const pdfPatterns = [
      path.join(ROOT_DIR, 'exports/**/*.pdf'),
      path.join(ROOT_DIR, 'training-examples/**/*.pdf')
    ];

    for (const pattern of pdfPatterns) {
      const files = await glob(pattern, { nodir: true });
      documents.push(...files.map(f => ({
        path: f,
        name: path.basename(f),
        type: 'pdf',
        dir: path.dirname(f)
      })));
    }

    // Find HTML files
    const htmlPatterns = [
      path.join(ROOT_DIR, 'exports/**/*.html'),
      path.join(ROOT_DIR, 'training-examples/**/*.html')
    ];

    for (const pattern of htmlPatterns) {
      const files = await glob(pattern, { nodir: true });
      documents.push(...files.map(f => ({
        path: f,
        name: path.basename(f),
        type: 'html',
        dir: path.dirname(f)
      })));
    }

    // Find images
    const imagePatterns = [
      path.join(ROOT_DIR, 'assets/**/*.{png,jpg,jpeg}'),
      path.join(ROOT_DIR, 'brand-examples/**/*.{png,jpg,jpeg}')
    ];

    for (const pattern of imagePatterns) {
      const files = await glob(pattern, { nodir: true });
      documents.push(...files.map(f => ({
        path: f,
        name: path.basename(f),
        type: 'image',
        dir: path.dirname(f)
      })));
    }

    console.log(`   Found ${documents.length} documents`);

    return documents;
  }

  /**
   * Extract design patterns from document
   */
  async extractPatterns(document) {
    const patterns = [];

    try {
      if (document.type === 'html') {
        return await this.extractPatternsFromHTML(document);
      } else if (document.type === 'pdf') {
        return await this.extractPatternsFromPDF(document);
      } else if (document.type === 'image') {
        return await this.extractPatternsFromImage(document);
      }
    } catch (error) {
      console.error(`Failed to extract patterns from ${document.path}:`, error.message);
    }

    return patterns;
  }

  /**
   * Extract patterns from HTML
   */
  async extractPatternsFromHTML(document) {
    const patterns = [];
    const page = await this.browser.newPage();

    try {
      await page.goto(`file://${document.path}`, { waitUntil: 'networkidle' });

      // Extract color patterns
      const colors = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const colorMap = new Map();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);

          // Background colors
          if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            const color = style.backgroundColor;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }

          // Text colors
          if (style.color) {
            const color = style.color;
            colorMap.set(color, (colorMap.get(color) || 0) + 1);
          }
        });

        return Array.from(colorMap.entries()).map(([color, count]) => ({ color, count }));
      });

      // Create color patterns
      colors.forEach(({ color, count }) => {
        patterns.push({
          type: 'color_usage',
          description: `Color ${color} used ${count} times in ${document.name}`,
          document: document.path,
          metadata: {
            color,
            count,
            source: document.name
          },
          tags: ['color', 'extracted', 'usage']
        });
      });

      // Extract typography patterns
      const fonts = await page.evaluate(() => {
        const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, div');
        const fontMap = new Map();

        elements.forEach(el => {
          const style = window.getComputedStyle(el);
          const fontFamily = style.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          const fontSize = style.fontSize;
          const fontWeight = style.fontWeight;

          const key = `${fontFamily}-${fontSize}-${fontWeight}`;
          fontMap.set(key, {
            family: fontFamily,
            size: fontSize,
            weight: fontWeight,
            count: (fontMap.get(key)?.count || 0) + 1
          });
        });

        return Array.from(fontMap.values());
      });

      fonts.forEach(font => {
        patterns.push({
          type: 'typography',
          description: `${font.family} ${font.weight} ${font.size} used ${font.count} times in ${document.name}`,
          document: document.path,
          metadata: {
            font_family: font.family,
            font_size: font.size,
            font_weight: font.weight,
            count: font.count,
            source: document.name
          },
          tags: ['typography', 'extracted', font.family.toLowerCase()]
        });
      });

      // Extract layout patterns
      const layout = await page.evaluate(() => {
        return {
          width: document.body.offsetWidth,
          height: document.body.offsetHeight,
          sections: document.querySelectorAll('section').length,
          images: document.querySelectorAll('img').length
        };
      });

      patterns.push({
        type: 'layout',
        description: `Layout: ${layout.width}x${layout.height}, ${layout.sections} sections, ${layout.images} images in ${document.name}`,
        document: document.path,
        metadata: {
          ...layout,
          source: document.name
        },
        tags: ['layout', 'extracted', 'structure']
      });

    } finally {
      await page.close();
    }

    return patterns;
  }

  /**
   * Extract patterns from PDF
   */
  async extractPatternsFromPDF(document) {
    const patterns = [];

    try {
      const dataBuffer = await fs.readFile(document.path);
      const data = await pdfParse(dataBuffer);

      // Extract text patterns
      if (data.text) {
        // Check for brand keywords
        const brandKeywords = [
          'TEEI', 'Together for Ukraine', 'Educational Equality',
          'Nordshore', 'Sky', 'Sand', 'Beige', 'Gold',
          'Lora', 'Roboto'
        ];

        brandKeywords.forEach(keyword => {
          const count = (data.text.match(new RegExp(keyword, 'gi')) || []).length;

          if (count > 0) {
            patterns.push({
              type: 'content',
              description: `"${keyword}" mentioned ${count} times in ${document.name}`,
              document: document.path,
              metadata: {
                keyword,
                count,
                source: document.name
              },
              tags: ['content', 'keyword', keyword.toLowerCase()]
            });
          }
        });
      }

      // Metadata
      patterns.push({
        type: 'document_metadata',
        description: `PDF: ${data.numpages} pages, ${data.info?.Title || 'Untitled'} - ${document.name}`,
        document: document.path,
        metadata: {
          pages: data.numpages,
          title: data.info?.Title,
          author: data.info?.Author,
          source: document.name
        },
        tags: ['metadata', 'pdf']
      });

    } catch (error) {
      console.error(`Failed to parse PDF ${document.path}:`, error.message);
    }

    return patterns;
  }

  /**
   * Extract patterns from image
   */
  async extractPatternsFromImage(document) {
    const patterns = [];

    // Basic image metadata
    try {
      const stats = await fs.stat(document.path);

      patterns.push({
        type: 'image',
        description: `Image asset: ${document.name} (${(stats.size / 1024).toFixed(1)} KB)`,
        document: document.path,
        metadata: {
          size_kb: stats.size / 1024,
          source: document.name,
          directory: document.dir
        },
        tags: ['image', 'asset']
      });
    } catch (error) {
      // Ignore
    }

    return patterns;
  }

  /**
   * Index patterns in vector database
   */
  async indexPatterns(patterns) {
    console.log('💾 Indexing patterns in vector database...');

    const points = [];

    for (const [idx, pattern] of patterns.entries()) {
      process.stdout.write(`   Indexing: ${idx + 1}/${patterns.length}...\r`);

      // Generate embedding
      const embedding = await this.vectorStore.generateEmbedding(pattern.description);

      // Create point
      points.push({
        id: idx + 10000,  // Offset to avoid conflicts with manual examples
        vector: embedding,
        payload: {
          type: pattern.type,
          description: pattern.description,
          document: pattern.document,
          metadata: pattern.metadata || {},
          tags: pattern.tags || [],
          indexed_at: new Date().toISOString()
        }
      });

      // Batch upsert every 100 points
      if (points.length >= 100) {
        await this.vectorStore.client.upsert(this.vectorStore.collectionName, {
          points: points.slice()
        });
        points.length = 0;
      }
    }

    // Upsert remaining points
    if (points.length > 0) {
      await this.vectorStore.client.upsert(this.vectorStore.collectionName, {
        points
      });
    }

    console.log(`\n   ✅ Indexed ${patterns.length} patterns\n`);
  }

  /**
   * Build knowledge graph
   */
  async buildKnowledgeGraph(patterns) {
    console.log('🕸️  Building knowledge graph...');

    // Group patterns by type
    const graph = new Map();

    patterns.forEach(pattern => {
      if (!graph.has(pattern.type)) {
        graph.set(pattern.type, []);
      }
      graph.get(pattern.type).push(pattern);
    });

    // Create relationships
    const relationships = [];

    // Color → Typography relationships
    const colors = graph.get('color_usage') || [];
    const fonts = graph.get('typography') || [];

    colors.forEach(color => {
      fonts.forEach(font => {
        if (color.document === font.document) {
          relationships.push({
            type: 'uses_with',
            from: color,
            to: font,
            strength: 1.0
          });
        }
      });
    });

    this.knowledgeGraph = graph;

    console.log(`   ✅ Built graph with ${graph.size} nodes and ${relationships.length} edges\n`);
  }

  /**
   * Generate statistics
   */
  async generateStatistics() {
    const stats = await this.vectorStore.getStats();

    const typeDistribution = new Map();
    const tagDistribution = new Map();

    for (const [type, patterns] of this.knowledgeGraph.entries()) {
      typeDistribution.set(type, patterns.length);

      patterns.forEach(p => {
        if (p.tags) {
          p.tags.forEach(tag => {
            tagDistribution.set(tag, (tagDistribution.get(tag) || 0) + 1);
          });
        }
      });
    }

    return {
      vectorStore: stats,
      knowledgeGraph: {
        nodes: this.knowledgeGraph.size,
        patterns: Array.from(this.knowledgeGraph.values()).reduce((sum, arr) => sum + arr.length, 0)
      },
      typeDistribution: Object.fromEntries(typeDistribution),
      tagDistribution: Object.fromEntries(tagDistribution),
      topTags: Array.from(tagDistribution.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag, count]) => ({ tag, count }))
    };
  }

  /**
   * Print statistics
   */
  printStatistics(stats) {
    console.log('📊 Knowledge Base Statistics:\n');

    console.log('Vector Store:');
    console.log(`   Collection: ${stats.vectorStore.collection}`);
    console.log(`   Points: ${stats.vectorStore.points_count}`);
    console.log(`   Vectors: ${stats.vectorStore.vectors_count}`);
    console.log(`   Model: ${stats.vectorStore.embedding_model}`);
    console.log(`   Dimensions: ${stats.vectorStore.dimensions}\n`);

    console.log('Knowledge Graph:');
    console.log(`   Nodes: ${stats.knowledgeGraph.nodes}`);
    console.log(`   Patterns: ${stats.knowledgeGraph.patterns}\n`);

    console.log('Pattern Types:');
    Object.entries(stats.typeDistribution).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    console.log();

    console.log('Top Tags:');
    stats.topTags.forEach(({ tag, count }) => {
      console.log(`   ${tag}: ${count}`);
    });
    console.log();
  }

  /**
   * Cleanup
   */
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
  program
    .name('build-teei-knowledge-base')
    .description('Build TEEI brand knowledge base from documents')
    .option('-r, --rebuild', 'Rebuild from scratch (recreate collection)')
    .option('--source-dirs <dirs>', 'Comma-separated list of source directories');

  program.parse();

  const options = program.opts();

  const builder = new TEEIKnowledgeBaseBuilder({
    sourceDirs: options.sourceDirs?.split(',')
  });

  try {
    await builder.initialize();
    const stats = await builder.build(options.rebuild);

    console.log('✅ Knowledge base built successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Test search: node scripts/lib/vector-store.js');
    console.log('   2. Validate with RAG: node scripts/validate-pdf-rag.js document.pdf');
    console.log();

    return stats;
  } catch (error) {
    console.error('❌ Failed to build knowledge base:', error);
    throw error;
  } finally {
    await builder.cleanup();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export { TEEIKnowledgeBaseBuilder };
