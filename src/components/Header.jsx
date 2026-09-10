export default function Header({ darkMode, onToggle }) {
  return (
    <header className="header">
      <div className="header-brand">
        <span className="logo">⚡</span>
        <span className="brand-name">Dashboard</span>
      </div>
      <nav className="header-nav">
        <a href="#">Overview</a>
        <a href="#">Projects</a>
        <a href="#">Team</a>
      </nav>
      <button className="theme-toggle" onClick={onToggle} aria-label="Toggle theme">
        {darkMode ? '☀️ Light' : '🌙 Dark'}
      </button>
    </header>
  )
}
