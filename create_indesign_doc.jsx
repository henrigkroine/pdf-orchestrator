// InDesign script to create a new document with specified dimensions
// Width: 800, Height: 600 (assuming points as units)

try {
    // Set measurement units to points
    app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;

    // Create document preset
    var docPreset = app.documentPresets.add({
        name: "800x600 Document",
        pageWidth: "800pt",
        pageHeight: "600pt",
        facingPages: false,
        documentBleedTopOffset: "0pt",
        documentBleedBottomOffset: "0pt",
        documentBleedInsideOrLeftOffset: "0pt",
        documentBleedOutsideOrRightOffset: "0pt"
    });

    // Create new document using the preset
    var doc = app.documents.add(docPreset);

    alert("Document created successfully!\nWidth: 800pt\nHeight: 600pt");

} catch (e) {
    alert("Error creating document: " + e.message);
}
