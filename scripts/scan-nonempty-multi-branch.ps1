Param(
  [string[]]$Branches = @('origin/main','origin/feature/manual-card-reordering-world-class','origin/feature/user-logout-functionality')
)

$ErrorActionPreference = 'Stop'

$Files = @(
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

Write-Host "Scanning branches: $($Branches -join ', ')" -ForegroundColor Cyan

$results = @()
foreach ($b in $Branches) {
  foreach ($f in $Files) {
    $revList = git rev-list $b -- $f 2>$null
    if (-not $revList) {
      $results += [pscustomobject]@{ Branch=$b; File=$f; Status='NO_COMMITS'; Commit=$null; Chars=0; Lines=0 }
      continue
    }
    $found = $null
    foreach ($r in ($revList -split "`n")) {
      $blob = git show "${r}:$f" 2>$null
      if ($blob -and $blob.Trim().Length) {
        $found = [pscustomobject]@{ Branch=$b; File=$f; Status='FIRST_NON_EMPTY'; Commit=$r; Chars=$blob.Length; Lines=($blob -split "`n").Length }
        break
      }
    }
    if (-not $found) {
      $results += [pscustomobject]@{ Branch=$b; File=$f; Status='ALL_EMPTY'; Commit=$null; Chars=0; Lines=0 }
    } else {
      $results += $found
    }
  }
}

# Human readable
foreach ($r in $results) {
  if ($r.Status -eq 'FIRST_NON_EMPTY') {
    Write-Host ("$($r.Branch) :: $($r.File) :: $($r.Status) commit=" + $r.Commit.Substring(0,8) + " chars=$($r.Chars) lines=$($r.Lines)") -ForegroundColor Green
  } elseif ($r.Status -eq 'ALL_EMPTY') {
    Write-Host ("$($r.Branch) :: $($r.File) :: all commits empty") -ForegroundColor Yellow
  } else {
    Write-Host ("$($r.Branch) :: $($r.File) :: no commits") -ForegroundColor DarkGray
  }
}

# JSON summary block
Write-Host "JSON_SUMMARY_START"
$results | ConvertTo-Json -Depth 4
Write-Host "JSON_SUMMARY_END"
