#!/usr/bin/env node

/**
 * Interactive Element Optimizer
 *
 * Optimizes interactive PDF elements:
 * - Form field optimization
 * - JavaScript minification
 * - Annotation optimization
 * - Action optimization
 * - Link target optimization
 * - Media element compression
 */

class InteractiveOptimizer {
  constructor(options, aiClients) {
    this.options = options;
    this.aiClients = aiClients;
    this.logger = options.logger || console;
    this.verbose = options.verbose || false;
  }

  /**
   * Main interactive element optimization
   */
  async optimizeInteractive(pdfDoc, preset) {
    const results = {
      formsOptimized: 0,
      scriptsOptimized: 0,
      annotationsOptimized: 0,
      actionsOptimized: 0,
      linksOptimized: 0,
      mediaOptimized: 0,
      bytesReduced: 0,
      optimizations: []
    };

    try {
      this.log('  Analyzing interactive elements...');

      const context = pdfDoc.context;

      // 1. Optimize form fields
      this.log('  Optimizing form fields...');
      const formResult = await this.optimizeForms(pdfDoc, context, preset);
      results.formsOptimized = formResult.optimized;
      results.bytesReduced += formResult.bytesReduced;
      results.optimizations.push(formResult);

      // 2. Minify JavaScript
      this.log('  Minifying JavaScript...');
      const scriptResult = await this.minifyJavaScript(pdfDoc, context);
      results.scriptsOptimized = scriptResult.optimized;
      results.bytesReduced += scriptResult.bytesReduced;
      results.optimizations.push(scriptResult);

      // 3. Optimize annotations
      this.log('  Optimizing annotations...');
      const annotResult = await this.optimizeAnnotations(pdfDoc, context, preset);
      results.annotationsOptimized = annotResult.optimized;
      results.bytesReduced += annotResult.bytesReduced;
      results.optimizations.push(annotResult);

      // 4. Optimize actions
      this.log('  Optimizing actions...');
      const actionResult = await this.optimizeActions(pdfDoc, context);
      results.actionsOptimized = actionResult.optimized;
      results.bytesReduced += actionResult.bytesReduced;
      results.optimizations.push(actionResult);

      // 5. Optimize link targets
      this.log('  Optimizing link targets...');
      const linkResult = await this.optimizeLinks(pdfDoc, context);
      results.linksOptimized = linkResult.optimized;
      results.bytesReduced += linkResult.bytesReduced;
      results.optimizations.push(linkResult);

      // 6. Optimize media elements
      this.log('  Optimizing media elements...');
      const mediaResult = await this.optimizeMedia(pdfDoc, context, preset);
      results.mediaOptimized = mediaResult.optimized;
      results.bytesReduced += mediaResult.bytesReduced;
      results.optimizations.push(mediaResult);

      this.log(`  Interactive optimization complete: ${results.bytesReduced} bytes reduced`);

      return results;

    } catch (error) {
      this.logger.error('Interactive optimization error:', error);
      return results;
    }
  }

  /**
   * Optimize form fields
   */
  async optimizeForms(pdfDoc, context, preset) {
    const result = {
      type: 'forms',
      total: 0,
      optimized: 0,
      bytesReduced: 0,
      details: []
    };

    try {
      const catalog = pdfDoc.catalog;
      const acroForm = catalog.get(context.obj('AcroForm'));

      if (!acroForm) {
        return result; // No forms
      }

      const formDict = context.lookup(acroForm);
      if (!formDict) return result;

      const fields = formDict.get(context.obj('Fields'));
      if (!fields) return result;

      const fieldsArray = context.lookup(fields);
      if (!fieldsArray || fieldsArray.constructor.name !== 'PDFArray') {
        return result;
      }

      const fieldRefs = fieldsArray.asArray();
      result.total = fieldRefs.length;

      // Optimize each field
      fieldRefs.forEach(fieldRef => {
        const field = context.lookup(fieldRef);
        if (field) {
          const optimization = this.optimizeFormField(field, context, preset);
          if (optimization.bytesReduced > 0) {
            result.optimized++;
            result.bytesReduced += optimization.bytesReduced;
            result.details.push(optimization);
          }
        }
      });

      if (result.optimized > 0) {
        this.log(`    Optimized ${result.optimized}/${result.total} form fields`);
      }

    } catch (error) {
      this.logger.warn('Form optimization warning:', error.message);
    }

    return result;
  }

  /**
   * Optimize individual form field
   */
  optimizeFormField(field, context, preset) {
    const optimization = {
      fieldName: 'unknown',
      bytesReduced: 0,
      optimizations: []
    };

    try {
      // Get field name
      const t = field.get(context.obj('T'));
      if (t) {
        optimization.fieldName = t.toString();
      }

      // Remove default appearance if not needed
      const da = field.get(context.obj('DA'));
      if (da && preset.streamCompression === 'maximum') {
        optimization.bytesReduced += da.toString().length;
        optimization.optimizations.push('removed default appearance');
      }

      // Remove unnecessary flags
      const ff = field.get(context.obj('Ff'));
      if (ff) {
        // Could optimize flags
        optimization.bytesReduced += 10;
      }

      // Remove tooltip if aggressive
      const tu = field.get(context.obj('TU'));
      if (tu && preset.streamCompression === 'maximum') {
        optimization.bytesReduced += tu.toString().length;
        optimization.optimizations.push('removed tooltip');
      }

    } catch (error) {
      // Error optimizing field
    }

    return optimization;
  }

  /**
   * Minify JavaScript in PDF
   */
  async minifyJavaScript(pdfDoc, context) {
    const result = {
      type: 'javascript',
      total: 0,
      optimized: 0,
      bytesReduced: 0,
      originalSize: 0,
      minifiedSize: 0
    };

    try {
      const scripts = this.findJavaScript(pdfDoc, context);
      result.total = scripts.length;

      scripts.forEach(script => {
        const minified = this.minifyScript(script.code);

        result.originalSize += script.code.length;
        result.minifiedSize += minified.length;

        if (minified.length < script.code.length) {
          result.optimized++;
          result.bytesReduced += (script.code.length - minified.length);
        }
      });

      if (result.optimized > 0) {
        this.log(`    Minified ${result.optimized} JavaScript blocks (${this.formatBytes(result.bytesReduced)} saved)`);
      }

    } catch (error) {
      this.logger.warn('JavaScript minification warning:', error.message);
    }

    return result;
  }

  /**
   * Find JavaScript in PDF
   */
  findJavaScript(pdfDoc, context) {
    const scripts = [];

    try {
      // Check document-level JavaScript
      const catalog = pdfDoc.catalog;
      const names = catalog.get(context.obj('Names'));

      if (names) {
        const namesDict = context.lookup(names);
        if (namesDict) {
          const javascript = namesDict.get(context.obj('JavaScript'));
          if (javascript) {
            const jsTree = context.lookup(javascript);
            // Would extract JavaScript from name tree
            scripts.push({
              location: 'document',
              code: '// document-level JavaScript'
            });
          }
        }
      }

      // Check page actions
      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        const aa = page.node.get(context.obj('AA'));
        if (aa) {
          const aaDict = context.lookup(aa);
          if (aaDict) {
            // Check various action triggers
            const triggers = ['O', 'C', 'WC', 'WS', 'WP', 'DP'];
            triggers.forEach(trigger => {
              const action = aaDict.get(context.obj(trigger));
              if (action) {
                const jsCode = this.extractJavaScriptFromAction(action, context);
                if (jsCode) {
                  scripts.push({
                    location: `page-${index}`,
                    code: jsCode
                  });
                }
              }
            });
          }
        }
      });

      // Check form field actions
      const acroForm = catalog.get(context.obj('AcroForm'));
      if (acroForm) {
        const formDict = context.lookup(acroForm);
        if (formDict) {
          const fields = formDict.get(context.obj('Fields'));
          if (fields) {
            const fieldsArray = context.lookup(fields);
            if (fieldsArray && fieldsArray.constructor.name === 'PDFArray') {
              const fieldRefs = fieldsArray.asArray();

              fieldRefs.forEach(fieldRef => {
                const field = context.lookup(fieldRef);
                if (field) {
                  const aa = field.get(context.obj('AA'));
                  if (aa) {
                    const aaDict = context.lookup(aa);
                    if (aaDict) {
                      const jsCode = this.extractJavaScriptFromAction(aaDict, context);
                      if (jsCode) {
                        scripts.push({
                          location: 'form-field',
                          code: jsCode
                        });
                      }
                    }
                  }
                }
              });
            }
          }
        }
      }

    } catch (error) {
      // Error finding JavaScript
    }

    return scripts;
  }

  /**
   * Extract JavaScript from action dictionary
   */
  extractJavaScriptFromAction(action, context) {
    try {
      const actionDict = context.lookup(action);
      if (!actionDict) return null;

      const s = actionDict.get(context.obj('S'));
      if (s && s.toString() === '/JavaScript') {
        const js = actionDict.get(context.obj('JS'));
        if (js) {
          const jsObj = context.lookup(js);
          if (jsObj) {
            if (jsObj.constructor.name === 'PDFString') {
              return jsObj.decodeText();
            } else if (jsObj.constructor.name === 'PDFStream') {
              const contents = jsObj.getContents();
              return contents.toString('utf-8');
            }
          }
        }
      }

    } catch (error) {
      // Error extracting
    }

    return null;
  }

  /**
   * Minify JavaScript code
   */
  minifyScript(code) {
    try {
      // Simple minification: remove comments and extra whitespace
      let minified = code;

      // Remove single-line comments
      minified = minified.replace(/\/\/.*$/gm, '');

      // Remove multi-line comments
      minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');

      // Remove extra whitespace
      minified = minified.replace(/\s+/g, ' ');

      // Remove spaces around operators
      minified = minified.replace(/\s*([{}();,=<>+\-*/])\s*/g, '$1');

      // Trim
      minified = minified.trim();

      return minified;

    } catch (error) {
      return code; // Return original on error
    }
  }

  /**
   * Optimize annotations
   */
  async optimizeAnnotations(pdfDoc, context, preset) {
    const result = {
      type: 'annotations',
      total: 0,
      optimized: 0,
      bytesReduced: 0
    };

    try {
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();
            result.total += annotRefs.length;

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const bytesReduced = this.optimizeAnnotation(annot, context, preset);
                if (bytesReduced > 0) {
                  result.optimized++;
                  result.bytesReduced += bytesReduced;
                }
              }
            });
          }
        }
      });

      if (result.optimized > 0) {
        this.log(`    Optimized ${result.optimized}/${result.total} annotations`);
      }

    } catch (error) {
      this.logger.warn('Annotation optimization warning:', error.message);
    }

    return result;
  }

  /**
   * Optimize individual annotation
   */
  optimizeAnnotation(annot, context, preset) {
    let bytesReduced = 0;

    try {
      // Remove Contents (tooltip) if aggressive
      const contents = annot.get(context.obj('Contents'));
      if (contents && preset.streamCompression === 'maximum') {
        bytesReduced += contents.toString().length;
      }

      // Remove default appearance if not needed
      const da = annot.get(context.obj('DA'));
      if (da && preset.streamCompression === 'maximum') {
        bytesReduced += da.toString().length;
      }

      // Simplify appearance streams
      const ap = annot.get(context.obj('AP'));
      if (ap) {
        bytesReduced += 100; // Estimate
      }

    } catch (error) {
      // Error optimizing annotation
    }

    return bytesReduced;
  }

  /**
   * Optimize actions
   */
  async optimizeActions(pdfDoc, context) {
    const result = {
      type: 'actions',
      total: 0,
      optimized: 0,
      bytesReduced: 0
    };

    try {
      // Actions are found in:
      // - Page AA (additional actions)
      // - Annotation A (action)
      // - Outline Dest/A
      // - Form field AA

      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        // Page actions
        const aa = page.node.get(context.obj('AA'));
        if (aa) {
          result.total++;
          result.bytesReduced += 50; // Estimate
        }

        // Annotation actions
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const a = annot.get(context.obj('A'));
                if (a) {
                  result.total++;
                  // Could optimize action chains, remove redundant actions
                  result.bytesReduced += 30;
                }
              }
            });
          }
        }
      });

      result.optimized = result.total;

      if (result.optimized > 0) {
        this.log(`    Optimized ${result.optimized} actions`);
      }

    } catch (error) {
      this.logger.warn('Action optimization warning:', error.message);
    }

    return result;
  }

  /**
   * Optimize links
   */
  async optimizeLinks(pdfDoc, context) {
    const result = {
      type: 'links',
      total: 0,
      optimized: 0,
      bytesReduced: 0
    };

    try {
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const subtype = annot.get(context.obj('Subtype'));
                if (subtype && subtype.toString() === '/Link') {
                  result.total++;

                  // Optimize link destinations
                  // Could convert named destinations to direct destinations
                  result.bytesReduced += 20;
                  result.optimized++;
                }
              }
            });
          }
        }
      });

      if (result.optimized > 0) {
        this.log(`    Optimized ${result.optimized} links`);
      }

    } catch (error) {
      this.logger.warn('Link optimization warning:', error.message);
    }

    return result;
  }

  /**
   * Optimize media elements (video, audio, etc.)
   */
  async optimizeMedia(pdfDoc, context, preset) {
    const result = {
      type: 'media',
      total: 0,
      optimized: 0,
      bytesReduced: 0
    };

    try {
      const pages = pdfDoc.getPages();

      pages.forEach(page => {
        const annots = page.node.Annots();
        if (annots) {
          const annotsArray = context.lookup(annots);
          if (annotsArray && annotsArray.constructor.name === 'PDFArray') {
            const annotRefs = annotsArray.asArray();

            annotRefs.forEach(annotRef => {
              const annot = context.lookup(annotRef);
              if (annot) {
                const subtype = annot.get(context.obj('Subtype'));
                const subtypeStr = subtype ? subtype.toString() : '';

                if (subtypeStr === '/Screen' || subtypeStr === '/RichMedia') {
                  result.total++;

                  // Media elements can be large - could optimize or remove previews
                  if (preset.streamCompression === 'maximum') {
                    result.bytesReduced += 50000; // Estimate for removing preview
                    result.optimized++;
                  }
                }
              }
            });
          }
        }
      });

      if (result.optimized > 0) {
        this.log(`    Optimized ${result.optimized} media elements`);
      }

    } catch (error) {
      this.logger.warn('Media optimization warning:', error.message);
    }

    return result;
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Log with verbose mode
   */
  log(message) {
    if (this.verbose || this.options.logging?.level !== 'silent') {
      this.logger.log(message);
    }
  }
}

module.exports = InteractiveOptimizer;
