import { useState, useEffect } from 'react'
import Header from './components/Header'
import StatsGrid from './components/StatsGrid'
import TaskList from './components/TaskList'
import './App.css'

export default function App() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  return (
    <div className="app">
      <Header darkMode={darkMode} onToggle={() => setDarkMode(d => !d)} />
      <main className="main">
        <section className="welcome">
          <h1>Welcome back, Alex 👋</h1>
          <p>Here's what's happening with your projects today.</p>
        </section>
        <StatsGrid />
        <TaskList />
      </main>
    </div>
  )
}
