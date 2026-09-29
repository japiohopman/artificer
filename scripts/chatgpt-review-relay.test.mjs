import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RELAY_LABEL,
  RELAY_MARKER,
  isEligiblePullRequest,
  findGoverningIssue,
  summarizeCheckRuns,
  formatRelayComment,
} from './chatgpt-review-relay.mjs';

const basePr = {
  number: 399,
  title: 'feat(workflow): automate review relay (#399)',
  state: 'open',
  draft: false,
  body: 'Implements the relay. Closes #399',
  base: { ref: 'main' },
  head: {
    ref: 'jules-12345-abc',
    sha: 'deadbeef',
    repo: { full_name: 'japiohopman/artificer' },
  },
};

test('eligible Jules PR targeting main is queued', () => {
  assert.equal(isEligiblePullRequest(basePr, 'japiohopman/artificer'), true);
});

test('draft PR is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, draft: true }, 'japiohopman/artificer'), false);
});

test('non-Jules branch is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, head: { ...basePr.head, ref: 'feat/other' } }, 'japiohopman/artificer'), false);
});

test('non-main base is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, base: { ref: 'develop' } }, 'japiohopman/artificer'), false);
});

test('missing governing Issue is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, body: 'No issue reference here' }, 'japiohopman/artificer'), false);
});

test('governing Issue references are parsed deterministically', () => {
  assert.equal(findGoverningIssue('Closes #123'), 123);
  assert.equal(findGoverningIssue('Part of #456'), 456);
  assert.equal(findGoverningIssue('fixes #7'), 7);
  assert.equal(findGoverningIssue('No issue'), null);
});

test('check state is deterministic for pending, failing and passing runs', () => {
  assert.equal(summarizeCheckRuns([{ name: 'CI', status: 'in_progress' }]).state, 'pending');
  assert.equal(summarizeCheckRuns([{ name: 'CI', status: 'completed', conclusion: 'failure' }]).state, 'failing');
  assert.equal(summarizeCheckRuns([{ name: 'CI', status: 'completed', conclusion: 'success' }]).state, 'passing');
  assert.equal(summarizeCheckRuns([]).state, 'no-checks');
});

test('failing checks take precedence over pending checks', () => {
  const result = summarizeCheckRuns([
    { name: 'CI', status: 'in_progress' },
    { name: 'Safety', status: 'completed', conclusion: 'failure' },
  ]);
  assert.equal(result.state, 'failing');
});

test('relay comment contains stable marker and current review context', () => {
  const comment = formatRelayComment(
    basePr,
    [{ name: 'CI', status: 'completed', conclusion: 'success' }],
    [{ name: 'Phase Safety Gate', status: 'in_progress' }],
  );
  assert.match(comment, /chatgpt-review-relay/);
  assert.match(comment, /#399/);
  assert.match(comment, /deadbeef/);
  assert.match(comment, /CI\/checks: \*\*passing\*\*/);
  assert.match(comment, /Phase Safety Gate: \*\*pending\*\*/);
  assert.match(comment, /not an approval or review result/);
  assert.equal(comment.includes(RELAY_MARKER), true);
});

test('relay label is the documented queue label', () => {
  assert.equal(RELAY_LABEL, 'chatgpt-review');
});
