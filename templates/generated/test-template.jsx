
// Auto-generated InDesign Template Script
// Template: Partnership Brochure
// Generated: 2025-11-08T15:19:19.704Z
// Brand: TEEI

#target indesign

function createTemplate() {
  var doc, page, textFrame, rect;

  // Create new document
  var docPreset = app.documentPresets.add();
  docPreset.pageWidth = "8.5inches";
  docPreset.pageHeight = "11inches";
  docPreset.facingPages = false;
  docPreset.pagesPerDocument = 8;

  doc = app.documents.add(docPreset);

  // Set margins
  doc.marginPreferences.top = "40pt";
  doc.marginPreferences.bottom = "40pt";
  doc.marginPreferences.left = "40pt";
  doc.marginPreferences.right = "40pt";

  // Set baseline grid
  doc.gridPreferences.baselineStart = "16.5pt";
  doc.gridPreferences.baselineDivision = "16.5pt";

  // Create color swatches
  
  var colorNordshore = doc.colors.add();
  colorNordshore.name = "Nordshore";
  colorNordshore.model = ColorModel.PROCESS;
  colorNordshore.space = ColorSpace.RGB;
  colorNordshore.colorValue = [0, 57, 63];


  var colorSky = doc.colors.add();
  colorSky.name = "Sky";
  colorSky.model = ColorModel.PROCESS;
  colorSky.space = ColorSpace.RGB;
  colorSky.colorValue = [201, 228, 236];


  var colorSand = doc.colors.add();
  colorSand.name = "Sand";
  colorSand.model = ColorModel.PROCESS;
  colorSand.space = ColorSpace.RGB;
  colorSand.colorValue = [255, 241, 226];


  var colorBeige = doc.colors.add();
  colorBeige.name = "Beige";
  colorBeige.model = ColorModel.PROCESS;
  colorBeige.space = ColorSpace.RGB;
  colorBeige.colorValue = [239, 225, 220];


  var colorGold = doc.colors.add();
  colorGold.name = "Gold";
  colorGold.model = ColorModel.PROCESS;
  colorGold.space = ColorSpace.RGB;
  colorGold.colorValue = [186, 143, 90];


  var colorMoss = doc.colors.add();
  colorMoss.name = "Moss";
  colorMoss.model = ColorModel.PROCESS;
  colorMoss.space = ColorSpace.RGB;
  colorMoss.colorValue = [101, 135, 59];


  var colorClay = doc.colors.add();
  colorClay.name = "Clay";
  colorClay.model = ColorModel.PROCESS;
  colorClay.space = ColorSpace.RGB;
  colorClay.colorValue = [145, 59, 47];


  // Create paragraph styles
  
  var styleDocumentTitle = doc.paragraphStyles.add();
  styleDocumentTitle.name = "Document Title";
  styleDocumentTitle.appliedFont = "Lora";
  styleDocumentTitle.fontStyle = "Bold";
  styleDocumentTitle.pointSize = 42;
  styleDocumentTitle.leading = 46.2;
  styleDocumentTitle.spaceBefore = 0;
  styleDocumentTitle.spaceAfter = 12;

  var styleSectionHeader = doc.paragraphStyles.add();
  styleSectionHeader.name = "Section Header";
  styleSectionHeader.appliedFont = "Lora";
  styleSectionHeader.fontStyle = "SemiBold";
  styleSectionHeader.pointSize = 28;
  styleSectionHeader.leading = 33.6;
  styleSectionHeader.spaceBefore = 60;
  styleSectionHeader.spaceAfter = 24;

  var styleSubsectionHeader = doc.paragraphStyles.add();
  styleSubsectionHeader.name = "Subsection Header";
  styleSubsectionHeader.appliedFont = "Roboto Flex";
  styleSubsectionHeader.fontStyle = "Medium";
  styleSubsectionHeader.pointSize = 18;
  styleSubsectionHeader.leading = 23.400000000000002;
  styleSubsectionHeader.spaceBefore = 60;
  styleSubsectionHeader.spaceAfter = 24;

  var styleBodyText = doc.paragraphStyles.add();
  styleBodyText.name = "Body Text";
  styleBodyText.appliedFont = "Roboto Flex";
  styleBodyText.fontStyle = "Regular";
  styleBodyText.pointSize = 11;
  styleBodyText.leading = 16.5;
  styleBodyText.spaceBefore = 0;
  styleBodyText.spaceAfter = 12;

  var styleCaption = doc.paragraphStyles.add();
  styleCaption.name = "Caption";
  styleCaption.appliedFont = "Roboto Flex";
  styleCaption.fontStyle = "Regular";
  styleCaption.pointSize = 9;
  styleCaption.leading = 12.6;
  styleCaption.spaceBefore = 0;
  styleCaption.spaceAfter = 12;

  var stylePullQuote = doc.paragraphStyles.add();
  stylePullQuote.name = "Pull Quote";
  stylePullQuote.appliedFont = "Lora";
  stylePullQuote.fontStyle = "Italic";
  stylePullQuote.pointSize = 18;
  stylePullQuote.leading = 23.400000000000002;
  stylePullQuote.spaceBefore = 0;
  stylePullQuote.spaceAfter = 12;

  var styleStatNumber = doc.paragraphStyles.add();
  styleStatNumber.name = "Stat Number";
  styleStatNumber.appliedFont = "Lora";
  styleStatNumber.fontStyle = "Bold";
  styleStatNumber.pointSize = 48;
  styleStatNumber.leading = 48;
  styleStatNumber.spaceBefore = 0;
  styleStatNumber.spaceAfter = 12;

  var styleButtonText = doc.paragraphStyles.add();
  styleButtonText.name = "Button Text";
  styleButtonText.appliedFont = "Roboto Flex";
  styleButtonText.fontStyle = "Bold";
  styleButtonText.pointSize = 18;
  styleButtonText.leading = 18;
  styleButtonText.spaceBefore = 0;
  styleButtonText.spaceAfter = 12;

  // Create master pages
  
  var masterDefault = doc.masterSpreads.add();
  masterDefault.namePrefix = "A-Master";

  var masterCover = doc.masterSpreads.add();
  masterCover.namePrefix = "B-Cover";

  // Apply master pages to document pages
  
  doc.pages[0].appliedMaster = doc.masterSpreads.itemByName("B-Cover");

  doc.pages[1].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[2].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[3].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[4].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[5].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[6].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  doc.pages[7].appliedMaster = doc.masterSpreads.itemByName("A-Master");

  alert("Template 'Partnership Brochure' created successfully!");
  return doc;
}

// Execute
createTemplate();
