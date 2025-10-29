#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   backend/scripts/bootstrap_supabase_project.sh "Acme CRM"
#
# Loads env from backend/supabase.env if present, then invokes the bootstrapper

APP_NAME=${1:-}
if [[ -z "${APP_NAME}" ]]; then
  echo "Usage: $0 <APP_NAME>"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [[ -f "${REPO_ROOT}/backend/supabase.env" ]]; then
  # shellcheck disable=SC1091
  source "${REPO_ROOT}/backend/supabase.env"
fi

cd "${REPO_ROOT}/backend/app" >/dev/null
python -m app.crud.supabase_db_bootstrap --app-name "${APP_NAME}" --mode project

