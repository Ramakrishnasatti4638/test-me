import React, { useState } from 'react';

function ShortenForm({ onShorten, loading }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      const result = await onShorten(url);
      setSuccess(result);
      setUrl('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
        <div className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Enter your long URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm font-medium mb-2">
                ✓ URL shortened successfully!
              </p>
              <div className="bg-white p-3 rounded border border-green-300 font-mono text-sm text-gray-700 break-all">
                {success.shortUrl}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ShortenForm;
