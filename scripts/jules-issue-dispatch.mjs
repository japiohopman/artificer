#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

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

async function main() {
  const confirmation = process.env.JULES_DISPATCH_CONFIRMATION;
  const apiKey = process.env.JULES_API_KEY;
  const source = process.env.JULES_SOURCE;
  const payloadPath = process.env.JULES_SELECTOR_PAYLOAD;

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

  // The Jules API is the authoritative source for active-session reconciliation.
  // Do not persist dispatch state by pushing directly to protected main.
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
