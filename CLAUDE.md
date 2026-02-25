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

## Conventions

- Incident file names: `YYYY-MM-DD-slug.json`
- All dates in ISO 8601 UTC
- Interactive components use Web Components (custom elements) with inline `<script>` in `.astro` files
- No React or other UI framework — vanilla JS only
- CSS uses custom properties (e.g. `--color-green`, `--color-border`)
