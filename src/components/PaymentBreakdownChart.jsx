import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function PaymentBreakdownChart({ monthlyPayment = 0, propertyTax = 0, homeInsurance = 0, pmi = 0, hoa = 0 }) {
  const monthlyTax = (propertyTax || 0) / 12
  const monthlyInsurance = (homeInsurance || 0) / 12
  const monthlyPMI = (pmi || 0) / 12

  const data = [
    { name: 'Principal & Interest', value: monthlyPayment },
    { name: 'Property Tax', value: monthlyTax },
    { name: 'Home Insurance', value: monthlyInsurance },
    { name: 'PMI', value: monthlyPMI },
    { name: 'HOA', value: hoa },
  ].filter(item => item.value > 0)

  const COLORS = ['#c59dff', '#e0b3ff', '#f7c6ff', '#b3d4ff', '#9be7c4']

  return (
    <div className="payment-chart">
      <h4 style={{ marginBottom: '15px', textAlign: 'center' }}>Monthly Payment Breakdown</h4>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => `$${value.toFixed(2)}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PaymentBreakdownChart
