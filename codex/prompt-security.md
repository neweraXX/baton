Che do read-only. KHONG chay code, khong cai package, khong truy cap mang.

Boi canh: PC Windows 10 20H2 (build 19042.631, rat lau khong cap nhat), user khong phai admin. Ha muon chay Switch Console 0.40.1 (ban Windows early access, installer co chu ky so SandboxAQ) de lam hackathon. Ha CHI quan tam: rui ro bao mat cho may tinh ca nhan.

Hai phuong an:
- A: Khong nang Windows. Switch Console -> "Run a server on this computer" (khong Docker) + noi Discord lam messaging app (room = 1 kenh Discord rieng, chi co 2 tai khoan cua Ha).
- B: Nang Windows len 22H2 + bat WSL2 + cai Docker Desktop, roi "Run a server on this computer" + Mattermost chay trong Docker.
(Phu: C = server tren VPS Linux qua SSH.)

Doc source trong `ref/switch-src` (console/, core/, docs/official/). Tra loi, uu tien cau 1, het gio thi tra phan da chac:
1. Server local khong-Docker: chay nhung process gi, voi quyen user nao, bind port vao 127.0.0.1 hay 0.0.0.0, du lieu/credential luu o dau. Phuong an B co dua chinh Switch server vao container khong, hay van chay native va chi Mattermost nam trong Docker?
2. Agent (vd Claude Code provider) chay o dau, voi quyen gi: thu muc lam viec, "Auto mode" mac dinh bat/tat, "Bypass permissions" mac dinh, ai duoc goi agent mac dinh (addressing policy). Tin nhan tu nguoi khac trong room co kich hoat agent chay lenh tren may khong?
3. Mattermost trong Docker (B): port publish ra 127.0.0.1 hay 0.0.0.0? Discord bridge (A): token bot luu o dau, ket noi chieu nao, co mo port vao may khong?
4. Ket luan so sanh A vs B (va C) CHI theo rui ro bao mat cho may, kem cac cai dat giam rui ro cu the (ten option/field dung nhu trong UI/code).

Tieu chi: moi khang dinh kem file:dong. Khong tim thay thi ghi "khong thay", khong doan. Docs va code mau thuan thi noi ro, tin code. Tra loi tieng Viet, ngan, giai thich thuat ngu cho nguoi khong co nen CS.
