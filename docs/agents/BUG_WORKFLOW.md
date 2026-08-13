# 🐛 Bug Workflow

Use this workflow for defects, regressions and runtime errors.

## 1. Reproduce first

Before changing code:

- Identify the exact symptom.
- Reproduce it when possible.
- Record the affected screen/flow.
- Capture the relevant console/build error.
- Determine whether the problem is deterministic.

Do not fix an unverified description when the behavior can be reproduced directly.

## 2. Trace the cause

Inspect the actual implementation path:

`input → state/data → service/domain → UI/runtime`

Determine the root cause rather than patching only the visible symptom.

## 3. Scope the fix

Prefer the smallest root-cause fix.

Do not combine unrelated refactors.

If the bug crosses another agent's domain, declare it before editing.

## 4. Verify the fix

Re-run the original reproduction.

Then check relevant regression paths.

At minimum, verify:

- original failure no longer occurs
- expected behavior now occurs
- no new build/type errors
- relevant runtime/console errors are absent

## 5. Record the incident

If the project error-reporting workflow applies, update `docs/ERROR_REPORTS.md` or the repository's designated error record with a concise explanation:

- what broke
- why
- what fixed it

Do not leave a raw stack trace as the only explanation.

## 6. Finish

Update task/changelog documentation when appropriate and use `docs/agents/HANDOFF.md`.
