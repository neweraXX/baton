# Áp dụng instructions vào Switch (Claude + Codex đã thống nhất 06/11)

3 file trong thư mục này đã qua 2 vòng phản biện với Codex (log `codex/instructions*.md`). Dán **nguyên văn** nội dung file, không sửa định dạng khối phiếu.

## 1. Room Instructions
Switch Console → **Your Rooms** → `filedgo-shift-desk` → ô **Instructions** → dán toàn bộ `room-instructions.md` → lưu.
(Nên đổi tên kênh Discord thành `fieldgo-shift-desk` cho đúng chính tả.)

## 2. @baton
Console → **Your Agents** → `baton` → **Agent instructions** → dán toàn bộ `baton.md` → lưu.
Thư mục làm việc của baton (`agents/baton`) đã có sẵn 2 file SOP để baton tạo tài liệu room.

## 3. Tạo @checker
Console → **Your Agents** → thẻ **+**:
| Ô | Điền |
|---|---|
| Name | `checker` |
| Description | `Soat phieu ban giao voi hoi thoai va SOP` |
| Agent instructions | dán toàn bộ `checker.md` |
| Run location | This computer |
| Directory | `C:\Users\ADMIN\Desktop\hackathon\agents\checker` |
| Agent provider | **Codex** (đã cài, đã đăng nhập; một model khác soát phiếu của Claude). Không thấy Codex thì chọn Claude Code |
| Settings | Bypass permissions **tắt** |
| Who can talk to your agent | Only me |

**Chưa mời checker vào room.** Kịch bản video cần cảnh checker vào room lần đầu mà không được dặn trước.

## 4. Tạo tài liệu room
Baton chạy ở thư mục khác `agents\baton` (06/11: nó báo thư mục trống), nên đưa đường dẫn đầy đủ. Gửi trong Discord:
```
@baton tạo 2 tài liệu room từ 2 file này, giữ nguyên nội dung: C:\Users\ADMIN\Desktop\hackathon\agents\baton\sop-shift-handover.md (tên "SOP bàn giao ca", instructions: "Đọc khi vào room. Dùng để soát phiếu bàn giao.") và C:\Users\ADMIN\Desktop\hackathon\agents\baton\escalation-matrix.md (tên "Ma trận chuyển xử lý", instructions: "Đọc khi cần biết chuyển case cho ai.")
```
Kiểm bằng `!list-documents`. Đã làm thành công ở room `fieldgo-shift-desk` lúc 14:45 ngày 06/11.

## 5. Chạy tập (trong kênh hiện tại)
Theo "Kịch bản video" trong `SWITCH-BATON-PLAN.md`. Lúc tập thì mời checker bằng `!invite-agent @checker`.
**Khi quay thật:** tạo **kênh Discord mới** (= room mới, dán lại Room Instructions) để checker được vào room lần đầu thật sự. Đặt `LEDGER_FAKE_NOW` trong `ledger/.env`, xoá `ledger/state.json` để ledger bắt đầu sổ mới.
