# Run from any PowerShell directory: .\start-docker.ps1
# Requires Docker Desktop; no Python, model files, Node, Java or local Ollama.
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$envFile = Join-Path $PSScriptRoot '.env'
$template = Join-Path $PSScriptRoot '.env.example'

function Get-RandomSecret {
    $bytes = New-Object byte[] 48
    $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
    return [Convert]::ToBase64String($bytes)
}

if (-not (Test-Path -LiteralPath $envFile)) {
    if (-not (Test-Path -LiteralPath $template)) { throw 'Missing .env.example' }
    $content = [System.IO.File]::ReadAllText($template)
    $content = $content.Replace('CHANGE_ME_TO_A_STRONG_DATABASE_PASSWORD', (Get-RandomSecret))
    $content = $content.Replace('CHANGE_ME_TO_A_RANDOM_64_CHARACTER_SECRET', (Get-RandomSecret))
    # The standalone Windows gateway is not used by Docker and must retain its own API key.
    [System.IO.File]::WriteAllText($envFile, $content, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host 'Created .env with freshly generated database and JWT credentials.' -ForegroundColor Green
} else {
    Write-Host 'Using existing .env without overwriting its secrets.' -ForegroundColor Cyan
}

$savedEnv = [System.IO.File]::ReadAllText($envFile)
if ($savedEnv -match '(?m)^\\s*(?:DB_PASSWORD|JWT_SECRET)\\s*=\\s*CHANGE_ME') {
    throw 'Update DB_PASSWORD and JWT_SECRET in your existing .env. Never deploy placeholder credentials.'
}

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw 'Docker Desktop is required. Install and launch Docker Desktop first.'
}
docker compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'Docker Compose config validation failed.' }
Write-Host 'Starting PostgreSQL, Spring Boot, Nginx and private Ollama / Qwen3...' -ForegroundColor Cyan
Write-Host 'On a new machine, Docker downloads the model once into the ollama_data volume.'
docker compose up --build -d
if ($LASTEXITCODE -ne 0) { throw 'Docker stack startup failed. Run docker compose logs --tail 100.' }
docker compose ps
Write-Host 'Open http://localhost:5174/ after the containers finish starting.' -ForegroundColor Green
Write-Host 'Check the Qwen pull status with: docker compose logs -f ollama-init'
