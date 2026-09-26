import { extractSection } from './jules-issue-validator.mjs';

/**
 * Required sections for a Discovery Report contract.
 */
export const DISCOVERY_CONTRACT_SECTIONS = [
  '## Goal',
  '## Repository Investigation',
  '## Evidence',
  '## Findings',
  '## Risk / Impact',
  '## Candidate Follow-up Issues',
  '## Rejected / Non-actionable Findings'
];

/**
 * Determines if discovery loop should be triggered based on ready issues count and active discovery count.
 * Condition: ready Issues <= 2 AND no active Discovery Issue.
 *
 * @param {{ readyIssuesCount: number, activeDiscoveryCount: number }} params
 * @returns {boolean}
 */
export function shouldTriggerDiscovery({ readyIssuesCount, activeDiscoveryCount }) {
  const ready = Number.isInteger(readyIssuesCount) ? readyIssuesCount : 0;
  const activeDiscovery = Number.isInteger(activeDiscoveryCount) ? activeDiscoveryCount : 0;

  return ready <= 2 && activeDiscovery === 0;
}

/**
 * Checks if an Issue is a Discovery Issue.
 *
 * @param {object} issue
 * @returns {boolean}
 */
export function isDiscoveryIssue(issue) {
  if (!issue) return false;

  const titleHasDiscovery = Boolean(issue.title && /\[Discovery\]|\bdiscovery\b/i.test(issue.title));
  const labels = issue.labels || [];
  const labelHasDiscovery = labels.some(l => (typeof l === 'string' ? l : l?.name) === 'discovery');
  const bodyHasInvestigation = Boolean(issue.body && extractSection(issue.body, '## Repository Investigation'));

  return labelHasDiscovery || titleHasDiscovery || bodyHasInvestigation;
}

/**
 * Formats a proposed candidate follow-up Issue text resulting from discovery findings.
 * Crucial invariant: candidate Issues produced by discovery must ALWAYS begin as status: proposed.
 *
 * @param {object} candidate
 * @returns {string}
 */
export function formatCandidateFollowUpIssue({
  goal,
  facts,
  investigation,
  ownership,
  risks,
  scope,
  acceptance,
  verification,
  references,
  outOfScope,
  priority = 50,
  specialist = 'architecture'
}) {
  const tick = '`';
  const refLines = (references || [])
    .map(r => '- ' + tick + r + tick)
    .join('\n') || '- ' + tick + 'docs/WORKFLOW.md' + tick;

  return [
    '## Goal',
    goal || 'Proposed goal from discovery finding.',
    '',
    '## Current Repository Facts',
    facts || '- Repository facts discovered during audit.',
    '',
    '## Investigation Required',
    investigation || 'Investigation details.',
    '',
    '## Canonical Ownership',
    ownership || 'Domain ownership details.',
    '',
    '## Known Risks / Invariants',
    risks || 'Known risks and safety invariants.',
    '',
    '## Scope',
    scope || '- Scope details.',
    '',
    '## Acceptance Criteria',
    acceptance || '1. Proposed acceptance criterion.',
    '',
    '## Verification Plan',
    verification || '- Run test suite.',
    '',
    '## Canonical References',
    refLines,
    '',
    '## Out of Scope',
    outOfScope || 'Out of scope boundary.',
    '',
    '## Jules Dispatch Metadata',
    '- **status:** proposed',
    `- **priority:** ${priority}`,
    `- **specialist:** ${specialist}`,
    '- **depends-on:** none',
    '- **dispatch-policy:** one issue at a time',
    '- **implementation-branch:** required'
  ].join('\n');
}

/**
 * Validates a Discovery Report body against the Discovery Contract.
 *
 * @param {string} body
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateDiscoveryReport(body) {
  const errors = [];
  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return { valid: false, errors: ['Discovery report body is empty or missing.'] };
  }

  for (const heading of DISCOVERY_CONTRACT_SECTIONS) {
    const content = extractSection(body, heading);
    if (!content) {
      errors.push(`Missing required discovery section: ${heading}`);
    } else if (content.length === 0) {
      errors.push(`Discovery section "${heading}" is empty.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
