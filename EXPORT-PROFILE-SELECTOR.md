# Export Profile Selector

**Quick guide to choosing the right export profile**

---

## Decision Tree

```
┌────────────────────────────────────────────────────┐
│   What will you do with this PDF?                 │
└───────────────────┬────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
    PRINT IT             USE IT DIGITALLY
        │                       │
        ▼                       ▼
   ┌─────────┐          ┌──────────────────┐
   │ Where?  │          │  What purpose?   │
   └────┬────┘          └────────┬─────────┘
        │                        │
        ▼                        ▼
                    ┌────────────┼──────────────────┐
                    │            │                  │
              STAKEHOLDER   WEBSITE/EMAIL    INTERNAL TEAM
                FACING                            │
                    │            │                  │
                    ▼            ▼                  ▼
            ┌───────────────────────────────────────────┐
            │                                           │
    ┌───────┴────────┐  ┌──────────┐  ┌──────────────┐ │
    │ Accessible?    │  │ Website? │  │ Quick review?│ │
    │ (Gov/Edu)      │  │          │  │              │ │
    └───────┬────────┘  └────┬─────┘  └──────┬───────┘ │
            │                 │                 │        │
            ▼                 ▼                 ▼        ▼
```

### Print Production → **print_production**
Commercial printing, magazines, brochures
- PDF/X-4:2010, CMYK, 300 DPI, 3mm bleed

### Stakeholder Presentations → **partnership_presentation**
Partnership proposals, executive briefings
- High-quality digital, sRGB, 150 DPI

### Website/Email Marketing → **digital_marketing** or **web_optimized**
Social media, email campaigns, website downloads
- Web-optimized, sRGB, 96 DPI, small file size

### Accessible Documents → **accessibility_first**
Government documents, educational materials
- PDF/UA, WCAG 2.1 AA, tagged, alt text

### Quick Review → **draft_review**
Internal feedback, work-in-progress
- Fast preview, 72 DPI, auto-open

### Long-term Storage → **archive_preservation**
Legal documents, historical records
- PDF/A-2, 300 DPI, full embedding

---

## Choose by Use Case

### Commercial Printing
**Profile:** `print_production`
```python
optimizer.export_document("brochure.pdf", purpose="print_production")
```
- PDF/X-4:2010 compliant
- CMYK color (ISO Coated v2)
- 300 DPI resolution
- 3mm bleed all sides
- Crop marks, registration marks, color bars

**Perfect for:**
- Magazine printing
- Brochure production
- Marketing materials
- Professional print shops

---

### Partnership Presentations
**Profile:** `partnership_presentation`
```python
optimizer.export_document("TEEI_AWS.pdf", purpose="partnership_presentation")
```
- High-quality digital (sRGB)
- 150 DPI resolution
- Web-optimized
- Balanced file size (5-10 MB)

**Perfect for:**
- AWS partnership proposals
- Google/Cornell presentations
- Executive briefings
- Client deliverables

---

### Email Campaigns
**Profile:** `digital_marketing`
```python
optimizer.export_document("newsletter.pdf", purpose="digital_marketing")
```
- Web-optimized (sRGB)
- 96 DPI resolution
- Small file size (2-5 MB)
- Fast loading

**Perfect for:**
- Email attachments
- Social media shares
- Quick promotional materials

---

### Website Embedding
**Profile:** `web_optimized`
```python
optimizer.export_document("docs.pdf", purpose="web_optimized")
```
- Linearized (page-at-a-time)
- 96 DPI resolution
- Small file size (2-3 MB)
- Fast web view

**Perfect for:**
- Website documentation
- Online resources
- Mobile-friendly viewing

---

### Educational Materials
**Profile:** `accessibility_first`
```python
optimizer.export_document("course.pdf", purpose="accessibility_first")
```
- PDF/UA-1 compliant
- WCAG 2.1 AA compliant
- Tagged PDF with structure
- Alt text for images
- Screen reader friendly

**Perfect for:**
- Course materials
- Government documents (Section 508)
- Public-facing documents
- Inclusive design requirements

---

### Internal Review
**Profile:** `draft_review`
```python
optimizer.export_document("draft.pdf", purpose="draft_review")
```
- Fast preview (72 DPI)
- Auto-open after export
- Minimal file size (1-2 MB)

**Perfect for:**
- Quick stakeholder feedback
- Work-in-progress sharing
- Iteration cycles

---

### Legal Archives
**Profile:** `archive_preservation`
```python
optimizer.export_document("contract.pdf", purpose="archive_preservation")
```
- PDF/A-2b compliant
- 300 DPI resolution
- Full font embedding
- XMP metadata

**Perfect for:**
- Long-term storage
- Legal compliance
- Historical records

---

## Choose by File Size

### Smallest Files (1-3 MB)
- **draft_review** - 72 DPI, minimal compression
- **web_optimized** - 96 DPI, linearized
- **digital_marketing** - 96 DPI, web-optimized

### Medium Files (5-10 MB)
- **partnership_presentation** - 150 DPI, balanced quality
- **accessibility_first** - 150 DPI, tagged PDF

### Largest Files (15-30 MB)
- **print_production** - 300 DPI, maximum quality
- **archive_preservation** - 300 DPI, full embedding

---

## Choose by Quality

### Maximum Quality
- **print_production** - PDF/X-4, 300 DPI, CMYK
- **archive_preservation** - PDF/A-2, 300 DPI, full fonts

### High Quality
- **partnership_presentation** - 150 DPI, sRGB
- **accessibility_first** - 150 DPI, tagged

### Medium Quality
- **digital_marketing** - 96 DPI, web-optimized
- **web_optimized** - 96 DPI, linearized
- **draft_review** - 72 DPI, fast preview

---

## Choose by Standard

### PDF/X (Print Production)
- **print_production** → PDF/X-4:2010

### PDF/UA (Accessibility)
- **accessibility_first** → PDF/UA-1

### PDF/A (Archival)
- **archive_preservation** → PDF/A-2b

### Standard PDF (Digital Use)
- **partnership_presentation** → Standard
- **digital_marketing** → Standard
- **web_optimized** → Standard
- **draft_review** → Standard

---

## Quick Reference Table

| If you need... | Use this profile | Why? |
|---------------|------------------|------|
| Commercial printing | `print_production` | PDF/X-4, CMYK, 300 DPI, bleed |
| Stakeholder presentation | `partnership_presentation` | High-quality digital, balanced size |
| Email attachment | `digital_marketing` | Small file, fast loading |
| Website PDF | `web_optimized` | Linearized, mobile-friendly |
| Accessible document | `accessibility_first` | PDF/UA, WCAG 2.1 AA |
| Quick review | `draft_review` | Fast, auto-open |
| Long-term storage | `archive_preservation` | PDF/A-2, full embedding |

---

## Auto-Detection Keywords

The Export Optimizer can auto-detect purpose from filename:

| Keyword in Filename | Detected Purpose |
|-------------------|------------------|
| `print`, `production`, `cmyk` | print_production |
| `web`, `online`, `website` | web_optimized |
| `draft`, `review`, `wip` | draft_review |
| `archive`, `preservation` | archive_preservation |
| `accessible`, `wcag`, `ada` | accessibility_first |
| `marketing`, `campaign` | digital_marketing |
| `partnership`, `presentation` | partnership_presentation |

---

## Common Scenarios

### Scenario 1: TEEI AWS Partnership Document

**Need:** High-quality digital presentation for AWS stakeholders

**Profile:** `partnership_presentation`
```python
optimizer.export_document(
    "exports/TEEI_AWS_Partnership_v2.pdf",
    purpose="partnership_presentation"
)
```

**Result:**
- sRGB color (perfect for screens)
- 150 DPI (optimal for digital viewing)
- Web-optimized
- ~5-10 MB file size

---

### Scenario 2: TEEI Brochure for Print Shop

**Need:** Print-ready PDF for commercial offset printing

**Profile:** `print_production`
```python
optimizer.export_document(
    "exports/TEEI_Brochure_PRINT.pdf",
    purpose="print_production"
)
```

**Result:**
- PDF/X-4:2010 compliant
- CMYK color (ISO Coated v2)
- 300 DPI resolution
- 3mm bleed, crop marks

---

### Scenario 3: TEEI Newsletter for Email

**Need:** Small PDF for email newsletter attachment

**Profile:** `digital_marketing`
```python
optimizer.export_document(
    "exports/TEEI_Newsletter_Jan2025.pdf",
    purpose="digital_marketing"
)
```

**Result:**
- sRGB color
- 96 DPI
- ~2-3 MB file size
- Fast email delivery

---

### Scenario 4: TEEI Course Materials (Accessible)

**Need:** Accessible educational materials for students

**Profile:** `accessibility_first`
```python
optimizer.export_document(
    "exports/TEEI_Course_Materials.pdf",
    purpose="accessibility_first"
)
```

**Result:**
- PDF/UA-1 compliant
- WCAG 2.1 AA
- Tagged PDF
- Screen reader friendly

---

### Scenario 5: Quick Internal Review

**Need:** Fast preview for stakeholder feedback

**Profile:** `draft_review`
```python
optimizer.export_document(
    "exports/TEEI_Draft_v3.pdf",
    purpose="draft_review"
)
```

**Result:**
- 72 DPI (fast generation)
- ~1 MB file size
- Auto-opens for review

---

## Still Not Sure?

### Use the Default

If you're not sure which profile to use, **partnership_presentation** is the best default:
- High-quality digital
- Balanced file size
- Web-optimized
- Works for most use cases

```python
# Just use the default
optimizer.export_document("document.pdf")
# Automatically uses partnership_presentation
```

### Export Multiple Versions

When in doubt, export multiple versions and compare:

```python
purposes = ["print_production", "partnership_presentation", "web_optimized"]

for purpose in purposes:
    optimizer.export_document(f"exports/doc_{purpose}.pdf", purpose=purpose)

# Compare file sizes and quality
# Choose the best version for each distribution channel
```

---

## Need Help?

1. **Read Quick Start**: `/EXPORT-OPTIMIZER-QUICK-START.md`
2. **Review Examples**: `/example-jobs/export-optimizer-examples.py`
3. **Check Complete Guide**: `/docs/EXPORT-OPTIMIZER-GUIDE.md`
4. **List All Profiles**: `python export_optimizer.py --list-profiles`
5. **Get Profile Info**: `python export_optimizer.py --profile-info print_production`

---

**Perfect PDFs, Zero Manual Settings**

Export Optimizer v1.0.0 | TEEI PDF Orchestrator
