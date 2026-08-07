// Covers the transport layer in server.mjs (framing, JSON-RPC routing, error
// handling) that had zero test coverage before. Each test spawns a real,
// isolated copy of the engine (its own temp folder, its own empty data/) and
// talks to it over real stdin/stdout, exactly like a real MCP client would -
// never against the live workspace data.
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "..");

function makeIsolatedServer() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-server-"));
  fs.copyFileSync(path.join(repoRoot, "server.mjs"), path.join(dir, "server.mjs"));
  fs.copyFileSync(path.join(repoRoot, "reflection-contract.json"), path.join(dir, "reflection-contract.json"));
  fs.mkdirSync(path.join(dir, "src"));
  fs.copyFileSync(path.join(repoRoot, "src", "session-store.mjs"), path.join(dir, "src", "session-store.mjs"));
  const child = spawn(process.execPath, ["server.mjs"], { cwd: dir, stdio: ["pipe", "pipe", "pipe"] });
  return { child, dir };
}

function cleanup(child, dir) {
  child.kill();
  fs.rmSync(dir, { recursive: true, force: true });
}

// Client-side reader that understands both framings server.mjs can emit, so
// the same helper works whether a test talks NDJSON or Content-Length.
function createReader(child) {
  let buffer = Buffer.alloc(0);
  const queue = [];
  const waiters = [];
  child.stdout.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    drain();
  });
  function drain() {
    while (true) {
      const headerEnd = buffer.indexOf("\r\n\r\n");
      const newline = buffer.indexOf("\n");
      let body;
      if (headerEnd !== -1 && (newline === -1 || headerEnd < newline)) {
        const header = buffer.slice(0, headerEnd).toString("utf8");
        const match = header.match(/Content-Length:\s*(\d+)/i);
        if (!match) { buffer = buffer.slice(headerEnd + 4); continue; }
        const end = headerEnd + 4 + Number(match[1]);
        if (buffer.length < end) return;
        body = buffer.slice(headerEnd + 4, end).toString("utf8");
        buffer = buffer.slice(end);
      } else if (newline !== -1) {
        body = buffer.slice(0, newline).toString("utf8").trim();
        buffer = buffer.slice(newline + 1);
        if (!body) continue;
      } else {
        return;
      }
      const message = JSON.parse(body);
      if (waiters.length) waiters.shift()(message);
      else queue.push(message);
    }
  }
  return function next() {
    if (queue.length) return Promise.resolve(queue.shift());
    return new Promise((resolve) => waiters.push(resolve));
  };
}

function sendNdjson(child, message) {
  child.stdin.write(`${JSON.stringify(message)}\n`);
}
function sendContentLength(child, message) {
  const body = JSON.stringify(message);
  child.stdin.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

test("initialize and tools/list over NDJSON framing", async () => {
  const { child, dir } = makeIsolatedServer();
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "initialize", params: {} });
    const init = await next();
    assert.equal(init.result.serverInfo.name, "personal-reflection-bridge");
    assert.equal(init.result.capabilities.tools.listChanged, true);

    sendNdjson(child, { jsonrpc: "2.0", id: 2, method: "tools/list" });
    const list = await next();
    const names = list.result.tools.map((tool) => tool.name);
    assert.deepEqual(names, ["list_sessions", "get_session", "search_sessions", "create_session", "update_session"]);
  } finally {
    cleanup(child, dir);
  }
});

test("create_session/get_session round-trip, and error responses for a missing session and an unsupported method", async () => {
  const { child, dir } = makeIsolatedServer();
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "create_session", arguments: { topic: "Test transportu" } } });
    const created = JSON.parse((await next()).result.content[0].text);
    assert.equal(created.topic, "Test transportu");

    sendNdjson(child, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_session", arguments: { id: created.id } } });
    const fetched = JSON.parse((await next()).result.content[0].text);
    assert.equal(fetched.id, created.id);

    sendNdjson(child, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "get_session", arguments: { id: "nie-istnieje" } } });
    const missing = await next();
    assert.equal(missing.error.message, "Session not found: nie-istnieje");

    sendNdjson(child, { jsonrpc: "2.0", id: 4, method: "unsupported/method" });
    const unsupported = await next();
    assert.match(unsupported.error.message, /Unsupported method/);
  } finally {
    cleanup(child, dir);
  }
});

test("Content-Length framing works end-to-end for ping and tools/call", async () => {
  const { child, dir } = makeIsolatedServer();
  const next = createReader(child);
  try {
    sendContentLength(child, { jsonrpc: "2.0", id: 1, method: "ping" });
    const pong = await next();
    assert.deepEqual(pong.result, {});

    sendContentLength(child, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "create_session", arguments: { topic: "Content-Length test" } } });
    const created = JSON.parse((await next()).result.content[0].text);
    assert.equal(created.topic, "Content-Length test");
  } finally {
    cleanup(child, dir);
  }
});
