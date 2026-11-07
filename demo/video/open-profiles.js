// Mo 2 profile GPM (401 = ca sang "Ha", 402 = ca chieu "Dung") canh nhau, co cong debug.
// Ghi dia chi cong debug vao demo/video/profiles.json cho cac script sau dung.
// Chay: node demo/video/open-profiles.js

const fs = require('node:fs');
const path = require('node:path');
const gpm = require('./gpm');
const { listPages } = require('./cdp');

const OUT_FILE = path.join(__dirname, 'profiles.json');
// Ten profile lay tu dong lenh, mac dinh "main 1" (ca sang) va "main 2" (ca chieu); Ha chot 06/11
const [morningName = 'main 1', afternoonName = 'main 2'] = process.argv.slice(2);
const LAYOUT = [
  { name: morningName, role: 'morning', winPos: '0,0', winSize: '1280,1400' },
  { name: afternoonName, role: 'afternoon', winPos: '1280,0', winSize: '1280,1400' },
];

// Trinh duyet vua mo can vai giay moi mo cong debug: thu lai toi da 30 giay
async function waitForDebugPort(debugAddress) {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      return await listPages(debugAddress);
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error(`Cong debug ${debugAddress} khong tra loi sau 30 giay`);
}

async function main() {
  const profiles = await gpm.findDiscordProfiles(LAYOUT.map((item) => item.name));
  const opened = [];
  for (const [index, profile] of profiles.entries()) {
    const layout = LAYOUT[index];
    // Profile dang mo san thi khong biet cong debug: dong roi mo lai
    await gpm.closeProfile(profile.id).catch(() => {});
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const debugAddress = await gpm.startProfile(profile.id, { winPos: layout.winPos, winSize: layout.winSize });
    const pages = await waitForDebugPort(debugAddress);
    console.log(`Profile ${profile.name} (${layout.role}) mo xong, cong debug ${debugAddress}, ${pages.length} tab`);
    opened.push({ name: profile.name, id: profile.id, role: layout.role, debugAddress });
  }
  fs.writeFileSync(OUT_FILE, JSON.stringify(opened, null, 2));
  console.log(`Da ghi ${OUT_FILE}`);
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
