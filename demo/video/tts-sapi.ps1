# Doc tung cau thanh file WAV bang giong co san cua Windows (khong cai gi).
# Dau vao: file JSON [{ "text": "...", "out": "duong-dan.wav" }, ...]
# Dinh dang ra: 22050 Hz, 16-bit, mono (de ghep vao video)
param(
    [Parameter(Mandatory = $true)][string]$JobFile,
    [string]$Voice = 'Microsoft Zira Desktop',
    [int]$Rate = 0
)
Add-Type -AssemblyName System.Speech
$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(22050, [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen, [System.Speech.AudioFormat.AudioChannel]::Mono)
$jobs = Get-Content $JobFile -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($job in $jobs) {
    $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
    $synth.SelectVoice($Voice)
    $synth.Rate = $Rate
    $synth.SetOutputToWaveFile($job.out, $format)
    $synth.Speak($job.text)
    $synth.Dispose()
    "Da doc: $($job.out)"
}
