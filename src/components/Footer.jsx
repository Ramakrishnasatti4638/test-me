import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">ReactApp</span>
          <p>A sample React app built with Vite.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Resources</h4>
            <a href="https://react.dev" target="_blank" rel="noreferrer">React Docs</a>
            <a href="https://vitejs.dev" target="_blank" rel="noreferrer">Vite Docs</a>
          </div>
          <div>
            <h4>Community</h4>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a>
            <a href="https://discord.com" target="_blank" rel="noreferrer">Discord</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ReactApp. Made with ⚛️ and ❤️</p>
      </div>
    </footer>
  )
}
