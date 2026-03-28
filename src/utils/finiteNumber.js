/**
 * Coerce unknown values to finite numbers for forms and URL params.
 */
export function finiteOr(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function finiteIntOr(value, fallback) {
  if (value === null || value === undefined || value === '') return fallback
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.round(n)
}
