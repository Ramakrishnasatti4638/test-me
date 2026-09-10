import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">✨ Built with React + Vite</span>
        <h1 className="hero-title">
          Build Amazing <br />
          <span className="hero-highlight">Web Experiences</span>
        </h1>
        <p className="hero-subtitle">
          A modern, fast, and beautiful React starter app. Explore components,
          interactivity, and clean UI patterns — all in one place.
        </p>
        <div className="hero-actions">
          <a href="#features" className="btn btn-primary">Explore Features</a>
          <a href="#counter" className="btn btn-secondary">Try the Demo</a>
        </div>
      </div>
      <div className="hero-graphic">
        <div className="graphic-card card-1">
          <span>🚀</span>
          <p>Fast</p>
        </div>
        <div className="graphic-card card-2">
          <span>🎨</span>
          <p>Stylish</p>
        </div>
        <div className="graphic-card card-3">
          <span>⚛️</span>
          <p>React</p>
        </div>
        <div className="graphic-card card-4">
          <span>🔧</span>
          <p>Modular</p>
        </div>
      </div>
    </section>
  )
}
