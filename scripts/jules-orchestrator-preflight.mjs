#!/usr/bin/env node
/**
 * Issue-first Jules preflight / reconciliation.
 *
 * This layer never selects work from ROADMAP.md or TASK_BOARD.md.
 * A GitHub Issue is the execution contract; this script only decides whether
 * dispatch is safe and reconciles transient Jules/session state.
 *
 * Reconciled state:
 * - recorded Jules session
 * - actual Jules session
 * - associated/open/merged/closed PR
 * - recorded branch and actual branch state
 * - any other active Jules session for this repository
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

export const ACTIVE_JULES_STATES = new Set([
  'QUEUED',
  'PLANNING',
  'AWAITING_PLAN_APPROVAL',
  'AWAITING_USER_FEEDBACK',
  'IN_PROGRESS',
  'PAUSED',
]);

function normalizeState(value) {
  return String(value || '').toUpperCase();
}

function extractPrNumber(url) {
  const match = String(url || '').match(/\/pull\/(\d+)/);
  return match ? Number(match[1]) : null;
}

function findSessionPr(session) {
  const output = (session?.outputs || []).find(entry => entry?.pullRequest?.url);
  return output?.pullRequest || null;
}

export function isSessionActive(session) {
  return ACTIVE_JULES_STATES.has(normalizeState(session?.state));
}

export function isOpenPr(pr) {
  return Boolean(pr && pr.state === 'open' && !pr.merged);
}

export function isTerminalPr(pr) {
  return Boolean(pr && (pr.state === 'closed' || pr.merged));
}

export function describeSessionBlocker(session) {
  const pr = findSessionPr(session);
  const prNumber = extractPrNumber(pr?.url);
  const state = normalizeState(session?.state);
  return {
    name: session?.name || 'unknown',
    state,
    pullRequest: prNumber ? `#${prNumber}` : null,
    reason: prNumber
      ? `Active Jules session ${session?.name || 'unknown'} is ${state} and has unresolved PR #${prNumber}.`
      : `Active Jules session ${session?.name || 'unknown'} is ${state} and has no associated PR output.`,
  };
}

export async function reconcileRepositoryActiveSessions(
  sessions,
  recordedSessionName,
  fetchPullRequest,
) {
  const blockingSessions = [];

  for (const session of sessions || []) {
    if (!isSessionActive(session) || session?.name === recordedSessionName) {
      continue;
    }

    const sessionPr = findSessionPr(session);
    const prNumber = extractPrNumber(sessionPr?.url);

    if (prNumber) {
      const pullRequest = await fetchPullRequest(prNumber);

      // A Jules session can remain active in the Jules API after its PR has
      // already been merged. The merged PR is the durable completion signal,
      // so that historical session must not block the next Issue dispatch.
      if (pullRequest?.merged) {
        continue;
      }
    }

    // Open PRs, closed-but-unmerged PRs, and sessions without a PR remain
    // blocking because their work may still be in progress or unresolved.
    blockingSessions.push(session);
  }

  return blockingSessions;
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
    const blockers = repositoryActiveSessions.map(describeSessionBlocker);
    return {
      dispatch: false,
      clearState: false,
      action: 'WAIT_REPOSITORY_SESSION',
      reason: [
        `Found ${repositoryActiveSessions.length} other active Jules session(s) for this repository.`,
        ...blockers.map(item => `- ${item.reason}`),
      ].join('\n'),
      blockers,
    };
  }

  if (recordedSession?.name && !actualSession) {
    if (isOpenPr(recordedPr)) {
      return {
        dispatch: false,
        clearState: false,
        action: 'WAIT_OPEN_PR',
        reason: `Recorded session is missing, but PR #${recordedPr.number} is still open.`,
      };
    }

    return {
      dispatch: true,
      clearState: true,
      action: 'CLEAR_MISSING_SESSION_AND_DISPATCH',
      reason: recordedPr
        ? `Recorded session is missing and PR #${recordedPr.number} is terminal or unavailable.`
        : 'Recorded Jules session is missing; treating the persisted session record as stale.',
    };
  }

  if (isSessionActive(actualSession)) {
    return {
      dispatch: false,
      clearState: false,
      action: 'WAIT_ACTIVE_SESSION',
      reason: `Jules session ${actualSession.name || 'unknown'} is ${normalizeState(actualSession.state)}.`,
    };
  }

  if (isOpenPr(recordedPr)) {
    return {
      dispatch: false,
      clearState: false,
      action: 'WAIT_OPEN_PR',
      reason: `Associated PR #${recordedPr.number} is open and awaiting human review.`,
    };
  }

  if (recordedSession?.name && (!actualSession || !isSessionActive(actualSession))) {
    return {
      dispatch: true,
      clearState: true,
      action: 'CLEAR_TERMINAL_STATE_AND_DISPATCH',
      reason: recordedPr
        ? `Recorded session is terminal; PR #${recordedPr.number} is not open.`
        : 'Recorded session is terminal and has no open associated PR.',
      branch: recordedBranch
        ? { name: recordedBranch, observed: true }
        : null,
    };
  }

  return {
    dispatch: true,
    clearState: false,
    action: 'DISPATCH_SAFE',
    reason: 'No active recorded session, open associated PR, or other active repository session was found.',
    branch: recordedBranch
      ? { name: recordedBranch, observed: true }
      : null,
  };
}

const JULES_API_KEY = process.env.JULES_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
const JULES_SOURCE = process.env.JULES_SOURCE;
const STATE_PATH = '.github/jules-queue-state.json';

async function julesFetch(path) {
  const response = await fetch(`https://jules.googleapis.com/v1alpha/${path}`, {
    headers: {
      'X-Goog-Api-Key': JULES_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Jules API ${path} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

async function githubFetch(path) {
  const response = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`GitHub API ${path} failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;

  const safeValue = String(value).replace(/%/g, '%25').replace(/\n/g, '%0A').replace(/\r/g, '%0D');
  writeFileSync(output, `${name}=${safeValue}\n`, { flag: 'a' });
}

function loadState() {
  if (!existsSync(STATE_PATH)) return { activeSession: null };

  const parsed = JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  return {
    activeSession: parsed?.activeSession ?? null,
  };
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

function persistClearedState() {
  saveState({ activeSession: null });

  execSync(`git add ${STATE_PATH}`);
  try {
    execSync('git config user.name "jules-orchestrator[bot]"');
    execSync('git config user.email "jules-orchestrator@users.noreply.github.com"');
    execSync('git commit -m "chore(workflow): reconcile Jules session state"');
    execSync('git push');
  } catch (error) {
    console.log(`State already clean or push raced: ${error.message}`);
  }
}

function isSameRepository(session) {
  return (
    session?.sourceContext?.source === JULES_SOURCE
    || session?.source?.name === JULES_SOURCE
    || session?.source === JULES_SOURCE
  );
}

async function main() {
  for (const [name, value] of Object.entries({
    JULES_API_KEY,
    GITHUB_TOKEN,
    REPO,
    JULES_SOURCE,
  })) {
    if (!value) throw new Error(`${name} is not set`);
  }

  const state = loadState();
  const recorded = state.activeSession;

  let actualRecordedSession = null;
  let associatedPr = null;
  let recordedBranch = recorded?.branchName || null;

  if (recorded?.name) {
    console.log(`Reconciling recorded Jules session ${recorded.name} ...`);
    actualRecordedSession = await julesFetch(recorded.name);

    if (actualRecordedSession) {
      const sessionPr = findSessionPr(actualRecordedSession);
      const prNumber = recorded.prNumber || extractPrNumber(sessionPr?.url);

      if (prNumber) {
        associatedPr = await githubFetch(`pulls/${prNumber}`);
      }

      if (!recordedBranch && sessionPr?.url) {
        recordedBranch = recorded.branchName || null;
      }
    }
  }

  if (recordedBranch) {
    const branch = await githubFetch(`branches/${encodeURIComponent(recordedBranch)}`);
    console.log(
      branch
        ? `Recorded branch ${recordedBranch} exists.`
        : `Recorded branch ${recordedBranch} no longer exists; treating branch state as stale metadata.`,
    );
  }

  const sessionsResponse = await julesFetch('sessions?pageSize=100');
  const repositorySessions = (sessionsResponse?.sessions || []).filter(session =>
    isSameRepository(session)
    && session?.name !== recorded?.name,
  );
  const repositoryActiveSessions = await reconcileRepositoryActiveSessions(
    repositorySessions,
    recorded?.name,
    prNumber => githubFetch(`pulls/${prNumber}`),
  );

  const decision = evaluatePreflight({
    recordedSession: recorded,
    actualRecordedSession,
    recordedPr: associatedPr,
    recordedBranch,
    repositoryActiveSessions,
  });

  console.log(`Preflight: ${decision.action}`);
  console.log(decision.reason);

  if (decision.blockers?.length) {
    console.log('Preflight blockers:');
    for (const blocker of decision.blockers) {
      console.log(JSON.stringify(blocker));
    }
  }

  setOutput('dispatch', decision.dispatch);
  setOutput('clear_state', decision.clearState);
  setOutput('decision', decision.action);
  setOutput('blocking_sessions', JSON.stringify(decision.blockers || []));

  if (decision.clearState) {
    persistClearedState();
  }
}

const isDirectExecution = process.argv[1]
  && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (isDirectExecution) {
  main().catch(error => {
    console.error(error);
    setOutput('dispatch', false);
    setOutput('clear_state', false);
    setOutput('decision', 'PREFLIGHT_ERROR');
    process.exit(1);
  });
}
