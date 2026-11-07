Van che do read-only, KHONG chay code, khong cai package.

Tiep tuc viec bo 18 kich ban eval ban da soan (gio da tach thanh `eval/scenarios/S01-...md` den `S18-...md`). Ha da chot thiet ke ledger, doc ky `ledger/SPEC.md`. Diem thay doi quan trong so voi gia dinh cu cua ban:
1. Luot nhan CHI den tu lenh `@ledger nhận <ID> vN` do chinh nguoi do gui. `owner` trong khoi BATON chi de doi chieu, KHONG thanh luot nhan. Nguoi "dang giu tu truoc" trong hoi thoai => phai co lenh nhan o muc thiet lap.
2. R3: chi khi GIO HUA cua case doi so voi luc nguoi do nhan thi luot nhan cu thanh "cu" (stale), nguoi do phai nhan lai tren ban moi. Doi `waiting` khong anh huong.
3. R4: luot nhan thu hai bi TU CHOI + canh bao xung dot; nguoi dau van giu.
4. Case bien mat o ban moi => CLOSED.
5. Ledger chi doc khoi BATON va lenh, khong doc hoi thoai. Cac lenh `status` "truoc khi ra v2" (giua luc chat da doi gio va luc chua co khoi moi) KHONG kiem duoc o ledger => chuyen thanh ky vong cho `@checker` (LLM), ghi ro.

Viec can lam: viet lai TUNG kich ban cho khop SPEC, giu nguyen hoi thoai va khoi BATON dung (chi sua neu sai). Moi file them muc moi ngay truoc "## Lệnh của người nhận":

## Thiết lập ledger
Danh sach su kien theo thu tu ma bo chay eval se nap vao ledger, dang:
```
block v1            (nap khoi [BATON v1] o tren)
claim Dung SR-1110 v1   (Dung tu nhan)
block v2
```
Roi muc "## Lệnh của người nhận" chi con lenh cua nguoi (ghi ro ai gui), va "## Kết quả đúng của @ledger" viet lai theo SPEC (muc 3, 4, 5), tung lenh mot. Them muc "## Kỳ vọng cho @checker" neu co (vd phat hien gio da doi trong chat truoc khi co khoi moi).
Giu `now`. Nho R5: con DUNG 30 phut thi khong bao; qua gio cung bao.

Tu kiem truoc khi tra: moi ket qua phai suy ra duoc tu SPEC + thiet lap, khong mau thuan.
Tra ve dung dinh dang cu `=== FILE: Sxx-....md ===` cho CA 18 file (noi dung day du moi file), cuoi cung 1 bang: file | da sua gi (1 cau).
Uu tien dung logic. Het gio thi tra cac file da xong va chac.
