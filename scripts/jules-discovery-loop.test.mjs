import test from 'node:test';
import assert from 'node:assert/strict';
import {
  shouldTriggerDiscovery,
  isDiscoveryIssue,
  formatCandidateFollowUpIssue,
  validateDiscoveryReport
} from './jules-discovery-loop.mjs';
import { validateIssueQualityGate } from './jules-issue-validator.mjs';

test('shouldTriggerDiscovery returns true only when readyIssues <= 2 AND activeDiscovery === 0', () => {
  assert.equal(shouldTriggerDiscovery({ readyIssuesCount: 2, activeDiscoveryCount: 0 }), true);
  assert.equal(shouldTriggerDiscovery({ readyIssuesCount: 0, activeDiscoveryCount: 0 }), true);
  assert.equal(shouldTriggerDiscovery({ readyIssuesCount: 3, activeDiscoveryCount: 0 }), false);
  assert.equal(shouldTriggerDiscovery({ readyIssuesCount: 1, activeDiscoveryCount: 1 }), false);
});

test('isDiscoveryIssue detects discovery issues by title, label, or body section', () => {
  assert.equal(isDiscoveryIssue({ title: '[Discovery] Audit repo' }), true);
  assert.equal(isDiscoveryIssue({ title: 'Feature', labels: [{ name: 'discovery' }] }), true);
  assert.equal(isDiscoveryIssue({ title: 'Feature', body: '## Repository Investigation\nChecked codebase.' }), true);
  assert.equal(isDiscoveryIssue({ title: 'Normal Issue', body: '## Goal\nFix bug.' }), false);
});

test('formatCandidateFollowUpIssue produces status: proposed metadata', () => {
  const candidateText = formatCandidateFollowUpIssue({
    goal: 'Proposed feature',
    facts: '- Facts',
    investigation: 'Audit',
    ownership: 'Architecture',
    risks: 'None',
    scope: '- Scope',
    acceptance: '1. Criteria',
    verification: '- Test',
    references: ['docs/WORKFLOW.md'],
    outOfScope: 'Out of scope',
    priority: 40,
    specialist: 'architecture'
  });

  assert.match(candidateText, /\*\*status:\*\* proposed/);
  assert.doesNotMatch(candidateText, /\*\*status:\*\* ready/);

  // Proposed candidate issue should fail quality gate for status ready dispatch
  const gateResult = validateIssueQualityGate(candidateText, { fileExistFn: () => true });
  assert.equal(gateResult.valid, false);
  assert.ok(gateResult.errors.some(e => e.includes('status must be "ready"')));
});

test('validateDiscoveryReport validates all required discovery contract sections', () => {
  const validReport = [
    '## Goal',
    'Audit repository for gaps.',
    '## Repository Investigation',
    'Inspected scripts.',
    '## Evidence',
    'Found 2 unlinked modules.',
    '## Findings',
    'Module X is unused.',
    '## Risk / Impact',
    'Low risk.',
    '## Candidate Follow-up Issues',
    '- Propose issue for module X cleanup.',
    '## Rejected / Non-actionable Findings',
    '- None.'
  ].join('\n');

  const result = validateDiscoveryReport(validReport);
  assert.equal(result.valid, true);

  const invalidReport = validReport.replace('## Rejected / Non-actionable Findings\n- None.', '');
  const invalidResult = validateDiscoveryReport(invalidReport);
  assert.equal(invalidResult.valid, false);
  assert.ok(invalidResult.errors.some(e => e.includes('Rejected / Non-actionable Findings')));
});
