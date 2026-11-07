**Luồng tối thiểu là: đăng ký bằng HTTP → thêm agent vào room → mở WebSocket → nhận tin được gọi → trả lời bằng HTTP.** Code hiện tại hỗ trợ protocol **9**. Docs chính vẫn ghi SSE và nhịp 2/6 giây; code dùng WebSocket, nhịp **10/30 giây**. Dưới đây ưu tiên code. Mình chỉ đọc source/test, không chạy chương trình. [Docs:11](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/docs/official/internals/agent-protocol.md:11), [artifacts.py:37](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/artifacts.py:37), [liveness.py:17](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/liveness.py:17).

**1. Để `@ledger` nhận tin và trả “pong”**

**a) Lấy địa chỉ server và khóa đăng ký**

Trong Switch Console, mở **Settings → API keys → Registration keys → Create registration key**, rồi sao chép khóa. Đây là khóa dùng để tạo agent; sau đăng ký, agent dùng khóa riêng được server trả về. [api-keys-page.tsx:30](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/renderer/features/settings/pages/api-keys-page.tsx:30), [api-keys-page.tsx:74](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/renderer/features/settings/pages/api-keys-page.tsx:74), [api-keys-page.tsx:120](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/renderer/features/settings/pages/api-keys-page.tsx:120).

Gọi `B` là địa chỉ HTTP của **agent API**. Console local chọn cổng trống, nên không mặc định cổng `8000`. Với stack quản lý bằng Docker, cổng `api` được lưu trong `ports.json` dưới thư mục trạng thái server; URL là `http://localhost:<api>`. **Không thấy cổng hay token thực của máy đang chạy từ source này.** [free-port.ts:3](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/main/core/managed-switch-server/free-port.ts:3), [free-port.ts:74](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/main/core/managed-switch-server/free-port.ts:74), [ports.ts:10](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/main/core/managed-switch-server/ports.ts:10).

**b) Đăng ký một lần**

Agent tự viết dùng **`POST B/agents`**. Không cần chọn loại Claude/Codex qua `register-known`. Tên đăng ký là `ledger`, không có dấu `@`. Body sau đáp ứng các field bắt buộc; `connector_type` là chuỗi mô tả bộ nối tự viết. [api/handlers.py:206](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:206), [api/schemas.py:20](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/schemas.py:20), [protocol/types.py:28](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/types.py:28), [agent_core.py:506](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/agent_core.py:506).

```http
POST /agents
Authorization: Bearer <REGISTRATION_KEY>
Content-Type: application/json
```

```json
{
  "name": "ledger",
  "description": "Agent Node.js trả pong",
  "connector_type": "ledger",
  "integration_profile": {
    "connection_model": "always_on",
    "message_exchange": true,
    "pre_invocation_mediation": [],
    "post_invocation_mediation": [],
    "event_reporting": []
  }
}
```

Kết quả là `{"id":"<AGENT_ID>","api_key":"<AGENT_KEY>"}`. Lưu hai giá trị này để dùng tiếp. Đăng ký trùng tên trả `409`; `overwrite:true` sẽ thay khóa cũ, nên không đăng ký lại mỗi lần khởi động. [api/handlers.py:229](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:229), [agent_core.py:477](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/agent_core.py:477).

**c) Thêm vào room và mở quyền gọi**

Chủ sở hữu phải thêm `ledger` vào room trước. Lấy **Switch room UUID**, chẳng hạn qua `POST /agents/<AGENT_ID>/ops/list_rooms` với body `{}` và khóa agent. Mở kết nối không tự cấp quyền vào room. [definitions.py:220](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:220), [definitions.py:252](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:252).

Mặc định, chỉ **chủ sở hữu và các agent của chủ đó** được gọi agent mới. Muốn người khác trong room gọi `@ledger`, chủ sở hữu đổi quyền gọi thành **Anyone** trong trang agent ở Console. [test_register_addressing_policy.py:33](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/tests/switch_core/bridges/agent/protocol/test_register_addressing_policy.py:33), [addressing-policy-control.tsx:20](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/console/apps/switch-console-desktop/src/renderer/features/switch-servers/addressing-policy-control.tsx:20).

`update_agent_detail` sửa hồ sơ và quyền gọi; **không phải thủ tục bắt buộc để bật `@mention`**. Đặc biệt, `ledger` **không được tự sửa chính nó**. Một agent khác cùng chủ sở hữu có thể gửi yêu cầu dưới đây bằng **khóa của agent khác đó**. [definitions.py:2318](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:2318), [definitions.py:2404](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:2404), [agent_management.py:104](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/agent_management.py:104).

```http
POST /agents/<OTHER_AGENT_ID>/ops/update_agent_detail
Authorization: Bearer <OTHER_AGENT_KEY>
Content-Type: application/json
```

```json
{"agent_id":"<LEDGER_AGENT_ID>","addressing":"anyone"}
```

**d) Mở WebSocket**

Đổi `http://` thành `ws://`, hoặc `https://` thành `wss://`. Tạo `connection_id` bằng UUID và giữ lại để nối lại khi mất mạng. Với bản pong chỉ cần nhận lúc được gọi:

```text
ws://localhost:<api>/agents/<AGENT_ID>/connection/ws
?connection_id=<UUID>&scope=single&rooms=<ROOM_UUID>
&filter=addressed&protocol=9&protocol_accepts=9&start_at=head
```

Đây là **một URL liên tục**. Khi bắt tay mở WebSocket, gửi header:

```http
Authorization: Bearer <AGENT_KEY>
```

Auth đọc từ header; **không thấy hỗ trợ `?token=...`** ở đường này. `rooms=` được kiểm tra quyền thành viên và nhận quyền xử lý room ngay khi mở. [api/handlers.py:1218](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1218), [auth.py:250](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/auth.py:250), [api/handlers.py:948](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:948), [api/handlers.py:1019](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1019).

Chờ frame `connection_state`, đọc `data.rooms`, `data.generation`, `data.position` và `data.heartbeat_interval_seconds`. Có thể gặp `ping` trước frame này, nên xử lý ping ngay. [stream.py:143](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/stream.py:143), [test_connection_socket.py:133](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/tests/switch_core/bridges/agent/api/test_connection_socket.py:133).

**e) Nhận tin và trả lời**

Ví dụ tin đến, rút gọn các field phụ:

```json
{
  "event": "message",
  "id": 42,
  "data": {
    "type": "message",
    "room_id": "<ROOM_UUID>",
    "bridge_id": null,
    "channel_type": null,
    "sequence": 42,
    "position": {"s": 42},
    "payload": {
      "addressed": true,
      "sender": "<SENDER_ID>",
      "sender_name": "Ha",
      "message_id": "<MESSAGE_ID>",
      "body": "@ledger ping",
      "timestamp": 1790000000000,
      "thread_id": null,
      "attachments": []
    }
  }
}
```

**Đọc nội dung ở `data.payload.body`**, không phải `content`. `timestamp` tính bằng mili giây. Cấu trúc ngoài là `{event,data,id?}`; các field bên trong được định nghĩa bằng model và bổ sung tại bước phát tin. [stream.py:94](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/stream.py:94), [types.py:219](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/types.py:219), [message_events.py:76](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/message_events.py:76), [stream.py:435](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/stream.py:435).

Cách trả lời HTTP ngắn nhất:

```http
POST /agents/<AGENT_ID>/message
Authorization: Bearer <AGENT_KEY>
Content-Type: application/json
```

```json
{"room_id":"<ROOM_UUID>","content":"pong"}
```

Server trả `{"ok":true,"event_id":"..."}`. **Endpoint này dùng `content`**. [schemas.py:99](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/schemas.py:99), [handlers.py:487](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:487).

Nếu cần trả trong thread, dùng `POST /agents/<AGENT_ID>/ops/post_message`, thêm `X-Switch-Connection-Id: <UUID>`, body `{"body":"pong","thread_id":"<THREAD_ID>"}`. Operation này dùng **`body`**, room được lấy từ kết nối; kết quả bọc trong `{"result":...}`. [definitions.py:788](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:788), [operations.py:296](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/operations.py:296), [operations.py:356](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/operations.py:356).

**2. Nhận những tin nào? Đọc lịch sử/tài liệu được không?**

- **`filter=all` — mặc định:** nhận cả hội thoại trong các room kết nối bao phủ. **`filter=addressed`:** nhận message có `payload.addressed=true`, cùng sự kiện vào room mà agent được cấu hình nghe; không nhận `command`. Vì vậy hãy dựa vào cờ `addressed`, tránh tự đoán bằng tìm chuỗi `@ledger`. [agent_connections.py:518](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/agent_connections.py:518), [event_buffer.py:249](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/event_buffer.py:249), [test_stream.py:645](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/tests/switch_core/bridges/agent/protocol/test_stream.py:645).
- **Lịch sử có:** gọi operation `read_context`, ví dụ `{"room_id":"<ROOM_UUID>","limit":50}`. Trả `threads`, `truncated`, `oldest_timestamp`; phân trang bằng `before` dạng thời gian ISO. Chỉ đọc được room mình là thành viên. [definitions.py:657](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:657).
- **Room documents có:** gọi `connect_to_room` với `{"room_id":"..."}` và header kết nối để lấy danh sách `documents`; sau đó gọi `load_internal_documents` với `{"ids":["<DOCUMENT_ID>"]}` để lấy nội dung. Chỉ tải được tài liệu gắn với room đang kết nối. Các operation đều đi qua `POST /agents/<AGENT_ID>/ops/<tên>`. [definitions.py:272](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:272), [definitions.py:539](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/operations/definitions.py:539), [operations.py:296](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/operations.py:296).

**3. Heartbeat, reconnect và lỗi**

- **Heartbeat** là tín hiệu “tôi còn sống”. Server gửi JSON `{"event":"ping","data":{}}` mỗi **10 giây**; đáp lại JSON **`{"type":"pong"}`**. Đây là tin JSON của ứng dụng. Code hiện tại chỉ kiểm tra `type`, không đọc `cursor` trong pong; sau **30 giây** không nhận heartbeat, kết nối hết hạn. Nó khác với việc đăng `"pong"` vào room. [handlers.py:1321](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1321), [handlers.py:1385](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1385), [liveness.py:25](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/liveness.py:25).
- **Reconnect:** giữ UUID cũ và `rooms=`; lưu `position` — “đã đọc tới đâu”. Với protocol 9, gộp các khóa position bằng giá trị lớn nhất rồi nối lại bằng `start_at=<JSON position đã mã hóa URL>`, thay cho `head`. Có thể thêm `expected_generation=<generation cũ>` để phát hiện kết nối đã bị tiến trình khác thay thế. [positions.py:1](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/positions.py:1), [handlers.py:821](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:821), [agent_connections.py:729](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/agent_connections.py:729).
- Nhận **`gap`** nghĩa là thiếu đoạn sự kiện: đọc lại `read_context`; frame có `resumed_position` để tiếp tục. Nhận **`evicted` với `code:"taken_over"`** thì dừng tiến trình bị thay thế, đừng reconnect liên tục giành kết nối. [stream.py:518](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/protocol/stream.py:518), [test_connection_socket.py:248](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/tests/switch_core/bridges/agent/api/test_connection_socket.py:248).
- **Lỗi thường gặp:** `401` do khóa sai/nhầm loại; `403` khi room khai báo không được truy cập hoặc sửa hồ sơ không có quyền; `409` khi đăng ký trùng tên, kết nối đã chết hoặc phiên bản protocol không tương thích. WebSocket có thể mở rồi gửi `{"event":"refused","data":{"status":...,"detail":...}}` trước khi đóng, nên phải đọc frame lỗi. [handlers.py:163](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:163), [handlers.py:1048](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1048), [operations.py:243](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/operations.py:243), [handlers.py:893](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:893), [handlers.py:1275](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/switch_core/bridges/agent/api/handlers.py:1275).

Một lệch docs nữa cần nhớ: với protocol 9 và `filter=all`, **tin hội thoại thông thường có thể không có `id`/`sequence`**; dùng `data.position` để nối lại. Test xác nhận trường hợp này, trái với docs chính nói mọi domain event đều có sequence. [test_stream.py:367](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/core/tests/switch_core/bridges/agent/protocol/test_stream.py:367), [docs:112](C:/Users/ADMIN/Desktop/hackathon/ref/switch-src/docs/official/internals/agent-protocol.md:112).