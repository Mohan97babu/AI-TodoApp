# Planify local Windows launcher (uses H2, no local Postgres required)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

# Read local .env; preserve explicitly supplied environment overrides.
$envPath = Join-Path $PSScriptRoot '.env'
if (Test-Path -LiteralPath $envPath) {
  foreach ($line in Get-Content -LiteralPath $envPath) {
    if ($line -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
      $key = $Matches[1]
      $value = $Matches[2].Trim().Trim('"').Trim("'")
      if (-not [Environment]::GetEnvironmentVariable($key, 'Process')) {
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
      }
    }
  }
}

if (-not $env:JWT_SECRET -or $env:JWT_SECRET.Length -lt 32 -or $env:JWT_SECRET.StartsWith('CHANGE_ME')) {
  throw 'Set a random JWT_SECRET of at least 32 characters in .env before starting. Copy .env.example to .env and replace the placeholders.'
}
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Java 17+ must be available on PATH.' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js and npm must be installed.' }

# Docker backend uses host.docker.internal; native Windows backend uses localhost.
if ($env:OPENAI_API_URL -and $env:OPENAI_API_URL.Contains('host.docker.internal')) {
  $env:OPENAI_API_URL = $env:OPENAI_API_URL.Replace('host.docker.internal', 'localhost')
}

$backendDir = Join-Path $PSScriptRoot 'backend'
$frontendDir = Join-Path $PSScriptRoot 'frontend'
$modelDir = if ($env:MODEL_HOME) { $env:MODEL_HOME } else { 'E:\model' }
$gatewayScript = Join-Path $modelDir 'run_server.py'
$mavenBundle = Join-Path $PSScriptRoot 'tools\apache-maven-3.9.6\bin\mvn.cmd'
$maven = if (Test-Path $mavenBundle) { $mavenBundle } elseif (Get-Command mvn.cmd -ErrorAction SilentlyContinue) { 'mvn.cmd' } elseif (Get-Command mvn -ErrorAction SilentlyContinue) { 'mvn' } else { throw 'Maven 3.8+ is required on PATH or in tools\apache-maven-3.9.6\bin.' }

Write-Host 'Planify | starting local services' -ForegroundColor Cyan
if (Test-Path $gatewayScript) {
  Write-Host 'Starting local Qwen model gateway on 127.0.0.1:8000'
  $modelCmd = 'cd /d "' + $modelDir + '" && python run_server.py --host 127.0.0.1 --port 8000 --no-browser'
  Start-Process -FilePath 'cmd.exe' -ArgumentList @('/k', $modelCmd)
} else {
  Write-Warning "Model server not found at $gatewayScript. AI responses may use a fallback."
}

Write-Host 'Starting Spring Boot API (H2 dev profile) at http://localhost:8082'
$backendCmd = 'cd /d "' + $backendDir + '" && "' + $maven + '" spring-boot:run -Dspring-boot.run.profiles=h2'
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/k', $backendCmd)

if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
  Write-Host 'Installing frontend packages...'
  Push-Location $frontendDir
  try { npm ci; if ($LASTEXITCODE -ne 0) { throw 'npm ci failed' } }
  finally { Pop-Location }
}
Write-Host 'Starting React dev server at http://localhost:5174'
$frontendCmd = 'cd /d "' + $frontendDir + '" && npm run dev'
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/k', $frontendCmd)
Write-Host 'Service windows started. Check their logs if the UI cannot connect.' -ForegroundColor Green
Write-Host 'Open http://localhost:5174 and verify your sign-in and AI connection.'
