# Planify PowerShell One-Click Launcher
$Host.UI.RawUI.WindowTitle = "Planify - AI Todo & Study Architect Launcher"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Planify | AI Todo Planner & Dev Assistant" -ForegroundColor Yellow
Write-Host "  Model: Qwen 3 (1.7B) Grounded in GeeksforGeeks, W3Schools, TPointTech" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start Local Model Server on Port 8000
Write-Host "[1/3] Starting Local Model Server on http://localhost:8000 (Serving Qwen 3)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\model'; python run_server.py --host 0.0.0.0 --port 8000 --no-browser"

Start-Sleep -Seconds 3

# 2. Start Spring Boot Backend on Port 8082
Write-Host "[2/3] Starting Spring Boot Backend on http://localhost:8082..." -ForegroundColor Green
$backendDir = Join-Path $PSScriptRoot "backend"
$mvnCmd = Join-Path $PSScriptRoot "tools\apache-maven-3.9.6\bin\mvn.cmd"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "$env:JAVA_HOME = 'C:\Program Files\Android\openjdk\jdk-21.0.8'; cd '$backendDir'; & '$mvnCmd' spring-boot:run -Dspring-boot.run.profiles=h2"

Start-Sleep -Seconds 3

# 3. Start React Frontend on Port 5174
Write-Host "[3/3] Starting React Frontend on http://localhost:5174..." -ForegroundColor Green
$frontendDir = Join-Path $PSScriptRoot "frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev"

Start-Sleep -Seconds 2
Start-Process "http://localhost:5174/"

Write-Host ""
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  ✅ All Planify services launched successfully!" -ForegroundColor Green
Write-Host "  - Frontend:      http://localhost:5174/" -ForegroundColor White
Write-Host "  - Backend REST:  http://localhost:8082/api" -ForegroundColor White
Write-Host "  - Local Model:   http://localhost:8000/v1 (Qwen 3 1.7B)" -ForegroundColor White
Write-Host "===============================================================================" -ForegroundColor Cyan
