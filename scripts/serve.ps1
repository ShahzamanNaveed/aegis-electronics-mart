$ErrorActionPreference = 'Stop'
$portalRoot = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $portalRoot 'frontend')
try {
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build failed.' }
} finally { Pop-Location }
Push-Location (Join-Path $portalRoot 'backend')
try { & ./.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --no-access-log }
finally { Pop-Location }
