// Doc khoi [BATON vN] do @baton gui vao room.
// Sai dinh dang thi tra loi ro dong nao sai, KHONG doan (SPEC muc 1a).

const HEADER_PATTERN = /^\[BATON v(\d+)\]\s*$/;
const TIME_PATTERN = /(\d{1,2}):(\d{2})/;
const FIELD_NAMES = ['promise', 'waiting', 'owner', 'source'];
const EMPTY_VALUES = ['-', '?', ''];

// Tin nhan co chua khoi phieu khong
function containsBatonBlock(text) {
  return findHeaderIndex(text.split(/\r?\n/)) !== -1;
}

function findHeaderIndex(lines) {
  return lines.findIndex((line) => HEADER_PATTERN.test(line.trim()));
}

// "goi lai 15:30" -> 930 (so phut trong ngay). Khong co gio -> null.
function parseTime(text) {
  const match = TIME_PATTERN.exec(text);
  if (!match) {
    return { ok: true, minutes: null };
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return { ok: false, reason: `giờ không hợp lệ "${match[0]}"` };
  }
  return { ok: true, minutes: hours * 60 + minutes };
}

// "waiting: L2" voi ten mong doi "waiting" -> "L2"
function parseField(part, expectedName) {
  const prefix = `${expectedName}:`;
  if (!part.toLowerCase().startsWith(prefix)) {
    return { ok: false, reason: `trường thứ tự này phải là "${prefix}", đang là "${part}"` };
  }
  return { ok: true, value: part.slice(prefix.length).trim() };
}

function toOptional(value) {
  return EMPTY_VALUES.includes(value) ? null : value;
}

// 1 dong case: "SR-1077 | promise: ... | waiting: ... | owner: ... | source: ..."
function parseCaseLine(line) {
  const parts = line.split('|').map((part) => part.trim());
  if (parts.length !== 5) {
    return { ok: false, reason: `cần đúng 5 trường cách nhau bởi "|", đang có ${parts.length}` };
  }

  const caseId = parts[0].toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]*$/.test(caseId)) {
    return { ok: false, reason: `mã case không hợp lệ "${parts[0]}"` };
  }

  const values = {};
  for (let index = 0; index < FIELD_NAMES.length; index += 1) {
    const field = parseField(parts[index + 1], FIELD_NAMES[index]);
    if (!field.ok) {
      return field;
    }
    values[FIELD_NAMES[index]] = field.value;
  }

  const promiseText = toOptional(values.promise);
  const time = parseTime(promiseText || '');
  if (!time.ok) {
    return time;
  }

  return {
    ok: true,
    caseData: {
      id: caseId,
      promiseText,
      promiseMin: time.minutes,
      waiting: toOptional(values.waiting),
      ownerHint: toOptional(values.owner),
      source: toOptional(values.source),
    },
  };
}

// Lay cac dong case sau header, toi dong ``` (het khoi code) hoac het tin.
// Bo qua dong trong. Moi dong con lai deu phai la dong case, khong cat khoi giua chung
// (cat giua chung se lam case phia sau bi coi la "bien mat" va bi dong nham).
function collectCaseLines(lines, headerIndex) {
  const caseLines = [];
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const text = lines[index].trim();
    if (text.startsWith('```')) {
      break;
    }
    if (text !== '') {
      caseLines.push({ lineNumber: index + 1, text });
    }
  }
  return caseLines;
}

// Ket qua: { ok: true, version, cases } hoac { ok: false, line, reason }
function parseBatonBlock(text) {
  const lines = text.split(/\r?\n/);
  const headerIndex = findHeaderIndex(lines);
  if (headerIndex === -1) {
    return { ok: false, line: 0, reason: 'không thấy dòng [BATON vN]' };
  }
  const version = Number(HEADER_PATTERN.exec(lines[headerIndex].trim())[1]);

  const caseLines = collectCaseLines(lines, headerIndex);
  if (caseLines.length === 0) {
    return { ok: false, line: headerIndex + 1, reason: 'khối không có case nào' };
  }

  const cases = [];
  const seenIds = new Set();
  for (const { lineNumber, text: lineText } of caseLines) {
    const parsed = parseCaseLine(lineText);
    if (!parsed.ok) {
      return { ok: false, line: lineNumber, reason: parsed.reason };
    }
    if (seenIds.has(parsed.caseData.id)) {
      return { ok: false, line: lineNumber, reason: `mã case ${parsed.caseData.id} bị trùng trong khối` };
    }
    seenIds.add(parsed.caseData.id);
    cases.push(parsed.caseData);
  }

  return { ok: true, version, cases };
}

module.exports = { containsBatonBlock, parseBatonBlock, parseTime };
