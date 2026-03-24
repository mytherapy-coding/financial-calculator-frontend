/**
 * Format a number as USD with thousands separators (e.g. $231,676.38)
 */
export function formatCurrency(amount) {
  const n = Number(amount)
  if (Number.isNaN(n)) return '$0.00'
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
