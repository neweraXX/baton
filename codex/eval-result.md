Toàn bộ dữ liệu dưới đây là **hư cấu**, dùng bối cảnh Sunrise Beverages / FieldGo. Chưa chạy eval, chưa ghi file.

Quy ước chấm:

- Mỗi file độc lập; giờ cùng ngày. Phiên bản áp dụng cho toàn phiếu.
- Người tự nói “đang giữ” là tiền trạng thái đã nhận hợp lệ, đã được ledger ghi trước tình huống. “Để xem”, được gọi tên hoặc nhận có điều kiện chưa phải nhận.
- Mặc định thực hiện lệnh sau hội thoại và khối cuối. Ngoại lệ có ghi rõ mốc thực hiện, người gửi và thứ tự.
- `source` trỏ tới tin mới nhất bổ sung hoặc sửa dữ kiện của dòng; các trường không đổi kế thừa từ tin trước.
- R3 cần đường truyền sự kiện đổi giờ từ phần trích xuất sang ledger. Nếu thiếu đường truyền này, ghi lỗi tích hợp, không giả định code tự hiểu hội thoại.
- Phân bổ **theo mục tiêu chính**: R1 × 3, R2 × 3, R3 × 3, R4 × 2, R5 × 2, sạch × 2, ngoài luật × 3. Hai ca R5 cũng tất yếu có R1 khi chưa ai nhận.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Trả bảng trạng thái; R1: bàn giao chưa xong vì SR-1101 chưa có người nhận.
- SR-1102 do Minh giữ. Không báo R5: còn 110 phút tới lời hứa của SR-1101.

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

## Lệnh của người nhận
Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Trả trạng thái; R1: CS-1107-001 chưa có người nhận.
- Không gán CS-1107-001 cho Dung vì Ha gọi tên, hoặc cho Minh vì Minh trả lời.
- Không báo R5: lời hứa còn 160 phút.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Trả trạng thái; R1: SR-1104 chưa có người nhận vì điều kiện Dung nêu chưa xảy ra.
- Không báo R5 cho SR-1104 vì không có giờ hứa.

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

## Lệnh của người nhận
Dung gửi lần lượt:
```text
@ledger nhận SR-1105 v1
@ledger nhận SR-1105 v2
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối theo R2; v1 cũ, phiên bản hiện hành là v2. Không ghi nhận Dung từ lệnh này.
- Lệnh 2: chấp nhận; Dung nhận SR-1105 trên v2.
- Lệnh 3: Dung giữ SR-1105, Minh giữ SR-1106; bàn giao đủ người.
- Không có R3 vì giờ hứa không đổi.

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

## Lệnh của người nhận
Minh gửi:
```text
@ledger nhận SR-1107 v1
@ledger nhận SR-1107 v3
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2; hiện hành là v3, không phải v2.
- Lệnh 2: chấp nhận Minh nhận SR-1107 trên v3.
- Lệnh 3: Minh giữ SR-1107; Dung giữ CS-1107-003; không còn case thiếu người.
- Không có R3 vì 16:50 được giữ nguyên qua ba phiên bản.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger nhận SR-1108 v1
@ledger nhận SR-1108 v2
@ledger status
```

## Kết quả đúng của @ledger
- Lệnh 1: từ chối R2 vì phiên bản phiếu hiện hành là v2, dù dòng SR-1108 không thay đổi.
- Lệnh 2: chấp nhận Dung nhận SR-1108 trên v2.
- Lệnh 3: đủ người giữ cả hai case.
- Không báo R3: không có giờ hứa nào thay đổi.

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

## Lệnh của người nhận
Dung gửi sau msg#3, **trước khi phát hành v2**:
```text
@ledger status
```

Dung gửi lại sau v2:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Khi xử lý thay đổi ở msg#3: R3 đánh dấu v1 cũ, yêu cầu phiên bản mới cho lời hứa 15:50.
- Status trước v2: thể hiện phiếu cần cập nhật; không báo bàn giao hợp lệ chỉ vì đã đủ owner.
- Status sau v2: giờ hiện hành là 15:50, owner Dung; v2 hết tình trạng cũ do thay đổi này.
- Không có R2 vì không có lệnh nhận phiên bản cũ; không có R5 vì đã có người nhận.

## Bẫy cho LLM
Không giữ 16:40 vì Dung đã nhắc lại trước đó. Không chuyển 15:50 sang case được Minh nhắc xen ngang.

=== FILE: S08-lui-gio-van-phai-cap-nhat.md ===
# S08 — Lùi giờ vẫn làm phiếu cũ
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

## Lệnh của người nhận
Minh gửi sau msg#4, trước v2:
```text
@ledger status
```

Minh gửi sau v2:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Msg#3 chưa thay lời hứa; không dùng ETA 15:55 để kích hoạt R3.
- Msg#4 đổi lời hứa: R3 đánh dấu v1 cũ và yêu cầu bản mới, dù giờ mới muộn hơn.
- Status trước v2: báo phiếu cần cập nhật.
- Status sau v2: SR-1112 hẹn 16:30; SR-1113 vẫn 17:10; đủ người giữ.

## Bẫy cho LLM
Phân biệt ETA vendor với cam kết cho khách. R3 áp dụng cả khi lùi giờ.

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

## Lệnh của người nhận
Dung gửi một lệnh sau msg#3 trước v2, một lệnh sau msg#5 trước v3, một lệnh sau v3:
```text
@ledger status
@ledger status
@ledger status
```

## Kết quả đúng của @ledger
- Lần 1: R3, v1 cũ vì SR-1114 đổi sang 15:45.
- Lần 2: R3, v2 tiếp tục thành cũ vì SR-1114 đổi sang 16:10.
- Lần 3: phiên bản hiện hành v3; SR-1114 hẹn 16:10, CS-1107-004 hẹn 16:20; không còn thay đổi chưa cập nhật.
- Không đổi giờ CS-1107-004 theo SR-1114.

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

## Lệnh của người nhận
Lệnh 1 do Dung gửi:
```text
@ledger nhận SR-1115 v1
```

Lệnh 2 do Minh gửi:
```text
@ledger nhận SR-1115 v1
```

## Kết quả đúng của @ledger
- Lệnh 1: chấp nhận Dung nhận SR-1115.
- Lệnh 2: phải cảnh báo xung đột R4: Dung đã nhận, Minh đang nhận cùng case.
- Không được trả kết quả nhận bình thường mà không có cảnh báo.
- Plan chưa quy định lệnh 2 phải bị từ chối hay được nhận kèm cảnh báo; không chấm chính sách ghi đè owner như một yêu cầu đã có.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger nhận SR-1117 v2
```

## Kết quả đúng của @ledger
- Cảnh báo xung đột R4: Minh đang giữ SR-1117; Dung nhận cùng case.
- Không có R2 vì Dung dùng đúng v2.
- Không có R3 vì giờ hứa không đổi.
- Như S10, plan chưa chốt từ chối hay nhận kèm cảnh báo. Điều bắt buộc là phát hiện xung đột, không coi v2 là case chưa có người nhận.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- R1: cả SR-1119 và SR-1120 chưa có người nhận.
- R5: báo động SR-1119 vì còn **29 phút**, chưa ai nhận.
- Không báo R5 cho SR-1120 vì còn **đúng 30 phút**, không thỏa `< 30`.
- Không có R3: câu hỏi của Dung không sửa lời hứa, và v1 chỉ phát hành sau phần đính chính.

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

## Lệnh của người nhận
Dung gửi lần lượt, đều tại `now`:
```text
@ledger status
@ledger nhận CS-1107-005 v1
@ledger status
```

## Kết quả đúng của @ledger
- Status đầu: R1 và R5 cho CS-1107-005; còn **1 phút**, chưa có người nhận.
- Không báo R5 cho SR-1121 dù còn 2 phút, vì Minh đã nhận.
- Lệnh nhận: chấp nhận Dung nhận CS-1107-005 trên v1.
- Status cuối: đủ người giữ; không còn điều kiện báo R1/R5. Cảnh báo trước đó vẫn là sự kiện đã xảy ra.

## Bẫy cho LLM
“Để tôi...” đã bị rút lại. Không bỏ điều kiện “chưa ai nhận” khi thấy giờ hứa rất gần.

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

Không cần v2: msg#4–5 không thay dữ kiện. Khối cuối vẫn là v1; có thể cập nhật `source` của SR-1122 thành msg#5 mà không đổi nội dung nghiệp vụ.

## Lệnh của người nhận
Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Trả trạng thái bình thường: Dung giữ SR-1122, Minh giữ SR-1123.
- Không có R1–R5.
- Không báo R3 cho phương án 16:00 chưa được chốt.
- SR-1122 còn đúng 30 phút và đã có người nhận; không thỏa R5.

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

## Lệnh của người nhận
Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Trả trạng thái bình thường; đủ người giữ.
- Không báo R3: đính chính xảy ra trước khi phiếu đầu tiên phát hành.
- Không báo R5: CS-1107-006 còn 19 phút nhưng Minh đã nhận.
- Không có R1, R2 hoặc R4.

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

## Lệnh của người nhận
Dung gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Theo R1–R5: trả trạng thái bình thường; hai case đủ người giữ, không có giờ hứa đổi sau phiếu.
- **R1-R5 KHÔNG bắt được vì** không có luật đối chiếu kênh khách yêu cầu với cách người giữ dự định liên lạc.
- Hành vi lý tưởng: cảnh báo lịch gọi điện của Dung trái yêu cầu; yêu cầu sửa thành nhắn trong FieldGo và xác nhận lại.
- Nếu `@baton` vẫn trích “gọi điện”, ghi thêm lỗi trích xuất; đó không phải đáp án đúng.

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

## Lệnh của người nhận
Dung gửi **sau msg#4, trước msg#5 và trước v2**. Phép thử này cố ý kiểm tra v1 còn treo:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Tại mốc kiểm tra, v1 vẫn là phiên bản duy nhất; không có R2.
- Theo R1–R5: không có cảnh báo; SR-1127 vẫn có owner, không có giờ hứa, không có nhận trùng.
- **R1-R5 KHÔNG bắt được vì** không có luật phát hiện case đã đóng trong FieldGo nhưng còn nằm trên phiếu, và fixture nói rõ ledger chưa nhận sự kiện đóng.
- Hành vi lý tưởng: nhận trạng thái đóng, chuyển SR-1127 sang CLOSED và loại khỏi danh sách cần bàn giao.
- Đáp án cuối của `@baton` là v2 chỉ còn SR-1128. Nếu vẫn giữ SR-1127, ghi lỗi trích xuất; R1–R5 hiện không có luật bảo vệ cho lỗi đó.
- Không mặc định việc bỏ một dòng khỏi v2 tự động xóa lịch sử case trong ledger.

## Bẫy cho LLM
“Không chờ bên nào” ở msg#1 chưa có nghĩa đã đóng. Mốc đóng là msg#3; phép thử ledger diễn ra trước khi có v2.

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

## Lệnh của người nhận
Minh gửi:
```text
@ledger status
```

## Kết quả đúng của @ledger
- Theo R1–R5: trả trạng thái bình thường, đủ người giữ; không có phiên bản cũ, đổi giờ hoặc nhận trùng.
- **R1-R5 KHÔNG bắt được vì** owner tồn tại nhưng thiếu quyền thực hiện hành động đã hứa; schema hiện không có trường năng lực hoặc quyền truy cập.
- Hành vi lý tưởng: cảnh báo trở ngại thực hiện, yêu cầu cấp quyền hoặc thống nhất người có quyền hỗ trợ/nhận chuyển giao.
- Không tự đổi `owner: Minh` thành `?`: hội thoại xác nhận Minh vẫn giữ case.

## Bẫy cho LLM
Thiếu quyền không đồng nghĩa chưa nhận. Không biến câu hỏi của Dung thành sự kiện chuyển SR-1129 sang Dung.

| file | rules | do_kho | 1 câu mô tả |
|---|---|---|---|
| S01-xem-roi-chua-phai-nhan.md | R1 | de | Dung đọc tin nhưng nói rõ chưa nhận. |
| S02-goi-ten-khong-phai-giao-xong.md | R1 | vua | Được gọi tên hoặc trả lời trong room không tạo owner. |
| S03-nhan-co-dieu-kien.md | R1 | kho | Lời nhận phụ thuộc vào log chưa được đáp ứng. |
| S04-nhan-ban-cu-sau-doi-ben-cho.md | R2 | de | Dung nhận v1 sau khi bên chờ đã được sửa trên v2. |
| S05-bo-qua-hai-phien-ban.md | R2 | kho | Minh dùng ảnh v1 trong khi phiếu đã lên v3. |
| S06-case-khong-doi-nhung-phieu-da-doi.md | R2 | kho | Dòng case giữ nguyên nhưng phiên bản toàn phiếu đã đổi. |
| S07-keo-gio-hua-len-som.md | R3 | vua | Giờ gọi chuyển từ 16:40 sang 15:50 sau v1. |
| S08-lui-gio-van-phai-cap-nhat.md | R3 | vua | Lùi giờ gọi vẫn làm phiếu cũ, còn ETA vendor không phải lời hứa. |
| S09-doi-gio-hai-lan-chen-case.md | R3 | kho | Một case đổi giờ hai lần trong khi case còn lại giữ nguyên. |
| S10-hai-nguoi-cung-nhan.md | R4 | de | Dung rồi Minh cùng gửi lệnh nhận một case trên v1. |
| S11-xung-dot-qua-phien-ban.md | R4 | kho | Dung nhận trên v2 một case Minh đã giữ từ v1. |
| S12-hai-muoi-chin-va-ba-muoi-phut.md | R1,R5 | vua | Hai case chưa có owner, chỉ case còn 29 phút phải báo R5. |
| S13-con-mot-phut-chua-ai-nhan.md | R1,R5 | kho | Case còn một phút hết cảnh báo thiếu người sau khi Dung nhận. |
| S14-du-nguoi-khong-doi-gio-that.md | none | vua | Đủ người giữ và giờ giả định chưa thay cam kết hiện hành. |
| S15-sua-gio-truoc-khi-ra-phieu.md | none | kho | Sửa giờ trước v1 và đã có người nhận nên không kích hoạt R3/R5. |
| S16-doi-kenh-nhung-van-dinh-goi.md | outside | vua | Ledger thiếu luật đối chiếu kênh yêu cầu với hành động dự định. |
| S17-case-da-dong-con-trong-phieu.md | outside | kho | Phiếu đang treo còn case đã đóng mà ledger chưa nhận sự kiện đóng. |
| S18-nguoi-giu-khong-co-quyen-thuc-hien.md | outside | vua | Người giữ thiếu quyền thực hiện nhưng vẫn vượt qua R1–R5. |