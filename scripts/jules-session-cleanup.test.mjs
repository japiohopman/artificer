import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DELETE_CONFIRMATION,
  findSessionPullRequest,
  isSessionForRepository,
  parseSessionNames,
  validateCleanupTarget,
  validateConfirmation,
} from './jules-session-cleanup.mjs';

test('cleanup requires the exact confirmation value', () => {
  assert.equal(validateConfirmation(DELETE_CONFIRMATION), true);
  assert.equal(validateConfirmation('DELETE'), false);
  assert.equal(validateConfirmation('delete_stale_sessions'), false);
});

test('session names accept explicit numeric Jules resource names', () => {
  assert.deepEqual(
    parseSessionNames('sessions/111 sessions/222, sessions/111'),
    ['sessions/111', 'sessions/222'],
  );
});

test('session names reject arbitrary strings', () => {
  assert.throws(
    () => parseSessionNames('sessions/111 task/222'),
    /Invalid Jules session name/,
  );
});

test('cleanup target rejects non-paused sessions', () => {
  const result = validateCleanupTarget({
    session: {
      state: 'IN_PROGRESS',
      sourceContext: { source: 'sources/github-japiohopman-artificer' },
    },
    source: 'sources/github-japiohopman-artificer',
    pullRequest: null,
  });

  assert.equal(result.safe, false);
  assert.match(result.reason, /Only PAUSED/);
});

test('cleanup target rejects a paused session with an open PR', () => {
  const result = validateCleanupTarget({
    session: {
      state: 'PAUSED',
      sourceContext: { source: 'sources/github-japiohopman-artificer' },
    },
    source: 'sources/github-japiohopman-artificer',
    pullRequest: {
      number: 313,
      state: 'open',
      merged: false,
    },
  });

  assert.equal(result.safe, false);
  assert.match(result.reason, /PR is still open/);
});

test('cleanup target accepts a paused session without a PR', () => {
  const result = validateCleanupTarget({
    session: {
      state: 'PAUSED',
      sourceContext: { source: 'sources/github-japiohopman-artificer' },
    },
    source: 'sources/github-japiohopman-artificer',
    pullRequest: null,
  });

  assert.equal(result.safe, true);
});

test('cleanup target accepts a paused session with a terminal PR', () => {
  const result = validateCleanupTarget({
    session: {
      state: 'PAUSED',
      sourceContext: { source: 'sources/github-japiohopman-artificer' },
    },
    source: 'sources/github-japiohopman-artificer',
    pullRequest: {
      number: 264,
      state: 'closed',
      merged: false,
    },
  });

  assert.equal(result.safe, true);
});

test('cleanup target rejects sessions from another source', () => {
  const result = validateCleanupTarget({
    session: {
      state: 'PAUSED',
      sourceContext: { source: 'sources/github-other-repo' },
    },
    source: 'sources/github-japiohopman-artificer',
    pullRequest: null,
  });

  assert.equal(result.safe, false);
  assert.match(result.reason, /different Jules source/);
});

test('pull request output is extracted from a Jules session', () => {
  const result = findSessionPullRequest({
    outputs: [{
      pullRequest: {
        url: 'https://github.com/japiohopman/artificer/pull/264',
        title: 'Old work',
      },
    }],
  });

  assert.deepEqual(result, {
    url: 'https://github.com/japiohopman/artificer/pull/264',
    number: 264,
    title: 'Old work',
  });
});

test('session source matching is explicit', () => {
  assert.equal(
    isSessionForRepository(
      { sourceContext: { source: 'sources/github-japiohopman-artificer' } },
      'sources/github-japiohopman-artificer',
    ),
    true,
  );
  assert.equal(
    isSessionForRepository(
      { sourceContext: { source: 'sources/github-other-repo' } },
      'sources/github-japiohopman-artificer',
    ),
    false,
  );
});
