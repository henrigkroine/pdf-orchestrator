# PowerShell script to execute InDesign ExtendScript via COM automation

$scriptPath = "T:\Projects\pdf-orchestrator\create_indesign_doc.jsx"

try {
    Write-Host "Launching InDesign..."

    # Create InDesign COM object
    $indesign = New-Object -ComObject InDesign.Application

    Write-Host "InDesign launched successfully"
    Write-Host "Executing script: $scriptPath"

    # Read the script content
    $scriptContent = Get-Content $scriptPath -Raw

    # Execute the script
    $indesign.DoScript($scriptContent, 1246973031) # 1246973031 = idJavaScript language

    Write-Host "Script executed successfully!"
    Write-Host "New document with width 800pt and height 600pt has been created."

} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative method:"
    Write-Host "1. Open Adobe InDesign"
    Write-Host "2. Go to File > Scripts > Other Script..."
    Write-Host "3. Browse to: $scriptPath"
    Write-Host "4. Click Open to execute the script"
}
