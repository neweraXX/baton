# Kịch bản tập (= kịch bản video), copy dán từng tin theo thứ tự

**Vai:** CA SÁNG = tài khoản Discord chính (`hashmily`). CA CHIỀU = tài khoản Discord thứ 2.
**Dữ liệu hư cấu.** Mỗi tin là 1 lần gửi. Gõ `@ledger` / `@baton` thì **chọn trong danh sách gợi ý** để thành tag thật.

## 0. Chuẩn bị (làm 1 lần)
1. Mời tài khoản CA CHIỀU vào Discord server.
2. Console → Your Agents → **baton** → Who can talk to your agent → **Anyone** (server riêng, chỉ có 2 tài khoản của Hà; bước 5 ca chiều cần hỏi baton). Checker giữ **Only me**.
3. Terminal đang chạy `bot.js`: Ctrl+C. Rồi chạy (xoá sổ cũ, cố định giờ 15:00):
```powershell
cd C:\Users\ADMIN\Desktop\hackathon\ledger; Remove-Item state.json -ErrorAction SilentlyContinue; $env:LEDGER_FAKE_NOW='15:00'; node --env-file=.env --experimental-websocket bot.js
```
4. Lúc tập: **checker CHƯA ở trong room** (nếu đã mời thì `!remove-agent @checker`).

## 1. Ca sáng báo case → baton ra v1
**CA SÁNG:**
```
Bàn giao ca sáng nhé. SR-1077: FieldGo không đồng bộ đơn của NPP Hòa Phát, đang chờ vendor NovaSoft gửi bản vá, mình đã hứa gọi lại khách lúc 16:00. CS-1106-003: chờ L2 gửi log, chưa hẹn giờ với khách. SR-1080: khách không đăng nhập được, đang chờ khách gửi ảnh màn hình, hứa cập nhật qua FieldGo lúc 17:00.
```
**CA SÁNG:**
```
@baton lập phiếu bàn giao
```
→ Đúng: baton ra `[BATON v1]` 3 dòng, ledger trả "Đã ghi phiếu bàn giao v1".

## 2. Ca chiều nhận SR-1077, rồi khách đổi giờ
**CA CHIỀU:**
```
@ledger nhận SR-1077 v1
```
→ Đúng: "✅ ... đã nhận SR-1077 theo phiếu v1".

**CA SÁNG:**
```
@baton khoan ra phiếu mới nhé, chờ checker soát đã.
```
**CA SÁNG:**
```
Khách SR-1077 vừa gọi lại: đổi sang gọi lúc 15:30 thay vì 16:00, vẫn chờ NovaSoft.
```

## 3. Checker vào room lần đầu, không ai dặn
**CA SÁNG:**
```
!invite-agent @checker
```
→ Đúng: checker tự đọc room, chỉ ra phiếu v1 còn ghi 16:00 (đã đổi 15:30), CS-1106-003 và SR-1080 chưa ai nhận, đề nghị baton ra v2.

## 4. Baton ra v2 → ledger bắt R3, R2 → nhận đủ
**CA SÁNG:**
```
@baton ra phiếu mới theo góp ý của checker
```
→ Đúng: baton ra `[BATON v2]`, ledger trả "Đã ghi phiếu v2" + **(R3)** "giờ hứa đổi 16:00 → 15:30 ... phải nhận lại trên v2".

**CA CHIỀU** (giả vờ nhìn ảnh phiếu cũ):
```
@ledger nhận CS-1106-003 v1
```
→ Đúng: **(R2)** "Phiếu v1 đã cũ, bản hiện hành là v2".

**CA CHIỀU** (gửi từng tin):
```
@ledger nhận SR-1077 v2
```
```
@ledger nhận CS-1106-003 v2
```
```
@ledger nhận SR-1080 v2
```
```
@ledger status
```
→ Đúng: "✅ Bàn giao xong".

## 5. Ca chiều hỏi baton
**CA CHIỀU:**
```
@baton SR-1077 gọi cho khách thì nói sao?
```
→ Đúng: chờ NovaSoft gửi bản vá, gọi lúc 15:30 (khách đã đổi từ 16:00).

## Ghi lại khi tập
Bước nào sai hoặc agent trả lời lệch → chụp màn hình gửi Claude. Đây cũng là dữ liệu "ca trượt" cho README.
