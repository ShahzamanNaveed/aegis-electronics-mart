# Aegis Electronics Mart

Current iteration: a fictional electronics storefront for the Aegis LLM security research target. It includes 60 products across 12 departments, structured product details, search and filters, comparisons, a persistent browser basket with server-calculated estimates, and the original Help Center with 12 guides. All products, brands, prices, inventory, and commercial terms are synthetic.

This release runs locally. It is not the complete commerce product or the vulnerability scanner. Simulated checkout, accounts, orders, tickets, staff tools, AI integration, and isolated vulnerability scenarios are future iterations. No payment or actual fulfillment takes place. There are no deliberate vulnerabilities in the public module. The source directory retains its original name to preserve existing setup paths.

## Requirements and first run

Use Node.js 24 LTS, npm, and Python 3.12. Dependency versions are recorded in `frontend/package-lock.json` and `backend/requirements-lock.txt`.

First configure the shared database using [the Neon setup guide](docs/neon-setup.md).
Copy `.env.example` to `.env` and supply the real connection strings. PostgreSQL is required
for the application and integration tests. The shared Neon database is already populated.

From this project directory in PowerShell:

```powershell
./scripts/setup.ps1
```

If Python 3.12 is not the default, pass its executable: `./scripts/setup.ps1 -Python 'C:/path/to/python.exe'`. The base Python needs pip 22.3 or newer. Setup creates the virtual environment, applies Alembic migrations, inserts public content, and installs frontend dependencies. Seeding is repeatable and never overwrites edited records.

Start two terminals:

```powershell
./scripts/dev-api.ps1
```

```powershell
./scripts/dev-web.ps1
```

Open http://127.0.0.1:5173. Stop either foreground process with Ctrl+C. For a build served by a single backend process, stop the development API and run `./scripts/serve.ps1`, then open http://127.0.0.1:8001. This mode also supports refreshing article deep links.

## Architecture

```text
frontend/src/
  components/   Shared navigation, search, article cards, status states, artwork
  pages/        Home, library, article, about and privacy routes
  catalog/      Product client, reusable cards/artwork, basket/comparison state
  api.ts        Typed HTTP client and query hooks
  topics.ts     Shared topic labels
  styles.css    Responsive design tokens and component styles
backend/app/
  api/          Bounded public HTTP routes
  schemas/      Explicit public response contracts
  services/     Search, filters, pagination and related-content queries
  db/           SQLAlchemy models and sessions
  core/         Environment configuration
  seed.py       Idempotent content loader
  catalog_seed.py   Idempotent synthetic product loader
  export_corpus.py  Published-only knowledge export for future retrieval
backend/migrations/  Versioned Alembic schema
fixtures/            Original public article content
```

React + TypeScript + Vite form the client. TanStack Query handles request state and cancellation. FastAPI provides public read APIs. SQLAlchemy, Psycopg and Alembic support the shared PostgreSQL database. Vite forwards `/api` to the backend during development; the built release uses one origin. Connection settings are listed in `.env.example`. The Free-plan Neon project is live in Singapore; the local backend connects to its shared database.

Search uses parameterized SQL over published content, requiring all search words. Help and product search are separate. Product search supports department, brand, price range, availability, and sorting. Public responses and knowledge exports exclude drafts. Inputs are bounded, errors return request IDs, and database errors use a generic public message. No LLM provider, analytics, or customer data is used. Search text appears in the browser URL; launch scripts disable access logs. Basket product IDs/quantities and comparison IDs use browser local storage. Quotes use database prices and stock, accept at most 20 different products and five units per product, and never reserve inventory or create orders.

## Catalog and future LLM knowledge

`fixtures/catalog.json` contains the full editable synthetic dataset. `scripts/generate_catalog.py` deterministically rebuilds that fixture from curated category definitions. The seed inserts missing records and deliberately does not overwrite local edits. Existing data changes should use reviewed migrations or a future staff editor.

From `backend`, run `./.venv/Scripts/python.exe -m app.export_corpus` to regenerate `fixtures/public-corpus.jsonl` from the current database. The initial export contains **396 sections**: six per product plus 36 help sections. Each has a stable document ID, source URL, source type, visibility, synthetic-data marker, version, and update time. This is a public knowledge corpus, not embeddings or an integrated LLM. Price/stock sections are export-time snapshots; an eventual assistant should query live inventory for current values. See `docs/mart-architecture.md` for the trust boundaries and next iterations.

Routes: `/` storefront, `/shop` catalog, `/products/:slug` details, `/compare`, `/basket`, `/help-center` support landing, and existing `/help` routes. Product APIs live under `/api/v1/catalog`; the OpenAPI contract is available as `/openapi.json`.

## Validation

```powershell
./scripts/test-api.ps1
cd backend
./.venv/Scripts/python.exe -m ruff check app migrations tests
cd ../frontend
npm.cmd run lint
npm.cmd run build
npx.cmd playwright install chromium
npm.cmd run test:e2e
```

Browser tests require both development servers above. They exercise desktop/mobile search, filters, pagination, article routes, empty/error recovery, responsive navigation, overflow, and axe WCAG A/AA checks. To test the single-origin build, set `$env:PORTAL_TEST_URL='http://127.0.0.1:8001'`. The default browser is Playwright Chromium. An installed Edge browser can be selected with `$env:PW_CHANNEL='msedge'`.

On a restricted environment that cannot write to the system temporary directory, set `TEMP` and `TMP` to a writable scratch directory before pytest or Playwright. API tests use isolated PostgreSQL schemas and do not mutate shared application tables.

## Iteration boundaries and release work

This is a validated foundation, not a claim of production readiness for the complete product. A hosted release still needs hosted deployment, backup/restore verification, monitoring, and operational ownership. Neon Free is the active shared database. Render Free remains the planned application host; deployment files are prepared but not deployed. Search currently uses substring matching, appropriate for this small library; reassess indexing as content grows.

Future modules must keep production-safe behavior and controlled vulnerability experiments separate. Never store actual credentials or customer information in test fixtures. The research identifier follows the agreed LLM08 Hidden Context Exposure scope; this iteration introduces no AI context yet.

Content changes to existing seeded rows should use an explicit data migration or a future staff editor. Editing fixtures only affects records not already present. Original guide text is general educational information and must not be presented as a manufacturer warranty or live service promise.
