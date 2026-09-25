#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

export function validateConfirmation(value) {
  return value === 'DISPATCH';
}

export function buildJulesSessionRequest(payload, source) {
  if (!payload?.dispatchable) {
    throw new Error('Selector payload is not dispatchable.');
  }
  if (!payload.issueNumber || !payload.prompt || !payload.sessionTitle) {
    throw new Error('Selector payload is incomplete.');
  }

  return {
    prompt: payload.prompt,
    title: payload.sessionTitle,
    sourceContext: {
      source,
      githubRepoContext: {
        startingBranch: 'main',
      },
    },
    automationMode: 'AUTO_CREATE_PR',
  };
}

export function buildActiveSessionState(payload, session) {
  if (!session?.name) {
    throw new Error('Jules response did not contain a session name.');
  }

  return {
    activeSession: {
      name: session.name,
      issueNumber: payload.issueNumber,
      task: payload.sessionTitle,
      specialist: payload.specialist,
      priority: payload.priority ?? null,
      startedAt: new Date().toISOString(),
    },
  };
}

export function persistSessionState(path, payload, session, write = writeFileSync) {
  const state = buildActiveSessionState(payload, session);
  write(path, JSON.stringify(state, null, 2) + '\n');
  return state;
}

function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;
  writeFileSync(output, `${name}=${String(value)}\n`, { flag: 'a' });
}

async function createSession(request, apiKey) {
  const response = await fetch('https://jules.googleapis.com/v1alpha/sessions', {
    method: 'POST',
    headers: {
      'X-Goog-Api-Key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Jules session creation failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function commitState(path) {
  execFileSync('git', ['config', 'user.name', 'jules-orchestrator[bot]']);
  execFileSync('git', ['config', 'user.email', 'jules-orchestrator@users.noreply.github.com']);
  execFileSync('git', ['add', path]);
  execFileSync('git', ['commit', '-m', 'chore(workflow): record Jules Issue dispatch']);
  execFileSync('git', ['push', 'origin', 'main']);
}

async function main() {
  const confirmation = process.env.JULES_DISPATCH_CONFIRMATION;
  const apiKey = process.env.JULES_API_KEY;
  const source = process.env.JULES_SOURCE;
  const payloadPath = process.env.JULES_SELECTOR_PAYLOAD;
  const statePath = '.github/jules-queue-state.json';

  if (!validateConfirmation(confirmation)) {
    throw new Error('Live dispatch requires the exact confirmation value DISPATCH.');
  }
  if (!apiKey || !source || !payloadPath) {
    throw new Error('JULES_API_KEY, JULES_SOURCE and JULES_SELECTOR_PAYLOAD are required.');
  }
  if (!existsSync(payloadPath)) {
    throw new Error(`Selector payload does not exist: ${payloadPath}`);
  }

  const payload = JSON.parse(readFileSync(payloadPath, 'utf8'));
  const request = buildJulesSessionRequest(payload, source);

  console.log(`Creating Jules session for Issue #${payload.issueNumber} ...`);
  const session = await createSession(request, apiKey);
  console.log(`Jules session created: ${session.name}`);

  persistSessionState(statePath, payload, session);

  try {
    commitState(statePath);
  } catch (error) {
    console.error('Jules session was created, but state persistence commit/push failed.');
    console.error(`Session: ${session.name}`);
    throw error;
  }

  setOutput('session_name', session.name);
  setOutput('issue_number', payload.issueNumber);
  setOutput('specialist', payload.specialist);
}

const direct = process.argv[1]
  && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (direct) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
