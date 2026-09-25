import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const agentEntry = readFileSync(new URL('../AGENT.MD', import.meta.url), 'utf8');
const agentRules = readFileSync(new URL('../AGENT_RULES.md', import.meta.url), 'utf8');
const docsIndex = readFileSync(new URL('../DOCS_INDEX.md', import.meta.url), 'utf8');
const projectHub = readFileSync(new URL('../docs/PROJECT_HUB.md', import.meta.url), 'utf8');

test('shared agent entry point is Issue-first', () => {
  assert.match(agentEntry, /## Execution hierarchy/);
  assert.match(agentEntry, /Assigned GitHub Issue/);
  assert.match(agentEntry, /selected specialist contract/);
  assert.doesNotMatch(agentEntry, /Start here, not with GOALS\.md/);
  assert.doesNotMatch(agentEntry, /TASK_BOARD item \[x\]/);
  assert.doesNotMatch(agentEntry, /ROADMAP\.md.*what's in scope right now/);
});

test('shared agent rules do not define a TASK_BOARD execution queue', () => {
  assert.match(agentRules, /assigned GitHub Issue is the persistent execution contract/);
  assert.doesNotMatch(agentRules, /checkbox on TASK_BOARD\.md/);
  assert.doesNotMatch(agentRules, /TASK_BOARD\.md still has open items/);
  assert.doesNotMatch(agentRules, /Each named agent owns a domain/);
});

test('documentation index identifies specialist contracts as active routing', () => {
  assert.match(docsIndex, /Specialist agent contracts/);
  assert.match(docsIndex, /TASK_BOARD\.md.*not.*active execution queue/);
  assert.match(docsIndex, /architecture-specialist\.agent\.md/);
  assert.match(docsIndex, /verification-specialist\.agent\.md/);
});

test('project hub does not present TASK_BOARD or legacy named agents as active workflow', () => {
  assert.match(projectHub, /assigned GitHub Issue is the execution contract/);
  assert.match(projectHub, /TASK_BOARD\.md.*migration\/reference document/);
  assert.match(projectHub, /Active Issue-first routing/);
  assert.match(projectHub, /Legacy named-agent documents are retained as migration\/history material only/);
});

test('all six specialist contracts exist in the repository', () => {
  const files = new Set(readdirSync(new URL('../.github/agents/', import.meta.url)));
  for (const name of [
    'architecture-specialist.agent.md',
    'ruleset-data-specialist.agent.md',
    'ui-specialist.agent.md',
    'assets-specialist.agent.md',
    'gameplay-specialist.agent.md',
    'verification-specialist.agent.md'
  ]) {
    assert.equal(files.has(name), true, name + ' is missing');
  }
});
