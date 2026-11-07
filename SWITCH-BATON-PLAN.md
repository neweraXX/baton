# Baton — plan build cho hackathon Flip the Switch

> Hackathon: https://www.wemakedevs.org/hackathons/switch · Track 1 (Best Business Workflow) + Best Blog
> **Hạn chót thật: 07/11 23:59 IST = 08/11 01:29 giờ VN. Mục tiêu nộp: 07/11 22:00 VN** (để 3,5 tiếng dự phòng).
> Toàn bộ data HƯ CẤU (Sunrise Beverages / FieldGo, tái dùng `mock-sharepoint/`, `mock-data/`). Không dùng data thật của công ty.

## Tiêu chí chấm của hackathon này (khung chung đã chỉnh theo rubric chính thức)

| Rubric chính thức | Ứng với khung chung | Baton đáp ứng bằng |
|---|---|---|
| Use of Switch: bỏ Switch thì dự án còn chạy không? | Cổng 1: công nghệ sponsor gánh phần lõi | Room chung + agent mới vào tự đọc bối cảnh + `@ledger` đi qua agent protocol. Bỏ Switch là demo chết |
| Technical execution: clone về chạy lại được không? | 3: người dùng chạy được thật | README chạy lại từ đầu, file YAML template, unit test cho ledger, tự thử clone ra thư mục mới |
| Creativity & impact: idea mới, giải vấn đề thật của team | 2: chất xám thấy được trong 60 giây | Khoảnh khắc ledger từ chối phiếu cũ + bảng eval có số liệu thật |
| Presentation: video + README nói rõ Switch được dùng thế nào | 2 + 6 | Video 2 phút, sơ đồ kiến trúc, blog cho Best Blog |

Tiêu chí 4 (doanh thu) không có trong rubric → bỏ qua. Tiêu chí 5 (data/thời gian) → tái dùng mock data sẵn có.
Lưu ý: khung chung dặn không neo idea vào domain công việc của Hà. Baton là bài toán bàn giao ca của team support nói chung (ai làm ca kíp cũng gặp), nên video và README kể theo hướng chung, FMCG chỉ là bối cảnh data hư cấu.

## Câu chốt của bài

**"Đổi ca rồi, ai giữ lời hứa gọi lại cho khách?"**
LLM lo phần hiểu ngôn ngữ, code lo phần không được phép sai.

## Kiến trúc (1 room, 3 agent, 2 người)

Room `#fieldgo-shift-desk` (Mattermost do Switch Console dựng sẵn).

| Thành viên | Loại | Việc |
|---|---|---|
| Ca sáng (Hà, acc 1) | Người | Báo case, lời hứa với khách |
| Ca chiều (acc 2) | Người | Nhận case, xác nhận phiên bản phiếu |
| `@baton` | Claude Code qua Switch | Đọc chat lộn xộn → trích case + lời hứa → xuất **khối cấu trúc** (định dạng cố định) để `@ledger` đọc; giữ room document "phiếu bàn giao vN" |
| `@checker` | Codex (hoặc Claude) qua Switch | Đối chiếu phiếu với hội thoại mới nhất + SOP/runbook, chỉ ra chỗ thiếu/cũ, đề nghị sửa (không sửa được document của baton — đúng luật Switch) |
| `@ledger` | **Node.js tự viết, KHÔNG LLM**, nối qua agent protocol (WebSocket + HTTP) | Sổ lời hứa dạng máy trạng thái; chặn bàn giao sai bằng luật cứng |

### Hợp đồng giữa LLM và code (điểm thiết kế quan trọng)
`@baton` không được viết tự do cho ledger, mà phải xuất khối dạng cố định, ví dụ:
```
[BATON v2]
SR-1077 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: ? | source: msg#12
CS-0924-003 | promise: - | waiting: L2 | owner: Dung | source: msg#7
```
`@ledger` parse khối này. Parse lỗi → ledger trả lại "khối không hợp lệ, dòng X" (không đoán).

### Máy trạng thái của `@ledger` (mỗi case)
`OPEN → DRAFTED(vN) → CLAIMED(owner, vN) → CLOSED`

Luật cứng (mỗi luật = 1 test):
- R1 Bàn giao chưa xong nếu còn case `owner: ?`
- R2 Người nhận xác nhận phiếu cũ (v1 khi đã có v2) → từ chối
- R3 Giờ hứa đổi sau khi phiếu đã ra → đánh dấu phiếu cũ, yêu cầu phiên bản mới
- R4 Hai người cùng nhận một case → cảnh báo xung đột
- R5 Case có lời hứa sắp tới hạn (< 30 phút) mà chưa ai nhận → báo động
- Lệnh: `@ledger status` (bảng ai giữ case nào), `@ledger nhận SR-1077 v2`

## Lịch build (giờ VN)

### Giai đoạn 0 — Tối 05/11 (~2–3 tiếng): dựng môi trường — **TRÊN PC WINDOWS, không cài app lên MacBook** (Hà chốt 05/11)
- PC: Docker Desktop (WSL2) + Switch Console bản Windows (early access) + Claude Code. Claude làm việc trực tiếp trên PC (cài Claude Code/desktop app ở PC), không mở SSH vào PC.
- Fallback nếu Console Windows lỗi: Ubuntu trong WSL2 làm remote host (Console hỗ trợ Linux qua SSH, không hỗ trợ Windows làm host).
- [ ] Đăng ký hackathon trên WeMakeDevs (Hà tự làm), star repo Switch
- [ ] Bật Docker Desktop
- [ ] Cài Switch Console: https://docs.switchagents.ai/switch-rooms/getting-started/install-switch-console → "Run Switch for yourself" → switch-buddy chạy bằng Claude Code đã đăng nhập
- [ ] Kiểm Mattermost đã được dựng sẵn; tạo user thứ 2 (ca chiều)
- [ ] Tạo room `#fieldgo-shift-desk`, thử 1 agent trả lời được trong room
- **Điểm kiểm:** nhắn trong Mattermost, agent trả lời. Không được thì tối nay chuyển qua Discord.

### Giai đoạn 1 — Sáng 06/11 (TỐI ĐA 3 tiếng): thử `@ledger`, rủi ro lớn nhất làm trước
- [ ] Đọc https://docs.switchagents.ai/switch-rooms/internals/agent-protocol (đăng ký `POST /agents`, mở WebSocket, `update_agent_detail` để cho người khác gọi được agent)
- [ ] Bản nhỏ nhất: `@ledger` nhận tin trong room → trả lời "pong"
- **Cổng quyết định 12:00:** chạy được → làm tiếp giai đoạn 3. Không chạy được → bỏ ledger, đưa luật R1–R5 vào instructions của `@checker` và nói rõ trong README. Không cố thêm.

### Giai đoạn 2 — Chiều 06/11: 2 agent LLM + room
- [ ] Room Instructions (tên gọi nội bộ, ai lo gì, quy trình bàn giao, luật "nói rõ khi không chắc")
- [ ] Đưa vào room: SOP bàn giao (`mock-sharepoint/sop/shift-handover.md`), escalation, runbook liên quan
- [ ] `@baton`: instructions + định dạng khối `[BATON vN]`
- [ ] `@checker`: instructions, đối chiếu SOP
- [ ] Test bằng `!invite-agent` (agent mới không được dặn trước vẫn hiểu room đó để làm gì)
- [ ] Chạy tay kịch bản demo 1 lượt

### Giai đoạn 3 — Tối 06/11: máy trạng thái `@ledger`
- [ ] Parser khối `[BATON vN]`
- [ ] R1–R5 + lệnh `status` / `nhận`
- [ ] Unit test cho từng luật (chạy `node --test`)

### Giai đoạn 4 — Sáng 07/11: bộ kịch bản đánh giá
- [ ] 15–20 kịch bản bàn giao hư cấu (`eval/scenarios/*.md`): đổi giờ, quên người nhận, nhận phiếu cũ, 2 người cùng nhận, khách đổi kênh liên lạc, case đã xong nhưng còn nằm trong phiếu…
- [ ] Chạy, ghi kết quả thật: bắt được bao nhiêu / trượt cái nào / vì sao (LLM trích sai hay luật thiếu)
- [ ] Đưa bảng kết quả vào README, giữ cả ca trượt

### Giai đoạn 5 — Chiều 07/11: đóng gói
- [ ] Repo public (account GitHub phụ), README: vấn đề, kiến trúc, cách chạy lại từ đầu, file YAML template agent/room, kết quả eval, giới hạn
- [ ] Thử clone repo ra thư mục mới và chạy theo README (tiêu chí "chạy lại được")
- [ ] Video ≤ 2–3 phút theo kịch bản bên dưới
- [ ] Bản nháp blog (Best Blog)

### Giai đoạn 6 — Tối 07/11: nộp trước 22:00
- [ ] Nộp form, link repo + video + blog; đăng #HowISwitch

## Kịch bản video (5 bước, ~2 phút) — sửa 06/11 sau phản biện Codex (bản cũ cho R2 xảy ra trước khi có v2, không chạy được)
1. Ca sáng báo 3 case; SR-1077 chờ vendor, hứa gọi lại **16:00**. `@baton` ra phiếu v1, ledger báo "Đã ghi phiếu v1".
2. Ca chiều nhận ngay `@ledger nhận SR-1077 v1` → ✅. Ca sáng dặn baton **chờ checker soát rồi mới ra bản tiếp theo**, sau đó báo: "khách vừa đổi sang **15:30**".
3. Mời `@checker` vào lần đầu, không dặn trước → nó tự đọc room, phát hiện phiếu v1 còn ghi 16:00 và còn case chưa ai nhận → đề nghị baton ra v2.
4. `@baton` ra v2 → chờ ledger báo "Đã ghi phiếu v2" kèm **(R3)** "giờ hứa đổi 16:00 → 15:30, phải nhận lại trên v2". Ca chiều (nhìn ảnh phiếu cũ) gõ nhận case khác theo v1 → **(R2) từ chối**. Chính người đã nhận SR-1077 nhận lại theo v2; ca chiều nhận cả hai case còn lại theo v2 → `@ledger status` → "Bàn giao xong".
5. Ca chiều hỏi baton "SR-1077 gọi thì nói sao?" → trả lời đúng lịch sử + mốc 15:30. Cuối video: bảng kết quả eval.
- Khi quay: đặt `LEDGER_FAKE_NOW` trong `ledger/.env` để giờ "hiện tại" cố định.

## Phân vai
- **Hà:** viết code `@ledger` + test (Claude chỉ review, gợi ý — không viết hộ trừ khi Hà bảo), viết instructions agent, quay video, viết blog.
- **Claude / Codex:** đọc kỹ docs protocol khi Hà cần, review code, soạn data kịch bản eval hư cấu, soát README.

## Phần làm thêm (chỉ khi dư thời gian)
- Switch Trust tự che SĐT khách trước khi vào room
- Script nhắc trước giờ hứa 15 phút (Switch không có tính năng hẹn giờ trong room)
- Code with Wispr (đọc prompt bằng giọng nói)
