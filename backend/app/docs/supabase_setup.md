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

Paste the SQL into the Supabase SQL Editor (or execute via API/psql) for your target project database.

### 4) Persist new project credentials to env

After a successful project creation, update `backend/supabase.env` with the new project's details so the app and tools can use them.

When using the `--write-env` flag, the bootstrapper writes only:

-   `SUPABASE_PROJECT_ID`: the project id returned by the Management API
-   `SUPABASE_PROJECT_NAME`: the project/app name
-   `SUPABASE_DB_PASSWORD`: the DB password used/generated during creation

Other fields like `SUPABASE_DB_REGION`, `SUPABASE_DB_TIER`, and `SUPABASE_ORG_ID` should already be present in your env and are not modified by the flag. Optionally, you may also add (from Dashboard → Project Settings → API): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Example (replace placeholder values):

```bash
# Do NOT commit this file to git
cat >> backend/supabase.env << 'EOF'
SUPABASE_PROJECT_ID=dlbqafqkbamozxqkzhdw
SUPABASE_PROJECT_NAME=test
SUPABASE_DB_PASSWORD=<STRONG_PASSWORD_USED_OR_GENERATED>
# Optional (copy from Dashboard → Project Settings → API)
SUPABASE_URL=<https://YOUR-PROJECT-REF.supabase.co>
SUPABASE_ANON_KEY=<YOUR-ANON-KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR-SERVICE-ROLE-KEY>
EOF
```

Notes:

-   If the creation output does not include API URL/keys, retrieve them from the Supabase Dashboard under Project Settings → API.
-   Keep `backend/supabase.env` out of version control; use a secret manager or CI/CD env vars for production.

### Notes

-   Never commit secrets. Keep your env file out of version control.
-   For production, store secrets in a secret manager and set environment variables in CI/CD.
