// Chay tap kich ban video TU DONG trong room that: 2 agent gia lap "ca-sang" va "ca-chieu"
// gui tin theo kich ban; baton, checker (LLM) va ledger (code) that tra loi. Ghi lai toan bo hoi thoai.
// Can: ledger bot.js dang chay (so moi, LEDGER_FAKE_NOW=15:00, cung LEDGER_LANG), checker CHUA o trong room.
// Chay: node --env-file=ledger/.env --experimental-websocket demo/rehearse.js
//   bien moi truong: LEDGER_ROOM (mot phan ten room), LEDGER_LANG (vi | en)

const fs = require('node:fs');
const path = require('node:path');
const client = require('./switch-client');
const { parseBatonBlock } = require('../ledger/src/parse-block');

const API = process.env.SWITCH_API;
const ROOM_NAME = process.env.LEDGER_ROOM || 'fieldgo-shift-desk';
const LANG = process.env.LEDGER_LANG === 'en' ? 'en' : 'vi';

// Tin cua 2 vai va mau nhan dien cau tra loi cua ledger, theo ngon ngu
const SCRIPT = {
  vi: {
    morningName: 'ca-sang',
    afternoonName: 'ca-chieu',
    cases: 'Bàn giao ca sáng nhé. SR-1077: FieldGo không đồng bộ đơn của NPP Hòa Phát, đang chờ vendor NovaSoft gửi bản vá, mình đã hứa gọi lại khách lúc 16:00. CS-1106-003: chờ L2 gửi log, chưa hẹn giờ với khách. SR-1080: khách không đăng nhập được, đang chờ khách gửi ảnh màn hình, hứa cập nhật qua FieldGo lúc 17:00.',
    askTicket: '@baton lập phiếu bàn giao',
    claim: (caseId, version) => `@ledger nhận ${caseId} v${version}`,
    hold: '@baton khoan ra phiếu mới nhé, chờ checker soát đã.',
    timeChange: 'Khách SR-1077 vừa gọi lại: đổi sang gọi lúc 15:30 thay vì 16:00, vẫn chờ NovaSoft.',
    askChecker: '@checker soát phiếu hiện hành giúp',
    askNewTicket: '@baton ra phiếu mới theo góp ý của checker',
    status: '@ledger status',
    question: '@baton SR-1077 gọi cho khách thì nói sao?',
    recorded: /Đã ghi phiếu bàn giao v(\d+)/,
    claimed: 'đã nhận',
    done: 'Bàn giao xong',
  },
  en: {
    morningName: 'ha-morning',
    afternoonName: 'dung-afternoon',
    cases: 'Morning handover. SR-1077: FieldGo is not syncing orders for distributor Hoa Phat, waiting on vendor NovaSoft for a patch, I promised to call the customer back at 16:00. CS-1106-003: waiting on L2 for logs, no time promised to the customer. SR-1080: customer cannot log in, waiting on the customer for a screenshot, promised an update via FieldGo at 17:00.',
    askTicket: '@baton please draft the handover ticket',
    claim: (caseId, version) => `@ledger claim ${caseId} v${version}`,
    hold: '@baton hold off on a new ticket, let checker review first.',
    timeChange: 'Customer on SR-1077 just called back: move the callback to 15:30 instead of 16:00, still waiting on NovaSoft.',
    askChecker: '@checker please review the current ticket',
    askNewTicket: "@baton please issue a new ticket based on checker's review",
    status: '@ledger status',
    question: '@baton what should I tell the customer when I call on SR-1077?',
    recorded: /Recorded handover ticket v(\d+)/,
    claimed: 'claimed',
    done: 'Handover complete',
  },
}[LANG];

const transcript = [];
const checks = [];

function log(text) {
  console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${text}`);
}

function record(sender, body) {
  transcript.push({ time: new Date().toLocaleTimeString('vi-VN'), sender, body });
  log(`${sender}: ${body.split('\n')[0].slice(0, 120)}`);
}

function isFrom(message, name) {
  return message.sender.toLowerCase().includes(name);
}

// Tin he thong cua agent (chao, "dang bat dau phien", "da tao/cap nhat tai lieu"), khong phai cau tra loi that
function isNotice(message) {
  return /^(📄|Starting a session|Hello! Tag)/.test(message.body.trim());
}

// Tin tra loi that cua agent `name`
function isAnswerFrom(message, name) {
  return isFrom(message, name) && !isNotice(message) && message.body.length > 40;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cho toi khi co tin (tu vi tri `from`) thoa dieu kien, het gio thi tra null
async function waitFor(predicate, timeoutSec, from = transcript.length) {
  const deadline = Date.now() + timeoutSec * 1000;
  while (Date.now() < deadline) {
    const found = transcript.slice(from).find(predicate);
    if (found) {
      return found;
    }
    await sleep(500);
  }
  return null;
}

function check(name, ok, detail = '') {
  checks.push({ name, ok: Boolean(ok), detail });
  log(`${ok ? 'DAT  ' : 'TRUOT'} ${name}${detail ? ` (${detail})` : ''}`);
}

function firstLine(message) {
  return message ? message.body.split('\n')[0] : 'khong tra loi';
}

function latestBatonBlock() {
  for (let index = transcript.length - 1; index >= 0; index -= 1) {
    const message = transcript[index];
    if (isFrom(message, 'baton') && /\[BATON v\d+\]/.test(message.body)) {
      return parseBatonBlock(message.body);
    }
  }
  return null;
}

function ledgerVersionIn(message) {
  const match = SCRIPT.recorded.exec(message.body);
  return match ? Number(match[1]) : null;
}

async function say(agent, roomId, text) {
  await client.postAsAgent(API, agent, roomId, text);
}

// Gui lenh ledger roi cho ledger tra loi
async function askLedger(agent, roomId, text) {
  const from = transcript.length;
  await say(agent, roomId, text);
  return waitFor((message) => isFrom(message, 'ledger'), 30, from);
}

async function setup() {
  const admin = await client.loginAsAdmin(API);
  const room = await client.findRoomByName(admin, ROOM_NAME);
  log(`Room: ${room.name} (${room.id}), ngon ngu: ${LANG}`);

  const caSang = await client.ensureAgent(API, process.env.SWITCH_REG_KEY, SCRIPT.morningName, 'Simulated morning-shift person (automated rehearsal)');
  const caChieu = await client.ensureAgent(API, process.env.SWITCH_REG_KEY, SCRIPT.afternoonName, 'Simulated afternoon-shift person (automated rehearsal)');
  await client.addAgentsToRoom(admin, room.id, [caSang.id, caChieu.id]);

  // Agent gia lap thuoc chu khac, nen baton va checker phai mo quyen goi (server rieng cua Ha)
  for (const name of ['baton', 'checker']) {
    const agent = await client.findAgentByName(admin, name);
    if (agent) {
      await client.openAddressing(admin, agent.id);
    }
  }
  return { room, caSang, caChieu };
}

async function stepCasesAndFirstTicket(roomId, caSang) {
  await say(caSang, roomId, SCRIPT.cases);
  await sleep(2000);
  const from = transcript.length;
  await say(caSang, roomId, SCRIPT.askTicket);
  const block = await waitFor((message) => isFrom(message, 'baton') && /\[BATON v\d+\]/.test(message.body), 240, from);
  check('B1 baton ra phieu', block, block ? '' : 'het 240s khong thay khoi');
  const recorded = await waitFor((message) => isFrom(message, 'ledger') && ledgerVersionIn(message), 30, from);
  check('B1 ledger ghi phieu', recorded, firstLine(recorded));
  const parsed = latestBatonBlock();
  if (parsed && parsed.ok) {
    const sr1077 = parsed.cases.find((item) => item.id === 'SR-1077');
    check('B1 trich dung 3 case', parsed.cases.length === 3, parsed.cases.map((item) => item.id).join(','));
    check('B1 SR-1077 hua 16:00', sr1077 && sr1077.promiseMin === 16 * 60);
  }
  return recorded ? ledgerVersionIn(recorded) : null;
}

async function stepClaimAndTimeChange(roomId, caSang, caChieu, version) {
  const reply = await askLedger(caChieu, roomId, SCRIPT.claim('SR-1077', version));
  check('B2 ca chieu nhan SR-1077', reply && reply.body.includes(SCRIPT.claimed), firstLine(reply));
  const from = transcript.length;
  await say(caSang, roomId, SCRIPT.hold);
  await waitFor((message) => isAnswerFrom(message, 'baton'), 120, from);
  await say(caSang, roomId, SCRIPT.timeChange);
  await sleep(5000);
}

async function stepChecker(roomId, caSang) {
  const from = transcript.length;
  await client.agentOperation(API, caSang, 'invite_agent_to_room', { room_id: roomId, agent_name: 'checker' });
  log('Da moi checker vao room');
  // Tap 06/11: checker chi chao khi vao room, khong tu soat -> goi ten (khong dan gi them)
  let found = await waitFor((message) => isAnswerFrom(message, 'checker'), 30, from);
  if (!found) {
    await say(caSang, roomId, SCRIPT.askChecker);
    found = await waitFor((message) => isAnswerFrom(message, 'checker'), 240, from);
  }
  check('B3 checker soat phieu', found);
  const said = transcript.slice(from).filter((message) => isAnswerFrom(message, 'checker')).map((message) => message.body).join('\n');
  check('B3 checker bat gio cu 16:00 -> 15:30', said.includes('15:30'));
  check('B3 checker khong viet [BATON v', !/\[BATON v/.test(said));
}

async function stepNewTicket(roomId, caSang, oldVersion) {
  const from = transcript.length;
  let recorded = await waitFor((message) => isFrom(message, 'ledger') && ledgerVersionIn(message) > oldVersion, 45, from);
  if (!recorded) {
    await say(caSang, roomId, SCRIPT.askNewTicket);
    recorded = await waitFor((message) => isFrom(message, 'ledger') && ledgerVersionIn(message) > oldVersion, 240, from);
  }
  check('B4 ledger ghi phieu moi', recorded, firstLine(recorded));
  check('B4 ledger bao R3 doi gio', recorded && recorded.body.includes('(R3)'));
  const parsed = latestBatonBlock();
  if (parsed && parsed.ok) {
    const sr1077 = parsed.cases.find((item) => item.id === 'SR-1077');
    check('B4 phieu moi SR-1077 hua 15:30', sr1077 && sr1077.promiseMin === 15 * 60 + 30);
  }
  return recorded ? { version: ledgerVersionIn(recorded), cases: parsed && parsed.ok ? parsed.cases : [] } : null;
}

async function stepClaimAll(roomId, caChieu, oldVersion, current) {
  const stale = await askLedger(caChieu, roomId, SCRIPT.claim('CS-1106-003', oldVersion));
  check('B4 nhan theo phieu cu bi R2', stale && stale.body.includes('(R2)'), firstLine(stale));
  for (const caseData of current.cases) {
    const reply = await askLedger(caChieu, roomId, SCRIPT.claim(caseData.id, current.version));
    check(`B4 nhan ${caseData.id} v${current.version}`, reply && reply.body.includes(SCRIPT.claimed), firstLine(reply));
  }
  const status = await askLedger(caChieu, roomId, SCRIPT.status);
  check('B4 status ban giao xong', status && status.body.includes(SCRIPT.done), status ? status.body.split('\n').slice(-1)[0] : '-');
}

async function stepQuestion(roomId, caChieu) {
  const from = transcript.length;
  await say(caChieu, roomId, SCRIPT.question);
  const answer = await waitFor((message) => isAnswerFrom(message, 'baton'), 180, from);
  check('B5 baton tra loi', answer);
  check('B5 tra loi co moc 15:30', answer && answer.body.includes('15:30'));
}

function writeReport(roomName) {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  const file = path.join(__dirname, `rehearsal-${LANG}-${stamp}.md`);
  const passed = checks.filter((item) => item.ok).length;
  const lines = [`# Chạy tập tự động ${new Date().toLocaleString('vi-VN')} (${LANG})`, '', `Room: ${roomName}. **${passed}/${checks.length} điểm kiểm đạt.**`, '', '## Điểm kiểm', ''];
  for (const item of checks) {
    lines.push(`- ${item.ok ? '✅' : '❌'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
  }
  lines.push('', '## Hội thoại', '');
  for (const message of transcript) {
    lines.push(`**${message.sender}** (${message.time}):`, '', message.body, '');
  }
  fs.writeFileSync(file, lines.join('\n'));
  return { file, passed };
}

async function main() {
  const { room, caSang, caChieu } = await setup();
  const socket = client.watchRoom(API, caSang, room.id, ({ sender, body }) => record(sender, body));
  await sleep(3000);
  try {
    const firstVersion = await stepCasesAndFirstTicket(room.id, caSang);
    if (firstVersion) {
      await stepClaimAndTimeChange(room.id, caSang, caChieu, firstVersion);
      await stepChecker(room.id, caSang);
      const current = await stepNewTicket(room.id, caSang, firstVersion);
      if (current) {
        await stepClaimAll(room.id, caChieu, firstVersion, current);
      }
      await stepQuestion(room.id, caChieu);
    }
  } finally {
    socket.close();
    const { file, passed } = writeReport(room.name);
    log(`Xong: ${passed}/${checks.length} diem kiem dat. Bao cao: ${file}`);
  }
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
