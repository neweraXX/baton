Che do read-only, khong chay code.

Doc `demo/video-script-en.md` va `demo/rehearsal-script-en.md`. Video se duoc quay TU DONG: 1 script dieu khien 2 tai khoan Discord that (ca sang "Ha", ca chieu "Dung") go tin theo kich ban, va hien 1 dong phu de (caption) o cuoi man hinh trong luc quay. Khong co giong doc, nen phu de phai thay loi thoai.

Viet bang phu de, tieng Anh, moi caption <= 90 ky tu, ro nghia cho giam khao quoc te, khong bia so lieu. Tra ve DUY NHAT 1 khoi JSON, key la ten buoc (dung dung cac key duoi), value la caption:
```json
{
  "intro": "...",          // man hinh mo dau, truoc tin dau tien (hook: Shift's over. Who keeps the promise to call the customer back?)
  "cases": "...",          // Ha bao 3 case
  "ticketV1": "...",       // baton ra phieu v1, ledger ghi
  "claimV1": "...",        // Dung nhan SR-1077 tren v1
  "timeChange": "...",     // khach doi gio 16:00 -> 15:30, Ha bao baton cho checker soat
  "inviteChecker": "...",  // moi checker vao room lan dau, khong dan truoc
  "checkerReview": "...",  // checker phat hien phieu cu
  "ticketV2": "...",       // baton ra v2, ledger bao R3: Dung phai nhan lai
  "staleClaim": "...",     // Dung nhan theo v1 -> ledger tu choi R2
  "claimAll": "...",       // Dung nhan du 3 case tren v2
  "done": "...",           // ledger: Handover complete
  "question": "...",       // Dung hoi baton noi gi voi khach
  "eval": "...",           // 1 caption ve ket qua eval: 18/18 scenarios, 92 checks, mutation test; 3 case ngoai luat ledger khong bat (giao checker)
  "outro": "..."           // cau chot: LLM proposes, code enforces, humans own the promise. Built on Switch.
}
```
