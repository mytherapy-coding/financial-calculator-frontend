/**
 * Share utility functions
 */
import { formatCurrency } from './formatCurrency'

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback:', err)
  }
  // Fallback: execCommand (works in more contexts when textarea is briefly visible)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.setAttribute('readonly', '')
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '0'
    textArea.style.width = '2px'
    textArea.style.height = '2px'
    textArea.style.padding = '0'
    textArea.style.border = 'none'
    textArea.style.outline = 'none'
    textArea.style.opacity = '0'
    textArea.style.zIndex = '-1'
    document.body.appendChild(textArea)
    textArea.focus({ preventScroll: true })
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
 * Copy summary + link to clipboard (always), then optionally open native share (mobile).
 * Copy-first ensures desktop users reliably get text + reloadable URL.
 */
export async function shareContent(title, text, url) {
  const fullText = [
    text.trim(),
    '',
    '---',
    'Open this link in a browser — your inputs load and the calculation runs automatically:',
    url,
  ].join('\n')

  const copied = await copyToClipboard(fullText)
  if (!copied) {
    return { success: false, method: 'clipboard' }
  }

  // Native share: single `text` block (includes the link once). Omitting `url` avoids duplicate links in many apps.
  if (typeof navigator.share === 'function') {
    const sharePayload = { title, text: fullText }
    const mayShare =
      typeof navigator.canShare !== 'function' || navigator.canShare(sharePayload)
    if (mayShare) {
      try {
        await navigator.share(sharePayload)
        return { success: true, method: 'native', url }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.warn('Native share failed (clipboard already copied):', err)
        }
      }
    }
  }

  return { success: true, method: 'clipboard', url }
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

  const extras = []
  if (inputs.propertyTax > 0) {
    extras.push(`Property Tax (annual): ${formatCurrency(inputs.propertyTax)}`)
  }
  if (inputs.homeInsurance > 0) {
    extras.push(`Home Insurance (annual): ${formatCurrency(inputs.homeInsurance)}`)
  }
  if (inputs.pmi > 0) {
    extras.push(`PMI (annual): ${formatCurrency(inputs.pmi)}`)
  }
  if (inputs.hoa > 0) {
    extras.push(`HOA (monthly): ${formatCurrency(inputs.hoa)}`)
  }
  if (inputs.extraPayment > 0) {
    extras.push(`Extra Payment (monthly): ${formatCurrency(inputs.extraPayment)}`)
  }
  const extrasBlock = extras.length ? `\n${extras.join('\n')}\n` : '\n'

  return `Mortgage Calculation Results:

Loan Amount: ${formatCurrency(inputs.principal)}
Interest Rate: ${inputs.annualRate}%
Loan Term: ${inputs.years} years${extrasBlock}Monthly Payment (incl. escrows): ${formatCurrency(totalMonthly)}
Monthly Principal & Interest: ${formatCurrency(results.monthly_payment)}
Total Interest: ${formatCurrency(results.total_interest)}
Total Paid: ${formatCurrency(results.total_paid)}
Payoff Date: ${results.payoff_date}`
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

  return text
}
