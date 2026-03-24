import { useState } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './AmortizationChart.css'

function AmortizationChart({ schedule = [] }) {
  const [viewMode, setViewMode] = useState('yearly') // 'yearly' or 'monthly'

  if (!schedule || schedule.length === 0) {
    return <div className="amortization-chart">No amortization data available</div>
  }

  // Balance before any payment (loan amount) — first row is after payment 1
  const first = schedule[0]
  const initialBalance =
    Number(first.remaining_balance) + Number(first.principal_payment)

  // Group calendar years of payments: bucket 0 = months 0–11 (displayed as Year 1), etc.
  const yearlyData = schedule.reduce((acc, payment, index) => {
    const bucket = Math.floor(index / 12)
    if (!acc[bucket]) {
      acc[bucket] = {
        bucket,
        principal: 0,
        interest: 0,
        balance: payment.remaining_balance,
      }
    }
    acc[bucket].principal += payment.principal_payment
    acc[bucket].interest += payment.interest_payment
    acc[bucket].balance = payment.remaining_balance
    return acc
  }, {})

  const yearlyBuckets = Object.keys(yearlyData)
    .map(Number)
    .sort((a, b) => a - b)
    .map((k) => yearlyData[k])

  const displayData =
    viewMode === 'yearly'
      ? [
          {
            period: 'Year 0',
            principal: 0,
            interest: 0,
            balance: initialBalance,
          },
          ...yearlyBuckets.map((d) => ({
            period: `Year ${d.bucket + 1}`,
            principal: d.principal,
            interest: d.interest,
            balance: d.balance,
          })),
        ]
      : [
          {
            period: 'Month 0',
            principal: 0,
            interest: 0,
            balance: initialBalance,
          },
          ...schedule.map((p, i) => ({
            period: `Month ${i + 1}`,
            principal: p.principal_payment,
            interest: p.interest_payment,
            balance: p.remaining_balance,
          })),
        ]

  return (
    <div className="amortization-chart">
      <div className="chart-controls">
        <button
          className={`view-button ${viewMode === 'yearly' ? 'active' : ''}`}
          onClick={() => setViewMode('yearly')}
        >
          Yearly View
        </button>
        <button
          className={`view-button ${viewMode === 'monthly' ? 'active' : ''}`}
          onClick={() => setViewMode('monthly')}
        >
          Monthly View
        </button>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={viewMode === 'yearly' ? 0 : displayData.length > 0 ? Math.floor(displayData.length / 12) : 0}
          />
          <YAxis
            yAxisId="left"
            label={{ value: 'Payment ($)', angle: -90, position: 'insideLeft' }}
            tickFormatter={(v) => formatCurrency(v)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Balance ($)', angle: 90, position: 'insideRight' }}
            tickFormatter={(v) => formatCurrency(v)}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="principal"
            stroke="#667eea"
            strokeWidth={2}
            name="Principal"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="interest"
            stroke="#764ba2"
            strokeWidth={2}
            name="Interest"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="balance"
            stroke="#43e97b"
            strokeWidth={2}
            name="Remaining Balance"
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AmortizationChart
