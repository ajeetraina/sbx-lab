# Agent guidance for DevBoard

DevBoard is a small issue tracker: a FastAPI backend (`backend/`) and a Next.js frontend
(`frontend/`), started together with Docker Compose. It is the sample app of a Docker Sandboxes lab.
See [`README.md`](README.md) for how to run it.

## Rules

- **Never `git push` without explicit user confirmation.** Stage and commit when asked, then stop and ask before pushing.
- Keep changes small and focused on the task you were given. Do not reformat or refactor unrelated code.
- Never commit generated or local files: `*.db`, `.env`, `node_modules/`, `.next/`, `__pycache__/`.

## Commands

| Task                  | Command                                                                  |
|-----------------------|--------------------------------------------------------------------------|
| Install backend deps  | `cd backend && pip install -r requirements.txt`                          |
| Run backend tests     | `cd backend && pytest -v`                                                |
| Start the whole stack | `docker compose up --build -d` (from this directory)                     |
| Build the frontend    | `cd frontend && npm ci && npm run build`                                 |

## Conventions

- Backend: routers in `backend/app/routers/`, Pydantic schemas in `schemas.py`, models in `models.py`.
  Add or update a pytest test for every behaviour you change.
- Frontend: pages in `frontend/src/app/`, API calls only through `frontend/src/lib/api.ts`.
- Servers must listen on `0.0.0.0` (not `127.0.0.1`) so that sandbox port forwarding works.
- The backend tests use an in-memory SQLite database; they never need PostgreSQL.
