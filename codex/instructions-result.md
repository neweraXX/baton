Đã đối chiếu đủ tài liệu, chỉ đọc. Các điểm có hậu quả cụ thể:

**1. Có thể khiến ledger đọc sai hoặc bỏ sót**

- [room:30](C:/Users/ADMIN/Desktop/hackathon/instructions/room-instructions.md:30): “Agent trả lời… gạch đầu dòng.” Áp vào header thì ledger không nhận ra; áp vào dòng case thì lỗi mã. **Thay bằng:** “Phần giải thích dùng gạch đầu dòng; bên trong khối phiếu ghi nguyên dạng mẫu, không thêm bullet, thụt cấp hay định dạng Markdown.”

- [baton:12](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:12): “cách nhau bằng ` | `” chưa cấm dấu phân cách trong giá trị. Parser dùng `split('|')`, kể cả `\|` cũng làm sai số trường. **Thêm:** “Mỗi dòng case có đúng bốn dấu `|` phân cách; trong giá trị dùng dấu phẩy hoặc chấm phẩy thay cho `|`, không dùng `\|`; không xuống dòng giữa một case.”

- [baton:13](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:13): “việc đã hứa + giờ” vẫn cho phép viết “đổi 16:00 sang 15:30”. Ledger lấy **16:00 đầu tiên**, không hiểu ý sửa giờ. **Thay bằng:** “`promise` chỉ ghi việc đã hứa và một giờ hiện hành duy nhất dạng `HH:MM`; giờ cũ và ETA vendor ghi trong phần giải thích ngoài khối. Chưa có lời hứa thì ghi `-`.”

- [baton:16](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:16): “Đếm tin từ đầu đợt bàn giao” không xác định mốc đầu, có tính tin agent không; checker mới vào có thể đếm khác. Ledger không kiểm chứng `source`. **Thay bằng:** “`source` dùng nhãn `msg#N` đã có sẵn trong hội thoại; nếu không có, dùng ID hoặc liên kết thật của tin nhắn. Không tự đánh số theo phần lịch sử đang nhìn thấy.” Đồng thời thay yêu cầu `msg#` trong checker thành “nguồn tin kiểm chứng được”. Parser chấp nhận nguồn dạng chuỗi; SOP cũng cho phép nhiều loại nguồn.

- [baton:21](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:21), [baton:28](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:28), [room:18](C:/Users/ADMIN/Desktop/hackathon/instructions/room-instructions.md:18): “lần đầu… v1”, “cập nhật mỗi khi ra phiếu”, “bản lớn nhất… hiện hành”. Agent khởi động lại dễ dùng lại v1; phiếu bị từ chối vẫn có thể thành tài liệu “hiện hành”. **Thay bằng:** “Phiếu hiện hành là bản ledger đã xác nhận nạp thành công. Bản tiếp theo dùng N+1; chỉ dùng v1 khi ledger chưa có phiếu. Chỉ cập nhật tài liệu hiện hành sau xác nhận; nếu bị từ chối, báo lỗi và đối chiếu lại phiên bản.”

- [baton:22](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:22): “case đã đóng (bỏ dòng đó ra)”. Khi đóng **case cuối cùng**, khối rỗng bị parser từ chối (`parse-block.js:112`), ledger vẫn giữ case mở. **Thêm:** “Nếu không còn case mở, báo rõ ledger hiện không nhận phiếu rỗng; không tự kết luận bàn giao xong.” Đây là giới hạn code, instructions không giải quyết triệt để được.

Không thấy thiếu quy tắc về **bọc khối, không viết sau khối, checker không chép header, và ghi lại đủ mọi case mở**: bản nháp đã có cả bốn.

**2. Mâu thuẫn có hậu quả**

- [checker:12](C:/Users/ADMIN/Desktop/hackathon/instructions/checker.md:12): “chưa có người nhận (`owner: ?`)” trái SPEC: owner chỉ là gợi ý; người có tên vẫn có thể chưa nhận, còn `?` vẫn có thể đã nhận thành công. **Thay bằng:** “Xác định người nhận và lượt nhận còn hiệu lực từ phản hồi ledger; không suy ra từ `owner`. Chưa có bằng chứng ledger thì nói chưa xác minh; khi giờ hứa đổi, kiểm tra người giữ case đã nhận lại chưa.”

- [room:4](C:/Users/ADMIN/Desktop/hackathon/instructions/room-instructions.md:4): “nhận, đúng phiên bản phiếu mới nhất” dễ khiến yêu cầu nhận lại sau mọi cập nhật, trái R3 và SOP. **Thay bằng:** “Mỗi case mở phải có đúng một người nhận với lượt nhận còn hiệu lực theo ledger; chỉ phải nhận lại khi giờ hứa của case thay đổi.”

- [baton:22](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:22) thiếu thay đổi **nội dung/kênh lời hứa và người nhận** trong các điều kiện ra bản mới; checker lại phải bắt đổi kênh, SOP yêu cầu phản ánh người nhận. **Thay bằng:** “Ra bản kế tiếp, ghi đủ mọi case mở, khi nội dung/kênh/giờ lời hứa, bên hoặc nội dung đang chờ, người nhận hay tập case mở thay đổi.”

- [baton:14](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:14) chỉ liệt kê tên bên chờ, thiếu nội dung đang chờ theo SOP. **Thay bằng:** “`waiting`: bên đang chờ và việc đang chờ họ xử lý; không chờ ai thì `-`.”

- SOP cho phép hứa **khác ngày**, ledger chỉ lưu phút trong ngày: đổi ngày nhưng giữ cùng giờ không làm lượt nhận cũ mất hiệu lực. **Thêm vào room:** “Ledger hiện chỉ đối chiếu giờ trong ngày bàn giao; lời hứa khác ngày phải ghi rõ ngày và kiểm tra thủ công, không dùng riêng trạng thái ledger để kết luận đã xác nhận đúng hạn.”

**3. Thiếu để chạy video**

- [checker:7](C:/Users/ADMIN/Desktop/hackathon/instructions/checker.md:7): “đọc hội thoại gần nhất” có thể bỏ mất case ban đầu hoặc mốc 16:00. **Thay bằng:** “Ngay khi vào room, tự đọc SOP và Phiếu bàn giao hiện hành, lấy lịch sử từ nguồn của từng case tới tin mới nhất; truy ngược thêm khi thiếu dữ kiện. Không cần người dùng kể lại; chưa đủ lịch sử thì nói chưa đủ căn cứ, không kết luận phiếu khớp.”

- [baton:27–28](C:/Users/ADMIN/Desktop/hackathon/instructions/baton.md:27) chưa quy định **Instructions của từng room document**. Tài liệu Switch nói rõ chỉ có Content chưa đủ bảo đảm agent mở đọc. **Thêm:** “Khi tạo tài liệu, đặt Instructions: SOP — ‘Đọc khi vào room và dùng để soát phiếu’; Phiếu bàn giao hiện hành — ‘Đọc khi vào room, đối chiếu với hội thoại mới hơn; không mặc định phiếu còn đúng’.”

- [plan:104](C:/Users/ADMIN/Desktop/hackathon/SWITCH-BATON-PLAN.md:104) đặt **từ chối v1 trước khi nạp v2**: R2 chưa thể xảy ra. Baton tự cập nhật ngay cũng có thể làm checker không còn thấy phiếu cũ. **Thay bước 2:** “Baton ra v1; ca sáng yêu cầu baton chờ checker soát trước khi phát hành tiếp, rồi báo SR-1077 đổi sang 15:30.” **Thay bước 4:** “Checker đề nghị sửa; baton ra v2 và chờ ledger xác nhận nạp. Ca chiều thử nhận v1 → bị từ chối; sau đó nhận từng case theo phiên bản ledger hiện hành và xem status.”

**4. Có thể cắt**

Quy tắc cấm viết `@ledger` lặp ở room, baton và checker. Giữ một lần trong room; thay phần nhắc lệnh của hai agent bằng: “Nhắc người nhận dùng lệnh ledger với mã case và phiên bản hiện hành.” Giữ nguyên các luật định dạng khối vì sai một dòng có thể làm hỏng cả phiếu.