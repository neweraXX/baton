Che do read-only. KHONG chay code, khong cai package, khong mang.

Boi canh: du an hackathon "Baton" (doc `SWITCH-BATON-PLAN.md`, `ledger/SPEC.md`). Demo va video se lam bang TIENG ANH cho giam khao quoc te. Du lieu van HU CAU (Sunrise Beverages, FieldGo, NovaSoft). Ten nguoi trong demo: morning shift = "Ha", afternoon shift = "Dung".

Nhiem vu: dich sang tieng Anh tu nhien, ngan gon, giong tai lieu noi bo cua team support that (khong van may). GIU NGUYEN tuyet doi:
- Dinh dang khoi `[BATON vN]` va 5 truong `ID | promise: ... | waiting: ... | owner: ... | source: ...` (ten truong da la tieng Anh).
- Moi quy tac trong ban goc (khong them, khong bot y). Lenh ledger tieng Anh se la: `@ledger status` va `@ledger claim <case-id> v<N>` (thay cho "nhận").
- Ten tai lieu room tieng Anh: "Shift handover SOP", "Escalation matrix", "Current handover ticket".

File can dich (doc ban tieng Viet hien tai):
1. `instructions/room-instructions.md`
2. `instructions/baton.md`
3. `instructions/checker.md` (luu y: checker phai soat khi duoc goi ten; khi vua vao room thi chi can chao va noi "tag me to review the ticket")
4. `room-docs/sop-shift-handover.md`
5. `room-docs/escalation-matrix.md`
6. Kich ban tap `demo/kich-ban-tap.md` -> ban tieng Anh, giu cau truc buoc, doi lenh sang `claim`, them buoc goi `@checker please review the current ticket` ngay sau khi moi checker.
7. MOI: `demo/video-script-en.md`: kich ban video <= 2 phut 30, 5 canh theo muc "Kich ban video" trong plan; moi canh: thoi luong, man hinh hien gi, loi thoai (voiceover) tieng Anh. Mo dau bang cau hook "Shift's over. Who keeps the promise to call the customer back?". Ket bang bang ket qua eval tu `eval/README.md` (18/18 scenarios, 92 checks, mutation test, va noi thang 3 ca ngoai luat ledger KHONG bat - giao cho checker). Nhan manh: LLM khong duoc giao trach nhiem; chi nguoi tu go `claim` moi la nguoi giu case; bo Switch thi khong co room chung + agent moi vao doc boi canh.

Tra ve dung dinh dang, moi file mot khoi:
=== FILE: instructions/en/room-instructions.md ===
...
=== FILE: instructions/en/baton.md ===
...
=== FILE: instructions/en/checker.md ===
...
=== FILE: room-docs/en/sop-shift-handover.md ===
...
=== FILE: room-docs/en/escalation-matrix.md ===
...
=== FILE: demo/rehearsal-script-en.md ===
...
=== FILE: demo/video-script-en.md ===
...
Uu tien dung y va giu dinh dang. Het gio thi tra cac file da xong.
