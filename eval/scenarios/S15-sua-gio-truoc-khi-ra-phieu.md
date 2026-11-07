# S15 — Sửa giờ trước khi ra phiếu
- rules: none
- now: 15:05
- do_kho: kho

## Hội thoại
[msg#1 14:50 Ha (ca sáng)] CS-1107-006 chờ NovaSoft, cập nhật khách 15:18; SR-1124 chờ L2, chưa hẹn giờ. Chưa phát hành phiếu nhé.
[msg#2 14:52 Ha (ca sáng)] Sửa CS-1107-006: tôi gõ nhầm, giờ đã chốt với khách là 15:24. 15:18 bỏ.
[msg#3 14:54 Dung (ca chiều)] SR-1124 tôi đang giữ rồi. Case CS là Minh giữ chứ không phải tôi.
[msg#4 14:56 Minh (ca chiều)] Đúng CS-1107-006 tôi đang giữ từ trước, lịch đúng 15:24. Vẫn chờ NovaSoft.
[msg#5 15:02 Ha (ca sáng)] Giờ mới ra v1: CS-1107-006 là 15:24; SR-1124 chưa hẹn giờ, vẫn chờ L2.

## Khối BATON đúng (đáp án cho @baton)
v1 đầu tiên, sau msg#5:
```text
[BATON v1]
CS-1107-006 | promise: cập nhật khách 15:24 | waiting: vendor NovaSoft | owner: Minh | source: msg#5
SR-1124 | promise: - | waiting: L2 | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh CS-1107-006 v1
claim Dung SR-1124 v1
```

Hai lệnh nhận thành công. Minh nhận khi giờ trong ledger đã là 15:24; không có khối hoặc lượt nhận nào mang giờ 15:18.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; cả hai case có lượt nhận v1 hợp lệ.
- Không có R3: giờ hiện hành của CS-1107-006 đúng bằng giờ 15:24 tại lúc Minh nhận.
- Không báo R5: còn 19 phút tới 15:24 nhưng Minh có lượt nhận hợp lệ.
- Không có R1, R2, R4 hoặc cảnh báo lệch owner.

## Bẫy cho LLM
Không tự tạo v1 chứa 15:18 khi hội thoại nói rõ chưa phát hành. Hai case có người giữ khác nhau.
