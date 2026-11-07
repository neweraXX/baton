# Ve phu de (hardsub) len tung khung JPEG bang System.Drawing co san cua Windows (khong cai gi).
# Dau vao: file JSON [{ "in": "khung.jpg", "out": "khung-sub.jpg", "text": "..." }, ...]
param([Parameter(Mandatory = $true)][string]$JobFile)
Add-Type -AssemblyName System.Drawing
$jobs = Get-Content $JobFile -Raw -Encoding UTF8 | ConvertFrom-Json
$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
$encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]72)
$font = New-Object System.Drawing.Font('Segoe UI Semibold', 21, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$background = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(200, 10, 14, 24))
$textBrush = [System.Drawing.Brushes]::White
$done = 0
foreach ($job in $jobs) {
    $image = [System.Drawing.Image]::FromFile($job.in)
    $g = [System.Drawing.Graphics]::FromImage($image)
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
    $barHeight = 78
    $bar = New-Object System.Drawing.RectangleF(0, ($image.Height - $barHeight - 6), $image.Width, $barHeight)
    $g.FillRectangle($background, $bar)
    $textBox = New-Object System.Drawing.RectangleF(40, $bar.Y, ($image.Width - 80), $barHeight)
    $g.DrawString($job.text, $font, $textBrush, $textBox, $format)
    $g.Dispose()
    $image.Save($job.out, $jpegCodec, $encoderParams)
    $image.Dispose()
    $done += 1
}
"Da ve phu de len $done khung"
