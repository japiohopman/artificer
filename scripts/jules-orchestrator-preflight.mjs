}

export function isTerminalPr(pr) {
  return Boolean(pr && (pr.state === 'closed' || pr.merged));
}

export function evaluatePreflight({
  recordedSession,
  actualRecordedSession,
  recordedPr,
  recordedBranch,
  repositoryActiveSessions = [],
}) {
  const actualSession = actualRecordedSession ?? null;

  if (repositoryActiveSessions.length > 0) {
    return {
      dispatch: false,
      clearState: false,
      action: 'WAIT_REPOSITORY_SESSION',
      reason: `Found ${repositoryActiveSessions.length} other active Jules session(s) for this repository.`,