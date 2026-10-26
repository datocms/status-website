# DatoCMS Status Website

Public status page for DatoCMS services. Built with Astro, deployed on Netlify.

## Tech Stack

- **Framework**: Astro with TypeScript
- **Interactive components**: Web Components (custom elements) — zero framework JS
- **Charts**: Chartist v1
- **Styling**: Global CSS with custom properties (no preprocessor)
- **Hosting**: Netlify (static site + serverless functions via @astrojs/netlify)
- **Data**: JSON files in `data/incidents/` and `data/maintenances/`
- **Metrics**: AWS CloudWatch (response time, success rate) + StatusCake (uptime monitoring)
- **Environment variables**: Type-safe via `astro:env` schema in `astro.config.mjs`. All secrets are optional; without them the metrics endpoints answer 503 JSON and the page shows a message
- **Node version**: 24 (see `.nvmrc`)

## Project Structure

```
├── src/
│   ├── content.config.ts     # Astro content collections (incidents + maintenances)
│   ├── lib/                  # Business logic (schema constants, incidents model, i18n, markdown, timeLink)
│   ├── styles/global.css     # All styles with CSS custom properties
│   ├── layouts/BaseLayout.astro
│   ├── components/           # Astro components with inline <script> web components
│   └── pages/
│       ├── api/              # Server endpoints (cloudwatch, component-status, feeds)
│       ├── history/          # Paginated history ([...page].astro)
│       ├── incidents/        # Individual incident pages ([slug].astro)
│       ├── history.rss.ts    # RSS feed
│       ├── history.atom.ts   # Atom feed
│       ├── history.json.ts   # JSON feed
│       ├── index.astro       # Homepage
│       └── 404.astro
├── data/
│   ├── incidents/            # One JSON file per incident
│   └── maintenances/         # One JSON file per maintenance
├── tui/                      # Maintainer TUI (Ink); `npm run tui` from the root
├── public/                   # Static assets (SVGs, logo)
├── astro.config.mjs          # Astro config with env schema
├── netlify.toml              # Netlify build config
└── .env                      # Environment variables (not committed)
```

## Data Model

### Incidents (`data/incidents/*.json`)
```json
{
  "name": "Incident Title",
  "impact": "major|minor|none",
  "components": ["cda", "cma", ...],
  "updates": [{ "content": "...", "status": "investigating|identified|monitoring|resolved", "date": "ISO8601" }]
}
```

### Maintenances (`data/maintenances/*.json`)
Same structure but includes `scheduledTime` (ISO8601) and `minutes` (duration). Updates use statuses: `scheduled`, `in-progress`, `verifying`, `completed`.

### Key Model Invariants
- `isMaintenance` is determined by presence of `scheduledTime` field
- Incident date returns `scheduledTime` for maintenances, first update date for incidents
- All incidents sorted by date descending (newest first)
- `isUnresolved`: for incidents checks `status !== 'resolved'`; for maintenances checks `status !== 'completed' && status !== 'scheduled'`

## Monitored Components

`cda`, `cma`, `assets`, `administrativeAreas`, `dashboard`, `site`. Component labels mapped via `src/lib/i18n.ts`.

## Server Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/cloudwatch?graph=...&time=...` | CDA response time and API success rate from AWS CloudWatch |
| `/api/component-status?days=...` | Uptime/downtime per component from StatusCake API |
| `/api/feeds` | Aggregated third-party RSS feeds |

### StatusCake Failures (`/api/component-status`)

StatusCake gives 429 and 5xx errors when the 11 uptime checks arrive together.
The endpoint keeps the page usable when this occurs:

- No more than 3 parallel requests, with 3 attempts and a longer wait at each
  attempt. Only 429, 5xx, timeouts and network errors start a new attempt.
- One time budget of 8 s for all the checks together, below the 10 s limit of a
  Netlify function.
- A check that fails makes only its region `unknown`. It does not stop the
  other components, and it does not show a false outage. The reply stays in the
  CDN for 5 minutes, or 1 minute if some data is missing.
- If no check gives data, the endpoint replies 503 and the page shows a message
  that says the uptime monitor, not DatoCMS, is unavailable.

## Posting an update

`npm run tui` at the repo root launches the maintainer TUI in `tui/` (Ink, own
`package.json`, no native deps). It writes the JSON files in `data/`, previews
them through the dev server, commits, pushes, and verifies both hosts. The
Claude skills below are the alternative path. See README "Posting an update".

Valid components, impacts, and statuses live in `src/lib/schema.ts`. The Zod
content schema, `i18n.ts`, and the TUI all import it. Add new values there.

## Page Titles

`Header.astro` is the `h1` of each page that uses `isPageTitle`. `pageName`
adds the name of the page: `DatoCMS Status: Incident History`, `DatoCMS
Status: Incident Detail`, `DatoCMS Status: Maintenance`. Sections are `h2`, their parts `h3`, the items of a
part `h4`. The link back to the homepage says `Back to status page`.

## Dates and Times

- Every date and time on the site is in UTC. Use the functions in
  `src/lib/time.ts`. Do not use `format` from `date-fns`: it uses the zone of
  the machine, and the mirror gets its build on the laptop of the person who
  pushes.
- A timestamp is `timestampHtml(date)`: a `<time datetime>` element with the
  text `Sep 28, 20:57 UTC`, and an empty `<relative-time>` element. The browser
  fills that one with ` · 3 hr. ago` (`src/components/RelativeTime.astro`), and
  keeps it correct without a reload. It uses `Intl.RelativeTimeFormat`, not a
  library. Without JavaScript the UTC text stays alone.
- A date heading (a day, a month) has no relative time.
- Every date is a `<time datetime="..." data-format="...">` element: use
  `timeHtml(format, date)`. The name of the format lets the browser write the
  date again in local time.
- The visitor can switch the whole site between UTC and local time
  (`src/components/TimeMode.astro`, `src/lib/timeMode.ts`). The choice is in
  `localStorage`. The hint below a title is the switch: write it as
  `<p class="section-hint"><time-mode-hint>Dates &amp; times in UTC.</time-mode-hint></p>`.
  The server writes UTC, which is also the page without JavaScript.
- Local time uses the language and the habits of the browser. A day or a month
  has no local form: it stays in UTC, and says `(UTC)` in local mode.
- Groups stay UTC groups in local mode: the days of the incident history, the
  months of the history pages, the bars of the component status.
- Days and months are UTC days and months: the groups of the incident history,
  the history pages, and the bars of the component status.
- `/api/feeds` gives every supplier date in UTC. Imgix sends Pacific time.
- A stored date without a zone is read as UTC (`parseInstant`).
- The end-to-end tests build the site in Los Angeles time and run the browser
  in Tokyo time, so a test that expects a UTC text proves both.

## Tests

- `npm run test:unit`: Vitest, files in `test/`. `vitest.config.ts` uses Astro's Vite config, so `astro:*` imports resolve. Mock `astro:env/server` and `astro:content` with `vi.mock`.
- `npm run test:e2e`: Playwright, files in `e2e/`. `e2e/prepare.ts` installs Chromium when it is missing, makes fixture data (`e2e/fixtures.ts`) and builds it into `e2e/.dist` with `STATUS_DATA_DIR`. `e2e/serve.ts` serves it without API routes. Give API replies with `mockApi` from `e2e/support.ts`.
- `npm run test:tui`: `node:test` in `tui/test/`.
- `.husky/pre-commit` runs `scripts/preCommit.ts`. A commit that changes only `data/` runs no test. The rule is `scripts/testScope.ts`. There is no CI.
- The end-to-end build is a production build: `import.meta.env.DEV` is false. Test the dev-only messages in unit tests.
- When you add behaviour, add a test for it. When you fix a defect, add the test that fails without the fix.

## Development

```bash
npm install
npm run dev       # Starts local dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview build locally
```

## Environment Variables

Defined in `astro.config.mjs` under `env.schema` using `astro:env`. Imported in server code via `import { VAR } from 'astro:env/server'`:

- `CLOUDWATCH_AWS_REGION` — AWS region (default: us-east-1)
- `CLOUDWATCH_AWS_ACCESS_KEY_ID` — AWS access key
- `CLOUDWATCH_AWS_SECRET_ACCESS_KEY` — AWS secret key
- `STATUSCAKE_API_TOKEN` — StatusCake API token

## GitHub Pages Fallback (if Netlify goes down)

A static version of the site is automatically deployed to GitHub Pages on every push to `master` via a Husky pre-push hook. A push from another branch does not deploy it. The hook builds the mirror from a clean copy of the commit that the push sends, so a file that nobody committed does not reach the mirror. It lacks Component Status, System Metrics, and Third-Party Components (those require server endpoints): each of these sections says so and links to the main host. Incidents and history work fine.

To activate the fallback:

1. **Update `GITHUB_PAGES_CNAME`** from `status2.datocms.com` to `status.datocms.com`
2. **Commit and push** — this triggers a rebuild and deploys to the `gh-pages` branch with the updated CNAME
3. **Update DNS** — go to [Cloudflare DNS for datocms.com](https://dash.cloudflare.com/6c36efb897e5eae1d2a887cfa632eea9/datocms.com/dns/records) and change the `status` CNAME record target from `datocms-status.netlify.com` to `datocms.github.io`

To revert back to Netlify once it's up:

1. **Revert `GITHUB_PAGES_CNAME`** back to `status2.datocms.com`, commit and push
2. **Revert DNS** — change the `status` CNAME record back to `datocms-status.netlify.com`

## RSS Supplier Path (disabled)

`src/lib/rssFeed.ts` reads a supplier that publishes only an RSS or Atom feed.
The code is commented out, and `rss-parser` and `htmlparser2` are not
installed, because no supplier uses it and its packages took `/api/feeds` down
two times. The note at the start of that file has the reason and the steps to
turn it on.

`test/rssFeed.test.ts` has its 19 tests, with `{ fails: true }` on the 2
`describe` blocks. They report "expected fail" while the path is off. Do not
delete them, and do not "fix" them: they are correct for the code that is
commented out.

`test/serverDependencies.test.ts` loads every package that the server code
imports in a runtime that cannot `require()` an ES module. That is how Netlify
runs the function. A package that fails there fails this test.

## Dependency Overrides

`package.json` has an `overrides` block. It is there only to remove Dependabot
alerts in build-time packages that `@astrojs/netlify` pulls in. Neither package
runs in production: this site does not use Astro image optimization, and
`@netlify/dev` only runs the local dev server.

| Override | Reason |
|----------|--------|
| `@netlify/vite-plugin: ^3.0.1` | The adapter asks for `^2.12.3`, which pulls in `@netlify/functions-dev@1` and its vulnerable `extract-zip`. Version 3 does not use `extract-zip`. |
| `sharp: ^0.35.4` | `ipx` asks for `^0.34.3`, which has the libvips and libheif advisories. |

Remove each override when `@astrojs/netlify` moves to the newer version by
itself. After you remove one, do `npm install` and `npm audit` to make sure the
alert does not come back.

## Conventions

- Incident file names: `YYYY-MM-DD-slug.json`
- All dates in ISO 8601 UTC
- Interactive components use Web Components (custom elements) with inline `<script>` in `.astro` files
- No React or other UI framework — vanilla JS only
- CSS uses custom properties (e.g. `--color-green`, `--color-border`)
