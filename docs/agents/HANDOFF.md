# 🔄 Agent Handoff Standard

Use this format at the end of every substantial agent task.

## Agent Handoff

**Agent:**

**Task:**

**Status:** `COMPLETE` / `PARTIAL` / `BLOCKED`

### Completed
- 

### Files changed
- 

### Verification performed
- Build/type check:
- Tests:
- Runtime/manual verification:
- Console/runtime errors checked:

### Verification not performed
- 

### Known issues
- 

### Documentation updated
- 

### Architectural decisions
- 

### Scope notes
- Files/domains outside the assigned scope that were touched:
- Why they were necessary:

### Recommended next step
- 

### Avoid touching immediately
- 

## Rules

1. Never claim runtime verification that did not happen.
2. Distinguish implemented, verified and planned work.
3. Keep the handoff factual and concise.
4. If blocked, explain the decision or dependency required.
5. Remove any temporary active claim from `docs/AGENT_STATE.md` when the task ends.
