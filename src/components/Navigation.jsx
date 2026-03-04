import './Navigation.css'

function Navigation({ activeTab, setActiveTab }) {
  return (
    <nav className="navigation">
      <div className="nav-container">
        <button
          className={`nav-button ${activeTab === 'mortgage' ? 'active' : ''}`}
          onClick={() => setActiveTab('mortgage')}
        >
          Mortgage Calculator
        </button>
        <button
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
