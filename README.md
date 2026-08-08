# Personal Reflection Bridge

Local-first, file-based reflection sessions with a small MCP server for Claude. Zero external
dependencies — just Node.js reading and writing Markdown files on your own disk. Nothing is sent
anywhere except when Claude itself is used.

This repository is the **engine and an empty starting template**, not anyone's personal data. The
four Markdown files at the root (`CLAUDE.md`, `GLOSY.md`, `WZORCE.md`, `DZIENNIK.md`) are
intentionally blank scaffolding — they describe *how* the workspace should operate, not *what* is
in it. Real content is meant to grow only through your own conversations, never by copying someone
else's.

## Instrukcja po polsku (Windows, bez instalowania czegokolwiek)

1. Na tej stronie kliknij zielony przycisk **Code → Download ZIP** i rozpakuj folder w dowolnym
   miejscu na dysku (np. `D:\Refleksja`). Nie klonuj repo przez git, jeśli nie wiesz, co to znaczy
   — zwykły ZIP wystarczy w zupełności.
2. Zamknij Claude Desktop, jeśli jest otwarte.
3. Kliknij dwa razy **`setup.cmd`**. Za pierwszym razem pobierze się lokalny, przenośny silnik
   Node.js (ok. 50 MB, jednorazowo, prosto z oficjalnej strony nodejs.org) i sam wpisze się do
   konfiguracji Claude Desktop. Nic nie trzeba nigdzie instalować ani klikać "Zgadzam się" w
   żadnym instalatorze — to zwykły, podpisany plik `node.exe` położony obok reszty plików.
4. Otwórz Claude Desktop ponownie. Bridge pojawi się jako `personal-reflection`.
5. **Załóż Projekt** (Claude Desktop → Projects → Create project, dowolna nazwa) i w jego
   ustawieniach, w polu **Custom instructions**, wklej treść z pliku `PROJECT-CUSTOM-INSTRUCTIONS.md`
   z tego repo. Bez tego kroku bridge nadal działa technicznie, ale model w zwykłym czacie nie ma
   pewnego sposobu, żeby wiedzieć, że ma czytać `CLAUDE.md` na starcie rozmowy, i traktuje go jako
   zwykłą, niesprawdzoną treść z narzędzia zamiast Twoich instrukcji — Projekt to jedyny sposób,
   żeby dać mu ten sam poziom zaufania, jaki ma system typu Cowork z podłączonym folderem.
6. **Każdą nową sesję zaczynaj z poziomu tego Projektu** — klikaj "New chat" otwarty wewnątrz
   Projektu, nie ten ogólny z głównego paska bocznego. Zwykły, nieprzypisany czat nie ma pola
   Custom instructions i wraca do zachowania sprzed tego kroku.
7. **Ważne:** to jest pusty silnik. Nie wklejaj tu niczyich gotowych wpisów. Niech `CLAUDE.md` i
   reszta zapełnią się przez rozmowę z Claude, od zera.
8. **Ważne #2:** jeśli po jakimś czasie Twoje prawdziwe sesje wylądują w folderze `data/sessions/`
   — nie synchronizuj tego z powrotem do tego (publicznego) repozytorium GitHub. Ten folder, gdy
   już go rozpakujesz na dysku, jest zwykłym lokalnym folderem, nie ma żadnego automatycznego
   połączenia z powrotem do GitHub — więc nic się nie stanie samo, ale nie commituj i nie pushuj
   `data/` ręcznie.

Wymagania: 64-bitowy Windows 10/11, dowolna nowoczesna wersja Claude Desktop, i internet przy
pierwszym uruchomieniu `setup.cmd` (do pobrania silnika Node.js).

## Structure

```text
.
├── data/
│   ├── index.json             # lightweight search/list index (starts empty: [])
│   └── sessions/               # one Markdown file per session (starts empty)
├── src/session-store.mjs      # storage interface + local implementation
├── server.mjs                  # MCP stdio bridge
├── scripts/                    # maintenance scripts (rebuild index, migrations)
├── setup.ps1 / setup.cmd       # one-time, no-install Windows setup (fetches a portable
│                                # Node.js runtime and registers the bridge with Claude Desktop)
├── start-bridge.cmd            # manual/test launch only — not needed for normal use
├── reflection-contract.json    # categories and local storage settings
├── CLAUDE.md, GLOSY.md,
│   WZORCE.md, DZIENNIK.md      # empty starting scaffolding, see note above
└── package.json
```

`SessionStore` is the access boundary. The current `LocalMarkdownSessionStore` implementation can
later be replaced by a sync or hosted provider without changing the MCP tool interface.

## Entry schema

Every session has `id`, `date`, `topic`, `situation`, `logic`, `emotion`, `summary`, `categories`,
`tags`, `raw_input`, `audio_ref`, and optional `about` in YAML frontmatter, followed by an optional
free Markdown body. `date` is the full ISO 8601 creation time in local time with its offset (for
example `+02:00`) and is read-only afterward; it therefore agrees with the local-time ID. `about`
holds the period or context it concerns (for example `1992-1996`, `childhood`, or `May 2026`) and
may be empty. `audio_ref` is retained for a future feature; the bridge does not record or
transcribe audio.

The allowed categories live in `reflection-contract.json` (default: `Praca`, `Zdrowie`, `Relacje`,
`Ja/Emocje`, `Inne`) — edit that file to fit your own vocabulary. Tags are freeform.

Files are named from the entry's `date` as `YYYY-MM-DD_HHMM_slug.md`. IDs are local creation
timestamps to the second: `YYYY-MM-DDTHHMMSS`. A same-second collision receives a zero-padded
suffix such as `-02`, then `-03`. The index always sorts by `date`, then ID, so rebuilding it
retains this order.

## Manual setup (any OS, if you already have Node.js installed)

If you're not on Windows, or already have Node.js on your PATH, you don't need `setup.cmd` at all
— just point your MCP client at `server.mjs` directly:

```json
{
  "mcpServers": {
    "personal-reflection": {
      "command": "node",
      "args": ["/absolute/path/to/this/folder/server.mjs"]
    }
  }
}
```

The bridge exposes `get_workspace_instructions`, `list_sessions`, `get_session`, `search_sessions`,
`create_session`, and `update_session`. `get_workspace_instructions` reads `CLAUDE.md`, `GLOSY.md`,
`WZORCE.md`, `DZIENNIK.md` from disk (whichever exist) plus the real local server time, and should
be called before anything else at the start of a conversation — see `PROJECT-CUSTOM-INSTRUCTIONS.md`
for why plain chat needs a Project to make that reliable. `list_sessions` returns lightweight index
records, including `about`.
`search_sessions` defaults to the same metadata plus a short context around the first text match;
use `get_session(id)` for the whole entry, or pass `full: true` only when intentionally retrieving
complete matching entries. It speaks JSON-RPC over stdio, supporting both NDJSON and
`Content-Length` framing.

## Add a session manually

If the bridge is unavailable, create a new file in `data/sessions/` using the filename convention
and this format. Keep text values JSON-quoted so the frontmatter stays easy for the bridge to read.

```markdown
---
id: "2026-07-26T183012"
date: "2026-07-26T18:30:12.000+02:00"
topic: "Short topic"
situation: "What happened"
logic: "Rational read"
emotion: "What I feel"
summary: "Main takeaway"
categories: ["Ja/Emocje"]
tags: ["evening", "reflection"]
raw_input: null
audio_ref: null
about: "May 2026"
---
Free-form Markdown notes below the frontmatter.
```

Then run `node scripts/rebuild-index.mjs` from this folder so list/search can see it. The rebuild
uses `date` then ID, rather than filesystem or alphabetical order.

## Local commands

Run `node server.mjs` (or the bundled `.\node\node.exe server.mjs` on Windows) to start the bridge
manually, or double-click `start-bridge.cmd`. Run `node scripts/rebuild-index.mjs` after manually
editing session files.
