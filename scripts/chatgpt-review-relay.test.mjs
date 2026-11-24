import test from 'node:test';
import assert from 'node:assert/strict';
import {
  RELAY_LABEL,
  RELAY_MARKER,
  isEligiblePullRequest,
  isTaskBranch,
  findGoverningIssue,
  summarizeCheckRuns,
  formatRelayComment,
  formatClosedRelayComment,
} from './chatgpt-review-relay.mjs';

const basePr = {
  number: 415,
  title: 'chore(workflow): replace Jules with local Antigravity CLI',
  state: 'open',
  draft: false,
  body: 'Implements the local agent workflow. Closes #415',
  base: { ref: 'main' },
  head: {
    ref: 'chore/415-replace-jules-with-antigravity-cli',
    sha: 'deadbeef',
    repo: { full_name: 'japiohopman/artificer' },
  },
};

test('same-repository local task PR targeting main is queued', () => {
  assert.equal(isEligiblePullRequest(basePr, 'japiohopman/artificer'), true);
});

test('recognized local task branch prefixes are accepted', () => {
  for (const branch of ['agent/415-workflow', 'feat/415-feature', 'fix/415-bug', 'chore/415-maintenance', 'refactor/415-cleanup', 'test/415-coverage', 'docs/415-guide', 'perf/415-speed', 'build/415-build', 'ci/415-checks']) {
    assert.equal(isTaskBranch(branch), true, branch);
  }
});

test('unknown, empty and bare task prefixes are rejected', () => {
  for (const branch of ['', 'main', 'sandbox/test', 'agent/', 'chore/']) {
    assert.equal(isTaskBranch(branch), false, branch);
  }
});

test('draft PR is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, draft: true }, 'japiohopman/artificer'), false);
});

test('non-main base is ignored', () => {
  assert.equal(isEligiblePullRequest({ ...basePr, base: { ref: 'develop' } }, 'japiohopman/artificer'), false);
});

test('fork PR is ignored even when its branch name is valid', () => {
  const fork = { ...basePr, head: { ...basePr.head, repo: { full_name: 'contributor/artificer' } } };
  assert.equal(isEligiblePullRequest(fork, 'japiohopman/artificer'), false);
});

test('missing head repository is rejected', () => {
  const missingRepo = { ...basePr, head: { ...basePr.head, repo: null } };
  assert.equal(isEligiblePullRequest(missingRepo, 'japiohopman/artificer'), false);
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
  assert.match(comment, /#415/);
  assert.match(comment, /deadbeef/);
  assert.match(comment, /CI\/checks: \*\*passing\*\*/);
  assert.match(comment, /Phase Safety Gate: \*\*pending\*\*/);
  assert.match(comment, /not an approval or review result/);
  assert.equal(comment.includes(RELAY_MARKER), true);
});

test('relay label is the documented queue label', () => {
  assert.equal(RELAY_LABEL, 'chatgpt-review');
});

test('closed relay comment clears the active queue state', () => {
  const comment = formatClosedRelayComment({ number: 400, merged: true });
  assert.match(comment, /PR #400 is closed and merged/);
  assert.match(comment, /active ChatGPT review queue entry has been cleared/);
  assert.equal(comment.includes(RELAY_MARKER), true);
  assert.ok(comment.includes('\n'));
});
