import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './AmortizationChart.css'

function AmortizationChart({ schedule = [] }) {
  const [viewMode, setViewMode] = useState('yearly') // 'yearly' or 'monthly'

  if (!schedule || schedule.length === 0) {
    return <div className="amortization-chart">No amortization data available</div>
  }

  // Group by year for yearly view
  const yearlyData = schedule.reduce((acc, payment, index) => {
    const year = Math.floor(index / 12) + 1
    if (!acc[year]) {
      acc[year] = {
        year,
        principal: 0,
        interest: 0,
        balance: payment.remaining_balance,
      }
    }
    acc[year].principal += payment.principal_payment
    acc[year].interest += payment.interest_payment
    acc[year].balance = payment.remaining_balance
    return acc
  }, {})

  const chartData = viewMode === 'yearly'
    ? Object.values(yearlyData)
    : schedule.slice(0, 360).map((p, i) => ({
        month: i + 1,
        principal: p.principal_payment,
        interest: p.interest_payment,
        balance: p.remaining_balance,
      }))

  const displayData = viewMode === 'yearly'
    ? chartData.map(d => ({
        period: `Year ${d.year}`,
        principal: d.principal,
        interest: d.interest,
        balance: d.balance,
      }))
    : chartData.map(d => ({
        period: `Month ${d.month}`,
        principal: d.principal,
        interest: d.interest,
        balance: d.balance,
      }))

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
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: 'Balance ($)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'balance') return `$${value.toLocaleString()}`
              return `$${value.toFixed(2)}`
            }}
          />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="principal"
            stroke="#c59dff"
            strokeWidth={2}
            name="Principal"
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="interest"
            stroke="#e0b3ff"
            strokeWidth={2}
            name="Interest"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="balance"
            stroke="#9be7c4"
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
