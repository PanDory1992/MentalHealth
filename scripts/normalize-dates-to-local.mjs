import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDirectory = path.join(root, "data");
const indexPath = path.join(dataDirectory, "index.json");
const sessionsDirectory = path.join(dataDirectory, "sessions");
const index = JSON.parse(fs.readFileSync(indexPath, "utf8"));

function formatLocalIso(source) {
  const pad = (value, width = 2) => String(value).padStart(width, "0");
  const offsetMinutes = -source.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  return `${source.getFullYear()}-${pad(source.getMonth() + 1)}-${pad(source.getDate())}T${pad(source.getHours())}:${pad(source.getMinutes())}:${pad(source.getSeconds())}.${pad(source.getMilliseconds(), 3)}${sign}${pad(Math.floor(absoluteOffset / 60))}:${pad(absoluteOffset % 60)}`;
}

const updates = index.map((item) => {
  // Date-only legacy records intentionally retain their unknown time precision.
  if (!String(item.date).includes("T")) return { item, date: item.date, changed: false };
  const date = formatLocalIso(new Date(item.date));
  const filePath = path.join(sessionsDirectory, item.file);
  const source = fs.readFileSync(filePath, "utf8");
  const expectedLine = `date: ${JSON.stringify(item.date)}`;
  if (!source.includes(expectedLine)) throw new Error(`Refusing migration: ${item.file} does not contain ${expectedLine}.`);
  return { item, date, filePath, source, changed: item.date !== date };
});
const changed = updates.filter((update) => update.changed);
for (const update of changed) {
  fs.writeFileSync(`${update.filePath}.date-local.tmp`, update.source.replace(`date: ${JSON.stringify(update.item.date)}`, `date: ${JSON.stringify(update.date)}`), "utf8");
}
for (const update of changed) fs.renameSync(`${update.filePath}.date-local.tmp`, update.filePath);
fs.writeFileSync(indexPath, `${JSON.stringify(updates.map((update) => ({ ...update.item, date: update.date })), null, 2)}\n`, "utf8");
console.log(`Normalized ${changed.length} full timestamp(s) to local ISO time with offset.`);
