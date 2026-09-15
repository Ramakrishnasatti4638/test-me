import React, { useState } from 'react';
import './UrlList.css';

function UrlList({ urls, onUrlClicked }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (shortUrl, shortId) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedId(shortId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShortUrlClick = (e, shortId) => {
    e.preventDefault();
    // Track the click and refresh after redirect happens
    if (onUrlClicked) {
      onUrlClicked(shortId);
    }
  };

  if (urls.length === 0) {
    return (
      <div className="empty-state">
        <p>No shortened URLs yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <div className="url-list">
      <h2>Your Shortened URLs</h2>
      <div className="urls-container">
        {urls.map((url) => (
          <div key={url.shortId} className="url-item">
            <div className="url-item-header">
              <span className="short-id">{url.shortId}</span>
              <span className="click-count">{url.clicks} clicks</span>
            </div>
            <div className="url-content">
              <div className="url-pair">
                <div className="url-field">
                  <label>Short URL</label>
                  <a
                    href={url.shortUrl}
                    className="short-url-link"
                    title="Click to follow the short link"
                    onClick={(e) => handleShortUrlClick(e, url.shortId)}
                  >
                    {url.shortUrl}
                  </a>
                </div>
                <button
                  className="copy-button"
                  onClick={() => handleCopy(url.shortUrl, url.shortId)}
                >
                  {copiedId === url.shortId ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <div className="url-field">
                <label>Original URL</label>
                <a
                  href={url.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="original-url"
                  title={url.originalUrl}
                >
                  {url.originalUrl}
                </a>
              </div>
              <div className="url-meta">
                <small>
                  Created on {new Date(url.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UrlList;
