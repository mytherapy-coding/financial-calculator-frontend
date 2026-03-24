import { useMemo } from 'react'
import { formatCurrency } from '../utils/formatCurrency'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import './AmortizationChart.css'

/** First payment month from payoff date and number of payments (monthly). */
function getFirstPaymentDate(payoffDateStr, numPayments) {
  if (!payoffDateStr || !numPayments) {
    const now = new Date()
    return { year: now.getFullYear(), month: 1 }
  }
  const parts = payoffDateStr.split('-')
  const y = Number(parts[0])
  const mo = Number(parts[1]) || 1
  if (Number.isNaN(y)) {
    const now = new Date()
    return { year: now.getFullYear(), month: 1 }
  }
  const d = new Date(y, mo - 1, 1)
  d.setMonth(d.getMonth() - (numPayments - 1))
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function yearForMonthIndex(startYear, startMonth, monthIndex) {
  const d = new Date(startYear, startMonth - 1, 1)
  d.setMonth(d.getMonth() + monthIndex)
  return d.getFullYear()
}

/** Y-axis ticks like $0, $50K, $100K … */
function formatAxisDollars(v) {
  const n = Number(v)
  if (Number.isNaN(n)) return '$0'
  if (Math.abs(n) >= 1000) return `$${Math.round(n / 1000)}K`
  return formatCurrency(n)
}

function AmortizationChart({ schedule = [], payoffDate }) {
  const { chartData, xTicks, startYear, startMonth } = useMemo(() => {
    if (!schedule || schedule.length === 0) {
      return { chartData: [], xTicks: [], startYear: new Date().getFullYear(), startMonth: 1 }
    }

    const first = schedule[0]
    const initialBalance =
      Number(first.remaining_balance) + Number(first.principal_payment)

    const { year: sy, month: sm } = getFirstPaymentDate(payoffDate, schedule.length)

    let cumPrincipal = 0
    let cumInterest = 0

    const points = [
      {
        monthIndex: 0,
        balance: initialBalance,
        cumulativePrincipal: 0,
        cumulativeInterest: 0,
      },
    ]

    schedule.forEach((p) => {
      cumPrincipal += Number(p.principal_payment)
      cumInterest += Number(p.interest_payment)
      points.push({
        monthIndex: points.length,
        balance: Number(p.remaining_balance),
        cumulativePrincipal: cumPrincipal,
        cumulativeInterest: cumInterest,
      })
    })

    const maxIdx = points.length - 1
    const ticks = []
    for (let m = 0; m <= maxIdx; m += 120) {
      ticks.push(m)
    }
    if (ticks[ticks.length - 1] !== maxIdx) {
      ticks.push(maxIdx)
    }

    return {
      chartData: points,
      xTicks: ticks,
      startYear: sy,
      startMonth: sm,
    }
  }, [schedule, payoffDate])

  if (!schedule || schedule.length === 0) {
    return <div className="amortization-chart">No amortization data available</div>
  }

  return (
    <div className="amortization-chart">
      <h4 className="amortization-chart-title">Loan balance vs. principal &amp; interest paid</h4>
      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="monthIndex"
            type="number"
            domain={[0, 'dataMax']}
            ticks={xTicks}
            tickFormatter={(mi) => yearForMonthIndex(startYear, startMonth, mi)}
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatAxisDollars}
            stroke="#64748b"
            fontSize={12}
            domain={[0, 'auto']}
          />
          <Tooltip
            formatter={(value) => formatCurrency(value)}
            labelFormatter={(mi) => `Year ${yearForMonthIndex(startYear, startMonth, mi)}`}
          />
          <Legend wrapperStyle={{ paddingTop: 16 }} />
          {/* Remaining balance — dark blue */}
          <Line
            type="monotone"
            dataKey="balance"
            name="Remaining balance"
            stroke="#1e3a5f"
            strokeWidth={3}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 5 }}
          />
          {/* Cumulative principal — light blue */}
          <Line
            type="monotone"
            dataKey="cumulativePrincipal"
            name="Cumulative principal paid"
            stroke="#4299e1"
            strokeWidth={3}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 5 }}
          />
          {/* Cumulative interest — green */}
          <Line
            type="monotone"
            dataKey="cumulativeInterest"
            name="Cumulative interest paid"
            stroke="#48bb78"
            strokeWidth={3}
            strokeLinecap="round"
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AmortizationChart
