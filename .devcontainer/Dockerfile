FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf

ARG TARGETARCH
RUN set -eu; \
    arch="${TARGETARCH:-$(dpkg --print-architecture)}"; \
    case "$arch" in \
      amd64) url=https://nodejs.org/dist/v24.22.0/node-v24.22.0-linux-x64.tar.gz; \
        checksum=28ea0a438de9a13bd7891fd758eee6c7819ee8af5442dfd8d45bd65e56d4228c ;; \
      arm64) url=https://nodejs.org/dist/v24.22.0/node-v24.22.0-linux-arm64.tar.gz; \
        checksum=b7e7991d5407815adfa74a2a9cd4db683552c8ce32ff4a295c22e972849c3f5d ;; \
      *) echo "Unsupported architecture: $arch" >&2; exit 1 ;; \
    esac; \
    curl --fail --show-error --location "$url" --output /tmp/node.tar.gz; \
    echo "$checksum  /tmp/node.tar.gz" | sha256sum --check; \
    mkdir -p /usr/local/node; \
    tar -xzf /tmp/node.tar.gz -C /usr/local/node --strip-components=1; \
    rm /tmp/node.tar.gz; \
    # /usr/local/bin precedes the image's /usr/bin Node in every PATH, including login shells.
    ln -sf /usr/local/node/bin/node /usr/local/node/bin/npm /usr/local/node/bin/npx /usr/local/bin/; \
    # Pre-own the node_modules volume target so the named volume starts writable by pwuser.
    mkdir -p /workspaces/portfolio/node_modules; \
    chown -R pwuser:pwuser /workspaces

ENV NEXT_TELEMETRY_DISABLED=1
