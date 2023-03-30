/**
 * Convert micro-arch to arch value
 * @param {Number} value : A denomination of arch in micro-arch
 */
function FromMicro(value) {
  return value / 1_000_000;
}

export {
  FromMicro
}