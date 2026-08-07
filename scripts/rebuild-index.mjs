import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LocalMarkdownSessionStore } from "../src/session-store.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(fs.readFileSync(path.join(root, "reflection-contract.json"), "utf8"));
const store = new LocalMarkdownSessionStore({
  dataDirectory: path.join(root, contract.storage.data_directory),
  categories: contract.categories
});
console.log(`Rebuilt index with ${store.rebuildIndex()} session(s).`);
