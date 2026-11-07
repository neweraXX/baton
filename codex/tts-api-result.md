=== FILE: demo/video/tts-api.js ===
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

=== FILE: demo/video/add-narration.js ===
// Long tieng cho video AVI (MJPEG, khong tieng) da quay:
// 1) doc tung cau thanh WAV bang SAPI, OpenAI hoac Gemini,
// 2) doc tan so WAV va dat tung cau vao dai am thanh PCM,
// 3) ghi AVI 2 luong: hinh MJPEG + tieng PCM 16-bit mono.
// Chay cu: node demo/video/add-narration.js <video.avi> <narration.json> [ten-giong]
// Chay moi: node demo/video/add-narration.js <video.avi> <narration.json> --tts openai --voice nova

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { execFileSync } = require('node:child_process');
const { synthesizeApi } = require('./tts-api');

const BYTES_PER_SAMPLE = 2; // 16-bit mono
const GAP_SECONDS = 0.25;  // khoang nghi toi thieu giua 2 cau

function parseArguments(args) {
  const positional = [];
  let tts = 'sapi';
  let voice;

  for (let number = 0; number < args.length; number += 1) {
    const argument = args[number];
    if (argument === '--tts' || argument === '--voice') {
      const value = args[number + 1];
      if (!value || value.startsWith('--') || !value.trim()) {
        throw new Error(`Thieu gia tri cho ${argument}`);
      }
      if (argument === '--tts') {
        tts = value;
      } else {
        voice = value;
      }
      number += 1;
    } else if (argument.startsWith('--')) {
      throw new Error(`Tham so khong hop le: ${argument}`);
    } else {
      positional.push(argument);
    }
  }

  if (positional.length < 2 || positional.length > 3) {
    throw new Error('Cach dung: node demo/video/add-narration.js <video.avi> <narration.json> [ten-giong-SAPI] [--tts sapi|openai|gemini] [--voice <ten>]');
  }
  if (!['sapi', 'openai', 'gemini'].includes(tts)) {
    throw new Error('--tts phai la sapi, openai hoac gemini');
  }
  if (positional.length === 3 && tts !== 'sapi') {
    throw new Error('Ten giong o tham so thu 3 chi dung cho SAPI; voi API hay dung --voice');
  }
  if (positional.length === 3 && voice !== undefined) {
    throw new Error('Chi truyen ten giong o tham so thu 3 hoac qua --voice');
  }

  const defaults = {
    sapi: 'Microsoft Zira Desktop',
    openai: 'nova',
    gemini: 'Kore'
  };
  voice = voice ?? positional[2] ?? defaults[tts];
  if (!voice.trim()) {
    throw new Error('Ten giong khong duoc rong');
  }
  return {
    videoPath: positional[0],
    narrationPath: positional[1],
    tts,
    voice
  };
}

// ---- Doc AVI MJPEG da quay (do avi-writer.js ghi) ----
function readMjpegAvi(filePath) {
  const data = fs.readFileSync(filePath);
  const fps = data.readUInt32LE(132); // strh.dwRate
  const width = data.readUInt32LE(64);
  const height = data.readUInt32LE(68);
  const count = data.readUInt32LE(48);
  const indexStart = data.length - count * 16;
  const frames = [];
  for (let number = 0; number < count; number += 1) {
    const at = indexStart + number * 16;
    const offset = data.readUInt32LE(at + 8);
    const size = data.readUInt32LE(at + 12);
    const start = 220 + offset + 8;
    frames.push(data.subarray(start, start + size));
  }
  if (fps === 0 || frames.length === 0) {
    throw new Error(`Video khong co khung hinh hoac FPS khong hop le: ${filePath}`);
  }
  return { fps, width, height, frames };
}

// ---- Doc dinh dang va du lieu PCM cua WAV ----
function readWavPcm(filePath) {
  const data = fs.readFileSync(filePath);
  if (
    data.length < 12 ||
    data.toString('ascii', 0, 4) !== 'RIFF' ||
    data.toString('ascii', 8, 12) !== 'WAVE'
  ) {
    throw new Error(`File khong phai WAV RIFF: ${filePath}`);
  }

  let format;
  let pcm;
  let at = 12;
  while (at + 8 <= data.length) {
    const id = data.toString('ascii', at, at + 4);
    const size = data.readUInt32LE(at + 4);
    const start = at + 8;
    // WAV tu luong HTTP co the dung 0xffffffff cho kich thuoc data.
    const end = id === 'data' && size === 0xffffffff
      ? data.length
      : start + size;
    if (end > data.length) {
      throw new Error(`WAV bi thieu du lieu o chunk ${id}: ${filePath}`);
    }

    if (id === 'fmt ') {
      if (size < 16) {
        throw new Error(`Chunk fmt cua WAV qua ngan: ${filePath}`);
      }
      format = {
        encoding: data.readUInt16LE(start),
        channels: data.readUInt16LE(start + 2),
        sampleRate: data.readUInt32LE(start + 4),
        byteRate: data.readUInt32LE(start + 8),
        blockAlign: data.readUInt16LE(start + 12),
        bitsPerSample: data.readUInt16LE(start + 14)
      };
    } else if (id === 'data' && pcm === undefined) {
      pcm = data.subarray(start, end);
    }
    at = end + (size % 2);
  }

  if (!format || pcm === undefined) {
    throw new Error(`WAV thieu chunk fmt hoac data: ${filePath}`);
  }
  if (
    format.encoding !== 1 ||
    format.channels !== 1 ||
    format.bitsPerSample !== 16 ||
    format.blockAlign !== BYTES_PER_SAMPLE
  ) {
    throw new Error(`Can WAV PCM 16-bit mono: ${filePath}`);
  }
  if (
    format.sampleRate === 0 ||
    format.byteRate !== format.sampleRate * BYTES_PER_SAMPLE ||
    pcm.length === 0 ||
    pcm.length % BYTES_PER_SAMPLE !== 0
  ) {
    throw new Error(`Tan so hoac du lieu PCM khong hop le: ${filePath}`);
  }
  return { pcm, sampleRate: format.sampleRate };
}

function readNarration(filePath) {
  const segments = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(segments) || segments.length === 0) {
    throw new Error('Thuyet minh phai la mang co it nhat mot cau');
  }
  segments.forEach((segment, number) => {
    if (
      !segment ||
      typeof segment.text !== 'string' ||
      !segment.text.trim() ||
      !Number.isFinite(segment.start) ||
      !Number.isFinite(segment.end) ||
      segment.start < 0 ||
      segment.end < segment.start
    ) {
      throw new Error(`Cau ${number}: can text khong rong va moc 0 <= start <= end`);
    }
  });
  return segments;
}

// Tach cache theo video, provider, model, giong va noi dung.
function getWorkDir(videoPath, texts, tts, voice) {
  const model = tts === 'openai'
    ? process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts'
    : tts === 'gemini'
      ? process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts'
      : 'sapi';
  const identity = JSON.stringify({ tts, model, voice, texts });
  const hash = createHash('sha256').update(identity).digest('hex').slice(0, 16);
  const videoName = path.parse(videoPath).name;
  return path.join(path.dirname(videoPath), 'narration-wav', `${videoName}-${tts}-${hash}`);
}

// ---- Doc tung cau thanh WAV bang giong Windows ----
function synthesizeSapi(texts, workDir, voice) {
  fs.mkdirSync(workDir, { recursive: true });
  const jobs = texts.map((text, number) => ({
    text,
    out: path.resolve(workDir, `line-${String(number).padStart(2, '0')}.wav`)
  }));
  const pending = jobs.filter((job) => !fs.existsSync(job.out));
  if (pending.length > 0) {
    const jobFile = path.resolve(workDir, 'jobs.json');
    fs.writeFileSync(jobFile, JSON.stringify(pending));
    const script = path.join(__dirname, 'tts-sapi.ps1');
    execFileSync('powershell', [
      '-NoProfile', '-ExecutionPolicy', 'Bypass',
      '-File', script, '-JobFile', jobFile, '-Voice', voice
    ], { stdio: 'inherit' });
  }
  return jobs.map((job) => job.out);
}

function readClips(files) {
  const waves = files.map((file) => readWavPcm(file));
  const sampleRate = waves[0].sampleRate;
  waves.forEach((wave, number) => {
    if (wave.sampleRate !== sampleRate) {
      throw new Error(`Tan so WAV khac nhau: ${files[number]} la ${wave.sampleRate} Hz; cau dau ${files[0]} la ${sampleRate} Hz`);
    }
  });
  return { clips: waves.map((wave) => wave.pcm), sampleRate };
}

// ---- Dat tung cau vao dai am thanh; cau dai thi day cau sau lui lai ----
function mixNarration(segments, clips, totalSeconds, sampleRate) {
  const track = Buffer.alloc(Math.ceil(totalSeconds * sampleRate) * BYTES_PER_SAMPLE);
  let previousEnd = 0;
  segments.forEach((segment, number) => {
    const start = Math.max(segment.start, previousEnd + GAP_SECONDS);
    const clipSeconds = clips[number].length / BYTES_PER_SAMPLE / sampleRate;
    const startByte = Math.floor(start * sampleRate) * BYTES_PER_SAMPLE;
    if (startByte < track.length) {
      clips[number].copy(track, startByte, 0, Math.min(clips[number].length, track.length - startByte));
    }
    previousEnd = start + clipSeconds;
    const late = start - segment.start;
    console.log(`Cau ${number}: ${start.toFixed(1)}s -> ${previousEnd.toFixed(1)}s${late > 0.05 ? ` (tre ${late.toFixed(1)}s)` : ''}${previousEnd > segment.end + 0.5 ? ' (dai hon doan)' : ''}`);
  });
  return track;
}

// Thoi diem cau cuoi doc xong (cung luat day lui nhu mixNarration).
function estimateEnd(segments, clips, sampleRate) {
  let previousEnd = 0;
  segments.forEach((segment, number) => {
    const start = Math.max(segment.start, previousEnd + GAP_SECONDS);
    previousEnd = start + clips[number].length / BYTES_PER_SAMPLE / sampleRate;
  });
  return previousEnd;
}

// ---- Ghi AVI 2 luong (hinh MJPEG + tieng PCM), xen ke moi giay ----
function chunk(id, payload) {
  const header = Buffer.alloc(8);
  header.write(id, 0, 'ascii');
  header.writeUInt32LE(payload.length, 4);
  return payload.length % 2 === 1 ? Buffer.concat([header, payload, Buffer.alloc(1)]) : Buffer.concat([header, payload]);
}

function list(type, children) {
  const body = Buffer.concat([Buffer.from(type, 'ascii'), ...children]);
  const header = Buffer.alloc(8);
  header.write('LIST', 0, 'ascii');
  header.writeUInt32LE(body.length, 4);
  return Buffer.concat([header, body]);
}

function u32(...values) {
  const buffer = Buffer.alloc(values.length * 4);
  values.forEach((value, number) => buffer.writeUInt32LE(value >>> 0, number * 4));
  return buffer;
}

function u16(...values) {
  const buffer = Buffer.alloc(values.length * 2);
  values.forEach((value, number) => buffer.writeUInt16LE(value, number * 2));
  return buffer;
}

function buildHeader(video, audioBytes, maxFrame, audioChunkBytes, sampleRate) {
  const { fps, width, height, frames } = video;
  const avih = chunk('avih', u32(Math.round(1000000 / fps), maxFrame * fps + sampleRate * BYTES_PER_SAMPLE, 0, 0x110, frames.length, 0, 2, maxFrame, width, height, 0, 0, 0, 0));
  const videoStrh = chunk('strh', Buffer.concat([Buffer.from('vidsMJPG', 'ascii'), u32(0), u16(0, 0), u32(0, 1, fps, 0, frames.length, maxFrame, 0xffffffff, 0), u16(0, 0, width, height)]));
  const videoStrf = chunk('strf', Buffer.concat([u32(40, width, height), u16(1, 24), Buffer.from('MJPG', 'ascii'), u32(width * height * 3, 0, 0, 0, 0)]));
  const audioStrh = chunk('strh', Buffer.concat([Buffer.from('auds', 'ascii'), u32(0, 0), u16(0, 0), u32(0, BYTES_PER_SAMPLE, sampleRate * BYTES_PER_SAMPLE, 0, audioBytes / BYTES_PER_SAMPLE, audioChunkBytes, 0xffffffff, BYTES_PER_SAMPLE), u16(0, 0, 0, 0)]));
  const audioStrf = chunk('strf', Buffer.concat([u16(1, 1), u32(sampleRate, sampleRate * BYTES_PER_SAMPLE), u16(BYTES_PER_SAMPLE, 16, 0)]));
  return list('hdrl', [avih, list('strl', [videoStrh, videoStrf]), list('strl', [audioStrh, audioStrf])]);
}

function writeAviWithAudio(outPath, video, pcm, sampleRate) {
  const { fps, frames } = video;
  const maxFrame = Math.max(...frames.map((frame) => frame.length));
  const audioChunkBytes = sampleRate * BYTES_PER_SAMPLE; // 1 giay tieng moi chunk
  const hdrl = buildHeader(video, pcm.length, maxFrame, audioChunkBytes, sampleRate);

  // Thu tu chunk: moi giay = fps khung hinh + 1 chunk tieng.
  const order = [];
  const seconds = Math.ceil(frames.length / fps);
  for (let second = 0; second < seconds; second += 1) {
    for (let number = second * fps; number < Math.min(frames.length, (second + 1) * fps); number += 1) {
      order.push({ id: '00dc', data: frames[number] });
    }
    const audio = pcm.subarray(second * audioChunkBytes, Math.min(pcm.length, (second + 1) * audioChunkBytes));
    if (audio.length > 0) {
      order.push({ id: '01wb', data: audio });
    }
  }

  const moviPayloadBytes = 4 + order.reduce((sum, item) => sum + 8 + item.data.length + (item.data.length % 2), 0);
  const idxBytes = 8 + order.length * 16;
  const riffSize = 4 + hdrl.length + 8 + moviPayloadBytes + idxBytes;

  const fd = fs.openSync(outPath, 'w');
  try {
    let position = 0;
    const write = (buffer) => {
      fs.writeSync(fd, buffer, 0, buffer.length, position);
      position += buffer.length;
    };
    write(Buffer.concat([Buffer.from('RIFF', 'ascii'), u32(riffSize), Buffer.from('AVI ', 'ascii'), hdrl]));
    write(Buffer.concat([Buffer.from('LIST', 'ascii'), u32(moviPayloadBytes)]));
    const moviFourccAt = position;
    write(Buffer.from('movi', 'ascii'));
    const index = [];
    for (const item of order) {
      index.push({ id: item.id, offset: position - moviFourccAt, size: item.data.length });
      write(chunk(item.id, item.data));
    }
    const idx = Buffer.alloc(idxBytes);
    idx.write('idx1', 0, 'ascii');
    idx.writeUInt32LE(order.length * 16, 4);
    index.forEach((entry, number) => {
      const at = 8 + number * 16;
      idx.write(entry.id, at, 'ascii');
      idx.writeUInt32LE(0x10, at + 4);
      idx.writeUInt32LE(entry.offset, at + 8);
      idx.writeUInt32LE(entry.size, at + 12);
    });
    write(idx);
  } finally {
    fs.closeSync(fd);
  }
}

async function main() {
  const { videoPath, narrationPath, tts, voice } = parseArguments(process.argv.slice(2));
  const segments = readNarration(narrationPath);
  const video = readMjpegAvi(videoPath);
  const totalSeconds = video.frames.length / video.fps;
  console.log(`Video: ${video.frames.length} khung, ${totalSeconds.toFixed(1)}s, ${video.width}x${video.height}. Thuyet minh: ${segments.length} cau, TTS ${tts}, giong ${voice}`);

  const texts = segments.map((segment) => segment.text);
  const workDir = getWorkDir(videoPath, texts, tts, voice);
  const files = tts === 'sapi'
    ? synthesizeSapi(texts, workDir, voice)
    : await synthesizeApi(texts, workDir, { provider: tts, voice });
  const { clips, sampleRate } = readClips(files);
  console.log(`Am thanh: PCM 16-bit mono, ${sampleRate} Hz`);

  // Thu dat de biet cau cuoi ket thuc luc nao; giu khung cuoi cho doc het.
  const narrationEnd = estimateEnd(segments, clips, sampleRate);
  const neededSeconds = Math.max(totalSeconds, narrationEnd + 1);
  const extraFrames = Math.ceil((neededSeconds - totalSeconds) * video.fps);
  for (let number = 0; number < extraFrames; number += 1) {
    video.frames.push(video.frames[video.frames.length - 1]);
  }
  if (extraFrames > 0) {
    console.log(`Giu khung cuoi them ${(extraFrames / video.fps).toFixed(1)}s cho doc het cau cuoi`);
  }

  const pcm = mixNarration(segments, clips, video.frames.length / video.fps, sampleRate);
  const parsed = path.parse(videoPath);
  const outPath = path.join(parsed.dir, `${parsed.name}-voice-${tts}.avi`);
  writeAviWithAudio(outPath, video, pcm, sampleRate);
  console.log(`Da ghi video co tieng: ${outPath} (${(fs.statSync(outPath).size / 1048576).toFixed(1)} MB)`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});