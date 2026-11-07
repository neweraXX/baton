// Dang ky agent "ledger" voi Switch server. Chi chay 1 lan.
// Chay: node --env-file=.env register.js
// Thanh cong thi ghi LEDGER_AGENT_ID va LEDGER_API_KEY vao cuoi file .env

const fs = require('node:fs');
const path = require('node:path');

const ENV_FILE = path.join(__dirname, '.env');

// Body ma server can de tao 1 agent tu viet (khong phai Claude/Codex)
function buildRegisterBody() {
  return {
    name: 'ledger',
    description: 'So loi hua ban giao ca, khong dung LLM',
    connector_type: 'ledger',
    integration_profile: {
      connection_model: 'always_on',
      message_exchange: true,
      pre_invocation_mediation: [],
      post_invocation_mediation: [],
      event_reporting: [],
    },
  };
}

// Gui yeu cau dang ky, tra ve { status, body }
async function registerAgent(apiUrl, regKey) {
  const response = await fetch(`${apiUrl}/agents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${regKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(buildRegisterBody()),
  });
  const text = await response.text();
  return { status: response.status, body: text };
}

// Ghi id + key cua ledger vao .env de cac script sau dung
function saveCredentials(agentId, apiKey) {
  const current = fs.readFileSync(ENV_FILE, 'utf8');
  if (current.includes('LEDGER_AGENT_ID=')) {
    throw new Error('.env da co LEDGER_AGENT_ID, khong ghi de. Kiem tra lai file .env.');
  }
  const lines = `\nLEDGER_AGENT_ID=${agentId}\nLEDGER_API_KEY=${apiKey}\n`;
  fs.appendFileSync(ENV_FILE, lines);
}

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Thieu ${name} trong .env`);
  }
  return value;
}

async function main() {
  const apiUrl = readRequiredEnv('SWITCH_API');
  const regKey = readRequiredEnv('SWITCH_REG_KEY');

  const { status, body } = await registerAgent(apiUrl, regKey);
  console.log(`Status: ${status}`);

  if (status !== 200 && status !== 201) {
    console.log('Loi tu server:', body);
    process.exitCode = 1;
    return;
  }

  const result = JSON.parse(body);
  saveCredentials(result.id, result.api_key);
  console.log(`Da dang ky ledger, agent id = ${result.id}`);
  console.log('Da ghi LEDGER_AGENT_ID va LEDGER_API_KEY vao .env (khong in key ra man hinh).');
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
