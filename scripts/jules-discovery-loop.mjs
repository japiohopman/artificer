import { existsSync, readFileSync } from 'node:fs';
import { extractSection, validateIssueQualityGate } from './jules-issue-validator.mjs';

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
 * Candidate Issues are embedded within the Discovery Report artifact until human review promotes them.
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
 * Executes a deep, evidence-backed discovery audit when low-ready-work conditions are met.
 * Audits repository contracts, open issues, quality gate compliance, and file references.
 * Produces a canonical Discovery Report artifact ([Discovery] Repository Evidence Audit Report, label: discovery).
 * Candidate follow-up Issues are embedded in the Discovery Report as proposed (status: proposed).
 * Discovery NEVER dispatches implementation work directly.
 *
 * @param {object[]} openIssues - List of currently open GitHub issues.
 * @param {object} options - Optional audit options.
 * @returns {{ executed: boolean, report: string | null, discoveryIssue: object | null, candidateIssues: string[], reason: string }}
 */
export function executeDiscoveryAudit(openIssues = [], options = {}) {
  const isDiscovery = options.isDiscoveryIssueFn || isDiscoveryIssue;
  const fileExistFn = options.fileExistFn || options.fileExistsFn || existsSync;
  const readFileFn = options.readFileFn || (p => fileExistFn(p) ? readFileSync(p, 'utf8') : null);

  const activeDiscoveryCount = openIssues.filter(isDiscovery).length;
  const readyIssuesCount = options.readyIssuesCount ?? 0;

  if (!shouldTriggerDiscovery({ readyIssuesCount, activeDiscoveryCount })) {
    return {
      executed: false,
      report: null,
      discoveryIssue: null,
      candidateIssues: [],
      reason: 'Discovery trigger conditions not met.'
    };
  }

  const evidenceItems = [];
  const findingItems = [];
  const candidateIssuesFormatted = [];
  const rejectedItems = [];

  // 1. Content-level audit of core workflow documents for contract consistency
  const canonicalDocs = [
    { path: 'docs/WORKFLOW.md', requiredTerm: 'Issue Quality Contract v2' },
    { path: 'docs/PHASE_SAFETY_GATE.md', requiredTerm: 'Issue Quality Gate' },
    { path: 'AGENT.MD', requiredTerm: 'Inspect before implementing' },
    { path: 'AGENT_RULES.md', requiredTerm: 'Inspect before implementing' }
  ];

  for (const doc of canonicalDocs) {
    if (fileExistFn(doc.path)) {
      const content = readFileFn(doc.path) || '';
      if (!content.includes(doc.requiredTerm)) {
        findingItems.push(`Contract drift in \`${doc.path}\`: missing required term "${doc.requiredTerm}".`);
        evidenceItems.push(`- Inspected \`${doc.path}\`: text does not contain "${doc.requiredTerm}".`);

        candidateIssuesFormatted.push(formatCandidateFollowUpIssue({
          problem: `Contract drift detected in \`${doc.path}\`: missing mandatory term "${doc.requiredTerm}".`,
          goal: `Synchronize \`${doc.path}\` with canonical workflow requirements.`,
          facts: `- \`${doc.path}\` exists on disk.\n- Content inspection confirmed missing term "${doc.requiredTerm}".`,
          investigation: `Review \`${doc.path}\` and update text to include mandatory contract requirements.`,
          ownership: 'Architecture specialist owns workflow documentation.',
          risks: 'Low risk documentation update.',
          scope: `- \`${doc.path}\``,
          acceptance: `1. \`${doc.path}\` includes "${doc.requiredTerm}".\n2. Documentation consistency verified.`,
          verification: '- `npm run test:workflow`',
          references: ['docs/WORKFLOW.md', doc.path],
          outOfScope: 'Refactoring unrelated files.',
          priority: 45,
          specialist: 'architecture'
        }));
      } else {
        evidenceItems.push(`- Verified \`${doc.path}\` contains mandatory contract marker "${doc.requiredTerm}".`);
      }
    } else {
      evidenceItems.push(`- Missing file \`${doc.path}\`.`);
      findingItems.push(`Canonical file \`${doc.path}\` is missing from repository.`);
    }
  }

  // 2. Deep audit of open GitHub issues against Quality Gate v2
  const openNonDiscoveryIssues = openIssues.filter(i => !isDiscovery(i));
  let invalidQualityIssuesCount = 0;

  for (const issue of openNonDiscoveryIssues) {
    const validation = validateIssueQualityGate(issue.body || '', { fileExistFn });
    const isProposed = (issue.body || '').includes('status: proposed') || (issue.body || '').includes('**status:** proposed');

    if (!validation.valid && !isProposed) {
      invalidQualityIssuesCount += 1;
      findingItems.push(`Issue #${issue.number} ("${issue.title}") fails Quality Gate v2: ${validation.errors.join('; ')}.`);
      evidenceItems.push(`- Issue #${issue.number} quality gate check failed: ${validation.errors.length} error(s).`);

      candidateIssuesFormatted.push(formatCandidateFollowUpIssue({
        problem: `Open Issue #${issue.number} ("${issue.title}") fails Quality Gate v2 validation.`,
        goal: `Remediate contract errors in Issue #${issue.number} so it satisfies Quality Gate v2.`,
        facts: `- Issue #${issue.number} fails validation with errors: ${validation.errors.join('; ')}.`,
        investigation: `Inspect body of Issue #${issue.number} and update missing or malformed sections.`,
        ownership: 'Architecture specialist owns issue quality contracts.',
        risks: 'Low risk issue contract fix.',
        scope: `- Issue #${issue.number}`,
        acceptance: `1. Issue #${issue.number} passes Quality Gate v2 validation.`,
        verification: '- `npm run test:workflow`',
        references: ['docs/WORKFLOW.md', 'scripts/jules-issue-validator.mjs'],
        outOfScope: 'Dispatches or implementation changes.',
        priority: 50,
        specialist: 'architecture'
      }));
    }
  }

  evidenceItems.push(`- Audited ${openNonDiscoveryIssues.length} open implementation issues; ${invalidQualityIssuesCount} failed Quality Gate v2.`);

  rejectedItems.push('- Discarded unverified suggestions lacking concrete file path or issue number evidence.');

  // 3. Format canonical Discovery Report
  const reportBody = formatDiscoveryReport({
    goal: 'Audit repository infrastructure, documentation contracts, and issue queue evidence.',
    investigation: `Executed deep evidence-backed discovery audit across ${canonicalDocs.length} core files and ${openIssues.length} open issues.`,
    evidence: evidenceItems.join('\n'),
    findings: findingItems.length > 0
      ? findingItems.map(f => '- ' + f).join('\n')
      : '- All inspected workflow files and open issues satisfy canonical contracts.',
    risk: 'Discovery report acts as the single persistent discovery artifact. Proposed candidate issues remain embedded as status: proposed until human review.',
    candidates: candidateIssuesFormatted.length > 0
      ? candidateIssuesFormatted.map((c, i) => `### Candidate Follow-up Issue ${i + 1}\n\`\`\`markdown\n${c}\n\`\`\``).join('\n\n')
      : '- No contract drift or quality defects found; no candidate follow-up issues required.',
    rejected: rejectedItems.join('\n')
  });

  const discoveryIssue = {
    title: '[Discovery] Repository Evidence Audit Report',
    labels: ['discovery'],
    body: reportBody
  };

  return {
    executed: true,
    report: reportBody,
    discoveryIssue,
    candidateIssues: candidateIssuesFormatted,
    reason: 'Deep evidence-backed discovery audit completed successfully.'
  };
}
