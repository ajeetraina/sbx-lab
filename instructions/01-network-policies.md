# 🔒 Network policies

Every sandbox routes outbound HTTP/HTTPS through a host-side proxy that enforces access rules you define. There are three built-in postures:

| Policy      | Description                                                                          |
|-------------|--------------------------------------------------------------------------------------|
| Open        | All traffic allowed — no restrictions                                                |
| Balanced    | Default deny, with a broad allow-list covering AI APIs, npm, pip, GitHub, registries |
| Locked Down | Everything blocked; you explicitly allow what you need                               |

In this lab you will use **Locked Down**, and allow only the hosts the exercises need.

To view the existing policies, use the `sbx policy ls` command:

```bash
sbx policy ls
```

## Test the `Locked Down` network policies profile

Run this command to set the default:

```bash
sbx policy reset
```

The CLI restarts the daemon, resets the policies, and shows a picker. Choose the **Locked Down** option (all network traffic is blocked unless you allow it).

> [!TIP]
> To do the same without the interactive picker, run `sbx policy reset --force && sbx policy init deny-all`.

Check the configured policies:

```bash
sbx policy ls
```

You should now see this:

```none
  POLICY             SOURCE   APPLIES TO   SUMMARY
  default-deny-all   local    all          network: deny when no rule decides
  local-policy       local    all          filesystem read: 1 allow; filesystem write: 1 allow
```

Check whether `docker.com` is reachable under this policy:

```bash
sbx policy check network docker.com
```

You will see this message:

```none
    Denied:      docker.com:443
    Governance:  Local policy only
    Context:     global
    Reason:      no matching allow rule (default deny)
```

Run a simple sandbox with a shell (the first start can take a minute):

```bash
sbx run shell
```

Once the sandbox is created, try to reach `docker.com` from there:

```bash
curl docker.com
```

You will see this message:

```none
Approval required for docker.com:80.
```

Exit this sandbox to return to your host:

```bash
exit
```

## See what the sandbox is hitting

To view a list of the hosts that were allowed or blocked by the proxy, use the `sbx policy log` command:

```bash
sbx policy log
```

You should see output similar to the following:

```none
  BLOCKED REQUESTS
  SANDBOX           TYPE      HOST                                         PROXY     RULE                                                                                                                    REASON                                  LAST SEEN        COUNT
  shell-Mathieu     network   docker.com:80                                forward   no applicable policies for op(action=net:connect:tcp, resource=net:domain:docker.com:80)                                No matching allow rule (default deny)   11:03:48 7-Nov   2
```

Adding the `--json` flag will output the log details in a machine-readable JSON format.

## Allow additional hosts

As you can see, the list of allowed hosts is small to begin with. However, it is easy to modify the list.

Use the `sbx policy allow network` command to allow communication with `docker.com`:

```bash
sbx policy allow network docker.com
```

Check `docker.com` again:

```bash
sbx policy check network docker.com
```

You will see this message:

```none
    Allowed:     docker.com:443
    Governance:  Local policy only
    Context:     global
```

Reconnect to the sandbox:

```bash
sbx run shell
```

Once in the sandbox, try to reach `docker.com` again:

```bash
curl docker.com
```

It should work now! Type `exit` to return to your host.

> [!TIP]
> You can allow several hosts in a single command, and use wildcards: `*.example.com` matches exactly one subdomain level (`api.example.com`), `**.example.com` matches any depth (`api.eu.example.com`). Neither matches `example.com` itself.
>
> ```bash
> # Allow several hosts at once
> sbx policy allow network "smtp.mailgun.org,api.sendgrid.com"
>
> # Allow every subdomain of npmjs.org, at any depth
> sbx policy allow network "**.npmjs.org"
> ```

## Block a host

To explicitly block a host, use the `sbx policy deny` command:

```bash
sbx policy deny network ads.example.com
```

## Removing custom policies

Each rule you define manually is stored separately. To remove them, use the `sbx policy rm` command:

1. Remove the allow rule for `docker.com`:

    ```bash
    sbx policy rm network --resource docker.com
    ```

2. Remove the deny rule for `ads.example.com`:

    ```bash
    sbx policy rm network --resource ads.example.com
    ```

## Reaching host services from inside the sandbox

If you have a service running on your host machine (for example a local Ollama instance or a database), you can't reach it via `localhost` from inside the sandbox, because `localhost` there is the sandbox itself.

Use `host.docker.internal` instead, and add a policy rule if needed. You don't need to run this command for the lab:

```bash
sbx policy allow network localhost:11434
```

Then inside the sandbox, point your client at `host.docker.internal:11434`.

## Allow only what the lab needs

You will keep the **Locked Down** policy for the rest of the lab: rather than trusting a broad allow list, you allow exactly the hosts your agents need, and nothing else.

Add these four rules:

```bash
# GitHub and GitHub Copilot: the agent itself
sbx policy allow network "github.com,**.github.com,**.githubcopilot.com"

# Python for the backend tests: Debian packages and PyPI
sbx policy allow network "deb.debian.org,dhi.io,pypi.org,files.pythonhosted.org"

# Docker: pulling images from Docker Hub
sbx policy allow network "**.docker.io,production.cloudfront.docker.com"

# Node.js: installing the frontend's npm packages
sbx policy allow network "registry.npmjs.org"
```

| Rule | Used by | Module |
|------|---------|--------|
| `github.com`, `**.github.com` | GitHub API, used by Copilot | all agent modules |
| `**.githubcopilot.com` | Copilot service; the subdomain depends on your plan (`api.individual…`, `api.business…`, `api.enterprise…`), hence `**` | all agent modules |
| `deb.debian.org`, `dhi.io` | The sandbox image's `apt` repositories (Debian and Docker Hardened Images), used to install Python, which the image doesn't include. The Python kit you'll build in the next module declares them too, for the sandboxes that use it | [Kits](02-kits.md), [Run in direct mode](06-run-in-direct-mode.md) |
| `pypi.org`, `files.pythonhosted.org` | Installing the backend's Python packages | Run in direct mode, Clone mode, [Docker inside the sandbox](08-docker-inside-the-sandbox.md) |
| `**.docker.io`, `production.cloudfront.docker.com` | Pulling the `python`, `node` and `postgres` images from Docker Hub | Docker inside the sandbox |
| `registry.npmjs.org` | Installing the frontend's npm packages | Docker inside the sandbox |

The hosts have no port suffix on purpose: `apt` downloads from Debian over HTTP (port 80).

List the policies again: `local-policy` now has one network rule per host.

```bash
sbx policy ls
```

```none
POLICY             SOURCE   APPLIES TO   SUMMARY
default-deny-all   local    all          network: deny when no rule decides
local-policy       local    all          network: 10 allow; filesystem read: 1 allow; filesystem write: 1 allow
```

Check a few of them:

```bash
sbx policy check network api.github.com
sbx policy check network api.individual.githubcopilot.com
sbx policy check network docker.com
```

The first two are `Allowed`; `docker.com` is still `Denied`, because you removed its rule above.

> [!TIP]
> If an agent later fails to download something, run `sbx policy log` to see the blocked host, then allow it with `sbx policy allow network <host>`.

[[<< Previous: Prerequisites](00-prerequisites.md) | [Next >> Kits](02-kits.md)]
