# 🚀 CURSOR INSTRUCTIONS - Create TEEI Showcase PDF

## ✅ PREREQUISITES (Already Done!)
1. ✅ InDesign is running
2. ✅ UXP plugin loaded and connected
3. ✅ Proxy running on port 8013
4. ✅ All 61 InDesign MCP tools available

---

## 📋 COPY/PASTE THIS TO CURSOR

Open Cursor and paste this exact message:

```
Create a professional TEEI Partnership Showcase PDF using InDesign MCP with these specifications:

DOCUMENT SETUP:
- Create new document: 595pt × 842pt (A4)
- Margins: 72pt all sides
- Color mode: CMYK

HEADER (Gradient):
- Create gradient box: X=0, Y=0, Width=595, Height=180
- Start color: RGB(0, 57, 63) - TEEI Blue
- End color: RGB(0, 150, 136) - TEEI Green
- Gradient angle: 90° (top to bottom)

TITLE (Curved Text):
- Create circular path: Center X=297.5, Y=100, Radius=120
- Text: "🌟 TEEI AI-Powered Education Revolution 2025"
- Font: Arial Bold, 28pt
- Color: White
- Place text on path (top arc)

SUBTITLE:
- Text: "World-Class Partnership Showcase Document"
- Position: X=72, Y=200
- Font: Arial Regular, 18pt
- Color: TEEI Blue RGB(0, 57, 63)
- Alignment: Center

CONTENT SECTIONS:
Add these 31 content blocks starting at Y=250:

1. "The Educational Equality Institute (TEEI) has transformed education for 50,000+ students across 12 countries through our revolutionary AI-powered learning platform."
2. [Empty line - 12pt space]
3. "Revolutionary AI Platform Features:"
4. "• Adaptive learning pathways personalized for each student"
5. "• Real-time progress tracking and intervention alerts"
6. "• Multi-language support (25+ languages)"
7. "• Accessibility features for diverse learning needs"
8. "• Teacher dashboard with actionable insights"
9. [Empty line]
10. "Proven Impact:"
11. "• 85% improvement in student engagement"
12. "• 92% teacher satisfaction rate"
13. "• 78% reduction in learning gaps"
14. "• 10x cost savings vs. traditional methods"
15. [Empty line]
16. "Strategic Partnership Benefits:"
17. [Empty line]
18. "🤝 Technology Leadership" (Font: Arial Bold 16pt, Color: TEEI Green, add gradient accent bar below)
19. "Partner with a proven EdTech innovator transforming education at scale"
20. [Empty line]
21. "🌍 Global Reach" (Font: Arial Bold 16pt, Color: TEEI Green, add gradient accent bar below)
22. "Access to established networks in 12 countries across 3 continents"
23. [Empty line]
24. "💡 Innovation Pipeline" (Font: Arial Bold 16pt, Color: TEEI Green, add gradient accent bar below)
25. "Collaborate on cutting-edge AI/ML educational research"
26. [Empty line]
27. "📊 Data Excellence" (Font: Arial Bold 16pt, Color: TEEI Green, add gradient accent bar below)
28. "Leverage world-class learning analytics and outcomes measurement"
29. [Empty line]
30. "Contact: Henrik Røine | CEO & Founder"
31. "Email: henrik@theeducationalequalityinstitute.org"
32. "Web: www.educationalequality.institute"

For content formatting:
- Regular text: Arial 11pt, RGB(51,51,51), 16pt leading
- Bullet points (•): 18pt left indent
- Section headings (with emoji): Arial Bold 16pt, TEEI Green
- Gradient accent bars: Width=451pt, Height=3pt, TEEI Blue → Gold RGB(255,183,77)

DECORATIVE PATTERN:
- Create 10 small circles (6pt diameter)
- Position: Top-right corner of header (starting at X=480, Y=20)
- Layout: 5 horizontal × 2 vertical
- Spacing: 12pt horizontal, 8pt vertical
- Color: TEEI Blue, 40% opacity

FOOTER:
- Horizontal rule: Y=734, Width=451pt, Height=1pt, Color: TEEI Blue
- Text below: "© 2025 The Educational Equality Institute | Confidential Partnership Document"
- Font: Arial 9pt, RGB(102,102,102), centered

EXPORT:
- Export as PDF: "T:\Projects\pdf-orchestrator\exports\teei-partnership-showcase-premium.pdf"
- Preset: High Quality Print
- Include bleed and crop marks

Execute all commands using the InDesign MCP tools and create the PDF!
```

---

## 🎯 EXPECTED RESULT

Cursor will:
1. Auto-start the InDesign MCP server
2. Execute all 61 commands to create the document
3. Export the PDF to: `T:\Projects\pdf-orchestrator\exports\teei-partnership-showcase-premium.pdf`

Total time: ~2 minutes

---

## ✅ VERIFICATION

After Cursor finishes, check:
```powershell
Test-Path "T:\Projects\pdf-orchestrator\exports\teei-partnership-showcase-premium.pdf"
```

Open the PDF in Adobe Acrobat to verify:
- ✨ Gradient header (Blue → Green)
- 🌈 Curved title text
- 📋 All content sections
- ⭐ Decorative circles
- 📄 Professional layout

---

## 🚨 IF IT DOESN'T WORK

If Cursor says "InDesign MCP not available":

1. Check proxy is still running:
   ```powershell
   Get-NetTCPConnection -LocalPort 8013
   ```

2. Restart Cursor (to reload MCP servers)

3. Verify InDesign UXP plugin is connected:
   - Open Adobe UXP Developer Tool
   - Check plugin shows "Connected" status

---

## 💡 ALTERNATIVE (If Cursor doesn't work)

Use the Python script with fixed response checking:

```bash
cd T:\Projects\pdf-orchestrator
python create_teei_showcase_premium_v2.py
```

(I'll create v2 with proper response format handling if needed)

---

**Ready to go! Just copy the message above and paste it into Cursor!** 🚀
