# Kết quả eval @ledger (tự động)

Chạy lúc 2026-11-07T03:11:13.393Z bằng `node eval/run-ledger-eval.js`. Nạp khối BATON **đúng** (đáp án) vào code ledger thật, so với `eval/expected-ledger.json`. Phần này đo **luật cứng**, chưa đo LLM trích khối.

**18/18 kịch bản đạt.**

| Kịch bản | Luật | Số bước kiểm | Kết quả | Lỗi |
|---|---|---:|---|---|
| S01 | R1 | 3 | ĐẠT |  |
| S02 | R1 | 3 | ĐẠT |  |
| S03 | R1 | 3 | ĐẠT |  |
| S04 | R2 | 6 | ĐẠT |  |
| S05 | R2 | 7 | ĐẠT |  |
| S06 | R2 | 6 | ĐẠT |  |
| S07 | R3 | 7 | ĐẠT |  |
| S08 | R3 | 7 | ĐẠT |  |
| S09 | R3 | 9 | ĐẠT |  |
| S10 | R4 | 5 | ĐẠT |  |
| S11 | R4 | 6 | ĐẠT |  |
| S12 | R1,R5 | 2 | ĐẠT |  |
| S13 | R1,R5 | 5 | ĐẠT |  |
| S14 | none | 4 | ĐẠT |  |
| S15 | none | 4 | ĐẠT |  |
| S16 | outside | 4 | ĐẠT |  |
| S17 | outside | 7 | ĐẠT |  |
| S18 | outside | 4 | ĐẠT |  |
