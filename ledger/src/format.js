// Doi ket qua cua ledger thanh cau tra loi gui vao room.
// Hai ngon ngu: 'vi' (mac dinh) va 'en' (demo cho giam khao). Chon bang LEDGER_LANG trong bot.js.

const TEXT = {
  vi: {
    noTime: 'không hẹn giờ',
    parseError: (line, reason) => `❌ Khối không hợp lệ, dòng ${line}: ${reason}. Ledger không áp dụng gì.`,
    closed: (caseId) => `• ${caseId} không còn trong phiếu → đóng.`,
    stale: (e, oldTime, newTime) =>
      `• (R3) ${e.caseId}: giờ hứa đổi ${oldTime} → ${newTime} sau khi ${e.user} nhận v${e.claimVersion} → ${e.user} phải nhận lại trên v${e.version}.`,
    blockRejected: (version, current) => `❌ Phiếu v${version} không mới hơn bản hiện hành v${current}. Ledger bỏ qua.`,
    blockRecorded: (version) => `📋 Đã ghi phiếu bàn giao v${version}.`,
    noTicket: 'Chưa có phiếu bàn giao nào.',
    unknownCase: (caseId) => `❌ Không có case ${caseId} trong phiếu hiện hành.`,
    closedCase: (caseId) => `❌ ${caseId} đã đóng, không nhận được.`,
    oldVersion: (version, current) => `⛔ (R2) Phiếu v${version} đã cũ, bản hiện hành là v${current}. Đọc lại v${current} rồi nhận lại.`,
    futureVersion: (version, current) => `❌ Chưa có phiếu v${version}, bản hiện hành là v${current}.`,
    conflict: (r) => `⚠️ (R4) ${r.caseId} đang do ${r.holder} giữ (v${r.holderVersion}). ${r.user} không nhận được, hai người cần thống nhất.`,
    claimed: (r) => `✅ ${r.user} đã nhận ${r.caseId} theo phiếu v${r.version}.`,
    hintNote: (hint, user) => ` (Baton ghi owner là ${hint || 'chưa ai'}, ledger ghi theo người tự nhận là ${user}.)`,
    unhandled: 'Lệnh không xử lý được.',
    unclaimedHolder: 'chưa ai nhận',
    staleMark: 'CŨ',
    rowLine: (row, time, waiting, holder) => `• ${row.caseId} · hứa ${time}${waiting ? ` · chờ ${waiting}` : ''} · ${holder}`,
    ticketHeader: (version) => `📋 Phiếu hiện hành v${version}`,
    urgentLeft: (caseId, minutes, time) => `🚨 (R5) ${caseId} còn ${minutes} phút tới giờ hứa ${time} mà chưa ai nhận!`,
    urgentOverdue: (caseId, time) => `🚨 (R5) ${caseId} đã quá giờ hứa ${time} mà chưa ai nhận!`,
    hintMismatch: (hint, caseId) => `ℹ️ Baton ghi ${hint} giữ ${caseId} nhưng ${hint} chưa tự xác nhận.`,
    doneWithMismatch: '✅ Bàn giao xong theo lượt nhận của người thật. Phiếu của baton còn ghi khác ở trên → baton nên ra phiếu mới cho khớp.',
    done: '✅ Bàn giao xong: mọi case đều có người nhận đúng phiên bản.',
    staleItem: (caseId, user) => `${caseId} (${user} cần nhận lại)`,
    notDone: (list) => `⛔ (R1) Bàn giao CHƯA xong: ${list}.`,
    help: 'Lệnh: `@ledger status` · `@ledger nhận <mã case> v<số phiên bản>` (vd `@ledger nhận SR-1077 v2`).',
  },
  en: {
    noTime: 'no time set',
    parseError: (line, reason) => `❌ Invalid ticket block, line ${line}: ${reason}. Ledger applied nothing.`,
    closed: (caseId) => `• ${caseId} is no longer on the ticket → closed.`,
    stale: (e, oldTime, newTime) =>
      `• (R3) ${e.caseId}: promise moved ${oldTime} → ${newTime} after ${e.user} claimed v${e.claimVersion} → ${e.user} must re-claim on v${e.version}.`,
    blockRejected: (version, current) => `❌ Ticket v${version} is not newer than current v${current}. Ignored.`,
    blockRecorded: (version) => `📋 Recorded handover ticket v${version}.`,
    noTicket: 'No handover ticket yet.',
    unknownCase: (caseId) => `❌ ${caseId} is not on the current ticket.`,
    closedCase: (caseId) => `❌ ${caseId} is closed and cannot be claimed.`,
    oldVersion: (version, current) => `⛔ (R2) Ticket v${version} is stale, current is v${current}. Re-read v${current} and claim again.`,
    futureVersion: (version, current) => `❌ There is no ticket v${version} yet, current is v${current}.`,
    conflict: (r) => `⚠️ (R4) ${r.caseId} is already held by ${r.holder} (v${r.holderVersion}). ${r.user} cannot claim it, agree on one owner.`,
    claimed: (r) => `✅ ${r.user} claimed ${r.caseId} on ticket v${r.version}.`,
    hintNote: (hint, user) => ` (Baton listed owner as ${hint || 'nobody'}, ledger records the person who claimed: ${user}.)`,
    unhandled: 'Command not handled.',
    unclaimedHolder: 'unclaimed',
    staleMark: 'STALE',
    rowLine: (row, time, waiting, holder) => `• ${row.caseId} · promise ${time}${waiting ? ` · waiting ${waiting}` : ''} · ${holder}`,
    ticketHeader: (version) => `📋 Current ticket v${version}`,
    urgentLeft: (caseId, minutes, time) => `🚨 (R5) ${caseId}: ${minutes} min to the ${time} promise and nobody has claimed it!`,
    urgentOverdue: (caseId, time) => `🚨 (R5) ${caseId}: the ${time} promise is overdue and nobody has claimed it!`,
    hintMismatch: (hint, caseId) => `ℹ️ Baton lists ${hint} on ${caseId} but ${hint} has not claimed it.`,
    doneWithMismatch: '✅ Handover complete by human claims. Baton\'s ticket still differs above → baton should issue a new ticket.',
    done: '✅ Handover complete: every case has an owner on the right version.',
    staleItem: (caseId, user) => `${caseId} (${user} must re-claim)`,
    notDone: (list) => `⛔ (R1) Handover NOT complete: ${list}.`,
    help: 'Commands: `@ledger status` · `@ledger claim <case-id> v<N>` (e.g. `@ledger claim SR-1077 v2`).',
  },
};

function formatTimeWith(text, minutes) {
  if (minutes === null || minutes === undefined) {
    return text.noTime;
  }
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
}

// Tao bo ham tra loi cho 1 ngon ngu
function createFormatter(lang = 'vi') {
  const text = TEXT[lang] || TEXT.vi;
  const formatTime = (minutes) => formatTimeWith(text, minutes);

  function formatParseError(error) {
    return text.parseError(error.line, error.reason);
  }

  function formatBlockEvent(event) {
    if (event.type === 'closed') {
      return text.closed(event.caseId);
    }
    return text.stale(event, formatTime(event.oldMin), formatTime(event.newMin));
  }

  function formatBlockResult(result) {
    if (!result.ok) {
      return text.blockRejected(result.version, result.currentVersion);
    }
    return [text.blockRecorded(result.version), ...result.events.map(formatBlockEvent)].join('\n');
  }

  function formatClaimResult(result) {
    switch (result.code) {
      case 'no_ticket':
        return text.noTicket;
      case 'unknown_case':
        return text.unknownCase(result.caseId);
      case 'closed_case':
        return text.closedCase(result.caseId);
      case 'old_version':
        return text.oldVersion(result.version, result.currentVersion);
      case 'future_version':
        return text.futureVersion(result.version, result.currentVersion);
      case 'conflict':
        return text.conflict(result);
      case 'claimed':
        return text.claimed(result) + (result.hintMismatch ? text.hintNote(result.ownerHint, result.user) : '');
      default:
        return text.unhandled;
    }
  }

  function formatRow(row) {
    const holder = row.holder ? `${row.holder} (v${row.claimVersion}${row.valid ? '' : `, ${text.staleMark}`})` : text.unclaimedHolder;
    return text.rowLine(row, formatTime(row.promiseMin), row.waiting, holder);
  }

  function formatStatus(status) {
    if (status.noTicket) {
      return text.noTicket;
    }
    const lines = [text.ticketHeader(status.version), ...status.rows.map(formatRow)];
    for (const item of status.urgent) {
      lines.push(
        item.minutesLeft < 0
          ? text.urgentOverdue(item.caseId, formatTime(item.promiseMin))
          : text.urgentLeft(item.caseId, item.minutesLeft, formatTime(item.promiseMin))
      );
    }
    for (const item of status.hintMismatches) {
      lines.push(text.hintMismatch(item.ownerHint, item.caseId));
    }
    if (status.done) {
      lines.push(status.hintMismatches.length > 0 ? text.doneWithMismatch : text.done);
    } else {
      const missing = status.unclaimed.map((item) => (item.staleUser ? text.staleItem(item.caseId, item.staleUser) : item.caseId));
      lines.push(text.notDone(missing.join(', ')));
    }
    return lines.join('\n');
  }

  function formatHelp() {
    return text.help;
  }

  return { formatTime, formatParseError, formatBlockResult, formatClaimResult, formatStatus, formatHelp };
}

// Mac dinh tieng Viet (test va code cu dung truc tiep)
module.exports = { ...createFormatter('vi'), createFormatter };
