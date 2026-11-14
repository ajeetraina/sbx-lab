# 🔒 Network policies

Every sandbox routes outbound HTTP/HTTPS through a host-side proxy that enforces access rules you define. There are three built-in postures:

| Policy      | Description                                                                          |
|-------------|--------------------------------------------------------------------------------------|
| Open        | All traffic allowed — no restrictions                                                |
| Balanced    | Default deny, with a broad allow-list covering AI APIs, npm, pip, GitHub, registries |
| Locked Down | Everything blocked; you explicitly allow what you need                               |

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
> You can allow multiple hosts in a single command or even use wildcards
>
> ```bash no-copy-button no-run-button
> # Allow multiple at once
> sbx policy allow network "smtp.mailgun.org,api.sendgrid.com"
>
> # Allow all npm and PyPI (useful if your agent can't install packages)
> sbx policy allow network "*.npmjs.org,*.pypi.org,files.pythonhosted.org"
> ```

## Block a host

To explicitly block a host, use the `sbx policy deny` command:

```bash terminal-id=host
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

## Set the `2. Balanced` network policies profile for the rest of the lab

Run this command to set the default:

```bash terminal-id=host
sbx policy reset
```

The CLI restarts the daemon, resets the policies, and shows the picker. Choose the **Balanced** option (default deny, with common development sites allowed).

> [!TIP]
> Non-interactive equivalent: `sbx policy reset --force && sbx policy init balanced`.

Check the configured policies:

```bash
sbx policy ls
```

You should now see a much longer allow list (the exact number can vary with your `sbx` version):

```none
POLICY             SOURCE   APPLIES TO   SUMMARY
default-deny-all   local    all          network: deny when no rule decides
local-policy       local    all          network: 195 allow; filesystem read: 1 allow; filesystem write: 1 allow
```

[[<< Previous: Prerequisites](00-prerequisites.md) | [Next >> Secrets and credentials](02-secrets-credentials.md)]
