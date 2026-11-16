# DevBoard

A small developer issue and project tracker — the sample application for the **Docker Sandboxes with GitHub Copilot Lab**.

> [!WARNING]
> DevBoard is a demo app built for training and education. It contains intentional bugs and
> unfinished features (see [Known issues](#known-issues)), and it is not hardened for real use.

## Stack

| Layer          | Technology                                            |
|----------------|-------------------------------------------------------|
| Backend        | FastAPI, SQLAlchemy, PostgreSQL (SQLite for the tests) |
| Frontend       | Next.js (App Router), React, Tailwind CSS             |
| Infrastructure | Docker Compose                                        |

## Run it

From this directory:

```bash
docker compose up --build
```

| Service      | URL                          |
|--------------|------------------------------|
| Frontend     | http://localhost:3000        |
| API docs     | http://localhost:8000/docs   |
| API health   | http://localhost:8000/health |

Open the frontend, click **Register** to create an account, then create a project and some issues.

## Run the backend tests

```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest -v
```

Out of the box, **3 tests fail and 1 is marked `xfail`**. That is expected: they cover the known issues below.

## Known issues

These are the exercises of the lab. Each has a test or a visible symptom.

| # | Issue | Where | Symptom |
|---|-------|-------|---------|
| 1 | Pagination skips the first page: `skip` is `page * page_size` instead of `(page - 1) * page_size` | `backend/app/routers/issues.py` | Two failing tests; in the UI, a project with 10 issues or fewer shows "No issues found" |
| 2 | `updated_at` never changes: the columns lack `onupdate=utcnow` | `backend/app/models.py` | `test_updated_at_changes_on_update` fails |
| 3 | Search is not implemented | `GET /projects/{id}/issues/search` | Returns `501`; `test_search_finds_matching_issues` is `xfail` |
| 4 | Email notifications are a stub | `backend/app/services/notifications.py` | Status changes are only logged |
| 5 | No per-issue authorization on update (reporter or assignee is not checked) | `update_issue` in `backend/app/routers/issues.py` | Not covered by the lab: only the project owner can reach the endpoint today |

## Project structure

```text
project/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, router registration, table creation
│   │   ├── models.py          # SQLAlchemy models (User, Project, Issue, Comment)
│   │   ├── schemas.py         # Pydantic request/response schemas
│   │   ├── auth.py            # JWT helpers, bcrypt password hashing
│   │   ├── config.py          # Settings (pydantic-settings)
│   │   ├── database.py        # Engine, session, Base
│   │   ├── routers/           # auth, projects, issues (CRUD + search), comments
│   │   └── services/
│   │       └── notifications.py   # Email notification service (stub)
│   └── tests/                 # pytest suite (in-memory SQLite)
├── frontend/
│   └── src/
│       ├── app/               # Next.js App Router pages (login, projects, project detail)
│       ├── components/        # Shared UI components
│       └── lib/api.ts         # Axios API client
├── kits/
│   ├── python/                # Mixin kit that adds Python to an agent's sandbox (Kits module)
│   ├── api-port/              # Mixin kit that publishes the API's port 8000 (Port forwarding module)
│   └── trivy/                 # Mixin kit that adds the Trivy scanner to an agent's sandbox (Kits and MCP modules)
├── prompts/                   # Prompt files used by the parallel agents exercise
└── docker-compose.yml
```
