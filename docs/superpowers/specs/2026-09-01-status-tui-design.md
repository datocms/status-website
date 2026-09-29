# Status TUI design

Date: 2026-09-01. Branch: `feature/tui`.

## Goal

Give maintainers a deterministic, terminal-only way to post status updates.
The TUI writes the same JSON files the Astro site already reads. Every field
is human-entered and human-editable. Claude assistance exists only as opt-in
actions behind a hotkey. The default flow never calls an LLM.

## Why

On 2026-09-01 a real incident took over an hour to post through the Claude
skills: a tool-option limit broke the first question, no preview, no way to
edit the output, `npm install` failed on `sharp`, valid field values were not
discoverable, timestamps were manual, and publishing was unclear. Basecamp:
message 9616599086 (comment 10262517162) and card 9200092556.

## Decisions

| Topic | Decision |
|---|---|
| Framework | Ink (React for the terminal), full-screen two-pane app |
| Location | Subdirectory package `tui/` with its own `package.json` and lockfile, same git repo |
| Launch | `npm run tui` at the root installs `tui/` on first use, then starts it |
| Runtime | `tsx` runs the TSX source; no build step |
| Dependencies | `ink`, `react`, `tsx`, `luxon` (dates and zones), `diff` (history view). Widgets are hand-written. No native modules |
| Old skills | The four Claude skills stay as an alternative path; only the four-option bug in `new-incident` is fixed |
| Right pane | JSON only, live |
| Browser preview | Ctrl+P starts `astro dev` in the repo root and opens the draft page |
| Publishing | Write, commit, push from the TUI, then verify both hosts |
| Claude actions | Help me write from notes, copyedit, translate to English, via `claude -p` |
| Dev server | Works with no secrets; metrics show a precise message in dev, a neutral one in production |
| Schema | `src/lib/schema.ts` feeds the Zod schema, i18n, and the TUI |

## Keys

| Key | Action |
|---|---|
| Tab / Shift+Tab | Next / previous field |
| Enter | Edit the focused field or confirm a menu |
| Esc | Leave a field, close a menu, go back |
| Ctrl+P | Preview in browser via the dev server |
| Ctrl+G | Claude actions on the message field |
| Ctrl+E | Open the message field in `$EDITOR` |
| Ctrl+S | Go to the Publish screen |
| Ctrl+C | Quit, with keep-or-discard prompt for an unpublished draft |

Single letters are never hotkeys. Ctrl+A, Ctrl+B, Ctrl+D, Ctrl+Z are avoided
because screen, tmux, and the shell claim them.

## Flows and fields

| Flow | Fields | Defaults |
|---|---|---|
| New incident | title, slug, impact, components, status, message, date | impact major, status investigating, date now |
| New maintenance | title, slug, starts, minutes, components, description | starts next full hour, 120 minutes |
| Update | status, message, date | status is the item's current status, date now |
| Resolve | status (locked), message, date | resolved / completed, message prefilled |

## Data rules

- File name `YYYY-MM-DD-<slug>.json`; date is the update date (incident) or
  the scheduled date (maintenance) in UTC. Slug derives from the title and is
  editable.
- Two-space indent, trailing newline, key order matching existing files.
  Maintenance `minutes` is a string.
- Dates are shown in UTC; input accepts `YYYY-MM-DD HH:mm` (UTC) or ISO.
- Updates append to the existing array; the rest of the file is untouched.

## Draft and preview

- The form writes the draft to its real path under `data/` on every change,
  debounced 300 ms, as soon as a title exists. Astro reads only `data/`.
- Ctrl+P starts `astro dev` on a free port, waits for it, opens
  `/incidents/<slug>/` in the default browser. Edits hot-reload. The server
  stops when the TUI exits.
- Quitting or going back with an unpublished draft asks keep or discard.
  Discard deletes a new file or restores a tracked one with `git checkout`.

## Claude actions

- Ctrl+G opens a menu with the three actions. Each runs
  `claude -p --output-format text` with the prompt on stdin: task, house
  style, two recent updates as examples (except translate), the text.
- Spinner while running, 90 s timeout, Esc cancels. Result shown beside the
  original with Accept or Discard. Accept replaces the message only.
- When `claude` is not on the path the menu says so.

## Publish and verify

- Actions: write, commit and push; write and commit; write only; back.
- Git output streams into a log pane; the pre-push hook builds the mirror.
- After a push, poll `history.json` on `status.datocms.com` and
  `status2.datocms.com` every 5 s for up to 5 min with a cache-busting query.
- Verified means the item with the slug exists, the title matches exactly,
  and every non-empty line of every update appears in `content_html` after
  tag stripping, entity decoding, and whitespace collapsing. Markdown markers
  are stripped from the source before comparing.
- Mismatch shows the expected line and the nearest rendered text. Esc stops
  polling. The final screen prints both URLs.

## Dev server without secrets

Verified 2026-09-01: build and dev already succeed without secrets; only the
two metrics endpoints failed with an Astro 500. Now the secrets are optional,
the endpoints return `not_configured` (503) or `upstream_error` (502) JSON,
and the browser shows a precise reason under `astro dev`, a neutral line in
production (reason in the console), and a mirror-specific line on GitHub
Pages where the endpoints do not exist.

## Testing

- `node:test` for `tui/src/lib`: dates, files, flows, text editing,
  verification (including emoji and accents), git and Claude runners with a
  stubbed process runner.
- `ink-testing-library` for the widgets.
- `cd tui && npm test`. No test touches the network or git.

## Out of scope

- Site rendering, styles, data model.
- JSON Schema files for hand editing.
- The pre-push hook.
- Git submodule or committed bundle.

## Added after the first prototype (2026-09-01)

- Home lists items directly; picking one offers Add an update, Resolve, History.
- Date picker with time zones (Luxon) composes the UTC instant.
- Single-line fields update the draft live so Ctrl+P works mid-edit.
- History: git log per item, side-by-side diff (`diff` package), append-only rollback through the Publish screen.
- `astro dev` skips the Netlify adapter unless `NETLIFY_DEV_EMULATION=1`.
