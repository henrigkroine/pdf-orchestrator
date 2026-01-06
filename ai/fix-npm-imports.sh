#!/bin/bash
# Fix NPM Package Import Paths
# Removes incorrect .js extensions from built-in Node modules and npm packages

echo "Fixing NPM package import paths..."

FILES=(
  "ai/image-generation/imageGenerationClient.js"
  "ai/image-generation/imageOptimizer.js"
  "ai/image-generation/imageCache.js"
  "ai/image-generation/imageGenerationOrchestrator.js"
  "ai/accessibility/accessibilityRemediator.js"
)

# Built-in modules and npm packages that should NOT have .js extension
PACKAGES=(
  "openai"
  "sharp"
  "path"
  "axios"
  "crypto"
  "fs"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."

    # Fix each npm package import
    for pkg in "${PACKAGES[@]}"; do
      # Fix single quotes: 'package.js' → 'package'
      sed -i "s/from '${pkg}\.js'/from '${pkg}'/g" "$file"
      # Fix double quotes: "package.js" → "package"
      sed -i "s/from \"${pkg}\.js\"/from \"${pkg}\"/g" "$file"
    done

    # Fix remaining require() statements for fs.promises
    sed -i "s/const fs = require('fs')\.promises;/import fs from 'fs';/g" "$file"
    sed -i 's/const fs = require("fs")\.promises;/import fs from "fs";/g' "$file"

    echo "  ✓ Fixed $file"
  else
    echo "  ⚠ File not found: $file"
  fi
done

echo ""
echo "✅ NPM import fixes complete!"
echo "Files fixed: ${#FILES[@]}"
