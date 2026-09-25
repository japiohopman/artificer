import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildJulesPrompt,
  dependencyBlocks,
  findOpenImplementationPr,
  isCandidateIssue,
  parseCanonicalReferences,
  parseDispatchMetadata,
  selectDispatchableIssue,
  sortDispatchCandidates,
  specialistPath
} from './jules-issue-selector.mjs';

const tick = String.fromCharCode(96);
const meta = [
  '## Jules Dispatch Metadata',
  '- **status:** ready',
  '- **priority:** 100',
  '- **specialist:** architecture',
  '- **depends-on:** none',
  '- **dispatch-policy:** one issue at a time',
  '- **implementation-branch:** required',
  '',
  '## Canonical References',
  '- ' + tick + 'AGENT.MD' + tick,
  '- ' + tick + 'AGENT_RULES.md' + tick
].join('\n');

function issue(number, body = meta, extra = {}) {
  return { number, title: 'Issue ' + number, body, state: 'open', ...extra };
}

test('valid metadata parses', () => {
  const parsed = parseDispatchMetadata(meta);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.priority, 100);
  assert.equal(parsed.specialist, 'architecture');
});

test('invalid metadata is rejected', () => {
  assert.equal(isCandidateIssue(issue(1, '## Goal\nDo work.')), false);
  const invalid = parseDispatchMetadata(meta.replace('**priority:** 100', '**priority:** many'));
  assert.equal(invalid.valid, false);
});

test('priority ordering is deterministic', () => {
  const highBody = meta.replace('**priority:** 100', '**priority:** 200');
  const sorted = sortDispatchCandidates([
    { issue: issue(10), metadata: parseDispatchMetadata(meta) },
    { issue: issue(9, highBody), metadata: parseDispatchMetadata(highBody) }
  ]);
  assert.deepEqual(sorted.map(item => item.issue.number), [9, 10]);
});

test('pull requests are never candidates', () => {
  assert.equal(isCandidateIssue(issue(12, meta, { pull_request: { url: 'x' } })), false);
});

test('open implementation PR blocks an issue', () => {
  const pr = { number: 55, state: 'open', merged: false, body: 'Part of #42' };
  assert.equal(findOpenImplementationPr(42, [pr]).number, 55);
});

test('dependency PR must be merged', () => {
  assert.equal(dependencyBlocks(317, { type: 'pull_request', merged: false }).blocked, true);
  assert.equal(dependencyBlocks(317, { type: 'pull_request', merged: true }).blocked, false);
});

test('open dependency issue blocks selection', () => {
  assert.equal(dependencyBlocks(99, { type: 'issue', state: 'open' }).blocked, true);
});

test('selector skips blocked high priority issue', () => {
  const blocked = meta.replace('**priority:** 100', '**priority:** 200')
    .replace('**depends-on:** none', '**depends-on:** 99');
  const result = selectDispatchableIssue(
    [issue(20, blocked), issue(21, meta)],
    { dependencyStates: new Map([[99, { type: 'issue', state: 'open' }]]) }
  );
  assert.equal(result.selected.issue.number, 21);
});

test('existing implementation PR blocks selection', () => {
  const result = selectDispatchableIssue(
    [issue(42)],
    { openPullRequests: [{ number: 77, state: 'open', merged: false, body: 'Part of #42' }] }
  );
  assert.equal(result.selected, null);
});

test('specialist path is repository-local', () => {
  assert.equal(specialistPath('architecture'), '.github/agents/architecture-specialist.agent.md');
  assert.equal(specialistPath('../secrets'), null);
});

test('canonical references parse', () => {
  assert.deepEqual(parseCanonicalReferences(meta), ['AGENT.MD', 'AGENT_RULES.md']);
});

test('dry-run prompt contains required context', () => {
  const prompt = buildJulesPrompt(
    issue(42),
    'AGENT AND RULES',
    'ARCHITECTURE SPECIALIST',
    [{ path: 'AGENT.MD', content: 'CANONICAL' }]
  );
  assert.match(prompt, /Issue #42/);
  assert.match(prompt, /AGENT AND RULES/);
  assert.match(prompt, /ARCHITECTURE SPECIALIST/);
  assert.match(prompt, /CANONICAL/);
  assert.match(prompt, /execution contract/);
});

test('prompt makes Issue precedence explicit', () => {
  const prompt = buildJulesPrompt(
    issue(42),
    'LEGACY shared instructions mention ROADMAP.md and TASK_BOARD.md',
    'SPECIALIST CONTRACT',
    []
  );
  assert.match(prompt, /GitHub Issue > selected specialist contract > shared agent instructions/);
  assert.match(prompt, /ROADMAP\.md or docs\\/TASK_BOARD\.md/);
});

test('all specialist contracts are repository-local and present', () => {
  const specialistNames = [
    'architecture',
    'ruleset-data',
    'ui',
    'assets',
    'gameplay',
    'verification'
  ];
  for (const name of specialistNames) {
    assert.equal(
      specialistPath(name),
      '.github/agents/' + name + '-specialist.agent.md'
    );
  }
});

test('selector source never references legacy queue paths', () => {
  const source = readFileSync(new URL('./jules-issue-selector.mjs', import.meta.url), 'utf8');
  assert.equal(source.includes('ROADMAP.md'), false);
  assert.equal(source.includes('docs/TASK_BOARD.md'), false);
});
