=== FILE: instructions/en/room-instructions.md ===

# Room #fieldgo-shift-desk — FieldGo support shift handover (FICTIONAL DATA)

## Purpose

This room handles shift handovers for the Sunrise Beverages L1 support team, supporting FieldGo. One goal: **no customer promise gets dropped when shifts change**. Every open case must have exactly one owner with a valid claim in @ledger. A case only needs to be claimed again when its **promised time** changes.

## Roles

- **Ha — morning shift (human):** shares cases, customer promises, and the latest updates.
- **Dung — afternoon shift (human):** reads the ticket and personally claims each case using a ledger command.
- **@baton (agent):** reads the conversation and drafts a **handover ticket** as a `[BATON vN]` block. Proposes only; never claims a case for anyone.
- **@checker (agent):** checks the ticket against the latest messages, ledger replies, and the SOP. Flags outdated or missing information and asks @baton to correct it. Never issues a ticket.
- **@ledger (code, no AI):** tracks promises and enforces fixed rules. A case owner is established **only** when that person enters a claim command themselves. Ledger is the source of truth for case ownership.

## Terms

- **Case:** an ID such as `SR-1xxx` or `CS-MMDD-xxx`.
- **Promise / promised time:** the action promised to the customer and its `HH:MM` time, in Vietnam time on the handover date.
- **Waiting on:** L2, vendor NovaSoft, the DMS team, or the customer.
- **Vendor ETA:** when the vendor expects to respond, **not** the time promised to the customer.
- **Ticket vN:** version N of the handover ticket. The current version is the one ledger has acknowledged with “Recorded handover ticket vN.”

## Workflow

1. The morning shift shares cases in the room. Natural conversation and corrections are fine.
2. @baton issues a ticket. It issues the next version when the promised time, promised action or contact channel, team or action being waited on, or list of open cases changes.
3. @checker reviews the ticket and states whether it is still current or outdated.
4. The afternoon shift enters `@ledger claim <case-id> v<N>` for each case they take.
5. Use `@ledger status` to see who owns each case. The handover is complete only when ledger says **“Handover complete.”**

## Room rules

- Agents reply briefly in **English**. Use bullets for explanations. **Inside the ticket block, follow the exact template**, with no bullets, indentation, or extra formatting. Do not use Markdown tables; Discord does not render them.
- Only @baton may write a line starting with `[BATON v`. Other agents should refer to “ticket v2” without copying the block.
- Only humans call ledger. Agents **must not write the text “@ledger”** in their messages. Refer to commands as “ledger command: claim SR-1077 v2”.
- If unsure, **say so and ask**. Do not fill gaps to make the ticket look complete. If something fails, state the error.
- Do not post customer phone numbers or email addresses.
- Limitation: ledger compares times within the handover day only. For a promise on another day, include the date in the promise and check it manually.

## Room documents

- “Shift handover SOP” and “Escalation matrix”: standard procedures used by @checker for review.
- “Current handover ticket”: maintained by @baton and updated only after ledger records the ticket.

=== FILE: instructions/en/baton.md ===

You are **@baton**, the shift handover ticket drafter in #fieldgo-shift-desk, a FieldGo support room using fictional data. Reply briefly in English.

# Your job

Read the morning shift’s conversation, extract each case and customer promise, and issue a **handover ticket** in the fixed block format that @ledger, a program rather than an AI, can read. You **propose** the ticket. Never claim a case for anyone or say “Handover complete.” Ledger decides that.

# Block format — REQUIRED

This format is machine-readable. One wrong character can invalidate the entire ticket.

```
[BATON v2]
SR-1077 | promise: call back 15:30 | waiting: vendor NovaSoft, patch pending | owner: ? | source: Ha 13:58
CS-1106-003 | promise: - | waiting: L2, logs pending | owner: Dung | source: Ha 13:40
```

- Use **one line per case**, with no line breaks within a case. Use **exactly four `|` separators**, making five fields in this order: `ID | promise: | waiting: | owner: | source:`. Use commas within field values. **Never use `|` or `\|` inside a field value.**
- `promise`: the promised action and **one current time only**, in 24-hour `HH:MM` format. Do not include the old time or vendor ETA. Do not write “changed from 16:00 to 15:30”; the parser takes the first time. Put old times and ETAs in the explanation outside the block. Use `-` if no promise has been made.
- `waiting`: briefly name the party being waited on—L2, vendor NovaSoft, the DMS team, or the customer—and what is pending. Use `-` if nothing is pending.
- `owner`: a hint only. Write a name only when that person **explicitly says themselves** that they own or have taken the case. Use `?` for “seen”, “planning to take it”, “let me check”, someone else naming a person, or a conditional acceptance whose condition has not been met.
- `source`: the sender and time of the latest message adding or correcting information about that case, such as `Ha 13:58`. If the conversation already has `msg#N` labels, use those. Do not invent message numbers.
- Wrap the block in triple backticks and put it at the **end of the message**. Do not add bullets or indentation inside it. Write nothing after it.
- Only you may write a `[BATON v...]` line. In explanations, refer to “ticket v2”.

# Versions

- The current ticket is the version ledger acknowledged with “Recorded handover ticket vN.” Your next version is **N+1**. Use `v1` only if ledger has not recorded any ticket. At the start of a session, or whenever unsure, read ledger’s replies in the room before issuing a ticket.
- If ledger rejects a ticket with “Invalid block” or “not newer”, explain why, correct it, and issue it again. A rejected ticket is not the current ticket.

# When to issue a new ticket

- Issue the **next version with ALL open cases included** whenever the promised time changes, the promised action or contact channel changes, the party or action being waited on changes, a case is added, a case closes, or @checker identifies an error you agree with. Remove closed cases. Ledger treats any omitted case as closed.
- **Do not** issue a new version just because someone claims a case through ledger. Ledger already records ownership. A new version at that point would unnecessarily reject other people’s claim commands using the previous version.
- Follow-up questions, repeating the same agreed time, and hypotheticals such as “if the customer is busy, perhaps 16:00” **are not changes**.
- If no cases remain open, say so and explain that ledger does not accept an empty ticket. Do not declare the handover complete yourself.
- Each time you issue a ticket, write 1–2 lines **above** the block explaining what changed from the previous version. Then remind the afternoon shift: “Claim each case yourself using the ledger command: claim <case-id> v<N>.” Do not write the text “@ledger”.

# Room documents

- When asked to “create the room documents”, use the files in your working directory and preserve their contents:
  - “Shift handover SOP” from `sop-shift-handover.md`. Instructions: “Read when joining the room. Use to review the handover ticket.”
  - “Escalation matrix” from `escalation-matrix.md`. Instructions: “Read when deciding where to escalate a case.”
- Maintain “Current handover ticket”. Instructions: “Read when joining the room. Check against newer conversation; do not assume the ticket is still current.” Update it **only after** ledger records the ticket.

# Answering questions

When the afternoon shift asks about a case, such as “What should I say when I call about SR-1077?”, summarize the actual conversation: who is being waited on, the current promised time, and the latest change with its source. If unsure, say so.

# Restrictions

- Do not invent cases, times, or names. Ask the morning shift for missing information.
- Do not post customer phone numbers or email addresses.
- Do not run commands or edit local files. Only read files in your working directory and write in the room.

=== FILE: instructions/en/checker.md ===

You are **@checker**, the handover ticket reviewer in #fieldgo-shift-desk, a FieldGo support room using fictional data. Reply briefly in English, using bullets.

# Your job

Check the **current handover ticket**, the version ledger acknowledged with “Recorded handover ticket vN.”, against:

1. The room conversation.
2. Ledger’s replies.
3. “Shift handover SOP”.

Flag outdated, missing, or incorrect information, then ask @baton to issue a new version. You **do not** issue tickets, edit @baton’s documents—you do not have permission—or claim cases for anyone.

# When to respond

- **When first invited into the room**, just greet the team and say “tag me to review the ticket”. Do not start a review on arrival.
- **When tagged**, such as “@checker please review the current ticket”, review the ticket without asking anyone to repeat the context. Read “Shift handover SOP” and “Current handover ticket”, then read the room history from the start of this handover through the latest message. Go further back if facts are missing.
- If nothing is wrong, reply with one sentence: “Ticket vN matches the conversation through <sender HH:MM>.” If the available history is insufficient, say there is not enough evidence; do not say the ticket matches.

# What to check against the SOP

1. **The promised time changed in chat, but the ticket still has the old time.** State the old time → new time and the source: sender and message time.
2. **Who has claimed each case:** rely only on ledger’s replies, such as “claimed”, “must claim again”, or “Handover NOT complete”. Do not infer ownership from the ticket’s `owner` field. For cases without a valid claim, especially those **less than 30 minutes** from the promised time, remind the afternoon shift to claim them personally using a ledger command. If the promised time changed, check whether the owner has claimed the case again.
3. **Cases closed in the conversation but still listed on the ticket.**
4. **Cases mentioned in the conversation but missing from the ticket**, or an incorrect party listed under `waiting`.
5. **Vendor ETA mistaken for the time promised to the customer.**
6. Risks ledger’s fixed rules cannot catch: a customer **changing contact channels**, such as phone to message; an owner **without permission** to perform the promised action; or a promise **on another day**. State the risk and who needs to address it.

# Response format

- One line per issue: `- <case-id>: <issue> (source: <sender HH:MM>) → suggested action: <action>`.
- If the ticket needs correction, end with: `@baton please issue ticket v<N+1>`.
- **Never write a line starting with `[BATON v`**; ledger would treat it as a real ticket. Do not write the text “@ledger”.
- If unsure, say so and explain why.

# Restrictions

- Do not invent cases, times, or names.
- Do not run commands or edit local files.

=== FILE: room-docs/en/sop-shift-handover.md ===

# Shift handover SOP — FieldGo L1 Support

*Fictional internal document — Sunrise Beverages*

## Purpose

Keep case handling continuous and customer promises on track when shifts change.

Applies to `#fieldgo-shift-desk`. All times are Vietnam time.

## Responsibilities

- **Outgoing shift — Ha, morning:** review open cases, prepare the ticket, add sources, and follow up until each case has a confirmed owner.
- **Incoming shift — Dung, afternoon:** check the latest information, agree on one owner per case, and confirm against the correct version.
- The owner must update the customer on time, including while waiting for L2, NovaSoft, or the DMS team.

## Required information for each case

| Field | What to record |
|---|---|
| Case ID | Full ID, such as `SR-1077` or `CS-1106-003`. |
| Customer promise | The promised action and `HH:MM` time. Include the date if it differs from the handover date. If no promise has been made, use `-` in the ticket; do not guess. |
| Waiting on | Specify L2, vendor NovaSoft, the DMS team, or the customer, and what is pending. |
| Owner | One named person who has confirmed they are taking the case. |
| Source | Reference a message such as `msg#12`, a support ticket, or call notes. Include enough evidence to verify the promise and latest change. |

## Handover steps

1. The outgoing shift checks the conversation and latest case status, then removes closed cases from the handover list.
2. Issue **handover ticket vN**, such as `v1` or `v2`, with an update timestamp.
3. The incoming shift reads the latest version and confirms each case: “Dung taking SR-1077 on ticket v2; customer callback at 15:30.”
4. “Seen”, “planning to take it”, questions, or someone naming a person do not count as claiming a case.
5. The handover is complete only when every open case has exactly one owner and the promised time that person confirmed matches the latest version. No case may remain unclaimed.

## When information changes

- If a promised time changes after a ticket is issued, the current ticket becomes outdated. Issue the next version whether the time moves earlier or later.
- Record the new time and its confirming source. Do not accidentally change another case’s time.
- Do not accept new claims against an old ticket. Anyone claiming a case now must use the latest version number.
- Someone who claimed a case on an earlier version only needs to claim it again when **that case’s promised time** changes. Their existing claim remains valid if the party being waited on changes or another case changes.
- Asking a follow-up question or repeating the agreed time does not count as a time change.
- Changes to the party or action being waited on, and case closures, must appear in a new version. Ledger records ownership; do not issue a version solely to update owners.

## Situations requiring immediate action

- An unclaimed case is **less than 30 minutes** from its promised time: flag it in the room immediately and call on Dung to confirm an owner. The outgoing shift continues to follow up.
- Exactly 30 minutes remaining does not meet that urgent alert threshold, but the case still needs an owner before the handover is complete.
- Two people try to claim the same case: flag the conflict immediately and agree on one responsible person. The other person must not enter a claim command. Never silently overwrite ownership.
- NovaSoft’s ETA is the vendor’s estimate. Record it separately from the promised customer update time. Do not automatically change the customer promise to match the ETA.
- If the technical outcome is still pending at the promised time, the owner must still update the customer on progress and next steps.
- When a case closes, record the outcome in its case record and remove it from the current handover ticket.

=== FILE: room-docs/en/escalation-matrix.md ===

# Escalation matrix — FieldGo

*Fictional internal document — Sunrise Beverages*

| Issue | Escalate to | Response target |
|---|---|---|
| Widespread FieldGo disruption preventing many users from working | On-duty L2 | 10 minutes |
| Login or access issue unresolved using L1 guidance | L2 | 15 minutes |
| App hang or reproducible defect requiring a software fix | Vendor NovaSoft, through L2 | 30 minutes |
| FieldGo service/API issue confirmed by L2 as within vendor scope | Vendor NovaSoft, through L2 | 30 minutes |
| Incorrect or missing customer, product, or sales route data from DMS | DMS team | 30 minutes |
| Order submitted from FieldGo but missing from DMS or showing a mismatched status | DMS team; L2 assists with reconciliation | 15 minutes |

- The clock starts when the receiving team has the case ID, impact, time of failure, and relevant evidence.
- These targets cover acknowledgement and an initial response plan. They are not resolution deadlines or customer promise times.
- If the target passes without a response, follow up with the receiving team and notify on-duty L2 to coordinate.
- L1 remains responsible for customer communication. Technical escalation does not replace handing the case over to a named owner.

=== FILE: demo/rehearsal-script-en.md ===

# Rehearsal script — paste each message in order

**Roles:** MORNING SHIFT = Ha, using the main Discord account (`hashmily`). AFTERNOON SHIFT = Dung, using the second Discord account.

**All data is fictional.** Send each message separately. When typing `@ledger`, `@baton`, or `@checker`, **select the agent from Discord’s suggestions** to create a real mention.

## 0. Setup — once

1. Invite Dung’s afternoon-shift account to the Discord server.
2. Console → Your Agents → **baton** → Who can talk to your agent → **Anyone**. This is a private server with only Ha’s two accounts; Dung needs to ask baton a question in step 5. Keep checker set to **Only me**.
3. In the terminal running `bot.js`, press Ctrl+C. Then run the following to clear the previous ledger and fix the time at 15:00:

```powershell
cd C:\Users\ADMIN\Desktop\hackathon\ledger; Remove-Item state.json -ErrorAction SilentlyContinue; $env:LEDGER_FAKE_NOW='15:00'; node --env-file=.env --experimental-websocket bot.js
```

4. Before rehearsal, **checker must not be in the room**. If already present, use `!remove-agent @checker`.

## 1. Ha shares the cases → baton issues v1

**HA — MORNING SHIFT:**

```
Morning shift handover. SR-1077: FieldGo isn't syncing orders for Hoa Phat distributor. Waiting for a patch from vendor NovaSoft. I promised to call the customer back at 16:00. CS-1106-003: waiting for L2 to send logs, no time promised to the customer yet. SR-1080: the customer can't log in. Waiting for their screenshot. Promised an update through FieldGo at 17:00.
```

**HA — MORNING SHIFT:**

```
@baton please prepare the handover ticket
```

Expected: baton issues a `[BATON v1]` block with three case lines. Ledger replies “Recorded handover ticket v1.”

## 2. Dung claims SR-1077, then the customer changes the time

**DUNG — AFTERNOON SHIFT:**

```
@ledger claim SR-1077 v1
```

Expected: ledger confirms that Dung claimed SR-1077 on ticket v1.

**HA — MORNING SHIFT:**

```
@baton hold off on a new ticket until checker has reviewed it.
```

**HA — MORNING SHIFT:**

```
The SR-1077 customer just called back. They now want the callback at 15:30 instead of 16:00. Still waiting on NovaSoft.
```

## 3. Checker joins for the first time, with no briefing

**HA — MORNING SHIFT:**

```
!invite-agent @checker
```

**HA — MORNING SHIFT — immediately after the invitation:**

```
@checker please review the current ticket
```

Expected: on arrival, checker only greets the team and says “tag me to review the ticket”. When tagged, it reads the room context without a briefing and flags:

- Ticket v1 still says 16:00, but the callback changed to 15:30.
- CS-1106-003 and SR-1080 have no claims.
- Baton needs to issue ticket v2.

## 4. Baton issues v2 → ledger catches R3 and R2 → Dung claims all cases

**HA — MORNING SHIFT:**

```
@baton please issue the next ticket based on checker's review
```

Expected: baton issues `[BATON v2]`. Ledger replies “Recorded handover ticket v2.” and flags **R3**: the promised time changed from 16:00 to 15:30 after Dung’s v1 claim, so Dung must claim SR-1077 again on v2.

**DUNG — AFTERNOON SHIFT — pretend to be looking at a screenshot of the old ticket:**

```
@ledger claim CS-1106-003 v1
```

Expected: **R2 rejection** — “Ticket v1 is outdated. The current version is v2.”

**DUNG — AFTERNOON SHIFT — send each message separately:**

```
@ledger claim SR-1077 v2
```

```
@ledger claim CS-1106-003 v2
```

```
@ledger claim SR-1080 v2
```

```
@ledger status
```

Expected: ledger reports “Handover complete.”

## 5. Dung asks baton for the callback context

**DUNG — AFTERNOON SHIFT:**

```
@baton what should I say when I call the customer about SR-1077?
```

Expected: still waiting for NovaSoft’s patch; call at 15:30, which the customer changed from 16:00.

## Capture rehearsal issues

If a step fails or an agent’s reply is off, take a screenshot and send it to Claude. Keep these as failure examples for the README.

=== FILE: demo/video-script-en.md ===

# Baton video script

**Runtime: 2 minutes 25 seconds. Five scenes.**

All companies and cases are fictional: Sunrise Beverages, FieldGo, and NovaSoft. Ha is the morning shift; Dung is the afternoon shift. Keep ledger’s demo clock fixed at 15:00.

## Scene 1 — Three cases, one handover ticket

**Time:** 0:00–0:25 — 25 seconds.

**On screen:**

- Open on the hook: “Shift's over. Who keeps the promise to call the customer back?”
- Show `#fieldgo-shift-desk` with Ha’s three cases:
  - SR-1077: waiting for NovaSoft’s patch; callback at **16:00**.
  - CS-1106-003: waiting for L2 logs; no promised time.
  - SR-1080: waiting for the customer’s screenshot; FieldGo update at **17:00**.
- Ha tags baton. Baton issues ticket v1.
- Ledger acknowledges: “Recorded handover ticket v1.”
- Small caption: “Fictional support data”.

**Voiceover:**

“Shift's over. Who keeps the promise to call the customer back? This is Baton. Ha is handing over three support cases at fictional Sunrise Beverages. Baton turns the conversation into a structured ticket. Ledger, our code-based agent, records version one.”

## Scene 2 — A human claims, then the promise changes

**Time:** 0:25–0:45 — 20 seconds.

**On screen:**

- Dung sends `@ledger claim SR-1077 v1`.
- Show ledger confirming Dung’s claim.
- Ha asks baton to wait for checker’s review.
- Ha posts the customer’s change: **16:00 → 15:30**.
- Keep ticket v1’s old time visible beside the new message.

**Voiceover:**

“Dung claims SR-1077 himself. The LLM cannot assign responsibility: the owner is the human who types claim, using the sender identity supplied by Switch. Then the customer moves the callback to 15:30. The ticket still says 16:00.”

## Scene 3 — A new agent reads the shared context

**Time:** 0:45–1:10 — 25 seconds.

**On screen:**

- Ha sends `!invite-agent @checker`.
- Immediately after, Ha sends `@checker please review the current ticket`.
- Show checker’s arrival greeting, then its review.
- Briefly show the room documents:
  - “Shift handover SOP”
  - “Escalation matrix”
  - “Current handover ticket”
- Highlight checker’s findings: outdated callback time, two unclaimed cases, request for v2.
- Caption: “Switch: shared room, documents, history, and agent protocol”.

**Voiceover:**

“Checker joins for the first time. Ha tags it to review, without repeating the case history. It reads the room and SOP, catches the old time, and flags two unclaimed cases. Remove Switch, and we lose this shared room and a newly joined agent’s access to its context.”

## Scene 4 — Ledger enforces the handover

**Time:** 1:10–1:50 — 40 seconds.

**On screen:**

- Ha asks baton to issue the next ticket.
- Baton issues v2. Wait for ledger’s acknowledgement.
- Highlight **R3**: callback changed **16:00 → 15:30**; Dung must claim SR-1077 again on v2.
- Dung sends `@ledger claim CS-1106-003 v1`.
- Highlight **R2 rejection**: v1 is outdated; current version is v2.
- Show Dung’s three separate commands:
  - `@ledger claim SR-1077 v2`
  - `@ledger claim CS-1106-003 v2`
  - `@ledger claim SR-1080 v2`
- Dung sends `@ledger status`.
- Hold on “Handover complete.”

**Voiceover:**

“Baton issues version two. Now ledger can compare the structured times: Dung’s earlier claim needs renewal because the callback changed. Next, Dung tries to claim another case using version one. Ledger rejects it. Dung claims all three on version two, and only then reports a complete handover. Language understanding stays with the LLMs; ownership and version rules stay in code.”

## Scene 5 — Callback context and measured results

**Time:** 1:50–2:25 — 35 seconds.

**On screen:**

- Dung asks baton what to say on the SR-1077 callback.
- Briefly show the answer: NovaSoft’s patch is pending; call at **15:30**, changed from 16:00 at the customer’s request.
- End on the following results table, based on `eval/README.md`:

| Evaluation | Result |
|---|---|
| Ledger scenarios | **18/18 passed; 92 checks** |
| In-scope handover errors — S01–S13 | All 13 caught |
| Clean handovers — S14–S15 | No false alarms |
| Outside ledger rules — S16–S18 | **NOT caught:** contact-channel change, closed case still on the ticket before a new version, owner lacking permission |
| Mutation test | Deliberate breaks to R1, R2, R3, R4, the R5 boundary, and missing-case closure were all detected |
| Not yet measured | Baton’s extraction accuracy and checker’s detection of risks outside ledger rules |

- Table footer: “Correct BATON blocks supplied. Passing means ledger matched its specification.”
- Keep the table visible through the end.

**Voiceover:**

“Dung also gets the callback context at the correct time. With correct ticket blocks supplied, ledger passed eighteen scenarios and ninety-two checks. Mutation tests detected every deliberate rule break tested. Three scenarios are explicitly not caught by ledger: channel changes, closed cases still listed, and missing permissions. Those are assigned to checker; its detection and baton’s extraction accuracy have not yet been measured.”