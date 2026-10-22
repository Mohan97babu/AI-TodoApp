# Install Windows Subsystem for Linux (WSL 2) for Docker Desktop
$Host.UI.RawUI.WindowTitle = "WSL 2 Installer for Docker Desktop"

# Elevate to Administrator if not already elevated
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Requesting Administrator privileges to install WSL..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-ExecutionPolicy Bypass", "-NoExit", "-File `"$PSCommandPath`""
    exit
}

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  🐧 Installing Windows Subsystem for Linux (WSL 2) for Docker Desktop" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install WSL
Write-Host "[1/3] Running 'wsl.exe --install --no-distribution'..." -ForegroundColor Green
try {
    wsl.exe --install --no-distribution
} catch {
    Write-Warning "Direct wsl install encountered a notice: $_"
}

# Step 2: Ensure latest WSL package via winget if wsl is still not detected
Write-Host "[2/3] Updating WSL package to latest version..." -ForegroundColor Green
try {
    wsl.exe --update
} catch {
    Write-Host "Trying winget installation for Microsoft.WSL..." -ForegroundColor Yellow
    winget install --id Microsoft.WSL --source winget --accept-source-agreements --accept-package-agreements
}

# Step 3: Set default version to 2
Write-Host "[3/3] Setting WSL default version to 2..." -ForegroundColor Green
try {
    wsl.exe --set-default-version 2
} catch {
    Write-Warning "WSL version setup will complete after reboot."
}

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  ✅ WSL setup completed!" -ForegroundColor Green
Write-Host "  IMPORTANT:" -ForegroundColor Yellow
Write-Host "  1. If Windows prompts you to restart your computer, please RESTART now." -ForegroundColor White
Write-Host "  2. After restarting, open 'Docker Desktop' and wait until it says 'Engine running'." -ForegroundColor White
Write-Host "  3. Then run: .\start-docker.ps1" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to close this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
