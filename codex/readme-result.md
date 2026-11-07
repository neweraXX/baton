# Baton

**Shift handovers that turn customer promises into explicit, versioned ownership.**

> Shift's over. Who keeps the promise to call the customer back?

Support conversations change throughout a shift: a callback moves earlier, a vendor is still investigating, someone says “seen.” A summary can capture the conversation while leaving responsibility unclear. Baton drafts the handover, checks it against shared procedures, and requires each incoming owner to claim their cases explicitly.

Built for **WeMakeDevs “Flip the Switch” — Track 1: Best Business Workflow**.

## How it works

```text
Discord channel: outgoing + incoming shifts
                    ↕
              Discord bridge
                    ↕
               Switch room
       Shared history + room instructions
       Documents: SOP, escalation matrix,
                current ticket
                    ↕
       ┌────────────┼─────────────┐
       ↕            ↕             ↕
    @baton       @checker       @ledger
  Claude Code      Codex         Node.js
  Drafts ticket  Reviews facts   No LLM
                                WebSocket events
                                + HTTP operations
                                      ↕
                                Local state.json
```

**LLM proposes, code enforces, humans own the promise.**

1. The outgoing shift describes cases in ordinary conversation.
2. `@baton` extracts a versioned ticket and maintains its room document after ledger accepts it.
3. `@checker` reviews the ticket against room history, ledger replies, and the SOP.
4. Each incoming owner personally enters `@ledger claim <case-id> v<N>`.
5. `@ledger status` reports ownership, stale claims, urgent unclaimed promises, and handover completion.

Writing someone's name in `owner` never assigns responsibility. Ownership comes from the claimant's own command, using the sender name supplied by Switch. Human-only claiming is also an instruction-level rule; see the enforcement limits below.

## Why Switch is load-bearing

| Switch capability used | Its role in Baton |
|---|---|
| **Rooms** | Keep staff, both LLM agents, and the custom ledger in one conversation. |
| **Room instructions** | Share roles, ticket format, ownership rules, and the handover workflow. |
| **Room documents** | Provide the SOP, escalation matrix, and current ticket for review. Checker reads Baton's ticket but cannot edit Baton's documents. |
| **Custom agent protocol** | Registers ledger as an agent; delivers room events over WebSocket and supports replies and operations over HTTP. |
| **`!invite-agent`** | Brings checker into an ongoing handover. Once tagged, it reviews existing context without staff repeating the brief. |
| **Addressing policy** | Controls who may invoke agents. The local demo opens addressing so staff and rehearsal agents can interact. |
| **Discord bridge** | Connects the staff channel to the Switch room. |
| **`create_room`** | Creates a fresh room and bridged Discord channel with instructions and initial agents for a clean demo. |

**Without Switch**, the standalone ledger tests still run, but the collaborative workflow loses its transport, shared context, agent participation, identity metadata, and Discord connection. Replacing those requires another integration layer.

## Ledger rules and ticket format

| Rule | Enforced behavior |
|---|---|
| **R1 — Explicit ownership** | Handover remains incomplete while any open case lacks a valid claim, regardless of its `owner` hint. |
| **R2 — Current version** | Reject new claims against an older ticket; reject nonexistent future versions too. |
| **R3 — Changed promise time** | When an accepted newer ticket changes a claimed case's time, mark the claim stale and require that owner to claim again. |
| **R4 — One owner** | Reject another person's claim on an already held case, including a stale claim. |
| **R5 — Urgency** | On `status`, flag cases without valid claims when their promise is **less than 30 minutes** away, including overdue promises. Exactly 30 minutes does not trigger urgency. |

A new version alone does not invalidate existing claims. Changes to `waiting`, sources, or another case leave a claim valid if its promised time stays unchanged.

```text
[BATON v2]
SR-1077 | promise: call back 15:30 | waiting: vendor NovaSoft, patch pending | owner: ? | source: Ha 13:58
CS-1106-003 | promise: - | waiting: L2, logs pending | owner: ? | source: Ha 13:40
```

Use exactly five fields in that order. `-` means absent; `?` means unknown ownership. Include only the current customer promise time: the parser takes the first time in `promise`. Wrap the block in triple backticks and place it last in the message.

Malformed blocks apply nothing. Versions must increase. Each accepted ticket must include **all open cases**: omitted cases become closed.

```text
@ledger claim SR-1077 v2
@ledger status
```

Implementation details: [ledger specification](ledger/SPEC.md) and [state machine](ledger/src/ledger-state.js).

## Evaluation

Recorded results from **6 November 2026**:

| Evaluation | Result | Scope |
|---|---|---|
| Deterministic ledger evaluation | **18/18 scenarios; 92 checks passed** | Known-correct ticket blocks and parsed commands against expected ledger behavior. |
| English automated rehearsal | **18/18 checkpoints passed** | Real Switch room, Claude Code, Codex, and ledger; two staff roles simulated by API agents. |

The ledger result includes:

- **S01–S13:** all 13 scenarios exercising R1–R5 caught the expected violations.
- **S14–S15:** both clean scenarios passed without false alarms.
- **S16–S18:** ledger **did not detect** a changed contact channel, a case closed in chat before a replacement ticket, or an owner lacking permission to perform the action. Passing means matching the specification, not preventing these risks.

Reported mutation checks deliberately broke rules in code copies. Changing R5 to `<= 30` failed S12; disabling R2, R3, or R4 failed their corresponding scenarios; disabling closure failed S17; removing R1 failed eight scenarios.

The English rehearsal demonstrated drafting three cases, detecting a callback change from **16:00 to 15:30**, requiring a renewed claim, rejecting a v1 claim after v2, completing the handover, and answering a follow-up with the updated promise. Its transcript also contains a blocked agent mention and a delayed checker reminder; the checkpoint score does not imply every message was correct.

**Not measured systematically:** Baton's extraction accuracy across the scenario set, Checker's detection rate for risks outside ledger rules, or real customer outcomes.

Evidence: [evaluation methodology](eval/README.md), [ledger results](eval/results-ledger.md), and [English rehearsal transcript](demo/rehearsal-en-202611060827.md).

## Run it yourself

The documented integration uses **Windows/PowerShell**, Switch Console **0.40.1**, and its local server **0.31.0**. Setup helpers depend on that local server's Windows configuration paths.

Prerequisites:

- **Node.js 20+**; the project used Node 20.18. WebSocket commands below include its experimental flag.
- Switch Console, with **“Run a server on this computer”** selected and the server running.
- Claude Code and Codex configured and authenticated for Switch.
- A Discord server connected through Console's Discord bridge, with staff accounts linked to Switch.

The repository's Node scripts have **zero third-party dependencies**. No `npm install` is required. The integrated workflow requires Switch, Discord, and model access.

**1. Clone this repository and open PowerShell at its root.**

Tests and ledger evaluation can run independently of Switch:

```powershell
node --test
node eval/run-ledger-eval.js
```

**2. Create the LLM agents in Switch Console.**

| Agent name | Runtime | Agent instructions |
|---|---|---|
| `baton` | Claude Code | [instructions/en/baton.md](instructions/en/baton.md) |
| `checker` | Codex | [instructions/en/checker.md](instructions/en/checker.md) |

Keep checker out of the new demo room until the review step.

**3. Configure and register ledger.**

Create `ledger/.env` privately in an editor:

```dotenv
SWITCH_API=http://127.0.0.1:YOUR_SERVER_PORT
SWITCH_REG_KEY=YOUR_REGISTRATION_KEY
```

Replace both placeholders. Use your running server's API port. In the documented Console version, the registration key is `AGENT_REGISTRATION_TOKEN` in:

```text
%APPDATA%\switchdash\local-switch-server\native\run\switch-core.env
```

Read it privately; do not print or share it.

```powershell
node --env-file=ledger/.env ledger/register.js
node --env-file=ledger/.env ledger/open-ledger.js
```

Registration appends ledger's ID and API key to `ledger/.env`; run it once. `open-ledger.js` reads local admin credentials internally and opens ledger's addressing policy.

**4. Prepare a fresh room.**

```powershell
node --env-file=ledger/.env --experimental-websocket demo/create-room.js baton-demo
node --env-file=ledger/.env --experimental-websocket demo/setup-room.js baton-demo en
```

Alternatively, create a Discord channel manually and send its first message so Switch creates the room, then run `setup-room.js`.

Setup installs [English room instructions](instructions/en/room-instructions.md), adds baton and ledger, opens addressing, and asks baton to publish the [SOP and escalation documents](room-docs/en). It deliberately leaves checker uninvited.

The helper expects Console's default agent directories under `~/.switch/agents/localhost-<port>/`. If you chose other directories, copy the documents into the agents' actual working directories, preserving the `en/` subdirectory. Confirm both room documents exist before continuing.

**5. Start ledger in a separate PowerShell window.**

From the repository root:

```powershell
& .\ledger\run-demo.ps1 -Room baton-demo -Lang en -FakeNow 15:00 -Aliases ""
```

**This demo launcher deletes `ledger/state.json`**, starting a fresh ledger. It also changes that terminal's working directory.

For a manual handover, follow the [English message script](demo/rehearsal-script-en.md). Invite the reviewer with `!invite-agent @checker`, then tag it to review.

**6. Run the automated English rehearsal.**

In another PowerShell window, from the repository root:

```powershell
$env:LEDGER_ROOM = 'baton-demo'
$env:LEDGER_LANG = 'en'
node --env-file=ledger/.env --experimental-websocket demo/rehearse.js
```

It registers simulated staff agents, exercises the real agents, and writes `demo/rehearsal-en-*.md`. Use a fresh room and fresh ledger for another take.

The rehearsal uses fixed story times. `-FakeNow` affects **ledger only**; LLM agents may use the real clock. For a live manual demo, omit `-FakeNow` and choose future promises in UTC+7.

Optional video tooling is in [demo/video](demo/video), with an [English presentation script](demo/video-script-en.md). Its browser automation requires separately configured GPM profiles; it is not required for tests or rehearsal.

## Security notes

- `ledger/.env` and rehearsal credentials in `demo/.env.agents` are gitignored. Keep tokens, admin credentials, and session cookies out of commits, screenshots, and shared logs.
- Registration stores credentials locally without printing the issued API key. The admin helpers read credentials from local Switch configuration.
- Setup opens agent addressing policies. Use a private demo server and review access before broader use.
- All business cases, organizations, and customer scenarios are **fictional**. Room instructions prohibit posting customer phone numbers or email addresses.

## Limitations and next steps

- Ledger validates structured input, not its truth. R3 starts when a newer ticket is accepted, not when someone changes a time in ordinary chat.
- Human-only claims and baton-only ticket publication are currently instruction-level restrictions. The bot accepts valid blocks from other senders and does not reject agent claimants—the rehearsal relies on this. Next: enforce sender roles and stable identity allowlists.
- Times are minutes within one UTC+7 handover day. Cross-day promises need manual review; empty tickets are unsupported.
- State is a local JSON file. There is no automatic WebSocket reconnect, ownership-transfer command, or scheduled reminder loop. Restarting the bot reloads saved state, but missed-message recovery is not established.
- Next evaluation work: measure extraction accuracy and checker detection across all scenarios, including failures. A clean-clone setup verification remains unrecorded.

## Credits

Built with **Switch**, **Claude Code**, and **Codex**. Ledger uses Node.js built-ins and no LLM.