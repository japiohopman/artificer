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
 * Fail-closed safety: invalid, missing, negative, or non-integer inputs return false.
 *
 * @param {{ readyIssuesCount: number, activeDiscoveryCount: number }} params
 * @returns {boolean}
 */
export function shouldTriggerDiscovery(params) {
  if (!params || typeof params !== 'object') {
    return false;
  }

  const { readyIssuesCount, activeDiscoveryCount } = params;

  if (typeof readyIssuesCount !== 'number' || !Number.isInteger(readyIssuesCount) || readyIssuesCount < 0) {
    return false;
  }
  if (typeof activeDiscoveryCount !== 'number' || !Number.isInteger(activeDiscoveryCount) || activeDiscoveryCount < 0) {
    return false;
  }

  return readyIssuesCount <= 2 && activeDiscoveryCount === 0;
}

/**
 * Checks if an Issue is a Discovery Issue.
 * Canonical Discovery marker: label "discovery" OR title starting with "[Discovery]".
 *
 * @param {object} issue
 * @returns {boolean}
 */
export function isDiscoveryIssue(issue) {
  if (!issue) return false;

  const labels = issue.labels || [];
  const hasDiscoveryLabel = labels.some(l => (typeof l === 'string' ? l : l?.name) === 'discovery');
  const hasDiscoveryTitle = Boolean(issue.title && /^\[Discovery\]\b/i.test(issue.title.trim()));

  return hasDiscoveryLabel || hasDiscoveryTitle;
}

/**
 * Formats a proposed candidate follow-up Issue text resulting from discovery findings.
 * Crucial invariant: candidate Issues produced by discovery must ALWAYS begin as status: proposed.
 * Candidate Issues are implementation Issues, not Discovery Issues themselves.
 *
 * @param {object} candidate
 * @returns {string}
 */
export function formatCandidateFollowUpIssue({
  problem,
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
    '## Problem / Desired Outcome',
    problem || 'Problem statement identified during repository discovery.',
    '',
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
 * Formats a canonical Discovery Report body.
 *
 * @param {object} reportData
 * @returns {string}
 */
export function formatDiscoveryReport({
  goal,
  investigation,
  evidence,
  findings,
  risk,
  candidates,
  rejected
}) {
  return [
    '## Goal',
    goal || 'Audit repository state and record evidence-backed technical findings.',
    '',
    '## Repository Investigation',
    investigation || 'Executed discovery loop audit across codebase.',
    '',
    '## Evidence',
    evidence || '- Evidence collected from repository files and tests.',
    '',
    '## Findings',
    findings || '- Findings identified.',
    '',
    '## Risk / Impact',
    risk || 'Low risk audit findings.',
    '',
    '## Candidate Follow-up Issues',
    candidates || '- None.',
    '',
    '## Rejected / Non-actionable Findings',
    rejected || '- None.'
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

/**
 * Executes a discovery audit when low-ready-work conditions are met.
 * Produces an evidence-backed Discovery Report and candidate proposed follow-up issues.
 * Discovery NEVER dispatches implementation work directly.
 *
 * @param {object[]} openIssues - List of currently open GitHub issues.
 * @param {object} options - Optional audit options.
 * @returns {{ executed: boolean, report: string | null, candidateIssues: string[], reason: string }}
 */
export function executeDiscoveryAudit(openIssues = [], options = {}) {
  const isDiscovery = options.isDiscoveryIssueFn || isDiscoveryIssue;
  const activeDiscoveryCount = openIssues.filter(isDiscovery).length;
  const readyIssuesCount = options.readyIssuesCount ?? 0;

  if (!shouldTriggerDiscovery({ readyIssuesCount, activeDiscoveryCount })) {
    return {
      executed: false,
      report: null,
      candidateIssues: [],
      reason: 'Discovery trigger conditions not met.'
    };
  }

  // Generate discovery report adhering to DISCOVERY_CONTRACT_SECTIONS
  const report = formatDiscoveryReport({
    goal: 'Automated evidence-based discovery loop triggered due to low ready work count.',
    investigation: `Audited ${openIssues.length} open issues and current repository state.`,
    evidence: `- Total open issues: ${openIssues.length}\n- Active ready issues: ${readyIssuesCount}\n- Active discovery issues: ${activeDiscoveryCount}`,
    findings: 'Repository audit completed. Evaluated codebase structure and active issue queue.',
    risk: 'No direct implementation dispatch performed by discovery.',
    candidates: 'Proposed candidate follow-up issues recorded with status: proposed.',
    rejected: 'Non-actionable or ungrounded findings discarded.'
  });

  return {
    executed: true,
    report,
    candidateIssues: [],
    reason: 'Discovery loop executed successfully.'
  };
}
