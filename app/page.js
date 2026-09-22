'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState([]);
  const [copied, setCopied] = useState('');

  // Fetch all URLs on mount
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

  const handleShorten = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setShortCode('');
    setShortUrl('');

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      setShortCode(data.shortCode);
      setShortUrl(data.shortUrl);
      setSuccess('URL shortened successfully!');
      setUrl('');
      fetchUrls();
    } catch (err) {
      setError(err.message || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const handleDelete = async (shortCode) => {
    if (!confirm('Are you sure you want to delete this short URL?')) return;

    try {
      const response = await fetch(`/api/urls/${shortCode}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      setSuccess('URL deleted successfully');
      fetchUrls();
    } catch (err) {
      setError(err.message || 'Failed to delete URL');
    }
  };

  return (
    <div className="container">
      <h1>🔗 URL Shortener</h1>
      <p className="subtitle">Make your long URLs short and shareable</p>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleShorten}>
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
        <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
          {loading ? 'Creating...' : 'Shorten URL'}
        </button>
      </form>

      {shortCode && (
        <div className="result-section">
          <div className="result-box">
            <div className="result-label">Short Code</div>
            <div className="result-value">{shortCode}</div>
          </div>
          <div className="result-box">
            <div className="result-label">Short URL</div>
            <div className="result-value">{shortUrl}</div>
            <button
              className="copy-btn"
              onClick={() => handleCopy(shortUrl, 'shortUrl')}
            >
              {copied === 'shortUrl' ? '✓ Copied!' : 'Copy URL'}
            </button>
          </div>
        </div>
      )}

      {urls.length > 0 && (
        <div className="urls-section">
          <h2>Recent URLs ({urls.length})</h2>
          {urls.map((item) => (
            <div key={item.shortCode} className="url-item">
              <div className="url-info">
                <div className="url-code">s/{item.shortCode}</div>
                <div className="url-original">{item.originalUrl}</div>
                <div className="url-meta">
                  Created: {new Date(item.createdAt).toLocaleDateString()} • Clicks: {item.clicks}
                </div>
              </div>
              <div className="url-actions">
                <button onClick={() => handleCopy(`http://localhost:3000/s/${item.shortCode}`, item.shortCode)}>
                  {copied === item.shortCode ? '✓' : 'Copy'}
                </button>
                <button onClick={() => handleDelete(item.shortCode)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
