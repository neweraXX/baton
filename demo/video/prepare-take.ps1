# Chuan bi 1 kenh sach de quay: tao room + kenh Discord, dung tai lieu room EN.
# Sau do chay ledger rieng: & .\ledger\run-demo.ps1 -Room <ten>
# Cach dung (trong thu muc hackathon): & .\demo\video\prepare-take.ps1 -Room handover-take2
param([Parameter(Mandatory = $true)][string]$Room)
Set-Location (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
node --env-file=ledger/.env --experimental-websocket demo/create-room.js $Room
if ($LASTEXITCODE -ne 0) { "Tao room loi, dung lai"; return }
Start-Sleep -Seconds 5
node --env-file=ledger/.env --experimental-websocket demo/setup-room.js $Room en
"=== PREPARE XONG $Room ==="
