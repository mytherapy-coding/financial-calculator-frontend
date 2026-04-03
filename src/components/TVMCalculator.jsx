import { useState, useEffect, useCallback, useRef } from 'react'
import { tvmAPI } from '../services/api'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { copyToClipboard, generateShareUrl, getSharedLinkDateParam } from '../utils/share'
import { formatCurrency } from '../utils/formatCurrency'
import { tvmInputsFromSearchParams } from '../utils/tvmInputs'
import './TVMCalculator.css'

const TVM_ACTIVE_CALC_KEY = 'tvm-active-calc'

function TVMCalculator() {
  const getInitialCalc = () => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('calc')
    if (fromUrl && ['future-value', 'present-value', 'annuity-payment'].includes(fromUrl)) {
      return fromUrl
    }
    try {
      const saved = localStorage.getItem(TVM_ACTIVE_CALC_KEY)
      if (saved && ['future-value', 'present-value', 'annuity-payment'].includes(saved)) {
        return saved
      }
    } catch {
      /* ignore */
    }
    return 'future-value'
  }

  const [activeCalc, setActiveCalc] = useState(getInitialCalc)

  const getInitialInputs = () => tvmInputsFromSearchParams(window.location.search)

  const [inputs, setInputs] = useLocalStorage('tvm-inputs', getInitialInputs, {
    preferUrlParams: () => {
      const p = new URLSearchParams(window.location.search)
      // Only override localStorage for shared links, not plain ?tab=tvm
      return (
        p.has('calc') ||
        (p.get('tab') === 'tvm' &&
          (p.has('principal') || p.has('futureValue') || p.has('presentValue') || p.has('rate')))
      )
    },
  })
  const [shareStatus, setShareStatus] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(TVM_ACTIVE_CALC_KEY, activeCalc)
    } catch {
      /* ignore */
    }
  }, [activeCalc])

  // Sync URL only for shared TVM links (not ?tab=tvm&shared=… alone)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const calcFromUrl = params.get('calc')
    if (calcFromUrl && ['future-value', 'present-value', 'annuity-payment'].includes(calcFromUrl)) {
      setActiveCalc(calcFromUrl)
    }
    const hasSharedTvm =
      params.has('calc') ||
      (params.get('tab') === 'tvm' &&
        (params.has('principal') || params.has('futureValue') || params.has('presentValue') || params.has('rate')))
    if (!hasSharedTvm) return
    setInputs(tvmInputsFromSearchParams(params))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleInputChange = (field, value) => {
    setInputs(prev => {
      // Handle select dropdowns (compoundsPerYear, paymentsPerYear) as integers
      if (field === 'compoundsPerYear' || field === 'paymentsPerYear') {
        return { ...prev, [field]: parseInt(value) || 0 }
      }
      // Handle number inputs
      const n = parseFloat(value)
      return { ...prev, [field]: Number.isFinite(n) ? n : 0 }
    })
    setResults(null)
    setError(null)
    setShareStatus(null)
  }

  const handleShare = async () => {
    if (!results) return

    const shareUrl = generateShareUrl(window.location.origin + window.location.pathname, {
      tab: 'tvm',
      shared: getSharedLinkDateParam(),
      calc: activeCalc,
      principal: activeCalc === 'future-value' ? inputs.principal : undefined,
      futureValue: activeCalc === 'present-value' ? inputs.futureValue : undefined,
      presentValue: activeCalc === 'annuity-payment' ? inputs.presentValue : undefined,
      rate: inputs.annualRate,
      years: inputs.years,
      compounds: activeCalc !== 'annuity-payment' ? inputs.compoundsPerYear : undefined,
      payments: activeCalc === 'annuity-payment' ? inputs.paymentsPerYear : undefined,
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

  const calculate = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let result
      switch (activeCalc) {
        case 'future-value':
          result = await tvmAPI.futureValue(
            inputs.principal,
            inputs.annualRate / 100,
            inputs.years,
            inputs.compoundsPerYear
          )
          setResults({ futureValue: result })
          break
        case 'present-value':
          result = await tvmAPI.presentValue(
            inputs.futureValue,
            inputs.annualRate / 100,
            inputs.years,
            inputs.compoundsPerYear
          )
          setResults({ presentValue: result })
          break
        case 'annuity-payment':
          result = await tvmAPI.annuityPayment(
            inputs.presentValue,
            inputs.annualRate / 100,
            inputs.years,
            inputs.paymentsPerYear
          )
          setResults({ payment: result })
          break
        default:
          throw new Error('Unknown calculation type')
      }
    } catch (err) {
      setError(err.message || 'Failed to calculate')
    } finally {
      setLoading(false)
    }
  }, [activeCalc, inputs])

  const autoCalcFromSharedUrlRan = useRef(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (autoCalcFromSharedUrlRan.current) return
    const hasSharedTvm =
      params.has('calc') ||
      (params.get('tab') === 'tvm' &&
        (params.has('principal') || params.has('futureValue') || params.has('presentValue') || params.has('rate')))
    if (!hasSharedTvm) return
    autoCalcFromSharedUrlRan.current = true
    calculate()
  }, [calculate])

  return (
    <div className="tvm-calculator">
      <div className="calculator-container">
        <div className="calc-tabs">
          <button
            type="button"
            className={`calc-tab ${activeCalc === 'future-value' ? 'active' : ''}`}
            onClick={() => {
              setActiveCalc('future-value')
              setResults(null)
              setError(null)
            }}
          >
            Future Value
          </button>
          <button
            type="button"
            className={`calc-tab ${activeCalc === 'present-value' ? 'active' : ''}`}
            onClick={() => {
              setActiveCalc('present-value')
              setResults(null)
              setError(null)
            }}
          >
            Present Value
          </button>
          <button
            type="button"
            className={`calc-tab ${activeCalc === 'annuity-payment' ? 'active' : ''}`}
            onClick={() => {
              setActiveCalc('annuity-payment')
              setResults(null)
              setError(null)
            }}
          >
            Annuity Payment
          </button>
        </div>

        <div className="calculator-card">
          <h2 className="calculator-title">
            {activeCalc === 'future-value' && 'Future Value Calculator'}
            {activeCalc === 'present-value' && 'Present Value Calculator'}
            {activeCalc === 'annuity-payment' && 'Annuity Payment Calculator'}
          </h2>

          <div className="inputs-grid">
            {activeCalc === 'future-value' && (
              <>
                <div className="input-group">
                  <label htmlFor="principal">Principal ($)</label>
                  <input
                    id="principal"
                    type="number"
                    value={inputs.principal}
                    onChange={(e) => handleInputChange('principal', e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="rate">Annual Interest Rate (%)</label>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    placeholder="7.0"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="years">Years</label>
                  <input
                    id="years"
                    type="number"
                    value={inputs.years}
                    onChange={(e) => handleInputChange('years', e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="compounds">Compounds per Year</label>
                  <select
                    id="compounds"
                    value={inputs.compoundsPerYear}
                    onChange={(e) => handleInputChange('compoundsPerYear', e.target.value)}
                  >
                    <option value="1">Annually (1)</option>
                    <option value="2">Semi-annually (2)</option>
                    <option value="4">Quarterly (4)</option>
                    <option value="12">Monthly (12)</option>
                    <option value="365">Daily (365)</option>
                  </select>
                </div>
              </>
            )}

            {activeCalc === 'present-value' && (
              <>
                <div className="input-group">
                  <label htmlFor="futureValue">Future Value ($)</label>
                  <input
                    id="futureValue"
                    type="number"
                    value={inputs.futureValue}
                    onChange={(e) => handleInputChange('futureValue', e.target.value)}
                    placeholder="20000"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="rate">Annual Interest Rate (%)</label>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    placeholder="7.0"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="years">Years</label>
                  <input
                    id="years"
                    type="number"
                    value={inputs.years}
                    onChange={(e) => handleInputChange('years', e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="compounds">Compounds per Year</label>
                  <select
                    id="compounds"
                    value={inputs.compoundsPerYear}
                    onChange={(e) => handleInputChange('compoundsPerYear', e.target.value)}
                  >
                    <option value="1">Annually (1)</option>
                    <option value="2">Semi-annually (2)</option>
                    <option value="4">Quarterly (4)</option>
                    <option value="12">Monthly (12)</option>
                    <option value="365">Daily (365)</option>
                  </select>
                </div>
              </>
            )}

            {activeCalc === 'annuity-payment' && (
              <>
                <div className="input-group">
                  <label htmlFor="presentValue">Present Value ($)</label>
                  <input
                    id="presentValue"
                    type="number"
                    value={inputs.presentValue}
                    onChange={(e) => handleInputChange('presentValue', e.target.value)}
                    placeholder="10000"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="rate">Annual Interest Rate (%)</label>
                  <input
                    id="rate"
                    type="number"
                    step="0.01"
                    value={inputs.annualRate}
                    onChange={(e) => handleInputChange('annualRate', e.target.value)}
                    placeholder="5.0"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="years">Years</label>
                  <input
                    id="years"
                    type="number"
                    value={inputs.years}
                    onChange={(e) => handleInputChange('years', e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="payments">Payments per Year</label>
                  <select
                    id="payments"
                    value={inputs.paymentsPerYear}
                    onChange={(e) => handleInputChange('paymentsPerYear', e.target.value)}
                  >
                    <option value="1">Annually (1)</option>
                    <option value="2">Semi-annually (2)</option>
                    <option value="4">Quarterly (4)</option>
                    <option value="12">Monthly (12)</option>
                    <option value="52">Weekly (52)</option>
                  </select>
                </div>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="calculate-button"
              onClick={calculate}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Calculating...' : 'Calculate'}
            </button>
            {results && (
              <button
                type="button"
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
          <div className="results-card">
            <h3 className="results-title">Results</h3>
            <div className="results-content">
              {activeCalc === 'future-value' && results && 'futureValue' in results && (
                <div className="result-item highlight">
                  <div className="result-label">Future Value</div>
                  <div className="result-value">{formatCurrency(results.futureValue)}</div>
                </div>
              )}
              {activeCalc === 'present-value' && results && 'presentValue' in results && (
                <div className="result-item highlight">
                  <div className="result-label">Present Value</div>
                  <div className="result-value">{formatCurrency(results.presentValue)}</div>
                </div>
              )}
              {activeCalc === 'annuity-payment' && results && 'payment' in results && (
                <div className="result-item highlight">
                  <div className="result-label">Payment Amount</div>
                  <div className="result-value">{formatCurrency(results.payment)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TVMCalculator
