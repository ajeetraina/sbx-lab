# Maintainer notes (not for participants or agents)

This repository is the **Docker Sandboxes with GitHub Copilot Lab**: a guided lab (`README.md` and `instructions/`) built around the DevBoard sample app in `project/`. The agent guidance for the sample app itself lives in [`project/AGENTS.md`](project/AGENTS.md) and the root [`AGENTS.md`](AGENTS.md).

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
- `sbx policy` subcommands: `allow`, `deny`, `check`, `init`, `log`, `ls`, `reset`, `rm` (also `approval`, `inspect`, `profile`, `refresh`). Non-interactive reset: `sbx policy reset --force && sbx policy init deny-all` (or `balanced`).
- The lab runs with the **deny-all** policy plus the allow list in module 01 (*Allow only what the lab needs*). It was derived from `sbx policy log` of a full run (Copilot Enterprise; `**.githubcopilot.com` also covers the Individual and Business subdomains). If the lab starts using a new host (dependency, image, registry), add it there. A full run of modules 06-09 under this policy (`sbx` v0.53.0, Copilot Enterprise) had no blocked hosts other than Next.js telemetry, which Compose now disables.
- Secrets are global by default; use `--sandbox <name>` to scope one. Global secrets are injected at sandbox creation time.
- Copilot starts with `--yolo` by default; arguments after `--` are appended.
- Services must listen on `0.0.0.0` (not `127.0.0.1`) for port forwarding to work.
- `host.docker.internal` reaches host services from inside a sandbox.
- `SBX_NO_TELEMETRY=1` disables telemetry.

## MCP module (checked with `sbx` v0.53.0)

- Remote MCP servers (`--url https://...`) work in local sandboxes and can be loaded live with `sbx mcp load NAME --sandbox SANDBOX`; their tools show up directly in the agent's tool list. Module 10 creates a dedicated `mcp` sandbox with `--static-mcp dhi` (gateway with exactly that server and no discovery tools): tested end to end. Loading into a `--static-mcp none` sandbox with `sbx mcp load` also works.
- Image servers (`--url dhi.io/fetch-mcp:latest`) did not work: `sbx mcp load` fails with `409 ... has no control-plane MCP gateway; cannot add a remote server live`, and with `--static-mcp` the gateway starts with no backend. `--local` and `--command docker ...` servers need Docker on the host, which the lab doesn't require. Hence the remote DHI server in module 10.
- The DHI MCP server also exposes write tools (`dhi_create_mirror`, `dhi_remove_mirror`); the module's prompt only asks for look-ups and for the list of tools called (in the test, the agent used only `dhi_get_tag_definition` and `dhi_get_repository`).
- Registration with a fresh account (`sbx mcp add dhi --url https://dhi.io/mcp`, browser sign-in) was not re-tested: the test machine already had it registered.

## Kits module (checked with `sbx` v0.53.0)

- Module 02 (right after the network policies) shows `sbx kit inspect sbx/copilot` (table and `--format yaml`) and compares with `sbx/claude`. The sample outputs include image digests, which change when the kits are updated.
- The `sbx` CLI shows agent kits as `kind: sandbox` with a `sandbox:` block (image, entrypoint, command), while the [kit specification](https://github.com/docker/sandbox-kit-spec) repository describes `workload` and `mixin` kits with `capabilities:`. Agent kits are shown the way `sbx` prints them; the Python mixin uses the specification's format (`kind: mixin`, `capabilities:`), which `sbx` accepts.
- The Python mixin (`project/kits/python/python.yaml`, v3 format) validates, inspects and installs Python at `sbx create` time (tested). `sbx kit pack` doesn't accept it: it requires a `spec.yaml`, an older artifact format, so the module doesn't use `pack`. Remote kits (Git or OCI) are refused unless their publisher is in `kit.allowedSources`; the module explains this rather than asking participants to change the setting.
- `sbx kit inspect sbx/copilot` reports `Policies: none`, but every Copilot sandbox gets a `kit` policy allowing Copilot's own hosts (`api.*.githubcopilot.com`, `api.github.com`, `github.com`, `copilot.github.com`). The Copilot telemetry hosts and `cafe.github.com` aren't in it, which is one reason module 01 still allows `**.githubcopilot.com` and `**.github.com`.

## Roadmap ideas

- The first sandbox (`quickstart`, module 04) is created with the Python mixin (`--kit ./kits/python`). The clone-mode sandboxes of module 07 aren't, so they still rely on the "install Python" fallback in `AGENTS.md`, and module 01 still allows the Debian and PyPI hosts globally. Next step: add the kit to the module 07 commands (untested with `--clone`), then drop the fallback.
- Add a final module: VS Code, SSH, and a sandbox.
