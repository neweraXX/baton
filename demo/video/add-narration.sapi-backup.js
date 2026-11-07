// Long tieng cho video AVI (MJPEG, khong tieng) da quay:
// 1) doc tung cau thuyet minh thanh WAV (tts-sapi.ps1, giong co san cua Windows),
// 2) dat tung cau dung moc thoi gian vao 1 dai am thanh PCM,
// 3) ghi file AVI moi co 2 luong: hinh (giu nguyen khung JPEG) + tieng (PCM 22050 Hz mono).
// Chay: node demo/video/add-narration.js <video.avi> <narration.json> [ten-giong]

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const SAMPLE_RATE = 22050;
const BYTES_PER_SAMPLE = 2; // 16-bit mono
const GAP_SECONDS = 0.25;   // khoang nghi toi thieu giua 2 cau

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
  return { fps, width, height, frames };
}

// ---- Doc phan du lieu PCM cua file WAV ----
function readWavPcm(filePath) {
  const data = fs.readFileSync(filePath);
  let at = 12;
  while (at < data.length) {
    const id = data.toString('ascii', at, at + 4);
    const size = data.readUInt32LE(at + 4);
    if (id === 'data') {
      return data.subarray(at + 8, at + 8 + size);
    }
    at += 8 + size + (size % 2);
  }
  throw new Error(`File WAV khong co phan data: ${filePath}`);
}

// ---- Doc tung cau thanh WAV bang giong Windows ----
function synthesize(segments, workDir, voice) {
  fs.mkdirSync(workDir, { recursive: true });
  const jobs = segments.map((segment, number) => ({ text: segment.text, out: path.join(workDir, `line-${String(number).padStart(2, '0')}.wav`) }));
  const jobFile = path.join(workDir, 'jobs.json');
  fs.writeFileSync(jobFile, JSON.stringify(jobs));
  const script = path.join(__dirname, 'tts-sapi.ps1');
  execFileSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, '-JobFile', jobFile, '-Voice', voice], { stdio: 'inherit' });
  return jobs.map((job) => readWavPcm(job.out));
}

// ---- Dat tung cau vao dai am thanh dai bang video; cau dai qua thi day cau sau lui lai ----
function mixNarration(segments, clips, totalSeconds) {
  const track = Buffer.alloc(Math.ceil(totalSeconds * SAMPLE_RATE) * BYTES_PER_SAMPLE);
  let previousEnd = 0;
  segments.forEach((segment, number) => {
    const start = Math.max(segment.start, previousEnd + GAP_SECONDS);
    const clipSeconds = clips[number].length / BYTES_PER_SAMPLE / SAMPLE_RATE;
    const startByte = Math.floor(start * SAMPLE_RATE) * BYTES_PER_SAMPLE;
    clips[number].copy(track, startByte, 0, Math.max(0, Math.min(clips[number].length, track.length - startByte)));
    previousEnd = start + clipSeconds;
    const late = start - segment.start;
    console.log(`Cau ${number}: ${start.toFixed(1)}s -> ${previousEnd.toFixed(1)}s${late > 0.05 ? ` (tre ${late.toFixed(1)}s)` : ''}${previousEnd > segment.end + 0.5 ? ' (dai hon doan)' : ''}`);
  });
  return track;
}

// Thoi diem cau cuoi doc xong (cung luat day lui nhu mixNarration)
function estimateEnd(segments, clips) {
  let previousEnd = 0;
  segments.forEach((segment, number) => {
    const start = Math.max(segment.start, previousEnd + GAP_SECONDS);
    previousEnd = start + clips[number].length / BYTES_PER_SAMPLE / SAMPLE_RATE;
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

function buildHeader(video, audioBytes, maxFrame, audioChunkBytes) {
  const { fps, width, height, frames } = video;
  const avih = chunk('avih', u32(Math.round(1000000 / fps), maxFrame * fps + SAMPLE_RATE * BYTES_PER_SAMPLE, 0, 0x110, frames.length, 0, 2, maxFrame, width, height, 0, 0, 0, 0));
  const videoStrh = chunk('strh', Buffer.concat([Buffer.from('vidsMJPG', 'ascii'), u32(0), u16(0, 0), u32(0, 1, fps, 0, frames.length, maxFrame, 0xffffffff, 0), u16(0, 0, width, height)]));
  const videoStrf = chunk('strf', Buffer.concat([u32(40, width, height), u16(1, 24), Buffer.from('MJPG', 'ascii'), u32(width * height * 3, 0, 0, 0, 0)]));
  const audioStrh = chunk('strh', Buffer.concat([Buffer.from('auds', 'ascii'), u32(0, 0), u16(0, 0), u32(0, BYTES_PER_SAMPLE, SAMPLE_RATE * BYTES_PER_SAMPLE, 0, audioBytes / BYTES_PER_SAMPLE, audioChunkBytes, 0xffffffff, BYTES_PER_SAMPLE), u16(0, 0, 0, 0)]));
  const audioStrf = chunk('strf', Buffer.concat([u16(1, 1), u32(SAMPLE_RATE, SAMPLE_RATE * BYTES_PER_SAMPLE), u16(BYTES_PER_SAMPLE, 16, 0)]));
  return list('hdrl', [avih, list('strl', [videoStrh, videoStrf]), list('strl', [audioStrh, audioStrf])]);
}

function writeAviWithAudio(outPath, video, pcm) {
  const { fps, frames } = video;
  const maxFrame = Math.max(...frames.map((frame) => frame.length));
  const audioChunkBytes = SAMPLE_RATE * BYTES_PER_SAMPLE; // 1 giay tieng moi chunk
  const hdrl = buildHeader(video, pcm.length, maxFrame, audioChunkBytes);

  // Thu tu chunk: moi giay = fps khung hinh + 1 chunk tieng
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
  let position = 0;
  const write = (buffer) => { fs.writeSync(fd, buffer, 0, buffer.length, position); position += buffer.length; };
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
  fs.closeSync(fd);
}

function main() {
  const [videoPath, narrationPath, voice = 'Microsoft Zira Desktop'] = process.argv.slice(2);
  if (!videoPath || !narrationPath) {
    throw new Error('Cach dung: node demo/video/add-narration.js <video.avi> <narration.json> [ten-giong]');
  }
  const video = readMjpegAvi(videoPath);
  const totalSeconds = video.frames.length / video.fps;
  const segments = JSON.parse(fs.readFileSync(narrationPath, 'utf8'));
  console.log(`Video: ${video.frames.length} khung, ${totalSeconds.toFixed(1)}s, ${video.width}x${video.height}. Thuyet minh: ${segments.length} cau, giong ${voice}`);

  const workDir = path.join(path.dirname(videoPath), 'narration-wav');
  const clips = synthesize(segments, workDir, voice);
  // Thu dat de biet cau cuoi ket thuc luc nao; dai hon video thi giu khung cuoi them cho doc het
  const narrationEnd = estimateEnd(segments, clips);
  const neededSeconds = Math.max(totalSeconds, narrationEnd + 1);
  const extraFrames = Math.ceil((neededSeconds - totalSeconds) * video.fps);
  for (let number = 0; number < extraFrames; number += 1) {
    video.frames.push(video.frames[video.frames.length - 1]);
  }
  if (extraFrames > 0) {
    console.log(`Giu khung cuoi them ${(extraFrames / video.fps).toFixed(1)}s cho doc het cau cuoi`);
  }
  const pcm = mixNarration(segments, clips, video.frames.length / video.fps);
  const outPath = videoPath.replace(/\.avi$/i, '-voice.avi');
  writeAviWithAudio(outPath, video, pcm);
  console.log(`Da ghi video co tieng: ${outPath} (${(fs.statSync(outPath).size / 1048576).toFixed(1)} MB)`);
}

main();
