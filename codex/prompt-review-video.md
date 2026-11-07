Che do read-only. KHONG chay code, khong cai package, khong mang.

Review doc lap bo ghi video khong dung ffmpeg: `demo/video/avi-writer.js` (ghi AVI MJPEG bang Node thuan), `demo/video/screencast.js` (CDP Page.startScreencast -> AVI, nhip co dinh 12 fps), `demo/video/cdp.js` (client CDP), va cho goi trong `demo/video/record-demo.js`.
Da thu: file 36 khung 640x360 -> Windows Explorer doc dung Length 00:00:03, 12 fps.

Cau hoi (uu tien cau 1, het gio tra phan da chac):
1. Loi lam file HONG hoac sai voi video that ~2-3 phut, khung ~1264x1300, JPEG ~100-200KB/khung (~1800 khung, ~250MB): tran so 32-bit, offset idx1, kich thuoc LIST/RIFF, chunk le byte, khung dau tien co kich thuoc khac khung sau (vd khi cua so doi kich thuoc), gioi han 1GB/2GB cua AVI 1.0. Moi loi: file:dong + dau vao cu the.
2. screencast.js: rui ro mat khung / video dung hinh (quen ack, listener bi ghi de, setInterval tre), stop() khi dang co khung dang ghi, ket noi CDP dong giua chung.
3. Neu muon chuyen AVI -> MP4 bang cong cu CO SAN cua Windows 10 (khong cai them), co cach nao chac chan (vd WinRT Windows.Media.Transcoding.MediaTranscoder goi tu PowerShell)? Neu co, ghi khung lenh ngan; khong chac thi noi khong chac.

Tieu chi: chi bao loi chung minh duoc bang dau vao cu the. Tieng Viet, ngan.
