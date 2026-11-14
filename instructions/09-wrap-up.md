# 🎉 Wrap up

You've completed the **Docker Sandboxes with GitHub Copilot Lab**. Well done!

✅ You now know how to:

- Control which network destinations your agents can reach with **network policies**.
- Keep your **credentials** out of the agent's reach while still letting it authenticate.
- Run an agent in **direct mode**, or in isolated **clone mode** with several agents **in parallel**, and review their work before merging it.
- Monitor your sandboxes and their network activity from the **TUI dashboard** and with `sbx policy log`.
- Run **Docker inside a sandbox** and reach the services with **port forwarding**.

## Clean up

Remove the sandboxes created during the lab, along with everything inside them (images, containers, and data):

```bash
sbx ls
sbx rm quickstart fix-bugs add-search add-notif
```

`sbx rm` asks for confirmation (add `--force` to skip it). The sandbox created by `sbx run shell` in the network policies module is named after the folder you ran it from: remove it too, using the name shown by `sbx ls`. You can also remove all stopped sandboxes at once with `sbx prune`.

Your network policy is currently the **Balanced** profile, which is the recommended default. Check it with `sbx policy ls`.

## Next steps

- [Get Started with Docker Sandboxes learning path](https://docs.docker.com/learn/paths/get-started-with-docker-sandboxes/)
- [Build and customize Docker Sandbox environments learning path](https://docs.docker.com/learn/paths/build-and-customize-docker-sandbox-environments/)
- [Docker Sandboxes documentation](https://docs.docker.com/ai/sandboxes/)
- [Sandboxes versus containers](https://www.docker.com/products/docker-sandboxes/vs-containers/)
- [Docker Sandbox Kit specification](https://github.com/docker/sandbox-kit-spec)

## Feedback

Did you find a problem or have an idea to improve this lab? [Open an issue](https://github.com/mathieu-benoit/sbx-lab/issues). Thank you for joining!

[[<< Previous: Port forwarding](08-port-forwarding.md) | [Home](../README.md)]
