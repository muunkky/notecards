<#
  Kill only processes holding emulator ports to avoid collateral damage.
  Ports: hub 4400, ui 4000, logging 4500, firestore 8080, functions 5001, ui websocket 9150
  Usage: powershell -ExecutionPolicy Bypass -File scripts/kill-orphans.ps1
#>

$ports = @(4000, 4400, 4500, 5001, 8080, 9150)

function Get-PidsForPort($port) {
  $lines = netstat -ano | findstr ":$port "
  $pids = @()
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim -eq '') { continue }
    $parts = $trim -split '\s+'
    # Typical: Proto LocalAddress ForeignAddress State PID
    if ($parts.Length -ge 5) {
      $pid = [int]$parts[-1]
      if (-not $pids.Contains($pid)) { $pids += $pid }
    }
  }
  return $pids
}

foreach ($port in $ports) {
  try {
    Write-Host "Scanning for listeners on :$port ..."
    $pids = Get-PidsForPort -port $port
    foreach ($pid in $pids) {
      if ($pid -eq $PID) { continue }
      try {
        $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($null -ne $proc) {
          Write-Host "Killing PID $pid ($($proc.ProcessName)) holding :$port"
          Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
      } catch {}
    }
  } catch {}
}

Write-Host "Orphan cleanup complete."
