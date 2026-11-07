Chỉ đọc và lần theo code; không chạy chương trình, test hay mạng.

Tôi thấy **3 lỗi so với SPEC**:

1. **Parser có thể áp dụng một phần phiếu, đóng nhầm case** — [parse-block.js:90](C:/Users/ADMIN/Desktop/hackathon/ledger/src/parse-block.js:90).

   Giả sử v1 có SR-1 và SR-2. Gửi khối v2 sau, có dòng trống giữa hai case:

   ```text
   [BATON v2]
   SR-1 | promise: - | waiting: - | owner: ? | source: msg#1

   SR-2 | promise: - | waiting: - | owner: ? | source: msg#2
   ```

   **Sai:** parser trả thành công với riêng SR-1; `applyBlock` chuyển SR-2 sang CLOSED. **Đúng theo §1a:** báo lỗi định dạng và không áp dụng gì; không được âm thầm cắt khối. Fence bao ngoài hoạt động, nhưng `startsWith('```')` cũng dừng đọc ngay.

2. **Mất thông báo R3 khi tiếp tục đổi giờ trong lúc đã stale** — [ledger-state.js:45](C:/Users/ADMIN/Desktop/hackathon/ledger/src/ledger-state.js:45).

   Input: SR-1 v1 hứa **16:40**, Dung nhận v1; v2 đổi **15:50**; v3 đổi **15:40**, Dung chưa nhận lại.

   **Sai:** v3 có `events=[]`, bot chỉ báo đã ghi phiếu. **Đúng theo §3.3:** báo giờ khác giờ Dung đã nhận, yêu cầu Dung nhận lại **v3**. Cờ `stale` vẫn đúng; lỗi nằm ở thông báo.

3. **Vừa cảnh báo owner chưa xác nhận, vừa tuyên bố bàn giao xong** — [ledger-state.js:171](C:/Users/ADMIN/Desktop/hackathon/ledger/src/ledger-state.js:171), [format.js:87](C:/Users/ADMIN/Desktop/hackathon/ledger/src/format.js:87).

   Input: v1 có SR-1 `owner: Dung`; **Minh** nhận SR-1 v1; gọi `status`.

   **Sai:** có cảnh báo “Dung chưa tự xác nhận” nhưng `done=true`, rồi in “Bàn giao xong”. **Đúng theo điều kiện kết thúc §5:** còn cảnh báo đối chiếu thì chưa in câu hoàn tất.

Các điểm còn lại: **không thấy lỗi** R4 khi người giữ đã stale; R5 đúng ở 29 phút, đúng 30 phút và quá giờ. Cờ stale so với `claim.promiseMin` đúng; quay về giờ đã nhận sẽ hết stale theo cách so sánh §3.3. Tên được trim hai đầu và so không phân biệt hoa/thường; SPEC chưa quy định gộp khoảng trắng giữa tên. Mention số `<@123>`, `<@!123>`, `<@&123>` được hỗ trợ. Case CLOSED xuất hiện lại sẽ OPEN và mất claim; SPEC chưa chốt chính sách này nên không kết luận là lỗi.

Với **`bot.js`**, có các rủi ro sau:

- [Dòng 168](C:/Users/ADMIN/Desktop/hackathon/ledger/bot.js:168): dùng `WebSocket` global của Node nhưng truyền `{headers: ...}` vào đối số `protocols`. Với API chuẩn này, cấu hình hợp lệ vẫn có thể lỗi ngay lúc khởi tạo; object đó không thiết lập Authorization.
- [Dòng 123](C:/Users/ADMIN/Desktop/hackathon/ledger/bot.js:123): tự bỏ qua đúng tên `'ledger'`. Không thấy vòng lặp khi tên khớp. Nếu self-echo mang tên `'Ledger'` và `addressed:true`, bot vẫn trả help; nếu echo tiếp tục được đánh dấu addressed thì có thể lặp.
- **Tin của @baton được xử lý:** `filter=all`, kiểm tra khối trước `addressed` ([dòng 112](C:/Users/ADMIN/Desktop/hackathon/ledger/bot.js:112)).
- [Dòng 176](C:/Users/ADMIN/Desktop/hackathon/ledger/bot.js:176): mất kết nối là thoát; không có reconnect hoặc phục hồi tin bị lỡ trong code.
- [store.js:8](C:/Users/ADMIN/Desktop/hackathon/ledger/src/store.js:8): ghi đè file trực tiếp. Dừng giữa lần ghi có thể để lại JSON dở; lần khởi động sau lỗi tại dòng 15. Nếu ghi lỗi sau `applyBlock`, RAM đã đổi nhưng file chưa đổi, bot chỉ log lỗi và không trả lời.
- [Dòng 33](C:/Users/ADMIN/Desktop/hackathon/ledger/bot.js:33): phụ thuộc múi giờ máy. Máy UTC, thực tế VN 15:00, hứa 15:20: code tính còn 440 phút thay vì 20, mất R5.

Các test còn thiếu đáng ưu tiên, tối đa 8:

| Tên test | Input | Mong đợi |
|---|---|---|
| R3 đổi tiếp khi stale | 16:40 → 15:50 → 15:40, không nhận lại | V3 vẫn có thông báo R3 |
| R3 quay về giờ claim | 16:40 → 15:50 → 16:40 | `stale=false` theo phép so sánh §3.3 |
| R4 giữ chỗ khi stale | Dung stale; Minh nhận bản hiện hành | Conflict; giữ nguyên claim Dung |
| Status còn lệch owner | Hint Dung, Minh đã nhận | Có đối chiếu; không báo hoàn tất |
| Parser không áp dụng một phần | Khối hai case có dòng trống ở giữa | Từ chối; version/cases không đổi |
| Nhận lại với tên chuẩn hóa | Dung nhận; `' dung '` nhận lại | Thành công, không R4 |
| Bot phân biệt self/baton | Self ledger; baton gửi khối không addressed | Bỏ self; áp dụng khối baton |
| Giờ VN độc lập máy | Máy UTC, VN 15:00, hứa 15:20 | R5 còn 20 phút |