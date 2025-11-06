#!/usr/bin/env python3
"""
Real-time Preview Server for InDesign Documents
Auto-exports and serves PDFs with live refresh
"""

import os
import sys
import time
import json
import tempfile
import threading
from pathlib import Path
from datetime import datetime

# Add InDesign automation modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'adb-mcp', 'mcp'))

try:
    from flask import Flask, send_file, jsonify, render_template_string
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("⚠️  Flask not installed. Run: pip install flask")

from core import init, sendCommand, createCommand
import socket_client

app = Flask(__name__) if FLASK_AVAILABLE else None

class InDesignPreviewServer:
    """Live preview server for InDesign documents"""

    def __init__(self, export_path=None, auto_refresh=5):
        self.export_path = export_path or tempfile.gettempdir()
        self.auto_refresh = auto_refresh  # seconds
        self.last_export = None
        self.export_status = "Not started"
        self.document_info = {}

        # InDesign connection
        self.APPLICATION = "indesign"
        self.PROXY_URL = 'http://localhost:8013'
        self.connected = False

        # Initialize connection
        self.connect_to_indesign()

    def connect_to_indesign(self):
        """Connect to InDesign via MCP proxy"""
        try:
            socket_client.configure(
                app=self.APPLICATION,
                url=self.PROXY_URL,
                timeout=30
            )
            init(self.APPLICATION, socket_client)

            # Test connection
            response = sendCommand(createCommand("ping", {}))
            if response.get("status") == "SUCCESS":
                self.connected = True
                self.export_status = "Connected to InDesign"
                print("✅ Connected to InDesign")
            else:
                self.connected = False
                self.export_status = "InDesign not responding"
                print("❌ InDesign not responding")

        except Exception as e:
            self.connected = False
            self.export_status = f"Connection error: {str(e)}"
            print(f"❌ Connection error: {e}")

    def export_current_document(self):
        """Export current InDesign document to PDF"""
        if not self.connected:
            self.connect_to_indesign()
            if not self.connected:
                return None

        try:
            # Generate unique filename with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"preview_{timestamp}.pdf"
            pdf_path = os.path.join(self.export_path, pdf_filename)

            # Export PDF via MCP
            export_command = createCommand("exportPDF", {
                "outputPath": pdf_path,
                "preset": "High Quality Print",
                "viewPDF": False
            })

            print(f"📤 Exporting to: {pdf_path}")
            response = sendCommand(export_command)

            if response.get("status") == "SUCCESS":
                self.last_export = pdf_path
                self.export_status = f"Exported at {datetime.now().strftime('%H:%M:%S')}"

                # Get document info
                info_response = sendCommand(createCommand("readDocumentInfo", {}))
                if info_response.get("status") == "SUCCESS":
                    self.document_info = info_response.get("response", {})

                print(f"✅ Export successful: {pdf_filename}")
                return pdf_path
            else:
                self.export_status = f"Export failed: {response.get('message', 'Unknown error')}"
                print(f"❌ Export failed: {response}")
                return None

        except Exception as e:
            self.export_status = f"Export error: {str(e)}"
            print(f"❌ Export error: {e}")
            return None

    def get_latest_pdf(self):
        """Get the most recent PDF or create one"""
        if not self.last_export or not os.path.exists(self.last_export):
            self.export_current_document()

        return self.last_export

# Create global server instance
preview_server = InDesignPreviewServer() if FLASK_AVAILABLE else None

# HTML template for the preview page
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<head>
    <title>InDesign Live Preview</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #1a1a1a;
            color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #00393f 0%, #BA8F5A 100%);
            padding: 15px 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header h1 {
            font-size: 24px;
            font-weight: 300;
            letter-spacing: 1px;
        }
        .status {
            display: flex;
            gap: 20px;
            align-items: center;
        }
        .status-item {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: rgba(255,255,255,0.1);
            border-radius: 20px;
            font-size: 14px;
        }
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: pulse 2s infinite;
        }
        .status-dot.connected {
            background: #4CAF50;
        }
        .status-dot.disconnected {
            background: #f44336;
        }
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .controls {
            padding: 15px 20px;
            background: #2a2a2a;
            display: flex;
            gap: 10px;
            align-items: center;
        }
        .btn {
            padding: 8px 16px;
            background: #00393f;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
        }
        .btn:hover {
            background: #BA8F5A;
            transform: translateY(-1px);
        }
        .btn:active {
            transform: translateY(0);
        }
        .auto-refresh {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-left: auto;
        }
        .toggle {
            position: relative;
            width: 50px;
            height: 24px;
            background: #444;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .toggle.active {
            background: #4CAF50;
        }
        .toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
        }
        .toggle.active .toggle-slider {
            transform: translateX(26px);
        }
        .preview-container {
            height: calc(100vh - 120px);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            background: repeating-linear-gradient(
                45deg,
                #1a1a1a,
                #1a1a1a 10px,
                #1e1e1e 10px,
                #1e1e1e 20px
            );
        }
        iframe {
            width: 100%;
            height: 100%;
            max-width: 1200px;
            border: none;
            border-radius: 8px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
            background: white;
        }
        .info {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0,0,0,0.8);
            padding: 10px 15px;
            border-radius: 8px;
            font-size: 12px;
            backdrop-filter: blur(10px);
        }
        .loading {
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(186, 143, 90, 0.3);
            border-top: 3px solid #BA8F5A;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 InDesign Live Preview</h1>
        <div class="status">
            <div class="status-item">
                <div class="status-dot {{ 'connected' if connected else 'disconnected' }}"></div>
                <span>{{ status }}</span>
            </div>
            <div class="status-item">
                <span>{{ last_update }}</span>
            </div>
        </div>
    </div>

    <div class="controls">
        <button class="btn" onclick="refreshPreview()">🔄 Refresh Now</button>
        <button class="btn" onclick="exportNew()">📤 Export New</button>
        <button class="btn" onclick="validateDocument()">✅ Validate</button>

        <div class="auto-refresh">
            <span>Auto-refresh:</span>
            <div class="toggle {{ 'active' if auto_refresh else '' }}" onclick="toggleAutoRefresh(this)">
                <div class="toggle-slider"></div>
            </div>
            <span id="refresh-timer">{{ refresh_interval }}s</span>
        </div>
    </div>

    <div class="preview-container">
        <iframe id="pdf-preview" src="/pdf"></iframe>
    </div>

    <div class="info">
        <div>Document: {{ doc_name }}</div>
        <div>Pages: {{ page_count }}</div>
        <div>Size: {{ doc_size }}</div>
    </div>

    <div class="loading" id="loading">
        <div class="spinner"></div>
        <p style="margin-top: 10px;">Exporting...</p>
    </div>

    <script>
        let autoRefreshEnabled = {{ 'true' if auto_refresh else 'false' }};
        let refreshInterval = {{ refresh_interval }};
        let countdown = refreshInterval;

        function refreshPreview() {
            document.getElementById('loading').style.display = 'block';
            document.getElementById('pdf-preview').src = '/pdf?t=' + Date.now();
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 1000);
        }

        function exportNew() {
            document.getElementById('loading').style.display = 'block';
            fetch('/export', {method: 'POST'})
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        refreshPreview();
                    } else {
                        alert('Export failed: ' + data.message);
                    }
                    document.getElementById('loading').style.display = 'none';
                })
                .catch(error => {
                    alert('Error: ' + error);
                    document.getElementById('loading').style.display = 'none';
                });
        }

        function validateDocument() {
            window.open('/validate', '_blank');
        }

        function toggleAutoRefresh(element) {
            autoRefreshEnabled = !autoRefreshEnabled;
            element.classList.toggle('active');
            if (autoRefreshEnabled) {
                countdown = refreshInterval;
            }
        }

        // Auto-refresh logic
        setInterval(() => {
            if (autoRefreshEnabled) {
                countdown--;
                if (countdown <= 0) {
                    refreshPreview();
                    countdown = refreshInterval;
                }
                document.getElementById('refresh-timer').textContent = countdown + 's';
            }
        }, 1000);

        // Initial load
        window.addEventListener('load', () => {
            if (!{{ 'true' if has_pdf else 'false' }}) {
                exportNew();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                refreshPreview();
            }
            if (e.key === 'e' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                exportNew();
            }
        });
    </script>
</body>
</html>
'''

if FLASK_AVAILABLE:
    @app.route('/')
    def index():
        """Main preview page"""
        return render_template_string(HTML_TEMPLATE,
            connected=preview_server.connected,
            status=preview_server.export_status,
            last_update=datetime.now().strftime('%H:%M:%S'),
            auto_refresh=True,
            refresh_interval=preview_server.auto_refresh,
            has_pdf=preview_server.last_export is not None,
            doc_name=preview_server.document_info.get('name', 'Unknown'),
            page_count=preview_server.document_info.get('pages', 'N/A'),
            doc_size=f"{preview_server.document_info.get('size_mb', 0):.1f} MB"
        )

    @app.route('/pdf')
    def serve_pdf():
        """Serve the current PDF"""
        pdf_path = preview_server.get_latest_pdf()
        if pdf_path and os.path.exists(pdf_path):
            return send_file(pdf_path, mimetype='application/pdf')
        else:
            return "No PDF available. Please export from InDesign.", 404

    @app.route('/export', methods=['POST'])
    def export_pdf():
        """Trigger a new export"""
        pdf_path = preview_server.export_current_document()
        if pdf_path:
            return jsonify({
                'success': True,
                'path': pdf_path,
                'message': 'Export successful'
            })
        else:
            return jsonify({
                'success': False,
                'message': preview_server.export_status
            })

    @app.route('/validate')
    def validate():
        """Run validation on current PDF"""
        if preview_server.last_export:
            # Import and run validator
            from validate_document import DocumentValidator
            validator = DocumentValidator(preview_server.last_export)
            report = validator.validate_all()
            return jsonify(report)
        else:
            return jsonify({'error': 'No PDF to validate'}), 404

    @app.route('/status')
    def status():
        """Get server status as JSON"""
        return jsonify({
            'connected': preview_server.connected,
            'status': preview_server.export_status,
            'last_export': preview_server.last_export,
            'document_info': preview_server.document_info
        })

def main():
    """Run the preview server"""
    if not FLASK_AVAILABLE:
        print("❌ Flask is required. Install with: pip install flask")
        sys.exit(1)

    print("\n" + "="*60)
    print("🎨 INDESIGN LIVE PREVIEW SERVER")
    print("="*60)
    print("\n📌 Features:")
    print("  • Auto-export from InDesign")
    print("  • Live PDF preview with refresh")
    print("  • Document validation")
    print("  • Keyboard shortcuts (Ctrl+R refresh, Ctrl+E export)")
    print("\n🚀 Starting server on http://localhost:5000")
    print("="*60 + "\n")

    # Run Flask server
    app.run(debug=True, port=5000, host='0.0.0.0')

if __name__ == '__main__':
    main()