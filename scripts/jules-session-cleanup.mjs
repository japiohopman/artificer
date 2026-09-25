#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

export const DELETE_CONFIRMATION = 'DELETE_STALE_SESSIONS';
export const SESSION_PATTERN = /^sessions\/\d+$/;

export function validateConfirmation(value) {
  return value === DELETE_CONFIRMATION;
}

export function parseSessionNames(value) {
  const names = String(value || '')
    .split(/[\s,]+/)
    .map(item => item.trim())
    .filter(Boolean);

  const unique = [...new Set(names)];
  const invalid = unique.filter(name => !SESSION_PATTERN.test(name));

  if (invalid.length > 0) {
    throw new Error(
      'Invalid Jules session name(s): ' + invalid.join(', ') +
      '. Expected names such as sessions/123456789.',
    );
  }

  if (unique.length === 0) {
    throw new Error('At least one explicit Jules session name is required.');
  }

  return unique;
}

function extractPrNumber(url) {
  const match = String(url || '').match(/\/pull\/(\d+)/);
  return match ? Number(match[1]) : null;
}

export function findSessionPullRequest(session) {
  const output = (session?.outputs || []).find(entry => entry?.pullRequest?.url);
  if (!output?.pullRequest?.url) return null;

  return {
    url: output.pullRequest.url,
    number: extractPrNumber(output.pullRequest.url),
    title: output.pullRequest.title || null,
  };
}

export function isSessionForRepository(session, source) {
  return Boolean(
    session?.sourceContext?.source === source
      || session?.source?.name === source
      || session?.source === source,
  );
}

export function validateCleanupTarget({ session, source, pullRequest }) {
  if (!session) {
    return { safe: false, reason: 'Session could not be retrieved.' };
  }

  if (!isSessionForRepository(session, source)) {
    return { safe: false, reason: 'Session belongs to a different Jules source/repository.' };
  }

  if (session.state !== 'PAUSED') {
    return {
      safe: false,
      reason: 'Only PAUSED sessions can be removed by this cleanup.',
    };
  }

  if (pullRequest?.state === 'open' && !pullRequest.merged) {
    return {
      safe: false,
      reason: 'Associated PR is still open; refusing to remove the session.',
    };
  }

  return {
    safe: true,
    reason: pullRequest?.number
      ? `Paused session is associated with terminal PR #${pullRequest.number}.`
      : 'Paused session has no associated PR output.',
  };
}

async function julesFetch(path, apiKey, options = {}) {
  const response = await fetch(`https://jules.googleapis.com/v1alpha/${path}`, {
    ...options,
    headers: {
      'X-Goog-Api-Key': apiKey,
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Jules API ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.status === 204 ? null : response.json();
}

async function githubFetch(path, token, repository) {
  const response = await fetch(`https://api.github.com/repos/${repository}/${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `GitHub API ${path} failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
}

function setOutput(name, value) {
  if (!process.env.GITHUB_OUTPUT) return;
  writeFileSync(process.env.GITHUB_OUTPUT, `${name}=${String(value)}\n`, { flag: 'a' });
}

async function inspectTarget(name, { apiKey, token, repository, source }) {
  const session = await julesFetch(name, apiKey);
  if (!session) {
    return {
      name,
      session: null,
      pullRequest: null,
      decision: { safe: false, reason: 'Session was not found.' },
    };
  }

  const sessionPr = findSessionPullRequest(session);
  const pullRequest = sessionPr?.number
    ? await githubFetch(`pulls/${sessionPr.number}`, token, repository)
    : null;

  return {
    name,
    session,
    pullRequest,
    decision: validateCleanupTarget({
      session,
      source,
      pullRequest,
    }),
  };
}

export async function planCleanup(sessionNames, dependencies) {
  const inspected = [];

  for (const name of sessionNames) {
    inspected.push(await inspectTarget(name, dependencies));
  }

  const unsafe = inspected.filter(item => !item.decision.safe);
  return {
    inspected,
    safe: unsafe.length === 0,
    unsafe,
  };
}

async function deleteSession(name, apiKey) {
  await julesFetch(name, apiKey, {
    method: 'DELETE',
  });
}

async function main() {
  const apiKey = process.env.JULES_API_KEY;
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const source = process.env.JULES_SOURCE;
  const confirmation = process.env.JULES_CLEANUP_CONFIRMATION;

  if (!apiKey || !token || !repository || !source) {
    throw new Error(
      'JULES_API_KEY, GITHUB_TOKEN, GITHUB_REPOSITORY and JULES_SOURCE are required.',
    );
  }

  if (!validateConfirmation(confirmation)) {
    throw new Error(
      `Cleanup requires the exact confirmation value ${DELETE_CONFIRMATION}.`,
    );
  }

  const sessionNames = parseSessionNames(process.env.JULES_SESSION_NAMES);
  const plan = await planCleanup(sessionNames, {
    apiKey,
    token,
    repository,
    source,
  });

  console.log('Jules stale-session cleanup plan:');
  for (const item of plan.inspected) {
    const pr = item.pullRequest ? `PR #${item.pullRequest.number}` : 'no PR';
    console.log(
      `- ${item.name}: state=${item.session?.state || 'missing'}, ${pr}, safe=${item.decision.safe}, reason=${item.decision.reason}`,
    );
  }

  if (!plan.safe) {
    throw new Error(
      'Cleanup aborted before any deletion because one or more targets are unsafe.',
    );
  }

  for (const item of plan.inspected) {
    console.log(`Deleting Jules session ${item.name} ...`);
    await deleteSession(item.name, apiKey);
    console.log(`Deleted Jules session ${item.name}.`);
  }

  setOutput('deleted_count', plan.inspected.length);
}

const direct = process.argv[1]
  && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (direct) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
