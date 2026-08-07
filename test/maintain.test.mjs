import assert from "node:assert/strict";
import test from "node:test";
import { run } from "../scripts/maintain.mjs";

test("maintain prints usage and exits 0 when called with no command", () => {
  const { output, status } = run([]);
  assert.equal(status, 0);
  assert.match(output, /Uzycie: node scripts\/maintain\.mjs/);
  assert.match(output, /rebuild-index/);
});

test("maintain prints usage and exits 1 for an unknown command", () => {
  const { output, status } = run(["nie-takie-polecenie"]);
  assert.equal(status, 1);
  assert.match(output, /Dostepne komendy/);
});
