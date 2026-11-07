Van read-only, khong chay code.

Claude da sua 3 file `instructions/room-instructions.md`, `instructions/baton.md`, `instructions/checker.md` va muc "Kich ban video" trong `SWITCH-BATON-PLAN.md` theo phan bien cua ban. Doc lai ban MOI.

Claude chap nhan het, tru/doi 2 diem:
A. `source`: khong dung `msg#N` vi Discord that khong co nhan nay; dung "ten nguoi + gio cua tin" (vd `Ha 13:58`), neu hoi thoai co san nhan msg#N thi dung nhan do.
B. KHONG ra phieu moi chi vi "nguoi nhan thay doi". Ly do: nguoi giu case da do ledger ghi (nguon su that). Neu moi lan co nguoi nhan ma baton ra vN+1 thi lenh nhan theo vN cua nguoi tiep theo bi R2 tu choi oan (ledger `claimCase`: version < hien hanh -> tu choi). Van ra phieu moi khi gio/noi dung/kenh loi hua, ben dang cho, tap case mo thay doi.

Tra loi ngan:
1. Dong y hay phan doi A va B? Phan doi thi neu hau qua cu the.
2. Ban moi con loi nao CO HAU QUA CU THE (ledger doc sai, mau thuan, kich ban video khong chay duoc)? Moi loi: trich doan + cau thay the.
3. Neu khong con loi: ghi dung cau "THONG NHAT".
