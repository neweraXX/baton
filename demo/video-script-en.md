
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
