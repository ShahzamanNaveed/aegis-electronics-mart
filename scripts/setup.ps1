param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
$portalRoot = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $portalRoot 'backend')
try {
    if (!(Test-Path '.venv/Scripts/python.exe')) {
        & $Python -m venv .venv
        if ($LASTEXITCODE -ne 0) { throw 'Creating the Python environment failed.' }
    }
    & $Python -m pip --python .venv/Scripts/python.exe install -r requirements-lock.txt
    if ($LASTEXITCODE -ne 0) { throw 'Installing backend dependencies failed.' }
    & ./.venv/Scripts/python.exe -m alembic upgrade head
    if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }
    & ./.venv/Scripts/python.exe -m app.seed
    if ($LASTEXITCODE -ne 0) { throw 'Seeding public content failed.' }
} finally { Pop-Location }
Push-Location (Join-Path $portalRoot 'frontend')
try {
    npm.cmd ci
    if ($LASTEXITCODE -ne 0) { throw 'Installing frontend dependencies failed.' }
} finally { Pop-Location }
Write-Host 'Ready. Start scripts/dev-api.ps1 and scripts/dev-web.ps1 in separate terminals.'
