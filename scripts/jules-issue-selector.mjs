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
  executeDiscoveryAudit,
  persistDiscoveryReportIssue
} from './jules-discovery-loop.mjs';

export {
  parseDispatchMetadata,
  parseCanonicalReferences,
  specialistPath,
  validateIssueQualityGate,
  persistDiscoveryReportIssue,
  file
};

export function parseRoadmapSequence(markdown) {
  if (!markdown || typeof markdown !== 'string') return [];

  const section = extractSection(markdown, [
    '## ChatGPT-Curated Execution Sequence',
    '## Execution Sequence',
    '## Roadmap Sequence'
  ]);

  if (!section) return [];

  const textToParse = section;

  const lines = textToParse.split('\n');
  const sequence = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;

    const cells = trimmed.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
    if (cells.length < 4) continue;

    const orderNum = parseInt(cells[0], 10);
    if (isNaN(orderNum)) continue;

    const itemText = cells[1];
    const purposeText = cells[2];
    const stateText = cells[3];

    const issueMatch = itemText.match(/#(\d+)/);
    const issueNumber = issueMatch ? parseInt(issueMatch[1], 10) : null;

    sequence.push({
      order: orderNum,
      rawItem: itemText,
      issueNumber,
      purpose: purposeText,
      currentState: stateText
    });
  }

  return sequence.sort((a, b) => a.order - b.order);
}

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
    && (
      new RegExp('(Closes|Fixes|Resolves|Refs|Part of)\\s+' + needle + '\\b', 'i').test(pr.body || '') ||
      new RegExp('\\(#' + issueNumber + '\\)', 'i').test(pr.title || '') ||
      new RegExp('\\(#' + issueNumber + '\\)', 'i').test(pr.body || '')
    )
  ) || null;
}

export function isSequenceItemComplete(seq, issues, dependencyStates, options = {}) {
  const prs = options.openPullRequests || [];

  if (seq.issueNumber === null) {
    return /complete|completed|done|passed/i.test(seq.currentState || '');
  }

  const depState = dependencyStates instanceof Map
    ? dependencyStates.get(seq.issueNumber)
    : dependencyStates[seq.issueNumber];

  // If dependency is a merged PR
  if (depState && depState.type === 'pull_request' && depState.merged) {
    return true;
  }

  // If dependency issue is closed, require explicit stateReason === 'completed'
  if (depState && depState.type === 'issue' && depState.state === 'closed') {
    return depState.stateReason === 'completed';
  }

  const hasMergedPr = prs.some(pr =>
    pr.merged && (
      new RegExp('(Closes|Fixes|Resolves|Refs|Part of)\\s+#' + seq.issueNumber + '\\b', 'i').test(pr.body || '') ||
      new RegExp('\\(#' + seq.issueNumber + '\\)', 'i').test(pr.title || '') ||
      new RegExp('\\(#' + seq.issueNumber + '\\)', 'i').test(pr.body || '')
    )
  );

  if (hasMergedPr) {
    return true;
  }

  return false;
}

export function advanceNextCuratedIssueReadiness(issues, roadmapSequence, dependencyStates, options = {}) {
  const fileExistFn = options.fileExistFn;
  if (!roadmapSequence || roadmapSequence.length === 0) return null;

  for (let i = 0; i < roadmapSequence.length; i++) {
    const seq = roadmapSequence[i];

    if (isSequenceItemComplete(seq, issues, dependencyStates, options)) {
      continue;
    }

    if (seq.issueNumber === null) {
      break;
    }

    // Found the first uncompleted sequence issue!
    const targetIssue = issues.find(idx => idx && idx.number === seq.issueNumber && idx.state === 'open' && !idx.pull_request);
    if (!targetIssue) break;

    // Check if it's currently status: proposed
    const dispatchMeta = parseDispatchMetadata(targetIssue.body || '');
    if (dispatchMeta.status === 'proposed') {
      // Validate quality gate with status overridden to ready to check if quality gate passes
      const updatedBody = targetIssue.body.replace('- **status:** proposed', '- **status:** ready');
      const quality = validateIssueQualityGate(updatedBody, { fileExistFn });

      if (quality.valid) {
        // Check dependencies
        let depsBlocked = false;
        for (const dep of quality.metadata.dependsOn) {
          const state = dependencyStates instanceof Map ? dependencyStates.get(dep) : dependencyStates[dep];
          const decision = dependencyBlocks(dep, state);
          if (decision.blocked) {
            depsBlocked = true;
            break;
          }
        }

        if (!depsBlocked) {
          return {
            promoted: true,
            issueNumber: targetIssue.number,
            updatedBody,
            targetIssue
          };
        }
      }
    }

    // Stop searching once we encounter the first uncompleted issue
    break;
  }

  return null;
}

export function dependencyBlocks(number, state) {
  if (!state) return { blocked: true, reason: 'Dependency #' + number + ' could not be resolved.' };
  if (state.type === 'pull_request') {
    return state.merged
      ? { blocked: false }
      : { blocked: true, reason: 'Dependency PR #' + number + ' is not merged.' };
  }
  if (state.state === 'open') {
    return { blocked: true, reason: 'Dependency Issue #' + number + ' is still open.' };
  }
  if (state.state === 'closed' && state.stateReason !== 'completed') {
    return { blocked: true, reason: 'Dependency Issue #' + number + ' was closed without completed state (reason: ' + (state.stateReason || 'unknown') + ').' };
  }
  return { blocked: false };
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

  const roadmapSequence = options.roadmapSequence || (options.roadmapContent ? parseRoadmapSequence(options.roadmapContent) : []);

  let selectedCandidate = null;

  if (roadmapSequence.length > 0) {
    for (const seq of roadmapSequence) {
      if (seq.issueNumber !== null) {
        // Check state of sequence issue
        const depState = dependencyStates instanceof Map
          ? dependencyStates.get(seq.issueNumber)
          : dependencyStates[seq.issueNumber];

        const isClosedInDepStates = depState && (
          (depState.type === 'issue' && depState.state === 'closed') ||
          (depState.type === 'pull_request' && depState.merged)
        );

        const isOpenInIssues = issues.some(i => i && i.number === seq.issueNumber && i.state === 'open' && !i.pull_request);
        const isOpenInDepStates = depState && depState.state === 'open';

        // Check if sequence item is complete using verified terminal state
        if (isSequenceItemComplete(seq, issues, dependencyStates, options)) {
          continue; // Move to next item in sequence
        }

        // If it's open or in issues list, test if it is dispatchable
        const candidate = candidates.find(c => c.issue.number === seq.issueNumber);
        if (candidate) {
          const existingPr = findOpenImplementationPr(candidate.issue.number, prs);
          if (existingPr) {
            rejected.push({
              issueNumber: candidate.issue.number,
              reason: 'Open implementation PR #' + existingPr.number + ' already exists.'
            });
            break;
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
          } else {
            break;
          }
        } else {
          // Open issue in sequence is NOT a valid ready candidate
          break;
        }
      } else {
        // Non-issue named checkpoint
        const isComplete = /complete|completed|done|passed/i.test(seq.currentState || '');
        if (isComplete) {
          continue;
        } else {
          break;
        }
      }
    }

    if (selectedCandidate) {
      for (const candidate of candidates) {
        if (candidate.issue.number !== selectedCandidate.issue.number) {
          if (!rejected.some(r => r.issueNumber === candidate.issue.number)) {
            rejected.push({
              issueNumber: candidate.issue.number,
              reason: `Skipped by roadmap sequence selection (selected #${selectedCandidate.issue.number}).`
            });
          }
        }
      }
    } else {
      for (const candidate of candidates) {
        if (!rejected.some(r => r.issueNumber === candidate.issue.number)) {
          rejected.push({
            issueNumber: candidate.issue.number,
            reason: 'Blocked by earlier incomplete roadmap sequence item or checkpoint.'
          });
        }
      }
    }
  } else {
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

export function formatDirectoryListing(path, items, maxItems = 50) {
  if (!Array.isArray(items)) {
    throw new Error('Invalid directory listing for ' + path);
  }
  const sorted = [...items].sort((a, b) => (a.name || a.path || '').localeCompare(b.name || b.path || ''));
  const count = sorted.length;
  const sliced = sorted.slice(0, maxItems);
  const lines = sliced.map(entry => {
    const typeLabel = entry.type === 'dir' ? '[DIR]' : '[FILE]';
    const name = entry.name || entry.path || 'unknown';
    const sizeLabel = entry.type === 'file' && typeof entry.size === 'number' ? ' (' + entry.size + ' bytes)' : '';
    return '- ' + typeLabel + ' ' + name + sizeLabel;
  });

  let result = 'Directory listing for ' + path + ' (' + count + ' item' + (count === 1 ? '' : 's') + '):\n' + lines.join('\n');
  if (count > maxItems) {
    result += '\n... and ' + (count - maxItems) + ' more entries (truncated).';
  }
  return result;
}

async function file(path) {
  const item = await github('contents/' + path + '?ref=main');
  if (Array.isArray(item)) {
    return formatDirectoryListing(path, item);
  }
  if (item && typeof item.content === 'string') {
    return Buffer.from(item.content, 'base64').toString('utf8');
  }
  throw new Error('GitHub API contents/' + path + ' response did not contain content or directory items.');
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
      result.set(number, { type: 'issue', state: issue.state, stateReason: issue.state_reason });
    }
  }
  return result;
}

async function main() {
  const REPO = process.env.GITHUB_REPOSITORY;
  const TOKEN = process.env.GITHUB_TOKEN;
  if (!REPO || !TOKEN) throw new Error('GITHUB_REPOSITORY and GITHUB_TOKEN are required.');

  const results = await Promise.all([
    github('issues?state=all&per_page=100'),
    github('pulls?state=all&base=main&per_page=100'),
    fileOrNull('ROADMAP.md')
  ]);
  const issues = results[0];
  const prs = results[1];
  const roadmapContent = results[2];

  const candidateEntries = issues
    .filter(issue => !issue.pull_request)
    .map(issue => ({
      issue,
      validation: validateIssueQualityGate(issue.body || '')
    }))
    .filter(entry => entry.validation.valid);

  const roadmapSequence = parseRoadmapSequence(roadmapContent);
  const sequenceIssueNumbers = roadmapSequence.map(s => s.issueNumber).filter(Boolean);

  const dependencyNumbers = [...new Set([
    ...candidateEntries.flatMap(entry => entry.validation.metadata.dependsOn),
    ...sequenceIssueNumbers
  ])];
  const dependencyStates = await dependencies(dependencyNumbers);

  // Check for automatic readiness handoff if the current candidate is not ready but eligible for promotion.
  // CRITICAL SAFETY RULE: The selector is read-only during dry-run. Do NOT mutate GitHub state unless confirmation is DISPATCH or ALLOW_READINESS_MUTATION === 'true'.
  const allowMutation = process.env.ALLOW_READINESS_MUTATION === 'true' || process.env.JULES_DISPATCH_CONFIRMATION === 'DISPATCH';
  const promotion = advanceNextCuratedIssueReadiness(issues, roadmapSequence, dependencyStates, { openPullRequests: prs });

  if (promotion && promotion.promoted) {
    if (allowMutation) {
      console.error(`Automatic readiness handoff: Promoting Issue #${promotion.issueNumber} to status: ready ...`);
      const patchResponse = await fetch('https://api.github.com/repos/' + REPO + '/issues/' + promotion.issueNumber, {
        method: 'PATCH',
        headers: {
          Authorization: 'Bearer ' + TOKEN,
          Accept: 'application/vnd.github+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: promotion.updatedBody })
      });
      if (!patchResponse.ok) {
        const errorText = await patchResponse.text();
        throw new Error(`Automatic readiness handoff failed: GitHub API returned ${patchResponse.status} ${errorText}`);
      }
      console.error(`Successfully promoted Issue #${promotion.issueNumber} to status: ready.`);
      promotion.targetIssue.body = promotion.updatedBody;
    } else {
      console.error(`[Dry-run] Automatic readiness handoff eligible: Issue #${promotion.issueNumber} would be promoted to status: ready (mutation skipped in dry-run mode).`);
    }
  }

  const decision = selectDispatchableIssue(issues, {
    openPullRequests: prs,
    dependencyStates,
    roadmapSequence
  });

  // If discovery is triggered, persist the discovery report issue.
  // Fail closed: if persistence fails, allow error to throw.
  let persistedDiscoveryIssue = null;
  if (decision.discovery?.triggered && decision.discovery?.audit?.discoveryIssue) {
    console.error('Low ready work detected (readyIssues <= 2). Persisting Discovery Report Issue ...');
    persistedDiscoveryIssue = await persistDiscoveryReportIssue(
      decision.discovery.audit.discoveryIssue,
      TOKEN,
      REPO
    );
    console.error(`Persisted Discovery Report Issue #${persistedDiscoveryIssue.number}`);
  }

  if (!decision.selected) {
    setOutput('dispatch', false);

    console.log(JSON.stringify({
      dispatch: false,
      dispatchable: false,
      reason: 'No dispatchable Issue satisfies the Issue-first contract.',
      rejected: decision.rejected,
      discovery: decision.discovery,
      persistedDiscoveryIssue
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
    discovery: decision.discovery,
    persistedDiscoveryIssue
  }, null, 2));
}

const direct = process.argv[1]
  && new URL(import.meta.url).pathname === new URL('file://' + process.argv[1]).pathname;

if (direct) {
  try {
    await main();
  } catch (error) {
    console.error(error);
    setOutput('dispatch', false);
    process.exit(1);
  }
}
