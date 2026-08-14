# Jules Queue Orchestrator — Setup

Automatically starts the next task from `ROADMAP.md`'s "## Now" list once you've merged the
previous one's PR. Runs as a GitHub Actions "heartbeat" every 15 minutes — no server needed.

## Files
- `.github/workflows/jules-orchestrator.yml` — the scheduled workflow
- `scripts/jules-orchestrator.mjs` — the actual logic
- `.github/jules-queue-state.json` — tracks which session is currently active (committed by the bot itself; start it as `{ "activeSession": null }`)

## One-time manual setup (I can't do these steps for you)

1. **Install the Jules GitHub app** on the `artificer` repo, if you haven't already —
   via the Jules web app (jules.google.com), Settings → connect your GitHub account/repo.

2. **Create a Jules API key** — jules.google.com/settings#api → "Create new key".
   You can have up to 3 keys at a time.

3. **Add it as a repo secret** — GitHub repo → Settings → Secrets and variables → Actions →
   "New repository secret" → name it `JULES_API_KEY`, paste the key.
   (Same rule as before: never paste this key into a chat — only into GitHub's secret field.)

4. **Confirm your Jules source name.** Run this once (replace the key), to see the exact
   source identifier Jules uses for your repo:
   ```sh
   curl 'https://jules.googleapis.com/v1alpha/sources' -H 'X-Goog-Api-Key: YOUR_KEY'
   ```
   It should look like `sources/github/japiohopman/artificer` — that's already what's set in
   the workflow file's `JULES_SOURCE` env var. If yours differs, update that one line.

5. **Commit the three files** (`jules-orchestrator.yml` into `.github/workflows/`,
   `jules-orchestrator.mjs` into `scripts/`, `jules-queue-state.json` into `.github/`).

6. **First run**: trigger it manually once to make sure it works — Actions tab →
   "Jules Queue Orchestrator" → "Run workflow". Check the log: it should either dispatch the
   first unchecked "Now" task, or tell you the queue is empty.

## How the review gate works
The orchestrator only advances once a session's PR is **merged** — that's your checkpoint. It
never touches ROADMAP.md's checkboxes; checking a task off is still something you (or CI) do
deliberately, once you've verified it actually works — matching AGENT_RULES.md §1. If you'd
rather it move on the moment a PR is *opened* (no merge wait), that's a one-line change in the
script (skip the `pr.merged` check) — just know that trades away the review gate.

## Adjusting the cadence
`cron: '*/15 * * * *'` = every 15 minutes. GitHub Actions cron has a practical minimum around
5 minutes and can lag under load — 15 is a reasonable default that won't spam the API.
