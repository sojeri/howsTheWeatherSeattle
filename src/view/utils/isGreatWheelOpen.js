/**
 * given a unix datetime & UTC offset (in seconds),
 * returns a flag indicating whether the great wheel is currently open.
 * aka-- whether it should be spinning and lit up or an unmoving grey blob.
 */
function isGreatWheelOpen(apiDateTime, offset) {
  // get hour from apiDateTime
  // - the open weather map API returns unix datetimes, which are in seconds.
  // - js time is stored in milliseconds-- hence multiply by 1000 here.
  let date = new Date(apiDateTime * 1000);
  let hour = date.getUTCHours(); // eg, 23

  // handle for offset
  hour += 24; // +24 to handle for negative
  offset = offset / 60 / 60;
  hour += offset;
  hour = hour % 24; // reset value to normal hour value

  // mock business hours
  return hour >= 10 && hour <= 23;
}

module.exports = isGreatWheelOpen;
