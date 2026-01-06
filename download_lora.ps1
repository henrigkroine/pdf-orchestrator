# Download and install Lora font
$loraUrl = 'https://fonts.google.com/download?family=Lora'
$zipPath = 'C:\Users\ovehe\Downloads\Lora.zip'
$extractPath = 'C:\Users\ovehe\Downloads\Lora'

Write-Host "Downloading Lora font..." -ForegroundColor Green
try {
    Invoke-WebRequest -Uri $loraUrl -OutFile $zipPath
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Download failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Extracting font files..." -ForegroundColor Yellow
Expand-Archive -Path $zipPath -DestinationPath $extractPath -Force

Write-Host "Font files extracted!" -ForegroundColor Green
$fonts = Get-ChildItem -Path $extractPath -Filter '*.ttf' -Recurse
Write-Host "Found $($fonts.Count) font files:"
$fonts | Select-Object Name

Write-Host "`nTo install fonts:" -ForegroundColor Cyan
Write-Host "1. Open C:\Users\ovehe\Downloads\Lora"
Write-Host "2. Select all .ttf files"
Write-Host "3. Right-click and choose 'Install for all users'"
Write-Host "4. Restart InDesign to use the fonts"