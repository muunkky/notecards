Param(
  [switch]$Write
)

$ErrorActionPreference = 'Stop'

$files = @(
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
)

function Find-LastNonEmptyCommit($path) {
  $commits = git rev-list HEAD -- $path 2>$null
  foreach ($c in $commits) {
  $blob = git show "${c}:$path" 2>$null
    if (-not [string]::IsNullOrWhiteSpace($blob)) {
      return [pscustomobject]@{ Commit=$c; Content=$blob }
    }
  }
  return $null
}

foreach ($f in $files) {
  Write-Host "`n=== $f ===" -ForegroundColor Cyan
  if (-not (Test-Path $f)) { Write-Host 'File missing in working tree (creating)' -ForegroundColor Yellow }
  $currentSize = if (Test-Path $f) { (Get-Item $f).Length } else { 0 }
  Write-Host "Current bytes: $currentSize"
  $info = Find-LastNonEmptyCommit $f
  if (-not $info) {
    Write-Host 'No non-empty commit found (file may have always been empty)' -ForegroundColor Red
    continue
  }
  $short = $info.Commit.Substring(0,8)
  $lines = ($info.Content -split "`n").Length
  $chars = $info.Content.Length
  Write-Host "Last non-empty commit: $short lines=$lines chars=$chars"
  if ($Write) {
    $dir = Split-Path $f -Parent
    if ($dir -and -not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }
    # Preserve original newline endings as LF; Set-Content will use default. Use Out-File with -NoNewline then add newline if original ended with one
    $endsWithNewline = $info.Content.EndsWith("`n")
    $normalized = $info.Content -replace "`r`n","`n"
    Set-Content -Path $f -Value $normalized -Encoding UTF8
    if (-not $endsWithNewline) { Add-Content -Path $f -Value '' }
    Write-Host 'Restored content to working tree.' -ForegroundColor Green
  } else {
    Write-Host 'Dry run (use -Write to restore).'
  }
}

if ($Write) {
  Write-Host "`nAll restorations attempted. Review 'git diff' then commit if correct." -ForegroundColor Green
} else {
  Write-Host "`nDry run complete. Re-run with -Write to apply restorations." -ForegroundColor Yellow
}
