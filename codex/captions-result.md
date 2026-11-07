{
  "intro": "Shift's over. Who keeps the promise to call the customer back?",
  "cases": "Ha, the morning shift, shares three fictional support cases and their promises.",
  "ticketV1": "Baton turns the conversation into ticket v1. Ledger records it.",
  "claimV1": "Dung, the afternoon shift, personally claims SR-1077 on v1.",
  "timeChange": "The customer moves the callback from 16:00 to 15:30. Ha asks Baton to wait for Checker.",
  "inviteChecker": "Checker joins for the first time, with no briefing, using shared context from Switch.",
  "checkerReview": "Checker finds the outdated callback time and two unclaimed cases, then requests v2.",
  "ticketV2": "Baton issues v2. Ledger flags R3: the time changed, so Dung must claim SR-1077 again.",
  "staleClaim": "Dung tries to claim using v1. Ledger rejects it under R2: the current ticket is v2.",
  "claimAll": "Dung personally claims all three cases on v2, accepting the updated promises.",
  "done": "Ledger confirms: Handover complete. All three cases have an owner on v2.",
  "question": "Dung asks Baton what to tell the customer: the patch is pending; the callback is at 15:30.",
  "eval": "18/18 scenarios, 92 checks; mutations caught. 3 outside rules missed; Checker untested.",
  "outro": "LLM proposes, code enforces, humans own the promise. Built on Switch."
}