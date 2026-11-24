import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const workspace = read('../AGENTS.md');
const entry = read('../AGENT.MD');
const rules = read('../AGENT_RULES.md');
const workflow = read('../docs/WORKFLOW.md');
const phaseGate = read('../docs/PHASE_SAFETY_GATE.md');
const quickStart = read('../docs/ANTIGRAVITY_CLI.md');
const chatgpt = read('../CHATGPT.md');
const issueForm = read('../.github/ISSUE_TEMPLATE/phase.yml');
const docsIndex = read('../DOCS_INDEX.md');
const packageJson = JSON.parse(read('../package.json'));

test('Antigravity discovers the root workspace instructions and reads shared contracts', () => {
  assert.equal(existsSync(new URL('../AGENTS.md', import.meta.url)), true);
  assert.match(workspace, /Antigravity CLI/);
  assert.match(workspace, /assigned GitHub Issue/);
  assert.match(workspace, /AGENT\.MD/);
  assert.match(workspace, /AGENT_RULES\.md/);
  assert.match(workspace, /\.github\/agents/);
  assert.match(workspace, /Never edit or commit directly to `main`/);
  assert.match(workspace, /agy --mode=plan/);
  assert.match(entry, /AGY/);
  assert.match(rules, /AGY runs locally/);
});

test('workflow defines local agent execution without Jules API dispatch', () => {
  assert.match(workflow, /Google Antigravity CLI/);
  assert.match(workflow, /local AGY execution/i);
  assert.match(workflow, /one active task/i);
  assert.match(workflow, /Jaap/);
  assert.doesNotMatch(workflow, /JULES_API_KEY|jules-issue-dispatcher|confirmation: DISPATCH/i);
  assert.match(phaseGate, /local AGY implementation/);
  assert.doesNotMatch(phaseGate, /Jules session|Jules branch/i);
});

test('Antigravity quick start contains the official Windows install and safe plan-mode start', () => {
  assert.match(quickStart, /irm https:\/\/antigravity\.google\/cli\/install\.ps1 \| iex/);
  assert.match(quickStart, /agy --mode=plan/);
  assert.match(quickStart, /git switch -c/);
  assert.match(quickStart, /Do not push, open a PR/);
});

test('ChatGPT memory remains advisory and records the current 2026 project state', () => {
  assert.match(chatgpt, /Maintained by ChatGPT/);
  assert.match(chatgpt, /Non-Authoritative \/ Advisory Only/);
  assert.match(chatgpt, /Current Project Control & Sequencing Model — 2026-11-24/);
  assert.match(chatgpt, /PR #386 is an abandoned Draft/);
  assert.match(chatgpt, /Issue #415/);
});

test('new phase template uses agent-neutral Execution Metadata', () => {
  assert.match(issueForm, /Execution Metadata/);
  assert.match(issueForm, /execution-policy: one issue at a time/);
  assert.doesNotMatch(issueForm, /execution contract for Jules/);
});

test('documentation index links to Antigravity guidance', () => {
  assert.match(docsIndex, /AGENTS\.md/);
  assert.match(docsIndex, /ANTIGRAVITY_CLI\.md/);
});

test('Issue quality and PR relay tests are the only workflow test entry points', () => {
  assert.match(packageJson.scripts['test:workflow'], /issue-quality-gate\.test\.mjs/);
  assert.match(packageJson.scripts['test:workflow'], /agent-contract\.test\.mjs/);
  assert.match(packageJson.scripts['test:workflow'], /chatgpt-review-relay\.test\.mjs/);
  assert.doesNotMatch(packageJson.scripts['test:workflow'], /jules-/);
  assert.equal(packageJson.scripts['workflow:issue-dry-run'], undefined);
});

test('all six specialist contracts remain available', () => {
  const files = new Set(readdirSync(new URL('../.github/agents/', import.meta.url)));
  for (const name of [
    'architecture-specialist.agent.md',
    'ruleset-data-specialist.agent.md',
    'ui-specialist.agent.md',
    'assets-specialist.agent.md',
    'gameplay-specialist.agent.md',
    'verification-specialist.agent.md',
  ]) {
    assert.equal(files.has(name), true, name + ' is missing');
  }
});

test('Jules dispatch and session management are fully retired from active scripts and workflows', () => {
  const scriptFiles = readdirSync(new URL('../scripts/', import.meta.url));
  const workflowFiles = readdirSync(new URL('../.github/workflows/', import.meta.url));
  assert.equal(scriptFiles.some(name => /^jules-/i.test(name)), false);
  assert.equal(workflowFiles.some(name => /^jules-/i.test(name)), false);
  for (const name of workflowFiles.filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))) {
    const content = read('../.github/workflows/' + name);
    assert.doesNotMatch(content, /JULES_API_KEY|jules-issue-dispatcher|jules-session-cleanup/i);
  }
});
