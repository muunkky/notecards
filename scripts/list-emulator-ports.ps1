<#
List processes listening on Firebase Emulator-related ports without killing them.
Ports: hub 4400, ui 4000, logging 4500, firestore 8080, functions 5001, ui websocket 9150
Usage: powershell -ExecutionPolicy Bypass -File ./scripts/list-emulator-ports.ps1
#>

$ports = @(4000, 4400, 4500, 5001, 8080, 9150)

function Get-PidsForPort($port) {
  $lines = netstat -ano | findstr ":$port "
  $entries = @()
  foreach ($line in $lines) {
    $trim = $line.Trim()
    if ($trim -eq '') { continue }
    $parts = $trim -split '\s+'
    if ($parts.Length -ge 5) {
      $pid = [int]$parts[-1]
      $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
      $entries += [PSCustomObject]@{
        Port = $port
        PID = $pid
        ProcessName = if ($null -ne $proc) { $proc.ProcessName } else { 'unknown' }
        CommandLine = (Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue).CommandLine
      }
    }
  }
  return $entries
}

$results = @()
foreach ($p in $ports) {
  $results += Get-PidsForPort -port $p
}

if ($results.Count -eq 0) {
  Write-Host "No emulator-related ports are currently in use."
} else {
  $results | Sort-Object Port, PID | Format-Table -AutoSize
}
