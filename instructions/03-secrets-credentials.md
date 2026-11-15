# 🔑 Secrets and credentials

`sbx` has a built-in secrets manager that stores credentials in your OS keychain, never in plain text on disk or inside the VM. When your agent makes an outbound request that needs authentication, the host-side proxy intercepts it and injects the credential automatically. Your agent can make authenticated API calls but can never read, log, or exfiltrate the raw credential.

1. Store your GitHub token **now**, before creating the sandboxes your agents will use. Secrets are **global** by default, which means they are available to every sandbox you create. Here the token is resolved from the GitHub CLI each time it is needed:

    ```bash
    sbx secret set github --command 'gh auth token'
    sbx secret set copilot --command 'gh auth token'
    ```

    > [!IMPORTANT]
    > Global secrets are injected when a sandbox is **created**; they cannot be added retroactively to an existing sandbox. A sandbox-scoped secret (set with `--sandbox <name>`) can be added at any time and takes precedence over the global value for that sandbox.

    > [!NOTE]
    > `gh auth token` requires that you are signed in with `gh auth login` and that the account has access to GitHub Copilot (see the [prerequisites](00-prerequisites.md)). You can also run `sbx secret set github` without `--command` to be prompted for a token instead.

2. Check that the credentials were stored with the `sbx secret ls` command:

    ```bash
    sbx secret ls
    ```

    You should see something like this (secret values are never displayed):

    ```none
    SCOPE      TYPE      NAME      SECRET
    (global)   service   github    (stored)
    (global)   service   copilot   (stored)
    ```

[[<< Previous: Kits](02-kits.md) | [Next >> First sandbox](04-first-sandbox.md)]
