#!/usr/bin/env node

import { writeFileSync } from 'node:fs';

export function findMatchingSource(sources, repository) {
  return (sources || []).find(source => {
    const githubRepo = source?.githubRepo;
    return githubRepo
      && `${githubRepo.owner}/${githubRepo.repo}` === repository;
  }) || null;
}

export function hasBranch(source, branchName) {
  return Boolean(source?.githubRepo?.branches?.some(branch => branch?.displayName === branchName));
}

function setOutput(name, value) {
  const output = process.env.GITHUB_OUTPUT;
  if (!output) return;
  writeFileSync(output, `${name}=${String(value)}\n`, { flag: 'a' });
}

async function main() {
  const apiKey = process.env.JULES_API_KEY;
  const repository = process.env.GITHUB_REPOSITORY;
  if (!apiKey || !repository) {
    throw new Error('JULES_API_KEY and GITHUB_REPOSITORY are required.');
  }

  const response = await fetch('https://jules.googleapis.com/v1alpha/sources?pageSize=100', {
    headers: {
      'X-Goog-Api-Key': apiKey,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Jules sources API failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const source = findMatchingSource(payload.sources, repository);

  if (!source) {
    throw new Error(`No Jules source is connected for ${repository}.`);
  }

  if (!hasBranch(source, 'main')) {
    throw new Error(`Jules source ${source.name} does not expose the main branch.`);
  }

  setOutput('source', source.name);
  setOutput('default_branch', source.githubRepo?.defaultBranch?.displayName || '');
  console.log(`Resolved Jules source ${source.name} for ${repository}.`);
}

const direct = process.argv[1]
  && new URL(import.meta.url).pathname === new URL(`file://${process.argv[1]}`).pathname;

if (direct) {
  main().catch(error => {
    console.error(error);
    process.exit(1);
  });
}
