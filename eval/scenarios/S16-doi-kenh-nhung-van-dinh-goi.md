# S16 — Khách đổi kênh, người giữ chưa sửa lịch
- rules: outside
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1125 chờ L2, hẹn gọi khách 16:10. SR-1126 chờ NovaSoft, hẹn cập nhật 17:00.
[msg#2 14:42 Dung (ca chiều)] Tôi đang giữ 1125; Minh đang giữ 1126.
[msg#3 14:48 Ha (ca sáng)] Khách SR-1125 đổi yêu cầu: không gọi điện, chỉ nhắn trong FieldGo lúc 16:10. Giờ không đổi. SR-1126 giữ nguyên.
[msg#4 14:52 Minh (ca chiều)] 1126 đúng tôi giữ. 1125 là đổi kênh thôi nhé.
[msg#5 14:57 Dung (ca chiều)] Tôi thấy tin đổi kênh rồi, nhưng lịch làm việc của tôi vẫn để gọi điện 16:10, chưa sửa.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1125 | promise: nhắn trong FieldGo 16:10 | waiting: L2 | owner: Dung | source: msg#3
SR-1126 | promise: cập nhật khách 17:00 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1125 v1
claim Minh SR-1126 v1
```

Hai lệnh nhận thành công; ownerHint khớp người nhận. Ledger chỉ nhận khối và hai lệnh, không nhận nội dung lịch làm việc Dung nói trong chat.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong theo SPEC; cả hai case có lượt nhận hợp lệ, không có cảnh báo R1–R5.
- **R1-R5 KHÔNG bắt được vì** không có luật đối chiếu kênh khách yêu cầu với lịch hành động của người giữ; lịch gọi điện trong msg#5 không phải đầu vào ledger.
- Hành vi lý tưởng của phần kiểm tra ngữ nghĩa: cảnh báo Dung còn định gọi điện trái yêu cầu nhắn trong FieldGo.
- Nếu `@baton` vẫn trích “gọi điện”, đó là lỗi trích xuất. Với giờ không đổi, R3 không phải cơ chế bảo vệ cho lỗi kênh này.

## Kỳ vọng cho @checker
Đối chiếu msg#3 với msg#5, yêu cầu Dung sửa lịch thành nhắn trong FieldGo lúc 16:10 và xác nhận đã sửa. Không coi kết quả “bàn giao xong” của ledger là xác nhận kênh liên lạc đúng.

## Bẫy cho LLM
Ý định chưa sửa của Dung không thay thế yêu cầu mới nhất từ khách. Giữ nguyên giờ nhưng cập nhật loại hành động.
