# 🌿 Clone mode and parallel agents

## Direct mode vs. clone mode

Everything in the previous module ran in **direct mode**: your agent edited your working tree and you saw the changes immediately. That is great for interactive work.

**Clone mode** gives your agent a private Git clone inside the sandbox, isolated from your working tree. You keep working normally while the agent works in its own clone. Afterwards you fetch its commits and review the diff before anything lands. Use it when you want a clean diff to review, or when you run several agents at the same time.

> [!NOTE]
> The clone starts from your **committed** code. Make sure the fix from the previous module is committed (`git log --oneline` should show it).

### Single clone: working in isolation

1. Go back to the **root of the repository** and make sure that no agent session is still attached to your terminal (press **`Ctrl-C` twice** to exit one):

    ```bash
    cd ..
    ```

    > [!IMPORTANT]
    > Clone mode must be started from the root of the Git repository. From the `project` folder, `sbx` stops with the error `--clone requires a Git repository`. The agent therefore sees the whole repository, with the application in the `project/` folder.

2. Start a new agent in clone mode with the `--clone` flag. Give it a name: it also names the Git remote that you will fetch from later.

    ```bash
    sbx run copilot --clone --name fix-bugs
    ```

    The agent works inside a private Git clone, and your own working tree is only available to it read-only.

3. Give your agent the following prompt to fix the last failing test:

    ```console
    One test is still failing: test_updated_at_changes_on_update. The updated_at columns in project/backend/app/models.py are never refreshed when a row is updated. Fix the bug, run the tests to confirm it, and commit with a descriptive message.
    ```

4. Once the agent has finished, fetch its work from a **second terminal** on your host, in the same repository:

    ```bash
    git fetch sandbox-fix-bugs
    git log HEAD..sandbox-fix-bugs/main --oneline
    ```

    The sandbox exposes its clone as a Git remote named `sandbox-<name>`, and its branches are named `sandbox-<name>/<branch>`, where `<branch>` is the branch that was checked out when the sandbox was created (typically `main`). Review the commits, then merge or cherry-pick them as you normally would:

    ```bash
    git merge sandbox-fix-bugs/main
    ```

    > [!NOTE]
    > The fetch only works while the sandbox is running. If you get a connection error, restart it with `sbx run --name fix-bugs`.

### Parallel agents

Because each clone-mode sandbox has its own private Git clone, you can run several agents at the same time without conflicts. The key is to give each sandbox a distinct `--name` and to hand each agent its task up front through a prompt file, so that both can start without any back-and-forth.

DevBoard has two unfinished features that make ideal parallel tasks:

- **Search**: `GET /projects/{id}/issues/search?q=` returns `501`; the query logic needs to be written.
- **Notifications**: `send_status_change_notification()` only logs; it should send emails when an issue's status changes.

The [`project/prompts/`](../project/prompts) directory contains a ready-made prompt file for each.

> [!TIP]
> In Windows PowerShell 5.1 the prompt is passed with its line breaks flattened. It still works. For the exact formatting, use Git Bash or WSL.

1. In a new terminal, from the root of the repository, start an agent that implements search:

    ```bash terminal-id=parallel-agent-1
    sbx run copilot --clone --name add-search -- -i "$(cat project/prompts/implement-search.txt)"
    ```

    > [!IMPORTANT]
    > The `"$(cat ...)"` must be quoted, otherwise the prompt is not passed correctly to the agent.

2. In another terminal, again from the root of the repository, start a second agent that implements notifications:

    ```bash
    sbx run copilot --clone --name add-notif -- -i "$(cat project/prompts/implement-notifications.txt)"
    ```

Each sandbox gets its own isolated Git clone, so the agents read and write completely separate copies of the code. You can see both in `sbx ls`, and watch each agent's progress in its own terminal. Copilot already runs with `--yolo` by default, so the agents don't wait for confirmation.

When both agents report that they are done, fetch their work from a terminal on your host:

```bash
git fetch sandbox-add-search
git fetch sandbox-add-notif
```

### Reviewing and merging agent work

After fetching, each agent's commits are available as remote-tracking branches, the same model as working with `origin`.

1. Inspect what each agent committed before merging anything:

    ```bash
    git log HEAD..sandbox-add-search/main --oneline
    git diff HEAD...sandbox-add-search/main --stat
    ```

    And the same for the notifications task:

    ```bash
    git log HEAD..sandbox-add-notif/main --oneline
    git diff HEAD...sandbox-add-notif/main --stat
    ```

2. Merge each agent's branch into your working branch:

    ```bash
    git merge sandbox-add-search/main
    git merge sandbox-add-notif/main
    ```

    If both agents changed the same files you may get a merge conflict. Resolve it as you would any other conflict, then run `git merge --continue`.

3. Check that the merged result works. Reconnect to your `quickstart` sandbox, whose workspace is your working tree:

    ```bash
    sbx run --name quickstart
    ```

    Then give the agent this prompt:

    ```console
    Run the full test suite and report the results.
    ```

    All the tests should now pass, including the search test and the new notification tests. Exit the session with **`Ctrl-C` twice**.

[[<< Previous: Run in direct mode](05-run-in-direct-mode.md) | [Next >> Docker inside the sandbox](07-docker-inside-the-sandbox.md)]
