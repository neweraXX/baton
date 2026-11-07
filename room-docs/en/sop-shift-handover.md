
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
