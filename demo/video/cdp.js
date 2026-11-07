// Client Chrome DevTools Protocol toi gian, chi dung WebSocket + fetch co san cua Node (khong cai thu vien).
// Dung de dieu khien 1 profile trinh duyet GPM da mo cong debug.

// Lay danh sach tab cua trinh duyet dang mo cong debug (vd "127.0.0.1:53211")
async function listPages(debugAddress) {
  const response = await fetch(`http://${debugAddress}/json/list`);
  const targets = await response.json();
  return targets.filter((target) => target.type === 'page');
}

// 1 ket noi CDP toi 1 tab. send() tra ve Promise ket qua theo id.
class CdpSession {
  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = new Map();
    socket.onmessage = (event) => this.handleMessage(JSON.parse(event.data));
    // Ket noi dong thi bao loi moi lenh dang cho, tranh treo mai (review Codex 07/11)
    socket.onclose = () => {
      for (const { reject } of this.pending.values()) {
        reject(new Error('Ket noi CDP da dong'));
      }
      this.pending.clear();
    };
  }

  // Nghe su kien CDP, vd on('Page.screencastFrame', (params) => ...)
  on(method, handler) {
    this.listeners.set(method, handler);
  }

  handleMessage(message) {
    if (message.method && this.listeners.has(message.method)) {
      this.listeners.get(message.method)(message.params);
      return;
    }
    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) {
        reject(new Error(`${message.error.message} (${message.error.code})`));
      } else {
        resolve(message.result);
      }
    }
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    this.socket.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }

  // Chay JS trong trang, tra ve gia tri (await duoc Promise)
  async evaluate(expression) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (result.exceptionDetails) {
      throw new Error(`Loi JS trong trang: ${result.exceptionDetails.text}`);
    }
    return result.result.value;
  }

  close() {
    this.socket.close();
  }
}

function openSession(webSocketUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(webSocketUrl);
    socket.onopen = () => resolve(new CdpSession(socket));
    socket.onerror = () => reject(new Error(`Khong mo duoc ket noi CDP ${webSocketUrl}`));
  });
}

// Mo ket noi toi tab dau tien cua profile
async function connectToFirstPage(debugAddress) {
  const pages = await listPages(debugAddress);
  if (pages.length === 0) {
    throw new Error(`Profile ${debugAddress} khong co tab nao`);
  }
  return openSession(pages[0].webSocketDebuggerUrl);
}

module.exports = { listPages, openSession, connectToFirstPage };
