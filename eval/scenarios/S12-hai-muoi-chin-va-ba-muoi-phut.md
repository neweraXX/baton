# S12 — Phân biệt 29 và 30 phút
- rules: R1,R5
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:48 Ha (ca sáng)] SR-1119 chờ NovaSoft, gọi lại 15:29. SR-1120 chờ L2, gọi lại 15:30. Cả hai chưa ai nhận.
[msg#2 14:50 Dung (ca chiều)] 1119 là 15:30 đúng ko? Tôi hỏi thôi, chưa nhận.
[msg#3 14:53 Ha (ca sáng)] Không, SR-1119 là 15:29; SR-1120 mới 15:30. Không thay giờ nào, chỉ nhắc lại cho khỏi lẫn.
[msg#4 14:58 Minh (ca chiều)] Tôi cũng chưa nhận hai case này. Vừa bị chen tin nên hỏi lại: 1119 vendor, 1120 L2 đúng rồi.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1119 | promise: gọi lại 15:29 | waiting: vendor NovaSoft | owner: ? | source: msg#3
SR-1120 | promise: gọi lại 15:30 | waiting: L2 | owner: ? | source: msg#3
```

## Thiết lập ledger
```text
block v1
```

Không có lệnh nhận cho cả hai case.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1 cho cả SR-1119 và SR-1120 vì chưa có lượt nhận.
- R5 cho SR-1119: `15:29 - 15:00 = 29 phút`, nhỏ hơn 30.
- Không báo R5 cho SR-1120: `15:30 - 15:00 = 30 phút`, không nhỏ hơn 30.
- Không có R3 vì chưa có lượt nhận để trở thành stale.
- Không báo bàn giao xong.

## Bẫy cho LLM
Không làm tròn 15:29 thành 15:30. Phải hiểu câu hỏi sai đã được đính chính, không phải một lần đổi giờ.
