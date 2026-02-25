# DatoCMS Status Website

Public status page for DatoCMS services at [status.datocms.com](https://status.datocms.com).

Built with [Astro](https://astro.build), deployed on [Netlify](https://www.netlify.com).

## Tech Stack

- **Astro** with TypeScript — static pages, server endpoints, content collections
- **Web Components** — interactive UI with zero framework overhead
- **Chartist** — system metrics charts
- **CSS custom properties** — no preprocessor
- **Netlify** — hosting + serverless functions via `@astrojs/netlify`
- **AWS CloudWatch** — response time and success rate metrics
- **StatusCake** — uptime monitoring per component

## Development

```bash
npm install
npm run dev       # Local dev server at localhost:4321
npm run build     # Production build to ./dist/
npm run preview   # Preview build locally
```

### Environment Variables

Copy `.env.example` or fetch from Netlify:

```bash
npx netlify link     # Link to the datocms-status project
npx netlify env:list # View current values
```

| Variable                           | Description                       |
| ---------------------------------- | --------------------------------- |
| `CLOUDWATCH_AWS_ACCESS_KEY_ID`     | AWS access key for CloudWatch     |
| `CLOUDWATCH_AWS_SECRET_ACCESS_KEY` | AWS secret key for CloudWatch     |
| `CLOUDWATCH_AWS_REGION`            | AWS region (default: `us-east-1`) |
| `STATUSCAKE_API_TOKEN`             | StatusCake API token              |

## Project Structure

```
├── src/
│   ├── content.config.ts        # Content collections (incidents + maintenances)
│   ├── lib/                     # Business logic (models, i18n, markdown)
│   ├── styles/global.css        # All styles
│   ├── layouts/BaseLayout.astro
│   ├── components/              # Astro components with inline web components
│   └── pages/
│       ├── api/                 # Server endpoints (cloudwatch, component-status, feeds)
│       ├── history/             # Paginated incident history
│       ├── incidents/           # Individual incident pages
│       ├── history.{rss,atom,json}.ts  # Feeds
│       ├── index.astro          # Homepage
│       └── 404.astro
├── data/
│   ├── incidents/               # One JSON file per incident
│   └── maintenances/            # One JSON file per maintenance
├── public/                      # Static assets (SVGs, logo)
├── astro.config.mjs             # Astro config + env schema
└── netlify.toml                 # Netlify build config
```

## Incident Management

Incidents and maintenances are stored as JSON files in `data/`. You can manage them using the Claude Code slash commands below, or edit the JSON files directly.

### Data Format

**Incidents** (`data/incidents/YYYY-MM-DD-slug.json`):

```json
{
  "name": "Increase in error rate and response time",
  "impact": "major",
  "components": ["cda", "cma"],
  "updates": [
    {
      "date": "2026-02-23T14:50:31.912Z",
      "content": "A node in our production cluster became unresponsive...",
      "status": "resolved"
    }
  ]
}
```

**Maintenances** (`data/maintenances/YYYY-MM-DD-slug.json`):

```json
{
  "scheduledTime": "2025-10-14T05:00:29.209Z",
  "name": "Maintenance on our billing system",
  "minutes": "120",
  "content": "Description of what will be unavailable...",
  "components": ["billing"],
  "updates": []
}
```

### Claude Code Commands

These slash commands guide you through incident management with an interactive UI. You describe the situation in plain language and they generate professional, user-facing copy.

| Command             | Description                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `/new-incident`     | Create a new incident. Describe what's happening, pick impact and components. Generates a title and status update. |
| `/new-maintenance`  | Schedule a maintenance window. Describe the work, pick time/duration and components. Generates a title and notice. |
| `/update-incident`  | Add a status update to an open incident or maintenance. Pick the item, new status, and describe what changed.      |
| `/resolve-incident` | Quickly close an open incident or maintenance with a resolution message.                                           |

**Typical workflow:**

```
/new-incident          # Something breaks — create the incident
/update-incident       # Root cause found — post an update
/resolve-incident      # All fixed — close it out
```

All commands show generated content for confirmation before writing, and remind you to commit and deploy.

## GitHub Pages Fallback (if Netlify goes down)

A static version of the site is automatically deployed to GitHub Pages on every `git push` via a Husky pre-push hook. 

Under normal operation, the GitHub Pages version lives at [status2.datocms.com](https://status2.datocms.com).

It lacks Components Status, System Metrics, and Third-Party Components (those require server endpoints), but incidents and history work fine.


**To activate the fallback:**

1. Update `GITHUB_PAGES_CNAME` from `status2.datocms.com` to `status.datocms.com`
2. Commit and push — this triggers a rebuild and deploys to the `gh-pages` branch with the updated CNAME
3. Go to [Cloudflare DNS for datocms.com](https://dash.cloudflare.com/6c36efb897e5eae1d2a887cfa632eea9/datocms.com/dns/records) and change the `status` CNAME record target from `datocms-status.netlify.com` to `datocms.github.io`

**To revert back to Netlify:**

1. Revert `GITHUB_PAGES_CNAME` back to `status2.datocms.com`, commit and push
2. Change the `status` CNAME record back to `datocms-status.netlify.com`

### Components

| ID                    | Label                             |
| --------------------- | --------------------------------- |
| `cda`                 | Content Delivery API              |
| `cma`                 | Content Management API            |
| `assets`              | Assets CDN (Imgix)                |
| `administrativeAreas` | Projects administrative interface |
| `dashboard`           | Account dashboard interface       |
| `site`                | Website                           |
| `billing`             | Billing                           |
