---
name: resolve-incident
description: Quickly resolve an open DatoCMS incident or complete a maintenance
disable-model-invocation: true
---

You are helping the user quickly resolve an incident or complete a maintenance.

## Step 1: Find open incidents/maintenances

Read the most recent 10 files from both `data/incidents/` and `data/maintenances/` (sorted by filename descending). Identify which ones are **unresolved**:

- For incidents: last update status is NOT `resolved`
- For maintenances: last update status is NOT `completed`

If there are no unresolved items, tell the user "No open incidents or maintenances found." and stop.

If there's exactly one, pre-select it but still confirm.

Present the unresolved ones to the user using AskUserQuestion, showing their name and current status.

## Step 2: Ask for resolution message

Ask the user using AskUserQuestion:

1. **Resolution message** — What should the resolution say?
   - For incidents: "The issue has been resolved." (Recommended), "The issue has been fully resolved. All services are operating normally.", "All systems are nominal"
   - For maintenances: "All systems are nominal" (Recommended), "Maintenance completed successfully.", "All operations have returned to normal."

## Step 3: Write the resolution

Append a new entry to the `updates` array:

- For incidents:
```json
{
  "date": "<current UTC timestamp in ISO 8601>",
  "status": "resolved",
  "content": "<resolution message>"
}
```

- For maintenances:
```json
{
  "date": "<current UTC timestamp in ISO 8601>",
  "status": "completed",
  "content": "<resolution message>"
}
```

Use the Edit tool to modify the file. Show the user the updated file contents.

Remind them to commit and deploy.
