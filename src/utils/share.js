/**
 * Share link helpers — copy shareable URL with query params to clipboard
 */

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
 * Build a URL with query params so opening it reloads the same inputs.
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
