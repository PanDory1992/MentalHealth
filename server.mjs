import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { LocalMarkdownSessionStore } from "./src/session-store.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const contract = JSON.parse(fs.readFileSync(path.join(root, "reflection-contract.json"), "utf8").replace(/^\uFEFF/, ""));
if (contract?.schema_version !== 1 || !Array.isArray(contract.categories) || !contract.storage?.data_directory) {
  throw new Error("Invalid reflection-contract.json.");
}
const store = new LocalMarkdownSessionStore({
  dataDirectory: path.join(root, contract.storage.data_directory),
  categories: contract.categories
});

const tools = [
  {
    name: "list_sessions",
    description: "List session summaries from the local index, newest first. Dates are ISO 8601; before/after are exclusive.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 200, default: 50 },
        before: { type: "string", description: "Return sessions dated before this ISO 8601 value." },
        after: { type: "string", description: "Return sessions dated after this ISO 8601 value." }
      }
    }
  },
  {
    name: "get_session",
    description: "Get one full reflection session, including all structured fields and its free markdown body.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } }
  },
  {
    name: "search_sessions",
    description: "Search local session content. By default returns lightweight index metadata and one short match_context; call get_session(id) for a full entry, or set full:true when full results are intentional. category must be one of the bridge's fixed categories; tag is an exact case-insensitive tag match. date_range bounds are exclusive ISO 8601 values.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Text to find across structured fields and the free body, including about." },
        category: { type: "string", enum: contract.categories },
        tag: { type: "string" },
        date_range: {
          type: "object",
          properties: { before: { type: "string" }, after: { type: "string" } }
        },
        full: { type: "boolean", default: false, description: "Return full sessions, including raw_input and body. Defaults to false." },
        limit: { type: "integer", minimum: 1, maximum: 200, default: 50 }
      }
    }
  },
  {
    name: "create_session",
    description: "Create a local reflection session. topic is required; all other structured text fields are optional and default to empty. date and id are generated from the system clock. about is an optional free-text period/context the entry concerns. categories uses only the fixed set. body is unstructured markdown below frontmatter.",
    inputSchema: {
      type: "object",
      required: ["topic"],
      properties: sessionFieldSchema({ includeId: false, includeBody: true, includeDate: false })
    }
  },
  {
    name: "update_session",
    description: "Patch an existing session and keep the index in sync. Fields omitted are preserved. id and the creation timestamp date cannot be changed; body updates the unstructured markdown body.",
    inputSchema: {
      type: "object",
      required: ["id", "fields"],
      properties: {
        id: { type: "string" },
        fields: { type: "object", properties: sessionFieldSchema({ includeId: false, includeBody: true, includeDate: false }) }
      }
    }
  }
];

function sessionFieldSchema({ includeId, includeBody, includeDate = true }) {
  const result = {
    topic: { type: "string" }, situation: { type: "string" }, logic: { type: "string" },
    emotion: { type: "string" }, summary: { type: "string" },
    categories: { type: "array", items: { type: "string", enum: contract.categories } },
    tags: { type: "array", items: { type: "string" } },
    raw_input: { type: "string", description: "Optional original unstructured input." },
    audio_ref: { type: "string", description: "Optional future audio reference. No audio processing is implemented." },
    about: { type: "string", description: "Optional free-text period or context this entry concerns, for example '1992-1996', 'dzieciństwo', or 'maj 2026'." }
  };
  if (includeDate) result.date = { type: "string", description: "ISO 8601 creation time. Read-only after creation; legacy entries may contain a date-only value." };
  if (includeId) result.id = { type: "string" };
  if (includeBody) result.body = { type: "string", description: "Free markdown text stored below YAML frontmatter." };
  return result;
}

function callTool(name, args) {
  switch (name) {
    case "list_sessions": return textResult(store.listSessions(args));
    case "get_session": {
      const entry = store.getSession(args.id);
      if (!entry) throw new Error(`Session not found: ${args.id}`);
      return textResult(entry);
    }
    case "search_sessions": return textResult(store.searchSessions(args));
    case "create_session": return textResult(store.createSession(args));
    case "update_session": {
      const entry = store.updateSession(args.id, args.fields);
      if (!entry) throw new Error(`Session not found: ${args.id}`);
      return textResult(entry);
    }
    default: throw new Error(`Unknown tool: ${name}`);
  }
}
function textResult(value) {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}
function response(id, result) { return { jsonrpc: "2.0", id, result }; }
function errorResponse(id, error) {
  return { jsonrpc: "2.0", id: id ?? null, error: { code: -32603, message: error?.message || String(error) } };
}
function handle(message) {
  if (!message || typeof message !== "object") return null;
  try {
    if (message.method === "initialize") {
      return response(message.id, {
        protocolVersion: message.params?.protocolVersion || "2024-11-05",
        capabilities: { tools: { listChanged: true } },
        serverInfo: { name: "personal-reflection-bridge", version: contract.bridge_version }
      });
    }
    if (message.method === "ping") return response(message.id, {});
    if (message.method === "tools/list") return response(message.id, { tools });
    if (message.method === "tools/call") return response(message.id, callTool(message.params?.name, message.params?.arguments || {}));
    if (message.method?.startsWith("notifications/")) return null;
    throw new Error(`Unsupported method: ${message.method}`);
  } catch (error) { return errorResponse(message.id, error); }
}

// Same stdin/stdout transport behavior as the FADEWELL bridge: NDJSON and Content-Length both work.
let input = Buffer.alloc(0);
let transportMode = "ndjson";
function send(message) {
  const body = JSON.stringify(message);
  process.stdout.write(transportMode === "content-length" ? `Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}` : `${body}\n`);
}
process.stdin.on("data", (chunk) => {
  input = Buffer.concat([input, chunk]);
  while (true) {
    const firstNewline = input.indexOf("\n");
    const headerEnd = input.indexOf("\r\n\r\n");
    let body;
    if (headerEnd !== -1 && (firstNewline === -1 || headerEnd < firstNewline)) {
      transportMode = "content-length";
      const header = input.slice(0, headerEnd).toString("utf8");
      const match = header.match(/Content-Length:\s*(\d+)/i);
      if (!match) { input = input.slice(headerEnd + 4); continue; }
      const end = headerEnd + 4 + Number(match[1]);
      if (input.length < end) return;
      body = input.slice(headerEnd + 4, end).toString("utf8");
      input = input.slice(end);
    } else {
      transportMode = "ndjson";
      if (firstNewline === -1) return;
      body = input.slice(0, firstNewline).toString("utf8").trim();
      input = input.slice(firstNewline + 1);
      if (!body) continue;
    }
    try {
      const messages = JSON.parse(body);
      for (const message of Array.isArray(messages) ? messages : [messages]) {
        const result = handle(message);
        if (result) send(result);
      }
    } catch (error) { send(errorResponse(null, error)); }
  }
});
process.stdin.resume();
