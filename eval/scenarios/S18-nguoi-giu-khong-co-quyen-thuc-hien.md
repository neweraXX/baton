# S18 — Có người giữ nhưng không thể thực hiện
- rules: outside
- now: 15:10
- do_kho: vua

## Hội thoại
[msg#1 14:50 Ha (ca sáng)] SR-1129 chờ NovaSoft, hứa cập nhật khách trong FieldGo 16:30. CS-1107-007 chờ L2, gọi lại 17:10.
[msg#2 14:52 Minh (ca chiều)] SR-1129 tôi đang giữ từ trước. CS-1107-007 Dung giữ nhé.
[msg#3 14:55 Dung (ca chiều)] Đúng CS-1107-007 tôi đang giữ. Vụ quyền FieldGo của Minh đã có chưa?
[msg#4 15:00 Minh (ca chiều)] Tôi tưởng có rồi... sửa lại: tài khoản tôi chưa có quyền gửi cập nhật cho khách trên FieldGo. Tôi vẫn đang giữ SR-1129, chưa chuyển ai.
[msg#5 15:06 Ha (ca sáng)] Chưa có cách gửi thay hay người hỗ trợ. SR-1129 vẫn hẹn 16:30, chờ NovaSoft; CS-1107-007 vẫn 17:10, chờ L2.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1129 | promise: cập nhật khách trong FieldGo 16:30 | waiting: vendor NovaSoft | owner: Minh | source: msg#5
CS-1107-007 | promise: gọi lại 17:10 | waiting: L2 | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1129 v1
claim Dung CS-1107-007 v1
```

Hai lệnh nhận thành công. SPEC không kiểm tra quyền gửi cập nhật trên FieldGo khi xử lý lệnh nhận.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong theo SPEC; hai case có lượt nhận hợp lệ, ownerHint khớp người nhận.
- Không có R1–R5. SR-1129 còn 80 phút; CS-1107-007 còn 120 phút tới giờ hứa.
- **R1-R5 KHÔNG bắt được vì** lượt nhận hợp lệ không chứng minh người nhận có quyền thực hiện hành động; schema và luật không kiểm tra quyền FieldGo.
- Hành vi lý tưởng của phần kiểm tra ngữ nghĩa: cảnh báo trở ngại thực hiện, yêu cầu cấp quyền hoặc thống nhất cách hỗ trợ.
- Không tự hủy lượt nhận của Minh hoặc đổi ownerHint thành `?`. Không tự chuyển cho Dung; SPEC chưa có thao tác chuyển giao như vậy.

## Kỳ vọng cho @checker
Phát hiện cam kết cập nhật trong FieldGo chưa có cách thực hiện vì Minh thiếu quyền và chưa có người hỗ trợ. Nêu rõ đây là rủi ro ngoài R1–R5, dù ledger báo bàn giao xong.

## Bẫy cho LLM
Thiếu quyền không đồng nghĩa chưa nhận. Không biến câu hỏi của Dung thành sự kiện chuyển SR-1129 sang Dung.
