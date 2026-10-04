#!/usr/bin/env node

export const RELAY_LABEL = 'chatgpt-review';
export const RELAY_MARKER = '<!-- chatgpt-review-relay -->';

export function findGoverningIssue(text) {
  const match = String(text || '').match(/(?:Closes|Fixes|Resolves|Refs|Part of)\s+#(\d+)\b/i);
  return match ? Number(match[1]) : null;
}

export function isEligiblePullRequest(pr, repository) {
  if (!pr || pr.state !== 'open' || pr.draft) return false;
  if (pr.base?.ref !== 'main') return false;
  if (!pr.head?.ref?.startsWith('jules-')) return false;
  if (pr.head?.repo?.full_name && repository && pr.head.repo.full_name !== repository) return false;
  return findGoverningIssue(pr.body || '') !== null;
}

export function summarizeCheckRuns(checkRuns = []) {
  const runs = Array.isArray(checkRuns) ? checkRuns : [];
  if (!runs.length) return { state: 'no-checks', pending: [], failing: [], passing: [] };
  const pending = runs.filter(run => ['queued', 'in_progress', 'waiting', 'requested', 'pending'].includes(run.status));
  const failing = runs.filter(run => run.status === 'completed' && !['success', 'neutral', 'skipped'].includes(run.conclusion));
  const passing = runs.filter(run => run.status === 'completed' && ['success', 'neutral', 'skipped'].includes(run.conclusion));
  return {
    state: failing.length ? 'failing' : pending.length ? 'pending' : 'passing',
    pending: pending.map(run => run.name).sort(),
    failing: failing.map(run => run.name).sort(),
    passing: passing.map(run => run.name).sort()
  };
}

export function formatClosedRelayComment(pr) {
  return [
    RELAY_MARKER,
    '## ChatGPT PR Review Relay',
    '',
    'PR #' + pr.number + ' is closed' + (pr.merged ? ' and merged' : '') + '.',
    '',
    'The active ChatGPT review queue entry has been cleared.'
  ].join('\\n');
}

export function formatRelayComment(pr, checks, phaseSafety) {
  const issue = findGoverningIssue(pr.body || '');
  const checkSummary = summarizeCheckRuns(checks);
  const phaseSummary = summarizeCheckRuns(phaseSafety);
  const list = items => items.length ? items.map(name => '- ' + name).join('\n') : '- none';
  return [
    RELAY_MARKER,
    '## ChatGPT PR Review Relay',
    '',
    'This comment is an **automated review-queue signal**, not an approval or review result.',
    '',
    '- PR: #' + pr.number + ' — ' + pr.title,
    '- Branch: `' + pr.head.ref + '`',
    '- HEAD: `' + pr.head.sha + '`',
    '- Governing Issue: #' + issue,
    '- State: ' + pr.state + (pr.draft ? ' (draft)' : ''),
    '- CI/checks: **' + checkSummary.state + '**',
    '- Phase Safety Gate: **' + phaseSummary.state + '**',
    '',
    '### Pending checks',
    list(checkSummary.pending),
    '',
    '### Failing checks',
    list(checkSummary.failing),
    '',
    '### Next step',
    'ChatGPT should inspect the PR, governing Issue, changed files, workflow evidence, and review history before giving a review verdict.'
  ].join('\n');
}

async function github(repository, token, path, options = {}) {
  const response = await fetch('https://api.github.com/repos/' + repository + '/' + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {})
    }
  });
  if (!response.ok) throw new Error('GitHub API ' + path + ' failed: ' + response.status + ' ' + await response.text());
  if (response.status === 204) return null;
  return response.json();
}

async function ensureLabel(repository, token) {
  try {
    await github(repository, token, 'labels/' + encodeURIComponent(RELAY_LABEL));
  } catch (error) {
    if (!String(error).includes(' 404 ')) throw error;
    await github(repository, token, 'labels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: RELAY_LABEL, description: 'PR is queued for ChatGPT architecture/review inspection', color: '5319e7' })
    });
  }
}

async function setLabel(repository, token, issueNumber, active) {
  try {
    if (active) {
      await ensureLabel(repository, token);
      await github(repository, token, 'issues/' + issueNumber + '/labels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: [RELAY_LABEL] })
      });
      return;
    }
    await github(repository, token, 'issues/' + issueNumber + '/labels/' + encodeURIComponent(RELAY_LABEL), { method: 'DELETE' });
  } catch (error) {
    console.warn('Relay label operation warning (non-fatal):', error.message || error);
  }
}

async function upsertRelayComment(repository, token, prNumber, body) {
  const comments = await github(repository, token, 'issues/' + prNumber + '/comments?per_page=100');
  const existing = comments.find(comment => String(comment.body || '').includes(RELAY_MARKER));
  if (existing) {
    return github(repository, token, 'issues/comments/' + existing.id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body })
    });
  }
  return github(repository, token, 'issues/' + prNumber + '/comments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body })
  });
}

async function main() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!repository || !token || !eventPath) throw new Error('GITHUB_REPOSITORY, GITHUB_TOKEN and GITHUB_EVENT_PATH are required.');
  const fs = await import('node:fs/promises');
  const event = JSON.parse(await fs.readFile(eventPath, 'utf8'));
  const pr = event.pull_request;
  if (!pr) throw new Error('Review relay requires a pull_request event.');

  if (event.action === 'closed') {
    await setLabel(repository, token, pr.number, false);
    const comments = await github(repository, token, 'issues/' + pr.number + '/comments?per_page=100');
    const existing = comments.find(comment => String(comment.body || '').includes(RELAY_MARKER));
    if (existing) {
      await github(repository, token, 'issues/comments/' + existing.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: [
            RELAY_MARKER,
            '## ChatGPT PR Review Relay',
            '',
            'PR #' + pr.number + ' is closed' + (pr.merged ? ' and merged' : '') + '.',
            '',
            'The active ChatGPT review queue entry has been cleared.'
          ].join('\n')
        })
      });
    }
    return;
  }

  if (!isEligiblePullRequest(pr, repository)) {
    console.log('PR is not eligible for the ChatGPT review relay; no mutation performed.');
    return;
  }

  const checksResponse = await github(repository, token, 'commits/' + pr.head.sha + '/check-runs?per_page=100');
  const checks = checksResponse.check_runs || [];
  const phaseSafety = checks.filter(run => /phase|safety/i.test(run.name || ''));
  await setLabel(repository, token, pr.number, true);
  await upsertRelayComment(repository, token, pr.number, formatRelayComment(pr, checks, phaseSafety));
}

if (process.argv[1] && new URL(import.meta.url).pathname === new URL('file://' + process.argv[1]).pathname) {
  try { await main(); } catch (error) { console.error(error); process.exit(1); }
}
