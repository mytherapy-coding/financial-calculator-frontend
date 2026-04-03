import './Navigation.css'

function Navigation({ activeTab = 'mortgage', setActiveTab }) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          type="button"
          className={`nav-button ${activeTab === 'mortgage' ? 'active' : ''}`}
          onClick={() => setActiveTab('mortgage')}
        >
          Mortgage Calculator
        </button>
        <button
          type="button"
          className={`nav-button ${activeTab === 'tvm' ? 'active' : ''}`}
          onClick={() => setActiveTab('tvm')}
        >
          Time Value of Money
        </button>
      </div>
    </nav>
  )
}

export default Navigation
