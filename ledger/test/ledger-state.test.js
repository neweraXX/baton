// Test may trang thai: R1-R5, dong case, phieu cu (SPEC muc 7)
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLedger, applyBlock, claimCase, buildStatus } = require('../src/ledger-state');
const { parseBatonBlock } = require('../src/parse-block');

// "15:29" -> 929
function toMin(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

// Tao khoi tu cac dong case, vd block(2, 'SR-1 | promise: gọi 15:30 | waiting: L2 | owner: ? | source: msg#1')
function block(version, ...caseLines) {
  const parsed = parseBatonBlock([`[BATON v${version}]`, ...caseLines].join('\n'));
  assert.equal(parsed.ok, true, parsed.reason);
  return parsed;
}

function line(id, promise, owner = '?', waiting = 'L2') {
  return `${id} | promise: ${promise} | waiting: ${waiting} | owner: ${owner} | source: msg#1`;
}

test('R1a case owner ?, chua ai nhan: chua xong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1101', 'gọi lại 16:00')));
  const status = buildStatus(ledger, toMin('14:10'));
  assert.equal(status.done, false);
  assert.deepEqual(status.unclaimed, [{ caseId: 'SR-1101', staleUser: null }]);
  assert.equal(status.urgent.length, 0);
});

test('R1b baton ghi owner Dung nhung Dung chua nhan: van chua xong + doi chieu', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1102', '-', 'Dung')));
  const status = buildStatus(ledger, toMin('14:10'));
  assert.equal(status.done, false);
  assert.deepEqual(status.hintMismatches, [{ caseId: 'SR-1102', ownerHint: 'Dung' }]);
});

test('R2 nhan v1 khi da co v2: tu choi, neu ban hien hanh', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1105', 'gọi lại 16:20')));
  applyBlock(ledger, block(2, line('SR-1105', 'gọi lại 16:20', '?', 'vendor NovaSoft')));
  const result = claimCase(ledger, 'Dung', 'SR-1105', 1);
  assert.equal(result.ok, false);
  assert.equal(result.rule, 'R2');
  assert.equal(result.currentVersion, 2);
  assert.equal(ledger.cases.get('SR-1105').claim, null);
});

test('R2b nhay v1 -> v3, nhan v1: tu choi, neu v3', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1107', 'cập nhật 16:50')));
  applyBlock(ledger, block(3, line('SR-1107', 'cập nhật 16:50')));
  const result = claimCase(ledger, 'Minh', 'SR-1107', 1);
  assert.equal(result.rule, 'R2');
  assert.equal(result.currentVersion, 3);
});

test('R3a Dung nhan v1 luc 16:40, v2 doi 15:50: luot nhan cu, phai nhan lai', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1110', 'gọi lại 16:40', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1110', 1);
  const applied = applyBlock(ledger, block(2, line('SR-1110', 'gọi lại 15:50', 'Dung')));
  assert.deepEqual(applied.events, [
    { type: 'stale', caseId: 'SR-1110', user: 'Dung', claimVersion: 1, oldMin: toMin('16:40'), newMin: toMin('15:50'), version: 2 },
  ]);
  const status = buildStatus(ledger, toMin('14:40'));
  assert.equal(status.done, false);
  assert.deepEqual(status.unclaimed, [{ caseId: 'SR-1110', staleUser: 'Dung' }]);
});

test('R3b v2 chi doi waiting: luot nhan v1 van hieu luc', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1117', 'cập nhật 16:40', 'Minh', 'L2')));
  claimCase(ledger, 'Minh', 'SR-1117', 1);
  const applied = applyBlock(ledger, block(2, line('SR-1117', 'cập nhật 16:40', 'Minh', 'vendor NovaSoft')));
  assert.deepEqual(applied.events, []);
  assert.equal(buildStatus(ledger, toMin('15:00')).done, true);
});

test('R3c Dung nhan lai v2 sau khi luot cu: het canh bao', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1110', 'gọi lại 16:40', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1110', 1);
  applyBlock(ledger, block(2, line('SR-1110', 'gọi lại 15:50', 'Dung')));
  const result = claimCase(ledger, 'Dung', 'SR-1110', 2);
  assert.equal(result.ok, true);
  assert.equal(buildStatus(ledger, toMin('14:40')).done, true);
});

test('R3d doi gio 2 lan: so voi gio luc nhan gan nhat', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1114', 'gọi lại 16:20', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1114', 1);
  applyBlock(ledger, block(2, line('SR-1114', 'gọi lại 15:45', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1114', 2);
  const applied = applyBlock(ledger, block(3, line('SR-1114', 'gọi lại 16:10', 'Dung')));
  assert.equal(applied.events[0].oldMin, toMin('15:45'));
  assert.equal(applied.events[0].newMin, toMin('16:10'));
});

test('R4 Dung nhan roi Minh nhan cung case: Minh bi tu choi, Dung van giu', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1115', '-')));
  assert.equal(claimCase(ledger, 'Dung', 'SR-1115', 1).ok, true);
  const second = claimCase(ledger, 'Minh', 'SR-1115', 1);
  assert.equal(second.ok, false);
  assert.equal(second.rule, 'R4');
  assert.equal(second.holder, 'Dung');
  assert.equal(ledger.cases.get('SR-1115').claim.user, 'Dung');
});

test('R5a con 29 phut, chua ai nhan: bao dong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1119', 'gọi lại 15:29'), line('SR-1120', 'gọi lại 15:30')));
  const status = buildStatus(ledger, toMin('15:00'));
  assert.deepEqual(status.urgent, [{ caseId: 'SR-1119', promiseMin: toMin('15:29'), minutesLeft: 29 }]);
});

test('R5b con dung 30 phut: khong bao dong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1120', 'gọi lại 15:30')));
  assert.equal(buildStatus(ledger, toMin('15:00')).urgent.length, 0);
});

test('R5c con 1 phut nhung da co nguoi nhan: khong bao dong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1121', 'gọi lại 15:07', 'Minh')));
  claimCase(ledger, 'Minh', 'SR-1121', 1);
  assert.equal(buildStatus(ledger, toMin('15:06')).urgent.length, 0);
});

test('R5d da qua gio, chua ai nhan: van bao dong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('CS-1', 'cập nhật 15:00')));
  const status = buildStatus(ledger, toMin('15:10'));
  assert.equal(status.urgent[0].minutesLeft, -10);
});

test('X1 case bien mat o v2: CLOSED, khong con trong R1, khong nhan duoc', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1127', '-', 'Dung'), line('SR-1128', 'cập nhật 17:00', 'Minh')));
  claimCase(ledger, 'Dung', 'SR-1127', 1);
  claimCase(ledger, 'Minh', 'SR-1128', 1);
  const applied = applyBlock(ledger, block(2, line('SR-1128', 'cập nhật 17:00', 'Minh')));
  assert.deepEqual(applied.events, [{ type: 'closed', caseId: 'SR-1127' }]);
  assert.equal(buildStatus(ledger, toMin('15:00')).done, true);
  assert.equal(claimCase(ledger, 'Dung', 'SR-1127', 2).code, 'closed_case');
});

test('X2 gui lai khoi v2 khi da co v2: tu choi, khong doi trang thai', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(2, line('SR-1', 'gọi lại 15:00')));
  const result = applyBlock(ledger, block(2, line('SR-1', 'gọi lại 18:00')));
  assert.equal(result.ok, false);
  assert.equal(ledger.cases.get('SR-1').promiseMin, toMin('15:00'));
});

test('X3 nhan phieu chua co (v3 khi moi co v1) va case khong ton tai: tu choi', () => {
  const ledger = createLedger();
  assert.equal(claimCase(ledger, 'Dung', 'SR-1', 1).code, 'no_ticket');
  applyBlock(ledger, block(1, line('SR-1', '-')));
  assert.equal(claimCase(ledger, 'Dung', 'SR-1', 3).code, 'future_version');
  assert.equal(claimCase(ledger, 'Dung', 'SR-999', 1).code, 'unknown_case');
});

test('OK moi case deu co nguoi nhan hop le: ban giao xong', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1122', 'gọi lại 15:30', 'Dung'), line('SR-1123', '-', 'Minh')));
  claimCase(ledger, 'Dung', 'SR-1122', 1);
  claimCase(ledger, 'minh', 'SR-1123', 1);
  const status = buildStatus(ledger, toMin('15:00'));
  assert.equal(status.done, true);
  assert.deepEqual(status.hintMismatches, []);
});
