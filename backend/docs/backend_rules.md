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