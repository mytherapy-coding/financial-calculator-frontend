import { useState, useEffect, useCallback, useRef } from 'react'
import { mortgageAPI } from '../services/api'
import AmortizationChart from './AmortizationChart'
import PaymentBreakdownChart from './PaymentBreakdownChart'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { copyToClipboard, generateShareUrl, getSharedLinkDateParam } from '../utils/share'
import { formatCurrency, formatInteger } from '../utils/formatCurrency'
import './MortgageCalculator.css'

/** Coerce URL/localStorage values to numbers (handles legacy string values). */
const normalizeNumber = (value, fallback = 0) => {
  const n = typeof value === 'string' ? parseFloat(value) : Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normalizeMortgageInputs = (raw) => ({
  principal: normalizeNumber(raw.principal, 300000),
  annualRate: normalizeNumber(raw.annualRate, 4.0),
  years: normalizeNumber(raw.years, 30),
  propertyTax: normalizeNumber(raw.propertyTax, 0),
  homeInsurance: normalizeNumber(raw.homeInsurance, 0),
  pmi: normalizeNumber(raw.pmi, 0),
  hoa: normalizeNumber(raw.hoa, 0),
  extraPayment: normalizeNumber(raw.extraPayment, 0),
})

function MortgageCalculator() {
  // Load from URL params or localStorage
  const getInitialInputs = () => {
    const params = new URLSearchParams(window.location.search)
    const urlInputs = {
      principal: params.get('principal') ? parseFloat(params.get('principal')) : null,
      annualRate: params.get('rate') ? parseFloat(params.get('rate')) : null,
      years: params.get('years') ? parseFloat(params.get('years')) : null,
      propertyTax: params.get('propertyTax') ? parseFloat(params.get('propertyTax')) : null,
      homeInsurance: params.get('homeInsurance') ? parseFloat(params.get('homeInsurance')) : null,
      pmi: params.get('pmi') ? parseFloat(params.get('pmi')) : null,
      hoa: params.get('hoa') ? parseFloat(params.get('hoa')) : null,
      extraPayment: params.get('extraPayment') ? parseFloat(params.get('extraPayment')) : null,
    }
    
    // Use URL params if available, otherwise use defaults
    return normalizeMortgageInputs({
      principal: urlInputs.principal ?? 300000,
      annualRate: urlInputs.annualRate ?? 4.0,
      years: urlInputs.years ?? 30,
      propertyTax: urlInputs.propertyTax ?? 0,
      homeInsurance: urlInputs.homeInsurance ?? 0,
      pmi: urlInputs.pmi ?? 0,
      hoa: urlInputs.hoa ?? 0,
      extraPayment: urlInputs.extraPayment ?? 0,
    })
  }

  const [inputs, setInputs] = useLocalStorage('mortgage-inputs', getInitialInputs, {
    preferUrlParams: () => {
      const p = new URLSearchParams(window.location.search)
      return p.has('principal') || p.has('rate') || p.has('years')
    },
  })
  const [shareStatus, setShareStatus] = useState(null)

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAmortization, setShowAmortization] = useState(false)
  const [amortizationData, setAmortizationData] = useState(null)

  // URL wins when present; otherwise normalize legacy saved shapes once on mount.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.has('principal') || params.has('rate') || params.has('years')) {
      const urlInputs = {
        principal: params.get('principal') ? parseFloat(params.get('principal')) : 300000,
        annualRate: params.get('rate') ? parseFloat(params.get('rate')) : 4.0,
        years: params.get('years') ? parseFloat(params.get('years')) : 30,
        propertyTax: params.get('propertyTax') ? parseFloat(params.get('propertyTax')) : 0,
        homeInsurance: params.get('homeInsurance') ? parseFloat(params.get('homeInsurance')) : 0,
        pmi: params.get('pmi') ? parseFloat(params.get('pmi')) : 0,
        hoa: params.get('hoa') ? parseFloat(params.get('hoa')) : 0,
        extraPayment: params.get('extraPayment') ? parseFloat(params.get('extraPayment')) : 0,
      }
      setInputs(normalizeMortgageInputs(urlInputs))
    } else {
      setInputs((prev) => normalizeMortgageInputs(prev))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (field, value) => {
    const n = parseFloat(value)
    const normalizedValue = Number.isFinite(n) ? n : 0
    setInputs(prev => {
      const updated = { ...prev, [field]: normalizedValue }
      return updated
    })
    setResults(null)
    setError(null)
    setShareStatus(null)
  }

  const handleShare = async () => {
    if (!results) return

    const shareUrl = generateShareUrl(window.location.origin + window.location.pathname, {
      tab: 'mortgage',
      shared: getSharedLinkDateParam(),
      principal: inputs.principal,
      rate: inputs.annualRate,
      years: inputs.years,
      propertyTax: inputs.propertyTax || undefined,
      homeInsurance: inputs.homeInsurance || undefined,
      pmi: inputs.pmi || undefined,
      hoa: inputs.hoa || undefined,
      extraPayment: inputs.extraPayment || undefined,
    })

    const ok = await copyToClipboard(shareUrl)
    if (ok) {
      setShareStatus('copied')
      setTimeout(() => setShareStatus(null), 3000)
    } else {
      setShareStatus('error')
      setTimeout(() => setShareStatus(null), 3000)
    }
  }

  const calculateMortgage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const summary = await mortgageAPI.summary(
        inputs.principal,
        inputs.annualRate / 100,
        inputs.years
      )

      let extraPaymentResults = null
      if (inputs.extraPayment > 0) {
        extraPaymentResults = await mortgageAPI.withExtraPayments(
          inputs.principal,
          inputs.annualRate / 100,
          inputs.years,
          inputs.extraPayment
        )
      }

      setResults({
        ...summary,
        extraPaymentResults,
        propertyTax: inputs.propertyTax,
        homeInsurance: inputs.homeInsurance,
        pmi: inputs.pmi,
        hoa: inputs.hoa,
      })
    } catch (err) {
      setError(err.message || 'Failed to calculate mortgage')
    } finally {
      setLoading(false)
    }
  }, [inputs])

  const autoCalcFromSharedUrlRan = useRef(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (!params.has('principal') || autoCalcFromSharedUrlRan.current) return
    autoCalcFromSharedUrlRan.current = true
    calculateMortgage()
  }, [calculateMortgage])

  const loadAmortizationSchedule = async () => {
    if (amortizationData) {
      setShowAmortization(!showAmortization)
      return
    }

    setLoading(true)
    try {
      const data = await mortgageAPI.amortizationSchedule(
        inputs.principal,
        inputs.annualRate / 100,
        inputs.years,
        Math.min(inputs.years * 12, 600)
      )
      setAmortizationData(data)
      setShowAmortization(true)
    } catch (err) {
      setError(err.message || 'Failed to load amortization schedule')
    } finally {
      setLoading(false)
    }
  }

  const totalMonthlyPayment = results
    ? results.monthly_payment +
      (results.propertyTax || 0) / 12 +
      (results.homeInsurance || 0) / 12 +
      (results.pmi || 0) / 12 +
      (results.hoa || 0)
    : 0

  return (
    <div className="mortgage-calculator">
      <div className="calculator-container">
        <div className="calculator-card">
          <h2 className="calculator-title">Mortgage Calculator</h2>
          
          <div className="inputs-grid">
            <div className="input-group">
              <label htmlFor="principal">Loan Amount ($)</label>
              <input
                id="principal"
                type="number"
                value={inputs.principal}
                onChange={(e) => handleInputChange('principal', e.target.value)}
                placeholder="300000"
              />
            </div>

            <div className="input-group">
              <label htmlFor="rate">Interest Rate (%)</label>
              <input
                id="rate"
                type="number"
                step="0.01"
                value={inputs.annualRate}
                onChange={(e) => handleInputChange('annualRate', e.target.value)}
                placeholder="4.0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="years">Loan Term (years)</label>
              <input
                id="years"
                type="number"
                value={inputs.years}
                onChange={(e) => handleInputChange('years', e.target.value)}
                placeholder="30"
              />
            </div>

            <div className="input-group">
              <label htmlFor="propertyTax">Property Tax ($/yr)</label>
              <input
                id="propertyTax"
                type="number"
                value={inputs.propertyTax}
                onChange={(e) => handleInputChange('propertyTax', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="homeInsurance">Home Insurance ($/yr)</label>
              <input
                id="homeInsurance"
                type="number"
                value={inputs.homeInsurance}
                onChange={(e) => handleInputChange('homeInsurance', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="pmi">PMI ($/yr)</label>
              <input
                id="pmi"
                type="number"
                value={inputs.pmi}
                onChange={(e) => handleInputChange('pmi', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="hoa">HOA ($/month)</label>
              <input
                id="hoa"
                type="number"
                value={inputs.hoa}
                onChange={(e) => handleInputChange('hoa', e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="input-group">
              <label htmlFor="extraPayment">Extra Payment ($/month)</label>
              <input
                id="extraPayment"
                type="number"
                value={inputs.extraPayment}
                onChange={(e) => handleInputChange('extraPayment', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              className="calculate-button"
              onClick={calculateMortgage}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Calculating...' : 'Calculate Mortgage'}
            </button>
            {results && (
              <button
                className="share-button"
                onClick={handleShare}
                title="Share: copy a link with your inputs and today’s date"
              >
                {shareStatus === 'copied'
                  ? '✓ Copied'
                  : shareStatus === 'error'
                    ? '✗ Failed'
                    : 'Share'}
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="results-container">
            <div className="results-card">
              <h3 className="results-title">Mortgage Repayment Summary</h3>
              
              <div className="summary-grid">
                <div className="summary-item highlight">
                  <div className="summary-label">Total Monthly Payment</div>
                  <div className="summary-value">{formatCurrency(totalMonthlyPayment)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Monthly Principal & Interest</div>
                  <div className="summary-value">{formatCurrency(results.monthly_payment)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Total Interest Paid</div>
                  <div className="summary-value">{formatCurrency(results.total_interest)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Total Paid</div>
                  <div className="summary-value">{formatCurrency(results.total_paid)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Payoff Date</div>
                  <div className="summary-value">{results.payoff_date}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Payoff Months</div>
                  <div className="summary-value">{formatInteger(results.payoff_months)}</div>
                </div>
              </div>

              {results.extraPaymentResults && (
                <div className="extra-payments-section">
                  <h4>With Extra Payments:</h4>
                  <div className="extra-grid">
                    <div>
                      <strong>Months Saved:</strong> {formatInteger(results.extraPaymentResults.months_saved)}
                    </div>
                    <div>
                      <strong>Interest Saved:</strong> {formatCurrency(results.extraPaymentResults.interest_saved)}
                    </div>
                    <div>
                      <strong>New Payoff Date:</strong> {results.extraPaymentResults.new_payoff_date}
                    </div>
                  </div>
                </div>
              )}

              <div className="chart-container">
                <PaymentBreakdownChart
                  monthlyPayment={results.monthly_payment}
                  propertyTax={results.propertyTax}
                  homeInsurance={results.homeInsurance}
                  pmi={results.pmi}
                  hoa={results.hoa}
                />
              </div>

              <button
                className="toggle-button"
                onClick={loadAmortizationSchedule}
                disabled={loading}
              >
                {showAmortization ? 'Hide' : 'Show'} Amortization Schedule
              </button>

              {showAmortization && amortizationData && (
                <div className="amortization-section">
                  <AmortizationChart
                    schedule={amortizationData.schedule}
                    payoffDate={results.payoff_date}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MortgageCalculator
