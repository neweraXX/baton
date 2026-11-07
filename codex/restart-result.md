**Chưa đủ bằng chứng kết luận server bị reset.** Có nhánh tạo database mới, nhưng điều kiện không phải chỉ vì server đã dừng.

Mọi dẫn mã dưới đây thuộc tag **`switch-console-v0.40.1`**, đọc bằng `git show`. Viết tắt đường dẫn:

- `M/` = `console/apps/switch-console-desktop/src/main/core/managed-switch-server/`
- `R/` = `console/apps/switch-console-desktop/src/renderer/features/switch-servers/`
- `S/` = `console/apps/switch-console-desktop/src/main/core/switch-servers/`

**1) Mở lại / bấm Start có tạo mới không?**

| Trường hợp | Hành vi có trong mã |
|---|---|
| Mở Console khi server dừng | Kiểm tra trạng thái; server dừng được đánh dấu để nâng cấp khi Start. **Không thấy nhánh tự reset vì server dừng.** `M/local-server-service.ts:305–359`. |
| Start, database cũ còn | Dùng lại database, đồng bộ mật khẩu các tài khoản database. Không tạo role/database mới trong nhánh này. `M/native/native-stack.ts:383–392`; `M/native/postgres-cluster.ts:153–167`. |
| Không thấy `native/pgdata/PG_VERSION` | Được coi là chưa có database; chạy khởi tạo mới. Tên cố định: database `switch`, tài khoản chạy ứng dụng `switch_app`, tài khoản quản trị `postgres`. `M/native/postgres-cluster.ts:15–18,79–85,99–145`. |
| Bấm Reset | Xóa database, run, log, thông tin đăng nhập và cổng đã lưu; lần Start sau tạo mới. Còn xóa agent trước đó. `M/local-server-service.ts:714–720`; `M/native/native-stack.ts:540–558`. |

**Chọn cổng mới:** khi `ports.json` không đọc được, JSON lỗi hoặc thiếu bốn trường số hợp lệ; cổng mới được ghi lại. Cổng còn hợp lệ thì dùng lại. `M/ports.ts:14–40`; `M/free-port.ts:57–65`.

Cổng bị chiếm thì Start **báo lỗi**; nút **`Use another port`** mới chọn và lưu cổng thay thế rồi Start lại. `M/native/native-stack.ts:159–163`; `R/managed-server-view.tsx:751–762`; `M/local-server-service.ts:782–800`.

**Server “mới” trong Console khác database mới:** bản ghi local cũ còn thì giữ ID, kể cả đổi cổng. Chỉ tạo ID mới khi không tìm thấy bản ghi local tương ứng hoặc bản ghi có thể nhận lại tại URL đó. `S/servers-store.ts:162–176,217–253`. Thư mục `agent-controller/servers/<ID>` đi theo ID này, nên hai thư mục **chưa chứng minh database bị reset**. `src/main/core/embedded-controller/controller-files.ts:40–43`.

**Log/run đổi chỗ:** nhánh native đặt cố định dưới `<userData>/local-switch-server/native/{logs,run}`; không thấy đổi theo cổng hay ID controller. `M/paths.ts:7–8`; `M/native/native-paths.ts:30–41`.

**2) Lần tắt/bật sau và kiểm tra trước video**

- Trên trang server cũ, dùng **`Stop`**, lần sau **`Start`**; cần khởi động lại ngay thì **`Restart`**. Stop gọi nhánh dừng tiến trình, giữ dữ liệu. `R/managed-server-view.tsx:435–455`; `M/local-server-service.ts:640–663`; `M/native/native-stack.ts:525–532`.
- Tránh **`Reset…` → `Reset and delete all agents`**: đây chính là thao tác xóa dữ liệu. `R/server-reset-section.tsx:57,69–72,92`.
- Trước video, đề xuất thử một vòng Stop → Start, rồi vào **Home → Refresh**; kiểm tra **Your Agents**, **Your Rooms**, và Discord trong **Messaging apps** vẫn đúng. Refresh tải lại cả agent, room và kết nối; danh sách kết nối phụ thuộc workspace đang chọn, nên kiểm tra đúng workspace cũ. `R/view.tsx:104–116,220`; `R/server-stat-tiles.tsx:30–56`; `R/MessagingAppsCard.tsx:207`.
- Xem **Recent activity** để tìm `Reset` hoặc `Start failed`. `R/managed-server-view.tsx:73–78,314–327`.

Đây là quy trình kiểm tra; **chưa xác định nguyên nhân mất cấu hình lần trước nên chưa thể bảo đảm đã khắc phục**.

**3) Log hiện tại ở đâu?**

Đích ghi của native là:

`C:\Users\ADMIN\AppData\Roaming\switchdash\local-switch-server\native\logs\`

Core ghi `switch-core.log`; PostgreSQL ghi `postgres.log`, kèm `pg_ctl.log`; bước chuẩn bị ghi `postgres-setup.log`. `M/native/core-process.ts:126–136`; `M/native/postgres-cluster.ts:216–223`; `M/native/native-stack.ts:371`.

**Điểm khác với mốc bạn cung cấp:** hiện [ports.json](C:/Users/ADMIN/AppData/Roaming/switchdash/local-switch-server/ports.json:3) đã ghi **51547**; [native/run/switch-core.json](C:/Users/ADMIN/AppData/Roaming/switchdash/local-switch-server/native/run/switch-core.json:4) ghi lúc **06/11 11:04:50**. Kiểm tra metadata hiện tại thấy `native/logs/switch-core.log` và `postgres.log` đều **0 byte**. Vì vậy xác nhận được **đích log theo mã**, nhưng **không thấy nội dung log đang tăng hoặc bằng chứng ghi sang đường khác**.