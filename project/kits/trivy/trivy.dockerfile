# syntax=docker/dockerfile:1
# Adapted from the trivy kit of docker/sbx-kits-contrib (v3 branch, Apache-2.0):
# https://github.com/docker/sbx-kits-contrib/tree/v3/trivy
# Changes: shorter comments, VEX repositories for Docker Hardened Images, and a
# scan-images script.

# The sandbox template: bash, the agent user (uid 1000), git and a CA store.
FROM docker/sandbox-templates:shell-docker

# Pinned by version AND by the SHA256 of each architecture's release tarball,
# from the release's checksums.txt. To upgrade, change all three together,
# along with `provides` in trivy.yaml.
ARG TRIVY_VERSION=0.70.0
ARG TARGETARCH

# Download, verify and install Trivy while the kit is built, as root.
# No `curl | sh` install script: a script or a tag can be rewritten, a checked
# SHA256 can't.
USER root
RUN set -eu; \
    case "${TARGETARCH}" in \
      amd64) \
        tarball="trivy_${TRIVY_VERSION}_Linux-64bit.tar.gz"; \
        sha256=8b4376d5d6befe5c24d503f10ff136d9e0c49f9127a4279fd110b727929a5aa9 ;; \
      arm64) \
        tarball="trivy_${TRIVY_VERSION}_Linux-ARM64.tar.gz"; \
        sha256=2f6bb988b553a1bbac6bdd1ce890f5e412439564e17522b88a4541b4f364fc8d ;; \
      *) echo "unsupported TARGETARCH: ${TARGETARCH} (expected amd64 or arm64)" >&2; exit 1 ;; \
    esac; \
    curl --proto '=https' --tlsv1.2 -fsSL -o /tmp/trivy.tgz \
      "https://github.com/aquasecurity/trivy/releases/download/v${TRIVY_VERSION}/${tarball}"; \
    echo "${sha256}  /tmp/trivy.tgz" | sha256sum -c -; \
    tar -C /usr/local/bin -xzf /tmp/trivy.tgz trivy; \
    rm /tmp/trivy.tgz; \
    chown 0:0 /usr/local/bin/trivy; \
    chmod 0755 /usr/local/bin/trivy; \
    trivy --version

# A helper that scans images and prints one line per image.
COPY --chmod=0755 scan-images.sh /usr/local/bin/scan-images

# Back to the unprivileged user the sandbox runs as.
USER agent

# Let `trivy image --vex repo` apply the VEX statements of Docker Hardened Images.
COPY --chown=agent:agent vex-repository.yaml /home/agent/.trivy/vex/repository.yaml

# sbx reads this label as the sandbox's agent name.
LABEL com.docker.sandboxes.flavor="trivy"

# Open a login shell in the workspace, with trivy on the PATH.
ENTRYPOINT ["bash", "-l"]
