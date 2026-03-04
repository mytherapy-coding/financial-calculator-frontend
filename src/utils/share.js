/**
 * Share utility functions
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
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

  if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData)
      return { success: true, method: 'native' }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
    }
  }

  // Fallback to clipboard
  const success = await copyToClipboard(url)
  return { success, method: 'clipboard', url }
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

Loan Amount: $${inputs.principal.toLocaleString()}
Interest Rate: ${inputs.annualRate}%
Loan Term: ${inputs.years} years

Monthly Payment: $${totalMonthly.toFixed(2)}
Total Interest: $${results.total_interest.toFixed(2)}
Total Paid: $${results.total_paid.toFixed(2)}
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
    text += `Principal: $${inputs.principal.toLocaleString()}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Compounds per Year: ${inputs.compoundsPerYear}\n\n`
    text += `Future Value: $${results.futureValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else if (calcType === 'present-value') {
    text += `Future Value: $${inputs.futureValue.toLocaleString()}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Compounds per Year: ${inputs.compoundsPerYear}\n\n`
    text += `Present Value: $${results.presentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  } else if (calcType === 'annuity-payment') {
    text += `Present Value: $${inputs.presentValue.toLocaleString()}\n`
    text += `Interest Rate: ${inputs.annualRate}%\n`
    text += `Years: ${inputs.years}\n`
    text += `Payments per Year: ${inputs.paymentsPerYear}\n\n`
    text += `Payment Amount: $${results.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  text += `\n\nCalculate yours at: https://mytherapy-coding.github.io/financial-calculator-frontend/`

  return text
}
