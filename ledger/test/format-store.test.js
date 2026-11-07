// Test cau tra loi tieng Viet va luu/doc so ra file
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createLedger, applyBlock, claimCase, buildStatus } = require('../src/ledger-state');
const { parseBatonBlock } = require('../src/parse-block');
const format = require('../src/format');
const { saveLedger, loadLedger } = require('../src/store');

function demoLedger() {
  const ledger = createLedger();
  const block = parseBatonBlock('[BATON v1]\nSR-1077 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: ? | source: msg#2');
  applyBlock(ledger, block);
  return ledger;
}

test('F1 status co R1 va R5 bang tieng Viet', () => {
  const text = format.formatStatus(buildStatus(demoLedger(), 15 * 60 + 10));
  assert.match(text, /\(R5\) SR-1077 còn 20 phút tới giờ hứa 15:30/);
  assert.match(text, /\(R1\) Bàn giao CHƯA xong: SR-1077/);
});

test('F2 tu choi R2 va R4 co ly do ro rang', () => {
  assert.match(format.formatClaimResult({ code: 'old_version', version: 1, currentVersion: 2 }), /\(R2\) Phiếu v1 đã cũ, bản hiện hành là v2/);
  assert.match(format.formatClaimResult({ code: 'conflict', caseId: 'SR-1', holder: 'Dung', holderVersion: 1, user: 'Minh' }), /\(R4\) SR-1 đang do Dung giữ/);
});

test('S1 luu roi doc lai so: giu nguyen luot nhan', () => {
  const ledger = demoLedger();
  claimCase(ledger, 'Dung', 'SR-1077', 1);
  const file = path.join(os.tmpdir(), `ledger-test-${process.pid}.json`);
  saveLedger(file, ledger);
  const loaded = loadLedger(file);
  fs.unlinkSync(file);
  assert.equal(loaded.version, 1);
  assert.equal(loaded.cases.get('SR-1077').claim.user, 'Dung');
  assert.equal(buildStatus(loaded, 15 * 60).done, true);
});
