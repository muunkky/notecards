#!/usr/bin/env node
import { execSync } from 'node:child_process';

const files = [
  'src/test/hooks/useCardOperations-archive.test.ts',
  'src/test/hooks/useCardOperations-duplicate-placement.test.ts',
  'src/test/hooks/useCardOperations-duplicate.test.ts',
  'src/test/hooks/useCardOperations-favorite.test.ts',
  'src/test/features/auth/LoginScreen.test.tsx',
  'src/test/features/cards/CardScreen-archive.test.tsx',
  'src/test/features/cards/CardScreen-duplicate.test.tsx',
  'src/test/features/cards/CardScreen-favorite.test.tsx',
  'src/test/features/cards/CardScreen-filters-persistence.test.tsx',
  'src/test/features/cards/CardScreen-filters.test.tsx',
  'src/test/features/cards/CardScreen-shuffle-collapse-snapshots.test.tsx',
  'src/test/features/cards/CardScreen-snapshots-manage.test.tsx',
  'src/test/features/cards/CardScreen-snapshots-selection.test.tsx',
  'src/test/features/decks/DeckScreen-permission.test.tsx',
  'src/test/features/decks/DeckScreen-user-menu.test.tsx'
];

function sh(cmd) {
  try { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }); }
  catch { return ''; }
}

const results = [];
for (const f of files) {
  const revList = sh(`git rev-list HEAD -- "${f}"`).trim();
  if (!revList) {
    results.push({ file: f, totalCommits: 0, firstNonEmpty: null });
    continue;
  }
  const revs = revList.split(/\n/);
  let found = null;
  for (const r of revs) {
    const content = sh(`git show ${r}:"${f}"`);
    if (content && content.trim().length) { found = { commit: r, chars: content.length, lines: content.split(/\n/).length }; break; }
  }
  results.push({ file: f, totalCommits: revs.length, firstNonEmpty: found });
}

for (const r of results) {
  if (r.firstNonEmpty) {
    console.log(`${r.file} FIRST_NON_EMPTY ${r.firstNonEmpty.commit.slice(0,8)} chars=${r.firstNonEmpty.chars} lines=${r.firstNonEmpty.lines} (examined ${r.totalCommits} commits)`);
  } else {
    console.log(`${r.file} ALL_COMMITS_EMPTY (examined ${r.totalCommits} commits)`);
  }
}

// Also emit machine-readable JSON summary
console.log('\nJSON_SUMMARY_START');
console.log(JSON.stringify(results, null, 2));
console.log('JSON_SUMMARY_END');
