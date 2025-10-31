## Supabase Setup and Bootstrap

This document explains how the LLM (or a developer) can create a Supabase project or a Postgres schema for a new app using the provided bootstrap utility.

### 1) Configure environment

Fill in credentials in `backend/supabase.env.example` and save as a secure env file (outside of git):

-   SUPABASE_MANAGEMENT_TOKEN: Supabase Management API token
-   SUPABASE_ORG_ID: Supabase organization ID
-   SUPABASE_DB_REGION: e.g., `us-east-1`
-   SUPABASE_DB_TIER: e.g., `free` or `payg`
-   SUPABASE_DB_PASSWORD: optional; if empty, a strong password will be generated
-   SUPABASE_PROJECT_NAME: optional; overrides the app name for project creation

### 2) Create a Supabase project (project mode)

Run the script with project creation mode:

```bash
source backend/supabase.env && \
python -m app.crud.supabase_db_bootstrap --app-name "Acme CRM" --mode project
```

If required variables are missing, the script will print an example API payload that can be used directly with the Supabase Management API.

### 3) Create only a Postgres schema (schema mode)

This prints the SQL to create a schema derived from your app name:

```bash
python -m app.crud.supabase_db_bootstrap --app-name "Acme CRM"
```

### 4) Persist new project credentials to env

After a successful project creation, update `backend/supabase.env` with the new project's details so the app and tools can use them.

When using the `--write-env` flag, the bootstrapper writes:

-   `SUPABASE_PROJECT_ID`: the project id (aka project ref)
-   `SUPABASE_PROJECT_NAME`: the project/app name
-   `SUPABASE_DB_PASSWORD`: the DB password used/generated during creation
-   `SUPABASE_URL`: derived from the project ref as `https://<ref>.supabase.co`
-   `SUPABASE_ANON_KEY`: fetched via the Management API (if token/permissions allow)
-   `SUPABASE_SERVICE_ROLE_KEY`: fetched via the Management API (if token/permissions allow)

Other fields like `SUPABASE_DB_REGION`, `SUPABASE_DB_TIER`, and `SUPABASE_ORG_ID` should already be present in your env.

Example (replace placeholder values):

```bash
# Do NOT commit this file to git
cat >> backend/supabase.env << 'EOF'
SUPABASE_PROJECT_ID=dlbqafqkbamozxqkzhdw
SUPABASE_PROJECT_NAME=test
SUPABASE_DB_PASSWORD=<STRONG_PASSWORD_USED_OR_GENERATED>
# The script will auto-populate these when possible; otherwise copy from Dashboard → Project Settings → API
SUPABASE_URL=<https://YOUR-PROJECT-REF.supabase.co>
SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR-SERVICE-ROLE-KEY>
EOF
```
