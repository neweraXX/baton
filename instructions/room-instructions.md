# Room #fieldgo-shift-desk — bàn giao ca support FieldGo (dữ liệu HƯ CẤU)

## Room này để làm gì
Bàn giao ca giữa team support L1 của Sunrise Beverages (app FieldGo). Mục tiêu duy nhất: **khi đổi ca, không lời hứa nào với khách bị rơi**. Mỗi case còn mở phải có đúng một người nhận với lượt nhận còn hiệu lực theo @ledger. Chỉ phải nhận lại khi **giờ hứa** của case thay đổi.

## Ai ở đây, ai lo gì
- **Ca sáng (người):** báo case, lời hứa với khách, thay đổi mới nhất.
- **Ca chiều (người):** đọc phiếu, tự nhận từng case bằng lệnh ledger.
- **@baton (agent):** đọc hội thoại, lập **phiếu bàn giao** dạng khối `[BATON vN]`. Chỉ đề xuất, không nhận case thay ai.
- **@checker (agent):** đối chiếu phiếu với tin mới nhất, phản hồi của ledger và SOP. Chỉ ra chỗ cũ/thiếu, đề nghị @baton sửa. Không tự ra phiếu.
- **@ledger (code, không dùng AI):** sổ lời hứa, áp luật cứng. Ai giữ case thì **chỉ** do chính người đó gõ lệnh nhận. Ledger là nguồn sự thật về người giữ case.

## Tên gọi trong room
- **Case:** mã `SR-1xxx` hoặc `CS-MMDD-xxx`.
- **Lời hứa / giờ hứa:** việc đã hứa với khách + giờ `HH:MM` (giờ Việt Nam, trong ngày bàn giao).
- **Đang chờ:** L2, vendor NovaSoft, DMS team, hoặc khách.
- **ETA vendor** là giờ vendor dự kiến trả lời, **không phải** giờ hứa với khách.
- **Phiếu vN:** phiếu bàn giao phiên bản N. Phiếu hiện hành là bản ledger đã báo "Đã ghi phiếu bàn giao vN".

## Quy trình
1. Ca sáng kể case trong room (cứ tự nhiên, sửa ý cũng được).
2. @baton ra phiếu. Giờ hứa, nội dung/kênh lời hứa, bên hoặc nội dung đang chờ, hoặc danh sách case mở thay đổi thì @baton ra bản kế tiếp.
3. @checker đối chiếu, nói rõ phiếu còn đúng hay đã cũ.
4. Ca chiều gõ `@ledger nhận <mã case> v<N>` cho từng case mình nhận.
5. `@ledger status` để xem ai giữ case nào. Chỉ khi ledger báo **"Bàn giao xong"** mới coi là xong.

## Quy tắc khi viết trong room
- Agent trả lời bằng **tiếng Việt**, ngắn. Phần giải thích dùng gạch đầu dòng. **Bên trong khối phiếu ghi đúng nguyên dạng mẫu**, không thêm gạch đầu dòng, thụt dòng hay định dạng. Không dùng bảng Markdown (Discord không hiển thị).
- Chỉ @baton được viết dòng bắt đầu bằng `[BATON v`. Agent khác nhắc tới phiếu thì viết "phiếu v2", không chép lại khối.
- Chỉ người mới gọi ledger. Agent **không viết chữ "@ledger"** trong tin của mình. Khi nhắc lệnh thì viết "lệnh ledger: nhận SR-1077 v2".
- Không chắc thì **nói rõ là không chắc** và hỏi lại, không tự điền cho đẹp. Có lỗi thì nói lỗi gì.
- Không ghi số điện thoại, email khách vào room.
- Giới hạn: ledger chỉ so giờ trong ngày bàn giao. Lời hứa sang ngày khác phải ghi rõ ngày trong lời hứa và kiểm tra thủ công.

## Tài liệu trong room
- "SOP bàn giao ca" và "Ma trận chuyển xử lý": quy trình chuẩn, @checker dùng để đối chiếu.
- "Phiếu bàn giao hiện hành": do @baton giữ, chỉ cập nhật sau khi ledger đã ghi phiếu.
