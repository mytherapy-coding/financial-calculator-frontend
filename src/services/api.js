// API configuration
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

/**
 * Make API request with error handling
 */
async function apiRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.error?.message || 'API request failed')
    }

    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// Mortgage API
export const mortgageAPI = {
  payment: async (principal, annualRate, years) => {
    const data = await apiRequest('/v1/mortgage/payment', {
      method: 'POST',
      body: JSON.stringify({ principal, annual_rate: annualRate, years }),
    })
    return data.monthly_payment
  },

  summary: async (principal, annualRate, years) => {
    const data = await apiRequest('/v1/mortgage/summary', {
      method: 'POST',
      body: JSON.stringify({ principal, annual_rate: annualRate, years }),
    })
    return data
  },

  amortizationSchedule: async (principal, annualRate, years, maxMonths = 360) => {
    const data = await apiRequest('/v1/mortgage/amortization-schedule', {
      method: 'POST',
      body: JSON.stringify({ principal, annual_rate: annualRate, years, max_months: maxMonths }),
    })
    return data
  },

  withExtraPayments: async (principal, annualRate, years, extraMonthlyPayment) => {
    const data = await apiRequest('/v1/mortgage/with-extra-payments', {
      method: 'POST',
      body: JSON.stringify({
        principal,
        annual_rate: annualRate,
        years,
        extra_monthly_payment: extraMonthlyPayment,
      }),
    })
    return data
  },
}

// TVM API
export const tvmAPI = {
  futureValue: async (principal, annualRate, years, compoundsPerYear) => {
    const data = await apiRequest('/v1/tvm/future-value', {
      method: 'POST',
      body: JSON.stringify({
        principal,
        annual_rate: annualRate,
        years,
        compounds_per_year: compoundsPerYear,
      }),
    })
    return data.future_value
  },

  presentValue: async (futureValue, annualRate, years, compoundsPerYear) => {
    const data = await apiRequest('/v1/tvm/present-value', {
      method: 'POST',
      body: JSON.stringify({
        future_value: futureValue,
        annual_rate: annualRate,
        years,
        compounds_per_year: compoundsPerYear,
      }),
    })
    return data.present_value
  },

  annuityPayment: async (presentValue, annualRate, years, paymentsPerYear) => {
    const data = await apiRequest('/v1/tvm/annuity-payment', {
      method: 'POST',
      body: JSON.stringify({
        present_value: presentValue,
        annual_rate: annualRate,
        years,
        payments_per_year: paymentsPerYear,
      }),
    })
    return data.payment
  },
}
