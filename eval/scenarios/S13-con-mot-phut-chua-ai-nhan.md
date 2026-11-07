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
