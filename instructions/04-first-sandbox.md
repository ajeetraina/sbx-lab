# 📦 Creating your first sandbox

The `sbx create` command provisions a sandbox without attaching to it. This is useful when you want to set it up, verify that it appears in `sbx ls`, or script several sandboxes before starting any of them. `sbx run` then attaches an agent session to an existing sandbox (or creates one on the fly if it doesn't exist yet).

## Starting the sandbox

1. From the root of the cloned repository, switch to the sample application directory:

    ```bash
    cd project
    ```

2. Create your first sandbox with the `sbx create` command. The workspace path (`.`) is required: it is the folder that gets mounted into the sandbox.

    ```bash
    sbx create --name quickstart copilot .
    ```

    > [!NOTE]
    > If you get an error saying that the `quickstart` sandbox already exists, remove it with `sbx rm quickstart` and run the command again.

3. Confirm that it was created by listing all sandboxes:

    ```bash
    sbx ls
    ```

4. With the sandbox created, start an agent in it and attach to it:

    ```bash
    sbx run --name quickstart
    ```

    Docker Sandboxes starts Copilot with `--yolo` by default and trusts the workspace directory. This lets Copilot work in the project without asking for confirmation at every step; you do not need to add the flag yourself.

    > [!IMPORTANT]
    > `--yolo` allows Copilot to run tools without individual confirmations. The sandbox limits what the agent can reach, but you should still review the agent's actions and changes.

5. Ask the agent to tell you about the project:

    ```console
    Explore this codebase and give me:
    1. A summary of the architecture and tech stack
    2. How to run it locally (without Docker Compose if possible)
    3. Any obvious issues or areas of concern you spot at a glance
    4. What the test suite covers
    ```

    Your agent reads the source files, checks the requirements, and reports back. Because the workspace is mounted directly into the VM, the agent sees your actual files, including any changes you make on the host while it runs.

### Controlling the session

`sbx run` is interactive: it occupies your terminal as a live agent session.

- Press **`Ctrl-C` twice** to exit the session and drop back to your host terminal.
- Type **`!`** before a command inside the agent to run it as a shell command without leaving the session, for example `!ls` or `!git status`.

Go ahead and exit the session by pressing **`Ctrl-C` twice**.

[[<< Previous: Secrets and credentials](03-secrets-credentials.md) | [Next >> TUI dashboard](05-tui-dashboard.md)]
