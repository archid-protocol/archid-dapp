/* global BigInt */

const ATTO_UNIT = 1_000_000_000_000_000_000;

/**
 * Convert atomic-arch to arch value
 * @param {Number} value : A denomination of arch in aarch
 */
function FromAtto(value, bigint = false) {
  if (bigint) return BigInt(value) / BigInt(ATTO_UNIT);
  else return value / ATTO_UNIT;
}
/**
 * Convert arch to atomic-arch value
 * @param {Number} value : A denomination of arch in arch
 */
function ToAtto(value, bigint = false) {
  if (bigint) return BigInt(value) * BigInt(ATTO_UNIT);
  else return value * ATTO_UNIT;
}

export {
  FromAtto,
  ToAtto
}