# Shared PostgreSQL setup

Status: Live Free-plan Neon project `aegis-electronics-mart` created in Singapore on
2026-10-10 through the existing Vercel integration. Project ID: `polished-breeze-48445145`.
Schema migrations and import completed: 60 products, 12 departments, 12 articles and 5 help
categories. Local backend credentials are saved in ignored `.env`.
Readiness, catalog listing/detail, help categories and basket quoting returned HTTP 200 against
the live database. The backend regression suite passed, with the API modules using isolated Neon schemas.
All migrated fields were verified against the original data. Ruff passed. In-app browser checks covered
catalog filtering and basket navigation; the standalone Playwright suite could not launch its
browser in the sandbox and is not claimed as passing for this migration.
Hosted website deployment remains pending. PostgreSQL-backed local preview: http://127.0.0.1:8004.

## Provision once

Create a project named `aegis-electronics-mart` on Neon's Free plan. Use a region close to the
eventual Render service, and keep one main branch/database for shared application data.
Obtain pooled and direct connection strings for the same branch and database.
Copy `.env.example` to `.env` at the project root and replace its example URLs locally.
Never commit credentials or put them into frontend variables. The application enforces verified
TLS for Neon hostnames and uses a small connection pool with connection health checks.

## Migrations and test data

The shared database is already populated. The one-time importer has been removed.
PostgreSQL is the only supported database engine. The disconnected legacy files in `.local`
remain pending deletion because shell approval policy blocked that cleanup.

From `backend`, apply future schema migrations with:

```powershell
./.venv/Scripts/python.exe -m alembic upgrade head
```

Migrations use `PORTAL_MIGRATION_DATABASE_URL` when set. Runtime uses `PORTAL_DATABASE_URL`.
For a new empty PostgreSQL installation, `python -m app.seed` inserts the sample content.

Run `./scripts/test-api.ps1` from the project root. It uses the direct connection from the
local `.env`, unless `PORTAL_TEST_POSTGRES_URL` is supplied explicitly. Each API test module
creates and removes its own random `aegis_test_...` schema; it never clears or seeds the shared
application tables. The role needs schema-creation permission. Running pytest directly requires
`PORTAL_TEST_POSTGRES_URL`; a missing connection fails clearly instead of using another engine.

## Hosting

The Dockerfile serves the built React app and FastAPI from one origin. `render.yaml` selects
the Free web-service plan and prompts for the pooled URL as a server secret. Run migrations
once from the maintainer's machine before deploying; web startup deliberately does not seed or
change the schema. Keep the direct migration credential off the hosted web service.
No Render deployment has been created yet. Docker build validation also remains pending.

Render's free filesystem is ephemeral; persistent relational data must remain in Neon. Keep
periodic PostgreSQL backups outside the web container. The free backend may sleep; wait for
`/api/v1/ready` before starting scanner timing. Stay within both providers' free quotas.

All testers use the deployed URL and the same database. Local developers need backend-only
credentials to access the shared data; only the maintainer applies schema migrations.
