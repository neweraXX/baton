Van read-only, KHONG chay code, khong cai package.

Tiep tuc bo 18 kich ban `eval/scenarios/S01..S18`. Bay gio can DAP AN MAY CHAM DUOC cho phan @ledger (khong cham @baton, khong cham @checker). Doc them `ledger/SPEC.md` va `ledger/src/ledger-state.js` (ten `code` that cua ket qua).

Tra ve DUY NHAT 1 khoi JSON hop le (khong chu thich trong JSON), dang:
```json
{
  "S07": {
    "now": "14:40",
    "setup": [
      { "op": "block", "version": 1, "expectEvents": [] },
      { "op": "claim", "user": "Dung", "caseId": "SR-1110", "version": 1, "expectCode": "claimed" },
      { "op": "block", "version": 2, "expectEvents": [ { "type": "stale", "caseId": "SR-1110" } ] }
    ],
    "steps": [
      { "sender": "Dung", "command": "@ledger status",
        "expect": { "kind": "status", "done": false, "unclaimed": ["SR-1110"], "staleUsers": { "SR-1110": "Dung" }, "urgent": [] } },
      { "sender": "Dung", "command": "@ledger nhận SR-1110 v2",
        "expect": { "kind": "claim", "code": "claimed" } }
    ]
  }
}
```
Quy uoc:
- `setup` theo dung muc "Thiết lập ledger" cua file. `block` = nap khoi `[BATON vN]` tuong ung trong muc "Khối BATON đúng" (chuong trinh cham tu lay khoi tu file md theo so phien ban). `expectEvents`: cac su kien `stale` / `closed` phai xuat hien khi nap (chi caseId + type), [] neu khong co. `claim`: `expectCode` la code mong doi.
- `steps` theo dung muc "Lệnh của người nhận", dung thu tu, dung nguoi gui, chep NGUYEN VAN lenh.
- `expect` cho lenh claim: `{ "kind": "claim", "code": <claimed|old_version|future_version|conflict|unknown_case|closed_case|no_ticket> }`.
- `expect` cho status: `{ "kind": "status", "done": bool, "unclaimed": [caseId...] (case khong co luot nhan hieu luc, sap xep), "staleUsers": {caseId: user} (chi case co luot nhan da cu), "urgent": [caseId...] (R5, sap xep) }`.
- Gio `now` lay tu file. Tat ca phai khop "Kết quả đúng của @ledger" va SPEC. Ca nao file khong ro thi theo SPEC va them truong `"note": "..."` o cap kich ban.
- Du 18 kich ban, key "S01".."S18".
