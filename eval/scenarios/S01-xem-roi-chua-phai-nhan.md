# S01 — Xem rồi chưa phải nhận
- rules: R1
- now: 14:10
- do_kho: de

## Hội thoại
[msg#1 14:00 Ha (ca sáng)] Sunrise Beverages: SR-1101 lỗi đồng bộ FieldGo, chờ NovaSoft, hứa gọi lại 16:00. SR-1102 thì chờ L2, chưa hẹn khách giờ nào.
[msg#2 14:02 Minh (ca chiều)] 1102 tôi đang giữ từ đầu ca nhé, sổ có rồi.
[msg#3 14:04 Dung (ca chiều)] Đã xem 1101... à chỉ xem tin thôi, tôi chưa nhận đâu.
[msg#4 14:08 Ha (ca sáng)] Ok, chốt SR-1101 vẫn chờ vendor NovaSoft, gọi lại 16:00, chưa ai nhận. Đừng ghi Dung chỉ vì đã đọc.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1101 | promise: gọi lại 16:00 | waiting: vendor NovaSoft | owner: ? | source: msg#4
SR-1102 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1102 v1
```

Lệnh nhận của Minh phải thành công. Không tạo lượt nhận cho SR-1101 từ lời nói của Dung.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, bàn giao chưa xong vì SR-1101 chưa có lượt nhận.
- SR-1102 có lượt nhận hợp lệ của Minh trên v1.
- Không báo R5: SR-1101 còn 110 phút tới 16:00.
- Không có cảnh báo lệch owner cho SR-1102 vì Minh đã tự nhận trong thiết lập.

## Bẫy cho LLM
“Đã xem” không phải nhận. Một tin mở đầu chứa hai case có thông tin chờ khác nhau.
