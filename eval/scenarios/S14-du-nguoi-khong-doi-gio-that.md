# S14 — Đủ người, chỉ bàn giờ giả định
- rules: none
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:45 Ha (ca sáng)] SR-1122 chờ NovaSoft, gọi khách 15:30. SR-1123 chờ L2, chưa có giờ hứa.
[msg#2 14:46 Dung (ca chiều)] D đây, Dung nhé. Tôi đang giữ 1122, lịch 15:30 đã ghi.
[msg#3 14:47 Minh (ca chiều)] 1123 tôi đang giữ từ trước.
[msg#4 14:52 Ha (ca sáng)] Nếu khách bận thì có thể xin 16:00... à mới nghĩ phương án thôi, chưa hỏi khách, chưa đổi lịch.
[msg#5 14:58 Dung (ca chiều)] Chốt SR-1122 vẫn gọi 15:30, chờ NovaSoft, tôi giữ. SR-1123 của Minh không đổi.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#3:
```text
[BATON v1]
SR-1122 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
SR-1123 | promise: - | waiting: L2 | owner: Minh | source: msg#3
```

Msg#4–5 không thay dữ kiện nghiệp vụ. Cuối hội thoại tiếp tục dùng v1 đã phát hành; không gửi lại v1 với `source` khác. Nếu phát hành khối cập nhật thì phải tăng phiên bản, nhưng file này không có sự kiện đó.

## Thiết lập ledger
```text
block v1
claim Dung SR-1122 v1
claim Minh SR-1123 v1
```

Hai lệnh nhận thành công; ownerHint khớp người tự nhận.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; Dung giữ SR-1122, Minh giữ SR-1123 bằng các lượt nhận v1 hợp lệ.
- Không có R1–R5 hoặc cảnh báo lệch owner.
- Giờ hứa SR-1122 vẫn 15:30, còn đúng 30 phút; không báo R5.
- Ledger không nhận sự kiện đổi giờ nào từ phương án trong chat.

## Kỳ vọng cho @checker
Không coi phương án 16:00 chưa chốt là thay đổi lời hứa. Không yêu cầu người nhận xác nhận lại chỉ vì có câu giả định.

## Bẫy cho LLM
Không biến giả định thành lời hứa mới. “D” là Dung vì người nói đã giải nghĩa.
