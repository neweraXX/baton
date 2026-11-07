// Dung room demo tu dong (tieng Anh mac dinh): dat Room Instructions, them baton + ledger, mo quyen goi,
// nho baton tao 2 tai lieu room. KHONG moi checker (de canh "checker vao room lan dau" khi quay).
// Dieu kien: kenh Discord moi da co 1 tin nhan (de Switch tao room).
// Chay: node --env-file=ledger/.env --experimental-websocket demo/setup-room.js <mot-phan-ten-room> [en|vi]

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const client = require('./switch-client');

const API = process.env.SWITCH_API;
const ROOT = path.join(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

// Thu muc lam viec that cua agent do Switch Console tao (06/11: baton chay o day, khong phai agents\baton)
function agentWorkDir(agentName) {
  const port = new URL(API).port;
  return path.join(os.homedir(), '.switch', 'agents', `localhost-${port}`, agentName);
}

// Chep tai lieu room (vi o goc, en trong thu muc en\) vao thu muc lam viec cua agent
function copyDocsToAgent(agentName) {
  const target = agentWorkDir(agentName);
  if (!fs.existsSync(target)) {
    console.log(`Khong thay thu muc lam viec cua ${agentName}: ${target}`);
    return;
  }
  for (const lang of ['', 'en']) {
    const fromDir = path.join(ROOT, 'room-docs', lang);
    const toDir = path.join(target, lang);
    fs.mkdirSync(toDir, { recursive: true });
    for (const file of ['sop-shift-handover.md', 'escalation-matrix.md']) {
      fs.copyFileSync(path.join(fromDir, file), path.join(toDir, file));
    }
  }
  console.log(`Da chep tai lieu vao ${target}`);
}

// Ten file tuong doi trong thu muc lam viec (instructions chi cho agent doc file o day)
function docsRequest(lang) {
  const base = lang === 'en' ? 'en/' : '';
  const sop = `${base}sop-shift-handover.md`;
  const matrix = `${base}escalation-matrix.md`;
  if (lang === 'en') {
    return `@baton create 2 room documents from these files, keep the content unchanged: ${sop} (name "Shift handover SOP", instructions: "Read when you join the room. Use it to review the handover ticket.") and ${matrix} (name "Escalation matrix", instructions: "Read when you need to know who a case goes to.")`;
  }
  return `@baton tạo 2 tài liệu room từ 2 file này, giữ nguyên nội dung: ${sop} (tên "SOP bàn giao ca", instructions: "Đọc khi vào room. Dùng để soát phiếu bàn giao.") và ${matrix} (tên "Ma trận chuyển xử lý", instructions: "Đọc khi cần biết chuyển case cho ai.")`;
}

// Chay lai script khi agent da o trong room thi server co the bao loi; bo qua loi do
async function addAgentsSafely(admin, roomId, agentIds) {
  try {
    await client.addAgentsToRoom(admin, roomId, agentIds);
  } catch (error) {
    console.log(`Them agent vao room: ${error.message.slice(0, 160)} (bo qua neu agent da o trong room)`);
  }
}

async function main() {
  const roomName = process.argv[2];
  const lang = process.argv[3] || 'en';
  if (!roomName) {
    throw new Error('Thieu ten room. Vi du: node ... demo/setup-room.js baton-demo en');
  }

  const admin = await client.loginAsAdmin(API);
  const room = await client.findRoomByName(admin, roomName);
  console.log(`Room: ${room.name} (${room.id})`);

  const instructionsFile = lang === 'en' ? 'instructions/en/room-instructions.md' : 'instructions/room-instructions.md';
  await client.updateRoom(admin, room.id, {
    description: lang === 'en' ? 'FieldGo support shift handover (fictional data)' : 'Ban giao ca support FieldGo (du lieu hu cau)',
    instructions: readText(instructionsFile),
  });
  console.log(`Da dat Room Instructions tu ${instructionsFile}`);

  const agentIds = [];
  for (const name of ['baton', 'ledger', 'checker']) {
    const agent = await client.findAgentByName(admin, name);
    if (!agent) {
      console.log(`Khong thay agent ${name}`);
      continue;
    }
    await client.openAddressing(admin, agent.id);
    if (name !== 'checker') {
      agentIds.push(agent.id);
    }
  }
  await addAgentsSafely(admin, room.id, agentIds);
  console.log('Da them baton + ledger vao room, mo quyen goi baton/checker (checker CHUA moi)');
  copyDocsToAgent('baton');
  copyDocsToAgent('checker');

  const caSang = await client.ensureAgent(API, process.env.SWITCH_REG_KEY, 'ca-sang', 'Gia lap nguoi ca sang (chay tap tu dong)');
  await addAgentsSafely(admin, room.id, [caSang.id]);
  const from = Date.now();
  let created = 0;
  const socket = client.watchRoom(API, caSang, room.id, ({ sender, body }) => {
    if (sender.toLowerCase().includes('baton') && /room document/.test(body)) {
      created += 1;
      console.log(`baton: ${body}`);
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await client.postAsAgent(API, caSang, room.id, docsRequest(lang));
  console.log('Da nho baton tao tai lieu room, cho toi 3 phut...');
  while (created < 2 && Date.now() - from < 180000) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  socket.close();
  console.log(created >= 2 ? 'Xong: baton da tao 2 tai lieu.' : `Moi thay ${created}/2 tai lieu, kiem bang !list-documents.`);
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
