Với **1.800 khung × 100–200 KB**, chưa thấy lỗi tràn số hay cấu trúc AVI. Chỉ review tĩnh; không chạy mã, cài gói hoặc dùng mạng.

**Câu 1:** Các lỗi xác định được:

- **Kích thước stream sai khi đổi cửa sổ** — [avi-writer.js:46](C:/Users/ADMIN/Desktop/hackathon/demo/video/avi-writer.js:46): chỉ đọc kích thước JPEG đầu tiên. Đầu vào: khung đầu `640×360`, các khung sau `1264×1300` → header vẫn khai báo `640×360`, không khớp JPEG bên trong. Kết quả phát phụ thuộc decoder.
- **Bỏ qua hoàn tất tệp khi dọn phụ đề lỗi** — [record-demo.js:190](C:/Users/ADMIN/Desktop/hackathon/demo/video/record-demo.js:190): nếu `caption('')` reject, chẳng hạn CDP trả lỗi mất execution context, sẽ không tới `recorder.stop()`. Header vẫn toàn số 0, không có `idx1`. Tương tự, `startScreencast` reject ở dòng 183 cũng nằm ngoài `try/finally`.
- **Lỗi ghi làm thoát trước khi hoàn tất AVI** — [screencast.js:28](C:/Users/ADMIN/Desktop/hackathon/demo/video/screencast.js:28): đầu vào cụ thể là ổ hết dung lượng lúc ghi khung thứ 100. `writeSync` ném lỗi trong timer, không được bắt → tiến trình có thể kết thúc với header chưa ghi.
- **Có tràn trên 4 GiB, ngoài quy mô dự kiến** — [avi-writer.js:66](C:/Users/ADMIN/Desktop/hackathon/demo/video/avi-writer.js:66): `>>> 0` âm thầm cắt kích thước. Với mỗi JPEG đúng **200.000 byte**, **21.473 khung** tạo tệp `4.295.115.584` byte nhưng RIFF size thành `148.280`. Đến **21.475 khung**, offset cuối vượt uint32, [dòng 111](C:/Users/ADMIN/Desktop/hackathon/demo/video/avi-writer.js:111) ném lỗi khi `finish()`.

Phần đã đối chiếu đúng: dữ liệu bắt đầu byte **224**, gốc offset `idx1` là FOURCC `movi` tại **220**, offset đầu **4**; kích thước `hdrl/strl/movi/RIFF` và padding JPEG lẻ đều khớp. Không có phép cắt số tại mốc **1/2 GB** trong mã; chưa xác minh khả năng tương thích trình đọc AVI đời cũ ở các mốc đó.

**Câu 2:**

- **Đóng CDP có thể treo vĩnh viễn** — [cdp.js:16](C:/Users/ADMIN/Desktop/hackathon/demo/video/cdp.js:16), [screencast.js:35](C:/Users/ADMIN/Desktop/hackathon/demo/video/screencast.js:35): gửi `Page.stopScreencast`, rồi socket đóng trước phản hồi → Promise pending không được reject, `.catch()` không chạy, `finish()` không tới. Nếu đóng giữa lúc quay, timer tiếp tục lặp khung cũ.
- **Timer trễ làm video ngắn hơn thời gian thật** — [screencast.js:26](C:/Users/ADMIN/Desktop/hackathon/demo/video/screencast.js:26): event loop bị chặn 2 giây giữa lúc quay → không bù khoảng 24 khung; AVI vẫn khai báo 12 fps. Ngoài ra chu kỳ làm tròn thành **83 ms**, tự nó đã lệch khoảng **0,4%**.
- **Listener có thể bị ghi đè** — [cdp.js:23](C:/Users/ADMIN/Desktop/hackathon/demo/video/cdp.js:23): đăng ký thêm `on('Page.screencastFrame', () => {})` sau `start()` sẽ thay handler recorder → không cập nhật ảnh, không ack. Chưa thấy đăng ký thứ hai trong luồng gọi hiện tại.

Ack hiện có tại dòng 23 của `screencast.js`. `stop()` không cắt ngang khung đang ghi vì `addFrame()` ghi đồng bộ trên cùng event loop.

**Câu 3:** Không chắc `Windows.Media.Transcoding.MediaTranscoder` có thể nhận AVI/MJPEG này trên mọi Windows 10. Chưa đủ cơ sở đưa lệnh PowerShell chuyển MP4 bảo đảm chỉ dùng thành phần có sẵn.