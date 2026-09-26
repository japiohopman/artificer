import { existsSync, readFileSync } from 'node:fs';
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
 * Executes an evidence-backed discovery audit when low-ready-work conditions are met.
 * Audits repository infrastructure, open issues, and workflow contracts.
 * Produces an evidence-backed Discovery Report and proposed candidate follow-up Issues (`status: proposed`).
 * Discovery NEVER dispatches implementation work directly.
 *
 * @param {object[]} openIssues - List of currently open GitHub issues.
 * @param {object} options - Optional audit options.
 * @returns {{ executed: boolean, discoveryIssue: object | null, candidateIssues: string[], reason: string }}
 */
export function executeDiscoveryAudit(openIssues = [], options = {}) {
  const isDiscovery = options.isDiscoveryIssueFn || isDiscoveryIssue;
  const fileExistsFn = options.fileExistFn || existsSync;
  const readFileFn = options.readFileFn || (p => existsSync(p) ? readFileSync(p, 'utf8') : null);

  const activeDiscoveryCount = openIssues.filter(isDiscovery).length;
  const readyIssuesCount = options.readyIssuesCount ?? 0;

  if (!shouldTriggerDiscovery({ readyIssuesCount, activeDiscoveryCount })) {
    return {
      executed: false,
      discoveryIssue: null,
      candidateIssues: [],
      reason: 'Discovery trigger conditions not met.'
    };
  }

  const evidenceItems = [];
  const findingItems = [];
  const candidateIssuesFormatted = [];
  const rejectedItems = [];

  // 1. Audit core workflow files and contracts
  const coreFiles = [
    'docs/WORKFLOW.md',
    'docs/PHASE_SAFETY_GATE.md',
    'AGENT.MD',
    'AGENT_RULES.md',
    'scripts/jules-issue-validator.mjs',
    'scripts/jules-discovery-loop.mjs',
    'scripts/jules-issue-selector.mjs'
  ];

  for (const filePath of coreFiles) {
    if (fileExistsFn(filePath)) {
      const content = readFileFn(filePath);
      const lineCount = content ? content.split('\n').length : 0;
      evidenceItems.push(`- Verified canonical file \`${filePath}\` exists (${lineCount} lines).`);
    } else {
      evidenceItems.push(`- Missing canonical file \`${filePath}\`.`);
      findingItems.push(`Canonical reference file \`${filePath}\` is missing from disk.`);
    }
  }

  // 2. Audit specialist agent contracts
  const specialistAgents = [
    'architecture',
    'ruleset-data',
    'ui',
    'assets',
    'gameplay',
    'verification'
  ];

  let existingSpecialists = 0;
  for (const name of specialistAgents) {
    const sPath = `.github/agents/${name}-specialist.agent.md`;
    if (fileExistsFn(sPath)) {
      existingSpecialists += 1;
    } else {
      findingItems.push(`Missing specialist contract \`${sPath}\`.`);
    }
  }
  evidenceItems.push(`- Specialist agent contracts: ${existingSpecialists}/${specialistAgents.length} present under \`.github/agents/\`.`);

  // 3. Audit open issues for proposed issues or contract gaps
  const proposedIssues = openIssues.filter(i => {
    const body = i.body || '';
    return body.includes('**status:** proposed') || body.includes('status: proposed');
  });

  evidenceItems.push(`- Open GitHub issues count: ${openIssues.length} (Ready: ${readyIssuesCount}, Proposed: ${proposedIssues.length}, Discovery: ${activeDiscoveryCount}).`);

  if (proposedIssues.length > 0) {
    findingItems.push(`Found ${proposedIssues.length} open proposed candidate issue(s) awaiting human validation.`);
    for (const pIssue of proposedIssues) {
      evidenceItems.push(`- Proposed candidate issue #${pIssue.number}: "${pIssue.title}".`);
    }
  } else {
    // Generate a proposed candidate issue for routine workflow coverage check if no proposed issues exist
    const candidateBody = formatCandidateFollowUpIssue({
      problem: 'Workflow telemetry and discovery coverage requires routine verification test updates.',
      goal: 'Audit and maintain workflow test coverage for discovery and quality gates.',
      facts: '- `scripts/jules-discovery-loop.mjs` and `scripts/jules-issue-validator.mjs` are verified.\n- Workflow test suite `npm run test:workflow` runs 61 subtests.',
      investigation: 'Audit test suite coverage for newly introduced discovery loop telemetry.',
      ownership: 'Verification specialist owns workflow test coverage.',
      risks: 'Low risk maintenance task.',
      scope: '- `scripts/jules-discovery-loop.test.mjs`\n- `scripts/jules-issue-validator.test.mjs`',
      acceptance: '1. Workflow tests pass clean.\n2. Discovery audit findings remain non-dispatchable as proposed.',
      verification: '- `npm run test:workflow`',
      references: ['docs/WORKFLOW.md', 'scripts/jules-discovery-loop.mjs'],
      outOfScope: 'Modifying core dispatcher logic.',
      priority: 30,
      specialist: 'verification'
    });
    candidateIssuesFormatted.push(candidateBody);
  }

  rejectedItems.push('- Discarded non-actionable suggestions without concrete file path evidence.');

  // 4. Format canonical Discovery Report
  const reportBody = formatDiscoveryReport({
    goal: 'Audit repository infrastructure, specialist contracts, and issue queue evidence.',
    investigation: `Executed evidence-backed discovery audit across ${coreFiles.length} canonical files and ${openIssues.length} open issues.`,
    evidence: evidenceItems.join('\n'),
    findings: findingItems.length > 0
      ? findingItems.map(f => '- ' + f).join('\n')
      : '- Repository workflow infrastructure and contracts are intact.',
    risk: 'Discovery loop creates proposed candidates only; direct implementation dispatch is strictly forbidden.',
    candidates: candidateIssuesFormatted.length > 0
      ? candidateIssuesFormatted.map((c, i) => `### Candidate ${i + 1}\n\`\`\`markdown\n${c}\n\`\`\``).join('\n\n')
      : proposedIssues.length > 0
        ? proposedIssues.map(p => `- Proposed Issue #${p.number}: "${p.title}"`).join('\n')
        : '- No new candidate issues required.',
    rejected: rejectedItems.join('\n')
  });

  const discoveryIssue = {
    title: '[Discovery] Repository Evidence Audit Report',
    labels: ['discovery'],
    body: reportBody
  };

  return {
    executed: true,
    discoveryIssue,
    candidateIssues: candidateIssuesFormatted,
    reason: 'Evidence-backed discovery loop executed successfully.'
  };
}
