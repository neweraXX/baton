// Tao tung cau WAV qua API; chi dung module co san va fetch cua Node 20.
const fs = require('node:fs');
const path = require('node:path');

function getApiKey(name) {
  const key = (process.env[name] || '').trim();
  if (!key) {
    throw new Error(`Chua dat bien moi truong ${name}`);
  }
  return key;
}

// Che key truoc khi cat ngan noi dung loi.
function redactSecrets(value) {
  let result = value;
  for (const name of ['OPENAI_API_KEY', 'GEMINI_API_KEY']) {
    const key = (process.env[name] || '').trim();
    if (key) {
      result = result.split(key).join('[REDACTED]');
      result = result.split(encodeURIComponent(key)).join('[REDACTED]');
    }
  }
  return result;
}

async function postJson(provider, url, headers, body) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
      redirect: 'error'
    });
  } catch {
    // Khong dua loi fetch goc ra ngoai vi co the chua thong tin nhay cam.
    throw new Error(`${provider}: khong gui duoc yeu cau hoac da het thoi gian cho`);
  }

  if (!response.ok) {
    let bodyText;
    try {
      bodyText = await response.text();
    } catch {
      bodyText = 'Khong doc duoc noi dung loi';
    }
    const detail = redactSecrets(bodyText).slice(0, 300);
    throw new Error(`${provider}: HTTP ${response.status}: ${detail}`);
  }
  return response;
}

async function synthesizeOpenAi(text, options) {
  const key = getApiKey('OPENAI_API_KEY');
  const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
  const body = {
    model,
    voice: options.voice || 'nova',
    input: text,
    response_format: 'wav'
  };
  if (model !== 'tts-1' && model !== 'tts-1-hd') {
    body.instructions = 'Warm, confident product-demo narrator. Clear and natural pace.';
  }

  const response = await postJson(
    'OpenAI',
    'https://api.openai.com/v1/audio/speech',
    { Authorization: `Bearer ${key}` },
    body
  );

  let wav;
  try {
    wav = Buffer.from(await response.arrayBuffer());
  } catch {
    throw new Error('OpenAI: khong doc duoc du lieu am thanh');
  }
  if (
    wav.length < 44 ||
    wav.toString('ascii', 0, 4) !== 'RIFF' ||
    wav.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error('OpenAI: du lieu tra ve khong phai WAV RIFF');
  }
  return wav;
}

// Boc PCM 16-bit mono 24000 Hz thanh WAV RIFF.
function wrapPcmAsWav(pcm) {
  if (pcm.length === 0 || pcm.length % 2 !== 0) {
    throw new Error('Gemini: du lieu PCM rong hoac khong du mau 16-bit');
  }
  if (pcm.length > 0xffffffff - 36) {
    throw new Error('Gemini: du lieu PCM vuot gioi han WAV RIFF');
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8, 'ascii');
  header.write('fmt ', 12, 'ascii');
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);       // PCM
  header.writeUInt16LE(1, 22);       // mono
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(24000 * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36, 'ascii');
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

async function synthesizeGemini(text, options) {
  const key = getApiKey('GEMINI_API_KEY');
  const model = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
  const body = {
    contents: [{ parts: [{ text }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: options.voice || 'Kore' }
        }
      }
    }
  };

  const response = await postJson(
    'Gemini',
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    { 'x-goog-api-key': key },
    body
  );

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('Gemini: khong doc duoc JSON tra ve');
  }
  const encoded = result?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (
    typeof encoded !== 'string' ||
    encoded.length === 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)
  ) {
    throw new Error('Gemini: khong co du lieu am thanh base64 hop le');
  }
  return wrapPcmAsWav(Buffer.from(encoded, 'base64'));
}

async function synthesizeApi(texts, outDir, options = {}) {
  const provider = options.provider || 'openai';
  if (provider !== 'openai' && provider !== 'gemini') {
    throw new Error('Provider TTS phai la openai hoac gemini');
  }
  if (!Array.isArray(texts) || texts.some((text) => typeof text !== 'string' || !text.trim())) {
    throw new Error('texts phai la mang cac chuoi khong rong');
  }

  const directory = path.resolve(outDir);
  fs.mkdirSync(directory, { recursive: true });
  const files = [];

  for (let number = 0; number < texts.length; number += 1) {
    const outPath = path.join(directory, `line-${String(number).padStart(2, '0')}.wav`);
    if (!fs.existsSync(outPath)) {
      const wav = provider === 'openai'
        ? await synthesizeOpenAi(texts[number], options)
        : await synthesizeGemini(texts[number], options);

      // Chi tao file cache chinh thuc sau khi da nhan du am thanh.
      const temporaryPath = `${outPath}.tmp`;
      try {
        fs.writeFileSync(temporaryPath, wav);
        fs.renameSync(temporaryPath, outPath);
      } finally {
        fs.rmSync(temporaryPath, { force: true });
      }
    }
    files.push(outPath);
  }
  return files;
}

module.exports = { synthesizeApi };
