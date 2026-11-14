# Docker Sandboxes with GitHub Copilot Lab

👋 Welcome to the **Docker Sandboxes with GitHub Copilot Lab**!

In this hands-on lab you will use GitHub Copilot inside a [Docker Sandbox](https://docs.docker.com/ai/sandboxes/) to work on **DevBoard**, a small issue tracker (FastAPI + Next.js) located in the [`project/`](project/) folder. Along the way you will see how sandboxes keep your machine, your files and your credentials safe while an AI agent does real work.

**Duration:** about 60-90 minutes.

## What you will learn

- Control what an agent can reach on the network with **network policies**
- Give an agent access to services without ever exposing your **credentials**
- Run an agent in **direct mode** and in isolated **clone mode**, and run several agents **in parallel**
- Monitor sandboxes from the **TUI dashboard**
- Run **Docker inside a sandbox** and reach it from your browser with **port forwarding**
- Give your agent tools through the sandbox's **MCP gateway**

## Table of contents

| #  | Module                                                              | You will...                                              |
|----|---------------------------------------------------------------------|----------------------------------------------------------|
| 00 | [Prerequisites](instructions/00-prerequisites.md)                   | Check your accounts and tools                            |
| 01 | [Network policies](instructions/01-network-policies.md)             | Lock the network down, then allow what you need          |
| 02 | [Secrets and credentials](instructions/02-secrets-credentials.md)   | Store a token the agent can use but never read           |
| 03 | [First sandbox](instructions/03-first-sandbox.md)                   | Create a sandbox and meet your agent                     |
| 04 | [TUI dashboard](instructions/04-tui-dashboard.md)                   | Monitor sandboxes and network activity                   |
| 05 | [Run in direct mode](instructions/05-run-in-direct-mode.md)         | Let the agent fix failing tests in your working tree     |
| 06 | [Clone mode and parallel agents](instructions/06-parallel-agents.md)| Run isolated agents side by side and merge their work    |
| 07 | [Docker inside the sandbox](instructions/07-docker-inside-the-sandbox.md) | Start the full app with Docker Compose in a sandbox |
| 08 | [Port forwarding](instructions/08-port-forwarding.md)               | Open the app running in the sandbox in your browser      |
| 09 | [MCP servers](instructions/09-mcp-servers.md)                       | Give your agent a tool without opening its network       |
| 10 | [Wrap up](instructions/10-wrap-up.md)                               | Clean up and find out where to go next                   |

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
