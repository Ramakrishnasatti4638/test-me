import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState(null);
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const response = await axios.get('/api/urls');
      setUrls(response.data);
    } catch (err) {
      console.error('Error fetching URLs:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setCopied(false);

    try {
      const response = await axios.post('/api/shorten', { url });
      setShortUrl(response.data);
      setUrl('');
      fetchUrls();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create short URL');
      setShortUrl(null);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deleteUrl = async (shortCode) => {
    try {
      await axios.delete(`/api/urls/${shortCode}`);
      fetchUrls();
    } catch (err) {
      setError('Failed to delete URL');
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>🔗 URL Shortener</h1>
          <p>Create short, shareable links in seconds</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <input
              type="url"
              placeholder="Enter your long URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="url-input"
            />
            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>

        {shortUrl && (
          <div className="result">
            <p className="result-label">Your shortened URL:</p>
            <div className="result-box">
              <input
                type="text"
                value={shortUrl.shortUrl}
                readOnly
                className="result-input"
              />
              <button
                onClick={() => copyToClipboard(shortUrl.shortUrl)}
                className="copy-btn"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="original-url">
              Original: <a href={shortUrl.originalUrl} target="_blank" rel="noopener noreferrer">
                {shortUrl.originalUrl}
              </a>
            </p>
          </div>
        )}

        <div className="urls-section">
          <h2>Recent URLs</h2>
          {urls.length === 0 ? (
            <p className="empty-message">No URLs shortened yet</p>
          ) : (
            <div className="urls-list">
              {urls.map((item) => (
                <div key={item.shortCode} className="url-item">
                  <div className="url-info">
                    <div className="url-code">{item.shortCode}</div>
                    <div className="url-details">
                      <p className="url-original">
                        <span className="label">Original:</span>
                        <a href={item.originalUrl} target="_blank" rel="noopener noreferrer">
                          {item.originalUrl}
                        </a>
                      </p>
                      <div className="url-meta">
                        <span className="clicks">👁️ {item.clicks} clicks</span>
                        <span className="date">📅 {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteUrl(item.shortCode)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
