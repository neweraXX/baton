// Kiem tung profile: da dang nhap Discord chua, ten tai khoan, co vao duoc server demo khong. Chi doc.
// Chay: node demo/video/check-discord.js

const fs = require('node:fs');
const path = require('node:path');
const { connectToFirstPage } = require('./cdp');
const { sleep } = require('./discord');

const GUILD_ID = process.env.DISCORD_GUILD_ID || '1567898694173466695';

async function checkProfile(profile) {
  const session = await connectToFirstPage(profile.debugAddress);
  await session.send('Page.enable');
  await session.send('Page.navigate', { url: `https://discord.com/channels/${GUILD_ID}` });
  await sleep(9000);
  const info = await session.evaluate(`(() => ({
    url: location.href,
    loggedIn: !location.pathname.startsWith('/login') && !!document.querySelector('[class*="sidebar"]'),
    channels: [...document.querySelectorAll('a[href^="/channels/${GUILD_ID}/"]')].map((a) => (a.getAttribute('aria-label') || a.textContent).trim()).slice(0, 10),
    account: (document.querySelector('[class*="panelTitleContainer"], [class*="nameTag"]') || {}).innerText || null,
  }))()`);
  session.close();
  return info;
}

async function main() {
  const profiles = JSON.parse(fs.readFileSync(path.join(__dirname, 'profiles.json'), 'utf8'));
  for (const profile of profiles) {
    const info = await checkProfile(profile);
    console.log(`Profile ${profile.name} (${profile.role}):`, JSON.stringify(info));
  }
}

main().catch((error) => {
  console.error('Loi:', error.message);
  process.exitCode = 1;
});
