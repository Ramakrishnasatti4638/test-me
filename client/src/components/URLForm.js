import React, { useState } from 'react';
import './URLForm.css';

function URLForm({ onUrlCreated }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Please enter a URL' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to shorten URL');
      }

      const data = await response.json();
      setMessage({
        type: 'success',
        text: `Shortened URL created: ${data.shortCode}`,
        shortUrl: data.shortUrl
      });
      setUrl('');
      onUrlCreated(data);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="url-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste your long URL here..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Shortening...' : 'Shorten'}
        </button>
      </div>

      {message && (
        <div className={`message message-${message.type}`}>
          <span>{message.text}</span>
          {message.shortUrl && (
            <code className="short-url">{message.shortUrl}</code>
          )}
        </div>
      )}
    </form>
  );
}

export default URLForm;
