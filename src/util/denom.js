/**
 * Convert micro-arch to arch value
 * @param {Number} value : A denomination of arch in micro-arch
 */
function FromAtto(value) {
  return value / 1_000_000_000_000_000_000;
}

export {
  FromAtto
}