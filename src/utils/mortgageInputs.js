import { finiteOr } from './finiteNumber'

export function normalizeMortgageInputs(raw) {
  return {
    principal: finiteOr(raw.principal, 300000),
    annualRate: finiteOr(raw.annualRate, 4.0),
    years: finiteOr(raw.years, 30),
    propertyTax: finiteOr(raw.propertyTax, 0),
    homeInsurance: finiteOr(raw.homeInsurance, 0),
    pmi: finiteOr(raw.pmi, 0),
    hoa: finiteOr(raw.hoa, 0),
    extraPayment: finiteOr(raw.extraPayment, 0),
  }
}

/** Read mortgage fields from URLSearchParams; invalid/missing values use defaults. */
export function mortgageInputsFromSearchParams(searchParams) {
  const p = searchParams instanceof URLSearchParams ? searchParams : new URLSearchParams(searchParams)
  const getNum = (key) => {
    const v = p.get(key)
    if (v == null || v === '') return undefined
    return parseFloat(v)
  }
  return normalizeMortgageInputs({
    principal: getNum('principal'),
    annualRate: getNum('rate'),
    years: getNum('years'),
    propertyTax: getNum('propertyTax'),
    homeInsurance: getNum('homeInsurance'),
    pmi: getNum('pmi'),
    hoa: getNum('hoa'),
    extraPayment: getNum('extraPayment'),
  })
}
