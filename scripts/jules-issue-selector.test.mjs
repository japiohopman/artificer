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
  '## Problem / Desired Outcome',
  'Sample problem description.',
  '',
  '## Goal',
  'Sample goal for testing.',
  '',
  '## Current Repository Facts',
  '- `scripts/jules-issue-selector.mjs` exists.',
  '',
  '## Investigation Required',
  'Sample investigation.',
  '',
  '## Canonical Ownership',
  'Sample canonical ownership.',
  '',
  '## Known Risks / Invariants',
  'Sample risks and invariants.',
  '',
  '## Scope',
  '- `scripts/jules-issue-selector.mjs`',
  '',
  '## Acceptance Criteria',
  '1. Sample acceptance criteria.',
  '',
  '## Verification Plan',
  '- `npm test`',
  '',
  '## Canonical References',
  '- ' + tick + 'AGENT.MD' + tick,
  '- ' + tick + 'AGENT_RULES.md' + tick,
  '',
  '## Out of Scope',
  'Sample out of scope.',
  '',
  '## Jules Dispatch Metadata',
  '- **status:** ready',
  '- **priority:** 100',
  '- **specialist:** architecture',
  '- **depends-on:** none',
  '- **dispatch-policy:** one issue at a time',
  '- **implementation-branch:** required'
].join('\n');

function issue(number, body = meta, extra = {}) {
  return { number, title: 'Issue ' + number, body, state: 'open', ...extra };
}

const fileExistFn = path => ['AGENT.MD', 'AGENT_RULES.md', '.github/agents/architecture-specialist.agent.md'].includes(path);

test('valid metadata parses', () => {
  const parsed = parseDispatchMetadata(meta);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.priority, 100);
  assert.equal(parsed.specialist, 'architecture');
});

test('invalid metadata or incomplete issue contract is rejected by candidate check', () => {
  assert.equal(isCandidateIssue(issue(1, '## Goal\nDo work.'), { fileExistFn }), false);
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
  assert.equal(isCandidateIssue(issue(12, meta, { pull_request: { url: 'x' } }), { fileExistFn }), false);
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
    {
      dependencyStates: new Map([[99, { type: 'issue', state: 'open' }]]),
      fileExistFn
    }
  );
  assert.equal(result.selected.issue.number, 21);
});

test('existing implementation PR blocks selection', () => {
  const result = selectDispatchableIssue(
    [issue(42)],
    {
      openPullRequests: [{ number: 77, state: 'open', merged: false, body: 'Part of #42' }],
      fileExistFn
    }
  );
  assert.equal(result.selected, null);
});

test('malformed or incomplete issue contract is rejected by selectDispatchableIssue', () => {
  const incompleteBody = meta.replace('## Out of Scope\nSample out of scope.', '');
  const result = selectDispatchableIssue(
    [issue(100, incompleteBody)],
    { fileExistFn }
  );
  assert.equal(result.selected, null);
  assert.ok(result.rejected.some(r => r.issueNumber === 100 && r.reason.includes('Failed Quality Gate')));
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
  assert.match(prompt, /GitHub Issue/);
});

test('prompt makes Issue precedence explicit', () => {
  const prompt = buildJulesPrompt(
    issue(42),
    'LEGACY shared instructions mention ROADMAP.md and TASK_BOARD.md',
    'SPECIALIST CONTRACT',
    []
  );
  assert.match(prompt, /GitHub Issue > selected specialist contract > shared agent instructions/);
  assert.match(prompt, /ROADMAP\.md or docs\/TASK_BOARD\.md/);
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
    const path = specialistPath(name);
    assert.equal(path, '.github/agents/' + name + '-specialist.agent.md');
    const source = readFileSync(new URL('../' + path, import.meta.url), 'utf8');
    assert.match(source, /The GitHub Issue is the execution contract/);
    assert.match(source, /ROADMAP\.md[\s\S]*docs\/TASK_BOARD\.md/);
  }
});

test('selector source never reads legacy queue files', () => {
  const source = readFileSync(new URL('./jules-issue-selector.mjs', import.meta.url), 'utf8');
  assert.equal(source.includes("file('ROADMAP.md')"), false);
  assert.equal(source.includes("file('docs/TASK_BOARD.md')"), false);
  assert.equal(source.includes("contents/ROADMAP.md"), false);
  assert.equal(source.includes("contents/docs/TASK_BOARD.md"), false);
});

test('executable selector stdout is strictly valid JSON even when Discovery persistence triggers diagnostics', async () => {
  const { spawnSync } = await import('node:child_process');
  const runnerScript = `
    globalThis.fetch = async (url, options = {}) => {
      const u = new URL(url);
      if (u.pathname.endsWith('/issues')) {
        if (options.method === 'POST') {
          return new Response(JSON.stringify({ number: 345, title: '[Discovery] Report' }), { status: 201 });
        }
        const tick = String.fromCharCode(96);
        const meta = [
          '## Problem / Desired Outcome', 'Problem',
          '## Goal', 'Goal',
          '## Current Repository Facts', '- Fact',
          '## Investigation Required', 'Investigation',
          '## Canonical Ownership', 'Ownership',
          '## Known Risks / Invariants', 'Risks',
          '## Scope', '- Scope',
          '## Acceptance Criteria', '1. Criterion',
          '## Verification Plan', '- Verification',
          '## Canonical References', '- ' + tick + 'AGENT.MD' + tick,
          '## Out of Scope', 'Out of scope',
          '## Jules Dispatch Metadata',
          '- **status:** ready',
          '- **priority:** 100',
          '- **specialist:** architecture',
          '- **depends-on:** none',
          '- **dispatch-policy:** one issue at a time',
          '- **implementation-branch:** required'
        ].join('\\n');
        return new Response(JSON.stringify([
          { number: 1, title: 'Issue 1', body: meta, state: 'open' }
        ]), { status: 200 });
      }
      if (u.pathname.endsWith('/pulls')) {
        return new Response(JSON.stringify([]), { status: 200 });
      }
      if (u.pathname.includes('/contents/')) {
        return new Response(JSON.stringify({ content: Buffer.from('mock content').toString('base64') }), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    };

    const scriptUrl = new URL('./scripts/jules-issue-selector.mjs', 'file://' + process.cwd() + '/');
    process.argv[1] = scriptUrl.pathname;
    await import(scriptUrl.href);
  `;

  const child = spawnSync(process.execPath, ['--input-type=module', '-e', runnerScript], {
    env: {
      ...process.env,
      GITHUB_REPOSITORY: 'japiohopman/artificer',
      GITHUB_TOKEN: 'mock-token'
    },
    encoding: 'utf8'
  });

  assert.equal(child.status, 0, 'Child process failed: ' + child.stderr);
  assert.ok(child.stderr.includes('Low ready work detected'), 'Diagnostics must be sent to stderr');

  let parsed;
  assert.doesNotThrow(() => {
    parsed = JSON.parse(child.stdout);
  }, 'Selector stdout must be valid JSON');
  assert.equal(parsed.persistedDiscoveryIssue?.number, 345);
});
