import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { request } from "node:http";
import { createServer } from "node:https";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

function port(name: string, fallback: number) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1024 || value > 65535) throw new Error(`Invalid ${name}`);
  return value;
}
const publicPort = port("BROWSER_TEST_PORT", 3160);
const upstreamPort = port("BROWSER_TEST_UPSTREAM_PORT", 3161);
if (publicPort === upstreamPort) throw new Error("Test listener ports must differ");
const directory = mkdtempSync(path.join(tmpdir(), "portfolio-browser-tls-"));
const key = path.join(directory, "key.pem");
const cert = path.join(directory, "cert.pem");
let stopping = false;
let upstream: ReturnType<typeof spawn> | undefined;
let proxy: ReturnType<typeof createServer> | undefined;
async function stop() {
  if (stopping) return;
  stopping = true;
  proxy?.close();
  proxy?.closeAllConnections();
  if (upstream && upstream.exitCode === null) {
    const exited = once(upstream, "exit");
    upstream.kill("SIGTERM");
    const timeout = setTimeout(() => upstream?.kill("SIGKILL"), 5000);
    await exited;
    clearTimeout(timeout);
  }
  rmSync(directory, { recursive: true, force: true });
}
process.once("SIGINT", () => void stop());
process.once("SIGTERM", () => void stop());
try {
  const generated = spawnSync(
    "openssl",
    [
      "req",
      "-x509",
      "-newkey",
      "rsa:2048",
      "-nodes",
      "-days",
      "1",
      "-subj",
      "/CN=localhost",
      "-addext",
      "subjectAltName=IP:127.0.0.1,DNS:localhost",
      "-keyout",
      key,
      "-out",
      cert,
    ],
    { stdio: "ignore" },
  );
  if (generated.status !== 0) throw new Error("OpenSSL could not create the test certificate");
  upstream = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "--port",
      String(upstreamPort),
    ],
    { stdio: "inherit" },
  );
  const deadline = Date.now() + 45000;
  while (!stopping) {
    if (upstream.exitCode !== null || Date.now() > deadline)
      throw new Error("Production test server did not become ready");
    try {
      await fetch(`http://127.0.0.1:${upstreamPort}/`, { signal: AbortSignal.timeout(1000) });
      break;
    } catch {
      await delay(100);
    }
  }
  if (!stopping) {
    proxy = createServer(
      { key: readFileSync(key), cert: readFileSync(cert) },
      (incoming, outgoing) => {
        const forwarded = request(
          {
            hostname: "127.0.0.1",
            port: upstreamPort,
            path: incoming.url,
            method: incoming.method,
            headers: incoming.headers,
          },
          (response) => {
            outgoing.writeHead(response.statusCode ?? 502, response.headers);
            response.pipe(outgoing);
          },
        );
        forwarded.on("error", () => {
          if (!outgoing.headersSent) outgoing.writeHead(502);
          outgoing.end();
        });
        outgoing.on("close", () => forwarded.destroy());
        incoming.pipe(forwarded);
      },
    );
    proxy.on("error", (error) => {
      console.error(error.message);
      process.exitCode = 1;
      void stop();
    });
    proxy.listen(publicPort, "127.0.0.1");
    upstream.once("exit", () => {
      if (!stopping) {
        process.exitCode = 1;
        void stop();
      }
    });
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : "Test server failed");
  process.exitCode = 1;
  await stop();
}
