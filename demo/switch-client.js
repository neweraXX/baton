// Cac ham goi Switch server local cho script chay tap tu dong.
// Dang nhap admin doc tu file cau hinh server tren may (khong in mat khau).

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const SERVER_ENV_FILE = path.join(process.env.APPDATA, 'switchdash', 'local-switch-server', 'native', 'run', 'switch-core.env');
const AGENTS_FILE = path.join(__dirname, '.env.agents');

function readServerSetting(name) {
  const line = fs
    .readFileSync(SERVER_ENV_FILE, 'utf8')
    .split(/\r?\n/)
    .find((item) => item.startsWith(`${name}=`));
  if (!line) {
    throw new Error(`Khong thay ${name} trong file cau hinh server`);
  }
  return line.slice(name.length + 1).replace(/^"(.*)"$/, '$1');
}

async function readJson(response, label) {
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${label} loi ${response.status}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

// ---- Admin (gateway) ----

async function loginAsAdmin(apiUrl) {
  const response = await fetch(`${apiUrl}/gateway/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: readServerSetting('GATEWAY_ADMIN_EMAIL'), password: readServerSetting('GATEWAY_ADMIN_PASSWORD') }),
  });
  await readJson(response, 'Dang nhap admin');
  const cookie = response.headers.getSetCookie().find((item) => item.startsWith('switch_auth='));
  return { apiUrl, cookie: cookie.split(';')[0] };
}

async function adminRequest(admin, method, urlPath, body) {
  const response = await fetch(`${admin.apiUrl}/gateway${urlPath}`, {
    method,
    headers: { 'Content-Type': 'application/json', Cookie: admin.cookie },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return readJson(response, `${method} /gateway${urlPath}`);
}

async function findRoomByName(admin, namePart) {
  const rooms = await adminRequest(admin, 'GET', '/rooms');
  const list = Array.isArray(rooms) ? rooms : rooms.rooms || rooms.items || [];
  const room = list.find((item) => (item.name || '').includes(namePart));
  if (!room) {
    throw new Error(`Khong thay room co ten chua "${namePart}"`);
  }
  return room;
}

async function findAgentByName(admin, name) {
  const agents = await adminRequest(admin, 'GET', '/agents');
  const list = Array.isArray(agents) ? agents : agents.agents || agents.items || [];
  return list.find((item) => item.name === name) || null;
}

async function addAgentsToRoom(admin, roomId, agentIds) {
  return adminRequest(admin, 'POST', `/rooms/${roomId}/agents`, { agent_ids: agentIds });
}

async function updateRoom(admin, roomId, fields) {
  return adminRequest(admin, 'PATCH', `/rooms/${roomId}`, fields);
}

async function openAddressing(admin, agentId) {
  return adminRequest(admin, 'PUT', `/agents/${agentId}/addressing-policy`, { policy: null });
}

// ---- Agent gia lap (ca-sang, ca-chieu) ----

function loadSavedAgents() {
  if (!fs.existsSync(AGENTS_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf8'));
}

function saveAgents(agents) {
  fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
}

async function registerAgent(apiUrl, regKey, name, description) {
  const response = await fetch(`${apiUrl}/agents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${regKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      description,
      connector_type: 'rehearsal-script',
      integration_profile: {
        connection_model: 'always_on',
        message_exchange: true,
        pre_invocation_mediation: [],
        post_invocation_mediation: [],
        event_reporting: [],
      },
    }),
  });
  return readJson(response, `Dang ky ${name}`);
}

// Lay agent da luu, chua co thi dang ky moi va luu id + key vao demo/.env.agents
async function ensureAgent(apiUrl, regKey, name, description) {
  const saved = loadSavedAgents();
  if (saved[name]) {
    return { name, ...saved[name] };
  }
  const result = await registerAgent(apiUrl, regKey, name, description);
  saved[name] = { id: result.id, apiKey: result.api_key };
  saveAgents(saved);
  return { name, id: result.id, apiKey: result.api_key };
}

async function postAsAgent(apiUrl, agent, roomId, text) {
  const response = await fetch(`${apiUrl}/agents/${agent.id}/message`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${agent.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, content: text }),
  });
  return readJson(response, `${agent.name} gui tin`);
}

async function agentOperation(apiUrl, agent, operationName, body) {
  const response = await fetch(`${apiUrl}/agents/${agent.id}/ops/${operationName}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${agent.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJson(response, `${agent.name} ${operationName}`);
}

// Nghe moi tin trong room (filter=all) bang ket noi cua 1 agent gia lap.
// onMessage({ sender, body }) duoc goi cho tung tin.
function watchRoom(apiUrl, agent, roomId, onMessage) {
  const params = new URLSearchParams({
    connection_id: crypto.randomUUID(),
    scope: 'single',
    rooms: roomId,
    filter: 'all',
    protocol: '9',
  });
  const socket = new WebSocket(`${apiUrl.replace(/^http/, 'ws')}/agents/${agent.id}/connection/ws?${params}`, {
    headers: { Authorization: `Bearer ${agent.apiKey}` },
  });
  socket.onmessage = (event) => {
    const frame = JSON.parse(event.data);
    if (frame.event === 'ping') {
      socket.send(JSON.stringify({ type: 'pong' }));
    } else if (frame.event === 'message') {
      const payload = frame.data.payload || {};
      onMessage({ sender: payload.sender_name || '?', body: payload.body || '' });
    } else if (frame.event === 'refused' || frame.event === 'evicted') {
      console.error(`Ket noi nghe room bi ${frame.event}:`, JSON.stringify(frame.data));
    }
  };
  return socket;
}

module.exports = {
  loginAsAdmin,
  findRoomByName,
  findAgentByName,
  addAgentsToRoom,
  updateRoom,
  openAddressing,
  ensureAgent,
  postAsAgent,
  agentOperation,
  watchRoom,
};
