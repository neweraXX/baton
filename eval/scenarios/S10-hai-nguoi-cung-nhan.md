# S10 — Hai người cùng nhận
- rules: R4
- now: 14:55
- do_kho: de

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1115 chờ L2, chưa hẹn khách, chưa ai nhận. SR-1116 chờ NovaSoft, cập nhật khách 17:00.
[msg#2 14:42 Minh (ca chiều)] 1116 tôi đang giữ. Còn 1115 tôi cũng định nhận sau khi xem phiếu.
[msg#3 14:43 Dung (ca chiều)] Tôi cũng chuẩn bị nhận 1115, chưa gõ lệnh.
[msg#4 14:50 Ha (ca sáng)] Chốt trước lúc gõ: SR-1115 vẫn chưa ai nhận, chờ L2, không có giờ hứa. Hai người đừng nhận trùng nhé.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1115 | promise: - | waiting: L2 | owner: ? | source: msg#4
SR-1116 | promise: cập nhật khách 17:00 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1116 v1
```

Lệnh nhận SR-1116 thành công. SR-1115 chưa có lượt nhận.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger nhận SR-1115 v1
```

Lệnh 2 — Minh gửi:
```text
@ledger nhận SR-1115 v1
```

Lệnh 3 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: chấp nhận Dung nhận SR-1115 trên v1. Kèm đối chiếu owner `?` với Dung.
- Lệnh 2: **từ chối và cảnh báo R4**: SR-1115 đang do Dung giữ trên v1; Minh không nhận được, hai người cần thống nhất.
- Sau lệnh 2, lượt nhận của Dung giữ nguyên; không tạo lượt nhận cho Minh trên SR-1115.
- Lệnh 3: bàn giao xong; Dung giữ SR-1115, Minh giữ SR-1116, cả hai lượt nhận hợp lệ. R4 đã được trả ở lệnh 2; không tự tạo một trạng thái hai owner.

## Bẫy cho LLM
Hai lời “định nhận” chưa phải owner trong khối đầu vào. Danh tính người gửi lệnh quyết định hai người nhận khác nhau.
