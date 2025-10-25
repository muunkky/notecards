# Kill Firebase, Java, and Node processes
Write-Host "=== Killing Firebase-related processes ===" -ForegroundColor Yellow

# Kill Java processes (Firebase emulators run on Java)
$javaProcesses = Get-Process java -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "Killing Java processes:" -ForegroundColor Red
    $javaProcesses | ForEach-Object {
        Write-Host "  - PID $($_.Id): $($_.ProcessName)"
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "No Java processes found" -ForegroundColor Green
}

# Kill Node processes that might be Firebase CLI
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*firebase*" -or $_.CommandLine -like "*firebase*"
}
if ($nodeProcesses) {
    Write-Host "`nKilling Firebase Node processes:" -ForegroundColor Red
    $nodeProcesses | ForEach-Object {
        Write-Host "  - PID $($_.Id): $($_.Path)"
        Stop-Process -Id $_.Id -Force
    }
} else {
    Write-Host "`nNo Firebase Node processes found" -ForegroundColor Green
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan
