#!/usr/bin/env node
/**
 * Create Word template using officegen which generates cleaner XML
 * that Adobe Document Generation API can properly recognize
 */

const fs = require('fs');
const path = require('path');

// We'll use a simple approach: create XML manually that matches Adobe's requirements
const templateXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<pkg:package xmlns:pkg="http://schemas.microsoft.com/office/2006/xmlPackage">
  <pkg:part pkg:name="/_rels/.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml">
    <pkg:xmlData>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
      </Relationships>
    </pkg:xmlData>
  </pkg:part>
  <pkg:part pkg:name="/word/document.xml" pkg:contentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml">
    <pkg:xmlData>
      <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
        <w:body>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:sz w:val="56"/><w:szCs w:val="56"/>
                <w:b/><w:color w:val="00393F"/>
              </w:rPr>
              <w:t>{{title}}</w:t>
            </w:r>
          </w:p>
          <w:p>
            <w:pPr><w:jc w:val="center"/></w:pPr>
            <w:r>
              <w:rPr>
                <w:sz w:val="32"/><w:szCs w:val="32"/>
                <w:color w:val="BA8F5A"/>
              </w:rPr>
              <w:t>{{subtitle}}</w:t>
            </w:r>
          </w:p>
        </w:body>
      </w:document>
    </pkg:xmlData>
  </pkg:part>
  <pkg:part pkg:name="/word/_rels/document.xml.rels" pkg:contentType="application/vnd.openxmlformats-package.relationships+xml">
    <pkg:xmlData>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>
    </pkg:xmlData>
  </pkg:part>
  <pkg:part pkg:name="/[Content_Types].xml" pkg:contentType="application/vnd.openxmlformats-package.content-types+xml">
    <pkg:xmlData>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
      </Types>
    </pkg:xmlData>
  </pkg:part>
</pkg:package>`;

const outputPath = path.join(__dirname, '../templates/word/teei-clean-test.xml');
fs.writeFileSync(outputPath, templateXML);

console.log('[OK] Clean XML template created:', outputPath);
console.log('  This is a Word XML format that Adobe should recognize');
console.log('  Merge fields: {{title}}, {{subtitle}}');
console.log('\nNote: This is Word XML format (.xml), not .docx');
console.log('Adobe PDF Services can accept Word XML directly');
