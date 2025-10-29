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
You must go to /docs/backend_todo.md and follow it to understand how to structure todos.

## Supermaker Rules the LLM Must Follow

-   Reference /docs/backend_rules.md for rules the LLM must follow when creating the backend.
