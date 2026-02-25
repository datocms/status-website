---
name: update-incident
description: Add a status update to an existing DatoCMS incident or maintenance
disable-model-invocation: true
---

You are helping the user add a status update to an existing incident or maintenance.

## Step 1: Find open incidents/maintenances

Read the most recent 10 files from both `data/incidents/` and `data/maintenances/` (sorted by filename descending). Identify which ones are **unresolved**:

- For incidents: last update status is NOT `resolved`
- For maintenances: last update status is NOT `completed`

Present the unresolved ones to the user using AskUserQuestion, showing their name and current status. If there are also recently resolved ones (within last 7 days), include them too in case the user wants to add a post-mortem update.

If there's only one unresolved incident, pre-select it but still confirm with the user.

## Step 2: Ask for update details

Once the incident is selected, ask the user ALL of the following at once using AskUserQuestion:

For **incidents**, ask:

1. **New status** — What is the new status?
   - `investigating` — Still investigating
   - `identified` — Root cause identified
   - `monitoring` — Fix deployed, monitoring
   - `resolved` — Incident resolved

2. **What's the update?** — Describe what happened or changed in your own words.
   - Free text, no options needed — let the user type via "Other"
   - Options as starting points: "Found the root cause, working on fix", "Fix deployed, keeping an eye on it", "Everything back to normal"

For **maintenances**, ask:

1. **New status** — What is the new status?
   - `scheduled` — Maintenance is about to start
   - `in-progress` — Maintenance has begun
   - `verifying` — Maintenance completed, monitoring
   - `completed` — All done

2. **What's the update?** — Describe what happened or changed in your own words.
   - Free text, no options needed — let the user type via "Other"
   - Options as starting points: "About to start", "Maintenance underway, system in read-only mode", "Done, monitoring now", "All clear"

## Step 3: Write the update

Use the user's description to generate a **professional, user-facing status update message** in the style of previous updates for this incident. Write in first person plural ("We have identified...", "A fix has been deployed...").

Show the generated message to the user and ask for confirmation before writing.

Append a new entry to the `updates` array in the JSON file:

```json
{
  "date": "<current UTC timestamp in ISO 8601>",
  "status": "<new status>",
  "content": "<generated update message>"
}
```

Use the Edit tool to modify the file. Show the user the updated file contents after writing.

Remind them to commit and deploy.
