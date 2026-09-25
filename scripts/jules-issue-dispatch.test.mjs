import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildActiveSessionState,
  buildJulesSessionRequest,
  persistSessionState,
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

test('active session state retains Issue metadata', () => {
  const state = buildActiveSessionState(payload, { name: 'sessions/123' });
  assert.equal(state.activeSession.name, 'sessions/123');
  assert.equal(state.activeSession.issueNumber, 313);
  assert.equal(state.activeSession.specialist, 'architecture');
  assert.equal(state.activeSession.task, payload.sessionTitle);
});

test('state persistence writes the created session state', () => {
  let written = null;
  persistSessionState('/tmp/jules-state.json', payload, { name: 'sessions/456' }, (_path, value) => {
    written = value;
  });
  assert.match(written, /sessions\/456/);
  assert.match(written, /"issueNumber": 313/);
});

test('live Jules API creation is isolated to the dispatch script', () => {
  const source = readFileSync(
    new URL('./jules-issue-dispatch.mjs', import.meta.url),
    'utf8'
  );
  assert.match(source, /jules\.googleapis\.com\/v1alpha\/sessions/);
});
