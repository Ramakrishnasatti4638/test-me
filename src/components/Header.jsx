import { useState } from 'react'
import './Header.css'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ReactApp</span>
        </div>

        <nav className={`nav ${menuOpen ? 'nav--open' : ''}`}>
          <a href="#features">Features</a>
          <a href="#counter">Demo</a>
          <a href="#footer">Contact</a>
          <a href="#" className="nav-cta">Get Started</a>
        </nav>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  )
}
