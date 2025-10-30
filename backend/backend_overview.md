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
-   Database / Auth: Supabase/Postgres
-   Containerization: Dockerfile is included
-   FastAPI entry point: `backend/app/main.py`
-   Folders:
    -   `backend/app/crud/`: Will contain database models and CRUD logic per business entity.
    -   `backend/app/integrations/`: Will contain one folder per integration with a primary module file (manual, per-integration implementation for now).
    -   `backend/app/docs/`: Will contain generated documentation that you can use for reference
    -   `backend/backend_overview.md`: This file. High-level instructions for how Supermaker should extend the template.

## Flow

### Planning Step: Instructions to make todolist for you to follow

#### Create specific list of todos for backend with the below requirements of a general flow

#CRUD REQUIREMENTS:

#### 1. Create a supabase database by following /app/crud/docs/supabase_setup.md

#### 2. Create necessary schemas

#### 3. Create necessary CRUD functions based on schemas and requirements using /app/crud/docs/schema_builder.md

Before beginning backend implementation, you must create a concise, actionable checklist of steps and save it to `backend/app/docs/backend_todos_<feature_name>.md`. This list must serve as a reference during implementation.

The checklist should include (at minimum):

-   Creating a supabase database by following /docs/supabase_setup.md
-   Creating necessary schemas by referencing and automatically pushing the schemas to supabase
-   Identified entities and planned CRUD endpoints
-   Required integrations and their endpoints/hooks
-   Auth and configuration dependencies
-   Validation models (request/response) to add
-   Logging/error handling touchpoints

For each entity, Supermaker should determine:

-   The fields that describe it (name, phone, status, etc.).
-   Which operations the business needs (create, view, edit, delete, list/search).

This definition becomes the source of truth for CRUD.

## Example of todo list

1. Make supabase database by following `/docs/supabase_setup.md`
2. Determine schemas required for app and create them using `/docs/schema_builder.md`
3. Create CRUD functions in the `/app/crud/` folder

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

-   Reference /docs/backend_rules.md for rules the LLM must follow when creating the backend.
