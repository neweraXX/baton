# S11 — Đổi phiên bản không xóa người giữ
- rules: R4
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1117 chờ L2, cập nhật khách 16:40. SR-1118 không chờ ai, chưa có giờ hứa.
[msg#2 14:41 Minh (ca chiều)] Tôi đang giữ 1117, đã nhận trên v1; Dung đang giữ 1118.
[msg#3 14:48 Ha (ca sáng)] 1117 chuyển chờ NovaSoft. Giờ vẫn 16:40, Minh vẫn giữ. Ra bản mới vì đổi bên chờ thôi.
[msg#4 14:55 Dung (ca chiều)] 1118 đúng tôi giữ. À thấy 1117 vừa lên v2, tôi tưởng case đó mở lại để nhận.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1117 | promise: cập nhật khách 16:40 | waiting: L2 | owner: Minh | source: msg#2
SR-1118 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1117 | promise: cập nhật khách 16:40 | waiting: vendor NovaSoft | owner: Minh | source: msg#3
SR-1118 | promise: - | waiting: - | owner: Dung | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1117 v1
claim Dung SR-1118 v1
block v2
```

Hai lệnh nhận thành công. Nạp v2 không làm stale lượt nhận nào: SR-1117 chỉ đổi `waiting`; SR-1118 chỉ đổi `source`.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1117 v2
```

Lệnh 2:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: **từ chối và cảnh báo R4**: SR-1117 đang do Minh giữ bằng lượt nhận v1. Dung không nhận được.
- Không có R2: lệnh dùng đúng phiên bản hiện hành v2.
- Không có R3: giờ hứa SR-1117 vẫn 16:40.
- Lệnh 2: bàn giao xong; Minh vẫn giữ SR-1117, Dung vẫn giữ SR-1118. Hai lượt nhận v1 đều hợp lệ trên phiếu hiện hành v2.

## Bẫy cho LLM
Phiên bản mới không tự xóa owner. Không diễn giải “tôi tưởng” thành sự kiện case mở lại.
