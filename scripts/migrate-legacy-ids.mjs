import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// One-time migration for the first batch of minute-only IDs. It intentionally
// preserves the current index-array order as the sole surviving sequence record.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(root, "data");
const indexPath = path.join(dataDirectory, "index.json");
const sessionsDirectory = path.join(dataDirectory, "sessions");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));
if (!Array.isArray(index)) throw new Error("data/index.json must contain an array.");

const groups = new Map();
const updates = [];
for (const item of index) {
  const match = String(item.id).match(/^(\d{4}-\d{2}-\d{2}T\d{4})(?:-(\d+))?$/);
  if (!match) throw new Error(`Refusing migration: unexpected legacy ID ${JSON.stringify(item.id)}.`);
  const base = match[1];
  const sequence = (groups.get(base) || 0) + 1;
  groups.set(base, sequence);
  const id = sequence === 1 ? base : `${base}-${String(sequence).padStart(2, "0")}`;
  const filePath = path.join(sessionsDirectory, item.file);
  if (!fs.existsSync(filePath)) throw new Error(`Indexed session file is missing: ${item.file}`);
  const source = fs.readFileSync(filePath, "utf8");
  const expectedLine = `id: ${JSON.stringify(item.id)}`;
  if (!source.includes(expectedLine)) throw new Error(`Refusing migration: ${item.file} does not contain ${expectedLine}.`);
  updates.push({ item, id, filePath, source, changed: item.id !== id });
}

const changed = updates.filter((update) => update.changed);
if (!changed.length) {
  console.log("No legacy IDs need migration.");
  process.exit(0);
}

// Validate all files before touching any of them. Each replacement only changes
// the YAML id line; dates, topics, bodies, filenames, and index sequence remain intact.
for (const update of changed) {
  const replacement = `id: ${JSON.stringify(update.id)}`;
  const expectedLine = `id: ${JSON.stringify(update.item.id)}`;
  fs.writeFileSync(`${update.filePath}.id-migration.tmp`, update.source.replace(expectedLine, replacement), "utf8");
}

for (const update of changed) fs.renameSync(`${update.filePath}.id-migration.tmp`, update.filePath);
const migratedIndex = updates.map((update) => ({ ...update.item, id: update.id }));
fs.writeFileSync(indexPath, `${JSON.stringify(migratedIndex, null, 2)}\n`, "utf8");
console.log(`Migrated ${changed.length} legacy ID(s); preserved ${migratedIndex.length} index positions.`);
