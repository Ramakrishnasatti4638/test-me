import { useState, useEffect } from 'react';

export default function App() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Failed to fetch URLs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url.trim() })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to shorten URL');
        return;
      }

      setResult(data);
      setUrl('');
      fetchUrls();
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container">
      <h1>🔗 URL Shortener</h1>
      <p className="subtitle">Create short, shareable links</p>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">Enter your URL</label>
          <input
            id="url"
            type="url"
            placeholder="https://example.com/very/long/url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading && <span className="spinner"></span>}
          {loading ? 'Shortening...' : 'Shorten URL'}
        </button>
      </form>

      {result && (
        <div className="result">
          <div className="result-item">
            <div className="result-label">Short URL</div>
            <div className="result-value">
              <span>{result.shortUrl}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(result.shortUrl, 'short')}
              >
                {copied === 'short' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="result-item">
            <div className="result-label">Original URL</div>
            <div className="result-value">
              <span>{result.originalUrl}</span>
              <button
                className="copy-btn"
                onClick={() => copyToClipboard(result.originalUrl, 'original')}
              >
                {copied === 'original' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <div className="urls-list">
          <h2>Recent URLs ({urls.length})</h2>
          {urls.map((item) => (
            <div key={item.short_code} className="url-item">
              <div className="url-info">
                <div className="url-code">
                  <strong>s/{item.short_code}</strong>
                  <button
                    className="copy-btn"
                    onClick={() =>
                      copyToClipboard(
                        `http://localhost:3000/s/${item.short_code}`,
                        item.short_code
                      )
                    }
                    style={{ marginLeft: 'auto' }}
                  >
                    {copied === item.short_code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <div className="url-original" title={item.original_url}>
                  {item.original_url}
                </div>
                <div className="url-meta">
                  {item.clicks} clicks • Created{' '}
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
