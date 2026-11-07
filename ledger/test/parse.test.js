// Test parser khoi [BATON vN] va lenh (SPEC muc 7: P1-P5, C1)
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseBatonBlock, parseTime } = require('../src/parse-block');
const { parseCommand } = require('../src/parse-command');

const VALID_BLOCK = [
  '@ledger',
  '[BATON v2]',
  'SR-1077 | promise: gọi lại 15:30 | waiting: vendor NovaSoft | owner: ? | source: msg#12',
  'CS-0924-003 | promise: - | waiting: L2 | owner: Dung | source: msg#7',
].join('\n');

test('P1 khoi hop le 2 case: du 5 truong, gio doi ra phut', () => {
  const result = parseBatonBlock(VALID_BLOCK);
  assert.equal(result.ok, true);
  assert.equal(result.version, 2);
  assert.equal(result.cases.length, 2);
  assert.deepEqual(result.cases[0], {
    id: 'SR-1077',
    promiseText: 'gọi lại 15:30',
    promiseMin: 15 * 60 + 30,
    waiting: 'vendor NovaSoft',
    ownerHint: null,
    source: 'msg#12',
  });
  assert.equal(result.cases[1].ownerHint, 'Dung');
});

test('P2 thieu truong source: loi dung so dong', () => {
  const block = '[BATON v1]\nSR-1 | promise: gọi lại 15:30 | waiting: L2 | owner: ?';
  const result = parseBatonBlock(block);
  assert.equal(result.ok, false);
  assert.equal(result.line, 2);
  assert.match(result.reason, /5 trường/);
});

test('P2b sai thu tu truong: loi', () => {
  const block = '[BATON v1]\nSR-1 | waiting: L2 | promise: 15:30 | owner: ? | source: msg#1';
  const result = parseBatonBlock(block);
  assert.equal(result.ok, false);
  assert.match(result.reason, /promise:/);
});

test('P3 gio 25:10: loi gio', () => {
  const block = '[BATON v1]\nSR-1 | promise: gọi lại 25:10 | waiting: L2 | owner: ? | source: msg#1';
  const result = parseBatonBlock(block);
  assert.equal(result.ok, false);
  assert.match(result.reason, /giờ không hợp lệ/);
});

test('P4 ID trung trong khoi: loi', () => {
  const line = 'SR-1 | promise: - | waiting: L2 | owner: ? | source: msg#1';
  const result = parseBatonBlock(`[BATON v1]\n${line}\n${line}`);
  assert.equal(result.ok, false);
  assert.equal(result.line, 3);
  assert.match(result.reason, /trùng/);
});

test('P5 promise: - thi promiseMin = null', () => {
  assert.deepEqual(parseTime(''), { ok: true, minutes: null });
  const result = parseBatonBlock(VALID_BLOCK);
  assert.equal(result.cases[1].promiseMin, null);
  assert.equal(result.cases[1].promiseText, null);
});

test('P6 khoi nam trong ``` van doc duoc, dung o dong ```', () => {
  const block = '```\n[BATON v1]\nSR-1 | promise: - | waiting: - | owner: ? | source: msg#1\n```';
  const result = parseBatonBlock(block);
  assert.equal(result.ok, true);
  assert.equal(result.cases.length, 1);
});

test('C1 lenh nhan co dau / khong dau / chu hoa deu doc duoc', () => {
  const expected = { type: 'claim', caseId: 'SR-1077', version: 2 };
  assert.deepEqual(parseCommand('@ledger nhận SR-1077 v2'), expected);
  assert.deepEqual(parseCommand('@ledger nhan sr-1077 V2'), expected);
  assert.deepEqual(parseCommand('<@1567900194639446046>  Nhận   SR-1077  v2'), expected);
});

test('C2 status va lenh la', () => {
  assert.deepEqual(parseCommand('@ledger status'), { type: 'status' });
  assert.equal(parseCommand('@ledger ping').type, 'unknown');
});
