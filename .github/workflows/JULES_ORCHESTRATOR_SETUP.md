# Jules Queue Orchestrator — Setup (v2)

## What changed from the first version
1. **Root cause of the "files aren't where the docs say" confusion**: the first version's
   four files were committed to the repo **root** instead of `.github/workflows/`, `scripts/`,
   and `.github/`. GitHub Actions only reads workflows from `.github/workflows/`, so the
   orchestrator was never actually running. This version's file tree (below) has the correct
   paths — double-check them after committing.
2. **Two gates before advancing, not one**: the orchestrator now waits for the PR to be
   **merged** *and* for the task's line under `### Active` in `ROADMAP.md` to be manually
   checked to `- [x]`. A merge alone no longer counts as "done" — matching AGENT_RULES.md §1.
3. **Ready / Blocked / Human Review structure**: `ROADMAP.md`'s `## Now` section is now split
   into subsections. The orchestrator only ever dispatches from `### Ready`. Anything you file
   under `### Blocked` or `### Human Review` is never touched automatically.
4. **Schedule starts disabled.** The workflow ships with the cron trigger commented out —
   manual (`workflow_dispatch`) only, until you've watched one full cycle succeed.

## File tree (commit each file to this exact path)
```
.github/workflows/jules-orchestrator.yml
.github/jules-queue-state.json
scripts/jules-orchestrator.mjs
JULES_ORCHESTRATOR_SETUP.md          (wherever you keep setup docs — this file)
```
Also merge in `ROADMAP_Now_section_v2.md`'s content — replace your current `## Now` section
in `ROADMAP.md` with it (review and re-sort the Ready/Blocked/Human Review placement first;
it's a draft based on the last deep-dive, not a final call).

## One-time manual setup
1. Install the Jules GitHub app on this repo (jules.google.com), if not done already.
2. Create an API key: jules.google.com/settings#api → "Create new key".
3. Add it as a repo secret: Settings → Secrets and variables → Actions → New repository
   secret → name `JULES_API_KEY`. Never paste the key anywhere but this field.
4. Confirm your Jules source name:
   ```sh
   curl 'https://jules.googleapis.com/v1alpha/sources' -H 'X-Goog-Api-Key: YOUR_KEY'
   ```
   Update `JULES_SOURCE` in the workflow file if it differs from `sources/github/japiohopman/artificer`.

## Running the controlled test cycle
1. Commit all files to the correct paths above, including the restructured `## Now` section.
2. Actions tab → "Jules Queue Orchestrator" → "Run workflow" (manual trigger).
3. It should pick the first `### Ready` task, move it to `### Active` in `ROADMAP.md`, and
   start a Jules session. Check the Actions log to confirm.
4. Wait for Jules to open a PR. Review it as you normally would.
5. Merge it.
6. **Manually check the box** for that task under `### Active` in `ROADMAP.md` — this is the
   deliberate human confirmation step, separate from the merge itself.
7. Run the workflow manually again (or wait — see step 8). It should detect both the merge
   and the checked box, remove the task from `### Active`, and dispatch the next `### Ready`
   item.
8. Only once step 7 has worked correctly: uncomment the `schedule:` block in
   `.github/workflows/jules-orchestrator.yml` to turn on the 15-minute heartbeat.

## What the orchestrator will never do
- Touch anything under `### Blocked` or `### Human Review`.
- Mark a task's checkbox `[x]` itself — only remove the line once you've checked it.
- Advance the queue on a merge alone, without your explicit checkbox confirmation.
