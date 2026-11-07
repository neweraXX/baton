# Chi doc: liet ke file trong thu muc lam viec cua baton va checker
foreach ($name in 'baton', 'checker') {
    $dir = "C:\Users\ADMIN\Desktop\hackathon\agents\$name"
    "== $dir"
    Get-ChildItem $dir -Force | Select-Object Name, Length | Format-Table -AutoSize | Out-String
}
