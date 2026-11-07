// Doc lenh nguoi go cho @ledger (SPEC muc 1b).
// Body giu nguyen chu "@ledger ..." nen phai bo phan goi ten o dau.

// "@ledger", "<@123>", "<@&123>" o dau tin
const LEADING_MENTIONS = /^(\s*(@\S+|<@[!&]?\d+>))+\s*/;
// "nhận" (tieng Viet) hoac "claim" (tieng Anh, dung cho demo)
const CLAIM_PATTERN = /^(nhận|nhan|claim)\s+([a-z0-9][a-z0-9-]*)\s+v(\d+)$/;

function stripMentions(body) {
  return body.replace(LEADING_MENTIONS, '').trim();
}

// Ket qua: { type: 'status' } | { type: 'claim', caseId, version } | { type: 'unknown', text }
function parseCommand(body) {
  const text = stripMentions(body).normalize('NFC').toLowerCase().replace(/\s+/g, ' ');

  if (text === 'status') {
    return { type: 'status' };
  }

  const claim = CLAIM_PATTERN.exec(text);
  if (claim) {
    return { type: 'claim', caseId: claim[2].toUpperCase(), version: Number(claim[3]) };
  }

  return { type: 'unknown', text };
}

module.exports = { parseCommand, stripMentions };
