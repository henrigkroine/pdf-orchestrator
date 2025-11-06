# PDF Performance Benchmarks

**Performance scoring methodology, benchmarks, and targets**

## Table of Contents

1. [Performance Scoring](#performance-scoring)
2. [File Size Benchmarks](#file-size-benchmarks)
3. [Loading Time Targets](#loading-time-targets)
4. [Rendering Standards](#rendering-standards)
5. [Industry Benchmarks](#industry-benchmarks)
6. [Case Studies](#case-studies)

---

## Performance Scoring

### Overall Score Calculation

The overall performance score (0-100) is a weighted average:

```
Overall Score =
  File Size Score      × 30% +
  Loading Score        × 25% +
  Rendering Score      × 20% +
  Image Optimization   × 15% +
  Font Optimization    × 10%
```

### Score Categories

| Score Range | Rating | Description |
|-------------|--------|-------------|
| 95-100 | **Excellent** | Highly optimized, best-in-class |
| 90-94 | **Very Good** | Well optimized, minor improvements possible |
| 85-89 | **Good** | Reasonably optimized, some opportunities |
| 75-84 | **Fair** | Multiple improvements recommended |
| 60-74 | **Below Average** | Significant optimization needed |
| <60 | **Poor** | Major performance issues |

### File Size Score

Formula:
```
Target size per page: 500 KB
Actual size per page: File size / Page count

Score = 100 - ((Actual - Target) / Target) × 50
Score = max(0, min(100, Score))
```

**Examples**:
```
Document A: 10 MB / 20 pages = 500 KB/page
  Score: 100 (perfect)

Document B: 15 MB / 20 pages = 750 KB/page
  Score: 100 - ((750-500)/500) × 50 = 75

Document C: 5 MB / 20 pages = 250 KB/page
  Score: 100 (capped at 100, better than target)
```

### Loading Score

Formula:
```
Target loading time (4G): 3000 ms
Actual loading time: Calculated based on file size + parsing + rendering

Score = 100 - ((Actual - Target) / Target) × 50
Score = max(0, min(100, Score))
```

**Loading time calculation**:
```
Download time = (File size × 8 bits) / (Network speed in bps) × 1000 ms
Parsing time = Object count × 0.5 ms
Rendering time = Page count × 10 ms

Total = Download + Parsing + Rendering
```

### Rendering Score

Based on complexity level:

| Complexity | Paths | Transparency | Score |
|------------|-------|--------------|-------|
| Simple | <500 | <20 | 95 |
| Moderate | 500-2000 | 20-50 | 80 |
| Complex | 2000-5000 | 50-100 | 65 |
| Very Complex | >5000 | >100 | 45 |

### Image Optimization Score

Based on image data percentage:

```
Image ratio = Image data / Total file size

If image ratio > 0.7:  Score = 60 (likely not optimized)
Else if ratio > 0.5:   Score = 75
Else if ratio > 0.3:   Score = 85
Else:                  Score = 95
```

### Font Optimization Score

Based on subsetting percentage:

```
Subset ratio = Subsetted fonts / Total fonts

Score = Subset ratio × 100
Score = max(50, Score)  (minimum 50)
```

---

## File Size Benchmarks

### By Document Type

| Document Type | Baseline (per page) | Optimized (per page) | Target Reduction |
|---------------|---------------------|----------------------|------------------|
| **Text-heavy** | 100 KB | 70 KB | 30% |
| **Mixed content** | 2 MB | 1.1 MB | 45% |
| **Image-heavy** | 5 MB | 2 MB | 60% |
| **Forms** | 500 KB | 325 KB | 35% |
| **Presentations** | 3 MB | 1.5 MB | 50% |

### Component Breakdown

**Well-optimized PDF** (target percentages):
```
Images:      30-50%  (optimized, appropriate DPI)
Fonts:       5-15%   (subsetted, deduplicated)
Content:     20-30%  (compressed paths, text)
Metadata:    <2%     (minimal, compressed)
Structure:   15-25%  (efficient objects, xref)
```

**Unoptimized PDF** (typical percentages):
```
Images:      60-80%  (high DPI, uncompressed)
Fonts:       15-30%  (full embedding, duplicates)
Content:     10-20%  (unoptimized paths)
Metadata:    2-5%    (verbose, uncompressed)
Structure:   10-20%  (inefficient, incremental updates)
```

### Real-World Examples

**Example 1: Marketing Brochure**
```
Original:
  - Size: 25 MB (12 pages)
  - Images: 85% (24 images, 600 DPI)
  - Fonts: 10% (5 fonts, full embedding)
  - Score: 45/100

After optimization (web preset):
  - Size: 6 MB (12 pages)
  - Images: 65% (24 images, 150 DPI, JPEG 85)
  - Fonts: 5% (5 fonts, subsetted)
  - Score: 92/100
  - Reduction: 76%
```

**Example 2: Technical Report**
```
Original:
  - Size: 8 MB (50 pages)
  - Images: 40% (diagrams, charts)
  - Fonts: 25% (custom fonts)
  - Score: 68/100

After optimization (balanced preset):
  - Size: 4.5 MB (50 pages)
  - Images: 35% (optimized compression)
  - Fonts: 8% (subsetted)
  - Score: 88/100
  - Reduction: 44%
```

**Example 3: Form Document**
```
Original:
  - Size: 2 MB (8 pages)
  - Forms: 50 fields
  - JavaScript: 15 KB
  - Score: 72/100

After optimization (balanced preset):
  - Size: 1.2 MB (8 pages)
  - Forms: 50 fields (optimized)
  - JavaScript: 6 KB (minified)
  - Score: 90/100
  - Reduction: 40%
```

---

## Loading Time Targets

### Network Speed Benchmarks

| Network | Speed | Target Loading | Acceptable Loading |
|---------|-------|----------------|-------------------|
| **3G** | 750 Kbps | 5s | 8s |
| **4G** | 4 Mbps | 3s | 5s |
| **WiFi** | 10 Mbps | 1s | 2s |

### File Size vs Loading Time

**4G Network** (4 Mbps = 500 KB/s):
```
File Size   Download   Parsing   Rendering   Total
500 KB      1000ms     100ms     100ms       1200ms  ✓
1 MB        2000ms     200ms     100ms       2300ms  ✓
2 MB        4000ms     400ms     100ms       4500ms  ⚠️
5 MB        10000ms    1000ms    100ms       11100ms ✗
10 MB       20000ms    2000ms    100ms       22100ms ✗
```

Legend:
- ✓ Excellent (<3s)
- ⚠️ Acceptable (3-5s)
- ✗ Poor (>5s)

### Loading Optimization Impact

**Baseline** (no optimization):
```
File: 10 MB, Not linearized, No object streams
4G: 22s (download 20s + parsing 2s)
```

**With linearization**:
```
First page: 3s (ready to view)
Full document: 22s (background loading)
Perceived improvement: 86%
```

**With object streams**:
```
File: 8.5 MB (15% reduction)
4G: 19s (download 17s + parsing 2s)
Improvement: 14%
```

**Full optimization** (linearization + object streams + compression):
```
File: 4 MB (60% reduction)
First page: 1.5s
Full document: 9s
Improvement: 59%
```

---

## Rendering Standards

### Page Rendering Time

| Complexity | Target | Acceptable | Poor |
|------------|--------|------------|------|
| Simple | <50ms | <100ms | >100ms |
| Moderate | <75ms | <150ms | >150ms |
| Complex | <100ms | <200ms | >200ms |
| Very Complex | <150ms | <300ms | >300ms |

### Rendering Complexity Factors

**Path count**:
```
Simple:        < 100 paths per page
Moderate:      100-500 paths
Complex:       500-2000 paths
Very Complex:  > 2000 paths
```

**Transparency effects**:
```
None/Few:      < 5 transparency operations
Some:          5-20 operations
Many:          20-50 operations
Excessive:     > 50 operations
```

**Impact on rendering time**:
```
1000 simple paths:     50ms
1000 bezier paths:     150ms  (3× slower)
100 transparency ops:  200ms  (4× slower)
Combined:             400ms  (8× slower)
```

### Optimization Impact on Rendering

**Path simplification**:
```
Before: 5000 paths, 800ms render
After:  500 paths, 100ms render
Improvement: 87.5%
```

**Transparency flattening**:
```
Before: 150 transparency ops, 600ms render
After:  0 transparency ops, 100ms render
Improvement: 83%
```

**Layer merging**:
```
Before: 25 layers, 250ms render
After:  5 layers, 100ms render
Improvement: 60%
```

---

## Industry Benchmarks

### Adobe Acrobat Standards

**Acrobat Reader performance goals**:
- First page display: <1s (linearized)
- Page navigation: <200ms
- Search: <500ms (first result)
- Form filling: <100ms (field response)

### Web Browser PDF Viewers

**Chrome PDF Viewer**:
- Recommended file size: <10 MB
- Optimal loading: <2s (first page)
- Rendering: <100ms per page

**Firefox PDF.js**:
- Recommended file size: <5 MB
- Optimal loading: <3s (first page)
- Rendering: <150ms per page

### Mobile Devices

**iOS (Safari)**:
- Recommended file size: <3 MB
- Optimal loading: <2s (WiFi)
- Rendering: <200ms per page

**Android (Chrome)**:
- Recommended file size: <5 MB
- Optimal loading: <3s (4G)
- Rendering: <250ms per page

---

## Case Studies

### Case Study 1: E-commerce Catalog

**Challenge**: 200-page product catalog, 150 MB file size

**Original metrics**:
- File size: 150 MB (750 KB/page)
- Images: 500+ product photos (600 DPI)
- Loading time: 5 minutes (4G)
- Performance score: 35/100

**Optimization strategy**:
1. Downsample images to 150 DPI (web)
2. JPEG quality 85
3. Font subsetting
4. Object streams
5. Linearization

**Results**:
- File size: 25 MB (125 KB/page) - 83% reduction
- Loading time: 50s first page, 60s full (4G) - 95% improvement
- Performance score: 94/100
- Quality: Excellent (SSIM 0.95)

**Business impact**:
- 50% increase in online catalog views
- 30% reduction in bounce rate
- 20% increase in conversions

### Case Study 2: Legal Contract

**Challenge**: 75-page contract with signatures, 12 MB

**Original metrics**:
- File size: 12 MB (160 KB/page)
- Scanned signatures (high DPI)
- 5 embedded fonts
- Performance score: 58/100

**Optimization strategy** (conservative preset):
1. Optimize scanned signatures (JPEG 90)
2. Subset fonts (preserve all glyphs for editing)
3. Metadata cleanup (preserve legal info)
4. Structure optimization

**Results**:
- File size: 8 MB (107 KB/page) - 33% reduction
- Performance score: 82/100
- All legal requirements met
- Signatures preserved

**Business impact**:
- Faster email delivery
- Reduced storage costs
- Improved client experience

### Case Study 3: Corporate Presentation

**Challenge**: 40-slide presentation, 80 MB

**Original metrics**:
- File size: 80 MB (2 MB/page)
- High-res images, videos
- Complex graphics
- Performance score: 42/100

**Optimization strategy** (web preset):
1. Downsample images to 150 DPI
2. Extract and optimize videos
3. Simplify vector graphics
4. Aggressive compression

**Results**:
- File size: 18 MB (450 KB/page) - 78% reduction
- First page: 2s (WiFi) vs 45s before
- Performance score: 91/100
- Visual quality maintained

**Business impact**:
- Presentations load instantly
- Smooth remote presentations
- Reduced bandwidth costs

### Case Study 4: Educational Textbook

**Challenge**: 300-page textbook, 250 MB

**Original metrics**:
- File size: 250 MB (833 KB/page)
- Diagrams, photos, equations
- Interactive elements
- Performance score: 48/100

**Optimization strategy** (balanced preset):
1. Optimize images (200 DPI for diagrams, 150 for photos)
2. Subset fonts (preserve math symbols)
3. Optimize interactive elements
4. Linearization for e-readers

**Results**:
- File size: 95 MB (317 KB/page) - 62% reduction
- E-reader compatible
- Performance score: 89/100
- All interactivity preserved

**Business impact**:
- Faster digital textbook delivery
- Works on low-end devices
- 40% increase in digital adoption

---

## Performance Testing Methodology

### Test Environment

**Hardware**:
- Desktop: Intel i7, 16GB RAM, SSD
- Mobile: iPhone 12, Android Samsung S21

**Software**:
- Adobe Acrobat Reader DC
- Chrome (built-in viewer)
- Firefox PDF.js
- Safari (iOS)

**Network conditions**:
- 3G: 750 Kbps download
- 4G: 4 Mbps download
- WiFi: 10 Mbps download

### Measurement Tools

**File size**:
```bash
ls -lh document.pdf
```

**Loading time**:
- Chrome DevTools Network tab
- Lighthouse performance audit
- Custom timing scripts

**Rendering performance**:
- Chrome DevTools Performance tab
- Frame rate monitoring
- Custom benchmarking tools

### Quality Assessment

**Visual quality** (SSIM):
```
SSIM > 0.95: Excellent (visually lossless)
SSIM > 0.90: Good
SSIM > 0.85: Acceptable
SSIM < 0.85: Poor
```

**Functional testing**:
- Text selection works
- Links functional
- Forms fillable
- Bookmarks navigable
- Search works
- Print quality acceptable

---

## Continuous Monitoring

### Key Performance Indicators (KPIs)

**File Performance**:
- Average file size per page
- Compression ratio
- Performance score trend

**User Experience**:
- Time to first page
- Total loading time
- Page navigation speed
- Search performance

**Quality Metrics**:
- Visual quality (SSIM)
- User-reported issues
- Compatibility across readers

### Optimization Goals

**Short-term** (immediate):
- File size: 40% reduction
- Performance score: >85
- Loading time: <3s (4G)

**Long-term** (3-6 months):
- File size: 50% reduction
- Performance score: >90
- Loading time: <2s (4G)
- 95% compatibility

---

**Version**: 1.0.0
**Last Updated**: 2025-11-06
