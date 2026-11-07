# S07 — Giờ hứa được kéo lên sớm
- rules: R3
- now: 14:40
- do_kho: vua

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1110 chờ NovaSoft, gọi khách 16:40. SR-1111 chờ L2, chưa hẹn giờ.
[msg#2 14:22 Dung (ca chiều)] Tôi đang giữ 1110, lịch 16:40. Minh đang giữ 1111 từ trước.
[msg#3 14:30 Ha (ca sáng)] Khách 1110 xin sớm: chốt gọi lại 15:50 thay 16:40. Vẫn chờ NovaSoft, Dung vẫn giữ. 1111 không đổi.
[msg#4 14:38 Minh (ca chiều)] Đúng 1111 tôi đang giữ. Vừa đọc chen tin, 15:50 là của 1110 nhé.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1110 | promise: gọi lại 16:40 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
SR-1111 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1110 | promise: gọi lại 15:50 | waiting: vendor NovaSoft | owner: Dung | source: msg#3
SR-1111 | promise: - | waiting: L2 | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1110 v1
claim Minh SR-1111 v1
block v2
```

Hai lệnh nhận thành công. Khi nạp v2, giờ 15:50 khác giờ 16:40 lúc Dung nhận: SR-1110 phát sinh R3, `stale = true`. SR-1111 vẫn có lượt nhận hợp lệ.

## Lệnh của người nhận
Dung gửi lần lượt, sau khi đã nạp v2:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1110 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Khi nạp v2 trong thiết lập: R3, thông báo giờ hứa SR-1110 đổi 16:40 → 15:50 sau khi Dung nhận v1; Dung phải nhận lại trên v2.
- Lệnh 1: R1, lượt nhận của Dung đã cũ; yêu cầu nhận lại v2. Dung vẫn là người giữ, nhưng lượt nhận chưa hợp lệ.
- Lệnh 1 không báo R5: còn 70 phút tới 15:50.
- Lệnh 2: chấp nhận Dung nhận lại; lưu `version = 2`, `promiseMin = 15:50`, `stale = false`.
- Lệnh 3: bàn giao xong; Dung có lượt nhận v2 hợp lệ, Minh có lượt nhận v1 vẫn hợp lệ.
- Chỉ nạp v2 không đủ để khôi phục hiệu lực lượt nhận của Dung.

## Kỳ vọng cho @checker
Sau msg#3, trước khi có v2, phát hiện v1 còn ghi 16:40 trái với giờ mới 15:50 và đề nghị `@baton` cập nhật. Ledger chưa thể biết thay đổi này từ chat.

## Bẫy cho LLM
Không giữ 16:40 vì Dung đã nhắc lại trước đó. Không chuyển 15:50 sang case được Minh nhắc xen ngang.
