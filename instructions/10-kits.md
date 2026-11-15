# 🧩 Kits

Every agent you ran in this lab came from a **kit**. A kit is a declarative YAML artifact, published to a registry like an image, that describes an agent's sandbox: which image runs, how the agent starts, and what it is given (credentials, network policies, environment variables, startup commands and files).

Because all of that lives in one versioned artifact, the agent's environment, and the authority it gets, is reproducible and reviewable: a change in what an agent is allowed to do shows up as a change in its kit.

There are two kinds of kits:

| Kind | What it does | Example |
|------|--------------|---------|
| Agent kit (`kind: sandbox`) | Defines the agent: its image, entrypoint, default arguments, and what it needs | `sbx/copilot`, `sbx/claude` |
| Mixin | Extends an agent kit with a tool, a credential, a network rule, a file… | Added with `sbx run <agent> --kit <reference>` |

> [!NOTE]
> Kits are an experimental feature of `sbx`: the `sbx kit` commands and the `--kit` flag are marked as experimental.

## Inspect the Copilot kit

1. Show a summary of the kit that `sbx run copilot` uses:

    ```bash
    sbx kit inspect sbx/copilot
    ```

    ```none
      Name:         copilot
      Kind:         sandbox
      Schema:       v3
      Display:      GitHub Copilot
      Description:  GitHub Copilot CLI, GitHub's agentic coding CLI.
      Binary:       copilot
      Template:     docker.io/sbx/copilot@sha256:f9c2331f...
      Run Options:  --yolo
      Policies:     none
    ```

2. Show the kit's declaration itself:

    ```bash
    sbx kit inspect sbx/copilot --format yaml
    ```

    ```yaml
    schemaVersion: "3"
    kind: sandbox
    name: copilot
    displayName: GitHub Copilot
    description: GitHub Copilot CLI, GitHub's agentic coding CLI.
    sourceURL: https://github.com/docker-hardened-images/definitions
    sandbox:
      image: docker.io/sbx/copilot@sha256:f9c2331f...
      entrypoint:
      - copilot
      command:
        default:
        - --yolo
    ```

It's a small file, and it explains several things you saw in this lab:

| In the kit | What it means | Where you saw it |
|------------|---------------|------------------|
| `sandbox.image`, pinned by digest, built from Docker Hardened Images (`sourceURL`) | The sandbox's image: a minimal Debian image with the `agent` user and Docker, but no Python | [05](05-run-in-direct-mode.md): the agent had to install Python |
| `entrypoint: copilot` | `sbx run` starts the Copilot CLI | [03](03-first-sandbox.md) |
| `command.default: --yolo` | Copilot runs without asking for confirmations; arguments you pass after `--` are added to it | [03](03-first-sandbox.md), [06](06-parallel-agents.md) |
| No policies (`Policies: none`) | The kit allows no network destinations of its own | [01](01-network-policies.md): you allowed Copilot's hosts yourself |

## Compare with another agent kit

Kits describe every agent the same way. Inspect the Claude Code kit:

```bash
sbx kit inspect sbx/claude
```

It uses more of the format than the Copilot kit:

- **Arguments** (`model`, `reasoningEffort`): settings you can choose when you create a sandbox, with `--kit-arg model=...`.
- **Environment variables** (`Policies: Environment: 2 variables`), set inside the sandbox.
- An **AI file** (`/home/agent/.claude/CLAUDE.md`), where context for the agent is placed.

## Going further

- **Extend an agent with a mixin**: `sbx run copilot --kit ./my-mixin/`. A mixin can come from a local directory, a ZIP file, a Git repository or an OCI registry.
- **Build and share your own kits**: `sbx kit validate`, `sbx kit pack`, `sbx kit push` and `sbx kit pull`, and `sbx kit sign` and `sbx kit verify` to sign and check them.
- Read the [Docker Sandbox Kit specification](https://github.com/docker/sandbox-kit-spec) to see everything a kit can declare.

[[<< Previous: MCP servers](09-mcp-servers.md) | [Next >> Wrap up](11-wrap-up.md)]
