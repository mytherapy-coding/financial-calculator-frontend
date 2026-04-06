/** TVM calculator modes (matches URL `calc` param and TVMCalculator state). */
export const TVM_CALC_MODES = ['future-value', 'present-value', 'annuity-payment']

export function isTvmCalcParam(value) {
  return typeof value === 'string' && TVM_CALC_MODES.includes(value)
}
