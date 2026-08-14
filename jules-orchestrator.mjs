#!/usr/bin/env node
/**
 * Jules Queue Orchestrator
 *
 * Runs on a schedule (see .github/workflows/jules-orchestrator.yml — the "heartbeat").
 * Ties Jules sessions to ROADMAP.md's "## Now" checklist so the queue advances itself.
 *
 * Flow each run:
 * 1. Load state (.github/jules-queue-state.json).
 * 2. If a session is already active:
 *      - Ask the Jules API for its current outputs.
 *      - No PR yet -> stop, nothing to do this run.
 *      - PR open but not merged -> stop. This is the human review gate (AGENT_RULES.md §1):
 *        the queue does not advance until you've actually merged the work.
 *      - PR merged -> clear the active session and fall through to dispatch the next task.
 * 3. If there's no active session:
 *      - Read ROADMAP.md, find the first unchecked "- [ ] ..." line under "## Now".
 *      - None left -> log "queue empty" and stop.
 *      - Otherwise, start a new Jules session with that task as the prompt.
 * 4. Commit the updated state file back to the repo if anything changed.
 *
 * Note: this script deliberately never edits ROADMAP.md's checkboxes itself. Checking a
 * task off is still a human/CI-verified action per AGENT_RULES.md — the orchestrator only
 * decides when to start the *next* Jules session.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const JULES_API_KEY = process.env.JULES_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY; // "owner/repo", set automatically by Actions
const JULES_SOURCE = process.env.JULES_SOURCE; // e.g. "sources/github/japiohopman/artificer"

const STATE_PATH = '.github/jules-queue-state.json';
const ROADMAP_PATH = 'ROADMAP.md';

for (const [name, val] of Object.entries({ JULES_API_KEY, GITHUB_TOKEN, REPO, JULES_SOURCE })) {
  if (!val) throw new Error(`${name} is not set`);
}

function loadState() {
  if (!existsSync(STATE_PATH)) return { activeSession: null };
  return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

async function julesFetch(path, options = {}) {
  const res = await fetch(`https://jules.googleapis.com/v1alpha/${path}`, {
    ...options,
    headers: {
      'X-Goog-Api-Key': JULES_API_KEY,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Jules API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function githubFetch(path) {
  const res = await fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API ${path} failed: ${res.status} ${await res.text()}`);
  return res.json();
}

function extractPrNumber(prUrl) {
  const match = prUrl.match(/\/pull\/(\d+)/);
  return match ? Number(match[1]) : null;
}

/** Finds the first unchecked "- [ ] ..." line under the "## Now" heading in ROADMAP.md. */
function getNextTask() {
  const roadmap = readFileSync(ROADMAP_PATH, 'utf8');
  const lines = roadmap.split('\n');
  let inNowSection = false;
  for (const line of lines) {
    if (/^##\s+Now\b/i.test(line)) { inNowSection = true; continue; }
    if (inNowSection && /^##\s+/.test(line)) break; // next section — stop
    if (inNowSection) {
      const match = line.match(/^- \[ \]\s*(.+)$/);
      if (match) return match[1].trim();
    }
  }
  return null;
}

async function main() {
  const state = loadState();
  let stateChanged = false;

  if (state.activeSession) {
    console.log(`Checking active session ${state.activeSession.name} ...`);
    const session = await julesFetch(state.activeSession.name);
    const prOutput = (session.outputs || []).find(o => o.pullRequest)?.pullRequest;

    if (!prOutput) {
      console.log('No PR yet. Nothing to do this run.');
      return;
    }

    const prNumber = extractPrNumber(prOutput.url);
    if (!prNumber) {
      console.log(`Could not parse a PR number from ${prOutput.url}. Skipping this run.`);
      return;
    }

    const pr = await githubFetch(`pulls/${prNumber}`);
    if (!pr.merged) {
      console.log(`PR #${prNumber} is open but not merged yet — waiting for review.`);
      return;
    }

    console.log(`PR #${prNumber} is merged. Clearing the active session.`);
    state.activeSession = null;
    stateChanged = true;
  }

  if (!state.activeSession) {
    const nextTask = getNextTask();
    if (!nextTask) {
      console.log('No unchecked items under "## Now" in ROADMAP.md — queue is empty.');
      if (stateChanged) saveState(state);
      return;
    }

    console.log(`Dispatching next task: ${nextTask}`);
    const prompt = [
      'Read AGENT.MD, AGENT_RULES.md, and ROADMAP.md before starting.',
      'Your task from the "Now" queue:',
      nextTask,
      "Follow AGENT_RULES.md strictly — especially: don't claim something works without running it, and stay inside the relevant module.",
    ].join('\n\n');

    const session = await julesFetch('sessions', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        sourceContext: { source: JULES_SOURCE, githubRepoContext: { startingBranch: 'main' } },
        automationMode: 'AUTO_CREATE_PR',
        title: nextTask.slice(0, 80),
      }),
    });

    state.activeSession = { name: session.name, task: nextTask, startedAt: new Date().toISOString() };
    stateChanged = true;
  }

  if (stateChanged) {
    saveState(state);
    execSync('git config user.name "jules-orchestrator[bot]"');
    execSync('git config user.email "jules-orchestrator@users.noreply.github.com"');
    execSync(`git add ${STATE_PATH}`);
    try {
      execSync('git commit -m "chore: update Jules queue state"');
      execSync('git push');
    } catch (e) {
      console.log('Nothing to commit, or push raced with another run:', e.message);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
