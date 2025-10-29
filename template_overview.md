## Project Overview

This repository is a full stack template used by our internal AI coding agent, Supermaker. Supermaker takes a plain English request from a user (for example: "Build me a lead tracker where I can log prospects, update their status, and send them SMS follow-ups") and generate a working frontend and backend for that use case.

This repository acts as the base template Supermaker will clone and extend for each new client project.

We keep this template consistent and opinionated so that:
• All generated frontends and backends follow the same structure.
• It is easy to maintain and support these projects across different clients.
• We can meet enterprise expectations (security, auditability, documentation).

## Current Tech Stack (v1)

### Frontend

-   Language / Framework: Next.js 16 + React 19 + TypeScript 5
-   Routing: App Router under `frontend/src/app/`
-   Styling: Tailwind CSS v4 + PostCSS
-   Linting: ESLint 9 with `eslint-config-next`
-   Assets: `frontend/public/`
-   Entrypoint (app): `frontend/src/app/page.tsx`
-   Containerization: Dockerfile included at `frontend/Dockerfile`
-   Recommended Node version: Node.js 18.18+ (or 20+)
-   Useful folders:
    -   `frontend/src/app/components/`: Reusable UI components
    -   `frontend/types/`: Shared TypeScript types and validators
    -   `frontend/public/`: Static assets (images, SVGs)

### Backend

-   Language / Framework: Python + FastAPI
-   Database / Auth: Supabase/Postgres planned (not wired in v1)
-   Containerization: Dockerfile included at `backend/Dockerfile`
-   Entrypoint (app): `backend/app/main.py`
-   Integrations: `backend/app/integrations/<integration>/<integration>.py`
-   Docs: `backend/app/docs/`
-   CRUD (entities): `backend/app/crud/` (to be created per entity)

## Flow
First, explore the codebase and create a full list of todos for the user's request. Store this in `/todos/todos_<feature_name>.md`. 

Use this newly generated todo as reference when completing the below steps.

1. Navigate to backend_overview.md and complete all of the processes and subprocesses.
2. Navigate to frontend_overview.md and complete all of the processes and subprocesses.
