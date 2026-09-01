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

## Posting an update

`npm run tui` at the repo root launches the maintainer TUI in `tui/` (Ink, own
`package.json`, no native deps). It writes the JSON files in `data/`, previews
them through the dev server, commits, pushes, and verifies both hosts. The
Claude skills below are the alternative path. See README "Posting an update".

Valid components, impacts, and statuses live in `src/lib/schema.ts`. The Zod
content schema, `i18n.ts`, and the TUI all import it. Add new values there.

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

## Conventions

- Incident file names: `YYYY-MM-DD-slug.json`
- All dates in ISO 8601 UTC
- Interactive components use Web Components (custom elements) with inline `<script>` in `.astro` files
- No React or other UI framework — vanilla JS only
- CSS uses custom properties (e.g. `--color-green`, `--color-border`)
