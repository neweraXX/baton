// So loi hua: may trang thai cho tung case (SPEC muc 2-5).
// Toan ham thuan: khong goi mang, khong doc file, gio "now" truyen tu ngoai vao.

const URGENT_MINUTES = 30;

function createLedger() {
  return { version: 0, cases: new Map() };
}

function sameUser(a, b) {
  return Boolean(a) && Boolean(b) && a.trim().toLowerCase() === b.trim().toLowerCase();
}

// Luot nhan con hieu luc: co nguoi nhan va gio hua chua doi tu luc nhan
function hasValidClaim(caseState) {
  return caseState.claim !== null && !caseState.stale;
}

// Case co o phieu cu ma khong con trong phieu moi -> CLOSED (SPEC 3.2)
function closeMissingCases(ledger, newIds) {
  const events = [];
  for (const caseState of ledger.cases.values()) {
    if (caseState.status === 'OPEN' && !newIds.has(caseState.id)) {
      caseState.status = 'CLOSED';
      events.push({ type: 'closed', caseId: caseState.id });
    }
  }
  return events;
}

function createCaseState(caseData) {
  return { ...caseData, status: 'OPEN', claim: null, stale: false };
}

// Cap nhat 1 case da co. Gio hua khac gio luc nhan -> luot nhan cu (R3, SPEC 3.3-3.4)
// Bao R3 moi lan gio doi ma nguoi nhan chua nhan lai, ke ca khi luot nhan da cu tu truoc.
function updateExistingCase(caseState, caseData, version) {
  const previousMin = caseState.promiseMin;
  Object.assign(caseState, caseData, { status: 'OPEN' });

  if (caseState.claim === null) {
    caseState.stale = false;
    return null;
  }
  caseState.stale = caseState.claim.promiseMin !== caseData.promiseMin;
  const timeChanged = previousMin !== caseData.promiseMin;
  if (caseState.stale && timeChanged) {
    return {
      type: 'stale',
      caseId: caseState.id,
      user: caseState.claim.user,
      claimVersion: caseState.claim.version,
      oldMin: caseState.claim.promiseMin,
      newMin: caseData.promiseMin,
      version,
    };
  }
  return null;
}

// Nap phieu moi. Ket qua: { ok: true, version, events } hoac { ok: false, code: 'old_version', currentVersion }
function applyBlock(ledger, block) {
  if (block.version <= ledger.version) {
    return { ok: false, code: 'old_version', currentVersion: ledger.version, version: block.version };
  }

  const newIds = new Set(block.cases.map((caseData) => caseData.id));
  const events = closeMissingCases(ledger, newIds);

  for (const caseData of block.cases) {
    const existing = ledger.cases.get(caseData.id);
    if (existing && existing.status === 'OPEN') {
      const event = updateExistingCase(existing, caseData, block.version);
      if (event) {
        events.push(event);
      }
    } else {
      // Case moi, hoac case da dong nay xuat hien lai: bat dau lai, khong giu luot nhan cu
      ledger.cases.set(caseData.id, createCaseState(caseData));
    }
  }

  ledger.version = block.version;
  return { ok: true, version: block.version, events };
}

// Lenh "nhan <ID> vN" cua nguoi `user`. Xet theo thu tu SPEC muc 4.
function claimCase(ledger, user, caseId, version) {
  if (ledger.version === 0) {
    return { ok: false, code: 'no_ticket' };
  }
  const caseState = ledger.cases.get(caseId);
  if (!caseState) {
    return { ok: false, code: 'unknown_case', caseId };
  }
  if (caseState.status === 'CLOSED') {
    return { ok: false, code: 'closed_case', caseId };
  }
  if (version < ledger.version) {
    return { ok: false, code: 'old_version', rule: 'R2', caseId, version, currentVersion: ledger.version };
  }
  if (version > ledger.version) {
    return { ok: false, code: 'future_version', caseId, version, currentVersion: ledger.version };
  }
  if (caseState.claim !== null && !sameUser(caseState.claim.user, user)) {
    return {
      ok: false,
      code: 'conflict',
      rule: 'R4',
      caseId,
      user,
      holder: caseState.claim.user,
      holderVersion: caseState.claim.version,
    };
  }

  caseState.claim = { user, version, promiseMin: caseState.promiseMin };
  caseState.stale = false;
  const hintMismatch = !sameUser(caseState.ownerHint, user);
  return { ok: true, code: 'claimed', caseId, user, version, ownerHint: caseState.ownerHint, hintMismatch };
}

// Bang trang thai + canh bao R1, R5 va doi chieu owner cua baton (SPEC muc 5)
function buildStatus(ledger, nowMin) {
  if (ledger.version === 0) {
    return { noTicket: true };
  }

  const rows = [];
  const unclaimed = [];
  const urgent = [];
  const hintMismatches = [];

  for (const caseState of ledger.cases.values()) {
    if (caseState.status !== 'OPEN') {
      continue;
    }
    const valid = hasValidClaim(caseState);
    rows.push({
      caseId: caseState.id,
      promiseText: caseState.promiseText,
      promiseMin: caseState.promiseMin,
      waiting: caseState.waiting,
      holder: caseState.claim ? caseState.claim.user : null,
      claimVersion: caseState.claim ? caseState.claim.version : null,
      valid,
    });

    if (!valid) {
      unclaimed.push({ caseId: caseState.id, staleUser: caseState.stale ? caseState.claim.user : null });
      if (caseState.promiseMin !== null && caseState.promiseMin - nowMin < URGENT_MINUTES) {
        urgent.push({
          caseId: caseState.id,
          promiseMin: caseState.promiseMin,
          minutesLeft: caseState.promiseMin - nowMin,
        });
      }
    }

    const hintClaimed = caseState.claim !== null && sameUser(caseState.claim.user, caseState.ownerHint);
    if (caseState.ownerHint && !hintClaimed) {
      hintMismatches.push({ caseId: caseState.id, ownerHint: caseState.ownerHint });
    }
  }

  return {
    noTicket: false,
    version: ledger.version,
    rows,
    unclaimed,
    urgent,
    hintMismatches,
    done: unclaimed.length === 0,
  };
}

module.exports = { createLedger, applyBlock, claimCase, buildStatus, URGENT_MINUTES };
