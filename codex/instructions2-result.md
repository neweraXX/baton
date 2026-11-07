**Đồng ý A:** ledger đọc `source` như chuỗi, không phụ thuộc `msg#N`. **Đồng ý B:** ledger giữ người nhận; tăng phiên bản chỉ vì nhận case sẽ gây R2 không cần thiết. Tôi rút đề xuất trước về điểm này.

Còn bốn chỗ có hậu quả cụ thể:

1. **Video vẫn có thể mất cảnh checker phát hiện phiếu cũ.** Bước 2 báo đổi giờ, trong khi `baton.md:25` yêu cầu ra bản mới ngay; tới bước 3 có thể đã có v2.  
   **Thay bước 2:** “Ca chiều nhận SR-1077 v1 thành công. Ca sáng yêu cầu baton chờ checker soát rồi mới phát hành bản tiếp theo, sau đó báo khách đổi giờ sang 15:30.”

2. **Video chưa ghi đủ lượt nhận để ‘Bàn giao xong’.** Bước 4: “Ca chiều nhận đúng v2 → … Bàn giao xong”. SR-1077 cần nhận lại và hai case còn lại đều cần nhận.  
   **Thay đoạn cuối bước 4:** “Chờ ledger xác nhận nạp v2; thử nhận case khác theo v1 để thấy R2. Chính người đã nhận SR-1077 nhận lại case đó theo v2; ca chiều nhận cả hai case còn lại theo v2, rồi gọi status.”

3. **SOP vẫn trái B.** `room-docs/sop-shift-handover.md:35`: “Cập nhật… người nhận… phải được phản ánh trong phiên bản mới.” Checker được yêu cầu theo SOP nên có thể lại đòi tăng phiên bản.  
   **Thay bằng:** “Thay đổi bên hoặc nội dung đang chờ, trạng thái đóng phải được phản ánh trong phiên bản mới. Người nhận theo ledger; không phát hành phiên bản chỉ để cập nhật người nhận.”

4. **Đổi nội dung đang chờ chưa kích hoạt cập nhật.** Room bước 2 và baton dòng 25 chỉ ghi “bên đang chờ đổi”: NovaSoft chuyển từ chờ log sang chờ bản vá thì phiếu có thể giữ thông tin cũ.  
   **Thay cụm này ở cả hai file:** “bên hoặc nội dung đang chờ đổi”.