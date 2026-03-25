#!/usr/bin/env node
/**
 * Spot-checks reference formulas against values returned by the public API
 * (see README). Run offline: `node scripts/verify-calculations.mjs`
 * With network: `VERIFY_API=1 node scripts/verify-calculations.mjs`
 */
import assert from 'node:assert/strict'

function monthlyPayment(principal, annualRate, years) {
  const r = annualRate / 12
  const n = years * 12
  return principal * ((r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1))
}

function futureValue(principal, annualRate, years, compoundsPerYear) {
  const rate = annualRate / compoundsPerYear
  const periods = years * compoundsPerYear
  return principal * Math.pow(1 + rate, periods)
}

const API_BASE = process.env.VITE_API_BASE || 'https://financial-calculations-api.onrender.com'

assert.equal(monthlyPayment(300_000, 0.04, 30).toFixed(2), '1432.25')
assert.equal(futureValue(10_000, 0.07, 10, 12).toFixed(2), '20096.61')

if (process.env.VERIFY_API === '1') {
  const payRes = await fetch(`${API_BASE}/v1/mortgage/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ principal: 300_000, annual_rate: 0.04, years: 30 }),
  })
  const payJson = await payRes.json()
  assert.equal(payJson.monthly_payment, 1432.25)

  const fvRes = await fetch(`${API_BASE}/v1/tvm/future-value`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      principal: 10_000,
      annual_rate: 0.07,
      years: 10,
      compounds_per_year: 12,
    }),
  })
  const fvJson = await fvRes.json()
  assert.equal(fvJson.future_value, 20096.61)
  console.log('verify-calculations: ok (local + API)')
} else {
  console.log('verify-calculations: ok (local formulas only; set VERIFY_API=1 to hit API)')
}
