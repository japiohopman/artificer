import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePreflight,
  isOpenPr,
  isSessionActive,
  isTerminalPr,
} from './jules-orchestrator-preflight.mjs';

test('active recorded Jules session blocks dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: { name: 'sessions/1' },
    actualRecordedSession: { name: 'sessions/1', state: 'IN_PROGRESS' },
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

test('other active repository session blocks duplicate dispatch', () => {
  const result = evaluatePreflight({
    recordedSession: null,
    actualRecordedSession: null,
    repositoryActiveSessions: [
      { name: 'sessions/other', state: 'IN_PROGRESS' },
    ],
  });

  assert.equal(result.dispatch, false);
  assert.equal(result.action, 'WAIT_REPOSITORY_SESSION');
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
  assert.equal(isSessionActive({ state: 'COMPLETED' }), false);
  assert.equal(isOpenPr({ state: 'open', merged: false }), true);
  assert.equal(isOpenPr({ state: 'closed', merged: false }), false);
  assert.equal(isTerminalPr({ state: 'closed', merged: false }), true);
  assert.equal(isTerminalPr({ state: 'open', merged: true }), true);
});
