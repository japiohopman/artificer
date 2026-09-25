import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePreflight,
  isOpenPr,
  reconcileRepositoryActiveSessions,
  isSessionActive,
  isTerminalPr,
  describeSessionBlocker,
} from './jules-orchestrator-preflight.mjs';

test('active repository session with a merged PR does not block dispatch', async () => {
  const blockingSessions = await reconcileRepositoryActiveSessions(
    [{
      name: 'sessions/merged',
      state: 'IN_PROGRESS',
      outputs: [{
        pullRequest: {
          url: 'https://github.com/japiohopman/artificer/pull/259',
        },
      }],
    }],
    null,
    async number => ({
      number,
      state: 'closed',
      merged: true,
    }),
  );

  assert.equal(blockingSessions.length, 0);
});

test('active repository session with an open PR still blocks dispatch', async () => {
  const blockingSessions = await reconcileRepositoryActiveSessions(
    [{
      name: 'sessions/open-pr',
      state: 'IN_PROGRESS',
      outputs: [{
        pullRequest: {
          url: 'https://github.com/japiohopman/artificer/pull/313',
        },
      }],
    }],
    null,
    async number => ({
      number,
      state: 'open',
      merged: false,
    }),
  );

  assert.equal(blockingSessions.length, 1);
  assert.equal(blockingSessions[0].name, 'sessions/open-pr');
});

test('active repository session without a PR still blocks dispatch', async () => {
  const blockingSessions = await reconcileRepositoryActiveSessions(
    [{
      name: 'sessions/no-pr',
      state: 'PAUSED',
    }],
    null,
    async () => {
      throw new Error('A session without a PR should not query GitHub pulls.');
    },
  );

  assert.equal(blockingSessions.length, 1);
  assert.equal(blockingSessions[0].name, 'sessions/no-pr');
});

test('active recorded Jules session blocks dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/1' },
    actualRecordedSession: { name: 'sessions/1', state: 'IN_PROGRESS' },
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.clearState, false);
  assert.equal(result.action, 'WAIT_ACTIVE_SESSION');
});

test('paused recorded Jules session blocks dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/1' },
    actualRecordedSession: { name: 'sessions/1', state: 'PAUSED' },
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.clearState, false);
  assert.equal(result.action, 'WAIT_ACTIVE_SESSION');
});

test('recorded session missing but open PR blocks dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/missing' },
    actualRecordedSession: null,
    recordedPr: { number: 42, state: 'open', merged: false },
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.action, 'WAIT_OPEN_PR');
});

test('missing recorded Jules session does not block dispatch when no PR is open', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/missing' },
    actualRecordedSession: null,
  });

  assert.equal(result.dispatch, true);
  assert.equal(result.clearState, true);
  assert.equal(result.action, 'CLEAR_MISSING_SESSION_AND_DISPATCH');
});

test('missing recorded session still waits when another repository session is active', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/missing' },
    actualRecordedSession: null,
    repositoryActiveSessions: [
      { name: 'sessions/other', state: 'IN_PROGRESS' },
    ],
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.clearState, false);
  assert.equal(result.action, 'WAIT_REPOSITORY_SESSION');
});

test('terminal session with no open PR clears stale state and allows dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: {
      name: 'sessions/terminal',
      branchName: 'feat/issue-123-test',
    },
    actualRecordedSession: { name: 'sessions/terminal', state: 'COMPLETED' },
    recordedPr: { number: 43, state: 'closed', merged: false },
    recordedBranch: 'feat/issue-123-test',
  });

  assert.equal(result.dispatch, true);
  assert.equal(result.clearState, true);
  assert.equal(result.action, 'CLEAR_TERMINAL_STATE_AND_DISPATCH');
});

test('other active repository session blocks duplicate dispatch with actionable details', () => {
  const result = evaluatePreflight({
    recordedSession: null,
    actualRecordedSession: null,
    repositoryActiveSessions: [
      {
        name: 'sessions/other',
        state: 'IN_PROGRESS',
        outputs: [{
          pullRequest: {
            url: 'https://github.com/japiohopman/artificer/pull/321',
          },
        }],
      },
    ],
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.action, 'WAIT_REPOSITORY_SESSION');
  assert.match(result.reason, /sessions\/other/);
  assert.match(result.reason, /PR #321/);
  assert.equal(result.blockers.length, 1);
  assert.deepEqual(result.blockers[0], {
    name: 'sessions/other',
    state: 'IN_PROGRESS',
    pullRequest: '#321',
    reason: 'Active Jules session sessions/other is IN_PROGRESS and has unresolved PR #321.',
  });
});

test('session blocker without PR identifies the missing PR output', () => {
  const blocker = describeSessionBlocker({
    name: 'sessions/no-pr',
    state: 'PAUSED',
  });

  assert.equal(blocker.name, 'sessions/no-pr');
  assert.equal(blocker.state, 'PAUSED');
  assert.equal(blocker.pullRequest, null);
  assert.match(blocker.reason, /no associated PR output/);
});

test('repository with no active sessions is safe to dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: null,
    actualRecordedSession: null,
    repositoryActiveSessions: [],
  });

  assert.equal(result.dispatch, true);
  assert.equal(result.action, 'DISPATCH_SAFE');
});

test('session and PR predicates remain explicit', () => {
  assert.equal(isSessionActive({ state: 'QUEUED' }), true);
  assert.equal(isSessionActive({ state: 'PAUSED' }), true);
  assert.equal(isSessionActive({ state: 'COMPLETED' }), false);
  assert.equal(isOpenPr({ state: 'open', merged: false }), true);
  assert.equal(isOpenPr({ state: 'closed', merged: false }), false);
  assert.equal(isTerminalPr({ state: 'closed', merged: false }), true);
  assert.equal(isTerminalPr({ state: 'open', merged: true }), true);
});
