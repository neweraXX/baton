# S09 — Đổi hai lần giữa tin xen
- rules: R3
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:30 Ha (ca sáng)] SR-1114 chờ L2, hẹn gọi 16:20. CS-1107-004 chờ NovaSoft, cũng hẹn gọi 16:20.
[msg#2 14:31 Dung (ca chiều)] Tôi đang giữ SR-1114; Minh đang giữ CS-1107-004. Hai case khác nhau nha.
[msg#3 14:40 Ha (ca sáng)] Riêng SR-1114 đổi sang 15:45. CS-1107-004 giữ 16:20.
[msg#4 14:42 Minh (ca chiều)] Đúng, CS-1107-004 tôi đang giữ, vẫn 16:20. Đang nghe khách nên trả lời hơi trễ.
[msg#5 14:50 Ha (ca sáng)] Sửa tiếp SR-1114: khách chốt 16:10 thay 15:45. Chờ L2 và Dung giữ như cũ; CS không đổi.
[msg#6 14:58 Dung (ca chiều)] Ok tôi đã ghi 16:10 cho SR-1114, bỏ hai giờ cũ.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1114 | promise: gọi lại 16:20 | waiting: L2 | owner: Dung | source: msg#2
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1114 | promise: gọi lại 15:45 | waiting: L2 | owner: Dung | source: msg#3
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

v3 sau msg#6:
```text
[BATON v3]
SR-1114 | promise: gọi lại 16:10 | waiting: L2 | owner: Dung | source: msg#6
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1114 v1
claim Minh CS-1107-004 v1
block v2
claim Dung SR-1114 v2
block v3
```

Lệnh nhận lại trên v2 là sự kiện người dùng riêng, diễn ra sau v2 và trước v3; không suy ra lệnh này từ hội thoại.

Kỳ vọng trong thiết lập:

- Hai lệnh nhận trên v1 thành công.
- Nạp v2: R3 cho SR-1114, so sánh 15:45 với 16:20 lúc nhận v1.
- Dung nhận lại v2 thành công, lưu giờ nhận 15:45 và hết stale.
- Nạp v3: R3 lần nữa, so sánh 16:10 với **15:45 lúc nhận v2**.
- Lượt nhận của Minh trên CS-1107-004 luôn hợp lệ.

## Lệnh của người nhận
Dung gửi lần lượt, sau v3:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1114 v3
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, lượt nhận v2 của Dung trên SR-1114 đã stale; yêu cầu nhận lại v3.
- Lệnh 1 không báo R5: giờ hiện hành 16:10 còn 70 phút.
- Lệnh 2: chấp nhận; lưu lượt nhận v3 của Dung với giờ 16:10, `stale = false`.
- Lệnh 3: bàn giao xong; SR-1114 có lượt nhận v3 hợp lệ, CS-1107-004 có lượt nhận v1 hợp lệ.
- Không thay đổi giờ hoặc lượt nhận của CS-1107-004 theo SR-1114.
- Câu “đã ghi 16:10” ở msg#6 không thay thế lệnh nhận lại v3.

## Kỳ vọng cho @checker
- Sau msg#3, trước v2: phát hiện v1 sai giờ SR-1114.
- Sau msg#5, trước v3: phát hiện v2 sai giờ SR-1114.
- Giữ nguyên 16:20 của CS-1107-004 trong cả hai lần đối chiếu.

## Bẫy cho LLM
Giữ riêng lịch sử hai case có cùng giờ ban đầu. Không lấy 15:45 từ bản trung gian làm đáp án cuối.
