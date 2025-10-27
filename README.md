# Supermaker Template

Minimal instructions to boot the full stack with Docker.

## Prerequisites

- Docker Desktop (or Docker Engine) with Compose support.

## Run the stack

1. From the repository root, run:
   ```bash
   docker compose up --build
   ```
2. Wait for the images to build and services to start:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## Stop the stack

- Press `Ctrl+C` in the terminal where Compose is running.
- Optionally remove containers and images:
  ```bash
  docker compose down --rmi local
  ```
