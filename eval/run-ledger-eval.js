// Chay 18 kich ban eval vao code ledger that va cham tu dong (khong can Discord, khong LLM).
// Dau vao: eval/scenarios/*.md (lay khoi [BATON vN] dung) + eval/expected-ledger.json (dap an may cham).
// Chay: node eval/run-ledger-eval.js      -> in bang + ghi eval/results-ledger.md

const fs = require('node:fs');
const path = require('node:path');
const { parseBatonBlock } = require('../ledger/src/parse-block');
const { parseCommand } = require('../ledger/src/parse-command');
const { createLedger, applyBlock, claimCase, buildStatus } = require('../ledger/src/ledger-state');

const SCENARIO_DIR = path.join(__dirname, 'scenarios');
const EXPECTED_FILE = path.join(__dirname, 'expected-ledger.json');
const RESULT_FILE = path.join(__dirname, 'results-ledger.md');

function toMinutes(hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

function findScenarioFile(scenarioId) {
  const file = fs.readdirSync(SCENARIO_DIR).find((name) => name.startsWith(`${scenarioId}-`));
  if (!file) {
    throw new Error(`Khong thay file kich ban ${scenarioId}`);
  }
  return path.join(SCENARIO_DIR, file);
}

// Lay doan giua heading "## <title>" va heading "## " ke tiep
function readSection(markdown, title) {
  const start = markdown.indexOf(`## ${title}`);
  if (start === -1) {
    return '';
  }
  const rest = markdown.slice(start + title.length + 3);
  const next = rest.search(/\n## /);
  return next === -1 ? rest : rest.slice(0, next);
}

// Moi khoi ``` co dong [BATON vN] trong muc "Khoi BATON dung" -> Map(version -> khoi da parse)
function readCorrectBlocks(markdown) {
  const section = readSection(markdown, 'Khối BATON đúng');
  const blocks = new Map();
  for (const match of section.matchAll(/```[a-z]*\n([\s\S]*?)```/g)) {
    if (!/\[BATON v\d+\]/.test(match[1])) {
      continue;
    }
    const parsed = parseBatonBlock(match[1]);
    if (!parsed.ok) {
      throw new Error(`Khoi dap an loi dong ${parsed.line}: ${parsed.reason}`);
    }
    blocks.set(parsed.version, parsed);
  }
  return blocks;
}

function sortedEvents(events) {
  return events.map((event) => `${event.type}:${event.caseId}`).sort();
}

function sameList(actual, expected) {
  return JSON.stringify([...actual].sort()) === JSON.stringify([...expected].sort());
}

// Chay 1 buoc thiet lap. Tra ve danh sach loi (rong = dung)
function runSetupStep(ledger, blocks, step) {
  if (step.op === 'block') {
    const block = blocks.get(step.version);
    if (!block) {
      return [`thiet lap: khong co khoi v${step.version} trong file`];
    }
    const result = applyBlock(ledger, block);
    if (!result.ok) {
      return [`thiet lap: nap v${step.version} bi tu choi`];
    }
    const expected = (step.expectEvents || []).map((event) => `${event.type}:${event.caseId}`).sort();
    const actual = sortedEvents(result.events);
    return sameList(actual, expected) ? [] : [`nap v${step.version}: su kien ${actual.join(',') || '-'} != dap an ${expected.join(',') || '-'}`];
  }
  if (step.op === 'claim') {
    const result = claimCase(ledger, step.user, step.caseId, step.version);
    return result.code === step.expectCode ? [] : [`thiet lap claim ${step.user} ${step.caseId}: ${result.code} != ${step.expectCode}`];
  }
  return [`thiet lap: op la "${step.op}"`];
}

function checkStatus(status, expect) {
  const errors = [];
  if (status.done !== expect.done) {
    errors.push(`done ${status.done} != ${expect.done}`);
  }
  const unclaimed = status.unclaimed.map((item) => item.caseId);
  if (!sameList(unclaimed, expect.unclaimed || [])) {
    errors.push(`R1 chua nhan [${unclaimed}] != [${expect.unclaimed || []}]`);
  }
  const staleUsers = Object.fromEntries(status.unclaimed.filter((item) => item.staleUser).map((item) => [item.caseId, item.staleUser]));
  if (JSON.stringify(staleUsers) !== JSON.stringify(expect.staleUsers || {})) {
    errors.push(`R3 luot cu ${JSON.stringify(staleUsers)} != ${JSON.stringify(expect.staleUsers || {})}`);
  }
  const urgent = status.urgent.map((item) => item.caseId);
  if (!sameList(urgent, expect.urgent || [])) {
    errors.push(`R5 [${urgent}] != [${expect.urgent || []}]`);
  }
  return errors;
}

// Chay 1 lenh cua nguoi qua dung parser lenh cua bot
function runCommandStep(ledger, nowMin, step) {
  const command = parseCommand(step.command);
  if (step.expect.kind === 'status') {
    if (command.type !== 'status') {
      return [`lenh "${step.command}" khong doc thanh status`];
    }
    return checkStatus(buildStatus(ledger, nowMin), step.expect);
  }
  if (command.type !== 'claim') {
    return [`lenh "${step.command}" khong doc thanh nhan`];
  }
  const result = claimCase(ledger, step.sender, command.caseId, command.version);
  return result.code === step.expect.code ? [] : [`"${step.command}" (${step.sender}): ${result.code} != ${step.expect.code}`];
}

function runScenario(scenarioId, spec) {
  // Windows clone ra file CRLF; chuan hoa ve LF de mau tim khoi code khop (loi 0/18 khi clone sach, 07/11)
  const markdown = fs.readFileSync(findScenarioFile(scenarioId), 'utf8').replace(/\r\n/g, '\n');
  const rules = (markdown.match(/^- rules: (.*)$/m) || [])[1] || '?';
  const blocks = readCorrectBlocks(markdown);
  const ledger = createLedger();
  const nowMin = toMinutes(spec.now);

  const errors = [];
  for (const step of spec.setup) {
    errors.push(...runSetupStep(ledger, blocks, step));
  }
  for (const step of spec.steps) {
    errors.push(...runCommandStep(ledger, nowMin, step));
  }
  const checks = spec.setup.length + spec.steps.length;
  return { scenarioId, rules, checks, errors };
}

function writeReport(results) {
  const passed = results.filter((result) => result.errors.length === 0).length;
  const lines = [
    '# Kết quả eval @ledger (tự động)',
    '',
    `Chạy lúc ${new Date().toISOString()} bằng \`node eval/run-ledger-eval.js\`. Nạp khối BATON **đúng** (đáp án) vào code ledger thật, so với \`eval/expected-ledger.json\`. Phần này đo **luật cứng**, chưa đo LLM trích khối.`,
    '',
    `**${passed}/${results.length} kịch bản đạt.**`,
    '',
    '| Kịch bản | Luật | Số bước kiểm | Kết quả | Lỗi |',
    '|---|---|---:|---|---|',
  ];
  for (const result of results) {
    const ok = result.errors.length === 0;
    lines.push(`| ${result.scenarioId} | ${result.rules} | ${result.checks} | ${ok ? 'ĐẠT' : 'TRƯỢT'} | ${ok ? '' : result.errors.join('; ')} |`);
  }
  fs.writeFileSync(RESULT_FILE, `${lines.join('\n')}\n`);
  return passed;
}

function main() {
  const expected = JSON.parse(fs.readFileSync(EXPECTED_FILE, 'utf8'));
  const results = Object.keys(expected).sort().map((scenarioId) => {
    try {
      return runScenario(scenarioId, expected[scenarioId]);
    } catch (error) {
      return { scenarioId, rules: '?', checks: 0, errors: [`loi chay: ${error.message}`] };
    }
  });
  for (const result of results) {
    console.log(`${result.scenarioId} ${result.errors.length === 0 ? 'DAT  ' : 'TRUOT'} ${result.errors.join(' | ')}`);
  }
  const passed = writeReport(results);
  console.log(`\n${passed}/${results.length} dat. Bao cao: ${RESULT_FILE}`);
}

main();
