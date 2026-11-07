Che do read-only, khong chay code.

Video demo "Baton" da quay xong (2:34, khong co tieng). Viet LOI THUYET MINH tieng Anh (voiceover) de may doc (text-to-speech) long vao, mo ta dieu dang dien ra tren man hinh va vi sao no quan trong. Doc `demo/video-script-en.md`, `demo/video/captions.json`, `README.md` de nam noi dung.

Moc thoi gian THAT cua video (giay tinh tu dau video) va dieu xay ra:
- 0-5: man hinh mo dau, kenh Discord trong (hook)
- 6-12: Ha (ca sang) gui tin ban giao 3 case: SR-1077 cho NovaSoft hua goi lai 10:00; CS-1106-003 cho L2 khong hen gio; SR-1080 cho khach, hua cap nhat 11:00
- 13-30: Ha goi @baton; baton (Claude Code) doc hoi thoai, ra phieu [BATON v1]; ledger (Node.js, khong AI) bao "Recorded handover ticket v1"
- 31-32: Dung (ca chieu) go "@ledger claim SR-1077 v1" -> ledger xac nhan
- 33-54: Ha bao baton cho checker soat; khach doi gio SR-1077 tu 10:00 sang 09:30
- 55-59: Ha moi @checker vao room lan dau (!invite-agent), khong dan truoc
- 60-86: checker (Codex) tu doc lich su room + SOP, phat hien phieu v1 con ghi 10:00, 2 case chua ai nhan, de nghi baton ra v2
- 87-104: baton ra phieu v2; ledger bao R3: gio hua doi sau khi Dung nhan v1 -> Dung phai nhan lai tren v2
- 105-108: Dung (nhin anh phieu cu) nhan CS-1106-003 theo v1 -> ledger tu choi R2: phieu v1 da cu
- 109-119: Dung nhan du 3 case tren v2; "@ledger status" -> "Handover complete"
- 120-137: Dung hoi baton "goi khach SR-1077 thi noi gi?" -> baton tra loi: dang cho ban va NovaSoft, goi luc 09:30, dung hua gio sua
- 138-145: (ket qua eval) 18/18 kich ban, 92 buoc kiem, mutation test; 3 ca ngoai luat ledger khong bat
- 146-153: cau chot

Yeu cau:
- Moi doan phai DOC XONG TRONG khoang thoi gian cua no: toi da (so giay x 2.3) tu. Tu nhien, giong nguoi gioi thieu san pham, khong doc lai nguyen van tin nhan.
- Nhan manh: Switch room chung + agent moi vao doc boi canh; LLM de xuat, code thuc thi, chi nguoi tu claim moi giu case.
- Viet so gio de may doc ro (vd "ten o'clock", "nine thirty"), ma case doc ro (vd "S R ten seventy-seven" -> viet "SR-1077" thanh "S-R ten seventy-seven").
- Tra ve DUY NHAT 1 khoi JSON: mang cac doi tuong { "start": <giay>, "end": <giay>, "text": "..." } theo thu tu thoi gian.
