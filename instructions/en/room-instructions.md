
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
