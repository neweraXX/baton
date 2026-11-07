# S04 — Nhận bản cũ sau đổi bên chờ
- rules: R2
- now: 14:30
- do_kho: de

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1105 chờ NovaSoft, gọi lại 16:20, chưa ai nhận. SR-1106 chờ L2, chưa hẹn giờ.
[msg#2 14:21 Minh (ca chiều)] 1106 tôi đang giữ rồi. Dung xem giúp 1105 nhé.
[msg#3 14:24 Ha (ca sáng)] Sửa 1105: không chờ vendor nữa, chuyển sang chờ L2. Giờ gọi vẫn 16:20, chưa ai nhận.
[msg#4 14:28 Dung (ca chiều)] Tôi mở nhầm tab cũ thì phải. 1105 nhé, không phải 1106; lát gõ nhận.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1105 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: ? | source: msg#1
SR-1106 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1105 | promise: gọi lại 16:20 | waiting: L2 | owner: ? | source: msg#3
SR-1106 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1106 v1
block v2
```

Lệnh nhận của Minh thành công. Nạp v2 không làm lượt nhận SR-1106 thành stale; SR-1105 vẫn chưa có lượt nhận.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1105 v1
```

Lệnh 2:
```text
@ledger nhận SR-1105 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2; v1 đã cũ, hiện hành là v2. Không tạo lượt nhận.
- Lệnh 2: chấp nhận Dung nhận SR-1105 trên v2 với giờ hứa 16:20, `stale = false`. Kèm đối chiếu: baton ghi owner `?`, ledger ghi Dung.
- Lệnh 3: bàn giao xong; Dung giữ SR-1105 bằng lượt nhận v2, Minh giữ SR-1106 bằng lượt nhận v1 vẫn hợp lệ.
- Không có R3: đổi `waiting` không làm stale lượt nhận.

## Bẫy cho LLM
Chỉ bên đang chờ thay đổi. Không đổi nhầm giờ hứa hoặc chuyển người giữ của SR-1106 sang SR-1105.
