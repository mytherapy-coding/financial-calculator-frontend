import { useState } from 'react'
import Header from './components/Header'
import Navigation from './components/Navigation'
import MortgageCalculator from './components/MortgageCalculator'
import TVMCalculator from './components/TVMCalculator'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('mortgage')

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
