// Test bo sung sau review doc lap cua Codex (06/11)
const test = require('node:test');
const assert = require('node:assert/strict');
const { createLedger, applyBlock, claimCase, buildStatus } = require('../src/ledger-state');
const { parseBatonBlock } = require('../src/parse-block');
const { vietnamMinutes } = require('../src/clock');
const format = require('../src/format');

function toMin(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

function block(version, ...caseLines) {
  const parsed = parseBatonBlock([`[BATON v${version}]`, ...caseLines].join('\n'));
  assert.equal(parsed.ok, true, parsed.reason);
  return parsed;
}

function line(id, promise, owner = '?') {
  return `${id} | promise: ${promise} | waiting: L2 | owner: ${owner} | source: msg#1`;
}

test('RV1 dong trong giua khoi: doc du ca 2 case, khong dong nham SR-2', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', '-'), line('SR-2', '-')));
  const parsed = parseBatonBlock(`[BATON v2]\n${line('SR-1', '-')}\n\n${line('SR-2', '-')}`);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.cases.length, 2);
  const applied = applyBlock(ledger, parsed);
  assert.deepEqual(applied.events, []);
});

test('RV2 dong ghi chu sau khoi (khong co "|"): tu choi, khong doan', () => {
  const parsed = parseBatonBlock(`[BATON v1]\n${line('SR-1', '-')}\nGhi chú: khách khó tính`);
  assert.equal(parsed.ok, false);
  assert.equal(parsed.line, 3);
});

test('RV3 doi gio tiep khi luot nhan da cu: van bao R3, yeu cau nhan lai v3', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', 'gọi 16:40', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1', 1);
  applyBlock(ledger, block(2, line('SR-1', 'gọi 15:50', 'Dung')));
  const applied = applyBlock(ledger, block(3, line('SR-1', 'gọi 15:40', 'Dung')));
  assert.equal(applied.events.length, 1);
  assert.equal(applied.events[0].oldMin, toMin('16:40'));
  assert.equal(applied.events[0].newMin, toMin('15:40'));
  assert.equal(applied.events[0].version, 3);
});

test('RV4 gio quay ve dung gio luc nhan: luot nhan hieu luc lai, khong bao R3', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', 'gọi 16:40', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1', 1);
  applyBlock(ledger, block(2, line('SR-1', 'gọi 15:50', 'Dung')));
  const applied = applyBlock(ledger, block(3, line('SR-1', 'gọi 16:40', 'Dung')));
  assert.deepEqual(applied.events, []);
  assert.equal(ledger.cases.get('SR-1').stale, false);
});

test('RV5 nguoi giu da cu, nguoi khac nhan: van la xung dot R4, giu nguyen Dung', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', 'gọi 16:40', 'Dung')));
  claimCase(ledger, 'Dung', 'SR-1', 1);
  applyBlock(ledger, block(2, line('SR-1', 'gọi 15:50', 'Dung')));
  const result = claimCase(ledger, 'Minh', 'SR-1', 2);
  assert.equal(result.rule, 'R4');
  assert.equal(ledger.cases.get('SR-1').claim.user, 'Dung');
});

test('RV6 baton ghi Dung, Minh tu nhan: xong theo nguoi that nhung cau bao co nhac lech', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', '-', 'Dung')));
  claimCase(ledger, 'Minh', 'SR-1', 1);
  const status = buildStatus(ledger, toMin('15:00'));
  assert.equal(status.done, true);
  assert.equal(status.hintMismatches.length, 1);
  const text = format.formatStatus(status);
  assert.match(text, /Baton ghi Dung giữ SR-1 nhưng Dung chưa tự xác nhận/);
  assert.match(text, /baton nên ra phiếu mới/);
  assert.doesNotMatch(text, /mọi case đều có người nhận đúng phiên bản/);
});

test('RV7 nhan lai voi ten khac hoa/thuong, khoang trang: khong phai xung dot', () => {
  const ledger = createLedger();
  applyBlock(ledger, block(1, line('SR-1', '-')));
  claimCase(ledger, 'Dung', 'SR-1', 1);
  assert.equal(claimCase(ledger, ' dung ', 'SR-1', 1).ok, true);
});

test('RV8 gio VN khong phu thuoc mui gio may: 08:00 UTC = 15:00 VN', () => {
  assert.equal(vietnamMinutes(new Date('2026-11-06T08:00:00Z')), toMin('15:00'));
  assert.equal(vietnamMinutes(new Date('2026-11-06T18:30:00Z')), toMin('01:30'));
  assert.equal(vietnamMinutes(new Date(), '15:20'), toMin('15:20'));
});
