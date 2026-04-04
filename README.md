# Financial Calculator Frontend

Modern, responsive web app for running common personal finance calculations (mortgages and time‑value‑of‑money) with clear summaries and interactive charts. Built with React, Vite, and Recharts.

## Features

- 🏠 **Mortgage Calculator** - Calculate monthly payments, amortization schedules, and see the impact of extra payments
- 💰 **Time Value of Money (TVM)** - Future Value, Present Value, and Annuity Payment calculators
- 📊 **Interactive Charts** - Visualize payment breakdowns and amortization schedules
- 🎨 **Beautiful UI** - Modern design inspired by mortgagecalculator.org
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 18+ and npm (matches CI and `npm run verify:calculations`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Verify Calculations (sanity checks)

This repo includes a lightweight script that spot-checks a couple reference financial formulas (mortgage payment + compound future value).

```bash
# Verify reference formulas locally (no network)
npm run verify:calculations

# Also verify against the hosted API (requires network)
VERIFY_API=1 npm run verify:calculations
```

## Configuration

### API Base URL

By default, the app calls the hosted API at `https://financial-calculations-api.onrender.com` (see `src/services/api.js`). To use a different backend (for example your own machine):

1. Create a `.env` file in the root directory:
```bash
VITE_API_BASE=http://localhost:8000
```

2. Or change the fallback in `src/services/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'https://financial-calculations-api.onrender.com'
```

## Project Structure

```
src/
├── components/
│   ├── Header.jsx          # App header
│   ├── Navigation.jsx       # Tab navigation
│   ├── MortgageCalculator.jsx    # Main mortgage calculator
│   ├── TVMCalculator.jsx          # TVM calculators
│   ├── PaymentBreakdownChart.jsx  # Pie chart for payment breakdown
│   └── AmortizationChart.jsx      # Line chart for amortization
├── hooks/
│   └── useLocalStorage.js   # Persist form state to localStorage
├── services/
│   └── api.js              # API service layer
├── utils/
│   ├── finiteNumber.js     # Safe numeric coercion for forms / URLs
│   ├── mortgageInputs.js   # Mortgage defaults and URL parsing
│   ├── tvmInputs.js        # TVM defaults and URL parsing
│   ├── formatCurrency.js
│   └── share.js            # Share links and clipboard
├── App.jsx                 # Main app component
└── main.jsx                # Entry point
```

## Using the App

- **Live demo**: Open the app at [https://mytherapy-coding.github.io/financial-calculator-frontend/](https://mytherapy-coding.github.io/financial-calculator-frontend/).
- **Mortgage tab**:
  - Enter **loan amount** (principal), **interest rate**, and **loan term** (years).
  - Optionally add property tax, home insurance, PMI, and HOA to see an all-in monthly payment.
  - Scroll down to view the amortization chart and payment breakdown pie chart.
- **TVM tab**:
  - Choose Future Value, Present Value, or Annuity Payment.
  - Fill in the known inputs (rate, periods, payment/amount) and calculate the missing value.
  - Use this to compare savings plans, loan offers, or investment scenarios.

## Features in Detail

### Mortgage Calculator

- Calculate monthly mortgage payments
- Include property tax, home insurance, PMI, and HOA fees
- See total interest paid and payoff date
- Calculate impact of extra monthly payments
- View detailed amortization schedule with charts
- Visualize payment breakdown with pie charts

### Time Value of Money Calculators

- **Future Value**: Calculate compound interest growth
- **Present Value**: Calculate current value of future amount
- **Annuity Payment**: Calculate payment for fixed-term annuity

## Technologies Used

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Recharts** - Chart library for visualizations
- **CSS3** - Modern styling with gradients and animations

## API Integration

This frontend integrates with the [`financial-calculations-api`](https://github.com/mytherapy-coding/financial-calculations-api) backend:

- `/v1/mortgage/payment` - Calculate mortgage payment
- `/v1/mortgage/summary` - Get mortgage summary
- `/v1/mortgage/amortization-schedule` - Get amortization schedule
- `/v1/mortgage/with-extra-payments` - Calculate with extra payments
- `/v1/tvm/future-value` - Calculate future value
- `/v1/tvm/present-value` - Calculate present value
- `/v1/tvm/annuity-payment` - Calculate annuity payment

## Development

### Adding New Calculators

1. Create a new component in `src/components/`
2. Add API methods in `src/services/api.js`
3. Add navigation tab in `src/components/Navigation.jsx`
4. Include in `src/App.jsx`

### Styling

Each component imports its own CSS file (plain CSS, not CSS Modules). The design follows a modern, clean aesthetic with:

- Gradient backgrounds
- Smooth transitions
- Responsive grid layouts
- Accessible color contrasts

## Troubleshooting

- **API errors or failed calculations**: Confirm the API is reachable (default: hosted on Render). To run against a local backend, start [`financial-calculations-api`](https://github.com/mytherapy-coding/financial-calculations-api) and set `VITE_API_BASE=http://localhost:8000` in `.env`, then restart `npm run dev`.
- **CORS errors in the browser**: The backend must allow your frontend origin (e.g. `http://localhost:3000` or your GitHub Pages URL). Configure CORS on the API, not in this repo.
- **Preview production build locally**: After `npm run build`, run `npm run preview` to test the `dist` output. Use the printed URL (for this repo’s `base`, it includes `/financial-calculator-frontend/`).

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

**Live Site:** https://mytherapy-coding.github.io/financial-calculator-frontend/

**Setup Instructions:**

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Select "GitHub Actions"

2. **Configure API URL** (optional):
   - The app defaults to the hosted Render API unless you override `VITE_API_BASE`
   - To point production at another URL, set the `VITE_API_BASE` secret in GitHub:
     - Go to Settings → Secrets and variables → Actions
     - Add a new secret: `VITE_API_BASE` with your API URL (e.g., `https://your-api.onrender.com`)

3. **Automatic Deployment:**
   - Every push to `main` branch automatically triggers deployment
   - The workflow builds the app and deploys to GitHub Pages
   - Check the Actions tab to see deployment status

**Manual Deployment:**

```bash
# Build the project
npm run build

# The dist folder contains the production build
# GitHub Actions will automatically deploy it
```

## Limitations & Notes

- This app is for **educational and planning purposes only** and does not constitute financial advice.
- Calculations assume constant interest rates and on-time payments; real-world results may differ.
- Tax, insurance, PMI, and HOA estimates are approximations and can vary by lender and region.
- Always verify numbers with your lender or a qualified financial professional before making decisions.

## License

See the LICENSE file for details.
