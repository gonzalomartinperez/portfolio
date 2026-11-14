FROM mcr.microsoft.com/playwright:v1.64.1-noble@sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf

ARG TARGETARCH
RUN set -eu; \
    case "$TARGETARCH" in \
      amd64) url=https://nodejs.org/dist/v24.22.0/node-v24.22.0-linux-x64.tar.xz; \
        checksum=cc2f601cee82d9a5a233302fe307abc600727035fd7d2c3a3571755989e95008 ;; \
      arm64) url=https://nodejs.org/dist/v24.22.0/node-v24.22.0-linux-arm64.tar.xz; \
        checksum=fef00bb4d36e1c50104a9775a10359beee98f162b4104dd12472c75065c6a143 ;; \
      *) echo "Unsupported TARGETARCH: $TARGETARCH" >&2; exit 1 ;; \
    esac; \
    curl --fail --show-error --location "$url" --output /tmp/node.tar.xz; \
    echo "$checksum  /tmp/node.tar.xz" | sha256sum --check; \
    mkdir -p /usr/local/node; \
    tar -xJf /tmp/node.tar.xz -C /usr/local/node --strip-components=1; \
    rm /tmp/node.tar.xz

# Override the Node runtime bundled in the Playwright image.
ENV PATH="/usr/local/node/bin:${PATH}" \
    NEXT_TELEMETRY_DISABLED=1
