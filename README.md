# Financial Calculator Frontend

Modern, beautiful frontend for the Financial Calculations API. Built with React, Vite, and Recharts for stunning visualizations.

## Features

- 🏠 **Mortgage Calculator** - Calculate monthly payments, amortization schedules, and see the impact of extra payments
- 💰 **Time Value of Money (TVM)** - Future Value, Present Value, and Annuity Payment calculators
- 📊 **Interactive Charts** - Visualize payment breakdowns and amortization schedules
- 🎨 **Beautiful UI** - Modern design inspired by mortgagecalculator.org
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile devices

## Quick Start

### Prerequisites

- Node.js 16+ and npm

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

## Configuration

### API Base URL

By default, the app connects to `http://localhost:8000`. To change this:

1. Create a `.env` file in the root directory:
```bash
VITE_API_BASE=http://your-api-url.com
```

2. Or modify `src/services/api.js`:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'
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
├── services/
│   └── api.js              # API service layer
├── App.jsx                 # Main app component
└── main.jsx                # Entry point
```

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

This frontend integrates with the [financial-calculations-api](https://github.com/yourusername/financial-calculations-api) backend:

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

The app uses CSS modules. Each component has its own CSS file. The design follows a modern, clean aesthetic with:

- Gradient backgrounds
- Smooth transitions
- Responsive grid layouts
- Accessible color contrasts

## Deployment

### GitHub Pages

This project is configured for automatic deployment to GitHub Pages.

**Live Site:** https://mytherapy-coding.github.io/financial-calculator-frontend/

**Setup Instructions:**

1. **Enable GitHub Pages** in your repository settings:
   - Go to Settings → Pages
   - Source: Select "GitHub Actions"

2. **Configure API URL** (optional):
   - The app defaults to `http://localhost:8000` for local development
   - For production, set the `VITE_API_BASE` secret in GitHub:
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

## License

See LICENSE file for details.
