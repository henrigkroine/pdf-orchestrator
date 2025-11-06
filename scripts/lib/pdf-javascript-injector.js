/**
 * PDF JavaScript Injector
 * Injects JavaScript into PDFs for interactivity in Acrobat Reader
 *
 * Features:
 * - Form validation
 * - Interactive calculations
 * - Animation triggers
 * - Analytics tracking
 * - Custom behaviors
 */

const { PDFDocument, PDFName, PDFDict, PDFString, PDFArray } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');

class PDFJavaScriptInjector {
  constructor(config = {}) {
    this.config = config;

    // Common PDF JavaScript functions
    this.commonScripts = {
      formValidation: this.getFormValidationScript(),
      calculations: this.getCalculationScript(),
      formatting: this.getFormattingScript(),
      navigation: this.getNavigationScript(),
      analytics: this.getAnalyticsScript()
    };
  }

  /**
   * Inject JavaScript into PDF
   */
  async injectJavaScript(pdfPath, scripts, options = {}) {
    console.log('💉 Injecting JavaScript into PDF...');

    const pdfBytes = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Add document-level JavaScript
    if (scripts.documentLevel) {
      await this.addDocumentLevelScript(pdfDoc, scripts.documentLevel);
    }

    // Add page-level JavaScript
    if (scripts.pageLevel) {
      for (const [pageIndex, script] of Object.entries(scripts.pageLevel)) {
        await this.addPageLevelScript(pdfDoc, parseInt(pageIndex), script);
      }
    }

    // Add field-level JavaScript (for forms)
    if (scripts.fieldLevel) {
      for (const [fieldName, fieldScripts] of Object.entries(scripts.fieldLevel)) {
        await this.addFieldLevelScript(pdfDoc, fieldName, fieldScripts);
      }
    }

    // Save modified PDF
    const modifiedBytes = await pdfDoc.save();
    const outputPath = options.outputPath || pdfPath.replace('.pdf', '-interactive.pdf');
    await fs.writeFile(outputPath, modifiedBytes);

    console.log(`✅ Interactive PDF saved: ${outputPath}`);

    return outputPath;
  }

  /**
   * Add document-level JavaScript (runs when PDF opens)
   */
  async addDocumentLevelScript(pdfDoc, script) {
    const catalog = pdfDoc.context.lookup(pdfDoc.context.trailerInfo.Root);

    // Create JavaScript action
    const jsAction = pdfDoc.context.obj({
      S: PDFName.of('JavaScript'),
      JS: PDFString.of(script)
    });

    // Add to Names dictionary
    const names = catalog.get(PDFName.of('Names')) || pdfDoc.context.obj({});
    const javascript = names.get(PDFName.of('JavaScript')) || pdfDoc.context.obj({});

    const jsArray = PDFArray.withContext(pdfDoc.context);
    jsArray.push(PDFString.of('DocScript'));
    jsArray.push(jsAction);

    javascript.set(PDFName.of('Names'), jsArray);
    names.set(PDFName.of('JavaScript'), javascript);
    catalog.set(PDFName.of('Names'), names);
  }

  /**
   * Add page-level JavaScript (runs when page opens)
   */
  async addPageLevelScript(pdfDoc, pageIndex, script) {
    const page = pdfDoc.getPage(pageIndex);
    const pageRef = pdfDoc.context.getPageRef(pageIndex);
    const pageDict = pdfDoc.context.lookup(pageRef);

    // Create JavaScript action
    const jsAction = pdfDoc.context.obj({
      S: PDFName.of('JavaScript'),
      JS: PDFString.of(script)
    });

    // Add as page open action
    const aaDict = pageDict.get(PDFName.of('AA')) || pdfDoc.context.obj({});
    aaDict.set(PDFName.of('O'), jsAction); // O = Open
    pageDict.set(PDFName.of('AA'), aaDict);
  }

  /**
   * Add field-level JavaScript (for form fields)
   */
  async addFieldLevelScript(pdfDoc, fieldName, fieldScripts) {
    const form = pdfDoc.getForm();

    try {
      const field = form.getField(fieldName);

      // Add different event scripts
      if (fieldScripts.calculate) {
        field.acroField.setCalculateAction(fieldScripts.calculate);
      }

      if (fieldScripts.validate) {
        field.acroField.setValidateAction(fieldScripts.validate);
      }

      if (fieldScripts.format) {
        field.acroField.setFormatAction(fieldScripts.format);
      }

      if (fieldScripts.keystroke) {
        field.acroField.setKeystrokeAction(fieldScripts.keystroke);
      }
    } catch (error) {
      console.warn(`⚠️  Field '${fieldName}' not found`);
    }
  }

  /**
   * Form validation script
   */
  getFormValidationScript() {
    return `
      function validateForm() {
        var errors = [];

        // Validate email
        var email = this.getField("email").value;
        if (email && !validateEmail(email)) {
          errors.push("Please enter a valid email address");
          this.getField("email").fillColor = color.pink;
        } else {
          this.getField("email").fillColor = color.white;
        }

        // Validate required fields
        var requiredFields = ["name", "organization", "email"];
        for (var i = 0; i < requiredFields.length; i++) {
          var field = this.getField(requiredFields[i]);
          if (!field.value || field.value.trim() === "") {
            errors.push(requiredFields[i] + " is required");
            field.fillColor = color.pink;
          } else {
            field.fillColor = color.white;
          }
        }

        // Show results
        if (errors.length > 0) {
          app.alert({
            cMsg: "Please correct the following errors:\\n\\n" + errors.join("\\n"),
            cTitle: "Form Validation",
            nIcon: 0
          });
          return false;
        }

        return true;
      }

      function validateEmail(email) {
        var re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        return re.test(email);
      }
    `;
  }

  /**
   * Calculation script for form fields
   */
  getCalculationScript() {
    return {
      sum: `
        // Calculate sum of fields
        var total = 0;
        var fields = ["field1", "field2", "field3"];

        for (var i = 0; i < fields.length; i++) {
          var value = this.getField(fields[i]).value;
          if (value && !isNaN(value)) {
            total += parseFloat(value);
          }
        }

        event.value = total;
      `,

      percentage: `
        // Calculate percentage
        var value = this.getField("value").value;
        var total = this.getField("total").value;

        if (value && total && !isNaN(value) && !isNaN(total) && total > 0) {
          event.value = (parseFloat(value) / parseFloat(total) * 100).toFixed(2) + "%";
        } else {
          event.value = "0%";
        }
      `,

      product: `
        // Calculate product
        var quantity = this.getField("quantity").value;
        var price = this.getField("price").value;

        if (quantity && price && !isNaN(quantity) && !isNaN(price)) {
          event.value = (parseFloat(quantity) * parseFloat(price)).toFixed(2);
        } else {
          event.value = "0.00";
        }
      `
    };
  }

  /**
   * Formatting script for form fields
   */
  getFormattingScript() {
    return {
      currency: `
        // Format as currency
        var value = event.value;
        if (value && !isNaN(value)) {
          event.value = "$" + parseFloat(value).toFixed(2).replace(/\\d(?=(\\d{3})+\\.)/g, '$&,');
        }
      `,

      phone: `
        // Format phone number (US)
        var value = event.value.replace(/\\D/g, '');
        if (value.length === 10) {
          event.value = "(" + value.substring(0,3) + ") " + value.substring(3,6) + "-" + value.substring(6,10);
        }
      `,

      date: `
        // Format date as MM/DD/YYYY
        var value = event.value;
        if (value) {
          var date = new Date(value);
          if (!isNaN(date.getTime())) {
            var month = ("0" + (date.getMonth() + 1)).slice(-2);
            var day = ("0" + date.getDate()).slice(-2);
            var year = date.getFullYear();
            event.value = month + "/" + day + "/" + year;
          }
        }
      `,

      uppercase: `
        // Convert to uppercase
        event.value = event.value.toUpperCase();
      `,

      titlecase: `
        // Convert to title case
        event.value = event.value.replace(/\\w\\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      `
    };
  }

  /**
   * Navigation script
   */
  getNavigationScript() {
    return {
      nextPage: `
        function nextPage() {
          if (this.pageNum < this.numPages - 1) {
            this.pageNum++;
          } else {
            app.alert("You are on the last page");
          }
        }
      `,

      previousPage: `
        function previousPage() {
          if (this.pageNum > 0) {
            this.pageNum--;
          } else {
            app.alert("You are on the first page");
          }
        }
      `,

      goToPage: `
        function goToPage(pageNumber) {
          if (pageNumber >= 0 && pageNumber < this.numPages) {
            this.pageNum = pageNumber;
          } else {
            app.alert("Invalid page number");
          }
        }
      `,

      goToNamedDest: `
        function goToDestination(destName) {
          try {
            this.gotoNamedDest(destName);
          } catch(e) {
            app.alert("Destination not found: " + destName);
          }
        }
      `
    };
  }

  /**
   * Analytics tracking script
   */
  getAnalyticsScript() {
    return `
      // Track document open
      var trackingData = {
        documentTitle: this.documentFileName,
        openedAt: new Date().toISOString(),
        pages: this.numPages,
        version: this.info.Producer
      };

      // Track page views
      function trackPageView() {
        console.println("Page viewed: " + this.pageNum);
        // Could send to external tracking service via URL
      }

      // Track form submissions
      function trackFormSubmit() {
        console.println("Form submitted at: " + new Date().toISOString());
        // Could send analytics data
      }

      // Track link clicks
      function trackLinkClick(linkName) {
        console.println("Link clicked: " + linkName);
      }
    `;
  }

  /**
   * Create interactive form with validation
   */
  async createInteractiveForm(pdfDoc, formConfig) {
    const form = pdfDoc.getForm();

    for (const field of formConfig.fields) {
      let formField;

      switch (field.type) {
        case 'text':
          formField = form.createTextField(field.name);
          break;
        case 'button':
          formField = form.createButton(field.name);
          break;
        case 'checkbox':
          formField = form.createCheckBox(field.name);
          break;
        case 'dropdown':
          formField = form.createDropdown(field.name);
          if (field.options) {
            formField.setOptions(field.options);
          }
          break;
      }

      if (formField && field.scripts) {
        // Add field scripts
        await this.addFieldLevelScript(pdfDoc, field.name, field.scripts);
      }
    }

    return pdfDoc;
  }

  /**
   * Add button with action
   */
  async addButtonWithAction(pdfDoc, pageIndex, buttonConfig) {
    const page = pdfDoc.getPage(pageIndex);
    const form = pdfDoc.getForm();

    const button = form.createButton(buttonConfig.name);

    // Set button properties
    button.addToPage(buttonConfig.label || buttonConfig.name, page, {
      x: buttonConfig.x,
      y: buttonConfig.y,
      width: buttonConfig.width || 100,
      height: buttonConfig.height || 30,
      backgroundColor: buttonConfig.backgroundColor,
      borderColor: buttonConfig.borderColor
    });

    // Add JavaScript action
    if (buttonConfig.onClick) {
      const jsAction = pdfDoc.context.obj({
        S: PDFName.of('JavaScript'),
        JS: PDFString.of(buttonConfig.onClick)
      });

      const buttonWidget = button.acroField.getWidgets()[0];
      const aaDict = pdfDoc.context.obj({});
      aaDict.set(PDFName.of('U'), jsAction); // U = mouse up
      buttonWidget.set(PDFName.of('AA'), aaDict);
    }

    return button;
  }

  /**
   * Create navigation buttons
   */
  async addNavigationButtons(pdfDoc) {
    const numPages = pdfDoc.getPageCount();

    for (let i = 0; i < numPages; i++) {
      // Add "Next Page" button
      if (i < numPages - 1) {
        await this.addButtonWithAction(pdfDoc, i, {
          name: `nextPage_${i}`,
          label: 'Next →',
          x: 500,
          y: 50,
          width: 80,
          height: 30,
          backgroundColor: { r: 0, g: 0.224, b: 0.247 }, // TEEI Nordshore
          onClick: 'this.pageNum++;'
        });
      }

      // Add "Previous Page" button
      if (i > 0) {
        await this.addButtonWithAction(pdfDoc, i, {
          name: `prevPage_${i}`,
          label: '← Previous',
          x: 50,
          y: 50,
          width: 80,
          height: 30,
          backgroundColor: { r: 0.729, g: 0.561, b: 0.353 }, // TEEI Gold
          onClick: 'this.pageNum--;'
        });
      }
    }

    return pdfDoc;
  }

  /**
   * Add print button
   */
  async addPrintButton(pdfDoc, pageIndex, position = { x: 500, y: 750 }) {
    return await this.addButtonWithAction(pdfDoc, pageIndex, {
      name: 'printButton',
      label: 'Print',
      x: position.x,
      y: position.y,
      width: 80,
      height: 30,
      onClick: 'this.print();'
    });
  }

  /**
   * Add email button
   */
  async addEmailButton(pdfDoc, pageIndex, emailConfig) {
    const emailScript = `
      this.mailDoc({
        bUI: true,
        cTo: "${emailConfig.to || ''}",
        cSubject: "${emailConfig.subject || 'PDF Document'}",
        cMsg: "${emailConfig.message || ''}"
      });
    `;

    return await this.addButtonWithAction(pdfDoc, pageIndex, {
      name: 'emailButton',
      label: 'Email',
      x: emailConfig.x || 400,
      y: emailConfig.y || 750,
      width: 80,
      height: 30,
      onClick: emailScript
    });
  }

  /**
   * Add submit button for forms
   */
  async addSubmitButton(pdfDoc, pageIndex, submitConfig) {
    const submitScript = `
      if (validateForm()) {
        this.submitForm({
          cURL: "${submitConfig.url}",
          cSubmitAs: "FDF"
        });
      }
    `;

    return await this.addButtonWithAction(pdfDoc, pageIndex, {
      name: 'submitButton',
      label: 'Submit',
      x: submitConfig.x || 250,
      y: submitConfig.y || 50,
      width: 100,
      height: 40,
      backgroundColor: { r: 0.396, g: 0.529, b: 0.231 }, // TEEI Moss
      onClick: submitScript
    });
  }

  /**
   * Create animated page transition
   */
  getPageTransitionScript(transitionType = 'fade') {
    const transitions = {
      fade: `
        this.setPageTransitions({
          nPageNum: this.pageNum,
          cTransition: "Fade",
          nDuration: 0.5
        });
      `,
      wipe: `
        this.setPageTransitions({
          nPageNum: this.pageNum,
          cTransition: "Wipe",
          nDuration: 0.5,
          nDirection: 0
        });
      `,
      dissolve: `
        this.setPageTransitions({
          nPageNum: this.pageNum,
          cTransition: "Dissolve",
          nDuration: 0.5
        });
      `
    };

    return transitions[transitionType] || transitions.fade;
  }

  /**
   * Add document security with password
   */
  async addPasswordProtection(pdfDoc, passwords) {
    if (passwords.owner || passwords.user) {
      // Note: pdf-lib doesn't support encryption yet
      // This would require using another library like pdftk
      console.warn('⚠️  Password protection requires external tool (pdftk)');
      console.log('   Use: pdftk input.pdf output output.pdf user_pw PASSWORD owner_pw PASSWORD');
    }
  }

  /**
   * Create complete interactive PDF preset
   */
  async createInteractivePDF(inputPath, options = {}) {
    console.log('🎨 Creating interactive PDF...');

    const pdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Add navigation buttons
    if (options.navigation !== false) {
      await this.addNavigationButtons(pdfDoc);
    }

    // Add document-level script
    const docScript = `
      ${this.commonScripts.formValidation}
      ${this.commonScripts.navigation.nextPage}
      ${this.commonScripts.navigation.previousPage}

      // Initialize on document open
      console.println("Interactive PDF loaded");
      console.println("Pages: " + this.numPages);
    `;

    await this.addDocumentLevelScript(pdfDoc, docScript);

    // Add form if specified
    if (options.form) {
      await this.createInteractiveForm(pdfDoc, options.form);
    }

    // Add custom buttons
    if (options.buttons) {
      for (const [pageIndex, buttons] of Object.entries(options.buttons)) {
        for (const button of buttons) {
          await this.addButtonWithAction(pdfDoc, parseInt(pageIndex), button);
        }
      }
    }

    // Save interactive PDF
    const outputPath = options.outputPath || inputPath.replace('.pdf', '-interactive.pdf');
    const interactiveBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, interactiveBytes);

    console.log(`✅ Interactive PDF created: ${outputPath}`);

    return {
      path: outputPath,
      pages: pdfDoc.getPageCount(),
      hasForm: !!options.form,
      hasNavigation: options.navigation !== false
    };
  }
}

module.exports = PDFJavaScriptInjector;
