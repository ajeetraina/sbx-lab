# Maintainer notes

This repository is the **Docker Sandboxes with GitHub Copilot Lab**: a guided lab (`README.md` and `instructions/`) built around the DevBoard sample app in `project/`. The agent guidance for the sample app itself lives in [`project/AGENTS.md`](project/AGENTS.md).

## Rules

- **Never `git push` without explicit user confirmation.** Stage and commit when asked, then stop and ask before pushing.

## Keeping the lab working

- The lab depends on the app's **intentional bugs**. Do not "fix" them in `main`: pagination (`backend/app/routers/issues.py`), `updated_at` (`backend/app/models.py`), search (501) and the notification stub. See [`project/README.md`](project/README.md#known-issues).
- Expected baseline of `cd project/backend && pytest -v`: **3 failed, 12 passed, 1 xfailed**. The `project-ci` workflow checks exactly which tests fail.
- After the exercises are completed, all tests pass (15 passed, plus the search test).
- Dependency bumps (Dependabot) are the main risk: check that `project-ci` is green, and run the whole lab once before each session.

## `sbx` CLI facts (checked against `sbx` v0.53 and the [docs](https://docs.docker.com/ai/sandboxes/))

- `sbx create` requires an explicit workspace path: `sbx create --name=foo claude .`
- `sbx run` infers the current directory: `sbx run claude`. Reconnect to an existing sandbox with `sbx run --name <sandbox-name>`.
- Clone mode (`--clone`) exposes the clone as the Git remote `sandbox-<name>` (branches `sandbox-<name>/<branch>`); the fetch only works while the sandbox is running.
- Multiple workspaces: the first path is the primary one (read-write); extra paths can be appended with `:ro` for read-only.
- `sbx policy` subcommands: `allow`, `deny`, `check`, `init`, `log`, `ls`, `reset`, `rm` (also `approval`, `inspect`, `profile`, `refresh`). Non-interactive reset: `sbx policy reset --force && sbx policy init balanced`.
- Secrets are global by default; use `--sandbox <name>` to scope one. Global secrets are injected at sandbox creation time.
- Copilot starts with `--yolo` by default; arguments after `--` are appended.
- Services must listen on `0.0.0.0` (not `127.0.0.1`) for port forwarding to work.
- `host.docker.internal` reaches host services from inside a sandbox.
- `SBX_NO_TELEMETRY=1` disables telemetry.

## Roadmap ideas

- Add a module on **Kits** (see the [kit specification](https://github.com/docker/sandbox-kit-spec)).
- Add a final module: VS Code, SSH, and a sandbox.
