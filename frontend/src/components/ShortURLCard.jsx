import React, { useState } from 'react';
import axios from 'axios';

function ShortURLCard({ data }) {
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [copied, setCopied] = useState(false);

  const shortUrl = `http://localhost:3001/${data.short_code}`;

  const fetchStats = async () => {
    try {
      const response = await axios.get(`/api/stats/${data.short_code}`);
      setStats(response.data);
      setShowStats(true);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left side - URLs */}
        <div className="space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Original URL</p>
            <a
              href={data.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 break-all text-sm font-medium"
            >
              {data.original_url}
            </a>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Short URL</p>
            <div className="flex items-center gap-2">
              <code className="bg-gray-100 px-3 py-2 rounded text-sm text-gray-900 font-mono flex-1">
                {data.short_code}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded text-sm font-medium transition"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Right side - Stats & Actions */}
        <div className="flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Created</p>
            <p className="text-sm text-gray-700">{formatDate(data.created_at)}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={fetchStats}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded font-medium text-sm transition"
            >
              View Stats
            </button>
            <a
              href={`/${data.short_code}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-100 hover:bg-green-200 text-green-900 px-4 py-2 rounded font-medium text-sm transition text-center"
            >
              Visit Link
            </a>
          </div>
        </div>
      </div>

      {/* Stats Modal */}
      {showStats && stats && (
        <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">Link Stats</h3>
            <button
              onClick={() => setShowStats(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Total Clicks</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.clicks}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold">Created</p>
              <p className="text-sm text-gray-700">{formatDate(stats.createdAt)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortURLCard;
