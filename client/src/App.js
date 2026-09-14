import React, { useState, useEffect } from 'react';
import './App.css';
import URLForm from './components/URLForm';
import URLList from './components/URLList';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/urls');
      if (!response.ok) throw new Error('Failed to fetch URLs');
      const data = await response.json();
      setUrls(data);
      setError(null);
    } catch (err) {
      setError('Failed to load URLs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
  };

  const handleUrlDeleted = async (shortCode) => {
    try {
      const response = await fetch(`/api/urls/${shortCode}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete URL');
      setUrls(urls.filter(url => url.shortCode !== shortCode));
    } catch (err) {
      setError('Failed to delete URL');
      console.error(err);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🔗 URL Shortener</h1>
          <p>Make your long URLs short and shareable</p>
        </header>

        <URLForm onUrlCreated={handleUrlCreated} />

        {error && <div className="error-message">{error}</div>}

        <section className="urls-section">
          <h2>Your Shortened URLs</h2>
          {loading ? (
            <div className="loading">Loading URLs...</div>
          ) : urls.length === 0 ? (
            <div className="empty-state">
              <p>No shortened URLs yet. Create one above!</p>
            </div>
          ) : (
            <URLList urls={urls} onDelete={handleUrlDeleted} />
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
