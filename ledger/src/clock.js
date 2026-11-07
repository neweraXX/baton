// Gio hien tai theo gio Viet Nam (UTC+7), tinh bang phut trong ngay.
// Khong phu thuoc mui gio cua may chay bot.

const VN_OFFSET_MINUTES = 7 * 60;

// "15:00" -> 900
function parseHhmm(text) {
  const [hours, minutes] = text.split(':').map(Number);
  return hours * 60 + minutes;
}

// fakeNow ("HH:MM") dung khi quay demo de co dinh gio; date de test
function vietnamMinutes(date = new Date(), fakeNow = null) {
  if (fakeNow) {
    return parseHhmm(fakeNow);
  }
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  return (utcMinutes + VN_OFFSET_MINUTES) % (24 * 60);
}

module.exports = { vietnamMinutes };
