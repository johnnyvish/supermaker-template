## Dynamic Schema Builder (minimal)

Generate idempotent SQL for a Postgres schema from a small JSON spec, and optionally apply it to Supabase.

### Spec format (JSON)

-   `tables[]`:
    -   `name`: table name
    -   `columns[]`: `{ name, type, nullable?, default?, unique? }`
    -   `primary_key?`: array of column names
    -   `foreign_keys?`: `{ columns[], references_table, references_columns[], on_delete?, on_update? }`
    -   `indexes?`: `{ name?, columns[], unique? }`

See `backend/app/docs/example_schema_spec.json`.

### Generate SQL

```bash
# Print SQL to stdout
python backend/app/crud/dynamic_schema_builder.py \
  --schema test \
  --spec-file backend/app/docs/example_schema_spec.json \
  --stdout

# Or write to a file
python backend/app/crud/dynamic_schema_builder.py \
  --schema test \
  --spec-file backend/app/docs/example_schema_spec.json \
  --write-sql backend/app/docs/generated_schema.sql
```

### Apply directly to Supabase

Pass explicit DB connection flags (simple, no env magic):

```bash
python backend/app/crud/dynamic_schema_builder.py \
  --schema test \
  --spec-file backend/app/docs/example_schema_spec.json \
  --apply \
  --db-host db.<YOUR_PROJECT_REF>.supabase.co \
  --db-user postgres \
  --db-password '<YOUR_DB_PASSWORD>' \
  --db-name postgres
```

Notes:

-   SSL is required and enforced.
-   Use `gen_random_uuid()` defaults only if `pgcrypto` is enabled in your DB.
