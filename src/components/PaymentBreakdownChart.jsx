import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

function PaymentBreakdownChart({ monthlyPayment, propertyTax, homeInsurance, pmi, hoa }) {
  const monthlyTax = propertyTax / 12
  const monthlyInsurance = homeInsurance / 12
  const monthlyPMI = pmi / 12

  const data = [
    { name: 'Principal & Interest', value: monthlyPayment },
    { name: 'Property Tax', value: monthlyTax },
    { name: 'Home Insurance', value: monthlyInsurance },
    { name: 'PMI', value: monthlyPMI },
    { name: 'HOA', value: hoa },
  ].filter(item => item.value > 0)

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b']

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
