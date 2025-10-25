# Check for Firebase and Java processes
Write-Host "=== Firebase, Java, and Node Processes ===" -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*firebase*" -or $_.ProcessName -like "*java*" -or $_.ProcessName -like "*node*"} | Select-Object Id,ProcessName,CPU,WorkingSet | Format-Table -AutoSize

Write-Host "`n=== Ports 8080 and 9099 (Firebase Emulators) ===" -ForegroundColor Cyan
Get-NetTCPConnection -LocalPort 8080,9099 -State Listen -ErrorAction SilentlyContinue | ForEach-Object {
    $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
    [PSCustomObject]@{
        LocalPort = $_.LocalPort
        State = $_.State
        PID = $_.OwningProcess
        ProcessName = $process.ProcessName
        Path = $process.Path
    }
} | Format-Table -AutoSize

Write-Host "`n=== Alternative: netstat output ===" -ForegroundColor Cyan
netstat -ano | Select-String ":8080|:9099"

Write-Host "`n=== All Node.js processes ===" -ForegroundColor Cyan
Get-Process node -ErrorAction SilentlyContinue | Format-Table Id,ProcessName,Path,StartTime -AutoSize
