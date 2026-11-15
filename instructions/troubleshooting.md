# 🛟 Troubleshooting

Run `sbx diagnose` first: it checks the most common installation problems.

| Problem | Solution |
|---------|----------|
| `sbx create` fails because the sandbox name already exists | Remove the old sandbox with `sbx rm <name>` (see the names with `sbx ls`), then create it again. |
| The agent can't install packages or reach a website | The lab runs with the **Locked Down** policy, so only the hosts allowed in [Network policies](01-network-policies.md#allow-only-what-the-lab-needs) are reachable. Check that those rules exist with `sbx policy ls`, then run `sbx policy log` to see which hosts were blocked. Allow what is needed with `sbx policy allow network <host>`, or use the **Network** panel of the TUI (`sbx`, then `Tab`). |
| `sbx policy ls` shows policies whose `SOURCE` is not `local` | Your organization manages your sandbox policies and some exercises may be blocked. Use a personal Docker account or ask your administrator. |
| The agent can't authenticate to GitHub or Copilot | Run `gh auth status`, then store the secrets again **before** creating the sandbox (see [Secrets and credentials](03-secrets-credentials.md)). Global secrets are injected at creation time, so recreate the sandbox if you added them afterwards. |
| `git fetch sandbox-<name>` fails | The sandbox must be running, and a sandbox stops when its agent session ends. Start it again without a new session with `sbx run --detach --name <name>`, then fetch. |
| `sbx run --clone` fails with `--clone requires a Git repository` | Run it from the root of the repository (`cd ..` if you are in `project/`), not from the `project` folder. |
| The agent says that Python (or Node.js) is not installed | The sandbox image doesn't include them. The agent is told how to install Python in `AGENTS.md`; if it still gives up, ask it to follow the "Sandbox environment" section of `AGENTS.md`. |
| `localhost:3001` or `localhost:8000` stopped answering | The sandbox stopped because no agent session was attached. Restart it with `sbx run --detach --name quickstart`; the services and the published ports come back by themselves. |
| The agent in the `mcp` sandbox has no `dhi` tools | Check that `sbx mcp ls` shows `dhi` as `ready` (run `sbx mcp add` again to re-authorize). A sandbox's MCP servers are set when it is created: if `mcp` was created before `dhi` was ready, load it with `sbx mcp load dhi --sandbox mcp`, then exit the agent session and reconnect with `sbx run --name mcp`. |
| `git merge` refuses to run because of local changes | Commit your changes first (`git add -A && git commit`). |
| The browser can't open the app on `localhost:3001` or `localhost:8000` | Check that the stack is still running in the sandbox (`docker ps` from the agent), that the ports are published (`sbx ports quickstart`), and that the servers listen on `0.0.0.0`. |
| Docker Compose in the sandbox is slow the first time | It has to pull images and install dependencies. Subsequent runs are much faster. |

Still stuck? [Open an issue](https://github.com/mathieu-benoit/sbx-lab/issues) and include the output of `sbx version` and `sbx diagnose`.

[[Home](../README.md)]
