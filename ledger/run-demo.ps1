# Chay ledger cho demo: so moi, tieng Anh, gio co dinh 15:00, room baton-demo
# Cach dung (trong thu muc ledger): & .\run-demo.ps1   (Ctrl+C de dung)
param(
    [string]$Room = 'baton-demo',
    [string]$Lang = 'en',
    [string]$FakeNow = '',
    [string]$Aliases = 'ngockute=Ha,vlconga_83915=Dung'
)
$env:LEDGER_ALIASES = $Aliases
Set-Location $PSScriptRoot
Remove-Item state.json -ErrorAction SilentlyContinue
$env:LEDGER_LANG = $Lang
$env:LEDGER_ROOM = $Room
# FakeNow rong = dung gio that (06/11: baton/checker dung gio that, ledger phai cung gio)
if ($FakeNow) { $env:LEDGER_FAKE_NOW = $FakeNow } else { Remove-Item Env:LEDGER_FAKE_NOW -ErrorAction SilentlyContinue }
node --env-file=.env --experimental-websocket bot.js
