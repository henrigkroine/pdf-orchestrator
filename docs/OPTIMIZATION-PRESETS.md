# PDF Optimization Presets

**Detailed guide to optimization presets and when to use each**

## Table of Contents

1. [Preset Overview](#preset-overview)
2. [Aggressive Preset](#aggressive-preset)
3. [Balanced Preset](#balanced-preset)
4. [Conservative Preset](#conservative-preset)
5. [Web Preset](#web-preset)
6. [Print Preset](#print-preset)
7. [Archive Preset](#archive-preset)
8. [Preset Comparison](#preset-comparison)
9. [Choosing the Right Preset](#choosing-the-right-preset)

---

## Preset Overview

The PDF Performance Optimizer includes 6 carefully tuned presets, each optimized for specific use cases:

| Preset | Target Reduction | Quality | Best For |
|--------|------------------|---------|----------|
| **Aggressive** | 60% | Acceptable | Email attachments, uploads |
| **Balanced** | 40% | Good | General use (recommended) |
| **Conservative** | 20% | Excellent | High-quality documents |
| **Web** | 65% | Good | Web viewing, fast loading |
| **Print** | 25% | High | Print output, CMYK |
| **Archive** | 15% | Excellent | Long-term storage, PDF/A |

---

## Aggressive Preset

**Goal**: Maximum file size reduction
**Target Reduction**: 60%
**Quality Level**: Acceptable

### Settings

```json
{
  "targetReduction": 60,
  "imageQuality": 75,
  "imageDPI": {
    "color": 150,
    "grayscale": 150,
    "monochrome": 300
  },
  "fontSubsetting": true,
  "fontDeduplication": true,
  "removeUnusedObjects": true,
  "streamCompression": "maximum",
  "linearization": true,
  "objectStreams": true,
  "transparencyFlattening": true,
  "pathSimplification": true,
  "pdfVersion": "1.7"
}
```

### Optimizations Applied

**Images** (highest impact):
- ✅ Downsample to 150 DPI
- ✅ JPEG quality 75 (moderate compression)
- ✅ PNG to JPEG conversion (when appropriate)
- ✅ Remove alpha channel (if not used)
- ✅ Strip image metadata

**Fonts**:
- ✅ Aggressive subsetting (only used glyphs)
- ✅ Deduplication
- ✅ Remove unused fonts
- ✅ Optimize font format

**Structure**:
- ✅ Remove all optional metadata
- ✅ Remove tooltips, comments
- ✅ Maximum stream compression
- ✅ Aggressive object stream packing

**Rendering**:
- ✅ Flatten transparency (when >20 effects)
- ✅ Simplify complex paths
- ✅ Merge layers
- ✅ Optimize patterns

### Use Cases

✅ **Perfect for**:
- Email attachments (file size limits)
- Cloud storage/upload (bandwidth constraints)
- Mobile viewing (limited data)
- Internal documents (quality less critical)
- Temporary/disposable documents

❌ **Avoid for**:
- Print output (DPI too low)
- High-quality presentations
- Photography portfolios
- Legal/archival documents
- Client-facing materials

### Quality Impact

**Expected perceptual quality**: SSIM 0.90-0.92

**Visual changes**:
- Slight softness in images (not sharp as original)
- Some compression artifacts in gradients
- Minimal text quality impact
- Transparency may be flattened (less editability)

**Functionality**:
- ✅ Text selection works
- ✅ Links functional
- ⚠️ Some transparency lost
- ⚠️ Font editing may be limited

### Examples

**Before/After**:
```
Marketing brochure:
  Original: 45 MB (12 pages, 600 DPI images)
  Optimized: 12 MB (150 DPI, JPEG 75)
  Reduction: 73%
  Quality: Good for screen viewing

Technical manual:
  Original: 18 MB (80 pages)
  Optimized: 6 MB (aggressive compression)
  Reduction: 67%
  Quality: Acceptable for internal use
```

---

## Balanced Preset

**Goal**: Quality/size balance
**Target Reduction**: 40%
**Quality Level**: Good (minimal visible quality loss)

### Settings

```json
{
  "targetReduction": 40,
  "imageQuality": 85,
  "imageDPI": {
    "color": 200,
    "grayscale": 200,
    "monochrome": 400
  },
  "fontSubsetting": true,
  "fontDeduplication": true,
  "removeUnusedObjects": true,
  "streamCompression": "balanced",
  "linearization": true,
  "objectStreams": true,
  "transparencyFlattening": false,
  "pathSimplification": true,
  "pdfVersion": "1.7"
}
```

### Optimizations Applied

**Images** (balanced approach):
- ✅ Downsample to 200 DPI (suitable for screen and low-quality print)
- ✅ JPEG quality 85 (excellent visual quality)
- ✅ Smart PNG to JPEG conversion
- ✅ Preserve alpha when needed
- ✅ Strip metadata

**Fonts**:
- ✅ Standard subsetting
- ✅ Deduplication
- ✅ Remove obvious unused fonts
- ✅ Preserve hints

**Structure**:
- ✅ Remove non-essential metadata
- ✅ Keep title, author
- ✅ Balanced compression
- ✅ Efficient object streams

**Rendering**:
- ✅ Preserve transparency (editability)
- ✅ Simplify obviously complex paths
- ✅ Selective layer optimization
- ✅ Optimize patterns

### Use Cases

✅ **Perfect for** (RECOMMENDED):
- General documents
- Business presentations
- Reports and proposals
- Client deliverables
- Web and print dual-use
- Most everyday scenarios

✅ **Good for**:
- Marketing materials
- Brochures and flyers
- Documentation
- E-books
- Digital magazines

### Quality Impact

**Expected perceptual quality**: SSIM 0.94-0.96

**Visual changes**:
- Minimal visible changes
- Sharp images maintained
- Text perfectly clear
- Transparency preserved
- Colors accurate

**Functionality**:
- ✅ Full text selection
- ✅ All links work
- ✅ Transparency preserved
- ✅ Fully editable
- ✅ Print-ready (standard quality)

### Examples

**Before/After**:
```
Business presentation:
  Original: 35 MB (20 slides, high-res images)
  Optimized: 18 MB (200 DPI, JPEG 85)
  Reduction: 49%
  Quality: Excellent, no visible loss

Annual report:
  Original: 22 MB (60 pages)
  Optimized: 12 MB (balanced optimization)
  Reduction: 45%
  Quality: Professional, client-ready
```

---

## Conservative Preset

**Goal**: Minimal changes, maximum quality
**Target Reduction**: 20%
**Quality Level**: Excellent

### Settings

```json
{
  "targetReduction": 20,
  "imageQuality": 95,
  "imageDPI": {
    "color": 300,
    "grayscale": 300,
    "monochrome": 600
  },
  "fontSubsetting": true,
  "fontDeduplication": true,
  "removeUnusedObjects": false,
  "streamCompression": "safe",
  "linearization": true,
  "objectStreams": false,
  "transparencyFlattening": false,
  "pathSimplification": false,
  "pdfVersion": "1.7"
}
```

### Optimizations Applied

**Images** (minimal changes):
- ✅ Keep 300 DPI (print quality)
- ✅ JPEG quality 95 (near-lossless)
- ❌ No format conversion
- ✅ Preserve all alpha channels
- ✅ Strip only private metadata

**Fonts**:
- ✅ Conservative subsetting (preserve more glyphs)
- ✅ Deduplication only
- ❌ Keep all fonts
- ✅ Preserve all hints

**Structure**:
- ✅ Keep most metadata
- ✅ Minimal compression
- ✅ Safe object optimization
- ❌ No object streams (compatibility)

**Rendering**:
- ❌ No transparency flattening
- ❌ No path simplification
- ❌ No layer changes
- ✅ Minimal pattern optimization

### Use Cases

✅ **Perfect for**:
- High-value client deliverables
- Photography portfolios
- Art/design presentations
- Legal documents (when quality critical)
- Medical imaging
- High-quality print output
- Documents requiring future editing

❌ **Overkill for**:
- Internal documents
- Email attachments
- Quick reviews
- Web-only viewing

### Quality Impact

**Expected perceptual quality**: SSIM 0.98-0.99

**Visual changes**:
- Virtually none
- Indistinguishable from original
- Perfect text clarity
- All effects preserved
- Full color fidelity

**Functionality**:
- ✅ Fully editable
- ✅ All features preserved
- ✅ High-quality print
- ✅ Maximum compatibility
- ✅ Archival quality

### Examples

**Before/After**:
```
Photography portfolio:
  Original: 85 MB (25 pages, 600 DPI images)
  Optimized: 65 MB (300 DPI maintained)
  Reduction: 24%
  Quality: Indistinguishable from original

Legal contract:
  Original: 15 MB (100 pages)
  Optimized: 11 MB (safe optimization)
  Reduction: 27%
  Quality: Perfect, legally compliant
```

---

## Web Preset

**Goal**: Fast web loading, small file size
**Target Reduction**: 65%
**Quality Level**: Good (optimized for screen viewing)

### Settings

```json
{
  "targetReduction": 65,
  "imageQuality": 80,
  "imageDPI": {
    "color": 150,
    "grayscale": 150,
    "monochrome": 300
  },
  "targetLoadingTime": 3000,
  "colorSpace": "RGB",
  "linearization": true,
  "objectStreams": true,
  "transparencyFlattening": true,
  "streamCompression": "maximum"
}
```

### Optimizations Applied

**Images** (web-optimized):
- ✅ Downsample to 150 DPI (perfect for screen)
- ✅ JPEG quality 80 (good for web)
- ✅ Convert to RGB (web standard)
- ✅ Progressive JPEG (gradual loading)
- ✅ Optimize for web rendering

**Loading**:
- ✅ Linearization (Fast Web View) - critical!
- ✅ First page loads in <1s
- ✅ Progressive page loading
- ✅ Optimized page order
- ✅ Aggressive object streams

**Structure**:
- ✅ Maximum compression
- ✅ Remove all metadata
- ✅ Minimize file structure
- ✅ Optimize for browser viewers

**Rendering**:
- ✅ Flatten transparency (faster rendering)
- ✅ Simplify paths (browser performance)
- ✅ Optimize for Chrome/Firefox PDF viewers

### Use Cases

✅ **Perfect for**:
- Website downloads
- Web applications
- Online documentation
- Blog posts
- Email newsletters
- Mobile viewing
- Social media sharing

❌ **Not suitable for**:
- Print output
- High-resolution imagery
- CMYK color workflows

### Performance Targets

**Loading times**:
```
3G (750 Kbps):  < 5s first page
4G (4 Mbps):    < 3s first page
WiFi (10 Mbps): < 1s first page
```

**Rendering**:
- <100ms per page in Chrome
- <150ms per page in Firefox
- <200ms per page on mobile

### Examples

**Before/After**:
```
Product catalog (web):
  Original: 80 MB (100 pages), 3min load on 4G
  Optimized: 15 MB, 30s load on 4G, 2s first page
  Reduction: 81%
  Loading: 93% faster first page
  Quality: Excellent for web viewing

Online manual:
  Original: 25 MB (50 pages)
  Optimized: 6 MB, instant first page
  Reduction: 76%
  Quality: Perfect for screen reading
```

---

## Print Preset

**Goal**: High-quality print output
**Target Reduction**: 25%
**Quality Level**: High (print-ready)

### Settings

```json
{
  "targetReduction": 25,
  "imageQuality": 90,
  "imageDPI": {
    "color": 300,
    "grayscale": 300,
    "monochrome": 600
  },
  "colorSpace": "CMYK",
  "linearization": false,
  "transparencyFlattening": false,
  "streamCompression": "balanced"
}
```

### Optimizations Applied

**Images** (print-optimized):
- ✅ Maintain 300 DPI (standard print resolution)
- ✅ JPEG quality 90 (excellent print quality)
- ✅ Preserve CMYK color space
- ✅ Preserve color profiles
- ❌ No RGB conversion

**Fonts**:
- ✅ Subset fonts (save space)
- ✅ Preserve font metrics (accurate printing)
- ✅ Embed required fonts
- ✅ Maintain hinting for quality

**Structure**:
- ✅ Balanced optimization
- ✅ Preserve print-related metadata
- ✅ Keep color profiles
- ❌ No linearization (not needed for print)

**Rendering**:
- ❌ No transparency flattening (preserve editability)
- ✅ Preserve vector quality
- ✅ Maintain color accuracy

### Use Cases

✅ **Perfect for**:
- Professional printing
- Brochures and catalogs
- Business cards
- Marketing materials
- Photography books
- Magazines
- Posters

### Print Quality

**Resolution**:
- Color images: 300 DPI
- Grayscale: 300 DPI
- Line art: 600 DPI

**Color**:
- CMYK color space
- Color profiles preserved
- Accurate color reproduction

**Output**:
- Professional print quality
- Suitable for offset printing
- Commercial print shops

### Examples

**Before/After**:
```
Product brochure (print):
  Original: 60 MB (24 pages, mixed content)
  Optimized: 42 MB (CMYK, 300 DPI maintained)
  Reduction: 30%
  Quality: Professional print quality

Magazine:
  Original: 120 MB (80 pages)
  Optimized: 85 MB (print-optimized)
  Reduction: 29%
  Quality: Excellent, print-ready
```

---

## Archive Preset

**Goal**: Maximum compatibility, long-term preservation
**Target Reduction**: 15%
**Quality Level**: Excellent (archival quality)

### Settings

```json
{
  "targetReduction": 15,
  "imageQuality": 95,
  "imageDPI": {
    "color": 300,
    "grayscale": 300,
    "monochrome": 600
  },
  "fontSubsetting": false,
  "embedAllFonts": true,
  "pdfACompliance": true,
  "pdfVersion": "1.4",
  "objectStreams": false,
  "linearization": false
}
```

### Optimizations Applied

**Images** (preserve quality):
- ✅ Maintain 300 DPI
- ✅ High quality (95)
- ✅ Lossless when possible
- ✅ Preserve all color information

**Fonts**:
- ❌ No subsetting (full glyphs for future use)
- ✅ Embed all fonts
- ✅ Include standard fonts
- ✅ Preserve all font data

**Structure**:
- ✅ PDF/A-1b compliance
- ✅ PDF 1.4 (universal compatibility)
- ✅ All metadata preserved
- ✅ Self-contained (all resources embedded)
- ❌ No object streams (compatibility)

**Compatibility**:
- ✅ Opens in any PDF reader
- ✅ Future-proof
- ✅ Archival standards compliant

### Use Cases

✅ **Perfect for**:
- Legal documents (long-term storage)
- Historical records
- Government documents
- Medical records
- Academic research
- Corporate records
- Library archives

### PDF/A Compliance

**PDF/A-1b requirements**:
- ✅ All fonts embedded
- ✅ All colors device-independent
- ✅ No encryption
- ✅ No external references
- ✅ Metadata included
- ✅ PDF 1.4 base

**Benefits**:
- Guaranteed long-term readability
- No external dependencies
- Standardized preservation
- Legal compliance

### Examples

**Before/After**:
```
Legal contract (archive):
  Original: 10 MB (50 pages)
  Optimized: 8.2 MB (PDF/A compliant)
  Reduction: 18%
  Quality: Archival, legally compliant
  Compatibility: Universal

Historical documents:
  Original: 45 MB (200 pages, scanned)
  Optimized: 36 MB (PDF/A-1b)
  Reduction: 20%
  Quality: Perfect preservation
```

---

## Preset Comparison

### File Size Reduction

```
Preset          Typical Reduction    Best Case    Worst Case
────────────────────────────────────────────────────────────
Aggressive      60%                  75%          45%
Web             65%                  80%          50%
Balanced        40%                  55%          30%
Print           25%                  35%          18%
Conservative    20%                  30%          15%
Archive         15%                  22%          10%
```

### Quality Comparison

```
Preset          SSIM Score    Print Quality    Web Quality
──────────────────────────────────────────────────────────
Aggressive      0.90-0.92     Fair             Good
Web             0.92-0.94     Poor             Excellent
Balanced        0.94-0.96     Good             Excellent
Print           0.96-0.97     Excellent        Good
Conservative    0.98-0.99     Excellent        Excellent
Archive         0.98-0.99     Excellent        Excellent
```

### Feature Comparison

| Feature | Aggressive | Balanced | Conservative | Web | Print | Archive |
|---------|------------|----------|--------------|-----|-------|---------|
| Image DPI | 150 | 200 | 300 | 150 | 300 | 300 |
| JPEG Quality | 75 | 85 | 95 | 80 | 90 | 95 |
| Font Subsetting | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Transparency Flatten | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Linearization | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Object Streams | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| PDF/A Compliance | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Max Compatibility | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ |

---

## Choosing the Right Preset

### Decision Tree

```
1. What is the PRIMARY use case?

   ├─ Web viewing
   │  └─ Use: web
   │
   ├─ Print output
   │  └─ Use: print
   │
   ├─ Long-term archive
   │  └─ Use: archive
   │
   └─ General/mixed use
       └─ Continue to step 2

2. What is more important?

   ├─ File size (need small files)
   │  └─ Use: aggressive
   │
   ├─ Quality (need excellent quality)
   │  └─ Use: conservative
   │
   └─ Balance both
       └─ Use: balanced (RECOMMENDED)
```

### By Document Type

**Marketing Materials**:
- Brochure (web): `web`
- Brochure (print): `print`
- Flyer (email): `aggressive`
- Catalog (online): `web`
- Catalog (print): `print`

**Business Documents**:
- Presentation: `balanced`
- Report: `balanced`
- Proposal: `balanced` or `conservative`
- Internal doc: `aggressive` or `balanced`

**Legal/Official**:
- Contract: `conservative`
- Archive: `archive`
- Government: `archive`

**Technical**:
- Manual (web): `web`
- Manual (print): `print`
- Documentation: `balanced`

**Creative**:
- Portfolio: `conservative`
- Photography: `conservative` or `print`
- Design work: `conservative`

### By File Size Constraints

**Email limits**:
- <5 MB: Use `aggressive` or `web`
- <10 MB: Use `balanced`
- <25 MB: Use `conservative`

**Storage constraints**:
- Limited storage: Use `aggressive`
- Moderate storage: Use `balanced`
- Ample storage: Use `conservative`

**Bandwidth constraints**:
- Mobile/3G: Use `aggressive` or `web`
- 4G: Use `web` or `balanced`
- WiFi/LAN: Use `balanced` or `conservative`

---

## Customizing Presets

### Via Command Line

```bash
# Use preset directly
node scripts/optimize-performance.js document.pdf --preset balanced

# With custom output
node scripts/optimize-performance.js document.pdf --preset web --output web-ready.pdf
```

### Via Configuration

Edit `config/performance-config.json`:

```json
{
  "optimizationPresets": {
    "myCustomPreset": {
      "description": "Custom optimization for my use case",
      "targetReduction": 50,
      "imageQuality": 88,
      "imageDPI": {
        "color": 180,
        "grayscale": 180,
        "monochrome": 360
      },
      "fontSubsetting": true,
      "streamCompression": "balanced",
      "linearization": true
    }
  }
}
```

Then use:
```bash
node scripts/optimize-performance.js document.pdf --preset myCustomPreset
```

---

## Best Practices

### DO:
✅ Start with `balanced` for most documents
✅ Use `web` for online content
✅ Use `print` for professional printing
✅ Use `archive` for long-term storage
✅ Test output before committing
✅ Keep original files as backup

### DON'T:
❌ Use `aggressive` for print
❌ Use `print` for web-only content
❌ Use `web` for archival
❌ Over-optimize (balance quality vs size)
❌ Use same preset for all documents

### Testing Checklist

After optimization:
- [ ] File size meets requirements
- [ ] Visual quality acceptable
- [ ] Text readable and selectable
- [ ] Links functional
- [ ] Opens in target readers
- [ ] Prints correctly (if needed)
- [ ] Loading time acceptable
- [ ] Compatibility verified

---

**Version**: 1.0.0
**Last Updated**: 2025-11-06
**Presets Available**: 6 (aggressive, balanced, conservative, web, print, archive)
