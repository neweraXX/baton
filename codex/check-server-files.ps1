# Chi doc: in ports.json va kich thuoc/thoi gian log, run cua server local (khong in file bi mat)
$base = Join-Path $env:APPDATA 'switchdash\local-switch-server'
"Gio: $(Get-Date -Format 'HH:mm:ss')"
"ports.json: " + ((Get-Content (Join-Path $base 'ports.json') -Raw) -replace '\s', '')
Get-ChildItem (Join-Path $base 'native\logs'), (Join-Path $base 'native\run') |
    Select-Object Name, Length, @{ n = 'Modified'; e = { $_.LastWriteTime.ToString('dd/MM HH:mm:ss') } } |
    Format-Table -AutoSize
