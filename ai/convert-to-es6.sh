#!/bin/bash
# ES6 Module Conversion Script
# Converts CommonJS (module.exports/require) to ES6 (export/import)

echo "Converting CommonJS to ES6 modules..."

# List of files to convert
FILES=(
  "ai/rag/ragClient.js"
  "ai/rag/embeddingGenerator.js"
  "ai/rag/documentIndexer.js"
  "ai/rag/contentRetriever.js"
  "ai/rag/ragOrchestrator.js"
  "ai/image-generation/imageGenerationClient.js"
  "ai/image-generation/promptEngineer.js"
  "ai/image-generation/imageCache.js"
  "ai/image-generation/imageOptimizer.js"
  "ai/image-generation/imageGenerationOrchestrator.js"
  "ai/accessibility/accessibilityAnalyzer.js"
  "ai/accessibility/altTextGenerator.js"
  "ai/accessibility/structureTagging.js"
  "ai/accessibility/readingOrderOptimizer.js"
  "ai/accessibility/contrastChecker.js"
  "ai/accessibility/wcagValidator.js"
  "ai/accessibility/accessibilityRemediator.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Converting $file..."

    # Step 1: Convert require() to import
    # const X = require('Y') → import X from 'Y.js'
    sed -i "s/const \([^ ]*\) = require('\([^']*\)');/import \1 from '\2.js';/g" "$file"
    sed -i 's/const \([^ ]*\) = require("\([^"]*\)");/import \1 from "\2.js";/g' "$file"

    # Step 2: Convert destructured requires
    # const { a, b } = require('X') → import { a, b } from 'X.js'
    sed -i "s/const { \([^}]*\) } = require('\([^']*\)');/import { \1 } from '\2.js';/g" "$file"
    sed -i 's/const { \([^}]*\) } = require("\([^"]*\)");/import { \1 } from "\2.js";/g' "$file"

    # Step 3: Convert module.exports = X to export default X
    sed -i 's/module\.exports = \(.*\);$/export default \1;/g' "$file"

    # Step 4: Convert module.exports.X = Y to export const X = Y
    sed -i 's/module\.exports\.\([^ ]*\) = /export const \1 = /g' "$file"

    echo "  ✓ Converted $file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo ""
echo "✅ Conversion complete!"
echo "Files converted: ${#FILES[@]}"
