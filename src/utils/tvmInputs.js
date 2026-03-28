import { finiteOr, finiteIntOr } from './finiteNumber'

export function normalizeTvmInputs(raw) {
  return {
    principal: finiteOr(raw.principal, 10000),
    futureValue: finiteOr(raw.futureValue, 20000),
    presentValue: finiteOr(raw.presentValue, 10000),
    annualRate: finiteOr(raw.annualRate, 7.0),
    years: finiteOr(raw.years, 10),
    compoundsPerYear: Math.max(1, finiteIntOr(raw.compoundsPerYear, 12)),
    paymentsPerYear: Math.max(1, finiteIntOr(raw.paymentsPerYear, 12)),
  }
}

/** Read TVM fields from URLSearchParams; invalid/missing values use defaults. */
export function tvmInputsFromSearchParams(searchParams) {
  const p = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams)
  const getFloat = (key) => {
    const v = p.get(key)
    if (v == null || v === '') return undefined
    return parseFloat(v)
  }
  const getInt = (key) => {
    const v = p.get(key)
    if (v == null || v === '') return undefined
    return parseInt(v, 10)
  }
  return normalizeTvmInputs({
    principal: getFloat('principal'),
    futureValue: getFloat('futureValue'),
    presentValue: getFloat('presentValue'),
    annualRate: getFloat('rate'),
    years: getFloat('years'),
    compoundsPerYear: getInt('compounds'),
    paymentsPerYear: getInt('payments'),
  })
}
