#!/usr/bin/env python3
import sys, os
sys.path.insert(0, 'adb-mcp/mcp')
from core import init, sendCommand, createCommand
import socket_client

socket_client.configure(app='indesign', url='http://localhost:8013', timeout=60)
init('indesign', socket_client)

export_code = r"""
(function() {
    var doc = app.activeDocument;
    var pdfPreset = "[High Quality Print]";

    app.pdfExportPreferences.pageRange = "1-2";

    var file = new File("C:\\Users\\ovehe\\Downloads\\TEEI_AWS_WORLD_CLASS.pdf");
    doc.exportFile(ExportFormat.PDF_TYPE, file, false, pdfPreset);

    return "PDF exported successfully!";
})();
"""

print("Exporting PDF...")
response = sendCommand(createCommand('executeExtendScript', {'code': export_code}))

if response.get('status') == 'SUCCESS':
    print("SUCCESS!")
    print(response['response']['result'])
    print()
    print("Location: C:\\Users\\ovehe\\Downloads\\TEEI_AWS_WORLD_CLASS.pdf")
else:
    print("FAILED:", response)
