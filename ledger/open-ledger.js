// Mo quyen goi @ledger cho moi nguoi trong room (addressing policy = null).
// Ly do: ledger dang ky bang key bootstrap nen chu cua no khong phai Ha, Console khong hien nut doi.
// Cach lam: dang nhap admin cua server local -> PUT /gateway/agents/{id}/addressing-policy.
// Doc tai khoan admin tu file cau hinh server tren may nay, KHONG in mat khau ra man hinh.
// Chay: node --env-file=.env open-ledger.js   (chi chay 1 lan)

const fs = require('node:fs');
const path = require('node:path');

const SERVER_ENV_FILE = path.join(
  process.env.APPDATA,
  'switchdash',
  'local-switch-server',
  'native',
  'run',
  'switch-core.env'
);

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thieu ${name} trong .env`);
  }
  return value;
}

// Lay 1 bien KEY=VALUE tu file cau hinh server
function readServerSetting(name) {
  const lines = fs.readFileSync(SERVER_ENV_FILE, 'utf8').split(/\r?\n/);
  const line = lines.find((item) => item.startsWith(`${name}=`));
  if (!line) {
    throw new Error(`Khong thay ${name} trong ${SERVER_ENV_FILE}`);
  }
  return line.slice(name.length + 1).replace(/^"(.*)"$/, '$1');
}

// Dang nhap admin, tra ve cookie phien "switch_auth=..."
async function loginAsAdmin(apiUrl) {
  const response = await fetch(`${apiUrl}/gateway/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: readServerSetting('GATEWAY_ADMIN_EMAIL'),
      password: readServerSetting('GATEWAY_ADMIN_PASSWORD'),
    }),
  });
  if (!response.ok) {
    throw new Error(`Dang nhap admin loi ${response.status}: ${await response.text()}`);
  }
  const cookie = response.headers.getSetCookie().find((item) => item.startsWith('switch_auth='));
  if (!cookie) {
    throw new Error('Dang nhap xong nhung khong nhan duoc cookie switch_auth');
  }
  return cookie.split(';')[0];
}

// policy = null nghia la ai trong room cung goi duoc agent
async function openAddressingPolicy(apiUrl, cookie, agentId) {
  const response = await fetch(`${apiUrl}/gateway/agents/${agentId}/addressing-policy`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ policy: null }),
  });
  return { status: response.status, body: await response.text() };
}

async function main() {
  const apiUrl = readRequiredEnv('SWITCH_API');
  const agentId = readRequiredEnv('LEDGER_AGENT_ID');

  const cookie = await loginAsAdmin(apiUrl);
  console.log('Dang nhap admin: OK');

  const { status, body } = await openAddressingPolicy(apiUrl, cookie, agentId);
  console.log(`Doi quyen goi ledger: status ${status}`);
  if (status !== 200) {
    console.log('Loi tu server:', body);
    process.exitCode = 1;
    return;
  }
  const agent = JSON.parse(body);
  console.log(`Xong: ${agent.name} gio ai trong room cung goi duoc.`);
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
