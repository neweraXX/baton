# S02 — Gọi tên chưa thành người nhận
- rules: R1
- now: 14:20
- do_kho: vua

## Hội thoại
[msg#1 14:10 Ha (ca sáng)] CS-1107-001 chờ L2, hứa cập nhật 17:00. SR-1103 chờ NovaSoft, gọi 16:30; Dung đang giữ case đó.
[msg#2 14:12 Dung (ca chiều)] Đúng, tôi đang giữ SR-1103, lịch 16:30 có rồi.
[msg#3 14:13 Ha (ca sáng)] @Dung nhận luôn CS-1107-001 nhé? À Minh cũng online thì xem giúp.
[msg#4 14:15 Minh (ca chiều)] M ở đây, M là Minh nhé. Tôi chưa nhận CS-1107-001; đang kẹt việc khác.
[msg#5 14:18 Ha (ca sáng)] Dung chưa trả lời vụ CS. Vậy CS-1107-001 vẫn chưa ai nhận, chờ L2, cập nhật khách 17:00.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
CS-1107-001 | promise: cập nhật khách 17:00 | waiting: L2 | owner: ? | source: msg#5
SR-1103 | promise: gọi lại 16:30 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1103 v1
```

Lệnh nhận SR-1103 phải thành công. Không có lệnh nhận CS-1107-001.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, CS-1107-001 chưa có lượt nhận.
- SR-1103 có lượt nhận hợp lệ của Dung trên v1.
- Không báo R5: CS-1107-001 còn 160 phút tới 17:00.
- Ledger không tạo lượt nhận từ việc Ha gọi tên Dung hoặc Minh trả lời trong chat.

## Bẫy cho LLM
Phân biệt người được đề nghị với người đã nhận. “M” được chính người nói giải nghĩa là Minh.
