const { DateTime } = require("luxon");

function getKenyaTimeISO() {
  try {
    return DateTime.now()
      .setZone("Africa/Nairobi")
      .toFormat("yyyy-LL-dd HH:mm:ss");
  } catch (error) {
    // Fallback to native JS
    return getKenyaTimeNative();
  }
}

function getKenyaTimeFormatted(format = "dd-LLL-yyyy HH:mm:ss") {
  try {
    return DateTime.now().setZone("Africa/Nairobi").toFormat(format);
  } catch (error) {
    return getKenyaTimeNative();
  }
}

function getKenyaTimeNative() {
  const date = new Date();

  const formatter = new Intl.DateTimeFormat("en-KE", {
    timeZone: "Africa/Nairobi",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return formatter.format(date).replace(",", "");
}

module.exports = {
  getKenyaTimeISO,
  getKenyaTimeFormatted,
};
