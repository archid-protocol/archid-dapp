const NANOSECONDS_PER_SECOND = 1_000_000_000;

/**
 * Format an expiration date as a human readable date string
 * @param {Number} seconds : Integer expiration date in seconds
 * @returns {String} : Human readable date format (Prefixed with "Expired on " if expired)
 */
function DateFormat(seconds, pastOverride = false) {
  let date = new Date((seconds * 1000));
  let dminutes = (parseInt(date.getMinutes()) < 10) ? '0' + date.getMinutes() : date.getMinutes();
  let dateString = date.toLocaleDateString(
    'en-us', { weekday:"long", year:"numeric", month:"short", day:"numeric"}
  ) + ' at ' + date.getHours() + ':' + dminutes;

  if ((new Date().getTime() > date.getTime()) && !pastOverride) return "Expired on " + dateString;
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

/**
 * Covert an expiration in seconds to an expiration in nanoseconds
 * @param {Number} seconds : Integer expiration date in seconds
 * @returns {Number}
 */
function SecondsToNano(seconds = 0) {
  if (!seconds) return 0;
  return seconds * NANOSECONDS_PER_SECOND;
}

/**
 * Convert an expiration in nanoseconds to an expiration in seconds
 * @param {Number} nanoseconds : Integer expiration date in nanoseconds
 * @returns {Number}
 */
function NanoToSeconds(nanoseconds = 0) {
  if (!nanoseconds) return 0;
  return nanoseconds / NANOSECONDS_PER_SECOND;
}

export {
  DateFormat,
  IsExpired,
  SecondsToNano,
  NanoToSeconds
}