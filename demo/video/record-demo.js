// Chay kich ban demo bang 2 tai khoan Discord that (profile GPM main 1 = ca sang, main 2 = ca chieu),
// hien phu de tieng Anh tren cua so ca sang, va (tuy chon) quay bang Xbox Game Bar.
// Can: open-profiles.js da chay (profiles.json), ledger dang chay dung room, checker CHUA o trong room.
// Chay: node --experimental-websocket demo/video/record-demo.js <ten-kenh> [--record]

const fs = require('node:fs');
const path = require('node:path');
const { connectToFirstPage } = require('./cdp');
const discord = require('./discord');
const { ScreencastRecorder } = require('./screencast');

const GUILD_ID = process.env.DISCORD_GUILD_ID || '1567898694173466695';
const CHANNEL = process.argv[2] || 'baton-demo';
const RECORD = process.argv.includes('--record');
const CASE_IDS = ['SR-1077', 'CS-1106-003', 'SR-1080'];

const MESSAGES = {
  cases: 'Morning handover. SR-1077: FieldGo is not syncing orders for distributor Hoa Phat, waiting on vendor NovaSoft for a patch, I promised to call the customer back at 16:00. CS-1106-003: waiting on L2 for logs, no time promised to the customer. SR-1080: customer cannot log in, waiting on the customer for a screenshot, promised an update via FieldGo at 17:00.',
  askTicket: '@baton please draft the handover ticket',
  hold: '@baton hold off on a new ticket, let checker review first.',
  timeChange: 'Customer on SR-1077 just called back: move the callback to 15:30 instead of 16:00, still waiting on NovaSoft.',
  invite: '!invite-agent @checker',
  askChecker: '@checker please review the current ticket',
  askNewTicket: "@baton please issue a new ticket based on checker's review",
  claim: (caseId, version) => `@ledger claim ${caseId} v${version}`,
  status: '@ledger status',
  question: '@baton what should I tell the customer when I call on SR-1077?',
};

// Gio trong kich ban phai o TUONG LAI so voi luc quay (baton/checker dung gio that; chay thu 06/11 baton noi
// "15:30 hom nay da qua"). Lay gio goc = tron gio sau 2 tieng; doi som 30 phut; case SR-1080 = gio goc + 1 tieng.
function hhmm(totalMinutes) {
  const minutes = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

function storyTimes(now = new Date()) {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const original = Math.ceil((nowMinutes + 120) / 60) * 60;
  return { '16:00': hhmm(original), '15:30': hhmm(original - 30), '17:00': hhmm(original + 60) };
}

const TIMES = storyTimes();

// Thay gio goc trong kich ban (16:00, 15:30, 17:00) bang gio tuong lai
function retime(text) {
  return text.replace(/16:00|15:30|17:00/g, (match) => TIMES[match]);
}

const log = (text) => console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${text}`);
const results = [];

function loadCaptions() {
  const file = path.join(__dirname, 'captions.json');
  const captions = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  return Object.fromEntries(Object.entries(captions).map(([key, text]) => [key, retime(text)]));
}

// Tin co dinh trong kich ban, da doi gio
function message(key) {
  return retime(MESSAGES[key]);
}

function check(name, ok, detail = '') {
  results.push({ name, ok: Boolean(ok), detail });
  log(`${ok ? 'DAT  ' : 'TRUOT'} ${name}${detail ? ` (${detail})` : ''}`);
}

// Gui 1 tin roi cho tin moi co chu `needle`; tra ve noi dung tin do hoac null
async function sendAndWait(sender, watcher, text, needle, timeoutMs) {
  const before = await discord.lastMessageId(watcher);
  await discord.sendMessage(sender, text);
  if (!needle) {
    return null;
  }
  return discord.waitForNewText(watcher, before, needle, timeoutMs).catch(() => null);
}

// Quay bang khung hinh cua chinh trinh duyet (CDP screencast -> AVI): khong can Game Bar hay cua so o tren cung
function videoPath() {
  const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '');
  return path.join(__dirname, `baton-demo-${stamp}.avi`);
}

function versionIn(text) {
  const match = /Recorded handover ticket v(\d+)/.exec(text || '');
  return match ? Number(match[1]) : null;
}

async function runScenario(morning, afternoon, caption) {
  await caption('intro');
  await discord.sleep(5000);

  await caption('cases');
  await discord.sendMessage(morning, message('cases'));
  await discord.sleep(2500);

  await caption('ticketV1');
  const v1Text = await sendAndWait(morning, morning, message('askTicket'), 'Recorded handover ticket v', 240000);
  const v1 = versionIn(v1Text);
  check('baton ra phieu, ledger ghi', v1, v1Text ? v1Text.split('\n').find((line) => line.includes('Recorded')) : 'het gio');
  if (!v1) {
    return;
  }

  await caption('claimV1');
  const claimed = await sendAndWait(afternoon, morning, MESSAGES.claim('SR-1077', v1), 'claimed SR-1077', 30000);
  check('Dung nhan SR-1077 v1', claimed);

  await caption('timeChange');
  // Cho baton tra loi tin "hold" (cau tra loi nhac "v1"; tin cua Ha khong co chu do) truoc khi bao doi gio
  await sendAndWait(morning, morning, message('hold'), `v${v1}`, 90000);
  await discord.sendMessage(morning, message('timeChange'));
  await discord.sleep(4000);

  await caption('inviteChecker');
  await sendAndWait(morning, morning, message('invite'), 'checker', 30000);
  await discord.sleep(3000);

  await caption('checkerReview');
  // Moc tin TRUOC khi goi checker: baton co the ra v2 ngay sau review, truoc khi buoc ticketV2 bat dau cho
  // (quay 07/11 bo lo phieu v2 vi lay moc qua muon)
  const beforeReview = await discord.lastMessageId(morning);
  // Checker viet "gio cu → gio moi" theo instructions; baton viet "from .. to .."
  const review = await sendAndWait(morning, morning, message('askChecker'), `${TIMES['16:00']} → ${TIMES['15:30']}`, 240000);
  check(`checker bat gio ${TIMES['16:00']} -> ${TIMES['15:30']}`, review);

  await caption('ticketV2');
  // Chi nhan tin cua ledger: "Recorded handover ticket vN." co dau cham (baton trich lai trong ngoac thi khong co).
  // Khong dung emoji: Discord ve emoji thanh anh, khong co trong innerText
  const v2Needle = `Recorded handover ticket v${v1 + 1}.`;
  let v2Text = await discord.waitForNewText(morning, beforeReview, v2Needle, 60000).catch(() => null);
  if (!v2Text) {
    v2Text = await sendAndWait(morning, morning, message('askNewTicket'), v2Needle, 240000);
  }
  check('ledger ghi phieu moi + R3', v2Text && v2Text.includes('(R3)'));
  await discord.sleep(4000);
  let before;
  const v2 = v1 + 1;
  await discord.sleep(3000);

  await caption('staleClaim');
  const stale = await sendAndWait(afternoon, morning, MESSAGES.claim('CS-1106-003', v1), '(R2)', 30000);
  check('nhan theo phieu cu bi R2', stale);
  await discord.sleep(2500);

  await caption('claimAll');
  for (const caseId of CASE_IDS) {
    const ok = await sendAndWait(afternoon, morning, MESSAGES.claim(caseId, v2), `claimed ${caseId}`, 30000);
    check(`Dung nhan ${caseId} v${v2}`, ok);
  }

  await caption('done');
  const done = await sendAndWait(afternoon, morning, message('status'), 'Handover complete', 30000);
  check('ledger: Handover complete', done);
  await discord.sleep(3000);

  await caption('question');
  before = await discord.lastMessageId(morning);
  await discord.sendMessage(afternoon, message('question'));
  const answer = await discord.waitForNewText(morning, before, 'NovaSoft', 180000).catch(() => null);
  check('baton tra loi cau hoi', answer);
  await discord.sleep(7000);

  await caption('eval');
  await discord.sleep(8000);
  await caption('outro');
  await discord.sleep(6000);
}

async function main() {
  const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'profiles.json'), 'utf8'));
  const morning = await connectToFirstPage(profiles.find((item) => item.role === 'morning').debugAddress);
  const afternoon = await connectToFirstPage(profiles.find((item) => item.role === 'afternoon').debugAddress);
  const captions = loadCaptions();
  const caption = async (key) => {
    log(`[phu de] ${key}`);
    await discord.showCaption(morning, captions[key] || '');
  };

  log(`Gio kich ban: ${JSON.stringify(TIMES)}`);
  log(`Mo kenh ${CHANNEL} o ca 2 profile`);
  await discord.openChannel(morning, GUILD_ID, CHANNEL);
  await discord.openChannel(afternoon, GUILD_ID, CHANNEL);
  await discord.sleep(3000);

  let recorder = null;
  try {
    if (RECORD) {
      recorder = new ScreencastRecorder(morning, videoPath());
      await recorder.start();
      log(`Bat dau quay: ${recorder.filePath}`);
      await discord.sleep(1500);
    }
    await runScenario(morning, afternoon, caption);
  } finally {
    // Loi o day khong duoc chan buoc dong file video (review Codex 07/11)
    await caption('').catch((error) => log(`Khong xoa duoc phu de: ${error.message}`));
    if (recorder) {
      await discord.sleep(1500);
      const video = await recorder.stop();
      log(`Da luu video: ${recorder.filePath} (${video.frames} khung, ${video.seconds.toFixed(1)} giay, ${video.width}x${video.height}, bo ${video.droppedFrames} khung khac kich thuoc${video.writeError ? `, LOI GHI: ${video.writeError}` : ''})`);
    }
    const passed = results.filter((item) => item.ok).length;
    log(`Xong: ${passed}/${results.length} diem kiem dat`);
    morning.close();
    afternoon.close();
  }
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
