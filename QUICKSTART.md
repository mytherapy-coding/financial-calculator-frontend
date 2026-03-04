# Quick Start Guide

## Installation and Setup

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

The app will automatically open at `http://localhost:3000`

## Backend API Connection

By default, the frontend connects to `http://localhost:8000`.

If your API runs on a different address, create a `.env` file:

```bash
VITE_API_BASE=http://your-api-url.com
```

## What Was Created

✅ **React + Vite** - modern development stack
✅ **Mortgage Calculator** - full mortgage calculator with charts
✅ **TVM Calculators** - Future Value, Present Value, Annuity Payment
✅ **Interactive Charts** - Pie charts and Line charts with Recharts
✅ **Beautiful UI** - design inspired by mortgagecalculator.org
✅ **Responsive Design** - works on all devices

## Project Structure

```
src/
├── components/
│   ├── Header.jsx              # Site header
│   ├── Navigation.jsx               # Navigation between calculators
│   ├── MortgageCalculator.jsx      # Mortgage calculator
│   ├── TVMCalculator.jsx          # TVM calculators
│   ├── PaymentBreakdownChart.jsx  # Payment breakdown chart
│   └── AmortizationChart.jsx      # Amortization chart
├── services/
│   └── api.js                    # API service for backend communication
├── App.jsx                       # Main component
└── main.jsx                    # Entry point
```

## Features

### Mortgage Calculator
- Monthly payment calculation
- Taxes, insurance, PMI, HOA accounting
- Payment breakdown chart (pie chart)
- Amortization chart (line chart)
- Savings calculation with extra payments
- Detailed loan payoff schedule

### TVM Calculators
- **Future Value** - compound interest calculation
- **Present Value** - present value of future amount
- **Annuity Payment** - annuity payment

## Next Steps

1. Make sure the backend API is running on `http://localhost:8000`
2. Run `npm run dev`
3. Open your browser and enjoy! 🎉
