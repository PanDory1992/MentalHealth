# Personal Reflection Bridge

Local-first, file-based reflection sessions with a small MCP server for Claude. Zero external
dependencies — just Node.js reading and writing Markdown files on your own disk. Nothing is sent
anywhere except when Claude itself is used.

This repository is the **engine and an empty starting template**, not anyone's personal data. The
four Markdown files at the root (`CLAUDE.md`, `GLOSY.md`, `WZORCE.md`, `DZIENNIK.md`) are
intentionally blank scaffolding — they describe *how* the workspace should operate, not *what* is
in it. Real content is meant to grow only through your own conversations, never by copying someone
else's.

## Instrukcja po polsku

Są dwa sposoby instalacji. **Zacznij od Metody A** — to obecny, sankcjonowany przez Claude Desktop
sposób instalowania lokalnych serwerów MCP (tzw. Desktop Extension), prostszy i mniej podatny na
błędy niż ręczna edycja configu. Metoda B zostaje jako zapasowa, dla starszych wersji Claude
Desktop, które nie mają jeszcze sekcji Extensions.

### Metoda A: plik `.mcpb` (zalecana)

1. Na tej stronie otwórz **`personal-reflection-bridge.mcpb`** i kliknij **Download** (albo
   pobierz bezpośrednio: `Code → Download ZIP` też zadziała, plik `.mcpb` jest w środku).
2. Otwórz Claude Desktop. W lewym pasku bocznym: **Settings → Extensions → Advanced settings**,
   sekcja **Extension Developer**, przycisk **"Install Extension…"**. Wskaż pobrany plik
   `personal-reflection-bridge.mcpb`.
   Alternatywnie: samo dwuklik na pliku `.mcpb`, albo przeciągnięcie go na okno Claude Desktop,
   też otwiera ten sam ekran instalacji.
3. Zobaczysz ekran instalacji z opisem wtyczki i jednym polem do wypełnienia: **"Folder na dane
   dziennika"**. Wybierz zwykły folder na dysku, w którym mają się zapisywać Twoje sesje — domyślnie
   proponowany jest podfolder w Dokumentach, możesz go zmienić. To ma świadomie nie być folder samej
   wtyczki — dzięki temu Twoje dane są w miejscu, które sama wybierasz i które łatwo znaleźć/zbackupować.
4. Kliknij **Install**. Wtyczka pojawi się na liście w Settings → Extensions jako
   "Personal Reflection Bridge" — od razu aktywna, bez restartu Claude Desktop.
5. **Załóż Projekt** (Claude Desktop → Projects → Create project, dowolna nazwa) i w jego
   ustawieniach, w polu **Custom instructions**, wklej treść z pliku `PROJECT-CUSTOM-INSTRUCTIONS.md`
   z tego repo. Bez tego kroku wtyczka nadal działa technicznie, ale model w zwykłej rozmowie nie ma
   pewnego sposobu, żeby wiedzieć, że ma czytać `CLAUDE.md` na starcie — Projekt daje mu ten sam
   poziom zaufania do tych plików, jaki ma system typu Cowork z podłączonym folderem. (Nie mieliśmy
   jak sprawdzić z zewnątrz, czy sama instalacja przez Extensions to już poprawia — Projekt jest
   więc nadal zalecany jako pewniejsza droga, dopóki ktoś tego nie zweryfikuje w praktyce.)
6. **Każdą nową sesję zaczynaj z poziomu tego Projektu** — "New chat" otwarty wewnątrz Projektu,
   nie ten ogólny z głównego paska bocznego.
7. **Ważne:** to jest pusty silnik. Nie wklejaj tu niczyich gotowych wpisów. Niech `CLAUDE.md` i
   reszta zapełnią się przez rozmowę z Claude, od zera.

Wymagania: Windows 10/11 albo macOS, Claude Desktop z sekcją Settings → Extensions (jeśli jej nie
widzisz, zaktualizuj Claude Desktop albo użyj Metody B). Node.js **nie jest potrzebny** — Claude
Desktop ma go wbudowanego.

### Metoda B: ZIP + `setup.ps1` (zapasowa, tylko Windows)

Użyj tej metody tylko jeśli Metoda A się nie uda (np. starsza wersja Claude Desktop bez Extensions).

1. Na tej stronie kliknij zielony przycisk **Code → Download ZIP** i rozpakuj folder w dowolnym
   miejscu na dysku (np. `D:\Refleksja`). Nie klonuj repo przez git, jeśli nie wiesz, co to znaczy
   — zwykły ZIP wystarczy w zupełności.
2. Zamknij Claude Desktop **całkowicie** — kliknięcie X zwykle tylko chowa okno do zasobnika,
   proces nadal działa w tle. Kliknij prawym na ikonę w zasobniku systemowym (obok zegara) →
   Zamknij/Quit. Sprawdź w Menedżerze zadań (Ctrl+Shift+Esc), czy proces "Claude" naprawdę zniknął.
3. Kliknij dwa razy **`setup.cmd`**. Za pierwszym razem pobierze się lokalny, przenośny silnik
   Node.js (ok. 50 MB, jednorazowo, prosto z oficjalnej strony nodejs.org) i sam wpisze się do
   konfiguracji Claude Desktop. Nic nie trzeba nigdzie instalować ani klikać "Zgadzam się" w
   żadnym instalatorze — to zwykły, podpisany plik `node.exe` położony obok reszty plików.
   Jeśli po pobraniu Node.js okno się nie zamknie samo, tylko pokaże błąd — przeczytaj go, zamiast
   zamykać: skrypt teraz zawsze zatrzymuje się i tłumaczy, co poszło nie tak, zamiast cicho znikać.
4. Otwórz Claude Desktop ponownie (ze Start, nie przez kliknięcie starej ikony w zasobniku — to
   często tylko przywraca stary, wciąż działający proces zamiast uruchomić nowy). Bridge pojawi się
   jako `personal-reflection`.
5. Jeśli mimo to nic się nie pojawiło — zobacz sekcję **Rozwiązywanie problemów** niżej. To znany,
   udokumentowany scenariusz w niektórych wersjach Claude Desktop (pakowanych jako MSIX), nie
   przypadkowa usterka.
6. Kroki 5–7 identyczne jak w Metodzie A: Projekt + `PROJECT-CUSTOM-INSTRUCTIONS.md`, zawsze nowy
   chat z poziomu Projektu, nie wklejaj gotowych wpisów.
7. Jeśli po jakimś czasie Twoje prawdziwe sesje wylądują w folderze `data/sessions/` — nie
   synchronizuj tego z powrotem do tego (publicznego) repozytorium GitHub. Ten folder, gdy już go
   rozpakujesz na dysku, jest zwykłym lokalnym folderem, nie ma żadnego automatycznego połączenia
   z powrotem do GitHub — więc nic się nie stanie samo, ale nie commituj i nie pushuj `data/` ręcznie.

Wymagania: 64-bitowy Windows 10/11, dowolna wersja Claude Desktop, i internet przy pierwszym
uruchomieniu `setup.cmd` (do pobrania silnika Node.js).

### Rozwiązywanie problemów

**Metodą B: setup przeszedł bez błędu, ale po restarcie Claude Desktop nic nowego się nie
pojawiło.** Sprawdź w tej kolejności:

1. Czy Claude Desktop zostało naprawdę zamknięte (patrz krok 2 Metody B), a nie tylko
   zminimalizowane. To najczęstsza przyczyna.
2. Otwórz Claude Desktop → **Developer → Edit Config**. Jeśli ten plik w ogóle nie wygląda jak
   config z sekcją `mcpServers` (np. zawiera zupełnie inne pola, bez `personal-reflection`) — masz
   wersję Claude Desktop pakowaną jako MSIX, w której przycisk "Edit Config" otwiera **inny plik**
   niż ten, który aplikacja faktycznie czyta ([znany, udokumentowany problem](https://github.com/anthropics/claude-code/issues/26073)).
   W tej sytuacji `setup.ps1` nie ma jak trafić do właściwego miejsca — **przejdź na Metodę A**
   (`.mcpb`), ona nie zależy od tego pliku w ogóle.
3. Jeśli masz klasyczną (nie-MSIX) wersję Claude Desktop i `claude_desktop_config.json` faktycznie
   zawiera wpis `personal-reflection`, ale bridge mimo to nie działa — sprawdź, czy `node\node.exe`
   istnieje w folderze, gdzie rozpakowałaś ZIP, i spróbuj odpalić `start-bridge.cmd` ręcznie: powinno
   otworzyć się czarne okienko konsoli i **zostać otwarte** (czeka na połączenie). Jeśli od razu się
   zamyka albo pokazuje błąd, to inny problem niż config.

**Ogólnie, niezależnie od metody:** jeśli coś nie działa i nie wiadomo dlaczego, Metoda A jest
prostsza do zdiagnozowania, bo Claude Desktop sam pokazuje ekran instalacji z błędem zamiast
milczeć — warto ją wypróbować nawet jeśli zaczęłaś od Metody B.

## Structure

```text
.
├── personal-reflection-bridge.mcpb  # packed Desktop Extension - Method A install, see below
├── manifest.json                # MCPB manifest this .mcpb is built from (source of truth)
├── data/
│   ├── index.json             # lightweight search/list index (starts empty: [])
│   └── sessions/               # one Markdown file per session (starts empty)
├── src/session-store.mjs      # storage interface + local implementation
├── server.mjs                  # MCP stdio bridge
├── scripts/                    # maintenance scripts (rebuild index, migrations)
├── setup.ps1 / setup.cmd       # Method B: one-time, no-install Windows setup (fetches a portable
│                                # Node.js runtime and registers the bridge with Claude Desktop)
├── start-bridge.cmd            # manual/test launch only — not needed for normal use
├── reflection-contract.json    # categories and local storage settings
├── CLAUDE.md, GLOSY.md,
│   WZORCE.md, DZIENNIK.md      # empty starting scaffolding, see note above
├── WYWIAD-STARTOWY.md          # one-time onboarding questionnaire, see CLAUDE.md point 0.2
├── PROJECT-CUSTOM-INSTRUCTIONS.md  # paste into a Claude Project's Custom instructions field
└── package.json
```

`SessionStore` is the access boundary. The current `LocalMarkdownSessionStore` implementation can
later be replaced by a sync or hosted provider without changing the MCP tool interface.

## Entry schema

Every session has `id`, `date`, `topic`, `situation`, `logic`, `emotion`, `summary`, `categories`,
`tags`, `raw_input`, `audio_ref`, and optional `about`/`prompted_by` in YAML frontmatter, followed
by an optional free Markdown body. `date` is the full ISO 8601 creation time in local time with its
offset (for example `+02:00`) and is read-only afterward; it therefore agrees with the local-time
ID. `about` holds the period or context it concerns (for example `1992-1996`, `childhood`, or
`May 2026`) and may be empty. `prompted_by` is a short paraphrase of Claude's own preceding
question or message, so an old entry stays orientable without the surrounding conversation.
`audio_ref` is retained for a future feature; the bridge does not record or transcribe audio.

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

The bridge exposes `get_workspace_instructions`, `update_workspace_instructions`, `list_sessions`,
`get_session`, `search_sessions`, `create_session`, and `update_session`. `get_workspace_instructions`
reads `CLAUDE.md`, `GLOSY.md`, `WZORCE.md`, `DZIENNIK.md` from disk (whichever exist) plus the real
local server time, and should be called before anything else at the start of a conversation — see
`PROJECT-CUSTOM-INSTRUCTIONS.md` for why plain chat needs a Project to make that reliable.
`update_workspace_instructions` is the write side of the same four files, for clients (like plain
Claude Desktop chat) that have no other filesystem tool — it replaces a whole file at once, so read
first. `list_sessions` returns lightweight index records, including `about`.

To build `personal-reflection-bridge.mcpb` yourself from `manifest.json` (for example after editing
`server.mjs`): `npm install -g @anthropic-ai/mcpb`, then `mcpb pack . personal-reflection-bridge.mcpb`
from this folder.
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
prompted_by: null
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
