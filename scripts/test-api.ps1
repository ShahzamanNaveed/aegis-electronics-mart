param()
$ErrorActionPreference = 'Stop'
$portalRoot = Split-Path $PSScriptRoot -Parent
Push-Location (Join-Path $portalRoot 'backend')
try {
    @'
import os
from dotenv import dotenv_values
import pytest

if not os.environ.get("PORTAL_TEST_POSTGRES_URL"):
    values = dotenv_values("../.env")
    direct = os.environ.get("PORTAL_MIGRATION_DATABASE_URL") or values.get("PORTAL_MIGRATION_DATABASE_URL")
    if not direct:
        raise SystemExit("Configure PORTAL_TEST_POSTGRES_URL or a direct PORTAL_MIGRATION_DATABASE_URL.")
    os.environ["PORTAL_TEST_POSTGRES_URL"] = direct
raise SystemExit(pytest.main(["-q", "--tb=short"]))
'@ | & ./.venv/Scripts/python.exe -
    if ($LASTEXITCODE -ne 0) { throw 'Backend tests failed.' }
} finally { Pop-Location }
