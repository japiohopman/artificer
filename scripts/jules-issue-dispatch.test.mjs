import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildJulesSessionRequest,
  validateConfirmation,
} from './jules-issue-dispatch.mjs';

const payload = {
  dispatchable: true,
  issueNumber: 313,
  priority: 60,
  specialist: 'architecture',
  sessionTitle: 'docs(architecture): establish capability map',
  prompt: 'Issue contract prompt',
};

test('exact DISPATCH confirmation is required', () => {
  assert.equal(validateConfirmation('DISPATCH'), true);
  assert.equal(validateConfirmation('dispatch'), false);
  assert.equal(validateConfirmation('DISPATCH '), false);
  assert.equal(validateConfirmation(''), false);
});

test('session request uses the selected Issue prompt and main branch', () => {
  const request = buildJulesSessionRequest(payload, 'sources/github-japiohopman-artificer');
  assert.equal(request.prompt, payload.prompt);
  assert.equal(request.title, payload.sessionTitle);
  assert.equal(request.sourceContext.source, 'sources/github-japiohopman-artificer');
  assert.equal(request.sourceContext.githubRepoContext.startingBranch, 'main');
  assert.equal(request.automationMode, 'AUTO_CREATE_PR');
});

test('non-dispatchable selector payload is rejected', () => {
  assert.throws(
    () => buildJulesSessionRequest({ ...payload, dispatchable: false }, 'sources/example'),
    /not dispatchable/
  );
});

test('live Jules API creation is isolated to the dispatch script', () => {
  const source = readFileSync(
    new URL('./jules-issue-dispatch.mjs', import.meta.url),
    'utf8'
  );
  assert.match(source, /jules\.googleapis\.com\/v1alpha\/sessions/);
});

test('dispatch script does not mutate git refs or protected main', () => {
  const source = readFileSync(
    new URL('./jules-issue-dispatch.mjs', import.meta.url),
    'utf8'
  );
  assert.doesNotMatch(source, /git\s+(config|add|commit|push)/);
  assert.doesNotMatch(source, /jules-queue-state\.json/);
  assert.match(source, /authoritative source for active-session reconciliation/);
});
