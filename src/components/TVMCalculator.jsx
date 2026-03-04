import { useState } from 'react'
import { tvmAPI } from '../services/api'
import './TVMCalculator.css'

function TVMCalculator() {
  const [activeCalc, setActiveCalc] = useState('future-value')
  const [inputs, setInputs] = useState({
    principal: 10000,
    futureValue: 20000,
    presentValue: 10000,
    annualRate: 7.0,
    years: 10,
    compoundsPerYear: 12,
    paymentsPerYear: 12,
  })
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
    setResults(null)
    setError(null)
  }

  const calculate = async () => {
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
  }

  return (
    <div className="tvm-calculator">
      <div className="calculator-container">
        <div className="calc-tabs">
          <button
            className={`calc-tab ${activeCalc === 'future-value' ? 'active' : ''}`}
            onClick={() => setActiveCalc('future-value')}
          >
            Future Value
          </button>
          <button
            className={`calc-tab ${activeCalc === 'present-value' ? 'active' : ''}`}
            onClick={() => setActiveCalc('present-value')}
          >
            Present Value
          </button>
          <button
            className={`calc-tab ${activeCalc === 'annuity-payment' ? 'active' : ''}`}
            onClick={() => setActiveCalc('annuity-payment')}
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

          <button
            className="calculate-button"
            onClick={calculate}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="results-card">
            <h3 className="results-title">Results</h3>
            <div className="results-content">
              {results.futureValue && (
                <div className="result-item highlight">
                  <div className="result-label">Future Value</div>
                  <div className="result-value">${results.futureValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              )}
              {results.presentValue && (
                <div className="result-item highlight">
                  <div className="result-label">Present Value</div>
                  <div className="result-value">${results.presentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
              )}
              {results.payment && (
                <div className="result-item highlight">
                  <div className="result-label">Payment Amount</div>
                  <div className="result-value">${results.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
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
