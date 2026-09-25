#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN;

function section(body, heading) {
  const start = body.indexOf(heading);
  if (start < 0) return null;
  const rest = body.slice(start + heading.length);
  const next = rest.search(/^##\s+/m);
  return next < 0 ? rest : rest.slice(0, next);
}

function valueFrom(text, key) {
  const prefix = '- **' + key + ':**';
  const line = text.split('\n').find(item => item.trim().startsWith(prefix));
  return line ? line.trim().slice(prefix.length).trim() : null;
}

export function parseDispatchMetadata(body) {
  const text = section(body || '', '## Jules Dispatch Metadata');
  if (!text) return { valid: false, errors: ['Missing dispatch metadata section.'] };

  const status = valueFrom(text, 'status');
  const priorityText = valueFrom(text, 'priority');
  const specialist = valueFrom(text, 'specialist');
  const dependsOnText = valueFrom(text, 'depends-on') || 'none';
  const dispatchPolicy = valueFrom(text, 'dispatch-policy');
  const branchPolicy = valueFrom(text, 'implementation-branch');
  const priority = Number(priorityText);
  const errors = [];

  if (status !== 'ready') errors.push('status must be ready.');
  if (!Number.isInteger(priority)) errors.push('priority must be an integer.');
  if (!specialist || !/^[a-z0-9-]+$/.test(specialist)) errors.push('specialist is invalid.');
  if (dispatchPolicy !== 'one issue at a time') errors.push('dispatch-policy is invalid.');
  if (branchPolicy !== 'required') errors.push('implementation-branch is invalid.');

  const dependsOn = dependsOnText === 'none'
    ? []
    : dependsOnText.split(/[\s,]+/).map(item => Number(item.replace(/^#/, ''))).filter(Number.isInteger);

  return {
    valid: errors.length === 0,
    errors,
    priority: Number.isInteger(priority) ? priority : null,
    specialist,
    dependsOn
  };
}

export function parseCanonicalReferences(body) {
  const text = section(body || '', '## Canonical References');
  if (!text) return [];
  return text.split('\n')
    .map(line => line.match(/^\s*-\s+\`([^\`]+)\`\s*$/))
    .filter(Boolean)
    .map(match => match[1]);
}

export function specialistPath(name) {
  return name && /^[a-z0-9-]+$/.test(name)
    ? '.github/agents/' + name + '-specialist.agent.md'
    : null;
}

export function isCandidateIssue(issue) {
  return Boolean(issue && issue.state === 'open' && !issue.pull_request && parseDispatchMetadata(issue.body || '').valid);
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
  const candidates = issues
    .filter(isCandidateIssue)
    .map(issue => ({ issue, metadata: parseDispatchMetadata(issue.body || '') }));

  const rejected = [];
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
    if (!blocked) return { selected: candidate, rejected };
  }

  return { selected: null, rejected };
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
  if (!REPO || !TOKEN) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required.');

  const results = await Promise.all([
    github('issues?state=open&per_page=100'),
    github('pulls?state=open&base=main&per_page=100')
  ]);
  const issues = results[0];
  const prs = results[1];

  const candidates = issues.filter(issue => !issue.pull_request);
  const metadata = candidates
    .map(issue => parseDispatchMetadata(issue.body || ''))
    .filter(meta => meta.valid);

  const dependencyNumbers = [...new Set(metadata.flatMap(meta => meta.dependsOn))];
  const dependencyStates = await dependencies(dependencyNumbers);
  const decision = selectDispatchableIssue(issues, {
    openPullRequests: prs,
    dependencyStates
  });

  if (!decision.selected) {
    setOutput('dispatch', false);
    console.log(JSON.stringify({
      dispatch: false,
      reason: 'No dispatchable Issue satisfies the Issue-first contract.',
      rejected: decision.rejected
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
    dryRun: true,
    issueNumber: selected.issue.number,
    priority: selected.metadata.priority,
    specialist: selected.metadata.specialist,
    specialistPath: specialist,
    prompt
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
