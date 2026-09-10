import './Features.css'

const features = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    description: 'Powered by Vite for instant hot module replacement and blazing fast builds.',
  },
  {
    icon: '🧩',
    title: 'Component-Based',
    description: 'Reusable, composable components that make your UI easy to build and maintain.',
  },
  {
    icon: '🎣',
    title: 'React Hooks',
    description: 'useState, useEffect, and custom hooks keep your logic clean and declarative.',
  },
  {
    icon: '📱',
    title: 'Responsive Design',
    description: 'Looks great on every screen — from mobile phones to widescreen monitors.',
  },
  {
    icon: '🔒',
    title: 'Secure by Default',
    description: 'Built following OWASP best practices with no known vulnerabilities.',
  },
  {
    icon: '🌙',
    title: 'Modern Stack',
    description: 'React 18, Vite, and modern CSS — no legacy baggage, pure performance.',
  },
]

export default function Features() {
  return (
    <section className="features" id="features">
      <div className="features-inner">
        <h2 className="features-heading">Everything You Need</h2>
        <p className="features-subheading">
          A solid foundation with the tools and patterns modern React apps rely on.
        </p>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <span className="feature-icon">{f.icon}</span>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
