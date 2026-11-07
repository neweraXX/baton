// Luu / doc so ledger ra file JSON, de tat bat bot khong mat trang thai.

const fs = require('node:fs');
const { createLedger } = require('./ledger-state');

// Ghi ra file tam roi doi ten: neu tat giua chung thi file cu van nguyen ven
function saveLedger(filePath, ledger) {
  const data = { version: ledger.version, cases: [...ledger.cases.values()] };
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, filePath);
}

function loadLedger(filePath) {
  if (!fs.existsSync(filePath)) {
    return createLedger();
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const ledger = createLedger();
  ledger.version = data.version;
  for (const caseState of data.cases) {
    ledger.cases.set(caseState.id, caseState);
  }
  return ledger;
}

module.exports = { saveLedger, loadLedger };
