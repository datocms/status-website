# DatoCMS Status Website

Public status page for DatoCMS services. Built with React Static, deployed on Netlify.

## Tech Stack

- **Framework**: React Static (v7) with React 16, SASS
- **Hosting**: Netlify (static site + serverless functions)
- **Data**: JSON files in `data/incidents/` and `data/maintenances/`
- **Metrics**: AWS CloudWatch (response time, success rate) + StatusCake (uptime monitoring)
- **Caching**: Redis (StatusCake responses, 60s TTL)
- **Node version**: 14 (see `.nvmrc`)

## Project Structure

- `src/` — React frontend (components, containers/pages, models, utils)
- `functions/` — Netlify serverless functions (CloudWatch metrics, component status, RSS feeds)
- `data/incidents/` — Incident JSON files (one per incident)
- `data/maintenances/` — Scheduled maintenance JSON files
- `static.config.js` — Route generation and data loading at build time
- `readData.js` — Reads all incident/maintenance JSON from `data/`
- `node.api.js` — Post-export hook (generates RSS feeds)

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
- `Incident.isMaintenance` is determined by presence of `scheduledTime` field
- `Incident.date` returns `scheduledStart` for maintenances, `firstUpdate.date` for incidents
- `IncidentsRepo.all` returns incidents sorted by date descending (newest first)
- `Incident.isUnresolved`: for incidents checks `status !== 'resolved'`; for maintenances checks `status !== 'completed' && status !== 'scheduled'`

## Monitored Components

Defined in `functions/component-status/component-status.js`: `cda`, `cma`, `assets`, `administrativeAreas`, `dashboard`, `site`. Component labels mapped via `src/i18n.js`.

## Serverless Functions

| Function | Endpoint | Purpose |
|----------|----------|---------|
| `cloudwatch` | `/.netlify/functions/cloudwatch?graph=...&time=...` | CDA response time and API success rate from AWS CloudWatch |
| `component-status` | `/.netlify/functions/component-status?days=...` | Uptime/downtime per component from StatusCake API (Redis-cached) |
| `component-status-pingdom` | legacy | Old Pingdom-based version (deprecated) |
| `feeds` | `/.netlify/functions/feeds` | RSS/Atom/JSON feeds of incidents |

## Content Management

Netlify CMS v2 at `public/admin/` (accessible at `/admin` on the deployed site). Uses git-gateway backend with Netlify Identity for auth. Provides a UI to create/edit incidents and maintenances, which commits JSON files directly to the repo.

## Development

```bash
yarn install
yarn start        # netlify dev (proxies functions + React Static dev server)
yarn build        # production build
```

## Conventions

- Prettier for formatting (`yarn prettier`)
- ESLint with react-tools config
- Incident file names: `YYYY-MM-DD-slug.json`
- All dates in ISO 8601 UTC
