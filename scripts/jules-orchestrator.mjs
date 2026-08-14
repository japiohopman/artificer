#!/usr/bin/env node
/**
 * Jules Queue Orchestrator (v2)
 *
 * Runs on a schedule (see .github/workflows/jules-orchestrator.yml — the "heartbeat", disabled
 * by default until one full manual cycle has been verified — see JULES_ORCHESTRATOR_SETUP.md).
 *
 * Ties Jules sessions to ROADMAP.md's "## Now" section, which is structured as:
 *
 *   ## Now
 *   ### Active
 *   - [ ] <task currently being worked by Jules — at most one at a time>
 *   ### Ready
 *   - [ ] <task the orchestrator is allowed to dispatch next>
 *   ### Blocked
 *   - [ ] <task waiting on a human decision — never dispatched>
 *   ### Human Review
 *   - [ ] <task that needs discussion before it's safe to hand to Jules — never dispatched>
 *
 * Flow each run:
 * 1. Load state (.github/jules-queue-state.json).
 * 2. If a session is already active:
 *      - No PR yet -> stop, nothing to do.
 *      - PR open but not merged -> stop. Human review gate #1.
 *      - PR merged BUT the task's line under "### Active" in ROADMAP.md is still "- [ ]"
 *        -> stop. Human review gate #2 — a merge alone is not "done"; you (or CI) confirm
 *        it actually works by checking the box yourself.
 *      - PR merged AND the line is now "- [x]" -> the task is confirmed done. Remove the
 *        line from "### Active", clear the active session, fall through to dispatch next.
 * 3. If there's no active session:
 *      - Take the first "- [ ] ..." line under "### Ready".
 *      - None -> log "queue empty (or everything is Blocked/Human Review)" and stop.
 *      - Otherwise: move that line from "### Ready" to "### Active", start a new Jules
 *        session for it, and record it in state.
 * 4. Commit ROADMAP.md (if the task moved) and the state file together.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const JULES_API_KEY = process.env.JULES_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.GITHUB_REPOSITORY;
const JULES_SOURCE = process.env.JULES_SOURCE;

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

/** Parses ROADMAP.md into its "## Now" subsections, keyed by heading name. */
function parseNowSections(text) {
  const lines = text.split('\n');
  const sections = { Active: [], Ready: [], Blocked: [], 'Human Review': [] };
  let inNow = false;
  let current = null;
  const sectionLineRanges = {}; // name -> { start, end } line indices (inclusive), for editing

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^##\s+Now\b/i.test(line)) { inNow = true; continue; }
    if (inNow && /^##\s+[^#]/.test(line)) break; // next top-level section — stop
    if (!inNow) continue;

    const h3 = line.match(/^###\s+(Active|Ready|Blocked|Human Review)\s*$/i);
    if (h3) {
      current = Object.keys(sections).find(k => k.toLowerCase() === h3[1].toLowerCase());
      if (sectionLineRanges[current]) sectionLineRanges[current].end = i;
      sectionLineRanges[current] = { headingLine: i, start: i + 1, end: lines.length };
      continue;
    }
    if (current) {
      const task = line.match(/^- \[( |x)\]\s*(.+)$/i);
      if (task) sections[current].push({ line: i, checked: task[1].toLowerCase() === 'x', text: task[2].trim() });
    }
  }
  return { lines, sections, sectionLineRanges };
}

function findActiveLineStatus(roadmapText, taskText) {
  const { sections } = parseNowSections(roadmapText);
  return sections.Active.find(t => t.text === taskText) || null;
}

/** Moves a task line from Ready to the end of Active. Returns the updated file text. */
function moveTaskToActive(roadmapText, taskText) {
  const { lines, sections, sectionLineRanges } = parseNowSections(roadmapText);
  const readyEntry = sections.Ready.find(t => t.text === taskText);
  if (!readyEntry) throw new Error(`Could not find "${taskText}" under ### Ready`);

  const newLines = lines.slice();
  newLines.splice(readyEntry.line, 1); // remove from Ready
  const activeHeadingLine = sectionLineRanges.Active.headingLine;
  // Insert right after the "### Active" heading (index shifts by -1 if Ready was above Active,
  // but Active is defined before Ready in the template, so no shift needed here).
  newLines.splice(activeHeadingLine + 1, 0, `- [ ] ${taskText}`);
  return newLines.join('\n');
}

/** Removes a (now-confirmed-done) task line from Active entirely. */
function removeTaskFromActive(roadmapText, taskText) {
  const { lines, sections } = parseNowSections(roadmapText);
  const entry = sections.Active.find(t => t.text === taskText);
  if (!entry) return roadmapText;
  const newLines = lines.slice();
  newLines.splice(entry.line, 1);
  return newLines.join('\n');
}

async function main() {
  const state = loadState();
  let roadmapText = readFileSync(ROADMAP_PATH, 'utf8');
  let roadmapChanged = false;
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
    if (!prNumber) { console.log(`Could not parse PR number from ${prOutput.url}.`); return; }

    const pr = await githubFetch(`pulls/${prNumber}`);
    if (!pr.merged) {
      console.log(`PR #${prNumber} is open but not merged yet — waiting for review (gate 1).`);
      return;
    }

    const activeLine = findActiveLineStatus(roadmapText, state.activeSession.task);
    if (!activeLine || !activeLine.checked) {
      console.log(
        `PR #${prNumber} is merged, but "${state.activeSession.task}" is not yet checked ` +
        `off under ### Active in ROADMAP.md — waiting for manual confirmation (gate 2).`
      );
      return;
    }

    console.log(`"${state.activeSession.task}" is merged AND confirmed done. Advancing the queue.`);
    roadmapText = removeTaskFromActive(roadmapText, state.activeSession.task);
    roadmapChanged = true;
    state.activeSession = null;
    stateChanged = true;
  }

  if (!state.activeSession) {
    const { sections } = parseNowSections(roadmapText);
    const next = sections.Ready.find(t => !t.checked);
    if (!next) {
      console.log('Nothing in ### Ready to dispatch (queue empty, or everything is Blocked / Human Review).');
      if (roadmapChanged || stateChanged) {
        writeFileSync(ROADMAP_PATH, roadmapText);
        saveState(state);
        commitAndPush();
      }
      return;
    }

    console.log(`Dispatching next task: ${next.text}`);
    roadmapText = moveTaskToActive(roadmapText, next.text);
    roadmapChanged = true;

    const prompt = [
      'Read AGENT.MD, AGENT_RULES.md, and ROADMAP.md before starting.',
      'Your task from the "### Ready" queue (now moved to "### Active"):',
      next.text,
      "Follow AGENT_RULES.md strictly — especially: don't claim something works without running it, and stay inside the relevant module.",
    ].join('\n\n');

    const session = await julesFetch('sessions', {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        sourceContext: { source: JULES_SOURCE, githubRepoContext: { startingBranch: 'main' } },
        automationMode: 'AUTO_CREATE_PR',
        title: next.text.slice(0, 80),
      }),
    });

    state.activeSession = { name: session.name, task: next.text, startedAt: new Date().toISOString() };
    stateChanged = true;
  }

  if (roadmapChanged) writeFileSync(ROADMAP_PATH, roadmapText);
  if (roadmapChanged || stateChanged) {
    saveState(state);
    commitAndPush();
  }
}

function commitAndPush() {
  execSync('git config user.name "jules-orchestrator[bot]"');
  execSync('git config user.email "jules-orchestrator@users.noreply.github.com"');
  execSync(`git add ${STATE_PATH} ${ROADMAP_PATH}`);
  try {
    execSync('git commit -m "chore: advance Jules queue"');
    execSync('git push');
  } catch (e) {
    console.log('Nothing to commit, or push raced with another run:', e.message);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
