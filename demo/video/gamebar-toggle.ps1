# Bat/tat quay man hinh Xbox Game Bar (gia lap phim Win+Alt+R) cho cua so dang o tren cung.
# Khong cai gi: dung ham keybd_event co san cua Windows.
Add-Type -Namespace Native -Name Keyboard -MemberDefinition @'
[DllImport("user32.dll")] public static extern void keybd_event(byte bVk, byte bScan, uint dwFlags, UIntPtr dwExtraInfo);
'@
$VK_LWIN = 0x5B; $VK_MENU = 0x12; $VK_R = 0x52; $KEYUP = 0x2
[Native.Keyboard]::keybd_event($VK_LWIN, 0, 0, [UIntPtr]::Zero)
[Native.Keyboard]::keybd_event($VK_MENU, 0, 0, [UIntPtr]::Zero)
[Native.Keyboard]::keybd_event($VK_R, 0, 0, [UIntPtr]::Zero)
Start-Sleep -Milliseconds 80
[Native.Keyboard]::keybd_event($VK_R, 0, $KEYUP, [UIntPtr]::Zero)
[Native.Keyboard]::keybd_event($VK_MENU, 0, $KEYUP, [UIntPtr]::Zero)
[Native.Keyboard]::keybd_event($VK_LWIN, 0, $KEYUP, [UIntPtr]::Zero)
"Da gui Win+Alt+R"
