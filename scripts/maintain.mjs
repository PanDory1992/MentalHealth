// Single entry point for the maintenance scripts, which used to be three
// separately-invoked files solving related index/data consistency problems
// three different ways. This only dispatches - each script keeps working
// exactly as before if called directly, nothing about their logic changed.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const COMMANDS = {
  "rebuild-index": "rebuild-index.mjs",
  "migrate-legacy-ids": "migrate-legacy-ids.mjs",
  "normalize-dates-to-local": "normalize-dates-to-local.mjs"
};

export function run(argv) {
  const [command] = argv;
  if (!command || !COMMANDS[command]) {
    const lines = ["Uzycie: node scripts/maintain.mjs <komenda>", "Dostepne komendy:", ...Object.keys(COMMANDS).map((name) => `  - ${name}`)];
    return { output: lines.join("\n"), status: command ? 1 : 0 };
  }
  const result = spawnSync(process.execPath, [path.join(root, COMMANDS[command])], { stdio: "inherit" });
  return { status: result.status ?? 1 };
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainModule) {
  const { output, status } = run(process.argv.slice(2));
  if (output) console.log(output);
  process.exit(status);
}
