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
| Lời hứa với khách | Việc đã hứa và giờ `HH:MM`; thêm ngày nếu khác ngày bàn giao. Chưa hứa thì trong phiếu ghi `-`, không tự suy đoán. |
| Đang chờ ai | Ghi rõ L2, vendor NovaSoft, DMS team hoặc khách; nêu nội dung đang chờ. |
| Người nhận | Một người cụ thể đã xác nhận nhận case. |
| Nguồn tin | Dẫn tin nhắn như `msg#12`, phiếu xử lý hoặc ghi chú cuộc gọi; đủ để kiểm chứng lời hứa và thay đổi mới nhất. |

## Các bước bàn giao
1. Ca trước đối chiếu hội thoại và tình trạng xử lý mới nhất; bỏ case đã đóng khỏi danh sách bàn giao.
2. Phát hành **Phiếu bàn giao vN** với thời điểm cập nhật, ví dụ `v1`, `v2`.
3. Ca sau đọc phiên bản mới nhất và xác nhận từng case: “Dung nhận SR-1077 theo phiếu v2, gọi lại khách 15:30”.
4. “Đã xem”, “định nhận”, câu hỏi hoặc việc được gọi tên chưa được tính là nhận case.
5. Chỉ hoàn tất bàn giao khi mọi case còn mở đều có đúng một người nhận, và giờ hứa người đó đã xác nhận khớp với phiên bản mới nhất. Không để case “chưa ai nhận”.

## Khi thông tin thay đổi
- Giờ hứa thay đổi sau khi phát hành phiếu thì phiếu hiện tại hết hiệu lực; phải phát hành phiên bản kế tiếp, dù giờ được kéo sớm hay lùi muộn.
- Ghi giờ mới và nguồn xác nhận; không sửa nhầm giờ của case khác.
- Không chấp nhận xác nhận theo phiếu cũ: ai nhận case lúc này phải ghi đúng số phiên bản mới nhất.
- Người đã nhận case từ phiên bản trước chỉ phải xác nhận lại khi **giờ hứa** của case đó thay đổi. Đổi bên đang chờ hay case khác thay đổi thì lượt nhận cũ vẫn còn hiệu lực.
- Chỉ hỏi lại hoặc nhắc lại đúng giờ đã chốt không được coi là đổi giờ.
- Thay đổi bên hoặc nội dung đang chờ, trạng thái đóng phải được phản ánh trong phiên bản mới. Người nhận theo ledger; không phát hành phiên bản chỉ để cập nhật người nhận.

## Tình huống cần xử lý ngay
- Case chưa ai nhận và còn **dưới 30 phút** đến giờ hứa: báo ngay trong room, gọi rõ Dung/Minh để chốt người nhận; ca trước tiếp tục theo dõi.
- Còn đúng 30 phút chưa thuộc ngưỡng báo gấp trên, nhưng vẫn phải có người nhận trước khi hoàn tất bàn giao.
- Hai người cùng nhận một case: báo xung đột ngay, thống nhất một người chịu trách nhiệm (người kia không gõ lệnh nhận); không âm thầm ghi đè người nhận.
- ETA của NovaSoft là thời gian dự kiến từ vendor, phải ghi riêng với giờ hứa cập nhật khách. Không tự đổi lời hứa theo ETA.
- Đến giờ hứa vẫn chưa có kết quả kỹ thuật, người nhận vẫn cập nhật khách về tiến độ và bước tiếp theo.
- Khi case đóng, ghi nhận kết quả trong hồ sơ case và bỏ khỏi phiếu bàn giao hiện hành.
