# Baton: Who Keeps the Promise When the Shift Ends?

“Shift’s over. Who keeps the promise to call the customer back?”

That question is where Baton started.

I come from support and solutions engineering, and I’m teaching myself to code. When I think about a handover, I think about the customer waiting for a call, the vendor still investigating, and the incoming colleague trying to work out what they have actually agreed to do.

A conversation can contain all the facts and still leave responsibility unclear. “Seen” is an acknowledgement. A name in a summary is a suggestion. Neither tells me whether someone has accepted the callback at its latest promised time.

For WeMakeDevs’ “Flip the Switch” hackathon, I built Baton around that gap. The demo cases are fictional; the operational question is the one I wanted to explore.

**LLM proposes, code enforces, humans own the promise.**

Baton has three participants. `@baton`, running through Claude Code, drafts a versioned handover ticket from the conversation. `@checker`, running through Codex, reviews it against the conversation, shared procedures, and ledger replies. `@ledger` is a custom Node.js agent with no LLM.

The ledger records explicit claims. An incoming owner enters a command such as:

```text
@ledger claim SR-1077 v1
```

It uses the sender name supplied by Switch rather than accepting a name written inside the command. Putting someone in the ticket’s `owner` field does not create a claim.

The distinction matters when a promise changes. In the English rehearsal, SR-1077 initially had a callback at 16:00. The incoming shift claimed it. The customer then moved the callback to 15:30.

Once ledger accepted the updated ticket, the earlier claim became stale. The same owner had to claim again against v2. A change to another case, or to what the team was waiting for, would not invalidate that claim if its promise time stayed unchanged.

Ledger also rejects new claims against older tickets, prevents a second person from claiming an already held case, and flags promises without valid claims when they are less than 30 minutes away. That urgency check happens when someone requests status.

Switch provided the place where these participants could work together.

The room holds the conversation. Room instructions describe roles, ticket formatting, and ownership rules. Room documents hold the SOP, escalation matrix, and current handover ticket. Baton updates that ticket document after ledger accepts the version; checker can read it without editing Baton's documents.

The Discord bridge connects the staff channel to the Switch room. Through Switch’s custom agent protocol, my non-LLM ledger receives room events over WebSocket and sends replies and operations over HTTP.

I also used `!invite-agent @checker` to bring the reviewer into an ongoing handover. Once tagged, checker could read the existing history and documents without someone repeating the brief. That was a useful test: could a reviewer join late and still identify what had changed?

Building this taught me several things that were less obvious than the architecture.

The first was how easily formatting can become a business decision.

An independent Codex review found that the original parser stopped at a blank line. Imagine a new ticket containing two cases, separated by an empty line. The parser could accept only the first case.

That was dangerous because an accepted replacement ticket must contain every open case. Omitted cases become closed. A harmless-looking blank line could therefore close the second case accidentally.

The revised specification explicitly skips blank lines and requires every other line inside the block to be valid. Malformed blocks apply nothing. For me, this connected a parser detail directly to the support workflow: stopping early could make unfinished work disappear.

The second lesson came from disagreement between the AI tools.

The instruction review initially recommended reflecting ownership changes in a new ticket version. A follow-up review withdrew that recommendation: ledger already stores ownership, and publishing another version just because someone claimed a case would create unnecessary R2 rejections for subsequent claims against the previous version.

That exchange helped clarify the boundary. Ticket versions describe the handover facts; ledger records who has accepted them. The SOP also needed to respect that distinction, otherwise checker could keep asking for unnecessary versions.

I learned to look for the consequence of a proposed instruction. “Keep everything updated” sounds reasonable until it causes another person’s valid next action to fail.

The third lesson was that a rehearsal has its own timing problems.

The English transcript contains a checker mention blocked by an addressing policy. Baton noticed and passed the reminder along. Later, checker produced a reminder saying claims still needed doing, even though the claim commands had already appeared.

Both moments remain in the transcript. They show why an 18/18 checkpoint score needs context.

The clock needs context too. Ledger supports a fake time for demonstrations, but that setting does not control the LLM agents’ clocks. For a live manual demo, the promises need to be in the future in UTC+7. The setup instructions also call for a fresh room and fresh ledger for another take, so previous rehearsal context does not become part of the next handover.

The recorded results from 6 November 2026 give me evidence for some parts of Baton.

The deterministic ledger evaluation passed **18/18 scenarios, with 92 checks**. It supplied known-correct ticket blocks and exercised parsed commands against expected behavior. Thirteen scenarios tested violations covered by the ownership rules, and two tested clean handovers without false alarms.

The mutation checks made that result more meaningful. Changing the urgency boundary from `< 30` to `<= 30` caused S12 to fail. Disabling stale-version rejection, changed-time handling, or duplicate-owner protection failed the corresponding scenarios. Removing the explicit-ownership rule failed eight scenarios.

A separate English rehearsal passed **18/18 checkpoints** using a real Switch room, Claude Code, Codex, and ledger, with two staff roles simulated by API agents. It demonstrated the callback change, renewed ownership, rejection of an old-version claim, completed handover, and a follow-up answer using 15:30.

Those results have clear limits. Three ledger scenarios pass precisely because ledger behaves as specified while missing risks outside its rules: a changed contact channel, closure mentioned only in chat, and an owner lacking permission to perform the action. Checker’s detection rate for those risks has not been systematically measured. Neither has Baton's extraction accuracy across the scenario set.

There are implementation limits too. Human-only claiming is currently an instruction-level restriction; ledger does not reject agent claimants, and the automated rehearsal relies on that. State lives in a local JSON file. There is no automatic reconnect or scheduled reminder loop, and promises across different days need manual review.

I have not measured customer outcomes.

What I have built is a small workflow where drafting, checking, and accepting responsibility are separate actions. Teaching myself to code through Baton meant learning to make those boundaries explicit—and finding the places where my own design blurred them.

The question I want Baton to answer is simple: who accepted this promise, at this time?

Watch the demo: https://youtu.be/DhnId5jD2oQ

Explore the repository: https://github.com/neweraXX/baton

#HowISwitch