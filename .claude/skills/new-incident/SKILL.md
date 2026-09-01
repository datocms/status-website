---
name: new-incident
description: Create a new DatoCMS incident report
disable-model-invocation: true
---

You are helping the user create a new incident for the DatoCMS status page.

Ask the user ALL of the following questions at once using the AskUserQuestion tool. Prefer running `npm run tui` in a terminal instead when the user can; this skill is the chat alternative.

1. **What's happening?** — Describe the issue in your own words.
   - Free text, no options needed — let the user type via "Other"
   - Options to offer as starting points: "API returning elevated error rates", "Users unable to upload assets", "Dashboard is slow or unresponsive"

2. **Impact** — What is the impact level?
   - `minor` — Partial degradation, workaround available
   - `major` — Significant service disruption (Recommended)
   - `critical` — Full outage
   - `none` — No user-facing impact

3. **API and asset components** — Which of these are affected? (multiSelect; AskUserQuestion allows at most 4 options per question, so components are split in two)
   - `cda` — Content Delivery API
   - `cma` — Content Management API
   - `assets` — Assets CDN (Imgix)

4. **Interface components** — Which of these are affected? (multiSelect)
   - `administrativeAreas` — Projects administrative interface
   - `dashboard` — Account dashboard interface
   - `site` — Website
   - `billing` — Billing

After collecting answers, use the user's description to generate:

- A **short incident title** (e.g. "Increase in error rate and response time", "Issues uploading new assets") — concise, user-facing, no technical jargon
- A **detailed first update message** — a professional, user-facing status update written in the style of previous incidents. Expand on the user's description, explain what users may experience, and state that the team is investigating. Write in first person plural ("We are investigating...").

Then generate the file:

- **Filename**: `data/incidents/YYYY-MM-DD-slug.json` where YYYY-MM-DD is today's date and slug is derived from the generated title (lowercase, spaces to hyphens, no special characters)
- **Content**:
```json
{
  "name": "<generated title>",
  "impact": "<impact>",
  "components": [<selected components>],
  "updates": [
    {
      "date": "<current UTC timestamp in ISO 8601>",
      "content": "<generated update message>",
      "status": "investigating"
    }
  ]
}
```

Show the user the generated title, message, and file path **before writing**. Ask for confirmation. Then write the file and remind them to commit and deploy.
