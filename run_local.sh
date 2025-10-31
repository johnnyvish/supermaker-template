#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

BACKEND_PORT="8001"
FRONTEND_PORT="3001"

echo "Starting services without Docker..."
echo "- Backend (FastAPI/uvicorn) on port ${BACKEND_PORT}"
echo "- Frontend (Next.js) on port ${FRONTEND_PORT}"

# Prefer uvicorn if installed globally; otherwise use python -m uvicorn
UVICORN_BIN="uvicorn"
if ! command -v uvicorn >/dev/null 2>&1; then
  UVICORN_BIN="python -m uvicorn"
fi

# Start backend
(
  cd "${ROOT_DIR}/backend"
  ${UVICORN_BIN} app.main:app --host 0.0.0.0 --port "${BACKEND_PORT}" --reload
) &
BACKEND_PID=$!

# Start frontend
(
  cd "${ROOT_DIR}/frontend"
  npm run dev -- -p "${FRONTEND_PORT}"
) &
FRONTEND_PID=$!

cleanup() {
  echo "\nShutting down services..."
  # Try to terminate gracefully first
  kill ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null || true
  # Give processes a moment to exit, then force kill if needed
  sleep 1
  kill -9 ${BACKEND_PID} ${FRONTEND_PID} 2>/dev/null || true
}

trap cleanup INT TERM EXIT

echo "\nBoth services started. Press Ctrl-C to stop."

# Wait for both processes to finish
wait ${BACKEND_PID} ${FRONTEND_PID}


