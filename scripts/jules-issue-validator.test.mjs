import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractSection,
  extractValueFromText,
  parseDispatchMetadata,
  parseCanonicalReferences,
  specialistPath,
  hasRepositoryEvidence,
  hasForbiddenLegacyQueueReferences,
  validateIssueQualityGate
} from './jules-issue-validator.mjs';

const tick = '`';

const validBody = [
  '## Problem / Desired Outcome',
  'Validation mechanism for issue contracts is missing.',
  '',
  '## Goal',
  'Implement Issue Quality Validator.',
  '',
  '## Current Repository Facts',
  '- `scripts/jules-issue-selector.mjs` parses issues.',
  '',
  '## Investigation Required',
  'Check existing workflow scripts.',
  '',
  '## Canonical Ownership',
  'Quality validator owns issue contract validation.',
  '',
  '## Known Risks / Invariants',
  'Do not break existing preflight checks.',
  '',
  '## Scope',
  '- `scripts/jules-issue-validator.mjs`',
  '',
  '## Acceptance Criteria',
  '1. Validation passes for valid issue.',
  '',
  '## Verification Plan',
  '- Run unit tests.',
  '',
  '## Canonical References',
  '- ' + tick + 'docs/WORKFLOW.md' + tick,
  '- ' + tick + 'AGENT.MD' + tick,
  '',
  '## Out of Scope',
  'Rewriting the dispatcher architecture.',
  '',
  '## Jules Dispatch Metadata',
  '- **status:** ready',
  '- **priority:** 10',
  '- **specialist:** architecture',
  '- **depends-on:** none',
  '- **dispatch-policy:** one issue at a time',
  '- **implementation-branch:** required'
].join('\n');

test('extractSection parses section content correctly', () => {
  const content = extractSection(validBody, ['## Goal']);
  assert.equal(content, 'Implement Issue Quality Validator.');
});

test('extractValueFromText parses metadata fields', () => {
  const metaText = extractSection(validBody, '## Jules Dispatch Metadata');
  assert.equal(extractValueFromText(metaText, 'status'), 'ready');
  assert.equal(extractValueFromText(metaText, 'priority'), '10');
  assert.equal(extractValueFromText(metaText, 'specialist'), 'architecture');
});

test('parseDispatchMetadata handles valid metadata', () => {
  const meta = parseDispatchMetadata(validBody);
  assert.equal(meta.valid, true);
  assert.equal(meta.status, 'ready');
  assert.equal(meta.priority, 10);
  assert.equal(meta.specialist, 'architecture');
  assert.equal(meta.dispatchPolicy, 'one issue at a time');
  assert.equal(meta.implementationBranch, 'required');
  assert.deepEqual(meta.dependsOn, []);
});

test('parseDispatchMetadata rejects non-ready status or invalid specialist', () => {
  const proposed = validBody.replace('**status:** ready', '**status:** proposed');
  assert.equal(parseDispatchMetadata(proposed).valid, false);

  const invalidSpecialist = validBody.replace('**specialist:** architecture', '**specialist:** unknown-agent');
  assert.equal(parseDispatchMetadata(invalidSpecialist).valid, false);
});

test('parseCanonicalReferences extracts backticked paths', () => {
  const refs = parseCanonicalReferences(validBody);
  assert.deepEqual(refs, ['docs/WORKFLOW.md', 'AGENT.MD']);
});

test('hasRepositoryEvidence detects repository file paths', () => {
  assert.equal(hasRepositoryEvidence(validBody), true);
  assert.equal(hasRepositoryEvidence('## Goal\nNo code paths mentioned.'), false);
});

test('hasForbiddenLegacyQueueReferences detects legacy queue claims', () => {
  assert.equal(hasForbiddenLegacyQueueReferences(validBody), false);
  assert.equal(hasForbiddenLegacyQueueReferences('dispatch from ROADMAP ### Ready'), true);
});

test('validateIssueQualityGate passes for valid v2 contract', () => {
  const result = validateIssueQualityGate(validBody, {
    fileExistFn: path => ['docs/WORKFLOW.md', 'AGENT.MD', '.github/agents/architecture-specialist.agent.md'].includes(path)
  });
  assert.equal(result.valid, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.metadata.specialist, 'architecture');
  assert.deepEqual(result.canonicalReferences, ['docs/WORKFLOW.md', 'AGENT.MD']);
});

test('validateIssueQualityGate fails when Goal-only issue lacks Problem / Desired Outcome', () => {
  const goalOnlyBody = validBody.replace('## Problem / Desired Outcome\nValidation mechanism for issue contracts is missing.\n\n', '');
  const result = validateIssueQualityGate(goalOnlyBody, { fileExistFn: () => true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(err => err.includes('Problem / Desired Outcome')));
});

test('validateIssueQualityGate fails when required sections are missing', () => {
  const incompleteBody = validBody.replace('## Out of Scope\nRewriting the dispatcher architecture.', '');
  const result = validateIssueQualityGate(incompleteBody, { fileExistFn: () => true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(err => err.includes('Out of Scope')));
});

test('validateIssueQualityGate fails when canonical reference does not exist', () => {
  const missingRefBody = validBody.replace('docs/WORKFLOW.md', 'nonexistent/file.md');
  const result = validateIssueQualityGate(missingRefBody, {
    fileExistFn: path => path !== 'nonexistent/file.md'
  });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(err => err.includes('Canonical reference "nonexistent/file.md" does not exist')));
});

test('validateIssueQualityGate fails when status is proposed', () => {
  const proposedBody = validBody.replace('**status:** ready', '**status:** proposed');
  const result = validateIssueQualityGate(proposedBody, { fileExistFn: () => true });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(err => err.includes('status must be "ready"')));
});
