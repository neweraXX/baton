Che do read-only, khong chay code, khong mang.

Doc `demo/video/add-narration.js` va `demo/video/tts-sapi.ps1`. Hien long tieng bang giong Windows (SAPI, 22050 Hz). Can them giong AI hay hon qua API, KHONG cai package (Node 20, chi dung fetch co san).

Viet 2 file, tra ve dung dinh dang `=== FILE: <duong-dan> ===` roi noi dung day du:

1. `demo/video/tts-api.js`: module export `async function synthesizeApi(texts, outDir, options)` -> tra ve mang duong dan WAV.
   - provider "openai": POST https://api.openai.com/v1/audio/speech, header Authorization Bearer process.env.OPENAI_API_KEY, body { model: process.env.OPENAI_TTS_MODEL || "gpt-4o-mini-tts", voice: options.voice || "nova", input, response_format: "wav", instructions: "Warm, confident product-demo narrator. Clear and natural pace." } (bo truong instructions neu model la tts-1/tts-1-hd).
   - provider "gemini": POST https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_TTS_MODEL || "gemini-2.5-flash-preview-tts"}:generateContent?key=... (lay key tu process.env.GEMINI_API_KEY, gui qua header "x-goog-api-key" thay vi query), body { contents:[{parts:[{text}]}], generationConfig:{ responseModalities:["AUDIO"], speechConfig:{ voiceConfig:{ prebuiltVoiceConfig:{ voiceName: options.voice || "Kore" } } } } }; ket qua la PCM 16-bit mono 24000 Hz base64 trong candidates[0].content.parts[0].inlineData.data -> tu boc thanh WAV (viet header RIFF).
   - KHONG bao gio in key ra man hinh; loi HTTP thi in status + toi da 300 ky tu body.
   - Moi cau 1 file `line-XX.wav`; da co file thi bo qua (de chay lai khong ton tien).
2. `demo/video/add-narration.js` (ban sua day du): them tham so dong lenh `--tts sapi|openai|gemini` va `--voice <ten>` (giu cach goi cu: tham so thu 3 la ten giong SAPI). Doc SAMPLE_RATE tu header WAV cua cau dau (OpenAI/Gemini 24000 Hz, SAPI 22050) thay vi hang so; neu cac file khac tan so thi bao loi ro. Giu nguyen phan ghi AVI 2 luong va giu khung cuoi. File ra: `<video>-voice-<tts>.avi`.

Giu phong cach code hien tai: ham nho, ten ro, comment tieng Viet khong dau.
