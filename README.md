# Docker Sandboxes with GitHub Copilot Lab

👋 Welcome to the **Docker Sandboxes with GitHub Copilot Lab**!

In this hands-on lab you will use GitHub Copilot inside a [Docker Sandbox](https://docs.docker.com/ai/sandboxes/) to work on **DevBoard**, a small issue tracker (FastAPI + Next.js) located in the [`project/`](project/) folder. Along the way you will see how sandboxes keep your machine, your files and your credentials safe while an AI agent does real work.

**Duration:** about 60-90 minutes.

## What you will learn

- Control what an agent can reach on the network with **network policies**
- Understand how **kits** define an agent's sandbox, and build your own
- Give an agent access to services without ever exposing your **credentials**
- Run an agent in **direct mode** and in isolated **clone mode**, and run several agents **in parallel**
- Monitor sandboxes from the **TUI dashboard**
- Run **Docker inside a sandbox** and reach it from your browser with **port forwarding**
- Give your agent tools through the sandbox's **MCP gateway**

## Table of contents

| #  | Module | You will... |
|----|--------|-------------|
| 00 | [Prerequisites](instructions/00-prerequisites.md) | Check your accounts and tools |
| 01 | [Network policies](instructions/01-network-policies.md) | Lock the network down, then allow what you need |
| 02 | [Kits](instructions/02-kits.md) | See how an agent's sandbox is defined, and build a kit |
| 03 | [Secrets and credentials](instructions/03-secrets-credentials.md) | Store a token the agent can use but never read |
| 04 | [First sandbox](instructions/04-first-sandbox.md) | Create a sandbox and meet your agent |
| 05 | [TUI dashboard](instructions/05-tui-dashboard.md) | Monitor sandboxes and network activity |
| 06 | [Run in direct mode](instructions/06-run-in-direct-mode.md) | Let the agent fix failing tests in your working tree |
| 07 | [Clone mode and parallel agents](instructions/07-parallel-agents.md) | Run isolated agents side by side and merge their work |
| 08 | [Docker inside the sandbox](instructions/08-docker-inside-the-sandbox.md) | Start the full app with Docker Compose in a sandbox |
| 09 | [Port forwarding](instructions/09-port-forwarding.md) | Open the app running in the sandbox in your browser |
| 10 | [MCP servers](instructions/10-mcp-servers.md) | Give your agent a tool without opening its network |
| 11 | [Wrap up](instructions/11-wrap-up.md) | Clean up and find out where to go next |

Stuck? See [Troubleshooting](instructions/troubleshooting.md).

## Getting started

1. Fork the [`mathieu-benoit/sbx-lab`](https://github.com/mathieu-benoit/sbx-lab) repository.

2. Clone your fork locally:

    ```bash
    git clone https://github.com/YOUR-GITHUB-USERNAME/sbx-lab
    cd sbx-lab
    ```

3. Open this `README.md` and follow the modules in order.

Enjoy!

[[Next >> Prerequisites](instructions/00-prerequisites.md)]
