// @ledger chay that trong room: nghe khoi [BATON vN] cua @baton va lenh cua nguoi.
// Chay: node --env-file=.env --experimental-websocket bot.js   (Ctrl+C de dung)
// Tuy chon trong .env: LEDGER_FAKE_NOW=15:00 (co dinh gio "hien tai" khi quay demo)

const crypto = require('node:crypto');
const path = require('node:path');
const { containsBatonBlock, parseBatonBlock } = require('./src/parse-block');
const { parseCommand } = require('./src/parse-command');
const { applyBlock, claimCase, buildStatus } = require('./src/ledger-state');
const { createFormatter } = require('./src/format');

// LEDGER_LANG=en de tra loi bang tieng Anh (demo), mac dinh tieng Viet
const format = createFormatter(process.env.LEDGER_LANG || 'vi');
const { saveLedger, loadLedger } = require('./src/store');
const { vietnamMinutes } = require('./src/clock');

const PROTOCOL_VERSION = '9';
const STATE_FILE = path.join(__dirname, 'state.json');
const OWN_NAME = 'ledger';

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thieu ${name} trong .env`);
  }
  return value;
}

// Gio VN hien tai (phut trong ngay), hoac gio co dinh LEDGER_FAKE_NOW khi quay demo
function currentMinutes() {
  return vietnamMinutes(new Date(), process.env.LEDGER_FAKE_NOW || null);
}

// Ten hien thi cho username Discord, vd LEDGER_ALIASES="ngockute=Ha,vlconga_83915=Dung" (chi doi ten hien thi,
// danh tinh van do Switch cap qua sender_name)
function displayName(senderName) {
  const aliases = Object.fromEntries(
    (process.env.LEDGER_ALIASES || '')
      .split(',')
      .map((pair) => pair.split('=').map((part) => part.trim()))
      .filter((pair) => pair.length === 2 && pair[0])
  );
  return aliases[senderName] || senderName;
}

// Bo qua tin do chinh ledger gui, tranh tu tra loi minh thanh vong lap
function isOwnMessage(payload) {
  return (payload.sender_name || '').trim().toLowerCase() === OWN_NAME;
}

async function callOperation(config, operationName, body) {
  const response = await fetch(`${config.apiUrl}/agents/${config.agentId}/ops/${operationName}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${operationName} loi ${response.status}: ${text}`);
  }
  return JSON.parse(text).result;
}

// Chon room: theo LEDGER_ROOM trong .env (mot phan ten room) neu co, khong thi room co "shift-desk"
async function findShiftRoom(config) {
  const rooms = await callOperation(config, 'list_rooms', {});
  if (rooms.length === 0) {
    throw new Error('ledger chua o room nao. Go `!invite-agent @ledger` trong kenh Discord roi chay lai.');
  }
  const wanted = process.env.LEDGER_ROOM || 'shift-desk';
  const matches = rooms.filter((room) => (room.name || '').includes(wanted));
  if (matches.length > 1) {
    console.log(`Co ${matches.length} room khop "${wanted}", dung room dau. Dat LEDGER_ROOM cho ro hon.`);
  }
  return matches[0] || rooms[0];
}

// filter=all: nghe ca tin cua @baton (khoi phieu), khong chi tin goi ten ledger
function buildSocketUrl(config, roomId, connectionId) {
  const params = new URLSearchParams({
    connection_id: connectionId,
    scope: 'single',
    rooms: roomId,
    filter: 'all',
    protocol: PROTOCOL_VERSION,
  });
  return `${config.apiUrl.replace(/^http/, 'ws')}/agents/${config.agentId}/connection/ws?${params}`;
}

async function sendReply(config, roomId, text) {
  const response = await fetch(`${config.apiUrl}/agents/${config.agentId}/message`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, content: text }),
  });
  if (!response.ok) {
    console.error(`Gui tin loi ${response.status}: ${await response.text()}`);
  }
}

// Khoi phieu -> nap vao so. Tra ve cau tra loi.
function handleBlockMessage(ledger, body) {
  const parsed = parseBatonBlock(body);
  if (!parsed.ok) {
    return format.formatParseError(parsed);
  }
  const result = applyBlock(ledger, parsed);
  if (result.ok) {
    saveLedger(STATE_FILE, ledger);
  }
  return format.formatBlockResult(result);
}

// Lenh cua nguoi. Ten nguoi lay tu Switch (sender_name), khong lay tu noi dung tin.
function handleCommandMessage(ledger, senderName, body) {
  const command = parseCommand(body);
  if (command.type === 'status') {
    return format.formatStatus(buildStatus(ledger, currentMinutes()));
  }
  if (command.type === 'claim') {
    const result = claimCase(ledger, senderName, command.caseId, command.version);
    if (result.ok) {
      saveLedger(STATE_FILE, ledger);
    }
    return format.formatClaimResult(result);
  }
  return format.formatHelp();
}

// 1 tin nhan trong room. Khoi phieu duoc xu ly du co goi ten ledger hay khong.
function buildReply(ledger, payload) {
  const body = payload.body || '';
  if (containsBatonBlock(body)) {
    return handleBlockMessage(ledger, body);
  }
  if (payload.addressed) {
    return handleCommandMessage(ledger, displayName(payload.sender_name), body);
  }
  return null;
}

async function handleMessage(config, ledger, data) {
  const payload = data.payload || {};
  if (isOwnMessage(payload)) {
    return;
  }
  const reply = buildReply(ledger, payload);
  if (reply) {
    console.log(`[${payload.sender_name}] ${payload.body}\n  -> ${reply.split('\n')[0]}`);
    await sendReply(config, data.room_id, reply);
  }
}

async function handleFrame(config, ledger, socket, frame) {
  switch (frame.event) {
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong' }));
      break;
    case 'connection_state':
      console.log('Da ket noi. Room:', JSON.stringify(frame.data.rooms));
      break;
    case 'message':
      await handleMessage(config, ledger, frame.data);
      break;
    case 'refused':
      console.error('Server tu choi ket noi:', JSON.stringify(frame.data));
      break;
    case 'evicted':
      console.error('Bi ngat ket noi:', JSON.stringify(frame.data));
      process.exit(1);
      break;
    default:
      break;
  }
}

async function main() {
  const config = {
    apiUrl: readRequiredEnv('SWITCH_API'),
    agentId: readRequiredEnv('LEDGER_AGENT_ID'),
    apiKey: readRequiredEnv('LEDGER_API_KEY'),
  };
  const ledger = loadLedger(STATE_FILE);
  console.log(`So ledger: phieu v${ledger.version}, ${ledger.cases.size} case (file ${STATE_FILE}).`);

  const room = await findShiftRoom(config);
  console.log(`Room: ${room.name} (${room.room_id})`);

  const socket = new WebSocket(buildSocketUrl(config, room.room_id, crypto.randomUUID()), {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });
  socket.onmessage = (event) => {
    handleFrame(config, ledger, socket, JSON.parse(event.data)).catch((error) =>
      console.error('Loi xu ly frame:', error.message)
    );
  };
  socket.onclose = (event) => {
    console.log(`WebSocket dong (code ${event.code}).`);
    process.exit(1);
  };
  socket.onerror = () => console.error('WebSocket loi ket noi.');
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
