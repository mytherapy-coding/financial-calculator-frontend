/**
 * Share utility functions
 */
import { formatCurrency } from './formatCurrency'

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback:', err)
  }
  // Fallback for older browsers, non-HTTPS (except localhost), or denied permission
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    textArea.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    document.body.removeChild(textArea)
    return ok
  } catch (err) {
    console.warn('execCommand copy failed:', err)
    return false
  }
}

/**
 * Generate shareable URL with parameters
 */
export function generateShareUrl(baseUrl, params) {
  const url = new URL(baseUrl)
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      url.searchParams.set(key, params[key])
    }
  })
  return url.toString()
}

/**
 * Share via Web Share API (mobile) or fallback to clipboard
 */
export async function shareContent(title, text, url) {
  const shareData = {
    title,
    text,
    url,
  }

  // Try native share when available. Do not require canShare — many browsers omit it
  // or report false on desktop even when share works; others need canShare === true.
  if (typeof navigator.share === 'function') {
    const mayShare =
      typeof navigator.canShare !== 'function' || navigator.canShare(shareData)
    if (mayShare) {
      try {
        await navigator.share(shareData)
        return { success: true, method: 'native' }
      } catch (err) {
        if (err.name === 'AbortError') {
          return { success: false, cancelled: true }
        }
        console.warn('Native share failed, falling back to clipboard:', err)
      }
    }
  }

  // Fallback: copy full message + link (URL alone was easy to miss as "nothing happened")
  const fallbackText = `${text}\n\n${url}`.trim()
  const success = await copyToClipboard(fallbackText)
  return success
    ? { success: true, method: 'clipboard', url }
    : { success: false, method: 'clipboard' }
}

/**
 * Format mortgage calculation results for sharing
 */
export function formatMortgageShareText(inputs, results) {
  const totalMonthly = results.monthly_payment +
    (inputs.propertyTax || 0) / 12 +
    (inputs.homeInsurance || 0) / 12 +
    (inputs.pmi || 0) / 12 +
    (inputs.hoa || 0)

  return `Mortgage Calculation Results:

Loan Amount: ${formatCurrency(inputs.principal)}
Interest Rate: ${inputs.annualRate}%
Loan Term: ${inputs.years} years

Monthly Payment: ${formatCurrency(totalMonthly)}
Total Interest: ${formatCurrency(results.total_interest)}
Total Paid: ${formatCurrency(results.total_paid)}
Payoff Date: ${results.payoff_date}

Calculate yours at: https://mytherapy-coding.github.io/financial-calculator-frontend/`
}

/**
 * Format TVM calculation results for sharing
 */
export function formatTVMShareText(calcType, inputs, results) {
  const calcNames = {
    'future-value': 'Future Value',
    'present-value': 'Present Value',
    'annuity-payment': 'Annuity Payment',
  }

  let text = `${calcNames[calcType]} Calculation:\n\n`

  if (calcType === 'future-value') {
    text += `Principal: ${formatCurrency(inputs.principal)}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Compounds per Year: ${inputs.compoundsPerYear}\n\n`
    text += `Future Value: ${formatCurrency(results.futureValue)}`
  } else if (calcType === 'present-value') {
    text += `Future Value: ${formatCurrency(inputs.futureValue)}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Compounds per Year: ${inputs.compoundsPerYear}\n\n`
    text += `Present Value: ${formatCurrency(results.presentValue)}`
  } else if (calcType === 'annuity-payment') {
    text += `Present Value: ${formatCurrency(inputs.presentValue)}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Payments per Year: ${inputs.paymentsPerYear}\n\n`
    text += `Payment Amount: ${formatCurrency(results.payment)}`
  }

  text += `\n\nCalculate yours at: https://mytherapy-coding.github.io/financial-calculator-frontend/`

  return text
}
