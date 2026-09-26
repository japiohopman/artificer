import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const agentEntry = readFileSync(new URL('../AGENT.MD', import.meta.url), 'utf8');
const agentRules = readFileSync(new URL('../AGENT_RULES.md', import.meta.url), 'utf8');
const docsIndex = readFileSync(new URL('../DOCS_INDEX.md', import.meta.url), 'utf8');
const projectHub = readFileSync(new URL('../docs/PROJECT_HUB.md', import.meta.url), 'utf8');
const workflowDoc = readFileSync(new URL('../docs/WORKFLOW.md', import.meta.url), 'utf8');
const roadmapDoc = readFileSync(new URL('../ROADMAP.md', import.meta.url), 'utf8');
const taskBoardDoc = readFileSync(new URL('../docs/TASK_BOARD.md', import.meta.url), 'utf8');

test('shared agent entry point is Issue-first', () => {
  assert.match(agentEntry, /## Execution hierarchy/);
  assert.match(agentEntry, /Assigned GitHub Issue/);
  assert.match(agentEntry, /selected specialist contract/);
  assert.match(agentEntry, /docs\/WORKFLOW\.md/);
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

test('documentation index identifies specialist contracts and authoritative workflow', () => {
  assert.match(docsIndex, /Specialist agent contracts/);
  assert.match(docsIndex, /WORKFLOW\.md/);
  assert.match(docsIndex, /TASK_BOARD\.md.*not.*active execution queue/i);
  assert.match(docsIndex, /architecture-specialist\.agent\.md/);
  assert.match(docsIndex, /verification-specialist\.agent\.md/);
});

test('project hub links to WORKFLOW.md and does not present TASK_BOARD as active workflow', () => {
  assert.match(projectHub, /Operating Model & Workflow/);
  assert.match(projectHub, /assigned GitHub Issue is the execution contract/);
  assert.match(projectHub, /TASK_BOARD\.md.*migration\/reference document/);
  assert.match(projectHub, /Active Issue-first routing/);
  assert.match(projectHub, /Legacy named-agent documents are retained as migration\/history material only/);
});

test('WORKFLOW.md defines canonical hierarchy and role boundaries', () => {
  assert.match(workflowDoc, /Canonical Hierarchy/);
  assert.match(workflowDoc, /AUTHORITATIVE EXECUTION CONTRACT/);
  assert.match(workflowDoc, /Human Project Owner/);
  assert.match(workflowDoc, /AI Implementation Engineer \(Jules\)/);
  assert.match(workflowDoc, /Architecture & Review AI Assistant/);
  assert.match(workflowDoc, /Repository Autonomy & Context Recovery/);
});

test('WORKFLOW.md defines review loop, dispatch boundaries, and scope protection', () => {
  assert.match(workflowDoc, /Human Review & Revision Loop/);
  assert.match(workflowDoc, /Dispatch Boundary & Review Context/);
  assert.match(workflowDoc, /Scope Protection & Creep Prevention/);
});

test('ROADMAP.md is strictly strategic context without legacy dispatch queues', () => {
  assert.doesNotMatch(roadmapDoc, /### Ready/);
  assert.doesNotMatch(roadmapDoc, /### Active/);
  assert.doesNotMatch(roadmapDoc, /Jules only receives work from/);
  assert.doesNotMatch(roadmapDoc, /single canonical dispatch roadmap/);
  assert.match(roadmapDoc, /Strategic Roadmap/);
  assert.match(roadmapDoc, /Active execution contracts live strictly in \*\*GitHub Issues\*\*/);
});

test('TASK_BOARD.md is an explicit historical reference and not a dispatch queue', () => {
  assert.match(taskBoardDoc, /Historical Migration Reference/);
  assert.match(taskBoardDoc, /active execution queue/i);
  assert.match(taskBoardDoc, /Migration & Audit Matrix/);
  assert.doesNotMatch(taskBoardDoc, /active execution checklist behind/);
  assert.doesNotMatch(taskBoardDoc, /controls current priority and Jules dispatch/);
});

test('active orchestration scripts do not read legacy queue files as input', () => {
  const selectorSource = readFileSync(new URL('./jules-issue-selector.mjs', import.meta.url), 'utf8');
  const preflightSource = readFileSync(new URL('./jules-orchestrator-preflight.mjs', import.meta.url), 'utf8');
  const dispatchSource = readFileSync(new URL('./jules-issue-dispatch.mjs', import.meta.url), 'utf8');

  for (const src of [selectorSource, preflightSource, dispatchSource]) {
    assert.equal(src.includes("readFileSync('ROADMAP.md'"), false);
    assert.equal(src.includes("readFileSync('docs/TASK_BOARD.md'"), false);
    assert.equal(src.includes("contents/ROADMAP.md"), false);
    assert.equal(src.includes("contents/docs/TASK_BOARD.md"), false);
  }
});

test('specialist contracts under .github/agents/ prohibit ROADMAP/TASK_BOARD selection', () => {
  const agentFiles = readdirSync(new URL('../.github/agents/', import.meta.url));
  for (const file of agentFiles) {
    if (file.endsWith('.md')) {
      const content = readFileSync(new URL(`../.github/agents/${file}`, import.meta.url), 'utf8');
      assert.match(content, /ROADMAP\.md|TASK_BOARD\.md/, `${file} must mention ROADMAP/TASK_BOARD boundary`);
      assert.match(content, /(not (execution queues|an execution queue|a competing task database)|Do not select or expand work)/i, `${file} must state ROADMAP/TASK_BOARD selection is prohibited`);
    }
  }
});

test('obsolete execution files are permanently removed', () => {
  assert.equal(existsSync(new URL('../scripts/jules-orchestrator.mjs', import.meta.url)), false);
  assert.equal(existsSync(new URL('../.github/workflows/jules-orchestrator.yml', import.meta.url)), false);
  assert.equal(existsSync(new URL('../JULES_ORCHESTRATOR_SETUP.md', import.meta.url)), false);
  assert.equal(existsSync(new URL('../.github/workflows/JULES_ORCHESTRATOR_SETUP.md', import.meta.url)), false);
  assert.equal(existsSync(new URL('../instructions_japie.md', import.meta.url)), false);
  assert.equal(existsSync(new URL('../priority1.md', import.meta.url)), false);
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
