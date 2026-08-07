// Helper process spawned by the concurrency test in session-store.test.mjs.
// Args: <dataDirectory> <workerId> <count>
// Creates `count` sessions back-to-back against a shared data directory, all
// sharing the same clock second, so every writer collides with the others.
import { LocalMarkdownSessionStore } from "../../src/session-store.mjs";

const [, , dataDirectory, workerId, countArg] = process.argv;
const categories = ["FADEWELL", "Praca", "Zdrowie", "Relacje", "Ja/Emocje", "Inne"];
const store = new LocalMarkdownSessionStore({
  dataDirectory,
  categories,
  clock: () => new Date("2026-08-07T20:00:00+02:00")
});

for (let i = 0; i < Number(countArg); i++) {
  store.createSession({ topic: `Worker ${workerId} sesja ${i}` });
}
