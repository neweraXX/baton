# Long tieng bang giong AI qua API. Doc key tu demo\video\.env.tts (khong bao gio in key).
# Cach dung (trong thu muc hackathon):
#   & .\demo\video\make-voice.ps1 -Tts openai -Voice nova
#   & .\demo\video\make-voice.ps1 -Tts gemini -Voice Kore
param(
    [ValidateSet('openai', 'gemini')][string]$Tts = 'openai',
    [string]$Voice = '',
    [string]$Video = 'demo\video\baton-demo-202611070055.avi'
)
Set-Location (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
if (-not $Voice) { $Voice = if ($Tts -eq 'openai') { 'nova' } else { 'Kore' } }
node --env-file=demo/video/.env.tts demo/video/add-narration.js $Video demo/video/narration.json --tts $Tts --voice $Voice
