Đã đối chiếu `ledger/SPEC.md`. Đây là nội dung thay thế đầy đủ; chưa ghi file hay chạy eval.

Quy ước chung:

- Mỗi file bắt đầu với ledger rỗng. Nạp hết **Thiết lập ledger**, sau đó thực hiện các lệnh kiểm tra.
- `claim Dung <ID> vN` là sự kiện Dung tự gửi `@ledger nhận <ID> vN`, với danh tính do Switch cung cấp và `addressed = true`. Tương tự với Minh.
- Hội thoại không được nạp vào ledger. `owner` chỉ là gợi ý đối chiếu.
- Mỗi khối chỉ nạp một lần. Mọi `status` dùng đúng `now` của file.
- R5 xét lượt nhận **hợp lệ**, dùng điều kiện `promiseMin - now < 30`: đúng 30 phút không báo; quá giờ vẫn báo.
- Theo §4.6, nhận thành công khi `ownerHint: ?` cũng kèm thông báo đối chiếu vì `?` khác tên người nhận; thông báo này không ngăn nhận.

=== FILE: S01-xem-roi-chua-phai-nhan.md ===
# S01 — Xem rồi chưa phải nhận
- rules: R1
- now: 14:10
- do_kho: de

## Hội thoại
[msg#1 14:00 Ha (ca sáng)] Sunrise Beverages: SR-1101 lỗi đồng bộ FieldGo, chờ NovaSoft, hứa gọi lại 16:00. SR-1102 thì chờ L2, chưa hẹn khách giờ nào.  
[msg#2 14:02 Minh (ca chiều)] 1102 tôi đang giữ từ đầu ca nhé, sổ có rồi.  
[msg#3 14:04 Dung (ca chiều)] Đã xem 1101... à chỉ xem tin thôi, tôi chưa nhận đâu.  
[msg#4 14:08 Ha (ca sáng)] Ok, chốt SR-1101 vẫn chờ vendor NovaSoft, gọi lại 16:00, chưa ai nhận. Đừng ghi Dung chỉ vì đã đọc.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1101 | promise: gọi lại 16:00 | waiting: vendor NovaSoft | owner: ? | source: msg#4
SR-1102 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1102 v1
```

Lệnh nhận của Minh phải thành công. Không tạo lượt nhận cho SR-1101 từ lời nói của Dung.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, bàn giao chưa xong vì SR-1101 chưa có lượt nhận.
- SR-1102 có lượt nhận hợp lệ của Minh trên v1.
- Không báo R5: SR-1101 còn 110 phút tới 16:00.
- Không có cảnh báo lệch owner cho SR-1102 vì Minh đã tự nhận trong thiết lập.

## Bẫy cho LLM
“Đã xem” không phải nhận. Một tin mở đầu chứa hai case có thông tin chờ khác nhau.

=== FILE: S02-goi-ten-khong-phai-giao-xong.md ===
# S02 — Gọi tên chưa thành người nhận
- rules: R1
- now: 14:20
- do_kho: vua

## Hội thoại
[msg#1 14:10 Ha (ca sáng)] CS-1107-001 chờ L2, hứa cập nhật 17:00. SR-1103 chờ NovaSoft, gọi 16:30; Dung đang giữ case đó.  
[msg#2 14:12 Dung (ca chiều)] Đúng, tôi đang giữ SR-1103, lịch 16:30 có rồi.  
[msg#3 14:13 Ha (ca sáng)] @Dung nhận luôn CS-1107-001 nhé? À Minh cũng online thì xem giúp.  
[msg#4 14:15 Minh (ca chiều)] M ở đây, M là Minh nhé. Tôi chưa nhận CS-1107-001; đang kẹt việc khác.  
[msg#5 14:18 Ha (ca sáng)] Dung chưa trả lời vụ CS. Vậy CS-1107-001 vẫn chưa ai nhận, chờ L2, cập nhật khách 17:00.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
CS-1107-001 | promise: cập nhật khách 17:00 | waiting: L2 | owner: ? | source: msg#5
SR-1103 | promise: gọi lại 16:30 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1103 v1
```

Lệnh nhận SR-1103 phải thành công. Không có lệnh nhận CS-1107-001.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, CS-1107-001 chưa có lượt nhận.
- SR-1103 có lượt nhận hợp lệ của Dung trên v1.
- Không báo R5: CS-1107-001 còn 160 phút tới 17:00.
- Ledger không tạo lượt nhận từ việc Ha gọi tên Dung hoặc Minh trả lời trong chat.

## Bẫy cho LLM
Phân biệt người được đề nghị với người đã nhận. “M” được chính người nói giải nghĩa là Minh.

=== FILE: S03-nhan-co-dieu-kien.md ===
# S03 — Điều kiện chưa xảy ra
- rules: R1
- now: 14:25
- do_kho: kho

## Hội thoại
[msg#1 14:12 Ha (ca sáng)] SR-1104 đang đợi log từ L2, chưa hẹn khách. CS-1107-002 không chờ bên nào, Minh đang giữ, hẹn cập nhật 17:20.  
[msg#2 14:14 Minh (ca chiều)] Đúng CS-1107-002 tôi đang giữ, 17:20 nhé.  
[msg#3 14:16 Dung (ca chiều)] 1104 nếu L2 gửi đủ log trước lúc bàn giao thì tôi nhận. Chưa có log thì chưa nhận nha.  
[msg#4 14:18 Ha (ca sáng)] Log tới rồi... sửa: mới tới ảnh chụp, chưa phải log cần lấy.  
[msg#5 14:23 Ha (ca sáng)] Chốt SR-1104 vẫn chờ L2, chưa có giờ hứa và chưa ai nhận. CS-1107-002 giữ nguyên.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1104 | promise: - | waiting: L2 | owner: ? | source: msg#5
CS-1107-002 | promise: cập nhật khách 17:20 | waiting: - | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh CS-1107-002 v1
```

Lệnh nhận của Minh phải thành công. Không chuyển câu nhận có điều kiện của Dung thành sự kiện `claim`.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, SR-1104 chưa có lượt nhận.
- CS-1107-002 có lượt nhận hợp lệ của Minh.
- Không báo R5 cho SR-1104 vì `promiseMin = null`.
- Ledger chỉ biết SR-1104 chưa có lệnh nhận; việc điều kiện log chưa xảy ra là thông tin từ hội thoại.

## Bẫy cho LLM
“Log tới rồi” bị sửa ngay sau đó. Không biến lời nhận có điều kiện thành nhận chắc chắn.

=== FILE: S04-nhan-ban-cu-sau-doi-ben-cho.md ===
# S04 — Nhận bản cũ sau đổi bên chờ
- rules: R2
- now: 14:30
- do_kho: de

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1105 chờ NovaSoft, gọi lại 16:20, chưa ai nhận. SR-1106 chờ L2, chưa hẹn giờ.  
[msg#2 14:21 Minh (ca chiều)] 1106 tôi đang giữ rồi. Dung xem giúp 1105 nhé.  
[msg#3 14:24 Ha (ca sáng)] Sửa 1105: không chờ vendor nữa, chuyển sang chờ L2. Giờ gọi vẫn 16:20, chưa ai nhận.  
[msg#4 14:28 Dung (ca chiều)] Tôi mở nhầm tab cũ thì phải. 1105 nhé, không phải 1106; lát gõ nhận.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1105 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: ? | source: msg#1
SR-1106 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1105 | promise: gọi lại 16:20 | waiting: L2 | owner: ? | source: msg#3
SR-1106 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1106 v1
block v2
```

Lệnh nhận của Minh thành công. Nạp v2 không làm lượt nhận SR-1106 thành stale; SR-1105 vẫn chưa có lượt nhận.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1105 v1
```

Lệnh 2:
```text
@ledger nhận SR-1105 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2; v1 đã cũ, hiện hành là v2. Không tạo lượt nhận.
- Lệnh 2: chấp nhận Dung nhận SR-1105 trên v2 với giờ hứa 16:20, `stale = false`. Kèm đối chiếu: baton ghi owner `?`, ledger ghi Dung.
- Lệnh 3: bàn giao xong; Dung giữ SR-1105 bằng lượt nhận v2, Minh giữ SR-1106 bằng lượt nhận v1 vẫn hợp lệ.
- Không có R3: đổi `waiting` không làm stale lượt nhận.

## Bẫy cho LLM
Chỉ bên đang chờ thay đổi. Không đổi nhầm giờ hứa hoặc chuyển người giữ của SR-1106 sang SR-1105.

=== FILE: S05-bo-qua-hai-phien-ban.md ===
# S05 — Nhảy từ v1 tới v3
- rules: R2
- now: 14:35
- do_kho: kho

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1107 chưa ai nhận, chờ L2, hẹn cập nhật 16:50. CS-1107-003 chưa hẹn khách, không chờ bên nào.  
[msg#2 14:21 Dung (ca chiều)] CS-1107-003 tôi đang giữ. SR-1107 là case khác nha.  
[msg#3 14:24 Ha (ca sáng)] 1107 chuyển chờ NovaSoft, L2 đã xong phần họ. Hẹn vẫn 16:50, owner chưa có.  
[msg#4 14:26 Minh (ca chiều)] Tôi có ảnh v1 thôi, khoan nhận để đọc lại.  
[msg#5 14:29 Ha (ca sáng)] NovaSoft cũng trả lời rồi; SR-1107 giờ không chờ bên nào. Vẫn cần cập nhật khách 16:50, chưa ai nhận.  
[msg#6 14:33 Minh (ca chiều)] À vậy dùng bản mới nhất. CS-1107-003 vẫn của Dung đúng không, tôi không đụng case đó.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1107 | promise: cập nhật khách 16:50 | waiting: L2 | owner: ? | source: msg#1
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#3:
```text
[BATON v2]
SR-1107 | promise: cập nhật khách 16:50 | waiting: vendor NovaSoft | owner: ? | source: msg#3
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v3 sau msg#6:
```text
[BATON v3]
SR-1107 | promise: cập nhật khách 16:50 | waiting: - | owner: ? | source: msg#5
CS-1107-003 | promise: - | waiting: - | owner: Dung | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Dung CS-1107-003 v1
block v2
block v3
```

Lệnh nhận của Dung thành công và vẫn hợp lệ qua v2, v3. SR-1107 chưa có lượt nhận.

## Lệnh của người nhận
Minh gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1107 v1
```

Lệnh 2:
```text
@ledger nhận SR-1107 v3
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2; thông báo hiện hành là v3.
- Lệnh 2: chấp nhận Minh nhận SR-1107 trên v3 với giờ hứa 16:50. Kèm đối chiếu owner `?` với người tự nhận Minh.
- Lệnh 3: bàn giao xong; Minh giữ SR-1107 bằng lượt nhận v3, Dung giữ CS-1107-003 bằng lượt nhận v1 vẫn hợp lệ.
- Không có R3. SR-1107 không tự đóng khi `waiting` đổi thành `-` vì vẫn hiện diện trong v3.

## Bẫy cho LLM
Hai mã đều chứa “1107” nhưng là hai case khác nhau. `waiting: -` không có nghĩa case đã đóng hoặc lời hứa đã hoàn thành.

=== FILE: S06-case-khong-doi-nhung-phieu-da-doi.md ===
# S06 — Case không đổi, phiếu đã đổi
- rules: R2
- now: 14:40
- do_kho: kho

## Hội thoại
[msg#1 14:25 Ha (ca sáng)] SR-1108 chờ L2, gọi lại 16:10, chưa ai nhận. SR-1109 chờ L2, chưa có giờ hứa.  
[msg#2 14:26 Minh (ca chiều)] Tôi đang giữ 1109. 1108 để Dung đọc đã, chưa có ai nhận.  
[msg#3 14:30 Ha (ca sáng)] Sửa đúng SR-1109 thôi: chuyển chờ NovaSoft. SR-1108 không sửa chữ nào.  
[msg#4 14:36 Dung (ca chiều)] Ừ, dòng 1108 giống hệt bản cũ. Nhưng phiếu chung đã lên v2 rồi à?

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1108 | promise: gọi lại 16:10 | waiting: L2 | owner: ? | source: msg#1
SR-1109 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1108 | promise: gọi lại 16:10 | waiting: L2 | owner: ? | source: msg#1
SR-1109 | promise: - | waiting: vendor NovaSoft | owner: Minh | source: msg#3
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1109 v1
block v2
```

Lệnh nhận của Minh thành công. Khi nạp v2, SR-1109 đổi `waiting` nhưng giờ hứa vẫn `null`; lượt nhận v1 không stale.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1108 v1
```

Lệnh 2:
```text
@ledger nhận SR-1108 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2 vì phiên bản hiện hành là v2, dù dòng SR-1108 không thay đổi.
- Lệnh 2: chấp nhận Dung nhận SR-1108 trên v2. Kèm đối chiếu owner `?` với Dung.
- Lệnh 3: bàn giao xong; Dung giữ SR-1108, Minh giữ SR-1109.
- Minh không phải nhận lại SR-1109 trên v2: lượt nhận v1 vẫn hợp lệ vì giờ hứa không đổi.

## Bẫy cho LLM
Không tạo phiên bản riêng theo từng dòng. Không áp thay đổi bên chờ của SR-1109 lên SR-1108.

=== FILE: S07-keo-gio-hua-len-som.md ===
# S07 — Giờ hứa được kéo lên sớm
- rules: R3
- now: 14:40
- do_kho: vua

## Hội thoại
[msg#1 14:20 Ha (ca sáng)] SR-1110 chờ NovaSoft, gọi khách 16:40. SR-1111 chờ L2, chưa hẹn giờ.  
[msg#2 14:22 Dung (ca chiều)] Tôi đang giữ 1110, lịch 16:40. Minh đang giữ 1111 từ trước.  
[msg#3 14:30 Ha (ca sáng)] Khách 1110 xin sớm: chốt gọi lại 15:50 thay 16:40. Vẫn chờ NovaSoft, Dung vẫn giữ. 1111 không đổi.  
[msg#4 14:38 Minh (ca chiều)] Đúng 1111 tôi đang giữ. Vừa đọc chen tin, 15:50 là của 1110 nhé.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1110 | promise: gọi lại 16:40 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
SR-1111 | promise: - | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1110 | promise: gọi lại 15:50 | waiting: vendor NovaSoft | owner: Dung | source: msg#3
SR-1111 | promise: - | waiting: L2 | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1110 v1
claim Minh SR-1111 v1
block v2
```

Hai lệnh nhận thành công. Khi nạp v2, giờ 15:50 khác giờ 16:40 lúc Dung nhận: SR-1110 phát sinh R3, `stale = true`. SR-1111 vẫn có lượt nhận hợp lệ.

## Lệnh của người nhận
Dung gửi lần lượt, sau khi đã nạp v2:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1110 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Khi nạp v2 trong thiết lập: R3, thông báo giờ hứa SR-1110 đổi 16:40 → 15:50 sau khi Dung nhận v1; Dung phải nhận lại trên v2.
- Lệnh 1: R1, lượt nhận của Dung đã cũ; yêu cầu nhận lại v2. Dung vẫn là người giữ, nhưng lượt nhận chưa hợp lệ.
- Lệnh 1 không báo R5: còn 70 phút tới 15:50.
- Lệnh 2: chấp nhận Dung nhận lại; lưu `version = 2`, `promiseMin = 15:50`, `stale = false`.
- Lệnh 3: bàn giao xong; Dung có lượt nhận v2 hợp lệ, Minh có lượt nhận v1 vẫn hợp lệ.
- Chỉ nạp v2 không đủ để khôi phục hiệu lực lượt nhận của Dung.

## Kỳ vọng cho @checker
Sau msg#3, trước khi có v2, phát hiện v1 còn ghi 16:40 trái với giờ mới 15:50 và đề nghị `@baton` cập nhật. Ledger chưa thể biết thay đổi này từ chat.

## Bẫy cho LLM
Không giữ 16:40 vì Dung đã nhắc lại trước đó. Không chuyển 15:50 sang case được Minh nhắc xen ngang.

=== FILE: S08-lui-gio-van-phai-cap-nhat.md ===
# S08 — Lùi giờ vẫn làm lượt nhận cũ
- rules: R3
- now: 14:50
- do_kho: vua

## Hội thoại
[msg#1 14:30 Ha (ca sáng)] SR-1112 chờ NovaSoft, hứa gọi 15:40. SR-1113 không chờ ai, hẹn cập nhật 17:10.  
[msg#2 14:31 Minh (ca chiều)] 1112 tôi đang giữ; Dung đang giữ 1113.  
[msg#3 14:35 Ha (ca sáng)] NovaSoft báo ETA 15:55 cho 1112. Đây là giờ vendor trả lời, chưa phải giờ hứa mới với khách.  
[msg#4 14:42 Ha (ca sáng)] Khách vừa đồng ý: đổi cuộc gọi SR-1112 từ 15:40 sang 16:30. Chờ vendor như cũ. 1113 vẫn 17:10.  
[msg#5 14:48 Dung (ca chiều)] 1113 đúng tôi đang giữ. Suýt đọc 15:55 thành giờ gọi, may hỏi lại.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1112 | promise: gọi lại 15:40 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
SR-1113 | promise: cập nhật khách 17:10 | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#5:
```text
[BATON v2]
SR-1112 | promise: gọi lại 16:30 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
SR-1113 | promise: cập nhật khách 17:10 | waiting: - | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1112 v1
claim Dung SR-1113 v1
block v2
```

Hai lệnh nhận thành công. Nạp v2 làm lượt nhận của Minh trên SR-1112 thành stale vì giờ đổi 15:40 → 16:30. SR-1113 không stale.

## Lệnh của người nhận
Minh gửi lần lượt, sau v2:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1112 v2
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Khi nạp v2: R3, yêu cầu Minh nhận lại SR-1112 trên v2; lùi giờ cũng làm lượt nhận cũ.
- Lệnh 1: R1, SR-1112 có lượt nhận stale của Minh; chưa bàn giao xong.
- Lệnh 1 không báo R5: lời hứa hiện hành 16:30 còn 100 phút. Không dùng 15:40 hoặc ETA 15:55 để tính.
- Lệnh 2: chấp nhận Minh nhận lại trên v2; `stale = false`, giờ tại lúc nhận là 16:30.
- Lệnh 3: bàn giao xong; Minh giữ SR-1112 bằng lượt nhận v2, Dung giữ SR-1113 bằng lượt nhận v1 hợp lệ.

## Kỳ vọng cho @checker
- Sau msg#3: không coi ETA 15:55 là giờ hứa mới.
- Sau msg#4, trước v2: chỉ ra v1 còn ghi 15:40 và yêu cầu cập nhật thành 16:30.
- Không kỳ vọng ledger phát hiện hai điều này từ hội thoại.

## Bẫy cho LLM
Phân biệt ETA vendor với cam kết cho khách. R3 áp dụng cả khi lùi giờ sau lượt nhận.

=== FILE: S09-doi-gio-hai-lan-chen-case.md ===
# S09 — Đổi hai lần giữa tin xen
- rules: R3
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:30 Ha (ca sáng)] SR-1114 chờ L2, hẹn gọi 16:20. CS-1107-004 chờ NovaSoft, cũng hẹn gọi 16:20.  
[msg#2 14:31 Dung (ca chiều)] Tôi đang giữ SR-1114; Minh đang giữ CS-1107-004. Hai case khác nhau nha.  
[msg#3 14:40 Ha (ca sáng)] Riêng SR-1114 đổi sang 15:45. CS-1107-004 giữ 16:20.  
[msg#4 14:42 Minh (ca chiều)] Đúng, CS-1107-004 tôi đang giữ, vẫn 16:20. Đang nghe khách nên trả lời hơi trễ.  
[msg#5 14:50 Ha (ca sáng)] Sửa tiếp SR-1114: khách chốt 16:10 thay 15:45. Chờ L2 và Dung giữ như cũ; CS không đổi.  
[msg#6 14:58 Dung (ca chiều)] Ok tôi đã ghi 16:10 cho SR-1114, bỏ hai giờ cũ.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1114 | promise: gọi lại 16:20 | waiting: L2 | owner: Dung | source: msg#2
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1114 | promise: gọi lại 15:45 | waiting: L2 | owner: Dung | source: msg#3
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

v3 sau msg#6:
```text
[BATON v3]
SR-1114 | promise: gọi lại 16:10 | waiting: L2 | owner: Dung | source: msg#6
CS-1107-004 | promise: gọi lại 16:20 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1114 v1
claim Minh CS-1107-004 v1
block v2
claim Dung SR-1114 v2
block v3
```

Lệnh nhận lại trên v2 là sự kiện người dùng riêng, diễn ra sau v2 và trước v3; không suy ra lệnh này từ hội thoại.

Kỳ vọng trong thiết lập:

- Hai lệnh nhận trên v1 thành công.
- Nạp v2: R3 cho SR-1114, so sánh 15:45 với 16:20 lúc nhận v1.
- Dung nhận lại v2 thành công, lưu giờ nhận 15:45 và hết stale.
- Nạp v3: R3 lần nữa, so sánh 16:10 với **15:45 lúc nhận v2**.
- Lượt nhận của Minh trên CS-1107-004 luôn hợp lệ.

## Lệnh của người nhận
Dung gửi lần lượt, sau v3:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận SR-1114 v3
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1, lượt nhận v2 của Dung trên SR-1114 đã stale; yêu cầu nhận lại v3.
- Lệnh 1 không báo R5: giờ hiện hành 16:10 còn 70 phút.
- Lệnh 2: chấp nhận; lưu lượt nhận v3 của Dung với giờ 16:10, `stale = false`.
- Lệnh 3: bàn giao xong; SR-1114 có lượt nhận v3 hợp lệ, CS-1107-004 có lượt nhận v1 hợp lệ.
- Không thay đổi giờ hoặc lượt nhận của CS-1107-004 theo SR-1114.
- Câu “đã ghi 16:10” ở msg#6 không thay thế lệnh nhận lại v3.

## Kỳ vọng cho @checker
- Sau msg#3, trước v2: phát hiện v1 sai giờ SR-1114.
- Sau msg#5, trước v3: phát hiện v2 sai giờ SR-1114.
- Giữ nguyên 16:20 của CS-1107-004 trong cả hai lần đối chiếu.

## Bẫy cho LLM
Giữ riêng lịch sử hai case có cùng giờ ban đầu. Không lấy 15:45 từ bản trung gian làm đáp án cuối.

=== FILE: S10-hai-nguoi-cung-nhan.md ===
# S10 — Hai người cùng nhận
- rules: R4
- now: 14:55
- do_kho: de

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1115 chờ L2, chưa hẹn khách, chưa ai nhận. SR-1116 chờ NovaSoft, cập nhật khách 17:00.  
[msg#2 14:42 Minh (ca chiều)] 1116 tôi đang giữ. Còn 1115 tôi cũng định nhận sau khi xem phiếu.  
[msg#3 14:43 Dung (ca chiều)] Tôi cũng chuẩn bị nhận 1115, chưa gõ lệnh.  
[msg#4 14:50 Ha (ca sáng)] Chốt trước lúc gõ: SR-1115 vẫn chưa ai nhận, chờ L2, không có giờ hứa. Hai người đừng nhận trùng nhé.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1115 | promise: - | waiting: L2 | owner: ? | source: msg#4
SR-1116 | promise: cập nhật khách 17:00 | waiting: vendor NovaSoft | owner: Minh | source: msg#2
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1116 v1
```

Lệnh nhận SR-1116 thành công. SR-1115 chưa có lượt nhận.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger nhận SR-1115 v1
```

Lệnh 2 — Minh gửi:
```text
@ledger nhận SR-1115 v1
```

Lệnh 3 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: chấp nhận Dung nhận SR-1115 trên v1. Kèm đối chiếu owner `?` với Dung.
- Lệnh 2: **từ chối và cảnh báo R4**: SR-1115 đang do Dung giữ trên v1; Minh không nhận được, hai người cần thống nhất.
- Sau lệnh 2, lượt nhận của Dung giữ nguyên; không tạo lượt nhận cho Minh trên SR-1115.
- Lệnh 3: bàn giao xong; Dung giữ SR-1115, Minh giữ SR-1116, cả hai lượt nhận hợp lệ. R4 đã được trả ở lệnh 2; không tự tạo một trạng thái hai owner.

## Bẫy cho LLM
Hai lời “định nhận” chưa phải owner trong khối đầu vào. Danh tính người gửi lệnh quyết định hai người nhận khác nhau.

=== FILE: S11-xung-dot-qua-phien-ban.md ===
# S11 — Đổi phiên bản không xóa người giữ
- rules: R4
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1117 chờ L2, cập nhật khách 16:40. SR-1118 không chờ ai, chưa có giờ hứa.  
[msg#2 14:41 Minh (ca chiều)] Tôi đang giữ 1117, đã nhận trên v1; Dung đang giữ 1118.  
[msg#3 14:48 Ha (ca sáng)] 1117 chuyển chờ NovaSoft. Giờ vẫn 16:40, Minh vẫn giữ. Ra bản mới vì đổi bên chờ thôi.  
[msg#4 14:55 Dung (ca chiều)] 1118 đúng tôi giữ. À thấy 1117 vừa lên v2, tôi tưởng case đó mở lại để nhận.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2:
```text
[BATON v1]
SR-1117 | promise: cập nhật khách 16:40 | waiting: L2 | owner: Minh | source: msg#2
SR-1118 | promise: - | waiting: - | owner: Dung | source: msg#2
```

v2 sau msg#4:
```text
[BATON v2]
SR-1117 | promise: cập nhật khách 16:40 | waiting: vendor NovaSoft | owner: Minh | source: msg#3
SR-1118 | promise: - | waiting: - | owner: Dung | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1117 v1
claim Dung SR-1118 v1
block v2
```

Hai lệnh nhận thành công. Nạp v2 không làm stale lượt nhận nào: SR-1117 chỉ đổi `waiting`; SR-1118 chỉ đổi `source`.

## Lệnh của người nhận
Dung gửi lần lượt:

Lệnh 1:
```text
@ledger nhận SR-1117 v2
```

Lệnh 2:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: **từ chối và cảnh báo R4**: SR-1117 đang do Minh giữ bằng lượt nhận v1. Dung không nhận được.
- Không có R2: lệnh dùng đúng phiên bản hiện hành v2.
- Không có R3: giờ hứa SR-1117 vẫn 16:40.
- Lệnh 2: bàn giao xong; Minh vẫn giữ SR-1117, Dung vẫn giữ SR-1118. Hai lượt nhận v1 đều hợp lệ trên phiếu hiện hành v2.

## Bẫy cho LLM
Phiên bản mới không tự xóa owner. Không diễn giải “tôi tưởng” thành sự kiện case mở lại.

=== FILE: S12-hai-muoi-chin-va-ba-muoi-phut.md ===
# S12 — Phân biệt 29 và 30 phút
- rules: R1,R5
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:48 Ha (ca sáng)] SR-1119 chờ NovaSoft, gọi lại 15:29. SR-1120 chờ L2, gọi lại 15:30. Cả hai chưa ai nhận.  
[msg#2 14:50 Dung (ca chiều)] 1119 là 15:30 đúng ko? Tôi hỏi thôi, chưa nhận.  
[msg#3 14:53 Ha (ca sáng)] Không, SR-1119 là 15:29; SR-1120 mới 15:30. Không thay giờ nào, chỉ nhắc lại cho khỏi lẫn.  
[msg#4 14:58 Minh (ca chiều)] Tôi cũng chưa nhận hai case này. Vừa bị chen tin nên hỏi lại: 1119 vendor, 1120 L2 đúng rồi.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
SR-1119 | promise: gọi lại 15:29 | waiting: vendor NovaSoft | owner: ? | source: msg#3
SR-1120 | promise: gọi lại 15:30 | waiting: L2 | owner: ? | source: msg#3
```

## Thiết lập ledger
```text
block v1
```

Không có lệnh nhận cho cả hai case.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1 cho cả SR-1119 và SR-1120 vì chưa có lượt nhận.
- R5 cho SR-1119: `15:29 - 15:00 = 29 phút`, nhỏ hơn 30.
- Không báo R5 cho SR-1120: `15:30 - 15:00 = 30 phút`, không nhỏ hơn 30.
- Không có R3 vì chưa có lượt nhận để trở thành stale.
- Không báo bàn giao xong.

## Bẫy cho LLM
Không làm tròn 15:29 thành 15:30. Phải hiểu câu hỏi sai đã được đính chính, không phải một lần đổi giờ.

=== FILE: S13-con-mot-phut-chua-ai-nhan.md ===
# S13 — Còn một phút chưa ai nhận
- rules: R1,R5
- now: 15:05
- do_kho: kho

## Hội thoại
[msg#1 14:58 Ha (ca sáng)] CS-1107-005 chờ L2, hứa cập nhật 15:06, chưa ai nhận. SR-1121 chờ NovaSoft, gọi 15:07.  
[msg#2 15:00 Minh (ca chiều)] SR-1121 tôi đang giữ, có lịch 15:07 rồi. CS thì chưa nhận nhé.  
[msg#3 15:01 Dung (ca chiều)] Case 005 để tôi... à khoan, tôi mới mở phiếu, chưa nhận.  
[msg#4 15:04 Ha (ca sáng)] Chốt CS-1107-005 vẫn chờ L2, cập nhật 15:06, chưa ai nhận. SR-1121 Minh giữ, 15:07 như cũ.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#4:
```text
[BATON v1]
CS-1107-005 | promise: cập nhật khách 15:06 | waiting: L2 | owner: ? | source: msg#4
SR-1121 | promise: gọi lại 15:07 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1121 v1
```

Lệnh nhận SR-1121 thành công. CS-1107-005 chưa có lượt nhận.

## Lệnh của người nhận
Dung gửi lần lượt, đều tại `now`:

Lệnh 1:
```text
@ledger status
```

Lệnh 2:
```text
@ledger nhận CS-1107-005 v1
```

Lệnh 3:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: R1 và R5 cho CS-1107-005; còn 1 phút tới 15:06, chưa có lượt nhận hợp lệ.
- Lệnh 1 không báo R5 cho SR-1121 dù còn 2 phút, vì Minh có lượt nhận hợp lệ.
- Lệnh 2: chấp nhận Dung nhận CS-1107-005 trên v1; lưu giờ 15:06 và `stale = false`. Kèm đối chiếu owner `?` với Dung.
- Lệnh 3: bàn giao xong; cả hai case có lượt nhận hợp lệ, không còn R1/R5.
- Cảnh báo của lệnh 1 là kết quả lịch sử; lệnh 3 không tiếp tục báo chỉ vì giờ hứa vẫn gần.

## Bẫy cho LLM
“Để tôi...” đã bị rút lại. Không bỏ điều kiện có lượt nhận hợp lệ khi thấy giờ hứa rất gần.

=== FILE: S14-du-nguoi-khong-doi-gio-that.md ===
# S14 — Đủ người, chỉ bàn giờ giả định
- rules: none
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:45 Ha (ca sáng)] SR-1122 chờ NovaSoft, gọi khách 15:30. SR-1123 chờ L2, chưa có giờ hứa.  
[msg#2 14:46 Dung (ca chiều)] D đây, Dung nhé. Tôi đang giữ 1122, lịch 15:30 đã ghi.  
[msg#3 14:47 Minh (ca chiều)] 1123 tôi đang giữ từ trước.  
[msg#4 14:52 Ha (ca sáng)] Nếu khách bận thì có thể xin 16:00... à mới nghĩ phương án thôi, chưa hỏi khách, chưa đổi lịch.  
[msg#5 14:58 Dung (ca chiều)] Chốt SR-1122 vẫn gọi 15:30, chờ NovaSoft, tôi giữ. SR-1123 của Minh không đổi.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#3:
```text
[BATON v1]
SR-1122 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: Dung | source: msg#2
SR-1123 | promise: - | waiting: L2 | owner: Minh | source: msg#3
```

Msg#4–5 không thay dữ kiện nghiệp vụ. Cuối hội thoại tiếp tục dùng v1 đã phát hành; không gửi lại v1 với `source` khác. Nếu phát hành khối cập nhật thì phải tăng phiên bản, nhưng file này không có sự kiện đó.

## Thiết lập ledger
```text
block v1
claim Dung SR-1122 v1
claim Minh SR-1123 v1
```

Hai lệnh nhận thành công; ownerHint khớp người tự nhận.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; Dung giữ SR-1122, Minh giữ SR-1123 bằng các lượt nhận v1 hợp lệ.
- Không có R1–R5 hoặc cảnh báo lệch owner.
- Giờ hứa SR-1122 vẫn 15:30, còn đúng 30 phút; không báo R5.
- Ledger không nhận sự kiện đổi giờ nào từ phương án trong chat.

## Kỳ vọng cho @checker
Không coi phương án 16:00 chưa chốt là thay đổi lời hứa. Không yêu cầu người nhận xác nhận lại chỉ vì có câu giả định.

## Bẫy cho LLM
Không biến giả định thành lời hứa mới. “D” là Dung vì người nói đã giải nghĩa.

=== FILE: S15-sua-gio-truoc-khi-ra-phieu.md ===
# S15 — Sửa giờ trước khi ra phiếu
- rules: none
- now: 15:05
- do_kho: kho

## Hội thoại
[msg#1 14:50 Ha (ca sáng)] CS-1107-006 chờ NovaSoft, cập nhật khách 15:18; SR-1124 chờ L2, chưa hẹn giờ. Chưa phát hành phiếu nhé.  
[msg#2 14:52 Ha (ca sáng)] Sửa CS-1107-006: tôi gõ nhầm, giờ đã chốt với khách là 15:24. 15:18 bỏ.  
[msg#3 14:54 Dung (ca chiều)] SR-1124 tôi đang giữ rồi. Case CS là Minh giữ chứ không phải tôi.  
[msg#4 14:56 Minh (ca chiều)] Đúng CS-1107-006 tôi đang giữ từ trước, lịch đúng 15:24. Vẫn chờ NovaSoft.  
[msg#5 15:02 Ha (ca sáng)] Giờ mới ra v1: CS-1107-006 là 15:24; SR-1124 chưa hẹn giờ, vẫn chờ L2.

## Khối BATON đúng (đáp án cho @baton)
v1 đầu tiên, sau msg#5:
```text
[BATON v1]
CS-1107-006 | promise: cập nhật khách 15:24 | waiting: vendor NovaSoft | owner: Minh | source: msg#5
SR-1124 | promise: - | waiting: L2 | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh CS-1107-006 v1
claim Dung SR-1124 v1
```

Hai lệnh nhận thành công. Minh nhận khi giờ trong ledger đã là 15:24; không có khối hoặc lượt nhận nào mang giờ 15:18.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; cả hai case có lượt nhận v1 hợp lệ.
- Không có R3: giờ hiện hành của CS-1107-006 đúng bằng giờ 15:24 tại lúc Minh nhận.
- Không báo R5: còn 19 phút tới 15:24 nhưng Minh có lượt nhận hợp lệ.
- Không có R1, R2, R4 hoặc cảnh báo lệch owner.

## Bẫy cho LLM
Không tự tạo v1 chứa 15:18 khi hội thoại nói rõ chưa phát hành. Hai case có người giữ khác nhau.

=== FILE: S16-doi-kenh-nhung-van-dinh-goi.md ===
# S16 — Khách đổi kênh, người giữ chưa sửa lịch
- rules: outside
- now: 15:00
- do_kho: vua

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1125 chờ L2, hẹn gọi khách 16:10. SR-1126 chờ NovaSoft, hẹn cập nhật 17:00.  
[msg#2 14:42 Dung (ca chiều)] Tôi đang giữ 1125; Minh đang giữ 1126.  
[msg#3 14:48 Ha (ca sáng)] Khách SR-1125 đổi yêu cầu: không gọi điện, chỉ nhắn trong FieldGo lúc 16:10. Giờ không đổi. SR-1126 giữ nguyên.  
[msg#4 14:52 Minh (ca chiều)] 1126 đúng tôi giữ. 1125 là đổi kênh thôi nhé.  
[msg#5 14:57 Dung (ca chiều)] Tôi thấy tin đổi kênh rồi, nhưng lịch làm việc của tôi vẫn để gọi điện 16:10, chưa sửa.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1125 | promise: nhắn trong FieldGo 16:10 | waiting: L2 | owner: Dung | source: msg#3
SR-1126 | promise: cập nhật khách 17:00 | waiting: vendor NovaSoft | owner: Minh | source: msg#4
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1125 v1
claim Minh SR-1126 v1
```

Hai lệnh nhận thành công; ownerHint khớp người nhận. Ledger chỉ nhận khối và hai lệnh, không nhận nội dung lịch làm việc Dung nói trong chat.

## Lệnh của người nhận
Lệnh 1 — Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong theo SPEC; cả hai case có lượt nhận hợp lệ, không có cảnh báo R1–R5.
- **R1-R5 KHÔNG bắt được vì** không có luật đối chiếu kênh khách yêu cầu với lịch hành động của người giữ; lịch gọi điện trong msg#5 không phải đầu vào ledger.
- Hành vi lý tưởng của phần kiểm tra ngữ nghĩa: cảnh báo Dung còn định gọi điện trái yêu cầu nhắn trong FieldGo.
- Nếu `@baton` vẫn trích “gọi điện”, đó là lỗi trích xuất. Với giờ không đổi, R3 không phải cơ chế bảo vệ cho lỗi kênh này.

## Kỳ vọng cho @checker
Đối chiếu msg#3 với msg#5, yêu cầu Dung sửa lịch thành nhắn trong FieldGo lúc 16:10 và xác nhận đã sửa. Không coi kết quả “bàn giao xong” của ledger là xác nhận kênh liên lạc đúng.

## Bẫy cho LLM
Ý định chưa sửa của Dung không thay thế yêu cầu mới nhất từ khách. Giữ nguyên giờ nhưng cập nhật loại hành động.

=== FILE: S17-case-da-dong-con-trong-phieu.md ===
# S17 — Case đóng còn treo trên phiếu
- rules: outside
- now: 15:00
- do_kho: kho

## Hội thoại
[msg#1 14:40 Ha (ca sáng)] SR-1127 chưa có giờ hứa, không chờ bên nào, Dung đang giữ. SR-1128 chờ L2, cập nhật khách 17:00.  
[msg#2 14:42 Minh (ca chiều)] SR-1128 tôi đang giữ. 1127 của Dung nhé.  
[msg#3 14:50 Dung (ca chiều)] SR-1127 khách xác nhận xong, tôi đã đóng trong FieldGo. Ledger chưa nhận sự kiện đóng; phiếu v1 vẫn còn dòng đó.  
[msg#4 14:54 Ha (ca sáng)] Đúng 1127 đã đóng, không phải chỉ hết chờ. SR-1128 vẫn mở và Minh giữ. Kiểm tra phiếu đang treo trước đã.  
[msg#5 14:58 Ha (ca sáng)] Sau kiểm tra thì ra v2, bỏ SR-1127 khỏi danh sách cần bàn giao. 1128 vẫn cập nhật 17:00, chờ L2.

## Khối BATON đúng (đáp án cho @baton)
v1 sau msg#2, khi SR-1127 còn mở:
```text
[BATON v1]
SR-1127 | promise: - | waiting: - | owner: Dung | source: msg#1
SR-1128 | promise: cập nhật khách 17:00 | waiting: L2 | owner: Minh | source: msg#2
```

v2 sau msg#5:
```text
[BATON v2]
SR-1128 | promise: cập nhật khách 17:00 | waiting: L2 | owner: Minh | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Dung SR-1127 v1
claim Minh SR-1128 v1
block v2
```

Hai lệnh nhận thành công. Khi nạp v2:

- SR-1127 biến mất nên chuyển CLOSED theo §3.2; báo “SR-1127 không còn trong v2 → đóng”.
- SR-1128 vẫn OPEN; lượt nhận v1 của Minh hợp lệ vì giờ hứa không đổi.

## Lệnh của người nhận
Các lệnh đều sau khi nạp v2.

Lệnh 1 — Dung gửi:
```text
@ledger status
```

Lệnh 2 — Dung gửi:
```text
@ledger nhận SR-1127 v2
```

Lệnh 3 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong; chỉ SR-1128 còn OPEN và có lượt nhận hợp lệ của Minh. Không đưa SR-1127 vào R1/R5.
- Lệnh 2: từ chối vì SR-1127 đã CLOSED/không thuộc phiếu hiện hành, theo §4.2. Không mở lại case và không tạo lượt nhận mới.
- Lệnh 3: trạng thái không đổi; SR-1128 vẫn do Minh giữ, bàn giao xong.
- Sau v2, việc đóng SR-1127 **đã được SPEC hỗ trợ**; không báo đây là luật đóng case còn thiếu.
- **R1-R5 KHÔNG bắt được vì** thông tin đóng ở msg#3–4 chưa phải đầu vào ledger khi chưa có v2. Khoảng chờ đó thuộc kiểm tra ngữ nghĩa; sau v2, cơ chế CLOSED xử lý được.

## Kỳ vọng cho @checker
Sau msg#3–4, trước v2, phát hiện SR-1127 đã đóng trong hội thoại nhưng vẫn còn trên v1; yêu cầu `@baton` loại khỏi phiếu mới. Không dùng `status` trước v2 để đòi ledger tự biết trạng thái trong FieldGo.

Nếu `@baton` giữ nhầm SR-1127 trong một khối mới, ledger không thể suy ra việc đóng từ chat; ghi lỗi trích xuất và giới hạn đầu vào. Với khối đúng ở trên, không tính S17 là ledger bỏ sót sau v2.

## Bẫy cho LLM
“Không chờ bên nào” ở msg#1 chưa có nghĩa đã đóng. Mốc đóng là msg#3; khối cuối phải bỏ SR-1127.

=== FILE: S18-nguoi-giu-khong-co-quyen-thuc-hien.md ===
# S18 — Có người giữ nhưng không thể thực hiện
- rules: outside
- now: 15:10
- do_kho: vua

## Hội thoại
[msg#1 14:50 Ha (ca sáng)] SR-1129 chờ NovaSoft, hứa cập nhật khách trong FieldGo 16:30. CS-1107-007 chờ L2, gọi lại 17:10.  
[msg#2 14:52 Minh (ca chiều)] SR-1129 tôi đang giữ từ trước. CS-1107-007 Dung giữ nhé.  
[msg#3 14:55 Dung (ca chiều)] Đúng CS-1107-007 tôi đang giữ. Vụ quyền FieldGo của Minh đã có chưa?  
[msg#4 15:00 Minh (ca chiều)] Tôi tưởng có rồi... sửa lại: tài khoản tôi chưa có quyền gửi cập nhật cho khách trên FieldGo. Tôi vẫn đang giữ SR-1129, chưa chuyển ai.  
[msg#5 15:06 Ha (ca sáng)] Chưa có cách gửi thay hay người hỗ trợ. SR-1129 vẫn hẹn 16:30, chờ NovaSoft; CS-1107-007 vẫn 17:10, chờ L2.

## Khối BATON đúng (đáp án cho @baton)
Sau msg#5:
```text
[BATON v1]
SR-1129 | promise: cập nhật khách trong FieldGo 16:30 | waiting: vendor NovaSoft | owner: Minh | source: msg#5
CS-1107-007 | promise: gọi lại 17:10 | waiting: L2 | owner: Dung | source: msg#5
```

## Thiết lập ledger
```text
block v1
claim Minh SR-1129 v1
claim Dung CS-1107-007 v1
```

Hai lệnh nhận thành công. SPEC không kiểm tra quyền gửi cập nhật trên FieldGo khi xử lý lệnh nhận.

## Lệnh của người nhận
Lệnh 1 — Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: bàn giao xong theo SPEC; hai case có lượt nhận hợp lệ, ownerHint khớp người nhận.
- Không có R1–R5. SR-1129 còn 80 phút; CS-1107-007 còn 120 phút tới giờ hứa.
- **R1-R5 KHÔNG bắt được vì** lượt nhận hợp lệ không chứng minh người nhận có quyền thực hiện hành động; schema và luật không kiểm tra quyền FieldGo.
- Hành vi lý tưởng của phần kiểm tra ngữ nghĩa: cảnh báo trở ngại thực hiện, yêu cầu cấp quyền hoặc thống nhất cách hỗ trợ.
- Không tự hủy lượt nhận của Minh hoặc đổi ownerHint thành `?`. Không tự chuyển cho Dung; SPEC chưa có thao tác chuyển giao như vậy.

## Kỳ vọng cho @checker
Phát hiện cam kết cập nhật trong FieldGo chưa có cách thực hiện vì Minh thiếu quyền và chưa có người hỗ trợ. Nêu rõ đây là rủi ro ngoài R1–R5, dù ledger báo bàn giao xong.

## Bẫy cho LLM
Thiếu quyền không đồng nghĩa chưa nhận. Không biến câu hỏi của Dung thành sự kiện chuyển SR-1129 sang Dung.

| file | đã sửa gì |
|---|---|
| S01-xem-roi-chua-phai-nhan.md | Thêm lệnh Minh tự nhận SR-1102 trong thiết lập, giữ SR-1101 chưa có lượt nhận. |
| S02-goi-ten-khong-phai-giao-xong.md | Thêm lượt nhận thực của Dung cho SR-1103, không suy lượt nhận CS từ chat. |
| S03-nhan-co-dieu-kien.md | Thiết lập lượt nhận của Minh và giữ lời nhận có điều kiện của Dung ngoài đầu vào ledger. |
| S04-nhan-ban-cu-sau-doi-ben-cho.md | Bổ sung lượt nhận nền, kết quả R2 và thông báo đối chiếu owner khi Dung nhận thành công. |
| S05-bo-qua-hai-phien-ban.md | Nạp rõ v1–v3, giữ lượt nhận nền hợp lệ và từ chối đúng phiên bản cũ. |
| S06-case-khong-doi-nhung-phieu-da-doi.md | Chứng minh đổi waiting không làm stale lượt nhận v1 nhưng lệnh nhận mới phải dùng v2. |
| S07-keo-gio-hua-len-som.md | Chuyển phát hiện trước v2 sang checker và yêu cầu Dung nhận lại để hết stale. |
| S08-lui-gio-van-phai-cap-nhat.md | Làm stale lượt nhận của Minh khi nạp v2, rồi kiểm tra nhận lại và phân biệt ETA vendor. |
| S09-doi-gio-hai-lan-chen-case.md | Thêm lần nhận lại v2 để lần đổi tiếp được so với giờ tại lượt nhận gần nhất. |
| S10-hai-nguoi-cung-nhan.md | Chốt lượt nhận thứ hai bị từ chối theo R4 và Dung tiếp tục giữ case. |
| S11-xung-dot-qua-phien-ban.md | Giữ hiệu lực lượt nhận v1 qua đổi waiting và từ chối Dung nhận case Minh đang giữ. |
| S12-hai-muoi-chin-va-ba-muoi-phut.md | Nêu rõ không có lượt nhận và chấm R5 đúng ranh giới 29/30 phút. |
| S13-con-mot-phut-chua-ai-nhan.md | Thêm lượt nhận nền của Minh và xác nhận R1/R5 hết sau lệnh nhận hợp lệ của Dung. |
| S14-du-nguoi-khong-doi-gio-that.md | Thêm hai lệnh nhận nền và bỏ tùy chọn gửi lại v1 với source đã sửa. |
| S15-sua-gio-truoc-khi-ra-phieu.md | Thêm hai lệnh nhận sau khối đầu tiên, bảo đảm không có lượt nhận mang giờ cũ. |
| S16-doi-kenh-nhung-van-dinh-goi.md | Thêm lượt nhận thực và giao việc đối chiếu kênh liên lạc cho checker. |
| S17-case-da-dong-con-trong-phieu.md | Đóng case khi biến mất khỏi v2, kiểm tra từ chối nhận case đóng và chuyển khoảng chờ sang checker. |
| S18-nguoi-giu-khong-co-quyen-thuc-hien.md | Thêm hai lượt nhận thực, giữ cảnh báo thiếu quyền là kỳ vọng ngữ nghĩa ngoài ledger. |