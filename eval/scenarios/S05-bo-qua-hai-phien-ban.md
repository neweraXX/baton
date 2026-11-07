# S05 — Nhảy từ v1 tới v3
- rules: R2
- now: 14:35
- do_kho: kho

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1107 chưa ai nhận, chờ L2, hẹn cập nhật 16:50. CS-1107-003 chưa hẹn khách, không chờ bên nào.
[msg#2 14:21 Dung (ca chiều)] CS-1107-003 tôi đang giữ. SR-1107 là case khác nha.
[msg#3 14:24 Ha (ca sáng)] 1107 chuyển chờ NovaSoft, L2 đã xong phần họ. Hẹn vẫn 16:50, owner chưa có.
[msg#4 14:26 Minh (ca chiều)] Tôi có ảnh v1 thôi, khoan nhận để đọc lại.
[msg#5 14:29 Ha (ca sáng)] NovaSoft cũng trả lời rồi; SR-1107 giờ không chờ bên nào. Vẫn cần cập nhật khách 16:50, chưa ai nhận.
[msg#6 14:33 Minh (ca chiều)] À vậy dùng bản mới nhất. CS-1107-003 vẫn của Dung đúng không, tôi không đụng case đó.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1107 | promise: cập nhật khách 16:50 | waiting: L2 | owner: ? | source: msg#1
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#3:
```text
[BATON v2]
SR-1107 | promise: cập nhật khách 16:50 | waiting: vendor NovaSoft | owner: ? | source: msg#3
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v3 sau msg#6:
```text
[BATON v3]
SR-1107 | promise: cập nhật khách 16:50 | waiting: - | owner: ? | source: msg#5
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Dung CS-1107-003 v1
block v2
block v3
```

Lệnh nhận của Dung thành công và vẫn hợp lệ qua v2, v3. SR-1107 chưa có lượt nhận.

## Lệnh của người nhận
Minh gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1107 v1
```

Lệnh 2:
```text
@ledger nhận SR-1107 v3
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2; thông báo hiện hành là v3.
- Lệnh 2: chấp nhận Minh nhận SR-1107 trên v3 với giờ hứa 16:50. Kèm đối chiếu owner `?` với người tự nhận Minh.
- Lệnh 3: bàn giao xong; Minh giữ SR-1107 bằng lượt nhận v3, Dung giữ CS-1107-003 bằng lượt nhận v1 vẫn hợp lệ.
- Không có R3. SR-1107 không tự đóng khi `waiting` đổi thành `-` vì vẫn hiện diện trong v3.

## Bẫy cho LLM
Hai mã đều chứa “1107” nhưng là hai case khác nhau. `waiting: -` không có nghĩa case đã đóng hoặc lời hứa đã hoàn thành.
