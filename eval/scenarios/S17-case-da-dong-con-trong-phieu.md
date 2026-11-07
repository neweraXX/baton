# S17 — Case đóng còn treo trên phiếu
- rules: outside
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1127 chưa có giờ hứa, không chờ bên nào, Dung đang giữ. SR-1128 chờ L2, cập nhật khách 17:00.
[msg#2 14:42 Minh (ca chiều)] SR-1128 tôi đang giữ. 1127 của Dung nhé.
[msg#3 14:50 Dung (ca chiều)] SR-1127 khách xác nhận xong, tôi đã đóng trong FieldGo. Ledger chưa nhận sự kiện đóng; phiếu v1 vẫn còn dòng đó.
[msg#4 14:54 Ha (ca sáng)] Đúng 1127 đã đóng, không phải chỉ hết chờ. SR-1128 vẫn mở và Minh giữ. Kiểm tra phiếu đang treo trước đã.
[msg#5 14:58 Ha (ca sáng)] Sau kiểm tra thì ra v2, bỏ SR-1127 khỏi danh sách cần bàn giao. 1128 vẫn cập nhật 17:00, chờ L2.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2, khi SR-1127 còn mở:
```text
[BATON v1]
SR-1127 | promise: - | waiting: - | owner: Dung | source: msg#1
SR-1128 | promise: cập nhật khách 17:00 | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#5:
```text
[BATON v2]
SR-1128 | promise: cập nhật khách 17:00 | waiting: L2 | owner: Minh | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1127 v1
claim Minh SR-1128 v1
block v2
```

Hai lệnh nhận thành công. Khi nạp v2:

- SR-1127 biến mất nên chuyển CLOSED theo §3.2; báo “SR-1127 không còn trong v2 → đóng”.
- SR-1128 vẫn OPEN; lượt nhận v1 của Minh hợp lệ vì giờ hứa không đổi.

## Lệnh của người nhận
Các lệnh đều sau khi nạp v2.

Lệnh 1 — Dung gửi:
```text
@ledger status
```

Lệnh 2 — Dung gửi:
```text
@ledger nhận SR-1127 v2
```

Lệnh 3 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; chỉ SR-1128 còn OPEN và có lượt nhận hợp lệ của Minh. Không đưa SR-1127 vào R1/R5.
- Lệnh 2: từ chối vì SR-1127 đã CLOSED/không thuộc phiếu hiện hành, theo §4.2. Không mở lại case và không tạo lượt nhận mới.
- Lệnh 3: trạng thái không đổi; SR-1128 vẫn do Minh giữ, bàn giao xong.
- Sau v2, việc đóng SR-1127 **đã được SPEC hỗ trợ**; không báo đây là luật đóng case còn thiếu.
- **R1-R5 KHÔNG bắt được vì** thông tin đóng ở msg#3–4 chưa phải đầu vào ledger khi chưa có v2. Khoảng chờ đó thuộc kiểm tra ngữ nghĩa; sau v2, cơ chế CLOSED xử lý được.

## Kỳ vọng cho @checker
Sau msg#3–4, trước v2, phát hiện SR-1127 đã đóng trong hội thoại nhưng vẫn còn trên v1; yêu cầu `@baton` loại khỏi phiếu mới. Không dùng `status` trước v2 để đòi ledger tự biết trạng thái trong FieldGo.

Nếu `@baton` giữ nhầm SR-1127 trong một khối mới, ledger không thể suy ra việc đóng từ chat; ghi lỗi trích xuất và giới hạn đầu vào. Với khối đúng ở trên, không tính S17 là ledger bỏ sót sau v2.

## Bẫy cho LLM
“Không chờ bên nào” ở msg#1 chưa có nghĩa đã đóng. Mốc đóng là msg#3; khối cuối phải bỏ SR-1127.
