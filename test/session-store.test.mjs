import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { LocalMarkdownSessionStore } from "../src/session-store.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));

const categories = ["FADEWELL", "Praca", "Zdrowie", "Relacje", "Ja/Emocje", "Inne"];
test("creates, finds, updates, and indexes a session", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-store-"));
  const store = new LocalMarkdownSessionStore({
    dataDirectory: directory,
    categories,
    clock: () => new Date("2026-07-27T14:42:00+02:00")
  });
  const created = store.createSession({
    topic: "Rozmowa", situation: "Trudna rozmowa", logic: "Sprawdzić założenia",
    emotion: "Napięcie", summary: "Dać sobie czas", categories: ["Relacje"], tags: ["wieczór"], about: "dzieciństwo", body: "Szczegóły rozmowy"
  });
  assert.equal(created.id, "2026-07-27T144200");
  assert.equal(created.date, "2026-07-27T14:42:00.000+02:00");
  assert.match(created.file, /^2026-07-27_1442_rozmowa\.md$/);
  assert.equal(store.listSessions().length, 1);
  const searchResult = store.searchSessions({ query: "szczegóły" })[0];
  assert.equal(searchResult.id, created.id);
  assert.equal(searchResult.body, undefined);
  assert.equal(searchResult.logic, undefined);
  assert.equal(searchResult.raw_input, undefined);
  assert.equal(searchResult.match_context.field, "body");
  assert.match(searchResult.match_context.text, /szczegóły/i);
  assert.equal(store.searchSessions({ query: "szczegóły", full: true })[0].body, "Szczegóły rozmowy");
  assert.equal(store.searchSessions({ query: "dzieciństwo" }).length, 1);
  const updated = store.updateSession(created.id, { topic: "Spokojniejsza rozmowa", emotion: "Ulga", tags: ["wieczór", "kontakt"] });
  assert.equal(updated.topic, "Spokojniejsza rozmowa");
  assert.equal(store.searchSessions({ tag: "kontakt" })[0].id, created.id);
  assert.equal(JSON.parse(fs.readFileSync(path.join(directory, "index.json"), "utf8"))[0].topic, "Spokojniejsza rozmowa");
  assert.equal(store.listSessions()[0].about, "dzieciństwo");
});

test("uses seconds and a zero-padded suffix for same-second writes", () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-store-"));
  const store = new LocalMarkdownSessionStore({
    dataDirectory: directory,
    categories,
    clock: () => new Date("2026-07-27T14:42:31+02:00")
  });
  const first = store.createSession({ topic: "Pierwsza" });
  const second = store.createSession({ topic: "Druga" });
  assert.equal(first.id, "2026-07-27T144231");
  assert.equal(second.id, "2026-07-27T144231-02");
  assert.equal(store.listSessions()[0].id, second.id);
  store.rebuildIndex();
  assert.equal(store.listSessions()[0].id, second.id);
});

test("acquireLock serializes concurrent writers so index.json never loses an entry", async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "reflection-store-concurrent-"));
  const workerScript = path.join(testDir, "helpers", "concurrent-write-worker.mjs");
  const workerCount = 5;
  const perWorker = 4;

  const workers = Array.from({ length: workerCount }, (_, workerId) =>
    new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [workerScript, directory, String(workerId), String(perWorker)]);
      let stderr = "";
      child.stderr.on("data", (chunk) => { stderr += chunk; });
      child.on("close", (code) => code === 0 ? resolve() : reject(new Error(`worker ${workerId} exited ${code}: ${stderr}`)));
    })
  );
  await Promise.all(workers);

  const index = JSON.parse(fs.readFileSync(path.join(directory, "index.json"), "utf8"));
  const expectedTotal = workerCount * perWorker;
  assert.equal(index.length, expectedTotal, "every concurrently-created session must survive in index.json");

  const filesOnDisk = fs.readdirSync(path.join(directory, "sessions")).filter((name) => name.endsWith(".md"));
  assert.equal(filesOnDisk.length, expectedTotal, "index.json must match the actual files on disk");

  const uniqueIds = new Set(index.map((item) => item.id));
  assert.equal(uniqueIds.size, expectedTotal, "no two sessions collided onto the same id");
});
