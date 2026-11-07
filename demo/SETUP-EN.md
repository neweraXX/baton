# Dựng demo tiếng Anh + chạy tập tự động (06/11)

Vì sao room MỚI: lần tập 06/11 checker đọc nhầm tin thử tay cũ trong kênh `fieldgo-shift-desk`. Video phải ở kênh sạch.

## Hà làm (khoảng 3 phút)
1. **Discord:** tạo kênh mới tên `baton-demo`, gửi 1 tin bất kỳ (vd `hi`) để Switch tạo room.
2. **Console → Your Agents → baton → Agent instructions:** dán `instructions/en/baton.md` → Save.
   ```powershell
   Get-Content "C:\Users\ADMIN\Desktop\hackathon\instructions\en\baton.md" -Raw -Encoding UTF8 | Set-Clipboard
   ```
3. **Console → Your Agents → checker → Agent instructions:** dán `instructions/en/checker.md` → Save.
   ```powershell
   Get-Content "C:\Users\ADMIN\Desktop\hackathon\instructions\en\checker.md" -Raw -Encoding UTF8 | Set-Clipboard
   ```
4. Nếu checker đang ở room nào thì thôi, nhưng **không mời checker vào `baton-demo`**.

## Claude chạy (tự động)
5. Dựng room: Room Instructions EN, thêm baton + ledger, mở quyền gọi, nhờ baton tạo 2 tài liệu room EN:
   `node --env-file=ledger/.env --experimental-websocket demo/setup-room.js baton-demo en`
6. Ledger sổ mới, tiếng Anh, giờ cố định 15:00, đúng room:
   `Remove-Item ledger/state.json; $env:LEDGER_LANG='en'; $env:LEDGER_ROOM='baton-demo'; $env:LEDGER_FAKE_NOW='15:00'; node --env-file=.env --experimental-websocket bot.js` (chạy trong thư mục `ledger`)
7. Chạy tập tự động (agent giả lập `ha-morning`, `dung-afternoon`):
   `$env:LEDGER_LANG='en'; $env:LEDGER_ROOM='baton-demo'; node --env-file=ledger/.env --experimental-websocket demo/rehearse.js`
   → báo cáo `demo/rehearsal-en-*.md`.

## Quay video
- Kịch bản + lời thoại tiếng Anh: [video-script-en.md](video-script-en.md). Từng tin để gõ: [rehearsal-script-en.md](rehearsal-script-en.md).
- **Codex không quay được màn hình.** Quay bằng Xbox Game Bar có sẵn trong Windows: `Win + Alt + R` bắt đầu/dừng, file vào `Videos\Captures`.
- 2 lựa chọn: (a) Hà gõ bằng 2 tài khoản Discord thật (tự nhiên nhất); (b) quay màn hình Discord trong lúc `rehearse.js` chạy (không phải gõ, nhưng 2 "người" hiện là APP, phải ghi chú "simulated staff").
- Trước khi quay: xoá `ledger/state.json`, tạo kênh mới lần nữa nếu đã tập trong `baton-demo`.
