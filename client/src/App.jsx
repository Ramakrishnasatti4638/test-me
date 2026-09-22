import { useState } from 'react'
import './App.css'

export default function App() {
  const [url, setUrl] = useState('')
  const [shortUrl, setShortUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleShorten = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setCopied(false)

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url })
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to shorten URL')
        return
      }

      const data = await response.json()
      setShortUrl(data)
      setUrl('')
    } catch (err) {
      setError('Error connecting to server')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="container">
      <div className="card">
        <h1>URL Shortener</h1>
        <p className="subtitle">Turn long URLs into short, shareable links</p>

        <form onSubmit={handleShorten}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter your URL (e.g., https://example.com/very/long/path)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !url}>
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>
        </form>

        {error && <div className="error">{error}</div>}

        {shortUrl && (
          <div className="result">
            <div className="result-item">
              <label>Original URL</label>
              <div className="url-display">{shortUrl.originalUrl}</div>
            </div>

            <div className="result-item">
              <label>Shortened URL</label>
              <div className="url-display">
                <input
                  type="text"
                  readOnly
                  value={shortUrl.shortUrl}
                  className="short-url-input"
                />
                <button
                  type="button"
                  className="copy-btn"
                  onClick={handleCopy}
                >
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="result-item">
              <label>Short ID</label>
              <code>{shortUrl.shortId}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
