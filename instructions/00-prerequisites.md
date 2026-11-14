# 📝 Prerequisites

## Accounts and tools

- A computer running macOS, Windows, or Linux.
- A **Docker account**. Docker Sandboxes are free to use; [create a Docker account](https://hub.docker.com/signup) if you don't have one.
- A **GitHub account with access to GitHub Copilot**. [Create a GitHub account](https://github.com/signup) and check the [Copilot plans](https://github.com/features/copilot/plans) for the available options.
- **Git**, to clone the repository and review the agents' work.
- The **GitHub CLI** (`gh`), signed in to your GitHub account. [Install it](https://cli.github.com/), then run `gh auth login` and verify with:

    ```bash
    gh auth status
    ```

- The **`sbx` CLI**. Follow [these instructions](https://docs.docker.com/ai/sandboxes/install/) to install or update it.

## sbx setup

Every exercise depends on `sbx` running correctly on your computer. **Do not skip this section.**

1. Verify that `sbx` is installed:

    ```bash
    sbx version
    ```

    Expected output: a version string such as `sbx version v0.53.0 <commit>`.

2. Sign in to Docker (skip this if you are already signed in):

    ```bash
    sbx login
    ```

    Follow the instructions on the screen.

    > [!NOTE]
    > The first time you use `sbx` you may be asked to choose a default network policy. Pick **Balanced**; you will explore the other options in the next module.

3. Check that your installation is healthy:

    ```bash
    sbx diagnose
    ```

4. This lab assumes that your Docker account is **not** subject to organization AI Governance policies. Check the configured policies:

    ```bash
    sbx policy ls
    ```

    Every policy should have `local` as its `SOURCE`. The output looks similar to this:

    ```none
    POLICY             SOURCE   APPLIES TO   SUMMARY
    default-deny-all   local    all          network: deny when no rule decides
    local-policy       local    all          network: 195 allow; filesystem read: 1 allow; filesystem write: 1 allow
    ```

    If you see policies from another source, your organization restricts what sandboxes can do and some exercises may not work. Use a personal Docker account or ask your administrator for guidance.

You're all set! Move on to the next module.

[[Home](../README.md) | [Next >> Network policies](01-network-policies.md)]
