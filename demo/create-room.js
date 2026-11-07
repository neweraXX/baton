// Tao room + kenh Discord moi qua Switch (operation create_room), co san baton + ledger + Room Instructions EN.
// Dung truoc moi lan quay de room sach. Sau do chay setup-room.js de tao tai lieu room.
// Chay: node --env-file=ledger/.env --experimental-websocket demo/create-room.js <ten-kenh>

const fs = require('node:fs');
const path = require('node:path');
const client = require('./switch-client');

const API = process.env.SWITCH_API;

async function pickDiscordBridge(agent) {
  const result = await client.agentOperation(API, agent, 'list_bridges', {});
  const bridges = result.result || [];
  console.log('Bridge co san:', bridges.map((item) => `${item.name || item.id} (${item.platform || item.type || '?'})`).join(', '));
  const discord = bridges.filter((item) => JSON.stringify(item).toLowerCase().includes('discord'));
  const preferred = discord.find((item) => JSON.stringify(item).includes('fieldgo')) || discord[0];
  if (!preferred) {
    throw new Error('Khong thay bridge Discord');
  }
  return preferred.id || preferred.bridge_id;
}

async function main() {
  const name = process.argv[2];
  if (!name) {
    throw new Error('Thieu ten kenh. Vi du: ... demo/create-room.js handover-demo');
  }
  const creator = await client.ensureAgent(API, process.env.SWITCH_REG_KEY, 'ca-sang', 'Gia lap nguoi ca sang (chay tap tu dong)');
  const bridgeId = await pickDiscordBridge(creator);
  const instructions = fs.readFileSync(path.join(__dirname, '..', 'instructions', 'en', 'room-instructions.md'), 'utf8');

  const result = await client.agentOperation(API, creator, 'create_room', {
    name,
    description: 'FieldGo support shift handover (fictional data)',
    agent_names: ['baton', 'ledger'],
    bridge_id: bridgeId,
    channel_type: 'channel_public',
    instructions,
  });
  console.log('Da tao room:', JSON.stringify(result.result).slice(0, 300));
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
