// Ghi file video AVI dang MJPEG (moi khung hinh la 1 anh JPEG) bang Node thuan, khong can ffmpeg.
// Cau truc: RIFF 'AVI ' { LIST hdrl { avih, LIST strl { strh, strf } }, LIST movi { 00dc... }, idx1 }.
// Cac truong kich thuoc / so khung duoc ghi tam 0 roi sua lai khi finish().

const fs = require('node:fs');

const HEADER_BYTES = 220; // RIFF(12) + LIST hdrl(8 + 192) + 'LIST' + size + 'movi' (12) -> du lieu khung bat dau tai 224

// Doc kich thuoc anh tu marker SOF cua JPEG
function jpegSize(buffer) {
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);
    const isStartOfFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
    if (isStartOfFrame) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error('Khong doc duoc kich thuoc JPEG');
}

function fourcc(text) {
  return Buffer.from(text, 'ascii');
}

class AviMjpegWriter {
  constructor(filePath, fps) {
    this.filePath = filePath;
    this.fps = fps;
    this.fd = fs.openSync(filePath, 'w');
    this.position = HEADER_BYTES + 4; // sau 'movi'
    this.index = [];
    this.maxFrameBytes = 0;
    this.width = 0;
    this.height = 0;
    fs.writeSync(this.fd, Buffer.alloc(HEADER_BYTES + 4), 0, HEADER_BYTES + 4, 0);
  }

  addFrame(jpeg) {
    if (this.index.length === 0) {
      Object.assign(this, jpegSize(jpeg));
    }
    const padded = jpeg.length % 2 === 1 ? Buffer.concat([jpeg, Buffer.alloc(1)]) : jpeg;
    const chunkHeader = Buffer.alloc(8);
    fourcc('00dc').copy(chunkHeader, 0);
    chunkHeader.writeUInt32LE(jpeg.length, 4);
    // offset trong idx1 tinh tu vi tri FOURCC 'movi' (byte 220)
    this.index.push({ offset: this.position - HEADER_BYTES, size: jpeg.length });
    fs.writeSync(this.fd, chunkHeader, 0, 8, this.position);
    fs.writeSync(this.fd, padded, 0, padded.length, this.position + 8);
    this.position += 8 + padded.length;
    this.maxFrameBytes = Math.max(this.maxFrameBytes, jpeg.length);
  }

  buildHeader() {
    const frames = this.index.length;
    const header = Buffer.alloc(HEADER_BYTES + 4);
    let at = 0;
    const writeText = (text) => { fourcc(text).copy(header, at); at += 4; };
    const writeU32 = (value) => { header.writeUInt32LE(value >>> 0, at); at += 4; };
    const writeU16 = (value) => { header.writeUInt16LE(value, at); at += 2; };

    const moviBytes = this.position - HEADER_BYTES; // 'movi' + cac chunk
    const idxBytes = 8 + frames * 16;
    writeText('RIFF'); writeU32(this.position + idxBytes - 8); writeText('AVI ');
    writeText('LIST'); writeU32(192); writeText('hdrl');
    writeText('avih'); writeU32(56);
    writeU32(Math.round(1000000 / this.fps)); // micro giay moi khung
    writeU32(this.maxFrameBytes * this.fps);   // byte/giay toi da
    writeU32(0);                                // padding
    writeU32(0x10);                             // AVIF_HASINDEX
    writeU32(frames);
    writeU32(0);
    writeU32(1);                                // 1 luong video
    writeU32(this.maxFrameBytes);
    writeU32(this.width); writeU32(this.height);
    writeU32(0); writeU32(0); writeU32(0); writeU32(0);
    writeText('LIST'); writeU32(116); writeText('strl');
    writeText('strh'); writeU32(56);
    writeText('vids'); writeText('MJPG');
    writeU32(0); writeU16(0); writeU16(0); writeU32(0);
    writeU32(1); writeU32(this.fps);            // scale / rate = fps
    writeU32(0); writeU32(frames);
    writeU32(this.maxFrameBytes);
    writeU32(0xffffffff);                       // chat luong mac dinh
    writeU32(0);
    writeU16(0); writeU16(0); writeU16(this.width); writeU16(this.height);
    writeText('strf'); writeU32(40);
    writeU32(40); writeU32(this.width); writeU32(this.height);
    writeU16(1); writeU16(24); writeText('MJPG');
    writeU32(this.width * this.height * 3);
    writeU32(0); writeU32(0); writeU32(0); writeU32(0);
    writeText('LIST'); writeU32(moviBytes); writeText('movi');
    return header;
  }

  finish() {
    const idx = Buffer.alloc(8 + this.index.length * 16);
    fourcc('idx1').copy(idx, 0);
    idx.writeUInt32LE(this.index.length * 16, 4);
    this.index.forEach((entry, number) => {
      const at = 8 + number * 16;
      fourcc('00dc').copy(idx, at);
      idx.writeUInt32LE(0x10, at + 4); // AVIIF_KEYFRAME (MJPEG: khung nao cung la khung khoa)
      idx.writeUInt32LE(entry.offset, at + 8);
      idx.writeUInt32LE(entry.size, at + 12);
    });
    fs.writeSync(this.fd, idx, 0, idx.length, this.position);
    const header = this.buildHeader();
    fs.writeSync(this.fd, header, 0, header.length, 0);
    fs.closeSync(this.fd);
    return { frames: this.index.length, seconds: this.index.length / this.fps, width: this.width, height: this.height };
  }
}

module.exports = { AviMjpegWriter, jpegSize };
