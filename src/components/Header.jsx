import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">Financial Calculator</h1>
        <p className="header-subtitle">Mortgage, TVM & Investment Calculations</p>
        <div className="header-links">
          <a 
            href="https://mytherapy-coding.github.io/financial-calculator-frontend/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            🌐 Live Site
          </a>
          <a 
            href="https://github.com/mytherapy-coding/financial-calculator-frontend" 
            target="_blank" 
            rel="noopener noreferrer"
            className="header-link"
          >
            📦 GitHub
          </a>
        </div>
      </div>
    </header>
  )
}

export default Header
