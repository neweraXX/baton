# S08 — Lùi giờ vẫn làm lượt nhận cũ
- rules: R3
- now: 14:50
- do_kho: vua

## Hội thoại
[msg#1 14:30 Ha (ca sáng)] SR-1112 chờ NovaSoft, hứa gọi 15:40. SR-1113 không chờ ai, hẹn cập nhật 17:10.
[msg#2 14:31 Minh (ca chiều)] 1112 tôi đang giữ; Dung đang giữ 1113.
[msg#3 14:35 Ha (ca sáng)] NovaSoft báo ETA 15:55 cho 1112. Đây là giờ vendor trả lời, chưa phải giờ hứa mới với khách.
[msg#4 14:42 Ha (ca sáng)] Khách vừa đồng ý: đổi cuộc gọi SR-1112 từ 15:40 sang 16:30. Chờ vendor như cũ. 1113 vẫn 17:10.
[msg#5 14:48 Dung (ca chiều)] 1113 đúng tôi đang giữ. Suýt đọc 15:55 thành giờ gọi, may hỏi lại.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1112 | promise: gọi lại 15:40 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
SR-1113 | promise: cập nhật khách 17:10 | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#5:
```text
[BATON v2]
SR-1112 | promise: gọi lại 16:30 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
SR-1113 | promise: cập nhật khách 17:10 | waiting: - | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1112 v1
claim Dung SR-1113 v1
block v2
```

Hai lệnh nhận thành công. Nạp v2 làm lượt nhận của Minh trên SR-1112 thành stale vì giờ đổi 15:40 → 16:30. SR-1113 không stale.

## Lệnh của người nhận
Minh gửi lần lượt, sau v2:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1112 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Khi nạp v2: R3, yêu cầu Minh nhận lại SR-1112 trên v2; lùi giờ cũng làm lượt nhận cũ.
- Lệnh 1: R1, SR-1112 có lượt nhận stale của Minh; chưa bàn giao xong.
- Lệnh 1 không báo R5: lời hứa hiện hành 16:30 còn 100 phút. Không dùng 15:40 hoặc ETA 15:55 để tính.
- Lệnh 2: chấp nhận Minh nhận lại trên v2; `stale = false`, giờ tại lúc nhận là 16:30.
- Lệnh 3: bàn giao xong; Minh giữ SR-1112 bằng lượt nhận v2, Dung giữ SR-1113 bằng lượt nhận v1 hợp lệ.

## Kỳ vọng cho @checker
- Sau msg#3: không coi ETA 15:55 là giờ hứa mới.
- Sau msg#4, trước v2: chỉ ra v1 còn ghi 15:40 và yêu cầu cập nhật thành 16:30.
- Không kỳ vọng ledger phát hiện hai điều này từ hội thoại.

## Bẫy cho LLM
Phân biệt ETA vendor với cam kết cho khách. R3 áp dụng cả khi lùi giờ sau lượt nhận.
