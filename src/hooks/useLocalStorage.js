import { useState } from 'react'

/**
 * Custom hook for localStorage persistence
 * @param {string} key
 * @param {any|() => any} initialValue — value or function (called once)
 * @param {{ preferUrlParams?: () => boolean }} options — if preferUrlParams() is true, skip localStorage and use initialValue (so shared URLs win over saved form data)
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { preferUrlParams } = options

  const resolveInitial = () =>
    typeof initialValue === 'function' ? initialValue() : initialValue

  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof preferUrlParams === 'function' && preferUrlParams()) {
        const fromUrl = resolveInitial()
        // Keep localStorage in sync so refresh without query string still matches
        try {
          window.localStorage.setItem(key, JSON.stringify(fromUrl))
        } catch (e) {
          console.warn(`Could not persist ${key} after URL load`, e)
        }
        return fromUrl
      }
      const item = window.localStorage.getItem(key)
      if (item) {
        try {
          return JSON.parse(item)
        } catch {
          console.warn(`Invalid JSON in localStorage for ${key}; resetting to defaults`)
          return resolveInitial()
        }
      }
      return resolveInitial()
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return resolveInitial()
    }
  })

  const setValue = (value) => {
    setStoredValue((prev) => {
      let valueToStore
      try {
        valueToStore = value instanceof Function ? value(prev) : value
      } catch (error) {
        console.error(`Error updating ${key}:`, error)
        return prev
      }
      try {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error)
        return prev
      }
      return valueToStore
    })
  }

  return [storedValue, setValue]
}
