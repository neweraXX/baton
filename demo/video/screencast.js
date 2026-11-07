// Ghi video 1 tab trinh duyet qua CDP Page.startScreencast -> file AVI MJPEG.
// Trinh duyet chi gui khung khi trang thay doi. Bo dem tinh so khung CAN CO theo thoi gian that da troi qua
// va lap lai khung moi nhat cho du, nen video dung thoi luong du timer bi tre (review Codex 07/11).

const { AviMjpegWriter, jpegSize } = require('./avi-writer');

class ScreencastRecorder {
  constructor(session, filePath, { fps = 12, quality = 70, maxWidth = 1280, maxHeight = 1440 } = {}) {
    this.session = session;
    this.filePath = filePath;
    this.fps = fps;
    this.options = { format: 'jpeg', quality, maxWidth, maxHeight, everyNthFrame: 1 };
    this.latestFrame = null;
    this.frameSize = null;
    this.droppedFrames = 0;
    this.writeError = null;
    this.writer = null;
    this.timer = null;
    this.startedAt = 0;
  }

  // Giu khung moi nhat; bo khung khac kich thuoc khung dau (header AVI chi khai 1 kich thuoc)
  acceptFrame(jpeg) {
    const size = jpegSize(jpeg);
    if (!this.frameSize) {
      this.frameSize = size;
    }
    if (size.width !== this.frameSize.width || size.height !== this.frameSize.height) {
      this.droppedFrames += 1;
      return;
    }
    this.latestFrame = jpeg;
  }

  // Ghi them khung cho toi khi so khung khop thoi gian that
  catchUp() {
    if (!this.latestFrame || this.writeError) {
      return;
    }
    const due = Math.floor(((Date.now() - this.startedAt) / 1000) * this.fps);
    try {
      while (this.writer.index.length < due) {
        this.writer.addFrame(this.latestFrame);
      }
    } catch (error) {
      this.writeError = error;
      console.error(`Loi ghi video, dung them khung: ${error.message}`);
    }
  }

  async start() {
    this.writer = new AviMjpegWriter(this.filePath, this.fps);
    this.session.on('Page.screencastFrame', (params) => {
      this.acceptFrame(Buffer.from(params.data, 'base64'));
      // Phai bao da nhan, khong thi trinh duyet ngung gui khung
      this.session.send('Page.screencastFrameAck', { sessionId: params.sessionId }).catch(() => {});
    });
    await this.session.send('Page.startScreencast', this.options);
    this.startedAt = Date.now();
    this.timer = setInterval(() => this.catchUp(), Math.round(1000 / this.fps));
  }

  async stop() {
    clearInterval(this.timer);
    this.catchUp();
    await this.session.send('Page.stopScreencast').catch(() => {});
    const result = this.writer.finish();
    return { ...result, droppedFrames: this.droppedFrames, writeError: this.writeError ? this.writeError.message : null };
  }
}

module.exports = { ScreencastRecorder };
