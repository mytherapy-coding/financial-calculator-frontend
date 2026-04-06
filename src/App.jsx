import { useState, useEffect } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import MortgageCalculator from './components/MortgageCalculator'
import TVMCalculator from './components/TVMCalculator'
import { isTvmCalcParam } from './constants/tvm'
import './App.css'

function App() {
  // Load active tab from URL or default to mortgage
  const getInitialTab = () => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'tvm') return 'tvm'
    // Shared TVM links must include tab=tvm, but older/manual links may only set calc=…
    if (isTvmCalcParam(params.get('calc'))) return 'tvm'
    return 'mortgage'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab())

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location)
    if (activeTab === 'mortgage') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', activeTab)
    }
    window.history.replaceState({}, '', url)
  }, [activeTab])

  return (
    <div className="app">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {activeTab === 'mortgage' && <MortgageCalculator />}
        {activeTab === 'tvm' && <TVMCalculator />}
      </main>
    </div>
  )
}

export default App
