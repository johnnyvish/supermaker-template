## Overview

This template standardizes backend projects so they are easy to extend, test, and operate.

## Tech Stack (v1)

-   Language / Framework: Python + FastAPI
-   Database / Auth: Supabase (Postgres)
-   Containerization: Dockerfile
-   FastAPI entry point: `backend/app/main.py`

### Key Directories

-   `backend/app/crud/`: Entity models and CRUD logic per business entity
-   `backend/app/integrations/`: One folder per integration with a primary module file
-   `backend/app/docs/`: Backend docs (setup, schema builder, checklists)
-   `backend/backend_overview.md`: This guide

## Implementation Flow (LLM-ready)

1. Provision Supabase
    - Follow `backend/app/docs/supabase_setup.md`. Save credentials to `backend/supabase.env`.
2. Define and push schemas
    - Use `backend/app/docs/schema_builder.md` to draft tables, relations, and constraints.
    - Apply the schema to Supabase (automated or SQL).
3. Plan CRUD
    - Identify entities and their fields.
    - Decide operations: create, read, update, delete, list/search.
    - Note auth/config needs, validation models, logging/error touchpoints, and any required integrations.
    - Save a concise checklist to `backend/app/docs/backend_todos_<feature>.md`.
4. Implement CRUD
    - Add functions under `backend/app/crud/` for each operation.
    - Expose FastAPI routes and register them in `backend/app/main.py`.
5. Verify
    - Run locally and exercise endpoints. Add pagination/filters as needed.

### CRUD Route Pattern

-   POST `/entities`
-   GET `/entities/:id`
-   PATCH `/entities/:id`
-   DELETE `/entities/:id`
-   GET `/entities` (list; optional filters/pagination)

## Integrations (If Required)

1. Create `backend/app/integrations/<integration>/` with `<integration>.py`.
2. Implement client/service logic. Expose via FastAPI endpoints or helpers.
3. Use environment variables for credentials; never hardcode secrets.
4. Wire endpoints so the frontend or automations can trigger them safely.

Example structure:

```
backend/app/integrations/
| <integration1>/
|   <integration1>.py
| <integration2>/
|   <integration2>.py
```

## Rules

-   Follow `backend/docs/backend_rules.md` for conventions and guardrails when creating the backend.
