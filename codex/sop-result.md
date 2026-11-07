=== FILE: sop-shift-handover.md ===
# SOP bàn giao ca — Support L1 FieldGo
*Tài liệu nội bộ hư cấu — Sunrise Beverages*

## Mục đích
Giữ liên tục việc xử lý case và thực hiện đúng lời hứa với khách khi đổi ca.
Áp dụng tại room `#fieldgo-shift-desk`; mọi giờ ghi theo giờ Việt Nam.

## Trách nhiệm
- **Ca trước — Ha (ca sáng):** rà soát case còn mở, lập phiếu, bổ sung nguồn tin và theo dõi đến khi có người nhận rõ ràng.
- **Ca sau — Dung/Minh (ca chiều):** đối chiếu thông tin mới nhất, thống nhất mỗi case một người nhận và xác nhận đúng phiên bản.
- Người nhận chịu trách nhiệm cập nhật khách đúng hẹn, kể cả khi đang chờ L2, NovaSoft hoặc DMS team.

## Nội dung bắt buộc của từng case
| Trường | Cách ghi |
|---|---|
| Mã case | Ghi đầy đủ, ví dụ `SR-1077` hoặc `CS-1106-003`. |
| Lời hứa với khách | Việc đã hứa và giờ `HH:MM`; thêm ngày nếu khác ngày bàn giao. Chưa hứa thì ghi “Chưa có”, không tự suy đoán. |
| Đang chờ ai | Ghi rõ L2, vendor NovaSoft, DMS team hoặc khách; nêu nội dung đang chờ. |
| Người nhận | Một người cụ thể đã xác nhận nhận case. |
| Nguồn tin | Dẫn tin nhắn như `msg#12`, phiếu xử lý hoặc ghi chú cuộc gọi; đủ để kiểm chứng lời hứa và thay đổi mới nhất. |

## Các bước bàn giao
1. Ca trước đối chiếu hội thoại và tình trạng xử lý mới nhất; bỏ case đã đóng khỏi danh sách bàn giao.
2. Phát hành **Phiếu bàn giao vN** với thời điểm cập nhật, ví dụ `v1`, `v2`.
3. Ca sau đọc phiên bản mới nhất và xác nhận từng case: “Dung nhận SR-1077 theo phiếu v2, gọi lại khách 15:30”.
4. “Đã xem”, “định nhận”, câu hỏi hoặc việc được gọi tên chưa được tính là nhận case.
5. Chỉ hoàn tất bàn giao khi mọi case còn mở đều có đúng một người nhận và xác nhận theo phiên bản mới nhất. Không để case “chưa ai nhận”.

## Khi thông tin thay đổi
- Giờ hứa thay đổi sau khi phát hành phiếu thì phiếu hiện tại hết hiệu lực; phải phát hành phiên bản kế tiếp, dù giờ được kéo sớm hay lùi muộn.
- Ghi giờ mới và nguồn xác nhận; không sửa nhầm giờ của case khác.
- Không chấp nhận xác nhận theo phiếu cũ. Người nhận phải xác nhận lại theo bản mới nhất, kể cả case của mình không đổi.
- Chỉ hỏi lại hoặc nhắc lại đúng giờ đã chốt không được coi là đổi giờ.
- Cập nhật người đang chờ, người nhận hoặc trạng thái đóng cũng phải được phản ánh trong phiên bản mới.

## Tình huống cần xử lý ngay
- Case chưa ai nhận và còn **dưới 30 phút** đến giờ hứa: báo ngay trong room, gọi rõ Dung/Minh để chốt người nhận; ca trước tiếp tục theo dõi.
- Còn đúng 30 phút chưa thuộc ngưỡng báo gấp trên, nhưng vẫn phải có người nhận trước khi hoàn tất bàn giao.
- Hai người cùng nhận một case: báo xung đột ngay, thống nhất một người chịu trách nhiệm và cập nhật phiếu; không âm thầm ghi đè người nhận.
- ETA của NovaSoft là thời gian dự kiến từ vendor, phải ghi riêng với giờ hứa cập nhật khách. Không tự đổi lời hứa theo ETA.
- Đến giờ hứa vẫn chưa có kết quả kỹ thuật, người nhận vẫn cập nhật khách về tiến độ và bước tiếp theo.
- Khi case đóng, ghi nhận kết quả trong hồ sơ case và bỏ khỏi phiếu bàn giao hiện hành.

=== FILE: escalation-matrix.md ===
# Ma trận chuyển xử lý — FieldGo
*Tài liệu nội bộ hư cấu — Sunrise Beverages*

| Loại vấn đề | Chuyển cho ai | Phản hồi mục tiêu |
|---|---|---|
| FieldGo gián đoạn diện rộng, nhiều người không thao tác được | L2 trực ca | 10 phút |
| Lỗi đăng nhập hoặc quyền truy cập chưa xử lý được theo hướng dẫn L1 | L2 | 15 phút |
| Ứng dụng treo hoặc lỗi tái hiện được, cần sửa phần mềm | Vendor NovaSoft, qua L2 | 30 phút |
| Lỗi dịch vụ/API FieldGo đã được L2 xác định thuộc phạm vi vendor | Vendor NovaSoft, qua L2 | 30 phút |
| Sai hoặc thiếu dữ liệu khách hàng, sản phẩm, tuyến bán hàng từ DMS | DMS team | 30 phút |
| Đơn hàng đã gửi từ FieldGo nhưng thiếu hoặc lệch trạng thái trong DMS | DMS team; L2 hỗ trợ đối chiếu | 15 phút |

- Mốc tính từ lúc bên nhận nhận đủ mã case, mức ảnh hưởng, thời điểm lỗi và bằng chứng liên quan.
- Đây là mục tiêu xác nhận tiếp nhận và hướng xử lý ban đầu, không phải thời hạn khắc phục hay giờ hứa với khách.
- Quá mốc chưa phản hồi: nhắc bên nhận và báo L2 trực ca để điều phối.
- L1 giữ trách nhiệm liên hệ khách; chuyển xử lý kỹ thuật không thay thế việc bàn giao người nhận case.