// Thao tac Discord web qua CDP: mo kenh, go tin nhu nguoi, hien phu de tren man hinh khi quay.

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Cho toi khi bieu thuc JS trong trang tra ve gia tri "truthy"
async function waitFor(session, expression, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const value = await session.evaluate(expression).catch(() => null);
    if (value) {
      return value;
    }
    await sleep(500);
  }
  throw new Error(`Het ${timeoutMs / 1000}s cho: ${expression.slice(0, 80)}`);
}

const TEXTBOX = '[role="textbox"][data-slate-editor="true"]';

// Mo server Discord, tim kenh theo ten roi vao kenh do. Tra ve URL kenh.
async function openChannel(session, guildId, channelName) {
  await session.send('Page.enable');
  await session.send('Page.navigate', { url: `https://discord.com/channels/${guildId}` });
  const href = await waitFor(
    session,
    `(() => { const a = [...document.querySelectorAll('a[href^="/channels/${guildId}/"]')]
        .find((el) => (el.getAttribute('aria-label') || el.textContent || '').includes(${JSON.stringify(channelName)}));
      return a ? a.getAttribute('href') : null; })()`,
    45000
  );
  await session.send('Page.navigate', { url: `https://discord.com${href}` });
  await waitFor(session, `!!document.querySelector('${TEXTBOX}')`, 30000);
  return `https://discord.com${href}`;
}

async function pressKey(session, key, code, keyCode) {
  const base = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
  await session.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: key === 'Enter' ? '\r' : undefined });
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
}

// Go tin nhu nguoi: go tung cum chu cho tu nhien tren video, roi Enter.
// Them 1 dau cach cuoi tin: neu tin ket thuc bang @ten, Discord mo goi y va Enter se CHON goi y thay vi gui
// (chay thu 06/11 bi dinh 2 tin vao nhau). Dau cach dong goi y; Discord tu cat khoang trang cuoi tin.
async function sendMessage(session, text, { chunk = 6, delayMs = 35 } = {}) {
  await session.evaluate(`document.querySelector('${TEXTBOX}').focus()`);
  const typed = `${text} `;
  for (let index = 0; index < typed.length; index += chunk) {
    await session.send('Input.insertText', { text: typed.slice(index, index + chunk) });
    await sleep(delayMs);
  }
  await sleep(500);
  await pressKey(session, 'Enter', 'Enter', 13);
  await sleep(700);
}

// Phu de dang thanh o dau man hinh (chi hien tren may quay, khong gui vao Discord)
async function showCaption(session, text) {
  const safe = JSON.stringify(text);
  await session.evaluate(`(() => {
    let box = document.getElementById('baton-caption');
    if (!box) {
      box = document.createElement('div');
      box.id = 'baton-caption';
      // O tren cung khung chat: tin moi nhat (vd dong R3 cua ledger) nam o duoi, khong bi che (quay 07/11)
      box.style.cssText = 'position:fixed;left:calc(50% + 190px);top:96px;transform:translateX(-50%);z-index:99999;max-width:62%;padding:12px 20px;border-radius:10px;background:rgba(17,24,39,.9);color:#fff;font:600 20px/1.35 system-ui,sans-serif;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.35)';
      document.body.appendChild(box);
      // An thanh quang cao "Get the desktop app" cua Discord web
      const style = document.createElement('style');
      style.textContent = '[class*="notice_"]{display:none!important}';
      document.head.appendChild(style);
    }
    box.textContent = ${safe};
    box.style.display = ${safe} ? 'block' : 'none';
  })()`);
}

// ID cua tin moi nhat dang hien (li id = "chat-messages-<kenh>-<tin>", ID tin cang moi cang lon)
const MESSAGE_ITEMS = `[...document.querySelectorAll('li[id^="chat-messages-"]')]
  .map((li) => ({ id: BigInt(li.id.split('-').pop()), text: li.innerText }))`;

async function lastMessageId(session) {
  return session.evaluate(`(() => { const items = ${MESSAGE_ITEMS}; return items.length ? String(items[items.length - 1].id) : '0'; })()`);
}

// Cho toi khi co tin MOI (ID lon hon afterId) chua chu `needle`. Tra ve noi dung tin do.
async function waitForNewText(session, afterId, needle, timeoutMs = 180000) {
  return waitFor(
    session,
    `(() => { const hit = ${MESSAGE_ITEMS}.find((item) => item.id > ${afterId}n && item.text.includes(${JSON.stringify(needle)}));
      return hit ? hit.text : null; })()`,
    timeoutMs
  );
}

module.exports = { sleep, waitFor, openChannel, sendMessage, showCaption, lastMessageId, waitForNewText };
