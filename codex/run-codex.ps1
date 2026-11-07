# Giao 1 job cho Codex (read-only), log ghi UTF-8 de watchdog doc duoc
# Cach dung: & .\codex\run-codex.ps1 <ten-job> [-Resume <session-id>]
#   doc prompt  codex\prompt-<ten-job>.md
#   ghi log     codex\<ten-job>.log
#   ket qua     codex\<ten-job>-result.md
#   -Resume: noi tiep phien Codex cu (cung 1 viec), van ep read-only
param(
    [Parameter(Mandatory = $true)][string]$Job,
    [string]$Resume
)

$root = Split-Path -Parent $PSScriptRoot
$prompt = Join-Path $PSScriptRoot "prompt-$Job.md"
$log = Join-Path $PSScriptRoot "$Job.log"
$out = Join-Path $PSScriptRoot "$Job-result.md"

function Write-Log($line) {
    $line
    Add-Content -Path $log -Value $line -Encoding UTF8
}

Set-Content -Path $log -Value "=== CODEX START $Job $(Get-Date -Format s) resume=$Resume ===" -Encoding UTF8
if ($Resume) {
    Set-Location $root
    Get-Content $prompt -Raw -Encoding UTF8 |
        codex exec resume $Resume -c sandbox_mode=read-only -c model_reasoning_effort=high --skip-git-repo-check --output-last-message $out - 2>&1 |
        ForEach-Object { Write-Log "$_" }
}
else {
    Get-Content $prompt -Raw -Encoding UTF8 |
        codex exec -s read-only --skip-git-repo-check -C $root -c model_reasoning_effort=high --output-last-message $out - 2>&1 |
        ForEach-Object { Write-Log "$_" }
}
Write-Log "=== CODEX EXIT $LASTEXITCODE ==="
