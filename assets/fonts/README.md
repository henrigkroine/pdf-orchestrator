# TEEI Brand Fonts

This directory contains the official fonts required for TEEI brand compliance.

## Fonts Included

### Lora (Serif - Headlines)
- Lora-Regular.ttf
- Lora-Medium.ttf
- Lora-SemiBold.ttf
- Lora-Bold.ttf
- Lora-Italic.ttf
- Lora-MediumItalic.ttf
- Lora-SemiBoldItalic.ttf
- Lora-BoldItalic.ttf

**Usage**: Headlines, section titles, document titles
**Brand Requirement**: Primary headline font per TEEI Design Guidelines

### Roboto (Sans-Serif - Body Text)
**Regular Roboto:**
- Roboto-Thin.ttf → Roboto-Black.ttf (9 weights)
- Italic variants for all weights

**Roboto Condensed:**
- Roboto_Condensed-Thin.ttf → Roboto_Condensed-Black.ttf
- Italic variants

**Roboto Semi-Condensed:**
- Roboto_SemiCondensed-Thin.ttf → Roboto_SemiCondensed-Black.ttf
- Italic variants

**Variable Fonts:**
- Roboto-VariableFont_wdth,wght.ttf
- Roboto-Italic-VariableFont_wdth,wght.ttf

**Usage**: Body text, captions, UI elements
**Brand Requirement**: Primary body font per TEEI Design Guidelines (Roboto Flex)

## Installation

### Automatic Installation (Recommended)

Run the PowerShell script to auto-install all fonts:

```powershell
# Run as Administrator for best results
powershell -ExecutionPolicy Bypass -File "T:\Projects\pdf-orchestrator\scripts\install-fonts.ps1"
```

This script will:
1. ✅ Copy all .ttf files to `C:\Windows\Fonts`
2. ✅ Register fonts in Windows Registry
3. ✅ Skip fonts that are already installed
4. ✅ Show detailed installation summary

**IMPORTANT**: Restart InDesign after installation to load the new fonts!

### Manual Installation

If automatic installation fails:

1. Select all `.ttf` files in this directory
2. Right-click → "Install" or "Install for all users"
3. Wait for installation to complete
4. Restart InDesign

## Font Sources

- **Lora**: Google Fonts (https://fonts.google.com/specimen/Lora)
- **Roboto**: Google Fonts (https://fonts.google.com/specimen/Roboto)
- **License**: Open Font License (OFL)

## Typography System

Per TEEI Design Guidelines:

```
Document Title:    Lora Bold, 42pt, Nordshore (#00393F)
Section Headers:   Lora Semibold, 28pt, Nordshore (#00393F)
Subheads:          Roboto Flex Medium, 18pt, Nordshore (#00393F)
Body Text:         Roboto Flex Regular, 11pt, Black (#000000)
Captions:          Roboto Flex Regular, 9pt, Gray (#666666)
```

## InDesign Automation

These fonts are required for:
- `create_brand_compliant_ultimate.py`
- `create_world_class_document.py`
- All TEEI PDF automation scripts

**Before running any automation**:
1. ✅ Install fonts using `scripts/install-fonts.ps1`
2. ✅ Restart InDesign
3. ✅ Verify fonts are available in InDesign's font menu
4. ✅ Run automation scripts

## Troubleshooting

### Fonts not showing in InDesign

**Problem**: Fonts installed but not appearing in InDesign font menu
**Solution**:
1. Close all InDesign instances completely
2. Restart InDesign
3. InDesign indexes fonts on startup - may take a few seconds
4. Check Edit → Preferences → Type → Font Preview Size (should show fonts)

### Installation fails without admin rights

**Problem**: "Access denied" when running install script
**Solution**:
1. Right-click PowerShell → "Run as Administrator"
2. Re-run `scripts/install-fonts.ps1`
3. Or manually install: Right-click fonts → "Install for all users"

### Variable fonts not working in InDesign

**Problem**: Roboto variable fonts show errors
**Solution**:
- Use static fonts instead (Roboto-Regular.ttf, Roboto-Bold.ttf, etc.)
- InDesign has limited variable font support
- All required static weights are included

## Portable Automation

To make automation portable across systems:

1. ✅ Fonts stored in repository (`assets/fonts/`)
2. ✅ Auto-install script provided (`scripts/install-fonts.ps1`)
3. ✅ Pre-run script checks in Python automation scripts
4. ✅ Fonts automatically installed before MCP/InDesign jobs

This ensures anyone can run the automation without manual font setup!

## License

All fonts in this directory are licensed under the **Open Font License (OFL)**.

- **Permitted**: Commercial use, modification, distribution
- **Required**: Include OFL.txt license file with any distribution
- **Prohibited**: Selling fonts by themselves

Full license: https://scripts.sil.org/OFL
