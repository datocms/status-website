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
- **Environment variables**: Type-safe via `astro:env` schema in `astro.config.mjs`
- **Node version**: 24 (see `.nvmrc`)

## Project Structure

```
├── src/
│   ├── content.config.ts     # Astro content collections (incidents + maintenances)
│   ├── lib/                  # Business logic (incidents model, i18n, markdown, timeLink)
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
Same structure but includes `scheduledTime` (ISO8601) and `minutes` (duration). Updates use statuses: `scheduled`, `in_progress`, `completed`.

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

A static version of the site is automatically deployed to GitHub Pages on every `git push` via a Husky pre-push hook. It lacks Components Status, System Metrics, and Third-Party Components (those require server endpoints), but incidents and history work fine.

To activate the fallback:

1. **Update `GITHUB_PAGES_CNAME`** from `status2.datocms.com` to `status.datocms.com`
2. **Commit and push** — this triggers a rebuild and deploys to the `gh-pages` branch with the updated CNAME
3. **Update DNS** — go to [Cloudflare DNS for datocms.com](https://dash.cloudflare.com/6c36efb897e5eae1d2a887cfa632eea9/datocms.com/dns/records) and change the `status` CNAME record target from `datocms-status.netlify.com` to `datocms.github.io`

To revert back to Netlify once it's up:

1. **Revert `GITHUB_PAGES_CNAME`** back to `status2.datocms.com`, commit and push
2. **Revert DNS** — change the `status` CNAME record back to `datocms-status.netlify.com`

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
