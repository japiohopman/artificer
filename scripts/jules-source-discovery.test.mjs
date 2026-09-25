import test from 'node:test';
import assert from 'node:assert/strict';
import { findMatchingSource, hasBranch } from './jules-source-discovery.mjs';

const source = {
  name: 'sources/github-japiohopman-artificer',
  githubRepo: {
    owner: 'japiohopman',
    repo: 'artificer',
    defaultBranch: { displayName: 'main' },
    branches: [{ displayName: 'main' }, { displayName: 'develop' }]
  }
};

test('finds the connected source for the exact GitHub repository', () => {
  assert.equal(findMatchingSource([source], 'japiohopman/artificer'), source);
  assert.equal(findMatchingSource([source], 'other/repo'), null);
});

test('source must expose the main branch', () => {
  assert.equal(hasBranch(source, 'main'), true);
  assert.equal(hasBranch({ githubRepo: { branches: [] } }, 'main'), false);
});
