## Project Purpose

This folder is a backend template used by our internal AI coding agent, Supermaker. Supermaker’s job is to take a plain English request from a user (for example: "Build me a lead tracker where I can log prospects, update their status, and send them SMS follow-ups") and generate a working backend for that use case.

Input: natural language requirements.
Output: production-ready backend code with:

-   a database and CRUD operations,
-   any required external integrations (SMS, billing, EHR, etc.),
-   API documentation that the frontend can consume directly.

This repository acts as the base template Supermaker will clone and extend for each new client project.

We keep this template consistent and opinionated so that:

-   All generated backends follow the same structure.
-   It is easy to maintain and support these projects across different clients.
-   We can meet enterprise expectations (security, auditability, documentation).

## Current Tech Stack (v1)

-   Language / Framework: Python + FastAPI
-   Database / Auth: Will use Supabase/Postgres in future steps (not yet wired in v1)
-   Containerization: Dockerfile is included
-   Entrypoint: `backend/app/main.py`
-   Folders:
    -   `backend/app/crud/`: Will contain database models and CRUD logic per business entity.
    -   `backend/app/integrations/`: Will contain one folder per integration with a primary module file (manual, per-integration implementation for now).
    -   `backend/app/docs/`: Will contain generated documentation that the frontend and client stakeholders can read.
    -   `backend/backend_overview.md`: This file. High-level instructions for how Supermaker should extend the template.

## Flow

### Planning Step: Backend TODOs

Before beginning backend implementation, the LLM must create a concise, actionable checklist of steps and save it to `backend/app/docs/backend_todos.md`. This list will serve as a reference during implementation.

The checklist should include (at minimum):

-   Identified entities and planned CRUD endpoints
-   Required integrations and their endpoints/hooks
-   Auth and configuration dependencies
-   Validation models (request/response) to add
-   Logging/error handling touchpoints

For each entity, Supermaker should determine:

-   The fields that describe it (name, phone, status, etc.).
-   Which operations the business needs (create, view, edit, delete, list/search).

This definition becomes the source of truth for CRUD.

## Add CRUD Logic

For each identified entity:

1. Create code under `backend/app/crud/` to:
    - Create a record
    - Read a record
    - Update a record
    - Delete a record
    - List records (with pagination if needed)
2. Expose these operations through FastAPI routes.
3. Register those routes in `backend/app/main.py` (either inline or by importing a router module).

CRUD endpoints should follow a consistent pattern, for example:

-   POST `/leads`
-   GET `/leads/:id`
-   PATCH `/leads/:id`
-   DELETE `/leads/:id`
-   GET `/leads` (list, with optional filters / pagination)

## Add Integrations (If Required)

If the user’s request includes external actions like:

-   "send a text reminder,"
-   "charge a credit card,"
-   "sync into our internal system,"

then Supermaker should determine which integrations are required.

Then, it should follow the below process:

1. Look for the relevant folder under `backend/app/integrations/<integration_name>/`.
2. Inside that folder, look for the primary module file named `<integration_name>.py` that contains the client/service logic.
3. Expose behavior through FastAPI endpoints or internal helper functions so the frontend (or automations) can trigger it safely.
4. Use environment variables for credentials, not hardcoded values.

Example structure:

```
backend/app/integrations/
| <integration1>/
|   <integration1>.py
| <integration2>/
|   <integration2>.py
```

## Supermaker Rules the LLM Must Follow

When Supermaker is generating a backend for a new project using this template:

1. Do not change the directory layout.
    - Use `crud/` for data logic.
    - Use `integrations/` for external services.
    - Use `docs/` for accessing information/rules for the LLM and to store final human-readable docs.
2. Do not hardcode secrets in code.
    - If an integration requires credentials, reference environment variables (e.g., `process.env.X` in Node style or `os.getenv("X")` in Python style, depending on the stack), and document those variables in `docs/`.
3. All routes must be reachable.
    - Any new routes you define must be registered with the FastAPI app in `main.py` so they are actually exposed to clients.
4. Document what you built.
    - Before finishing, write a Markdown file into `backend/app/docs/` that explains:
        - Entities and fields,
        - Endpoints,
        - Request/response examples,
        - Any integrations that exist.
5. Keep it simple.
    - Prefer predictable, boring patterns over being clever.
    - Prefer explicit functions over magic.
    - Prefer small, focused modules over huge files that try to do everything.
6. Follow Python PEP 8 style conventions.
    - Use descriptive names, consistent imports, appropriate line lengths, and clear spacing.

### Additional Backend MUST Conventions

#### Code Style and Structure

-   MUST use type hints on all public functions, classes, and FastAPI endpoints; avoid `Any` unless unavoidable.
-   MUST use `snake_case` for functions/variables, `PascalCase` for classes, `UPPER_SNAKE_CASE` for constants.
-   MUST avoid wildcard imports; group imports as stdlib, third-party, local; prefer absolute imports.
-   MUST keep modules small and focused; avoid files exceeding ~500 lines unless justified.

#### Docstrings and Comments

-   MUST include docstrings (Google or NumPy style) for public modules, classes, and functions.
-   MUST document Args, Returns, Raises; keep comments minimal and high-signal (no restating the obvious).

#### FastAPI Conventions

-   MUST declare endpoint signatures with typed `request` and `response_model` Pydantic models.
-   MUST return proper HTTP status codes: 201 (create), 200 (read/update), 204 (delete), 400/401/403/404/422 for errors.
-   MUST register all routers in `backend/app/main.py` so routes are reachable.
-   MUST use dependency injection (FastAPI `Depends`) for auth, config, and clients (no hidden globals).
-   MUST keep endpoints `async def`; avoid blocking I/O in event loop; if needed, offload via threadpool.

#### Validation and Schemas

-   MUST validate all inputs/outputs with Pydantic models; no untyped `dict` in handlers.
-   MUST use constrained types (e.g., `constr`, `conint`, `EmailStr`) and validators for domain rules.
-   MUST version schemas if breaking changes are introduced.

#### Error Handling

-   MUST not use bare `except`; catch specific exceptions.
-   MUST map domain/integration errors to `fastapi.HTTPException` with consistent detail codes/messages.
-   MUST centralize shared error definitions/utilities under `backend/app/core/errors.py`.

#### Integrations

-   MUST use folder-per-integration under `backend/app/integrations/<integration_name>/<integration_name>.py`.
-   MUST implement timeouts and retries with backoff; respect documented rate limits.
-   MUST translate integration errors to domain/HTTP errors; no raw exceptions leaking to clients.
-   MUST keep integration clients stateless or lifecycle-managed; avoid global singletons without startup/shutdown hooks.

#### API Design and Consistency

-   MUST use plural noun resources (e.g., `/leads`), resource IDs as path params, filters as query params.
-   MUST implement list endpoints with `limit` and `offset` (defaults and max caps), and stable sorting.
-   MUST include consistent error response schema with a machine-readable `code` and human `message`.
