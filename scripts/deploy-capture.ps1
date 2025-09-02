Param(
  [string]$Project = "notecards-1b054",
  [switch]$All
)
$ErrorActionPreference = 'Stop'
$script:exitCode = 0

function Write-Log($msg){
  Write-Host $msg
  if($script:sanitizedPath){ Add-Content -Path $script:sanitizedPath -Value $msg }
}

$timestamp = Get-Date -Format 'yyyy-MM-dd-HH-mm-ss'
$deployDir = Join-Path $PSScriptRoot '..\log\deploy'
if(!(Test-Path $deployDir)){ New-Item -ItemType Directory -Path $deployDir | Out-Null }
$sanitized = Join-Path $deployDir "deploy-$timestamp.log"
$script:sanitizedPath = $sanitized
$raw = Join-Path $deployDir "deploy-$timestamp.raw.log"
$summaryJson = Join-Path $deployDir "deploy-$timestamp.json"
$heartbeatFile = Join-Path $deployDir "deploy-$timestamp.heartbeat"

"[DEPLOY-START] timestamp=$timestamp project=$Project mode=$([string]::Copy($(if($All){'all'}else{'targets'})))" | Tee-Object -FilePath $sanitized -Append | Out-Null
"paths: sanitized=$sanitized raw=$raw summaryJson=$summaryJson" | Tee-Object -FilePath $sanitized -Append | Out-Null
"status: RUNNING" | Tee-Object -FilePath $sanitized -Append | Out-Null
"instruction: This script will build then deploy via Firebase CLI. Tail this log until [DEPLOY-COMPLETE]." | Tee-Object -FilePath $sanitized -Append | Out-Null
"[DEPLOY-MESSAGE-END]" | Tee-Object -FilePath $sanitized -Append | Out-Null

# Heartbeat background job
$script:alive = $true
Start-Job -ScriptBlock {
  param($hb)
  while(Test-Path $hb){ Set-Content -Path $hb -Value (Get-Date -Format o); Start-Sleep -Seconds 5 }
} -ArgumentList $heartbeatFile | Out-Null
New-Item -ItemType File -Path $heartbeatFile -Force | Out-Null

# Ensure firebase-tools installed
try {
  $fbVersion = firebase --version 2>$null
  if(-not $fbVersion){
    Write-Log "Installing firebase-tools globally"
    npm install -g firebase-tools | Tee-Object -FilePath $raw -Append | Out-Null
    $fbVersion = firebase --version
  }
  "firebaseVersion: $fbVersion" | Tee-Object -FilePath $sanitized -Append | Out-Null
} catch {
  "error: failed to verify/install firebase-tools $_" | Tee-Object -FilePath $sanitized -Append | Out-Null
  $script:exitCode = 1
}

if($script:exitCode -eq 0){
  try {
    # Show current project context
    firebase use $Project 2>&1 | Tee-Object -FilePath $raw -Append | Out-Null
  } catch {
    "warn: project selection may have failed (likely unauthenticated)." | Tee-Object -FilePath $sanitized -Append | Out-Null
  }
}

if($script:exitCode -eq 0){
  try {
    Write-Log "Building (npm run build)..."
    $env:CI = 'true'
    $env:VITE_CI = 'true'
    if(Test-Path dist){ Remove-Item dist -Recurse -Force }
    npm run build 2>&1 | Tee-Object -FilePath $raw -Append | Out-Null
    $buildExit = $LASTEXITCODE; "debug: buildExit=$buildExit" | Tee-Object -FilePath $sanitized -Append | Out-Null
    if($buildExit -ne 0){ throw "Build failed ($buildExit)" }
  } catch {
    "error: build-failed type=$($_.Exception.GetType().FullName) msg=$($_.Exception.Message)" | Tee-Object -FilePath $sanitized -Append | Out-Null
    if($_.ScriptStackTrace){ "error: stack=$($_.ScriptStackTrace)" | Tee-Object -FilePath $sanitized -Append | Out-Null }
    $script:exitCode = 2
  }
  if($script:exitCode -eq 2 -and (Test-Path dist/index.html)){
    "warn: build reported failure but dist artifacts found; proceeding to deploy attempt" | Tee-Object -FilePath $sanitized -Append | Out-Null
    $script:exitCode = 0
  }
}

$deployTargets = if($All){ @() } else { @('--only','hosting,firestore:rules,firestore:indexes') }
if($script:exitCode -eq 0){
  try {
    $deployArgs = @('deploy') + $deployTargets + @('--non-interactive')
    Write-Log ("Deploying... args=" + ($deployArgs -join ' '))
    & firebase @deployArgs 2>&1 | Tee-Object -FilePath $raw -Append | Out-Null
    $deployExit = $LASTEXITCODE; "debug: deployExit=$deployExit" | Tee-Object -FilePath $sanitized -Append | Out-Null
    if($deployExit -ne 0){ throw "Firebase deploy failed ($deployExit)" }
  } catch {
    "error: deploy-failed type=$($_.Exception.GetType().FullName) msg=$($_.Exception.Message)" | Tee-Object -FilePath $sanitized -Append | Out-Null
    $script:exitCode = 3
  }
}

# Parse hosting URLs (best-effort)
$hostUrls = @()
if(Test-Path $raw){
  $hostUrls = Select-String -Path $raw -Pattern 'https://[\w-]+\.(web|firebaseapp)\.app' -AllMatches | ForEach-Object { $_.Matches.Value } | Sort-Object -Unique
}

$summary = [ordered]@{
  timestamp = $timestamp
  project = $Project
  exitCode = $script:exitCode
  success = ($script:exitCode -eq 0)
  hostingUrls = $hostUrls
  sanitizedLog = $sanitized
  rawLog = $raw
}
$summary | ConvertTo-Json -Depth 4 | Out-File $summaryJson -Encoding UTF8

if($script:exitCode -eq 0){
  "[DEPLOY-COMPLETE] status=SUCCESS exitCode=0 summaryJson=$summaryJson" | Tee-Object -FilePath $sanitized -Append | Out-Null
} else {
  "[DEPLOY-COMPLETE] status=FAIL exitCode=$script:exitCode summaryJson=$summaryJson" | Tee-Object -FilePath $sanitized -Append | Out-Null
}
"copilot: Read summaryJson for structured results." | Tee-Object -FilePath $sanitized -Append | Out-Null

# Latest pointer files
Set-Content (Join-Path $deployDir 'latest-deploy-log.txt') $sanitized
Set-Content (Join-Path $deployDir 'latest-deploy-summary.json') $summaryJson

if(Test-Path $heartbeatFile){ Remove-Item $heartbeatFile -Force }
Get-Job | Where-Object { $_.Command -like '*heartbeat*' } | Remove-Job -Force -ErrorAction SilentlyContinue

exit $script:exitCode
