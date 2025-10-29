"""Dynamic Supabase/Postgres schema builder.

This utility generates idempotent SQL for creating a Postgres schema and its
objects (enums, tables, constraints, indexes, and optional seed data) from a
simple JSON specification. Designed so an LLM (or a developer) can describe the
data model declaratively and produce safe SQL for Supabase.

Example usage:
  python -m app.crud.dynamic_schema_builder \
    --app-name "Acme CRM" \
    --spec-file backend/app/docs/example_schema_spec.json \
    --write-sql backend/app/docs/generated_schema.sql

Notes:
- The output SQL is idempotent (uses IF NOT EXISTS where possible). For
  constraints where IF NOT EXISTS is not supported inline, guards are emitted.
- Execution is not performed by this script; use Supabase SQL Editor, psql, or
  a separate runner to execute the generated SQL.
"""

from __future__ import annotations

import argparse
import json
import os
import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any, Tuple

try:
    import psycopg
except Exception:  # pragma: no cover - optional at import time
    psycopg = None  # type: ignore


def derive_db_identifier(app_name: str) -> str:
    base = app_name.strip().lower()
    base = re.sub(r"[^a-z0-9]+", "_", base)
    base = re.sub(r"_+", "_", base).strip("_")
    if not base or not base[0].isalpha():
        base = f"app_{base}" if base else "app"
    return base[:63]


def quote_ident(ident: str) -> str:
    return '"' + ident.replace('"', '""') + '"'


def validate_identifier(ident: str) -> None:
    if not ident:
        raise ValueError("Identifier cannot be empty")
    if len(ident) > 63:
        raise ValueError("Identifier exceeds 63 characters: " + ident)


@dataclass
class ColumnSpec:
    name: str
    type: str
    nullable: bool = True
    default: Optional[str] = None  # raw SQL default (e.g., now(), gen_random_uuid())
    unique: bool = False


@dataclass
class ForeignKeySpec:
    columns: List[str]
    references_table: str
    references_columns: List[str]
    on_delete: Optional[str] = None  # e.g., CASCADE, SET NULL
    on_update: Optional[str] = None


@dataclass
class IndexSpec:
    name: Optional[str]
    columns: List[str]
    unique: bool = False


@dataclass
class TableSpec:
    name: str
    columns: List[ColumnSpec]
    primary_key: Optional[List[str]] = None
    foreign_keys: List[ForeignKeySpec] = field(default_factory=list)
    indexes: List[IndexSpec] = field(default_factory=list)


@dataclass
class SchemaSpec:
    schema: str
    tables: List[TableSpec] = field(default_factory=list)


def normalize_type(type_str: str) -> str:
    t = type_str.strip().lower()
    mapping = {
        "string": "text",
        "text": "text",
        "shorttext": "varchar(255)",
        "uuid": "uuid",
        "int": "integer",
        "integer": "integer",
        "bigint": "bigint",
        "float": "double precision",
        "double": "double precision",
        "decimal": "decimal",
        "numeric": "numeric",
        "bool": "boolean",
        "boolean": "boolean",
        "date": "date",
        "timestamp": "timestamp with time zone",
        "timestamptz": "timestamp with time zone",
        "json": "jsonb",
        "jsonb": "jsonb",
    }
    return mapping.get(t, type_str)


def load_spec(path: str, schema_name: str) -> SchemaSpec:
    with open(path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    tables: List[TableSpec] = []
    for t in raw.get("tables", []):
        columns: List[ColumnSpec] = []
        for c in t.get("columns", []):
            columns.append(
                ColumnSpec(
                    name=c["name"],
                    type=normalize_type(c["type"]),
                    nullable=bool(c.get("nullable", True)),
                    default=c.get("default"),
                    unique=bool(c.get("unique", False)),
                )
            )

        fks: List[ForeignKeySpec] = []
        for fk in t.get("foreign_keys", []):
            fks.append(
                ForeignKeySpec(
                    columns=list(fk["columns"]),
                    references_table=fk["references_table"],
                    references_columns=list(fk["references_columns"]),
                    on_delete=fk.get("on_delete"),
                    on_update=fk.get("on_update"),
                )
            )

        idxs: List[IndexSpec] = []
        for idx in t.get("indexes", []):
            idxs.append(
                IndexSpec(
                    name=idx.get("name"),
                    columns=list(idx["columns"]),
                    unique=bool(idx.get("unique", False)),
                )
            )

        tables.append(
            TableSpec(
                name=t["name"],
                columns=columns,
                primary_key=list(t.get("primary_key")) if t.get("primary_key") else None,
                foreign_keys=fks,
                indexes=idxs,
            )
        )

    return SchemaSpec(schema=schema_name, tables=tables)


def build_table_sql(schema: str, table: TableSpec) -> Tuple[str, List[str], List[str]]:
    schema_q = quote_ident(schema)
    table_q = quote_ident(table.name)

    column_defs: List[str] = []
    unique_index_after: List[str] = []

    for col in table.columns:
        validate_identifier(col.name)
        col_parts = [quote_ident(col.name), col.type]
        if not col.nullable:
            col_parts.append("NOT NULL")
        if col.default is not None:
            col_parts.append(f"DEFAULT {col.default}")
        column_defs.append(" ".join(col_parts))
        if col.unique:
            idx_name = f"{table.name}_{col.name}_uniq_idx"
            unique_index_after.append(
                f"CREATE UNIQUE INDEX IF NOT EXISTS {quote_ident(idx_name)}\n  ON {schema_q}.{table_q} ({quote_ident(col.name)});"
            )

    table_constraints: List[str] = []
    if table.primary_key:
        pk_cols = ", ".join(quote_ident(c) for c in table.primary_key)
        table_constraints.append(f"PRIMARY KEY ({pk_cols})")

    # No table-level unique constraints in simplified builder

    create_table_sql = (
        f"CREATE TABLE IF NOT EXISTS {schema_q}.{table_q} (\n  "
        + ",\n  ".join(column_defs + table_constraints)
        + "\n);"
    )

    # Foreign keys and indexes added after table creation for idempotency/guards
    alter_sql: List[str] = []
    index_sql: List[str] = []

    # Foreign keys
    for i, fk in enumerate(table.foreign_keys):
        constraint_name = f"{table.name}_fk_{i}"
        fk_cols = ", ".join(quote_ident(c) for c in fk.columns)
        ref_cols = ", ".join(quote_ident(c) for c in fk.references_columns)
        ref = f"{schema_q}.{quote_ident(fk.references_table)}"
        on_delete = f" ON DELETE {fk.on_delete}" if fk.on_delete else ""
        on_update = f" ON UPDATE {fk.on_update}" if fk.on_update else ""
        alter_sql.append(
            "DO $$\n"
            "BEGIN\n"
            f"  IF NOT EXISTS (\n"
            "    SELECT 1 FROM information_schema.table_constraints tc\n"
            "    WHERE tc.constraint_type = 'FOREIGN KEY'\n"
            f"      AND tc.table_schema = '{schema}'\n"
            f"      AND tc.table_name = '{table.name}'\n"
            f"      AND tc.constraint_name = '{constraint_name}'\n"
            "  ) THEN\n"
            f"    ALTER TABLE {schema_q}.{table_q}\n"
            f"      ADD CONSTRAINT {quote_ident(constraint_name)}\n"
            f"      FOREIGN KEY ({fk_cols}) REFERENCES {ref} ({ref_cols}){on_delete}{on_update};\n"
            "  END IF;\n"
            "END$$;"
        )

    # Indexes
    for idx in table.indexes:
        idx_name = idx.name or f"{table.name}_{'_'.join(idx.columns)}_idx"
        cols = ", ".join(quote_ident(c) for c in idx.columns)
        unique = "UNIQUE " if idx.unique else ""
        index_sql.append(
            f"CREATE {unique}INDEX IF NOT EXISTS {quote_ident(idx_name)}\n"
            f"  ON {schema_q}.{table_q} ({cols});"
        )

    # Column-level unique indexes after creation
    index_sql.extend(unique_index_after)

    return create_table_sql, alter_sql + index_sql, []


def _format_sql_value(value: Any) -> str:
    if value is None:
        return "NULL"
    if isinstance(value, bool):
        return "TRUE" if value else "FALSE"
    if isinstance(value, (int, float)):
        return str(value)
    # Treat everything else as string literal
    return "'" + str(value).replace("'", "''") + "'"


def generate_sql(spec: SchemaSpec) -> str:
    parts: List[str] = []
    # Schema
    parts.append(f"CREATE SCHEMA IF NOT EXISTS {quote_ident(spec.schema)};")

    # Tables
    for table in spec.tables:
        validate_identifier(table.name)
        create_sql, post_sql, seed_sql = build_table_sql(spec.schema, table)
        parts.append(create_sql)
        parts.extend(post_sql)
        parts.extend(seed_sql)

    return "\n\n".join(parts) + "\n"


def _apply_sql_with_args(sql: str, args: Any) -> None:
    if psycopg is None:
        raise SystemExit("psycopg is required. Install with: pip install 'psycopg[binary]' ")

    host = args.db_host
    password = args.db_password
    if not host:
        raise SystemExit("Provide --db-host")
    if not password:
        raise SystemExit("Provide --db-password")

    dsn = (
        f"host={host} port={args.db_port} dbname={args.db_name} "
        f"user={args.db_user} password={password} sslmode=require"
    )

    print(f"Applying SQL to {host}:{args.db_port}/{args.db_name} as {args.db_user} (SSL)...")
    with psycopg.connect(dsn) as conn:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    print("SQL applied successfully.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Dynamic schema builder")
    parser.add_argument("--app-name", help="Used to derive schema if --schema not provided")
    parser.add_argument("--schema", help="Target schema name (overrides --app-name)")
    parser.add_argument("--spec-file", required=True, help="Path to JSON schema spec")
    parser.add_argument("--write-sql", help="Write generated SQL to this file")
    parser.add_argument("--stdout", action="store_true", help="Print SQL to stdout")
    # Apply options (execute against Supabase Postgres)
    parser.add_argument("--apply", action="store_true", help="Apply generated SQL to Supabase Postgres")
    parser.add_argument("--db-host", help="Postgres host (defaults to db.<ref>.supabase.co derived from env)")
    parser.add_argument("--db-port", type=int, default=5432, help="Postgres port (default: 5432)")
    parser.add_argument("--db-name", default=os.getenv("SUPABASE_DB_NAME", "postgres"), help="Postgres DB name (default: postgres)")
    parser.add_argument("--db-user", default=os.getenv("SUPABASE_DB_USER", "postgres"), help="Postgres DB user (default: postgres)")
    parser.add_argument("--db-password", default=os.getenv("SUPABASE_DB_PASSWORD"), help="Postgres DB password (default: from env)")
    args = parser.parse_args()

    if not args.schema and not args.app_name:
        raise SystemExit("Provide --schema or --app-name")

    schema_name = args.schema or derive_db_identifier(args.app_name)
    spec = load_spec(args.spec_file, schema_name)
    sql = generate_sql(spec)

    wrote_any = False
    if args.write_sql:
        out_path = os.path.abspath(args.write_sql)
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(sql)
        print(f"Wrote SQL to: {out_path}")
        wrote_any = True

    if args.stdout or not wrote_any:
        print(sql)

    if args.apply:
        _apply_sql_with_args(sql, args)


if __name__ == "__main__":
    main()


