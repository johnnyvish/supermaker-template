# Create specific list of todos for backend with the below requirements of a general flow

#CRUD REQUIREMENTS:

## 1. Create a supabase database by following /app/crud/docs/supabase_setup.md

## 2. Create necessary schemas

## 3. Create necessary CRUD functions based on schemas and requirements using /app/crud/docs/schema_builder.md

Before beginning backend implementation, you must create a concise, actionable checklist of steps and save it to `backend/app/docs/backend_todos_<feature_name>.md`. This list must serve as a reference during implementation.

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
