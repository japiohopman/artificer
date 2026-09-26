#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
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
import {
  shouldTriggerDiscovery,
  isDiscoveryIssue,
  executeDiscoveryAudit
} from './jules-discovery-loop.mjs';

export {
  parseDispatchMetadata,
  parseCanonicalReferences,
  specialistPath,
  validateIssueQualityGate
};

export function isCandidateIssue(issue, options = {}) {
  if (!issue || issue.state !== 'open' || issue.pull_request) {
    return false;
  }
  const quality = validateIssueQualityGate(issue.body || '', options);
  return quality.valid;
}

export function sortDispatchCandidates(candidates) {
  return [...candidates].sort((a, b) =>
    b.metadata.priority - a.metadata.priority || a.issue.number - b.issue.number
  );
}

export function findOpenImplementationPr(issueNumber, prs) {
  const needle = '#' + issueNumber;
  return prs.find(pr =>
    pr.state === 'open'
    && !pr.merged
    && new RegExp('(Closes|Fixes|Resolves|Refs|Part of)\\s+' + needle + '\\b', 'i').test(pr.body || '')
  ) || null;
}

export function dependencyBlocks(number, state) {
  if (!state) return { blocked: true, reason: 'Dependency #' + number + ' could not be resolved.' };
  if (state.type === 'pull_request') {
    return state.merged
      ? { blocked: false }
      : { blocked: true, reason: 'Dependency PR #' + number + ' is not merged.' };
  }
  return state.state === 'open'
    ? { blocked: true, reason: 'Dependency Issue #' + number + ' is still open.' }
    : { blocked: false };
}

export function selectDispatchableIssue(issues, options = {}) {
  const prs = options.openPullRequests || [];
  const dependencyStates = options.dependencyStates || new Map();
  const fileExistFn = options.fileExistFn;

  const candidateEntries = issues
    .filter(issue => issue && issue.state === 'open' && !issue.pull_request)
    .map(issue => ({
      issue,
      validation: validateIssueQualityGate(issue.body || '', { fileExistFn })
    }));

  const candidates = [];
  const rejected = [];

  for (const entry of candidateEntries) {
    if (!entry.validation.valid) {
      rejected.push({
        issueNumber: entry.issue.number,
        reason: 'Failed Quality Gate: ' + entry.validation.errors.join('; ')
      });
      continue;
    }
    candidates.push({ issue: entry.issue, metadata: entry.validation.metadata });
  }

  // Calculate telemetry for discovery loop
  const openNonPrIssues = issues.filter(i => i && i.state === 'open' && !i.pull_request);
  const activeDiscoveryCount = openNonPrIssues.filter(isDiscoveryIssue).length;
  const readyIssuesCount = candidates.length;
  const triggerDiscovery = shouldTriggerDiscovery({ readyIssuesCount, activeDiscoveryCount });

  let discoveryAuditResult = null;
  if (triggerDiscovery) {
    discoveryAuditResult = executeDiscoveryAudit(issues, {
      readyIssuesCount,
      fileExistFn
    });
  }

  let selectedCandidate = null;

  for (const candidate of sortDispatchCandidates(candidates)) {
    const existingPr = findOpenImplementationPr(candidate.issue.number, prs);
    if (existingPr) {
      rejected.push({
        issueNumber: candidate.issue.number,
        reason: 'Open implementation PR #' + existingPr.number + ' already exists.'
      });
      continue;
    }

    let blocked = false;
    for (const dependency of candidate.metadata.dependsOn) {
      const state = dependencyStates instanceof Map
        ? dependencyStates.get(dependency)
        : dependencyStates[dependency];
      const decision = dependencyBlocks(dependency, state);
      if (decision.blocked) {
        rejected.push({ issueNumber: candidate.issue.number, reason: decision.reason });
        blocked = true;
        break;
      }
    }
    if (!blocked) {
      selectedCandidate = candidate;
      break;
    }
  }

  return {
    selected: selectedCandidate,
    rejected,
    discovery: {
      triggered: triggerDiscovery,
      readyIssuesCount,
      activeDiscoveryCount,
      audit: discoveryAuditResult
    }
  };
}

export function buildJulesPrompt(issue, sharedContext, specialistContext, canonicalContexts) {
  const canonical = canonicalContexts.length
    ? canonicalContexts.map(item => '### ' + item.path + '\n' + item.content).join('\n\n')
    : 'No additional canonical references were declared by the Issue.';

  return [
    '# GitHub Issue #' + issue.number + ': ' + issue.title,
    '',
    'Contract precedence: GitHub Issue > selected specialist contract > shared agent instructions > canonical reference context.',
    '',
    '## Issue contract',
    issue.body || '',
    '',
    '## Shared agent instructions',
    sharedContext,
    '',
    '## Specialist contract',
    specialistContext,
    '',
    '## Canonical references',
    canonical,
    '',
    '## Execution constraints',
    '- Work only on the branch created for this Issue.',
    '- Do not create a parallel task database.',
    '- Do not reconstruct execution scope from ROADMAP.md or docs/TASK_BOARD.md, even if shared context still contains legacy queue wording.',
    '- Run the verification required by the Issue before claiming completion.',
    '- Create a PR that references this Issue and includes verification evidence.'
  ].join('\n');
}

function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  writeFileSync(process.env.GITHUB_OUTPUT, name + '=' + String(value) + '\n', { flag: 'a' });
}

async function github(path) {
  const REPO = process.env.GITHUB_REPOSITORY;
  const TOKEN = process.env.GITHUB_TOKEN;
  const response = await fetch('https://api.github.com/repos/' + REPO + '/' + path, {
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      Accept: 'application/vnd.github+json'
    }
  });
  if (!response.ok) {
    throw new Error('GitHub API ' + path + ' failed: ' + response.status + ' ' + await response.text());
  }
  return response.json();
}

async function file(path) {
  const item = await github('contents/' + path + '?ref=main');
  return Buffer.from(item.content, 'base64').toString('utf8');
}

async function fileOrNull(path) {
  try {
    return await file(path);
  } catch (error) {
    if (String(error.message || error).includes('GitHub API contents/' + path + ' failed: 404')) {
      return null;
    }
    throw error;
  }
}

async function dependencies(numbers) {
  const result = new Map();
  for (const number of numbers) {
    const issue = await github('issues/' + number);
    if (issue.pull_request) {
      const pull = await github('pulls/' + number);
      result.set(number, { type: 'pull_request', state: pull.state, merged: Boolean(pull.merged) });
    } else {
      result.set(number, { type: 'issue', state: issue.state });
    }
  }
  return result;
}

async function main() {
  const REPO = process.env.GITHUB_REPOSITORY;
  const TOKEN = process.env.GITHUB_TOKEN;
  if (!REPO || !TOKEN) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required.');

  const results = await Promise.all([
    github('issues?state=open&per_page=100'),
    github('pulls?state=open&base=main&per_page=100')
  ]);
  const issues = results[0];
  const prs = results[1];

  const candidateEntries = issues
    .filter(issue => !issue.pull_request)
    .map(issue => ({
      issue,
      validation: validateIssueQualityGate(issue.body || '')
    }))
    .filter(entry => entry.validation.valid);

  const dependencyNumbers = [...new Set(candidateEntries.flatMap(entry => entry.validation.metadata.dependsOn))];
  const dependencyStates = await dependencies(dependencyNumbers);
  const decision = selectDispatchableIssue(issues, {
    openPullRequests: prs,
    dependencyStates
  });

  if (!decision.selected) {
    setOutput('dispatch', false);

    console.log(JSON.stringify({
      dispatch: false,
      dispatchable: false,
      reason: 'No dispatchable Issue satisfies the Issue-first contract.',
      rejected: decision.rejected,
      discovery: decision.discovery
    }, null, 2));
    return;
  }

  const selected = decision.selected;
  const specialist = specialistPath(selected.metadata.specialist);
  const shared = await Promise.all([file('AGENT.MD'), file('AGENT_RULES.md')]);
  const specialistText = await fileOrNull(specialist);

  if (specialistText === null) {
    setOutput('dispatch', false);
    console.log(JSON.stringify({
      dispatch: false,
      dispatchable: false,
      dryRun: true,
      issueNumber: selected.issue.number,
      reason: 'Specialist contract is missing: ' + specialist,
      rejected: decision.rejected.concat([{
        issueNumber: selected.issue.number,
        reason: 'Missing specialist contract: ' + specialist
      }])
    }, null, 2));
    return;
  }
  const references = parseCanonicalReferences(selected.issue.body || '');
  const canonical = await Promise.all(references.map(async path => ({
    path,
    content: await file(path)
  })));

  const prompt = buildJulesPrompt(
    selected.issue,
    shared[0] + '\n\n' + shared[1],
    specialistText,
    canonical
  );

  setOutput('dispatch', false);
  console.log(JSON.stringify({
    dispatch: false,
    dispatchable: true,
    dryRun: true,
    issueNumber: selected.issue.number,
    priority: selected.metadata.priority,
    specialist: selected.metadata.specialist,
    specialistPath: specialist,
    prompt,
    sessionTitle: selected.issue.title.slice(0, 80),
    discovery: decision.discovery
  }, null, 2));
}

const direct = process.argv[1]
  && new URL(import.meta.url).pathname === new URL('file://' + process.argv[1]).pathname;

if (direct) {
  main().catch(error => {
    console.error(error);
    setOutput('dispatch', false);
    process.exit(1);
  });
}
