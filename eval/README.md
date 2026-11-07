# Bộ kịch bản eval (hư cấu)

18 kịch bản trong `scenarios/`. Codex soạn ngày 05/11/2026 (job `codex/prompt-eval.md`), sửa lại ngày 06/11 cho khớp [ledger/SPEC.md](../ledger/SPEC.md) (job `codex/prompt-eval2.md`, cùng phiên Codex). Claude kiểm và tách file. **Chưa chạy eval**, chưa có số liệu kết quả.

## Kết quả eval @ledger (06/11, tự động)
Chạy: `node eval/run-ledger-eval.js` → bảng chi tiết ở [results-ledger.md](results-ledger.md). Script nạp khối BATON **đúng** (đáp án) vào code ledger thật, chạy lệnh qua đúng parser lệnh của bot, so với [expected-ledger.json](expected-ledger.json) (Codex chuyển từ "Kết quả đúng" sang JSON, Claude đối chiếu tay S04, S13).

**18/18 kịch bản đạt (92 bước kiểm).** Ý nghĩa của con số này, đọc cho đúng:
| Nhóm | Kịch bản | Ledger làm gì |
|---|---|---|
| Lỗi bàn giao nằm trong luật | S01–S13 (R1–R5) | **Bắt được cả 13**: chặn nhận phiếu cũ, đòi nhận lại khi đổi giờ, chặn nhận trùng, báo động < 30 phút, báo thiếu người nhận |
| Bàn giao sạch | S14, S15 | Không báo động oan (0 báo sai) |
| Lỗi **ngoài** luật | S16 đổi kênh, S17 case đóng trước khi có phiếu mới, S18 người giữ thiếu quyền | **Ledger KHÔNG bắt được** (đúng như thiết kế: ledger không đọc hội thoại). "Đạt" ở đây nghĩa là ledger cư xử đúng spec, không phải rủi ro đã được chặn. Ba ca này giao cho @checker (mục "Kỳ vọng cho @checker"), chưa đo |

**Eval có đo thật không?** Thử phá cố ý từng luật trong bản sao code (mutation test): đổi R5 thành `<= 30` → S12 trượt; tắt R3 → S07–S09 trượt; tắt R2 → S04–S06 trượt; tắt R4 → S10–S11 trượt; không đóng case biến mất → S17 trượt; bỏ R1 → 8 kịch bản trượt. Mỗi luật hỏng đều bị đúng nhóm kịch bản của nó bắt.

**Chưa đo:** @baton (LLM) trích khối từ hội thoại lộn xộn có đúng không (trích sai ở đâu thì ledger nhận dữ liệu sai), và @checker bắt được bao nhiêu ca ngoài luật.

**Cập nhật 06/11:** 5 điểm thiết kế ở cuối file này đã được chốt (xem SPEC). Mỗi kịch bản giờ có:
- `## Thiết lập ledger`: các sự kiện nạp vào ledger trước khi chạy lệnh (`block vN`, `claim <người> <ID> vN`). Người "đang giữ từ trước" trong chat phải có lệnh `claim` ở đây, vì lượt nhận chỉ đến từ lệnh của chính người đó.
- `## Kỳ vọng cho @checker` (7 file: S07, S08, S09, S14, S16, S17, S18): những gì ledger không thể biết vì nó không đọc hội thoại, ví dụ giờ đã đổi trong chat khi chưa có phiếu mới. Phần này chấm `@checker`, không chấm ledger.
- Claude đã kiểm kỹ S07, S10, S11, S12, S17 với SPEC và kiểm cấu trúc cả 18 file: không lỗi.

| Nhóm | Số | File |
|---|---:|---|
| R1 còn case `owner: ?` | 3 | S01, S02, S03 |
| R2 nhận phiếu cũ | 3 | S04, S05, S06 |
| R3 giờ hứa đổi sau khi phiếu đã ra | 3 | S07, S08, S09 |
| R4 hai người cùng nhận | 2 | S10, S11 |
| R5 sắp tới hạn (< 30 phút), chưa ai nhận | 2 | S12, S13 (kèm R1) |
| Sạch, ledger phải cho qua | 2 | S14, S15 |
| Ngoài R1–R5 (để báo cáo luật còn thiếu) | 3 | S16 đổi kênh liên lạc, S17 case đã đóng còn trên phiếu, S18 người giữ thiếu quyền |

Mỗi file gồm: `rules`, `now` (giờ hiện tại của kịch bản), `do_kho`, hội thoại, khối `[BATON vN]` đúng, lệnh của người nhận, kết quả đúng của `@ledger`, bẫy cho LLM.

## Claude đã kiểm
- Đủ 18 file, file nào cũng đủ 5 mục.
- `now` của mọi kịch bản không sớm hơn tin nhắn cuối.
- Phép tính R5 đúng: S12 có 1 case còn 29 phút (phải báo) và 1 case còn đúng 30 phút (không báo); S13 còn 1 phút; S14, S15 sát giờ nhưng đã có người nhận.
- Logic "kết quả đúng" khớp với hội thoại + luật R1–R5 trong plan, không thấy mâu thuẫn.

## Điểm thiết kế Hà cần chốt (ảnh hưởng tới cách chấm)
1. **`owner` trong khối BATON khác với trạng thái CLAIMED của ledger.** Codex giả định: ai tự nói "đang giữ" trong chat thì coi như ledger đã ghi nhận từ trước. Các kịch bản S07, S08, S11, S13, S14 dựa vào giả định này. Cách làm: hoặc ledger lấy `owner` từ khối làm trạng thái ban đầu, hoặc thêm vào mỗi kịch bản mục "Trạng thái ledger trước".
2. **R3 với ledger chỉ đọc khối BATON.** S07, S08, S09 có lệnh `status` giữa lúc giờ hứa đã đổi trong chat và lúc chưa ra phiếu mới. Ledger không có LLM nên không tự biết giờ đã đổi. Đề xuất: R3 kích hoạt khi khối vN+1 có giờ hứa khác với phiên bản người nhận đã nhận, khi đó lượt nhận cũ bị đánh dấu là cũ, người nhận phải nhận lại trên vN+1. Nếu chọn cách này thì các lệnh `status` "trước khi ra v2" chỉ kiểm được phía `@checker` (LLM), không kiểm ledger.
3. **R4: từ chối hay nhận kèm cảnh báo?** Plan chưa chốt. S10, S11 chỉ bắt buộc phải *có cảnh báo*.
4. **Case biến mất khỏi vN+1 (S17)** thì ledger coi là CLOSED hay giữ nguyên?
5. **Cách chấm phần trích của `@baton`:** đề xuất chỉ so ID, giờ HH:MM trong `promise`, `waiting`, `owner`. `source` và câu chữ trong `promise` thì chấm lỏng (S14 ghi rõ `source` có 2 đáp án hợp lệ).
