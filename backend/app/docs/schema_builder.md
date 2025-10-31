## Minimal schema spec and non-interactive apply

This document defines a tiny, opinionated format that Supermaker can generate from a user prompt to create database schemas automatically in Supabase. Use either:

-   JSON spec (preferred for structured generation), or
-   direct SQL (if the LLM is confident to emit SQL).

A single tool (`app.crud.schema_tool`) converts JSON→SQL when needed and applies it to Supabase without human interaction.

### JSON spec (compact)

-   Top level: `{ schema?: string, tables: Table[] }`
-   Table: `{ name: string, columns: Column[], pk?: string[] , uniques?: string[][], fks?: FK[], indexes?: string[][] }`
-   Column: `{ name: string, type: string, nullable?: boolean, default?: string, unique?: boolean }`
-   FK: `{ columns: string[], ref_table: string, ref_columns: string[], on_delete?: "NO ACTION"|"CASCADE"|"SET NULL" }`

Notes:

-   Types must be Postgres types (e.g., `uuid`, `text`, `timestamptz`, `integer`).
-   Defaults are injected verbatim (e.g., `gen_random_uuid()`, `now()`, `'pending'`).
-   Unique constraints are implemented as unique indexes for idempotency.
-   Foreign keys are added via a guarded block to avoid duplicates.
-   If `schema` is omitted, the tool derives one from `--app-name` or uses `app`.

Example JSON (inline, not a separate file):

```json
{
    "schema": "acme_crm",
    "tables": [
        {
            "name": "users",
            "columns": [
                {
                    "name": "id",
                    "type": "uuid",
                    "nullable": false,
                    "default": "gen_random_uuid()"
                },
                {
                    "name": "email",
                    "type": "text",
                    "nullable": false,
                    "unique": true
                },
                {
                    "name": "created_at",
                    "type": "timestamptz",
                    "nullable": false,
                    "default": "now()"
                }
            ],
            "pk": ["id"]
        },
        {
            "name": "leads",
            "columns": [
                {
                    "name": "id",
                    "type": "uuid",
                    "nullable": false,
                    "default": "gen_random_uuid()"
                },
                { "name": "owner_id", "type": "uuid", "nullable": false },
                { "name": "name", "type": "text", "nullable": false },
                {
                    "name": "status",
                    "type": "text",
                    "nullable": false,
                    "default": "'new'"
                }
            ],
            "pk": ["id"],
            "fks": [
                {
                    "columns": ["owner_id"],
                    "ref_table": "users",
                    "ref_columns": ["id"],
                    "on_delete": "CASCADE"
                }
            ],
            "indexes": [["owner_id"], ["status"]]
        }
    ]
}
```

### Direct SQL option

If the LLM can confidently emit SQL, you may pass raw SQL directly to the tool. Include:

-   `CREATE EXTENSION IF NOT EXISTS "pgcrypto";` if using `gen_random_uuid()`
-   `CREATE SCHEMA IF NOT EXISTS "<schema>";`
-   `SET search_path TO "<schema>", public;`

### Apply to Supabase

Environment variables (from `backend/supabase.env` or the environment):

-   `SUPABASE_PROJECT_ID`: project ref (used to derive host `db.<ref>.supabase.co`)
-   `SUPABASE_DB_PASSWORD`: database password
-   Optional overrides: `SUPABASE_DB_HOST`, `SUPABASE_DB_USER` (default `postgres`), `SUPABASE_DB_NAME` (default `postgres`), `SUPABASE_DB_PORT` (default `5432`)

CLI usage:

```bash
source backend/supabase.env

# JSON from a file
python -m app.crud.schema_tool --app-name "Acme CRM" --json-file /path/to/schema.json

# JSON from stdin
cat /path/to/schema.json | python -m app.crud.schema_tool --app-name "Acme CRM" --json-stdin

# JSON passed inline (quote carefully)
python -m app.crud.schema_tool --json '{"schema":"acme","tables":[]}'

# Direct SQL
python -m app.crud.schema_tool --sql-file /path/to/schema.sql

# Dry-run to print SQL without applying
python -m app.crud.schema_tool --json-file /path/to/schema.json --dry-run --out-sql /tmp/schema.sql
```

The tool is idempotent where possible (`CREATE IF NOT EXISTS`, guarded FKs, unique indexes). It fails fast with clear error messages when the database rejects a statement.
