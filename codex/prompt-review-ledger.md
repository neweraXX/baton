Che do read-only. KHONG chay code (ke ca node --test), khong cai package, khong mang. Neu can chay thi chi ghi lenh `docker run --rm --network none ...`.

Review doc lap code `@ledger` (Node.js, khong LLM) so voi dac ta `ledger/SPEC.md`.
File can doc: `ledger/SPEC.md`, `ledger/src/parse-block.js`, `ledger/src/parse-command.js`, `ledger/src/ledger-state.js`, `ledger/src/format.js`, `ledger/src/store.js`, `ledger/bot.js`, `ledger/test/*.test.js`. Tham khao them 3 kich ban `eval/scenarios/S07-*.md`, `S10-*.md`, `S17-*.md` (muc "Thiết lập ledger" va "Kết quả đúng của @ledger").

Cau hoi (uu tien cau 1, het gio tra phan da chac):
1. LOI LOGIC so voi SPEC (muc 3, 4, 5): moi loi ghi file:dong, input cu the lam sai, ket qua sai vs dung. Dac biet: R3 stale khi gio doi nhieu lan / doi ve gio cu; R4 khi luot nhan cua nguoi kia da stale; R5 ranh gioi 30 phut va qua gio; case CLOSED xuat hien lai; so sanh ten nguoi (hoa/thuong, khoang trang); parser khi khoi co dong trong, ```; lenh co mention dang `<@...>`.
2. `bot.js`: rui ro khi chay that (tu tra loi tin cua chinh minh gay vong lap, tin cua @baton co duoc xu ly, mat ket noi, ghi file state).
3. Test con thieu ca nao quan trong (liet ke ten test + input + mong doi), toi da 8.

Tieu chi: chi bao loi co the chung minh bang input cu the; khong gop y style. Khong thay loi thi noi "khong thay". Tra loi tieng Viet, ngan.
