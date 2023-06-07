/**
 * Format an expiration date as a human readable date string
 * @param {Number} seconds : Integer expiration date in seconds
 * @returns {String} : Human readable date format (Prefixed with "Expired on " if expired)
 */
function DateFormat(seconds) {
  let date = new Date((seconds * 1000));
  let dminutes = (parseInt(date.getMinutes()) < 10) ? '0' + date.getMinutes() : date.getMinutes();
  let dateString = date.toLocaleDateString(
    'en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}
  ) + ' at ' + date.getHours() + ':' + dminutes;

  if (new Date().getTime() > date.getTime()) return "Expired on " + dateString;
  else return dateString;
}

/**
 * Check if an expiration is expired
 * @param {Number} seconds : Integer expiration date in seconds
 * @returns {Boolean}
 */
function IsExpired(seconds) {
  if (!seconds) return false;
  if (typeof seconds !== 'number') return false;
  let expiry = new Date((seconds * 1000));
  let currentTime = new Date();
  return currentTime > expiry;
}

export {
  DateFormat,
  IsExpired
}