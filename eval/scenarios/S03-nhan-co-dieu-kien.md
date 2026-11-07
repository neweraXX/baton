# S03 — Điều kiện chưa xảy ra
- rules: R1
- now: 14:25
- do_kho: kho

## Hội thoại
[msg#1 14:12 Ha (ca sáng)] SR-1104 đang đợi log từ L2, chưa hẹn khách. CS-1107-002 không chờ bên nào, Minh đang giữ, hẹn cập nhật 17:20.
[msg#2 14:14 Minh (ca chiều)] Đúng CS-1107-002 tôi đang giữ, 17:20 nhé.
[msg#3 14:16 Dung (ca chiều)] 1104 nếu L2 gửi đủ log trước lúc bàn giao thì tôi nhận. Chưa có log thì chưa nhận nha.
[msg#4 14:18 Ha (ca sáng)] Log tới rồi... sửa: mới tới ảnh chụp, chưa phải log cần lấy.
[msg#5 14:23 Ha (ca sáng)] Chốt SR-1104 vẫn chờ L2, chưa có giờ hứa và chưa ai nhận. CS-1107-002 giữ nguyên.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1104 | promise: - | waiting: L2 | owner: ? | source: msg#5
CS-1107-002 | promise: cập nhật khách 17:20 | waiting: - | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh CS-1107-002 v1
```

Lệnh nhận của Minh phải thành công. Không chuyển câu nhận có điều kiện của Dung thành sự kiện `claim`.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, SR-1104 chưa có lượt nhận.
- CS-1107-002 có lượt nhận hợp lệ của Minh.
- Không báo R5 cho SR-1104 vì `promiseMin = null`.
- Ledger chỉ biết SR-1104 chưa có lệnh nhận; việc điều kiện log chưa xảy ra là thông tin từ hội thoại.

## Bẫy cho LLM
“Log tới rồi” bị sửa ngay sau đó. Không biến lời nhận có điều kiện thành nhận chắc chắn.
