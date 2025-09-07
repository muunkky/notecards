#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { dirname } from 'node:path';

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

const write = process.argv.includes('--write');

function sh(cmd) {
  try { return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }); }
  catch (e) { return ''; }
}

function lastNonEmpty(file) {
  const revsRaw = sh(`git rev-list HEAD -- "${file}"`).trim();
  if (!revsRaw) return null;
  const revs = revsRaw.split(/\r?\n/);
  for (const r of revs) {
    const content = sh(`git show ${r}:"${file}"`);
    if (content && content.trim().length) {
      return { commit: r, content };
    }
  }
  return null;
}

let restored = 0;
let missingHistory = 0;

for (const f of files) {
  const exists = existsSync(f);
  const size = exists ? statSync(f).size : 0;
  const info = lastNonEmpty(f);
  if (!info) {
    console.log(`\n=== ${f} ===\ncurrentBytes=${size} lastNonEmpty=NONE`);
    missingHistory++;
    continue;
  }
  const lines = info.content.split(/\n/).length;
  const chars = info.content.length;
  console.log(`\n=== ${f} ===\ncurrentBytes=${size} lastNonEmptyCommit=${info.commit.substring(0,8)} lines=${lines} chars=${chars}`);
  if (write) {
    mkdirSync(dirname(f), { recursive: true });
    writeFileSync(f, info.content.replace(/\r\n/g, '\n'), 'utf8');
    restored++;
    console.log('RESTORED');
  } else {
    console.log('DRY-RUN (add --write to restore)');
  }
}

console.log(`\nSummary: candidates=${files.length} restored=${restored} missingHistory=${missingHistory} mode=${write ? 'WRITE' : 'DRY'}`);
if (!write) console.log('\nNext: rerun with --write to apply.');
