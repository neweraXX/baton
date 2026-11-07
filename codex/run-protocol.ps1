# Giao Codex doc docs agent protocol cua Switch (read-only), ghi log + ket qua cuoi
$root = Split-Path -Parent $PSScriptRoot
$prompt = Join-Path $PSScriptRoot 'prompt-protocol.md'
$log = Join-Path $PSScriptRoot 'protocol.log'
$out = Join-Path $PSScriptRoot 'protocol-notes.md'
$src = Join-Path $root 'ref\switch-src'

Get-Content $prompt -Raw | codex exec -s read-only -C $src -c model_reasoning_effort=high --output-last-message $out - 2>&1 | Tee-Object -FilePath $log
"=== CODEX EXIT $LASTEXITCODE ===" | Tee-Object -FilePath $log -Append
