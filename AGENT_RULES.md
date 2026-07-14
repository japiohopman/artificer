# 🛑 Agent Ground Rules

> Read this alongside [AGENT.MD](./AGENT.MD) and [GOALS.md](./GOALS.md). GOALS.md is the destination.
> This document is about *how* we're allowed to drive there.

These rules exist because they were violated in practice: an unresolved parse error sat in
`errors.md` while TASK_BOARD.md still listed "fix errors" as an unchecked Critical item, and a
vendored third-party codebase (`dnd5e-6.0.x`, plus a duplicated `tactical-grid-main` folder) was
committed straight into git instead of being kept as reference material outside version control.
Both are symptoms of the same root cause: no verification step between "I made a change" and
"this is marked done." These rules close that gap.

## 1. Don't mark it `[x]` until you've watched it work
A checkbox on TASK_BOARD.md is a claim that you personally ran the app and observed the
behavior — not that you wrote code you believe should produce it.
- Run `npm run dev` and load the affected screen before checking a box.
- If you can't run it (no browser access, etc.), leave it unchecked and say so explicitly in
  your summary. An honest unchecked box is more useful than a false checked one.
- If you inherit a `[x]` item and find it doesn't actually work, uncheck it and note why.

## 2. No new system before Critical/High is clear
Don't start work from GOALS.md sections that aren't part of the *current* milestone (ask if
unsure — the current milestone is tracked in `docs/PROGRESS.md` under "Current Focus") while
TASK_BOARD.md still has open items marked **Critical** or **High**. GOALS.md describes the final
destination, not this week's task list. If you think a GOALS.md item should jump the queue, say
so in your summary instead of just building it.

## 3. Stay in your lane, log when you leave it
Each named agent owns a domain (see AGENT.MD / PROJECT_HUB.md). If a fix requires touching a
file outside your domain:
- Say so explicitly in your summary ("this required editing `Token.tsx`, which is Jimmy's area").
- Don't silently refactor or restructure another agent's module in passing.
- Two agents editing the same file in the same session is the #1 cause of the kind of
  duplicate-branch/syntax bugs we've already hit — avoid it, or flag it loudly if unavoidable.

## 4. Every change updates the docs it affects — accurately
`docs/CHANGELOG.md` and `docs/TASK_BOARD.md` should describe what's actually true after your
change, not what was intended. Aspirational documentation is worse than no documentation,
because it's trusted.

## 5. Repo hygiene — binaries and vendored code
- Never commit reference material (forked/vendored third-party repos, downloaded systems,
  example codebases) into the main tree. If you need to study another project's code, keep it
  outside the repo or in a clearly-named `/reference` folder that's in `.gitignore`.
- No new binary asset over 1MB goes into git without flagging it in your summary first
  (images, audio, PDFs, map tiles). These belong in `public/assets` only if the project's asset
  pipeline expects them there — check `docs/ASSET_REGISTRY.md` first.
- If you find existing bloat while working nearby, flag it — don't silently leave it, but also
  don't do a large unrelated cleanup in the middle of an unrelated task.

## 6. Verify before you build on top
Before extending a system (inventory, combat, world state, etc.), re-read the relevant file(s)
directly — don't rely on what a doc *says* the system does. Docs drift from code; the code is
the source of truth GOALS.md itself insists on (§2, "Data Integrity").

## 7. When you hit an error, it goes in `errors.md` with a resolution — not just a stack trace
If you encounter and fix a build/runtime error, replace the raw log in `errors.md` with a short
note: what broke, why, what fixed it. If you can't fix it, leave the log but add one line
describing what you tried.

---
*These rules are enforced by review, not by tooling — yet. Section 1 of the current Critical
task list should include making at least part of this checkable by an actual test/build script.*
