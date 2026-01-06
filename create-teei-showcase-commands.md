# TEEI Partnership Showcase - InDesign MCP Commands

## Prerequisites
1. ✅ Claude Code restarted (61 InDesign tools loaded)
2. ✅ Adobe InDesign running
3. ✅ UXP plugin loaded via Adobe UXP Developer Tool
4. ✅ Test commands work (see `test-after-restart.md`)

---

## Commands to Paste to Claude Code

Copy/paste these commands to Claude Code after restart:

```
Create a professional TEEI Partnership Showcase PDF using InDesign MCP with these specifications:

DOCUMENT SETUP:
- Create new document: 595pt × 842pt (A4)
- Margins: 72pt (1 inch) all sides
- Color mode: CMYK

HEADER (Page 1):
- Gradient box: X=0, Y=0, Width=595, Height=180
  - Start color: #00393F (TEEI Blue)
  - End color: #009688 (TEEI Green)
  - Gradient angle: 90° (top to bottom)

TITLE (Curved on Path):
- Text: "🌟 TEEI AI-Powered Education Revolution 2025"
- Create circular path: Center X=297.5, Y=100, Radius=120
- Font: Arial Bold, 28pt
- Color: White (#FFFFFF)
- Curve text along path (top arc)

SUBTITLE:
- Text: "World-Class Partnership Showcase Document"
- Position: X=72, Y=200
- Font: Arial Regular, 18pt
- Color: TEEI Blue (#00393F)
- Alignment: Center

CONTENT SECTION:
Use this content array (31 blocks):
[
  "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform.",
  "",
  "Revolutionary AI Platform Features:",
  "• Adaptive learning pathways personalized for each student",
  "• Real-time progress tracking and intervention alerts",
  "• Multi-language support (25+ languages)",
  "• Accessibility features for diverse learning needs",
  "• Teacher dashboard with actionable insights",
  "",
  "Proven Impact:",
  "• 85% improvement in student engagement",
  "• 92% teacher satisfaction rate",
  "• 78% reduction in learning gaps",
  "• 10x cost savings vs. traditional methods",
  "",
  "Strategic Partnership Benefits:",
  "",
  "🤝 Technology Leadership",
  "Partner with a proven EdTech innovator transforming education at scale",
  "",
  "🌍 Global Reach",
  "Access to established networks in 12 countries across 3 continents",
  "",
  "💡 Innovation Pipeline",
  "Collaborate on cutting-edge AI/ML educational research",
  "",
  "📊 Data Excellence",
  "Leverage world-class learning analytics and outcomes measurement",
  "",
  "Contact: Henrik Røine | CEO & Founder",
  "Email: henrik@theeducationalequalityinstitute.org",
  "Web: www.educationalequality.institute"
]

For each content block:
- If empty string (""), add 12pt vertical space
- If starts with "•", create as bullet point with 18pt left indent
- If starts with emoji (🤝 🌍 💡 📊), style as section heading:
  - Font: Arial Bold, 16pt
  - Color: TEEI Green (#009688)
  - Add gradient accent bar below (3pt height, TEEI Blue → Gold #FFB74D)
- Regular text:
  - Font: Arial Regular, 11pt
  - Color: Dark Gray (#333333)
  - Leading: 16pt (line height)

ULTRA-PREMIUM BOXES:
For the 4 partnership benefits sections (Technology, Global Reach, Innovation, Data):
- Create ultra-premium box around each section
- Drop shadow: Offset X=2, Y=2, Blur=8, Opacity=30%
- Outer glow: TEEI Green (#009688), Spread=4, Blur=8, Opacity=40%
- Inner glow: Gold (#FFB74D), Spread=2, Blur=6, Opacity=20%
- Corner radius: 8pt
- Padding: 18pt all sides

DECORATIVE ELEMENTS:
- Step and repeat pattern: Small circles (6pt diameter, TEEI Blue)
  - Position: Top-right corner of header
  - Count: 5 horizontal × 2 vertical
  - Spacing: 12pt horizontal, 8pt vertical
  - Opacity: 40%

FOOTER:
- Horizontal rule: Width=451pt (page width minus margins), Height=1pt
- Color: TEEI Blue (#00393F)
- Position: 36pt from bottom
- Text below: "© 2025 The Educational Equality Institute | Confidential Partnership Document"
  - Font: Arial Regular, 9pt
  - Color: Medium Gray (#666666)
  - Alignment: Center

EXPORT:
- Export as PDF: "teei-partnership-showcase-premium.pdf"
- Output path: T:\Projects\pdf-orchestrator\exports\
- Quality: Print (300 DPI)
- Include: Bleed (3mm), Crop marks

Execute all commands in sequence and create the PDF!
```

---

## Expected Result

A professional, print-ready PDF with:
- ✨ Stunning gradient header (Blue → Green)
- 🌈 Curved title text (your "rainbow" effect!)
- 💎 Ultra-premium boxes with shadows, glows, and inner glows
- 🎨 Gradient accent bars (Blue → Gold)
- ⭐ Decorative patterns
- 📄 Professional typography and layout
- 🖨️ Print-ready quality (300 DPI)

Output: `T:\Projects\pdf-orchestrator\exports\teei-partnership-showcase-premium.pdf`

---

## Alternative: Simpler Version

If you want to test with a simpler design first:

```
Create a TEEI showcase PDF with basic layout:
1. New document: 595pt × 842pt, 72pt margins
2. Header: Gradient box, TEEI Blue → Green, 595×180pt
3. Title: "TEEI Partnership Showcase 2025", Arial Bold 32pt, White, centered at Y=90
4. Content: Place the 31-line content array as body text, Arial 11pt, 16pt leading
5. Footer: TEEI copyright, Arial 9pt, gray, centered at bottom
6. Export as PDF: "teei-showcase-simple.pdf"
```

---

## Customization

You can customize by telling Claude Code:

- "Make the header taller (240pt instead of 180pt)"
- "Use a different gradient angle (45° instead of 90°)"
- "Add more decorative patterns"
- "Make the curved text larger (32pt instead of 28pt)"
- "Add a second page with additional content"
- "Change color scheme to TEEI Gold accents"

The 61 commands give you FULL creative control! 🎨
