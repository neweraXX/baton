// Ban nho nhat cua @ledger: nhan tin @ledger trong room, tra loi "pong".
// Dieu kien: da chay register.js, va da `!invite-agent @ledger` trong kenh Discord.
// Chay: node --env-file=.env --experimental-websocket pong.js   (Ctrl+C de dung)

const crypto = require('node:crypto');

const PROTOCOL_VERSION = '9';

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thieu ${name} trong .env`);
  }
  return value;
}

// Goi 1 "operation" cua agent protocol: POST /agents/{id}/ops/{ten}
// Server boc ket qua trong { result: ... }
async function callOperation(config, operationName, body) {
  const response = await fetch(`${config.apiUrl}/agents/${config.agentId}/ops/${operationName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${operationName} loi ${response.status}: ${text}`);
  }
  return JSON.parse(text).result;
}

// Tim room ban giao ca trong cac room ledger da duoc moi vao
async function findShiftRoom(config) {
  const rooms = await callOperation(config, 'list_rooms', {});
  if (rooms.length === 0) {
    throw new Error('ledger chua o room nao. Go `!invite-agent @ledger` trong kenh Discord roi chay lai.');
  }
  const shiftRoom = rooms.find((room) => (room.name || '').includes('shift-desk'));
  return shiftRoom || rooms[0];
}

// URL WebSocket: chi nhan tin goi dich danh ledger (filter=addressed), trong 1 room
function buildSocketUrl(config, roomId, connectionId) {
  const wsBase = config.apiUrl.replace(/^http/, 'ws');
  const params = new URLSearchParams({
    connection_id: connectionId,
    scope: 'single',
    rooms: roomId,
    filter: 'addressed',
    protocol: PROTOCOL_VERSION,
  });
  return `${wsBase}/agents/${config.agentId}/connection/ws?${params}`;
}

// Gui 1 tin vao room: POST /agents/{id}/message, field ten la "content"
async function sendReply(config, roomId, text) {
  const response = await fetch(`${config.apiUrl}/agents/${config.agentId}/message`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ room_id: roomId, content: text }),
  });
  if (!response.ok) {
    console.error(`Gui tin loi ${response.status}: ${await response.text()}`);
  }
}

// Tin nhan den: noi dung o data.payload.body, chi tra loi khi addressed = true
async function handleMessage(config, data) {
  const payload = data.payload || {};
  if (!payload.addressed) {
    return;
  }
  console.log(`Nhan tu ${payload.sender_name}: ${payload.body}`);
  await sendReply(config, data.room_id, `pong (ledger nhan duoc: "${payload.body}")`);
}

// Xu ly tung frame server gui qua WebSocket
async function handleFrame(config, socket, frame) {
  switch (frame.event) {
    case 'ping':
      // Heartbeat: server ping moi 10s, khong dap trong 30s la mat ket noi
      socket.send(JSON.stringify({ type: 'pong' }));
      break;
    case 'connection_state':
      console.log('Da ket noi. Room:', JSON.stringify(frame.data.rooms));
      break;
    case 'message':
      await handleMessage(config, frame.data);
      break;
    case 'refused':
      console.error('Server tu choi ket noi:', JSON.stringify(frame.data));
      break;
    case 'evicted':
      console.error('Bi ngat ket noi:', JSON.stringify(frame.data));
      process.exit(1);
      break;
    default:
      console.log('Frame khac:', frame.event);
  }
}

async function main() {
  const config = {
    apiUrl: readRequiredEnv('SWITCH_API'),
    agentId: readRequiredEnv('LEDGER_AGENT_ID'),
    apiKey: readRequiredEnv('LEDGER_API_KEY'),
  };

  const room = await findShiftRoom(config);
  console.log(`Room: ${room.name} (${room.room_id})`);

  const connectionId = crypto.randomUUID();
  const socket = new WebSocket(buildSocketUrl(config, room.room_id, connectionId), {
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });

  socket.onmessage = (event) => {
    const frame = JSON.parse(event.data);
    handleFrame(config, socket, frame).catch((error) => console.error('Loi xu ly frame:', error.message));
  };
  socket.onclose = (event) => {
    console.log(`WebSocket dong (code ${event.code}).`);
    process.exit(1);
  };
  socket.onerror = () => {
    console.error('WebSocket loi ket noi.');
  };
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
