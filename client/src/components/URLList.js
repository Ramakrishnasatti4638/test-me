import React, { useState } from 'react';
import URLCard from './URLCard';
import './URLList.css';

function URLList({ urls, onDelete }) {
  const [sortBy, setSortBy] = useState('recent');

  const sortedUrls = [...urls].sort((a, b) => {
    switch (sortBy) {
      case 'clicks':
        return b.clicks - a.clicks;
      case 'recent':
      default:
        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  return (
    <div className="url-list">
      <div className="sort-controls">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="clicks">Most Clicks</option>
        </select>
      </div>

      <div className="urls-grid">
        {sortedUrls.map(urlItem => (
          <URLCard
            key={urlItem.shortCode}
            url={urlItem}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default URLList;
