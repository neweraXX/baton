Che do read-only. KHONG chay code, khong cai package, khong mang. KHONG doc/in noi dung file bi mat (*.env, switch-core.env, switchdash.db, token).

Boi canh (su that da quan sat tren may Windows nay):
- Switch Console 0.40.1 (source dung ban: git tag `switch-console-v0.40.1` trong `ref/switch-src`, doc bang `git show switch-console-v0.40.1:<path>` hoac `git grep ... switch-console-v0.40.1`; KHONG dung working tree main vi khac ban). Server local native, switch-core 0.31.0 (source da cai: `C:\Users\ADMIN\AppData\Roaming\switchdash\local-switch-server\native\switch-core\0.31.0\src\core\switch_core`).
- 05/11 20:45 dung server, port luu trong `local-switch-server\ports.json` (api 51269). Noi Discord luc 21:02-21:05. `switch-core.log` dung ghi luc 21:07:43 ("connection closed"). Sang 06/11 khong co process python/postgres nao.
- 06/11 10:49 mo lai Console: man hinh trong, khong con ket noi Discord. 11:04 Ha bat lai server: postgres chay voi dung `-D ...\native\pgdata` cu; python switch-core chay o port 51547 (khong phai 51269, ports.json khong doi). `logs\switch-core.log` va `run\*` KHONG duoc ghi them tu 05/11. Trong `switchdash\agent-controller\servers\` co 2 thu muc: `0b559380...` (cu) va `3611ef7d...` (tao ~11:07). Ha phai noi lai Discord.

Cau hoi (uu tien cau 1, het gio tra phan da chac):
1. Theo code 0.40.1: khi server native da dung ma Console mo lai / Ha bam start, co nhanh nao tao server MOI hoac database/role MOI (reset) thay vi chay lai server cu? Dieu kien nao dan toi chon port moi, ghi log/run sang cho khac? Chi ra file:dong.
2. Lam sao de lan tat/bat sau KHONG mat cau hinh (agent, room, ket noi Discord): thao tac dung trong UI (ten nut chinh xac), va cach Ha tu kiem truoc khi quay video.
3. Log hien tai cua server dang ghi o dau.

Tieu chi: moi khang dinh co file:dong. Khong thay thi ghi "khong thay", khong doan. Tra loi tieng Viet, ngan, giai thich thuat ngu cho nguoi khong nen CS.
