---
name: new-maintenance
description: Schedule a new DatoCMS maintenance window
disable-model-invocation: true
---

You are helping the user schedule a new maintenance window for the DatoCMS status page.

Ask the user ALL of the following questions at once using the AskUserQuestion tool:

1. **What's the maintenance about?** — Describe what you're doing and what impact it will have on users.
   - Free text, no options needed — let the user type via "Other"
   - Options as starting points: "Database upgrade, system will be read-only", "Billing system maintenance, payment operations unavailable", "Infrastructure upgrade, brief downtime expected"

2. **Scheduled time** — When will the maintenance start? (UTC)
   - Free text — let the user type via "Other" (e.g. "2026-03-01 06:00", "tomorrow at 05:00 UTC")
   - Options: "Tomorrow at 05:00 UTC", "Tomorrow at 08:00 UTC", "Next Saturday at 05:00 UTC"

3. **Duration** — How long will it last in minutes?
   - `30` — 30 minutes
   - `60` — 1 hour
   - `120` — 2 hours (Recommended)
   - `240` — 4 hours

4. **Components** — Which components are affected? (multiSelect)
   - `cda` — Content Delivery API
   - `cma` — Content Management API
   - `assets` — Assets CDN (Imgix)
   - `administrativeAreas` — Projects administrative interface
   - `dashboard` — Account dashboard interface
   - `site` — Website
   - `billing` — Billing

After collecting answers, use the user's description to generate:

- A **short maintenance title** (e.g. "Scheduled database maintenance", "Maintenance on our billing system") — concise, user-facing
- A **detailed maintenance description** — a professional, user-facing notice written in the style of previous maintenances. Include the scheduled time, expected duration, and clearly list what operations will be unavailable. Write in first person plural ("We are going to perform...").

Then:

- Parse the scheduled time into a proper ISO 8601 UTC timestamp. If the user gave a relative time like "tomorrow at 05:00 UTC", compute the absolute date.
- **Filename**: `data/maintenances/YYYY-MM-DD-slug.json` where YYYY-MM-DD is the date of the scheduled maintenance and slug is derived from the generated title
- **Content**:
```json
{
  "scheduledTime": "<ISO 8601 UTC timestamp>",
  "name": "<generated title>",
  "minutes": "<duration as string>",
  "content": "<generated description>",
  "components": [<selected components>],
  "updates": []
}
```

Show the user the generated title, description, and file path **before writing**. Ask for confirmation. Then write the file and remind them to commit and deploy.
