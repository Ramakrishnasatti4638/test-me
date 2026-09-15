import React, { useState, useEffect } from 'react';
import './App.css';
import UrlForm from './components/UrlForm';
import UrlList from './components/UrlList';

function App() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      const data = await response.json();
      setUrls(data);
    } catch (error) {
      console.error('Error fetching URLs:', error);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleAddUrl = async (originalUrl) => {
    setLoading(true);
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ originalUrl }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to shorten URL');
      }

      const newUrl = await response.json();
      setUrls([newUrl, ...urls]);
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlClicked = async (shortId) => {
    // After a short URL is clicked and redirect happens,
    // wait a moment then refresh to get updated click count
    setTimeout(async () => {
      try {
        const response = await fetch(`/api/urls/${shortId}`);
        const updatedUrl = await response.json();
        setUrls(urls.map(u => u.shortId === shortId ? updatedUrl : u));
      } catch (error) {
        console.error('Error refreshing URL data:', error);
      }
    }, 500);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>URL Shortener</h1>
        <p>Create short, shareable links in seconds</p>
      </header>
      <main className="app-main">
        <UrlForm onAddUrl={handleAddUrl} loading={loading} />
        <UrlList urls={urls} onUrlClicked={handleUrlClicked} />
      </main>
    </div>
  );
}

export default App;
