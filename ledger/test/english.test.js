// Test lenh "claim" va cau tra loi tieng Anh (LEDGER_LANG=en, dung cho demo)
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseCommand } = require('../src/parse-command');
const { createFormatter } = require('../src/format');
const { createLedger, applyBlock, claimCase, buildStatus } = require('../src/ledger-state');
const { parseBatonBlock } = require('../src/parse-block');

const en = createFormatter('en');

test('E1 lenh claim tieng Anh doc giong lenh nhan', () => {
  assert.deepEqual(parseCommand('@ledger claim SR-1077 v2'), { type: 'claim', caseId: 'SR-1077', version: 2 });
});

test('E2 cau tra loi tieng Anh cho R2, R3, R4, R5, R1, xong', () => {
  assert.match(en.formatClaimResult({ code: 'old_version', version: 1, currentVersion: 2 }), /\(R2\) Ticket v1 is stale, current is v2/);
  assert.match(en.formatClaimResult({ code: 'conflict', caseId: 'SR-1', holder: 'Dung', holderVersion: 1, user: 'Minh' }), /\(R4\) SR-1 is already held by Dung/);
  const ledger = createLedger();
  applyBlock(ledger, parseBatonBlock('[BATON v1]\nSR-1077 | promise: call back 16:00 | waiting: NovaSoft | owner: ? | source: Ha 13:58'));
  claimCase(ledger, 'Dung', 'SR-1077', 1);
  const moved = applyBlock(ledger, parseBatonBlock('[BATON v2]\nSR-1077 | promise: call back 15:30 | waiting: NovaSoft | owner: ? | source: Ha 14:05'));
  assert.match(en.formatBlockResult(moved), /\(R3\) SR-1077: promise moved 16:00 → 15:30 after Dung claimed v1 → Dung must re-claim on v2/);
  const status = en.formatStatus(buildStatus(ledger, 15 * 60 + 10));
  assert.match(status, /\(R5\) SR-1077: 20 min to the 15:30 promise/);
  assert.match(status, /\(R1\) Handover NOT complete: SR-1077 \(Dung must re-claim\)/);
  claimCase(ledger, 'Dung', 'SR-1077', 2);
  assert.match(en.formatStatus(buildStatus(ledger, 15 * 60 + 10)), /Handover complete/);
});
