Che do read-only. KHONG chay code, khong cai package, khong mang.

Phan bien 3 ban nhap instructions cho Switch room (Claude soan). Muc tieu: sau khi sua, Claude va ban THONG NHAT duoc ban cuoi.
File nhap: `instructions/room-instructions.md` (dan vao o Instructions cua room), `instructions/baton.md` (instructions agent @baton, Claude Code), `instructions/checker.md` (instructions agent @checker).
Doi chieu voi: `ledger/SPEC.md` (dinh dang khoi va luat ledger), `ledger/src/parse-block.js` va `ledger/bot.js` (ledger doc khoi THAT nhu the nao: tim dong `[BATON vN]` o bat ky dau trong tin, doc toi dong ``` hoac het tin, bo dong trong, moi dong con lai phai la dong case), `room-docs/sop-shift-handover.md`, `SWITCH-BATON-PLAN.md` (muc "Kich ban video"), tai lieu Switch `git show switch-console-v0.40.1:docs/official/using/shared-context.md` (trong `ref/switch-src`).

Cau hoi (uu tien cau 1, het gio tra phan da chac):
1. Cho nao instructions co the khien LEDGER DOC SAI hoac bo sot (vd baton viet chu sau khoi ma khong boc ```, checker trich lai header, so msg#, phien ban khong tang, ghi lai thieu case lam case bi dong nham, ky tu `|` trong noi dung promise...). Moi van de: trich doan + de xuat sua cu the (cau thay the).
2. Mau thuan giua 3 file voi nhau, voi SPEC, voi SOP.
3. Thieu gi de chay duoc kich ban video 5 buoc trong plan (vd checker moi vao room phai tu phat hien phieu cu ma khong duoc dan truoc).
4. Phan nao thua, nen cat cho ngan (agent doc dai de lech).

Tieu chi: chi neu van de co hau qua cu the. Moi de xuat la cau thay the dung duoc ngay. Khong thay van de thi noi "khong thay". Tieng Viet, ngan.
