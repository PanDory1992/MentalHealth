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

function makeIsolatedServer(extraFiles = {}, { env } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-server-"));
  fs.copyFileSync(path.join(repoRoot, "server.mjs"), path.join(dir, "server.mjs"));
  fs.copyFileSync(path.join(repoRoot, "reflection-contract.json"), path.join(dir, "reflection-contract.json"));
  fs.mkdirSync(path.join(dir, "src"));
  fs.copyFileSync(path.join(repoRoot, "src", "session-store.mjs"), path.join(dir, "src", "session-store.mjs"));
  for (const [name, content] of Object.entries(extraFiles)) fs.writeFileSync(path.join(dir, name), content, "utf8");
  const child = spawn(process.execPath, ["server.mjs"], { cwd: dir, stdio: ["pipe", "pipe", "pipe"], env: { ...process.env, ...env } });
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
    assert.deepEqual(names, ["get_workspace_instructions", "update_workspace_instructions", "list_sessions", "get_session", "search_sessions", "create_session", "update_session"]);
  } finally {
    cleanup(child, dir);
  }
});

test("get_workspace_instructions reads CLAUDE.md/GLOSY.md/WZORCE.md/DZIENNIK.md and returns null for missing ones, plus a real server_time - this is the only way Chat mode (no folder-injection like Cowork) ever sees these files", async () => {
  const { child, dir } = makeIsolatedServer({ "CLAUDE.md": "# Test instructions\n\nBądź zwięzły." });
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_workspace_instructions", arguments: {} } });
    const result = JSON.parse((await next()).result.content[0].text);
    assert.equal(result.instructions["CLAUDE.md"], "# Test instructions\n\nBądź zwięzły.");
    assert.equal(result.instructions["GLOSY.md"], null);
    assert.equal(result.instructions["WZORCE.md"], null);
    assert.equal(result.instructions["DZIENNIK.md"], null);
    assert.match(result.server_time, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  } finally {
    cleanup(child, dir);
  }
});

test("update_workspace_instructions writes CLAUDE.md/GLOSY.md/WZORCE.md/DZIENNIK.md so a client without direct filesystem tools (i.e. not Cowork) can still follow this workspace's own instructions to update them, and rejects any other filename", async () => {
  const { child, dir } = makeIsolatedServer();
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "update_workspace_instructions", arguments: { file: "WZORCE.md", content: "# WZORCE\n\nNowa granica: temat X." } } });
    const written = JSON.parse((await next()).result.content[0].text);
    assert.equal(written.file, "WZORCE.md");
    assert.equal(fs.readFileSync(path.join(dir, "WZORCE.md"), "utf8"), "# WZORCE\n\nNowa granica: temat X.");

    sendNdjson(child, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "get_workspace_instructions", arguments: {} } });
    const read = JSON.parse((await next()).result.content[0].text);
    assert.equal(read.instructions["WZORCE.md"], "# WZORCE\n\nNowa granica: temat X.");

    sendNdjson(child, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "update_workspace_instructions", arguments: { file: "reflection-contract.json", content: "{}" } } });
    const rejected = await next();
    assert.match(rejected.error.message, /file must be one of/);
    const contractStillIntact = JSON.parse(fs.readFileSync(path.join(dir, "reflection-contract.json"), "utf8"));
    assert.equal(contractStillIntact.schema_version, 1);
  } finally {
    cleanup(child, dir);
  }
});

test("get_workspace_instructions also returns WYWIAD-STARTOWY.md read-only (present -> its content, absent -> null), and update_workspace_instructions refuses to write it - this file is a fixed question bank a workspace's own CLAUDE.md may instruct Claude to read, and with no other filesystem tool available (i.e. not Cowork), get_workspace_instructions is the only way to ever see it", async () => {
  const { child, dir } = makeIsolatedServer({ "WYWIAD-STARTOWY.md": "# Wywiad startowy\n\nA1. Pytanie testowe." });
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_workspace_instructions", arguments: {} } });
    const withFile = JSON.parse((await next()).result.content[0].text);
    assert.equal(withFile.instructions["WYWIAD-STARTOWY.md"], "# Wywiad startowy\n\nA1. Pytanie testowe.");

    sendNdjson(child, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "update_workspace_instructions", arguments: { file: "WYWIAD-STARTOWY.md", content: "cokolwiek" } } });
    const rejected = await next();
    assert.match(rejected.error.message, /file must be one of/);
    assert.equal(fs.readFileSync(path.join(dir, "WYWIAD-STARTOWY.md"), "utf8"), "# Wywiad startowy\n\nA1. Pytanie testowe.");
  } finally {
    cleanup(child, dir);
  }
});

test("get_workspace_instructions returns null for WYWIAD-STARTOWY.md when it does not exist on disk (e.g. Miki's own workspace, which has no such file)", async () => {
  const { child, dir } = makeIsolatedServer();
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "get_workspace_instructions", arguments: {} } });
    const result = JSON.parse((await next()).result.content[0].text);
    assert.equal(result.instructions["WYWIAD-STARTOWY.md"], null);
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

test("REFLECTION_DATA_DIR redirects storage outside the server's own folder (needed for .mcpb installs, where the extension's own directory may not be writable) - and is a no-op, matching the classic install path exactly, when unset", async () => {
  const external = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-external-data-"));
  const { child, dir } = makeIsolatedServer({}, { env: { REFLECTION_DATA_DIR: external } });
  const next = createReader(child);
  try {
    sendNdjson(child, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "create_session", arguments: { topic: "External data dir test" } } });
    const created = JSON.parse((await next()).result.content[0].text);
    assert.equal(created.topic, "External data dir test");

    assert.ok(fs.existsSync(path.join(external, "index.json")), "index.json should exist under REFLECTION_DATA_DIR");
    assert.ok(fs.existsSync(path.join(external, "sessions", created.file)), "session file should exist under REFLECTION_DATA_DIR/sessions");
    assert.ok(!fs.existsSync(path.join(dir, "data")), "no data/ directory should be created inside the server's own folder when REFLECTION_DATA_DIR is set");
  } finally {
    cleanup(child, dir);
    fs.rmSync(external, { recursive: true, force: true });
  }
});
