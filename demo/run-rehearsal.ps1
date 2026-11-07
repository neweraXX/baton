# Chay tap tu dong (can ledger dang chay bang run-demo.ps1 cung room, cung ngon ngu)
# Cach dung (trong thu muc hackathon): & .\demo\run-rehearsal.ps1
param(
    [string]$Room = 'baton-demo',
    [string]$Lang = 'en'
)
Set-Location (Split-Path -Parent $PSScriptRoot)
$env:LEDGER_LANG = $Lang
$env:LEDGER_ROOM = $Room
node --env-file=ledger/.env --experimental-websocket demo/rehearse.js
