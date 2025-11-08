# Example Data Files

This directory contains example JSON data files for the World-Class PDF CLI.

---

## Available Examples

### 1. Partnership Documents

**File**: `partnership-aws-example.json`

**Use for**: Executive partnership proposals (AWS, Google, Cornell, etc.)

**Structure**:
- Title, subtitle, organization
- Partner information
- Partnership overview (mission, value prop, impact)
- Programs (3-5 programs with metrics)
- Impact metrics (students, countries, certifications)
- Call to action (contact info)

**Command**:
```bash
npm run create-world-class -- --type partnership --data data/partnership-aws-example.json
```

---

### 2. Program Reports

**File**: `program-together-ukraine-example.json`

**Use for**: Program impact reports (Together for Ukraine, other initiatives)

**Structure**:
- Title, subtitle, organization
- Program name and summary
- Impact metrics
- Student stories (2-3 testimonials)
- Program details (4-6 programs)
- Data visualization (enrollment, subjects)

**Command**:
```bash
python world_class_cli.py --type program --data data/program-together-ukraine-example.json
```

---

### 3. Annual Reports

**File**: `report-annual-example.json`

**Use for**: Annual/quarterly reports, board presentations

**Structure**:
- Title, subtitle, fiscal year
- Executive summary (overview, highlights, CEO message)
- Financials (revenue, expenses, efficiency)
- Achievements (programs, partnerships, metrics)
- Future outlook (2025 goals, fundraising target)
- Board of directors

**Command**:
```bash
npm run create-world-class -- --type report --data data/report-annual-example.json
```

---

## Required Fields (All Documents)

**Minimum:**
```json
{
  "title": "Document Title",
  "organization": "The Educational Equality Institute"
}
```

**Recommended:**
```json
{
  "title": "Document Title",
  "subtitle": "Optional Subtitle",
  "organization": "The Educational Equality Institute",
  "brand": {
    "use_teei_colors": true,
    "primary_color": "nordshore",
    "accent_color": "sky"
  }
}
```

---

## Customizing Examples

### 1. Copy Example

```bash
# Copy partnership example
cp data/partnership-aws-example.json data/my-partnership.json

# Copy program report example
cp data/program-together-ukraine-example.json data/my-program.json

# Copy annual report example
cp data/report-annual-example.json data/my-annual-report.json
```

### 2. Edit Your Copy

```bash
# Edit with your preferred editor
vim data/my-partnership.json
code data/my-partnership.json
nano data/my-partnership.json
```

### 3. Update Key Fields

**Partnership Documents:**
- `partner` - Your partner organization name
- `programs` - Your specific programs and metrics
- `metrics` - Your actual impact numbers
- `call_to_action.contact` - Your contact information

**Program Reports:**
- `program_name` - Your program name
- `impact` - Your impact metrics
- `stories` - Your student testimonials
- `programs` - Your program details

**Annual Reports:**
- `fiscal_year` - Your reporting year
- `financials` - Your financial data
- `achievements` - Your accomplishments
- `future` - Your 2025 goals

---

## Brand Customization

All examples include a `brand` section:

```json
{
  "brand": {
    "use_teei_colors": true,
    "primary_color": "nordshore",
    "accent_color": "sky",
    "warm_backgrounds": true,
    "photography_style": "warm_authentic"
  }
}
```

**Available TEEI colors:**
- `nordshore` - Deep teal #00393F (primary)
- `sky` - Light blue #C9E4EC (accent)
- `sand` - Warm beige #FFF1E2 (background)
- `beige` - Soft neutral #EFE1DC (background)
- `moss` - Natural green #65873B (accent)
- `gold` - Warm metallic #BA8F5A (premium)
- `clay` - Rich terracotta #913B2F (warm)

---

## JSON Validation

Validate your JSON before running CLI:

```bash
# Check if valid JSON
cat data/my-file.json | jq .

# Check required fields exist
cat data/my-file.json | jq '.title, .organization'

# Pretty print
cat data/my-file.json | jq . > data/my-file-formatted.json
```

---

## Tips

### Metrics Format

Use actual numbers (not "XX" placeholders):

```json
{
  "metrics": {
    "students_reached": 50000,        // ✅ GOOD
    "countries": 12,                  // ✅ GOOD
    "certifications": "XX"            // ❌ BAD - will show as "XX"
  }
}
```

### Text Cutoffs

Keep text concise to avoid cutoffs:

```json
{
  "title": "AWS Partnership Proposal",                              // ✅ GOOD (short, clear)
  "title": "The Educational Equality Institute Partnership..."      // ❌ BAD (too long, will cut off)
}
```

### Contact Information

Always include complete contact info:

```json
{
  "call_to_action": {
    "contact": {
      "name": "Henrik Røine",
      "email": "hello@teei.global",
      "phone": "+1 (555) 123-4567"
    }
  }
}
```

---

## Creating New Data Files

### From Scratch

```json
{
  "title": "Your Document Title",
  "subtitle": "Your Subtitle",
  "organization": "The Educational Equality Institute",

  "overview": {
    "mission": "Your mission statement",
    "value_proposition": "Why partner with TEEI",
    "impact": "Expected impact"
  },

  "programs": [
    {
      "name": "Program Name",
      "description": "Program description",
      "students_reached": 5000,
      "success_rate": "90%"
    }
  ],

  "metrics": {
    "students_reached": 10000,
    "countries": 5
  },

  "brand": {
    "use_teei_colors": true,
    "primary_color": "nordshore"
  }
}
```

### From Template

Use the example files as templates - they include all possible fields.

---

## Next Steps

1. **Copy an example**: `cp data/partnership-aws-example.json data/my-file.json`
2. **Edit with your data**: `vim data/my-file.json`
3. **Validate JSON**: `cat data/my-file.json | jq .`
4. **Run CLI**: `npm run create-world-class -- --type partnership --data data/my-file.json`
5. **Review output**: `open exports/*.pdf`

---

**Need help?** Check the full CLI documentation: `/home/user/pdf-orchestrator/WORLD-CLASS-CLI-README.md`
