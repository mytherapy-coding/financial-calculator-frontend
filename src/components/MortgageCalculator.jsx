import { useState } from 'react'
import { mortgageAPI } from '../services/api'
import AmortizationChart from './AmortizationChart'
import PaymentBreakdownChart from './PaymentBreakdownChart'
import './MortgageCalculator.css'

function MortgageCalculator() {
  const [inputs, setInputs] = useState({
    principal: 300000,
    annualRate: 4.0,
    years: 30,
    propertyTax: 0,
    homeInsurance: 0,
    pmi: 0,
    hoa: 0,
    extraPayment: 0,
  })

  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showAmortization, setShowAmortization] = useState(false)
  const [amortizationData, setAmortizationData] = useState(null)

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
    setResults(null)
    setError(null)
  }

  const calculateMortgage = async () => {
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
  }

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
        Math.min(inputs.years * 12, 360)
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

          <button
            className="calculate-button"
            onClick={calculateMortgage}
            disabled={loading}
          >
            {loading ? 'Calculating...' : 'Calculate Mortgage'}
          </button>

          {error && <div className="error-message">{error}</div>}
        </div>

        {results && (
          <div className="results-container">
            <div className="results-card">
              <h3 className="results-title">Mortgage Repayment Summary</h3>
              
              <div className="summary-grid">
                <div className="summary-item highlight">
                  <div className="summary-label">Total Monthly Payment</div>
                  <div className="summary-value">${totalMonthlyPayment.toFixed(2)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Monthly Principal & Interest</div>
                  <div className="summary-value">${results.monthly_payment.toFixed(2)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Total Interest Paid</div>
                  <div className="summary-value">${results.total_interest.toFixed(2)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Total Paid</div>
                  <div className="summary-value">${results.total_paid.toFixed(2)}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Payoff Date</div>
                  <div className="summary-value">{results.payoff_date}</div>
                </div>

                <div className="summary-item">
                  <div className="summary-label">Payoff Months</div>
                  <div className="summary-value">{results.payoff_months}</div>
                </div>
              </div>

              {results.extraPaymentResults && (
                <div className="extra-payments-section">
                  <h4>With Extra Payments:</h4>
                  <div className="extra-grid">
                    <div>
                      <strong>Months Saved:</strong> {results.extraPaymentResults.months_saved}
                    </div>
                    <div>
                      <strong>Interest Saved:</strong> ${results.extraPaymentResults.interest_saved.toFixed(2)}
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
                  <AmortizationChart schedule={amortizationData.schedule} />
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
