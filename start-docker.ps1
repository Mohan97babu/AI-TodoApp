# Planify Docker Compose Launcher
$Host.UI.RawUI.WindowTitle = "Planify - Docker Compose Launcher"

Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "  🐳 Starting Planify via Docker Compose (Postgres + Backend + Frontend)" -ForegroundColor Yellow
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host ""

# Verify docker is available
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed or not in PATH." -ForegroundColor Red
    Write-Host "Please install Docker Desktop and start it before running this script." -ForegroundColor Yellow
    exit 1
}

# Run docker compose
Write-Host "Building and launching containers in detached mode..." -ForegroundColor Green
docker compose up --build -d

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Write-Host "  ✅ Planify containers launched successfully!" -ForegroundColor Green
    Write-Host "  - Frontend:      http://localhost:5174/" -ForegroundColor White
    Write-Host "  - Backend REST:  http://localhost:8082/api" -ForegroundColor White
    Write-Host "  - PostgreSQL:    localhost:5433 (db: tododb, user: postgres)" -ForegroundColor White
    Write-Host "===============================================================================" -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:5174/"
} else {
    Write-Host "❌ Failed to start containers via Docker Compose. Check Docker Desktop status." -ForegroundColor Red
}
