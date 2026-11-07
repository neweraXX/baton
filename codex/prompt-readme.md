Che do read-only, khong chay code, khong mang.

Soan README.md TIENG ANH cho repo public cua du an hackathon "Baton" (WeMakeDevs "Flip the Switch", Track 1 Best Business Workflow). Giam khao cham: Use of Switch (bo Switch co con chay khong), Technical execution (clone ve chay lai duoc khong), Creativity & impact, Presentation (README noi ro Switch duoc dung the nao).

Doc de lay su that (KHONG bia): `SWITCH-BATON-PLAN.md`, `PROGRESS.md`, `ledger/SPEC.md`, `ledger/src/*.js`, `ledger/bot.js`, `ledger/register.js`, `ledger/open-ledger.js`, `eval/README.md`, `eval/results-ledger.md`, `demo/rehearse.js`, `demo/setup-room.js`, `demo/create-room.js`, `instructions/en/*.md`, `room-docs/en/*.md`, `demo/rehearsal-en-*.md` (transcript that), `demo/video/*.js`.

README can co (ngan gon, de quet):
1. One-liner + hook "Shift's over. Who keeps the promise to call the customer back?" + 1 doan van de.
2. How it works: so do kien truc dang ASCII/mermaid: Discord channel <-> Switch room (shared context: room instructions + documents) <-> @baton (Claude Code), @checker (Codex), @ledger (Node.js, no LLM, agent protocol WebSocket + HTTP). Nguyen tac: "LLM proposes, code enforces, humans own the promise" - chi nguoi tu go `@ledger claim` moi la nguoi giu case.
3. Why Switch is load-bearing: liet ke cu the tinh nang Switch dung (rooms, room instructions, room documents, agent protocol cho custom agent, !invite-agent, addressing policy, Discord bridge, create_room) va "without Switch" thi mat gi.
4. Ledger rules R1-R5 (bang ngan) + ticket block format.
5. Evaluation: so lieu THAT tu eval/README.md (18/18 scenarios, 92 checks, mutation test, 3 ca ngoai luat ledger KHONG bat), them ket qua chay tap tu dong tieng Anh 18/18 diem kiem (demo/rehearsal-en-*.md). Noi ro gioi han va cai chua do (baton extraction accuracy, checker detection).
6. Run it yourself: buoc tu dau tren may local (Switch Console "Run a server on this computer", Discord bridge, tao baton/checker trong Console voi instructions/en, `node ledger/register.js`, `node ledger/open-ledger.js`, `ledger/run-demo.ps1`, `demo/setup-room.js`, `node --test`, `node eval/run-ledger-eval.js`, `demo/rehearse.js`). Yeu cau: Node 20+, khong npm install (zero dependencies). Ghi chu Windows/PowerShell.
7. Security notes: secrets trong .env (gitignored), khong in token; du lieu hu cau.
8. Limitations & next steps (trung thuc).
9. Credits: built with Switch, Claude Code, Codex.

Tra ve DUY NHAT noi dung file README.md (Markdown). Khong bia so lieu, khong bia tinh nang.
