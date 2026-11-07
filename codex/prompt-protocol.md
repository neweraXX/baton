Ban dang o thu muc `ref/switch-src` (repo sandbox-quantum/switch, clone chi de DOC). Che do read-only. KHONG chay code, khong cai package. Neu can chay thu gi thi chi ghi lai lenh `docker run --rm --network none ...` de nguoi khac chay, khong tu chay.

Boi canh: Ha se tu viet bang Node.js mot agent ten `@ledger` (KHONG dung LLM) noi vao Switch qua agent protocol (HTTP + WebSocket). Ban KHONG viet code hoan chinh cho ledger; chi giai thich protocol de Ha tu viet.

Doc: `docs/official/internals/agent-protocol.md`, `docs/old/api/AGENT_PROTOCOL.md` (chi de doi chieu), va code server `core/switch_core/bridges/agent/protocol/` + test `core/tests/switch_core/bridges/agent/protocol/`.

Cau hoi (uu tien cau 1, het gio thi tra phan da chac):
1. Luong toi thieu de mot agent tu viet nhan 1 tin nhan trong room roi tra loi "pong": endpoint dang ky (method, path, body, header xac thuc, lay token o dau tren server do Switch Console chay local), cach mo WebSocket (URL, auth), dinh dang JSON cua tin nhan den va tin nhan tra loi (ten field chinh xac), `update_agent_detail` dung de lam gi va gui ra sao de nguoi khac @goi duoc agent.
2. Agent nhan duoc nhung tin nao: moi tin trong room hay chi khi bi @mention? Co lay duoc lich su room / room documents qua protocol khong?
3. Reconnect, heartbeat/ping, loi thuong gap.

Tieu chi: moi khang dinh kem duong dan file:dong lam bang chung. Phan docs va code mau thuan thi noi ro, tin code. Phan khong tim thay thi ghi "khong thay". Tra loi bang tieng Viet, ngan gon, giai thich thuat ngu cho nguoi khong co nen CS. Duoc phep dua snippet JSON mau va pseudo-code ngan, khong viet ca file agent.
