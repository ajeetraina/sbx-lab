# 🧰 Give your agent tools with MCP

Your agent can only reach the hosts you allowed in the [network policies](01-network-policies.md) module. Sometimes it needs a capability rather than a website: that's what [MCP](https://modelcontextprotocol.io/) (Model Context Protocol) servers provide.

Each sandbox has an **MCP gateway**. The agent only talks to the gateway; the MCP servers you register run **outside** the sandbox, on your host or as remote services. You give the agent new tools without opening its network.

In this module you give your agent the **Docker Hardened Images (DHI)** MCP server, so it can look up a hardened alternative to an image DevBoard uses.

1. Register the DHI MCP server, from a terminal on your host:

    ```bash
    sbx mcp add dhi --url https://dhi.io/mcp
    ```

    If a browser window opens, sign in with your Docker account to authorize it.

2. Check that it's registered and ready:

    ```bash
    sbx mcp ls
    ```

    ```none
    NAME   TRANSPORT     STATUS   GATEWAY                 DETAIL
    dhi    remote http   ready    LOCAL, managed by you
    ```

3. Load it into your `quickstart` sandbox. No restart is needed:

    ```bash
    sbx mcp load dhi --sandbox quickstart
    ```

    You should see `Loaded MCP server dhi into sandbox quickstart`.

4. In your agent session (or a new one, with `sbx run --name quickstart`), give the agent this prompt:

    ```console
    Our backend image is python:3.12-slim (see backend/Dockerfile). Using the dhi MCP tools, in read-only mode (do not create or remove anything), find the Docker Hardened Image that matches it and how many known CVEs it has. At the end, list the tools you called.
    ```

    The agent calls tools such as `dhi_get_repository` and `dhi_get_image_cves`, and suggests `dhi/python:3.12` along with its CVE count. If it says that it has no `dhi` tools, exit the session and reconnect.

    > [!IMPORTANT]
    > The DHI server also has tools that change things (creating and removing mirrors in your Docker organization). That's why the prompt asks for read-only use: always check which tools an agent calls.

5. Look at the sandbox's network activity:

    ```bash
    sbx policy log quickstart
    ```

    You won't find the DHI calls there, and you didn't add any network rule: the agent only talks to the gateway (`mcp-gateway.docker.internal`), and the gateway reaches the MCP server from outside the sandbox.

> [!WARNING]
> Registering an MCP server is a trust decision. It runs outside the sandbox, with your host's permissions (local servers) or under the remote service's control, so the sandbox's network policy doesn't apply to it. Only register servers you trust.

[[<< Previous: Port forwarding](08-port-forwarding.md) | [Next >> Wrap up](10-wrap-up.md)]
