import { existsSync, readFileSync } from 'node:fs';

/**
 * Valid specialist contract names in .github/agents/
 */
export const VALID_SPECIALISTS = new Set([
  'architecture',
  'ruleset-data',
  'ui',
  'assets',
  'gameplay',
  'verification'
]);

/**
 * Extracts a section from markdown body given one or more heading aliases.
 * @param {string} body
 * @param {string | string[]} headings
 * @returns {string | null}
 */
export function extractSection(body, headings) {
  if (!body) return null;
  const list = Array.isArray(headings) ? headings : [headings];

  for (const heading of list) {
    const start = body.indexOf(heading);
    if (start >= 0) {
      const rest = body.slice(start + heading.length);
      const next = rest.search(/^##\s+/m);
      const content = next < 0 ? rest : rest.slice(0, next);
      return content.trim();
    }
  }
  return null;
}

/**
 * Extracts a key-value pair formatted as `- **key:** value` from section text.
 */
export function extractValueFromText(text, key) {
  if (!text) return null;
  const prefix = '- **' + key + ':**';
  const line = text.split('\n').find(item => item.trim().startsWith(prefix));
  return line ? line.trim().slice(prefix.length).trim() : null;
}

/**
 * Parses dispatch metadata from `## Jules Dispatch Metadata` or `## Dispatch Metadata`.
 */
export function parseDispatchMetadata(body) {
  const text = extractSection(body, ['## Jules Dispatch Metadata', '## Dispatch Metadata']);
  if (!text) {
    return {
      valid: false,
      errors: ['Missing required section: ## Jules Dispatch Metadata'],
      status: null,
      priority: null,
      specialist: null,
      dependsOn: [],
      dispatchPolicy: null,
      implementationBranch: null
    };
  }

  const status = extractValueFromText(text, 'status');
  const priorityText = extractValueFromText(text, 'priority');
  const specialist = extractValueFromText(text, 'specialist');
  const dependsOnText = extractValueFromText(text, 'depends-on') || 'none';
  const dispatchPolicy = extractValueFromText(text, 'dispatch-policy');
  const branchPolicy = extractValueFromText(text, 'implementation-branch');
  const priority = Number(priorityText);
  const errors = [];

  if (status !== 'ready') {
    errors.push(`Dispatch status must be "ready" (found: "${status || 'missing'}").`);
  }
  if (!Number.isInteger(priority)) {
    errors.push(`Priority must be an integer (found: "${priorityText || 'missing'}").`);
  }
  if (!specialist || !/^[a-z0-9-]+$/.test(specialist)) {
    errors.push(`Specialist name is invalid (found: "${specialist || 'missing'}").`);
  } else if (!VALID_SPECIALISTS.has(specialist)) {
    errors.push(`Specialist "${specialist}" is not a recognized specialist agent.`);
  }
  if (dispatchPolicy !== 'one issue at a time') {
    errors.push(`dispatch-policy must be "one issue at a time" (found: "${dispatchPolicy || 'missing'}").`);
  }
  if (branchPolicy !== 'required') {
    errors.push(`implementation-branch must be "required" (found: "${branchPolicy || 'missing'}").`);
  }

  const dependsOn = dependsOnText === 'none'
    ? []
    : dependsOnText.split(/[\s,]+/).map(item => Number(item.replace(/^#/, ''))).filter(Number.isInteger);

  return {
    valid: errors.length === 0,
    errors,
    status,
    priority: Number.isInteger(priority) ? priority : null,
    specialist,
    dependsOn,
    dispatchPolicy,
    implementationBranch: branchPolicy
  };
}

/**
 * Parses canonical reference paths formatted as `- \`path/to/file\`` under `## Canonical References`.
 */
export function parseCanonicalReferences(body) {
  const text = extractSection(body, '## Canonical References');
  if (!text) return [];
  return text.split('\n')
    .map(line => line.match(/^\s*-\s+\`([^\`]+)\`\s*$/))
    .filter(Boolean)
    .map(match => match[1]);
}

/**
 * Resolves repository-local specialist path.
 */
export function specialistPath(name) {
  return name && /^[a-z0-9-]+$/.test(name)
    ? '.github/agents/' + name + '-specialist.agent.md'
    : null;
}

/**
 * Checks whether an issue body contains concrete repository evidence references.
 */
export function hasRepositoryEvidence(body) {
  if (!body) return false;

  // Look for backticked paths or explicit file path references in the body
  const pathRegex = /`(?:src|scripts|docs|\.github|public|tests|tools)\/[^`]+`|\b(?:src|scripts|docs|\.github|public|tests|tools)\/[A-Za-z0-9_\-\.\/]+/g;
  const matches = body.match(pathRegex);
  return Boolean(matches && matches.length > 0);
}

/**
 * Checks whether the issue body attempts to use legacy queue sources as an active execution queue.
 */
export function hasForbiddenLegacyQueueReferences(body) {
  if (!body) return false;

  const forbiddenPatterns = [
    /dispatch\s+from\s+ROADMAP/i,
    /dispatch\s+from\s+TASK_BOARD/i,
    /Jules\s+receives\s+work\s+from\s+###\s+Ready/i,
    /execution\s+queue:\s*ROADMAP/i,
    /execution\s+queue:\s*TASK_BOARD/i
  ];

  return forbiddenPatterns.some(pattern => pattern.test(body));
}

/**
 * Validates an Issue body against Issue Quality Contract v2.
 *
 * @param {string} body - The Issue body text.
 * @param {object} options - Optional validation configuration.
 * @returns {{ valid: boolean, errors: string[], metadata: object | null, canonicalReferences: string[] }}
 */
export function validateIssueQualityGate(body, options = {}) {
  const errors = [];
  const fileExistsFn = options.fileExistFn || existsSync;

  if (!body || typeof body !== 'string' || body.trim().length === 0) {
    return {
      valid: false,
      errors: ['Issue body is empty or missing.'],
      metadata: null,
      canonicalReferences: []
    };
  }

  // 1. Required sections validation
  const requiredSections = [
    { name: 'Goal / Problem', headings: ['## Goal', '## Problem / Desired Outcome', '## Problem/Desired Outcome'] },
    { name: 'Current Repository Facts', headings: ['## Current Repository Facts'] },
    { name: 'Investigation Required', headings: ['## Investigation Required'] },
    { name: 'Canonical Ownership', headings: ['## Canonical Ownership'] },
    { name: 'Known Risks / Invariants', headings: ['## Known Risks / Invariants'] },
    { name: 'Scope', headings: ['## Scope'] },
    { name: 'Acceptance Criteria', headings: ['## Acceptance Criteria'] },
    { name: 'Verification Plan', headings: ['## Verification Plan'] },
    { name: 'Canonical References', headings: ['## Canonical References'] },
    { name: 'Out of Scope', headings: ['## Out of Scope'] },
    { name: 'Dispatch Metadata', headings: ['## Jules Dispatch Metadata', '## Dispatch Metadata'] }
  ];

  for (const req of requiredSections) {
    const content = extractSection(body, req.headings);
    if (!content) {
      errors.push(`Missing required section: ${req.name}`);
    } else if (content.length === 0) {
      errors.push(`Required section "${req.name}" is empty.`);
    }
  }

  // 2. Dispatch metadata validation
  const metadata = parseDispatchMetadata(body);
  if (!metadata.valid) {
    errors.push(...metadata.errors);
  }

  // 3. Specialist contract existence
  if (metadata.specialist) {
    const sPath = specialistPath(metadata.specialist);
    if (!sPath || !fileExistsFn(sPath)) {
      errors.push(`Specialist contract file "${sPath || metadata.specialist}" does not exist.`);
    }
  }

  // 4. Canonical references resolution
  const references = parseCanonicalReferences(body);
  if (references.length === 0 && extractSection(body, '## Canonical References')) {
    // If the section exists, ensure references are listed
    errors.push('Section ## Canonical References must contain at least one backticked file path (e.g. - `docs/WORKFLOW.md`).');
  } else {
    for (const refPath of references) {
      if (!fileExistsFn(refPath)) {
        errors.push(`Canonical reference "${refPath}" does not exist on main.`);
      }
    }
  }

  // 5. Repository evidence requirement
  if (!hasRepositoryEvidence(body)) {
    errors.push('Issue contract must contain at least one concrete repository file reference or evidence statement (e.g., `src/...` or `docs/...`).');
  }

  // 6. Forbidden legacy queue references
  if (hasForbiddenLegacyQueueReferences(body)) {
    errors.push('Issue contract contains forbidden legacy execution-queue claims (e.g., dispatching from ROADMAP or TASK_BOARD).');
  }

  return {
    valid: errors.length === 0,
    errors,
    metadata: metadata.valid ? metadata : null,
    canonicalReferences: references
  };
}
