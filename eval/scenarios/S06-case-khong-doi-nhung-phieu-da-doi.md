# S06 — Case không đổi, phiếu đã đổi
- rules: R2
- now: 14:40
- do_kho: kho

## Hội thoại
[msg#1 14:25 Ha (ca sáng)] SR-1108 chờ L2, gọi lại 16:10, chưa ai nhận. SR-1109 chờ L2, chưa có giờ hứa.
[msg#2 14:26 Minh (ca chiều)] Tôi đang giữ 1109. 1108 để Dung đọc đã, chưa có ai nhận.
[msg#3 14:30 Ha (ca sáng)] Sửa đúng SR-1109 thôi: chuyển chờ NovaSoft. SR-1108 không sửa chữ nào.
[msg#4 14:36 Dung (ca chiều)] Ừ, dòng 1108 giống hệt bản cũ. Nhưng phiếu chung đã lên v2 rồi à?

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1108 | promise: gọi lại 16:10 | waiting: L2 | owner: ? | source: msg#1
SR-1109 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1108 | promise: gọi lại 16:10 | waiting: L2 | owner: ? | source: msg#1
SR-1109 | promise: - | waiting: vendor NovaSoft | owner: Minh | source: msg#3
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1109 v1
block v2
```

Lệnh nhận của Minh thành công. Khi nạp v2, SR-1109 đổi `waiting` nhưng giờ hứa vẫn `null`; lượt nhận v1 không stale.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1108 v1
```

Lệnh 2:
```text
@ledger nhận SR-1108 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2 vì phiên bản hiện hành là v2, dù dòng SR-1108 không thay đổi.
- Lệnh 2: chấp nhận Dung nhận SR-1108 trên v2. Kèm đối chiếu owner `?` với Dung.
- Lệnh 3: bàn giao xong; Dung giữ SR-1108, Minh giữ SR-1109.
- Minh không phải nhận lại SR-1109 trên v2: lượt nhận v1 vẫn hợp lệ vì giờ hứa không đổi.

## Bẫy cho LLM
Không tạo phiên bản riêng theo từng dòng. Không áp thay đổi bên chờ của SR-1109 lên SR-1108.
