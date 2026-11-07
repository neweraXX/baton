// Doc cac tin gan nhat cua 1 room (chi doc), dung de go loi khi chay tap.
// Chay: node --env-file=ledger/.env demo/peek-room.js <room-id> [so-tin]

const fs = require('node:fs');
const path = require('node:path');

async function main() {
  const roomId = process.argv[2];
  const limit = Number(process.argv[3] || 15);
  const agents = JSON.parse(fs.readFileSync(path.join(__dirname, '.env.agents'), 'utf8'));
  const reader = agents['ca-sang'] || Object.values(agents)[0];

  const response = await fetch(`${process.env.SWITCH_API}/agents/${reader.id}/ops/read_context`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${reader.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ room_id: roomId, limit }),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`read_context loi ${response.status}: ${text}`);
  }
  const result = JSON.parse(text).result;
  // Moi thread: { root: tin goc, replies: [tin tra loi trong thread] }
  for (const thread of result.threads || []) {
    for (const message of [thread.root, ...(thread.replies || [])]) {
      const time = new Date(message.timestamp).toLocaleTimeString('vi-VN');
      const body = String(message.body || '').replace(/\s+/g, ' ').slice(0, 220);
      console.log(`[${time}] ${message.sender_name}: ${body}`);
    }
  }
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
