Che do read-only. KHONG chay code, khong cai package. Neu can chay thu gi thi chi ghi lenh `docker run --rm --network none ...`, khong tu chay.

Doc `SWITCH-BATON-PLAN.md` (thu muc hien tai). Nhiem vu: soan bo kich ban danh gia (eval) HU CAU cho Baton, giai doan 4. Tat ca data hu cau: cong ty Sunrise Beverages, app FieldGo, vendor NovaSoft, team L2, nguoi ca sang "Ha", nguoi ca chieu "Dung" va "Minh". Ma case dang SR-1xxx hoac CS-MMDD-xxx. KHONG dung ten cong ty that, SDT that, data that.

Muc dich: do xem chuoi "LLM (@baton) trich khoi [BATON vN] -> code (@ledger) ap luat R1-R5" bat duoc bao nhieu loi ban giao, truot cai nao. Can ca ca KHONG co loi (ledger phai cho qua) va ca nam NGOAI R1-R5 (de bao cao that la luat thieu).

Tao 18 kich ban, phan bo:
- R1 (con case owner: ?): 3
- R2 (nhan phieu cu): 3
- R3 (gio hua doi sau khi phieu da ra): 3
- R4 (2 nguoi cung nhan 1 case): 2
- R5 (hua sap toi han < 30 phut, chua ai nhan): 2
- Ban giao sach, khong loi: 2
- Ngoai luat (khach doi kenh lien lac; case da dong nhung con nam trong phieu; ...): 3

Moi kich ban phai co hoi thoai "lon xon nhu that" (viet tat, sua lai y, tin xen ngang, 1 tin noi 2 case) de thu kha nang trich cua LLM, nhung du thong tin de nguoi doc tra loi dung.

Dinh dang BAT BUOC cho moi kich ban (giu nguyen ten muc, tieng Viet co dau):

=== FILE: S01-<slug-khong-dau>.md ===
# S01 — <tieu de ngan>
- rules: R2            (hoac R1,R3 / none / outside)
- now: 15:05           (gio hien tai cua kich ban, de tinh R5)
- do_kho: de | vua | kho

## Hội thoại
[msg#1 13:58 Hà (ca sáng)] ...
[msg#2 14:01 Hà (ca sáng)] ...

## Khối BATON đúng (đáp án cho @baton)
Khoi chuan ma @baton DUNG RA phai xuat o thoi diem cuoi hoi thoai. Neu kich ban co nhieu phien ban, ghi ca v1 va v2 kem "sau msg#N".
```
[BATON v1]
SR-1077 | promise: gọi lại 16:00 | waiting: vendor NovaSoft | owner: ? | source: msg#2
```

## Lệnh của người nhận
```
@ledger nhận SR-1077 v1
```
(co the nhieu lenh, theo thu tu; co the khong co)

## Kết quả đúng của @ledger
- Gach dau dong theo tung lenh / tung trang thai: chap nhan hay tu choi, luat nao (R1-R5), noi dung chinh can bao.
- Ca ngoai luat: ghi ro "R1-R5 KHONG bat duoc vi ..." va hanh vi ly tuong.

## Bẫy cho LLM
1-2 dong: cho nao @baton de trich sai (vd gio bi sua 2 lan, ten nguoi viet tat).

Quy tac dinh dang khoi BATON: moi case 1 dong, 5 truong theo dung thu tu `ID | promise: ... | waiting: ... | owner: ... | source: msg#N`. Khong co thi ghi `-`. Chua co nguoi nhan thi `owner: ?`. Gio dang HH:MM 24h.

Tieu chi tu kiem truoc khi tra:
1. Dem dung phan bo 18 kich ban o tren.
2. Moi "Kết quả đúng" phai suy ra duoc TU hoi thoai + khoi + luat R1-R5 trong plan, khong mau thuan (vd R5 thi `now` cach gio hua < 30 phut that).
3. Khong 2 kich ban nao trung y.
Cuoi cung them 1 bang tom tat: file | rules | do_kho | 1 cau mo ta.
Uu tien dung dinh dang va dung logic hon la van hay. Het gio thi tra cac kich ban da xong va chac.
