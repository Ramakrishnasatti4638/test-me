import React, { useState } from 'react';
import './URLCard.css';

function URLCard({ url, onDelete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this shortened URL?')) {
      onDelete(url.shortCode);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="url-card">
      <div className="url-card-header">
        <div className="short-code-badge">{url.shortCode}</div>
        <button className="delete-btn" onClick={handleDelete} title="Delete">
          ✕
        </button>
      </div>

      <div className="url-card-body">
        <div className="original-url">
          <label>Original URL</label>
          <p title={url.originalUrl}>{url.originalUrl}</p>
        </div>

        <div className="short-url-section">
          <label>Short URL</label>
          <div className="short-url-display">
            <code>{url.shortUrl}</code>
            <button
              className="copy-btn"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="url-stats">
          <div className="stat">
            <span className="stat-label">Clicks</span>
            <span className="stat-value">{url.clicks}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Created</span>
            <span className="stat-value">{formatDate(url.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default URLCard;
