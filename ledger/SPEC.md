# Spec `@ledger` (Node.js, KHÔNG LLM)

Chốt 06/11/2026. Hà chọn R3 = "chỉ nhận lại khi giờ hứa đổi". 4 điểm còn lại lấy theo đề xuất của Claude (đổi được).

## Ý tưởng chính (câu nói cho giám khảo)
**LLM không được giao trách nhiệm thay con người.** `@baton` (LLM) chỉ đề xuất phiếu. Ai giữ case thì chỉ có **chính người đó** gõ `@ledger nhận ...`, và Switch xác nhận danh tính người gửi. Trường `owner` trong khối của baton chỉ dùng để đối chiếu, không bao giờ biến thành lượt nhận.

## 1. Đầu vào

### 1a. Khối phiếu của `@baton`
Ledger nghe **mọi tin** trong room (`filter=all`), bỏ qua tin do chính ledger gửi. Tin nào có dòng `[BATON vN]` thì là phiếu:
```
[BATON v2]
SR-1077 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: ? | source: msg#12
CS-0924-003 | promise: - | waiting: L2 | owner: Dung | source: msg#7
```
- Khối kéo dài từ header tới dòng ``` hoặc hết tin. Dòng trống được bỏ qua. **Mọi dòng còn lại đều phải là dòng case**, nên @baton phải để khối ở cuối tin hoặc bọc trong ```. Không được có ghi chú sau khối (sửa 06/11 sau review: trước đây gặp dòng trống là dừng, khiến case phía sau bị coi là biến mất và bị đóng nhầm).
- Mỗi dòng sau header là 1 case, **đúng 5 trường theo đúng thứ tự** `ID | promise: | waiting: | owner: | source:`.
- `-` nghĩa là không có. `owner: ?` nghĩa là chưa có người.
- Giờ hứa: lấy cụm `HH:MM` đầu tiên trong `promise` → đổi ra số phút trong ngày. Không có thì `null`.
- Lỗi thì **không đoán**, trả lời: `Khối không hợp lệ, dòng X: <lý do>` và không áp dụng gì cả. Các lỗi: thiếu trường, sai thứ tự, ID trùng trong cùng khối, giờ sai (vd `25:10`), số phiên bản không lớn hơn bản hiện hành.

### 1b. Lệnh của người
Chỉ xử lý tin có `payload.addressed = true`. Bỏ phần `@ledger` ở đầu (body giữ nguyên chữ `@ledger ...`).
- `status`: bảng ai giữ case nào + các cảnh báo.
- `nhận <ID> v<N>` (chấp nhận cả `nhan`, không dấu): người gửi nhận case.
- Lệnh khác: trả hướng dẫn ngắn.
- Danh tính người gửi lấy từ `payload.sender_name` (do Switch cấp), không lấy từ nội dung tin.

## 2. Trạng thái
```
phiếu: { version: N | 0, cases: Map<ID, Case> }
Case:  { id, promiseText, promiseMin | null, waiting, ownerHint, source,
         status: 'OPEN' | 'CLOSED',
         claim: { user, version, promiseMin } | null,
         stale: boolean }   // stale = lượt nhận đã cũ vì giờ hứa đổi
```

## 3. Áp dụng phiếu mới vN
1. N phải lớn hơn bản hiện hành, không thì từ chối.
2. Case có ở bản cũ mà **không còn** trong vN → `CLOSED` (quyết định 4). Báo: `SR-1127 không còn trong v2 → đóng`.
3. Case đã có người nhận mà `promiseMin` mới **khác** `claim.promiseMin` → `stale = true` (**R3**). Báo: `SR-1110: giờ hứa đổi 16:40 → 15:50 sau khi Dung nhận v1 → Dung phải nhận lại trên v2`. Báo lại **mỗi lần giờ đổi** khi người đó chưa nhận lại, kể cả khi lượt nhận đã cũ từ trước. Giờ quay về đúng giờ lúc nhận thì lượt nhận hiệu lực lại, không báo.
4. Đổi `waiting` / `source` / chữ trong `promise` mà giờ không đổi → lượt nhận cũ **vẫn hiệu lực**.

## 4. Lệnh `nhận <ID> vN` của người U
Xét theo thứ tự, gặp điều kiện nào thì dừng ở đó:
1. Chưa có phiếu nào → `Chưa có phiếu bàn giao.`
2. ID không có trong phiếu, hoặc đã `CLOSED` → báo lỗi.
3. N < bản hiện hành → **từ chối (R2)**: `Phiếu v1 đã cũ, bản hiện hành là v3.`
4. N > bản hiện hành → từ chối: `Chưa có phiếu v4.`
5. Case đang được người khác (≠ U) giữ → **từ chối + cảnh báo xung đột (R4)**: `SR-1115 đang do Dung giữ (v1). Minh không nhận được, hai người cần thống nhất.` (quyết định 3). Áp dụng cả khi lượt nhận của người kia đã `stale`.
6. Còn lại → nhận thành công: `claim = { user: U, version: N, promiseMin hiện tại }`, `stale = false`. Nếu `ownerHint` của baton khác U (kể cả khi baton ghi `?`) thì báo thêm: `baton ghi owner là X (hoặc chưa ai), ledger ghi theo người tự nhận là U`.

## 5. `status` tại thời điểm `now`
Với mỗi case `OPEN`, lượt nhận hợp lệ = có `claim` và `stale = false`.
- **R1**: case không có lượt nhận hợp lệ → `Bàn giao CHƯA xong: SR-1101 chưa ai nhận` (hoặc `lượt nhận đã cũ, Dung cần nhận lại v2`).
- **R5**: case không có lượt nhận hợp lệ, có giờ hứa, và `promiseMin - now < 30` (gồm cả đã quá giờ) → `⚠ SR-1119 còn 29 phút tới giờ hứa 15:29 mà chưa ai nhận`. Còn **đúng 30 phút thì không báo**.
- Đối chiếu: `ownerHint` của baton là tên X nhưng ledger không có lượt nhận của X → `baton ghi Dung giữ SR-1102 nhưng Dung chưa xác nhận`.
- Không còn R1 → bàn giao xong (**chỉ tính theo lượt nhận của người thật**). Nếu vẫn còn điểm lệch với owner của baton thì câu báo phải nói rõ: `Bàn giao xong theo lượt nhận của người thật. Phiếu của baton còn ghi khác → baton nên ra phiếu mới cho khớp.` Nếu không lệch: `Bàn giao xong: mọi case đều có người nhận đúng phiên bản.` (làm rõ 06/11 sau review)
- `now` truyền vào được (để test). Khi chạy thật thì tính theo **UTC+7**, không phụ thuộc múi giờ của máy (`src/clock.js`). `LEDGER_FAKE_NOW=HH:MM` để cố định giờ khi quay demo.

## 6. Chia file (mỗi file một việc, mỗi hàm một việc)
| File | Hàm chính |
|---|---|
| `src/parse-block.js` | `parseBatonBlock(text)` → `{ ok, version, cases }` hoặc `{ ok: false, line, reason }`; `parseTime(text)` |
| `src/parse-command.js` | `parseCommand(body)` → `{ type: 'status' }` / `{ type: 'claim', caseId, version }` / `{ type: 'unknown' }` |
| `src/ledger-state.js` | `createLedger()`, `applyBlock(ledger, block)`, `claimCase(ledger, user, caseId, version)`, `buildStatus(ledger, nowMin)` (hàm thuần, không đụng mạng) |
| `src/format.js` | đổi kết quả thành câu tiếng Việt để gửi vào room |
| `bot.js` | nối WebSocket (lấy từ `pong.js`) → gọi các hàm trên → gửi trả lời |
| `test/*.test.js` | chạy bằng `node --test` |

## 7. Danh sách test tối thiểu (mỗi luật ít nhất 1 test)
| # | Test | Mong đợi |
|---|---|---|
| P1 | khối hợp lệ 2 case | parse ra đúng 5 trường, `promiseMin` đúng |
| P2 | thiếu trường `source` | lỗi, đúng số dòng |
| P3 | giờ `25:10` | lỗi giờ |
| P4 | ID trùng trong khối | lỗi |
| P5 | `promise: -` | `promiseMin = null` |
| C1 | `@ledger nhận SR-1077 v2` / `@ledger nhan sr-1077 V2` | cả hai → claim SR-1077 v2 |
| R1a | có case `owner: ?`, chưa ai nhận | status báo chưa xong |
| R1b | baton ghi owner Dung nhưng Dung chưa nhận | vẫn báo chưa xong + cảnh báo đối chiếu |
| R2 | nhận v1 khi đã có v2 | từ chối, nêu bản hiện hành |
| R2b | nhảy v1 → v3, nhận v1 | từ chối, nêu v3 |
| R3a | Dung nhận v1 lúc 16:40, v2 đổi 15:50 | stale, status yêu cầu Dung nhận lại v2 |
| R3b | v2 chỉ đổi `waiting` | lượt nhận v1 vẫn hiệu lực |
| R3c | Dung nhận lại v2 sau khi stale | hết cảnh báo |
| R4 | Dung nhận rồi Minh nhận cùng case | Minh bị từ chối + cảnh báo xung đột, Dung vẫn giữ |
| R5a | còn 29 phút, chưa ai nhận | báo động |
| R5b | còn đúng 30 phút | không báo động |
| R5c | còn 1 phút nhưng đã có người nhận | không báo động |
| X1 | case biến mất ở v2 | CLOSED, không còn trong R1 |
| X2 | khối v2 gửi lại khi đã có v2 | từ chối, không đổi trạng thái |
| OK | mọi case đều có người nhận hợp lệ | "Bàn giao xong" |
