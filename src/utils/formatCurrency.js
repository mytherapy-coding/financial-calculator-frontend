/**
 * Parse API / form values that may be numbers or numeric strings (with or without commas).
 */
function toSafeNumber(amount) {
  if (amount == null || amount === '') return NaN
  if (typeof amount === 'number') return amount
  if (typeof amount === 'string') {
    const cleaned = amount.replace(/[$,\s]/g, '')
    return cleaned === '' ? NaN : Number(cleaned)
  }
  return Number(amount)
}

/**
 * Format a number as USD with thousands separators (e.g. $231,676.38)
 */
export function formatCurrency(amount) {
  const n = toSafeNumber(amount)
  if (Number.isNaN(n)) return '$0.00'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Integers with thousands separators (e.g. months saved: 1,234)
 */
export function formatInteger(amount) {
  const n = toSafeNumber(amount)
  if (Number.isNaN(n)) return '0'
  return Math.round(n).toLocaleString('en-US')
}
