#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Defaults
BACKEND_PORT="8001"
FRONTEND_PORT="3001"

usage() {
  echo "Usage: $0 [--backend-port|-b <port>] [--frontend-port|-f <port>]" >&2
  echo "Defaults: backend 8001, frontend 3001" >&2
}

# Parse CLI args
while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--backend-port)
      BACKEND_PORT="$2"; shift 2 ;;
    --backend-port=*)
      BACKEND_PORT="${1#*=}"; shift ;;
    -f|--frontend-port)
      FRONTEND_PORT="$2"; shift 2 ;;
    --frontend-port=*)
      FRONTEND_PORT="${1#*=}"; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo "Unknown option: $1" >&2
      usage; exit 1 ;;
  esac
done

# Ensure backend Python environment and deps
echo "Ensuring backend Python environment and dependencies..."
VENV_DIR="${ROOT_DIR}/backend/.venv"
PYTHON_BIN="python3"
if ! command -v python3 >/dev/null 2>&1; then
  PYTHON_BIN="python"
fi
if [ ! -d "${VENV_DIR}" ]; then
  ${PYTHON_BIN} -m venv "${VENV_DIR}"
fi
"${VENV_DIR}/bin/python" -m pip install --upgrade pip setuptools wheel
"${VENV_DIR}/bin/pip" install -r "${ROOT_DIR}/backend/requirements.txt"

# Ensure frontend node modules
echo "Ensuring frontend npm dependencies..."
(
  cd "${ROOT_DIR}/frontend"
  if [ ! -d "node_modules" ]; then
    npm install
  fi
)

echo "Starting services without Docker..."
echo "- Backend (FastAPI/uvicorn) on port ${BACKEND_PORT}"
echo "- Frontend (Next.js) on port ${FRONTEND_PORT}"

# Use uvicorn from the virtual environment; fallback to python -m uvicorn
UVICORN_BIN="${VENV_DIR}/bin/uvicorn"
if [ ! -x "${UVICORN_BIN}" ]; then
  UVICORN_BIN="${VENV_DIR}/bin/python -m uvicorn"
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
  PORT="${FRONTEND_PORT}" npm run dev -- -p "${FRONTEND_PORT}"
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


